<script setup>
import { ref, onMounted } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import WeatherComponent from '@/components/weather/WeatherComponent.vue';

const weatherStore = useWeatherStore();

onMounted(async () => {
  await weatherStore.fetchCurrentWeather();
});

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

const convertInchesOfMercuryToMillibar = (inches) => {
  return inches * 33.8639;
};
const refresh = ref(false);
const refreshData = async () => {
  refresh.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  refresh.value = false;
  await weatherStore.fetchCurrentWeather();
};
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
      <WeatherComponent title="Temperatuur (nu)"
        :value="convertFahrenheitToCelsius(weatherStore.temperature).toFixed(1)" unit="°C" icon="device_thermostat" />
      <WeatherComponent title="Gevoelstemperatuur (nu)"
        :value="convertFahrenheitToCelsius(weatherStore.heatIndex).toFixed(1)" unit="°C" icon="heat" />
      <WeatherComponent title="Regenintensiteit (nu)" :value="weatherStore.rainRateLast.toFixed(1)" unit="mm/u"
        icon="umbrella" />
      <WeatherComponent title="Regenval (vandaag)" :value="weatherStore.rainfallToday.toFixed(1)" unit="mm"
        icon="rainy" />
      <WeatherComponent title="Luchtvochtigheid (nu)" :value="weatherStore.humidity" unit="%" icon="water_drop" />
      <WeatherComponent title="Dauwpunt (nu)" :value="convertFahrenheitToCelsius(weatherStore.dewPoint).toFixed(1)"
        unit="°C" icon="dew_point" />
      <WeatherComponent title="Luchtdruk (nu)"
        :value="convertInchesOfMercuryToMillibar(weatherStore.barometricPressure).toFixed(1)" unit="mb"
        icon="compress" />
      <WeatherComponent title="Luchtdruk (trend)"
        :value="convertInchesOfMercuryToMillibar(weatherStore.barometricTrend).toFixed(1)" unit="mb"
        :icon="weatherStore.barometricTrend > 0 ? 'trending_up' : 'trending_down'" />
      <WeatherComponent title="Wind (nu)" :value="convertMphToKmh(weatherStore.windSpeedLast).toFixed(1)" unit="km/h"
        icon="air" />
      <WeatherComponent title="Wind (gem. 10m)" :value="convertMphToKmh(weatherStore.windSpeedAvgLast10Min).toFixed(1)"
        unit="km/h" icon="air" />
      <WeatherComponent title="Wind (hoogste 10m)"
        :value="convertMphToKmh(weatherStore.windSpeedHiLast10Min).toFixed(1)" unit="km/h" icon="air" />
      <WeatherComponent title="Windrichting (nu)" :value="convertWindDirection(weatherStore.windDirectionLast)" unit=""
        icon="explore" />
      <WeatherComponent title="Windrichting (gem. 10m)"
        :value="convertWindDirection(weatherStore.windDirectionAvgLast10Min)" unit="" icon="explore" />
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
  color: #666;
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