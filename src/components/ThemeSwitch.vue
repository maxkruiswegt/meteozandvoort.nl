<script setup lang="ts">
import { useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { Monitor, Sun, Moon } from '@lucide/vue';
import { useTheme, type ThemePreference } from '@/composables/useTheme';

const props = defineProps<{
  /** Stacked rows with visible labels (the phone popover) instead of an icon row. */
  list?: boolean;
}>();

const emit = defineEmits<{
  /** A choice was made to keep: by click/tap or Enter (the popover closes). */
  select: [];
}>();

const { preference, setPreference } = useTheme();
const { t } = useI18n();
const name = useId();

// Like a menu of radio items (WAI-ARIA APG): a click, tap or Enter picks and
// closes; arrow keys and Space change the choice but keep the list open, so
// keyboard users can step through without it closing on the first press.
let viaPointer = false;

const onPointerdown = () => {
  viaPointer = true;
};

const onChange = (value: ThemePreference) => {
  setPreference(value);
  if (viaPointer) emit('select');
  viaPointer = false;
};

// Tapping the current choice changes nothing (no change event) but should
// still close. Runs before the input's change, so a new choice isn't caught here.
const onOptionClick = (value: ThemePreference) => {
  if (!viaPointer || preference.value !== value) return;
  viaPointer = false;
  emit('select');
};

const onKeydown = (event: KeyboardEvent) => {
  viaPointer = false;
  if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) return;
  event.preventDefault();
  setPreference(event.target.value as ThemePreference);
  emit('select');
};

const options = [
  { value: 'system', icon: Monitor },
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
] as const satisfies readonly { value: ThemePreference; icon: unknown }[];
</script>

<template>
  <fieldset
    class="theme-switch"
    :class="{ list: props.list }"
    @pointerdown="onPointerdown"
    @keydown="onKeydown"
  >
    <legend :class="props.list ? 'list-legend' : 'visually-hidden'">{{ t('theme.legend') }}</legend>
    <label
      v-for="option in options"
      :key="option.value"
      class="option"
      :title="props.list ? undefined : t(`theme.${option.value}`)"
      @click="onOptionClick(option.value)"
    >
      <!-- In the popover, focus lands on the current choice when it opens
           (PrimeVue Popover focuses [autofocus]); arrow keys then switch. -->
      <input
        type="radio"
        class="visually-hidden"
        :name="name"
        :value="option.value"
        :checked="preference === option.value"
        :autofocus="props.list && preference === option.value"
        @change="onChange(option.value)"
      />
      <component
        :is="option.icon"
        :size="16"
        aria-hidden="true"
      />
      <span :class="{ 'visually-hidden': !props.list }">{{ t(`theme.${option.value}`) }}</span>
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

/* List: a labelled radio group, one 40px row per option. */
.theme-switch.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  border: 0;
  background: transparent;
}

.list-legend {
  padding: 0 0.6rem 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-faint);
}

.list .option {
  display: flex;
  justify-content: flex-start;
  gap: 0.6rem;
  width: auto;
  height: 40px;
  padding-inline: 0.6rem 1rem;
  border-radius: var(--radius-tile);
  color: var(--text-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
}

@media (forced-colors: active) {
  .option:has(input:checked) {
    forced-color-adjust: none;
    background: SelectedItem;
    color: SelectedItemText;
  }
}
</style>
