import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import { refreshNuxtData, useNuxtApp } from '#imports'
import { tinaBridge } from '../utils/bridge'

export interface UseTinaOptions<T> {
  query?: string | Ref<string | undefined> | ComputedRef<string | undefined>
  variables?:
    | Record<string, unknown>
    | Ref<Record<string, unknown> | undefined>
    | ComputedRef<Record<string, unknown> | undefined>
  data?: T | Ref<T> | ComputedRef<T>
  experimental___selectFormByFormId?: () => string
}

export interface UseTinaReturn<T> {
  data: Ref<T>
  isEditing: Ref<boolean>
  isInIframe: Ref<boolean>
  quickEditEnabled: Ref<boolean>
  /** The last error caught while talking to Tina Admin, or `null`. */
  bridgeError: Ref<Error | null>
  refresh: () => Promise<void>
}

/**
 * Generate unique alphanumeric hash from query and variables
 */
export function hashFromQuery(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash + char) & 4294967295
  }
  const nonNegativeHash = Math.abs(hash)
  return nonNegativeHash.toString(36)
}

function isScalarOrUndefined(value: unknown): boolean {
  const type = typeof value
  if (
    type === 'string'
    || type === 'number'
    || type === 'boolean'
    || type === 'undefined'
    || value === null
    || value instanceof String
    || value instanceof Number
    || value instanceof Boolean
  ) {
    return true
  }
  return false
}

/**
 * Attach Tina _content_source metadata to objects for visual in-page selection
 */
export function addMetadata(id: string, obj: any, path: (string | number)[] = []): any {
  if (obj === null || isScalarOrUndefined(obj)) {
    return obj
  }
  if (obj instanceof String) {
    return obj.valueOf()
  }
  if (Array.isArray(obj)) {
    return obj.map((item, index) => addMetadata(id, item, [...path, index]))
  }
  const transformedObj: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key]
    if (
      [
        '__typename',
        '_sys',
        '_internalSys',
        '_values',
        '_internalValues',
        '_content_source',
        '_tina_metadata',
      ].includes(key)
    ) {
      transformedObj[key] = value
    }
    else {
      transformedObj[key] = addMetadata(id, value, currentPath)
    }
  }
  if (
    transformedObj
    && typeof transformedObj === 'object'
    && 'type' in transformedObj
    && transformedObj.type === 'root'
  ) {
    return transformedObj
  }
  return { ...transformedObj, _content_source: { queryId: id, path } }
}

/**
 * Strip any _content_source metadata before sending open payload to Tina Admin
 */
export function stripMetadata(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(stripMetadata)
  }
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_content_source') {
      continue
    }
    cleaned[key] = stripMetadata(value)
  }
  return cleaned
}

/**
 * Helper to generate data-tina-field attributes for visual in-page selection
 */
export function tinaField(object: any, property?: string, index?: number): string {
  const contentSource = object?._content_source
  if (!contentSource) {
    return property || ''
  }
  const { queryId, path } = contentSource
  if (!property) {
    return `${queryId}---${path.join('.')}`
  }
  const fullPath = typeof index === 'number'
    ? [...path, property, index]
    : [...path, property]
  return `${queryId}---${fullPath.join('.')}`
}

/**
 * useTina composable provides reactive contextual visual editing data for TinaCMS in Nuxt.
 * Fully compliant with the official TinaCMS parent iframe postMessage protocol.
 */
export function useTina<T extends Record<string, unknown>>(
  props: UseTinaOptions<T> | Ref<any> | ComputedRef<any>,
): UseTinaReturn<T> {
  // Auto-extract query, variables, and data if a full API response ref was passed
  const rawQuery = computed(() => {
    const val = unref(props)
    if (val && typeof val === 'object' && 'query' in val) {
      return unref(val.query) || ''
    }
    return ''
  })

  const rawVariables = computed(() => {
    const val = unref(props)
    if (val && typeof val === 'object' && 'variables' in val) {
      return unref(val.variables) || {}
    }
    return {}
  })

  const targetData = computed<T>(() => {
    const val = unref(props)
    if (val && typeof val === 'object' && 'data' in val) {
      return unref(val.data) as T
    }
    return (val || {}) as T
  })

  const queryId = computed(() => {
    const stringifiedQuery = JSON.stringify({
      query: rawQuery.value,
      variables: rawVariables.value,
    })
    return hashFromQuery(stringifiedQuery)
  })

  const processedData = computed(() => {
    const dataVal = targetData.value
    if (dataVal) {
      try {
        const dataCopy = stripMetadata(JSON.parse(JSON.stringify(dataVal)))
        return addMetadata(queryId.value, dataCopy, [])
      }
      catch {
        return dataVal
      }
    }
    return dataVal
  })

  const contentData = ref<T>(processedData.value) as Ref<T>
  const isEditing = ref<boolean>(false)
  const isInIframe = ref<boolean>(false)
  const quickEditEnabled = ref<boolean>(false)
  const bridgeError = tinaBridge.error

  // Watch for external data changes when not actively editing
  watch(
    () => targetData.value,
    (newData) => {
      if (newData && !isEditing.value) {
        contentData.value = processedData.value
      }
    },
    { deep: true },
  )

  // Check native Nuxt preview mode if available
  try {
    const nuxtApp = useNuxtApp()
    if ((nuxtApp as any)?._preview || (nuxtApp as any)?.payload?.preview) {
      isEditing.value = true
    }
  }
  catch {
    // safe fallback
  }

  onMounted(() => {
    tinaBridge.init()
    isInIframe.value = tinaBridge.isInIframe()

    if (isInIframe.value) {
      isEditing.value = true
    }

    // Helper to safely broadcast message to parent and top windows
    const postToAdmin = (msg: any) => {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(msg, '*')
        }
        if (window.top && window.top !== window && window.top !== window.parent) {
          window.top.postMessage(msg, '*')
        }
      }
      catch (err) {
        tinaBridge.setError(err)
      }
    }

    // Function to send the open handshake to parent Tina Admin
    const sendOpenHandshake = () => {
      const query = rawQuery.value
      const variables = rawVariables.value
      const currentData = targetData.value

      if (!query || !currentData) {
        return
      }

      try {
        const cleanData = stripMetadata(JSON.parse(JSON.stringify(currentData)))
        const cleanVariables = JSON.parse(JSON.stringify(variables))

        postToAdmin({
          type: 'open',
          id: queryId.value,
          query,
          variables: cleanVariables,
          data: cleanData,
        })

        const propsVal = unref(props) as any
        if (typeof propsVal?.experimental___selectFormByFormId === 'function') {
          const formId = propsVal.experimental___selectFormByFormId()
          if (formId) {
            postToAdmin({
              type: 'user-select-form',
              formId,
            })
          }
        }
      }
      catch (err) {
        tinaBridge.setError(err)
      }
    }

    // Retry on a timer to handle Tina routing settle (in addition to the reactive watcher below)
    const timer1 = setTimeout(sendOpenHandshake, 100)
    const timer2 = setTimeout(sendOpenHandshake, 300)
    const timer3 = setTimeout(sendOpenHandshake, 700)
    const timer4 = setTimeout(sendOpenHandshake, 1500)
    const timer5 = setTimeout(sendOpenHandshake, 3000)

    // Watch props deeply so that as soon as Nuxt hydrates useAsyncData, handshake fires
    watch(
      () => unref(props),
      () => {
        sendOpenHandshake()
      },
      { deep: true, immediate: true },
    )

    // Inject official Tina visual selection styling
    const styleEl = document.createElement('style')
    styleEl.type = 'text/css'
    styleEl.textContent = `
      .__tina-quick-editing-enabled [data-tina-field] {
        outline: 2px dashed rgba(34, 150, 254, 0.5);
        transition: box-shadow ease-out 150ms;
      }
      .__tina-quick-editing-enabled [data-tina-field]:hover {
        box-shadow: inset 100vi 100vh rgba(34, 150, 254, 0.25);
        outline: 2px solid rgba(34, 150, 254, 1);
        cursor: pointer;
      }
    `
    document.head.appendChild(styleEl)

    // Handle click-to-edit on elements having [data-tina-field]
    const clickHandler = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        '[data-tina-field]',
      ) as HTMLElement | null
      if (!target) return
      const fieldName = target.getAttribute('data-tina-field')
      if (fieldName) {
        event.preventDefault()
        event.stopPropagation()
        postToAdmin({ type: 'field:selected', fieldName })
      }
    }

    window.addEventListener('click', clickHandler, { capture: true })

    // Message listener for Tina Admin parent events
    const messageHandler = (event: MessageEvent) => {
      // Tina Admin and this page are always the same origin (both served by
      // this app) — reject anything else before it touches reactive state.
      if (event.origin !== window.location.origin) {
        return
      }

      if (!event.data || typeof event.data !== 'object') {
        return
      }

      // Parent requesting edit mode or announcing readiness
      if (event.data.type === 'isEditMode' || event.data.type === 'tina:ready') {
        sendOpenHandshake()
      }

      // Tina Admin quickEdit toggle
      if (event.data.type === 'quickEditEnabled') {
        quickEditEnabled.value = !!event.data.value
        document.body.classList.toggle(
          '__tina-quick-editing-enabled',
          quickEditEnabled.value,
        )
      }

      // Official Tina Admin live update event: { type: 'updateData', id, data }
      if (event.data.type === 'updateData') {
        if (event.data.id === queryId.value || !event.data.id) {
          isEditing.value = true
          if (event.data.data) {
            const rawData = event.data.data
            const newlyProcessedData = addMetadata(
              queryId.value,
              JSON.parse(JSON.stringify(rawData)),
              [],
            )
            contentData.value = newlyProcessedData as T
          }
          const anyTinaField = document.querySelector('[data-tina-field]')
          postToAdmin({ type: 'quick-edit', value: !!anyTinaField })
        }
      }

      // Local simulation / save events -> trigger native Nuxt re-fetch
      if (
        event.data.type === 'tinacms:form:change'
        || event.data.type === 'tinacms:preview:data'
        || event.data.type === 'tinacms:saved'
      ) {
        isEditing.value = true
        if (event.data.data) {
          contentData.value = {
            ...contentData.value,
            ...event.data.data,
          }
        }
        refreshNuxtData()
      }
    }

    window.addEventListener('message', messageHandler)

    onUnmounted(() => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      styleEl.remove()
      document.body.classList.remove('__tina-quick-editing-enabled')
      window.removeEventListener('click', clickHandler, { capture: true })
      window.removeEventListener('message', messageHandler)
      postToAdmin({
        type: 'close',
        id: queryId.value,
      })
    })
  })

  return {
    data: contentData,
    isEditing,
    isInIframe,
    quickEditEnabled,
    bridgeError,
    refresh: async () => {
      await refreshNuxtData()
    },
  }
}
