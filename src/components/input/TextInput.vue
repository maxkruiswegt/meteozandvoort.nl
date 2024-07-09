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
  }
});

const touched = ref(false);

const isInvalid = computed(() => {
  return props.required && touched.value && !model.value.trim();
});
</script>

<template>
  <div class="text-input">
    <label v-if="label" :for="id">{{ label }}</label>
    <input :id="id" type="text" v-model="model" :placeholder="placeholder" :required="required"
      :class="{ 'is-invalid': isInvalid }" @blur="touched = true" @focus="touched = false" />
  </div>
</template>

<style scoped>
.text-input {
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