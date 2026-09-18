export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'gray',
    },
  },
  seo: {
    title: 'nuxt-tina',
    description: 'TinaCMS integration module for Nuxt, with contextual visual editing and preview mode.',
  },
  header: {
    title: 'nuxt-tina',
  },
  socials: {
    github: 'https://github.com/narr07/nuxt-tina',
  },
  github: {
    url: 'https://github.com/narr07/nuxt-tina',
    branch: 'main',
    rootDir: 'docs',
  },
  toc: {
    bottom: {
      links: [
        { icon: 'i-lucide-database', label: 'TinaCMS', to: 'https://tina.io', target: '_blank' },
        { icon: 'i-simple-icons-nuxtdotjs', label: 'Nuxt', to: 'https://nuxt.com', target: '_blank' },
      ],
    },
  },
})
