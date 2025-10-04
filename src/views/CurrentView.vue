<script setup>
import { ref, onMounted, computed } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { SENSOR_TYPES } from '@/utils/constants';

const weatherStore = useWeatherStore();
const formatters = useFormatters();
const refresh = ref(false);

const refreshData = async () => {
  refresh.value = true;
  await weatherStore.fetchCurrentWeather();
  refresh.value = false;
};

onMounted(async () => {
  if (!weatherStore.currentWeatherData) {
    await weatherStore.fetchCurrentWeather();
  }
});

const allSensorData = computed(() => {
  if (!weatherStore.currentWeatherData) return [];

  const data = [];
  weatherStore.currentWeatherData.sensors.forEach((sensor) => {
    const sensorData = sensor.data[0];
    if (!sensorData) return;

    Object.entries(sensorData).forEach(([key, value]) => {
      data.push({
        sensor: `Type ${sensor.sensor_type}`,
        lsid: sensor.lsid,
        field: key,
        value: value,
        formatted: formatValue(key, value),
      });
    });
  });

  return data;
});

const formatValue = (key, value) => {
  if (value === null || value === undefined) return '--';

  // Temperature fields
  if (key.includes('temp') || key.includes('dew') || key.includes('heat') || key.includes('chill') || key.includes('wet_bulb') || key.includes('thw') || key.includes('thsw')) {
    return formatters.formatTemperature(value);
  }

  // Wind speed fields
  if (key.includes('wind_speed')) {
    return formatters.formatWindSpeed(value);
  }

  // Pressure fields
  if (key.includes('bar')) {
    return formatters.formatPressure(value);
  }

  // Humidity fields
  if (key.includes('hum')) {
    return formatters.formatPercentage(value);
  }

  // Rainfall fields
  if (key.includes('rain') && (key.includes('_mm') || key.includes('_in'))) {
    return formatters.formatRainfall(value);
  }

  // Timestamps
  if (key === 'ts' || key.includes('_at')) {
    return formatters.formatDateTime(new Date(value * 1000));
  }

  return value;
};
</script>

<template>
  <div class="current-view-container">
    <div class="page-header">
      <h1>Huidige Data</h1>
      <div class="header-actions">
        <div class="nav-buttons">
          <Button label="Terug" icon="pi pi-arrow-left" @click="$router.push('/')" text />
        </div>
        <Button icon="pi pi-refresh" @click="refreshData" :loading="refresh" text rounded />
      </div>
    </div>

    <div v-if="weatherStore.isLoading && !weatherStore.currentWeatherData" class="loading-state">
      <ProgressSpinner />
      <p>Weergegevens laden...</p>
    </div>

    <Card v-else>
      <template #header>
        <div class="card-header">
          <h2>Alle Huidige Sensordata</h2>
          <small>Laatst bijgewerkt: {{ weatherStore.lastUpdated ? formatters.formatDateTime(weatherStore.lastUpdated) : '--' }}</small>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="allSensorData"
          paginator
          :rows="50"
          :rowsPerPageOptions="[25, 50, 100]"
          filterDisplay="row"
          :globalFilterFields="['sensor', 'field', 'value']"
          sortField="sensor"
          :sortOrder="1"
          stripedRows
          showGridlines
        >
          <Column field="sensor" header="Sensor" sortable filter filterPlaceholder="Filter op sensor" style="min-width: 150px" />
          <Column field="lsid" header="LSID" sortable style="min-width: 100px" />
          <Column field="field" header="Veldnaam" sortable filter filterPlaceholder="Filter op veld" style="min-width: 250px" />
          <Column field="value" header="Ruwe Waarde" sortable style="min-width: 150px" />
          <Column field="formatted" header="Geformatteerde Waarde" sortable style="min-width: 200px" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.current-view-container {
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
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}

@media (max-width: 768px) {
  .current-view-container {
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

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
