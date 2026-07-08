import { getLocale } from '../../../../lib/get-locale';
import { SearchForm } from '../../../../components/search/search-form';

export async function generateStaticParams() {
  const topRoutes = [
    'sof-mad',
    'ist-tiv',
    'mow-tiv',
    'beg-tiv',
    'dxb-lon'
  ];

  const locales = ['ru', 'en'];
  const params: any[] = [];

  for (const locale of locales) {
    for (const route of topRoutes) {
      params.push({ locale, route });
    }
  }

  return params;
}

export default async function AeoFlightPage({
  params
}: {
  params: Promise<{ locale: string; route: string }>
}) {
  const resolvedParams = await params;
  const locale = getLocale(resolvedParams.locale);
  const routeParam = resolvedParams.route || '';

  const [originRaw, destinationRaw] = routeParam.split('-');
  const origin = (originRaw || 'SOF').toUpperCase();
  const destination = (destinationRaw || 'MAD').toUpperCase();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Какое лучшее время для бронирования билетов по маршруту ${origin} — ${destination}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Оптимальное время — за 4-6 недель до вылета. Используйте умную матрицу Flyntos, чтобы отследить минимальную цену в диапазоне +-3 дня."
        }
      },
      {
        "@type": "Question",
        "name": `Есть ли прямые рейсы из ${origin} в ${destination}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Доступность прямых рейсов зависит от сезонного расписания авиакомпаний. Нажмите 'Искать рейсы' на Flyntos, чтобы мгновенно проверить текущие прямые маршруты и альтернативные стыковки."
        }
      },
      {
        "@type": "Question",
        "name": "Как Flyntos находит более умные маршруты?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Flyntos не просто ищет дешевые билеты, а оркеструет логику поиска, предлагая бесшовную сборку всей поездки: от авиабилетов до аренды авто и локальных travel-сервисов в один клик."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 relative flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-5xl mb-8 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Авиабилеты из <span className="text-blue-400">{origin}</span> в <span className="text-blue-400">{destination}</span> по умным маршрутам
        </h1>
        <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
          Найдите лучшие цены на перелеты, отслеживайте динамику стоимости и планируйте идеальное путешествие с Flyntos.
        </p>
      </div>

      <div className="w-full relative z-20 mb-16">
        <SearchForm
          locale={locale}
          initialOrigin={origin}
          initialDestination={destination}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-left shadow-2xl relative z-10">
        <h2 className="text-2xl font-bold text-white mb-6">Частые вопросы (FAQ)</h2>

        <div className="space-y-6">
          <div className="pb-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-blue-400 mb-2">
              ❓ Какое лучшее время для бронирования билетов по маршруту {origin} — {destination}?
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              👉 Оптимальное время — за 4-6 недель до вылета. Используйте умную матрицу Flyntos, чтобы отследить минимальную цену в диапазоне +-3 дня.
            </p>
          </div>

          <div className="pb-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-blue-400 mb-2">
              ❓ Есть ли прямые рейсы из {origin} в {destination}?
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              👉 Доступность прямых рейсов зависит от сезонного расписания авиакомпаний. Нажмите «Искать рейсы» на Flyntos, чтобы мгновенно проверить текущие прямые маршруты и альтернативные стыковки.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">
              ❓ Как Flyntos находит более умные маршруты?
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              👉 Flyntos не просто ищет дешевые билеты, а оркеструет логику поиска, предлагая бесшовную сборку всей поездки: от авиабилетов до аренды авто и локальных travel-сервисов в один клик.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
