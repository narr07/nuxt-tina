export interface TinaMediaOptions {
  publicFolder?: string
  mediaRoot?: string
  /**
   * Media store backend. 'tina' (default) is the built-in git-based store —
   * zero extra dependencies. 'cloudinary' wires a /api/cloudinary/** server
   * route for next-tinacms-cloudinary (a peer dependency you install
   * yourself); leaving this as 'tina' keeps that entirely out of your build.
   * @default 'tina'
   */
  provider?: 'tina' | 'cloudinary'
}

export interface ModuleOptions {
  /**
   * Tina Cloud Client ID
   * @default process.env.NUXT_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID || ''
   */
  clientId?: string

  /**
   * Tina Cloud Read-only Token
   * @default process.env.NUXT_TINA_TOKEN || process.env.TINA_TOKEN || ''
   */
  token?: string

  /**
   * Git branch name for queries
   * @default process.env.NUXT_TINA_BRANCH || process.env.HEAD || 'main'
   */
  branch?: string

  /**
   * Tina configuration directory relative to project root
   * @default 'tina'
   */
  tinaPath?: string

  /**
   * Enable visual / contextual editing bridge
   * @default true
   */
  visualEditing?: boolean

  /**
   * Media root and public folder configuration
   */
  media?: TinaMediaOptions

  /**
   * Enable or disable the module
   * @default true
   */
  enabled?: boolean

  /**
   * Log bridge activity to the browser console — connections, received
   * messages, and messages dropped for failing the origin check.
   * @default false
   */
  debug?: boolean
}

export interface TinaDataEnvelope<T = Record<string, unknown>> {
  data: T
  query?: string
  variables?: Record<string, unknown>
  isClient?: boolean
}

export interface TinaPayloadEvent<T = Record<string, unknown>> {
  type: 'tinacms:form:change' | 'tinacms:preview:ready' | 'tinacms:edit'
  data: T
  formId?: string
}
