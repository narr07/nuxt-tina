export interface TinaFieldLike {
  type: string
  name: string
  label?: string
  isTitle?: boolean
  isBody?: boolean
  list?: boolean
  fields?: TinaFieldLike[]
  [key: string]: unknown
}

export interface TinaCollectionLike {
  name: string
  path: string
  format?: string
  fields: TinaFieldLike[]
}

/**
 * Minimal shape of the `z` export from `@nuxt/content` / zod that this
 * bridge needs. Accepted as a parameter (not imported) so this module has
 * no hard dependency on zod or @nuxt/content.
 */
export interface ZodLike {
  string: () => any
  number: () => any
  boolean: () => any
  unknown: () => any
  any: () => any
  array: (schema: any) => any
  object: (shape: Record<string, any>) => any
  record: (schema: any) => any
}

/**
 * Derive a Nuxt Content v3 Zod schema shape from a Tina collection's
 * `fields` array, so field definitions are written once in `tina/config.ts`
 * instead of duplicated in `content.config.ts`.
 *
 * The field marked `isBody` is skipped — Nuxt Content parses the markdown
 * body itself, it isn't a frontmatter schema field.
 *
 * ```ts
 * // content.config.ts
 * import { defineCollection, defineContentConfig, z } from '@nuxt/content'
 * import { tinaFieldsToZodShape } from 'nuxt-tina/utils'
 * import tinaConfig from './tina/config'
 *
 * const postFields = tinaConfig.schema.collections.find(c => c.name === 'post')!.fields
 *
 * export default defineContentConfig({
 *   collections: {
 *     posts: defineCollection({
 *       type: 'page',
 *       source: 'posts/*.md',
 *       schema: z.object(tinaFieldsToZodShape(postFields, z))
 *     })
 *   }
 * })
 * ```
 */
export function tinaFieldsToZodShape(fields: TinaFieldLike[], z: ZodLike): Record<string, any> {
  const shape: Record<string, any> = {}

  for (const field of fields) {
    if (field.isBody) {
      continue
    }

    shape[field.name] = tinaFieldToZod(field, z).optional()
  }

  return shape
}

function tinaFieldToZod(field: TinaFieldLike, z: ZodLike): any {
  let schema: any

  switch (field.type) {
    case 'string':
    case 'datetime':
    case 'image':
      schema = z.string()
      break
    case 'number':
      schema = z.number()
      break
    case 'boolean':
      schema = z.boolean()
      break
    case 'object':
      schema = field.fields
        ? z.object(tinaFieldsToZodShape(field.fields, z))
        : z.record(z.unknown())
      break
    case 'rich-text':
      // Tina stores rich-text as an AST object, not a scalar
      schema = z.any()
      break
    default:
      schema = z.unknown()
  }

  return field.list ? z.array(schema) : schema
}
