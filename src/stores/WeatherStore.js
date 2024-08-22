import api from '@/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWeatherStore = defineStore('weather', () => {
  // Example current weather data
  // {"station_id_uuid":"35a9a8d0-241c-449b-b844-ed5efed3b3ce","sensors":[{"lsid":745161,"data":[{"rx_state":0,"wind_speed_hi_last_2_min":10,"hum":78.7,"freq_index":4,"last_packet_received_timestamp":1720544039,"rainfall_day_clicks":0,"packets_missed_day":11,"wind_dir_at_hi_speed_last_10_min":342,"wind_chill":67.3,"et_month":0,"packets_received_streak_hi_day":9181,"rain_rate_hi_last_15_min_clicks":0,"thw_index":68.2,"packets_received_streak":1192,"freq_error_current":2,"wind_dir_scalar_avg_last_10_min":338,"solar_energy_day":0,"spars_rpm":null,"wind_run_day":82.73999786376953,"rain_size":1,"uv_index":null,"tz_offset":7200,"rain_storm_current_in":null,"rainfall_day_mm":0,"wind_speed_last":7,"resyncs_day":0,"rainfall_last_60_min_clicks":0,"wet_bulb":63,"rain_storm_current_mm":null,"rainfall_day_in":0,"hdd_day":0.807,"wind_speed_avg_last_10_min":4.52,"wind_dir_at_hi_speed_last_2_min":303,"supercap_volt":null,"solar_panel_volt":null,"wind_dir_last":300,"rainfall_month_clicks":168,"rain_storm_last_clicks":81,"tx_id":1,"rain_storm_last_start_at":1720177429,"packets_received_day":26542,"rainfall_last_15_min_in":0,"rain_rate_hi_clicks":0,"rainfall_last_15_min_mm":0,"dew_point":60.5,"rain_rate_hi_in":0,"rain_rate_hi_mm":0,"rainfall_year_clicks":168,"rain_storm_last_end_at":1720473668,"wind_dir_scalar_avg_last_2_min":331,"reception_day":100,"wbgt":null,"heat_index":68.2,"rainfall_last_24_hr_in":0,"rainfall_last_60_min_mm":0,"rain_storm_current_clicks":null,"trans_battery_flag":0,"rainfall_last_60_min_in":0,"rainfall_last_24_hr_mm":0,"crc_errors_day":5,"rainfall_year_in":1.68,"rssi_last":-56,"wind_speed_hi_last_10_min":10,"rainfall_last_15_min_clicks":0,"cdd_day":3.68,"rainfall_year_mm":42.672,"freq_error_total":242,"wind_dir_scalar_avg_last_1_min":329,"uv_dose_day":0,"temp":67.3,"trans_battery_volt":null,"et_day":0,"rainfall_month_in":1.68,"wind_speed_avg_last_2_min":4.87,"rain_storm_current_start_at":null,"spars_volt":null,"solar_rad":null,"rain_storm_last_mm":20.574,"wind_speed_avg_last_1_min":5.92,"thsw_index":null,"rain_rate_last_mm":0,"rain_rate_last_clicks":0,"rainfall_last_24_hr_clicks":0,"rain_storm_last_in":0.81,"et_year":0,"packets_missed_streak_hi_day":1,"rain_rate_last_in":0,"rain_rate_hi_last_15_min_mm":0,"rain_rate_hi_last_15_min_in":0,"rainfall_month_mm":42.672,"ts":1720544040,"packets_missed_streak":0}],"sensor_type":37,"data_structure_type":23},{"lsid":745160,"data":[{"temp_in":75.7,"tz_offset":7200,"wet_bulb_in":65.8,"heat_index_in":76.1,"dew_point_in":60.2,"wbgt_in":null,"ts":1720544040,"hum_in":58.6}],"sensor_type":365,"data_structure_type":21},{"lsid":745159,"data":[{"bar_absolute":29.82,"tz_offset":7200,"bar_sea_level":29.866,"bar_offset":0.044,"bar_trend":-0.038,"ts":1720544040}],"sensor_type":242,"data_structure_type":19},{"lsid":745158,"data":[{"battery_voltage":4293,"wifi_rssi":-55,"console_radio_version":"10.3.12.106","console_api_level":28,"gnss_sip_tx_id":0,"ip_v4_gateway":"192.168.178.1","bgn":null,"queue_kilobytes":4,"free_mem":618971,"system_free_space":746471,"tz_offset":7200,"charger_plugged":1,"battery_percent":100,"local_api_queries":null,"health_version":1,"ip_address_type":null,"link_uptime":450770,"rx_kilobytes":464126,"ip_v4_netmask":"255.255.255.0","console_sw_version":"1.4.43","connection_uptime":83315,"os_uptime":450841,"battery_condition":2,"internal_free_space":2373513,"battery_current":-0.003,"battery_status":5,"database_kilobytes":4452,"battery_cycle_count":4,"console_os_version":"1.3.7","ip_v4_address":"192.168.178.143","bootloader_version":2,"clock_source":2,"app_uptime":450777,"dns_type_used":null,"battery_temp":31,"tx_kilobytes":15182,"ts":1720543500}],"sensor_type":509,"data_structure_type":27}],"generated_at":1720544057,"station_id":189639}

  // Units
  // Field Name	Data Type	Units	Description
  // temp	float	degrees Fahrenheit	Most recent temperature reading
  // hum	float	percent relative humidity	Most recent humidity reading
  // dew_point	float	degrees Fahrenheit	Most recent derived dew point
  // wet_bulb	float	degrees Fahrenheit	Most recent derived wet bulb
  // heat_index	float	degrees Fahrenheit	Most recent derived heat index
  // wind_chill	float	degrees Fahrenheit	Most recent derived wind chill
  // thw_index	float	degrees Fahrenheit	Most recent derived temperature, humidity, wind index
  // thsw_index	float	degrees Fahrenheit	Most recent derived temperature, humidity, solar, wind index
  // wbgt	float	degrees Fahrenheit	Most recent derived wet bulb globe temperature
  // wind_speed_last	float	miles per hour	Most recent wind speed value
  // wind_dir_last	integer	degrees	Most recent wind direction value
  // wind_speed_avg_last_1_min	float	miles per hour	Average wind speed over last 1 minute
  // wind_dir_scalar_avg_last_1_min	integer	degrees	Scalar average wind direction over last 1 minute
  // wind_speed_avg_last_2_min	float	miles per hour	Average wind speed over last 2 minutes
  // wind_dir_scalar_avg_last_2_min	integer	degrees	Scalar average wind direction over last 2 minutes
  // wind_speed_hi_last_2_min	float	miles per hour	Maximum wind speed over last 2 minutes
  // wind_dir_at_hi_speed_last_2_min	integer	degrees	Direction of maximum wind speed over last 2 minutes
  // wind_speed_avg_last_10_min	float	miles per hour	Average wind speed over last 10 minutes
  // wind_dir_scalar_avg_last_10_min	integer	degrees	Scalar average wind direction over last 10 minutes
  // wind_speed_hi_last_10_min	float	miles per hour	Maximum wind speed over last 10 minutes
  // wind_dir_at_hi_speed_last_10_min	integer	degrees	Direction of maximum wind speed over last 10 minutes
  // wind_run_day	double	miles	Daily accumulation of wind run since local midnight
  // rain_size	integer	1 = 0.01 inch; 2 = 0.2 mm; 3 = 0.1 mm; 4 = 0.001 inch	Rain collector size
  // rain_rate_last_clicks	integer	clicks	Most recent rain rate
  // rain_rate_last_in	float	inches	Most recent rain rate
  // rain_rate_last_mm	float	millimeters	Most recent rain rate
  // rain_rate_hi_clicks	integer	clicks	Highest rain rate over the last 1 minute
  // rain_rate_hi_in	float	inches	Highest rain rate over the last 1 minute
  // rain_rate_hi_mm	float	millimeters	Highest rain rate over the last 1 minute
  // rainfall_last_15_min_clicks	integer	clicks	Total rain over the last 15 minutes
  // rainfall_last_15_min_in	float	inches	Total rain over the last 15 minutes
  // rainfall_last_15_min_mm	float	millimeters	Total rain over the last 15 minutes
  // rain_rate_hi_last_15_min_clicks	integer	clicks	Highest rain rate over the last 15 minutes
  // rain_rate_hi_last_15_min_in	float	inches	Highest rain rate over the last 15 minutes
  // rain_rate_hi_last_15_min_mm	float	millimeters	Highest rain rate over the last 15 minutes
  // rainfall_last_60_min_clicks	integer	clicks	Total rain over the last 60 minutes
  // rainfall_last_60_min_in	float	inches	Total rain over the last 60 minutes
  // rainfall_last_60_min_mm	float	millimeters	Total rain over the last 60 minutes
  // rainfall_last_24_hr_clicks	integer	clicks	Total rain over the last 24 hours
  // rainfall_last_24_hr_in	float	inches	Total rain over the last 24 hours
  // rainfall_last_24_hr_mm	float	millimeters	Total rain over the last 24 hours
  // rain_storm_current_clicks	integer	clicks	Total rain in the current storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_current_in	float	inches	Total rain in the current storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_current_mm	float	millimeters	Total rain in the current storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_current_start_at	long	seconds	Unix timestamp of the start of the current storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_last_clicks	integer	clicks	Total rain in the previous storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_last_in	float	inches	Total rain in the previous storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_last_mm	float	millimeters	Total rain in the previous storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_last_start_at	long	seconds	Unix timestamp of the start of the previous storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rain_storm_last_end_at	long	seconds	Unix timestamp of the end of the previous storm (the first rain recorded after a period of 24 hours or more without rain is considered a new storm)
  // rainfall_day_clicks	integer	clicks	Total rain since local midnight
  // rainfall_day_in	float	inches	Total rain since local midnight
  // rainfall_day_mm	float	millimeters	Total rain since local midnight
  // rainfall_month_clicks	integer	clicks	Total rain since local midnight on the first of the month
  // rainfall_month_in	float	inches	Total rain since local midnight on the first of the month
  // rainfall_month_mm	float	millimeters	Total rain since local midnight on the first of the month
  // rainfall_year_clicks	integer	clicks	Total rain since local midnight on the first of the month where the month is the user's selected month for the start of their rain year
  // rainfall_year_in	float	inches	Total rain since local midnight on the first of the month where the month is the user's selected month for the start of their rain year
  // rainfall_year_mm	float	millimeters	Total rain since local midnight on the first of the month where the month is the user's selected month for the start of their rain year
  // solar_rad	integer	watts per square meter	Most recent solar radiation reading
  // solar_energy_day	double	langleys	Daily accumulation of solar energy since local midnight
  // et_day	float	inches	Sum of evapotranspiration since local midnight, only calculated hourly
  // et_month	float	inches	Sum of evapotranspiration since local midnight on the first of the month, only calculated hourly
  // et_year	float	inches	Sum of evapotranspiration since local midnight on the first of the month where the month is the user's selected month for the start of their rain year, only calculated hourly
  // uv_index	float	ultraviolet index	Most recent UV index
  // uv_dose_day	double	minimum erythemal dose	Total UV Dose since local midnight or since last user reset
  // hdd_day	float	heating degree days in degrees Fahrenheit, to convert to an equivalent Celsius value use C = F x 5 / 9
  // cdd_day	float	cooling degree days in degrees Fahrenheit, to convert to an equivalent Celsius value use C = F x 5 / 9
  // reception_day	integer	percent	Percentage of packets received versus total possible over the local day once synced unless manually reset by user, updates every packet (null when not yet synced)
  // rssi_last	integer	decibel-milliwatts	DavisTalk Received Signal Strength Indication (RSSI) of last packet received, updates every packet
  // crc_errors_day	integer		Number of data packets containing CRC errors over the local day unless manually reset by user, updates every minute
  // resyncs_day	integer		Total number of resyncs since local midnight unless manually reset by user. The console will attempt to resynchronize with the station after 20 consecutive bad packets, updates every minute
  // packets_received_day	integer		Total number of received packets over the local day unless manually reset by user, updates every packet
  // packets_received_streak	integer		Current number of packets received in a row, updates every minute
  // packets_missed_day	integer		Total number of packets that are missed for any reason over the local day unless manually reset by user, updates every minute
  // packets_missed_streak	integer		Current number of missed packets in a row that are missed for any reason, can be reset by user at any time, updates every minute
  // packets_received_streak_hi_day	integer		Longest Streak of Packets Received in a row over the local day unless manually reset by user, updates every minute
  // packets_missed_streak_hi_day	integer		Longest streak of consecutive packets received over the archive interval
  // rx_state	integer		Configured Receiver State, updates every minute:
  // 0 = Synced & Tracking OK.
  // 1 = Synced (missing less than 20 DavisTalk packets in a row).
  // 2 = Scanning (after missing 20 DavisTalk packets in a row).
  // State at end of interval.
  // freq_error_current	integer		Current radio frequency error of the radio packets received, updates every packet
  // freq_error_total	integer		Cumulative radio frequency error of the last packet received, updates every packet
  // freq_index	integer		Frequency Index of Last Packet Received, updates every packet
  // last_packet_received_timestamp	long	TODO	Unix timestamp of last DavisTalk packet that was received. Null if no packets have been received since this transmitter was configured or set
  // trans_battery_flag	integer		0 = battery OK. 1 = battery low.
  // trans_battery_volt	float	volts	Current transmitter battery voltage
  // solar_panel_volt	float	volts	Current transmitter solar panel voltage
  // supercap_volt	float	volts	Current transmitter super capacitor voltage
  // spars_volt	float	volts	Current SPARS battery voltage
  // spars_rpm	integer	RPM	Current SPARS RPM

  const currentWeatherData = ref(null);
  const historicWeatherData = ref(null);

  async function fetchCurrentWeather() {
    const response = await api.get('/current');
    currentWeatherData.value = response.data;
  }

  // Timestamp can be a maximum of 24 hour range.
  // It will send each current weather data recorded in the last 24 hours.
  // So that is 1 record per minute means 1440 records.
  // Example: https://api.meteozandvoort.nl/historic?start-timestamp=1724305509&end-timestamp=1724309109
  async function fetchHistoricWeather(startTimestamp, endTimestamp) {
    const response = await api.get('/historic', {
      params: {
        'start-timestamp': startTimestamp,
        'end-timestamp': endTimestamp,
      },
    });
    historicWeatherData.value = response.data;
  }

  // getters based on the current weather data
  const lastUpdated = computed(() => {
    if (!currentWeatherData.value) return null;
    return new Date(currentWeatherData.value.sensors[0].data[0].ts * 1000);
  });

  const temperature = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].temp;
  });

  const dewPoint = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].dew_point;
  });

  const thwIndex = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].thw_index;
  });

  const humidity = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].hum;
  });

  const windSpeedLast = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].wind_speed_last;
  });

  const windSpeedAvgLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].wind_speed_avg_last_10_min;
  });

  const windSpeedHiLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].wind_speed_hi_last_10_min;
  });

  const windDirectionLast = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].wind_dir_last;
  });

  const windDirectionAvgLast10Min = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].wind_dir_scalar_avg_last_10_min;
  });

  const rainRateLast = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].rain_rate_last_mm;
  });

  const rainfallToday = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].rainfall_day_mm;
  });

  const barometricPressure = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 242
    ).data[0].bar_sea_level;
  });

  const barometricTrend = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 242
    ).data[0].bar_trend;
  });

  return {
    currentWeatherData,
    historicWeatherData,
    fetchCurrentWeather,
    fetchHistoricWeather,
    lastUpdated,
    temperature,
    dewPoint,
    thwIndex,
    humidity,
    windSpeedLast,
    windSpeedAvgLast10Min,
    windSpeedHiLast10Min,
    windDirectionLast,
    windDirectionAvgLast10Min,
    rainRateLast,
    rainfallToday,
    barometricPressure,
    barometricTrend,
  };
});
