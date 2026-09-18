# Nuxt Tina

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

TinaCMS integration module for Nuxt, with contextual visual editing and preview mode.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/narr07/nuxt-tina?file=playground%2Fapp.vue) -->
- [📖 &nbsp;Documentation](https://nuxt-tinacms.vercel.app/)

## Features

- ✏️ &nbsp;Contextual visual editing bridge (two-way postMessage sync with Tina Admin)
- 🧩 &nbsp;Auto-imported `useTina`, `tinaField`, `useTinaBridge`, `useTinaPreview` composables
- 🖼️ &nbsp;`TinaProvider` and `TinaMarkdown` components (Comark-style AST rendering)
- 🚀 &nbsp;Zero-config: scaffolds a starter `tina/config.ts` on first run
- ☁️ &nbsp;Optional Cloudinary media store, opt-in via `media.provider`

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add nuxt-tina
```

That's it! You can now use Nuxt Tina in your Nuxt app ✨

## Configuration

All options are optional — set `clientId`/`token`/`branch` via env vars (recommended,
so nothing sensitive lands in `nuxt.config.ts`) or override any default here:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-tina'],

  tina: {
    // Tina Cloud credentials — defaults read NUXT_TINA_CLIENT_ID / NUXT_TINA_TOKEN
    // (or TINA_CLIENT_ID / TINA_TOKEN) from the environment.
    clientId: '',
    token: '',
    branch: 'main',

    // Where tina/config.ts lives, relative to the project root.
    tinaPath: 'tina',

    // Contextual/visual editing bridge (iframe postMessage sync with Tina Admin).
    visualEditing: true,

    // Media store — leave as 'tina' for the built-in git-based store, or
    // 'cloudinary' to wire up the /api/cloudinary/** route (see nuxt-tina/media).
    media: {
      publicFolder: 'public',
      mediaRoot: 'uploads',
      provider: 'tina',
    },

    enabled: true,
  },
})
```

### Environment variables

You really only have two secrets — a Tina Cloud client ID and a token. They show
up under several different variable names below because three *separate* tools
read the environment independently, each with its own naming convention. This
is duplication by necessity, not a mistake — set all the ones your setup needs.

```bash
# .env

# 1. This module (Nuxt/Nitro runtime) — populates the tina.clientId/token/branch
# defaults shown above. Bare TINA_CLIENT_ID / TINA_TOKEN also work as a fallback.
NUXT_TINA_CLIENT_ID=
NUXT_TINA_TOKEN=
NUXT_TINA_BRANCH=main

# 2. The `tinacms` CLI itself (tinacms dev / tinacms build) — generates
# tina/__generated__ and talks to Tina Cloud independently of this module.
# Same values as above, but the CLI has its own variable names — note
# TINA_PUBLIC_CLIENT_ID here, not TINA_CLIENT_ID.
TINA_PUBLIC_CLIENT_ID=
TINA_TOKEN=

# 3. next-tinacms-cloudinary — only needed with media.provider: 'cloudinary'.
# It's a Next.js-oriented package that hardcodes Next's own NEXT_PUBLIC_ env
# convention internally, so it needs the client ID under this name too.
NEXT_PUBLIC_TINA_CLIENT_ID=

# This module's own /api/cloudinary/** route (also only with media.provider: 'cloudinary').
NUXT_TINA_CLOUDINARY_CLOUD_NAME=
NUXT_TINA_CLOUDINARY_API_KEY=
NUXT_TINA_CLOUDINARY_API_SECRET=
```

### Mermaid diagrams (optional)

`TinaMarkdown` doesn't render Mermaid diagrams by default — `mermaid` is a large
dependency, so it's opt-in. To enable it:

```bash
npm install mermaid
```

```vue
<TinaMarkdown :content="post.body" :components="{ 'tina-mermaid': TinaMermaid }" />
```

`TinaMermaid` is auto-imported by the module, so no explicit import is needed.
Without this prop, ` ```mermaid ` code blocks render as plain code instead.

### Nuxt Content compatibility (optional)

**You don't need Nuxt Content at all.** `useTina`, `TinaMarkdown`, `TinaProvider`,
and the visual editing bridge all read directly from Tina's own generated
GraphQL client and have zero dependency on `@nuxt/content` — it's not installed
by this module, and nothing breaks without it. Everything below is purely for
people who *also* want to query the same content through Nuxt Content (search,
listings, `queryCollection()`) alongside Tina's editing:

```bash
npm install @nuxt/content
```

The two systems don't talk to each other automatically, and they don't share
one config file — you keep writing fields in `tina/config.ts` as always, and
`content.config.ts` derives from it. **Fields only ever get written once, in
`tina/config.ts`** — `tinaFieldsToZodShape()` only derives Zod *from* Tina
fields, there's no helper for the reverse direction, so `tina/config.ts` is the
one place field definitions belong.

**Folder structure** — both configs must point at the same markdown files. Tina's
`path` is relative to the project root and includes `content/`; Nuxt Content's
`source` is relative to its own content directory (`content/` by default) and
does **not** repeat that prefix:

```
my-app/
├── content/
│   └── posts/
│       └── hello-world.md     # the same file, read by both systems
├── tina/
│   └── config.ts              # path: 'content/posts' — field definitions live here
├── content.config.ts          # source: 'posts/*.md'  — derives its schema from tina/config.ts
└── nuxt.config.ts
```

Starting point — a `post` collection with fields defined once, in `tina/config.ts`:

```ts
// tina/config.ts
export default defineConfig({
  // ...
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'description', label: 'Description' },
          { type: 'datetime', name: 'date', label: 'Date' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
    ],
  },
})
```

**What goes in `content.config.ts`**: nothing but the derive call — no field
lives here directly. For each Tina collection you also want in Nuxt Content,
look up its `fields` and pass them through `tinaFieldsToZodShape`:

```ts
// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { tinaFieldsToZodShape } from 'nuxt-tina/utils'
import tinaConfig from './tina/config'

const postFields = tinaConfig.schema.collections.find(c => c.name === 'post')!.fields

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'posts/*.md',
      schema: z.object(tinaFieldsToZodShape(postFields, z)),
    }),
  },
})
```

Fields marked `isBody: true` are skipped — Nuxt Content parses the markdown
body itself, it isn't a frontmatter field. If one field needs stricter
validation than the derived type (e.g. an email format), override it after the
spread instead of writing the whole schema by hand:

```ts
schema: z.object({
  ...tinaFieldsToZodShape(postFields, z),
  email: z.string().email(),
})
```

This is a one-way, build-time helper, not a runtime sync — it saves you from
maintaining the same field list twice, nothing more.

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-tina/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-tina

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-tina.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-tina

[license-src]: https://img.shields.io/npm/l/nuxt-tina.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-tina

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
