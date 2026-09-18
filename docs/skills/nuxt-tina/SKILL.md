---
name: nuxt-tina
description: Use when adding, configuring, or debugging the nuxt-tina Nuxt module — TinaCMS contextual/visual editing, the tina/config.ts scaffold, useTina/useTinaBridge/useTinaPreview composables, TinaProvider/TinaMarkdown/TinaMermaid components, Cloudinary media, or the Nuxt Content bridge.
---

# nuxt-tina

A Nuxt module that integrates TinaCMS: two editing modes run independently —
Tina's own basic CMS editor at `/admin#/collections/`, and a custom
`postMessage` iframe bridge for live contextual/visual editing at
`/admin#/~/<path>`. Content stays in Git as Markdown/MDX/JSON; Tina is only
the editing interface.

## Install

```bash
npm install nuxt-tina tinacms @tinacms/cli
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-tina'],
  tina: { visualEditing: true },
})
```

On first run, the module scaffolds `tina/config.ts` automatically if none
exists yet (idempotent — never overwrites an existing one, and checks parent
directories too, so monorepo layouts aren't duplicated).

## Environment variables

Only two real secrets (a Tina Cloud client ID and token), but three separate
tools each read them under their own naming convention — set all that apply:

- This module: `NUXT_TINA_CLIENT_ID`, `NUXT_TINA_TOKEN`, `NUXT_TINA_BRANCH`
- The `tinacms` CLI itself: `TINA_PUBLIC_CLIENT_ID`, `TINA_TOKEN`
- `next-tinacms-cloudinary` (only with Cloudinary media): `NEXT_PUBLIC_TINA_CLIENT_ID`

## Composables & components (auto-imported)

- `useTina(props)` — pass the full server response ref (not just unwrapped
  `data`) from `useAsyncData`/`useFetch`; returns `{ data, isEditing,
  isInIframe, quickEditEnabled, refresh }`. Patches over `postMessage`, no
  refetch.
- `tinaField(object, property?, index?)` — builds the `data-tina-field`
  attribute; `object` must come from `useTina()`'s returned `data`, not raw
  data.
- `useTinaBridge()` — low-level `postMessage` access (`isInIframe`,
  `sendToAdmin`, `onAdminMessage`). Most code should use `useTina()` instead.
- `useTinaPreview(paramName?)` — a *different* feature: shareable draft
  links via Nuxt's `usePreviewMode()` (`?tina-preview=<branch>`). Test with
  `nuxt generate` + `nuxt preview`, not `nuxt dev`. Not needed for editing
  inside Tina Admin.
- `<TinaProvider :show-indicator>` — wraps the app, exposes editing status.
- `<TinaMarkdown :content>` — renders a Tina rich-text AST field via a
  Comark-style tuple adapter (no `comark` package dependency).
- `<TinaMermaid>` — NOT wired in by default (`mermaid` is a large peer
  dependency). Opt in per-render: `<TinaMarkdown :components="{ 'tina-mermaid': TinaMermaid }" />`, and `npm install mermaid` first.

## Module options (`tina` key in `nuxt.config.ts`)

`clientId`, `token`, `branch`, `tinaPath` (default `'tina'`), `visualEditing`
(default `true`), `media: { publicFolder, mediaRoot, provider }` (`provider`
is `'tina'` or `'cloudinary'`, default `'tina'`), `enabled`.

## Nuxt Content bridge (optional, manual)

The module works standalone — no `@nuxt/content` dependency. If a project
also wants to query the same content through Nuxt Content, derive its Zod
schema from the Tina fields already written (one-way, `tina/config.ts` stays
the single source of truth):

```ts
import { tinaFieldsToZodShape } from 'nuxt-tina/utils'
```

## Cloudinary media (opt-in)

`media.provider: 'cloudinary'` registers `/api/cloudinary/**`. Also install
`next-tinacms-cloudinary` and `@tinacms/auth`, and point `tina/config.ts` at
`nuxt-tina/media`'s `tinaCloudinaryMediaStore`. Critical gotcha: `@tinacms/cli`
bundles `tina/config.ts`'s raw source for the browser admin build (not a
Node-evaluated result) — a `process.env.X` check there is always `undefined`
client-side. Gate the store choice with a literal constant instead:
`const useCloudinary = true`, not an env-var expression.
