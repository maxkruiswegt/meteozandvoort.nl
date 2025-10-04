import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  // Unit preferences
  const useMetric = ref(true); // true = metric (°C, km/h), false = imperial (°F, mph)

  // Auto-refresh
  const autoRefreshEnabled = ref(false);
  const refreshInterval = ref(60000); // 60 seconds

  // View preferences
  const expandedSections = ref({
    quickStats: true,
    windAnalysis: true,
    charts: true,
    allMetrics: false,
    systemHealth: false,
  });

  // Chart preferences
  const chartTimeRange = ref(24); // hours

  // Data table preferences
  const tablePageSize = ref(20);

  // Actions
  function toggleUnits() {
    useMetric.value = !useMetric.value;
    localStorage.setItem('useMetric', useMetric.value.toString());
  }

  function toggleAutoRefresh() {
    autoRefreshEnabled.value = !autoRefreshEnabled.value;
    localStorage.setItem('autoRefresh', autoRefreshEnabled.value.toString());
  }

  function toggleSection(section) {
    expandedSections.value[section] = !expandedSections.value[section];
    localStorage.setItem('expandedSections', JSON.stringify(expandedSections.value));
  }

  function setChartTimeRange(hours) {
    chartTimeRange.value = hours;
    localStorage.setItem('chartTimeRange', hours.toString());
  }

  // Load preferences from localStorage
  function loadPreferences() {
    const savedUseMetric = localStorage.getItem('useMetric');
    if (savedUseMetric !== null) {
      useMetric.value = savedUseMetric === 'true';
    }

    const savedAutoRefresh = localStorage.getItem('autoRefresh');
    if (savedAutoRefresh !== null) {
      autoRefreshEnabled.value = savedAutoRefresh === 'true';
    }

    const savedExpandedSections = localStorage.getItem('expandedSections');
    if (savedExpandedSections !== null) {
      try {
        expandedSections.value = JSON.parse(savedExpandedSections);
      } catch (e) {
        console.error('Failed to parse expandedSections from localStorage', e);
      }
    }

    const savedChartTimeRange = localStorage.getItem('chartTimeRange');
    if (savedChartTimeRange !== null) {
      chartTimeRange.value = parseInt(savedChartTimeRange, 10);
    }
  }

  // Initialize preferences on store creation
  loadPreferences();

  return {
    // State
    useMetric,
    autoRefreshEnabled,
    refreshInterval,
    expandedSections,
    chartTimeRange,
    tablePageSize,

    // Actions
    toggleUnits,
    toggleAutoRefresh,
    toggleSection,
    setChartTimeRange,
    loadPreferences,
  };
});
