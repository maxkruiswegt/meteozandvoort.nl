import api from '@/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SENSOR_TYPES } from '@/utils/constants';

export const useWeatherStore = defineStore('weather', () => {
  const currentWeatherData = ref(null);
  const historicWeatherData = ref(null);
  const isLoading = ref(false);
  const lastFetchTime = ref(null);

  // Fetch with timeout
  async function fetchWithTimeout(url, options, timeout = 10000) {
    return Promise.race([
      api.get(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout)),
    ]);
  }

  // Validate response
  function isValidResponse(data) {
    return data && typeof data === 'object' && 'sensors' in data;
  }

  // Fetch current weather
  async function fetchCurrentWeather() {
    isLoading.value = true;
    try {
      const response = await fetchWithTimeout('/current');
      if (!isValidResponse(response.data)) {
        throw new Error('Invalid response data');
      }
      currentWeatherData.value = response.data;
      lastFetchTime.value = Date.now();
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch historic weather
  async function fetchHistoricWeather(startTimestamp, endTimestamp) {
    isLoading.value = true;
    try {
      const response = await fetchWithTimeout('/historic', {
        params: {
          'start-timestamp': startTimestamp,
          'end-timestamp': endTimestamp,
        },
      });
      if (!isValidResponse(response.data)) {
        throw new Error('Invalid response data');
      }
      historicWeatherData.value = response.data;
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch last 24 hours
  async function fetchHistoricWeatherForLast24Hours() {
    const now = Math.floor(Date.now() / 1000);
    const twentyFourHoursAgo = now - 24 * 60 * 60;
    await fetchHistoricWeather(twentyFourHoursAgo, now);
  }

  // Helper to get sensor data
  const getSensorData = (sensorType) => {
    if (!currentWeatherData.value) return null;
    const sensor = currentWeatherData.value.sensors.find((s) => s.sensor_type === sensorType);
    return sensor?.data?.[0] || null;
  };

  // === TIMESTAMPS ===
  const lastUpdated = computed(() => {
    const data = getSensorData(SENSOR_TYPES.ISS);
    return data?.ts ? new Date(data.ts * 1000) : null;
  });

  const generatedAt = computed(() => {
    return currentWeatherData.value?.generated_at
      ? new Date(currentWeatherData.value.generated_at * 1000)
      : null;
  });

  // === TEMPERATURE DATA (ISS) ===
  const temperature = computed(() => getSensorData(SENSOR_TYPES.ISS)?.temp || null);
  const dewPoint = computed(() => getSensorData(SENSOR_TYPES.ISS)?.dew_point || null);
  const thwIndex = computed(() => getSensorData(SENSOR_TYPES.ISS)?.thw_index || null);
  const heatIndex = computed(() => getSensorData(SENSOR_TYPES.ISS)?.heat_index || null);
  const windChill = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_chill || null);
  const wetBulb = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wet_bulb || null);

  // === HUMIDITY DATA (ISS) ===
  const humidity = computed(() => getSensorData(SENSOR_TYPES.ISS)?.hum || null);

  // === WIND SPEED DATA (ISS) ===
  const windSpeedLast = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_speed_last || null);
  const windSpeedAvgLast1Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_speed_avg_last_1_min || null);
  const windSpeedAvgLast2Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_speed_avg_last_2_min || null);
  const windSpeedAvgLast10Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_speed_avg_last_10_min || null);
  const windSpeedHiLast2Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_speed_hi_last_2_min || null);
  const windSpeedHiLast10Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_speed_hi_last_10_min || null);

  // === WIND DIRECTION DATA (ISS) ===
  const windDirectionLast = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_dir_last || null);
  const windDirectionAvgLast1Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_dir_scalar_avg_last_1_min || null);
  const windDirectionAvgLast2Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_dir_scalar_avg_last_2_min || null);
  const windDirectionAvgLast10Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_dir_scalar_avg_last_10_min || null);
  const windDirectionHiLast2Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_dir_at_hi_speed_last_2_min || null);
  const windDirectionHiLast10Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_dir_at_hi_speed_last_10_min || null);

  // === RAINFALL DATA (ISS) ===
  const rainRateLast = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rain_rate_last_mm || null);
  const rainfallToday = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rainfall_day_mm || null);
  const rainfallLast15Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rainfall_last_15_min_mm || null);
  const rainfallLast60Min = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rainfall_last_60_min_mm || null);
  const rainfallLast24Hours = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rainfall_last_24_hr_mm || null);
  const rainfallMonth = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rainfall_month_mm || null);
  const rainfallYear = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rainfall_year_mm || null);

  // === ADDITIONAL ISS DATA ===
  const windRunDay = computed(() => getSensorData(SENSOR_TYPES.ISS)?.wind_run_day || null);
  const receptionQuality = computed(() => getSensorData(SENSOR_TYPES.ISS)?.reception_day || null);
  const signalStrength = computed(() => getSensorData(SENSOR_TYPES.ISS)?.rssi_last || null);
  const batteryStatus = computed(() => getSensorData(SENSOR_TYPES.ISS)?.trans_battery_flag || null);

  // === BAROMETRIC PRESSURE (Sensor 242) ===
  const barometricPressure = computed(() => getSensorData(SENSOR_TYPES.BAROMETER)?.bar_sea_level || null);
  const barometricPressureAbsolute = computed(() => getSensorData(SENSOR_TYPES.BAROMETER)?.bar_absolute || null);
  const barometricTrend = computed(() => getSensorData(SENSOR_TYPES.BAROMETER)?.bar_trend || null);
  const barometricOffset = computed(() => getSensorData(SENSOR_TYPES.BAROMETER)?.bar_offset || null);

  // === INDOOR DATA (Sensor 365) ===
  const indoorTemperature = computed(() => getSensorData(SENSOR_TYPES.INDOOR)?.temp_in || null);
  const indoorHumidity = computed(() => getSensorData(SENSOR_TYPES.INDOOR)?.hum_in || null);
  const indoorDewPoint = computed(() => getSensorData(SENSOR_TYPES.INDOOR)?.dew_point_in || null);
  const indoorHeatIndex = computed(() => getSensorData(SENSOR_TYPES.INDOOR)?.heat_index_in || null);
  const indoorWetBulb = computed(() => getSensorData(SENSOR_TYPES.INDOOR)?.wet_bulb_in || null);

  // === SYSTEM HEALTH (Sensor 509) ===
  const systemHealth = computed(() => {
    const data = getSensorData(SENSOR_TYPES.HEALTH);
    if (!data) return null;
    return {
      batteryVoltage: data.battery_voltage,
      batteryPercent: data.battery_percent,
      wifiSignal: data.wifi_rssi,
      uptime: data.os_uptime,
      freeMemory: data.free_mem,
      consoleSoftwareVersion: data.console_sw_version,
    };
  });

  // === HISTORIC DATA AGGREGATIONS ===
  const windSpeedAvgLast24Hours = computed(() => {
    if (!historicWeatherData.value) return null;
    const windSpeeds = historicWeatherData.value.sensors
      .filter((s) => s.sensor_type === SENSOR_TYPES.ISS)
      .flatMap((s) => s.data.map((d) => d.wind_speed_avg))
      .filter((speed) => speed !== null && speed !== undefined);
    if (windSpeeds.length === 0) return null;
    return windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length;
  });

  const windSpeedHiLast24Hours = computed(() => {
    if (!historicWeatherData.value) return null;
    const windSpeeds = historicWeatherData.value.sensors
      .filter((s) => s.sensor_type === SENSOR_TYPES.ISS)
      .flatMap((s) => s.data.map((d) => d.wind_speed_hi))
      .filter((speed) => speed !== null && speed !== undefined);
    return windSpeeds.length > 0 ? Math.max(...windSpeeds) : null;
  });

  const windDirectionPrevailing24Hours = computed(() => {
    if (!historicWeatherData.value) return null;
    const directions = historicWeatherData.value.sensors
      .filter((s) => s.sensor_type === SENSOR_TYPES.ISS)
      .flatMap((s) => s.data.map((d) => d.wind_dir_of_prevail))
      .filter((dir) => dir !== null && dir !== undefined);
    // Use most recent prevailing direction
    return directions.length > 0 ? directions[directions.length - 1] : null;
  });

  // Get all historic records for charts
  const historicRecords = computed(() => {
    if (!historicWeatherData.value) return [];
    const sensor = historicWeatherData.value.sensors.find((s) => s.sensor_type === SENSOR_TYPES.ISS);
    return sensor?.data || [];
  });

  const historicBarometerRecords = computed(() => {
    if (!historicWeatherData.value) return [];
    const sensor = historicWeatherData.value.sensors.find((s) => s.sensor_type === SENSOR_TYPES.BAROMETER);
    return sensor?.data || [];
  });

  return {
    // State
    currentWeatherData,
    historicWeatherData,
    isLoading,
    lastFetchTime,

    // Actions
    fetchCurrentWeather,
    fetchHistoricWeather,
    fetchHistoricWeatherForLast24Hours,

    // Timestamps
    lastUpdated,
    generatedAt,

    // Temperature
    temperature,
    dewPoint,
    thwIndex,
    heatIndex,
    windChill,
    wetBulb,

    // Humidity
    humidity,

    // Wind Speed
    windSpeedLast,
    windSpeedAvgLast1Min,
    windSpeedAvgLast2Min,
    windSpeedAvgLast10Min,
    windSpeedHiLast2Min,
    windSpeedHiLast10Min,
    windSpeedAvgLast24Hours,
    windSpeedHiLast24Hours,

    // Wind Direction
    windDirectionLast,
    windDirectionAvgLast1Min,
    windDirectionAvgLast2Min,
    windDirectionAvgLast10Min,
    windDirectionHiLast2Min,
    windDirectionHiLast10Min,
    windDirectionPrevailing24Hours,

    // Rainfall
    rainRateLast,
    rainfallToday,
    rainfallLast15Min,
    rainfallLast60Min,
    rainfallLast24Hours,
    rainfallMonth,
    rainfallYear,

    // Additional
    windRunDay,
    receptionQuality,
    signalStrength,
    batteryStatus,

    // Barometer
    barometricPressure,
    barometricPressureAbsolute,
    barometricTrend,
    barometricOffset,

    // Indoor
    indoorTemperature,
    indoorHumidity,
    indoorDewPoint,
    indoorHeatIndex,
    indoorWetBulb,

    // System
    systemHealth,

    // Historic
    historicRecords,
    historicBarometerRecords,

    // Fetch time
    lastFetchTime,
  };
});
