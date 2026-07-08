import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { envSchema } from '../lib/search-schema';

interface PriceDay {
  date: string;
  price: number | null;
  isFallback?: boolean;
}

/**
 * Smart Fallback: generates a realistic 7-day price matrix when TP API cache is cold.
 * Prices are deterministic per route (same input → same output across requests),
 * so the UI never flickers on reload, but each route gets unique realistic values.
 */
function generateFallbackMatrix(origin: string, destination: string, departDateStr: string): PriceDay[] {
  // Deterministic seed based on route (not random per request)
  const routeSeed = (origin + destination).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // European routes avg ~$65-110, long-haul ~$300+
  const europeanCodes = new Set(['ROM','FCO','CIA','MAD','BCN','PAR','CDG','ORY','LON','LHR','LGW','AMS','BER','VIE','PRG','ATH','IST','MIL','MXP','LIN','DUB','CPH','ARN','OSL','HEL','LIS','WAW','BUD','BRU','ZRH']);
  const isEuroRoute = europeanCodes.has(origin.toUpperCase()) || europeanCodes.has(destination.toUpperCase());
  const basePrice = isEuroRoute
    ? 60 + (routeSeed % 60)   // $60–$120 for European routes
    : 250 + (routeSeed % 200); // $250–$450 for long-haul

  // Pivot around the requested departure date (or today if not provided)
  const pivot = departDateStr ? new Date(departDateStr) : new Date();
  if (isNaN(pivot.getTime())) pivot.setTime(Date.now());

  const offsets = [-3, -2, -1, 0, 1, 2, 3];
  const days = offsets.map((offset, i) => {
    const d = new Date(pivot);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().substring(0, 10);

    // Noise: deterministic per day index + route seed, range -$15...+$25
    const noise = ((routeSeed * (i + 1) * 7) % 41) - 15;
    const rawPrice = basePrice + noise;

    return { date: dateStr, price: rawPrice, isFallback: true };
  });

  // Mark the cheapest day with a slightly lower price (ensures "Best" badge appears)
  const minIdx = days.reduce((minI, d, i, arr) => (d.price! < arr[minI].price! ? i : minI), 0);
  days[minIdx].price = Math.max(days[minIdx].price! - 8, 1);

  return days;
}

export async function pricesRoutes(app: FastifyInstance) {

  // Legacy route kept for backward compat
  app.get('/prices/matrix', async (request, reply) => {
    const querySchema = z.object({
      origin: z.string().min(3).max(3),
      destination: z.string().min(3).max(3),
      departDate: z.string().optional()
    });

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid parameters', details: parsed.error.issues });
    }

    const { origin, destination, departDate } = parsed.data;
    const env = envSchema.parse(process.env);

    let url = `https://api.travelpayouts.com/v2/prices/week-matrix?currency=eur&origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&show_to_affiliates=true`;
    if (departDate) url += `&depart_date=${departDate}`;

    try {
      const response = await fetch(url, { headers: { 'x-access-token': env.TP_API_TOKEN } });
      if (!response.ok) {
        app.log.error(`Travelpayouts API error: ${response.status}`);
        return reply.code(502).send({ error: 'Failed to fetch prices from provider' });
      }
      return reply.send(await response.json());
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error while fetching prices' });
    }
  });

  // /api/prices — used by PriceMatrix component, with Smart Fallback
  app.get('/api/prices', async (request, reply) => {
    const querySchema = z.object({
      origin: z.string().min(3).max(3),
      destination: z.string().min(3).max(3),
      depart_date: z.string().optional()
    });

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid parameters', details: parsed.error.issues });
    }

    const { origin, destination, depart_date } = parsed.data;
    const env = envSchema.parse(process.env);

    let apiDays: PriceDay[] = [];

    try {
      let url = `https://api.travelpayouts.com/v2/prices/week-matrix?currency=usd&origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&show_to_affiliates=true`;
      if (depart_date) url += `&depart_date=${depart_date}`;

      const response = await fetch(url, {
        headers: { 'x-access-token': env.TP_API_TOKEN }
      });

      if (response.ok) {
        const raw = await response.json() as { data?: Array<{ depart_date: string; value: number }> };
        apiDays = (raw.data || []).map(d => ({
          date: d.depart_date,
          price: typeof d.value === 'number' ? d.value : null
        }));
        app.log.info(`TP API returned ${apiDays.length} price days for ${origin}->${destination}`);
      } else {
        app.log.warn(`Travelpayouts /api/prices HTTP ${response.status} for ${origin}->${destination}`);
      }
    } catch (error) {
      app.log.warn(`Travelpayouts /api/prices fetch failed: ${error}`);
    }

    // Smart Fallback: if API returned fewer than 3 days, generate full 7-day matrix
    const hasSufficientData = apiDays.filter(d => d.price !== null).length >= 3;

    if (hasSufficientData) {
      return reply.send({ data: apiDays, source: 'live' });
    }

    app.log.info(`Smart Fallback activated for ${origin}->${destination} (got ${apiDays.length} live days)`);
    const fallbackDays = generateFallbackMatrix(origin, destination, depart_date || '');

    return reply.send({ data: fallbackDays, source: 'fallback' });
  });
}

