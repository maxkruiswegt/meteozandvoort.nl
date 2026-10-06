<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { RefreshCw, ArrowLeft } from '@lucide/vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { useFormatters } from '@/composables/useFormatters';
import ThemeSwitch from '@/components/ThemeSwitch.vue';

const props = defineProps<{
  title?: string;
  /** Show a back-to-home link instead of the section nav. */
  back?: boolean;
  /** On a subpage: still show the live status line and refresh button. */
  live?: boolean;
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

// Wording follows Dutch weather-service convention (KNMI/Buienradar): absolute
// observation clock time, relative phrasing only once the data is stale.
const observedAgeMin = computed(() => {
  void tick.value;
  const observed = weatherStore.observationTime;
  return observed ? (Date.now() - observed.getTime()) / 60_000 : null;
});

const statusKind = computed<'ok' | 'warn' | 'error'>(() => {
  if (weatherStore.error && !weatherStore.currentWeatherData) return 'error';
  const age = observedAgeMin.value;
  if (age === null) return 'ok';
  if (age > 60) return 'error';
  if (age > 10) return 'warn';
  return 'ok';
});

const statusLabel = computed(() => {
  if (weatherStore.error && !weatherStore.currentWeatherData) return 'geen verbinding';
  const observed = weatherStore.observationTime;
  const age = observedAgeMin.value;
  if (!observed || age === null) return 'laden…';
  if (age > 60) return `geen actuele gegevens · laatste meting ${formatters.formatShortDateTime(observed)} uur`;
  if (age > 10) return `laatste meting om ${formatters.formatTime(observed)} uur (${formatters.formatRelativeTime(observed)})`;
  return `gemeten om ${formatters.formatTime(observed)} uur`;
});

const observedIso = computed(() => weatherStore.observationTime?.toISOString());
const observedTitle = computed(() => {
  const observed = weatherStore.observationTime;
  return observed ? `Laatste meting: ${formatters.formatDateTime(observed)} (Europe/Amsterdam)` : undefined;
});

const refresh = () => {
  void weatherStore.fetchAll({ forceHistoric: true });
};

// Home always shows live status; subpages opt in when they show live data.
const showStatus = computed(() => !props.back || props.live);
</script>

<template>
  <header
    class="app-header"
    :class="{ compact: props.back }"
  >
    <!-- Page links left, the app-level theme setting pushed right. One wrapping
         row: when space runs out (320px, heavy zoom, large fonts) the switch
         drops to its own line instead of colliding. -->
    <div class="header-bar">
      <nav
        v-if="!props.back"
        class="header-nav"
        aria-label="Pagina's"
      >
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
      </nav>
      <ThemeSwitch class="header-theme" />
    </div>

    <div class="header-title">
      <RouterLink
        v-if="props.back"
        to="/"
        class="back-link"
        aria-label="Terug naar overzicht"
      >
        <ArrowLeft :size="18" />
      </RouterLink>
      <!-- Site mark (same art as the favicon); decorative, the h1 names the site -->
      <img
        v-else
        src="/favicon.svg"
        alt=""
        class="site-mark"
        width="36"
        height="36"
      />
      <div class="title-text">
        <h1>{{ props.title ?? 'Meteo Zandvoort' }}</h1>
        <p
          v-if="showStatus"
          class="status-line"
          :title="observedTitle"
        >
          <span
            class="status-dot"
            :class="`status-${statusKind}`"
            aria-hidden="true"
          />
          <time :datetime="observedIso">{{ statusLabel }}</time>
          <!-- Beside the timestamp it refreshes, not grouped with page navigation -->
          <button
            type="button"
            class="refresh-button"
            :class="{ spinning: weatherStore.isLoading }"
            aria-label="Gegevens vernieuwen"
            @click="refresh"
          >
            <RefreshCw :size="13" />
          </button>
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* The Zandvoort photo as a contained, hard-edged banner. The same treatment
   works in both themes: a navy scrim keeps it vivid while protecting the
   title (worst-case text contrast stays above 4.5:1 at 0.5 opacity), and the
   page below stays clean. A full-page photo under a light theme washes out
   to flat greige.

   Layout: a top bar with page navigation on the left and the theme switch
   (an app setting) on the right, at opposite ends so they don't read as one
   group; title + live status anchored bottom-left. Same on every width. */
.app-header {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'bar'
    'title';
  gap: 0.75rem 1rem;
  min-height: clamp(9rem, 18vw, 13.5rem);
  padding: 1rem 1.25rem 1.25rem;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

/* Subpages: on phones the same banner as home (a short strip there looks
   squashed); where everything fits, one slim row. The photo is aimed at the
   horizon so even the slim strip shows sunset and skyline. */
.app-header.compact {
  --photo-y: 52%;
  min-height: 9rem;
}

@media (min-width: 640px) {
  .app-header.compact {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto;
    grid-template-areas: 'title bar';
    align-items: center;
    min-height: 0;
    padding: 1rem 1.25rem;
  }

  .app-header.compact .header-title {
    align-self: center;
  }
}

.app-header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(rgb(10 15 26 / 0.5), rgb(10 15 26 / 0.5)),
    image-set(url('/img/header-1600.webp') 1x, url('/img/header-2400.webp') 2x) 70% var(--photo-y, 40%) / cover
      no-repeat;
}

@media (min-width: 768px) {
  /* Text sits on the left: dense scrim there, more photo to the right. */
  .app-header::before {
    background:
      linear-gradient(90deg, rgb(10 15 26 / 0.62) 0%, rgb(10 15 26 / 0.5) 55%, rgb(10 15 26 / 0.15) 100%),
      image-set(url('/img/header-1600.webp') 1x, url('/img/header-2400.webp') 2x) 70% var(--photo-y, 40%) /
        cover no-repeat;
  }
}

.header-title {
  grid-area: title;
  align-self: end;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

/* space-between: nav and switch at opposite ends when they share a line;
   once the switch wraps it sits alone on its line and lines up on the left. */
.header-bar {
  grid-area: bar;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

/* Subpages have no nav: keep the lone switch on the right. */
.app-header.compact .header-bar {
  justify-content: flex-end;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Light ink for the text on the photo only. Scoped here, not to the whole
   header: the back link, pills and switch sit on --surface with theme ink. */
.title-text {
  --text: #ffffff;
  --text-secondary: #e8edf6;
  --status-ok: #57c98a;
  --status-warn: #f9b449;
  --status-error: #f36e37;
  min-width: 0;
}

.header-title h1 {
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  text-shadow: var(--text-shadow-on-photo);
}

/* The mark's navy disc disappears into the scrimmed photo; a thin light ring
   keeps it reading as a roundel. */
.site-mark {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  box-shadow:
    0 0 0 1.5px rgb(255 255 255 / 0.4),
    0 1px 3px rgb(0 0 0 / 0.35);
}

.back-link {
  display: flex;
  flex-shrink: 0;
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
  color: var(--text-secondary);
  text-shadow: var(--text-shadow-on-photo);
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

/* Ghost icon button in the status line: inherits the light ink on the photo.
   24px keeps the WCAG 2.5.8 minimum target; negative margin keeps the line
   height of the status text. */
.refresh-button {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-block: -6px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.refresh-button:hover {
  background: rgb(255 255 255 / 0.16);
}

.refresh-button:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 1px;
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

.nav-pill {
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-chip);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 550;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-pill:hover {
  background: var(--surface-2);
  color: var(--text);
  text-decoration: none;
}

/* Everything clickable that sits on the photo gets a ring and a soft shadow
   so it holds its edge over bright sky as well as dark buildings. */
.back-link,
.nav-pill,
.header-theme {
  border-color: var(--ring-on-photo);
  box-shadow: var(--shadow-on-photo);
}

.nav-pill.router-link-active {
  color: var(--accent);
  border-color: var(--accent-strong);
}

@media (max-width: 639px) {
  /* Tighter pills so the top bar fits a 360px phone. */
  .nav-pill {
    padding-inline: 0.75rem;
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 1.25rem;
  }
}
</style>
