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
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return options.every((option) => {
        return option.hasOwnProperty('value') && option.hasOwnProperty('label');
      });
    }
  },
  required: {
    type: Boolean,
    default: false
  }
});

const touched = ref(false);

const isInvalid = computed(() => {
  return props.required && touched.value && model.value == null;
});
</script>

<template>
  <div class="select-input">
    <label v-if="label" :for="id">{{ label }}</label>
    <select :id="id" v-model="model" :required="required" :class="{ 'is-invalid': isInvalid }" @blur="touched = true"
      @focus="touched = false">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.select-input {
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