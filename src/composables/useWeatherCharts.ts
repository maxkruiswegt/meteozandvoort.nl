import * as SunCalc from 'suncalc';
import type { IssArchive, BarometerArchive } from '@/types/weatherlink';
import { convertFahrenheitToCelsius, convertMphToKmh, convertInHgToHpa } from '@/utils/weather';

// ApexCharts config lives in JS, so CSS custom properties can't be used here;
// these mirror the tokens in assets/main.css.
const COLORS = {
  text: '#9daabf',
  textFaint: '#7f8aa3',
  grid: 'rgba(148, 163, 199, 0.12)',
  temperature: '#f9b449',
  dewPoint: '#4aa3fc',
  wind: '#5fcef9',
  gust: '#f9b449',
  pressure: '#d8cbb4',
  humidity: '#48bafe',
  rain: '#4aa3fc',
};

const FONT = "'Archivo Variable', system-ui, sans-serif";

const ZANDVOORT = { lat: 52.374, lon: 4.533 };
const DAY_MS = 24 * 60 * 60 * 1000;

const timeLabel = (ms: number): string =>
  new Date(ms).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

/**
 * Sunrise/sunset boundary markers for the plotted range, as labelled xaxis
 * line annotations ("☀ 06:45" / "☾ 20:30"). yr.no and KNMI carry day/night
 * this way; a shaded night band reads as a rendering artifact.
 */
const sunMarkers = (records: { ts: number }[]): Record<string, unknown>[] => {
  const first = records[0];
  const last = records[records.length - 1];
  if (!first || !last) return [];
  const startMs = first.ts * 1000;
  const endMs = last.ts * 1000;
  const markers: Record<string, unknown>[] = [];

  const marker = (x: number, glyph: string, color: string): Record<string, unknown> => ({
    x,
    borderColor: color,
    strokeDashArray: 2,
    label: {
      text: `${glyph} ${timeLabel(x)}`,
      orientation: 'horizontal',
      borderWidth: 0,
      offsetY: -4,
      style: { background: 'transparent', color: COLORS.textFaint, fontSize: '10px' },
    },
  });

  for (let t = startMs - DAY_MS; t <= endMs + DAY_MS; t += DAY_MS) {
    const times = SunCalc.getTimes(new Date(t), ZANDVOORT.lat, ZANDVOORT.lon);
    const sunrise = times?.sunrise?.getTime();
    const sunset = times?.sunset?.getTime();
    if (sunrise && sunrise > startMs && sunrise < endMs) {
      markers.push(marker(sunrise, '☀', 'rgba(249, 180, 73, 0.45)'));
    }
    if (sunset && sunset > startMs && sunset < endMs) {
      markers.push(marker(sunset, '☾', 'rgba(127, 138, 163, 0.45)'));
    }
  }

  return markers;
};

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
    // Straight segments: this is 15-minute archive data, splines would invent
    // values between samples.
    stroke: { curve: 'straight', width: 1.75, lineCap: 'butt' },
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
      annotations: {
        xaxis: sunMarkers(records),
        // Freezing line; clipped away automatically when the axis range stays above 0 °C.
        yaxis: [{ y: 0, borderColor: 'rgba(95, 206, 249, 0.45)', strokeDashArray: 4 }],
      },
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
      // Gusts as a distinct visual class: thinner and dashed.
      stroke: { curve: 'straight', width: [1.75, 1.25], lineCap: 'butt', dashArray: [0, 4] },
      annotations: { xaxis: sunMarkers(records) },
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
      annotations: {
        xaxis: sunMarkers(records),
        // Standard sea-level pressure reference.
        yaxis: [
          {
            y: 1013.25,
            borderColor: 'rgba(157, 170, 191, 0.4)',
            strokeDashArray: 4,
            label: {
              text: '1013 hPa',
              position: 'left',
              offsetX: 6,
              textAnchor: 'start',
              borderWidth: 0,
              style: { background: 'transparent', color: '#6b7690', fontSize: '10px' },
            },
          },
        ],
      },
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
      annotations: { xaxis: sunMarkers(records) },
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
        data: records.map((r) => ({ x: r.ts * 1000, y: r.rainfall_mm ?? null })),
      },
    ],
    options: {
      ...baseOptions('mm', 2),
      legend: { show: false },
      annotations: { xaxis: sunMarkers(records) },
      stroke: { show: false },
      plotOptions: {
        bar: { columnWidth: '60%', borderRadius: 2 },
      },
    },
  });

  return { temperatureChart, windChart, pressureChart, humidityChart, rainChart };
}
