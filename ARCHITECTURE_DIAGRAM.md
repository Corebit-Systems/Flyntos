# Архитектура Flyntos

## Обзор системы

Flyntos - это monorepo платформа для поиска авиабилетов с мультиязычной поддержкой, построенная на TypeScript с использованием pnpm workspaces.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLYNTOS MONOREPO                         │
│                     (pnpm workspaces)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   apps/web   │    │   apps/api   │    │ apps/worker  │
│  (Next.js)   │    │  (Fastify)   │    │   (BullMQ)   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   packages/*     │
                    │  (Shared Code)   │
                    └──────────────────┘
```

## Структура пакетов

### Shared Packages (packages/*)

```
packages/
├── search-contracts/    # Типы и схемы для поиска (Zod)
│   └── src/index.ts     # CanonicalSearchRequest, SearchResponse
├── config/              # Конфигурация системы
│   └── src/index.ts     # Локали, сценарии, очереди
├── i18n/                # Интернационализация
│   └── src/index.ts     # Словари для 14 языков
├── provider-sdk/        # SDK для интеграции провайдеров
│   └── src/index.ts     # BasePartnerAdapter, ProviderRegistry
├── ui/                  # Общие UI компоненты
├── shared/              # Общие утилиты
└── seo-engine/          # SEO функциональность
```

## Frontend Architecture (apps/web)

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS WEB APP                            │
│                   (Port: 3000)                               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Landing    │    │   Search     │    │   Results    │
│    Page      │    │    Form      │    │    Page      │
│ /[locale]/   │    │  Component   │    │/[locale]/    │
└──────────────┘    └──────────────┘    │  results/    │
        │                     │         └──────────────┘
        │                     │                   │
        │                     │                   ▼
        │                     │         ┌──────────────────┐
        │                     │         │ FlightResultsView │
        │                     │         │ FilterSidebar     │
        │                     │         │ ResultsTabs       │
        │                     │         │ PriceMatrix       │
        │                     │         └──────────────────┘
        │                     │
        └─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Layout Components│
                    │  - Header         │
                    │  - Footer         │
                    │  - LocaleSwitcher │
                    └──────────────────┘
```

### Frontend Components Flow

```
User Input
    │
    ▼
SearchForm (apps/web/src/components/search/search-form.tsx)
    │
    ├── CityAutocomplete (автозаполнение аэропортов)
    ├── GeoIP Detection (определение локации)
    ├── Date Selection (выбор дат)
    ├── Scenario Selection (выбор сценария поиска)
    └── Submit → Navigation to /results
    │
    ▼
ResultsPage (apps/web/src/app/[locale]/results/page.tsx)
    │
    ├── Parse query params
    ├── Generate mock flights
    ├── Render FlightResultsView
    └── Render ResultsTabs (Cars, Extras)
```

## Backend Architecture (apps/api)

```
┌─────────────────────────────────────────────────────────────┐
│                    FASTIFY API SERVER                        │
│                   (Port: 4000)                               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  /search     │    │  /health     │    │  /partners   │
│  Route       │    │  Route       │    │  Route       │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  mock-search │    │  config      │    │  partners    │
│  logic       │    │  endpoint    │    │  adapters    │
└──────────────┘    └──────────────┘    └──────────────┘
        │
        ├── toCanonical() (нормализация запроса)
        ├── ProviderRegistry (реестр провайдеров)
        ├── MockAdapter (mock провайдеры: Kiwi, Amadeus)
        ├── applyFilters() (фильтрация результатов)
        └── rankItineraries() (ранжирование по сценарию)
```

### Backend Search Flow

```
POST /search
    │
    ▼
searchInputSchema (Zod validation)
    │
    ▼
toCanonical() → CanonicalSearchRequest
    │
    ▼
ProviderRegistry.list()
    │
    ├── MockAdapter (Kiwi)
    └── MockAdapter (Amadeus)
    │
    ▼
ProviderSearchResult[] (raw results)
    │
    ▼
applyFilters() (price, stops, cabin, baggage)
    │
    ▼
rankItineraries() (scenario-based scoring)
    │
    ├── Standard: balanced price/duration/stops
    ├── Cheapest: price priority
    ├── Best: quality + price
    ├── Weekend: duration priority
    ├── Family: baggage + comfort
    ├── Business: cabin + schedule
    └── Direct-priority: nonstop preference
    │
    ▼
SearchResponse (ranked itineraries)
```

## Worker Architecture (apps/worker)

```
┌─────────────────────────────────────────────────────────────┐
│                    BULLMQ WORKER                             │
│              (Background Job Processing)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Queue Registry  │
                    │  - search-refresh │
                    │  - price-alerts   │
                    │  - clickout-events│
                    │  - provider-sync  │
                    │  - seo-precompute │
                    │  - translations  │
                    │  - analytics      │
                    │  - notifications  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  TODO: Processors │
                    │  (Not implemented)│
                    └──────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Enter search criteria
     ▼
┌──────────────────┐
│  SearchForm      │
│  - Origin/Dest   │
│  - Dates         │
│  - Passengers    │
│  - Scenario      │
└────┬─────────────┘
     │
     │ 2. Navigate to /results
     ▼
┌──────────────────┐
│  ResultsPage     │
│  - Parse params  │
│  - Call API      │
└────┬─────────────┘
     │
     │ 3. POST /search
     ▼
┌──────────────────┐
│  Fastify API     │
│  - Validate      │
│  - Normalize    │
└────┬─────────────┘
     │
     │ 4. Mock search
     ▼
┌──────────────────┐
│  Mock Providers  │
│  - Kiwi          │
│  - Amadeus       │
└────┬─────────────┘
     │
     │ 5. Filter & Rank
     ▼
┌──────────────────┐
│  Search Logic    │
│  - applyFilters  │
│  - rankResults   │
└────┬─────────────┘
     │
     │ 6. Return results
     ▼
┌──────────────────┐
│  ResultsPage     │
│  - Render flights│
│  - Render tabs   │
└────┬─────────────┘
     │
     │ 7. Display to user
     ▼
┌──────────┐
│  User    │
└──────────┘
```

## Internationalization Flow

```
URL: /ru/results
    │
    ▼
getLocale('ru')
    │
    ▼
getDictionary('ru')
    │
    ▼
packages/i18n/src/index.ts
    │
    ├── base (English defaults)
    └── ruOverride (Russian translations)
    │
    ▼
Dictionary object
    │
    ├── ui.hero.title
    ├── ui.resultsPage.carsTitle
    ├── ui.resultsPage.extrasTitle
    └── ... (all UI strings)
    │
    ▼
Components use dict.*
```

## Scenario-Based Ranking

```
Scenario Selection
    │
    ├── Standard:  price(28%) + duration(22%) + stops(18%)
    ├── Cheapest:  price(56%) + duration(8%)  + stops(12%)
    ├── Best:      price(24%) + duration(20%) + stops(18%)
    ├── Weekend:   price(22%) + duration(32%) + stops(18%)
    ├── Family:    price(20%) + duration(18%) + stops(24%)
    ├── Business:  price(12%) + duration(24%) + stops(22%)
    └── Direct:    price(18%) + duration(22%) + stops(32%)
    │
    ▼
Ranking Score Calculation
    │
    ▼
Sorted Results
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (Glassmorphism design)
- **Animations**: Framer Motion
- **Language**: TypeScript

### Backend
- **Framework**: Fastify 5
- **Validation**: Zod
- **Language**: TypeScript

### Background Processing
- **Queue**: BullMQ
- **Cache**: Redis
- **Language**: TypeScript

### Database
- **Primary**: PostgreSQL 16 (configured but not actively used)
- **Indexing**: GIN + pg_trgm for fuzzy search

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Package Manager**: pnpm (workspaces)
- **Deployment**: Railway, Vercel

## Key Files Reference

### Core Contracts
- `packages/search-contracts/src/index.ts` - Search types and schemas
- `packages/config/src/index.ts` - System configuration

### API Logic
- `apps/api/src/index.ts` - Fastify server setup
- `apps/api/src/lib/mock-search.ts` - Search orchestration
- `apps/api/src/lib/rank-results.ts` - Ranking algorithms
- `apps/api/src/lib/filter-results.ts` - Filtering logic

### Frontend Components
- `apps/web/src/components/search/search-form.tsx` - Search form with autocomplete
- `apps/web/src/app/[locale]/results/page.tsx` - Results page
- `apps/web/src/lib/api.ts` - API client

### Shared Resources
- `packages/i18n/src/index.ts` - Translations for 14 languages
- `apps/web/src/data/airports.json` - Airport database

## Current Limitations

1. **No real provider integrations** - Only mock adapters
2. **No database usage** - PostgreSQL configured but not used
3. **No authentication** - No user system
4. **No tests** - No test coverage
5. **No CI/CD** - No automated pipelines
6. **Worker not processing** - Only queue registration

## Deployment Architecture

```
Development:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Web :3000   │    │  API :4000   │    │ Worker       │
│  Next.js     │    │  Fastify     │    │ BullMQ       │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │  Redis       │
                  │  PostgreSQL  │
                  └──────────────┘

Production (Railway):
┌─────────────────────────────────────────┐
│  Vercel (Web)                            │
│  - Next.js static export                 │
│  - API proxy rewrites                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Railway (API + Worker)                  │
│  - Fastify API                           │
│  - BullMQ Worker                         │
│  - Redis                                 │
│  - PostgreSQL                            │
└─────────────────────────────────────────┘
```

## Partner Integration Architecture (Future)

```
DeeplinkGeneratorService
    │
    ├── BasePartnerAdapter (abstract)
    │
    ├── KiwiAdapter (flights)
    ├── AviasalesAdapter (flights)
    ├── LocalrentAdapter (cars)
    ├── KiwiTaxiAdapter (transfers)
    ├── GetYourGuideAdapter (experiences)
    └── KlookAdapter (activities)
    │
    ▼
White Label URLs with tracking (subId)
    │
    ▼
Partner Landing Pages
```
