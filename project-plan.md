# CortexPDF — Master Architecture & Development Blueprint

> Production-grade PDF ecosystem built with Expo + React Native.
>
> Goal: Lightweight, highly animated, scalable, centralized, maintainable, offline-first, premium-feel PDF experience.

---

# 1. PRODUCT VISION

CortexPDF is NOT just a PDF reader.

It is a:

- Premium productivity app
- AI-powered document workspace
- Fast and lightweight reading experience
- Modern PDF utility ecosystem

The app should feel:

- Extremely smooth
- Minimal
- Lightweight
- Fast
- Elegant
- Calm
- Highly polished

Core philosophy:

> “Powerful without feeling heavy.”

---

# 2. PRIMARY GOALS

## Functional Goals

- Open PDFs instantly
- Smooth reading experience
- Offline-first architecture
- AI-powered summaries
- Smart document management
- File utilities
- Annotation tools
- Cross-platform compatibility

---

## Technical Goals

- Scalable architecture
- Centralized logic
- Reusable systems
- Clean folder structure
- Production-ready code
- Easy future expansion
- Low memory usage
- Optimized rendering

---

## UX Goals

- Minimal interface
- Clean typography
- Soft animations
- Responsive gestures
- Lightweight transitions
- Fast interactions

---

# 3. CORE DEVELOPMENT RULES

These rules MUST be followed throughout development.

---

## RULE 1 — NO BUSINESS LOGIC INSIDE UI

BAD:

```tsx
<Button onPress={() => generateSummary(pdf)} />
```

GOOD:

```tsx
<Button onPress={handleGenerateSummary} />
```

All business logic must live inside:

- services
- hooks
- stores
- feature modules

---

## RULE 2 — CENTRALIZED SERVICES

Never duplicate:

- AI logic
- database logic
- storage logic
- caching logic
- file handling
- permission handling

All shared logic must be centralized.

Example:

```txt
src/services/ai/
src/services/storage/
src/services/file/
```

---

## RULE 3 — FEATURE-BASED ARCHITECTURE

Every major feature should be isolated.

Example:

```txt
src/features/highlights/
```

Should contain:

```txt
components/
hooks/
services/
utils/
types/
store/
```

---

## RULE 4 — REUSABLE COMPONENTS ONLY

Never create duplicate UI.

Create reusable:

- buttons
- cards
- sheets
- headers
- modals
- toolbars
- list items

---

## RULE 5 — PERFORMANCE FIRST

Every feature should be built with optimization in mind.

Always ask:

- Will this re-render unnecessarily?
- Is this animation expensive?
- Is this memory efficient?
- Can this be lazy-loaded?
- Can this be cached?

---

# 4. FINAL TECH STACK

# CORE

## Framework

- Expo SDK Latest
- React Native
- TypeScript

---

## Navigation

- Expo Router

Reason:

- File-based routing
- Cleaner scaling
- Better maintainability

---

## State Management

- Zustand

Reason:

- Lightweight
- Minimal boilerplate
- Scalable
- Fast
- Centralized

---

## Storage

### MMKV

Use for:

- settings
- preferences
- theme
- lightweight cache
- app config

### SQLite

Use for:

- bookmarks
- recents
- AI summaries
- annotations
- tabs metadata

---

## Animations

- React Native Reanimated
- React Native Gesture Handler

---

## File Handling

- expo-file-system
- expo-document-picker
- expo-sharing

---

## PDF Rendering

- react-native-pdf

---

## Styling

Recommended:

- NativeWind

Reason:

- Fast development
- Lightweight
- Utility-based
- Easy maintenance

---

## AI Layer

Must use abstraction layer.

NEVER directly call AI provider from UI.

Architecture:

```txt
UI
↓
Feature Hook
↓
AI Service
↓
Provider Adapter
↓
OpenAI / Gemini
```

---

# 5. PROJECT FOLDER STRUCTURE

```txt
src/
│
├── app/
│   ├── (tabs)/
│   ├── reader/
│   ├── ai/
│   ├── settings/
│   ├── onboarding/
│   └── modals/
│
├── components/
│   ├── common/
│   ├── cards/
│   ├── sheets/
│   ├── buttons/
│   ├── inputs/
│   ├── lists/
│   ├── reader/
│   └── animations/
│
├── features/
│   ├── recents/
│   ├── bookmarks/
│   ├── highlights/
│   ├── tabs/
│   ├── ai-summary/
│   ├── search/
│   ├── annotations/
│   └── utilities/
│
├── services/
│   ├── ai/
│   ├── storage/
│   ├── database/
│   ├── pdf/
│   ├── analytics/
│   ├── file/
│   └── permissions/
│
├── store/
│   ├── app.store.ts
│   ├── reader.store.ts
│   ├── ai.store.ts
│   ├── tabs.store.ts
│   └── settings.store.ts
│
├── hooks/
│
├── theme/
│
├── utils/
│
├── constants/
│
├── types/
│
├── database/
│
├── assets/
│
└── config/
```

---

# 6. ARCHITECTURE DESIGN

# CLEAN ARCHITECTURE FLOW

```txt
UI Layer
↓
Feature Layer
↓
Service Layer
↓
Storage/API Layer
```

---

# UI LAYER

Contains:

- screens
- components
- animations
- layouts

Responsibilities:

- display data
- user interactions
- rendering

Should NOT contain:

- API logic
- database logic
- AI logic
- storage logic

---

# FEATURE LAYER

Contains:

- feature hooks
- feature state
- orchestration logic

Example:

```txt
features/ai-summary/
```

Responsibilities:

- coordinate feature flow
- transform data
- connect UI to services

---

# SERVICE LAYER

Contains:

- AI services
- storage services
- database services
- utility services

Responsibilities:

- reusable business logic
- centralized operations

---

# STORAGE/API LAYER

Contains:

- SQLite operations
- file system operations
- AI provider adapters

---

# 7. UI/UX SYSTEM

# DESIGN LANGUAGE

Inspired by:

- Apple Books
- Notion
- Arc Browser
- Readwise

---

# VISUAL STYLE

Use:

- soft surfaces
- large spacing
- rounded corners
- subtle gradients
- floating elements
- minimal shadows

Avoid:

- clutter
- strong borders
- heavy effects
- flashy UI

---

# ANIMATION PHILOSOPHY

Goal:

> “Animation should be felt, not noticed.”

Use:

- spring animations
- shared transitions
- gesture-based movement
- opacity fades
- subtle scaling

Avoid:

- heavy blur
- excessive parallax
- long transitions
- flashy animations

---

# 8. PERFORMANCE STRATEGY

# PERFORMANCE IS PRIORITY

The app must feel:

- instant
- responsive
- smooth

---

## MUST FOLLOW

### Lazy Load Screens

```tsx
const ReaderScreen = lazy(() => import(...))
```

---

### Avoid Re-renders

Use:

- memo
- shallow selectors
- derived state
- optimized hooks

---

### PDF Optimization

- progressive page loading
- thumbnail caching
- memory cleanup on exit
- release inactive pages

---

### Asset Optimization

Use:

- WebP
- optimized SVGs
- compressed assets

Avoid:

- huge PNGs
- unnecessary fonts

---

### Animation Optimization

Keep animations:

- native-driven
- GPU-friendly
- lightweight

Avoid:

- layout-heavy animations
- excessive shadows
- constant repaints

---

# 9. DATABASE ARCHITECTURE

# SQLITE TABLES

## recent_files

```sql
CREATE TABLE recent_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT,
  name TEXT,
  size TEXT,
  last_opened TEXT,
  is_pinned INTEGER DEFAULT 0
);
```

---

## bookmarks

```sql
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pdf_id TEXT,
  page INTEGER,
  label TEXT,
  created_at TEXT
);
```

---

## ai_summaries

```sql
CREATE TABLE ai_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_hash TEXT,
  summary TEXT,
  created_at TEXT
);
```

---

## annotations

```sql
CREATE TABLE annotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pdf_id TEXT,
  page INTEGER,
  type TEXT,
  data TEXT,
  created_at TEXT
);
```

---

# 10. STATE MANAGEMENT PLAN

# GLOBAL STORES

## app.store.ts

Contains:

- theme
- onboarding
- app status
- global loading

---

## reader.store.ts

Contains:

- current pdf
- current page
- zoom state
- reader settings

---

## ai.store.ts

Contains:

- summaries
- loading state
- errors
- cache state

---

## tabs.store.ts

Contains:

- opened tabs
- active tab
- recent tab state

---

# 11. CORE FEATURES ROADMAP

# PHASE 1 — FOUNDATION

## Goals

- Setup architecture
- Setup navigation
- Setup theme system
- Setup database
- Setup file system
- Setup reusable UI

---

# PHASE 2 — CORE PDF SYSTEM

## Features

- Open PDF
- Recent files
- Pin files
- Search files
- File info
- Reader screen
- Zoom support
- Page navigation
- Dark mode

---

# PHASE 3 — ADVANCED READER

## Features

- Drawing
- Highlighting
- Notes
- Undo/Redo
- Floating toolbar
- Smart gestures
- Thumbnail navigation

---

# PHASE 4 — AI FEATURES

## Features

- AI Summary
- Summary cache
- Regenerate summary
- Ask PDF
- Key point extraction
- AI insights

---

# PHASE 5 — PDF UTILITIES

## Features

- Merge PDF
- Compress PDF
- PDF to image
- Image to PDF
- Word to PDF

---

# PHASE 6 — CLOUD & SYNC

## Features

- Backup
- Cloud sync
- Multi-device sync
- Workspace support

---

# 12. AI SYSTEM DESIGN

# IMPORTANT

AI should NEVER block UI.

---

# FLOW

```txt
PDF Selected
↓
Extract Text
↓
Chunk Processing
↓
AI Service
↓
Cache Response
↓
Display Summary
```

---

# AI RULES

- cache summaries locally
- regenerate manually only
- stream responses if possible
- avoid repeated API calls
- optimize token usage

---

# 13. OFFLINE-FIRST STRATEGY

Everything should work offline except AI.

---

## LOCAL-FIRST FEATURES

- recent files
- bookmarks
- annotations
- tabs
- highlights
- settings
- summaries cache

---

# 14. ERROR HANDLING SYSTEM

# NEVER CRASH APP

Use:

- safe async wrappers
- error boundaries
- fallback UI
- retry logic

---

# LOGGING

Recommended:

- Sentry

Track:

- crashes
- rendering issues
- memory issues
- API failures

---

# 15. SECURITY STRATEGY

# NEVER EXPOSE API KEYS

Use:

- backend proxy
  OR
- edge functions

---

# FILE SECURITY

- request permissions only when required
- sanitize file paths
- validate imported files

---

# 16. CODE QUALITY RULES

# NAMING CONVENTIONS

## Components

```txt
PdfCard.tsx
ReaderToolbar.tsx
```

---

## Hooks

```txt
usePdfReader.ts
useAiSummary.ts
```

---

## Stores

```txt
reader.store.ts
```

---

## Services

```txt
summary.service.ts
pdf.service.ts
```

---

# IMPORT RULES

BAD:

```tsx
../../../components
```

GOOD:

```tsx
@/components
```

---

# TYPESCRIPT RULES

- avoid any
- use proper typing
- centralized types
- feature-specific types

---

# 17. BUILD OPTIMIZATION

# ANDROID

- Hermes enabled
- Proguard enabled
- minify release builds

---

# ASSET OPTIMIZATION

- remove unused fonts
- compress assets
- tree-shake dependencies

---

# BUNDLE SIZE STRATEGY

Avoid:

- heavy UI libraries
- unnecessary dependencies
- duplicate packages

---

# 18. TESTING STRATEGY

# TEST TYPES

## Unit Testing

Test:

- utilities
- services
- hooks

---

## Integration Testing

Test:

- feature workflows
- database interactions
- file handling

---

## Manual QA

Check:

- animation smoothness
- memory usage
- startup speed
- gesture responsiveness

---

# 19. FUTURE SCALABILITY

# PLANNED FEATURES

- OCR scanning
- AI notes
- AI chat with PDFs
- voice summaries
- collaborative annotations
- cloud workspace
- smart folder system
- reading analytics

---

# 20. DEVELOPMENT EXECUTION ORDER

# STEP 1 — FOUNDATION

Build:

- Expo setup
- TypeScript config
- folder architecture
- theme system
- navigation
- reusable UI

---

# STEP 2 — CORE SYSTEMS

Build:

- SQLite layer
- MMKV layer
- file handling
- permissions
- PDF rendering

---

# STEP 3 — READER EXPERIENCE

Build:

- reader UI
- gestures
- zoom
- page navigation
- recents
- bookmarks

---

# STEP 4 — ADVANCED FEATURES

Build:

- highlights
- notes
- drawing
- toolbar system

---

# STEP 5 — AI SYSTEM

Build:

- summary engine
- caching system
- AI abstraction layer
- streaming support

---

# STEP 6 — UTILITIES

Build:

- merge PDF
- compress PDF
- converters

---

# STEP 7 — OPTIMIZATION

Optimize:

- startup speed
- animations
- memory usage
- render performance

---

# STEP 8 — POLISH

Polish:

- transitions
- haptics
- UX microinteractions
- onboarding
- empty states

---

# 21. PACKAGE INSTALLATION PLAN

```bash
npx create-expo-app CortexPDF

npx expo install expo-router
npm install zustand
npm install nativewind
npm install react-native-reanimated
npm install react-native-gesture-handler
npm install react-native-pdf
npm install react-native-mmkv

npx expo install expo-file-system
npx expo install expo-document-picker
npx expo install expo-sharing
npx expo install expo-sqlite
```

---

# 22. FINAL PRODUCT PHILOSOPHY

CortexPDF should feel like:

- A premium app
- A polished ecosystem
- A modern productivity tool
- A smooth reading workspace

NOT:

- a cluttered utility app
- a feature dump
- a heavy Android-style PDF reader

---

# 23. MOST IMPORTANT RULE

DO NOT build randomly.

Always build in this order:

1. Architecture
2. Foundation
3. Reusable systems
4. Core features
5. Advanced features
6. Optimization
7. Polish
8. Production hardening

---

# 24. FINAL DEVELOPMENT MINDSET

Every feature should satisfy:

- scalable
- centralized
- maintainable
- reusable
- optimized
- production-ready
- lightweight
- smooth
- future-proof

---

# 25. END GOAL

The final CortexPDF experience should make users feel:

> “This app feels incredibly smooth, clean, and premium.”
