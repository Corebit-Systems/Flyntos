export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  totalDurationMinutes: number;
  stops: number;
  airlineCode: string;
  airlineName: string;
  cnxType: string; // e.g. "Flyntos_SmartConnect", "Standard"
  baggageIncluded: boolean;
  score: number;
  // Basic info for display
  departureTime: string; // e.g. "10:00"
  arrivalTime: string;   // e.g. "14:30"
  origin: string;
  destination: string;
}

export interface FlightFiltersState {
  maxPrice: number | null;
  stops: number[]; // 0 for direct, 1 for 1 stop, 2 for 2+ stops
  airlines: string[];
  cnxTypes: string[];
  baggageIncluded: boolean;
}

export type SortType = 'cheapest' | 'fastest' | 'optimal';
