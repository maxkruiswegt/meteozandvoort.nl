<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string;
  value: string;
  icon?: Component;
  /** Optional accent for the icon, e.g. var(--data-rain) */
  iconColor?: string;
}>();
</script>

<template>
  <div class="stat-chip">
    <component
      :is="icon"
      v-if="icon"
      class="chip-icon"
      :size="18"
      :style="iconColor ? { color: iconColor } : undefined"
      aria-hidden="true"
    />
    <div class="chip-text">
      <span class="chip-value num">{{ value }}</span>
      <span class="chip-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: var(--bg-raised);
  border-radius: var(--radius-tile);
  padding: 0.625rem 0.875rem;
  min-width: 0;
}

.chip-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.chip-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chip-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.chip-label {
  font-size: 0.7rem;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
