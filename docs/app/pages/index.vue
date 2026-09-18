<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'nuxt-tina — TinaCMS for Nuxt',
  description: 'A Nuxt module integrating TinaCMS with contextual/visual editing over an iframe postMessage bridge.',
})

const features = [
  {
    icon: 'i-lucide-eye',
    title: 'Contextual Editing',
    description: 'A two-way postMessage bridge between Tina Admin and your Nuxt page — live patching, no reload.',
  },
  {
    icon: 'i-lucide-file-code-2',
    title: 'Nuxt Content bridge',
    description: 'Derive a Nuxt Content Zod schema straight from your Tina fields, so you write them once.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Basic CMS mode stays stable',
    description: 'Plain form editing at /admin runs independently of the visual editing bridge.',
  },
  {
    icon: 'i-lucide-cloud',
    title: 'Tina Cloud ready',
    description: 'Auth, branch, and the Tina Cloud content API are verified working end-to-end.',
  },
]
</script>

<template>
  <div>
    <UPageHero
      headline="v0.1.0 — Experimental"
      title="TinaCMS, running natively in Nuxt"
      description="Contextual/visual editing, an admin studio, and Tina Cloud — wrapped into a single Nuxt module."
      :links="[
        { label: 'Get Started', to: '/getting-started/introduction', trailingIcon: 'i-lucide-arrow-right', size: 'xl' },
        { label: 'GitHub', to: 'https://github.com/narr07/nuxt-tina', target: '_blank', color: 'neutral', variant: 'outline', size: 'xl' },
      ]"
    />

    <UPageSection
      title="Why nuxt-tina?"
      description="TinaCMS has no official Vue/Nuxt integration yet — this module closes that gap with a bridge that's already been tested end-to-end."
    >
      <UPageGrid>
        <UPageCard
          v-for="(feature, index) in features"
          :key="index"
          v-bind="feature"
          spotlight
          spotlight-color="primary"
          variant="outline"
        />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
