export interface SearchContext {
  originIata: string;
  destinationIata: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string | undefined;   // YYYY-MM-DD
  passengers: number;
  locale: string;
}

export interface PartnerLinkResult {
  id: string;
  partnerName: string;
  serviceType: 'flight' | 'car' | 'transfer' | 'experience';
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  deeplink: string;
  logoUrl?: string;
  minEstimatedPrice?: number;
}
