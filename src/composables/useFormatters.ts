import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/nl';
import 'dayjs/locale/en-gb';
import { currentLocale, currentTerms } from '@/i18n';
import type { Locale } from '@/seo/site';

dayjs.extend(relativeTime);

// All formatters take metric values (°C, km/h, mm, hPa); conversion from the
// imperial WeatherLink API happens in the weather store. They read the active
// language on every call, so templates re-render when it changes.

const isValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

// Dutch readers expect 06-10-2026; English readers on both sides of the
// Atlantic misread 06/10, so English spells the month: 6 Oct 2026.
const DATE_PARTS: Record<Locale, Intl.DateTimeFormatOptions> = {
  nl: { day: '2-digit', month: '2-digit', year: 'numeric' },
  en: { day: 'numeric', month: 'short', year: 'numeric' },
};

// Station timestamps are pinned to the station's timezone: a visitor abroad
// should read the Zandvoort clock, not their own.
const CLOCK: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

const buildDateFormats = (locale: Locale, intl: string) => ({
  time: new Intl.DateTimeFormat(intl, CLOCK),
  dateTime: new Intl.DateTimeFormat(intl, { ...CLOCK, ...DATE_PARTS[locale] }),
  shortDateTime: new Intl.DateTimeFormat(intl, { ...CLOCK, day: 'numeric', month: 'short' }),
});

const dateFormatCache = new Map<Locale, ReturnType<typeof buildDateFormats>>();

// Swedish formats dates as ISO 8601 ("2026-10-06 18:40"), a common trick for
// machine-readable local times without a date library.
const isoDateTime = new Intl.DateTimeFormat('sv-SE', {
  ...CLOCK,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dateFormats = () => {
  const locale = currentLocale.value;
  let formats = dateFormatCache.get(locale);
  if (!formats) {
    formats = buildDateFormats(locale, currentTerms.value.intl);
    dateFormatCache.set(locale, formats);
  }
  return formats;
};

export function useFormatters() {
  // useGrouping off: both locales group thousands (nl with a period), so
  // 1013 hPa would render as "1.013" and read as a decimal. Real minus sign
  // (U+2212) for correct width at display sizes.
  const formatNumber = (value: number | null | undefined, decimals = 1): string =>
    isValue(value)
      ? value
          .toLocaleString(currentTerms.value.intl, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: false,
          })
          .replace('-', '−')
      : '–';

  const formatTemperature = (celsius: number | null | undefined, decimals = 1): string =>
    isValue(celsius) ? `${formatNumber(celsius, decimals)}°C` : '–';

  const formatWindSpeed = (kmh: number | null | undefined, decimals = 0): string =>
    isValue(kmh) ? `${formatNumber(kmh, decimals)} ${currentTerms.value.units.kmh}` : '–';

  const formatPressure = (hpa: number | null | undefined): string =>
    isValue(hpa) ? `${formatNumber(hpa, 1)} hPa` : '–';

  const formatRainfall = (mm: number | null | undefined, decimals = 1): string =>
    isValue(mm) ? `${formatNumber(mm, decimals)} mm` : '–';

  const formatRainRate = (mmPerHour: number | null | undefined): string =>
    isValue(mmPerHour) ? `${formatNumber(mmPerHour, 1)} ${currentTerms.value.units.mmPerHour}` : '–';

  const formatPercentage = (value: number | null | undefined): string =>
    isValue(value) ? `${formatNumber(value, 0)}%` : '–';

  const formatDateTime = (date: Date | number | null | undefined): string =>
    date ? dateFormats().dateTime.format(date).replace(',', '') : '–';

  const formatTime = (date: Date | number | null | undefined): string =>
    date ? dateFormats().time.format(date) : '–';

  const formatShortDateTime = (date: Date | number | null | undefined): string =>
    date ? dateFormats().shortDateTime.format(date).replace(',', '') : '–';

  const formatRelativeTime = (date: Date | number | null | undefined): string =>
    date ? dayjs(date).locale(currentTerms.value.dayjs).fromNow() : '–';

  /** Station time as "2026-10-06 18:40", for data exports. */
  const formatIsoDateTime = (date: Date | number | null | undefined): string =>
    date ? isoDateTime.format(date) : '';

  return {
    formatNumber,
    formatTemperature,
    formatWindSpeed,
    formatPressure,
    formatRainfall,
    formatRainRate,
    formatPercentage,
    formatDateTime,
    formatTime,
    formatShortDateTime,
    formatRelativeTime,
    formatIsoDateTime,
  };
}
