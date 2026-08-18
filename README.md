# Meteo Zandvoort

Live weather dashboard for Zandvoort, powered by the personal Davis weather station of Herman Kruiswegt. The station reports every minute; the site shows current conditions, 24-hour meteograms, and a historic data browser.

Live at [meteozandvoort.nl](https://meteozandvoort.nl).

## Features

- **Current conditions**: temperature (colored by a CVD-safe temperature ramp), feels-like (THW), 24h min/max, wind compass with Beaufort force (KNMI scale), pressure with 3-hour trend, humidity, dew point and rainfall.
- **24-hour meteograms**: temperature/dew point, wind and gusts, rainfall, pressure (with 1013 hPa reference) and humidity — with night shading computed from actual Zandvoort sunrise/sunset times.
- **Details**: dense station readout with rain accumulations (hour/day/month/year), wind statistics and indoor conditions.
- **Live beachcam** (stream by Reddingsbrigade Bloemendaal).
- **Historic browser** (`/historisch`): pick any day, browse 15-minute archive records, export CSV.
- **Raw data view** (`/huidig`): every sensor field, raw and formatted.
- Auto-refresh every 60 seconds (paused while the tab is hidden).

## Stack

- Vue 3 + TypeScript (strict), Vite 8, Pinia, Vue Router
- PrimeVue **4.5.5** — pinned deliberately: PrimeVue 5+ uses the non-MIT PrimeUI license. Do not upgrade across that boundary without checking the licensing consequences.
- ApexCharts 6 (chart animations disabled deliberately; re-test before enabling)
- video.js (lazily loaded) for the beachcam HLS stream
- Archivo (variable font, tabular figures) via Fontsource; Lucide icons

## Development

```bash
npm install
npm run dev          # dev server
npm run type-check   # vue-tsc
npm run build        # type-check + production build
npm run preview      # serve the production build
```

Requires Node `^20.19.0 || ^22.12.0 || >=24`. CI deploys `main` via GitHub Actions (Node 24, `npm ci`).

## Backend

`api.meteozandvoort.nl` is a reverse proxy in front of the WeatherLink v2 API:

- `GET /current` — current conditions for all sensors
- `GET /historic?start-timestamp={unix}&end-timestamp={unix}` — 15-minute archive records, max 24 hours per query

See [CLAUDE.md](CLAUDE.md) for full API and sensor documentation, and [current-endpoint-example.md](current-endpoint-example.md) / [historic-endpoint-example.md](historic-endpoint-example.md) for example payloads.

## Credits

Weather data: **Herman Kruiswegt** (Davis station, Zandvoort). Site: [Max Kruiswegt](https://maxkruiswegt.com). Beachcam: [Reddingsbrigade Bloemendaal](https://reddingsbrigade-bloemendaal.nl/beachcam/).

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
