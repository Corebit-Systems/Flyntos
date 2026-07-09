import { defaultLocale, localeList, type LocaleCode } from '@flyntos/config';

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

const esOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Encuentra rutas más inteligentes, no solo billetes más baratos.',
      cta: 'Buscar vuelos'
    },
    resultsPage: {
      titleReady: 'Tu búsqueda de vuelos por la ruta {origin} → {destination} está abierta',
      titleFrom: 'Ruta desde {origin}',
      titleSpecify: 'Especifica tu ruta de búsqueda',
      titleDestination: ' — especifica el destino',
      subtitleReady: 'Explora los servicios adicionales para tu viaje a continuación',
      subtitleSpecify: 'Regresa a la página de inicio y selecciona tu dirección',
      manualCta: 'Ir a los billetes manualmente',
      specifyCity: 'Por favor especifica la ciudad de destino',
      specifyDesc: 'Para buscar vuelos y seleccionar transporte, debes elegir el origen y el destino.',
      backToSearch: 'Volver a la búsqueda',
      carsTitle: 'Alquiler de coches & Chárter',
      extrasTitle: 'Extras',
      airportTransport: 'Transporte en el aeropuerto de {city}',
      transportSubtitle: 'Reserva un coche o yate en tu punto de llegada',
      cars: {
        optimalTitle: 'Crossover Óptimo',
        optimalDesc: 'La opción ideal para viajes cómodos por costas y carreteras de montaña.',
        optimalPrice: 'desde 35 € / día',
        optimalBtn: 'Alquilar coche en {city}',
        budgetTitle: 'Hatchback Económico',
        budgetDesc: 'Ideal para calles estrechas de ciudades históricas y fácil estacionamiento.',
        budgetPrice: 'desde 18 € / día',
        budgetBtn: 'Alquilar coche en {city}',
        yachtTitle: 'Catamarán de Vela',
        yachtDesc: 'Chárter premium. Disponible con o sin patrón - marinas del mundo.',
        yachtPrice: 'desde 250 € / día',
        yachtBtn: 'Chárter desde {city}'
      },
      extras: {
        transferTitle: 'Traslado Cómodo',
        transferDesc: 'Traslados desde aeropuertos y estaciones con cartel de bienvenida en todo el mundo.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Excursiones y Actividades',
        excursionsDesc: 'Boletos para atracciones y tours en todo el mundo.',
        excursionsBtn: 'Klook',
        esimTitle: 'Internet Móvil eSIM',
        esimDesc: 'Conexión a internet en 1 minuto sin tarjetas SIM físicas.',
        esimBtn: 'Saily',
        compensationTitle: 'Compensación de Vuelos',
        compensationDesc: 'Reclama hasta 600 € por vuelos retrasados o cancelados.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const ptOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Encontre rotas mais inteligentes, não apenas passagens mais baratas.',
      cta: 'Buscar voos'
    },
    resultsPage: {
      titleReady: 'Sua busca de voos pela rota {origin} → {destination} está aberta',
      titleFrom: 'Rota de {origin}',
      titleSpecify: 'Especifique sua rota de busca',
      titleDestination: ' — especifique o destino',
      subtitleReady: 'Explore serviços adicionais para sua viagem abaixo',
      subtitleSpecify: 'Volte para a página inicial e selecione a direção',
      manualCta: 'Ir para passagens manualmente',
      specifyCity: 'Por favor, especifique a cidade de destino',
      specifyDesc: 'Para buscar voos e selecionar transporte, você deve escolher a origem e o destino.',
      backToSearch: 'Voltar à busca',
      carsTitle: 'Aluguel de Carros & Charter',
      extrasTitle: 'Extras',
      airportTransport: 'Transporte no aeroporto de {city}',
      transportSubtitle: 'Reserve um carro ou iate no seu ponto de chegada',
      cars: {
        optimalTitle: 'Crossover Ideal',
        optimalDesc: 'A escolha ideal para viagens confortáveis ao longo de costas e estradas de montanha.',
        optimalPrice: 'desde 35 € / dia',
        optimalBtn: 'Alugar carro em {city}',
        budgetTitle: 'Hatchback Econômico',
        budgetDesc: 'Ideal para ruas estreitas de cidades históricas e estacionamento fácil.',
        budgetPrice: 'desde 18 € / dia',
        budgetBtn: 'Alugar carro em {city}',
        yachtTitle: 'Catamarã a Vela',
        yachtDesc: 'Charter premium. Disponível com ou sem capitão - marinas mundiais.',
        yachtPrice: 'desde 250 € / dia',
        yachtBtn: 'Charter de {city}'
      },
      extras: {
        transferTitle: 'Transfer Confortável',
        transferDesc: 'Transfers de aeroportos e estações com placa de recepção no mundo todo.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Excursões e Atividades',
        excursionsDesc: 'Ingressos para atrações e passeios no mundo inteiro.',
        excursionsBtn: 'Klook',
        esimTitle: 'Internet Móvel eSIM',
        esimDesc: 'Conexão à internet em 1 minuto sem cartões SIM físicos.',
        esimBtn: 'Saily',
        compensationTitle: 'Compensação de Voos',
        compensationDesc: 'Receba até 600 € por voos atrasados ou cancelados.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const frOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Trouvez des itinéraires plus intelligents, pas seulement des billets moins chers.',
      cta: 'Rechercher des vols'
    },
    resultsPage: {
      titleReady: 'Votre recherche de vols pour l\'itinéraire {origin} → {destination} est ouverte',
      titleFrom: 'Itinéraire depuis {origin}',
      titleSpecify: 'Spécifiez votre itinéraire de recherche',
      titleDestination: ' — spécifiez la destination',
      subtitleReady: 'Explorez les services supplémentaires pour votre voyage ci-dessous',
      subtitleSpecify: 'Retournez à la page d\'accueil et sélectionnez votre direction',
      manualCta: 'Aller aux billets manuellement',
      specifyCity: 'Veuillez spécifier la ville de destination',
      specifyDesc: 'Pour rechercher des vols et sélectionner un transport, vous devez choisir l\'origine et la destination.',
      backToSearch: 'Retour à la recherche',
      carsTitle: 'Location de voitures & Charter',
      extrasTitle: 'Extras',
      airportTransport: 'Transport à l\'aéroport de {city}',
      transportSubtitle: 'Réservez une voiture ou un yacht à votre point d\'arrivée',
      cars: {
        optimalTitle: 'Crossover Optimal',
        optimalDesc: 'Le choix idéal pour des trajets confortables le long des côtes et des routes de montagne.',
        optimalPrice: 'à partir de 35 € / jour',
        optimalBtn: 'Louer une voiture à {city}',
        budgetTitle: 'Citadine Économique',
        budgetDesc: 'Idéal pour les rues étroites des villes historiques et un stationnement facile.',
        budgetPrice: 'à partir de 18 € / jour',
        budgetBtn: 'Louer une voiture à {city}',
        yachtTitle: 'Catamaran à Voile',
        yachtDesc: 'Charter premium. Disponible avec ou sans skipper - marinas du monde entier.',
        yachtPrice: 'à partir de 250 € / jour',
        yachtBtn: 'Charter depuis {city}'
      },
      extras: {
        transferTitle: 'Transfert Confortable',
        transferDesc: 'Transferts d\'aéroports et de gares avec panneau d\'accueil dans le monde entier.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Excursions & Activités',
        excursionsDesc: 'Billets pour les attractions et visites dans le monde entier.',
        excursionsBtn: 'Klook',
        esimTitle: 'Internet Mobile eSIM',
        esimDesc: 'Connexion Internet en 1 minute sans carte SIM physique.',
        esimBtn: 'Saily',
        compensationTitle: 'Indemnisation des Vols',
        compensationDesc: 'Récupérez jusqu\'à 600 € pour des vols retardés ou annulés.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const deOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Finden Sie intelligentere Routen, nicht nur billigere Tickets.',
      cta: 'Flüge suchen'
    },
    resultsPage: {
      titleReady: 'Ihre Flugsuche für die Verbindung {origin} → {destination} ist bereit',
      titleFrom: 'Route von {origin}',
      titleSpecify: 'Geben Sie Ihre Suchroute an',
      titleDestination: ' — geben Sie das Ziel an',
      subtitleReady: 'Entdecken Sie unten zusätzliche Services für Ihre Reise',
      subtitleSpecify: 'Gehen Sie zurück zur Startseite und wählen Sie Ihre Richtung',
      manualCta: 'Manuell zu den Tickets wechseln',
      specifyCity: 'Bitte Zielort angeben',
      specifyDesc: 'Um nach Flügen zu suchen und Transportmittel auszuwählen, müssen Sie Abflug- und Zielort angeben.',
      backToSearch: 'Zurück zur Suche',
      carsTitle: 'Mietwagen & Charter',
      extrasTitle: 'Extras',
      airportTransport: 'Transport am Flughafen {city}',
      transportSubtitle: 'Buchen Sie ein Auto oder eine Yacht an Ihrem Ankunftsort',
      cars: {
        optimalTitle: 'Optimaler Crossover',
        optimalDesc: 'Optimale Wahl für komfortable Fahrten entlang der Küsten und Bergstraßen.',
        optimalPrice: 'ab 35 € / Tag',
        optimalBtn: 'Mietwagen in {city} buchen',
        budgetTitle: 'Günstiges Kompaktauto',
        budgetDesc: 'Ideal für enge Gassen historischer Altstädte und einfaches Parken.',
        budgetPrice: 'ab 18 € / Tag',
        budgetBtn: 'Mietwagen in {city} buchen',
        yachtTitle: 'Segelkatamaran',
        yachtDesc: 'Premium-Charter. Verfügbar mit oder ohne Skipper - weltweite Marinas.',
        yachtPrice: 'ab 250 € / Tag',
        yachtBtn: 'Charter ab {city}'
      },
      extras: {
        transferTitle: 'Komfortabler Transfer',
        transferDesc: 'Flughafen- und Bahnhofstransfers mit Abholschild weltweit.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Touren & Aktivitäten',
        excursionsDesc: 'Tickets für Sehenswürdigkeiten und Touren weltweit.',
        excursionsBtn: 'Klook',
        esimTitle: 'Mobiles Internet eSIM',
        esimDesc: 'In 1 Minute mit dem Internet verbinden, ohne physische SIM-Karte.',
        esimBtn: 'Saily',
        compensationTitle: 'Flugentschädigung',
        compensationDesc: 'Fordern Sie bis zu 600 € für verspätete oder annullierte Flüge zurück.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const zhOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: '寻找更明智的航线，而不仅仅是更便宜的机票。',
      cta: '搜索航班'
    },
    resultsPage: {
      titleReady: '您的 {origin} → {destination} 航班搜索已准备就绪',
      titleFrom: '从 {origin} 出发的航线',
      titleSpecify: '请指定您的搜索路线',
      titleDestination: ' — 请指定目的地',
      subtitleReady: '在下方了解您的旅行增值服务',
      subtitleSpecify: '返回首页并选择您的方向',
      manualCta: '手动前往购买机票',
      specifyCity: '请指定目的地城市',
      specifyDesc: '如需搜索航班和选择交通工具，您必须选择出发地和目的地。',
      backToSearch: '返回搜索',
      carsTitle: '租车与游艇包船',
      extrasTitle: '增值服务',
      airportTransport: '{city} 机场交通',
      transportSubtitle: '在您抵达的目的地预订汽车或游艇',
      cars: {
        optimalTitle: '最佳跨界车',
        optimalDesc: '沿海岸线和山路舒适旅行的理想选择。',
        optimalPrice: '每天 35 € 起',
        optimalBtn: '在 {city} 租车',
        budgetTitle: '经济型两厢车',
        budgetDesc: '非常适合历史小镇的狭窄街道，易于停放。',
        budgetPrice: '每天 18 € 起',
        budgetBtn: '在 {city} 租车',
        yachtTitle: '双体帆船',
        yachtDesc: '豪华包船。提供带船长或光船租赁 - 全球游艇码头。',
        yachtPrice: '每天 250 € 起',
        yachtBtn: '从 {city} 包船'
      },
      extras: {
        transferTitle: '舒适接送',
        transferDesc: '全球机场及车站接送服务，持牌接机。',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: '一日游与活动',
        excursionsDesc: '全球景点门票与旅游线路。',
        excursionsBtn: 'Klook',
        esimTitle: '移动网络 eSIM',
        esimDesc: '无需实体 SIM 卡，1 分钟即可连网。',
        esimBtn: 'Saily',
        compensationTitle: '航班索赔',
        compensationDesc: '航班延误或取消最高可获 600 € 赔偿。',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const arOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'اعثر على مسارات أذكى، وليس فقط تذاكر أرخص.',
      cta: 'ابحث عن رحلات'
    },
    resultsPage: {
      titleReady: 'بحث الرحلات الخاص بك للمسار {origin} ← {destination} جاهز',
      titleFrom: 'المسار من {origin}',
      titleSpecify: 'يرجى تحديد مسار البحث',
      titleDestination: ' — يرجى تحديد الوجهة',
      subtitleReady: 'اكتشف الخدمات الإضافية لرحلتك أدناه',
      subtitleSpecify: 'الرجوع إلى الصفحة الرئيسية واختيار الاتجاه',
      manualCta: 'الذهاب إلى التذاكر يدويًا',
      specifyCity: 'يرجى تحديد مدينة الوجهة',
      specifyDesc: 'للبحث عن رحلات طيران واختيار وسائل النقل، يجب تحديد نقطة الانطلاق والوجهة.',
      backToSearch: 'العودة للبحث',
      carsTitle: 'تأجير السيارات واليخوت',
      extrasTitle: 'خدمات إضافية',
      airportTransport: 'وسائل النقل في مطار {city}',
      transportSubtitle: 'احجز سيارة أو يخت في نقطة وصولك',
      cars: {
        optimalTitle: 'كروس أوفر مثالية',
        optimalDesc: 'خيار مثالي للرحلات المريحة على طول السواحل والطرق الجبلية المتعرجة.',
        optimalPrice: 'من 35 € / يوم',
        optimalBtn: 'تأجير سيارة في {city}',
        budgetTitle: 'هاتشباك اقتصادية',
        budgetDesc: 'مثالية للشوارع الضيقة في المدن التاريخية وسهولة ركن السيارات.',
        budgetPrice: 'من 18 € / يوم',
        budgetBtn: 'تأجير سيارة في {city}',
        yachtTitle: 'يخت كاتاماران شراعي',
        yachtDesc: 'ميثاق قارب فاخر. متاح مع قبطان أو بدونه - في المراسي العالمية.',
        yachtPrice: 'من 250 € / يوم',
        yachtBtn: 'استئجار يخت من {city}'
      },
      extras: {
        transferTitle: 'نقل مريح',
        transferDesc: 'نقل من المطارات والمحطات مع لافتة استقبال حول العالم.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'جولات وأنشطة',
        excursionsDesc: 'تذاكر المعالم السياحية والجولات السياحية في جميع أنحاء العالم.',
        excursionsBtn: 'Klook',
        esimTitle: 'إنترنت محمول eSIM',
        esimDesc: 'اتصل بالشبكة في دقيقة واحدة بدون بطاقات SIM الفعلية.',
        esimBtn: 'Saily',
        compensationTitle: 'تعويضات الرحلات الجوية',
        compensationDesc: 'استرد ما يصل إلى 600 € لرحلات الطيران المتأخرة أو الملغاة.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const itOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Trova rotte più intelligenti, non solo biglietti più economici.',
      cta: 'Cerca voli'
    },
    resultsPage: {
      titleReady: 'La tua ricerca di voli per la rotta {origin} → {destination} è pronta',
      titleFrom: 'Rotta da {origin}',
      titleSpecify: 'Specifica la rotta di ricerca',
      titleDestination: ' — specifica la destinazione',
      subtitleReady: 'Esplora i servizi extra per il tuo viaggio qui sotto',
      subtitleSpecify: 'Torna alla home page e seleziona la direzione',
      manualCta: 'Vai ai biglietti manualmente',
      specifyCity: 'Specifica la città di destinazione',
      specifyDesc: 'Per cercare voli e selezionare i mezzi di trasporto, devi scegliere l\'origine e la destinazione.',
      backToSearch: 'Torna alla ricerca',
      carsTitle: 'Noleggio Auto & Charter',
      extrasTitle: 'Extra',
      airportTransport: 'Trasporti all\'aeroporto di {city}',
      transportSubtitle: 'Prenota un\'auto o uno yacht al tuo punto di arrivo',
      cars: {
        optimalTitle: 'Crossover Ottimale',
        optimalDesc: 'La scelta ottimale per viaggi confortevoli lungo le coste e i tornanti di montagna.',
        optimalPrice: 'da 35 € / giorno',
        optimalBtn: 'Noleggia auto a {city}',
        budgetTitle: 'Hatchback Economica',
        budgetDesc: 'Ideale per le strade strette dei centri storici e per un parcheggio facile.',
        budgetPrice: 'da 18 € / giorno',
        budgetBtn: 'Noleggia auto a {city}',
        yachtTitle: 'Catamarano a Vela',
        yachtDesc: 'Charter premium. Disponibile con o senza skipper - porti turistici di tutto il mondo.',
        yachtPrice: 'da 250 € / giorno',
        yachtBtn: 'Charter da {city}'
      },
      extras: {
        transferTitle: 'Trasferimento Confortevole',
        transferDesc: 'Trasferimenti da aeroporti e stazioni con cartello di benvenuto in tutto il mondo.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Tour e Attività',
        excursionsDesc: 'Biglietti per attrazioni e tour in tutto il mondo.',
        excursionsBtn: 'Klook',
        esimTitle: 'Internet Mobile eSIM',
        esimDesc: 'Connessione a Internet in 1 minuto senza SIM fisiche.',
        esimBtn: 'Saily',
        compensationTitle: 'Indennizzo Volo',
        compensationDesc: 'Ottieni fino a 600 € di risarcimento per volo in ritardo o cancellato.',
        compensationBtn: 'Compensair'
      }
    }
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

const ukOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Знаходьте розумніші маршрути, а не лише дешевші квитки.',
      cta: 'Шукати рейси'
    },
    resultsPage: {
      titleReady: 'Ваш пошук авіаквитків за маршрутом {origin} → {destination} відкритий',
      titleFrom: 'Маршрут з {origin}',
      titleSpecify: 'Вкажіть маршрут для пошуку квитків',
      titleDestination: ' — вкажіть пункт призначення',
      subtitleReady: 'Ознайомтеся з додатковими послугами для вашої подорожі нижче',
      subtitleSpecify: 'Поверніться на головну сторінку та виберіть напрямок',
      manualCta: 'Перейти до квитків вручну',
      specifyCity: 'Будь ласка, вкажіть місто призначення',
      specifyDesc: 'Для пошуку авіаквитків та підбору транспорту необхідно обрати пункт відправлення та призначення.',
      backToSearch: 'Повернутися до пошуку',
      carsTitle: 'Оренда авто та чартер',
      extrasTitle: 'Додатково',
      airportTransport: 'Транспорт в аеропорту {city}',
      transportSubtitle: 'Забронюйте авто або яхту в точці прибуття',
      cars: {
        optimalTitle: 'Оптимальний кросовер',
        optimalDesc: 'Оптимальний вибір для комфортних поїздок узбережжям та гірськими серпантинами.',
        optimalPrice: 'від 35 € / день',
        optimalBtn: 'Оренда авто в {city}',
        budgetTitle: 'Бюджетний хетчбек',
        budgetDesc: 'Ідеально для вузьких вуличок старих міст та легкого паркування.',
        budgetPrice: 'від 18 € / день',
        budgetBtn: 'Оренда авто в {city}',
        yachtTitle: 'Вітрильний Катамаран',
        yachtDesc: 'Преміальний чартер. Доступно з капітаном або без — світові марини.',
        yachtPrice: 'від 250 € / день',
        yachtBtn: 'Чартер з {city}'
      },
      extras: {
        transferTitle: 'Комфортний трансфер',
        transferDesc: 'Трансфери з табличкою зустрічі з аеропортів та вокзалів по всьому світу.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Екскурсії та активності',
        excursionsDesc: 'Квитки на визначні пам\'ятки та тури по всьому світу.',
        excursionsBtn: 'Klook',
        esimTitle: 'Мобільний інтернет eSIM',
        esimDesc: 'Підключення до мережі за 1 хвилину без фізичних SIM-карт.',
        esimBtn: 'Saily',
        compensationTitle: 'Компенсація за рейси',
        compensationDesc: 'Поверніть до 600 € за затриманий або скасований рейс.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const beOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'Знаходзьце разумнейшыя маршруты, а не толькі танныя квіткі.',
      cta: 'Шукаць рэйсы'
    },
    resultsPage: {
      titleReady: 'Ваш пошук авіяквіткоў па маршруце {origin} → {destination} адкрыты',
      titleFrom: 'Маршрут з {origin}',
      titleSpecify: 'Укажыце маршрут для пошуку квіткоў',
      titleDestination: ' — укажыце пункт прызначэння',
      subtitleReady: 'Вывучыце дадатковыя паслугі для вашай паездкі ніжэй',
      subtitleSpecify: 'Вярніцеся на галоўную старонку і выберыце кірунак',
      manualCta: 'Перайсці да квіткоў уручную',
      specifyCity: 'Калі ласка, укажыце горад прызначэння',
      specifyDesc: 'Для пошуку авіяквіткоў і падбору транспарту неабходна выбраць пункт адпраўлення і прызначэння.',
      backToSearch: 'Вярнуцца да пошуку',
      carsTitle: 'Арэнда аўто і чартар',
      extrasTitle: 'Дадаткова',
      airportTransport: 'Транспарт у аэрапорце {city}',
      transportSubtitle: 'Забраніруйце аўто ці яхту ў пункце прылёту',
      cars: {
        optimalTitle: 'Аптымальны кросовер',
        optimalDesc: 'Аптымальны выбар для камфортных паездак па ўзбярэжжы і горных серпанцінах.',
        optimalPrice: 'ад 35 € / дзень',
        optimalBtn: 'Арэнда аўто ў {city}',
        budgetTitle: 'Бюджэтны хэтчбек',
        budgetDesc: 'Ідэальна для вузкіх вуліц старых гарадоў і лёгкай паркоўкі.',
        budgetPrice: 'ад 18 € / дзень',
        budgetBtn: 'Арэнда аўто ў {city}',
        yachtTitle: 'Ветразевы Катамаран',
        yachtDesc: 'Прэміяльны чартар. Даступна з капітанам ці без — сусветныя марыны.',
        yachtPrice: 'ад 250 € / дзень',
        yachtBtn: 'Чартар з {city}'
      },
      extras: {
        transferTitle: 'Камфортны трансфер',
        transferDesc: 'Трансферы з таблічкай сустрэчы з аэрапортаў і вакзалаў па ўсім свеце.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: 'Экскурсіі і актыўнасці',
        excursionsDesc: 'Квіткі на славутасці і туры па ўсім свеце.',
        excursionsBtn: 'Klook',
        esimTitle: 'Мабільны інтэрнэт eSIM',
        esimDesc: 'Падключэнне да сеткі за 1 хвіліну без фізічных SIM-карт.',
        esimBtn: 'Saily',
        compensationTitle: 'Кампенсацыя за рэйсы',
        compensationDesc: 'Вярніце да 600 € за затрыманы ці адменены рэйс.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const jaOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: 'より安価なチケットだけでなく、よりスマートなルートを見つけましょう。',
      cta: 'フライト検索'
    },
    resultsPage: {
      titleReady: '{origin} → {destination} のフライト検索が整いました',
      titleFrom: '{origin} 出発のルート',
      titleSpecify: '検索ルートを指定してください',
      titleDestination: ' — 目的地を指定してください',
      subtitleReady: '旅行に便利な追加サービスを以下からお選びください',
      subtitleSpecify: 'ホームページに戻り、目的地を選択してください',
      manualCta: '手動で航空券ページへ移動する',
      specifyCity: '目的地の都市を指定してください',
      specifyDesc: 'フライト検索と現地交通機関の選択には、出発地と目的地を指定する必要があります。',
      backToSearch: '検索に戻る',
      carsTitle: 'レンタカー＆チャーター',
      extrasTitle: '追加オプション',
      airportTransport: '{city} 空港の交通手段',
      transportSubtitle: '到着地でのレンタカーやヨットチャーターを予約する',
      cars: {
        optimalTitle: '最適なクロスオーバー',
        optimalDesc: '海岸線や山道のドライブを快適に楽しむための最適な選択肢。',
        optimalPrice: '35 € / 日〜',
        optimalBtn: '{city} でレンタカーを借りる',
        budgetTitle: 'エコノミーハッチバック',
        budgetDesc: '歴史ある街の狭い路地や簡単な駐車に最適です。',
        budgetPrice: '18 € / 日〜',
        budgetBtn: '{city} でレンタカーを借りる',
        yachtTitle: 'セーリングカタマラン',
        yachtDesc: 'プレミアムチャーター。スキッパー（船長）付きまたはボートのみレンタル可能 - 世界中のマリーナ。',
        yachtPrice: '250 € / 日〜',
        yachtBtn: '{city} からヨットをチャーターする'
      },
      extras: {
        transferTitle: '快適な空港送迎',
        transferDesc: '世界中の空港や駅から、ネームプレートを持ったドライバーが送迎いたします。',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: '現地ツアー＆アクティビティ',
        excursionsDesc: '世界中の観光スポットのチケットやツアーのご案内。',
        excursionsBtn: 'Klook',
        esimTitle: 'モバイル通信 eSIM',
        esimDesc: '物理SIMカード不要、わずか1分でインターネットに接続完了。',
        esimBtn: 'Saily',
        compensationTitle: 'フライト遅延・欠航補償',
        compensationDesc: 'フライトの遅延や欠航に対して、最大600 €の補償金を請求。',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const koOverride = {
  ...base,
  ui: {
    ...base.ui,
    hero: {
      ...base.ui.hero,
      title: '더 저렴한 티켓뿐만 아니라 더 스마트한 경로를 찾아보세요.',
      cta: '항공권 검색'
    },
    resultsPage: {
      titleReady: '{origin} → {destination} 항공권 검색이 완료되었습니다',
      titleFrom: '{origin} 출발 경로',
      titleSpecify: '검색 경로를 지정해 주세요',
      titleDestination: ' — 목적지를 지정해 주세요',
      subtitleReady: '아래에서 여행을 위한 추가 서비스를 알아보세요',
      subtitleSpecify: '홈페이지로 돌아가서 목적지를 선택해 주세요',
      manualCta: '수동으로 티켓 예매하러 가기',
      specifyCity: '도착 도시를 지정해 주세요',
      specifyDesc: '항공권 검색 및 교통편 선택을 위해 출발지와 목적지를 지정해야 합니다.',
      backToSearch: '검색으로 돌아가기',
      carsTitle: '렌터카 & 요트 차터',
      extrasTitle: '추가 서비스',
      airportTransport: '{city} 공항 교통편',
      transportSubtitle: '도착지에서 렌터카 또는 요트를 예약해 보세요',
      cars: {
        optimalTitle: '최적의 크로스오버',
        optimalDesc: '해안도로와 구불구불한 산길을 편안하게 여행할 수 있는 최적의 선택.',
        optimalPrice: '1일 35 € 부터',
        optimalBtn: '{city}에서 렌터카 예약',
        budgetTitle: '경제적인 해치백',
        budgetDesc: '좁은 골목길이 많은 역사적인 구도심과 주차가 편리한 소형차.',
        budgetPrice: '1일 18 € 부터',
        budgetBtn: '{city}에서 렌터카 예약',
        yachtTitle: '세일링 카타마란',
        yachtDesc: '프리미엄 차터. 선장 포함 또는 단독 임대 가능 - 전 세계 마리나 이용.',
        yachtPrice: '1일 250 € 부터',
        yachtBtn: '{city} 출발 요트 차터'
      },
      extras: {
        transferTitle: '편안한 픽업/샌딩',
        transferDesc: '전 세계 공항 및 기차역에서 웰컴 피켓 미팅 서비스 제공.',
        transferBtn: 'KiwiTaxi',
        excursionsTitle: '투어 & 액티비티',
        excursionsDesc: '전 세계 주요 관광지 입장권 및 로컬 투어 상품.',
        excursionsBtn: 'Klook',
        esimTitle: '모바일 데이터 eSIM',
        esimDesc: '실물 SIM 카드 없이 1분 만에 데이터 로밍 인터넷 연결.',
        esimBtn: 'Saily',
        compensationTitle: '항공편 지연/결항 보상',
        compensationDesc: '지연 또는 결항된 항공편에 대해 최대 600 €의 보상금 환급 청구.',
        compensationBtn: 'Compensair'
      }
    }
  }
};

const localized: { [K in LocaleCode]: typeof base } = {
  en: base,
  es: esOverride,
  pt: ptOverride,
  fr: frOverride,
  de: deOverride,
  'zh-CN': zhOverride,
  ar: arOverride,
  it: itOverride,
  ru: ruOverride,
  uk: ukOverride,
  be: beOverride,
  ja: jaOverride,
  ko: koOverride
};

export const getDictionary = (locale: string) => localized[(locale in localized ? locale : defaultLocale) as LocaleCode];
export const getLocaleMeta = (locale: string) => localeList.find(item => item.code === locale) ?? localeList[0];
export const dictionaries = localized;
