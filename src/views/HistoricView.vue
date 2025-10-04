<script setup>
import { ref, onMounted, computed } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import ProgressSpinner from 'primevue/progressspinner';

const weatherStore = useWeatherStore();
const formatters = useFormatters();
const refresh = ref(false);

const dateRange = ref([
  new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  new Date(), // now
]);

const refreshData = async () => {
  refresh.value = true;
  await fetchCustomRange();
  refresh.value = false;
};

onMounted(async () => {
  if (!weatherStore.historicWeatherData) {
    await weatherStore.fetchHistoricWeatherForLast24Hours();
  }
});

const fetchCustomRange = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) return;

  const start = Math.floor(dateRange.value[0].getTime() / 1000);
  const end = Math.floor(dateRange.value[1].getTime() / 1000);

  // Ensure max 24 hour range
  if (end - start > 24 * 60 * 60) {
    alert('Maximale bereik is 24 uur');
    return;
  }

  await weatherStore.fetchHistoricWeather(start, end);
};

const historicTableData = computed(() => {
  if (!weatherStore.historicWeatherData) return [];

  const sensor = weatherStore.historicWeatherData.sensors.find((s) => s.sensor_type === 43);
  if (!sensor) return [];

  return sensor.data.map((record) => ({
    timestamp: formatters.formatDateTime(new Date(record.ts * 1000)),
    ts: record.ts,
    tempAvg: record.temp_avg,
    tempHi: record.temp_hi,
    tempLo: record.temp_lo,
    humAvg: record.hum_last,
    windSpeedAvg: record.wind_speed_avg,
    windSpeedHi: record.wind_speed_hi,
    windDir: formatters.formatWindDirection(record.wind_dir_of_avg),
    rainfall: record.rainfall_mm,
    reception: record.reception,
  }));
});

const exportToCSV = () => {
  if (historicTableData.value.length === 0) return;

  const headers = Object.keys(historicTableData.value[0]);
  const csvContent = [
    headers.join(','),
    ...historicTableData.value.map((row) => headers.map((h) => row[h]).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weather-data-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="historic-view-container">
    <div class="page-header">
      <h1>Historische Data</h1>
      <div class="header-actions">
        <div class="nav-buttons">
          <Button label="Terug" icon="pi pi-arrow-left" @click="$router.push('/')" text />
        </div>
        <Button icon="pi pi-refresh" @click="refreshData" :loading="refresh" text rounded />
      </div>
    </div>

    <div v-if="weatherStore.isLoading && !weatherStore.historicWeatherData" class="loading-state">
      <ProgressSpinner />
      <p>Weergegevens laden...</p>
    </div>

    <Card v-else>
      <template #header>
        <div class="card-header">
          <h2>Datumbereik Selectie</h2>
          <div class="date-controls">
            <Calendar v-model="dateRange" selectionMode="range" :manualInput="false" showIcon dateFormat="dd/mm/yy" />
            <Button label="Data Ophalen" icon="pi pi-search" @click="fetchCustomRange" />
            <Button label="Exporteer CSV" icon="pi pi-download" @click="exportToCSV" :disabled="historicTableData.length === 0" />
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="historicTableData"
          paginator
          :rows="20"
          :rowsPerPageOptions="[10, 20, 50, 100]"
          sortField="ts"
          :sortOrder="-1"
          stripedRows
          showGridlines
        >
          <Column field="timestamp" header="Tijdstempel" sortable style="min-width: 180px" />
          <Column field="tempAvg" header="Temp Gem (°C)" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ formatters.formatTemperature(data.tempAvg) }}
            </template>
          </Column>
          <Column field="tempHi" header="Temp Hoog (°C)" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ formatters.formatTemperature(data.tempHi) }}
            </template>
          </Column>
          <Column field="tempLo" header="Temp Laag (°C)" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ formatters.formatTemperature(data.tempLo) }}
            </template>
          </Column>
          <Column field="humAvg" header="Vochtigheid (%)" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ formatters.formatPercentage(data.humAvg) }}
            </template>
          </Column>
          <Column field="windSpeedAvg" header="Wind Gem (km/h)" sortable style="min-width: 140px">
            <template #body="{ data }">
              {{ formatters.formatWindSpeed(data.windSpeedAvg) }}
            </template>
          </Column>
          <Column field="windSpeedHi" header="Windstoot (km/h)" sortable style="min-width: 140px">
            <template #body="{ data }">
              {{ formatters.formatWindSpeed(data.windSpeedHi) }}
            </template>
          </Column>
          <Column field="windDir" header="Windrichting" sortable style="min-width: 120px" />
          <Column field="rainfall" header="Regen (mm)" sortable style="min-width: 110px">
            <template #body="{ data }">
              {{ formatters.formatRainfall(data.rainfall) }}
            </template>
          </Column>
          <Column field="reception" header="Ontvangst (%)" sortable style="min-width: 130px">
            <template #body="{ data }">
              {{ formatters.formatPercentage(data.reception) }}
            </template>
          </Column>
        </DataTable>

        <div class="stats-summary" v-if="historicTableData.length > 0">
          <h3>Samenvatting Statistieken</h3>
          <p>Totaal aantal records: {{ historicTableData.length }}</p>
          <p>Tijdspanne: {{ historicTableData.length * 15 }} minuten ({{ Math.round(historicTableData.length / 4) }} uur)</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.historic-view-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
  overflow-x: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.page-header h1 {
  margin: 0;
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: #ffffff;
}

.card-header {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header h2 {
  margin: 0;
}

.date-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.stats-summary {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--surface-100);
  border-radius: 0.5rem;
}

.stats-summary h3 {
  margin: 0 0 0.5rem 0;
}

.stats-summary p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .historic-view-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
  }

  .date-controls {
    width: 100%;
    flex-direction: column;
  }

  .date-controls > * {
    width: 100%;
  }
}
</style>
