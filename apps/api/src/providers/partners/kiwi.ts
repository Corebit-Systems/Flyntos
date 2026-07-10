import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KiwiAffiliateAdapter extends BasePartnerAdapter {
  // STRICT REQUIREMENT: Base affiliate URL for Kiwi integration via TPX
  private readonly BASE_URL = process.env.KIWI_PARTNER_BASE_URL || 'https://kiwi.tpx.gr/foSJrpZS';

  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    const params = new URLSearchParams();

    // Mapping SearchContext to Kiwi query parameters
    params.set('origin', context.originIata);
    params.set('destination', context.destinationIata);
    
    // Kiwi usually accepts YYYY-MM-DD
    params.set('departure', context.departureDate);
    
    if (context.returnDate) {
      params.set('return', context.returnDate);
    }
    
    params.set('passengers', context.passengers.toString());
    params.set('locale', context.locale || 'en');
    
    // Pass the tracking subId
    params.set('subid', subId);

    const deeplink = `${this.BASE_URL}?${params.toString()}`;

    return {
      partnerName: 'Kiwi.com',
      serviceType: 'flight',
      deeplink,
      logoUrl: 'https://images.kiwi.com/logo/kiwi.com-logo-default.svg', // generic kiwi logo
    };
  }
}
