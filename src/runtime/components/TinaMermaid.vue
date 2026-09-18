<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  source: string
}>()

const svg = ref<string>('')
const error = ref<string>('')

onMounted(async () => {
  try {
    // Optional peer dependency — dynamically imported so projects that
    // never use mermaid diagrams don't pay for it in their bundle.
    const { default: mermaid } = await import('mermaid')
    const id = `tina-mermaid-${Math.random().toString(36).slice(2)}`
    const result = await mermaid.render(id, props.source)
    svg.value = result.svg
  }
  catch {
    error.value = 'mermaid package not installed — run `pnpm add mermaid` to render this diagram.'
  }
})
</script>

<template>
  <!-- SVG markup comes from mermaid's own renderer, not raw user input -->
  <div
    v-if="svg"
    class="tina-mermaid"
    v-html="svg"
  />
  <pre
    v-else-if="error"
    class="tina-mermaid-fallback"
  ><code>{{ source }}</code><small>{{ error }}</small></pre>
</template>

<style scoped>
.tina-mermaid {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}

.tina-mermaid-fallback {
  background: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.tina-mermaid-fallback small {
  display: block;
  color: #fbbf24;
  margin-top: 0.5rem;
}
</style>
