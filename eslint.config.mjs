// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
      './docs',
    ],
  },
})
  .append(
    {
      // These files bridge genuinely untyped external data: Tina's rich-text
      // AST, the iframe postMessage protocol, and dynamic imports of peer
      // packages that ship no types — `any` is the honest type here.
      files: ['src/runtime/**/*.{ts,vue}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Renders SVG markup produced by mermaid's own renderer, not raw user input.
      files: ['src/runtime/components/TinaMermaid.vue'],
      rules: {
        'vue/no-v-html': 'off',
      },
    },
    {
      // Nuxt page/layout filenames are routes, not reusable components.
      files: ['docs/app/pages/**/*.vue', 'docs/app/layouts/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  )
