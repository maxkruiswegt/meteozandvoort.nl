<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  Umbrella,
  Sun,
  House,
  Video,
  Info,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  LoaderCircle,
  TriangleAlert,
} from '@lucide/vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import { useWeatherCharts } from '@/composables/useWeatherCharts';
import { beaufortFromKmh, windDirectionName, temperatureColorVar } from '@/utils/weather';
import AppHeader from '@/components/AppHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import MetricTile from '@/components/MetricTile.vue';
import StatChip from '@/components/StatChip.vue';
import WindCompass from '@/components/WindCompass.vue';
import WeatherChart from '@/components/WeatherChart.vue';
import BeachcamStream from '@/components/BeachcamStream.vue';

const weatherStore = useWeatherStore();
const formatters = useFormatters();
const charts = useWeatherCharts();

// --- auto-refresh: the station reports every minute ---
const REFRESH_MS = 60_000;
let refreshTimer: number | undefined;

const onVisibilityChange = () => {
  if (!document.hidden && Date.now() - (weatherStore.lastFetchTime ?? 0) > REFRESH_MS) {
    void weatherStore.fetchAll();
  }
};

onMounted(() => {
  void weatherStore.fetchAll();
  refreshTimer = window.setInterval(() => {
    if (!document.hidden) void weatherStore.fetchAll();
  }, REFRESH_MS);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onUnmounted(() => {
  window.clearInterval(refreshTimer);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

// --- hero ---
const tempColor = computed(() => temperatureColorVar(weatherStore.temperature));
const tempRange = computed(() => weatherStore.temperatureRange24Hours);

const beaufort = computed(() => beaufortFromKmh(weatherStore.windSpeedAvg10Min));
const windOrigin = computed(() => windDirectionName(weatherStore.windDirectionAvg10Min));

const bftBandClass = computed(() => {
  const bft = beaufort.value?.bft;
  if (bft === null || bft === undefined) return 'bft-none';
  if (bft <= 1) return 'bft-calm';
  if (bft <= 3) return 'bft-light';
  if (bft <= 5) return 'bft-moderate';
  if (bft <= 7) return 'bft-strong';
  if (bft <= 9) return 'bft-gale';
  return 'bft-storm';
});

const pressureTrendMeta = computed(() => {
  switch (weatherStore.pressureTrendDirection) {
    case 'rising':
      return { icon: ArrowUpRight, label: 'stijgend' };
    case 'falling':
      return { icon: ArrowDownRight, label: 'dalend' };
    case 'steady':
      return { icon: ArrowRight, label: 'stabiel' };
    default:
      return null;
  }
});

// --- charts ---
const temperatureChart = computed(() => charts.temperatureChart(weatherStore.historicIss));
const windChart = computed(() => charts.windChart(weatherStore.historicIss));
const rainChart = computed(() => charts.rainChart(weatherStore.historicIss));
const pressureChart = computed(() => charts.pressureChart(weatherStore.historicBarometer));
const humidityChart = computed(() => charts.humidityChart(weatherStore.historicIss));
</script>

<template>
  <div class="page">
    <AppHeader />

    <!-- Refresh failed but stale data is still shown -->
    <div
      v-if="weatherStore.error && weatherStore.currentWeatherData"
      class="stale-banner"
    >
      <TriangleAlert
        :size="15"
        aria-hidden="true"
      />
      Vernieuwen mislukt; laatst bekende gegevens worden getoond.
    </div>

    <!-- Initial loading -->
    <div
      v-if="weatherStore.isLoading && !weatherStore.currentWeatherData"
      class="center-state"
    >
      <LoaderCircle
        class="spinner"
        :size="32"
        aria-hidden="true"
      />
      <p>Weergegevens laden…</p>
    </div>

    <!-- Hard failure, nothing to show -->
    <div
      v-else-if="!weatherStore.currentWeatherData"
      class="center-state"
    >
      <TriangleAlert
        :size="32"
        class="error-icon"
        aria-hidden="true"
      />
      <p>Er ging iets mis bij het ophalen van de gegevens.</p>
      <button
        type="button"
        class="retry-button"
        @click="weatherStore.fetchAll()"
      >
        Opnieuw proberen
      </button>
      <p class="backup-note">
        Bezoek anders de back-upsite:
        <a
          href="https://mijneigenweer.nl/Zandvoort"
          target="_blank"
          rel="noopener noreferrer"
          >mijneigenweer.nl/Zandvoort</a
        >
      </p>
    </div>

    <template v-else>
      <!-- ===== Hero ===== -->
      <section
        class="hero"
        aria-label="Huidige omstandigheden"
      >
        <div class="hero-temp">
          <div
            class="hero-temp-value num"
            :style="{ color: tempColor }"
          >
            {{ formatters.formatTemperature(weatherStore.temperature) }}
          </div>
          <div class="hero-temp-meta">
            <span>Voelt als {{ formatters.formatTemperature(weatherStore.feelsLike) }}</span>
            <span
              v-if="tempRange"
              class="temp-range num"
            >
              ↑ {{ formatters.formatTemperature(tempRange.max) }}
              <span class="range-divider">·</span>
              ↓ {{ formatters.formatTemperature(tempRange.min) }}
            </span>
          </div>
        </div>

        <div class="hero-wind">
          <WindCompass
            :degrees="weatherStore.windDirectionAvg10Min"
            :speed-label="formatters.formatWindSpeed(weatherStore.windSpeedAvg10Min)"
            :sub-label="`stoten ${formatters.formatWindSpeed(weatherStore.windGust10Min)}`"
          />
          <div class="wind-meta">
            <span
              class="bft-badge num"
              :class="bftBandClass"
            >
              {{ beaufort?.bft ?? '–' }} Bft
            </span>
            <span class="wind-desc">
              {{ beaufort?.label ?? '–' }}<template v-if="windOrigin"> uit het {{ windOrigin }}en</template>
            </span>
          </div>
        </div>

        <div class="hero-chips">
          <StatChip
            label="luchtdruk"
            :value="formatters.formatPressure(weatherStore.pressure)"
            :icon="pressureTrendMeta?.icon ?? Gauge"
            icon-color="var(--data-pressure)"
          />
          <StatChip
            label="luchtvochtigheid"
            :value="formatters.formatPercentage(weatherStore.humidity)"
            :icon="Droplets"
            icon-color="var(--data-humidity)"
          />
          <StatChip
            label="dauwpunt"
            :value="formatters.formatTemperature(weatherStore.dewPoint)"
            :icon="Thermometer"
            icon-color="var(--data-dewpoint)"
          />
          <StatChip
            :label="weatherStore.isRaining ? 'regen vandaag · regent nu' : 'regen vandaag'"
            :value="formatters.formatRainfall(weatherStore.rainToday)"
            :icon="CloudRain"
            icon-color="var(--data-rain)"
          />
          <StatChip
            v-if="weatherStore.uvIndex !== null"
            label="zonkracht"
            :value="formatters.formatNumber(weatherStore.uvIndex, 0)"
            :icon="Sun"
            icon-color="var(--data-gust)"
          />
        </div>
      </section>

      <!-- ===== Charts ===== -->
      <div class="chart-grid">
        <SectionCard
          title="Temperatuur (24u)"
          :icon="Thermometer"
        >
          <WeatherChart v-bind="temperatureChart" />
        </SectionCard>
        <SectionCard
          title="Wind (24u)"
          :icon="Wind"
        >
          <WeatherChart v-bind="windChart" />
        </SectionCard>
        <SectionCard
          title="Neerslag (24u)"
          :icon="CloudRain"
        >
          <WeatherChart v-bind="rainChart" />
        </SectionCard>
        <SectionCard
          title="Luchtdruk (24u)"
          :icon="Gauge"
        >
          <WeatherChart v-bind="pressureChart" />
        </SectionCard>
        <SectionCard
          title="Luchtvochtigheid (24u)"
          :icon="Droplets"
        >
          <WeatherChart v-bind="humidityChart" />
        </SectionCard>
      </div>

      <!-- ===== Details ===== -->
      <SectionCard
        title="Details"
        :icon="Info"
      >
        <div class="tile-grid">
          <MetricTile
            label="Regenintensiteit"
            :value="formatters.formatRainRate(weatherStore.rainRateNow)"
            :icon="Umbrella"
          />
          <MetricTile
            label="Regen laatste uur"
            :value="formatters.formatRainfall(weatherStore.rainLast60Min)"
            :icon="CloudRain"
          />
          <MetricTile
            label="Regen 24 uur"
            :value="formatters.formatRainfall(weatherStore.rainLast24Hours)"
            :icon="CloudRain"
          />
          <MetricTile
            label="Regen deze maand"
            :value="formatters.formatRainfall(weatherStore.rainMonth)"
            :icon="CloudRain"
          />
          <MetricTile
            label="Regen dit jaar"
            :value="formatters.formatRainfall(weatherStore.rainYear, 0)"
            :icon="CloudRain"
          />
          <MetricTile
            label="Wind gem. 24u"
            :value="formatters.formatWindSpeed(weatherStore.windSpeedAvg24Hours)"
            :subtitle="beaufortFromKmh(weatherStore.windSpeedAvg24Hours)?.label"
            :icon="Wind"
          />
          <MetricTile
            label="Zwaarste windstoot 24u"
            :value="formatters.formatWindSpeed(weatherStore.windGust24Hours)"
            :icon="Wind"
          />
          <MetricTile
            label="Wind nu"
            :value="formatters.formatWindSpeed(weatherStore.windSpeedNow)"
            :icon="Wind"
          />
          <MetricTile
            label="Gevoelstemperatuur"
            :value="formatters.formatTemperature(weatherStore.windChill)"
            subtitle="wind chill"
            :icon="Thermometer"
          />
          <MetricTile
            label="Hitte-index"
            :value="formatters.formatTemperature(weatherStore.heatIndex)"
            :icon="Thermometer"
          />
          <MetricTile
            v-if="weatherStore.solarRadiation !== null"
            label="Zonnestraling"
            :value="`${formatters.formatNumber(weatherStore.solarRadiation, 0)} W/m²`"
            :icon="Sun"
          />
          <MetricTile
            v-if="weatherStore.indoorTemperature !== null"
            label="Binnentemperatuur"
            :value="formatters.formatTemperature(weatherStore.indoorTemperature)"
            :icon="House"
          />
          <MetricTile
            v-if="weatherStore.indoorHumidity !== null"
            label="Binnenvochtigheid"
            :value="formatters.formatPercentage(weatherStore.indoorHumidity)"
            :icon="House"
          />
        </div>
      </SectionCard>

      <!-- ===== Beachcam ===== -->
      <SectionCard
        title="Live beachcam Zandvoort"
        :icon="Video"
      >
        <BeachcamStream />
      </SectionCard>

      <!-- ===== About ===== -->
      <SectionCard
        title="Over Meteo Zandvoort"
        :icon="Info"
      >
        <div class="about-text">
          <p>
            Deze weergegevens komen rechtstreeks van het weerstation van <strong>Herman Kruiswegt</strong> in
            Zandvoort. Met jarenlange passie voor meteorologie verzamelt en deelt Herman nauwkeurige en actuele
            weerinformatie voor de regio.
          </p>
          <p>
            Naast zijn fascinatie voor het weer runt Herman een professioneel administratiekantoor waar hij ondernemers
            en particulieren ondersteunt met diverse administratieve diensten. Meer informatie vindt u op
            <a
              href="https://decib.nl"
              target="_blank"
              rel="noopener noreferrer"
              >decib.nl</a
            >.
          </p>
        </div>
      </SectionCard>

      <footer class="footer">
        Gemaakt met ❤️ door
        <a
          href="https://maxkruiswegt.com"
          target="_blank"
          rel="noopener noreferrer"
          >Max Kruiswegt</a
        >
      </footer>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stale-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-tile);
  background: rgba(249, 180, 73, 0.12);
  border: 1px solid rgba(249, 180, 73, 0.3);
  color: var(--status-warn);
  font-size: 0.85rem;
}

.center-state {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
  color: var(--accent);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  color: var(--status-error);
}

.retry-button {
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-chip);
  background: var(--accent-strong);
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.retry-button:hover {
  background: var(--accent);
}

.backup-note {
  font-size: 0.8rem;
  color: var(--text-faint);
}

/* ===== Hero ===== */
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem 2.5rem;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 2rem;
}

.hero-temp {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.hero-temp-value {
  font-size: clamp(3.5rem, 9vw, 5.5rem);
  font-weight: 650;
  line-height: 1;
}

.hero-temp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.temp-range {
  color: var(--text-faint);
}

.range-divider {
  margin: 0 0.15rem;
}

.hero-wind {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
}

.wind-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bft-badge {
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-chip);
  font-size: 0.8rem;
  font-weight: 650;
  color: var(--bg);
}

.bft-none {
  background: var(--surface-3);
  color: var(--text-secondary);
}

.bft-calm {
  background: var(--text-faint);
}

.bft-light {
  background: var(--temp--10);
}

.bft-moderate {
  background: var(--temp-0);
}

.bft-strong {
  background: var(--temp-20);
}

.bft-gale {
  background: var(--temp-30);
}

.bft-storm {
  background: var(--temp-40);
}

.wind-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.hero-chips {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.625rem;
}

/* ===== Charts ===== */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.chart-grid > :last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

/* ===== Tiles ===== */
.tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.75rem;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  max-width: 70ch;
}

.footer {
  text-align: center;
  padding: 1rem 0 2rem;
  color: var(--text-faint);
  font-size: 0.85rem;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .chart-grid > :last-child:nth-child(odd) {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .page {
    padding: 1rem 1rem 0;
    gap: 1rem;
  }

  .hero {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    padding: 1.5rem 1.25rem;
  }

  .hero-temp {
    align-items: center;
  }

  .hero-chips {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
