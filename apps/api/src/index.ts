//index.ts*//
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { envSchema } from './lib/search-schema';
import { healthRoutes } from './routes/health';
import { configRoutes } from './routes/config';
import { providerRoutes } from './routes/providers';
import { searchRoutes } from './routes/search';
import { redirectRoutes } from './routes/redirect';
import { pricesRoutes } from './routes/prices';
import { partnersRoutes } from './routes/partners';
const env = envSchema.parse(process.env);
const app = Fastify({ logger: true });
await app.register(cors, {
  origin: [
    'https://flyntos.com',
    /.*\.vercel\.app$/,
    'http://localhost:3000',
    env.APP_BASE_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
await app.register(healthRoutes);
await app.register(configRoutes);
await app.register(providerRoutes);
await app.register(searchRoutes);
await app.register(redirectRoutes);
await app.register(pricesRoutes);
await app.register(partnersRoutes);
app.setErrorHandler((error, _request, reply) => reply.code(400).send({ message: 'Request failed safely', detail: error instanceof Error ? error.message : 'Unknown error' }));
app.listen({ port: env.API_PORT, host: '0.0.0.0' }).then(() => app.log.info('Flyntos API listening on ' + env.API_PORT));
