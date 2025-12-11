# Design Guidelines for Spinal Hub

## Project Context
Spinal Hub is a personal health and daily management application designed specifically for a **C5 quadriplegic user**. Accessibility, clarity, and simplicity are paramount. Every design decision must prioritize ease of use for users with limited fine motor control.

## Architecture Decisions

### Authentication
**No Authentication Required**
- This is a single-user, personal management app with local data storage
- Include a **Settings/Profile screen** with:
  - User-customizable display name
  - App preferences (theme selection, voice settings)
  - Accessibility options

### Navigation
**Stack-Only Navigation**
- Use React Navigation Native Stack
- Two primary screens:
  1. **Dashboard** (root)
  2. **CategoryDetail** (pushed from category selection)
- Navigation must be simple and predictable with clear back buttons
- Typed navigation params: `CategoryDetail` receives `{ category: string; title: string }`

## Screen Specifications

### 1. Dashboard Screen

**Purpose:** Primary hub for accessing all health and life management categories

**Layout:**
- **Header:** 
  - Transparent background
  - Title: "Spinal Hub"
  - Right button: Settings/Profile icon
  - Top inset: `insets.top + Spacing.xl`

- **Main Content Area:**
  - Scrollable root view (SafeAreaView)
  - 3-column grid layout of category tiles
  - Categories (in order):
    1. Daily Routine
    2. Health Tracking
    3. Care & Support
    4. Appointments
    5. Life Management
    6. Custom Tools
  - Bottom padding: `Spacing.xl` (no tab bar)

- **Floating Elements:**
  1. **Microphone Button** (bottom center)
     - Circular, large touch target (minimum 80x80pt)
     - Fixed position above bottom safe area
     - Position: bottom inset of `insets.bottom + Spacing.xl`
     - Pulse animation when listening state is active
     - Drop shadow specifications:
       - shadowOffset: { width: 0, height: 2 }
       - shadowOpacity: 0.10
       - shadowRadius: 2
  
  2. **Voice Status Bar** (conditionally rendered)
     - Appears above microphone when listening
     - Shows listening indicator or voice feedback text
     - Subtle background with text-to-speech output

**Components Needed:**
- CategoryTile (6 instances)
- VoiceButton (floating)
- Voice status indicator
- ThemedText components

**Safe Area Insets:**
- Top: `headerHeight + Spacing.xl`
- Bottom: `insets.bottom + Spacing.xl`
- Horizontal: `Spacing.xl`

### 2. Category Detail Screen

**Purpose:** Display tools and options within a selected category

**Layout:**
- **Header:**
  - Default navigation header (not transparent)
  - Title: Category name (dynamic)
  - Left button: Back button (automatic)
  - Top inset: Standard (header handles safe area)

- **Main Content Area:**
  - List view (FlatList or ScrollView)
  - Placeholder list items for future tools
  - Top padding: `Spacing.xl`
  - Bottom padding: `insets.bottom + Spacing.xl`

**Components Needed:**
- List items (placeholder)
- ThemedText components

**Safe Area Insets:**
- Top: `Spacing.xl` (header is opaque)
- Bottom: `insets.bottom + Spacing.xl`

## Design System

### Color Palette

**Light Theme:**
- Primary: Calming blue (#007AFF or similar accessible color)
- Background: White (#FFFFFF)
- Surface: Light gray (#F5F5F5)
- Text Primary: Dark gray/Black (#000000)
- Text Secondary: Medium gray (#666666)
- Border: Light gray (#E0E0E0)
- Success: Green (for positive health indicators)
- Warning: Orange (for reminders)
- Error: Red (for alerts)

**Dark Theme:**
- Primary: Lighter blue (accessible contrast)
- Background: True black (#000000) or dark gray (#121212)
- Surface: Dark gray (#1E1E1E)
- Text Primary: White (#FFFFFF)
- Text Secondary: Light gray (#B0B0B0)
- Border: Dark gray (#333333)
- Success/Warning/Error: Adjusted for dark mode contrast

### Typography

**Font Family:** System default (San Francisco on iOS)

**Sizes:**
- Title: 28-32pt (large, bold)
- Heading: 20-24pt (semibold)
- Body: 16-18pt (regular) - **larger than standard for accessibility**
- Caption: 14pt (regular)

**All text must meet WCAG AA contrast ratios (4.5:1 for normal text)**

### Spacing System
- xs: 4pt
- sm: 8pt
- md: 16pt
- lg: 24pt
- xl: 32pt
- xxl: 48pt

### Border Radius
- Small: 8pt (buttons, inputs)
- Medium: 12pt (cards, tiles)
- Large: 20pt (floating button)
- Full: 9999pt (circular elements)

### Component Specifications

#### Category Tile
- **Size:** Square or near-square, minimum 100x100pt touch target
- **Visual Design:**
  - Icon at top (Feather icons from @expo/vector-icons, 32-40pt size)
  - Label below icon (16-18pt, semibold)
  - Background: Surface color with subtle border
  - Border radius: Medium (12pt)
  - NO drop shadow (keep clean)
- **Interaction:**
  - Press animation: Scale down to 0.95 with opacity 0.8
  - Animated using Reanimated (smooth, 200ms duration)
  - Clear visual feedback on press
- **Accessibility:**
  - `accessibilityRole="button"`
  - `accessibilityLabel` with category name and hint: "Opens {category}"

#### Voice Button
- **Size:** 80x80pt minimum (large touch target)
- **Visual Design:**
  - Circular (border radius: full)
  - Primary color background
  - Microphone icon (white, 32pt)
  - Drop shadow (as specified above)
- **States:**
  - Default: Solid background
  - Listening: Pulse animation (scale 1.0 to 1.1, infinite loop, 1s duration)
  - Disabled: Reduced opacity (0.5)
- **Accessibility:**
  - `accessibilityLabel="Voice Control"`
  - `accessibilityRole="button"`
  - `accessibilityHint="Tap to start voice commands"`

#### Themed Text
- Automatically adapts color based on theme (light/dark)
- Supports variants: title, heading, body, caption
- All text must be selectable for screen reader compatibility

### Visual Design

**Icons:**
- Use Feather icons from `@expo/vector-icons` exclusively
- Icon suggestions for categories:
  - Daily Routine: `sun` or `home`
  - Health Tracking: `activity` or `heart`
  - Care & Support: `users` or `shield`
  - Appointments: `calendar`
  - Life Management: `briefcase` or `list`
  - Custom Tools: `tool` or `settings`

**No Custom Assets Required:**
- Use system icons for all UI elements
- NO decorative imagery
- Focus on clarity and functionality

### Interaction Design

**All touchable components must:**
1. Have a minimum 44x44pt touch target (Apple HIG)
2. Provide immediate visual feedback on press
3. Use scale/opacity animations (NOT color changes which may be subtle)
4. Have clear accessibility labels
5. Work with VoiceOver/TalkBack screen readers

**Gestures:**
- Single tap only (no swipes, long presses, or complex gestures)
- Large, easy-to-hit targets throughout

### Accessibility Requirements

**Critical for C5 Quadriplegic Users:**
1. **Large Touch Targets:** Minimum 80x80pt for primary actions
2. **High Contrast:** All text meets WCAG AA (4.5:1) or AAA (7:1) standards
3. **Screen Reader Support:**
   - All interactive elements have `accessibilityLabel`
   - All tiles have `accessibilityRole="button"`
   - Voice button has clear state announcements
4. **Voice Control:**
   - Primary interaction method
   - Text-to-speech feedback using `expo-speech`
   - Clear listening state indicators
5. **No Fine Motor Requirements:**
   - No drag gestures
   - No tiny buttons
   - No precise tapping required
6. **Keyboard/Switch Control Compatible:**
   - Proper focus order
   - All actions accessible via assistive technologies

**Voice System UX:**
- Microphone button always visible and accessible
- Clear visual + audio feedback when listening
- Voice status bar shows system state
- Text-to-speech confirms actions

### Theme System
- Support both light and dark modes
- User preference stored locally
- Smooth theme transitions
- `useTheme()` hook provides current theme throughout app
- All components must adapt to both themes automatically