# EventPulse Mobile

## Project

Attendee- and staff-facing mobile app for EventPulse. Talks to the
`eventpulse-backend` REST API; it does not share source with the backend or web.
Attendees discover events, buy tickets, and show QR codes; staff scan QR codes to
check attendees in.

Tech: React Native + Expo (SDK 52, new architecture), TypeScript, React
Navigation v7 (stack + bottom tabs), Zustand state, Axios, expo-secure-store for
tokens, Stripe React Native SDK, expo-camera for QR scanning,
react-native-qrcode-svg for QR display, react-native-maps, expo-notifications +
FCM for push. Testing: Jest (jest-expo preset) + @testing-library/react-native.
Lint/format: ESLint (@react-native config) + Prettier.

## Architecture

- `src/components/ui/` — design-system primitives (Button, Input, Card, Badge,
  Spinner, BottomSheet, Screen). Presentational only, no data fetching.
- `src/components/events/`, `src/components/tickets/` — feature widgets
  (EventCard, QRCodeDisplay, TicketSelector, ...). Added per phase.
- `src/screens/<feature>/` — route screens, one folder per domain (auth, home,
  discover, events, tickets, checkout, profile, organizations, notifications,
  staff).
- `src/navigation/` — `RootNavigator` (auth vs. main switch), `AuthStack`,
  `MainTabs` (Home/Discover/Tickets/Profile), `linking.ts` (deep links), `types.ts`.
- `src/services/` — API layer. `api.ts` is the shared Axios instance (auth header,
  401 auto-refresh, error normalization). One `<feature>Service.ts` per domain;
  screens call services, never axios directly. Mirrors the web service layer.
- `src/store/` — Zustand stores. `authStore` persists tokens to the device
  keychain via expo-secure-store and hydrates on launch.
- `src/lib/` — framework helpers (`env`, `secureStorage`, and later `stripe`,
  `notifications`, `camera`).
- `src/theme/` — design tokens (colors, spacing, radii, typography). Mirrors the
  web palette (violet primary).
- `src/types/api.ts` — generated from the backend OpenAPI spec
  (`npm run generate-types`, backend must be running).

## Conventions

- TypeScript everywhere; `strict` on; no `any` without justification.
- Path alias `@/` → `src/` (resolved by both tsc and Metro).
- Styling via `StyleSheet.create` + theme tokens; no hard-coded colors.
- Functional components + hooks only.
- Every feature ships with tests (`*.test.ts(x)` colocated). Cover render, key
  interactions, store logic, and error/loading states.
- Env vars must be prefixed `EXPO_PUBLIC_` to reach the runtime; read them via
  `src/lib/env.ts`, never `process.env` directly in components.

## Commands

- `npm start` — Expo dev server (open in Expo Go or a dev build).
- `npm run android` / `npm run ios` — start on a device/emulator.
- `npm test` / `npm run test:watch` — Jest.
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run format` / `npm run format:check` — Prettier.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run generate-types` — regenerate `src/types/api.ts` from the running backend.

## Quality bar (must pass before every commit)

`npm run typecheck && npm run lint && npm run format:check && npm test` all green.

## Git

- One feature per branch (`feature/<name>`); never commit features directly to
  `main`. (The Phase 0 foundation was the initial bootstrap commit.)
- Commit format: `type(scope): description` (feat, fix, chore, refactor, test, docs).
- All PRs: tests pass, lint clean, code review.

## Secrets

- Never commit `.env`, `firebase-credentials.json`, or `stripe-keys.txt`
  (all gitignored). Only `.env.example` is committed.

## Mobile-only rules

- Mobile files ONLY live here. No backend or web code in this repo.
- On a physical device, `localhost` points at the device — set
  `EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP to reach the backend.
