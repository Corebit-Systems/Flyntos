# Архитектура мультиязычного поиска аэропортов

## Обзор

Решение обеспечивает масштабируемый, производительный мультиязычный поиск аэропортов с поддержкой нечеткого сопоставления, устойчивого к различным алфавитам, диакритическим знакам и опечаткам.

## Технологический стек

- **База данных**: PostgreSQL 16
- **Расширения**: `pg_trgm` (триграммный поиск), `unaccent` (удаление диакритики)
- **Backend**: Node.js + Fastify + pg (native PostgreSQL driver)
- **Язык**: TypeScript
- **Оптимизации**: автоматическое переключение между префиксным и триграммным поиском
- **I18n**: независимый поиск по всем локализациям с fallback на запрошенный язык

## Архитектурный подход

### 1. Хранение данных

#### Таблица `airports`
Основная информация об аэропортах:
- `iata_code` - уникальный 3-буквенный код IATA
- `icao_code` - 4-буквенный код ICAO
- Координаты, часовой пояс, код страны/региона

#### Таблица `airport_localizations`
Мультиязычные названия:
- `airport_id` - ссылка на аэропорт
- `locale` - код локали (en, ru, de, zh-CN и т.д.)
- `city_name` - название города
- `airport_name` - название аэропорта
- `search_normalized` - нормализованный текст для поиска (автоматически вычисляется)
- `is_primary` - основное название для локали

#### Таблица `airport_aliases`
Альтернативные написания:
- `airport_id` - ссылка на аэропорт
- `alias` - альтернативное название
- `alias_normalized` - нормализованный алиас
- `alias_type` - тип (transliteration, historical, alternative)
- `locale` - локаль (опционально)

### 2. Нормализация текста

Функция `normalize_search_text()`:
1. Приводит текст к нижнему регистру
2. Удаляет диакритические знаки (München → Munchen, Москва → moskva)
3. Создает унифицированную форму для сравнения

Примеры:
- "München" → "munchen"
- "Москва" → "moskva"
- "San José" → "san jose"
- "Zürich" → "zurich"

### 3. Индексация для производительности

#### GIN индексы (триграммные)
```sql
CREATE INDEX idx_airport_localizations_search_trgm 
    ON airport_localizations USING GIN (search_normalized gin_trgm_ops);

CREATE INDEX idx_airport_aliases_trgm 
    ON airport_aliases USING GIN (alias_normalized gin_trgm_ops);
```

- Обеспечивают быстрый нечеткий поиск по тексту
- Оператор `%` для триграммного сопоставления
- Функция `similarity()` для оценки схожести

#### B-tree индексы
```sql
CREATE INDEX idx_airports_iata_code ON airports(iata_code);
```

- Для точного поиска по IATA коду
- Самый быстрый тип индекса для равенства

### 4. Оптимизированный алгоритм ранжирования

Функция `search_airports()` использует многоуровневое ранжирование с автоматической оптимизацией:

#### Оптимизация для коротких запросов (< 3 символов)
При запросах короче 3 символов триграммный поиск отключается (он неэффективен), используется префиксный поиск:
- `match_type = 'name_prefix'`
- `similarity_score = 0.8`
- Пример: "J" → JFK, JNB, JED (быстрый ILIKE поиск)

#### Полный поиск для запросов >= 3 символов
Используются триграммные индексы для нечеткого сопоставления:

##### Приоритет 1: Точное совпадение IATA кода
- `match_type = 'iata_exact'`
- `similarity_score = 1.0`
- Пример: "JFK" → точное совпадение с кодом JFK

##### Приоритет 2: Частичное совпадение IATA кода
- `match_type = 'iata_partial'`
- `similarity_score = 0.9`
- Пример: "JF" → JFK, JFA

##### Приоритет 3: Точное совпадение названия
- `match_type = 'name_exact'`
- `similarity_score = 1.0`
- Пример: "Moscow" → точное совпадение с "Moscow"

##### Приоритет 4: Нечеткое совпадение названия
- `match_type = 'name_fuzzy'`
- `similarity_score = similarity()` (0.3 - 1.0)
- Пример: "Moscaw" → Moscow (с поправкой на опечатку)

##### Приоритет 5: Совпадение по алиасам
- `match_type = 'alias'`
- `similarity_score = similarity()` (0.3 - 1.0)
- Пример: "Muenchen" → München (через транслитерацию)

#### Исправленная сортировка результатов
Дедупликация через отдельный CTE `deduplicated` с финальной сортировкой по `similarity_score DESC`, что гарантирует правильный порядок релевантности.

## API endpoints

### POST /airports/search
Поиск аэропортов по запросу.

**Request body:**
```json
{
  "query": "Munich",
  "locale": "en",
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "airport_id": 5,
      "iata_code": "MUC",
      "city_name": "Munich",
      "airport_name": "Munich Airport",
      "locale": "en",
      "match_type": "name_exact",
      "similarity_score": 1.0
    }
  ],
  "count": 1
}
```

### GET /airports/:iataCode
Получение аэропорта по IATA коду.

**Query params:**
- `locale` - локаль для названий (default: en)

**Response:**
```json
{
  "success": true,
  "data": {
    "airport_id": 5,
    "iata_code": "MUC",
    "city_name": "Munich",
    "airport_name": "Munich Airport",
    "locale": "en",
    "match_type": "iata_exact",
    "similarity_score": 1.0
  }
}
```

### GET /airports/popular
Получение популярных аэропортов.

**Query params:**
- `locale` - локаль (default: en)
- `limit` - количество результатов (default: 10, max: 50)

## Примеры использования

### TypeScript
```typescript
import { airportSearchService } from './lib/airport-search';

// Поиск аэропортов
const results = await airportSearchService.search({
  query: 'Munich',
  locale: 'en',
  limit: 10
});

// Получение по IATA коду
const airport = await airportSearchService.getByIataCode('MUC', 'en');

// Популярные аэропорты
const popular = await airportSearchService.getPopularAirports('ru', 10);

// Создание аэропорта
const airportId = await airportSearchService.createAirport(
  {
    iata_code: 'CDG',
    icao_code: 'LFPG',
    latitude: 49.0097,
    longitude: 2.5479,
    timezone: 'Europe/Paris',
    country_code: 'FR',
    region_code: 'IDF'
  },
  [
    { locale: 'en', city_name: 'Paris', airport_name: 'Charles de Gaulle Airport', is_primary: true },
    { locale: 'ru', city_name: 'Париж', airport_name: 'Шарль-де-Голль', is_primary: true },
    { locale: 'fr', city_name: 'Paris', airport_name: 'Aéroport Charles de Gaulle', is_primary: true }
  ]
);

// Добавление алиаса
await airportSearchService.addAlias(airportId, 'Paris CDG', 'alternative', 'en');
```

### HTTP запросы```bash
# Поиск аэропортов
curl -X POST http://localhost:4000/airports/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Munich", "locale": "en", "limit": 10}'

# Получение по IATA коду
curl http://localhost:4000/airports/MUC?locale=en

# Популярные аэропорты
curl http://localhost:4000/airports/popular?locale=ru&limit=10
```

## Установка и настройка

### 1. Применение миграции
```bash
# Подключение к PostgreSQL
psql -h localhost -U postgres -d flyntos

# Применение миграции
\i apps/api/migrations/001_airports_schema.sql
```

### 2. Настройка переменных окружения
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flyntos
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Установка зависимостей
```bash
cd apps/api
pnpm install
```

## Производительность

### Индексы
- GIN индексы обеспечивают O(log n) сложность для триграммного поиска
- B-tree индексы обеспечивают O(log n) для поиска по IATA коду

### Оптимизации
- Частичный индекс для `is_primary = true` локализаций
- DISTINCT ON для удаления дубликатов результатов
- LIMIT для ограничения количества результатов

### Масштабируемость
- Пул соединений (max: 20)
- Поддержка до 50 результатов за запрос
- Эффективная работа с базой до 100,000+ аэропортов

## Тестирование

### Примеры запросов

```sql
-- Точный поиск по IATA
SELECT * FROM search_airports('JFK', 'en', 10);

-- Оптимизированный короткий запрос (< 3 символа) - префиксный поиск
SELECT * FROM search_airports('J', 'en', 10);
SELECT * FROM search_airports('LA', 'en', 10);

-- Нечеткий поиск по названию (>= 3 символа) - триграммный поиск
SELECT * FROM search_airports('Munich', 'en', 10);
SELECT * FROM search_airports('Munchen', 'en', 10);
SELECT * FROM search_airports('Muenchen', 'en', 10);

-- Поиск с опечатками
SELECT * FROM search_airports('Moscaw', 'en', 10);
SELECT * FROM search_airports('Lundon', 'en', 10);

-- Мультиязычный поиск с независимой локалью интерфейса
-- Пользователь с английской локалью ищет "Москва"
SELECT * FROM search_airports('Москва', 'en', 10);
-- Пользователь с русской локалью ищет "Munich"
SELECT * FROM search_airports('Munich', 'ru', 10);
```

## Расширения и улучшения

### Возможные улучшения
1. **Геопространственный поиск**: добавление PostGIS для поиска по расстоянию
2. **Автодополнение**: реализация suggest API для автокомплита
3. **Кэширование**: Redis для кэширования популярных запросов
4. **Аналитика**: логирование поисковых запросов для улучшения релевантности
5. **ML-ранжирование**: интеграция машинного обучения для персонализации

### Поддержка новых языков
Добавление новых локалей требует только вставки данных в `airport_localizations` без изменения схемы.

## Безопасность

- SQL инъекции защищены параметризованными запросами
- Валидация входных данных через Zod схемы
- Ограничение количества результатов (max: 50)
- CORS настройки для API

## Мониторинг

- Логирование ошибок в Fastify logger
- Метрики производительности через PostgreSQL pg_stat_statements
- Мониторинг пула соединений
