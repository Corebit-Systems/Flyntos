import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class GetYourGuideAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    // Generate GetYourGuide affiliate link
    // e.g. https://www.getyourguide.com/search?q={destinationIata}&partner_id={subId}
    const locale = context.locale || 'en';
    
    // We pass the destinationIata as query or we could map it to a city name if we had it in context
    const baseUrl = `https://www.getyourguide.com/search`;
    const deeplink = `${baseUrl}?q=${context.destinationIata}&partner_id=${subId}&locale=${locale}`;

    return {
      partnerName: 'GetYourGuide',
      serviceType: 'experience',
      deeplink,
      logoUrl: 'https://logo.clearbit.com/getyourguide.com'
    };
  }
}
