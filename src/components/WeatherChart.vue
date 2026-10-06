<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ChartSeries } from '@/composables/useWeatherCharts';

const props = defineProps<{
  type: 'line' | 'area' | 'bar';
  series: ChartSeries[];
  options: Record<string, unknown>;
  height?: number;
}>();

const hasData = computed(() => props.series.some((s) => s.data.some((p) => p.y !== null)));

// vue3-apexcharts clones options through JSON before updateOptions, which strips
// every function (the Dutch number and unit formatters). Remounting on each new
// options object keeps every render on the initial-render path.
const renderKey = ref(0);
watch(
  () => props.options,
  () => {
    renderKey.value += 1;
  }
);
</script>

<template>
  <apexchart
    v-if="hasData"
    :key="renderKey"
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
