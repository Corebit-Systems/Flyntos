import { FlightSearchRequest, FlightOption } from '../types/flight';

/**
 * Базовый интерфейс для адаптеров провайдеров авиабилетов
 * 
 * Каждый провайдер (Amadeus, Sabre, Kiwi и т.д.) должен реализовать этот интерфейс
 * для унификации взаимодействия с FlightSearchAggregator
 */
export interface IFlightProviderAdapter {
  /**
   * Уникальный идентификатор провайдера
   */
  readonly providerId: string;

  /**
   * Название провайдера
   */
  readonly providerName: string;

  /**
   * Таймаут для запросов к этому провайдеру (в миллисекундах)
   */
  readonly timeout: number;

  /**
   * Проверка доступности провайдера
   * @returns статус доступности
   */
  healthCheck(): Promise<ProviderHealthStatus>;

  /**
   * Поиск рейсов по запросу
   * @param request - параметры поиска
   * @returns массив вариантов рейсов
   */
  search(request: FlightSearchRequest): Promise<FlightOption[]>;

  /**
   * Нормализация данных провайдера к формату Flyntos
   * @param rawData - сырые данные от провайдера
   * @returns нормализованные данные
   */
  normalize(rawData: unknown): FlightOption[];
}

/**
 * Статус здоровья провайдера
 */
export interface ProviderHealthStatus {
  provider: string;
  healthy: boolean;
  latencyMs: number;
  lastCheck: string;
  error?: string;
}

/**
 * Базовый абстрактный класс для адаптеров провайдеров
 * Содержит общую логику для всех провайдеров
 */
export abstract class BaseFlightProviderAdapter implements IFlightProviderAdapter {
  abstract readonly providerId: string;
  abstract readonly providerName: string;
  readonly timeout: number = 4000; // 4 секунды по умолчанию

  /**
   * Проверка доступности провайдера
   * По умолчанию выполняет простой ping-запрос
   */
  async healthCheck(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    
    try {
      // Базовая проверка - можно переопределить в конкретных адаптерах
      await this.ping();
      const latency = Date.now() - startTime;
      
      return {
        provider: this.providerId,
        healthy: true,
        latencyMs: latency,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        provider: this.providerId,
        healthy: false,
        latencyMs: latency,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Базовый метод ping - должен быть переопределен в конкретных адаптерах
   */
  protected abstract ping(): Promise<void>;

  /**
   * Поиск с таймаутом
   * Использует Promise.race для ограничения времени выполнения
   */
  async search(request: FlightSearchRequest): Promise<FlightOption[]> {
    const timeoutPromise = new Promise<FlightOption[]>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Provider ${this.providerId} timeout after ${this.timeout}ms`));
      }, this.timeout);
    });

    try {
      return await Promise.race([
        this.searchInternal(request),
        timeoutPromise,
      ]);
    } catch (error) {
      console.error(`Provider ${this.providerId} search error:`, error);
      throw error;
    }
  }

  /**
   * Внутренний метод поиска - должен быть реализован в конкретных адаптерах
   */
  protected abstract searchInternal(request: FlightSearchRequest): Promise<FlightOption[]>;

  /**
   * Нормализация данных - должна быть реализована в конкретных адаптерах
   */
  abstract normalize(rawData: unknown): FlightOption[];

  /**
   * Логирование запроса к провайдеру
   */
  protected logRequest(request: FlightSearchRequest): void {
    console.log(`[${this.providerId}] Search request:`, {
      origin: request.origin,
      destination: request.destination,
      date: request.departureDate,
      passengers: request.passengers,
    });
  }

  /**
   * Логирование ответа от провайдера
   */
  protected logResponse(options: FlightOption[], latencyMs: number): void {
    console.log(`[${this.providerId}] Search response:`, {
      optionsCount: options.length,
      latencyMs,
    });
  }

  /**
   * Валидация ответа провайдера
   * Проверяет базовую структуру данных
   */
  protected validateResponse(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Базовая проверка - можно расширить в конкретных адаптерах
    return true;
  }
}

/**
 * Ошибка провайдера
 */
export class ProviderError extends Error {
  constructor(
    public providerId: string,
    message: string,
    public isTimeout: boolean = false,
    public originalError?: Error
  ) {
    super(`[${providerId}] ${message}`);
    this.name = 'ProviderError';
  }
}

/**
 * Конфигурация провайдера
 */
export interface ProviderConfig {
  apiKey: string;
  apiSecret?: string;
  baseUrl: string;
  timeout?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerSecond: number;
  };
}
