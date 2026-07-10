import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class LocalrentAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    // Only available for Montenegro destinations as an example
    if (context.destinationIata !== 'TGD' && context.destinationIata !== 'TIV') {
      return null;
    }

    const params = new URLSearchParams();
    
    // Mapping destination to a location code (placeholder logic for Montenegro)
    const locationCode = context.destinationIata === 'TIV' ? 'tivat' : 'podgorica';
    
    params.set('city', locationCode);
    params.set('date_from', context.departureDate);
    if (context.returnDate) {
      params.set('date_to', context.returnDate);
    }
    
    // Partner subId tracking
    params.set('subid', subId);

    const deeplink = `https://localrent.com/montenegro/?${params.toString()}`;

    return {
      partnerName: 'Localrent',
      serviceType: 'car',
      deeplink,
      logoUrl: 'https://localrent.com/images/logo_en.svg', // generic placeholder
      minEstimatedPrice: 25, // Basic estimation
    };
  }
}
