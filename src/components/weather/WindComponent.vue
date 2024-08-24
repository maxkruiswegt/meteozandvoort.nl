<script setup>
const props = defineProps({
  windNow: {
    type: Object,
    required: true,
    default: () => ({
      force: {
        value: 0,
        description: ""
      },
      speed: 0,
      direction:
      {
        name: "",
        degrees: 0
      }
    })
  },
  windAverage10m: {
    type: Object,
    required: true,
    default: () => ({
      force: {
        value: 0,
        description: ""
      },
      speed: 0,
      direction: {
        name: "",
        degrees: 0
      }
    })
  },
  windMax10m: {
    type: Object,
    required: true,
    default: () => ({
      force: {
        value: 0,
        description: ""
      },
      speed: 0,
      direction: {
        name: "",
        degrees: 0
      }
    })
  },
  windAverage24h: {
    type: Object,
    required: true,
    default: () => ({
      force: {
        value: 0,
        description: ""
      },
      speed: 0,
      direction: {
        name: "",
        degrees: 0
      }
    })
  },
  windMax24h: {
    type: Object,
    required: true,
    default: () => ({
      force: {
        value: 0,
        description: ""
      },
      speed: 0,
      direction: {
        name: "",
        degrees: 0
      }
    })
  }
});
</script>

<template>
  <div class="wind-component">
    <div class="header">
      <span class="material-symbols-outlined">air</span>
      <h3 class="title">Wind</h3>
    </div>
    <div class="wind-info">
      <div class="wind-speed">
        <h4 class="title">Windsnelheid</h4>
        <div class="wind-values">
          <div class="wind-value">
            <p class="value">{{ windNow.speed }} <small>km/u</small></p>
            <small class="timespan">nu</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windAverage10m.speed }} <small>km/u</small></p>
            <small class="timespan">gem. 10m</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windMax10m.speed }} <small>km/u</small></p>
            <small class="timespan">hoog. 10m</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windAverage24h.speed }} <small>km/u</small></p>
            <small class="timespan">gem. 24u</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windMax24h.speed }} <small>km/u</small></p>
            <small class="timespan">hoog. 24u</small>
          </div>
        </div>
      </div>
      <div class="wind-force">
        <h4 class="title">Windkracht</h4>
        <div class="wind-values">
          <div class="wind-value">
            <p class="value">{{ windNow.force.value }} <small>bft</small></p>
            <small class="description">{{ windNow.force.description }}</small>
            <small class="timespan">nu</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windAverage10m.force.value }} <small>bft</small></p>
            <small class="description">{{ windAverage10m.force.description }}</small>
            <small class="timespan">gem. 10m</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windMax10m.force.value }} <small>bft</small></p>
            <small class="description">{{ windMax10m.force.description }}</small>
            <small class="timespan">hoog. 10m</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windAverage24h.force.value }} <small>bft</small></p>
            <small class="description">{{ windAverage24h.force.description }}</small>
            <small class="timespan">gem. 24u</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windMax24h.force.value }} <small>bft</small></p>
            <small class="description">{{ windMax24h.force.description }}</small>
            <small class="timespan">hoog. 24u</small>
          </div>
        </div>
      </div>
      <div class="wind-direction">
        <h4 class="title">Windrichting</h4>
        <div class="wind-values">
          <div class="wind-value">
            <p class="value">{{ windNow.direction.name }} <span class="material-symbols-outlined"
                :style="{ transform: 'rotate(' + windNow.direction.degrees + 'deg)' }">south</span></p>
            <small class="timespan">nu</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windAverage10m.direction.name }} <span class="material-symbols-outlined"
                :style="{ transform: 'rotate(' + windAverage10m.direction.degrees + 'deg)' }">south</span></p>
            <small class="timespan">gem. 10m</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windMax10m.direction.name }} <span class="material-symbols-outlined"
                :style="{ transform: 'rotate(' + windMax10m.direction.degrees + 'deg)' }">south</span></p>
            <small class="timespan">hoog. 10m</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windAverage24h.direction.name }} <span class="material-symbols-outlined"
                :style="{ transform: 'rotate(' + windAverage24h.direction.degrees + 'deg)' }">south</span></p>
            <small class="timespan">gem. 24u</small>
          </div>
          <div class="wind-value">
            <p class="value">{{ windMax24h.direction.name }} <span class="material-symbols-outlined"
                :style="{ transform: 'rotate(' + windMax24h.direction.degrees + 'deg)' }">south</span></p>
            <small class="timespan">hoog. 24u</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wind-component {
  width: 100%;
  background-color: var(--color-tertiary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 0.375rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header .material-symbols-outlined {
  color: var(--color-primary);
}

.wind-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.wind-values {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.wind-value {
  display: flex;
  flex-direction: column;
}

.value {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.timespan {
  color: var(--color-text-secondary);
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  .wind-values {
    grid-template-columns: repeat(3, 1fr);
  }

  .wind-values {
    gap: 0.5rem;
  }
}
</style>