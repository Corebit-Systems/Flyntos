import { getDictionary } from '@flyntos/i18n';
import { getLocale } from '../../../lib/get-locale';
import { searchFlights } from '../../../lib/api';
import { ResultCard } from '../../../components/search/result-card';
export default async function ResultsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
const locale = getLocale((await params).locale);
const dict = getDictionary(locale);
const currentSearch = await searchParams;
const origin = currentSearch.origin;
const destination = currentSearch.destination;
const departureDate = currentSearch.departureDate;
if (!origin || !destination || !departureDate) {
return <section><div><h1>{dict.ui.results.title}</h1><p>{dict.ui.results.empty}</p></div></section>;
}
try {
const data = await searchFlights({ origin, destination, departureDate, returnDate: currentSearch.returnDate, locale });
return <section><div><h1>{dict.ui.results.title}</h1><p>{origin.toUpperCase()} to {destination.toUpperCase()} � {departureDate}</p><div>{data.itineraries.map((item: any) => <ResultCard key={item.id} itinerary={item} />)}</div></div></section>;
} catch (error) {
return <section><div><h1>{dict.ui.results.title}</h1><p>Search failed: {error instanceof Error ? error.message : 'Unknown error'}</p></div></section>;
}
}
