# EventPulse Mobile

Attendee- and staff-facing React Native (Expo) app for the EventPulse event
ticketing platform. Discover events, buy tickets with Stripe, store tickets with
scannable QR codes, and (for staff) scan attendees in at the door.

Part of a three-repo system:

- **eventpulse-backend** — FastAPI + PostgreSQL REST API
- **eventpulse-web** — React organizer/admin dashboard
- **eventpulse-mobile** — this repo

## Stack

Expo SDK 52 (new architecture) · React Native 0.76 · TypeScript · React
Navigation v7 · Zustand · Axios · expo-secure-store · Stripe React Native ·
expo-camera · react-native-qrcode-svg · react-native-maps · expo-notifications.

## Getting started

```bash
npm install
cp .env.example .env          # then fill in the values
npm start                     # open in Expo Go, or a dev build
```

### Environment

Expo only exposes env vars prefixed with `EXPO_PUBLIC_` to the JS runtime:

| Variable                             | Description                                        |
| ------------------------------------ | -------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`           | Backend base URL (default `http://localhost:8000`) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key                        |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`    | Google Maps key (Android)                          |

> On a **physical device**, `localhost` resolves to the device itself. Point
> `EXPO_PUBLIC_API_BASE_URL` at your machine's LAN IP (e.g.
> `http://192.168.1.10:8000`) and make sure the backend allows that origin.

Start the backend first (`docker compose up -d` in `eventpulse-backend`).

## Scripts

| Command                           | Purpose                                       |
| --------------------------------- | --------------------------------------------- |
| `npm start`                       | Expo dev server                               |
| `npm run android` / `npm run ios` | Launch on device/emulator                     |
| `npm test`                        | Jest test suite                               |
| `npm run typecheck`               | `tsc --noEmit`                                |
| `npm run lint` / `npm run format` | ESLint / Prettier                             |
| `npm run generate-types`          | Regenerate API types from the running backend |

## Project layout

```
src/
  components/ui/     design-system primitives
  components/...      feature widgets (events, tickets)
  screens/<feature>/  route screens
  navigation/         RootNavigator, AuthStack, MainTabs, linking
  services/           Axios client + per-feature API services
  store/              Zustand stores (auth persisted to keychain)
  lib/                env, secure storage, stripe, notifications, camera
  theme/              design tokens
  types/              generated API types
```

## Quality bar

`npm run typecheck && npm run lint && npm run format:check && npm test` must pass
before every commit (also enforced in CI).
