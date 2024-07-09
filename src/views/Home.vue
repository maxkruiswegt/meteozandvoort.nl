<script setup>
import { onMounted } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';

const WeatherStore = useWeatherStore();

onMounted(async () => {
  await WeatherStore.fetchCurrentWeather();
});
</script>

<template>
  <div class="home">
    <h1>Meteo Zandvoort</h1>
    <p>Welkom op meteozandvoort.nl</p>
    <h4 class="temperature">
      <span class="material-symbols-outlined">device_thermostat</span>
      Temperatuur: {{ WeatherStore.currentTemperature }} °C
    </h4>
    <h4 class="humidity">
      <span class="material-symbols-outlined">water_drop</span>
      Luchtvochtigheid: {{ WeatherStore.currentHumidity }}%
    </h4>
    <h4 class="wind">
      <span class="material-symbols-outlined">air</span>
      Wind: {{ WeatherStore.currentWindSpeed }} km/h
    </h4>
    <small class="update">Laatste update: {{ new Date(WeatherStore.lastUpdated).toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) }}</small>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

.temperature,
.humidity,
.wind {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.update {
  display: block;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #666;
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  .home {
    padding: 1.5rem;
  }
}
</style>