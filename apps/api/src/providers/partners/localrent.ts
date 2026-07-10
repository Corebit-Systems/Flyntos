import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

// Dynamic mapping of airport IATA codes to Localrent country slugs
const iataToCountrySlug: Record<string, string> = {
  // Montenegro
  TIV: 'montenegro',
  TGD: 'montenegro',
  // Cyprus
  LCA: 'cyprus',
  PFO: 'cyprus',
  // Greece
  ATH: 'greece',
  HER: 'greece',
  CHQ: 'greece',
  RHO: 'greece',
  // Georgia
  TBS: 'georgia',
  BUS: 'georgia',
  KUT: 'georgia',
  // UAE
  DXB: 'uae',
  DWC: 'uae',
  AUH: 'uae',
  // Thailand
  HKT: 'thailand',
  BKK: 'thailand',
  CNX: 'thailand',
  // Turkey
  IST: 'turkey',
  SAW: 'turkey',
  AYT: 'turkey',
  DLM: 'turkey',
};

// Optional city mapping for localrent API expectations
const iataToCitySlug: Record<string, string> = {
  TIV: 'tivat',
  TGD: 'podgorica',
  LCA: 'larnaca',
  PFO: 'paphos',
  ATH: 'athens',
  HER: 'heraklion',
  CHQ: 'chania',
  RHO: 'rhodes',
  TBS: 'tbilisi',
  BUS: 'batumi',
  KUT: 'kutaisi',
  DXB: 'dubai',
  DWC: 'dubai',
  AUH: 'abu-dhabi',
  HKT: 'phuket',
  BKK: 'bangkok',
  CNX: 'chiang-mai',
  IST: 'istanbul',
  SAW: 'istanbul',
  AYT: 'antalya',
  DLM: 'dalaman',
};

export class LocalrentAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    const dest = context.destinationIata.toUpperCase();
    const countrySlug = iataToCountrySlug[dest];
    
    let locationCode = '';
    if (dest === 'TIV') {
      locationCode = 'tivat';
    } else if (dest === 'TGD') {
      locationCode = 'podgorica';
    } else {
      locationCode = iataToCitySlug[dest] || dest.toLowerCase();
    }

    const params = new URLSearchParams();
    params.set('city', locationCode);
    
    // Ensure YYYY-MM-DD format with dashes
    const formatDate = (d: string) => d.replace(/[\s/.]/g, '-');
    params.set('date_from', formatDate(context.departureDate));
    if (context.returnDate) {
      params.set('date_to', formatDate(context.returnDate));
    }
    params.set('subid', subId);
    
    const trackingId = process.env.LOCALRENT_TRACKING_ID || 'default_tracking';
    params.set('a', trackingId);

    const baseUrl = countrySlug ? `https://localrent.com/${countrySlug}/` : `https://localrent.com/`;
    const deeplink = `${baseUrl}?${params.toString()}`;

    return {
        id: `localrent-wl-${context.destinationIata}`,
        partnerName: 'Localrent',
        serviceType: 'car',
        title: 'Premium Car Rental',
        description: 'Explore the destination at your own pace. Discover the best car rental deals with zero deposit options.',
        imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
        price: 25,
        currency: 'EUR',
        deeplink: deeplink,
        logoUrl: 'https://localrent.com/images/logo_en.svg',
    };
  }
}
