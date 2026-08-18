<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string;
  value: string;
  subtitle?: string;
  icon?: Component;
}>();
</script>

<template>
  <div class="metric-tile">
    <div class="tile-header">
      <component
        :is="icon"
        v-if="icon"
        class="tile-icon"
        :size="15"
        aria-hidden="true"
      />
      <span class="tile-label">{{ label }}</span>
    </div>
    <div class="tile-value num">{{ value }}</div>
    <div
      v-if="subtitle"
      class="tile-subtitle"
    >
      {{ subtitle }}
    </div>
  </div>
</template>

<style scoped>
.metric-tile {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-tile);
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.tile-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.tile-icon {
  color: var(--text-faint);
  flex-shrink: 0;
}

.tile-label {
  font-size: 0.75rem;
  font-weight: 550;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
}

.tile-subtitle {
  font-size: 0.75rem;
  color: var(--text-faint);
}
</style>
