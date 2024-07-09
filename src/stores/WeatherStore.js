import api from '@/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWeatherStore = defineStore('weather', () => {
  // Example current weather data
  // {"station_id_uuid":"35a9a8d0-241c-449b-b844-ed5efed3b3ce","sensors":[{"lsid":745161,"data":[{"rx_state":0,"wind_speed_hi_last_2_min":10,"hum":78.7,"freq_index":4,"last_packet_received_timestamp":1720544039,"rainfall_day_clicks":0,"packets_missed_day":11,"wind_dir_at_hi_speed_last_10_min":342,"wind_chill":67.3,"et_month":0,"packets_received_streak_hi_day":9181,"rain_rate_hi_last_15_min_clicks":0,"thw_index":68.2,"packets_received_streak":1192,"freq_error_current":2,"wind_dir_scalar_avg_last_10_min":338,"solar_energy_day":0,"spars_rpm":null,"wind_run_day":82.73999786376953,"rain_size":1,"uv_index":null,"tz_offset":7200,"rain_storm_current_in":null,"rainfall_day_mm":0,"wind_speed_last":7,"resyncs_day":0,"rainfall_last_60_min_clicks":0,"wet_bulb":63,"rain_storm_current_mm":null,"rainfall_day_in":0,"hdd_day":0.807,"wind_speed_avg_last_10_min":4.52,"wind_dir_at_hi_speed_last_2_min":303,"supercap_volt":null,"solar_panel_volt":null,"wind_dir_last":300,"rainfall_month_clicks":168,"rain_storm_last_clicks":81,"tx_id":1,"rain_storm_last_start_at":1720177429,"packets_received_day":26542,"rainfall_last_15_min_in":0,"rain_rate_hi_clicks":0,"rainfall_last_15_min_mm":0,"dew_point":60.5,"rain_rate_hi_in":0,"rain_rate_hi_mm":0,"rainfall_year_clicks":168,"rain_storm_last_end_at":1720473668,"wind_dir_scalar_avg_last_2_min":331,"reception_day":100,"wbgt":null,"heat_index":68.2,"rainfall_last_24_hr_in":0,"rainfall_last_60_min_mm":0,"rain_storm_current_clicks":null,"trans_battery_flag":0,"rainfall_last_60_min_in":0,"rainfall_last_24_hr_mm":0,"crc_errors_day":5,"rainfall_year_in":1.68,"rssi_last":-56,"wind_speed_hi_last_10_min":10,"rainfall_last_15_min_clicks":0,"cdd_day":3.68,"rainfall_year_mm":42.672,"freq_error_total":242,"wind_dir_scalar_avg_last_1_min":329,"uv_dose_day":0,"temp":67.3,"trans_battery_volt":null,"et_day":0,"rainfall_month_in":1.68,"wind_speed_avg_last_2_min":4.87,"rain_storm_current_start_at":null,"spars_volt":null,"solar_rad":null,"rain_storm_last_mm":20.574,"wind_speed_avg_last_1_min":5.92,"thsw_index":null,"rain_rate_last_mm":0,"rain_rate_last_clicks":0,"rainfall_last_24_hr_clicks":0,"rain_storm_last_in":0.81,"et_year":0,"packets_missed_streak_hi_day":1,"rain_rate_last_in":0,"rain_rate_hi_last_15_min_mm":0,"rain_rate_hi_last_15_min_in":0,"rainfall_month_mm":42.672,"ts":1720544040,"packets_missed_streak":0}],"sensor_type":37,"data_structure_type":23},{"lsid":745160,"data":[{"temp_in":75.7,"tz_offset":7200,"wet_bulb_in":65.8,"heat_index_in":76.1,"dew_point_in":60.2,"wbgt_in":null,"ts":1720544040,"hum_in":58.6}],"sensor_type":365,"data_structure_type":21},{"lsid":745159,"data":[{"bar_absolute":29.82,"tz_offset":7200,"bar_sea_level":29.866,"bar_offset":0.044,"bar_trend":-0.038,"ts":1720544040}],"sensor_type":242,"data_structure_type":19},{"lsid":745158,"data":[{"battery_voltage":4293,"wifi_rssi":-55,"console_radio_version":"10.3.12.106","console_api_level":28,"gnss_sip_tx_id":0,"ip_v4_gateway":"192.168.178.1","bgn":null,"queue_kilobytes":4,"free_mem":618971,"system_free_space":746471,"tz_offset":7200,"charger_plugged":1,"battery_percent":100,"local_api_queries":null,"health_version":1,"ip_address_type":null,"link_uptime":450770,"rx_kilobytes":464126,"ip_v4_netmask":"255.255.255.0","console_sw_version":"1.4.43","connection_uptime":83315,"os_uptime":450841,"battery_condition":2,"internal_free_space":2373513,"battery_current":-0.003,"battery_status":5,"database_kilobytes":4452,"battery_cycle_count":4,"console_os_version":"1.3.7","ip_v4_address":"192.168.178.143","bootloader_version":2,"clock_source":2,"app_uptime":450777,"dns_type_used":null,"battery_temp":31,"tx_kilobytes":15182,"ts":1720543500}],"sensor_type":509,"data_structure_type":27}],"generated_at":1720544057,"station_id":189639}

  // Units
  // Field Name	Data Type	Units	Description
  // bar	float	inches of mercury
  // temp_in	float	degrees Fahrenheit
  // hum_in	integer	percent relative humidity
  // temp_out	float	degrees Fahrenheit
  // wind_speed	integer	miles per hour
  // wind_speed_10_min_avg	integer	miles per hour
  // wind_dir	integer	degrees of compass
  // temp_extra_1	integer	degrees Fahrenheit
  // temp_extra_2	integer	degrees Fahrenheit
  // temp_extra_3	integer	degrees Fahrenheit
  // temp_extra_4	integer	degrees Fahrenheit
  // temp_extra_5	integer	degrees Fahrenheit
  // temp_extra_6	integer	degrees Fahrenheit
  // temp_extra_7	integer	degrees Fahrenheit
  // temp_soil_1	integer	degrees Fahrenheit
  // temp_soil_2	integer	degrees Fahrenheit
  // temp_soil_3	integer	degrees Fahrenheit
  // temp_soil_4	integer	degrees Fahrenheit
  // temp_leaf_1	integer	degrees Fahrenheit
  // temp_leaf_2	integer	degrees Fahrenheit
  // temp_leaf_3	integer	degrees Fahrenheit
  // temp_leaf_4	integer	degrees Fahrenheit
  // hum_out	integer	percent relative humidity
  // hum_extra_1	integer	percent relative humidity
  // hum_extra_2	integer	percent relative humidity
  // hum_extra_3	integer	percent relative humidity
  // hum_extra_4	integer	percent relative humidity
  // hum_extra_5	integer	percent relative humidity
  // hum_extra_6	integer	percent relative humidity
  // hum_extra_7	integer	percent relative humidity
  // rain_rate_clicks	integer	clicks per hour
  // rain_rate_in	float	inches per hour
  // rain_rate_mm	float	mm per hour
  // uv	float	ultraviolet index
  // solar_rad	integer	watts per square meter
  // rain_storm_clicks	integer	clicks
  // rain_storm_in	float	inches
  // rain_storm_mm	float	millimeters
  // rain_storm_start_date	integer	seconds
  // rain_day_clicks	integer	clicks for the day
  // rain_day_in	float	inches for the day
  // rain_day_mm	float	millimeters for the day
  // rain_month_clicks	integer	clicks for the month
  // rain_month_in	float	inches for the month
  // rain_month_mm	float	millimeters for the month
  // rain_year_clicks	integer	clicks for the year
  // rain_year_in	float	inches for the year
  // rain_year_mm	float	millimeters for the year
  // et_day	float	inches
  // et_month	float	inches
  // et_year	float	inches
  // moist_soil_1	integer	centibars
  // moist_soil_2	integer	centibars
  // moist_soil_3	integer	centibars
  // moist_soil_4	integer	centibars
  // wet_leaf_1	integer	wetness scale from 0 to 15
  // wet_leaf_2	integer	wetness scale from 0 to 15
  // wet_leaf_3	integer	wetness scale from 0 to 15
  // wet_leaf_4	integer	wetness scale from 0 to 15
  // forecast_rule	integer
  // forecast_desc	string	forecast messages if available
  // dew_point	float	degrees Fahrenheit
  // heat_index	float	degrees Fahrenheit
  // wind_chill	float	degrees Fahrenheit
  // wind_gust_10_min	integer	miles per hour

  const currentWeatherData = ref(null);

  // getters based on the current weather data
  const lastUpdated = computed(() => {
    if (!currentWeatherData.value) return null;
    return new Date(currentWeatherData.value.sensors[0].data[0].ts * 1000);
  });

  const currentTemperature = computed(() => {
    if (!currentWeatherData.value) return null;
    const fahrenheit = currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].temp;
    const celsius = ((fahrenheit - 32) * 5) / 9;
    return celsius.toFixed(1);
  });

  const currentHumidity = computed(() => {
    if (!currentWeatherData.value) return null;
    return currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].hum;
  });

  const currentWindSpeed = computed(() => {
    if (!currentWeatherData.value) return null;
    const mph = currentWeatherData.value.sensors.find(
      (sensor) => sensor.sensor_type === 37
    ).data[0].wind_speed_last;
    const kmh = mph * 1.609344; // Convert miles per hour to kilometers per hour
    return kmh.toFixed(1);
  });

  async function fetchCurrentWeather() {
    const response = await api.get('/current');
    currentWeatherData.value = response.data;
  }

  return {
    lastUpdated,
    currentWeatherData,
    currentTemperature,
    currentHumidity,
    currentWindSpeed,
    fetchCurrentWeather,
  };
});
