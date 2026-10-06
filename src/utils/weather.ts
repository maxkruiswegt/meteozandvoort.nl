// Pure weather domain logic. All functions take metric inputs (°C, km/h, mm, hPa)
// unless stated otherwise — unit conversion from the imperial WeatherLink API
// happens once, at the store boundary.

export const convertFahrenheitToCelsius = (fahrenheit: number): number => ((fahrenheit - 32) * 5) / 9;

export const convertMphToKmh = (mph: number): number => mph * 1.609344;

export const convertInHgToHpa = (inHg: number): number => inHg * 33.8639;

// KNMI Beaufort upper bounds in km/h (inclusive), index = force. The words
// per force and language live in i18n/terms.ts.
const BEAUFORT_MAX_KMH = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, Infinity];

/** Beaufort force 0-12. */
export const beaufortFromKmh = (kmh: number | null): number | null => {
  if (kmh === null || !Number.isFinite(kmh) || kmh < 0) return null;
  const force = BEAUFORT_MAX_KMH.findIndex((max) => kmh <= max);
  return force === -1 ? 12 : force;
};

/** Compass point 0-15 (0 = N, clockwise), for the 16-point abbreviations in i18n/terms.ts. */
export const compassPoint16 = (degrees: number | null): number | null => {
  if (degrees === null || !Number.isFinite(degrees)) return null;
  return Math.round(((degrees % 360) + 360) / 22.5) % 16;
};

/** Compass point 0-7 (0 = N, clockwise), for the 8-point direction names in i18n/terms.ts. */
export const compassPoint8 = (degrees: number | null): number | null => {
  if (degrees === null || !Number.isFinite(degrees)) return null;
  return Math.round(((degrees % 360) + 360) / 45) % 8;
};

/**
 * Maps a temperature to the nearest 5 °C stop of the CSS temperature ramp
 * (--temp--10 … --temp-40), for coloring large readouts.
 */
export const temperatureColorVar = (celsius: number | null): string => {
  if (celsius === null || !Number.isFinite(celsius)) return 'var(--text)';
  const stop = Math.min(40, Math.max(-10, Math.round(celsius / 5) * 5));
  return stop < 0 ? `var(--temp--${Math.abs(stop)})` : `var(--temp-${stop})`;
};

export type PressureTrend = 'rising' | 'falling' | 'steady';

/** Trend over 3 hours; input in hPa (converted from the API's inHg delta). */
export const pressureTrend = (deltaHpa: number | null): PressureTrend | null => {
  if (deltaHpa === null || !Number.isFinite(deltaHpa)) return null;
  if (deltaHpa > 0.7) return 'rising';
  if (deltaHpa < -0.7) return 'falling';
  return 'steady';
};
