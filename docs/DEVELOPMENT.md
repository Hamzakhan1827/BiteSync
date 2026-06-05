# Development Guide

Everything you need to run CraveSync locally from scratch.

---

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 18.x | https://nodejs.org |
| npm | 9.x | Comes with Node.js |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Git | Any | https://git-scm.com |
| Android Studio | Latest (for native builds) | Optional for web dev |

---

## Environment Variables

### Mobile App — `mobile/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> Variables prefixed with `EXPO_PUBLIC_` are bundled into the client. **Never put the service role key here.**

### Dashboard — `dashboard/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side (API routes). It bypasses RLS — guard it carefully.

---

## Running the Mobile App

```bash
cd mobile
npm install

# Development — opens Expo DevTools
npx expo start

# Web only (fastest for UI development)
npx expo start --web

# Android via Expo Go (scan QR with the Expo Go app)
npx expo start --tunnel
```

### Platform targets

| Command | Target |
|---------|--------|
| `npx expo start --web` | Browser at `http://localhost:8081` |
| `npx expo run:android` | Connected Android device / emulator |
| `npx expo run:ios` | macOS + Xcode required |

---

## Running the Dashboard

```bash
cd dashboard
npm install
npm run dev
# → http://localhost:3000
```

---

## Database Setup (new Supabase project)

Run these SQL files in the Supabase SQL Editor in order:

```
1. database/schema.sql              ← Create all tables
2. database/auth_trigger.sql        ← Auto-create user profile on signup
3. database/liked_items.sql         ← liked_items table
4. database/rls_policies.sql        ← Enable RLS on all tables
5. database/reviews_rls_complete.sql← Reviews-specific RLS policies
6. database/storage_policy.sql      ← Storage bucket policies
7. database/setup_roles.sql         ← Admin roles
8. database/indexes.sql             ← Performance indexes
9. database/seed.sql                ← 5 seed restaurants + menus
10. database/seed_fake_reviews.sql  ← Optional: mock reviews for testing
```

---

## Project Structure

### Mobile App

```
mobile/
├── App.tsx              ← All screens, navigation, and business logic
├── CraveSyncLogo.tsx     ← Reusable logo SVG component
├── lib/
│   └── supabase.ts      ← Supabase client initialisation
├── assets/              ← Icons, splash, logo
├── android/             ← Native Android project (Gradle)
├── app.json             ← Expo configuration
├── eas.json             ← EAS Build configuration
└── package.json
```

### Dashboard

```
dashboard/
├── src/
│   ├── app/             ← Next.js App Router pages
│   ├── components/      ← UI components
│   └── utils/
│       └── supabase/    ← Supabase client + middleware
├── public/              ← Static assets
└── package.json
```

---

## Code Conventions

### Mobile App (`App.tsx`)

- All styles defined in a single `StyleSheet.create({})` at the bottom of the file
- No inline magic numbers — reuse style tokens where possible
- State is grouped by concern (auth, navigation, restaurants, reviews, etc.)
- Data fetching functions are named `fetch*` (e.g. `fetchRestaurants`, `fetchDiary`)
- Navigation functions: `handleRestaurantSelect`, `openDetailPage`, `navigateFromSidebar`
- Supabase calls always destructure `{ data, error }` and handle both paths

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CraveSyncLogo` |
| State variables | camelCase | `selectedRestaurant` |
| Handlers | `handle*` or verb phrase | `handleRestaurantSelect`, `submitReview` |
| Styles | camelCase | `styles.menuCard` |
| DB tables | snake_case | `menu_items`, `review_attribute_values` |

---

## Common Tasks

### Add a new restaurant
Use the Dashboard at `/dashboard` → "Add Restaurant". Fill in name, address, cuisine type, price range, and upload a logo image.

### Add menu categories and items
Inside the restaurant page on the Dashboard → "Add Category" → "Add Item". Items need a name, price, and optionally an image and description.

### Apply a database migration
Write your SQL in `database/migrations/` with a timestamp prefix:
```
database/migrations/20250524_add_column_x.sql
```
Then run it in the Supabase SQL Editor.

### Reset local search history
Search history is stored in `AsyncStorage` under the key `cravesync_search_history`. Clear it with:
```js
await AsyncStorage.removeItem('cravesync_search_history');
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `EXPO_PUBLIC_` vars not loading | Restart the Expo dev server after editing `.env` |
| Supabase returns 401 | Check the anon key and that the user is signed in |
| Image not uploading | Verify the `review-pics` storage bucket exists and the policy allows authenticated inserts |
| RLS blocking an update | Check `database/reviews_rls_complete.sql` — the UPDATE policy requires `auth.uid() = user_id` |
| Android build fails | Ensure Android Studio + NDK are installed; run `cd android && ./gradlew clean` |
