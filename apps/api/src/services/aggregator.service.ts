import { v4 as uuidv4 } from 'uuid';
import { FlightSearchRequest, FlightSearchResponse, FlightOption, ProviderFailure } from '../types/flight';
import { IFlightProviderAdapter } from '../providers/base.adapter';
import { getCacheService, FlightCacheService } from './cache.service';
import { validateInterlineConnection } from '../types/flight';

/**
 * Асинхронный диспетчер поиска рейсов
 * 
 * Особенности:
 * - Параллельный опрос всех зарегистрированных провайдеров
 * - Таймауты для каждого провайдера (race-condition)
 * - Promise.allSettled для отказоустойчивости
 * - Двухуровневое кэширование в Redis
 * - Валидация стыковок Smart Connect
 * - Агрегация и дедупликация результатов
 */
export class FlightSearchAggregator {
  private providers: Map<string, IFlightProviderAdapter> = new Map();
  private cacheService: FlightCacheService;
  private defaultTimeout: number = 4000; // 4 секунды

  constructor(cacheService?: FlightCacheService) {
    this.cacheService = cacheService || getCacheService();
  }

  /**
   * Регистрация провайдера
   * @param provider - адаптер провайдера
   */
  registerProvider(provider: IFlightProviderAdapter): void {
    this.providers.set(provider.providerId, provider);
    console.log(`Registered provider: ${provider.providerId} (${provider.providerName})`);
  }

  /**
   * Удаление провайдера
   * @param providerId - идентификатор провайдера
   */
  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
    console.log(`Unregistered provider: ${providerId}`);
  }

  /**
   * Получение списка зарегистрированных провайдеров
   */
  getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Проверка здоровья всех провайдеров
   */
  async checkProvidersHealth(): Promise<Map<string, boolean>> {
    const healthMap = new Map<string, boolean>();

    for (const [providerId, provider] of this.providers) {
      try {
        const health = await provider.healthCheck();
        healthMap.set(providerId, health.healthy);
      } catch (error) {
        healthMap.set(providerId, false);
      }
    }

    return healthMap;
  }

  /**
   * Основной метод поиска рейсов
   * 
   * @param request - поисковый запрос
   * @param useCache - использовать кэш (default: true)
   * @returns результаты поиска
   */
  async search(request: FlightSearchRequest, useCache: boolean = true): Promise<FlightSearchResponse> {
    const searchId = uuidv4();
    const startTime = Date.now();

    console.log(`[${searchId}] Starting flight search:`, {
      origin: request.origin,
      destination: request.destination,
      date: request.departureDate,
      providers: request.providers || this.getRegisteredProviders(),
    });

    // Проверка кэша
    if (useCache) {
      try {
        await this.cacheService.connect();
        const cached = await this.cacheService.get(request);

        if (cached) {
          console.log(`[${searchId}] Cache hit - returning cached results`);
          return {
            ...cached,
            searchId,
            diagnostics: {
              ...cached.diagnostics,
              cacheStatus: 'hit',
            },
          };
        }
      } catch (error) {
        console.warn(`[${searchId}] Cache check failed:`, error);
      }
    }

    // Определение провайдеров для опроса
    const providersToQuery = this.determineProviders(request);

    // Параллельный опрос провайдеров с таймаутами
    const providerResults = await this.queryProvidersParallel(searchId, request, providersToQuery);

    // Агрегация результатов
    const aggregatedOptions = this.aggregateResults(providerResults);

    // Валидация стыковок Smart Connect
    const validatedOptions = this.validateConnections(aggregatedOptions);

    // Формирование ответа
    const response: FlightSearchResponse = {
      searchId,
      request,
      options: validatedOptions,
      diagnostics: {
        providerCount: providersToQuery.length,
        providerFailures: providerResults.failures,
        totalLatencyMs: Date.now() - startTime,
        cacheStatus: 'miss',
        generatedAt: new Date().toISOString(),
      },
    };

    // Сохранение в кэш
    if (useCache && validatedOptions.length > 0) {
      try {
        await this.cacheService.set(request, response);
        console.log(`[${searchId}] Results cached successfully`);
      } catch (error) {
        console.warn(`[${searchId}] Failed to cache results:`, error);
      }
    }

    console.log(`[${searchId}] Search completed:`, {
      optionsCount: validatedOptions.length,
      latencyMs: response.diagnostics.totalLatencyMs,
      failures: providerResults.failures.length,
    });

    return response;
  }

  /**
   * Определение провайдеров для опроса
   * @param request - поисковый запрос
   * @returns список провайдеров
   */
  private determineProviders(request: FlightSearchRequest): IFlightProviderAdapter[] {
    if (request.providers && request.providers.length > 0) {
      // Используем только указанные провайдеры
      const selectedProviders: IFlightProviderAdapter[] = [];
      for (const providerId of request.providers) {
        const provider = this.providers.get(providerId);
        if (provider) {
          selectedProviders.push(provider);
        }
      }
      return selectedProviders;
    }

    // Используем все зарегистрированные провайдеры
    return Array.from(this.providers.values());
  }

  /**
   * Параллельный опрос провайдеров с таймаутами
   * @param searchId - ID поиска
   * @param request - поисковый запрос
   * @param providers - список провайдеров
   * @returns результаты и ошибки
   */
  private async queryProvidersParallel(
    searchId: string,
    request: FlightSearchRequest,
    providers: IFlightProviderAdapter[]
  ): Promise<{ options: FlightOption[]; failures: ProviderFailure[] }> {
    const options: FlightOption[] = [];
    const failures: ProviderFailure[] = [];

    // Используем Promise.allSettled для отказоустойчивости
    const promises = providers.map(async (provider) => {
      try {
        console.log(`[${searchId}] Querying provider: ${provider.providerId}`);
        const providerOptions = await provider.search(request);
        console.log(`[${searchId}] Provider ${provider.providerId} returned ${providerOptions.length} options`);
        return { providerId: provider.providerId, options: providerOptions, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isTimeout = errorMessage.includes('timeout');
        
        console.error(`[${searchId}] Provider ${provider.providerId} failed:`, errorMessage);
        
        return {
          providerId: provider.providerId,
          options: [],
          error: { provider: provider.providerId, error: errorMessage, timeout: isTimeout },
        };
      }
    });

    const results = await Promise.allSettled(promises);

    // Обработка результатов
    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.error) {
          failures.push(result.value.error);
        } else {
          options.push(...result.value.options);
        }
      } else {
        const errorMessage = result.reason instanceof Error ? result.reason.message : 'Unknown error';
        failures.push({
          provider: 'unknown',
          error: errorMessage,
          timeout: errorMessage.includes('timeout'),
        });
      }
    }

    return { options, failures };
  }

  /**
   * Агрегация и дедупликация результатов
   * @param providerResults - результаты от провайдеров
   * @returns агрегированные варианты
   */
  private aggregateResults(providerResults: { options: FlightOption[]; failures: ProviderFailure[] }): FlightOption[] {
    const allOptions = providerResults.options;

    // Дедупликация по ID (если провайдеры возвращают одинаковые варианты)
    const uniqueOptions = new Map<string, FlightOption>();

    for (const option of allOptions) {
      const deduplicationKey = this.generateDeduplicationKey(option);
      
      if (!uniqueOptions.has(deduplicationKey)) {
        uniqueOptions.set(deduplicationKey, option);
      } else {
        // Если вариант уже существует, оставляем вариант с лучшей ценой
        const existing = uniqueOptions.get(deduplicationKey)!;
        if (option.pricing.total < existing.pricing.total) {
          uniqueOptions.set(deduplicationKey, option);
        }
      }
    }

    return Array.from(uniqueOptions.values());
  }

  /**
   * Генерация ключа для дедупликации
   * @param option - вариант рейса
   * @returns ключ дедупликации
   */
  private generateDeduplicationKey(option: FlightOption): string {
    // Ключ включает: аэропорты, время вылета, авиакомпании
    const firstSegment = option.segments[0];
    const lastSegment = option.segments[option.segments.length - 1];

    if (!firstSegment || !lastSegment) {
      return option.id; // Fallback на ID если сегменты отсутствуют
    }

    const route = `${firstSegment.origin.code}-${lastSegment.destination.code}`;
    const departureTime = firstSegment.departureAt;
    const carriers = option.segments.map(s => s.marketingCarrier.code).join('-');

    return `${route}:${departureTime}:${carriers}`;
  }

  /**
   * Валидация стыковок Smart Connect
   * @param options - варианты рейсов
   * @returns валидированные варианты
   */
  private validateConnections(options: FlightOption[]): FlightOption[] {
    const validatedOptions: FlightOption[] = [];

    for (const option of options) {
      // Пропускаем прямые рейсы
      if (option.segments.length === 1) {
        option.confidenceScore = 1.0;
        validatedOptions.push(option);
        continue;
      }

      // Валидация интерлайн-стыковок
      const validation = validateInterlineConnection(option.segments);

      if (validation.valid) {
        option.confidenceScore = validation.confidenceScore;
        validatedOptions.push(option);
      } else {
        console.warn(`Invalid connection for option ${option.id}:(validation.issues.join(', '))`);
        // Можно добавить логику для частичного включения с пониженным score
        if (validation.confidenceScore > 0.5) {
          option.confidenceScore = validation.confidenceScore;
          validatedOptions.push(option);
        }
      }
    }

    return validatedOptions;
  }

  /**
   * Получение статистики агрегатора
   */
  async getStats(): Promise<{
    registeredProviders: number;
    cacheStats: {
      totalKeys: number;
      memoryUsage: string;
      connected: boolean;
    };
  }> {
    const cacheStats = await this.cacheService.getStats();

    return {
      registeredProviders: this.providers.size,
      cacheStats,
    };
  }
}

// Экспорт синглтона для использования в приложении
let aggregatorInstance: FlightSearchAggregator | null = null;

export function getFlightAggregator(): FlightSearchAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new FlightSearchAggregator();
  }
  return aggregatorInstance;
}
