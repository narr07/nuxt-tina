---
title: TinaCMS for Nuxt
description: A Nuxt module integrating TinaCMS with contextual/visual editing over an iframe postMessage bridge.
seo:
  ogImage: '/template.png'
---

::u-page-hero
---
orientation: horizontal
headline: v0.1.0 — Experimental
description: Contextual/visual editing, an admin studio, and Tina Cloud — wrapped into a single Nuxt module.
links:
  - label: Get Started
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
[TinaCMS]{class="text-primary"}, natively in [Nuxt]{class="text-[#00DC82]"}

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
title: Why nuxt-tina?
description: TinaCMS has no official Vue/Nuxt integration yet — this module closes that gap with a bridge that's already been tested end-to-end.
---

:::u-page-grid
::::u-page-card
---
icon: i-lucide-eye
title: Contextual Editing
description: A two-way postMessage bridge between Tina Admin and your Nuxt page — live patching, no reload.
spotlight: true
spotlightColor: primary
variant: outline
---
::::

::::u-page-card
---
icon: i-lucide-file-code-2
title: Nuxt Content bridge
description: Derive a Nuxt Content Zod schema straight from your Tina fields, so you write them once.
spotlight: true
spotlightColor: primary
variant: outline
---
::::

::::u-page-card
---
icon: i-lucide-shield-check
title: Basic CMS mode stays stable
description: Plain form editing at /admin runs independently of the visual editing bridge.
spotlight: true
spotlightColor: primary
variant: outline
---
::::

::::u-page-card
---
icon: i-lucide-cloud
title: Tina Cloud ready
description: Auth, branch, and the Tina Cloud content API are verified working end-to-end.
spotlight: true
spotlightColor: primary
variant: outline
---
::::
:::
::
