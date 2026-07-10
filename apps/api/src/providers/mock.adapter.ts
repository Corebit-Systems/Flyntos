import { v4 as uuidv4 } from 'uuid';
import {
  BaseFlightProviderAdapter,
  ProviderConfig,
} from './base.adapter';
import {
  FlightSearchRequest,
  FlightOption,
  FlightSegment,
  CabinClass,
  ConnectionType,
  BaggageType,
} from '../types/flight';

/**
 * Mock-адаптер провайдера для тестирования и разработки
 * Генерирует реалистичные данные рейсов без реальных API вызовов
 */
export class MockFlightProviderAdapter extends BaseFlightProviderAdapter {
  readonly providerId = 'mock';
  readonly providerName = 'Mock Provider';
  readonly timeout = 1000; // 1 секунда для mock

  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    super();
    this.config = config;
  }

  /**
   * Ping-метод для mock провайдера
   */
  protected async ping(): Promise<void> {
    // Mock всегда доступен
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  /**
   * Внутренний метод поиска для mock провайдера
   * Генерирует реалистичные данные рейсов
   */
  protected async searchInternal(request: FlightSearchRequest): Promise<FlightOption[]> {
    this.logRequest(request);

    // Имитация задержки сети
    await this.simulateNetworkLatency();

    const options = this.generateMockOptions(request);

    this.logResponse(options, 150);
    return options;
  }

  /**
   * Нормализация данных для mock провайдера
   * В данном случае данные уже в правильном формате
   */
  normalize(rawData: unknown): FlightOption[] {
    if (!Array.isArray(rawData)) {
      return [];
    }
    return rawData as FlightOption[];
  }

  /**
   * Имитация сетевой задержки
   */
  private async simulateNetworkLatency(): Promise<void> {
    const latency = Math.random() * 200 + 100; // 100-300ms
    await new Promise((resolve) => setTimeout(resolve, latency));
  }

  /**
   * Генерация mock вариантов рейсов
   */
  private generateMockOptions(request: FlightSearchRequest): FlightOption[] {
    const options: FlightOption[] = [];
    const numOptions = Math.floor(Math.random() * 5) + 3; // 3-7 вариантов

    for (let i = 0; i < numOptions; i++) {
      const option = this.generateSingleOption(request, i);
      options.push(option);
    }

    return options;
  }

  /**
   * Генерация одного варианта рейса
   */
  private generateSingleOption(request: FlightSearchRequest, index: number): FlightOption {
    const isDirect = request.directOnly || Math.random() > 0.5;
    const segments = this.generateSegments(request, isDirect, index);

    const totalPrice = this.calculatePrice(segments, request);
    const connectionType = this.determineConnectionType(segments);

    return {
      id: uuidv4(),
      provider: this.providerId,
      segments,
      connectionType,
      pricing: {
        currency: 'USD',
        base: Math.round(totalPrice * 0.85),
        taxes: Math.round(totalPrice * 0.15),
        total: totalPrice,
      },
      baggage: this.generateBaggage(request.cabinClass),
      fareRules: this.generateFareRules(),
      seating: {
        remainingSeats: Math.floor(Math.random() * 9) + 1,
        cabinClass: request.cabinClass,
      },
      metadata: {
        providerTimestamp: new Date().toISOString(),
        cacheHit: false,
        partial: false,
      },
      totalDurationMinutes: segments.reduce((sum, seg) => sum + seg.durationMinutes, 0),
      totalStops: segments.reduce((sum, seg) => sum + seg.stops, 0),
      confidenceScore: connectionType === ConnectionType.GDS_DIRECT ? 1.0 : 0.8 + Math.random() * 0.15,
    };
  }

  /**
   * Генерация сегментов рейса
   */
  private generateSegments(request: FlightSearchRequest, isDirect: boolean, index: number): FlightSegment[] {
    const segments: FlightSegment[] = [];

    if (isDirect) {
      segments.push(this.generateDirectSegment(request, index));
    } else {
      // Генерация рейса с пересадкой
      segments.push(this.generateFirstSegment(request, index));
      segments.push(this.generateSecondSegment(request, index));
    }

    return segments;
  }

  /**
   * Генерация прямого сегмента
   */
  private generateDirectSegment(request: FlightSearchRequest, index: number): FlightSegment {
    const departureDate = new Date(request.departureDate);
    const departureHour = 6 + Math.floor(Math.random() * 14); // 6-20 часов
    departureDate.setHours(departureHour, 0, 0, 0);

    const durationMinutes = 180 + Math.floor(Math.random() * 300); // 3-8 часов
    const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60000);

    const carriers = ['SU', 'BA', 'LH', 'AF', 'KL', 'EK', 'QR'];
    const carrier = carriers[index % carriers.length];

    return {
      id: uuidv4(),
      origin: this.getAirportInfo(request.origin),
      destination: this.getAirportInfo(request.destination),
      departureAt: departureDate.toISOString(),
      arrivalAt: arrivalDate.toISOString(),
      marketingCarrier: {
        code: carrier,
        name: this.getCarrierName(carrier),
        flightNumber: `${carrier}${1000 + Math.floor(Math.random() * 9000)}`,
      },
      operatingCarrier: {
        code: carrier,
        name: this.getCarrierName(carrier),
      },
      aircraft: {
        code: this.getRandomAircraftCode(),
        name: this.getRandomAircraftName(),
      },
      cabinClass: request.cabinClass,
      durationMinutes,
      stops: 0,
      distanceKm: this.calculateDistance(request.origin, request.destination),
      isCharter: false,
    };
  }

  /**
   * Генерация первого сегмента (с пересадкой)
   */
  private generateFirstSegment(request: FlightSearchRequest, index: number): FlightSegment {
    const departureDate = new Date(request.departureDate);
    const departureHour = 6 + Math.floor(Math.random() * 10);
    departureDate.setHours(departureHour, 0, 0, 0);

    const durationMinutes = 120 + Math.floor(Math.random() * 180);
    const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60000);

    const hubAirports = ['FRA', 'AMS', 'LHR', 'CDG', 'IST', 'DXB'];
    const hub = hubAirports[index % hubAirports.length];

    const carriers = ['LH', 'KL', 'BA', 'AF', 'TK', 'EK'];
    const carrier = carriers[index % carriers.length];

    return {
      id: uuidv4(),
      origin: this.getAirportInfo(request.origin),
      destination: this.getAirportInfo(hub),
      departureAt: departureDate.toISOString(),
      arrivalAt: arrivalDate.toISOString(),
      marketingCarrier: {
        code: carrier,
        name: this.getCarrierName(carrier),
        flightNumber: `${carrier}${1000 + Math.floor(Math.random() * 9000)}`,
      },
      aircraft: {
        code: this.getRandomAircraftCode(),
        name: this.getRandomAircraftName(),
      },
      cabinClass: request.cabinClass,
      durationMinutes,
      stops: 0,
      distanceKm: this.calculateDistance(request.origin, hub),
      isCharter: false,
    };
  }

  /**
   * Генерация второго сегмента (с пересадкой)
   */
  private generateSecondSegment(request: FlightSearchRequest, index: number): FlightSegment {
    const hubAirports = ['FRA', 'AMS', 'LHR', 'CDG', 'IST', 'DXB'];
    const hub = hubAirports[index % hubAirports.length];

    const departureDate = new Date(request.departureDate);
    const departureHour = 6 + Math.floor(Math.random() * 10);
    departureDate.setHours(departureHour, 0, 0, 0);

    const firstDuration = 120 + Math.floor(Math.random() * 180);
    const connectionTime = 120 + Math.floor(Math.random() * 180); // 2-5 часов стыковка
    const secondDuration = 120 + Math.floor(Math.random() * 180);

    const arrivalDate = new Date(
      departureDate.getTime() + (firstDuration + connectionTime + secondDuration) * 60000
    );

    const departureDateSecond = new Date(
      departureDate.getTime() + (firstDuration + connectionTime) * 60000
    );

    const carriers = ['LH', 'KL', 'BA', 'AF', 'TK', 'EK'];
    const carrier = carriers[(index + 1) % carriers.length];

    return {
      id: uuidv4(),
      origin: this.getAirportInfo(hub),
      destination: this.getAirportInfo(request.destination),
      departureAt: departureDateSecond.toISOString(),
      arrivalAt: arrivalDate.toISOString(),
      marketingCarrier: {
        code: carrier,
        name: this.getCarrierName(carrier),
        flightNumber: `${carrier}${1000 + Math.floor(Math.random() * 9000)}`,
      },
      aircraft: {
        code: this.getRandomAircraftCode(),
        name: this.getRandomAircraftName(),
      },
      cabinClass: request.cabinClass,
      durationMinutes: secondDuration,
      stops: 0,
      distanceKm: this.calculateDistance(hub, request.destination),
      isCharter: false,
    };
  }

  /**
   * Определение типа соединения
   */
  private determineConnectionType(segments: FlightSegment[]): ConnectionType {
    if (segments.length === 1) {
      return ConnectionType.GDS_DIRECT;
    }

    const sameCarrier = segments.every(
      (seg) => seg.marketingCarrier.code === segments[0].marketingCarrier.code
    );

    return sameCarrier ? ConnectionType.GDS_CONNECTION : ConnectionType.FLYNTOS_SMART_CONNECT;
  }

  /**
   * Расчет цены
   */
  private calculatePrice(segments: FlightSegment[], request: FlightSearchRequest): number {
    const basePrice = 200 + segments.length * 150;
    const cabinMultiplier = {
      [CabinClass.ECONOMY]: 1.0,
      [CabinClass.PREMIUM_ECONOMY]: 1.5,
      [CabinClass.BUSINESS]: 3.0,
      [CabinClass.FIRST]: 5.0,
    };

    const passengerMultiplier = 1 + (request.passengers.children * 0.75) + (request.passengers.infants * 0.1);
    const finalPrice = Math.round(basePrice * cabinMultiplier[request.cabinClass] * passengerMultiplier);

    return finalPrice;
  }

  /**
   * Генерация информации о багаже
   */
  private generateBaggage(cabinClass: CabinClass) {
    const hasCheckedBaggage = Math.random() > 0.3;
    const hasDimensions = hasCheckedBaggage;
    return {
      cabin: BaggageType.CARRY_ON,
      checked: {
        quantity: hasCheckedBaggage ? 1 : 0,
        weightKg: hasCheckedBaggage ? 23 : undefined,
        dimensions: hasDimensions ? '55x35x25' : undefined,
        included: Math.random() > 0.4,
      },
    };
  }

  /**
   * Генерация правил тарифа
   */
  private generateFareRules() {
    const hasCancellationFee = Math.random() > 0.5;
    const hasChangeFee = Math.random() > 0.5;
    return {
      refundable: Math.random() > 0.7,
      changeable: Math.random() > 0.5,
      cancellationFee: hasCancellationFee ? Math.round(Math.random() * 200) : undefined,
      changeFee: hasChangeFee ? Math.round(Math.random() * 100) : undefined,
    };
  }

  /**
   * Получение информации об аэропорте
   */
  private getAirportInfo(code: string) {
    const airportData: Record<string, { code: string; name: string; city: string; country: string; terminal?: string }> = {
      SVO: { code: 'SVO', name: 'Sheremetyevo International', city: 'Moscow', country: 'Russia', terminal: 'D' },
      DME: { code: 'DME', name: 'Domodedovo International', city: 'Moscow', country: 'Russia', terminal: '1' },
      JFK: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', terminal: '4' },
      LHR: { code: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', terminal: '5' },
      CDG: { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', terminal: '2E' },
      FRA: { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', terminal: '1' },
      AMS: { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', terminal: '1' },
      IST: { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', terminal: '1' },
      DXB: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates', terminal: '3' },
    };

    return (
      airportData[code] || {
        code,
        name: `${code} Airport`,
        city: 'Unknown',
        country: 'Unknown',
      }
    );
  }

  /**
   * Получение названия авиакомпании
   */
  private getCarrierName(code: string): string {
    const carrierNames: Record<string, string> = {
      SU: 'Aeroflot',
      BA: 'British Airways',
      LH: 'Lufthansa',
      AF: 'Air France',
      KL: 'KLM',
      EK: 'Emirates',
      QR: 'Qatar Airways',
      TK: 'Turkish Airlines',
    };

    return carrierNames[code] || `${code} Airlines`;
  }

  /**
   * Получение случайного кода ВС
   */
  private getRandomAircraftCode(): string {
    const aircraftCodes = ['B77W', 'A359', 'B789', 'A333', 'B738', 'A320'];
    return aircraftCodes[Math.floor(Math.random() * aircraftCodes.length)];
  }

  /**
   * Получение случайного названия ВС
   */
  private getRandomAircraftName(): string {
    const aircraftNames = [
      'Boeing 777-300ER',
      'Airbus A350-900',
      'Boeing 787-9 Dreamliner',
      'Airbus A330-300',
      'Boeing 737-800',
      'Airbus A320',
    ];
    return aircraftNames[Math.floor(Math.random() * aircraftNames.length)];
  }

  /**
   * Расчет расстояния (упрощенно)
   */
  private calculateDistance(origin: string, destination: string): number {
    // Упрощенный расчет расстояния
    const baseDistance = 1000;
    const hash = (origin + destination).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return baseDistance + (hash % 5000);
  }
}
