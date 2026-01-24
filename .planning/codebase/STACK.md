# Technology Stack

**Analysis Date:** 2026-01-25

## Languages

**Primary:**
- TypeScript 5.9.2 - Server (`server/`) and client (`client/`) code
- JavaScript - Babel configuration and build scripts

**Secondary:**
- HTML - Landing page template in `server/templates/landing-page.html`
- CSS - StyleSheet via React Native

## Runtime

**Environment:**
- Node.js - Server runtime (specified in package.json as runtime environment)
- React Native 0.81.5 - Mobile app runtime via Expo
- Expo 54.0.30 - Development server and build system for React Native/web

**Package Manager:**
- npm - Version management via `package-lock.json`
- Lockfile: Present (`package-lock.json`)

## Frameworks

**Core:**
- React 19.1.0 - UI component framework (web and React Native)
- React Native 0.81.5 - Cross-platform mobile framework
- React DOM 19.1.0 - Web DOM rendering
- React Native Web 0.21.0 - React Native components on web

**Mobile Navigation:**
- @react-navigation/native 7.1.8 - Core navigation
- @react-navigation/native-stack 7.3.16 - Stack-based navigation
- @react-navigation/bottom-tabs 7.4.0 - Bottom tab navigation
- @react-navigation/elements 2.6.3 - Navigation utilities

**Server:**
- Express 4.21.2 - HTTP server and routing at `server/index.ts`
- http-proxy-middleware 3.0.5 - Proxy configuration for development

**State Management & Data Fetching:**
- @tanstack/react-query 5.90.7 - Data fetching, caching, and synchronization (configured in `client/lib/query-client.ts`)

**Database & ORM:**
- Drizzle ORM 0.39.3 - Type-safe SQL query builder
- drizzle-kit 0.31.4 - Schema management and migrations
- drizzle-zod 0.7.0 - Zod schema validation integration with Drizzle
- pg 8.16.3 - PostgreSQL client driver

**Validation:**
- Zod 3.24.2 - Runtime schema validation (used in `shared/schema.ts`)
- zod-validation-error 3.4.0 - Enhanced error messages for Zod

**Testing:**
- Not detected - No test framework (jest, vitest, etc.) in dependencies

**Build/Dev:**
- tsx 4.20.6 - TypeScript execution for Node
- esbuild - Mentioned in build scripts for bundling
- Metro - React Native bundler (via Expo)
- Babel 7+ - JavaScript transpiler (via babel-preset-expo and plugins)

## Key Dependencies

**Critical:**
- @tanstack/react-query 5.90.7 - Essential for server state management and clinical trials API communication
- Drizzle ORM 0.39.3 - Database abstraction layer with strong types via `shared/schema.ts`
- Express 4.21.2 - HTTP server backbone
- React Navigation stack - Required for app navigation architecture

**Native Modules:**
- react-native-reanimated 4.1.1 - Smooth animations and gestures
- react-native-gesture-handler 2.28.0 - Touch gesture support
- react-native-safe-area-context 5.6.0 - Safe area insets for notched devices
- react-native-screens 4.16.0 - Native screen handling
- react-native-keyboard-controller 1.18.5 - Keyboard interaction handling

**Infrastructure & Utils:**
- @react-native-async-storage/async-storage 2.2.0 - Local persistent storage via `client/lib/storage.ts`
- react-native-svg 15.12.1 - SVG rendering in React Native
- expo-location 19.0.8 - GPS/location services capability
- expo-notifications 0.32.15 - Push notification support
- expo-speech 14.0.8 - Text-to-speech capability
- ws 8.18.0 - WebSocket support

**Icons & UI:**
- @expo/vector-icons 15.0.2 - Expo icons library
- expo-blur 15.0.8 - Blur effect component
- expo-glass-effect 0.1.8 - Glassmorphism effects

## Configuration

**Environment:**
- EXPO_PACKAGER_PROXY_URL - Proxy URL for Expo packager (set in dev scripts)
- REACT_NATIVE_PACKAGER_HOSTNAME - Metro bundler hostname
- EXPO_PUBLIC_DOMAIN - Public domain for app access
- PORT - Server port (defaults to 5000)
- NODE_ENV - Development or production mode
- REPLIT_DEV_DOMAIN - Replit development domain (for Replit hosting)
- REPLIT_DOMAINS - List of Replit deployment domains

**Build:**
- `babel.config.js` - Babel configuration with module-resolver for path aliases
- `tsconfig.json` - TypeScript configuration with strict mode, path aliases (@/ and @shared/)
- `eslint.config.js` - ESLint configuration with Expo preset and Prettier integration
- `package.json` scripts - npm scripts for dev, build, and server operations

**Path Aliases:**
- `@/*` maps to `client/*`
- `@shared/*` maps to `shared/*`
- Configured in both `tsconfig.json` (TypeScript) and `babel.config.js` (runtime)

## Platform Requirements

**Development:**
- Node.js (LTS or current)
- npm
- Replit environment (implicit from env variables)

**Production:**
- Node.js runtime
- PostgreSQL database (configured via Drizzle schema in `shared/schema.ts`)
- Express server on port 5000 (or configured PORT)
- Static build artifacts from Expo (web and native)

**Build Artifacts:**
- `static-build/` directory - Contains Expo web build and manifests
- `server_dist/` - ESBuild output for server bundle

---

*Stack analysis: 2026-01-25*
