import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { envSchema } from '../lib/search-schema';
import { partnerConfigSchema } from '@flyntos/search-contracts';
import { TRAVEL_PARTNERS } from '@flyntos/config';

const querySchema = z.object({
  to: z.string().url().optional(),
}).strict();

export async function redirectRoutes(app: FastifyInstance) {
  app.get('/out/:partnerId', async (request, reply) => {
    const { partnerId } = request.params as { partnerId: string };

    // 1. Sanitize partnerId against Path Traversal and prototype pollution
    if (!/^[a-zA-Z0-9_-]+$/.test(partnerId)) {
      return reply.code(400).send({ error: 'Invalid partner ID format' });
    }

    const partner = TRAVEL_PARTNERS[partnerId as keyof typeof TRAVEL_PARTNERS];
    if (!partner) {
      return reply.code(404).send({ error: 'Partner not found' });
    }

    // Validate partner details against partnerConfigSchema (adding placeholder name)
    try {
      partnerConfigSchema.parse({
        id: partner.id,
        name: partner.id.toUpperCase(),
        campaignId: partner.campaignId,
        category: partner.category,
        baseUrl: partner.baseUrl
      });
    } catch (err) {
      return reply.code(500).send({ error: 'Internal configuration validation error' });
    }

    // 2. Safely parse query parameter 'to'
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
    
    // Add all partner base URLs to the allowed list dynamically, plus env-configured origins
    const partnerBaseUrls = Object.values(TRAVEL_PARTNERS).map(p => p.baseUrl);
    const allowedOriginsRaw = env.ALLOWED_REDIRECT_ORIGINS.split(',');
    
    const allowedOrigins = [...allowedOriginsRaw, ...partnerBaseUrls].map(o => {
      try {
        return new URL(o).origin.toLowerCase();
      } catch {
        return o.trim().toLowerCase();
      }
    });

    const targetOrigin = targetUrl.origin.toLowerCase();
    const isAllowed = allowedOrigins.includes(targetOrigin);

    if (!isAllowed) {
      return reply.code(403).send({ error: 'Destination URL is not allowed (Open Redirect protection)' });
    }

    // 5. Secure parameter injection (marker=748197, trs=547770, campaign_id)
    // Only inject if they are not already in the query params of the partner URL
    if (!targetUrl.searchParams.has('marker')) {
      targetUrl.searchParams.set('marker', '748197');
    }
    if (!targetUrl.searchParams.has('trs')) {
      targetUrl.searchParams.set('trs', '547770');
    }
    if (!targetUrl.searchParams.has('campaign_id') && partner.campaignId > 0) {
      targetUrl.searchParams.set('campaign_id', partner.campaignId.toString());
    }

    // Prevent Prototype Pollution in URL parameters
    targetUrl.searchParams.delete('__proto__');
    targetUrl.searchParams.delete('constructor');

    // 6. Safe redirection
    return reply.code(302).redirect(targetUrl.toString());
  });
}
