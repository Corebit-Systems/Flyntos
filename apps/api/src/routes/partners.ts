import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function partnersRoutes(app: FastifyInstance) {
  // CARS ROUTE
  app.get('/partners/cars', async (request, reply) => {
    const querySchema = z.object({
      origin: z.string().min(3).max(3),
      depart: z.string().optional(),
      return: z.string().optional()
    });

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid parameters', details: parsed.error.issues });
    }

    const { origin, depart } = parsed.data;
    
    // Realistic dummy data generation based on location
    const basePrice = origin === 'TGD' || origin === 'TIV' ? 25 : origin === 'MAD' ? 35 : 40;
    const currency = '€';
    
    // AutoEurope Affiliate link placeholder
    const affiliateUrl = `https://www.autoeurope.com/results/?pickup=${origin}&date=${depart || '2026-09-01'}&aff=flyntos`;

    const cars = [
      {
        id: 'c1',
        model: origin === 'TGD' || origin === 'TIV' ? 'Fiat 500' : 'Volkswagen Polo',
        category: 'Mini / Economy',
        transmission: 'Manual',
        price_per_day: basePrice,
        currency,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80',
        url: affiliateUrl
      },
      {
        id: 'c2',
        model: origin === 'TGD' || origin === 'TIV' ? 'Volkswagen Golf' : 'Seat Leon',
        category: 'Compact',
        transmission: 'Automatic',
        price_per_day: basePrice + 15,
        currency,
        image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80',
        url: affiliateUrl
      },
      {
        id: 'c3',
        model: origin === 'TGD' || origin === 'TIV' ? 'Audi A4' : 'BMW 3 Series',
        category: 'Premium',
        transmission: 'Automatic',
        price_per_day: basePrice + 60,
        currency,
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
        url: affiliateUrl
      }
    ];

    // Simulating provider API delay
    await new Promise(r => setTimeout(r, 600));

    return reply.send({ data: cars, provider: 'AutoEurope' });
  });

  // YACHTS ROUTE
  app.get('/partners/yachts', async (request, reply) => {
    const querySchema = z.object({
      origin: z.string().min(3).max(3),
      depart: z.string().optional()
    });

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid parameters', details: parsed.error.issues });
    }

    const { origin, depart } = parsed.data;

    // Only show yachts for coastal/relevant destinations like Montenegro, Spain, etc.
    const isCoastal = ['TGD', 'TIV', 'MAD', 'BCN', 'PMI', 'ATH'].includes(origin);
    
    if (!isCoastal) {
      await new Promise(r => setTimeout(r, 400));
      return reply.send({ data: [], provider: 'SEARADAR', message: 'No marinas found near this destination.' });
    }

    const baseMarina = origin === 'TGD' || origin === 'TIV' ? 'Porto Montenegro, Tivat' : origin === 'ATH' ? 'Alimos Marina, Athens' : 'Palma de Mallorca';
    
    // SEARADAR Affiliate link placeholder
    const affiliateUrl = `https://searadar.com/search?location=${origin}&date=${depart || '2026-09-01'}&aff=flyntos`;

    const yachts = [
      {
        id: 'y1',
        model: 'Lagoon 40',
        type: 'Catamaran',
        year: 2021,
        marina: baseMarina,
        price_per_week: 3200,
        currency: '€',
        image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
        url: affiliateUrl
      },
      {
        id: 'y2',
        model: 'Dufour 460 Grand Large',
        type: 'Sailing Yacht',
        year: 2019,
        marina: baseMarina,
        price_per_week: 2500,
        currency: '€',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
        url: affiliateUrl
      },
      {
        id: 'y3',
        model: 'Sunseeker Manhattan 52',
        type: 'Motor Yacht',
        year: 2022,
        marina: baseMarina,
        price_per_week: 11500,
        currency: '€',
        image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80',
        url: affiliateUrl
      }
    ];

    // Simulating provider API delay
    await new Promise(r => setTimeout(r, 800));

    return reply.send({ data: yachts, provider: 'SEARADAR' });
  });
}
