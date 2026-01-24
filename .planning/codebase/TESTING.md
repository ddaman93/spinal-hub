# Testing Patterns

**Analysis Date:** 2026-01-25

## Test Framework

**Status:** No testing framework configured

**Runner:** Not installed
- Jest not found in devDependencies
- Vitest not found in devDependencies
- No test configuration files present

**Assertion Library:** Not applicable

**Run Commands:** No test commands configured
```bash
# No test scripts available in package.json
npm run test              # NOT AVAILABLE
npm run test:watch       # NOT AVAILABLE
npm run test:coverage    # NOT AVAILABLE
```

## Test File Organization

**Current State:** No test files exist

**Search Results:**
- No `*.test.ts` files in `client/` directory
- No `*.test.tsx` files in `client/` directory
- No `*.spec.ts` files in `server/` directory
- No `*.test.ts` files in `server/` directory

**Expected Location Pattern (if tests were added):**
- Unit tests: Co-located with source (e.g., `Button.test.tsx` next to `Button.tsx`)
- Integration tests: `client/__tests__/integration/` or `server/__tests__/integration/`
- Test utilities: `client/__tests__/utils/` or `shared/__tests__/`

## Test Structure

**Current Implementation:** None

**Recommended Structure (for future implementation):**
```typescript
describe("ComponentName", () => {
  describe("behavior description", () => {
    it("should do something specific", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Patterns to implement:**
- Given/When/Then style with clear setup/action/assertion phases
- One assertion per test concept (though multiple assertions acceptable if logically grouped)
- Descriptive test names that explain the behavior
- Use before/after hooks for common setup/teardown

## Mocking

**Current Status:** No mocking framework configured

**Recommended Framework (not yet installed):**
- Jest with built-in mocking capabilities or
- Vitest with MSW (Mock Service Worker) for API mocking

**What would need mocking:**
- AsyncStorage operations (e.g., `@react-native-async-storage/async-storage`)
- Navigation hooks (e.g., `useNavigation` from `@react-navigation/native`)
- API calls (e.g., fetch in `client/screens/DashboardScreen.tsx`, `server/routes/clinicalTrials.ts`)
- Location permissions (e.g., `expo-location`)
- Theme context (e.g., `ThemeProvider`, `useTheme`)

**What should NOT be mocked:**
- React hooks like `useState`, `useCallback`, `useEffect`
- Theme switching logic (integration test these with real context)
- Local utility functions like `generateId()`, `formatDate()`

## Fixtures and Factories

**Current Status:** No fixtures or test factories exist

**Where to place (recommended):**
- `client/__tests__/fixtures/` for client-side test data
- `server/__tests__/fixtures/` for server-side test data
- `shared/__tests__/fixtures/` for shared fixtures

**Data types needing fixtures:**
- `BookmarkMap` for bookmark tests
- `VitalEntry`, `PainEntry`, `Medication` (from `client/lib/storage.ts`)
- `LiveTrial` for clinical trials tests
- `WeatherData` for weather display tests
- Express Request/Response objects for server route tests

## Coverage

**Requirements:** None currently enforced

**Recommended targets (if implemented):**
- Statements: 70% minimum
- Branches: 60% minimum
- Functions: 70% minimum
- Lines: 70% minimum

**View coverage:**
```bash
# Would be configured after test framework setup
npm run test:coverage
```

## Test Types

**Unit Tests (recommended approach):**
- Scope: Individual functions, hooks, components
- Approach: Test behavior in isolation with mocks for dependencies
- Examples to test:
  - `useBookmarks` hook: `toggle()`, `isSaved()` functionality
  - Storage utilities: `generateId()`, `formatDate()`, `formatTime()`
  - Button component: press states, disabled states, animations
  - Error handling in API routes

**Integration Tests (recommended approach):**
- Scope: Multiple components or layers working together
- Approach: Test with real providers (theme, navigation, query client)
- Examples to test:
  - `DashboardScreen` with theme context and navigation
  - Clinical trials display with data fetching and caching
  - Medication/health tracking with storage persistence
  - Error boundary error catching and recovery

**E2E Tests (recommended for future):**
- Framework: Not currently configured
- Tools to consider: Detox (React Native), Cypress (web version)
- Would test: Full user flows like booking appointments, tracking medications

## Common Patterns

**Async Testing (recommended pattern):**
```typescript
it("should handle async operations", async () => {
  // Setup
  const mockData = { id: "1", title: "Test" };
  jest.spyOn(storage, "getAll").mockResolvedValue([mockData]);

  // Act
  const result = await storage.getAll();

  // Assert
  expect(result).toEqual([mockData]);
  expect(storage.getAll).toHaveBeenCalled();
});
```

**Error Testing (recommended pattern):**
```typescript
it("should handle errors gracefully", async () => {
  // Setup
  jest.spyOn(fetch, "mock").mockRejectedValue(new Error("Network error"));
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

  // Act
  const result = await getClinicalTrials({} as Request, {} as Response);

  // Assert
  expect(result.status).toBe(502);
  expect(consoleErrorSpy).toHaveBeenCalledWith("Clinical trials fetch failed:", expect.any(Error));
});
```

**Component Testing (recommended pattern):**
```typescript
it("should toggle bookmark state", () => {
  // Setup
  const { getByTestId } = render(
    <ThemeProvider>
      <BookmarkButton id="trial-1" />
    </ThemeProvider>
  );

  // Act
  fireEvent.press(getByTestId("bookmark-button"));

  // Assert
  expect(getByTestId("bookmark-button")).toHaveAttribute("aria-pressed", "true");
});
```

## Code Areas Needing Tests

**Critical functionality (high priority):**
- `client/hooks/useBookmarks.ts`: Bookmark persistence and toggle logic
- `client/lib/storage.ts`: All storage operations (vitals, medications, appointments)
- `server/routes/clinicalTrials.ts`: API integration and error handling
- `client/components/ErrorBoundary.tsx`: Error catching and recovery

**UI Components (medium priority):**
- `client/components/Button.tsx`: Press states, animations, disabled states
- `client/components/ThemedText.tsx`: Text type rendering and theme application
- `client/screens/DashboardScreen.tsx`: Data loading, caching, weather integration

**Utility functions (medium priority):**
- `client/utils/filterAssistiveTech.ts`: Filtering logic
- `client/lib/storage.ts`: `generateId()`, `formatDate()`, `formatTime()` utilities

**Server routes (medium priority):**
- `server/routes/clinicalTrials.ts`: Parameter handling, error responses
- `server/index.ts`: CORS setup, middleware chain

---

*Testing analysis: 2026-01-25*
