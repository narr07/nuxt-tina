import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { tinaBridge } from '../utils/bridge'

export interface UseTinaBridgeReturn {
  isInIframe: Ref<boolean>
  sendToAdmin: (type: string, payload?: unknown) => void
  onAdminMessage: <T = unknown>(type: string, callback: (payload: T) => void) => () => void
  /** The last error caught while talking to Tina Admin, or `null`. Shared with `useTina()`. */
  bridgeError: Ref<Error | null>
}

/**
 * Direct access to the TinaCMS postMessage bridge
 */
export function useTinaBridge(): UseTinaBridgeReturn {
  const isInIframe = ref<boolean>(false)

  onMounted(() => {
    tinaBridge.init()
    isInIframe.value = tinaBridge.isInIframe()
  })

  const sendToAdmin = (type: string, payload?: unknown): void => {
    if (!isInIframe.value) {
      return
    }
    tinaBridge.notifyParent(type, payload)
  }

  const onAdminMessage = <T = unknown>(
    type: string,
    callback: (payload: T) => void,
  ): (() => void) => {
    let unsubscribe: (() => void) | undefined

    onMounted(() => {
      unsubscribe = tinaBridge.on<T>(type, callback)
    })

    onUnmounted(() => {
      unsubscribe?.()
    })

    return () => unsubscribe?.()
  }

  return {
    isInIframe,
    sendToAdmin,
    onAdminMessage,
    bridgeError: tinaBridge.error,
  }
}
