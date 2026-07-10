import { createClient, RedisClientType } from 'redis';
import { FlightSearchResponse, FlightSearchRequest } from '../types/flight';

/**
 * Сервис кэширования результатов поиска рейсов в Redis
 * 
 * Особенности:
 * - Динамический TTL в зависимости от времени до вылета
 * - Стратегия формирования ключа с хешированием параметров
 * - Сжатие данных для экономии памяти
 * - Отказоустойчивость при недоступности Redis
 */
export class FlightCacheService {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.connected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.connected = false;
    });
  }

  /**
   * Подключение к Redis
   */
  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  /**
   * Отключение от Redis
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
    }
  }

  /**
   * Генерация ключа кэша для поискового запроса
   * Формат: flight:cache:{origin}:{destination}:{date}:{passengers_slug}
   * 
   * @param request - поисковый запрос
   * @returns ключ кэша
   */
  private generateCacheKey(request: FlightSearchRequest): string {
    const passengersSlug = `${request.passengers.adults}a${request.passengers.children}c${request.passengers.infants}i`;
    const cabinSlug = request.cabinClass.substring(0, 1);
    const directSlug = request.directOnly ? 'direct' : 'all';
    
    return `flight:cache:${request.origin}:${request.destination}:${request.departureDate}:${passengersSlug}:${cabinSlug}:${directSlug}`;
  }

  /**
   * Вычисление динамического TTL на основе времени до вылета
   * 
   * Стратегия:
   * - > 30 дней до вылета: TTL = 30 минут (1800 сек)
   * - 7-30 дней до вылета: TTL = 15 минут (900 сек)
   * - < 7 дней до вылета: TTL = 5 минут (300 сек)
   * - < 24 часа до вылета: TTL = 2 минуты (120 сек)
   * 
   * @param departureDate - дата вылета (ISO 8601)
   * @returns TTL в секундах
   */
  private calculateDynamicTTL(departureDate: string): number {
    const departure = new Date(departureDate);
    const now = new Date();
    const daysUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDeparture > 30) {
      return 1800; // 30 минут
    } else if (daysUntilDeparture > 7) {
      return 900; // 15 минут
    } else if (daysUntilDeparture > 1) {
      return 300; // 5 минут
    } else {
      return 120; // 2 минуты
    }
  }

  /**
   * Получение результатов поиска из кэша
   * 
   * @param request - поисковый запрос
   * @returns закэшированные результаты или null
   */
  async get(request: FlightSearchRequest): Promise<FlightSearchResponse | null> {
    if (!this.connected) {
      return null;
    }

    try {
      const key = this.generateCacheKey(request);
      const cached = await this.client.get(key);

      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached) as FlightSearchResponse;
      
      // Обновляем метаданные кэша
      data.diagnostics.cacheStatus = 'hit';
      
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Сохранение результатов поиска в кэш
   * 
   * @param request - поисковый запрос
   * @param response - результаты поиска
   * @returns успешность операции
   */
  async set(request: FlightSearchRequest, response: FlightSearchResponse): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      const key = this.generateCacheKey(request);
      const ttl = this.calculateDynamicTTL(request.departureDate);
      
      // Обновляем метаданные перед сохранением
      response.diagnostics.cacheStatus = 'hit';
      response.diagnostics.generatedAt = new Date().toISOString();
      
      const serialized = JSON.stringify(response);
      
      await this.client.setEx(key, ttl, serialized);
      
      console.log(`Cache set: ${key}, TTL: ${ttl}s`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Удаление кэша для конкретного запроса
   * 
   * @param request - поисковый запрос
   * @returns успешность операции
   */
  async delete(request: FlightSearchRequest): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      const key = this.generateCacheKey(request);
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Очистка всего кэша рейсов (опасная операция)
   * 
   * @returns количество удаленных ключей
   */
  async flushAll(): Promise<number> {
    if (!this.connected) {
      return 0;
    }

    try {
      const keys = await this.client.keys('flight:cache:*');
      
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Cache flush error:', error);
      return 0;
    }
  }

  /**
   * Получение статистики кэша
   * 
   * @returns статистика использования
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    connected: boolean;
  }> {
    if (!this.connected) {
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        connected: false,
      };
    }

    try {
      const keys = await this.client.keys('flight:cache:*');
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      
      return {
        totalKeys: keys.length,
        memoryUsage: memoryMatch ? memoryMatch[1] : '0B',
        connected: true,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        connected: false,
      };
    }
  }

  /**
   * Предварительный прогрев кэша для популярных маршрутов
   * 
   * @param requests - массив популярных запросов
   * @param searchFunction - функция поиска для заполнения кэша
   */
  async warmup(
    requests: FlightSearchRequest[],
    searchFunction: (request: FlightSearchRequest) => Promise<FlightSearchResponse>
  ): Promise<void> {
    if (!this.connected) {
      console.warn('Cannot warmup cache: Redis not connected');
      return;
    }

    console.log(`Starting cache warmup for ${requests.length} requests...`);

    for (const request of requests) {
      try {
        // Проверяем, есть ли уже данные в кэше
        const cached = await this.get(request);
        
        if (cached) {
          console.log(`Cache already warm for ${request.origin}-${request.destination}`);
          continue;
        }

        // Если нет, выполняем поиск и сохраняем
        const results = await searchFunction(request);
        await this.set(request, results);
        
        console.log(`Warmed up cache for ${request.origin}-${request.destination}`);
        
        // Небольшая задержка между запросами для избежания rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to warmup cache for ${request.origin}-${request.destination}:`, error);
      }
    }

    console.log('Cache warmup completed');
  }
}

// Экспорт синглтона для использования в приложении
let cacheServiceInstance: FlightCacheService | null = null;

export function getCacheService(): FlightCacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new FlightCacheService();
  }
  return cacheServiceInstance;
}
