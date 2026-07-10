import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KlookAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    // Generate Klook affiliate link
    const locale = context.locale || 'en';
    
    const baseUrl = `https://www.klook.com/${locale}/search`;
    const deeplink = `${baseUrl}?query=${context.destinationIata}&aff_sub=${subId}`;

    return {
      partnerName: 'Klook',
      serviceType: 'experience',
      deeplink,
      logoUrl: 'https://logo.clearbit.com/klook.com'
    };
  }
}
