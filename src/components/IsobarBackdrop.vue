<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useWeatherStore } from '@/stores/WeatherStore';
import { beaufortFromKmh } from '@/utils/weather';

// Page backdrop: the local isobar field implied by the station's own readings.
// Buys Ballot (KNMI's founder): with the wind at your back, low pressure lies to
// the left. So the lines run with the 10-min wind (crossing it by the surface
// friction angle), crowd together as it strengthens, and curve around a low or,
// above standard pressure, a high. That last part is a guess: one barometer can't
// locate a pressure centre, so the bend is kept gentle. Sea breeze is thermal, not
// pressure-driven, so on those days the field is only a sketch. Pinned to the
// viewport: the bend then spans one screen, not the whole page, so the lines in
// view never drift far from the true angle. Nothing is drawn before the first
// live reading (it fades in); later readings glide the lines into place.

const CROSS_ANGLE = 20; // deg the surface wind crosses isobars toward low: ~10-25 over sea, 30-45 over land
const HPA_PER_LINE = 4; // analysis-chart interval; every 16 hPa line is drawn heavier
const BUNCH = 0.4; // offsets circle centres so spacing varies about 20%, like a hand-drawn chart
const SPACING_BY_BFT = [168, 152, 128, 108, 90, 76, 64, 54, 46, 40, 36, 32, 32]; // px, Bft 0-12
const FALLBACK = { bft: 3, hpa: 1013 }; // for a reading that has a direction but lacks these

interface Isobar {
  hpa: number;
  cx: number;
  cy: number;
  r: number;
  major: boolean;
}

const weatherStore = useWeatherStore();

// Fill the viewport: half-diagonal plus margin, in 200px steps so small
// resizes (a phone's toolbar sliding away) don't redraw.
const svg = ref<SVGSVGElement | null>(null);
const reach = ref(2000);
let observer: ResizeObserver | undefined;
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (!entry) return;
    const { width, height } = entry.contentRect;
    reach.value = Math.ceil((Math.hypot(width, height) * 0.575) / 200) * 200 + 200;
  });
  if (svg.value) observer.observe(svg.value);
});
onBeforeUnmount(() => observer?.disconnect());

// The base drawing (low due north of the centre) is a wind from 270° - CROSS_ANGLE.
// Null until the first reading; a later gap (fetch error) keeps the last angle.
// Each new angle is taken the short way round so the transition never spins
// through 360° when the wind backs past north.
const rotation = ref<number | null>(null);
watch(
  () => weatherStore.windDirectionAvg10Min,
  (from) => {
    if (from === null) return;
    const target = Math.round(from / 5) * 5 - 270 + CROSS_ANGLE;
    const current = rotation.value;
    rotation.value = current === null ? target : current + ((((target - current) % 360) + 540) % 360) - 180;
  },
  { immediate: true }
);

const spacing = computed(() => {
  const bft = beaufortFromKmh(weatherStore.windSpeedAvg10Min)?.bft ?? FALLBACK.bft;
  return SPACING_BY_BFT[bft] ?? 108;
});

// Low or high from standard pressure, with a dead band so it doesn't flip each minute.
const aroundHigh = ref(false);
watch(
  () => weatherStore.pressure,
  (hpa) => {
    if (hpa === null) return;
    if (hpa >= 1015) aroundHigh.value = true;
    else if (hpa <= 1011) aroundHigh.value = false;
  },
  { immediate: true }
);

const isobars = computed<Isobar[]>(() => {
  const s = spacing.value;
  const p0 = weatherStore.pressure ?? FALLBACK.hpa;
  const outward = aroundHigh.value ? -1 : 1; // pressure rises away from a low, falls away from a high
  const centreDistance = reach.value + 1500; // far off-screen, so curvature stays gentle
  const span = (reach.value / s) * HPA_PER_LINE;
  const lines: Isobar[] = [];
  for (let k = Math.ceil((p0 - span) / HPA_PER_LINE); k <= Math.floor((p0 + span) / HPA_PER_LINE); k++) {
    const hpa = k * HPA_PER_LINE;
    const offset = (outward * (hpa - p0) * s) / HPA_PER_LINE; // px from the line through the centre
    lines.push({
      hpa,
      cx: BUNCH * offset,
      cy: -outward * centreDistance,
      r: centreDistance + offset,
      major: hpa % 16 === 0,
    });
  }
  return lines;
});
</script>

<template>
  <svg
    ref="svg"
    class="isobar-backdrop"
    :class="{ ready: rotation !== null }"
    aria-hidden="true"
  >
    <svg
      x="50%"
      y="50%"
      overflow="visible"
    >
      <!-- CSS transform, not the attribute, so a new angle can transition -->
      <g
        v-if="rotation !== null"
        :style="{ transform: `rotate(${rotation}deg)` }"
      >
        <circle
          v-for="line in isobars"
          :key="line.hpa"
          :cx="line.cx"
          :cy="line.cy"
          :r="line.r"
          :class="{ major: line.major }"
        />
      </g>
    </svg>
  </svg>
</template>

<style scoped>
.isobar-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.isobar-backdrop.ready {
  opacity: 1;
}

g {
  transition: transform 2s ease-in-out;
}

circle {
  fill: none;
  stroke: var(--isobar-ink);
  stroke-opacity: var(--isobar-opacity);
  stroke-width: 1;
  transition:
    r 2s ease-in-out,
    cx 2s ease-in-out;
}

circle.major {
  stroke-width: 1.75;
}

@media (forced-colors: active), (prefers-contrast: more), print {
  .isobar-backdrop {
    display: none;
  }
}
</style>
