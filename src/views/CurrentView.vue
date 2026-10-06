<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Table2 } from '@lucide/vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import { convertFahrenheitToCelsius, convertMphToKmh, convertInHgToHpa } from '@/utils/weather';
import { SENSOR_TYPES } from '@/types/weatherlink';
import AppHeader from '@/components/AppHeader.vue';
import SectionCard from '@/components/SectionCard.vue';

const weatherStore = useWeatherStore();
const formatters = useFormatters();
const { t } = useI18n();

onMounted(() => {
  if (!weatherStore.currentWeatherData) {
    void weatherStore.fetchAll();
  }
});

const SENSOR_KEYS = {
  [SENSOR_TYPES.ISS]: 'iss',
  [SENSOR_TYPES.BAROMETER]: 'barometer',
  [SENSOR_TYPES.INDOOR]: 'indoor',
  [SENSOR_TYPES.HEALTH]: 'health',
} as const;

const sensorLabel = (type: number): string => {
  const key = SENSOR_KEYS[type as keyof typeof SENSOR_KEYS];
  return key ? t(`current.sensors.${key}`) : t('current.sensors.other', { type });
};

interface SensorRow {
  sensor: string;
  lsid: number;
  field: string;
  value: string;
  formatted: string;
}

const formatValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return '–';
  if (typeof value !== 'number') return String(value);

  // Unix timestamps
  if (key === 'ts' || key.endsWith('_at') || key.endsWith('_timestamp')) {
    return formatters.formatDateTime(value * 1000);
  }

  // Temperature fields report °F; skip diagnostics like battery_temp
  const isTemperature =
    /temp|dew_point|heat_index|wind_chill|wet_bulb|thw_index|thsw_index/.test(key) &&
    !/battery|volt|clicks|freq/.test(key);
  if (isTemperature) {
    return formatters.formatTemperature(convertFahrenheitToCelsius(value));
  }

  if (key.includes('wind_speed')) {
    return formatters.formatWindSpeed(convertMphToKmh(value));
  }

  if (key.startsWith('bar_')) {
    return formatters.formatPressure(convertInHgToHpa(value));
  }

  if (key.startsWith('hum')) {
    return formatters.formatPercentage(value);
  }

  if (key.includes('rain') && key.endsWith('_mm')) {
    return key.includes('rate') ? formatters.formatRainRate(value) : formatters.formatRainfall(value);
  }

  return String(value);
};

const rows = computed<SensorRow[]>(() => {
  const data = weatherStore.currentWeatherData;
  if (!data) return [];

  return data.sensors.flatMap((sensor) => {
    const record = sensor.data[0];
    if (!record) return [];
    return Object.entries(record).map(([field, value]) => ({
      sensor: sensorLabel(sensor.sensor_type),
      lsid: sensor.lsid,
      field,
      value: value === null || value === undefined ? '–' : String(value),
      formatted: formatValue(field, value),
    }));
  });
});
</script>

<template>
  <div class="page">
    <AppHeader
      :title="t('current.title')"
      back
      live
    />

    <SectionCard
      :title="t('current.fields')"
      :icon="Table2"
    >
      <DataTable
        :value="rows"
        paginator
        :rows="50"
        :rows-per-page-options="[25, 50, 100]"
        sort-field="sensor"
        :sort-order="1"
        striped-rows
      >
        <Column
          field="sensor"
          :header="t('current.sensor')"
          sortable
          style="min-width: 160px"
        />
        <Column
          field="field"
          :header="t('current.field')"
          sortable
          style="min-width: 240px"
        />
        <Column
          field="value"
          :header="t('current.raw')"
          sortable
          style="min-width: 130px"
        />
        <Column
          field="formatted"
          :header="t('current.formatted')"
          sortable
          style="min-width: 160px"
        />
      </DataTable>
    </SectionCard>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .page {
    padding: 1rem 1rem 1.5rem;
  }
}
</style>
