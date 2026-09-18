import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, parse } from 'node:path'
import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { ModuleOptions } from './types'

export type { ModuleOptions } from './types'

// Walk up from `startDir` looking for an existing tina/config.* — handles
// monorepo/workspace layouts where the config lives above the Nuxt app root.
// Stops after checking the directory containing `.git` (repo boundary).
function findExistingTinaConfig(startDir: string, tinaPath: string): boolean {
  const extensions = ['ts', 'js', 'tsx', 'jsx']
  let dir = startDir
  while (true) {
    if (extensions.some(ext => existsSync(join(dir, tinaPath, `config.${ext}`)))) {
      return true
    }
    if (existsSync(join(dir, '.git'))) {
      return false
    }
    const parentDir = dirname(dir)
    if (parentDir === dir || parse(dir).root === dir) {
      return false
    }
    dir = parentDir
  }
}

const DEFAULT_TINA_CONFIG = `import { defineConfig } from 'tinacms'

const branch = process.env.NUXT_TINA_BRANCH
  || process.env.TINA_BRANCH
  || process.env.HEAD
  || 'main'

export default defineConfig({
  branch,
  clientId: process.env.NUXT_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID || '',
  token: process.env.NUXT_TINA_TOKEN || process.env.TINA_TOKEN || '',
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
})
`

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-tina',
    configKey: 'tina',
    compatibility: {
      nuxt: '>=3.11.0',
    },
  },
  defaults: {
    clientId: process.env.NUXT_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID || '',
    token: process.env.NUXT_TINA_TOKEN || process.env.TINA_TOKEN || '',
    branch: process.env.NUXT_TINA_BRANCH || process.env.HEAD || 'main',
    tinaPath: 'tina',
    visualEditing: true,
    enabled: true,
    media: {
      publicFolder: 'public',
      mediaRoot: 'uploads',
    },
  },
  setup(options, nuxt) {
    if (options.enabled === false) {
      return
    }

    const { resolve } = createResolver(import.meta.url)

    // Auto-scaffold tina/config.ts on first run, never overwrite an existing one
    // (also checks parent dirs up to the repo root, so monorepo/workspace layouts
    // with tina/config.ts above the Nuxt app root are detected instead of duplicated)
    const tinaPath = options.tinaPath || 'tina'
    if (!findExistingTinaConfig(nuxt.options.rootDir, tinaPath)) {
      const tinaConfigPath = join(nuxt.options.rootDir, tinaPath, 'config.ts')
      mkdirSync(dirname(tinaConfigPath), { recursive: true })
      writeFileSync(tinaConfigPath, DEFAULT_TINA_CONFIG)
      console.log(`[nuxt-tina] Created starter config at ${tinaConfigPath}`)
    }

    nuxt.options.runtimeConfig.public.tina = {
      clientId: options.clientId || '',
      branch: options.branch || 'main',
      visualEditing: Boolean(options.visualEditing),
      media: {
        publicFolder: options.media?.publicFolder || 'public',
        mediaRoot: options.media?.mediaRoot || 'uploads',
        provider: options.media?.provider,
      },
    }

    // Private token stored server-side only
    nuxt.options.runtimeConfig.tina = {
      token: options.token || '',
    }

    if (options.visualEditing) {
      addPlugin(resolve('./runtime/plugin.client'))
    }

    // Only wired when explicitly opted into — keeps next-tinacms-cloudinary
    // and @tinacms/auth (both dynamic imports) out of the build otherwise
    if (options.media?.provider === 'cloudinary') {
      addServerHandler({
        route: '/api/cloudinary/**',
        handler: resolve('./runtime/server/cloudinary-media'),
      })
    }

    addComponent({
      name: 'TinaProvider',
      filePath: resolve('./runtime/components/TinaProvider.vue'),
    })

    addComponent({
      name: 'TinaMarkdown',
      filePath: resolve('./runtime/components/TinaMarkdown.vue'),
    })

    // Opt-in only — not wired into TinaMarkdown by default. Pass
    // `:components="{ 'tina-mermaid': TinaMermaid }"` to enable it (see README).
    addComponent({
      name: 'TinaMermaid',
      filePath: resolve('./runtime/components/TinaMermaid.vue'),
    })

    addImports([
      {
        name: 'useTina',
        from: resolve('./runtime/composables/useTina'),
      },
      {
        name: 'tinaField',
        from: resolve('./runtime/composables/useTina'),
      },
      {
        name: 'useTinaBridge',
        from: resolve('./runtime/composables/useTinaBridge'),
      },
      {
        name: 'useTinaPreview',
        from: resolve('./runtime/composables/useTinaPreview'),
      },
    ])
  },
})
