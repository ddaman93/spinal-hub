# Codebase Concerns

**Analysis Date:** 2026-01-25

## Tech Debt

**Untyped props and generic `any` usage:**
- Issue: Multiple components use `any` type for props instead of properly typed interfaces
- Files:
  - `client/components/AssistiveTechLane.tsx` (lines 11-12): `items: any[]`, `navigation: any`
- Impact: Loss of type safety, makes refactoring dangerous, IDE autocomplete broken for these props
- Fix approach: Create proper TypeScript interfaces for all component props, extract navigation prop types to shared types file

**Silent error handling in API calls:**
- Issue: Network errors are caught and silently ignored with empty catch blocks
- Files:
  - `client/screens/ClinicalTrialsListScreen.tsx` (lines 94-95): `catch { // silent fail }`
  - `client/screens/DashboardScreen.tsx` (lines 98, 158): Empty catch blocks with no logging
- Impact: Users see empty states when APIs fail with no indication of what went wrong; hard to debug production issues
- Fix approach: Log errors to console/monitoring service and show user-friendly error messages in UI; implement proper error state management

**Hardcoded string IDs in storage initialization:**
- Issue: Routine task IDs are hardcoded as strings ("1", "2", etc.) without UUID generation
- Files: `client/lib/storage.ts` (lines 210-218)
- Impact: Risk of ID collisions if default routine tasks are modified or if users customize them
- Fix approach: Use `generateId()` function (already available in same file) for all initial task IDs

**Missing null-safety checks in API data mapping:**
- Issue: Data from clinical trials API is mapped with optional chaining but no validation of required fields
- Files:
  - `client/screens/ClinicalTrialsListScreen.tsx` (lines 62-83): Maps `data.studies` which may be undefined
  - `client/screens/DashboardScreen.tsx` (lines 133-147): Same issue with trial data mapping
- Impact: If API response format changes or data is missing, app may crash or display broken UI with undefined values
- Fix approach: Add validation using Zod schemas before mapping; handle missing required fields explicitly

**Type-unsafe navigation parameters:**
- Issue: Route parameters are passed without compile-time validation
- Files: `client/screens/DashboardScreen.tsx` (line 286): `navigation.navigate("ClinicalTrialsList", { trials: liveTrials })`
- Impact: Runtime errors if param types don't match; navigation type definitions may diverge from actual usage
- Fix approach: Ensure `MainStackParamList` is properly typed and enforce strict type checking in navigation calls

---

## Known Bugs

**Weather icon loading on web platform:**
- Symptoms: Weather icon may fail to load from OpenWeatherMap CDN if domain is blocked or network fails
- Files: `client/screens/DashboardScreen.tsx` (lines 206-211)
- Trigger: User with no weather API key configured, or OpenWeatherMap CDN blocked
- Workaround: Weather section won't show if `EXPO_PUBLIC_WEATHER_API_KEY` is not set; icon loads from external URL with no fallback

**Appointment date/time parsing assumes specific format:**
- Symptoms: Appointment sorting may fail or show appointments in wrong order
- Files: `client/lib/storage.ts` (line 258): `new Date(a.date + " " + a.time).getTime()`
- Trigger: If date/time format changes or user inputs non-standard date/time format
- Workaround: Currently working because app controls input format, but no validation on stored data

**AsyncStorage.getItem silently returns null on error:**
- Symptoms: User data loss on storage permission errors or disk space issues
- Files: `client/lib/storage.ts` (lines 99-107): Error caught but only logged, null returned
- Trigger: Storage quota exceeded, permissions revoked after install, or corrupted data
- Workaround: App gracefully handles null by using `|| []` pattern, but user unaware of data loss

---

## Security Considerations

**API credentials exposed in environment variables:**
- Risk: Weather API key visible in environment configuration with no validation that it exists
- Files: `client/screens/DashboardScreen.tsx` (line 81): `process.env.EXPO_PUBLIC_WEATHER_API_KEY`
- Current mitigation: Variable is prefixed with EXPO_PUBLIC_ indicating it's client-side safe, key is optional so missing key doesn't break app
- Recommendations:
  - Document that this is a public/free API key (not secret)
  - Add validation to warn if EXPO_WEATHER_API_KEY is not configured
  - Consider moving weather API calls to backend to avoid exposing keys

**No authentication/authorization on local storage:**
- Risk: Any code with access to AsyncStorage can read all user health data (medications, vitals, pain logs)
- Files: All storage accessed via `client/lib/storage.ts` without encryption
- Current mitigation: Data stored only on user's device, no backend sync yet
- Recommendations:
  - Encrypt sensitive health data before storing to AsyncStorage
  - Add user authentication to app before accessing sensitive data
  - When backend sync is added, ensure data is encrypted in transit and at rest

**No validation of clinical trials API response:**
- Risk: Malformed or injected data from clinicaltrials.gov could render arbitrary content
- Files:
  - `client/screens/ClinicalTrialsListScreen.tsx` (lines 54-93)
  - `client/screens/DashboardScreen.tsx` (lines 127-148)
- Current mitigation: Data comes from official gov API, unlikely to be compromised
- Recommendations:
  - Add Zod schema validation for all external API responses
  - Sanitize text fields before rendering (especially trial summaries)
  - Implement rate limiting on external API calls

**No error boundary coverage for specific screens:**
- Risk: Unhandled exceptions in data fetching could crash entire app
- Files: Error boundary exists (`client/App.tsx` line 34) but is at root level only
- Current mitigation: Root ErrorBoundary catches all exceptions
- Recommendations:
  - Add screen-level error boundaries for data-heavy screens
  - Implement better error recovery (retry mechanisms)

---

## Performance Bottlenecks

**Inefficient clinical trials data fetching:**
- Problem: Fetching full trials list on every dashboard focus, redundant API calls
- Files: `client/screens/DashboardScreen.tsx` (lines 108-169): useFocusEffect triggers fetch every time screen is focused
- Cause: `useFocusEffect` with hardcoded 24-hour TTL means repeated fetches within same session
- Improvement path:
  - Implement proper query caching with React Query (already imported but not used for trials)
  - Use `useQuery` hook instead of manual fetch logic
  - Extend cache TTL or use stale-while-revalidate pattern

**No pagination for large data sets:**
- Problem: All routine tasks, medications, and appointments loaded into memory at once
- Files: `client/lib/storage.ts` (all storage methods), screens that use them
- Cause: `getAll()` methods fetch entire collections without limits
- Improvement path:
  - Implement cursor-based pagination in storage layer
  - Load data in chunks as user scrolls
  - Add limit/offset parameters to storage query methods

**Unused React Query instance:**
- Problem: React Query imported and configured but not used for API calls
- Files:
  - `client/lib/query-client.ts`: QueryClient created with default options
  - `client/App.tsx` line 9-10: Provider added but no hooks used
- Cause: Manual fetch calls in components instead of useQuery/useMutation
- Improvement path:
  - Migrate all API calls to useQuery hooks
  - Leverage React Query's caching, deduplication, and background refetch
  - Remove manual state management for async operations

**Repeated AsyncStorage reads for same key:**
- Problem: Components read same storage key multiple times without caching results
- Files: Multiple screens call `storage.medications.getAll()`, `storage.vitals.getAll()` independently
- Cause: No global state management, each component fetches independently
- Improvement path:
  - Wrap storage access with React Query
  - Use Context API to share fetched data across screens
  - Implement app-level state cache

---

## Fragile Areas

**Clinical Trials data parsing:**
- Files:
  - `client/screens/ClinicalTrialsListScreen.tsx` (lines 62-83)
  - `client/screens/DashboardScreen.tsx` (lines 133-147)
- Why fragile: Deep optional chaining with no schema validation; assumes specific API response structure that could change
- Safe modification:
  - Create Zod schema for clinical trials API response
  - Add tests that validate against actual API responses
  - Handle missing fields explicitly rather than using `??` fallbacks everywhere
- Test coverage: No unit tests for data transformation logic; manual testing only

**Theme context and storage interaction:**
- Files: `client/context/ThemeContext.tsx`
- Why fragile: Reads from AsyncStorage but doesn't handle race conditions when toggle is called rapidly; theme preference type relies on string matching
- Safe modification:
  - Add debouncing to toggleTheme to prevent rapid sequential saves
  - Use proper enum or union type instead of string type guards
  - Add error recovery if saved theme is invalid
- Test coverage: No tests for theme persistence or toggle behavior

**Navigation type definitions vs. runtime reality:**
- Files:
  - `client/types/navigation.ts`
  - Various screens passing params to navigate()
- Why fragile: `undefined` used for all screen params, but some screens actually pass data (e.g., ClinicalTrialsList, CategoryDetail)
- Safe modification:
  - Update navigation types to accurately reflect what params each screen accepts
  - Use TypeScript strict mode to catch mismatches
  - Create integration tests verifying navigation calls match types
- Test coverage: No navigation flow tests

**Storage API promise handling:**
- Files: `client/lib/storage.ts` (all methods)
- Why fragile: All methods are async but some don't await on dependencies (e.g., `save()` after `getAll()` could race)
- Safe modification:
  - Add explicit tests for concurrent storage operations
  - Consider locking mechanism for write operations
  - Use transactions if upgrading to backend storage
- Test coverage: No concurrency tests; only success paths tested

---

## Scaling Limits

**Single-threaded AsyncStorage becoming bottleneck:**
- Current capacity: Works well for ~1000 items per collection (medications, vitals, etc.)
- Limit: Performance degrades significantly with >10,000 total items across all storage keys
- Scaling path:
  - Implement pagination in storage layer
  - Add date-based archiving (e.g., vitals older than 6 months moved to archive)
  - Migrate to backend database with proper indexing
  - Consider SQLite for better performance than AsyncStorage

**Clinical trials API rate limiting:**
- Current capacity: Manual refresh works but no automated sync
- Limit: If expanded to real-time updates, clinicaltrials.gov API will rate-limit requests
- Scaling path:
  - Implement exponential backoff for API retries
  - Add request queuing for multiple concurrent API calls
  - Cache aggressively on client side
  - Consider mirroring/syncing trials data to backend

**Navigation stack depth unbounded:**
- Current capacity: No issues with current flow, but no limits on nested navigation
- Limit: Could hit memory issues if deeply nested stacks created without cleanup
- Scaling path:
  - Add reset/popToTop navigation after certain actions
  - Monitor navigation stack depth in development
  - Implement maximum navigation history limit

---

## Dependencies at Risk

**Expo SDK version pinning:**
- Risk: Fixed to ~54.0.30 in package.json; major updates could break compatibility
- Files: `package.json` line 30
- Impact: Difficult to receive security patches without full upgrade; API changes in new Expo versions
- Migration plan:
  - Plan quarterly Expo upgrades during low-activity periods
  - Test thoroughly on staging before upgrading production
  - Create migration guide for major version changes

**React 19.1.0 early adoption:**
- Risk: React 19 is very recent; potential for edge cases and bugs
- Files: `package.json` line 49
- Impact: Less community support and documentation; potential performance regressions
- Migration plan:
  - Monitor React community for reported issues
  - Consider downgrading to React 18 LTS if critical bugs found
  - Add extra testing for React 19 specific features

**Outdated TypeScript version:**
- Risk: TypeScript ~5.9.2 is older; missing newer language features
- Files: `package.json` line 77
- Impact: Can't use newer TypeScript features for better type safety
- Migration plan:
  - Test TypeScript 5.10+ compatibility
  - Plan minor version upgrade quarterly
  - Document any breaking changes in upgrade process

---

## Missing Critical Features

**No offline-first architecture:**
- Problem: App requires network for clinical trials data; no queue for failed operations
- Blocks: Full functionality in offline scenarios; data loss if network fails mid-operation
- Workaround: Users must retry manual operations; clinical trials don't load

**No data encryption at rest:**
- Problem: Health data stored in plain text in AsyncStorage
- Blocks: HIPAA compliance if handling real patient data; privacy concerns with sensitive health info
- Workaround: Currently works for demo but inadequate for production healthcare app

**No user authentication:**
- Problem: No login system; app assumes single user per device
- Blocks: Multi-user scenarios, secure backend sync, audit trail
- Workaround: Currently acceptable for single-user demo

**No data backup/sync:**
- Problem: Data only exists on local device; loss if app uninstalled or device factory reset
- Blocks: Cross-device sync, cloud backup
- Workaround: Users must manually export data (not implemented)

**No analytics or usage tracking:**
- Problem: No visibility into how users interact with app
- Blocks: Data-driven feature prioritization, bug identification in the wild
- Workaround: Can only debug reported issues; no proactive monitoring

---

## Test Coverage Gaps

**API data transformation untested:**
- What's not tested: Clinical trials data mapping, field extraction, null handling
- Files:
  - `client/screens/ClinicalTrialsListScreen.tsx` (lines 62-83)
  - `client/screens/DashboardScreen.tsx` (lines 133-147)
- Risk: API response format changes cause silent data corruption or crashes
- Priority: **High** - affects data integrity and user experience

**Storage layer transaction safety:**
- What's not tested: Concurrent reads/writes, race conditions, error recovery
- Files: `client/lib/storage.ts` (all methods)
- Risk: Data inconsistency or corruption under concurrent operations
- Priority: **High** - increases as app scales

**Theme persistence and switching:**
- What's not tested: Theme toggle, AsyncStorage save/load, preference fallback
- Files: `client/context/ThemeContext.tsx`
- Risk: Users' theme preference lost, defaults don't work correctly
- Priority: **Medium** - affects UX but not critical functionality

**Error boundary behavior:**
- What's not tested: Error catching, fallback UI rendering, reset functionality
- Files:
  - `client/components/ErrorBoundary.tsx`
  - `client/components/ErrorFallback.tsx`
- Risk: Error states not properly handled; fallback UI may break
- Priority: **Medium** - affects app stability

**Navigation parameter types:**
- What's not tested: Navigation calls with correct/incorrect params, route matching
- Files: Multiple screen files and `client/types/navigation.ts`
- Risk: Runtime navigation errors, type mismatches
- Priority: **Medium** - causes crashes in edge cases

**Weather API integration:**
- What's not tested: Location permission flows, API failures, missing API key
- Files: `client/screens/DashboardScreen.tsx` (lines 70-105)
- Risk: Silent failures, unexpected null values, location permission issues
- Priority: **Low** - feature is non-critical but should work reliably

---

*Concerns audit: 2026-01-25*
