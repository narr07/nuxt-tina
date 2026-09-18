export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxtjs/i18n'],
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
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'id', name: 'Indonesia' },
    ],
  },
  // Powers /llms.txt and /llms-full.txt (nuxt-llms, bundled by Docus).
  // `domain` is left unset here — it's auto-computed from the deploy
  // platform (e.g. Vercel) or NUXT_SITE_URL at build time. Setting it here
  // would just risk baking in a stale URL before the docs are deployed.
  llms: {
    title: 'nuxt-tina',
    description: 'TinaCMS integration module for Nuxt, with contextual visual editing and preview mode.',
    full: {
      title: 'nuxt-tina — full documentation',
      description: 'The complete nuxt-tina documentation in a single file, for LLMs and coding agents.',
    },
    sections: [
      {
        title: 'GitHub repository',
        links: [
          { title: 'nuxt-tina source', href: 'https://github.com/narr07/nuxt-tina' },
        ],
      },
    ],
  },
})
