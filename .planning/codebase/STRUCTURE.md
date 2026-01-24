# Codebase Structure

**Analysis Date:** 2026-01-25

## Directory Layout

```
Resume-Builder/
├── client/                    # React Native (Expo) frontend application
│   ├── App.tsx               # Root application component
│   ├── index.js              # Entry point (Expo)
│   ├── components/           # Reusable UI components
│   ├── screens/              # Screen components for navigation
│   ├── screens/tools/        # Health/wellness tool screens
│   ├── navigation/           # Navigation configuration and stack
│   ├── context/              # React Context providers (theme)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library utilities (API client, query client)
│   ├── utils/                # Helper functions (filtering, formatting)
│   ├── config/               # Configuration files (catalog)
│   ├── constants/            # Constants (theme colors, hooks)
│   ├── types/                # TypeScript type definitions
│   ├── assets/               # Images and static assets
│   └── app/                  # Expo app configuration
├── server/                    # Express.js backend
│   ├── index.ts              # Express app setup and middleware
│   ├── routes.ts             # Route registration and health check
│   ├── routes/               # Individual route handlers
│   │   └── clinicalTrials.ts # Clinical trials API route
│   ├── storage.ts            # Database/storage utilities
│   └── templates/            # Server templates (landing page HTML)
├── shared/                    # Shared types and utilities (monorepo support)
├── assets/                    # Root-level shared assets
├── app.json                   # Expo app configuration
├── package.json              # NPM dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── babel.config.js           # Babel configuration
├── drizzle.config.ts         # Database ORM configuration
└── design_guidelines.md      # UI/UX design specifications
```

## Directory Purposes

**client/ - Frontend Application:**
- Purpose: React Native Expo application serving iOS, Android, and web platforms
- Contains: Screen components, reusable UI components, hooks, context providers
- Key files: `App.tsx` (root), `navigation/RootStackNavigator.tsx` (routing)

**client/components/ - Reusable UI Components:**
- Purpose: Presentational components shared across multiple screens
- Contains: Card components, buttons, themed text/views, error boundary
- Key files:
  - `Card.tsx`, `Button.tsx`, `Spacer.tsx` - Basic building blocks
  - `ThemedText.tsx`, `ThemedView.tsx` - Theme-aware wrappers
  - `ErrorBoundary.tsx`, `ErrorFallback.tsx` - Error handling UI
  - `CategoryTile.tsx`, `TechNavCard.tsx`, `ProductCard.tsx` - Domain-specific cards
  - `LiveClinicalTrialCard.tsx`, `ClinicalTrialCard.tsx` - Trial cards
  - `AssistiveTechCard.tsx`, `AssistiveTechLane.tsx` - Assistive tech components

**client/screens/ - Screen Components:**
- Purpose: Full-screen components corresponding to navigation routes
- Contains: Dashboard, Settings, Product Detail, Clinical Trial screens
- Key files:
  - `DashboardScreen.tsx` - Home/hub screen with weather, categories, live trials
  - `CategoryDetailScreen.tsx` - Category details and tool list
  - `ProductDetailScreen.tsx` - Product/item detail view
  - `SettingsScreen.tsx` - App settings and preferences
  - `ClinicalTrialsListScreen.tsx`, `ClinicalTrialDetailScreen.tsx` - Clinical trial screens
  - `AssistiveTechListScreen.tsx`, `AssistiveTechDetailScreen.tsx` - Assistive tech screens
  - Tool screens: VitalsLogScreen.tsx, PainJournalScreen.tsx, etc.

**client/screens/tools/ - Health & Wellness Tools:**
- Purpose: Specialized screens for health tracking and daily management
- Contains: Vitals logger, pain journal, medication tracker, hydration tracker, routine guides
- Key files:
  - `VitalsLogScreen.tsx` - Blood pressure, heart rate tracking
  - `PainJournalScreen.tsx` - Pain level and location logging
  - `MedicationTrackerScreen.tsx` - Medication management
  - `HydrationTrackerScreen.tsx` - Water intake tracking
  - `PressureReliefTimerScreen.tsx` - Timed pressure relief reminders
  - `RoutineScreen.tsx` - Morning/evening routine checklists
  - `AppointmentSchedulerScreen.tsx` - Medical appointment management
  - `EmergencyContactsScreen.tsx` - Emergency contact list

**client/navigation/ - Navigation Configuration:**
- Purpose: Define routing structure and screen hierarchy
- Contains: Stack navigator configuration, header options, route parameters
- Key files:
  - `RootStackNavigator.tsx` - Main navigation stack with all routes and screen options

**client/context/ - State Providers:**
- Purpose: Global state management via React Context
- Contains: Theme provider with light/dark mode toggle
- Key files:
  - `ThemeContext.tsx` - Color scheme management with AsyncStorage persistence

**client/hooks/ - Custom React Hooks:**
- Purpose: Reusable logic extraction and state management
- Contains: Theme hooks, bookmarks hooks, color scheme hooks
- Key files:
  - `useTheme.ts` - Access theme context (facade over useThemeContext)
  - `useBookmarks.ts` - Manage bookmarked items
  - `useColorScheme.ts` - System color scheme detection

**client/lib/ - Library Utilities:**
- Purpose: Centralized utility functions for API communication and data fetching
- Contains: Query client setup, API request helpers, environment configuration
- Key files:
  - `query-client.ts` - React Query client configuration, getApiUrl(), apiRequest()
  - `storage.ts` - AsyncStorage or database utilities

**client/utils/ - Helper Functions:**
- Purpose: Domain-specific utility functions
- Contains: Filtering, formatting, data transformation helpers
- Key files:
  - `filterAssistiveTech.ts` - Filter assistive technology items

**client/config/ - Configuration Files:**
- Purpose: Declarative configuration data for features
- Contains: Category definitions, tool configurations
- Key files:
  - `catalog.ts` - CATEGORIES array, ToolConfig, CategoryConfig types
  - `categories.ts` - (currently empty)

**client/constants/ - Constant Values:**
- Purpose: Centralized constant definitions
- Contains: Theme colors, spacing values, hook utilities
- Key files:
  - `theme.ts` - Colors object for light/dark modes, Spacing values
  - `hooks/useScreenOptions.ts` - Screen header configuration hook

**client/types/ - TypeScript Definitions:**
- Purpose: Centralized type definitions
- Contains: Navigation types, domain model types
- Key files:
  - `navigation.ts` - MainStackParamList with all route parameters

**client/assets/ - Static Assets:**
- Purpose: Images and media files
- Contains: PNG, JPEG, WebP images for UI
- Key files: `images/manual/` subdirectory with product images

**server/ - Backend API Server:**
- Purpose: Express.js REST API and middleware orchestration
- Contains: Route handlers, CORS setup, request logging, proxy for Expo dev server
- Entry point: `index.ts`

**server/routes.ts - Route Registration:**
- Purpose: Register all API routes and health checks
- Contains: Health check endpoint, route registration call
- Key files:
  - `/api/health` - Health check (returns { ok: true })
  - `/api/clinical-trials` - Clinical trials fetching

**server/routes/clinicalTrials.ts - Clinical Trials Handler:**
- Purpose: Proxy requests to clinicaltrials.gov API
- Contains: getClinicalTrials() route handler
- Parameters: condition (default: "spinal cord injury"), pageSize (default: "10")
- Response: Studies array with id, title, status

**server/storage.ts - Data Persistence:**
- Purpose: Database and file storage utilities
- Contains: (Content to be checked in depth)

**shared/ - Monorepo Shared Code:**
- Purpose: Types and utilities shared between client and server
- Contains: (Common types, validators)

**assets/ - Root Level Assets:**
- Purpose: Shared images and assets accessible from both client and server
- Contains: Product images, branding assets

## Key File Locations

**Entry Points:**
- `client/App.tsx`: React application root, wraps with providers
- `client/index.js`: Expo entry point (imported by package.json main)
- `server/index.ts`: Express server initialization

**Configuration:**
- `app.json`: Expo app metadata (name, version, plugins)
- `package.json`: Dependencies, scripts, and project metadata
- `tsconfig.json`: TypeScript compiler options with path aliases
- `babel.config.js`: Babel preset for Expo
- `drizzle.config.ts`: Database ORM configuration (if in use)

**Core Logic:**
- `client/navigation/RootStackNavigator.tsx`: Navigation stack definition
- `client/context/ThemeContext.tsx`: Theme state management
- `client/lib/query-client.ts`: API client and data fetching setup
- `server/routes/clinicalTrials.ts`: External API integration

**Testing:**
- No test directory found; testing setup not detected in package.json

## Naming Conventions

**Files:**
- Screens: PascalCase with "Screen" suffix (e.g., DashboardScreen.tsx)
- Components: PascalCase (e.g., CategoryTile.tsx, ThemedText.tsx)
- Hooks: camelCase with "use" prefix (e.g., useTheme.ts, useBookmarks.ts)
- Utilities: camelCase (e.g., filterAssistiveTech.ts)
- Constants: UPPER_SNAKE_CASE for values (e.g., CATEGORIES, THEMES_STORAGE_KEY)
- Types: PascalCase with Type/Config suffix (e.g., MainStackParamList, ToolConfig)

**Directories:**
- Feature directories: lowercase with hyphens (e.g., screens/tools)
- Feature groupings: lowercase plural (e.g., components, hooks, screens, routes)
- Type groupings: named after content (e.g., constants, types, config)

## Where to Add New Code

**New Health Tool Screen:**
- Implementation: `client/screens/tools/ScreenNameScreen.tsx`
- Add route to: `client/navigation/RootStackNavigator.tsx`
- Add type to: `client/types/navigation.ts` (MainStackParamList)
- Add config to: `client/config/catalog.ts` (CATEGORIES array)
- Tests (if added): `client/screens/tools/__tests__/ScreenName.test.tsx`

**New Reusable Component:**
- Implementation: `client/components/ComponentName.tsx`
- Ensure theme-aware: Use ThemedView, ThemedText wrappers
- Export from component file, import as needed

**New API Endpoint:**
- Handler: `server/routes/featureName.ts`
- Registration: Add to `server/routes.ts` via registerRoutes()
- Middleware: Already set up in server/index.ts
- Client integration: Create hook or call via React Query

**New Utility Function:**
- Shared helpers: `client/utils/functionName.ts`
- API utilities: `client/lib/functionName.ts`
- Follow existing patterns (e.g., apiRequest, getApiUrl)

**New Constants:**
- Theme/UI constants: `client/constants/theme.ts`
- Hook utilities: `client/constants/hooks/hookName.ts`
- Configuration: `client/config/fileName.ts`

**New Context Provider:**
- Provider: `client/context/ContextNameContext.tsx`
- Wrap in App.tsx provider stack (client/App.tsx)
- Export custom hook for access (e.g., useContextName)

## Special Directories

**node_modules/:**
- Purpose: NPM dependencies (managed by package-lock.json)
- Generated: Yes
- Committed: No

**.expo/:**
- Purpose: Expo development cache and configuration
- Generated: Yes
- Committed: No

**static-build/:**
- Purpose: Pre-built Expo static assets for production
- Generated: Yes (via `npm run expo:static:build`)
- Committed: No

**attached_assets/:**
- Purpose: Generated images and assets (possibly from AI/third-party generation)
- Generated: Yes
- Committed: No

**.planning/:**
- Purpose: GSD planning documents (codebase analysis, phases, execution logs)
- Generated: Yes
- Committed: Yes (for reference)

**.claude/:**
- Purpose: Claude-specific commands and workflows
- Generated: No (user-managed)
- Committed: Yes (part of GSD setup)

---

*Structure analysis: 2026-01-25*
