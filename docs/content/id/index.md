---
title: TinaCMS untuk Nuxt
description: Module Nuxt yang mengintegrasikan TinaCMS dengan contextual/visual editing lewat iframe postMessage bridge.
seo:
  ogImage: '/template.png'
---

::u-page-hero
---
orientation: horizontal
headline: v0.1.0 — Eksperimental
description: Contextual/visual editing, admin studio, dan Tina Cloud — dibungkus jadi satu module Nuxt.
links:
  - label: Mulai
    to: /getting-started/introduction
    trailingIcon: i-lucide-arrow-right
    size: xl
  - label: GitHub
    to: https://github.com/narr07/nuxt-tina
    target: _blank
    color: neutral
    variant: outline
    icon: i-lucide-github
    size: xl
---
#title
[TinaCMS]{class="text-primary"}, native di [Nuxt]{class="text-[#00DC82]"}

#default
:::code-group
```ts [tina/config.ts]
export default defineConfig({
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        format: 'md',
        fields: [
         ...
        ],
      },
    ],
  },
})
```

```ts [content.config.ts]
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
:::
::

::u-page-section
---
title: Kenapa nuxt-tina?
description: TinaCMS belum punya integrasi resmi buat Vue/Nuxt — module ini menutup gap itu lewat bridge yang sudah dites end-to-end.
---

:::u-page-grid
::::u-page-card
---
icon: i-lucide-eye
title: Contextual Editing
description: Bridge postMessage dua arah antara Tina Admin dan halaman Nuxt kamu — live patch, tanpa reload.
spotlight: true
spotlightColor: primary
variant: outline
---
::::

::::u-page-card
---
icon: i-lucide-file-code-2
title: Nuxt Content bridge
description: Turunkan schema Zod Nuxt Content langsung dari field Tina kamu, jadi cukup ditulis sekali.
spotlight: true
spotlightColor: primary
variant: outline
---
::::

::::u-page-card
---
icon: i-lucide-shield-check
title: Mode CMS dasar tetap stabil
description: Edit form biasa di /admin jalan independen dari bridge visual editing.
spotlight: true
spotlightColor: primary
variant: outline
---
::::

::::u-page-card
---
icon: i-lucide-cloud
title: Tina Cloud siap pakai
description: Auth, branch, dan content API Tina Cloud sudah diverifikasi jalan end-to-end.
spotlight: true
spotlightColor: primary
variant: outline
---
::::
:::
::
