import { z } from 'zod';
import { defaultLocale } from '@flyntos/config';
export const searchInputSchema = z.object({ origin: z.string().min(2), destination: z.string().min(2), departureDate: z.string(), returnDate: z.string().optional(), passengers: z.object({ adults: z.number().int().min(1).default(1), children: z.number().int().min(0).default(0), infants: z.number().int().min(0).default(0) }).optional(), cabin: z.enum(['economy','premium-economy','business','first']).optional(), locale: z.string().default(defaultLocale), scenario: z.enum(['standard','cheapest','best','weekend','family','business','direct-priority']).default('standard') });
export const envSchema = z.object({ API_PORT: z.coerce.number().default(4000), APP_BASE_URL: z.string().url().default('http://localhost:3000') });
