import { getDictionary } from '@flyntos/i18n';
import { getLocale } from '../../../lib/get-locale';
import { PriceMatrix } from '../../../components/results/PriceMatrix';
import { ResultsTabs } from '../../../components/results/ResultsTabs';
import Link from 'next/link';

// Simple XSS sanitization (Next.js automatically escapes in JSX, but this is a requested explicit sanitization)
const sanitize = (str: string | undefined | null) => {
  if (!str) return '';
  return String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export default async function ResultsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const locale = getLocale((await params).locale);
  const currentSearch = await searchParams;

  const originRaw = currentSearch.origin?.trim() || currentSearch.from?.trim() || '';
  const destinationRaw = currentSearch.destination?.trim() || currentSearch.to?.trim() || '';
  const departDateRaw = currentSearch.departureDate?.trim() || currentSearch.depart?.trim() || '';

  const safeOrigin = sanitize(originRaw).toUpperCase();
  const safeDestination = sanitize(destinationRaw).toUpperCase();
  const safeDepartDate = sanitize(departDateRaw);

  const hasRoute = safeOrigin.length >= 3 && safeDestination.length >= 3;

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 relative flex flex-col items-center">

      {/* Informer - route header */}
      <div className="w-full max-w-5xl mb-12 p-6 bg-blue-900/20 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            {hasRoute ? (
              <>Ваш поиск авиабилетов по маршруту <span className="text-blue-400">{safeOrigin}</span> → <span className="text-blue-400">{safeDestination}</span> открыт</>
            ) : safeOrigin ? (
              <>Маршрут из <span className="text-blue-400">{safeOrigin}</span> — укажите пункт назначения</>
            ) : (
              <>Укажите маршрут для поиска билетов</>
            )}
          </h2>
          <p className="text-neutral-300 text-sm">
            {hasRoute ? 'Изучите дополнительные услуги для вашей поездки ниже' : 'Вернитесь на главную страницу и выберите направление'}
          </p>
        </div>
        {hasRoute && (
          <Link
            href={`${apiBase}/out/aviasales?from=${safeOrigin}&to=${safeDestination}&date=${safeDepartDate}`}
            target="_blank" rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all text-center uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Перейти к билетам вручную
          </Link>
        )}
      </div>

      {!hasRoute ? (
        /* Empty State Overlay */
        <div className="w-full max-w-5xl flex flex-col items-center justify-center py-24 bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl relative z-10">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <svg className="w-9 h-9 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Пожалуйста, укажите город назначения</h3>
          <p className="text-neutral-400 text-sm max-w-md text-center mb-8">
            Для поиска авиабилетов и подбора транспорта необходимо выбрать пункт отправления и назначения.
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-wider"
          >
            Вернуться к поиску
          </Link>
        </div>
      ) : (
        <>
          <PriceMatrix origin={safeOrigin} destination={safeDestination} departDate={safeDepartDate} />
          <ResultsTabs />
        </>
      )}
    </div>
  );
}
