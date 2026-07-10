# Flyntos.com — Global System Map

This document serves as the single source of truth for the architecture, technology stack, and business logic of **Flyntos.com**.

## 1. General Concept & Technology Stack
Flyntos is a multilingual global travel aggregator operating on an Affiliate (Deeplink) Model. We do not process direct bookings; instead, we orchestrate search queries, generate dynamic partner referral links, and earn commissions on successful conversions.

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

## 3. Monetization Module (Deeplink Generator)
The revenue engine of Flyntos relies on dynamic affiliate link generation.

### Architecture
- **Adapter Pattern**: We utilize an abstract `BasePartnerAdapter` that enforces a standard contract for all partner integrations.
- **DeeplinkGeneratorService**: Orchestrates all adapters, routing the `SearchContext` (origin, destination, dates, passengers, locale) to each partner.
- **Tracking (SubID)**: To track conversions via postbacks, the service generates a unique `subId` per search (format: `flyntos-{timestamp}-{origin}{destination}`) and propagates it to all adapters.

## 4. Connected Partners
Currently, the following partners are integrated into the monetization engine:

1. **Kiwi Affiliate (Flights)**
   - **Base URL**: `https://kiwi.tpx.gr/foSJrpZS`
   - **Mechanism**: Appends `origin`, `destination`, `departure`, `return`, `passengers`, and the unique `subid`.
2. **Aviasales / Travelpayouts (Flights)**
   - **Mechanism**: Converts standard YYYY-MM-DD dates to Aviasales' `DDMM` format. Wraps the destination search string in a `tp.media` redirect link using our official `marker` and `sub_id`.
3. **Localrent (Car Rentals)**
   - **Mechanism**: Generates targeted car rental links exclusively when the destination is Montenegro (TGD or TIV). Uses `subid` for tracking.

## 5. Frontend Architecture (Web)
The Web module provides a premium, "calmer route to flight discovery" user experience.

- **SearchPage**: Features a comprehensive search widget with complex form state management and `zod` validation before querying the API.
- **ResultsPage**: A Server Component layout that integrates:
  - **FilterSidebar**: A dynamically generated filter panel with sliders, checkboxes, and tabs based on the available flights.
  - **useFlightFilters**: A highly optimized, memoized React hook that handles client-side filtering (max price, airlines, stops, baggage, Smart Connect) and sorting (cheapest, fastest, optimal).
  - **FlightCard**: An interactive, glassmorphism-styled component displaying flight details, including specific badges for Flyntos Smart Connect.

## 6. Internationalization (I18n)
Flyntos is built from the ground up for a global audience.
- **Supported Locales**: `en`, `ru`, `es`, `ar` (Active UI Locales).
- **Mechanism**: Next.js App Router dynamic segments `[locale]`.
- **Search Logic**: The backend intelligently searches airport and city names in the user's selected locale. If an exact match is missing, it automatically falls back to English (`en`).

---
*This document should be updated whenever a new partner is added or a core architectural change is made.*
