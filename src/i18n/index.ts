import { computed } from 'vue';
import { createI18n } from 'vue-i18n';
import nl, { type MessageSchema } from './nl';
import en from './en';
import { TERMS } from './terms';
import { PAGE_PATHS, type Locale, type PageId } from '@/seo/site';

// Both languages are bundled (a few KB): no async load before mount, so no
// flash of the wrong language. The router sets the locale from the URL.
export const i18n = createI18n<[MessageSchema], Locale, false>({
  legacy: false,
  locale: 'nl',
  fallbackLocale: 'nl',
  messages: { nl, en },
});

export const currentLocale = computed<Locale>(() => i18n.global.locale.value);

/** Formats and weather vocabulary of the active language. */
export const currentTerms = computed(() => TERMS[currentLocale.value]);

/** Path of a page in a language (the active one by default). */
export const localePath = (page: PageId, locale: Locale = currentLocale.value): string => PAGE_PATHS[page][locale];

/** Each language named in itself, for the language switch. */
export const LANGUAGE_NAMES: Record<Locale, string> = { nl: 'Nederlands', en: 'English' };
