import { getDictionary } from '@flyntos/i18n';
import { searchFlights } from '../../../lib/api';
import { getLocale } from '../../../lib/get-locale';
import { parseSearchFilters, hasSearchFilters } from '../../../lib/search-state';
import { ResultCard } from '../../../components/search/result-card';
import { FilterSidebar } from '../../../components/search/filter-sidebar';
import { ScenarioSwitcher } from '../../../components/search/scenario-switcher';
import { ResultsTabs } from '../../../components/search/ResultsTabs';

const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const shell = { width: 'min(1180px,calc(100% - 32px))', margin: '0 auto' };
const activeFilterSummary = (query: Record<string, string | undefined>) => [
  ['priceMax', query.priceMax ? ('Up to ' + query.priceMax + ' USD') : undefined],
  ['priceMin', query.priceMin ? ('From ' + query.priceMin + ' USD') : undefined],
  ['maxStops', query.maxStops === '0' ? 'Direct only' : query.maxStops === '1' ? 'Up to 1 stop' : undefined],
  ['cabin', query.cabin],
  ['baggage', query.baggage === 'checked' ? 'Checked bag' : query.baggage === 'carry-on' ? 'Carry-on' : undefined]
].map(([, label]) => label).filter(Boolean).join(' • ');

const panel = {
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.06)',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 24px 80px rgba(2,6,23,.5)',
  borderRadius: 28,
  padding: 28
};

export default async function ResultsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const locale = getLocale((await params).locale);
  const dict = getDictionary(locale);
  const currentSearch = await searchParams;
  const origin = currentSearch.origin?.trim() || '';
  const destination = currentSearch.destination?.trim() || '';
  const departureDate = currentSearch.departureDate;
  const scenario = currentSearch.scenario || 'standard';
  const filters = parseSearchFilters(currentSearch);
  const filterSummary = activeFilterSummary(currentSearch);

  if (!origin || !destination || !departureDate) {
    return (
      <section style={{ padding: '36px 0 64px' }}>
        <div style={{ ...shell, ...panel }}>
          <h1 className="text-2xl font-bold mb-2">Start a search</h1>
          <p style={{ color: '#94a3b8' }}>{dict.ui.results.empty}</p>
        </div>
      </section>
    );
  }

  if (!isValidDate(departureDate)) {
    return (
      <section style={{ padding: '36px 0 64px' }}>
        <div style={{ ...shell, ...panel }}>
          <h1 className="text-2xl font-bold mb-2">Invalid date</h1>
          <p style={{ color: '#fca5a5' }}>Use YYYY-MM-DD for departure.</p>
        </div>
      </section>
    );
  }

  try {
    const payload = {
      origin,
      destination,
      departureDate,
      returnDate: currentSearch.returnDate,
      locale,
      scenario,
      ...(hasSearchFilters(filters) ? { filters } : {})
    };
    const data = await searchFlights(payload);

    const sidebarComponent = (
      <FilterSidebar locale={locale} query={currentSearch} filters={filters} />
    );

    if (!data.itineraries?.length) {
      const emptyFlights = (
        <div style={panel}>
          <h1 className="text-2xl font-bold mb-2">{dict.ui.results.title}</h1>
          <p style={{ color: '#94a3b8' }}>No itineraries matched those constraints.</p>
          {filterSummary ? <p style={{ color: '#64748b', marginBottom: 0 }}>Active filters: {filterSummary}</p> : null}
        </div>
      );

      return (
        <section style={{ padding: '36px 0 64px' }}>
          <div style={shell}>
            <ResultsTabs
              flightsContent={emptyFlights}
              sidebarContent={sidebarComponent}
              origin={origin}
              destination={destination}
            />
          </div>
        </section>
      );
    }

    const flightsList = (
      <div>
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-.04em', fontWeight: 700 }}>
            {dict.ui.results.title}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            {origin.toUpperCase()} to {destination.toUpperCase()} | {departureDate}
          </p>
          {filterSummary ? <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Active filters: {filterSummary}</p> : null}
          <ScenarioSwitcher locale={locale} query={currentSearch} current={scenario} />
        </div>
        <div>
          {data.itineraries.map((item: any) => (
            <ResultCard key={item.id} itinerary={item} />
          ))}
        </div>
      </div>
    );

    return (
      <section style={{ padding: '36px 0 64px' }}>
        <div style={shell}>
          <ResultsTabs
            flightsContent={flightsList}
            sidebarContent={sidebarComponent}
            origin={origin}
            destination={destination}
          />
        </div>
      </section>
    );
  } catch (error) {
    const errorFlights = (
      <div style={panel}>
        <h1 className="text-2xl font-bold mb-2">{dict.ui.results.title}</h1>
        <p style={{ color: '#fca5a5' }}>
          Search failed: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );

    return (
      <section style={{ padding: '36px 0 64px' }}>
        <div style={shell}>
          <ResultsTabs
            flightsContent={errorFlights}
            sidebarContent={
              <FilterSidebar locale={locale} query={currentSearch} filters={filters} />
            }
            origin={origin}
            destination={destination}
          />
        </div>
      </section>
    );
  }
}
