import{defaultLocale,localeList,type LocaleCode}from'@flyntos/config';
const base = {
  ui: {
    brand: 'Flyntos',
    nav: {
      search: 'Search',
      results: 'Results',
      routes: 'Routes',
      cities: 'Cities',
      blog: 'Blog'
    },
    hero: {
      eyebrow: 'Premium travel intelligence',
      title: 'Find sharper routes, not just cheaper tickets.',
      subtitle: 'Search orchestration, flexible scenarios, and a calmer way to plan flights.',
      from: 'From',
      to: 'To',
      depart: 'Depart',
      return: 'Return',
      cta: 'Search flights'
    },
    results: {
      title: 'Flight results',
      empty: 'No trips yet. Start a search from the homepage.',
      filters: 'Filters',
      scenario: 'Scenario'
    },
    resultsPage: {
      titleReady: 'Your flight search is ready',
      titleFrom: 'Route from {origin}',
      titleSpecify: 'Specify your search route',
      titleDestination: ' — specify destination',
      subtitleReady: 'Explore additional services for your trip below',
      subtitleSpecify: 'Go back to the home page and select your direction',
      manualCta: 'Go to tickets manually',
      specifyCity: 'Please specify destination city',
      specifyDesc: 'To search for flights and select transport, you must select the origin and destination.',
      backToSearch: 'Return to Search',
      carsTitle: 'Car Rental & Charter',
      extrasTitle: 'Extras',
      airportTransport: 'Transport at airport {city}',
      transportSubtitle: 'Book a car or yacht at your point of arrival',
      cars: {
        optimalTitle: 'Optimal Crossover',
        optimalDesc: 'Optimal choice for comfortable travel along coastlines and mountain switchbacks.',
        optimalPrice: 'from 35 € / day',
        optimalBtn: 'Rent a car in {city}',
        budgetTitle: 'Budget Hatchback',
        budgetDesc: 'Ideal for narrow streets of historic towns and easy parking.',
        budgetPrice: 'from 18 € / day',
        budgetBtn: 'Rent a car in {city}',
        yachtTitle: 'Sailing Catamaran',
        yachtDesc: 'Premium charter. Available bareboat or crewed - worldwide marinas.',
        yachtPrice: 'from 250 € / day',
        yachtBtn: 'Charter from {city}'
      },
      extras: {
        transferTitle: 'Comfortable Transfer',
        transferDesc: 'Airport and station transfers with a meet-and-greet sign worldwide.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Tours & Activities',
        excursionsDesc: 'Tickets to attractions and tours worldwide.',
        excursionsBtn: 'Klook',
        esimTitle: 'Mobile Internet eSIM',
        esimDesc: 'Connect to internet in 1 minute without physical SIM cards.',
        esimBtn: 'Saily',
        compensationTitle: 'Flight Compensation',
        compensationDesc: 'Claim up to 600 € for delayed or cancelled flights.',
        compensationBtn: 'Compensair'
      }
    }
  },
  seo: {
    homeTitle: 'Flyntos | Premium multi-locale flight search',
    homeDescription: 'Premium travel search platform with scenario-driven search, SEO-ready locales, and provider orchestration.'
  },
  content: {
    homeLead: 'Search, ranking, localization, and growth architecture built as one platform.'
  }
};

const ruOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Находите более умные маршруты, а не только дешёвые билеты.',
      cta: 'Искать рейсы'
    },
    resultsPage: {
      titleReady: 'Ваш поиск авиабилетов по маршруту {origin} → {destination} открыт',
      titleFrom: 'Маршрут из {origin}',
      titleSpecify: 'Укажите маршрут для поиска билетов',
      titleDestination: ' — укажите пункт назначения',
      subtitleReady: 'Изучите дополнительные услуги для вашей поездки ниже',
      subtitleSpecify: 'Вернитесь на главную страницу и выберите направление',
      manualCta: 'Перейти к билетам вручную',
      specifyCity: 'Пожалуйста, укажите город назначения',
      specifyDesc: 'Для поиска авиабилетов и подбора транспорта необходимо выбрать пункт отправления и назначения.',
      backToSearch: 'Вернуться к поиску',
      carsTitle: 'Аренда авто и чартер',
      extrasTitle: 'Дополнительно',
      airportTransport: 'Транспорт в аэропорту {city}',
      transportSubtitle: 'Забронируйте авто или яхту в точке прилёта',
      cars: {
        optimalTitle: 'Оптимальный кроссовер',
        optimalDesc: 'Оптимальный выбор для комфортных поездок по побережью и горным серпантинам.',
        optimalPrice: 'от 35 € / день',
        optimalBtn: 'Аренда авто в {city}',
        budgetTitle: 'Бюджетный хэтчбек',
        budgetDesc: 'Идеально для узких улочек старых городов и легкой парковки.',
        budgetPrice: 'от 18 € / день',
        budgetBtn: 'Аренда авто в {city}',
        yachtTitle: 'Парусный Катамаран',
        yachtDesc: 'Премиальный чартер. Доступно с капитаном или без — мировые марины.',
        yachtPrice: 'от 250 € / день',
        yachtBtn: 'Чартер из {city}'
      },
      extras: {
        transferTitle: 'Комфортный трансфер',
        transferDesc: 'Трансферы встречающий с табличкой из аэропортов и вокзалов по всему миру.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Экскурсии и активности',
        excursionsDesc: 'Билеты на достопримечательности и туры по всему миру.',
        excursionsBtn: 'Klook',
        esimTitle: 'Мобильный интернет eSIM',
        esimDesc: 'Подключение к сети за 1 минуту без физических SIM-карт.',
        esimBtn: 'Saily',
        compensationTitle: 'Компенсация за рейсы',
        compensationDesc: 'Верните до 600 € за задержанный или отмененный рейс.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const localized: { [K in LocaleCode]: typeof base } = {
  en: base,
  es: { ...base, ui: { ...base.ui, hero: { ...base.ui.hero, title: 'Encuentra rutas más inteligentes, no solo billetes más baratos.', cta: 'Buscar vuelos' } } },
  pt: base,
  fr: base,
  de: base,
  'zh-CN': base,
  ar: { ...base, ui: { ...base.ui, hero: { ...base.ui.hero, title: 'اعثر على مسارات أذكى، وليس فقط تذاكر أرخص.', cta: 'ابحث عن رحلات' } } },
  it: base,
  ru: ruOverride,
  uk: base,
  be: base,
  ja: base,
  ko: base
};
export const getDictionary=(locale:string)=>localized[(locale in localized?locale:defaultLocale) as LocaleCode];
export const getLocaleMeta=(locale:string)=>localeList.find(item=>item.code===locale)??localeList[0];
export const dictionaries=localized;
