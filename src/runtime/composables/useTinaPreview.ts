import { usePreviewMode, useRoute } from '#imports'

export interface TinaPreviewState {
  [key: string]: unknown
  branch?: string
}

/**
 * Shareable preview links for draft/branch content review — distinct from
 * useTina()'s contextual-editing bridge (which never needs this).
 * Wraps Nuxt's usePreviewMode(): a link like `?tina-preview=<branch>` flips
 * `enabled` on and puts the branch name in `state.branch`, and any
 * useAsyncData/useFetch call automatically re-runs when that happens.
 *
 * Test with `nuxt generate` + `nuxt preview` (usePreviewMode does not run
 * under `nuxt dev`).
 */
export function useTinaPreview(paramName = 'tina-preview') {
  const route = useRoute()

  return usePreviewMode<TinaPreviewState>({
    shouldEnable: () => !!route.query[paramName],
    getState: current => ({
      ...current,
      branch: (route.query[paramName] as string) || (current.branch as string | undefined),
    }),
  })
}
