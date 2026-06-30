# EventPulse Mobile — Progress

Tracks build progress for the mobile repo. Backend and web are feature-complete;
mobile is being built per the project plan, phase by phase.

## Quality gate (run before every commit)

```
npm run typecheck && npm run lint && npm run format:check && npm test
```

## Phase 0 — Foundation ✅ COMPLETE

Bootstrap (initial commit on `main`, like the web repo's foundation).

- Expo SDK 52 (new architecture) + React Native 0.76 + TypeScript (strict).
- Dependencies installed via `expo install` for SDK-52 compatibility:
  React Navigation v7 (native/stack/bottom-tabs), Zustand, Axios,
  expo-secure-store, expo-camera, expo-image(-picker), expo-notifications,
  expo-local-authentication, expo-linking, expo-haptics, expo-brightness,
  react-native-maps, react-native-qrcode-svg/svg, @stripe/stripe-react-native,
  @react-native-async-storage/async-storage, react-hook-form, date-fns,
  @expo/vector-icons.
- Tooling: ESLint (@react-native) + Prettier, Jest (jest-expo) +
  @testing-library/react-native.
- Config: `app.json` (name/slug/scheme/splash/icon/plugins + permission strings),
  `eas.json` (dev/preview/production profiles), `tsconfig.json` (path alias
  `@/` → `src/`), `babel.config.js`, `jest.config.js` + `jest-setup.js`,
  `.gitignore` (secrets excluded), `.env.example` (EXPO_PUBLIC_ vars).
- `src/theme/` design tokens (violet palette, mirrors web).
- `src/lib/`: `env.ts`, `secureStorage.ts`.
- `src/services/api.ts`: Axios instance with token attach + single-flight 401
  auto-refresh + error normalization (mirrors web `api.ts`).
- `src/store/`: `authStore` (tokens in keychain via secure-store, `hydrate()` on
  launch), `eventStore`, `notificationStore`.
- `src/components/ui/`: Button, Input, Card, Badge, Spinner, BottomSheet, Screen.
- `src/navigation/`: `RootNavigator` (hydrate → auth vs. main), `AuthStack`,
  `MainTabs` (Home/Discover/Tickets/Profile with Ionicons), `linking.ts`
  (deep-link config, `eventpulse://` scheme), `types.ts`.
- Placeholder screens for the 4 tabs + Login (real ones built in later phases).
- CI: `.github/workflows/ci.yml` (typecheck, lint, format, test on Node 20).
- Docs: `CLAUDE.md`, `README.md`.

**Verification:** typecheck ✅, lint ✅ (0 warnings), format:check ✅,
8 tests ✅. `expo export` (Metro bundle) succeeds — all imports/aliases resolve.

### Deviations / notes

- Env vars use the `EXPO_PUBLIC_` prefix (Expo runtime requirement) rather than
  the bare `API_BASE_URL` shown in the plan; documented in `.env.example`/README.
- Tokens persist to the device keychain (expo-secure-store) + hydrate on launch,
  rather than the web's zustand/persist-to-localStorage.
- BottomSheet is Modal-backed (no gesture-drag) to stay dependency-light.

## Next: Phase 2 — Authentication & User Management (mobile)

Login (with biometric option), Register, ForgotPassword screens; authService;
ProfileScreen with avatar picker; wire RootNavigator to real auth state.
(Phase 1 in the plan is backend/web foundation; mobile auth work is the next
mobile milestone.)
