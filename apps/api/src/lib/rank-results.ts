import type { CanonicalItinerary } from '@flyntos/search-contracts';
import type { SearchInput } from './mock-search';

function scenarioScore(item: CanonicalItinerary, scenario: SearchInput['scenario']) {
  const price = item.bestOffer.price.total;
  const duration = item.totalDurationMinutes;
  const stops = item.stops;
  const baggage = item.baggageSummary.toLowerCase().includes('checked') ? 1 : 0;
  const cabinBonus = item.segments.some((segment) => segment.legs.some((leg) => leg.cabin === 'business' || leg.cabin === 'first')) ? 1 : 0;
  switch (scenario) {
    case 'cheapest': return -price * 1.3 - duration * 0.08 - stops * 40 + baggage * 3;
    case 'best': return -price * 0.8 - duration * 0.16 - stops * 55 + baggage * 10;
    case 'weekend': return -duration * 0.28 - stops * 65 - price * 0.45;
    case 'family': return baggage * 55 - stops * 70 - duration * 0.14 - price * 0.5;
    case 'business': return cabinBonus * 80 - duration * 0.22 - stops * 70 - price * 0.45;
    case 'direct-priority': return stops === 0 ? 120 - duration * 0.12 - price * 0.4 : -140 - duration * 0.08 - price * 0.3;
    default: return -price * 0.65 - duration * 0.12 - stops * 45 + baggage * 8;
  }
}

export function rankItineraries(itineraries: CanonicalItinerary[], input: SearchInput) {
  return itineraries.map((item) => ({ ...item, rankingScore: scenarioScore(item, input.scenario), bestOffer: { ...item.bestOffer, score: scenarioScore(item, input.scenario) } })).sort((a, b) => b.rankingScore - a.rankingScore);
}
