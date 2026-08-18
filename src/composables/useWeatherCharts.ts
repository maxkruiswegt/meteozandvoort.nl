import type { IssArchive, BarometerArchive } from '@/types/weatherlink';
import { convertFahrenheitToCelsius, convertMphToKmh, convertInHgToHpa } from '@/utils/weather';

// ApexCharts config lives in JS, so CSS custom properties can't be used here;
// these mirror the tokens in assets/main.css.
const COLORS = {
  text: '#9daabf',
  textFaint: '#6b7690',
  grid: 'rgba(148, 163, 199, 0.12)',
  temperature: '#f9b449',
  dewPoint: '#4aa3fc',
  wind: '#5fcef9',
  gust: '#f9b449',
  pressure: '#b18cff',
  humidity: '#48bafe',
  rain: '#4aa3fc',
};

const FONT = "'Inter Variable', system-ui, sans-serif";

export interface ChartPoint {
  x: number;
  y: number | null;
}

export interface ChartSeries {
  name: string;
  data: ChartPoint[];
  color?: string;
}

const nlNumber = (decimals: number) => (value: number | null) =>
  value === null || value === undefined
    ? ''
    : value.toLocaleString('nl-NL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: false,
      });

const round1 = (value: number | null): number | null => (value === null ? null : Math.round(value * 10) / 10);

const toC = (f: number | null | undefined): number | null =>
  f === null || f === undefined ? null : round1(convertFahrenheitToCelsius(f));

const toKmh = (mph: number | null | undefined): number | null =>
  mph === null || mph === undefined ? null : round1(convertMphToKmh(mph));

const toHpa = (inHg: number | null | undefined): number | null =>
  inHg === null || inHg === undefined ? null : round1(convertInHgToHpa(inHg));

export function useWeatherCharts() {
  const baseOptions = (unit: string, decimals = 1): Record<string, unknown> => ({
    chart: {
      background: 'transparent',
      fontFamily: FONT,
      foreColor: COLORS.text,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      parentHeightOffset: 0,
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: 2.5, lineCap: 'round' },
    dataLabels: { enabled: false },
    grid: {
      borderColor: COLORS.grid,
      strokeDashArray: 3,
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'HH:mm',
        datetimeUTC: false,
        style: { colors: COLORS.textFaint, fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: nlNumber(decimals),
        style: { colors: COLORS.textFaint, fontSize: '11px' },
      },
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd-MM HH:mm' },
      y: {
        formatter: (value: number | null) => (value === null ? '–' : `${nlNumber(decimals)(value)} ${unit}`),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '12px',
      labels: { colors: COLORS.text },
      markers: { size: 5, shape: 'circle' },
      itemMargin: { horizontal: 10 },
    },
  });

  const areaFill = {
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0, opacityFrom: 0.25, opacityTo: 0.02 },
    },
  };

  const temperatureChart = (records: IssArchive[]) => ({
    type: 'area' as const,
    series: [
      {
        name: 'Temperatuur',
        color: COLORS.temperature,
        data: records.map((r) => ({ x: r.ts * 1000, y: toC(r.temp_avg) })),
      },
      {
        name: 'Dauwpunt',
        color: COLORS.dewPoint,
        data: records.map((r) => ({ x: r.ts * 1000, y: toC(r.dew_point_last) })),
      },
    ],
    options: {
      ...baseOptions('°C'),
      ...areaFill,
    },
  });

  const windChart = (records: IssArchive[]) => ({
    type: 'area' as const,
    series: [
      {
        name: 'Gemiddeld',
        color: COLORS.wind,
        data: records.map((r) => ({ x: r.ts * 1000, y: toKmh(r.wind_speed_avg) })),
      },
      {
        name: 'Windstoten',
        color: COLORS.gust,
        data: records.map((r) => ({ x: r.ts * 1000, y: toKmh(r.wind_speed_hi) })),
      },
    ],
    options: {
      ...baseOptions('km/u', 0),
      ...areaFill,
      yaxis: {
        min: 0,
        labels: {
          formatter: nlNumber(0),
          style: { colors: COLORS.textFaint, fontSize: '11px' },
        },
      },
    },
  });

  const pressureChart = (records: BarometerArchive[]) => ({
    type: 'line' as const,
    series: [
      {
        name: 'Luchtdruk',
        color: COLORS.pressure,
        data: records.map((r) => ({ x: r.ts * 1000, y: toHpa(r.bar_sea_level) })),
      },
    ],
    options: {
      ...baseOptions('hPa'),
      legend: { show: false },
    },
  });

  const humidityChart = (records: IssArchive[]) => ({
    type: 'area' as const,
    series: [
      {
        name: 'Luchtvochtigheid',
        color: COLORS.humidity,
        data: records.map((r) => ({ x: r.ts * 1000, y: round1(r.hum_last ?? null) })),
      },
    ],
    options: {
      ...baseOptions('%', 0),
      ...areaFill,
      legend: { show: false },
      yaxis: {
        max: 100,
        labels: {
          formatter: nlNumber(0),
          style: { colors: COLORS.textFaint, fontSize: '11px' },
        },
      },
    },
  });

  const rainChart = (records: IssArchive[]) => ({
    type: 'bar' as const,
    series: [
      {
        name: 'Neerslag',
        color: COLORS.rain,
        data: records.map((r) => ({ x: r.ts * 1000, y: r.rainfall_mm ?? 0 })),
      },
    ],
    options: {
      ...baseOptions('mm', 2),
      legend: { show: false },
      stroke: { show: false },
      plotOptions: {
        bar: { columnWidth: '60%', borderRadius: 2 },
      },
    },
  });

  return { temperatureChart, windChart, pressureChart, humidityChart, rainChart };
}
