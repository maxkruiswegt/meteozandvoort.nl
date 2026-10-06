import * as SunCalc from 'suncalc';
import { useTheme } from '@/composables/useTheme';
import type { IssArchive, BarometerArchive } from '@/types/weatherlink';
import { convertFahrenheitToCelsius, convertMphToKmh, convertInHgToHpa } from '@/utils/weather';

// ApexCharts needs concrete colour strings (it parses them for gradients and
// writes them into SVG attributes), so the CSS tokens in assets/main.css are
// resolved at build time. CSS stays the single source of truth per theme.
const cssVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const readThemePalette = () => ({
  text: cssVar('--text-secondary'),
  textFaint: cssVar('--text-faint'),
  grid: cssVar('--chart-grid'),
  temperature: cssVar('--data-temperature'),
  dewPoint: cssVar('--data-dewpoint'),
  wind: cssVar('--data-wind'),
  gust: cssVar('--data-gust'),
  pressure: cssVar('--data-pressure'),
  humidity: cssVar('--data-humidity'),
  rain: cssVar('--data-rain'),
  markerLine: cssVar('--chart-marker-line'),
  sun: cssVar('--chart-sun'),
  moon: cssVar('--chart-moon'),
  freezeLine: cssVar('--chart-freeze-line'),
  refLine: cssVar('--chart-ref-line'),
});

type Palette = ReturnType<typeof readThemePalette>;

const FONT = "'Archivo Variable', system-ui, sans-serif";

const ZANDVOORT = { lat: 52.374, lon: 4.533 };
const DAY_MS = 24 * 60 * 60 * 1000;

const timeLabel = (ms: number): string =>
  new Date(ms).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

interface SunEvents {
  sunrise: number | null;
  sunset: number | null;
}

/** Sunrise/sunset instants that fall inside the plotted range (ms). */
const sunEvents = (records: { ts: number }[]): SunEvents => {
  const first = records[0];
  const last = records[records.length - 1];
  if (!first || !last) return { sunrise: null, sunset: null };
  const startMs = first.ts * 1000;
  const endMs = last.ts * 1000;
  let sunrise: number | null = null;
  let sunset: number | null = null;

  for (let t = startMs - DAY_MS; t <= endMs + DAY_MS; t += DAY_MS) {
    const times = SunCalc.getTimes(new Date(t), ZANDVOORT.lat, ZANDVOORT.lon);
    const rise = times?.sunrise?.getTime();
    const set = times?.sunset?.getTime();
    if (rise && rise > startMs && rise < endMs) sunrise = rise;
    if (set && set > startMs && set < endMs) sunset = set;
  }

  return { sunrise, sunset };
};

/**
 * Sunrise/sunset markers: solid hairlines with a glyph at the plot floor.
 * Annotation ink stays below gridline ink; the exact times live in the card
 * caption instead of floating labels inside the plot.
 */
const sunMarkers = (records: { ts: number }[], c: Palette): Record<string, unknown>[] => {
  const { sunrise, sunset } = sunEvents(records);
  const markers: Record<string, unknown>[] = [];

  const marker = (x: number, glyph: string, glyphColor: string, fontSize: string): Record<string, unknown> => ({
    x,
    borderColor: c.markerLine,
    borderWidth: 1,
    strokeDashArray: 0,
    label: {
      // U+FE0E forces monochrome text rendering instead of color emoji.
      text: glyph + '︎',
      orientation: 'horizontal',
      position: 'bottom',
      offsetY: -5,
      textAnchor: 'middle',
      borderWidth: 0,
      style: {
        background: 'transparent',
        color: glyphColor,
        fontSize,
        padding: { left: 0, right: 0, top: 0, bottom: 0 },
      },
    },
  });

  // Font sizes tuned so both glyphs render at the same visual size.
  if (sunrise) markers.push(marker(sunrise, '☀', c.sun, '13px'));
  // U+23FE: the only filled crescent with a text presentation.
  if (sunset) markers.push(marker(sunset, '⏾', c.moon, '10px'));

  return markers;
};

/** Formatted sunrise/sunset times for the plotted range, for display in the hero. */
const sunTimes = (records: { ts: number }[]): { sunrise: string | null; sunset: string | null } => {
  const { sunrise, sunset } = sunEvents(records);
  return {
    sunrise: sunrise ? timeLabel(sunrise) : null,
    sunset: sunset ? timeLabel(sunset) : null,
  };
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
  const { isDark } = useTheme();

  // Reading the theme makes the chart computeds in Home.vue depend on it, so
  // they rebuild with the other theme's tokens when it switches.
  const readPalette = () => {
    void isDark.value;
    return readThemePalette();
  };

  const baseOptions = (c: Palette, unit: string, decimals = 1): Record<string, unknown> => {
    // Apex has its own light/dark chrome (tooltips, crosshairs); follow the CSS theme.
    const mode = cssVar('--chart-theme') === 'dark' ? 'dark' : 'light';
    return {
      chart: {
        background: 'transparent',
        fontFamily: FONT,
        foreColor: c.text,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
        parentHeightOffset: 0,
      },
      theme: { mode },
      // Straight segments: this is 15-minute archive data, splines would invent
      // values between samples.
      stroke: { curve: 'straight', width: 1.75, lineCap: 'butt' },
      dataLabels: { enabled: false },
      grid: {
        borderColor: c.grid,
        strokeDashArray: 3,
        padding: { left: 8, right: 8 },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'HH:mm',
          datetimeUTC: false,
          style: { colors: c.textFaint, fontSize: '11px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          formatter: nlNumber(decimals),
          style: { colors: c.textFaint, fontSize: '11px' },
        },
      },
      tooltip: {
        theme: mode,
        x: { format: 'dd-MM HH:mm' },
        y: {
          formatter: (value: number | null) => (value === null ? '–' : `${nlNumber(decimals)(value)} ${unit}`),
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        labels: { colors: c.text },
        markers: { size: 5, shape: 'circle' },
        itemMargin: { horizontal: 10 },
      },
    };
  };

  const areaFill = {
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0, opacityFrom: 0.25, opacityTo: 0.02 },
    },
  };

  const yLabels = (c: Palette, decimals: number) => ({
    formatter: nlNumber(decimals),
    style: { colors: c.textFaint, fontSize: '11px' },
  });

  const temperatureChart = (records: IssArchive[]) => {
    const c = readPalette();
    return {
      type: 'area' as const,
      series: [
        {
          name: 'Temperatuur',
          color: c.temperature,
          data: records.map((r) => ({ x: r.ts * 1000, y: toC(r.temp_avg) })),
        },
        {
          name: 'Dauwpunt',
          color: c.dewPoint,
          data: records.map((r) => ({ x: r.ts * 1000, y: toC(r.dew_point_last) })),
        },
      ],
      options: {
        ...baseOptions(c, '°C'),
        ...areaFill,
        annotations: {
          xaxis: sunMarkers(records, c),
          // Freezing line; clipped away automatically when the axis range stays above 0 °C.
          yaxis: [{ y: 0, borderColor: c.freezeLine, strokeDashArray: 4 }],
        },
      },
    };
  };

  const windChart = (records: IssArchive[]) => {
    const c = readPalette();
    return {
      type: 'area' as const,
      series: [
        {
          name: 'Gemiddeld',
          color: c.wind,
          data: records.map((r) => ({ x: r.ts * 1000, y: toKmh(r.wind_speed_avg) })),
        },
        {
          name: 'Windstoten',
          color: c.gust,
          data: records.map((r) => ({ x: r.ts * 1000, y: toKmh(r.wind_speed_hi) })),
        },
      ],
      options: {
        ...baseOptions(c, 'km/u', 0),
        ...areaFill,
        // Gusts as a distinct visual class: thinner and dashed.
        stroke: { curve: 'straight', width: [1.75, 1.25], lineCap: 'butt', dashArray: [0, 4] },
        annotations: { xaxis: sunMarkers(records, c) },
        yaxis: { min: 0, labels: yLabels(c, 0) },
      },
    };
  };

  const pressureChart = (records: BarometerArchive[]) => {
    const c = readPalette();
    return {
      type: 'line' as const,
      series: [
        {
          name: 'Luchtdruk',
          color: c.pressure,
          data: records.map((r) => ({ x: r.ts * 1000, y: toHpa(r.bar_sea_level) })),
        },
      ],
      options: {
        ...baseOptions(c, 'hPa'),
        legend: { show: false },
        annotations: {
          xaxis: sunMarkers(records, c),
          // Standard sea-level pressure reference.
          yaxis: [
            {
              y: 1013.25,
              borderColor: c.refLine,
              strokeDashArray: 4,
              label: {
                text: '1013 hPa',
                position: 'left',
                offsetX: 6,
                textAnchor: 'start',
                borderWidth: 0,
                style: { background: 'transparent', color: c.textFaint, fontSize: '10px' },
              },
            },
          ],
        },
      },
    };
  };

  const humidityChart = (records: IssArchive[]) => {
    const c = readPalette();
    return {
      type: 'area' as const,
      series: [
        {
          name: 'Luchtvochtigheid',
          color: c.humidity,
          data: records.map((r) => ({ x: r.ts * 1000, y: round1(r.hum_last ?? null) })),
        },
      ],
      options: {
        ...baseOptions(c, '%', 0),
        ...areaFill,
        legend: { show: false },
        annotations: { xaxis: sunMarkers(records, c) },
        yaxis: { max: 100, labels: yLabels(c, 0) },
      },
    };
  };

  const rainChart = (records: IssArchive[]) => {
    const c = readPalette();
    return {
      type: 'bar' as const,
      series: [
        {
          name: 'Neerslag',
          color: c.rain,
          data: records.map((r) => ({ x: r.ts * 1000, y: r.rainfall_mm ?? null })),
        },
      ],
      options: {
        ...baseOptions(c, 'mm', 2),
        legend: { show: false },
        annotations: { xaxis: sunMarkers(records, c) },
        stroke: { show: false },
        plotOptions: {
          bar: { columnWidth: '60%', borderRadius: 2 },
        },
      },
    };
  };

  return { temperatureChart, windChart, pressureChart, humidityChart, rainChart, sunTimes };
}
