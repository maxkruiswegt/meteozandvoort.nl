<script setup lang="ts">
import { computed } from 'vue';
import type { ChartSeries } from '@/composables/useWeatherCharts';

const props = defineProps<{
  type: 'line' | 'area' | 'bar';
  series: ChartSeries[];
  options: Record<string, unknown>;
  height?: number;
}>();

const hasData = computed(() => props.series.some((s) => s.data.some((p) => p.y !== null)));
</script>

<template>
  <apexchart
    v-if="hasData"
    :type="type"
    :height="height ?? 280"
    :options="options"
    :series="series"
  />
  <div
    v-else
    class="chart-empty"
    :style="{ height: `${height ?? 280}px` }"
  >
    Geen gegevens beschikbaar
  </div>
</template>

<style scoped>
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  font-size: 0.875rem;
}
</style>
