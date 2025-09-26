# Safe Space Finder (React Native + Expo)

Discover inclusive businesses and safe spaces. This mobile app provides search, maps, reviews, ratings, offline support, advanced form validation, and push notifications.

## Tech Stack
- Expo (SDK 54) / React Native 0.81
- TypeScript (strict)
- React Navigation (stack + bottom tabs)
- React Native Paper (UI components)
- Expo Notifications, Device, Location, Linear Gradient, Haptics
- AsyncStorage + custom OfflineManager (request queue + cache)
- Formik + Yup (advanced validation)
- Swipe List (react-native-swipe-list-view)

## Key Features
| Area | Details |
|------|---------|
| Authentication | Login / Register (Formik + Yup, password strength) |
| Business Discovery | Home + list + map + detail + reviews |
| Swipe Actions | Like / Bookmark / Share with haptics |
| Progressive Loading | Skeletons, low→high res images, optimistic UI |
| Offline Support | Network listener, cached GETs, queued POST/PUT/DELETE |
| Push Notifications | Permission handling, categories, scheduled local notifications |
| Performance | Lazy lists, memoization, bundle init safety timer |
| Accessibility | Semantic components, high-contrast colors, descriptive actions |

## Repository Structure
```
src/
  components/        Reusable UI + UX helpers (skeletons, swipe list, rating, etc.)
  navigation/        TabNavigator
  screens/           Feature screens (Home, Map, BusinessDetail, Demo, etc.)
  services/          NotificationService, OfflineManager
IMPROVEMENTS_16-20_SUMMARY.md  Detailed changelog for latest enhancement batch
App.tsx              Root bootstrap (splash, theme, navigation, notifications)
app.json             Expo config (OTA disabled for dev stability)
```

## Prerequisites
- Node.js >= 18 LTS
- npm >= 9
- Expo CLI (optional global): `npm i -g expo-cli`
- Physical device with Expo Go (recommended) OR fully installed Android/iOS SDK/emulator

## Getting Started
```bash
# Clone
git clone https://github.com/unpairedelectron/Safe-Space-Finder.git
cd Safe-Space-Finder

# Install deps
npm install

# Start dev server (defaults to LAN)
npm start
# or force tunnel if LAN issues
npx expo start --tunnel
```
Open the QR code in Expo Go. If you see a white screen + 'failed to download remote update', switch to Tunnel mode (Shift+M in CLI or start with `--tunnel`). OTA is disabled in `app.json` to avoid remote bundle fetch issues during early development.

## Scripts
| Script | Description |
|--------|------------|
| `npm start` | Expo start (Metro dev server) |
| `npm run android` | Try to launch Android (requires SDK & emulator) |
| `npm run ios` | Launch iOS simulator (macOS + Xcode only) |
| `npm run web` | Run web build (experimental) |

## Environment Configuration (Optional)
Create a `.env` (if adding backend API):
```
API_BASE_URL=https://api.example.com
FEATURE_NOTIFICATIONS=1
```
Use via a config module (not yet included). Avoid committing secrets.

## Push Notifications
1. First launch asks permission (physical device only).
2. Expo push token stored in AsyncStorage.
3. Categories set (e.g., review reminders with action buttons).
4. To test: trigger a local scheduled notification in `DemoScreen` or `BusinessDetailScreen` after interacting.

## Offline Manager
- Listens to network changes (NetInfo)
- Caches successful GET responses (AsyncStorage)
- Queues mutations while offline and replays when back online
- Add new queued requests via the service (extend as backend endpoints solidify)

## Swipeable Lists
Implemented with `SwipeableList` component wrapping `react-native-swipe-list-view`:
- Left / right contextual actions
- Haptic feedback
- Optimistic local state updates

## Form Validation
`RegisterScreen` uses Formik + Yup:
- Email format
- Password strength & live meter
- Accessible error messaging

## Performance & Resilience
- Splash guarded by safety timer (prevents indefinite white screen)
- Progressive image component (thumbnail → full)
- Skeleton placeholders reduce perceived wait
- OTA disabled during unstable network debugging

## Troubleshooting
| Issue | Fix |
|-------|-----|
| White screen after QR scan | Use Tunnel (`--tunnel`), clear Expo Go cache, ensure same network |
| "failed to download remote update" | OTA disabled already; confirm using local or tunnel connection |
| `adb not recognized` | Ignore unless launching Android emulator; install Android SDK if needed |
| Notifications not working | Must use physical device; reinstall Expo Go if permission permanently denied |
| Stuck splash | Safety timer added; check device logs (shake → Show Logs) |

## Recent Core Additions (Auth & Stability)
- Secure auth context with token refresh & secure storage
- Global error boundary + centralized snackbar notifications
- Offline network banner
- Basic Jest testing setup (example sanitizeInput test)
- API layer (axios wrapper with refresh handling)

These were prioritized as essential for a stable public release baseline.

## Contributing
1. Create feature branch: `git checkout -b feat/your-feature`
2. Commit with conventional message style: `feat: add X`, `fix: correct Y`
3. Run lint/tests (add later) before PR.
4. Open Pull Request.

## Roadmap (Next)
- Backend API integration (live data)
- Secure auth (JWT / OAuth)
- Map clustering & filters
- Localization & RTL support
- Dedicated settings & preferences
- Automated E2E tests (Detox / Maestro)

## License
TBD (add preferred license: MIT / Apache-2.0 / Proprietary).

---
For details on the latest enhancement batch see `IMPROVEMENTS_16-20_SUMMARY.md`.
