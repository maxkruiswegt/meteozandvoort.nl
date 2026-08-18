// WeatherLink v2 API response types, based on the live payloads documented in
// current-endpoint-example.md and historic-endpoint-example.md.
// The API reports imperial units (°F, mph, inHg); rainfall is provided in both mm and inches.

export const SENSOR_TYPES = {
  /** Integrated Sensor Suite (outdoor weather) */
  ISS: 43,
  /** Barometric pressure */
  BAROMETER: 242,
  /** Indoor temperature/humidity */
  INDOOR: 365,
  /** System health/status */
  HEALTH: 509,
} as const;

export type SensorType = (typeof SENSOR_TYPES)[keyof typeof SENSOR_TYPES];

interface SensorBase {
  lsid: number;
  sensor_type: number;
  data_structure_type: number;
  data: Record<string, unknown>[];
}

export interface WeatherLinkResponse {
  station_id: number;
  station_id_uuid: string;
  sensors: SensorBase[];
  generated_at: number;
}

/** Sensor 43, data_structure_type 23 — current outdoor conditions */
export interface IssCurrent {
  ts: number;
  tz_offset: number;
  temp: number | null;
  dew_point: number | null;
  wet_bulb: number | null;
  heat_index: number | null;
  wind_chill: number | null;
  thw_index: number | null;
  thsw_index: number | null;
  hum: number | null;
  wind_speed_last: number | null;
  wind_dir_last: number | null;
  wind_speed_avg_last_1_min: number | null;
  wind_dir_scalar_avg_last_1_min: number | null;
  wind_speed_avg_last_2_min: number | null;
  wind_dir_scalar_avg_last_2_min: number | null;
  wind_speed_hi_last_2_min: number | null;
  wind_dir_at_hi_speed_last_2_min: number | null;
  wind_speed_avg_last_10_min: number | null;
  wind_dir_scalar_avg_last_10_min: number | null;
  wind_speed_hi_last_10_min: number | null;
  wind_dir_at_hi_speed_last_10_min: number | null;
  wind_run_day: number | null;
  rain_size: number;
  rain_rate_last_mm: number | null;
  rain_rate_hi_mm: number | null;
  rainfall_last_15_min_mm: number | null;
  rain_rate_hi_last_15_min_mm: number | null;
  rainfall_last_60_min_mm: number | null;
  rainfall_last_24_hr_mm: number | null;
  rainfall_day_mm: number | null;
  rainfall_month_mm: number | null;
  rainfall_year_mm: number | null;
  rain_storm_current_mm: number | null;
  rain_storm_current_start_at: number | null;
  rain_storm_last_mm: number | null;
  rain_storm_last_start_at: number | null;
  rain_storm_last_end_at: number | null;
  solar_rad: number | null;
  uv_index: number | null;
  et_day: number | null;
  reception_day: number | null;
  rssi_last: number | null;
  trans_battery_flag: number | null;
  tx_id: number;
}

/** Sensor 43, data_structure_type 24 — 15-minute archive record */
export interface IssArchive {
  ts: number;
  tz_offset: number;
  arch_int: number;
  temp_last: number | null;
  temp_avg: number | null;
  temp_hi: number | null;
  temp_hi_at: number | null;
  temp_lo: number | null;
  temp_lo_at: number | null;
  dew_point_last: number | null;
  dew_point_hi: number | null;
  dew_point_lo: number | null;
  heat_index_last: number | null;
  heat_index_hi: number | null;
  wind_chill_last: number | null;
  wind_chill_lo: number | null;
  thw_index_last: number | null;
  thw_index_hi: number | null;
  thw_index_lo: number | null;
  wet_bulb_last: number | null;
  hum_last: number | null;
  hum_hi: number | null;
  hum_lo: number | null;
  wind_speed_avg: number | null;
  wind_speed_hi: number | null;
  wind_speed_hi_at: number | null;
  wind_speed_hi_dir: number | null;
  wind_dir_of_avg: number | null;
  wind_dir_of_prevail: number | null;
  wind_run: number | null;
  rainfall_mm: number | null;
  rainfall_in: number | null;
  rain_rate_hi_mm: number | null;
  solar_rad_avg: number | null;
  uv_index_avg: number | null;
  reception: number | null;
  rssi: number | null;
}

/** Sensor 242, data_structure_type 19 — current barometer */
export interface BarometerCurrent {
  ts: number;
  tz_offset: number;
  bar_sea_level: number | null;
  bar_absolute: number | null;
  /** Change over the last 3 hours, in inHg. Positive = rising. */
  bar_trend: number | null;
  bar_offset: number | null;
}

/** Sensor 242, data_structure_type 20 — barometer archive record */
export interface BarometerArchive {
  ts: number;
  tz_offset: number;
  arch_int: number;
  bar_sea_level: number | null;
  bar_absolute: number | null;
  bar_hi: number | null;
  bar_hi_at: number | null;
  bar_lo: number | null;
  bar_lo_at: number | null;
}

/** Sensor 365, data_structure_type 21 — current indoor conditions */
export interface IndoorCurrent {
  ts: number;
  tz_offset: number;
  temp_in: number | null;
  hum_in: number | null;
  dew_point_in: number | null;
  heat_index_in: number | null;
  wet_bulb_in: number | null;
}

/** Sensor 509, data_structure_type 27 — console health */
export interface HealthCurrent {
  ts: number;
  tz_offset: number;
  battery_voltage: number | null;
  battery_percent: number | null;
  battery_condition: number | null;
  charger_plugged: number | null;
  wifi_rssi: number | null;
  console_sw_version: string | null;
  console_os_version: string | null;
  os_uptime: number | null;
  app_uptime: number | null;
  free_mem: number | null;
}
