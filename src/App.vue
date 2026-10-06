<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import { usePrimeVue } from 'primevue/config';
import IsobarBackdrop from '@/components/IsobarBackdrop.vue';
import { buildHead } from '@/seo/site';
import { currentTerms } from '@/i18n';

const route = useRoute();

// The same head the build writes into each page's static HTML, kept in step
// while the app navigates. Nothing is pushed before the first route resolves,
// so the static head is never briefly replaced.
useHead(
  computed(() => (route.matched.length > 0 ? buildHead(route.meta.page, route.meta.locale) : {}))
);

// PrimeVue's locale is reactive config: swapping it re-renders the calendar
// and paginator labels.
const primevue = usePrimeVue();
watch(
  currentTerms,
  (terms) => {
    const locale = primevue.config.locale;
    if (!locale) return;
    const { aria, ...rest } = terms.primevue;
    Object.assign(locale, rest);
    locale.aria = { ...locale.aria, ...aria };
  },
  { immediate: true }
);
</script>

<template>
  <IsobarBackdrop />
  <RouterView />
</template>
