import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@/assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

import VueApexCharts from 'vue3-apexcharts';

import App from './App.vue';
import router from './router';

// Brand red as PrimeVue primary, so buttons/focus states follow the accent
// without CSS overrides.
const MeteoPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fef2f0',
      100: '#fee5e0',
      200: '#fccfc7',
      300: '#fab0a0',
      400: '#f68369',
      500: '#ec6a57',
      600: '#be4535',
      700: '#a03628',
      800: '#852e24',
      900: '#702923',
      950: '#4a1c17',
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: MeteoPreset,
    options: {
      // Site is dark-only; <html class="dark"> is set in index.html.
      darkModeSelector: '.dark',
    },
  },
});
app.use(VueApexCharts);

app.mount('#app');
