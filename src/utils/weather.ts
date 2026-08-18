// Pure weather domain logic. All functions take metric inputs (°C, km/h, mm, hPa)
// unless stated otherwise — unit conversion from the imperial WeatherLink API
// happens once, at the store boundary.

export const convertFahrenheitToCelsius = (fahrenheit: number): number => ((fahrenheit - 32) * 5) / 9;

export const convertMphToKmh = (mph: number): number => mph * 1.609344;

export const convertInHgToHpa = (inHg: number): number => inHg * 33.8639;

export interface BeaufortInfo {
  bft: number;
  /** KNMI wind force description, e.g. "matige wind" */
  label: string;
}

// KNMI Beaufort boundaries in km/h (upper bound inclusive).
const BEAUFORT_SCALE: { max: number; bft: number; label: string }[] = [
  { max: 1, bft: 0, label: 'windstil' },
  { max: 5, bft: 1, label: 'zwakke wind' },
  { max: 11, bft: 2, label: 'zwakke wind' },
  { max: 19, bft: 3, label: 'matige wind' },
  { max: 28, bft: 4, label: 'matige wind' },
  { max: 38, bft: 5, label: 'vrij krachtige wind' },
  { max: 49, bft: 6, label: 'krachtige wind' },
  { max: 61, bft: 7, label: 'harde wind' },
  { max: 74, bft: 8, label: 'stormachtige wind' },
  { max: 88, bft: 9, label: 'storm' },
  { max: 102, bft: 10, label: 'zware storm' },
  { max: 117, bft: 11, label: 'zeer zware storm' },
  { max: Infinity, bft: 12, label: 'orkaan' },
];

export const beaufortFromKmh = (kmh: number | null): BeaufortInfo | null => {
  if (kmh === null || !Number.isFinite(kmh) || kmh < 0) return null;
  const entry = BEAUFORT_SCALE.find((s) => kmh <= s.max) ?? BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1];
  return { bft: entry.bft, label: entry.label };
};

// 16-point compass, Dutch abbreviations (KNMI convention).
const WIND_DIRECTIONS_16 = [
  'N',
  'NNO',
  'NO',
  'ONO',
  'O',
  'OZO',
  'ZO',
  'ZZO',
  'Z',
  'ZZW',
  'ZW',
  'WZW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const;

const WIND_DIRECTIONS_8_FULL = [
  'noord',
  'noordoost',
  'oost',
  'zuidoost',
  'zuid',
  'zuidwest',
  'west',
  'noordwest',
] as const;

export const windDirectionAbbr = (degrees: number | null): string | null => {
  if (degrees === null || !Number.isFinite(degrees)) return null;
  const index = Math.round(((degrees % 360) + 360) / 22.5) % 16;
  return WIND_DIRECTIONS_16[index];
};

export const windDirectionName = (degrees: number | null): string | null => {
  if (degrees === null || !Number.isFinite(degrees)) return null;
  const index = Math.round(((degrees % 360) + 360) / 45) % 8;
  return WIND_DIRECTIONS_8_FULL[index];
};

export type PressureTrend = 'rising' | 'falling' | 'steady';

/** Trend over 3 hours; input in hPa (converted from the API's inHg delta). */
export const pressureTrend = (deltaHpa: number | null): PressureTrend | null => {
  if (deltaHpa === null || !Number.isFinite(deltaHpa)) return null;
  if (deltaHpa > 0.7) return 'rising';
  if (deltaHpa < -0.7) return 'falling';
  return 'steady';
};
