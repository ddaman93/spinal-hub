# External Integrations

**Analysis Date:** 2026-01-25

## APIs & External Services

**Clinical Trials:**
- clinicaltrials.gov - Fetches live clinical trial data
  - SDK/Client: Native fetch API
  - Endpoint: `https://clinicaltrials.gov/api/v2/studies`
  - Query parameters: `query.cond` (condition), `pageSize` (results per page)
  - Implementation: `server/routes/clinicalTrials.ts` - getClinicalTrials function handles proxying and transforms study data
  - Client consumption: `client/screens/ClinicalTrialsListScreen.tsx` - Direct client-side fetch fallback for refresh
  - Response structure: Returns studies with `id` (NCT ID), `title`, `status`, `phase`, `summary`, `country`

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: Via Drizzle ORM (pg driver 8.16.3)
  - Schema: `shared/schema.ts` - Defines `users` table with UUID primary key, username, password
  - ORM: Drizzle ORM 0.39.3 with Zod schema integration
  - Migrations: Managed via drizzle-kit (run with `npm run db:push`)
  - Note: In-memory fallback storage available via `server/storage.ts` MemStorage class for development

**Local Storage (Client):**
- AsyncStorage (@react-native-async-storage/async-storage)
  - Location: `client/lib/storage.ts`
  - Keys managed:
    - `health_vitals` - Blood pressure, heart rate, temperature, weight, oxygen
    - `pain_entries` - Pain level, location, description with timestamps
    - `medications` - Medication details and dosages
    - `medication_logs` - Medication adherence tracking
    - `hydration_logs` - Water intake tracking
    - `routine_tasks` - Morning/evening routine checklist
    - `routine_completions` - Task completion tracking
    - `appointments` - Doctor, therapy, equipment appointments
    - `emergency_contacts` - Emergency contact information
    - `user_preferences` - Dark mode, water goals, units
  - Usage: Cache for clinical trials via `clinical_trials_cache` key in `client/screens/ClinicalTrialsListScreen.tsx`
  - Wrapper: `useBookmarks` hook in `client/hooks/useBookmarks.ts` manages assistiveTech and clinicalTrials bookmarks

**File Storage:**
- Local filesystem only (assets and static build)
  - Static assets served from `/assets` directory
  - Expo web/native build artifacts from `static-build/` directory

**Caching:**
- React Query (@tanstack/react-query)
  - Client: Configured in `client/lib/query-client.ts`
  - Default options: No refetch on window focus, infinite stale time, no automatic retries
  - Clinical trials query defaults to server-side implementation

## Authentication & Identity

**Auth Provider:**
- Custom authentication (not implemented/connected yet)
  - Schema defined: `shared/schema.ts` - users table with username/password
  - Storage interface: `server/storage.ts` - IStorage interface with getUser, getUserByUsername, createUser
  - Current implementation: MemStorage (in-memory) - suitable for development only
  - No routes registered yet in `server/routes.ts`

**Credentials:**
- API requests include `credentials: "include"` for cookie-based auth in `client/lib/query-client.ts`

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or similar integration

**Logs:**
- Console-based logging in server: Request logging middleware in `server/index.ts` logs HTTP method, path, status, duration, response body
- Client: Console error handling in `client/lib/storage.ts` and `client/screens/ClinicalTrialsListScreen.tsx`
- Error Boundary: `client/components/ErrorBoundary.tsx` catches React errors

## CI/CD & Deployment

**Hosting:**
- Replit - Implicit from environment variables (REPLIT_DEV_DOMAIN, REPLIT_DOMAINS)
- Development: Expo dev server on port 8081, Express on port 5000
- Production: Static build from Expo + Express server

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or similar

**Build Commands:**
- `npm run expo:dev` - Start Expo dev server with Replit proxying
- `npm run server:dev` - Start Express dev server with tsx
- `npm run all:dev` - Run both in parallel
- `npm run expo:static:build` - Create optimized static build
- `npm run server:build` - Bundle server with esbuild
- `npm run server:prod` - Run production server bundle

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_DOMAIN` - Public domain for app (used by client for API URL resolution)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - development or production
- Replit-specific:
  - `REPLIT_DEV_DOMAIN` - Dev environment domain
  - `REPLIT_DOMAINS` - Comma-separated production domains
  - `REPLIT_INTERNAL_APP_DOMAIN` - Internal domain for static build

**Secrets location:**
- Not detected - No .env file found
- PostgreSQL connection string: Not exposed in codebase (expected to be managed separately)

## Webhooks & Callbacks

**Incoming:**
- Health check endpoint: `GET /api/health` in `server/routes.ts`
- Clinical trials endpoint: `GET /api/clinical-trials` in `server/routes.ts`

**Outgoing:**
- None detected - No external webhook notifications or callbacks

## CORS & Network Configuration

**CORS Setup:**
- Custom CORS middleware in `server/index.ts` setupCors function
- Allowed origins: Replit dev domain and production domains from environment
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type
- Credentials: Enabled

**Proxy Configuration:**
- Development: Expo dev server proxied through Express
- Proxy path: `/expo-web` routes to `http://localhost:8081`
- Clinical trials: Client-side direct fetch fallback to `clinicaltrials.gov/api/v2/studies` (see `client/screens/ClinicalTrialsListScreen.tsx`)

## Capabilities & Integrations

**Location Services:**
- expo-location 19.0.8 - Available but not yet integrated

**Notifications:**
- expo-notifications 0.32.15 - Available for push notifications

**Accessibility:**
- expo-speech 14.0.8 - Text-to-speech available

---

*Integration audit: 2026-01-25*
