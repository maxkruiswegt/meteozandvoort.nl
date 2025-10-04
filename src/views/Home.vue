<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useUIStore } from '@/stores/UIStore';
import { useFormatters } from '@/composables/useFormatters';
import { useChartConfig } from '@/composables/useChartConfig';

import Button from 'primevue/button';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';
import MetricCard from '@/components/cards/MetricCard.vue';

const weatherStore = useWeatherStore();
const uiStore = useUIStore();
const formatters = useFormatters();
const chartConfig = useChartConfig();

const refresh = ref(false);
let refreshTimer = null;

const refreshData = async () => {
  refresh.value = true;
  await Promise.all([weatherStore.fetchCurrentWeather(), weatherStore.fetchHistoricWeatherForLast24Hours()]);
  refresh.value = false;
};

onMounted(async () => {
  await refreshData();

  // Auto-refresh if enabled
  if (uiStore.autoRefreshEnabled) {
    refreshTimer = setInterval(refreshData, uiStore.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

// Computed properties for display
const currentTemp = computed(() => formatters.formatTemperature(weatherStore.temperature));
const feelsLike = computed(() => formatters.formatTemperature(weatherStore.thwIndex));
const windDir10MinAvg = computed(() => formatters.formatWindDirection(weatherStore.windDirectionAvgLast10Min));
const pressure = computed(() => formatters.formatPressure(weatherStore.barometricPressure));
const humidity = computed(() => formatters.formatPercentage(weatherStore.humidity));
const rainfall = computed(() => formatters.formatRainfall(weatherStore.rainfallToday));

// Beaufort scale helpers
const getBeaufort = (mph) => formatters.getBeaufortScale(mph);
const beaufortNow = computed(() => getBeaufort(weatherStore.windSpeedLast));
const beaufort10Min = computed(() => getBeaufort(weatherStore.windSpeedAvgLast10Min));
const beaufort10MinHi = computed(() => getBeaufort(weatherStore.windSpeedHiLast10Min));
const beaufort24HAvg = computed(() => getBeaufort(weatherStore.windSpeedAvgLast24Hours));
const beaufort24HHi = computed(() => getBeaufort(weatherStore.windSpeedHiLast24Hours));

// Chart series
const temperatureChartSeries = computed(() => chartConfig.prepareTemperatureChartData(weatherStore.historicRecords));
const temperatureChartOptions = computed(() => chartConfig.getBaseChartOptions('Temperatuur (24u)'));

const windChartSeries = computed(() => chartConfig.prepareWindSpeedChartData(weatherStore.historicRecords));
const windChartOptions = computed(() => chartConfig.getBaseChartOptions('Windsnelheid (24u)'));

const pressureChartSeries = computed(() => chartConfig.preparePressureChartData(weatherStore.historicBarometerRecords));
const pressureChartOptions = computed(() => chartConfig.getBaseChartOptions('Luchtdruk (24u)'));

const humidityChartSeries = computed(() => chartConfig.prepareHumidityChartData(weatherStore.historicRecords));
const humidityChartOptions = computed(() => chartConfig.getBaseChartOptions('Luchtvochtigheid (24u)'));

const rainfallChartSeries = computed(() => chartConfig.prepareRainfallChartData(weatherStore.historicRecords));
const rainfallChartOptions = computed(() => {
  const options = chartConfig.getBaseChartOptions('Regenval (24u)');
  return {
    ...options,
    chart: { ...options.chart, type: 'bar' },
    dataLabels: {
      enabled: false,
    },
  };
});
</script>

<template>
  <div class="home-container">
    <!-- Header -->
    <div class="header">
      <h1>Meteo Zandvoort</h1>
      <div class="header-actions">
        <div class="nav-buttons">
          <Button
            label="Huidig"
            icon="pi pi-list"
            @click="$router.push('/huidig')"
            text
          />
          <Button
            label="Historisch"
            icon="pi pi-chart-line"
            @click="$router.push('/historisch')"
            text
          />
        </div>
        <Button
          icon="pi pi-refresh"
          @click="refreshData"
          :loading="refresh"
          text
          rounded
        />
      </div>
    </div>

    <!-- Last Updated -->
    <div class="last-updated">
      <small>
        Laatste update:
        {{ weatherStore.lastFetchTime ? formatters.formatDateTime(new Date(weatherStore.lastFetchTime)) : 'Laden...' }}
        ({{ weatherStore.lastFetchTime ? formatters.formatRelativeTime(new Date(weatherStore.lastFetchTime)) : '--' }})
      </small>
    </div>

    <!-- Loading State -->
    <div
      v-if="weatherStore.isLoading && !weatherStore.currentWeatherData"
      class="loading-state"
    >
      <ProgressSpinner />
      <p>Weergegevens laden...</p>
    </div>

    <!-- Main Content -->
    <div
      v-else-if="weatherStore.currentWeatherData"
      class="weather-content"
    >
      <!-- Hero Section - Current Conditions -->
      <Card class="hero-card">
        <template #content>
          <div class="hero-content">
            <div class="hero-main">
              <div class="hero-metric">
                <span class="material-symbols-outlined metric-icon">device_thermostat</span>
                <div class="metric-info">
                  <div class="metric-label">Temperatuur</div>
                  <div class="metric-value-large">{{ currentTemp }}</div>
                  <div class="metric-subtitle">Voelt als {{ feelsLike }}</div>
                </div>
              </div>

              <div class="hero-metric">
                <span class="material-symbols-outlined metric-icon">air</span>
                <div class="metric-info">
                  <div class="metric-label">Wind (10-min gem)</div>
                  <div class="metric-value-large">
                    {{ formatters.formatWindSpeed(weatherStore.windSpeedAvgLast10Min) }}
                  </div>
                  <div class="metric-subtitle">
                    {{ beaufort10Min.description }} ({{ beaufort10Min.value }} bft) {{ windDir10MinAvg }}
                  </div>
                </div>
              </div>
            </div>

            <div class="hero-secondary">
              <div class="hero-stat">
                <span class="material-symbols-outlined">compress</span>
                <div>
                  <div class="stat-value">{{ pressure }}</div>
                  <div class="stat-label">
                    {{
                      weatherStore.barometricTrend > 0
                        ? 'Stijgend'
                        : weatherStore.barometricTrend < 0
                        ? 'Dalend'
                        : 'Stabiel'
                    }}
                  </div>
                </div>
              </div>

              <div class="hero-stat">
                <span class="material-symbols-outlined">water_drop</span>
                <div>
                  <div class="stat-value">{{ humidity }}</div>
                  <div class="stat-label">Luchtvochtigheid</div>
                </div>
              </div>

              <div class="hero-stat">
                <span class="material-symbols-outlined">rainy</span>
                <div>
                  <div class="stat-value">{{ rainfall }}</div>
                  <div class="stat-label">Regen vandaag</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Extended Metrics -->
      <Card class="extended-metrics">
        <template #header>
          <h3>Alle Metingen</h3>
        </template>
        <template #content>
          <div class="metrics-grid extended">
            <!-- Temperature Metrics -->
            <MetricCard
              title="Temperatuur"
              :value="currentTemp"
              icon="device_thermostat"
            />
            <MetricCard
              title="Dauwpunt"
              :value="formatters.formatTemperature(weatherStore.dewPoint)"
              icon="dew_point"
            />
            <MetricCard
              title="Gevoelstemp."
              :value="feelsLike"
              icon="heat"
            />
            <MetricCard
              title="Hitte Index"
              :value="formatters.formatTemperature(weatherStore.heatIndex)"
              icon="sunny"
            />
            <MetricCard
              title="Wind Chill"
              :value="formatters.formatTemperature(weatherStore.windChill)"
              icon="ac_unit"
            />

            <!-- Humidity & Pressure -->
            <MetricCard
              title="Luchtvochtigheid"
              :value="humidity"
              icon="water_drop"
            />
            <MetricCard
              title="Luchtdruk"
              :value="pressure"
              :subtitle="
                weatherStore.barometricTrend > 0 ? 'Stijgend' : weatherStore.barometricTrend < 0 ? 'Dalend' : 'Stabiel'
              "
              :trend="weatherStore.barometricTrend > 0 ? 'up' : weatherStore.barometricTrend < 0 ? 'down' : 'stable'"
              icon="compress"
            />

            <!-- Wind Metrics -->
            <MetricCard
              title="Wind Nu"
              :value="formatters.formatWindSpeed(weatherStore.windSpeedLast)"
              :subtitle="`${getBeaufort(weatherStore.windSpeedLast).description} (${
                getBeaufort(weatherStore.windSpeedLast).value
              } bft)`"
              icon="air"
            />
            <MetricCard
              title="Wind 1-min"
              :value="formatters.formatWindSpeed(weatherStore.windSpeedAvgLast1Min)"
              :subtitle="`${getBeaufort(weatherStore.windSpeedAvgLast1Min).description} (${
                getBeaufort(weatherStore.windSpeedAvgLast1Min).value
              } bft)`"
              icon="air"
            />
            <MetricCard
              title="Wind 10-min"
              :value="formatters.formatWindSpeed(weatherStore.windSpeedAvgLast10Min)"
              :subtitle="`${beaufort10Min.description} (${beaufort10Min.value} bft)`"
              icon="air"
            />
            <MetricCard
              title="Wind 10-min Max"
              :value="formatters.formatWindSpeed(weatherStore.windSpeedHiLast10Min)"
              :subtitle="`${beaufort10MinHi.description} (${beaufort10MinHi.value} bft)`"
              icon="air"
            />
            <MetricCard
              title="Wind 24u Gem"
              :value="formatters.formatWindSpeed(weatherStore.windSpeedAvgLast24Hours)"
              :subtitle="`${beaufort24HAvg.description} (${beaufort24HAvg.value} bft)`"
              icon="air"
            />
            <MetricCard
              title="Wind 24u Max"
              :value="formatters.formatWindSpeed(weatherStore.windSpeedHiLast24Hours)"
              :subtitle="`${beaufort24HHi.description} (${beaufort24HHi.value} bft)`"
              icon="air"
            />

            <!-- Rain Metrics -->
            <MetricCard
              title="Regen Vandaag"
              :value="rainfall"
              icon="rainy"
            />
            <MetricCard
              title="Regen Intensiteit"
              :value="formatters.formatRainfall(weatherStore.rainRateLast)"
              subtitle="Per uur"
              icon="umbrella"
            />
            <MetricCard
              title="Regen 15min"
              :value="formatters.formatRainfall(weatherStore.rainfallLast15Min)"
              icon="rainy"
            />
            <MetricCard
              title="Regen 1u"
              :value="formatters.formatRainfall(weatherStore.rainfallLast60Min)"
              icon="rainy"
            />
            <MetricCard
              title="Regen 24u"
              :value="formatters.formatRainfall(weatherStore.rainfallLast24Hours)"
              icon="rainy"
            />
            <MetricCard
              title="Regen Maand"
              :value="formatters.formatRainfall(weatherStore.rainfallMonth)"
              icon="rainy"
            />
            <MetricCard
              title="Regen Jaar"
              :value="formatters.formatRainfall(weatherStore.rainfallYear)"
              icon="rainy"
            />

            <!-- Indoor Metrics -->
            <MetricCard
              v-if="weatherStore.indoorTemperature"
              title="Binnen Temp"
              :value="formatters.formatTemperature(weatherStore.indoorTemperature)"
              icon="home"
            />
            <MetricCard
              v-if="weatherStore.indoorHumidity"
              title="Binnen Vocht"
              :value="formatters.formatPercentage(weatherStore.indoorHumidity)"
              icon="home"
            />
          </div>
        </template>
      </Card>

      <!-- Charts -->
      <Card class="chart-section">
        <template #header>
          <h3>Temperatuur (24u)</h3>
        </template>
        <template #content>
          <apexchart
            v-if="temperatureChartSeries.length > 0"
            type="line"
            height="350"
            :options="temperatureChartOptions"
            :series="temperatureChartSeries"
          />
        </template>
      </Card>

      <Card class="chart-section">
        <template #header>
          <h3>Windsnelheid (24u)</h3>
        </template>
        <template #content>
          <apexchart
            v-if="windChartSeries.length > 0"
            type="line"
            height="350"
            :options="windChartOptions"
            :series="windChartSeries"
          />
        </template>
      </Card>

      <Card class="chart-section">
        <template #header>
          <h3>Luchtdruk (24u)</h3>
        </template>
        <template #content>
          <apexchart
            v-if="pressureChartSeries.length > 0"
            type="line"
            height="350"
            :options="pressureChartOptions"
            :series="pressureChartSeries"
          />
        </template>
      </Card>

      <Card class="chart-section">
        <template #header>
          <h3>Luchtvochtigheid (24u)</h3>
        </template>
        <template #content>
          <apexchart
            v-if="humidityChartSeries.length > 0"
            type="line"
            height="350"
            :options="humidityChartOptions"
            :series="humidityChartSeries"
          />
        </template>
      </Card>

      <Card class="chart-section">
        <template #header>
          <h3>Regenval (24u)</h3>
        </template>
        <template #content>
          <apexchart
            v-if="rainfallChartSeries.length > 0"
            type="bar"
            height="350"
            :options="rainfallChartOptions"
            :series="rainfallChartSeries"
          />
        </template>
      </Card>

      <!-- About Section -->
      <Card class="about-section">
        <template #header>
          <div class="about-header">
            <span class="material-symbols-outlined">info</span>
            <h3>Over Meteo Zandvoort</h3>
          </div>
        </template>
        <template #content>
          <p>
            Deze weergegevens worden rechtstreeks geleverd door het weerstation van
            <strong>Herman Kruiswegt</strong> in Zandvoort. Herman heeft jarenlang ervaring in meteorologie en biedt
            nauwkeurige en actuele weerinformatie voor de regio.
          </p>
          <p>
            Naast zijn passie voor meteorologie, biedt Herman ook boekhoudingsdiensten aan via zijn website:
            <a
              href="https://decib.nl"
              target="_blank"
              >decib.nl</a
            >.
          </p>
        </template>
      </Card>

      <!-- Footer -->
      <footer class="footer">
        <p>
          Gemaakt met ❤️ door
          <a
            href="https://maxkruiswegt.com"
            target="_blank"
            >Max Kruiswegt</a
          >
        </p>
      </footer>
    </div>

    <!-- Error State -->
    <div
      v-else
      class="error-state"
    >
      <Card>
        <template #content>
          <div class="error-content">
            <span class="material-symbols-outlined error-icon">error</span>
            <p>Er ging iets mis bij het ophalen van de data.</p>
            <Button
              label="Opnieuw Proberen"
              @click="refreshData"
            />
            <p>
              Bezoek de backup site:
              <a
                href="https://mijneigenweer.nl/Zandvoort"
                target="_blank"
                >mijneigenweer.nl/Zandvoort</a
              >
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.header h1 {
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

.last-updated {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
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

.hero-card {
  background: linear-gradient(135deg, #be4535 0%, #a03628 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(190, 69, 53, 0.3);
  border: none;
  overflow: hidden;
  position: relative;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)"/></svg>');
  opacity: 0.1;
  pointer-events: none;
}

.hero-card :deep(.p-card-body),
.hero-card :deep(.p-card-content) {
  background: transparent;
  color: white;
  position: relative;
  z-index: 1;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}

.hero-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 3rem;
}

.hero-metric {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.metric-icon {
  font-size: 4rem;
  opacity: 0.9;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.metric-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.85;
  font-weight: 600;
}

.metric-value-large {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}

.metric-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.hero-secondary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-stat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.hero-stat .material-symbols-outlined {
  font-size: 2rem;
  opacity: 0.85;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  grid-auto-rows: 1fr;
}

.metrics-grid > * {
  height: 100%;
}

.metrics-grid.extended {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.extended-metrics,
.chart-section {
  margin-top: 2rem;
}

.chart-section :deep(.p-card-body) {
  padding: 0;
}

.chart-section :deep(.p-card-content) {
  padding: 0;
}

@media (max-width: 768px) {
  .chart-section :deep(.apexcharts-toolbar) {
    display: none !important;
  }
}

.about-section {
  margin-top: 2rem;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.about-section :deep(.p-card-content) p {
  margin: 0 0 1rem 0;
}

.about-section :deep(.p-card-content) p:last-child {
  margin-bottom: 0;
}

.about-section :deep(.p-card-content) a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.about-section :deep(.p-card-content) a:hover {
  text-decoration: underline;
}

.footer {
  text-align: center;
  padding: 2rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.footer a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
}

.footer a:hover {
  text-decoration: underline;
}

.error-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: var(--red-500);
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .nav-buttons :deep(.p-button) {
    flex: 1;
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
    min-width: 0;
  }

  .nav-buttons :deep(.p-button-label) {
    font-size: 0.85rem;
  }

  .hero-content {
    padding: 1rem;
    gap: 1rem;
  }

  .hero-main {
    gap: 1.5rem;
  }

  .hero-metric {
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-metric .metric-icon {
    margin: 0 auto;
  }

  .metric-icon {
    font-size: 2.5rem;
  }

  .metric-value-large {
    font-size: 2rem;
  }

  .metric-label {
    font-size: 0.75rem;
  }

  .metric-subtitle {
    font-size: 0.85rem;
  }

  .hero-secondary {
    gap: 1rem;
    padding-top: 1rem;
  }

  .hero-stat {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .hero-stat .material-symbols-outlined {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .metrics-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .metrics-grid.extended {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  /* Reduce padding on mobile */
  .extended-metrics :deep(.p-card-header),
  .about-section :deep(.p-card-header) {
    padding: 0.75rem 0.5rem;
  }

  .extended-metrics :deep(.p-card-body),
  .about-section :deep(.p-card-body) {
    padding: 0.75rem;
  }
}
</style>
