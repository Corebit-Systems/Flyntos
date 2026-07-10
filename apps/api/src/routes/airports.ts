import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { airportSearchService, airportSearchSchema } from '../lib/airport-search';

/**
 * Маршруты для поиска аэропортов
 * 
 * POST /airports/search - поиск аэропортов по запросу
 * GET /airports/:iataCode - получение аэропорта по IATA коду
 * GET /airports/popular - получение популярных аэропортов
 */
export async function airportRoutes(fastify: FastifyInstance) {
  // Поиск аэропортов по запросу
  fastify.post('/airports/search', async (request, reply) => {
    try {
      const params = airportSearchSchema.parse(request.body);
      const results = await airportSearchService.search(params);
      
      return {
        success: true,
        data: results,
        count: results.length,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request parameters',
          details: error.errors,
        });
      }
      
      fastify.log.error({ error: error instanceof Error ? error.message : String(error) }, 'Airport search error');
      return reply.code(500).send({
        success: false,
        error: 'Failed to search airports',
      });
    }
  });

  // Получение аэропорта по IATA коду
  fastify.get('/airports/:iataCode', async (request, reply) => {
    try {
      const { iataCode } = request.params as { iataCode: string };
      const { locale = 'en' } = request.query as { locale?: string };
      
      const airport = await airportSearchService.getByIataCode(iataCode, locale);
      
      if (!airport) {
        return reply.code(404).send({
          success: false,
          error: 'Airport not found',
        });
      }
      
      return {
        success: true,
        data: airport,
      };
    } catch (error) {
      fastify.log.error({ error: error instanceof Error ? error.message : String(error) }, 'Get airport error');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get airport',
      });
    }
  });

  // Получение популярных аэропортов
  fastify.get('/airports/popular', async (request, reply) => {
    try {
      const { locale = 'en', limit = 10 } = request.query as { locale?: string; limit?: string };
      
      const limitNum = Math.min(parseInt(String(limit || '10')) || 10, 50);
      
      const airports = await airportSearchService.getPopularAirports(locale, limitNum);
      
      return {
        success: true,
        data: airports,
        count: airports.length,
      };
    } catch (error) {
      fastify.log.error({ error: error instanceof Error ? error.message : String(error) }, 'Get popular airports error');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get popular airports',
      });
    }
  });
}
