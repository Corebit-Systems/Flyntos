import type { FastifyInstance } from 'fastify';
import { localeList, scenarios } from '@flyntos/config';
export async function configRoutes(app: FastifyInstance){app.get('/config/locales',async()=>({locales:localeList}));app.get('/config/scenarios',async()=>({scenarios}));}
