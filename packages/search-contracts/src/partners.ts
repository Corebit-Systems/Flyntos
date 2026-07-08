import { z } from 'zod';

export const partnerConfigSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Partner ID must be alphanumeric, underscores, or hyphens'),
  name: z.string().min(1),
  campaignId: z.number().int().positive(),
  category: z.enum(['flights', 'hotels', 'cars', 'all']),
  baseUrl: z.string().url('Base URL must be a valid HTTP/HTTPS URL'),
}).strict();

export type PartnerConfig = z.infer<typeof partnerConfigSchema>;
