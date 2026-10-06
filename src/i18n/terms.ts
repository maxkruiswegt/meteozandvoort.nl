import type { Locale } from '@/seo/site';

// Per-language formats and weather vocabulary that are lookup tables rather
// than sentences (indexed by Beaufort force or compass point), plus the
// PrimeVue calendar/paginator strings. UI sentences live in nl.ts / en.ts.

interface PrimeVueTerms {
  firstDayOfWeek: number;
  dayNames: string[];
  dayNamesShort: string[];
  dayNamesMin: string[];
  monthNames: string[];
  monthNamesShort: string[];
  today: string;
  clear: string;
  weekHeader: string;
  dateFormat: string;
  chooseYear: string;
  chooseMonth: string;
  chooseDate: string;
  prevDecade: string;
  nextDecade: string;
  prevYear: string;
  nextYear: string;
  prevMonth: string;
  nextMonth: string;
  aria: {
    pageLabel: string;
    firstPageLabel: string;
    lastPageLabel: string;
    nextPageLabel: string;
    prevPageLabel: string;
    rowsPerPageLabel: string;
  };
}

/** Fixed-length list, so a language missing an entry fails the typecheck. */
type List<N extends number, Acc extends string[] = []> = Acc['length'] extends N
  ? readonly [...Acc]
  : List<N, [...Acc, string]>;

export interface LocaleTerms {
  /** Intl locale for numbers and dates (always shown in the station's time zone). */
  intl: string;
  dayjs: string;
  units: { kmh: string; mmPerHour: string };
  /** Indexed by Beaufort force 0-12, lowercase for use mid-sentence. */
  beaufort: List<13>;
  /** 16-point compass abbreviations, starting at north, clockwise. */
  compass16: List<16>;
  /** 8-point direction names as they read after "uit het" / "from the". */
  from8: List<8>;
  /** N, E, S, W on the compass rose. */
  cardinals: List<4>;
  /**
   * Spreadsheet conventions, so Excel opens the file right: Dutch keeps its
   * separator, decimal comma and dd-mm-yyyy times; English uses commas, points
   * and ISO times, which every spreadsheet reads as dates.
   */
  csv: { separator: string; decimal: string; isoTime: boolean; header: List<9> };
  primevue: PrimeVueTerms;
}

export const TERMS: Record<Locale, LocaleTerms> = {
  nl: {
    intl: 'nl-NL',
    dayjs: 'nl',
    units: { kmh: 'km/u', mmPerHour: 'mm/u' },
    // KNMI wording; KNMI shares one description across two forces at the low end.
    beaufort: [
      'windstil',
      'zwakke wind',
      'zwakke wind',
      'matige wind',
      'matige wind',
      'vrij krachtige wind',
      'krachtige wind',
      'harde wind',
      'stormachtige wind',
      'storm',
      'zware storm',
      'zeer zware storm',
      'orkaan',
    ],
    compass16: ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'],
    from8: ['noorden', 'noordoosten', 'oosten', 'zuidoosten', 'zuiden', 'zuidwesten', 'westen', 'noordwesten'],
    cardinals: ['N', 'O', 'Z', 'W'],
    csv: {
      separator: ';',
      decimal: ',',
      isoTime: false,
      header: [
        'tijd',
        'temp_gem_c',
        'temp_max_c',
        'temp_min_c',
        'vochtigheid_pct',
        'wind_gem_kmu',
        'windstoot_kmu',
        'windrichting',
        'neerslag_mm',
      ],
    },
    primevue: {
      firstDayOfWeek: 1,
      dayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
      dayNamesShort: ['zon', 'maa', 'din', 'woe', 'don', 'vri', 'zat'],
      dayNamesMin: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
      monthNames: [
        'januari',
        'februari',
        'maart',
        'april',
        'mei',
        'juni',
        'juli',
        'augustus',
        'september',
        'oktober',
        'november',
        'december',
      ],
      monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
      today: 'Vandaag',
      clear: 'Wissen',
      weekHeader: 'Wk',
      dateFormat: 'dd-mm-yy',
      chooseYear: 'Kies jaar',
      chooseMonth: 'Kies maand',
      chooseDate: 'Kies datum',
      prevDecade: 'Vorig decennium',
      nextDecade: 'Volgend decennium',
      prevYear: 'Vorig jaar',
      nextYear: 'Volgend jaar',
      prevMonth: 'Vorige maand',
      nextMonth: 'Volgende maand',
      aria: {
        pageLabel: 'Pagina {page}',
        firstPageLabel: 'Eerste pagina',
        lastPageLabel: 'Laatste pagina',
        nextPageLabel: 'Volgende pagina',
        prevPageLabel: 'Vorige pagina',
        rowsPerPageLabel: 'Rijen per pagina',
      },
    },
  },
  en: {
    intl: 'en-GB',
    dayjs: 'en-gb',
    units: { kmh: 'km/h', mmPerHour: 'mm/h' },
    // Met Office wording (forces 9 and 12 as used in UK forecasts).
    beaufort: [
      'calm',
      'light air',
      'light breeze',
      'gentle breeze',
      'moderate breeze',
      'fresh breeze',
      'strong breeze',
      'near gale',
      'gale',
      'severe gale',
      'storm',
      'violent storm',
      'hurricane force',
    ],
    compass16: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
    from8: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'],
    cardinals: ['N', 'E', 'S', 'W'],
    csv: {
      separator: ',',
      decimal: '.',
      isoTime: true,
      header: [
        'time',
        'temp_avg_c',
        'temp_max_c',
        'temp_min_c',
        'humidity_pct',
        'wind_avg_kmh',
        'wind_gust_kmh',
        'wind_direction',
        'rain_mm',
      ],
    },
    primevue: {
      firstDayOfWeek: 1,
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      today: 'Today',
      clear: 'Clear',
      weekHeader: 'Wk',
      // "6 Oct 2026": unambiguous for British and American readers alike.
      dateFormat: 'd M yy',
      chooseYear: 'Choose year',
      chooseMonth: 'Choose month',
      chooseDate: 'Choose date',
      prevDecade: 'Previous decade',
      nextDecade: 'Next decade',
      prevYear: 'Previous year',
      nextYear: 'Next year',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      aria: {
        pageLabel: 'Page {page}',
        firstPageLabel: 'First page',
        lastPageLabel: 'Last page',
        nextPageLabel: 'Next page',
        prevPageLabel: 'Previous page',
        rowsPerPageLabel: 'Rows per page',
      },
    },
  },
};
