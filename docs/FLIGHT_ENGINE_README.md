# Flight Search Engine - Архитектура и документация

## Обзор

Flight Search Engine - это высокопроизводительный модуль агрегации рейсов для Flyntos.com, обеспечивающий параллельный опрос множественных провайдеров (GDS, агрегаторов) с умным кэшированием и валидацией стыковок.

## Архитектура

### Стек технологий

- **Backend**: Node.js + TypeScript + Fastify
- **База данных**: PostgreSQL 16
- **Кэширование**: Redis 7
- **Валидация**: Zod
- **UUID**: uuid@9.0.1

### Компоненты архитектуры

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Fastify)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Flight Search Aggregator                         │
│  - Параллельный опрос провайдеров                           │
│  - Таймауты и отказоустойчивость                              │
│  - Агрегация и дедупликация                                  │
│  - Валидация Smart Connect                                   │
└──────┬───────────────────────────────────────────────────────┘
       │
       ├──────────────┬──────────────────┬──────────────────┐
       │              │                  │                  │
┌──────▼──────┐ ┌────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
│   Redis     │ │  Mock     │  │   Amadeus    │  │   Sabre     │
│   Cache     │ │ Provider │  │   Provider   │  │  Provider   │
└─────────────┘ └───────────┘  └──────────────┘  └─────────────┘
```

## Структура данных

### FlightSegment

Информация о конкретном перелете:

```typescript
interface FlightSegment {
  id: string;
  origin: {
    code: string;        // IATA код (SVO, JFK)
    name: string;        // Название аэропорта
    city: string;        // Город
    country: string;     // Страна
    terminal?: string;   // Терминал
  };
  destination: { /* аналогично origin */ };
  departureAt: string;   // ISO 8601 UTC
  arrivalAt: string;     // ISO 8601 UTC
  marketingCarrier: {
    code: string;        // IATA код (SU, BA)
    name: string;        // Название
    flightNumber: string; // Номер рейса
  };
  operatingCarrier?: { /* код и название */ };
  aircraft?: {
    code: string;        // IATA код ВС (B77W)
    name: string;        // Название
  };
  cabinClass: CabinClass;
  durationMinutes: number;
  stops: number;
  distanceKm?: number;
  isCharter: boolean;
}
```

### FlightOption

Готовый маршрут из одного или нескольких сегментов:

```typescript
interface FlightOption {
  id: string;
  provider: string;           // Идентификатор провайдера
  segments: FlightSegment[];
  connectionType: ConnectionType; // GDS_Direct, GDS_Connection, Flyntos_SmartConnect
  pricing: {
    currency: string;         // ISO 4217 (USD, EUR)
    base: number;
    taxes: number;
    total: number;
  };
  baggage: {
    cabin: BaggageType;
    checked: {
      quantity: number;
      weightKg?: number;
      dimensions?: string;
      included: boolean;
    };
  };
  fareRules: {
    refundable: boolean;
    changeable: boolean;
    cancellationFee?: number;
    changeFee?: number;
  };
  seating: {
    remainingSeats: number;
    cabinClass: CabinClass;
  };
  metadata: {
    providerTimestamp: string;
    cacheHit: boolean;
    partial: boolean;
  };
  totalDurationMinutes: number;
  totalStops: number;
  confidenceScore?: number; // 0-1, оценка надежности стыковки
}
```

## Провайдеры

### Интерфейс IFlightProviderAdapter

Базовый интерфейс для всех провайдеров:

```typescript
interface IFlightProviderAdapter {
  readonly providerId: string;
  readonly providerName: string;
  readonly timeout: number;
  
  healthCheck(): Promise<ProviderHealthStatus>;
  search(request: FlightSearchRequest): Promise<FlightOption[]>;
  normalize(rawData: unknown): FlightOption[];
}
```

### BaseFlightProviderAdapter

Абстрактный базовый класс с общей логикой:

- **Таймауты**: Promise.race для ограничения времени выполнения
- **Health check**: Базовая проверка доступности
- **Логирование**: Автоматическое логирование запросов/ответов
- **Валидация**: Базовая проверка структуры данных

### MockFlightProviderAdapter

Mock-адаптер для тестирования:

- Генерирует реалистичные данные рейсов
- Имитирует сетевые задержки (100-300ms)
- Поддерживает прямые рейсы и рейсы с пересадкой
- Генерирует различные типы соединений

## Кэширование

### FlightCacheService

Двухуровневое кэширование в Redis:

#### Стратегия ключей

Формат: `flight:cache:{origin}:{destination}:{date}:{passengers_slug}:{cabin}:{direct}`

Пример: `flight:cache:SVO:JFK:2024-07-15:1a0c0i:e:all`

#### Динамический TTL

- **> 30 дней до вылета**: 30 минут (1800 сек)
- **7-30 дней до вылета**: 15 минут (900 сек)
- **1-7 дней до вылета**: 5 минут (300 сек)
- **< 24 часа до вылета**: 2 минуты (120 сек)

#### Методы

- `get(request)` - получение из кэша
- `set(request, response)` - сохранение в кэш
- `delete(request)` - удаление конкретного запроса
- `flushAll()` - очистка всего кэша (опасно!)
- `warmup(requests, searchFunction)` - прогрев кэша
- `getStats()` - статистика использования

## Агрегатор

### FlightSearchAggregator

Диспетчер параллельного опроса провайдеров:

#### Основные функции

1. **Регистрация провайдеров**
   ```typescript
   aggregator.registerProvider(mockProvider);
   aggregator.registerProvider(amadeusProvider);
   ```

2. **Поиск с кэшированием**
   ```typescript
   const response = await aggregator.search(request, true);
   ```

3. **Проверка здоровья**
   ```typescript
   const healthMap = await aggregator.checkProvidersHealth();
   ```

#### Обработка ошибок провайдеров

- **Promise.allSettled** - падение одного провайдера не ломает всю выдачу
- **Таймауты** - провайдеры отсекаются после 4 секунд
- **Логирование** - все ошибки фиксируются в diagnostics

#### Агрегация результатов

- **Дедупликация** - удаление дубликатов по ключу (маршрут + время + авиакомпании)
- **Лучшая цена** - при дубликатах оставляется вариант с минимальной ценой
- **Валидация** - проверка стыковок Smart Connect

## Валидация стыковок Smart Connect

### Правила валидации

1. **Минимальное время стыковки (MCT)**: 120 минут (2 часа)
2. **Максимальное время стыковки**: 1440 минут (24 часа)
3. **Интерлайн-проверка**: снижение confidence score для разных авиакомпаний

### Функция validateInterlineConnection

```typescript
function validateInterlineConnection(segments: FlightSegment[]): {
  valid: boolean;
  confidenceScore: number;
  issues: string[];
}
```

#### Логика

- Прямые рейсы: `confidenceScore = 1.0`
- Стыковки в рамках одного GDS: `confidenceScore = 0.9-1.0`
- Интерлайн-стыковки: `confidenceScore = 0.7-0.9`
- Нарушение MCT: снижение на 0.3
- Нарушение максимального времени: снижение на 0.3

## Использование

### Базовый пример

```typescript
import { getFlightAggregator } from './services/aggregator.service';
import { MockFlightProviderAdapter } from './providers/mock.adapter';
import { CabinClass } from './types/flight';

// Инициализация
const aggregator = getFlightAggregator();
const mockProvider = new MockFlightProviderAdapter({
  apiKey: 'test-key',
  baseUrl: 'https://api.mock.com'
});

aggregator.registerProvider(mockProvider);

// Поиск
const request = {
  origin: 'SVO',
  destination: 'JFK',
  departureDate: '2024-07-15',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: CabinClass.ECONOMY,
  directOnly: false,
};

const response = await aggregator.search(request);

console.log(`Found ${response.options.length} options`);
console.log(`Failures: ${response.diagnostics.providerFailures.length}`);
console.log(`Latency: ${response.diagnostics.totalLatencyMs}ms`);
```

### Пример с конкретными провайдерами

```typescript
const request = {
  // ... параметры поиска
  providers: ['amadeus', 'kiwi'], // только эти провайдеры
};

const response = await aggregator.search(request);
```

### Пример без кэша

```typescript
const response = await aggregator.search(request, false);
```

## Обработка ошибок

### Типы ошибок

1. **ProviderError** - ошибки провайдеров
   - `providerId` - идентификатор провайдера
   - `isTimeout` - таймаут или нет
   - `originalError` - исходная ошибка

2. **Cache errors** - ошибки Redis
   - Логируются, но не прерывают поиск
   - Поиск продолжается без кэша

3. **Validation errors** - ошибки валидации
   - Zod схемы для входных данных
   - Возвращают HTTP 400

### Диагностика

```typescript
interface FlightSearchResponse {
  diagnostics: {
    providerCount: number;           // количество опрошенных провайдеров
    providerFailures: ProviderFailure[]; // список неудач
    totalLatencyMs: number;         // общее время выполнения
    cacheStatus: 'miss' | 'partial-hit' | 'hit';
    generatedAt: string;
  };
}
```

## Производительность

### Оптимизации

1. **Параллельные запросы** - все провайдеры опрашиваются одновременно
2. **Таймауты** - отсечение медленных провайдеров
3. **Кэширование** - повторные запросы из Redis
4. **Дедупликация** - удаление дубликатов на уровне агрегатора
5. **Валидация на уровне БД** - предварительная фильтрация

### Метрики

- **Цель**: < 5 секунд для типового поиска
- **Кэш-хит**: > 80% для популярных маршрутов
- **Провайдеры**: 3-5 провайдеров одновременно
- **Таймауты**: 4 секунды на провайдера

## Масштабирование

### Горизонтальное масштабирование

- **Агрегатор**: stateless, можно масштабировать горизонтально
- **Redis**: кластеризация для высокой доступности
- **Провайдеры**: rate limiting на уровне адаптеров

### Вертикальное масштабирование

- **Увеличение таймаутов** для медленных провайдеров
- **Дополнительные инстансы** для пиковых нагрузок
- **Оптимизация кэша** для популярных маршрутов

## Безопасность

### API ключи

- Хранятся в переменных окружения
- Не логируются в выводе
- Ротация через конфигурацию

### Rate limiting

- На уровне провайдеров
- На уровне API (Fastify rate-limit)
- Защита от DDoS

## Мониторинг

### Логи

- Структурированные логи с searchId
- Логирование всех провайдерных вызовов
- Логирование кэш-операций

### Метрики

- Latency поисков
- Cache hit ratio
- Provider failure rate
- Smart Connect validation rate

## Тестирование

### Unit-тесты

- Тесты адаптеров провайдеров
- Тесты кэш-сервиса
- Тесты валидации стыковок

### Integration-тесты

- Тесты агрегатора с mock-провайдерами
- Тесты кэширования
- Тесты обработки ошибок

### Load-тесты

- Нагрузочное тестирование агрегатора
- Тестирование кэша под нагрузкой
- Тестирование таймаутов

## Следующие шаги

### Краткосрочные

1. **Реальные адаптеры** - Amadeus, Sabre, Kiwi
2. **Unit-тесты** - покрытие > 80%
3. **Мониторинг** - интеграция с Prometheus/Grafana

### Среднесрочные

1. **ML-ранжирование** - персонализация результатов
2. **Геопространственный поиск** - PostGIS для поиска по расстоянию
3. **Автодополнение** - suggest API для ввода

### Долгосрочные

1. **Виртуальный интерлайн** - комбинирование стыковок разных провайдеров
2. **Динамическое ценообразование** - ML-модели для прогнозирования цен
3. **Real-time обновления** - WebSocket для live цен

## Troubleshooting

### Проблема: Медленный поиск

**Решения:**
- Проверить таймауты провайдеров
- Увеличить размер кэша
- Оптимизировать запросы к провайдерам

### Проблема: Низкий cache hit ratio

**Решения:**
- Проверить стратегию TTL
- Реализовать warmup кэша
- Оптимизировать ключи кэша

### Проблема: Много ошибок провайдеров

**Решения:**
- Проверить health check провайдеров
- Увеличить таймауты
- Реализовать retry-логику

## Контакты

Для вопросов по архитектуре обращайтесь к команде Backend Corebit Systems.
