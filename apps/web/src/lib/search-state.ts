export type SearchFiltersPayload = { priceMin?: number; priceMax?: number; maxStops?: number; cabin?: 'economy' | 'premium-economy' | 'business' | 'first'; baggage?: 'any' | 'carry-on' | 'checked' };
const toNumber = (value?: string) => { if (!value) return undefined; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; };
const isCabin = (value?: string): value is NonNullable<SearchFiltersPayload['cabin']> => value === 'economy' || value === 'premium-economy' || value === 'business' || value === 'first';
const isBaggage = (value?: string): value is NonNullable<SearchFiltersPayload['baggage']> => value === 'any' || value === 'carry-on' || value === 'checked';
export const parseSearchFilters = (query: Record<string, string | undefined>): SearchFiltersPayload => { const maxStops = toNumber(query.maxStops); const priceMin = toNumber(query.priceMin); const priceMax = toNumber(query.priceMax); const cabin = isCabin(query.cabin) ? query.cabin : undefined; const baggage = isBaggage(query.baggage) ? query.baggage : undefined; return { ...(priceMin !== undefined ? { priceMin } : {}), ...(priceMax !== undefined ? { priceMax } : {}), ...(maxStops !== undefined ? { maxStops } : {}), ...(cabin ? { cabin } : {}), ...(baggage ? { baggage } : {}) }; };
export const hasSearchFilters = (filters: SearchFiltersPayload) => Object.values(filters).some((value) => value !== undefined);


