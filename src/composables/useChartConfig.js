import { CHART_COLORS } from '@/utils/constants';
import { useUIStore } from '@/stores/UIStore';
import { CONVERSION_FACTORS } from '@/utils/constants';
import dayjs from 'dayjs';

export function useChartConfig() {
  const uiStore = useUIStore();

  const getBaseChartOptions = (title, decimals = 1) => ({
    chart: {
      type: 'line',
      toolbar: {
        show: true
      },
      zoom: { enabled: true },
      animations: { enabled: true },
    },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      type: 'datetime',
      labels: { format: 'HH:mm', datetimeUTC: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          if (value === null || value === undefined) return '';
          return value.toFixed(decimals);
        },
      },
    },
    tooltip: {
      x: { format: 'dd/MM HH:mm' },
      y: {
        formatter: (value) => {
          if (value === null || value === undefined) return '';
          return value.toFixed(decimals);
        },
      },
    },
    legend: {
      position: 'top'
    },
    theme: { mode: uiStore.isDarkMode ? 'dark' : 'light' },
  });

  const prepareTemperatureChartData = (historicRecords) => {
    const series = [
      { name: 'Temperatuur', data: [], color: CHART_COLORS.TEMPERATURE },
      { name: 'Dauwpunt', data: [], color: CHART_COLORS.DEW_POINT },
      { name: 'Hitte Index', data: [], color: CHART_COLORS.HEAT_INDEX },
      { name: 'Gevoelstemperatuur', data: [], color: CHART_COLORS.WIND_CHILL },
    ];

    historicRecords.forEach((record) => {
      const timestamp = record.ts * 1000;
      const convert = (f) => {
        if (f === null || f === undefined) return null;
        const converted = uiStore.useMetric ? CONVERSION_FACTORS.F_TO_C(f) : f;
        return Math.round(converted * 10) / 10; // Round to 1 decimal
      };

      series[0].data.push({ x: timestamp, y: convert(record.temp_last) });
      series[1].data.push({ x: timestamp, y: convert(record.dew_point_last) });
      series[2].data.push({ x: timestamp, y: convert(record.heat_index_last) });
      series[3].data.push({ x: timestamp, y: convert(record.wind_chill_last) });
    });

    return series;
  };

  const prepareWindSpeedChartData = (historicRecords) => {
    const series = [
      { name: 'Gemiddeld', data: [], color: CHART_COLORS.WIND_SPEED },
      { name: 'Windstoot', data: [], color: CHART_COLORS.WIND_GUST },
    ];

    historicRecords.forEach((record) => {
      const timestamp = record.ts * 1000;
      const convert = (mph) => {
        if (mph === null || mph === undefined) return null;
        const converted = uiStore.useMetric ? mph * CONVERSION_FACTORS.MPH_TO_KMH : mph;
        return Math.round(converted * 10) / 10; // Round to 1 decimal
      };

      series[0].data.push({ x: timestamp, y: convert(record.wind_speed_avg) });
      series[1].data.push({ x: timestamp, y: convert(record.wind_speed_hi) });
    });

    return series;
  };

  const preparePressureChartData = (barometerRecords) => {
    const series = [{ name: 'Luchtdruk', data: [], color: CHART_COLORS.PRESSURE }];

    barometerRecords.forEach((record) => {
      const timestamp = record.ts * 1000;
      let value = uiStore.useMetric
        ? record.bar_sea_level * CONVERSION_FACTORS.INHG_TO_MB
        : record.bar_sea_level;

      // Round to 1 decimal
      value = value !== null && value !== undefined ? Math.round(value * 10) / 10 : null;
      series[0].data.push({ x: timestamp, y: value });
    });

    return series;
  };

  const prepareHumidityChartData = (historicRecords) => {
    const series = [{ name: 'Luchtvochtigheid', data: [], color: CHART_COLORS.HUMIDITY }];

    historicRecords.forEach((record) => {
      const timestamp = record.ts * 1000;
      const value = record.hum_last !== null && record.hum_last !== undefined
        ? Math.round(record.hum_last * 10) / 10
        : null;
      series[0].data.push({ x: timestamp, y: value });
    });

    return series;
  };

  const prepareRainfallChartData = (historicRecords) => {
    const series = [{ name: 'Regenval', data: [], color: CHART_COLORS.RAINFALL }];

    historicRecords.forEach((record) => {
      const timestamp = record.ts * 1000;
      let value = uiStore.useMetric ? record.rainfall_mm : record.rainfall_in;
      // Round to 2 decimals for rainfall (more precision needed)
      value = value !== null && value !== undefined ? Math.round(value * 100) / 100 : 0;
      series[0].data.push({ x: timestamp, y: value });
    });

    return series;
  };

  return {
    getBaseChartOptions,
    prepareTemperatureChartData,
    prepareWindSpeedChartData,
    preparePressureChartData,
    prepareHumidityChartData,
    prepareRainfallChartData,
  };
}
