<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { CalendarDays, Download, Table2, TriangleAlert } from '@lucide/vue';
import dayjs from 'dayjs';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import { currentTerms } from '@/i18n';
import { convertFahrenheitToCelsius, convertMphToKmh, compassPoint16 } from '@/utils/weather';
import { SENSOR_TYPES, type IssArchive } from '@/types/weatherlink';
import AppHeader from '@/components/AppHeader.vue';
import SectionCard from '@/components/SectionCard.vue';

const weatherStore = useWeatherStore();
const formatters = useFormatters();
const { t } = useI18n();

// The WeatherLink historic endpoint caps a query at 24 hours, so the UI offers
// a single-day picker instead of pretending to support arbitrary ranges.
// Day results live here, not in the store, so they never clobber the
// dashboard's rolling 24h window.
const selectedDay = ref<Date>(new Date());
const today = ref(new Date());
const isFetching = ref(false);
const fetchError = ref(false);
const dayRecords = shallowRef<IssArchive[]>([]);

const fetchDay = async () => {
  today.value = new Date();
  if (selectedDay.value > today.value) {
    selectedDay.value = new Date();
  }

  const start = new Date(selectedDay.value);
  start.setHours(0, 0, 0, 0);
  const nextMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  const startTs = Math.floor(start.getTime() / 1000);
  // Clamp to the API's 24h cap (a DST-change day can span 25h; that day loses
  // its final hour rather than erroring) and never query into the future.
  const endTs = Math.min(
    Math.floor(nextMidnight.getTime() / 1000),
    startTs + 24 * 60 * 60,
    Math.floor(Date.now() / 1000)
  );

  isFetching.value = true;
  fetchError.value = false;
  try {
    const data = await weatherStore.fetchHistoricRange(startTs, endTs);
    const sensor = data.sensors.find((s) => s.sensor_type === SENSOR_TYPES.ISS);
    dayRecords.value = (sensor?.data as IssArchive[] | undefined) ?? [];
  } catch {
    fetchError.value = true;
  } finally {
    isFetching.value = false;
  }
};

onMounted(() => {
  void fetchDay();
});

interface HistoricRow {
  ts: number;
  time: string;
  tempAvg: number | null;
  tempHi: number | null;
  tempLo: number | null;
  humidity: number | null;
  windAvg: number | null;
  windGust: number | null;
  windDir: string;
  rain: number | null;
}

const toC = (f: number | null | undefined): number | null =>
  f === null || f === undefined ? null : convertFahrenheitToCelsius(f);

const toKmh = (mph: number | null | undefined): number | null =>
  mph === null || mph === undefined ? null : convertMphToKmh(mph);

const directionAbbr = (degrees: number | null): string => {
  const point = compassPoint16(degrees);
  return point === null ? '–' : currentTerms.value.compass16[point];
};

const rows = computed<HistoricRow[]>(() =>
  dayRecords.value.map((record) => ({
    ts: record.ts,
    time: formatters.formatDateTime(record.ts * 1000),
    tempAvg: toC(record.temp_avg),
    tempHi: toC(record.temp_hi),
    tempLo: toC(record.temp_lo),
    humidity: record.hum_last ?? null,
    windAvg: toKmh(record.wind_speed_avg),
    windGust: toKmh(record.wind_speed_hi),
    windDir: directionAbbr(record.wind_dir_of_prevail ?? null),
    rain: record.rainfall_mm ?? null,
  }))
);

const totalRain = computed(() => rows.value.reduce((sum, r) => sum + (r.rain ?? 0), 0));

const exportCsv = () => {
  if (rows.value.length === 0) return;

  // Spreadsheet conventions of the page's language (see i18n/terms.ts), and a
  // UTF-8 BOM so non-ASCII characters survive the import.
  const { separator, decimal, isoTime, header } = currentTerms.value.csv;
  const csvNum = (value: number | null, decimals: number): string =>
    value === null ? '' : value.toFixed(decimals).replace('.', decimal);

  const lines = rows.value.map((r) =>
    [
      isoTime ? formatters.formatIsoDateTime(r.ts * 1000) : r.time,
      csvNum(r.tempAvg, 1),
      csvNum(r.tempHi, 1),
      csvNum(r.tempLo, 1),
      csvNum(r.humidity, 0),
      csvNum(r.windAvg, 1),
      csvNum(r.windGust, 1),
      r.windDir,
      csvNum(r.rain, 2),
    ].join(separator)
  );

  const blob = new Blob(['﻿' + [header.join(separator), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meteozandvoort-${dayjs(selectedDay.value).format('YYYY-MM-DD')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="page">
    <AppHeader
      :title="t('historic.title')"
      back
    />

    <SectionCard
      :title="t('historic.pickDay')"
      :icon="CalendarDays"
    >
      <div class="day-controls">
        <DatePicker
          v-model="selectedDay"
          :max-date="today"
          :date-format="currentTerms.primevue.dateFormat"
          show-icon
          :manual-input="false"
        />
        <Button
          :label="t('historic.fetch')"
          :loading="isFetching"
          @click="fetchDay"
        />
        <Button
          :label="t('historic.export')"
          severity="secondary"
          outlined
          :disabled="rows.length === 0"
          @click="exportCsv"
        >
          <template #icon>
            <Download :size="15" />
          </template>
        </Button>
      </div>
      <p class="range-note">{{ t('historic.rangeNote') }}</p>
      <p
        v-if="fetchError"
        class="fetch-error"
      >
        <TriangleAlert
          :size="14"
          aria-hidden="true"
        />
        {{ t('historic.fetchError') }}
      </p>
    </SectionCard>

    <SectionCard
      :title="t('historic.records')"
      :icon="Table2"
    >
      <DataTable
        :value="rows"
        paginator
        :rows="24"
        :rows-per-page-options="[24, 48, 96]"
        sort-field="ts"
        :sort-order="-1"
        striped-rows
      >
        <Column
          field="ts"
          :header="t('historic.columns.time')"
          sortable
          style="min-width: 140px"
        >
          <template #body="{ data }">{{ data.time }}</template>
        </Column>
        <Column
          field="tempAvg"
          :header="t('historic.columns.temp')"
          sortable
          style="min-width: 90px"
        >
          <template #body="{ data }">{{ formatters.formatTemperature(data.tempAvg) }}</template>
        </Column>
        <Column
          field="tempHi"
          :header="t('historic.columns.max')"
          sortable
          style="min-width: 90px"
        >
          <template #body="{ data }">{{ formatters.formatTemperature(data.tempHi) }}</template>
        </Column>
        <Column
          field="tempLo"
          :header="t('historic.columns.min')"
          sortable
          style="min-width: 90px"
        >
          <template #body="{ data }">{{ formatters.formatTemperature(data.tempLo) }}</template>
        </Column>
        <Column
          field="humidity"
          :header="t('historic.columns.humidity')"
          sortable
          style="min-width: 85px"
        >
          <template #body="{ data }">{{ formatters.formatPercentage(data.humidity) }}</template>
        </Column>
        <Column
          field="windAvg"
          :header="t('historic.columns.wind')"
          sortable
          style="min-width: 110px"
        >
          <template #body="{ data }">{{ formatters.formatWindSpeed(data.windAvg) }}</template>
        </Column>
        <Column
          field="windGust"
          :header="t('historic.columns.gusts')"
          sortable
          style="min-width: 110px"
        >
          <template #body="{ data }">{{ formatters.formatWindSpeed(data.windGust) }}</template>
        </Column>
        <Column
          field="windDir"
          :header="t('historic.columns.direction')"
          sortable
          style="min-width: 90px"
        />
        <Column
          field="rain"
          :header="t('historic.columns.rain')"
          sortable
          style="min-width: 100px"
        >
          <template #body="{ data }">{{ formatters.formatRainfall(data.rain, 2) }}</template>
        </Column>
      </DataTable>

      <p
        v-if="rows.length > 0"
        class="summary"
      >
        {{ t('historic.summary', { n: rows.length, rain: formatters.formatRainfall(totalRain) }, rows.length) }}
      </p>
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

.day-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.range-note {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.fetch-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--status-error);
}

.summary {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page {
    padding: 1rem 1rem 1.5rem;
  }

  .day-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
