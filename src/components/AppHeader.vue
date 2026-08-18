<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { RefreshCw, ArrowLeft } from '@lucide/vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps<{
  title?: string;
  /** Show a back-to-home link instead of the section nav. */
  back?: boolean;
}>();

const weatherStore = useWeatherStore();
const formatters = useFormatters();

// Relative/clock labels depend on wall time, which isn't reactive by itself;
// tick every 30s so the label stays honest between fetches.
const tick = ref(0);
let tickTimer: number | undefined;
onMounted(() => {
  tickTimer = window.setInterval(() => {
    tick.value += 1;
  }, 30_000);
});
onUnmounted(() => window.clearInterval(tickTimer));

const statusLabel = computed(() => {
  void tick.value;
  if (weatherStore.error && !weatherStore.currentWeatherData) return 'geen verbinding';
  const observed = weatherStore.observationTime;
  if (!observed) return 'laden…';
  if (weatherStore.isStale) return `laatste meting ${formatters.formatRelativeTime(observed)}`;
  return `gemeten om ${formatters.formatTime(observed)}`;
});

const statusKind = computed<'ok' | 'warn' | 'error'>(() => {
  if (weatherStore.error) return 'error';
  if (weatherStore.isStale) return 'warn';
  return 'ok';
});

const refresh = () => {
  void weatherStore.fetchAll();
};
</script>

<template>
  <header
    class="app-header"
    :class="{ masthead: !props.back }"
  >
    <div class="header-title">
      <RouterLink
        v-if="props.back"
        to="/"
        class="back-link"
        aria-label="Terug naar overzicht"
      >
        <ArrowLeft :size="18" />
      </RouterLink>
      <div>
        <h1>{{ props.title ?? 'Meteo Zandvoort' }}</h1>
        <p
          v-if="!props.back"
          class="status-line"
        >
          <span
            class="status-dot"
            :class="`status-${statusKind}`"
            aria-hidden="true"
          />
          {{ statusLabel }}
        </p>
      </div>
    </div>

    <nav class="header-nav">
      <template v-if="!props.back">
        <RouterLink
          to="/huidig"
          class="nav-pill"
        >
          Huidig
        </RouterLink>
        <RouterLink
          to="/historisch"
          class="nav-pill"
        >
          Historisch
        </RouterLink>
      </template>
      <button
        type="button"
        class="refresh-button"
        :class="{ spinning: weatherStore.isLoading }"
        aria-label="Gegevens vernieuwen"
        @click="refresh"
      >
        <RefreshCw :size="17" />
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  border-bottom: 2px solid var(--accent-strong);
}

.app-header.masthead {
  padding-top: 4.5rem;
}

/* The Zandvoort photo, once, at real strength: a hard-edged masthead band
   ending on the accent rule. No alpha fade — masked fades band on 8-bit
   composites and read as haze. Home only. */
.app-header.masthead::before {
  content: '';
  position: absolute;
  inset: -1.5rem calc(50% - 50vw) 0;
  z-index: -2;
  background: url('/img/background.webp') center 50% / cover no-repeat;
  filter: saturate(0.85);
}

/* Bottom-weighted scrim protecting the title, no mask. */
.app-header.masthead::after {
  content: '';
  position: absolute;
  inset: -1.5rem calc(50% - 50vw) 0;
  z-index: -1;
  background: linear-gradient(to bottom, rgba(10, 15, 26, 0.3), rgba(10, 15, 26, 0.45) 55%, rgba(10, 15, 26, 0.72));
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title h1 {
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  transition: background 0.15s ease;
}

.back-link:hover {
  background: var(--surface-2);
  text-decoration: none;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-faint);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-ok {
  background: var(--status-ok);
}

.status-warn {
  background: var(--status-warn);
}

.status-error {
  background: var(--status-error);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-pill {
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-chip);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 550;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-pill:hover {
  background: var(--surface-2);
  color: var(--text);
  text-decoration: none;
}

.nav-pill.router-link-active {
  color: var(--accent);
  border-color: var(--accent-strong);
}

.refresh-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease;
}

.refresh-button:hover {
  background: var(--surface-2);
  color: var(--text);
}

.refresh-button.spinning svg {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 1.25rem;
  }
}
</style>
