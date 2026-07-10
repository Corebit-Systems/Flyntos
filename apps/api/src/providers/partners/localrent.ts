import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class LocalrentAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    const params = new URLSearchParams();
    const locationCode = context.destinationIata === 'TIV' ? 'tivat' : 'podgorica';
    params.set('city', locationCode);
    params.set('date_from', context.departureDate);
    if (context.returnDate) {
      params.set('date_to', context.returnDate);
    }
    params.set('subid', subId);
    
    const trackingId = process.env.LOCALRENT_TRACKING_ID || 'default_tracking';
    params.set('a', trackingId);

    // If destination is not TIV or TGD, maybe just point to main page, or null.
    // The prompt says: "Для авто и яхт (Localrent и др.): Кнопка "Подобрать транспорт" должна вести на White Label".
    // We can just link to main domain if not montenegro, but let's stick to montenegro for localrent.
    let baseUrl = `https://localrent.com/`;
    if (context.destinationIata === 'TGD' || context.destinationIata === 'TIV') {
        baseUrl = `https://localrent.com/montenegro/`;
    }

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
