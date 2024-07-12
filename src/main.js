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

weatherStore
  .fetchCurrentWeather()
  .then(() => {
    app.mount('#app');
  })
  .catch((error) => {
    console.error(error);
    app.mount('#app');
  });
