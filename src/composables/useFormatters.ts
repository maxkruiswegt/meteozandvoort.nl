import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/nl';

dayjs.extend(relativeTime);
dayjs.locale('nl');

// All formatters take metric values (°C, km/h, mm, hPa); conversion from the
// imperial WeatherLink API happens in the weather store.

const isValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

export function useFormatters() {
  // useGrouping off: nl-NL groups thousands with a period, so 1013 hPa would
  // render as "1.013" and read as a decimal. Real minus sign (U+2212) for
  // correct width at display sizes.
  const formatNumber = (value: number | null | undefined, decimals = 1): string =>
    isValue(value)
      ? value
          .toLocaleString('nl-NL', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: false,
          })
          .replace('-', '−')
      : '–';

  const formatTemperature = (celsius: number | null | undefined, decimals = 1): string =>
    isValue(celsius) ? `${formatNumber(celsius, decimals)}°C` : '–';

  const formatWindSpeed = (kmh: number | null | undefined, decimals = 0): string =>
    isValue(kmh) ? `${formatNumber(kmh, decimals)} km/u` : '–';

  const formatPressure = (hpa: number | null | undefined): string =>
    isValue(hpa) ? `${formatNumber(hpa, 1)} hPa` : '–';

  const formatRainfall = (mm: number | null | undefined, decimals = 1): string =>
    isValue(mm) ? `${formatNumber(mm, decimals)} mm` : '–';

  const formatRainRate = (mmPerHour: number | null | undefined): string =>
    isValue(mmPerHour) ? `${formatNumber(mmPerHour, 1)} mm/u` : '–';

  const formatPercentage = (value: number | null | undefined): string =>
    isValue(value) ? `${formatNumber(value, 0)}%` : '–';

  // Station timestamps are pinned to the station's timezone: a visitor abroad
  // should read the Zandvoort clock, not their own.
  const timeFormat = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const dateTimeFormat = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const shortDateTimeFormat = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const formatDateTime = (date: Date | number | null | undefined): string =>
    date ? dateTimeFormat.format(date).replace(',', '') : '–';

  const formatTime = (date: Date | number | null | undefined): string => (date ? timeFormat.format(date) : '–');

  const formatShortDateTime = (date: Date | number | null | undefined): string =>
    date ? shortDateTimeFormat.format(date).replace(',', '') : '–';

  const formatRelativeTime = (date: Date | number | null | undefined): string => (date ? dayjs(date).fromNow() : '–');

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
  };
}
