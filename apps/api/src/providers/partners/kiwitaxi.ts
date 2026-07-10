import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KiwiTaxiAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult[] | null {
    const locale = context.locale === 'ru' ? 'ru' : 'en';
    const baseUrl = `https://kiwitaxi.com/${locale}/airport/${context.destinationIata.toLowerCase()}`;
    const deeplink = `${baseUrl}?pap=${subId}`;

    return [
      {
        id: `kiwitaxi-economy-${context.destinationIata}`,
        partnerName: 'KiwiTaxi',
        serviceType: 'transfer',
        title: 'Economy Transfer',
        description: 'Meet & Greet, up to 4 passengers, perfect for couples or small families.',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
        price: 35,
        currency: 'EUR',
        deeplink: `${deeplink}&class=economy`,
        logoUrl: 'https://logo.clearbit.com/kiwitaxi.com'
      },
      {
        id: `kiwitaxi-minivan-${context.destinationIata}`,
        partnerName: 'KiwiTaxi',
        serviceType: 'transfer',
        title: 'Minivan Transfer',
        description: 'Spacious minivan for up to 7 passengers with extra luggage.',
        imageUrl: 'https://images.unsplash.com/photo-1529369623266-f5264b696110?w=800&q=80',
        price: 55,
        currency: 'EUR',
        deeplink: `${deeplink}&class=minivan`,
        logoUrl: 'https://logo.clearbit.com/kiwitaxi.com'
      }
    ];
  }
}
