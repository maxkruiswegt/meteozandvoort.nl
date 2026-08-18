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
  const formatNumber = (value: number | null | undefined, decimals = 1): string =>
    isValue(value) ? value.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '–';

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

  const formatDateTime = (date: Date | number | null | undefined): string =>
    date ? dayjs(date).format('DD-MM-YYYY HH:mm') : '–';

  const formatTime = (date: Date | number | null | undefined): string => (date ? dayjs(date).format('HH:mm') : '–');

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
    formatRelativeTime,
  };
}
