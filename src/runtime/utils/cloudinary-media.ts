/**
 * Pass to `tina/config.ts`'s `media.loadCustomStore` to swap the default
 * git-based media store for Cloudinary. Dynamically imports
 * `next-tinacms-cloudinary` (a peer dependency you install yourself) so
 * nothing Cloudinary-related is bundled when you don't use it.
 *
 * ```ts
 * // tina/config.ts
 * import { tinaCloudinaryMediaStore } from 'nuxt-tina/media'
 *
 * // Literal constant, not process.env.X — @tinacms/cli bundles this file's
 * // raw source for the browser-side admin build (not a Node-evaluated
 * // result), so an env-var check here is always undefined in the browser
 * // even though it reads fine on the server.
 * const useCloudinary = true
 *
 * export default defineConfig({
 *   media: useCloudinary
 *     ? { loadCustomStore: tinaCloudinaryMediaStore }
 *     : { tina: { mediaRoot: 'uploads', publicFolder: 'public' } },
 * })
 * ```
 *
 * Requires `next-tinacms-cloudinary` and `@tinacms/auth` installed, and a
 * server route mounted at `/api/cloudinary/**` (enable via the module's
 * `media.provider: 'cloudinary'` option, which wires that route for you).
 */
export const tinaCloudinaryMediaStore = async (): Promise<any> => {
  const pack = await import('next-tinacms-cloudinary')
  return pack.TinaCloudCloudinaryMediaStore
}
