# CLAUDE.md - Weather Data System Documentation

This document provides comprehensive documentation about how the Meteo Zandvoort weather data system works, including API structure, data flow, sensor types, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Endpoints](#api-endpoints)
3. [Sensor Types and Data Fields](#sensor-types-and-data-fields)
4. [Data Flow](#data-flow)
5. [Units and Conversions](#units-and-conversions)
6. [Weather Metrics Explained](#weather-metrics-explained)
7. [Developer Notes](#developer-notes)

---

## Architecture Overview

### System Components

```
Weather Station (Zandvoort)
    ↓
WeatherLink v2 API (api.weatherlink.com)
    ↓
Backend Reverse Proxy (api.meteozandvoort.nl)
    ↓
Frontend Vue Application (meteozandvoort.nl)
    ↓
User Browser
```

### Backend Reverse Proxy

**Location**: `api.meteozandvoort.nl`

**Purpose**:
- Acts as a reverse proxy to WeatherLink v2 API
- Hides API credentials from frontend
- Provides simplified endpoints without authentication complexity
- Enables CORS policy management
- Allows for future caching/rate limiting

**Endpoints Provided**:
- `GET /current` - Current weather conditions
- `GET /historic?start-timestamp={unix}&end-timestamp={unix}` - Historical data

---

## API Endpoints

### 1. Current Weather Endpoint

**URL**: `https://api.meteozandvoort.nl/current`

**Method**: GET

**Response Structure**:
```json
{
  "station_id": 189639,
  "station_id_uuid": "35a9a8d0-241c-449b-b844-ed5efed3b3ce",
  "sensors": [
    {
      "lsid": 745161,
      "sensor_type": 43,
      "data_structure_type": 23,
      "data": [{ /* single current reading */ }]
    }
  ],
  "generated_at": 1759590395
}
```

**Characteristics**:
- Returns **single data point** per sensor (current snapshot)
- Updated every minute
- Instant/last readings (e.g., `wind_speed_last`, `temp`)
- Short-term averages (1-min, 2-min, 10-min)

**Example Data Record** (Sensor Type 43):
See [current-endpoint-example.md](current-endpoint-example.md) for full example.

### 2. Historic Weather Endpoint

**URL**: `https://api.meteozandvoort.nl/historic?start-timestamp={start}&end-timestamp={end}`

**Method**: GET

**Query Parameters**:
- `start-timestamp` - Unix timestamp (seconds) for start of range
- `end-timestamp` - Unix timestamp (seconds) for end of range
- **Maximum range**: 24 hours
- **Important**: Timestamps represent the **end** of recording intervals
- Query returns records where: `timestamp > start AND timestamp <= end`

**Response Structure**:
```json
{
  "station_id": 189639,
  "station_id_uuid": "35a9a8d0-241c-449b-b844-ed5efed3b3ce",
  "sensors": [
    {
      "lsid": 745161,
      "sensor_type": 43,
      "data_structure_type": 24,
      "data": [
        { "ts": 1759529700, "arch_int": 900, /* 15-min archive */ },
        { "ts": 1759530600, "arch_int": 900, /* 15-min archive */ }
      ]
    }
  ],
  "generated_at": 1759590682
}
```

**Characteristics**:
- Returns **multiple data points** per sensor (time series)
- Archive interval: **15 minutes** (`arch_int: 900` seconds)
- Contains aggregated data: averages, highs, lows, totals
- Includes `_at` timestamps showing when extremes occurred

**Example Data Record** (Sensor Type 43):
See [historic-endpoint-example.md](historic-endpoint-example.md) for full example.

---

## Sensor Types and Data Fields

### Sensor Type 43: ISS (Integrated Sensor Suite)

**LSID**: 745161
**Transmitter ID**: 1
**Data Structure Types**: 23 (current), 24 (historic)

This is the main outdoor weather sensor providing temperature, humidity, wind, and rain data.

#### Temperature Fields (°F)

| Field | Description | Source |
|-------|-------------|--------|
| `temp` | Current air temperature | Current |
| `temp_last` | Last recorded temperature | Historic |
| `temp_avg` | Average temperature over archive interval | Historic |
| `temp_hi` | Highest temperature in archive interval | Historic |
| `temp_lo` | Lowest temperature in archive interval | Historic |
| `temp_hi_at` | Unix timestamp when high occurred | Historic |
| `temp_lo_at` | Unix timestamp when low occurred | Historic |
| `dew_point` | Current dew point temperature | Current |
| `dew_point_last` | Last dew point | Historic |
| `dew_point_hi` / `dew_point_lo` | High/low dew point | Historic |
| `thw_index` | **Temperature-Humidity-Wind index** (feels-like) | Current |
| `thw_index_last` | Last THW index | Historic |
| `thw_index_hi` / `thw_index_lo` | High/low THW index | Historic |
| `heat_index` | Heat index calculation | Current |
| `wind_chill` | Wind chill calculation | Current |
| `wet_bulb` | Wet bulb temperature | Current |

**Code Usage**:
```javascript
// In WeatherStore.js
temperature: currentWeatherData.sensors.find(s => s.sensor_type === 43).data[0].temp
thwIndex: currentWeatherData.sensors.find(s => s.sensor_type === 43).data[0].thw_index
dewPoint: currentWeatherData.sensors.find(s => s.sensor_type === 43).data[0].dew_point
```

#### Humidity Fields (%)

| Field | Description | Source |
|-------|-------------|--------|
| `hum` | Current relative humidity | Current |
| `hum_last` | Last humidity reading | Historic |
| `hum_hi` / `hum_lo` | High/low humidity | Historic |
| `hum_hi_at` / `hum_lo_at` | Timestamps of extremes | Historic |

#### Wind Speed Fields (mph)

| Field | Description | Source |
|-------|-------------|--------|
| `wind_speed_last` | Most recent wind speed | Current |
| `wind_speed_avg_last_1_min` | 1-minute average | Current |
| `wind_speed_avg_last_2_min` | 2-minute average | Current |
| `wind_speed_avg_last_10_min` | **10-minute average** ⭐ | Current |
| `wind_speed_hi_last_2_min` | 2-minute high | Current |
| `wind_speed_hi_last_10_min` | **10-minute high** ⭐ | Current |
| `wind_speed_avg` | **Archive interval average** ⭐ | Historic |
| `wind_speed_hi` | **Archive interval high** ⭐ | Historic |
| `wind_speed_hi_at` | Timestamp of high | Historic |
| `wind_speed_hi_dir` | Direction when high occurred | Historic |

**⭐ = Used in frontend display**

#### Wind Direction Fields (degrees, 0-360°)

| Field | Description | Source |
|-------|-------------|--------|
| `wind_dir_last` | Most recent direction | Current |
| `wind_dir_scalar_avg_last_1_min` | 1-minute scalar average | Current |
| `wind_dir_scalar_avg_last_2_min` | 2-minute scalar average | Current |
| `wind_dir_scalar_avg_last_10_min` | **10-minute scalar average** ⭐ | Current |
| `wind_dir_at_hi_speed_last_2_min` | Direction at 2-min high speed | Current |
| `wind_dir_at_hi_speed_last_10_min` | **Direction at 10-min high speed** ⭐ | Current |
| `wind_dir_of_avg` | **Direction of average wind** ⭐ | Historic |
| `wind_dir_of_prevail` | **Prevailing direction** ⭐ | Historic |

**Important**: Wind directions are circular (0° = 360° = North), so standard min/max operations don't apply.

#### Rainfall Fields

| Field | Description | Source | Unit |
|-------|-------------|--------|------|
| `rain_size` | Rain collector type (1 = 0.01") | Both | Type code |
| `rain_rate_last_mm` | **Current rain rate** ⭐ | Current | mm/hour |
| `rain_rate_last_in` | Current rain rate | Current | in/hour |
| `rain_rate_last_clicks` | Raw sensor clicks | Current | clicks/hour |
| `rainfall_day_mm` | **Total rain today** ⭐ | Current | mm |
| `rainfall_day_in` | Total rain today | Current | inches |
| `rainfall_day_clicks` | Raw daily clicks | Current | clicks |
| `rainfall_last_15_min_mm` | Last 15 minutes | Current | mm |
| `rainfall_last_60_min_mm` | Last 60 minutes | Current | mm |
| `rainfall_last_24_hr_mm` | Last 24 hours | Current | mm |
| `rainfall_month_mm` | Monthly total | Current | mm |
| `rainfall_year_mm` | Yearly total | Current | mm |
| `rainfall_mm` | **Archive period total** | Historic | mm |
| `rainfall_in` | Archive period total | Historic | inches |

**Rain Rate vs Rainfall**:
- **Rain Rate**: Intensity of current rainfall (mm/hour)
- **Rainfall**: Accumulated precipitation over a time period (mm total)

#### Additional Fields

| Field | Description |
|-------|-------------|
| `wind_run_day` | Total wind run for the day (miles) |
| `solar_rad` | Solar radiation (W/m²) - often null at night |
| `uv_index` | UV index - often null at night |
| `et_day` | Daily evapotranspiration |
| `reception_day` | Signal reception quality (%) |
| `rssi_last` | Signal strength (dBm) |
| `trans_battery_flag` | Transmitter battery status (0=good) |
| `tx_id` | Transmitter ID |
| `ts` | Unix timestamp of reading |
| `tz_offset` | Timezone offset from UTC (seconds) |

---

### Sensor Type 242: Barometer

**LSID**: 745159
**Data Structure Types**: 19 (current), 20 (historic)

Measures atmospheric pressure.

#### Pressure Fields (inches of mercury)

| Field | Description | Source |
|-------|-------------|--------|
| `bar_sea_level` | **Sea-level adjusted pressure** ⭐ | Current |
| `bar_absolute` | Absolute station pressure | Current |
| `bar_trend` | **3-hour pressure trend** ⭐ | Current |
| `bar_offset` | Calibration offset | Current |
| `bar_hi` / `bar_lo` | High/low in archive interval | Historic |
| `bar_hi_at` / `bar_lo_at` | Timestamps of extremes | Historic |

**Barometric Trend Interpretation**:
- **Positive value**: Rising pressure (improving weather)
- **Negative value**: Falling pressure (deteriorating weather)
- Measured over 3-hour period

**Code Usage**:
```javascript
// In WeatherStore.js
barometricPressure: currentWeatherData.sensors.find(s => s.sensor_type === 242).data[0].bar_sea_level
barometricTrend: currentWeatherData.sensors.find(s => s.sensor_type === 242).data[0].bar_trend
```

---

### Sensor Type 365: Indoor Temperature/Humidity

**LSID**: 745160
**Data Structure Types**: 21 (current), 22 (historic)

Measures indoor conditions.

#### Indoor Fields

| Field | Description |
|-------|-------------|
| `temp_in` | Indoor temperature (°F) |
| `hum_in` | Indoor humidity (%) |
| `dew_point_in` | Indoor dew point (°F) |
| `heat_index_in` | Indoor heat index (°F) |
| `wet_bulb_in` | Indoor wet bulb temperature (°F) |

**Note**: Currently not displayed in the frontend UI.

---

### Sensor Type 509: Health/Status

**LSID**: 745158
**Data Structure Type**: 27

System health and diagnostic information.

#### System Fields

| Field | Description |
|-------|-------------|
| `battery_voltage` | Battery voltage (mV) |
| `battery_percent` | Battery charge (%) |
| `wifi_rssi` | WiFi signal strength (dBm) |
| `console_sw_version` | Software version |
| `os_uptime` | System uptime (seconds) |
| `free_mem` | Available memory (bytes) |
| And many more diagnostic fields... |

**Note**: Not displayed in UI, useful for debugging.

---

## Data Flow

### 1. Weather Station → WeatherLink Cloud

**Frequency**: Every minute

The weather station (Davis Instruments with WeatherLink Live) continuously measures environmental conditions and transmits data to WeatherLink.com servers.

### 2. Frontend Requests Weather Data

**On Page Load**:
```javascript
// In Home.vue onMounted()
await weatherStore.fetchCurrentWeather();
await weatherStore.fetchHistoricWeatherForLast24Hours();
```

**Current Weather Request**:
```javascript
// In WeatherStore.js
async function fetchCurrentWeather() {
  const response = await fetchWithTimeout('/current');
  currentWeatherData.value = response.data;
}
```

**Historic Weather Request**:
```javascript
// In WeatherStore.js
async function fetchHistoricWeatherForLast24Hours() {
  const now = Math.floor(Date.now() / 1000);
  const twentyFourHoursAgo = now - 24 * 60 * 60;
  await fetchHistoricWeather(twentyFourHoursAgo, now);
}
```

### 3. Backend Proxies to WeatherLink API

The backend at `api.meteozandvoort.nl` receives the request and forwards it to WeatherLink v2 API with proper authentication:

```
GET https://api.weatherlink.com/v2/current/{station-id}?api-key={KEY}
Headers: X-Api-Secret: {SECRET}
```

### 4. Data Validation

```javascript
// In WeatherStore.js
function isValidResponse(data) {
  return data && typeof data === 'object' && 'sensors' in data;
}
```

Validates that response contains the expected structure before using it.

### 5. Data Processing with Computed Properties

**Temperature Conversion**:
```javascript
const temperature = computed(() => {
  if (!currentWeatherData.value) return null;
  return currentWeatherData.value.sensors.find(s => s.sensor_type === 43).data[0].temp;
});
```

**24-Hour Wind Speed Average**:
```javascript
const windSpeedAvgLast24Hours = computed(() => {
  const windSpeeds = historicWeatherData.value.sensors
    .filter(s => s.sensor_type === 43)
    .flatMap(s => s.data.map(d => d.wind_speed_avg))
    .filter(speed => speed !== null && speed !== undefined);

  const sum = windSpeeds.reduce((total, speed) => total + speed, 0);
  return sum / windSpeeds.length;
});
```

**24-Hour Wind Speed Maximum**:
```javascript
const windSpeedHiLast24Hours = computed(() => {
  const windSpeeds = historicWeatherData.value.sensors
    .filter(s => s.sensor_type === 43)
    .flatMap(s => s.data.map(d => d.wind_speed_hi))
    .filter(speed => speed !== null && speed !== undefined);

  return Math.max(...windSpeeds);
});
```

### 6. Display in UI

The [Home.vue](src/views/Home.vue) component uses these computed properties with unit conversions:

```vue
<WindComponent
  :windNow="{
    force: convertMphToWindScale(weatherStore.windSpeedLast),
    speed: convertMphToKmh(weatherStore.windSpeedLast),
    direction: {
      name: convertWindDirection(weatherStore.windDirectionLast),
      degrees: weatherStore.windDirectionLast
    }
  }"
/>
```

---

## Units and Conversions

### WeatherLink Native Units

WeatherLink v2 API returns data in **imperial units**:

| Measurement | Native Unit | Reason |
|-------------|-------------|--------|
| Temperature | Fahrenheit (°F) | US standard |
| Wind Speed | Miles per hour (mph) | US standard |
| Pressure | Inches of mercury (inHg) | US standard |
| Rainfall | Millimeters (mm) AND Inches (in) | Both provided |

### Display Units (Metric)

The frontend converts to **metric units** for European users:

| Measurement | Display Unit |
|-------------|--------------|
| Temperature | Celsius (°C) |
| Wind Speed | Kilometers per hour (km/h) |
| Pressure | Millibars (mb) |
| Rainfall | Millimeters (mm) |

### Conversion Functions

Located in [src/utils/weatherUtils.js](src/utils/weatherUtils.js)

#### Temperature: Fahrenheit → Celsius

```javascript
const convertFahrenheitToCelsius = (fahrenheit) => {
  return ((fahrenheit - 32) * 5) / 9;
};
```

**Example**: 54.6°F → 12.6°C

#### Wind Speed: mph → km/h

```javascript
const convertMphToKmh = (mph) => {
  if (typeof mph !== 'number' || !isFinite(mph)) {
    return null;
  }
  return mph * 1.609344;
};
```

**Example**: 22 mph → 35.4 km/h

#### Wind Speed → Beaufort Scale

```javascript
const convertMphToWindScale = (mph) => {
  if (mph === null) return { value: null, description: null };

  switch (true) {
    case mph < 1:  return { value: 0, description: 'stil' };
    case mph < 4:  return { value: 1, description: 'licht' };
    case mph < 8:  return { value: 2, description: 'licht' };
    case mph < 13: return { value: 3, description: 'matig' };
    case mph < 19: return { value: 4, description: 'matig' };
    case mph < 25: return { value: 5, description: 'vrij krachtig' };
    case mph < 32: return { value: 6, description: 'krachtig' };
    case mph < 39: return { value: 7, description: 'hard' };
    case mph < 47: return { value: 8, description: 'stormachtig' };
    case mph < 55: return { value: 9, description: 'storm' };
    case mph < 64: return { value: 10, description: 'zware storm' };
    case mph < 73: return { value: 11, description: 'zeer zware storm' };
    case mph >= 73: return { value: 12, description: 'orkaan' };
    default: return { value: null, description: null };
  }
};
```

**Example**: 22 mph → { value: 4, description: 'matig' }

#### Wind Direction: Degrees → Compass Names

```javascript
const convertWindDirection = (degrees) => {
  const directions = [
    'Noord',      // 0° (North)
    'Noordoost',  // 45° (Northeast)
    'Oost',       // 90° (East)
    'Zuidoost',   // 135° (Southeast)
    'Zuid',       // 180° (South)
    'Zuidwest',   // 225° (Southwest)
    'West',       // 270° (West)
    'Noordwest'   // 315° (Northwest)
  ];
  return directions[Math.round(degrees / 45) % 8];
};
```

**Example**: 263° → 'West'

**Compass Rose**:
```
        Noord (0°/360°)
            |
Noordwest   |   Noordoost
    315°    |    45°
            |
West -------+------- Oost
    270°    |    90°
            |
Zuidwest    |   Zuidoost
    225°    |    135°
            |
        Zuid (180°)
```

#### Pressure: Inches Hg → Millibars

```javascript
const convertInchesOfMercuryToMillibar = (inches) => {
  return inches * 33.8639;
};
```

**Example**: 29.411 inHg → 996.1 mb

---

## Weather Metrics Explained

### Temperature-Humidity-Wind (THW) Index

**What it is**: The "feels-like" temperature combining:
- Air temperature
- Humidity effects
- Wind chill effects

**When to use**: Gives more accurate sense of comfort level than raw temperature.

**Code field**: `thw_index` (°F) → converted to °C for display

### Dew Point

**What it is**: Temperature at which air becomes saturated with moisture and dew forms.

**Interpretation**:
- **High dew point** (>20°C/68°F): Humid, uncomfortable
- **Medium** (10-20°C/50-68°F): Comfortable
- **Low** (<10°C/50°F): Dry

**Use case**: Better indicator of humidity comfort than relative humidity percentage.

### Barometric Pressure Trend

**What it is**: Change in pressure over last 3 hours.

**Interpretation**:
- **Rising** (+0.034 inHg): Weather improving, high pressure moving in
- **Steady** (±0.00): Stable conditions
- **Falling** (-0.034 inHg): Weather deteriorating, low pressure approaching

**Weather forecasting**:
- Rapid rise → Clear, cold weather coming
- Rapid fall → Storms approaching

### Wind Averages Explained

**Why multiple time periods?**

Different activities need different wind information:

| Time Period | Use Case |
|-------------|----------|
| **Instant** (`wind_speed_last`) | Current gust, kite flying |
| **1-minute** | Very short-term conditions |
| **2-minute** | Short-term trending |
| **10-minute** | Standard meteorological average, sailing decisions |
| **24-hour** | Daily weather patterns, long-term planning |

**Scalar Average vs Vector Average**:
- **Scalar average**: Average of wind speeds (what we use)
- **Vector average**: Accounts for direction changes (more complex)

### Archive Intervals

Historic data is recorded in **15-minute intervals** (`arch_int: 900` seconds).

**Example Timeline**:
```
09:00:00 - Archive record (covers 08:45:01 - 09:00:00)
09:15:00 - Archive record (covers 09:00:01 - 09:15:00)
09:30:00 - Archive record (covers 09:15:01 - 09:30:00)
```

Each archive record contains:
- **Averages** over the 15-minute period
- **Highs/lows** and when they occurred
- **Totals** (e.g., rainfall)

---

## Developer Notes

### Important Gotchas

#### 1. Wind Direction Circularity

**Problem**: Wind directions are circular (359° and 1° are only 2° apart, not 358° apart).

**Bad Code**:
```javascript
// WRONG: Don't use Math.max/min on degrees
const maxDirection = Math.max(...windDirections); // 350° and 10° → returns 350° (wrong!)
```

**Current Issue**:
In [WeatherStore.js:171](src/stores/WeatherStore.js#L171), the code uses `Math.max()` for `windDirectionHiLast24Hours`. This should use `wind_dir_of_prevail` field directly instead of calculating max.

**Better Approach**:
```javascript
// Use the prevailing direction from API
const prevailingDirection = data.wind_dir_of_prevail;
```

#### 2. Timestamp Interpretation

**Critical**: Historic timestamps represent the **END** of the recording period.

```javascript
// A record with ts: 1759529700 represents data from:
// 1759528801 (15 minutes earlier + 1 second) to 1759529700
```

**Query behavior**:
```javascript
// start-timestamp=1759528800, end-timestamp=1759532400
// Returns records where: timestamp > 1759528800 AND timestamp <= 1759532400
```

#### 3. Null Handling

Many fields can be `null` (especially solar/UV at night):

```javascript
// Good: Handle nulls
const value = data.solar_rad?.toFixed(1) ?? '-';

// Bad: Will crash at night
const value = data.solar_rad.toFixed(1);
```

#### 4. Data Structure Types Vary

Documentation suggests types 10/11, but actual API uses:
- Sensor 43: Types 23 (current) and 24 (historic)
- Sensor 242: Types 19 (current) and 20 (historic)

**Don't hardcode** data structure type checks; rely on `sensor_type` instead.

### Response Validation Pattern

```javascript
function isValidResponse(data) {
  return data && typeof data === 'object' && 'sensors' in data;
}

if (!isValidResponse(response.data)) {
  throw new Error('Invalid response data');
}
```

Always validate before accessing nested properties.

### Error Handling

```javascript
async function fetchCurrentWeather() {
  isLoading.value = true;
  try {
    const response = await fetchWithTimeout('/current');

    if (!isValidResponse(response.data)) {
      throw new Error('Invalid response data');
    }

    currentWeatherData.value = response.data;
  } finally {
    isLoading.value = false;  // Always reset loading state
  }
}
```

**Key points**:
- Use `finally` to reset loading state
- Validate responses before using
- Don't expose errors to user unnecessarily (show fallback UI)

### Timeout Strategy

```javascript
async function fetchWithTimeout(url, options, timeout = 10000) {
  return Promise.race([
    api.get(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    ),
  ]);
}
```

**10-second timeout** prevents hanging requests. WeatherLink API is generally fast (<1s), so 10s is generous.

### Future Enhancement Ideas

1. **Caching Layer**
   - Cache responses for 1-2 minutes
   - Reduce API calls, improve responsiveness
   - Add cache invalidation on manual refresh

2. **Real-time Updates**
   - WebSocket connection for live data
   - Auto-refresh every 60 seconds
   - Show "Live" indicator

3. **Historical Charts**
   - Use historic data for graphs
   - Temperature/wind/pressure trends
   - Use a charting library (Chart.js, D3)

4. **Storm Tracking**
   - Use `rain_storm_*` fields
   - Track current storm duration
   - Show storm accumulation

5. **Weather Alerts**
   - Notify when wind speed exceeds threshold
   - Alert on rapid pressure changes
   - Push notifications (PWA)

6. **Forecast Integration**
   - Combine with external forecast API
   - Use barometric trend for basic forecasting
   - Show 3-day outlook

7. **Better Wind Direction Aggregation**
   - Implement circular mean for wind directions
   - Use vector averaging
   - More accurate 24-hour prevailing direction

8. **Indoor Data Display**
   - Show sensor type 365 (indoor temp/humidity)
   - Compare indoor vs outdoor
   - Comfort level indicators

9. **Offline Support**
   - Service worker caching
   - Show last known data when offline
   - PWA capabilities

10. **Historical Data Export**
    - Download CSV of historic data
    - Custom date ranges
    - Data analysis tools

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| [src/stores/WeatherStore.js](src/stores/WeatherStore.js) | Main data fetching and state management |
| [src/utils/weatherUtils.js](src/utils/weatherUtils.js) | Unit conversions |
| [src/views/Home.vue](src/views/Home.vue) | Main display component |
| [src/components/weather/WindComponent.vue](src/components/weather/WindComponent.vue) | Wind data display |
| [src/components/weather/WeatherComponent.vue](src/components/weather/WeatherComponent.vue) | Generic metric display |
| [src/api.js](src/api.js) | Axios instance configuration |

### Environment Variables

| Variable | Purpose | Value |
|----------|---------|-------|
| `VITE_API_URL` | Backend API base URL | `https://api.meteozandvoort.nl` |

### External Resources

- [WeatherLink v2 API Documentation](https://weatherlink.github.io/v2-api/)
- [WeatherLink Sensor Catalog](https://weatherlink.github.io/v2-api/sensor-catalog)
- [Davis Instruments](https://www.davisinstruments.com/)

---

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

**Document Version**: 1.0
**Last Updated**: 2025-01-04
**Maintained by**: Development team working with Claude AI
