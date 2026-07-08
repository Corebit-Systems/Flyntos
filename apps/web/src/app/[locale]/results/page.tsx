import { getDictionary } from '@flyntos/i18n';
import { getLocale } from '../../../lib/get-locale';
import { PriceMatrix } from '../../../components/results/PriceMatrix';
import { ResultsTabs } from '../../../components/results/ResultsTabs';

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
  
  // Try to match 'origin' from the form we just wrote or 'from' as requested by user
  const originRaw = currentSearch.origin?.trim() || currentSearch.from?.trim() || 'SOF';
  const destinationRaw = currentSearch.destination?.trim() || currentSearch.to?.trim() || 'MAD';
  const departDateRaw = currentSearch.departureDate?.trim() || currentSearch.depart?.trim() || '';

  const safeOrigin = sanitize(originRaw).toUpperCase();
  const safeDestination = sanitize(destinationRaw).toUpperCase();
  const safeDepartDate = sanitize(departDateRaw);

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 relative flex flex-col items-center">
      
      {/* Informer - Aviasales */}
      <div className="w-full max-w-5xl mb-12 p-6 bg-blue-900/20 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Ваш поиск авиабилетов по маршруту <span className="text-blue-400">{safeOrigin}</span> → <span className="text-blue-400">{safeDestination}</span> открыт
          </h2>
          <p className="text-neutral-300 text-sm">
            Изучите дополнительные услуги для вашей поездки ниже
          </p>
        </div>
        <a 
          href={`http://localhost:4000/out/aviasales?from=${safeOrigin}&to=${safeDestination}&date=${safeDepartDate}`} 
          target="_blank" rel="noopener noreferrer"
          className="shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all text-center uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20"
        >
          Перейти к билетам вручную
        </a>
      </div>

      <PriceMatrix origin={safeOrigin} destination={safeDestination} departDate={safeDepartDate} />

      <ResultsTabs />
    </div>
  );
}
