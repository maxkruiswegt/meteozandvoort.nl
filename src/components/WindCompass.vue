<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { currentTerms } from '@/i18n';
import { compassPoint16, compassPoint8 } from '@/utils/weather';

const props = defineProps<{
  /** Direction the wind comes FROM, in degrees (meteorological). */
  degrees: number | null;
  /** Wind speed in km/h, shown in the center. */
  speedLabel: string;
  subLabel?: string;
}>();

const { t } = useI18n();

// The arrow shows where the wind is flowing TO (like windy.com / Apple Weather);
// the text label names the origin ("ZW"/"SW"), which is how forecasts phrase it.
// Rotation accumulates via the shortest path so 350°→10° doesn't spin the
// long way around during the CSS transition.
const arrowRotation = ref<number | null>(null);
watch(
  () => props.degrees,
  (degrees) => {
    if (degrees === null) {
      arrowRotation.value = null;
      return;
    }
    const target = (((degrees + 180) % 360) + 360) % 360;
    if (arrowRotation.value === null) {
      arrowRotation.value = target;
      return;
    }
    const current = ((arrowRotation.value % 360) + 360) % 360;
    const delta = ((target - current + 540) % 360) - 180;
    arrowRotation.value += delta;
  },
  { immediate: true }
);

const directionLabel = computed(() => {
  const point = compassPoint16(props.degrees);
  return point === null ? '–' : currentTerms.value.compass16[point];
});

// Screen readers get the spelled-out direction, not an abbreviation read letter by letter.
const ariaLabel = computed(() => {
  const point = compassPoint8(props.degrees);
  return point === null
    ? t('compass.unknown', { speed: props.speedLabel })
    : t('compass.label', { direction: currentTerms.value.from8[point], speed: props.speedLabel });
});

const cardinals = computed(() => currentTerms.value.cardinals.map((label, i) => ({ label, angle: i * 90 })));

const TICKS = Array.from({ length: 16 }, (_, i) => i * 22.5);

const polar = (angle: number, radius: number): { x: number; y: number } => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 100 + radius * Math.cos(rad), y: 100 + radius * Math.sin(rad) };
};
</script>

<template>
  <div
    class="wind-compass"
    role="img"
    :aria-label="ariaLabel"
  >
    <svg
      viewBox="0 0 200 200"
      class="compass-svg"
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        class="compass-ring"
      />
      <g
        v-for="angle in TICKS"
        :key="angle"
      >
        <line
          :x1="polar(angle, 88).x"
          :y1="polar(angle, 88).y"
          :x2="polar(angle, angle % 90 === 0 ? 78 : 83).x"
          :y2="polar(angle, angle % 90 === 0 ? 78 : 83).y"
          :class="angle % 90 === 0 ? 'tick-major' : 'tick-minor'"
        />
      </g>
      <text
        v-for="c in cardinals"
        :key="c.angle"
        :x="polar(c.angle, 66).x"
        :y="polar(c.angle, 66).y"
        class="cardinal"
        :class="{ north: c.angle === 0 }"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {{ c.label }}
      </text>

      <g
        v-if="arrowRotation !== null"
        class="arrow"
        :style="{ transform: `rotate(${arrowRotation}deg)` }"
      >
        <path
          d="M 100 22 L 108 42 L 100 37 L 92 42 Z"
          class="arrow-head"
        />
        <path
          d="M 100 178 L 106 162 L 100 166 L 94 162 Z"
          class="arrow-tail"
        />
      </g>
    </svg>

    <div class="compass-center">
      <span class="direction">{{ directionLabel }}</span>
      <span class="speed num">{{ speedLabel }}</span>
      <span
        v-if="subLabel"
        class="sub"
      >
        {{ subLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.wind-compass {
  position: relative;
  width: 100%;
  max-width: 220px;
  aspect-ratio: 1;
  margin: 0 auto;
}

.compass-svg {
  width: 100%;
  height: 100%;
}

.compass-ring {
  fill: var(--bg-raised);
  stroke: var(--border-strong);
  stroke-width: 1.5;
}

.tick-major {
  stroke: var(--text-faint);
  stroke-width: 2;
  stroke-linecap: round;
}

.tick-minor {
  stroke: var(--border-strong);
  stroke-width: 1.5;
  stroke-linecap: round;
}

.cardinal {
  fill: var(--text-faint);
  font-size: 13px;
  font-weight: 600;
}

.cardinal.north {
  fill: var(--text-secondary);
}

.arrow {
  transform-origin: 100px 100px;
  transition: transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.arrow-head {
  fill: var(--data-wind);
}

.arrow-tail {
  fill: var(--text-faint);
}

.compass-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  pointer-events: none;
}

.direction {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.speed {
  font-size: 1.35rem;
  font-weight: 650;
  color: var(--text);
}

.sub {
  font-size: 0.7rem;
  color: var(--text-faint);
}
</style>
