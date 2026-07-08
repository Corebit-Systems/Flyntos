import { z } from 'zod';
import { defaultLocale } from '@flyntos/config';
export const passengerSchema = z.object({ adults: z.number().int().min(1).default(1), children: z.number().int().min(0).default(0), infants: z.number().int().min(0).default(0) });
export const filterSchema = z.object({ priceMin: z.coerce.number().min(0).optional(), priceMax: z.coerce.number().min(0).optional(), maxStops: z.coerce.number().int().min(0).max(2).optional(), cabin: z.enum(['economy','premium-economy','business','first']).optional(), baggage: z.enum(['any','carry-on','checked']).optional() });
export const envSchema = z.object({
  API_PORT: z.coerce.number().default(4000),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  ALLOWED_REDIRECT_ORIGINS: z.string().default('http://localhost:3000,https://example.com,https://aviasales.ru,https://travel.yandex.ru')
});
export const searchInputSchema = z.object({ origin: z.string().min(2), destination: z.string().min(2), departureDate: z.string(), returnDate: z.string().optional(), passengers: passengerSchema.optional(), cabin: z.enum(['economy','premium-economy','business','first']).optional(), locale: z.string().default(defaultLocale), scenario: z.enum(['standard','cheapest','best','weekend','family','business','direct-priority']).default('standard'), filters: filterSchema.optional() });
