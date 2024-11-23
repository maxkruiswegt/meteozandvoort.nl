import api from '@/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWeatherStore = defineStore('weather', () => {
  const currentWeatherData = ref(null);
  const historicWeatherData = ref(null);
  const isLoading = ref(false);

  async function fetchCurrentWeather() {
    isLoading.value = true;
    try {
      const response = await api.get('/current');
      currentWeatherData.value = response.data;
    } finally {
      isLoading.value = false;
    }
  }

  // Timestamp can be a maximum of 24 hour range.
  // It will send each current weather data recorded in the last 24 hours.
  // So that is 1 record per minute means 1440 records.
  // Example: https://api.meteozandvoort.nl/historic?start-timestamp=1724305509&end-timestamp=1724309109
  async function fetchHistoricWeather(startTimestamp, endTimestamp) {
    isLoading.value = true;
    try {
      const response = await api.get('/historic', {
        params: {
          'start-timestamp': startTimestamp,
          'end-timestamp': endTimestamp,
        },
      });
      historicWeatherData.value = response.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchHistoricWeatherForLast24Hours() {
    const now = Math.floor(Date.now() / 1000); // current unix time
    const twentyFourHoursAgo = now - 24 * 60 * 60; // unix time 24 hours ago
    await fetchHistoricWeather(twentyFourHoursAgo, now);
  }

  // getters based on the current weather data
  const lastUpdated = computed(() => {
    if (!currentWeatherData.value) return null;
    return new Date(currentWeatherData.value.sensors[0].data[0].ts * 1000);
  });

  const temperature = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].temp;
  });

  const dewPoint = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].dew_point;
  });

  const thwIndex = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].thw_index;
  });

  const humidity = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].hum;
  });

  const windSpeedLast = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].wind_speed_last;
  });

  const windSpeedAvgLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0]
      .wind_speed_avg_last_10_min;
  });

  const windSpeedHiLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0]
      .wind_speed_hi_last_10_min;
  });

  const windSpeedAvgLast24Hours = computed(() => {
    if (!historicWeatherData.value) return null;

    const windSpeeds = historicWeatherData.value.sensors
      .filter((sensor) => sensor.sensor_type === 43)
      .flatMap((sensor) => sensor.data.map((data) => data.wind_speed_avg))
      .filter((speed) => speed !== null && speed !== undefined);

    const sum = windSpeeds.reduce((total, speed) => total + speed, 0);
    return sum / windSpeeds.length;
  });

  const windSpeedHiLast24Hours = computed(() => {
    if (!historicWeatherData.value) return null;

    const windSpeeds = historicWeatherData.value.sensors
      .filter((sensor) => sensor.sensor_type === 43)
      .flatMap((sensor) => sensor.data.map((data) => data.wind_speed_hi))
      .filter((speed) => speed !== null && speed !== undefined);

    if (windSpeeds.length === 0) return null;

    return Math.max(...windSpeeds);
  });

  const windDirectionLast = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].wind_dir_last;
  });

  const windDirectionAvgLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0]
      .wind_dir_scalar_avg_last_10_min;
  });

  const windDirectionHiLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0]
      .wind_dir_at_hi_speed_last_10_min;
  });

  const windDirectionAvgLast24Hours = computed(() => {
    if (!historicWeatherData.value) return null;

    const windDirections = historicWeatherData.value.sensors
      .filter((sensor) => sensor.sensor_type === 43)
      .flatMap((sensor) => sensor.data.map((data) => data.wind_dir_of_avg))
      .filter((direction) => direction !== null && direction !== undefined);

    const sum = windDirections.reduce((total, direction) => total + direction, 0);
    return sum / windDirections.length;
  });

  const windDirectionHiLast24Hours = computed(() => {
    if (!historicWeatherData.value) return null;

    const windDirections = historicWeatherData.value.sensors
      .filter((sensor) => sensor.sensor_type === 43)
      .flatMap((sensor) => sensor.data.map((data) => data.wind_dir_of_prevail))
      .filter((direction) => direction !== null && direction !== undefined);

    return Math.max(...windDirections);
  });

  const rainRateLast = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].rain_rate_last_mm;
  });

  const rainfallToday = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 43).data[0].rainfall_day_mm;
  });

  const barometricPressure = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 242).data[0].bar_sea_level;
  });

  const barometricTrend = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find((sensor) => sensor.sensor_type === 242).data[0].bar_trend;
  });

  return {
    currentWeatherData,
    historicWeatherData,
    isLoading,
    fetchCurrentWeather,
    fetchHistoricWeather,
    fetchHistoricWeatherForLast24Hours,
    lastUpdated,
    temperature,
    dewPoint,
    thwIndex,
    humidity,
    windSpeedLast,
    windSpeedAvgLast10Min,
    windSpeedHiLast10Min,
    windSpeedAvgLast24Hours,
    windSpeedHiLast24Hours,
    windDirectionLast,
    windDirectionAvgLast10Min,
    windDirectionHiLast10Min,
    windDirectionAvgLast24Hours,
    windDirectionHiLast24Hours,
    rainRateLast,
    rainfallToday,
    barometricPressure,
    barometricTrend,
  };
});
