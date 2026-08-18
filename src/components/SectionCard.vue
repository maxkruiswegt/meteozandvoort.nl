<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  icon?: Component;
}>();
</script>

<template>
  <section class="section-card">
    <header class="section-header">
      <component
        :is="icon"
        v-if="icon"
        class="section-icon"
        :size="18"
        aria-hidden="true"
      />
      <h2>{{ title }}</h2>
      <div
        v-if="$slots.actions"
        class="section-actions"
      >
        <slot name="actions" />
      </div>
    </header>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.section-header h2 {
  font-size: 0.95rem;
  font-weight: 600;
}

.section-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.section-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-body {
  padding: 1.25rem;
}

@media (max-width: 768px) {
  .section-header {
    padding: 0.875rem 1rem;
  }

  .section-body {
    padding: 1rem;
  }
}
</style>
