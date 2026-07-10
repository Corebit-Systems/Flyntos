import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KlookAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    const locale = context.locale || 'en';
    const baseUrl = `https://www.klook.com/${locale}/search`;
    const deeplink = `${baseUrl}?query=${context.destinationIata}&aff_sub=${subId}`;

    return {
      id: `klook-wl-${context.destinationIata}`,
      partnerName: 'Klook',
      serviceType: 'experience',
      title: 'Local Attractions & Essentials',
      description: 'Get tickets for top attractions, theme parks, and travel essentials like portable WiFi.',
      imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
      price: 15,
      currency: 'EUR',
      deeplink: deeplink,
      logoUrl: 'https://logo.clearbit.com/klook.com'
    };
  }
}
