import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class LocalrentAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult[] | null {
    if (context.destinationIata !== 'TGD' && context.destinationIata !== 'TIV') {
      return null;
    }

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

    const baseUrl = `https://localrent.com/montenegro/?${params.toString()}`;

    return [
      {
        id: `localrent-economy-${context.destinationIata}`,
        partnerName: 'Localrent',
        serviceType: 'car',
        title: 'Hyundai i20 (Economy)',
        description: 'Auto, no deposit, great for city driving.',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
        price: 25,
        currency: 'EUR',
        deeplink: `${baseUrl}&class=economy`,
        logoUrl: 'https://localrent.com/images/logo_en.svg',
      },
      {
        id: `localrent-compact-${context.destinationIata}`,
        partnerName: 'Localrent',
        serviceType: 'car',
        title: 'VW Golf (Compact)',
        description: 'Manual, optimal choice for coastal roads.',
        imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c359?w=800&q=80',
        price: 35,
        currency: 'EUR',
        deeplink: `${baseUrl}&class=compact`,
        logoUrl: 'https://localrent.com/images/logo_en.svg',
      },
      {
        id: `localrent-cabrio-${context.destinationIata}`,
        partnerName: 'Localrent',
        serviceType: 'car',
        title: 'Mini Cooper Cabrio',
        description: 'Premium choice for sunny days. Feel the breeze.',
        imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80',
        price: 80,
        currency: 'EUR',
        deeplink: `${baseUrl}&class=cabriolet`,
        logoUrl: 'https://localrent.com/images/logo_en.svg',
      },
      {
        id: `localrent-suv-${context.destinationIata}`,
        partnerName: 'Localrent',
        serviceType: 'car',
        title: 'Nissan Qashqai (SUV)',
        description: 'Spacious and comfortable for mountain trips.',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
        price: 55,
        currency: 'EUR',
        deeplink: `${baseUrl}&class=suv`,
        logoUrl: 'https://localrent.com/images/logo_en.svg',
      }
    ];
  }
}
