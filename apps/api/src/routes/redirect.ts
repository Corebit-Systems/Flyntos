import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { envSchema } from '../lib/search-schema';
import { partnerConfigSchema } from '@flyntos/search-contracts';

const PARTNERS: Record<string, { name: string; campaignId: number; baseUrl: string; category: 'flights' | 'hotels' | 'cars' | 'all' }> = {
  aviasales: { name: 'Aviasales', campaignId: 701, baseUrl: 'https://aviasales.ru', category: 'flights' },
  yandex: { name: 'Yandex Travel', campaignId: 702, baseUrl: 'https://travel.yandex.ru', category: 'all' },
  example: { name: 'Example Partner', campaignId: 703, baseUrl: 'https://example.com', category: 'flights' },
};

const querySchema = z.object({
  to: z.string().url().optional(),
}).strict();

export async function redirectRoutes(app: FastifyInstance) {
  app.get('/out/:partnerId', async (request, reply) => {
    const { partnerId } = request.params as { partnerId: string };

    // 1. Sanitize partnerId against Path Traversal and prototype pollution
    // Strict regex check: alphanumeric only
    if (!/^[a-zA-Z0-9_-]+$/.test(partnerId)) {
      return reply.code(400).send({ error: 'Invalid partner ID format' });
    }

    const partner = PARTNERS[partnerId];
    if (!partner) {
      return reply.code(404).send({ error: 'Partner not found' });
    }

    // Validate partner details against the strict partnerConfigSchema
    try {
      partnerConfigSchema.parse({
        id: partnerId,
        ...partner
      });
    } catch (err) {
      return reply.code(500).send({ error: 'Internal configuration error' });
    }

    // 2. Safely parse and sanitize query parameter 'to'
    const parsedQuery = querySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.code(400).send({ error: 'Invalid query parameters' });
    }

    // If 'to' is specified, we use it; otherwise, use partner's base URL.
    let targetUrlString = parsedQuery.data.to || partner.baseUrl;

    // 3. Build URL strictly via new URL() to avoid injection
    let targetUrl: URL;
    try {
      targetUrl = new URL(targetUrlString);
    } catch {
      return reply.code(400).send({ error: 'Invalid destination URL' });
    }

    // 4. Open Redirect Protection (White-list checking)
    const env = envSchema.parse(process.env);
    const allowedOrigins = env.ALLOWED_REDIRECT_ORIGINS.split(',').map(o => o.trim().toLowerCase());

    const targetOrigin = targetUrl.origin.toLowerCase();
    const isAllowed = allowedOrigins.some(allowed => {
      try {
        const allowedOrigin = new URL(allowed).origin.toLowerCase();
        return targetOrigin === allowedOrigin;
      } catch {
        return false;
      }
    });

    if (!isAllowed) {
      return reply.code(403).send({ error: 'Destination URL is not allowed (Open Redirect protection)' });
    }

    // 5. Secure parameter injection (marker=748197, trs=547770, campaign_id)
    targetUrl.searchParams.set('marker', '748197');
    targetUrl.searchParams.set('trs', '547770');
    targetUrl.searchParams.set('campaign_id', partner.campaignId.toString());

    // Prevent Prototype Pollution in URL parameters
    targetUrl.searchParams.delete('__proto__');
    targetUrl.searchParams.delete('constructor');

    // 6. Safe redirection
    return reply.code(302).redirect(targetUrl.toString());
  });
}
