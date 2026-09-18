export type ComarkNode = [string, Record<string, any>, ...(ComarkNode | string)[]] | string

export interface TinaAstNode {
  type?: string
  text?: string
  value?: string
  url?: string
  src?: string
  alt?: string
  level?: number
  bold?: boolean
  italic?: boolean
  children?: TinaAstNode[]
  [key: string]: any
}

export interface TinaContentEnvelope {
  type?: string
  children?: TinaAstNode[]
}

/**
 * Adapter: converts TinaCMS's mdast-based rich-text AST into Comark's tuple
 * node format: [tag, attributes, ...children]
 */
export function tinaAstToComarkNode(node: TinaAstNode | string): ComarkNode {
  if (typeof node === 'string') {
    return node
  }

  if (!node || typeof node !== 'object') {
    return ''
  }

  // Plain text with inline bold / italic styling
  if (node.type === 'text' || node.text !== undefined) {
    const textVal = node.text ?? node.value ?? ''

    if (node.bold && node.italic) {
      return ['strong', {}, ['em', {}, textVal]]
    }
    if (node.bold) {
      return ['strong', {}, textVal]
    }
    if (node.italic) {
      return ['em', {}, textVal]
    }
    return textVal
  }

  const children = Array.isArray(node.children)
    ? node.children.map(tinaAstToComarkNode)
    : []

  switch (node.type) {
    case 'root':
      return ['div', { class: 'tina-rich-text-root' }, ...children]

    case 'p':
    case 'paragraph':
      return ['p', {}, ...children]

    case 'h1':
      return ['h1', {}, ...children]
    case 'h2':
      return ['h2', {}, ...children]
    case 'h3':
      return ['h3', {}, ...children]
    case 'h4':
      return ['h4', {}, ...children]
    case 'h5':
      return ['h5', {}, ...children]
    case 'h6':
      return ['h6', {}, ...children]
    case 'heading': {
      const tag = `h${node.level || 2}`
      return [tag, {}, ...children]
    }

    case 'a':
    case 'link':
      return ['a', { href: node.url || '#' }, ...children]

    case 'img':
    case 'image':
      return ['img', { src: node.url || node.src || '', alt: node.alt || '' }]

    case 'ul':
      return ['ul', {}, ...children]
    case 'ol':
      return ['ol', {}, ...children]
    case 'li':
      return ['li', {}, ...children]

    case 'code_block':
    case 'code':
      // Mermaid diagrams get their own tag so TinaMarkdown.vue can render
      // them via the (optional, dynamically-imported) mermaid package
      // instead of a plain <pre><code> block.
      if (node.lang === 'mermaid') {
        return ['tina-mermaid', { source: node.value || '' }]
      }
      return ['pre', {}, ['code', {}, node.value || '']]

    case 'blockquote':
      return ['blockquote', {}, ...children]

    case 'hr':
      return ['hr', {}]

    case 'lic':
      // list-item-content wrapper — unwrap, <li> already provides the element
      return children.length === 1 ? children[0]! : ['span', {}, ...children]

    // Custom rich-text templates (MDX embeds / {{ shortcode }} matchers) —
    // Tina represents both as mdxJsxFlowElement/mdxJsxTextElement nodes with
    // a `name` (the template name) and `props` (the template's field values).
    // No specific template is known here, so every one renders as a generic
    // `[data-tina-type]` wrapper for the consuming app to style or target.
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement':
      if (children.length > 0) {
        return ['div', { 'data-tina-type': node.name || node.type }, ...children]
      }
      return (node as any).props?._value ?? ''

    default:
      // Fallback to a div if the custom template or tag isn't mapped
      if (children.length > 0) {
        return ['div', { 'data-tina-type': node.type || 'unknown' }, ...children]
      }
      return node.value ?? node.text ?? ''
  }
}

/**
 * Converts a full Tina AST document into a Comark tree
 */
export function tinaDocumentToComark(doc: TinaContentEnvelope | any): ComarkNode {
  if (!doc) {
    return ['div', { class: 'tina-empty' }]
  }

  if (typeof doc === 'string') {
    return ['div', { class: 'tina-raw-text' }, doc]
  }

  if (doc.type === 'root' || Array.isArray(doc.children)) {
    return tinaAstToComarkNode({
      type: 'root',
      children: doc.children || [],
    })
  }

  return ['div', { class: 'tina-unsupported' }]
}
