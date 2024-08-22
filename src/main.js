import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useWeatherStore } from './stores/WeatherStore';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const weatherStore = useWeatherStore();

const currentWeatherPromise = weatherStore.fetchCurrentWeather();
const now = Math.floor(Date.now() / 1000); // current unix time
const twentyFourHoursAgo = now - 24 * 60 * 60; // unix time 24 hours ago
const historicWeatherPromise = weatherStore.fetchHistoricWeather(
  twentyFourHoursAgo,
  now
);

Promise.all([currentWeatherPromise, historicWeatherPromise])
  .then(() => {
    app.mount('#app');
  })
  .catch((error) => {
    console.error(error);
    app.mount('#app');
  });
