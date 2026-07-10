import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class GetYourGuideAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    const locale = context.locale || 'en';
    const baseUrl = `https://www.getyourguide.com/search`;
    const deeplink = `${baseUrl}?q=${context.destinationIata}&partner_id=${subId}&locale=${locale}`;

    return {
      id: `gyg-wl-${context.destinationIata}`,
      partnerName: 'GetYourGuide',
      serviceType: 'experience',
      title: 'Unforgettable Tours & Activities',
      description: 'Discover the best sights, skip-the-line tickets, and local tours curated just for you.',
      imageUrl: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80',
      price: 25,
      currency: 'EUR',
      deeplink: deeplink,
      logoUrl: 'https://logo.clearbit.com/getyourguide.com'
    };
  }
}
