# Coding Conventions

**Analysis Date:** 2026-01-25

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Button.tsx`, `ThemedText.tsx`, `ErrorBoundary.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTheme.ts`, `useBookmarks.ts`, `useColorScheme.ts`)
- Utilities/helpers: camelCase (e.g., `storage.ts`, `filterAssistiveTech.ts`)
- Screens: PascalCase with "Screen" suffix (e.g., `DashboardScreen.tsx`, `SettingsScreen.tsx`)
- Data files: camelCase (e.g., `manualWheelchairProducts.ts`, `clinicalTrials.ts`)
- Route files: camelCase (e.g., `clinicalTrials.ts`)
- Types/interfaces: PascalCase (e.g., `ThemedTextProps`, `ButtonProps`, `ErrorBoundaryProps`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `STORAGE_KEYS`, `TRIALS_CACHE_KEY`, `CACHE_TTL`)

**Functions:**
- camelCase (e.g., `getGreeting()`, `toggle()`, `isSaved()`, `formatErrorDetails()`)
- Event handlers: `handle` prefix in camelCase (e.g., `handlePressIn()`, `handlePressOut()`, `handleCategoryPress()`, `handleRestart()`)
- Utility functions: descriptive camelCase (e.g., `generateId()`, `formatDate()`, `formatTime()`, `getAppName()`)

**Variables:**
- Local/state variables: camelCase (e.g., `bookmarks`, `loaded`, `weather`, `liveTrials`)
- Boolean flags: prefix with `is` or `has` (e.g., `isDark`, `loaded`, `disabled`, `isModalVisible`, `active`)
- Component props: camelCase (e.g., `onPress`, `children`, `style`, `disabled`)

**Types:**
- Component prop types: `[ComponentName]Props` (e.g., `ButtonProps`, `ThemedTextProps`, `ErrorFallbackProps`)
- Data types: PascalCase (e.g., `WeatherData`, `LiveTrial`, `BookmarkMap`)
- Union types: PascalCase (e.g., `VitalEntry`, `PainEntry`, `Medication`)

## Code Style

**Formatting:**
- Tool: Prettier (v3.6.2)
- Line length: Default Prettier settings
- Indentation: 2 spaces (inferred from codebase style)
- Quotes: Double quotes for strings
- Semicolons: Required at end of statements

**Linting:**
- Tool: ESLint 9.25.0 with Expo config
- Config: `eslint.config.js` - Uses ESLint flat config format
- Integration: `eslint-plugin-prettier` for Prettier integration
- Commands:
  ```bash
  npm run lint              # Check lint issues
  npm run lint:fix          # Auto-fix lint issues
  npm run check:format      # Check formatting
  npm run format            # Auto-format code
  ```

**TypeScript:**
- Strict mode: Enabled (`"strict": true` in tsconfig.json)
- Module resolution: ESLint import resolver for Node
- Type safety: Full type annotations for function parameters and returns

## Import Organization

**Order:**
1. External React/React Native imports (e.g., `import React from "react"`)
2. Third-party library imports (e.g., `import { View } from "react-native"`)
3. Navigation/library specific imports (e.g., `import { useNavigation } from "@react-navigation/native"`)
4. Expo imports (e.g., `import * as Location from "expo-location"`)
5. Custom hook imports (e.g., `import { useTheme } from "@/hooks/useTheme"`)
6. Component imports (e.g., `import { ThemedView } from "@/components/ThemedView"`)
7. Config/constant imports (e.g., `import { Spacing } from "@/constants/theme"`)
8. Type imports (e.g., `import type { MainStackParamList } from "@/types/navigation"`)

See `client/App.tsx` and `client/screens/DashboardScreen.tsx` for examples.

**Path Aliases:**
- `@/*` → `./client/*` (client-side code)
- `@shared/*` → `./shared/*` (shared code between client and server)

All imports use absolute path aliases rather than relative paths.

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (see `server/routes/clinicalTrials.ts`, `client/screens/DashboardScreen.tsx`)
- Console.error for logging errors (e.g., `console.error("Clinical trials fetch failed:", err)`)
- Silent failures with fallback values: `catch {}` blocks that return null or defaults
- Response status codes for API errors (e.g., `res.status(502)` for upstream errors)
- Error boundaries for React component errors (see `client/components/ErrorBoundary.tsx`)

**Example patterns:**
```typescript
// Try-catch with status response
try {
  const r = await fetch(url.toString());
  if (!r.ok) {
    return res.status(502).json({ message: "Error message" });
  }
} catch (err) {
  console.error("Operation failed:", err);
  return res.status(502).json({ message: "Failed message" });
}

// Silent failure with early return
try {
  const status = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return;
} catch {}

// Error Boundary component wrapping
<ErrorBoundary>
  <ErrorFallback error={error} resetError={resetError} />
</ErrorBoundary>
```

## Logging

**Framework:** Native `console` object

**Patterns:**
- `console.error()` for errors with context (e.g., `console.error("Clinical trials fetch failed:", err)`)
- `console.log()` for general output in server code (e.g., `const log = console.log` alias in `server/index.ts`)
- No logging framework used; all logging is direct console calls
- Log messages include context and operation name

**Example from server:**
```typescript
const log = console.log;
// ...
log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
log(`express server serving on port ${port}`);
```

## Comments

**When to Comment:**
- JSDoc/TSDoc comments for class components (see `ErrorBoundary.tsx` with explanation about error boundaries)
- Inline comments for non-obvious logic (see `DashboardScreen.tsx` with section markers like `/* ───────── weather ───────── */`)
- Section dividers using ASCII comment markers for visual organization
- Comments explaining why a pattern is used (especially for React-specific patterns)

**JSDoc/TSDoc:**
- Used for class components (see `ErrorBoundary` class methods)
- Used for prop types and component documentation
- Minimal usage overall; code is generally self-documenting

**Comment Styles:**
- Single-line: `// Comment`
- Multi-line: `/* Comment */`
- Section separators: `/* ────────────── section name ────────────── */`

## Function Design

**Size:** Functions are generally concise (10-50 lines)
- Utility functions: 5-15 lines
- Screen components: 100-300 lines (including styles)
- Helper functions: 10-30 lines
- Event handlers: 5-20 lines

**Parameters:**
- Explicit named parameters (avoid excessive arguments)
- Use object parameters for multiple related values (e.g., `{ req, res, landingPageTemplate, appName }`)
- Default values used where appropriate (e.g., `disabled = false`)

**Return Values:**
- Clear explicit returns
- Type annotations on returns
- Void for functions with side effects only
- Typed data for queries/handlers

**Example from Button component:**
```typescript
export function Button({
  onPress,
  children,
  style,
  disabled = false,
}: ButtonProps) {
  // Function body
  return (
    <AnimatedPressable>
      {/* JSX */}
    </AnimatedPressable>
  );
}
```

## Module Design

**Exports:**
- Named exports for components: `export function ComponentName() {}`
- Named exports for utilities: `export const storage = { ... }`
- Named exports for types: `export type TypeName = ...`
- Default exports rare; prefer named exports for clarity

**Barrel Files:**
- Not widely used in this codebase
- Direct imports from source files preferred
- Each file is a single responsibility module

**Example export patterns:**
```typescript
// Components
export function Button({ ... }: ButtonProps) { ... }

// Utilities
export const storage = { ... };

// Hooks
export function useTheme() { ... }

// Types
export type ButtonProps = { ... };
export type User = typeof users.$inferSelect;
```

---

*Convention analysis: 2026-01-25*
