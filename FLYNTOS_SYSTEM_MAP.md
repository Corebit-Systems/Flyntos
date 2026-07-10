# Flyntos.com — Global System Map

This document serves as the single source of truth for the architecture, technology stack, and business logic of **Flyntos.com**.

## 1. General Concept & Technology Stack
Flyntos is a hybrid global travel aggregator operating on a dual model:
1. **Custom In-House Flight Search**: A highly optimized, proprietary engine for flight discovery using Fastify and PostgreSQL.
2. **White Label Gateways**: Premium, seamless handoffs to partner White Label subdomains and targeted landing pages for Car Rentals, Yachts, Transfers, and Experiences.

**Core Technology Stack:**
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS (Glassmorphism design system).
- **Backend**: Node.js, Fastify, TypeScript.
- **Database**: PostgreSQL 16 (optimized for fast text searches).
- **Cache / Sessions**: Redis.
- **Language**: TypeScript throughout the stack (Monorepo).

## 2. Backend Architecture (API)
The backend is powered by Fastify, providing high-performance, schema-validated endpoints. 

### Multilingual Airport Search
The search module is highly optimized for fast autocomplete responses:
- **Indexing**: Uses PostgreSQL GIN (Generalized Inverted Index) with `pg_trgm` for fast trigram-based fuzzy matching.
- **Prefix Search**: Specifically optimized for short queries (1-3 characters) ensuring instant feedback when a user starts typing an IATA code or city name.
- **Schema Validation**: All incoming requests are strictly validated using `zod`.

## 3. Monetization Module (White Label Gateways)
The revenue engine for non-flight services (Cars, Yachts, Extras) relies on dynamic White Label handoffs.

### Architecture
- **Adapter Pattern**: We utilize an abstract `BasePartnerAdapter` that enforces a standard contract for all partner integrations.
- **DeeplinkGeneratorService**: Orchestrates all adapters, routing the `SearchContext` (origin, destination, dates, passengers, locale) to each partner.
- **Premium WL Handoffs**: Instead of mocking multiple fake cards, adapters generate a single, highly optimized White Label URL containing all search parameters and the unique tracking `subId`. The frontend renders this as a premium glassmorphic promo block.
- **Tracking (SubID)**: To track conversions via postbacks, the service generates a unique `subId` per search (format: `flyntos-{timestamp}-{origin}{destination}`) and propagates it to all adapters.
- **Validation & Logging**: Zod schemas strictly validate incoming requests but are robust enough to accept optional fields (`passengers`, `locale`). The API includes end-to-end logging for request contexts and generated adapter payloads to ensure observability.
- **Production Routing**: The Next.js frontend securely routes to the production API (e.g. `flyntosapi-production.up.railway.app`) using proxy rewrites and prioritizing `NEXT_PUBLIC_API_URL` to avoid localhost fallbacks on production.

## 4. Connected Partners
Currently, the following partners are integrated into the monetization engine:

1. **Kiwi Affiliate (Flights)**
   - **Base URL**: `https://kiwi.tpx.gr/foSJrpZS`
   - **Mechanism**: Appends `origin`, `destination`, `departure`, `return`, `passengers`, and the unique `subid`.
2. **Aviasales / Travelpayouts (Flights)**
   - **Mechanism**: Converts standard YYYY-MM-DD dates to Aviasales' `DDMM` format. Wraps the destination search string in a `tp.media` redirect link using our official `marker` and `sub_id`.
3. **Localrent (Car Rentals)**
   - **Mechanism**: Generates targeted car rental links exclusively when the destination is Montenegro (TGD or TIV). Uses `subid` for tracking.
   - **Parameter Rules**: City must be passed as `city=tivat` or `city=podgorica`. Dates must be strictly formatted as `YYYY-MM-DD` (without spaces) for `date_from` and `date_to`.
4. **KiwiTaxi (Transfers)**
   - **Mechanism**: Generates a referral link for an individual transfer from the arrival airport (`destinationIata`) to popular destinations around it or to a general booking page, passing our `subId` via the `pap` parameter. Supports localized landing pages.
5. **GetYourGuide (Experiences & Tours)**
   - **Mechanism**: Oriented towards global and European audiences. Forms a partner URL with a search query (`q`) based on the arrival city/airport and passes the interface language (`locale`), so the user lands on a localized activity page. Integrates tracking via `partner_id`.
6. **Klook (Activities & Attractions)**
   - **Mechanism**: A global partner. Generates a link for tours and entry tickets for the destination city, integrating the tracking parameter via `aff_sub`.

## 5. Frontend Architecture (Web)
The Web module provides a premium, "calmer route to flight discovery" user experience.

- **SearchPage**: Features a comprehensive search widget with complex form state management and `zod` validation before querying the API.
- **ResultsPage**: A Server Component layout that integrates:
  - **FilterSidebar**: A dynamically generated filter panel with sliders, checkboxes, and tabs based on the available flights.
  - **useFlightFilters**: A highly optimized, memoized React hook that handles client-side filtering (max price, airlines, stops, baggage, Smart Connect) and sorting (cheapest, fastest, optimal).
  - **FlightCard**: An interactive, glassmorphism-styled component displaying flight details, including specific badges for Flyntos Smart Connect.
  - **ResultsTabs & Cross-sell Views**: Includes dynamic tabs for Flights, Car Rentals (`CarResultsView`), and Extras (`ExperiencesView` for transfers and experiences). All partner cards use a unified glassmorphic design and open tracking deeplinks in new tabs.

## 6. Internationalization (I18n)
Flyntos is built from the ground up for a global audience.
- **Supported Locales**: `EN`, `RU`, `ES`, `AR` (Active UI Locales).
- **Mechanism**: Next.js App Router dynamic segments `[locale]`.
- **Search Logic**: The backend intelligently searches airport and city names in the user's selected locale. If an exact match is missing, it automatically falls back to English (`EN`).

---
*This document should be updated whenever a new partner is added or a core architectural change is made.*
