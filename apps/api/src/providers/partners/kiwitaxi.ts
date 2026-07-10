import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KiwiTaxiAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    const locale = context.locale === 'ru' ? 'ru' : 'en';
    const baseUrl = `https://kiwitaxi.com/${locale}/airport/${context.destinationIata.toLowerCase()}`;
    const deeplink = `${baseUrl}?pap=${subId}`;

    return {
      id: `kiwitaxi-wl-${context.destinationIata}`,
      partnerName: 'KiwiTaxi',
      serviceType: 'transfer',
      title: 'Seamless Airport Transfers',
      description: 'Book a premium and reliable transfer from the airport directly to your hotel. Meet & Greet included.',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
      price: 30,
      currency: 'EUR',
      deeplink: deeplink,
      logoUrl: 'https://logo.clearbit.com/kiwitaxi.com'
    };
  }
}
