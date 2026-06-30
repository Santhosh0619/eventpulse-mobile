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

## Phase 2 — Authentication & User Management ✅ COMPLETE (PR #1)

Branch `feature/auth` → PR #1. Wired to backend `/auth` and `/users`.

- `services/authService.ts`: login, register, fetchCurrentUser, logout,
  forgotPassword, resetPassword, verifyEmail.
- `services/userService.ts`: getMyProfile, updateMyProfile, uploadAvatar
  (multipart FormData), updateFcmToken.
- Screens: Login (RHF validation, trim-tolerant email, error surfacing),
  Register (+ verify-email notice), ForgotPassword (no account enumeration),
  LockScreen (biometric gate), Profile (avatar, role/verified badges, biometric
  toggle, sign out w/ confirm), EditProfile (avatar picker + form).
- Biometric: `lib/biometric.ts` (expo-local-authentication). Opt-in flag in
  secure store. A persisted session is gated behind the LockScreen on launch
  when enabled — passwords are never stored.
- `authStore`: shared `AuthUser` type, `locked` state + `unlock()`; `hydrate()`
  reads the biometric flag and sets `locked`.
- UI: `Avatar` (image or initials), `lib/media.ts` (resolve relative media URLs),
  `components/forms/FormField` (RHF Controller + Input).
- Navigation: AuthStack (Login/Register/ForgotPassword); Profile tab →
  ProfileStack (ProfileHome/EditProfile); RootNavigator renders LockScreen.
- Tests (21 total): authService, userService, LoginScreen, authStore, Button.
- **Verification:** typecheck ✅, lint ✅, format ✅, 21 tests ✅, Metro bundle ✅,
  CI ✅.

## Phase 3 — Organizations ✅ COMPLETE (PR #2)

Branch `feature/organizations`. View-focused (creation/management stays on web).

- `services/orgService.ts`: listMine, get, listMembers, acceptInvitation.
- `types/organization.ts`: Organization, OrgWithRole, Member, OrgRole.
- Screens: `organizations/OrgListScreen` (FlatList + pull-to-refresh, role badges,
  empty/error states), `organizations/OrgDetailScreen` (org info, contact, active +
  pending members), `organizations/AcceptInvitationScreen` (deep-link target,
  accepts on mount, success/error).
- Reusable infra: `hooks/useAsync.ts` (mount fetch + reload + unmount-safe),
  `components/ui/EmptyState.tsx`.
- Navigation: org screens added to ProfileStack; "My organizations" link on
  ProfileScreen. Deep links wired in `linking.ts`:
  `eventpulse://invitations/:token/accept` → AcceptInvitation,
  `organizations` / `organizations/:orgId`.
- Tests (31 total): orgService, useAsync (+ prior auth/foundation).
- **Verification:** typecheck ✅, lint ✅, format ✅, 31 tests ✅, Metro bundle ✅.

## Phase 4 — Event Discovery ✅ COMPLETE (PR #3)

Branch `feature/events`. Attendee-facing discovery (organizer CRUD stays on web).

- `services/eventService.ts`: search (paginated + filters), featured, getById,
  getBySlug, getMedia, listCategories.
- `types/event.ts`: Event, Category, EventMedia, Paginated<T>, EventSearchParams.
- Components: `events/EventCard` (list + carousel variants), `events/CategoryChip`,
  `events/FilterSheet` (category + city, BottomSheet-based).
- Screens: `home/HomeScreen` (featured carousel, category chips, upcoming list),
  `discover/DiscoverScreen` (debounced search, filter sheet, infinite scroll),
  `discover/MapDiscoverScreen` (react-native-maps markers), `events/EventDetailScreen`
  (hero, date range, venue map, gallery, tickets CTA stub), `events/CategoryEventsScreen`.
- Navigation: Home & Discover tabs are now stacks (`HomeStack`, `DiscoverStack`)
  hosting EventDetail / CategoryEvents / MapDiscover; deep links added for
  `events/:eventId`, `categories/:categoryId`, `map`.
- `lib/datetime.ts` (date-fns formatting helpers).
- Tests (48 total): eventService, datetime, EventCard, useEventPagination (+ prior).
- jest: mock `@expo/vector-icons` (font load) + `react-native-maps` globally.
- Code-review fixes applied: (HIGH) platform-safe maps via `lib/maps.ts` +
  `lib/maps.native.ts` so web / native-module-absent builds degrade instead of
  crashing the bundle; (MEDIUM) extracted `hooks/useEventPagination.ts` with a
  generation token (drops stale in-flight loadMore on filter change) + id dedup,
  used by Discover & CategoryEvents; (LOW) removed Home→category dead `setFilters`
  side effect; (LOW) shared `EventDetailParams` type across stacks.
- **Verification:** typecheck ✅, lint ✅, format ✅, 48 tests ✅, Metro bundle ✅
  (react-native-maps resolves).

## Phase 5 — Ticketing & Orders ✅ COMPLETE (PR #4)

Branch `feature/ticketing`. Order pipeline (payment is Phase 6).

- `services/ticketService.ts`: listTypes, getAvailability.
- `services/orderService.ts`: place, listMine, get, cancel.
- `types/order.ts`: TicketType, TierAvailability, AvailabilityResponse, Order,
  OrderItem, OrderCreate, TicketSelection (money fields are strings).
- `components/tickets/TicketSelector.tsx`: bottom-sheet tier picker with quantity
  steppers (respects availability/max/on-sale), live subtotal.
- Screens: `checkout/OrderSummaryScreen` (review + place order),
  `checkout/ConfirmationScreen` (order placed/pending), `tickets/MyTicketsScreen`
  (orders list, pull-to-refresh — replaces placeholder),
  `tickets/OrderDetailScreen` (status, expiry countdown, cancel, Pay-now stub).
- `lib/money.ts` (Intl currency formatting), `lib/orderStatus.ts` (status→badge),
  `lib/datetime.formatCountdown`.
- Navigation: Tickets tab is now `TicketsStack` (TicketsMain + OrderDetail);
  checkout screens (OrderSummary/Confirmation/OrderDetail) registered in Home &
  Discover stacks so the flow stays in one stack. EventDetail "Get tickets" opens
  TicketSelector → OrderSummary → Confirmation.
- Tests (61 total): ticketService, orderService, money, formatCountdown,
  TicketSelector (+ prior).
- **Verification:** typecheck ✅, lint ✅, format ✅, 61 tests ✅, Metro bundle ✅.

## Phase 6a — Payments ✅ COMPLETE (PR #5)

Branch `feature/payments`. Stripe card payment for pending orders.

- `services/paymentService.ts`: createIntent(orderId) → client_secret.
- `App.tsx`: wrapped in `StripeProvider` (EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY).
- `screens/checkout/PaymentScreen.tsx`: createIntent → initPaymentSheet →
  presentPaymentSheet → poll order until webhook confirms → open OrderDetail.
  Degrades to "Payments unavailable" when no key is configured.
- OrderDetail "Pay now" → PaymentScreen; OrderDetail now auto-polls every 5s
  while pending so it flips to Confirmed after the webhook lands.
- Payment registered in Home/Discover/Tickets stacks (OrderDetail lives in all).
- Tests (63 total): paymentService, PaymentScreen happy path (+ prior).
- jest: mock `@stripe/stripe-react-native` with a STABLE useStripe object
  (fresh refs each render caused an infinite effect loop / OOM — fixed).
- **Verification:** typecheck ✅, lint ✅, format ✅, 63 tests ✅, Metro bundle ✅.

## Phase 6b — Tickets QR + Staff Check-in ✅ COMPLETE (PR #6)

Branch `feature/checkin`. Uses backend `GET /users/me/attendees` (backend PR #21).

- `services/attendeeService.ts`: listMine(eventId?), checkIn(ticketCode),
  getStats(eventId), listForEvent(eventId). `types/attendee.ts`.
- `screens/tickets/QRFullScreen`: ticket QR (react-native-qrcode-svg), boosts
  brightness to max while visible (expo-brightness), restores on exit.
- OrderDetail (confirmed): lists the buyer's tickets → tap → QRFull; "Used" badge
  for checked-in tickets.
- `screens/staff/QRScannerScreen`: expo-camera scans QR → checkIn + haptic, result
  sheet, "Scan next" + dashboard link.
- `screens/staff/CheckInDashboardScreen`: stats + rate bar + recent check-ins,
  auto-refresh every 5s.
- Navigation: QRFull in Home/Discover/Tickets stacks; QRScanner + CheckInDashboard
  in ProfileStack; "Staff check-in" entry on ProfileScreen.
- Tests (68 total): attendeeService, CheckInDashboard. jest mocks expo-camera +
  expo-brightness.
- **Verification:** typecheck ✅, lint ✅, format ✅, 68 tests ✅, Metro bundle ✅.

## Phase 7a — Reviews ✅ COMPLETE (PR #7)

Branch `feature/reviews`.

- `services/reviewService.ts`: list, getSummary, submit. `types/review.ts`.
- Components: `reviews/RatingStars` (display + interactive picker),
  `reviews/ReviewCard` (rating, title, comment, organizer response).
- Screens: `events/ReviewsScreen` (summary card with avg + count, review list,
  "Write a review"), `events/ReviewFormScreen` (star picker + title + comment).
- EventDetail: "Ratings & reviews" entry → ReviewsScreen.
- Navigation: Reviews + ReviewForm added to Home & Discover stacks.
- Tests (73 total): reviewService, ReviewFormScreen (validation + submit).
- **Verification:** typecheck ✅, lint ✅, format ✅, 73 tests ✅, Metro bundle ✅.

## Next: Phase 7b — Notifications (mobile)

notificationService (list, unreadCount, markRead, markAllRead); push via
expo-notifications (permission, register FCM token via PUT /users/me/fcm-token,
foreground/response handlers); NotificationCenterScreen (read/unread, swipe/tap to
read), tab badge (useNotificationStore), deep-link from notification tap.
