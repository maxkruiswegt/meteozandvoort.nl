<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  Sun,
  Sunrise,
  Sunset,
  Video,
  Info,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  LoaderCircle,
  TriangleAlert,
} from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import { useWeatherCharts } from '@/composables/useWeatherCharts';
import { currentLocale, currentTerms } from '@/i18n';
import { beaufortFromKmh, compassPoint8, temperatureColorVar } from '@/utils/weather';
import AppHeader from '@/components/AppHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import StatChip from '@/components/StatChip.vue';
import WindCompass from '@/components/WindCompass.vue';
import WeatherChart from '@/components/WeatherChart.vue';
import BeachcamStream from '@/components/BeachcamStream.vue';

const weatherStore = useWeatherStore();
const formatters = useFormatters();
const charts = useWeatherCharts();
const { t } = useI18n();

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

// "zwakke wind uit het noordwesten" / "light breeze from the north-west"; calm
// has no direction worth naming.
const windSummary = computed(() => {
  const force = beaufort.value;
  if (force === null) return '–';
  const forceName = currentTerms.value.beaufort[force];
  const point = compassPoint8(weatherStore.windDirectionAvg10Min);
  if (force === 0 || point === null) return forceName;
  return t('home.windFrom', { force: forceName, direction: currentTerms.value.from8[point] });
});

const windAvg24hName = computed(() => {
  const force = beaufortFromKmh(weatherStore.windSpeedAvg24Hours);
  return force === null ? null : currentTerms.value.beaufort[force];
});

const bftBandClass = computed(() => {
  const bft = beaufort.value;
  if (bft === null) return 'bft-none';
  if (bft <= 1) return 'bft-calm';
  if (bft <= 3) return 'bft-light';
  if (bft <= 5) return 'bft-moderate';
  if (bft <= 7) return 'bft-strong';
  if (bft <= 9) return 'bft-gale';
  return 'bft-storm';
});

const pressureTrendIcon = computed(() => {
  switch (weatherStore.pressureTrendDirection) {
    case 'rising':
      return ArrowUpRight;
    case 'falling':
      return ArrowDownRight;
    case 'steady':
      return ArrowRight;
    default:
      return Gauge;
  }
});

// --- charts ---
const temperatureChart = computed(() => charts.temperatureChart(weatherStore.historicIss));
const windChart = computed(() => charts.windChart(weatherStore.historicIss));
const rainChart = computed(() => charts.rainChart(weatherStore.historicIss));
const pressureChart = computed(() => charts.pressureChart(weatherStore.historicBarometer));
const humidityChart = computed(() => charts.humidityChart(weatherStore.historicIss));
const sunTimes = computed(() => charts.sunTimes(weatherStore.historicIss));
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
      {{ t('home.staleBanner') }}
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
      <p>{{ t('home.loading') }}</p>
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
      <p>{{ t('home.error') }}</p>
      <button
        type="button"
        class="retry-button"
        @click="weatherStore.fetchAll()"
      >
        {{ t('home.retry') }}
      </button>
      <i18n-t
        keypath="home.backup"
        tag="p"
        scope="global"
        class="backup-note"
      >
        <template #link>
          <a
            href="https://mijneigenweer.nl/Zandvoort"
            target="_blank"
            rel="noopener noreferrer"
            >mijneigenweer.nl/Zandvoort</a
          >
        </template>
      </i18n-t>
    </div>

    <template v-else>
      <!-- ===== Hero ===== -->
      <section
        class="hero"
        :aria-label="t('home.currentConditions')"
      >
        <div class="hero-temp">
          <div
            class="hero-temp-value num"
            :style="{ color: tempColor }"
          >
            {{ formatters.formatTemperature(weatherStore.temperature) }}
          </div>
          <div class="hero-temp-meta">
            <span>{{ t('home.feelsLike', { temp: formatters.formatTemperature(weatherStore.feelsLike) }) }}</span>
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
            :sub-label="t('home.gusts', { speed: formatters.formatWindSpeed(weatherStore.windGust10Min) })"
          />
          <div class="wind-meta">
            <span
              class="bft-badge num"
              :class="bftBandClass"
            >
              {{ beaufort ?? '–' }} Bft
            </span>
            <span class="wind-desc">{{ windSummary }}</span>
          </div>
        </div>

        <div class="hero-chips">
          <StatChip
            :label="t('home.chips.pressure')"
            :value="formatters.formatPressure(weatherStore.pressure)"
            :icon="pressureTrendIcon"
            icon-color="var(--data-pressure)"
          />
          <StatChip
            :label="t('home.chips.humidity')"
            :value="formatters.formatPercentage(weatherStore.humidity)"
            :icon="Droplets"
            icon-color="var(--data-humidity)"
          />
          <StatChip
            :label="t('home.chips.dewPoint')"
            :value="formatters.formatTemperature(weatherStore.dewPoint)"
            :icon="Thermometer"
            icon-color="var(--data-dewpoint)"
          />
          <StatChip
            :label="weatherStore.isRaining ? t('home.chips.rainTodayRaining') : t('home.chips.rainToday')"
            :value="formatters.formatRainfall(weatherStore.rainToday)"
            :icon="CloudRain"
            icon-color="var(--data-rain)"
          />
          <StatChip
            v-if="sunTimes.sunrise"
            :label="t('home.chips.sunrise')"
            :value="sunTimes.sunrise"
            :icon="Sunrise"
            icon-color="var(--data-gust)"
          />
          <StatChip
            v-if="sunTimes.sunset"
            :label="t('home.chips.sunset')"
            :value="sunTimes.sunset"
            :icon="Sunset"
            icon-color="var(--data-pressure)"
          />
          <StatChip
            v-if="weatherStore.uvIndex !== null"
            :label="t('home.chips.uv')"
            :value="formatters.formatNumber(weatherStore.uvIndex, 0)"
            :icon="Sun"
            icon-color="var(--data-gust)"
          />
        </div>
      </section>

      <!-- ===== Charts ===== -->
      <div class="chart-grid">
        <SectionCard
          :title="t('home.charts.temperature')"
          :icon="Thermometer"
          flush
        >
          <WeatherChart v-bind="temperatureChart" />
        </SectionCard>
        <SectionCard
          :title="t('home.charts.humidity')"
          :icon="Droplets"
          flush
        >
          <WeatherChart v-bind="humidityChart" />
        </SectionCard>
        <SectionCard
          :title="t('home.charts.rain')"
          :icon="CloudRain"
          flush
        >
          <WeatherChart v-bind="rainChart" />
        </SectionCard>
        <SectionCard
          :title="t('home.charts.pressure')"
          :icon="Gauge"
          flush
        >
          <WeatherChart v-bind="pressureChart" />
        </SectionCard>
        <SectionCard
          :title="t('home.charts.wind')"
          :icon="Wind"
          flush
        >
          <WeatherChart v-bind="windChart" />
        </SectionCard>
      </div>

      <!-- ===== Details ===== -->
      <SectionCard
        :title="t('home.details.title')"
        :icon="Info"
      >
        <dl class="detail-list">
          <div class="detail-row">
            <dt>{{ t('home.details.windNow') }}</dt>
            <dd class="num">{{ formatters.formatWindSpeed(weatherStore.windSpeedNow) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.windAvg24h') }}</dt>
            <dd class="num">
              {{ formatters.formatWindSpeed(weatherStore.windSpeedAvg24Hours) }}
              <span class="hint">{{ windAvg24hName }}</span>
            </dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.gustMax24h') }}</dt>
            <dd class="num">{{ formatters.formatWindSpeed(weatherStore.windGust24Hours) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.rainRate') }}</dt>
            <dd class="num">{{ formatters.formatRainRate(weatherStore.rainRateNow) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.rainLastHour') }}</dt>
            <dd class="num">{{ formatters.formatRainfall(weatherStore.rainLast60Min) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.rain24h') }}</dt>
            <dd class="num">{{ formatters.formatRainfall(weatherStore.rainLast24Hours) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.rainMonth') }}</dt>
            <dd class="num">{{ formatters.formatRainfall(weatherStore.rainMonth) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.rainYear') }}</dt>
            <dd class="num">{{ formatters.formatRainfall(weatherStore.rainYear, 0) }}</dd>
          </div>
          <div class="detail-row">
            <dt>
              {{ t('home.details.windChill') }}
              <span
                v-if="t('home.details.windChillHint')"
                class="hint"
                lang="en"
                >{{ t('home.details.windChillHint') }}</span
              >
            </dt>
            <dd class="num">{{ formatters.formatTemperature(weatherStore.windChill) }}</dd>
          </div>
          <div class="detail-row">
            <dt>{{ t('home.details.heatIndex') }}</dt>
            <dd class="num">{{ formatters.formatTemperature(weatherStore.heatIndex) }}</dd>
          </div>
          <div
            v-if="weatherStore.solarRadiation !== null"
            class="detail-row"
          >
            <dt>{{ t('home.details.solarRadiation') }}</dt>
            <dd class="num">{{ formatters.formatNumber(weatherStore.solarRadiation, 0) }} W/m²</dd>
          </div>
          <div
            v-if="weatherStore.indoorTemperature !== null"
            class="detail-row"
          >
            <dt>{{ t('home.details.indoorTemperature') }}</dt>
            <dd class="num">{{ formatters.formatTemperature(weatherStore.indoorTemperature) }}</dd>
          </div>
          <div
            v-if="weatherStore.indoorHumidity !== null"
            class="detail-row"
          >
            <dt>{{ t('home.details.indoorHumidity') }}</dt>
            <dd class="num">{{ formatters.formatPercentage(weatherStore.indoorHumidity) }}</dd>
          </div>
        </dl>
      </SectionCard>

      <!-- ===== Beachcam ===== -->
      <SectionCard
        :title="t('home.beachcam')"
        :icon="Video"
      >
        <!-- Keyed by language: video.js fixes its control labels at creation -->
        <BeachcamStream :key="currentLocale" />
      </SectionCard>

      <footer class="footer">
        <p>{{ t('home.footer.station') }}</p>
        <!-- Legend for IsobarBackdrop; hidden wherever the backdrop is -->
        <p class="isobar-note">
          <svg
            class="isobar-swatch"
            viewBox="0 0 18 10"
            aria-hidden="true"
          >
            <path d="M1 4.5 Q9 0.5 17 2.5" />
            <path d="M1 9 Q9 5 17 7" />
          </svg>
          {{ t('home.footer.isobars') }}
        </p>
        <i18n-t
          keypath="home.footer.credits"
          tag="p"
          scope="global"
        >
          <template #station>
            <a
              href="https://decib.nl"
              target="_blank"
              rel="noopener noreferrer"
              >Herman Kruiswegt</a
            >
          </template>
          <template #site>
            <a
              href="https://maxkruiswegt.com"
              target="_blank"
              rel="noopener noreferrer"
              >Max Kruiswegt</a
            >
          </template>
        </i18n-t>
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
  /* Opaque base: the translucent tint alone lets backdrop lines through */
  background: linear-gradient(var(--status-warn-soft), var(--status-warn-soft)) var(--bg);
  border: 1px solid var(--status-warn-border);
  color: var(--status-warn-text);
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

/* When badge and description don't fit on one line, the description drops
   under the badge as a whole, centred under the compass, instead of
   squeezing the badge. */
.wind-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem 0.5rem;
  text-align: center;
}

.bft-badge {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-chip);
  font-size: 0.8rem;
  font-weight: 650;
  color: var(--on-data-fill);
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
  /* temp-20 in dark; temp-25 in light, where white on temp-20 is only 4.1:1 */
  background: var(--bft-strong-fill);
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

/* ===== Details list ===== */
.detail-list {
  display: grid;
  /* min(): never wider than the card, or narrow screens clip the values */
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  column-gap: 2.5rem;
  margin: 0;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.detail-row dt {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.detail-row dd {
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: baseline;
  column-gap: 0.35rem;
  font-size: 0.95rem;
  font-weight: 550;
  text-align: right;
}

.hint {
  color: var(--text-faint);
  font-size: 0.75rem;
  font-weight: 400;
}

.footer {
  text-align: center;
  padding: 1rem 0 2rem;
  color: var(--text-faint);
  font-size: 0.8rem;
}

/* Balanced wrapping for the whole centred block: even lines, no lone
   last word ("minuut.") on phones. */
.footer p {
  margin: 0.15rem 0;
  text-wrap: balance;
}

.footer .isobar-note {
  max-width: 88ch;
  margin-inline: auto;
}

.isobar-swatch {
  display: inline-block;
  width: 18px;
  height: 10px;
  margin-right: 0.3rem;
  vertical-align: baseline;
  fill: none;
  stroke: var(--isobar-ink);
  stroke-width: 1.25;
}

@media (forced-colors: active), (prefers-contrast: more), print {
  .isobar-note {
    display: none;
  }
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
    padding: 1.5rem 1.25rem;
  }

  .hero-wind {
    align-items: center;
  }

  .hero-chips {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
