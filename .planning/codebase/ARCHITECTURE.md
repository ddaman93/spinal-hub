# Architecture

**Analysis Date:** 2026-01-25

## Pattern Overview

**Overall:** Layered Mobile-First Architecture with Client-Server Separation

**Key Characteristics:**
- React Native (Expo) client with multi-platform support (iOS, Android, Web)
- Express.js backend for API services and proxy functionality
- Context-based state management for theme and UI state
- React Query for server-state caching and data synchronization
- External API integration (clinical trials, weather)
- Navigation-first UI organization

## Layers

**Presentation Layer:**
- Purpose: Render UI components and manage navigation
- Location: `client/components/`, `client/screens/`
- Contains: Screen components, reusable UI components, theme-aware views
- Depends on: Context (theme), hooks (navigation, data fetching), types
- Used by: Navigation stack, app root

**Navigation Layer:**
- Purpose: Define screen hierarchy and routing logic
- Location: `client/navigation/RootStackNavigator.tsx`, `client/types/navigation.ts`
- Contains: Stack navigator configuration, route parameters, navigation types
- Depends on: Screen components, types
- Used by: App.tsx (entry point)

**State Management Layer:**
- Purpose: Manage global application state
- Location: `client/context/ThemeContext.tsx`, `client/hooks/`
- Contains: Context providers (theme), custom hooks for state access, AsyncStorage persistence
- Depends on: React Native, AsyncStorage
- Used by: All presentation components

**API/Data Layer:**
- Purpose: Handle external data sources and server communication
- Location: `server/routes/`, `client/lib/query-client.ts`, `server/index.ts`
- Contains: Express route handlers, React Query configuration, API request utilities
- Depends on: Node.js, Express, external APIs (clinicaltrials.gov, OpenWeather)
- Used by: Screen components (via React Query hooks)

**Infrastructure Layer:**
- Purpose: Cross-cutting concerns and configuration
- Location: `server/index.ts` (middleware), `client/constants/`, `client/config/`
- Contains: CORS setup, body parsing, request logging, theme constants, catalog configuration
- Depends on: Express, environment variables
- Used by: All layers

## Data Flow

**User Dashboard Load Flow:**

1. App.tsx renders with ErrorBoundary → QueryClientProvider → SafeAreaProvider → ThemeProvider → NavigationContainer → RootStackNavigator
2. RootStackNavigator renders DashboardScreen as initial route
3. DashboardScreen mounts and initiates parallel data fetches:
   - Weather API: Requests user location permission → fetches from OpenWeather API
   - Clinical trials: Fetches from AsyncStorage cache (TRIALS_CACHE_KEY) → pulls from /api/clinical-trials endpoint
4. Components render with cached data while fetches are in-flight
5. Data updates trigger re-renders, UI reflects new state

**API Request Flow (Clinical Trials Example):**

1. Client makes fetch request to `/api/clinical-trials` via getApiUrl() → baseUrl resolution
2. Express server (server/index.ts) receives request after middleware stack:
   - CORS middleware validates origin
   - Body parsing (JSON/urlencoded)
   - Request logging intercepts response
3. Route handler (server/routes/clinicalTrials.ts → getClinicalTrials) executes:
   - Accepts query params (condition, pageSize) with defaults
   - Constructs URL for external clinicaltrials.gov API
   - Fetches and maps response data
   - Returns JSON to client
4. Client receives response via apiRequest() utility
5. React Query caches response per query key
6. Component re-renders with new data

**State Mutation Flow (Theme Toggle):**

1. User taps theme toggle button (ThemeSwitchButton.tsx)
2. Button calls toggleTheme() from ThemeContext
3. ThemeContext.toggleTheme():
   - Updates userPreference state
   - Writes to AsyncStorage (THEME_STORAGE_KEY)
   - Emits value update to all ThemeContext consumers
4. All useThemeContext() hooks re-render
5. Components update colors via theme object

## Key Abstractions

**Navigation Type System:**
- Purpose: Type-safe navigation with route parameters
- Examples: `client/types/navigation.ts` (MainStackParamList)
- Pattern: TypeScript type definition extends ReactNavigation types for compile-time safety

**Theming System:**
- Purpose: Centralized light/dark mode management with persistence
- Examples: `client/context/ThemeContext.tsx`, `client/constants/theme.ts`, `client/hooks/useTheme.ts`
- Pattern: Context provider with AsyncStorage persistence, system color scheme fallback

**API Client Abstraction:**
- Purpose: Unified request handling with environment-aware URL resolution
- Examples: `client/lib/query-client.ts` (apiRequest, getApiUrl), `server/routes/clinicalTrials.ts`
- Pattern: Generic fetch wrapper with credential support, query client with default options

**Catalog Configuration:**
- Purpose: Declarative definition of screens, tools, and categories
- Examples: `client/config/catalog.ts` (CATEGORIES, ToolConfig, CategoryConfig)
- Pattern: Structured data-driven configuration linked to navigation routes

**Query Client Pattern:**
- Purpose: Automatic caching and request deduplication
- Examples: `client/lib/query-client.ts` (QueryClient with defaultOptions)
- Pattern: React Query with no refetch on window focus, infinite staleTime, retry=false

## Entry Points

**Application Root:**
- Location: `client/App.tsx`
- Triggers: Expo bundle initialization (client/index.js)
- Responsibilities: Wraps entire app with providers (ErrorBoundary, QueryClientProvider, SafeAreaProvider, ThemeProvider)

**Server Entry:**
- Location: `server/index.ts`
- Triggers: `npm run server:dev` or `npm run server:prod`
- Responsibilities: Initializes Express app, registers middleware, registers routes, starts HTTP server on port 5000

**Navigation Root:**
- Location: `client/navigation/RootStackNavigator.tsx`
- Triggers: Rendered by App.tsx via NavigationContainer
- Responsibilities: Defines all screen routes, configures header options, manages navigation stack

**Dashboard Screen:**
- Location: `client/screens/DashboardScreen.tsx`
- Triggers: Initial route in RootStackNavigator
- Responsibilities: Loads weather data, fetches live clinical trials, renders category tiles and product cards

## Error Handling

**Strategy:** Defensive programming with try-catch blocks and null checks

**Patterns:**
- Client-side: Screens check for null/undefined state before rendering (e.g., `allTrials ?? []` defaults)
- API layer: apiRequest() throws on non-ok responses; fetch wrappers catch and log errors
- React Query: Configured with retry=false, errors propagate to consumers
- ErrorBoundary: Catches component errors and displays ErrorFallback component
- Async effects: Use cancelled flags to prevent state updates on unmounted components

## Cross-Cutting Concerns

**Logging:**
- Express middleware (setupRequestLogging) intercepts all /api requests
- Logs method, path, status, duration, and response body
- Browser console used for client-side debug logging

**Validation:**
- Route parameters validated via TypeScript types (MainStackParamList)
- API responses parsed with optional chaining and nullish coalescing (e.g., `data?.studies ?? []`)
- No formal schema validation library (Zod included in dependencies but not used in routes)

**Authentication:**
- Not implemented in current architecture
- Credentials: "include" set in fetch options for future auth support
- Query client configurable with on401 behavior (returnNull or throw)

---

*Architecture analysis: 2026-01-25*
