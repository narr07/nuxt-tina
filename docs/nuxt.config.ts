export default defineNuxtConfig({
  extends: ['docus'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'nuxt-tina',
  },
  compatibilityDate: '2026-09-18',
  // docs/ has no package.json of its own (deps come from the repo root), so
  // Vercel's build runs from the repo root — route Nitro's output there too.
  nitro: {
    output: {
      dir: '../.vercel/output',
    },
  },
  docus: {
    // No AI Gateway credentials are configured for this docs site, and we
    // don't want the assistant offered even if one gets added later.
    assistant: {
      enabled: false,
    },
  },
})
