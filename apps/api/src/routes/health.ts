import type { FastifyInstance } from 'fastify';
export async function healthRoutes(app: FastifyInstance){app.get('/health', async (request, reply) => reply.code(200).send({ status: "ok", timestamp: new Date().toISOString() }));}
