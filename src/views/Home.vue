<script setup>
import { ref, onMounted } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import WeatherComponent from '@/components/weather/WeatherComponent.vue';

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
      return '0 - stil';
    case mph < 4:
      return '1 - zwak';
    case mph < 8:
      return '2 - zwak';
    case mph < 13:
      return '3 - matig';
    case mph < 19:
      return '4 - matig';
    case mph < 25:
      return '5 - vrij krachtig';
    case mph < 32:
      return '6 - krachtig';
    case mph < 39:
      return '7 - hard';
    case mph < 47:
      return '8 - stormachtig';
    case mph < 55:
      return '9 - storm';
    case mph < 64:
      return '10 - zware storm';
    case mph < 73:
      return '11 - zeer zware storm';
    default:
      return '12 - orkaan';
  }
};

const convertInchesOfMercuryToMillibar = (inches) => {
  return inches * 33.8639;
};

const refresh = ref(false);
const refreshData = async () => {
  refresh.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  refresh.value = false;
  await weatherStore.fetchCurrentWeather();
  await weatherStore.fetchHistoricWeatherForLast24Hours();
};

onMounted(() => {
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
  { title: 'Windkracht', value: () => convertMphToWindScale(weatherStore.windSpeedLast), icon: 'air', timespan: 'nu' },
  { title: 'Windkracht', value: () => convertMphToWindScale(weatherStore.windSpeedAvgLast10Min), icon: 'air', timespan: 'gem. 10m' },
  { title: 'Windkracht', value: () => convertMphToWindScale(weatherStore.windSpeedAvgLast24Hours), icon: 'air', timespan: 'gem. 24u' },
  { title: 'Windkracht', value: () => convertMphToWindScale(weatherStore.windSpeedHiLast10Min), icon: 'air', timespan: 'hoogste 10m' },
  { title: 'Windkracht', value: () => convertMphToWindScale(weatherStore.windSpeedHiLast24Hours), icon: 'air', timespan: 'hoogste 24u' },
  { title: 'Wind', value: () => convertMphToKmh(weatherStore.windSpeedLast).toFixed(1), unit: 'km/u', icon: 'air', timespan: 'nu' },
  { title: 'Wind', value: () => convertMphToKmh(weatherStore.windSpeedAvgLast10Min).toFixed(1), unit: 'km/u', icon: 'air', timespan: 'gem. 10m' },
  { title: 'Wind', value: () => convertMphToKmh(weatherStore.windSpeedAvgLast24Hours).toFixed(1), unit: 'km/u', icon: 'air', timespan: 'gem. 24u' },
  { title: 'Wind', value: () => convertMphToKmh(weatherStore.windSpeedHiLast10Min).toFixed(1), unit: 'km/u', icon: 'air', timespan: 'hoogste 10m' },
  { title: 'Wind', value: () => convertMphToKmh(weatherStore.windSpeedHiLast24Hours).toFixed(1), unit: 'km/u', icon: 'air', timespan: 'hoogste 24u' },
  { title: 'Windrichting', value: () => convertWindDirection(weatherStore.windDirectionLast), icon: 'explore', timespan: 'nu' },
  { title: 'Windrichting', value: () => convertWindDirection(weatherStore.windDirectionAvgLast10Min), unit: '', icon: 'explore', timespan: 'gem. 10m' },
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
    <div v-if="weatherStore.currentWeatherData" class="weather-components">
      <WeatherComponent v-for="(component, index) in weatherComponents" :key="component.title" :title="component.title"
        :value="component.value()" :unit="component.unit"
        :icon="typeof component.icon === 'function' ? component.icon() : component.icon" :timespan="component.timespan"
        :style="{ transitionDelay: `${(index % columns) * 0.2}s` }" class="hidden-element" />
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.weather-components {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1rem 0;
  width: 100%;
}

.update {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  color: var(--color-text-secondary);
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

  .weather-components {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>