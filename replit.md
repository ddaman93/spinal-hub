# Spinal Hub

## Overview

Spinal Hub is a personal health and daily management mobile application built with Expo React Native and TypeScript. The app is specifically designed for a C5 quadriplegic user, making accessibility, clarity, and simplicity the primary design considerations.

The application serves as a centralized hub for managing daily routines, health tracking, care coordination, appointments, and life management tools. It follows a category-based organization with tools nested under each category.

## Recent Changes

- **December 2025:** Implemented full data persistence using AsyncStorage
- **December 2025:** Built 7 functional tool screens with accessible forms and delete actions
- **December 2025:** Added KeyboardAwareScrollViewCompat to all modal forms for keyboard avoidance
- **December 2025:** Replaced long-press gestures with explicit delete buttons (trash icons) for accessibility

## User Preferences

- Preferred communication style: Simple, everyday language
- Voice features: Removed per user request
- Accessibility: Large touch targets (80x80pt for primary actions), explicit delete buttons, no gesture-based interactions

## System Architecture

### Frontend Architecture

**Framework:** Expo React Native with TypeScript
- Uses Expo SDK 54 with React 19 and React Native 0.81
- React Navigation Native Stack for navigation (stack-only, no tab navigation)
- React Native Reanimated for smooth animations
- TanStack React Query for server state management

**Navigation Structure:**
- Dashboard screen (root) - 3-column grid of 6 category tiles
- CategoryDetail screen - shows tools within selected category
- Individual tool screens:
  - VitalsLogScreen - blood pressure, heart rate, temperature, oxygen, weight
  - PainJournalScreen - pain level 1-10 with body location
  - MedicationTrackerScreen - medication management and daily dose tracking
  - HydrationTrackerScreen - water intake with quick-add buttons
  - RoutineScreen - morning/evening routine checklists
  - AppointmentSchedulerScreen - appointment scheduling
  - EmergencyContactsScreen - emergency contact management with call button
- Settings screen accessible from Dashboard header

**Typed Navigation:**
```typescript
MainStackParamList = {
  Dashboard: undefined;
  CategoryDetail: { category: string; title: string };
  Settings: undefined;
  VitalsLog: undefined;
  PainJournal: undefined;
  MedicationTracker: undefined;
  HydrationTracker: undefined;
  MorningRoutine: undefined;
  EveningRoutine: undefined;
  AppointmentScheduler: undefined;
  EmergencyContacts: undefined;
}
```

**Component Architecture:**
- Themed components (ThemedView, ThemedText) for consistent styling
- Custom accessible components (Button, Card, CategoryTile)
- KeyboardAwareScrollViewCompat for all forms with text inputs
- Error boundary for graceful error handling
- Light/dark theme support via useTheme hook

**Accessibility Features:**
- Large touch targets (80x80pt for FABs, 48x48pt for action buttons)
- Explicit delete buttons with trash icons (no long-press required)
- KeyboardAwareScrollViewCompat for all modals to prevent keyboard occlusion
- High contrast colors for readability
- AccessibilityLabel and accessibilityRole on all interactive elements

**Design System:**
- Centralized theme constants in `client/constants/theme.ts`
- Spacing, Typography, Colors, BorderRadius tokens
- Primary colors: #007AFF (light) / #0A84FF (dark)
- iOS-inspired liquid glass visual design

### Backend Architecture

**Server:** Express.js with TypeScript
- RESTful API structure with routes prefixed by `/api`
- CORS configuration for Replit domains
- HTTP server setup for potential WebSocket support

**Storage Layer:**
- AsyncStorage for client-side persistent data (primary storage)
- Storage utility in `client/lib/storage.ts` with typed interfaces
- Drizzle ORM with PostgreSQL schema defined for future use

### Data Storage Solutions

**Client-Side (AsyncStorage) - Fully Implemented:**
- `@spinal_hub/vitals` - Vital signs entries
- `@spinal_hub/pain` - Pain journal entries
- `@spinal_hub/medications` - Medication definitions
- `@spinal_hub/medication_logs` - Daily medication tracking
- `@spinal_hub/hydration` - Water intake logs
- `@spinal_hub/routines/morning` - Morning routine tasks
- `@spinal_hub/routines/evening` - Evening routine tasks
- `@spinal_hub/routine_completions` - Routine completion tracking
- `@spinal_hub/appointments` - Scheduled appointments
- `@spinal_hub/emergency_contacts` - Emergency contact list
- `@spinal_hub/preferences` - User preferences (theme, daily goals)

**Server-Side:**
- Drizzle ORM with PostgreSQL schema defined
- User table for potential future authentication
- Currently using in-memory storage as default

### Authentication

No authentication is currently implemented. This is a single-user personal app with local data storage. The Settings screen provides user preferences without requiring login.

## External Dependencies

### Core Libraries
- **Expo SDK 54:** Mobile development framework
- **React Navigation 7:** Native stack navigation
- **TanStack React Query 5:** Async state management
- **Drizzle ORM 0.39:** Database toolkit (PostgreSQL schema)
- **Zod:** Schema validation

### UI/UX Libraries
- **React Native Reanimated 4.1:** Animation library
- **Expo Haptics:** Tactile feedback
- **react-native-keyboard-controller:** Keyboard avoidance
- **@expo/vector-icons (Feather):** Icon set

### Development Tools
- **tsx:** TypeScript execution for server
- **drizzle-kit:** Database migrations
- **ESLint + Prettier:** Code quality

### Database
- PostgreSQL via Drizzle ORM (schema defined, requires DATABASE_URL)
- AsyncStorage for client-side persistence (primary)

### Platform Support
- iOS, Android, and Web (single output)
- Replit deployment configuration included
