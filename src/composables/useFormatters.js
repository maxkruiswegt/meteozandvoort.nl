import { useUIStore } from '@/stores/UIStore';
import { CONVERSION_FACTORS, WIND_DIRECTIONS, BEAUFORT_SCALE, UNITS } from '@/utils/constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function useFormatters() {
  const uiStore = useUIStore();

  const formatTemperature = (fahrenheit) => {
    if (fahrenheit === null || fahrenheit === undefined) return '--';
    const value = uiStore.useMetric ? CONVERSION_FACTORS.F_TO_C(fahrenheit) : fahrenheit;
    const unit = uiStore.useMetric ? UNITS.METRIC.TEMPERATURE : UNITS.IMPERIAL.TEMPERATURE;
    return `${value.toFixed(1)}${unit}`;
  };

  const formatWindSpeed = (mph) => {
    if (mph === null || mph === undefined) return '--';
    const value = uiStore.useMetric ? mph * CONVERSION_FACTORS.MPH_TO_KMH : mph;
    const unit = uiStore.useMetric ? UNITS.METRIC.WIND_SPEED : UNITS.IMPERIAL.WIND_SPEED;
    return `${value.toFixed(1)} ${unit}`;
  };

  const formatPressure = (inHg) => {
    if (inHg === null || inHg === undefined) return '--';
    const value = uiStore.useMetric ? inHg * CONVERSION_FACTORS.INHG_TO_MB : inHg;
    const unit = uiStore.useMetric ? UNITS.METRIC.PRESSURE : UNITS.IMPERIAL.PRESSURE;
    return `${value.toFixed(1)} ${unit}`;
  };

  const formatRainfall = (mm) => {
    if (mm === null || mm === undefined) return '--';
    const value = uiStore.useMetric ? mm : mm * CONVERSION_FACTORS.MM_TO_IN;
    const unit = uiStore.useMetric ? UNITS.METRIC.RAINFALL : UNITS.IMPERIAL.RAINFALL;
    return `${value.toFixed(2)} ${unit}`;
  };

  const formatWindDirection = (degrees) => {
    if (degrees === null || degrees === undefined) return '--';
    return WIND_DIRECTIONS[Math.round(degrees / 45) % 8];
  };

  const getBeaufortScale = (mph) => {
    if (mph === null || mph === undefined) return { value: null, description: '--' };
    const scale = BEAUFORT_SCALE.find((s) => mph < s.max);
    return scale || BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1];
  };

  const formatDateTime = (date) => {
    if (!date) return '--';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const formatRelativeTime = (date) => {
    if (!date) return '--';
    return dayjs(date).fromNow();
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--';
    return `${value.toFixed(0)}%`;
  };

  return {
    formatTemperature,
    formatWindSpeed,
    formatPressure,
    formatRainfall,
    formatWindDirection,
    getBeaufortScale,
    formatDateTime,
    formatRelativeTime,
    formatPercentage,
  };
}
