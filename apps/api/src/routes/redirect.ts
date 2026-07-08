import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { envSchema } from '../lib/search-schema';
import { partnerConfigSchema } from '@flyntos/search-contracts';
import { TRAVEL_PARTNERS } from '@flyntos/config';

const querySchema = z.object({
  to: z.string().optional(),
  from: z.string().optional(),
  date: z.string().optional(),
  depart: z.string().optional(),
  return: z.string().optional(),
}).catchall(z.unknown());

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

    // Override with hardcoded bulletproof Aviasales redirect logic
    if (partnerId === 'aviasales') {
      const query = request.query as any;

      // 1. Извлекаем параметры с защитой от любых имён ключей
      const fromCity = (query.from || query.origin || 'SOF').toUpperCase();
      const toCity = (query.to || query.destination || 'MAD').toUpperCase();
      const rawDate = query.date || query.depart || '2026-07-10';

      // 2. Парсим дату строго в формат DDMM (например, '1007')
      let formattedDate = '1007';
      if (rawDate && rawDate.includes('-')) {
        const [year, month, day] = rawDate.split('-');
        formattedDate = `${day}${month}`;
      }

      // 3. Собираем монолитный путь для Aviasales/Jetradar
      // Шаблон: /search/SOF1007MAD1
      const searchPath = `/search/${fromCity}${formattedDate}${toCity}1`;

      // 4. Финальный реферальный URL
      const targetUrl = `https://tp.media/r?marker=748197&trs=547770&p=4114&campaign_id=100&u=${encodeURIComponent('https://www.aviasales.com' + searchPath)}`;

      // 5. Логирование в консоль бэкенда для проверки
      console.log("====================================");
      console.log("FLYNTOS DEBUG:");
      console.log("FROM:", fromCity, "TO:", toCity, "DATE:", formattedDate);
      console.log("SEARCH PATH:", searchPath);
      console.log("TARGET URL:", targetUrl);
      console.log("====================================");

      return reply.code(302).redirect(targetUrl);
    }

    // 2. Safely parse query parameter for other partners
    const parsedQuery = querySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.code(400).send({ error: 'Invalid query parameters' });
    }

    // If 'to' is specified and is a valid HTTP URL, use it as redirect destination.
    // Otherwise use partner.baseUrl.
    let targetUrlString = partner.baseUrl;
    const toParam = String(parsedQuery.data.to || '');
    if (toParam.startsWith('http://') || toParam.startsWith('https://')) {
      targetUrlString = toParam;
    }

    // 3. Build URL strictly via new URL() to avoid injection
    let targetUrl: URL;
    try {
      targetUrl = new URL(targetUrlString);
    } catch {
      return reply.code(400).send({ error: 'Invalid destination URL' });
    }

    // Extract parsed parameters
    const originCode = parsedQuery.data.from ? String(parsedQuery.data.from).toUpperCase() : null;
    const destCode = (parsedQuery.data.to && !toParam.startsWith('http')) ? toParam.toUpperCase() : null;
    const flightDate = parsedQuery.data.date || parsedQuery.data.depart;

    // Add search parameters if they are present (fallback for other partners)
    if (originCode) targetUrl.searchParams.set('origin', originCode);
    if (destCode) targetUrl.searchParams.set('destination', destCode);
    if (flightDate) targetUrl.searchParams.set('depart_date', String(flightDate));
    if (parsedQuery.data.return) targetUrl.searchParams.set('return_date', String(parsedQuery.data.return));

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
