import { ref, type Ref } from 'vue'

export interface BridgeMessageEvent<T = unknown> {
  type: string
  payload?: T
  data?: T
  formId?: string
  value?: T
}

export type BridgeListener<T = unknown> = (data: T) => void

class TinaIframeBridge {
  private listeners: Map<string, Set<BridgeListener<any>>> = new Map()
  private isInitialized = false
  /** Set by plugin.client.ts from the `tina.debug` module option. */
  public debug = false
  /** Last error caught while talking to Tina Admin, shared by useTina() and useTinaBridge(). */
  public error: Ref<Error | null> = ref(null)

  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log('[nuxt-tina]', ...args)
    }
  }

  public setError(err: unknown): void {
    this.error.value = err instanceof Error ? err : new Error(String(err))
    if (this.debug) {
      console.error('[nuxt-tina]', this.error.value)
    }
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    this.isInitialized = true

    window.addEventListener('message', this.handleMessage.bind(this))

    // Notify parent admin iframe that Nuxt client is ready
    if (this.isInIframe()) {
      this.log('Bridge connected')
      window.parent.postMessage(
        {
          type: 'tinacms:client:ready',
          href: window.location.href,
        },
        '*',
      )
    }
  }

  public isInIframe(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      return (
        window.self !== window.top
        || window.self !== window.parent
        || Boolean(window.frameElement)
      )
    }
    catch {
      return true
    }
  }

  public on<T = unknown>(type: string, callback: BridgeListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    return () => {
      this.listeners.get(type)?.delete(callback)
    }
  }

  public notifyParent(type: string, payload?: unknown): void {
    if (this.isInIframe()) {
      try {
        window.parent.postMessage(
          {
            type,
            payload,
            source: 'nuxt-tina',
          },
          '*',
        )
      }
      catch (err) {
        this.setError(err)
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    // Tina Admin and the public page are always the same origin (both served
    // by this app) — reject anything else before it reaches a listener.
    if (event.origin !== window.location.origin) {
      this.log('Ignored message from invalid origin:', event.origin)
      return
    }

    if (!event.data || typeof event.data !== 'object') {
      return
    }

    const data = event.data as BridgeMessageEvent

    if (data.type && this.listeners.has(data.type)) {
      this.log('Received', data.type)
      const callbacks = this.listeners.get(data.type)!
      const payload = data.data ?? data.payload ?? data.value ?? data
      callbacks.forEach(cb => cb(payload))
    }
  }
}

export const tinaBridge = new TinaIframeBridge()
