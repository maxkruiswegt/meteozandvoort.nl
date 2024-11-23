<script setup>
import { ref, onMounted } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import WeatherComponent from '@/components/weather/WeatherComponent.vue';
import WindComponent from '@/components/weather/WindComponent.vue';
import {
  convertFahrenheitToCelsius,
  convertInchesOfMercuryToMillibar,
  convertMphToKmh,
  convertMphToWindScale,
  convertWindDirection,
} from '@/utils/weatherUtils';

const weatherStore = useWeatherStore();

const refresh = ref(false);
const refreshData = async () => {
  refresh.value = true;
  await weatherStore.fetchCurrentWeather();
  await weatherStore.fetchHistoricWeatherForLast24Hours();
  refresh.value = false;
};

onMounted(async () => {
  // Fetch weather data
  await weatherStore.fetchCurrentWeather();
  await weatherStore.fetchHistoricWeatherForLast24Hours();
});

const columns = window.innerWidth > 768 ? 4 : 2;
const weatherComponents = [
  {
    title: 'Temperatuur',
    value: () =>
      convertFahrenheitToCelsius(weatherStore.temperature).toFixed(1),
    unit: '°C',
    icon: 'device_thermostat',
    timespan: 'nu',
  },
  {
    title: 'Gevoelstemp.',
    value: () => convertFahrenheitToCelsius(weatherStore.thwIndex).toFixed(1),
    unit: '°C',
    icon: 'heat',
    timespan: 'nu',
  },
  {
    title: 'Regenintensiteit',
    value: () => weatherStore.rainRateLast.toFixed(1),
    unit: 'mm/u',
    icon: 'umbrella',
    timespan: 'nu',
  },
  {
    title: 'Regenval',
    value: () => weatherStore.rainfallToday.toFixed(1),
    unit: 'mm',
    icon: 'rainy',
    timespan: 'vandaag',
  },
  {
    title: 'Luchtvochtigheid',
    value: () => weatherStore.humidity,
    unit: '%',
    icon: 'water_drop',
    timespan: 'nu',
  },
  {
    title: 'Dauwpunt',
    value: () => convertFahrenheitToCelsius(weatherStore.dewPoint).toFixed(1),
    unit: '°C',
    icon: 'dew_point',
    timespan: 'nu',
  },
  {
    title: 'Luchtdruk',
    value: () =>
      convertInchesOfMercuryToMillibar(weatherStore.barometricPressure).toFixed(
        1
      ),
    unit: 'mb',
    icon: 'compress',
    timespan: 'nu',
  },
  {
    title: 'Luchtdruk Trend',
    value: () =>
      convertInchesOfMercuryToMillibar(weatherStore.barometricTrend).toFixed(1),
    unit: 'mb',
    icon: () =>
      weatherStore.barometricTrend > 0 ? 'trending_up' : 'trending_down',
    timespan: '3 uur',
  },
];
</script>

<template>
  <div class="page-container">
    <div class="home-header">
      <h2>Meteo Zandvoort</h2>
      <p>Welkom op meteozandvoort.nl</p>
    </div>
    <div class="update">
      <div
        class="refresh"
        @click="refreshData"
        :class="{ 'rotate-once': refresh }"
      >
        <span class="material-symbols-outlined">refresh</span>
      </div>
      <small
        >Laatste update:
        {{
          new Date(weatherStore.lastUpdated).toLocaleString([], {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        }}</small
      >
    </div>
    <div
      v-if="weatherStore.isLoading"
      class="loading"
    >
      <span class="material-symbols-outlined">hourglass_empty</span>
      <p>Gegevens laden...</p>
    </div>
    <div
      class="weather"
      v-else-if="
        weatherStore.currentWeatherData && weatherStore.historicWeatherData
      "
    >
      <WindComponent
        class="hidden-element"
        :windNow="{
          force: convertMphToWindScale(weatherStore.windSpeedLast),
          speed: convertMphToKmh(weatherStore.windSpeedLast).toFixed(1),
          direction: {
            name: convertWindDirection(weatherStore.windDirectionLast),
            degrees: weatherStore.windDirectionLast,
          },
        }"
        :windAverage10m="{
          force: convertMphToWindScale(weatherStore.windSpeedAvgLast10Min),
          speed: convertMphToKmh(weatherStore.windSpeedAvgLast10Min).toFixed(1),
          direction: {
            name: convertWindDirection(weatherStore.windDirectionAvgLast10Min),
            degrees: weatherStore.windDirectionAvgLast10Min,
          },
        }"
        :windMax10m="{
          force: convertMphToWindScale(weatherStore.windSpeedHiLast10Min),
          speed: convertMphToKmh(weatherStore.windSpeedHiLast10Min).toFixed(1),
          direction: {
            name: convertWindDirection(weatherStore.windDirectionHiLast10Min),
            degrees: weatherStore.windDirectionHiLast10Min,
          },
        }"
        :windAverage24h="{
          force: convertMphToWindScale(weatherStore.windSpeedAvgLast24Hours),
          speed: convertMphToKmh(weatherStore.windSpeedAvgLast24Hours).toFixed(
            1
          ),
          direction: {
            name: convertWindDirection(
              weatherStore.windDirectionAvgLast24Hours
            ),
            degrees: weatherStore.windDirectionAvgLast24Hours,
          },
        }"
        :windMax24h="{
          force: convertMphToWindScale(weatherStore.windSpeedHiLast24Hours),
          speed: convertMphToKmh(weatherStore.windSpeedHiLast24Hours).toFixed(
            1
          ),
          direction: {
            name: convertWindDirection(weatherStore.windDirectionHiLast24Hours),
            degrees: weatherStore.windDirectionHiLast24Hours,
          },
        }"
      />
      <div class="weather-components">
        <WeatherComponent
          v-for="(component, index) in weatherComponents"
          :key="component.title"
          :title="component.title"
          :value="component.value()"
          :unit="component.unit"
          :icon="
            typeof component.icon === 'function'
              ? component.icon()
              : component.icon
          "
          :timespan="component.timespan"
          :style="{ transitionDelay: `${(index % columns) * 0.2}s` }"
          class="hidden-element"
        />
      </div>
    </div>
    <div
      class="error-wrapper"
      v-else
    >
      <div class="error">
        <span class="material-symbols-outlined">error</span>
        <p>Er ging iets mis bij het ophalen van de data.</p>
      </div>
      <p>
        Bezoek de backup site:
        <a
          href="https://mijneigenweer.nl/Zandvoort"
          target="_blank"
          >mijneigenweer.nl/Zandvoort</a
        >
      </p>
    </div>
    <div class="about">
      <div class="about-header">
        <span class="material-symbols-outlined">info</span>
        <h3>Over Meteo Zandvoort</h3>
      </div>
      <p>
        Deze weergegevens worden rechtstreeks geleverd door het weerstation van
        <strong>Herman Kruiswegt</strong> in Zandvoort. Herman heeft jarenlang
        ervaring in meteorologie en biedt nauwkeurige en actuele weerinformatie
        voor de regio.
      </p>
      <p>
        Naast zijn passie voor meteorologie, biedt Herman ook
        boekhoudingsdiensten aan via zijn website:
        <a
          href="https://decib.nl"
          target="_blank"
          >decib.nl</a
        >.
      </p>
    </div>
    <footer>
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
</template>

<style scoped>
/* Extra Small Devices (Less than 576px) */
.home-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.update {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 1rem 0;
  color: var(--color-text-secondary);
}

.update,
.loading {
  display: flex;
  justify-content: center;
}

.refresh {
  display: flex;
  cursor: pointer;
  color: var(--color-primary);
  transition: filter 0.1s;
}

.refresh:hover {
  filter: brightness(75%);
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 1rem 0;
  color: var(--color-primary);
}

.loading span {
  animation: rotate 1s linear infinite;
}

.error-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #cc0000;
}

.weather {
  width: 100%;
}

.weather-components {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.about {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--color-tertiary);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

  .about-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;

  p {
    padding: 0.5rem;
    background-color: var(--color-tertiary);
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.rotate-once {
  animation: rotate 1s ease-in-out;
}

/* Small Devices */
@media screen and (min-width: 576px) {
  .weather-components {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Medium Devices */
@media screen and (min-width: 768px) {
  .weather-components {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Large Devices */
@media screen and (min-width: 992px) {
}

/* Extra Large Devices */
@media screen and (min-width: 1200px) {
}

/* Extra Extra Large Devices */
@media screen and (min-width: 1600px) {
}

/* Very Large Devices */
@media screen and (min-width: 2560px) {
}
</style>
