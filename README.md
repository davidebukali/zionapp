# Tsiyon Mobile

> A modern, responsive social networking and real-time messaging mobile application built with React Native, Expo, and TypeScript.

Companion Backend: [davidebukali/zion-backend-php](https://github.com/davidebukali/zion-backend-php)

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Coding Patterns](#architecture--coding-patterns)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Backend Configuration](#backend-configuration)
  - [Running the App](#running-the-app)
- [Scripts & Quality Assurance](#scripts--quality-assurance)
- [Contributing Guidelines](#contributing-guidelines)

---

## Overview

**Tsiyon** is an iOS, Android, and Web mobile application delivering a rich social experience with threaded community posts, multi-media attachments, reactions, comments, and real-time instant messaging. It pairs with a Laravel API and Laravel Reverb WebSockets backend ([zion-backend-php](https://github.com/davidebukali/zion-backend-php)) to support high-performance live communication and optimistic client updates.

---

## Key Features

- 🔐 **Authentication & Session Management**
  - Registration, login, password recovery, and reset flows.
  - Secure credential & token storage via `expo-secure-store`.
  - Protected navigation groups via Expo Router layout guards.

- 📰 **Feed & Post Composer**
  - Rich community feed with pagination and pull-to-refresh.
  - Multi-media uploads (up to 10 images) with client-side hashing and compression.
  - Long-form posts (up to 3,000 characters) and poll attachments.
  - Content moderation and reporting workflows with dedicated bottom sheets.

- 💬 **Interactive Comments & Discussions**
  - Threaded comment hierarchies with real-time reaction updates.
  - Optimistic UI caching for instant feedback on interactions.

- ⚡ **Real-Time Direct Messaging**
  - Private chat rooms powered by Laravel Reverb and Laravel Echo WebSockets.
  - Real-time typing indicators with auto-expiring debouncing.
  - Rich chat media attachments (up to 4 images per message).
  - Unread indicators, message timestamps, and delivery statuses.

- 👤 **Profiles & Notifications**
  - User profile customization with avatar updates and bio editing.
  - In-app notification center for activity updates and direct messages.

- 🎨 **Adaptive Theming**
  - Dynamic Dark and Light theme palettes powered by React Native Paper.
  - Centralized layout tokens, typography, and curvature metrics defined in `assets/styles/theme.ts`.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile Framework** | [React Native 0.76](https://reactnative.dev/), [Expo SDK 52](https://docs.expo.dev/) |
| **Routing & Navigation** | [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict typing mode) |
| **State & API Layer** | [Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) |
| **Real-Time WebSockets** | [Laravel Echo](https://laravel.com/docs/broadcasting) + [Pusher JS](https://github.com/pusher/pusher-js) (Laravel Reverb integration) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **UI Components & Motion** | [React Native Paper](https://callstack.github.io/react-native-paper/), [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/), Gesture Handler |
| **Mock Server** | [json-server](https://github.com/typicode/json-server) |
| **Testing** | [Jest](https://jestjs.io/), [Jest Expo](https://docs.expo.dev/develop/unit-testing/), React Test Renderer |

---

## Architecture & Coding Patterns

The codebase adheres to strict engineering guidelines documented in `AGENTS.md`:

1. **Thin Screen Rule**:
   - Screen-level route files in `app/` are kept declarative and lean (typically under 100–150 lines).
   - Layouts delegate state, multi-step asynchronous operations, and mutations to dedicated custom hooks (`hooks/`).
   - Presentation logic is decomposed into modular subcomponents located under feature directories (`components/`).

2. **Feature Module Architecture (`features/<feature>/`)**:
   - `types.ts`: Pure TypeScript interfaces and declarations. Never contains runtime execution logic.
   - `utils.ts`: Pure helper functions, response normalizers, and optimistic cache update utilities.
   - `api.ts`: RTK Query slices defining endpoints, cache invalidations, and exported hooks.
   - **Dependency Injection**: Cache helpers in `utils.ts` receive the API slice as a parameter to avoid circular dependencies with `api.ts`.

3. **Strict Theme System**:
   - Screens and shared components reuse centralized layout, typography, and button styles from `globalStyles` in `assets/styles/theme.ts`.
   - Dynamic colors are injected via `useTheme()` tokens to ensure uniform dark/light mode behavior.

---

## Project Structure

```text
zion/
├── app/                  # Expo Router file-based route definitions
│   ├── (app)/            # Authenticated navigation routes (tabs, chat, profile)
│   ├── (auth)/           # Authentication routes (login, register, reset)
│   └── _layout.tsx       # Root layout provider & auth boundary
├── assets/               # Static assets & theme system
│   └── styles/theme.ts   # Design tokens & global stylesheet definitions
├── components/           # Presentation UI components grouped by feature
│   ├── Auth/             # Login/Register UI elements
│   ├── Comments/         # Comment list & composer components
│   ├── Messages/         # Chat threads, bubbles, and composer
│   └── Posts/            # Feed cards, composer, media picker, and report sheets
├── features/             # Modular business logic & RTK Query slices
│   ├── auth/             # Auth API, types, and token utilities
│   ├── comments/         # Comments slice and normalizers
│   ├── messages/         # Real-time chat RTK slice and optimistic utilities
│   ├── posts/            # Posts feed, composer mutations, and cache helpers
│   ├── theme/            # Theme preferences state
│   └── users/            # User profile and notification slices
├── hooks/                # Custom React hooks encapsulating business logic
├── services/             # WebSocket (Laravel Echo) and external services
├── store/                # Redux Toolkit root store configuration
├── utils/                # General formatting, file, and networking utilities
├── constants.ts          # Network hosts, Reverb keys, and application limits
└── AGENTS.md             # Project standards & architectural rules
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)
- [Expo Go](https://expo.dev/go) app (on physical iOS/Android device) OR Xcode Simulator / Android Studio Emulator

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/davidebukali/zion.git
cd zion
npm install
```

### Backend Configuration

The application communicates with the Laravel backend repository: [zion-backend-php](https://github.com/davidebukali/zion-backend-php).

1. **Connecting to Local or Remote Laravel Backend**:
   - Edit `constants.ts` to set your target server IP (e.g. `pece_ip` or LAN IP address).
   - Alternatively, pass environment variables via `.env`:
     ```bash
     EXPO_PUBLIC_REVERB_APP_KEY=your_reverb_app_key
     ```
   - In development, the app connects to port `80` (or `443` in production) with WebSocket broadcasting via Laravel Reverb.

2. **Using the Local Mock JSON Server**:
   - A mock REST endpoint is available for frontend-only development:
     ```bash
     npm run server
     ```
   - This starts `json-server` on `http://localhost:3000` using `db.json`.

### Running the App

Start the Expo development server:

```bash
npm start
```

From the terminal UI, press:
- `a` to open on an Android emulator or connected device.
- `i` to open on an iOS simulator.
- `w` to run in a web browser.

---

## Scripts & Quality Assurance

| Command | Description |
| :--- | :--- |
| `npm start` | Launches the interactive Expo development server |
| `npm run android` | Builds and runs the app on an Android device or emulator |
| `npm run ios` | Builds and runs the app on an iOS simulator |
| `npm run web` | Launches the web preview |
| `npm run server` | Starts the local `json-server` mock backend (`db.json`) |
| `npx tsc --noEmit` | Validates strict TypeScript compilation without emitting output |
| `npm test -- --watchAll=false` | Executes the Jest test suite |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## Contributing Guidelines

- **TypeScript Strictness**: Always ensure code passes `npx tsc --noEmit` before opening pull requests.
- **Unit Testing**: All helper utilities (`utils.ts`) must have corresponding test coverage in `utils.test.ts`. Run `npm test -- --watchAll=false` to confirm zero regressions.
- **Variable Naming**: Always use descriptive, intuitive identifiers. Single-letter variables are disallowed.
- **Architectural Reference**: For detailed rules on RTK Query cache updates, component separation, and styling consistency, refer to [AGENTS.md](file:///Users/serene/react-projects/zion/zion/AGENTS.md).
