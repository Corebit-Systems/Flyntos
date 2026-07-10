import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum CabinClass {
  ECONOMY = 'economy',
  PREMIUM_ECONOMY = 'premium-economy',
  BUSINESS = 'business',
  FIRST = 'first',
}

export enum ConnectionType {
  GDS_DIRECT = 'GDS_Direct',           // Прямой рейс от одного провайдера
  GDS_CONNECTION = 'GDS_Connection',   // Стыковка в рамках одного GDS
  FLYNTOS_SMART_CONNECT = 'Flyntos_SmartConnect', // Виртуальный интерлайн
}

export enum BaggageType {
  NONE = 'none',
  CARRY_ON = 'carry-on',
  CHECKED = 'checked',
  UNLIMITED = 'unlimited',
}

// ============================================================================
// FLIGHT SEGMENT
// ============================================================================

export interface FlightSegment {
  id: string;
  origin: {
    code: string;           // IATA код (SVO, JFK, LHR)
    name: string;          // Название аэропорта
    city: string;          // Город
    country: string;       // Страна
    terminal?: string;     // Терминал
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
    terminal?: string;
  };
  departureAt: string;     // ISO 8601 UTC (2024-07-15T10:30:00Z)
  arrivalAt: string;       // ISO 8601 UTC (2024-07-15T14:45:00Z)
  marketingCarrier: {
    code: string;          // IATA код авиакомпании (SU, BA, LH)
    name: string;          // Название (Aeroflot, British Airways)
    flightNumber: string;  // Номер рейса (SU1234, BA456)
  };
  operatingCarrier?: {
    code: string;
    name: string;
  };
  aircraft?: {
    code: string;          // IATA код типа ВС (B77W, A320)
    name: string;
  };
  cabinClass: CabinClass;
  durationMinutes: number;
  stops: number;           // Количество остановок (0 для прямого)
  distanceKm?: number;
  isCharter: boolean;
}

// ============================================================================
// FLIGHT OPTION
// ============================================================================

export interface FlightOption {
  id: string;
  provider: string;        // Идентификатор провайдера (amadeus, kiwi, sabre)
  segments: FlightSegment[];
  connectionType: ConnectionType;
  pricing: {
    currency: string;      // ISO 4217 (USD, EUR, RUB)
    base: number;          // Базовая тарифа
    taxes: number;         // Таксы и сборы
    total: number;         // Итоговая цена
  };
  baggage: {
    cabin: BaggageType;
    checked: {
      quantity: number;    // Количество мест
      weightKg?: number | undefined;   // Вес в кг
      dimensions?: string | undefined; // Размеры
      included: boolean;   // Включено в тариф
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
    providerTimestamp: string;  // Когда провайдер вернул данные
    cacheHit: boolean;
    partial: boolean;           // Частичный ответ от провайдера
  };
  totalDurationMinutes: number;
  totalStops: number;
  confidenceScore?: number;    // Оценка надежности стыковки (0-1)
}

// ============================================================================
// SEARCH REQUEST
// ============================================================================

export interface FlightSearchRequest {
  origin: string;              // IATA код вылета
  destination: string;         // IATA код прилета
  departureDate: string;       // ISO 8601 date (2024-07-15)
  returnDate?: string;         // ISO 8601 date (для обратного билета)
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: CabinClass;
  directOnly: boolean;
  maxStops?: number;
  providers?: string[];        // Список провайдеров для опроса
}

// ============================================================================
// SEARCH RESPONSE
// ============================================================================

export interface FlightSearchResponse {
  searchId: string;
  request: FlightSearchRequest;
  options: FlightOption[];
  diagnostics: {
    providerCount: number;
    providerFailures: ProviderFailure[];
    totalLatencyMs: number;
    cacheStatus: 'miss' | 'partial-hit' | 'hit';
    generatedAt: string;
  };
}

export interface ProviderFailure {
  provider: string;
  error: string;
  timeout: boolean;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const locationSchema = z.object({
  code: z.string().length(3),
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  terminal: z.string().optional(),
});

const carrierSchema = z.object({
  code: z.string().min(1).max(3),
  name: z.string().min(1),
  flightNumber: z.string().min(1),
});

const aircraftSchema = z.object({
  code: z.string().min(1).max(4),
  name: z.string().min(1),
}).optional();

export const flightSegmentSchema = z.object({
  id: z.string().uuid(),
  origin: locationSchema,
  destination: locationSchema,
  departureAt: z.string().datetime(),
  arrivalAt: z.string().datetime(),
  marketingCarrier: carrierSchema,
  operatingCarrier: carrierSchema.optional(),
  aircraft: aircraftSchema,
  cabinClass: z.nativeEnum(CabinClass),
  durationMinutes: z.number().int().positive(),
  stops: z.number().int().min(0),
  distanceKm: z.number().positive().optional(),
  isCharter: z.boolean(),
});

const baggageSchema = z.object({
  cabin: z.nativeEnum(BaggageType),
  checked: z.object({
    quantity: z.number().int().min(0),
    weightKg: z.number().positive().optional(),
    dimensions: z.string().optional(),
    included: z.boolean(),
  }),
});

const fareRulesSchema = z.object({
  refundable: z.boolean(),
  changeable: z.boolean(),
  cancellationFee: z.number().nonnegative().optional(),
  changeFee: z.number().nonnegative().optional(),
});

const pricingSchema = z.object({
  currency: z.string().length(3),
  base: z.number().nonnegative(),
  taxes: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

const metadataSchema = z.object({
  providerTimestamp: z.string().datetime(),
  cacheHit: z.boolean(),
  partial: z.boolean(),
});

export const flightOptionSchema = z.object({
  id: z.string().uuid(),
  provider: z.string().min(1),
  segments: z.array(flightSegmentSchema).min(1),
  connectionType: z.nativeEnum(ConnectionType),
  pricing: pricingSchema,
  baggage: baggageSchema,
  fareRules: fareRulesSchema,
  seating: z.object({
    remainingSeats: z.number().int().positive(),
    cabinClass: z.nativeEnum(CabinClass),
  }),
  metadata: metadataSchema,
  totalDurationMinutes: z.number().int().positive(),
  totalStops: z.number().int().min(0),
  confidenceScore: z.number().min(0).max(1).optional(),
});

const passengersSchema = z.object({
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8),
  infants: z.number().int().min(0).max(4),
});

export const flightSearchRequestSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  passengers: passengersSchema,
  cabinClass: z.nativeEnum(CabinClass),
  directOnly: z.boolean(),
  maxStops: z.number().int().min(0).optional(),
  providers: z.array(z.string()).optional(),
});

const providerFailureSchema = z.object({
  provider: z.string(),
  error: z.string(),
  timeout: z.boolean(),
});

const diagnosticsSchema = z.object({
  providerCount: z.number().int().nonnegative(),
  providerFailures: z.array(providerFailureSchema),
  totalLatencyMs: z.number().int().nonnegative(),
  cacheStatus: z.enum(['miss', 'partial-hit', 'hit']),
  generatedAt: z.string().datetime(),
});

export const flightSearchResponseSchema = z.object({
  searchId: z.string().uuid(),
  request: flightSearchRequestSchema,
  options: z.array(flightOptionSchema),
  diagnostics: diagnosticsSchema,
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Валидация времени стыковки для Smart Connect
 * @param arrivalAt - время прилета предыдущего сегмента (ISO 8601 UTC)
 * @param departureAt - время вылета следующего сегмента (ISO 8601 UTC)
 * @returns валидность стыковки
 */
export function validateConnectionTime(arrivalAt: string, departureAt: string): {
  valid: boolean;
  connectionMinutes: number;
  reason?: string;
} {
  const arrival = new Date(arrivalAt);
  const departure = new Date(departureAt);
  const connectionMinutes = (departure.getTime() - arrival.getTime()) / (1000 * 60);

  const MIN_CONNECTION_TIME = 120; // 2 часа
  const MAX_CONNECTION_TIME = 1440; // 24 часа

  if (connectionMinutes < MIN_CONNECTION_TIME) {
    return {
      valid: false,
      connectionMinutes,
      reason: `Connection time ${connectionMinutes}min is less than minimum ${MIN_CONNECTION_TIME}min`,
    };
  }

  if (connectionMinutes > MAX_CONNECTION_TIME) {
    return {
      valid: false,
      connectionMinutes,
      reason: `Connection time ${connectionMinutes}min exceeds maximum ${MAX_CONNECTION_TIME}min`,
    };
  }

  return { valid: true, connectionMinutes };
}

/**
 * Проверка безопасности интерлайн-стыковки
 * @param segments - массив сегментов рейса
 * @returns результат валидации
 */
export function validateInterlineConnection(segments: FlightSegment[]): {
  valid: boolean;
  confidenceScore: number;
  issues: string[];
} {
  const issues: string[] = [];
  let confidenceScore = 1.0;

  if (segments.length < 2) {
    return { valid: true, confidenceScore: 1.0, issues: [] };
  }

  // Проверка времени стыковок
  for (let i = 0; i < segments.length - 1; i++) {
    const currentSegment = segments[i];
    const nextSegment = segments[i + 1];

    if (!currentSegment || !nextSegment) {
      continue;
    }

    const connectionValidation = validateConnectionTime(
      currentSegment.arrivalAt,
      nextSegment.departureAt
    );

    if (!connectionValidation.valid) {
      issues.push(connectionValidation.reason!);
      confidenceScore -= 0.3;
    }

    // Проверка разных авиакомпаний (интерлайн)
    if (currentSegment.marketingCarrier.code !== nextSegment.marketingCarrier.code) {
      // Для интерлайн снижаем confidence score
      confidenceScore -= 0.1;
      issues.push(
        `Interline connection between ${currentSegment.marketingCarrier.code} and ${nextSegment.marketingCarrier.code}`
      );
    }
  }

  confidenceScore = Math.max(0, confidenceScore);

  return {
    valid: issues.length === 0,
    confidenceScore,
    issues,
  };
}
