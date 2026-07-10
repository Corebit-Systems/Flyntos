import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class GetYourGuideAdapter extends BasePartnerAdapter {
  generateLink(context: SearchContext, subId: string): PartnerLinkResult[] | null {
    const locale = context.locale || 'en';
    const baseUrl = `https://www.getyourguide.com/search`;
    const deeplink = `${baseUrl}?q=${context.destinationIata}&partner_id=${subId}&locale=${locale}`;

    // Mocking specific tours based on destination, or generic otherwise
    let tours = [];

    if (context.destinationIata === 'TIV' || context.destinationIata === 'TGD') {
      tours = [
        {
          title: 'Boka Bay Boat Tour',
          desc: 'Explore the stunning Bay of Kotor by boat, visit Our Lady of the Rocks.',
          img: 'https://images.unsplash.com/photo-1594957476839-4dd3db12ba47?w=800&q=80',
          price: 45
        },
        {
          title: 'Tara River Canyon Rafting',
          desc: 'Adrenaline filled white-water rafting in the deepest canyon in Europe.',
          img: 'https://images.unsplash.com/photo-1534008709328-9c17f422e032?w=800&q=80',
          price: 85
        },
        {
          title: 'Montenegro Grand Tour',
          desc: 'Full-day tour covering Lovcen, Njegusi, and the old royal capital Cetinje.',
          img: 'https://images.unsplash.com/photo-1587313885060-fdfae7db542c?w=800&q=80',
          price: 55
        }
      ];
    } else if (context.destinationIata === 'ROM') {
      tours = [
        {
          title: 'Colosseum Underground Tour',
          desc: 'Skip-the-line access to the Colosseum, Roman Forum, and Palatine Hill.',
          img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
          price: 65
        },
        {
          title: 'Vatican Museums & Sistine Chapel',
          desc: 'Guided tour of the Vatican Museums with early access.',
          img: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80',
          price: 75
        },
        {
          title: 'Rome Street Food Tour',
          desc: 'Taste authentic Roman pizza, pasta, and gelato with a local guide.',
          img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
          price: 40
        }
      ];
    } else {
      tours = [
        {
          title: 'City Highlights Walking Tour',
          desc: 'Discover the best hidden gems and main attractions with a local guide.',
          img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
          price: 30
        },
        {
          title: 'Hop-On Hop-Off Bus Tour',
          desc: 'Explore the city at your own pace with a 24-hour bus ticket.',
          img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
          price: 25
        },
        {
          title: 'Evening Sunset Cruise',
          desc: 'Relaxing boat cruise with drinks and spectacular views of the city skyline.',
          img: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&q=80',
          price: 50
        }
      ];
    }

    return tours.map((t, idx) => ({
      id: `gyg-exp-${context.destinationIata}-${idx}`,
      partnerName: 'GetYourGuide',
      serviceType: 'experience',
      title: t.title,
      description: t.desc,
      imageUrl: t.img,
      price: t.price,
      currency: 'EUR',
      deeplink: `${deeplink}&campaign=${idx}`,
      logoUrl: 'https://logo.clearbit.com/getyourguide.com'
    }));
  }
}
