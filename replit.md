# Spinal Hub

## Overview

Spinal Hub is a personal health and daily management mobile application built with Expo React Native and TypeScript. The app is specifically designed for a C5 quadriplegic user, making accessibility, clarity, and simplicity the primary design considerations.

The application serves as a centralized hub for managing daily routines, health tracking, care coordination, appointments, and life management tools. It follows a category-based organization with tools nested under each category.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** Expo React Native with TypeScript
- Uses Expo SDK 54 with React 19 and React Native 0.81
- React Navigation Native Stack for navigation (stack-only, no tab navigation)
- React Native Reanimated for smooth animations
- TanStack React Query for server state management

**Navigation Structure:**
- Dashboard screen (root) - 3-column grid of category tiles
- CategoryDetail screen - shows tools within selected category
- Individual tool screens (VitalsLog, PainJournal, MedicationTracker, etc.)
- Settings screen accessible from Dashboard header

**Typed Navigation:**
```typescript
MainStackParamList = {
  Dashboard: undefined;
  CategoryDetail: { category: string; title: string };
  Settings: undefined;
  // Individual tool screens...
}
```

**Component Architecture:**
- Themed components (ThemedView, ThemedText) for consistent styling
- Custom accessible components (Button, Card, CategoryTile)
- Error boundary for graceful error handling
- Light/dark theme support via useTheme hook

**Design System:**
- Centralized theme constants in `client/constants/theme.ts`
- Spacing, Typography, Colors, BorderRadius tokens
- iOS-inspired visual design

### Backend Architecture

**Server:** Express.js with TypeScript
- RESTful API structure with routes prefixed by `/api`
- CORS configuration for Replit domains
- HTTP server setup for potential WebSocket support

**Storage Layer:**
- In-memory storage implementation (`MemStorage` class)
- Storage interface (`IStorage`) for dependency injection
- AsyncStorage for client-side persistent data (health records, preferences, etc.)

### Data Storage Solutions

**Client-Side (AsyncStorage):**
- Health vitals, pain entries, medications
- Routine tasks and completions
- Appointments, emergency contacts
- User preferences

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
- **Expo Speech:** Text-to-speech for voice feedback
- **@expo/vector-icons (Feather):** Icon set

### Development Tools
- **tsx:** TypeScript execution for server
- **drizzle-kit:** Database migrations
- **ESLint + Prettier:** Code quality

### Database
- PostgreSQL via Drizzle ORM (schema defined, requires DATABASE_URL)
- AsyncStorage for client-side persistence

### Platform Support
- iOS, Android, and Web (single output)
- Replit deployment configuration included