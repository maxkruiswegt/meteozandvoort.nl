// Pages, URLs and <head> content per language. Shared by the app (router,
// language switch, runtime head) and by the build step in build/seoPages.ts,
// which writes a static head into every page's HTML. Keep this module pure:
// no Vue, no DOM, relative imports only, so vite.config.ts can load it.
//
// Dutch keeps the root URLs; English lives under /en/ with translated slugs.
// URLs end in a slash because each page is built as <path>/index.html and the
// server 301s the slashless form to it.

export const SITE_URL = 'https://meteozandvoort.nl';
export const SITE_NAME = 'Meteo Zandvoort';

export const LOCALES = ['nl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type PageId = 'home' | 'current' | 'historic';

export const PAGE_PATHS: Record<PageId, Record<Locale, string>> = {
  home: { nl: '/', en: '/en/' },
  current: { nl: '/huidig/', en: '/en/current/' },
  historic: { nl: '/historisch/', en: '/en/history/' },
};

/** BCP 47 tag for <html lang>; British English to match the en-GB formatting. */
export const HTML_LANG: Record<Locale, string> = { nl: 'nl', en: 'en-GB' };

const OG_LOCALE: Record<Locale, string> = { nl: 'nl_NL', en: 'en_GB' };

// Visitors whose language is neither Dutch nor English (largely German and
// other tourists) are likelier to read English.
const X_DEFAULT: Locale = 'en';

interface PageCopy {
  title: string;
  description: string;
}

const COPY: Record<
  Locale,
  { pages: Record<PageId, PageCopy>; notFound: string; ogImage: string; ogImageAlt: string }
> = {
  nl: {
    pages: {
      home: {
        title: 'Actueel weer in Zandvoort · Meteo Zandvoort',
        description:
          'Het actuele weer in Zandvoort, elke minuut vers van het weerstation van Herman Kruiswegt: temperatuur, wind, regen, luchtdruk en een live beachcam.',
      },
      current: {
        title: 'Alle actuele meetwaarden · Meteo Zandvoort',
        description:
          'Alle ruwe meetwaarden van het weerstation in Zandvoort, per sensor en elke minuut bijgewerkt: temperatuur, wind, regen, luchtdruk en meer.',
      },
      historic: {
        title: 'Weergeschiedenis Zandvoort per dag · Meteo Zandvoort',
        description:
          'Het weer in Zandvoort terugkijken per dag, in metingen per kwartier: temperatuur, luchtvochtigheid, wind en neerslag. Te downloaden als CSV.',
      },
    },
    notFound: 'Pagina niet gevonden · Meteo Zandvoort',
    ogImage: '/img/og.jpg',
    ogImageAlt: 'Meteo Zandvoort: het actuele weer in Zandvoort, rechtstreeks van het weerstation van Herman Kruiswegt',
  },
  en: {
    pages: {
      home: {
        title: 'Current weather in Zandvoort · Meteo Zandvoort',
        description:
          "The current weather in Zandvoort, updated every minute from Herman Kruiswegt's weather station: temperature, wind, rain, air pressure and a live beach cam.",
      },
      current: {
        title: 'All current readings · Meteo Zandvoort',
        description:
          'Every raw reading from the Zandvoort weather station, per sensor and updated every minute: temperature, wind, rain, air pressure and more.',
      },
      historic: {
        title: 'Zandvoort weather history by day · Meteo Zandvoort',
        description:
          'Look back at the weather in Zandvoort day by day, in 15-minute records: temperature, humidity, wind and rain. Downloadable as CSV.',
      },
    },
    notFound: 'Page not found · Meteo Zandvoort',
    ogImage: '/img/og-en.jpg',
    ogImageAlt: "Meteo Zandvoort: the current weather in Zandvoort, straight from Herman Kruiswegt's weather station",
  },
};

export const absoluteUrl = (path: string): string => SITE_URL + path;

export const otherLocale = (locale: Locale): Locale => (locale === 'nl' ? 'en' : 'nl');

export type HeadMeta = { name: string; content: string } | { property: string; content: string };

export type HeadLink = { rel: 'canonical'; href: string } | { rel: 'alternate'; hreflang: string; href: string };

/** Plain head description; @unhead/vue (runtime) and unhead/server (build) both take it as is. */
export interface PageHead {
  htmlAttrs: { lang: string };
  title: string;
  meta: HeadMeta[];
  link: HeadLink[];
}

/**
 * Head for a page in one language: self-referencing canonical, reciprocal
 * hreflang for both languages plus x-default, and Open Graph tags (social
 * preview bots don't run JavaScript, so these must be in the static HTML).
 * `null` is the not-found page: noindex and no canonical.
 */
export const buildHead = (page: PageId | null, locale: Locale): PageHead => {
  const copy = COPY[locale];
  const htmlAttrs = { lang: HTML_LANG[locale] };

  if (page === null) {
    return {
      htmlAttrs,
      title: copy.notFound,
      meta: [{ name: 'robots', content: 'noindex' }],
      link: [],
    };
  }

  const { title, description } = copy.pages[page];
  const url = absoluteUrl(PAGE_PATHS[page][locale]);

  return {
    htmlAttrs,
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: OG_LOCALE[locale] },
      { property: 'og:locale:alternate', content: OG_LOCALE[otherLocale(locale)] },
      { property: 'og:image', content: absoluteUrl(copy.ogImage) },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: copy.ogImageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    link: [
      { rel: 'canonical', href: url },
      ...LOCALES.map((l): HeadLink => ({ rel: 'alternate', hreflang: l, href: absoluteUrl(PAGE_PATHS[page][l]) })),
      { rel: 'alternate', hreflang: 'x-default', href: absoluteUrl(PAGE_PATHS[page][X_DEFAULT]) },
    ],
  };
};

/** Every indexable URL, for the build step (static pages + sitemap). */
export const ALL_PAGES: { page: PageId; locale: Locale; path: string }[] = (
  Object.keys(PAGE_PATHS) as PageId[]
).flatMap((page) => LOCALES.map((locale) => ({ page, locale, path: PAGE_PATHS[page][locale] })));
