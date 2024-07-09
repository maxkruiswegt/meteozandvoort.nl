<script setup>
import { ref, computed } from 'vue';

const model = defineModel();

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: false
  },
  placeholder: {
    type: String,
    required: false
  },
  required: {
    type: Boolean,
    default: false
  },
  min: {
    type: Number,
    required: false
  },
  max: {
    type: Number,
    required: false
  },
  step: {
    type: Number,
    required: false
  }
});

const touched = ref(false);

const isInvalid = computed(() => {
  if (model.value === null || model.value === '') {
    return props.required && touched.value;
  }

  const value = Number(model.value);
  const isNumber = !isNaN(value);
  const meetsMin = props.min !== null && props.min !== undefined ? value >= props.min : true;
  const meetsMax = props.max !== null && props.max !== undefined ? value <= props.max : true;
  const meetsStep = props.step !== null && props.step !== undefined ? value % props.step === 0 : true;
  return props.required && touched.value && (!isNumber || !meetsMin || !meetsMax || !meetsStep);
});
</script>

<template>
  <div class="number-input">
    <label v-if="label" :for="id">{{ label }}</label>
    <input :id="id" type="number" v-model="model" :placeholder="placeholder" :required="required" :min="min" :max="max"
      :step="step" :class="{ 'is-invalid': isInvalid }" @blur="touched = true" @focus="touched = false" />
  </div>
</template>

<style scoped>
.number-input {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.25rem;
  width: 100%;
}

.is-invalid {
  box-shadow: inset 0 0 0 1px var(--color-primary);
  transition-duration: 0.5s;
}

label {
  font-family: var(--font-primary);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-input-field-title-desktop);
}

/* Media Query for Mobile Versions */
@media screen and (max-width: 768px) {
  label {
    font-size: var(--font-size-input-field-title-mobile);
  }
}
</style>