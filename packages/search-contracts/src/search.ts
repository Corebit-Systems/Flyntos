import { z } from 'zod';

export const passengerCountSchema = z.number().int().min(0).max(9);

export const passengerLimitSchema = z.object({
  adults: z.number().int().min(1).max(9).default(1),
  children: passengerCountSchema.default(0),
  infants: passengerCountSchema.default(0),
}).strict();

export const searchInputSchema = z.object({
  from: z.string().regex(/^[A-Z]{3}$/, 'Origin must be a 3-letter uppercase IATA code'),
  to: z.string().regex(/^[A-Z]{3}$/, 'Destination must be a 3-letter uppercase IATA code'),
  departureDate: z.string().datetime({ message: 'Departure date must be a valid ISO datetime string' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Departure date must be a valid YYYY-MM-DD string')),
  returnDate: z.string().datetime({ message: 'Return date must be a valid ISO datetime string' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be a valid YYYY-MM-DD string')).optional(),
  passengers: passengerLimitSchema,
  cabin: z.enum(['economy', 'premium-economy', 'business', 'first']).default('economy'),
  locale: z.string().min(2).max(10).default('en'),
  scenario: z.enum(['standard', 'cheapest', 'best', 'weekend', 'family', 'business', 'direct-priority']).default('standard')
}).strict();

export type SearchInput = z.infer<typeof searchInputSchema>;
