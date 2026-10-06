// Dutch UI text; the master schema that en.ts must match key for key.
// vue-i18n syntax: {name} is a placeholder, "a | b" a singular/plural pair.
// Head text (titles, descriptions) lives in src/seo/site.ts.

const nl = {
  header: {
    pages: "Pagina's",
    current: 'Huidig',
    historic: 'Historisch',
    back: 'Terug naar overzicht',
    refresh: 'Gegevens vernieuwen',
    // Clock times follow Dutch weather-service phrasing (KNMI/Buienradar).
    statusOffline: 'geen verbinding',
    statusLoading: 'laden…',
    statusStale: 'geen actuele gegevens · laatste meting {time} uur',
    statusLate: 'laatste meting om {time} uur ({ago})',
    statusFresh: 'gemeten om {time} uur',
    statusTitle: 'Laatste meting: {time} (Europe/Amsterdam)',
  },
  theme: {
    legend: 'Thema',
    system: 'Systeem volgen',
    light: 'Licht',
    dark: 'Donker',
  },
  home: {
    staleBanner: 'Vernieuwen mislukt; laatst bekende gegevens worden getoond.',
    loading: 'Weergegevens laden…',
    error: 'Er ging iets mis bij het ophalen van de gegevens.',
    retry: 'Opnieuw proberen',
    backup: 'Bezoek anders de back-upsite: {link}',
    currentConditions: 'Huidige omstandigheden',
    feelsLike: 'Voelt als {temp}',
    gusts: 'stoten {speed}',
    windFrom: '{force} uit het {direction}',
    chips: {
      pressure: 'luchtdruk',
      humidity: 'luchtvochtigheid',
      dewPoint: 'dauwpunt',
      rainToday: 'regen vandaag',
      rainTodayRaining: 'regen vandaag · regent nu',
      sunrise: 'zonsopkomst',
      sunset: 'zonsondergang',
      uv: 'zonkracht',
    },
    charts: {
      temperature: 'Temperatuur (24u)',
      humidity: 'Luchtvochtigheid (24u)',
      rain: 'Neerslag (24u)',
      pressure: 'Luchtdruk (24u)',
      wind: 'Wind (24u)',
    },
    details: {
      title: 'Details',
      windNow: 'Wind nu',
      windAvg24h: 'Wind gemiddeld 24u',
      gustMax24h: 'Zwaarste windstoot 24u',
      rainRate: 'Regenintensiteit',
      rainLastHour: 'Regen laatste uur',
      rain24h: 'Regen 24 uur',
      rainMonth: 'Regen deze maand',
      rainYear: 'Regen dit jaar',
      windChill: 'Gevoelstemperatuur',
      windChillHint: 'wind chill',
      heatIndex: 'Hitte-index',
      solarRadiation: 'Zonnestraling',
      indoorTemperature: 'Binnentemperatuur',
      indoorHumidity: 'Binnenvochtigheid',
    },
    beachcam: 'Live beachcam Zandvoort',
    footer: {
      // The escaped no-break space before each · keeps the dot on the line before when it wraps
      station: 'Davis-weerstation in Zandvoort\u00a0· metingen per minuut.',
      isobars:
        'De lijnen op de achtergrond zijn isobaren (lijnen van gelijke luchtdruk), geschat uit de wind van nu: ze lopen ongeveer met de wind mee, en hoe dichter bij elkaar, hoe harder het waait.',
      credits: 'Station van {station}\u00a0· site door {site}',
    },
  },
  compass: {
    label: 'Wind uit het {direction}, {speed}',
    unknown: 'Windrichting onbekend, {speed}',
  },
  chart: {
    empty: 'Geen gegevens beschikbaar',
    temperature: 'Temperatuur',
    dewPoint: 'Dauwpunt',
    windAverage: 'Gemiddeld',
    gusts: 'Windstoten',
    pressure: 'Luchtdruk',
    humidity: 'Luchtvochtigheid',
    rain: 'Neerslag',
  },
  beachcam: {
    credit: 'Livestream door {org}',
  },
  current: {
    title: 'Huidige data',
    fields: 'Alle sensorvelden',
    sensor: 'Sensor',
    field: 'Veld',
    raw: 'Ruwe waarde',
    formatted: 'Geformatteerd',
    sensors: {
      iss: 'Buitensensor (ISS)',
      barometer: 'Barometer',
      indoor: 'Binnensensor',
      health: 'Systeemstatus',
      other: 'Type {type}',
    },
  },
  historic: {
    title: 'Historische data',
    pickDay: 'Kies een dag',
    fetch: 'Ophalen',
    export: 'Exporteer CSV',
    rangeNote: 'Gegevens per 15 minuten; maximaal één dag per opvraag (API-limiet).',
    fetchError: 'Ophalen mislukt. Controleer de verbinding en probeer het opnieuw.',
    records: 'Metingen',
    columns: {
      time: 'Tijd',
      temp: 'Temp',
      max: 'Max',
      min: 'Min',
      humidity: 'Vocht',
      wind: 'Wind',
      gusts: 'Stoten',
      direction: 'Richting',
      rain: 'Neerslag',
    },
    summary: '{n} meting · totaal {rain} neerslag | {n} metingen · totaal {rain} neerslag',
  },
  notFound: {
    title: 'Pagina niet gevonden',
    text: 'Deze pagina bestaat niet (meer).',
    home: 'Naar het actuele weer',
  },
};

export type MessageSchema = typeof nl;

export default nl;
