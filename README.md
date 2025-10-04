# 🌤️ Meteo Zandvoort

Welcome to Meteo Zandvoort, a comprehensive weather monitoring dashboard for Zandvoort! This project provides real-time weather data, including wind speeds, temperature, and other meteorological information, fetched directly from Herman Kruiswegt's weather station. The application is built using Vue 3, Vite, and PrimeVue, ensuring a fast, modern, and feature-rich user experience.

Explore the live application at [Meteo Zandvoort](https://meteozandvoort.nl) to see it in action.

## 🌟 Features

### Dashboard (Home)

- 🌡️ **Hero Section**: Large display showing quick information
- 🎯 **Extended Metrics Grid**: ALL available weather metrics in organized cards
  - Temperature variants (temp, dew point, THW index, heat index, wind chill, wet bulb)
  - Wind data (instant, 1-min, 2-min, 10-min, 24-hour averages and maximums)
  - Wind directions for all time periods
  - Rainfall data (rate, 15-min, 1-hour, 24-hour, daily, monthly, yearly)
  - Indoor conditions (temperature, humidity, dew point)
- 📈 **Interactive 24-Hour Charts**: Beautiful ApexCharts visualizations
  - Temperature trends (with dew point, heat index, wind chill)
  - Wind speed (average and gusts)
  - Barometric pressure
  - Humidity levels
  - Rainfall accumulation
- 🔄 **Auto-Refresh**: Optional automatic data refresh every 60 seconds
- ⚡ **Real-time Updates**: Data updated every minute from the weather station

### Current Conditions View

- 📋 **Detailed Data Table**: All current sensor readings in sortable, filterable table
- 🔍 **Advanced Filtering**: Filter by sensor type or field name
- 📊 **Multiple Sensors**: Data from ISS (outdoor), Barometer, Indoor, and Health sensors
- 💾 **Export Ready**: All data formatted and ready for analysis

### Historic Data Browser

- 📅 **Custom Date Range**: Select any 24-hour period for analysis
- 📊 **Comprehensive Table**: All historic records with 15-minute intervals
- 🔽 **CSV Export**: Download historic data for offline analysis
- 📈 **Summary Statistics**: Quick overview of selected time range
- 🎛️ **Flexible Pagination**: View 10, 20, 50, or 100 records per page

## 🛠️ Technology Stack

- **Vue 3**: Modern reactive framework with Composition API
- **Vite**: Lightning-fast build tool and dev server
- **Pinia**: Intuitive state management
- **PrimeVue 4**: Comprehensive UI component library
  - DataTable for data display
  - Cards for metric organization
  - TabView for chart navigation
  - Calendar for date selection
  - Buttons and interactive components
- **ApexCharts**: Beautiful, interactive charts
- **Day.js**: Lightweight date manipulation
- **Axios**: HTTP client for API requests
- **Material Symbols**: Google's icon library

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Features Deep Dive

### Data Management

- Centralized WeatherStore with 50+ computed properties
- UIStore for user preferences
- Automatic data validation
- 10-second timeout for API requests
- Error handling with fallback UI

### Responsive Design

- Mobile-first approach
- Breakpoints: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- Flexible grid layouts
- Touch-friendly interface

### Performance Optimizations

- Lazy-loaded routes
- Computed properties for derived data
- Efficient chart updates
- Minimal re-renders

## ⚙️ Backend

The backend API is hosted at `api.meteozandvoort.nl` and acts as a reverse proxy to WeatherLink's API. It fetches real-time data directly from Herman Kruiswegt's weather station. The backend provides two main endpoints:

- `/current`: Fetches the current weather data
- `/historic?start-timestamp={start}&end-timestamp={end}`: Fetches historical weather data (max 24 hours)

These endpoints allow the frontend to display up-to-date and historical weather information seamlessly.

## 📚 Project Structure

```
src/
├── views/
│   ├── Home.vue              # Main dashboard
│   ├── CurrentView.vue       # Detailed current conditions
│   └── HistoricView.vue      # Historic data browser
├── components/
│   └── cards/
│       └── MetricCard.vue    # Reusable metric display
├── stores/
│   ├── WeatherStore.js       # Weather data management
│   └── UIStore.js            # UI preferences
├── composables/
│   ├── useFormatters.js      # Data formatting utilities
│   └── useChartConfig.js     # Chart configuration
├── utils/
│   ├── constants.js          # App-wide constants
│   └── weatherUtils.js       # Weather calculations
└── router/
    └── index.js              # Route definitions
```

## 🔗 Related Documentation

- [CLAUDE.md](CLAUDE.md) - Comprehensive technical documentation
- [current-endpoint-example.md](current-endpoint-example.md) - Current API response example
- [historic-endpoint-example.md](historic-endpoint-example.md) - Historic API response example

## 🙏 Credits

Weather data provided by **Herman Kruiswegt**'s personal weather station in Zandvoort, Netherlands.

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
