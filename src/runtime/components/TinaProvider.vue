<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { tinaBridge } from '../utils/bridge'

const props = defineProps<{
  showIndicator?: boolean
}>()

const isEditing = ref(false)

onMounted(() => {
  tinaBridge.init()
  isEditing.value = tinaBridge.isInIframe()
})

provide('tinaIsEditing', isEditing)
</script>

<template>
  <div
    class="tina-provider-root"
    :class="{ 'tina-is-editing': isEditing }"
  >
    <slot />

    <!-- Visual editing overlay badge when inside Tina iframe -->
    <div
      v-if="props.showIndicator && isEditing"
      class="tina-editing-badge"
    >
      <span class="tina-badge-dot" />
      <span>Tina Visual Preview</span>
    </div>
  </div>
</template>

<style scoped>
.tina-provider-root {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.tina-editing-badge {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  color: #f8fafc;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tina-badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #10b981;
  border-radius: 50%;
  animation: tina-pulse 2s infinite ease-in-out;
}

@keyframes tina-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.85);
  }
}
</style>
