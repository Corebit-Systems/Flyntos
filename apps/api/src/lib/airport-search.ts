import { pool } from './db';
import { z } from 'zod';

// TypeScript типы для результатов поиска
export interface AirportSearchResult {
  airport_id: number;
  iata_code: string;
  city_name: string;
  airport_name: string | null;
  locale: string;
  match_type: 'iata_exact' | 'iata_partial' | 'name_exact' | 'name_fuzzy' | 'alias';
  similarity_score: number;
}

// Zod схема для валидации параметров поиска
export const airportSearchSchema = z.object({
  query: z.string().min(1).max(100),
  locale: z.string().default('en'),
  limit: z.number().int().min(1).max(50).default(20),
});

export type AirportSearchParams = z.infer<typeof airportSearchSchema>;

/**
 * Сервис для поиска аэропортов с мультиязычной поддержкой
 * 
 * Особенности:
 * - Приоритет IATA кодов (точное и частичное совпадение)
 * - Нормализация текста (удаление диакритики, нижний регистр)
 * - Триграммный нечеткий поиск (pg_trgm) для запросов >= 3 символов
 * - Префиксный поиск (ILIKE) для коротких запросов < 3 символов
 * - Поддержка алиасов и транслитераций
 * - Ранжирование по типу совпадения и схожести
 * - Независимый поиск по всем локализациям с fallback на запрошенный язык
 */
export class AirportSearchService {
  /**
   * Поиск аэропортов по запросу
   * 
   * Оптимизации:
   * - Автоматическое переключение между префиксным и триграммным поиском
   * - Поиск по всем локализациям независимо от языка интерфейса
   * - Fallback на английский язык, если перевод отсутствует
   * 
   * @param params - параметры поиска (query, locale, limit)
   * @returns массив результатов поиска с ранжированием по релевантности
   */
  async search(params: AirportSearchParams): Promise<AirportSearchResult[]> {
    const validated = airportSearchSchema.parse(params);
    
    const { query, locale, limit } = validated;
    
    try {
      const result = await pool.query(
        'SELECT * FROM search_airports($1, $2, $3)',
        [query, locale, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Airport search error:', error);
      throw new Error('Failed to search airports');
    }
  }

  /**
   * Получение аэропорта по IATA коду с fallback на английский язык
   * 
   * @param iataCode - 3-буквенный код IATA
   * @param locale - локаль для названий (с fallback на 'en')
   * @returns данные аэропорта или null
   */
  async getByIataCode(iataCode: string, locale: string = 'en'): Promise<AirportSearchResult | null> {
    const normalizedCode = iataCode.toUpperCase().trim();
    
    if (normalizedCode.length !== 3) {
      return null;
    }
    
    try {
      const result = await pool.query(
        `SELECT 
          a.id as airport_id,
          a.iata_code,
          COALESCE(
            (SELECT city_name FROM airport_localizations WHERE airport_id = a.id AND locale = $2 LIMIT 1),
            (SELECT city_name FROM airport_localizations WHERE airport_id = a.id AND locale = 'en' LIMIT 1)
          ) as city_name,
          COALESCE(
            (SELECT airport_name FROM airport_localizations WHERE airport_id = a.id AND locale = $2 LIMIT 1),
            (SELECT airport_name FROM airport_localizations WHERE airport_id = a.id AND locale = 'en' LIMIT 1)
          ) as airport_name,
          $2 as locale,
          'iata_exact' as match_type,
          1.0 as similarity_score
        FROM airports a
        WHERE a.iata_code = $1`,
        [normalizedCode, locale]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Get airport by IATA error:', error);
      throw new Error('Failed to get airport by IATA code');
    }
  }

  /**
   * Получение популярных аэропортов с fallback на английский язык
   * 
   * @param locale - локаль (с fallback на 'en')
   * @param limit - количество результатов
   * @returns массив популярных аэропортов
   */
  async getPopularAirports(locale: string = 'en', limit: number = 10): Promise<AirportSearchResult[]> {
    try {
      const result = await pool.query(
        `SELECT 
          a.id as airport_id,
          a.iata_code,
          COALESCE(
            (SELECT city_name FROM airport_localizations WHERE airport_id = a.id AND locale = $1 AND is_primary = true LIMIT 1),
            (SELECT city_name FROM airport_localizations WHERE airport_id = a.id AND locale = 'en' AND is_primary = true LIMIT 1)
          ) as city_name,
          COALESCE(
            (SELECT airport_name FROM airport_localizations WHERE airport_id = a.id AND locale = $1 AND is_primary = true LIMIT 1),
            (SELECT airport_name FROM airport_localizations WHERE airport_id = a.id AND locale = 'en' AND is_primary = true LIMIT 1)
          ) as airport_name,
          $1 as locale,
          'popular' as match_type,
          1.0 as similarity_score
        FROM airports a
        WHERE EXISTS (
          SELECT 1 FROM airport_localizations WHERE airport_id = a.id AND is_primary = true
        )
        ORDER BY a.id
        LIMIT $2`,
        [locale, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Get popular airports error:', error);
      throw new Error('Failed to get popular airports');
    }
  }

  /**
   * Добавление нового аэропорта с локализациями
   * 
   * @param airportData - данные аэропорта
   * @param localizations - массив локализаций
   * @returns ID созданного аэропорта
   */
  async createAirport(
    airportData: {
      iata_code: string;
      icao_code?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
      country_code?: string;
      region_code?: string;
    },
    localizations: Array<{
      locale: string;
      city_name: string;
      airport_name?: string;
      is_primary?: boolean;
    }>
  ): Promise<number> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Вставка аэропорта
      const airportResult = await client.query(
        `INSERT INTO airports (iata_code, icao_code, latitude, longitude, timezone, country_code, region_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (iata_code) DO UPDATE SET
           icao_code = EXCLUDED.icao_code,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           timezone = EXCLUDED.timezone,
           country_code = EXCLUDED.country_code,
           region_code = EXCLUDED.region_code,
           updated_at = NOW()
         RETURNING id`,
        [
          airportData.iata_code.toUpperCase(),
          airportData.icao_code || null,
          airportData.latitude || null,
          airportData.longitude || null,
          airportData.timezone || null,
          airportData.country_code || null,
          airportData.region_code || null,
        ]
      );
      
      const airportId = airportResult.rows[0].id;
      
      // Вставка локализаций
      for (const loc of localizations) {
        await client.query(
          `INSERT INTO airport_localizations (airport_id, locale, city_name, airport_name, is_primary)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (airport_id, locale) DO UPDATE SET
             city_name = EXCLUDED.city_name,
             airport_name = EXCLUDED.airport_name,
             is_primary = EXCLUDED.is_primary`,
          [airportId, loc.locale, loc.city_name, loc.airport_name || null, loc.is_primary || false]
        );
      }
      
      await client.query('COMMIT');
      
      return airportId;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create airport error:', error);
      throw new Error('Failed to create airport');
    } finally {
      client.release();
    }
  }

  /**
   * Добавление алиаса для аэропорта
   * 
   * @param airportId - ID аэропорта
   * @param alias - алиас
   * @param aliasType - тип алиаса
   * @param locale - локаль (опционально)
   */
  async addAlias(
    airportId: number,
    alias: string,
    aliasType: 'transliteration' | 'historical' | 'alternative',
    locale?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO airport_aliases (airport_id, alias, alias_type, locale)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [airportId, alias, aliasType, locale || null]
      );
    } catch (error) {
      console.error('Add alias error:', error);
      throw new Error('Failed to add alias');
    }
  }
}

// Экспорт синглтона для использования в приложении
export const airportSearchService = new AirportSearchService();
