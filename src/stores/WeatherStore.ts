import { defineStore } from 'pinia';
import { ref, shallowRef, computed } from 'vue';
import api from '@/api';
import {
  SENSOR_TYPES,
  type WeatherLinkResponse,
  type IssCurrent,
  type IssArchive,
  type BarometerCurrent,
  type BarometerArchive,
  type IndoorCurrent,
} from '@/types/weatherlink';
import {
  convertFahrenheitToCelsius,
  convertMphToKmh,
  convertInHgToHpa,
  pressureTrend,
} from '@/utils/weather';

// The WeatherLink API reports imperial units; every value this store exposes is
// metric (°C, km/h, hPa, mm). Conversion happens here, once, so views and charts
// never deal with imperial data.

const toCelsius = (f: number | null | undefined): number | null =>
  f === null || f === undefined ? null : convertFahrenheitToCelsius(f);

const toKmh = (mph: number | null | undefined): number | null =>
  mph === null || mph === undefined ? null : convertMphToKmh(mph);

const toHpa = (inHg: number | null | undefined): number | null =>
  inHg === null || inHg === undefined ? null : convertInHgToHpa(inHg);

export const useWeatherStore = defineStore('weather', () => {
  const currentWeatherData = shallowRef<WeatherLinkResponse | null>(null);
  const historicWeatherData = shallowRef<WeatherLinkResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastFetchTime = ref<number | null>(null);

  function isValidResponse(data: unknown): data is WeatherLinkResponse {
    return typeof data === 'object' && data !== null && 'sensors' in data;
  }

  async function fetchCurrentWeather(): Promise<void> {
    const response = await api.get<unknown>('/current');
    if (!isValidResponse(response.data)) {
      throw new Error('Invalid response data');
    }
    currentWeatherData.value = response.data;
    lastFetchTime.value = Date.now();
  }

  /**
   * Fetches an arbitrary historic range (max 24h per the API) and returns it
   * without touching store state, so day queries from the historic browser
   * don't clobber the dashboard's rolling 24h window.
   */
  async function fetchHistoricRange(startTimestamp: number, endTimestamp: number): Promise<WeatherLinkResponse> {
    const response = await api.get<unknown>('/historic', {
      params: {
        'start-timestamp': startTimestamp,
        'end-timestamp': endTimestamp,
      },
    });
    if (!isValidResponse(response.data)) {
      throw new Error('Invalid response data');
    }
    return response.data;
  }

  async function fetchHistoricWeatherForLast24Hours(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    historicWeatherData.value = await fetchHistoricRange(now - 24 * 60 * 60, now);
    lastFetchTime.value = Date.now();
  }

  /** Fetches current + historic together; keeps stale data on failure. */
  async function fetchAll(): Promise<void> {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      await Promise.all([fetchCurrentWeather(), fetchHistoricWeatherForLast24Hours()]);
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Onbekende fout';
    } finally {
      isLoading.value = false;
    }
  }

  function currentSensorRecord<T>(sensorType: number): T | null {
    const sensor = currentWeatherData.value?.sensors.find((s) => s.sensor_type === sensorType);
    return (sensor?.data[0] as T | undefined) ?? null;
  }

  const iss = computed(() => currentSensorRecord<IssCurrent>(SENSOR_TYPES.ISS));
  const barometer = computed(() => currentSensorRecord<BarometerCurrent>(SENSOR_TYPES.BAROMETER));
  const indoor = computed(() => currentSensorRecord<IndoorCurrent>(SENSOR_TYPES.INDOOR));

  // === TIMESTAMPS / FRESHNESS ===
  const observationTime = computed(() => {
    const ts = iss.value?.ts;
    return ts ? new Date(ts * 1000) : null;
  });

  /** True when the station has not reported for more than 10 minutes. */
  const isStale = computed(() => {
    const ts = iss.value?.ts;
    if (!ts || lastFetchTime.value === null) return false;
    return lastFetchTime.value / 1000 - ts > 10 * 60;
  });

  // === TEMPERATURE (°C) ===
  const temperature = computed(() => toCelsius(iss.value?.temp));
  const feelsLike = computed(() => toCelsius(iss.value?.thw_index));
  const dewPoint = computed(() => toCelsius(iss.value?.dew_point));
  const heatIndex = computed(() => toCelsius(iss.value?.heat_index));
  const windChill = computed(() => toCelsius(iss.value?.wind_chill));
  const wetBulb = computed(() => toCelsius(iss.value?.wet_bulb));

  // === HUMIDITY (%) ===
  const humidity = computed(() => iss.value?.hum ?? null);

  // === WIND (km/h, degrees) ===
  const windSpeedNow = computed(() => toKmh(iss.value?.wind_speed_last));
  const windDirectionNow = computed(() => iss.value?.wind_dir_last ?? null);
  const windSpeedAvg10Min = computed(() => toKmh(iss.value?.wind_speed_avg_last_10_min));
  const windDirectionAvg10Min = computed(() => iss.value?.wind_dir_scalar_avg_last_10_min ?? null);
  const windGust10Min = computed(() => toKmh(iss.value?.wind_speed_hi_last_10_min));
  const windGustDirection10Min = computed(() => iss.value?.wind_dir_at_hi_speed_last_10_min ?? null);

  // === RAIN (mm, mm/h) ===
  const rainRateNow = computed(() => iss.value?.rain_rate_last_mm ?? null);
  const rainToday = computed(() => iss.value?.rainfall_day_mm ?? null);
  const rainLast15Min = computed(() => iss.value?.rainfall_last_15_min_mm ?? null);
  const rainLast60Min = computed(() => iss.value?.rainfall_last_60_min_mm ?? null);
  const rainLast24Hours = computed(() => iss.value?.rainfall_last_24_hr_mm ?? null);
  const rainMonth = computed(() => iss.value?.rainfall_month_mm ?? null);
  const rainYear = computed(() => iss.value?.rainfall_year_mm ?? null);
  const isRaining = computed(() => (rainRateNow.value ?? 0) > 0);

  // === PRESSURE (hPa) ===
  const pressure = computed(() => toHpa(barometer.value?.bar_sea_level));
  const pressureTrendDelta = computed(() => toHpa(barometer.value?.bar_trend));
  const pressureTrendDirection = computed(() => pressureTrend(pressureTrendDelta.value));

  // === SOLAR / UV ===
  const solarRadiation = computed(() => iss.value?.solar_rad ?? null);
  const uvIndex = computed(() => iss.value?.uv_index ?? null);

  // === INDOOR (°C, %) ===
  const indoorTemperature = computed(() => toCelsius(indoor.value?.temp_in));
  const indoorHumidity = computed(() => indoor.value?.hum_in ?? null);

  // === HISTORIC RECORDS (raw, imperial — charts convert per point) ===
  const historicIss = computed<IssArchive[]>(() => {
    const sensor = historicWeatherData.value?.sensors.find((s) => s.sensor_type === SENSOR_TYPES.ISS);
    return (sensor?.data as IssArchive[] | undefined) ?? [];
  });

  const historicBarometer = computed<BarometerArchive[]>(() => {
    const sensor = historicWeatherData.value?.sensors.find((s) => s.sensor_type === SENSOR_TYPES.BAROMETER);
    return (sensor?.data as BarometerArchive[] | undefined) ?? [];
  });

  // === 24H AGGREGATES (metric) ===
  const windSpeedAvg24Hours = computed(() => {
    const speeds = historicIss.value
      .map((r) => r.wind_speed_avg)
      .filter((s): s is number => s !== null && s !== undefined);
    if (speeds.length === 0) return null;
    return toKmh(speeds.reduce((sum, s) => sum + s, 0) / speeds.length);
  });

  const windGust24Hours = computed(() => {
    const gusts = historicIss.value
      .map((r) => r.wind_speed_hi)
      .filter((g): g is number => g !== null && g !== undefined);
    return gusts.length > 0 ? toKmh(Math.max(...gusts)) : null;
  });

  const temperatureRange24Hours = computed(() => {
    const highs = historicIss.value.map((r) => r.temp_hi).filter((t): t is number => t !== null && t !== undefined);
    const lows = historicIss.value.map((r) => r.temp_lo).filter((t): t is number => t !== null && t !== undefined);
    if (highs.length === 0 || lows.length === 0) return null;
    return {
      min: toCelsius(Math.min(...lows)) as number,
      max: toCelsius(Math.max(...highs)) as number,
    };
  });

  return {
    // State
    currentWeatherData,
    historicWeatherData,
    isLoading,
    error,
    lastFetchTime,

    // Actions
    fetchAll,
    fetchHistoricRange,
    fetchHistoricWeatherForLast24Hours,

    // Freshness
    observationTime,
    isStale,

    // Temperature
    temperature,
    feelsLike,
    dewPoint,
    heatIndex,
    windChill,
    wetBulb,

    // Humidity
    humidity,

    // Wind
    windSpeedNow,
    windDirectionNow,
    windSpeedAvg10Min,
    windDirectionAvg10Min,
    windGust10Min,
    windGustDirection10Min,
    windSpeedAvg24Hours,
    windGust24Hours,

    // Rain
    rainRateNow,
    rainToday,
    rainLast15Min,
    rainLast60Min,
    rainLast24Hours,
    rainMonth,
    rainYear,
    isRaining,

    // Pressure
    pressure,
    pressureTrendDelta,
    pressureTrendDirection,

    // Solar
    solarRadiation,
    uvIndex,

    // Indoor
    indoorTemperature,
    indoorHumidity,

    // Historic
    historicIss,
    historicBarometer,
    temperatureRange24Hours,
  };
});
