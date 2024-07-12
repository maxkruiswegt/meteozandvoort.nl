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
      <WeatherComponent title="Temperatuur" :value="convertFahrenheitToCelsius(weatherStore.temperature).toFixed(1)"
        unit="°C" icon="device_thermostat" timespan="nu" />
      <WeatherComponent title="Gevoelstemperatuur" :value="convertFahrenheitToCelsius(weatherStore.thwIndex).toFixed(1)"
        unit="°C" icon="heat" timespan="nu" />
      <WeatherComponent title="Regenintensiteit" :value="weatherStore.rainRateLast.toFixed(1)" unit="mm/u"
        icon="umbrella" timespan="nu" />
      <WeatherComponent title="Regenval" :value="weatherStore.rainfallToday.toFixed(1)" unit="mm" icon="rainy"
        timespan="vandaag" />
      <WeatherComponent title="Luchtvochtigheid" :value="weatherStore.humidity" unit="%" icon="water_drop"
        timespan="nu" />
      <WeatherComponent title="Dauwpunt" :value="convertFahrenheitToCelsius(weatherStore.dewPoint).toFixed(1)" unit="°C"
        icon="dew_point" timespan="nu" />
      <WeatherComponent title="Luchtdruk"
        :value="convertInchesOfMercuryToMillibar(weatherStore.barometricPressure).toFixed(1)" unit="mb" icon="compress"
        timespan="nu" />
      <WeatherComponent title="Luchtdruk Trend"
        :value="convertInchesOfMercuryToMillibar(weatherStore.barometricTrend).toFixed(1)" unit="mb"
        :icon="weatherStore.barometricTrend > 0 ? 'trending_up' : 'trending_down'" timespan="3 uur" />
      <WeatherComponent title="Wind" :value="convertMphToKmh(weatherStore.windSpeedLast).toFixed(1)" unit="km/h"
        icon="air" timespan="nu" />
      <WeatherComponent title="Wind" :value="convertMphToKmh(weatherStore.windSpeedAvgLast10Min).toFixed(1)" unit="km/h"
        icon="air" timespan="gem. 10m" />
      <WeatherComponent title="Wind" :value="convertMphToKmh(weatherStore.windSpeedHiLast10Min).toFixed(1)" unit="km/h"
        icon="air" timespan="hoogste 10m" />
      <WeatherComponent title="Windrichting" :value="convertWindDirection(weatherStore.windDirectionLast)" unit=""
        icon="explore" timespan="nu" />
      <WeatherComponent title="Windrichting" :value="convertWindDirection(weatherStore.windDirectionAvgLast10Min)"
        unit="" icon="explore" timespan="gem. 10m" />
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