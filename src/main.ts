import '@fontsource-variable/archivo';
import '@/assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

import VueApexCharts from 'vue3-apexcharts';
import { createHead } from '@unhead/vue/client';

import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import { TERMS } from './i18n/terms';

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
    colorScheme: {
      light: {
        // Aura's light default is primary.500 with white text: coral at 3.1:1.
        // primary.600 carries white text at 5.1:1.
        primary: {
          color: '{primary.600}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        // Sand neutrals matching the warm-paper tokens in main.css
        surface: {
          0: '#fefdfa',
          50: '#f6f3ee',
          100: '#f1ede6',
          200: '#e2ded5',
          300: '#cbc6bc',
          400: '#8a867c',
          500: '#5d6471',
          600: '#4a5362',
          700: '#2e3644',
          800: '#1b2331',
          900: '#121a2a',
          950: '#0a0f1a',
        },
      },
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
      // Same switch as the tokens in main.css (set by index.html / useTheme).
      darkModeSelector: "[data-theme='dark']",
    },
  },
  // Swapped per language by App.vue; Dutch until the router has resolved.
  locale: structuredClone(TERMS.nl.primevue),
});
app.use(VueApexCharts);
app.use(i18n);
app.use(createHead());

app.mount('#app');
