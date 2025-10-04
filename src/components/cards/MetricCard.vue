<script setup>
import Card from 'primevue/card';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: false },
  subtitle: { type: String, required: false },
  trend: { type: String, required: false }, // 'up', 'down', 'stable'
  color: { type: String, default: 'primary' },
});
</script>

<template>
  <Card class="metric-card">
    <template #content>
      <div class="metric-content">
        <div class="metric-header">
          <span
            v-if="icon"
            class="material-symbols-outlined metric-icon"
            >{{ icon }}</span
          >
          <h4 class="metric-title">{{ title }}</h4>
        </div>
        <div class="metric-value">{{ value }}</div>
        <div
          v-if="subtitle || trend"
          class="metric-subtitle"
        >
          {{ subtitle }}
          <span
            v-if="trend"
            class="material-symbols-outlined trend-icon"
            :class="`trend-${trend}`"
          >
            {{ trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat' }}
          </span>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.metric-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-card :deep(.p-card-body) {
  padding: 1.25rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-card :deep(.p-card-content) {
  padding: 0;
  width: 100%;
}

.metric-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  justify-content: center;
  width: 100%;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: column;
}

.metric-icon {
  font-size: 2rem;
  color: var(--primary-color);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.metric-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1;
}

.metric-subtitle {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: center;
}

.trend-icon {
  font-size: 1rem;
  vertical-align: middle;
}

.trend-up {
  color: #22c55e;
}

.trend-down {
  color: #ef4444;
}

.trend-stable {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .metric-value {
    font-size: 1.5rem;
  }

  .metric-icon {
    font-size: 1.5rem;
  }

  .metric-title {
    font-size: 0.75rem;
  }

  .metric-content {
    min-height: 100px;
  }

  .metric-header {
    gap: 0.25rem;
  }

  .trend-icon {
    font-size: 0.9rem;
  }
}
</style>
