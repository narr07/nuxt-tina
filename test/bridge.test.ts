// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { tinaBridge } from '../src/runtime/utils/bridge'

function dispatchMessage(origin: string, data: unknown) {
  window.dispatchEvent(new MessageEvent('message', { origin, data }))
}

describe('tinaBridge origin validation', () => {
  tinaBridge.init()

  it('delivers a message from the same origin to the matching listener', () => {
    const callback = vi.fn()
    const unsubscribe = tinaBridge.on('same-origin-test', callback)

    dispatchMessage(window.location.origin, { type: 'same-origin-test', payload: 'ok' })

    expect(callback).toHaveBeenCalledExactlyOnceWith('ok')
    unsubscribe()
  })

  it('drops a message from a different origin before it reaches any listener', () => {
    const callback = vi.fn()
    const unsubscribe = tinaBridge.on('cross-origin-test', callback)

    dispatchMessage('https://malicious.example.com', { type: 'cross-origin-test', payload: 'evil' })

    expect(callback).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('still delivers real Tina Admin messages, which never carry a source or version field', () => {
    const callback = vi.fn()
    const unsubscribe = tinaBridge.on('updateData', callback)

    // Shape sent by the actual @tinacms/toolkit bridge — no `source`/`version`.
    dispatchMessage(window.location.origin, { type: 'updateData', data: { title: 'Updated title' } })

    expect(callback).toHaveBeenCalledExactlyOnceWith({ title: 'Updated title' })
    unsubscribe()
  })
})

describe('tinaBridge.error', () => {
  it('records a failed postMessage to the parent as bridgeError', () => {
    const isInIframeSpy = vi.spyOn(tinaBridge, 'isInIframe').mockReturnValue(true)
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {
      throw new Error('boom')
    })

    tinaBridge.notifyParent('test-event')

    expect(tinaBridge.error.value?.message).toBe('boom')

    postMessageSpy.mockRestore()
    isInIframeSpy.mockRestore()
    tinaBridge.error.value = null
  })
})
