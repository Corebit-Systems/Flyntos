import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { envSchema } from '../lib/search-schema';

export async function pricesRoutes(app: FastifyInstance) {
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
    if (departDate) {
      url += `&depart_date=${departDate}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'x-access-token': env.TP_API_TOKEN
        }
      });

      if (!response.ok) {
        app.log.error(`Travelpayouts API error: ${response.status} ${response.statusText}`);
        return reply.code(502).send({ error: 'Failed to fetch prices from provider' });
      }

      const data = await response.json();
      return reply.send(data);
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error while fetching prices' });
    }
  });
}
