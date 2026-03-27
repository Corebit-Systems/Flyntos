import type { FastifyInstance } from 'fastify';
import { registry } from '../lib/mock-search';
export async function providerRoutes(app: FastifyInstance){app.get('/providers/health',async()=>Promise.all(registry().list().map(adapter=>adapter.healthCheck())));}
