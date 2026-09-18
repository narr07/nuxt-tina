<script setup lang="ts">
import { computed, h, type VNode } from 'vue'
import {
  tinaDocumentToComark,
  type ComarkNode,
} from '../utils/comark-adapter'

const props = defineProps<{
  content: any
  /**
   * Tags the comark adapter emits that should render as a Vue component
   * instead of a literal HTML element of that name — none by default.
   * e.g. `:components="{ 'tina-mermaid': TinaMermaid }"` to opt into
   * Mermaid diagram rendering (install `mermaid` first).
   */
  components?: Record<string, any>
}>()

const comarkTree = computed(() => {
  return tinaDocumentToComark(props.content)
})

function renderComarkNode(node: ComarkNode): VNode | string {
  if (typeof node === 'string') {
    return node
  }

  if (!Array.isArray(node)) {
    return ''
  }

  const [tag, attrs, ...children] = node
  const renderedChildren = children.map(renderComarkNode)
  const component = props.components?.[tag]

  if (component) {
    return h(component, attrs || {})
  }

  return h(tag, attrs || {}, renderedChildren)
}

const RenderedOutput = () => {
  return renderComarkNode(comarkTree.value)
}
</script>

<template>
  <div class="tina-markdown-container">
    <RenderedOutput />
  </div>
</template>

<style scoped>
.tina-markdown-container {
  line-height: 1.7;
  color: inherit;
}

.tina-markdown-container :deep(h1),
.tina-markdown-container :deep(h2),
.tina-markdown-container :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.tina-markdown-container :deep(p) {
  margin-bottom: 1rem;
}

.tina-markdown-container :deep(pre) {
  background: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.tina-markdown-container :deep(blockquote) {
  border-left: 4px solid #0284c7;
  padding-left: 1rem;
  color: #64748b;
  margin: 1rem 0;
}
</style>
