<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { localePath } from '@/i18n';
import AppHeader from '@/components/AppHeader.vue';

// The server answers unknown URLs with the app (200), so this page tells
// people and, through the noindex in its head (seo/site.ts), search engines.
const { t } = useI18n();

// That response carries the home page's static head. @unhead/vue adopts static
// tags only when an entry sets the same tag, and this page sets none of these,
// so they would linger and contradict the noindex (a canonical to the home page).
onMounted(() => {
  document.head
    .querySelectorAll(
      'link[rel="canonical"], link[rel="alternate"][hreflang], meta[name="description"], meta[property^="og:"], meta[name="twitter:card"]'
    )
    .forEach((el) => el.remove());
});
</script>

<template>
  <div class="page">
    <AppHeader
      :title="t('notFound.title')"
      back
    />
    <main class="not-found">
      <p>{{ t('notFound.text') }}</p>
      <RouterLink :to="localePath('home')">{{ t('notFound.home') }}</RouterLink>
    </main>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page {
    padding: 1rem 1rem 1.5rem;
  }
}
</style>
