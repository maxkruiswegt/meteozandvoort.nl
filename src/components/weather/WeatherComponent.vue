<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    required: false
  },
  icon: {
    type: String,
    required: false
  },
  timespan: {
    type: String,
    required: false
  }
});
</script>

<template>
  <div class="weather-component">
    <span class="material-symbols-outlined">{{ icon }}</span>
    <h3 class="title">{{ title }}</h3>
    <p class="value">{{ value }} <small>{{ unit }}</small></p>
    <small class="timespan" v-if="timespan">({{ timespan }})</small>
  </div>
</template>

<style scoped>
.weather-component {
  aspect-ratio: 1/1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-tertiary);
  color: var(--color-text-primary);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  position: relative;
  gap: 0.25rem;
  padding: 0.5rem;
}

.title {
  text-align: center;
  color: var(--color-primary);
  font-family: var(--font-primary);
  font-weight: var(--font-bold);
}

.value {
  text-align: center;
}

.timespan {
  text-align: center;
  color: var(--color-text-secondary);
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {}
</style>