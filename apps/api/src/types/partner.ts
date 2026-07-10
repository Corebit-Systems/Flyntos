export interface SearchContext {
  originIata: string;
  destinationIata: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string | undefined;   // YYYY-MM-DD
  passengers: number;
  locale: string;
}

export interface PartnerLinkResult {
  partnerName: string;
  serviceType: 'flight' | 'car';
  deeplink: string;
  logoUrl: string;
  minEstimatedPrice?: number;
}
