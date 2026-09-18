import { defineEventHandler } from 'h3'

/**
 * Adapts `next-tinacms-cloudinary`'s Next.js-shaped handler
 * (`createMediaHandler`, from `pages/api/cloudinary/[...media].ts` in Tina's
 * own docs) to run on Nitro. It reads/writes the raw Node req/res that H3
 * exposes, but calls `req.query`, `res.status()` and `res.json()` — none of
 * which exist on a plain Node response — so those are shimmed here.
 * Registered at /api/cloudinary/** only when `media.provider === 'cloudinary'`.
 */
export default defineEventHandler(async (event) => {
  const { createMediaHandler } = await import('next-tinacms-cloudinary/dist/handlers.js')
  const { isAuthorized } = await import('@tinacms/auth/dist/index.js')

  const handler = createMediaHandler({
    cloud_name: process.env.NUXT_TINA_CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.NUXT_TINA_CLOUDINARY_API_KEY || '',
    api_secret: process.env.NUXT_TINA_CLOUDINARY_API_SECRET || '',
    authorized: async (req: any, _res: any) => {
      if (process.env.NODE_ENV === 'development') {
        return true
      }
      try {
        const user = await isAuthorized(req)
        return !!(user && (user as any).verified)
      }
      catch {
        return false
      }
    },
  })

  const req = event.node.req as any
  const res = event.node.res as any

  const url = new URL(req.url || '/', 'http://localhost')
  const routePrefix = '/api/cloudinary/'
  const mediaSegments = url.pathname.startsWith(routePrefix)
    ? url.pathname.slice(routePrefix.length).split('/').filter(Boolean)
    : []

  req.query = { ...Object.fromEntries(url.searchParams), media: mediaSegments }
  res.status = (code: number) => {
    res.statusCode = code
    return res
  }
  res.json = (data: unknown) => {
    if (!res.getHeader('content-type')) {
      res.setHeader('content-type', 'application/json')
    }
    res.end(JSON.stringify(data))
  }

  await handler(req, res)
})
