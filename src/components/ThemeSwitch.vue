<script setup lang="ts">
import { useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { Monitor, Sun, Moon } from '@lucide/vue';
import { useTheme, type ThemePreference } from '@/composables/useTheme';

const { preference, setPreference } = useTheme();
const { t } = useI18n();
const name = useId();

const options = [
  { value: 'system', icon: Monitor },
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
] as const satisfies readonly { value: ThemePreference; icon: unknown }[];
</script>

<template>
  <fieldset class="theme-switch">
    <legend class="visually-hidden">{{ t('theme.legend') }}</legend>
    <label
      v-for="option in options"
      :key="option.value"
      class="option"
      :title="t(`theme.${option.value}`)"
    >
      <input
        type="radio"
        class="visually-hidden"
        :name="name"
        :value="option.value"
        :checked="preference === option.value"
        @change="setPreference(option.value)"
      />
      <component
        :is="option.icon"
        :size="16"
        aria-hidden="true"
      />
      <span class="visually-hidden">{{ t(`theme.${option.value}`) }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.theme-switch {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: var(--radius-chip);
  background: var(--surface);
  min-inline-size: 0;
}

.option {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-chip);
  color: var(--text-faint);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.option:hover {
  color: var(--text);
}

.option:has(input:checked) {
  background: var(--surface-2);
  color: var(--text);
  box-shadow: inset 0 0 0 1px var(--border-strong);
}

.option:has(input:focus-visible) {
  outline: 2px solid var(--accent-strong);
  outline-offset: 1px;
}

@media (forced-colors: active) {
  .option:has(input:checked) {
    forced-color-adjust: none;
    background: SelectedItem;
    color: SelectedItemText;
  }
}
</style>
