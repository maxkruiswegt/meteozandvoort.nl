<script setup>
import { ref, onMounted } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import WeatherComponent from '@/components/weather/WeatherComponent.vue';
import WindComponent from '@/components/weather/WindComponent.vue';

const weatherStore = useWeatherStore();

const convertWindDirection = (degrees) => {
  const directions = ['Noord', 'Noordoost', 'Oost', 'Zuidoost', 'Zuid', 'Zuidwest', 'West', 'Noordwest'];
  return directions[Math.round(degrees / 45) % 8];
};

const convertFahrenheitToCelsius = (fahrenheit) => {
  return ((fahrenheit - 32) * 5) / 9;
};

const convertMphToKmh = (mph) => {
  return mph * 1.609344;
};

const convertMphToWindScale = (mph) => {
  switch (true) {
    case mph < 1:
      return { value: 0, description: 'stil' };
    case mph < 4:
      return { value: 1, description: 'licht' };
    case mph < 8:
      return { value: 2, description: 'licht' };
    case mph < 13:
      return { value: 3, description: 'matig' };
    case mph < 19:
      return { value: 4, description: 'matig' };
    case mph < 25:
      return { value: 5, description: 'vrij krachtig' };
    case mph < 32:
      return { value: 6, description: 'krachtig' };
    case mph < 39:
      return { value: 7, description: 'hard' };
    case mph < 47:
      return { value: 8, description: 'stormachtig' };
    case mph < 55:
      return { value: 9, description: 'storm' };
    case mph < 64:
      return { value: 10, description: 'zware storm' };
    case mph < 73:
      return { value: 11, description: 'zeer zware storm' };
    default:
      return { value: 12, description: 'orkaan' };
  }
};

const convertInchesOfMercuryToMillibar = (inches) => {
  return inches * 33.8639;
};

const refresh = ref(false);
const refreshData = async () => {
  refresh.value = true;
  await weatherStore.fetchCurrentWeather();
  await weatherStore.fetchHistoricWeatherForLast24Hours();
  refresh.value = false;
  observeElements();
};

const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      handleIntersection(entry, observer);
    });
  });

  const hiddenElements = document.querySelectorAll('.hidden-element');
  hiddenElements.forEach((element) => {
    observer.observe(element);
  });

  function handleIntersection(entry, observer) {
    if (entry.isIntersecting) {
      entry.target.classList.add('show-element');
      entry.target.classList.remove('hidden-element');
      observer.unobserve(entry.target);
    }
  }
};

onMounted(async () => {
  // Fetch weather data
  await weatherStore.fetchCurrentWeather();
  await weatherStore.fetchHistoricWeatherForLast24Hours();
  observeElements();
});

const columns = window.innerWidth > 768 ? 4 : 2;
const weatherComponents = [
  { title: 'Temperatuur', value: () => convertFahrenheitToCelsius(weatherStore.temperature).toFixed(1), unit: '°C', icon: 'device_thermostat', timespan: 'nu' },
  { title: 'Gevoelstemp.', value: () => convertFahrenheitToCelsius(weatherStore.thwIndex).toFixed(1), unit: '°C', icon: 'heat', timespan: 'nu' },
  { title: 'Regenintensiteit', value: () => weatherStore.rainRateLast.toFixed(1), unit: 'mm/u', icon: 'umbrella', timespan: 'nu' },
  { title: 'Regenval', value: () => weatherStore.rainfallToday.toFixed(1), unit: 'mm', icon: 'rainy', timespan: 'vandaag' },
  { title: 'Luchtvochtigheid', value: () => weatherStore.humidity, unit: '%', icon: 'water_drop', timespan: 'nu' },
  { title: 'Dauwpunt', value: () => convertFahrenheitToCelsius(weatherStore.dewPoint).toFixed(1), unit: '°C', icon: 'dew_point', timespan: 'nu' },
  { title: 'Luchtdruk', value: () => convertInchesOfMercuryToMillibar(weatherStore.barometricPressure).toFixed(1), unit: 'mb', icon: 'compress', timespan: 'nu' },
  { title: 'Luchtdruk Trend', value: () => convertInchesOfMercuryToMillibar(weatherStore.barometricTrend).toFixed(1), unit: 'mb', icon: () => weatherStore.barometricTrend > 0 ? 'trending_up' : 'trending_down', timespan: '3 uur' },
];
</script>

<template>
  <div class="home">
    <h2>Meteo Zandvoort</h2>
    <p>Welkom op meteozandvoort.nl</p>
    <div class="update">
      <div class="refresh" @click="refreshData" :class="{ 'rotate-once': refresh }">
        <span class="material-symbols-outlined">refresh</span>
      </div>
      <small>Laatste update: {{ new Date(weatherStore.lastUpdated).toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) }}</small>
    </div>
    <div v-if="weatherStore.isLoading" class="loading">
      <span class="material-symbols-outlined">hourglass_empty</span>
      <p>Gegevens laden...</p>
    </div>
    <div class="weather" v-else-if="weatherStore.currentWeatherData && weatherStore.historicWeatherData">
      <WindComponent class="hidden-element" :windNow="{
        force: convertMphToWindScale(weatherStore.windSpeedLast),
        speed: convertMphToKmh(weatherStore.windSpeedLast).toFixed(1),
        direction: {
          name: convertWindDirection(weatherStore.windDirectionLast),
          degrees: weatherStore.windDirectionLast
        }
      }" :windAverage10m="{
        force: convertMphToWindScale(weatherStore.windSpeedAvgLast10Min),
        speed: convertMphToKmh(weatherStore.windSpeedAvgLast10Min).toFixed(1),
        direction: {
          name: convertWindDirection(weatherStore.windDirectionAvgLast10Min),
          degrees: weatherStore.windDirectionAvgLast10Min
        }
      }" :windMax10m="{
        force: convertMphToWindScale(weatherStore.windSpeedHiLast10Min),
        speed: convertMphToKmh(weatherStore.windSpeedHiLast10Min).toFixed(1),
        direction: {
          name: convertWindDirection(weatherStore.windDirectionHiLast10Min),
          degrees: weatherStore.windDirectionHiLast10Min
        }
      }" :windAverage24h="{
        force: convertMphToWindScale(weatherStore.windSpeedAvgLast24Hours),
        speed: convertMphToKmh(weatherStore.windSpeedAvgLast24Hours).toFixed(1),
        direction: {
          name: convertWindDirection(weatherStore.windDirectionAvgLast24Hours),
          degrees: weatherStore.windDirectionAvgLast24Hours
        }
      }" :windMax24h="{
        force: convertMphToWindScale(weatherStore.windSpeedHiLast24Hours),
        speed: convertMphToKmh(weatherStore.windSpeedHiLast24Hours).toFixed(1),
        direction: {
          name: convertWindDirection(weatherStore.windDirectionHiLast24Hours),
          degrees: weatherStore.windDirectionHiLast24Hours
        }
      }" />
      <div class="weather-components">
        <WeatherComponent v-for="(component, index) in weatherComponents" :key="component.title"
          :title="component.title" :value="component.value()" :unit="component.unit"
          :icon="typeof component.icon === 'function' ? component.icon() : component.icon"
          :timespan="component.timespan" :style="{ transitionDelay: `${(index % columns) * 0.2}s` }"
          class="hidden-element" />
      </div>
    </div>
    <div class="error" v-else>
      <span class="material-symbols-outlined">error</span>
      <p>Er ging iets mis bij het ophalen van de data.</p>
    </div>
    <footer>
      <p>Gemaakt met ❤️ door <a href="https://maxkruiswegt.com" target="_blank">Max Kruiswegt</a></p>
    </footer>
  </div>
</template>

<style scoped>
footer {
  margin-top: 1rem;
}

.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.weather-components {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.update {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 1rem 0;
  color: var(--color-text-secondary);
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

.error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 1rem 0;
  color: #cc0000;
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

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  .home {
    padding: 1.5rem;
  }

  .weather {
    width: 100%;
  }

  .weather-components {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>