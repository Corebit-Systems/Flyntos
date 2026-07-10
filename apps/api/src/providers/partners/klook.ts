import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class KlookAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult[] | null {
    const locale = context.locale || 'en';
    const baseUrl = `https://www.klook.com/${locale}/search`;
    const deeplink = `${baseUrl}?query=${context.destinationIata}&aff_sub=${subId}`;

    const tours = [
      {
        title: 'Theme Park Fast-Pass Ticket',
        desc: 'Skip the queues and enjoy unlimited rides at the top local theme park.',
        img: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
        price: 90
      },
      {
        title: 'Local Cultural Show & Dinner',
        desc: 'Immerse yourself in traditional music, dance, and a 3-course dinner.',
        img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
        price: 60
      },
      {
        title: 'Unlimited 4G WiFi Rental',
        desc: 'Stay connected anywhere with pocket WiFi pickup at the airport.',
        img: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800&q=80',
        price: 15
      }
    ];

    return tours.map((t, idx) => ({
      id: `klook-exp-${context.destinationIata}-${idx}`,
      partnerName: 'Klook',
      serviceType: 'experience',
      title: t.title,
      description: t.desc,
      imageUrl: t.img,
      price: t.price,
      currency: 'EUR',
      deeplink: `${deeplink}&item=${idx}`,
      logoUrl: 'https://logo.clearbit.com/klook.com'
    }));
  }
}
