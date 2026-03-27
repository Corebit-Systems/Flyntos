import type { FastifyInstance } from 'fastify';
import { runSearch } from '../lib/mock-search';
import { searchInputSchema } from '../lib/search-schema';
export async function searchRoutes(app: FastifyInstance){app.post('/search',async(request)=>runSearch(searchInputSchema.parse(request.body)));}
