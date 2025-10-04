// Sensor Types
export const SENSOR_TYPES = {
  ISS: 43, // Integrated Sensor Suite (outdoor weather)
  BAROMETER: 242, // Barometric pressure
  INDOOR: 365, // Indoor temperature/humidity
  HEALTH: 509, // System health/status
};

// Data Structure Types
export const DATA_STRUCTURE_TYPES = {
  ISS_CURRENT: 23,
  ISS_HISTORIC: 24,
  BAROMETER_CURRENT: 19,
  BAROMETER_HISTORIC: 20,
  INDOOR_CURRENT: 21,
  INDOOR_HISTORIC: 22,
  HEALTH: 27,
};

// Unit Conversions
export const CONVERSION_FACTORS = {
  F_TO_C: (f) => ((f - 32) * 5) / 9,
  C_TO_F: (c) => (c * 9) / 5 + 32,
  MPH_TO_KMH: 1.609344,
  KMH_TO_MPH: 0.621371,
  IN_TO_MM: 25.4,
  MM_TO_IN: 0.0393701,
  INHG_TO_MB: 33.8639,
  MB_TO_INHG: 0.02953,
};

// Wind Direction Names (Dutch)
export const WIND_DIRECTIONS = [
  'Noord', // 0° (North)
  'Noordoost', // 45° (Northeast)
  'Oost', // 90° (East)
  'Zuidoost', // 135° (Southeast)
  'Zuid', // 180° (South)
  'Zuidwest', // 225° (Southwest)
  'West', // 270° (West)
  'Noordwest', // 315° (Northwest)
];

// Wind Direction Names (English)
export const WIND_DIRECTIONS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// Beaufort Scale
export const BEAUFORT_SCALE = [
  { max: 1, value: 0, description: 'stil', descriptionEN: 'calm' },
  { max: 4, value: 1, description: 'licht', descriptionEN: 'light air' },
  { max: 8, value: 2, description: 'licht', descriptionEN: 'light breeze' },
  { max: 13, value: 3, description: 'matig', descriptionEN: 'gentle breeze' },
  { max: 19, value: 4, description: 'matig', descriptionEN: 'moderate breeze' },
  { max: 25, value: 5, description: 'vrij krachtig', descriptionEN: 'fresh breeze' },
  { max: 32, value: 6, description: 'krachtig', descriptionEN: 'strong breeze' },
  { max: 39, value: 7, description: 'hard', descriptionEN: 'near gale' },
  { max: 47, value: 8, description: 'stormachtig', descriptionEN: 'gale' },
  { max: 55, value: 9, description: 'storm', descriptionEN: 'strong gale' },
  { max: 64, value: 10, description: 'zware storm', descriptionEN: 'storm' },
  { max: 73, value: 11, description: 'zeer zware storm', descriptionEN: 'violent storm' },
  { max: Infinity, value: 12, description: 'orkaan', descriptionEN: 'hurricane' },
];

// Weather Metric Categories
export const METRIC_CATEGORIES = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  WIND: 'wind',
  RAIN: 'rain',
  PRESSURE: 'pressure',
  SYSTEM: 'system',
};

// Color Schemes for Charts
export const CHART_COLORS = {
  TEMPERATURE: '#FF6B6B',
  DEW_POINT: '#4ECDC4',
  HEAT_INDEX: '#FF8C42',
  WIND_CHILL: '#95E1D3',
  WIND_SPEED: '#4A90E2',
  WIND_GUST: '#D4A574',
  PRESSURE: '#9B59B6',
  HUMIDITY: '#3498DB',
  RAINFALL: '#1ABC9C',
  PRIMARY: '#be4535',
  SUCCESS: '#27AE60',
  WARNING: '#F39C12',
  DANGER: '#E74C3C',
  INFO: '#3498DB',
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
};

// Time Ranges for Charts
export const TIME_RANGES = [
  { label: '6 Hours', hours: 6 },
  { label: '12 Hours', hours: 12 },
  { label: '24 Hours', hours: 24 },
];

// API Update Frequency
export const UPDATE_FREQUENCY = {
  STATION: 60000, // Weather station updates every minute
  AUTO_REFRESH: 60000, // Auto-refresh every 60 seconds
  TIMEOUT: 10000, // API request timeout
};

// Metric Icons (Material Symbols)
export const METRIC_ICONS = {
  TEMPERATURE: 'device_thermostat',
  FEELS_LIKE: 'heat',
  HUMIDITY: 'water_drop',
  DEW_POINT: 'dew_point',
  WIND_SPEED: 'air',
  WIND_DIRECTION: 'explore',
  RAIN_RATE: 'umbrella',
  RAINFALL: 'rainy',
  PRESSURE: 'compress',
  PRESSURE_TREND: 'trending_up',
  BATTERY: 'battery_full',
  SIGNAL: 'wifi',
  REFRESH: 'refresh',
  ERROR: 'error',
  LOADING: 'hourglass_empty',
  INFO: 'info',
  SETTINGS: 'settings',
  DARK_MODE: 'dark_mode',
  LIGHT_MODE: 'light_mode',
  EXPAND: 'expand_more',
  COLLAPSE: 'expand_less',
};

// Metric Units
export const UNITS = {
  METRIC: {
    TEMPERATURE: '°C',
    WIND_SPEED: 'km/h',
    PRESSURE: 'mb',
    RAINFALL: 'mm',
    RAINFALL_RATE: 'mm/h',
    HUMIDITY: '%',
  },
  IMPERIAL: {
    TEMPERATURE: '°F',
    WIND_SPEED: 'mph',
    PRESSURE: 'inHg',
    RAINFALL: 'in',
    RAINFALL_RATE: 'in/h',
    HUMIDITY: '%',
  },
};

// Signal Strength Thresholds (RSSI in dBm)
export const SIGNAL_THRESHOLDS = {
  EXCELLENT: -50,
  GOOD: -60,
  FAIR: -70,
  POOR: -80,
};

// Battery Status
export const BATTERY_STATUS = {
  GOOD: 0,
  LOW: 1,
};

// Reception Quality Thresholds (percentage)
export const RECEPTION_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 85,
  FAIR: 70,
  POOR: 50,
};

// Barometric Trend Interpretation
export const PRESSURE_TREND = {
  RISING_RAPIDLY: 0.06, // >0.06 inHg/3h
  RISING: 0.02, // 0.02-0.06 inHg/3h
  STEADY: -0.02, // -0.02 to 0.02 inHg/3h
  FALLING: -0.06, // -0.06 to -0.02 inHg/3h
  FALLING_RAPIDLY: -Infinity, // <-0.06 inHg/3h
};

// Station Information
export const STATION_INFO = {
  ID: 189639,
  UUID: '35a9a8d0-241c-449b-b844-ed5efed3b3ce',
  NAME: 'Meteo Zandvoort',
  LOCATION: 'Zandvoort, Netherlands',
  OWNER: 'Herman Kruiswegt',
};
