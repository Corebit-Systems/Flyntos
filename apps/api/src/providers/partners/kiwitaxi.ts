import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KiwiTaxiAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    // Generate a KiwiTaxi referral link
    // Default logic: Airport to destination, using destinationIata
    const locale = context.locale === 'ru' ? 'ru' : 'en';
    
    // Example format: https://kiwitaxi.com/en/airport/{destinationIata}?pap={subId}
    const baseUrl = `https://kiwitaxi.com/${locale}/airport/${context.destinationIata.toLowerCase()}`;
    const deeplink = `${baseUrl}?pap=${subId}`;

    return {
      partnerName: 'KiwiTaxi',
      serviceType: 'transfer',
      deeplink,
      logoUrl: 'https://logo.clearbit.com/kiwitaxi.com'
    };
  }
}
