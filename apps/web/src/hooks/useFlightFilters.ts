import { useMemo } from 'react';
import { FlightOffer, FlightFiltersState, SortType } from '../types/flight';

export interface FlightMetadata {
  minPrice: number;
  maxPrice: number;
  airlines: { code: string; name: string; minPrice: number }[];
}

export function useFlightFilters(
  offers: FlightOffer[],
  filters: FlightFiltersState,
  sortType: SortType
) {
  // 1. Dynamic extraction of metadata (before filtering)
  const metadata = useMemo<FlightMetadata>(() => {
    if (!offers || offers.length === 0) {
      return { minPrice: 0, maxPrice: 1000, airlines: [] };
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    const airlineMap = new Map<string, { name: string; minPrice: number }>();

    offers.forEach((offer) => {
      // Find global min and max prices
      if (offer.price < minPrice) minPrice = offer.price;
      if (offer.price > maxPrice) maxPrice = offer.price;

      // Collect airlines and their min prices
      const existing = airlineMap.get(offer.airlineCode);
      if (!existing || offer.price < existing.minPrice) {
        airlineMap.set(offer.airlineCode, { name: offer.airlineName, minPrice: offer.price });
      }
    });

    const airlines = Array.from(airlineMap.entries()).map(([code, data]) => ({
      code,
      name: data.name,
      minPrice: data.minPrice,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return {
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxPrice: maxPrice === -Infinity ? 1000 : maxPrice,
      airlines,
    };
  }, [offers]);

  // 2. Filter flights
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // Price filter
      if (filters.maxPrice !== null && offer.price > filters.maxPrice) return false;

      // Stops filter
      if (filters.stops.length > 0) {
        // Convert offer.stops to our format: 0 -> 0, 1 -> 1, >=2 -> 2
        const stopCategory = offer.stops >= 2 ? 2 : offer.stops;
        if (!filters.stops.includes(stopCategory)) return false;
      }

      // Airlines filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(offer.airlineCode)) {
        return false;
      }

      // Connection Types filter (Flyntos_SmartConnect)
      if (filters.cnxTypes.length > 0 && !filters.cnxTypes.includes(offer.cnxType)) {
        return false;
      }

      // Baggage filter
      if (filters.baggageIncluded && !offer.baggageIncluded) {
        return false;
      }

      return true;
    });
  }, [offers, filters]);

  // 3. Sort flights
  const sortedOffers = useMemo(() => {
    // create a copy before sorting
    return [...filteredOffers].sort((a, b) => {
      switch (sortType) {
        case 'cheapest':
          return a.price - b.price;
        case 'fastest':
          return a.totalDurationMinutes - b.totalDurationMinutes;
        case 'optimal':
        default:
          return b.score - a.score; // Assuming higher score is better
      }
    });
  }, [filteredOffers, sortType]);

  return {
    metadata,
    filteredOffers: sortedOffers,
  };
}
