import type { CanonicalItinerary } from '@flyntos/search-contracts';
import type { SearchInput } from './mock-search';
export function applyFilters(itineraries: CanonicalItinerary[], input: SearchInput) {
  const filters = input.filters;
  if (!filters) return itineraries;
  return itineraries.filter((item) => {
    const price = item.bestOffer.price.total;
    const stopsOk = filters.maxStops === undefined || item.stops <= filters.maxStops;
    const minOk = filters.priceMin === undefined || price >= filters.priceMin;
    const maxOk = filters.priceMax === undefined || price <= filters.priceMax;
    const cabinOk = !filters.cabin || item.segments.some((segment) => segment.legs.some((leg) => leg.cabin === filters.cabin));
    const baggageOk = !filters.baggage || filters.baggage === 'any' || (filters.baggage === 'checked' ? item.baggageSummary.toLowerCase().includes('checked') : item.baggageSummary.toLowerCase().includes('carry'));
    return stopsOk && minOk && maxOk && cabinOk && baggageOk;
  });
}
