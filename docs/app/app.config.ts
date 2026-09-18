export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      secondary: 'yellow',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      neutral: 'taupe',
    },
    icons: {
      arrowDown: 'i-tabler-arrow-down',
      arrowLeft: 'i-tabler-arrow-left',
      arrowRight: 'i-tabler-arrow-right',
      arrowUp: 'i-tabler-arrow-up',
      caution: 'i-tabler-alert-square-rounded',
      check: 'i-tabler-check',
      chevronDoubleLeft: 'i-tabler-chevrons-left',
      chevronDoubleRight: 'i-tabler-chevrons-right',
      chevronDown: 'i-tabler-chevron-down',
      chevronLeft: 'i-tabler-chevron-left',
      chevronRight: 'i-tabler-chevron-right',
      chevronUp: 'i-tabler-chevron-up',
      close: 'i-tabler-x',
      copy: 'i-tabler-copy',
      copyCheck: 'i-tabler-copy-check',
      dark: 'i-tabler-moon',
      drag: 'i-tabler-grip-vertical',
      ellipsis: 'i-tabler-dots',
      error: 'i-tabler-square-rounded-x',
      external: 'i-tabler-external-link',
      eye: 'i-tabler-eye',
      eyeOff: 'i-tabler-eye-off',
      file: 'i-tabler-file',
      folder: 'i-tabler-folder',
      folderOpen: 'i-tabler-folder-open',
      hash: 'i-tabler-hash',
      info: 'i-tabler-info-square-rounded',
      light: 'i-tabler-sun',
      loading: 'i-tabler-loader-2',
      menu: 'i-tabler-menu',
      minus: 'i-tabler-minus',
      panelClose: 'i-tabler-layout-sidebar-left-collapse',
      panelOpen: 'i-tabler-layout-sidebar-left-expand',
      plus: 'i-tabler-plus',
      reload: 'i-tabler-reload',
      search: 'i-tabler-search',
      stop: 'i-tabler-player-stop',
      star: 'i-tabler-star',
      success: 'i-tabler-square-rounded-check',
      system: 'i-tabler-device-desktop',
      tip: 'i-tabler-bulb',
      upload: 'i-tabler-upload',
      warning: 'i-tabler-alert-triangle',
    },
    card: {
      defaultVariants: {
        variant: 'subtle',
      },
    },
    alert: {
      defaultVariants: {
        variant: 'subtle',
      },
    },
    empty: {
      defaultVariants: {
        variant: 'subtle',
      },
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'shadow-md shadow-primary/30',
        },
      ],
    },
    pageHero: {
      slots: {
        container: 'pt-4 sm:pt-8 lg:pt-8 pb-24 sm:pb-32 lg:pb-40',
      },
    },
  },
  seo: {
    title: 'nuxt-tina',
    titleTemplate: '%s · nuxt-tina',
    description: 'TinaCMS integration module for Nuxt, with contextual visual editing and preview mode.',
  },
  header: {
    title: 'nuxt-tina',
    logo: {
      light: '/icon.svg',
      dark: '/icon.svg',
      alt: 'Nuxt Tina Logo',
      wordmark: {
        light: '/icon.svg',
        dark: '/icon.svg',
      },
    },
    favicon: '/favicon.png',
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
        { icon: 'i-simple-icons-tina', label: 'TinaCMS', to: 'https://tina.io', target: '_blank' },
        { icon: 'i-simple-icons-nuxt', label: 'Nuxt', to: 'https://nuxt.com', target: '_blank' },
      ],
    },
  },
})
