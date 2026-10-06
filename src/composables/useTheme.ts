import { computed, readonly, ref } from 'vue';

export type ThemePreference = 'system' | 'light' | 'dark';

// The head script in index.html resolves the theme before first paint; this
// module owns it afterwards. Module-level state, so every switch stays in sync.
const STORAGE_KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

const readStored = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Storage blocked: follow the OS.
    return 'system';
  }
};

const preference = ref<ThemePreference>(readStored());
const systemDark = ref(media.matches);
const wantsDark = computed(() => preference.value === 'dark' || (preference.value === 'system' && systemDark.value));

// What the document actually shows. Separate from wantsDark because the
// crossfade applies the switch a frame later, and JS that reads the CSS tokens
// (the charts) must not rebuild against the old theme.
const appliedDark = ref(document.documentElement.dataset.theme === 'dark');

const applyToDocument = () => {
  const root = document.documentElement;
  root.dataset.theme = wantsDark.value ? 'dark' : 'light';
  appliedDark.value = wantsDark.value;

  // theme-color is media-gated in index.html for the OS setting; a manual
  // choice overrides both tags with the resolved page colour.
  const background = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.dataset.os ??= meta.content;
    meta.content = preference.value === 'system' ? meta.dataset.os : background;
  });
};

// Follow OS switches live (e.g. phones that go dark at sunset) while on "system".
media.addEventListener('change', (event) => {
  systemDark.value = event.matches;
  applyToDocument();
});

applyToDocument();

const setPreference = (value: ThemePreference) => {
  preference.value = value;
  try {
    if (value === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }

  // A short crossfade between palettes; instant for reduced motion.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof document.startViewTransition !== 'function') {
    applyToDocument();
    return;
  }
  // A skipped transition (hidden tab, quick double toggle) rejects these
  // promises; the theme itself is still applied by the update callback.
  const transition = document.startViewTransition(applyToDocument);
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
};

export const useTheme = () => ({
  preference: readonly(preference),
  isDark: readonly(appliedDark),
  setPreference,
});
