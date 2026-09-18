import type { Plugin } from '#app'
import { defineNuxtPlugin, useRouter } from '#imports'
import { tinaBridge } from './utils/bridge'

// Explicit Plugin return type: defineNuxtPlugin's inferred type isn't
// portable to a standalone .d.ts (mkdist can't name it across the package
// boundary), so it's spelled out via the public #app export instead.
const tinaBridgePlugin: Plugin = defineNuxtPlugin((_nuxtApp) => {
  if (typeof window === 'undefined') {
    return
  }

  tinaBridge.init()

  // Synchronize Nuxt page route navigation with parent Tina Admin window URL hash
  const router = useRouter()
  if (router && window.self !== window.top) {
    router.afterEach((to) => {
      try {
        const pathWithoutLeadingSlash = to.path.replace(/^\//, '')
        const targetHash = pathWithoutLeadingSlash
          ? `#/~/${pathWithoutLeadingSlash}`
          : `#/~/`

        if (window.top && window.top.location.hash !== targetHash) {
          window.top.location.hash = targetHash
        }
      }
      catch {
        // safe fallback for restricted cross-origin frames
      }
    })
  }
})

export default tinaBridgePlugin
