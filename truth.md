# CraveSync — Source of Truth

> Last Updated: June 2026 | Version: 1.0 (Phase 1 Complete, Phase 2 In Progress)

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Product Name** | CraveSync |
| **Old Internal Name** | BiteSync (repo folder name) |
| **Tagline** | Direct-to-kitchen feedback pipeline — de-risking every meal |
| **Business Model** | B2B2C — sell to restaurants, diners are the data source |
| **Target Market** | Karachi, Pakistan (Phase 1 launch) |
| **Stage** | Phase 2 — Market Research & Pre-Sales |
| **Founder** | Hamza Owais |
| **Support Email** | support@cravesync.app |
| **Bundle ID** | com.cravesync.app |
| **EAS Project ID** | 6dfc5aab-b58a-406c-abf7-60b786269658 |

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native 0.81 + Expo 54 |
| Language | TypeScript |
| Backend & Auth | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Dashboard | Next.js 14 (App Router) |
| Dashboard hosting | Vercel (auto-deploy on push to `main`) |
| Icons (mobile) | lucide-react-native |
| Local storage | AsyncStorage (search history, preferences) |
| Image handling | expo-image-picker + expo-image-manipulator |
| APK builds | EAS Build (Expo Application Services) |
| Database | PostgreSQL via Supabase |

---

## 3. Repository Structure

```
BiteSync/                        ← monorepo root
├── mobile/                      ← React Native + Expo app (diners)
│   ├── App.tsx                  ← ALL screens, navigation, state (single file)
│   ├── CraveSyncLogo.tsx        ← Reusable SVG logo component
│   ├── lib/supabase.ts          ← Supabase client init
│   ├── assets/                  ← Icons, splash, logo
│   ├── android/                 ← Native Android project (Gradle)
│   ├── app.json                 ← Expo config (version, bundle ID, etc.)
│   └── eas.json                 ← EAS Build profiles
├── dashboard/                   ← Next.js 14 restaurant operator panel
│   └── src/
│       ├── app/                 ← App Router pages
│       │   ├── page.tsx         ← Dashboard home (review feed + insights)
│       │   ├── layout.tsx       ← Root layout (auth check via headers)
│       │   ├── login/           ← Login page
│       │   ├── menu/            ← Menu manager
│       │   │   └── [restaurantId]/ ← Per-restaurant menu editing
│       │   ├── settings/        ← Restaurant settings + actions.ts
│       │   ├── feedback/        ← Feedback feed page
│       │   ├── customers/       ← Customer overview page
│       │   ├── analytics/       ← Analytics page
│       │   ├── admin/           ← Super admin controls
│       │   └── actions/         ← Server actions
│       ├── components/
│       │   ├── Sidebar.tsx      ← Navigation sidebar (cached profile lookup)
│       │   └── Header.tsx       ← Top header component
│       └── utils/supabase/      ← Supabase client + middleware
├── database/                    ← All SQL files (schema, RLS, seeds)
├── docs/                        ← Full technical documentation
├── CraveSync.apk                ← Current sideloadable Android APK
├── ROADMAP.md                   ← Phased execution plan + pricing tiers
├── MASTERPLAN.md                ← 52-week strategy
├── README.md                    ← Project overview
└── truth.md                     ← This file
```

---

## 4. Dashboard — Routes & Pages

Base URL (production): Vercel-deployed URL  
Base URL (local): `http://localhost:3000`

| Route | Description | Auth Required | Role |
|-------|-------------|--------------|------|
| `/login` | Email + password login via Supabase Auth | No | Any |
| `/` | Dashboard home — review feed, dish insights, stats | Yes | restaurant_admin, super_admin |
| `/menu` | List of restaurants managed | Yes | restaurant_admin, super_admin |
| `/menu/[restaurantId]` | Edit categories and menu items for a restaurant | Yes | restaurant_admin, super_admin |
| `/settings` | Restaurant profile settings (name, address, cuisine) | Yes | restaurant_admin |
| `/feedback` | Full public review feed | Yes | restaurant_admin |
| `/customers` | Overview of reviewing users | Yes | restaurant_admin |
| `/analytics` | Dish performance analytics | Yes | restaurant_admin |
| `/admin` | Super admin controls (manage all restaurants) | Yes | super_admin |

### Authentication Flow
- Supabase Auth middleware injects `x-user-id` and `x-user-email` headers on every request
- All dashboard pages read from headers (zero extra DB roundtrip for auth)
- Profile metadata (role, managed_restaurant_id) cached via `unstable_cache` (revalidate: 60s)
- `is_super_admin: true` → redirected to `/admin`
- `managed_restaurant_id: null` → no restaurant assigned yet
- No session → redirected to `/login`

---

## 5. Mobile App — Navigation Structure

The mobile app (`mobile/App.tsx`) is a **single-file** React Native application. All screens, state, and navigation are managed with `useState`/`useEffect` hooks — no routing library.

```
App
├── Auth Screen                  (if no session)
│   ├── Sign In
│   └── Sign Up
└── Main App                     (if authenticated)
    ├── Sidebar Drawer           (hamburger menu — profile info + sign out)
    ├── Bottom Tab Bar           (Home | Review | Profile)
    │
    ├── [Home Tab]
    │   ├── Landing              (dropdown search + favourites + trending)
    │   └── Restaurant Profile
    │       └── Menu by Category
    │           └── Item Detail  (photo, price, reviews, popularity score)
    │
    ├── [Review Tab]
    │   └── Restaurant List
    │       └── Menu by Category
    │           └── Item Detail
    │               └── Rate Meal Modal (thumbs up/down + notes + photo)
    │
    └── [Profile Tab]
        ├── Food Diary           (all reviews by this user)
        └── Edit Review Modal    (within 5-min window only)
```

### Key State Groups

| Group | Key Variables |
|-------|--------------|
| Auth | `session`, `email`, `password` |
| Navigation | `currentTab`, `homeView`, `selectedRestaurant`, `detailItem` |
| Restaurants | `restaurants`, `filteredRestaurants`, `restaurantRatings` |
| Menu | `menuItems`, `menuLoading`, `menuSearchQuery` |
| Reviews | `itemReviews`, `reviewStats`, `diaryEntries` |
| Profile | `profileUsername`, `profileAvatar`, `likedItems`, `reviewStreak` |
| Search | `homeSearchText`, `homeDropdownRestaurants`, `homeDropdownDishes`, `searchHistory` |

---

## 6. Database Schema

Hosted on Supabase (managed PostgreSQL). RLS enabled on all user-facing tables.

### Entity Relationships

```
users
  └── reviews (user_id → users.id)
        └── review_attribute_values (review_id → reviews.id)
              └── item_attributes (item_attribute_id → item_attributes.id)

restaurants
  └── menu_categories (restaurant_id → restaurants.id)
        └── menu_items (category_id → menu_categories.id)
              ├── item_attributes (menu_item_id → menu_items.id)
              └── reviews (menu_item_id → menu_items.id)

users
  └── liked_items (user_id → users.id, item_id → menu_items.id)
```

### Tables

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | Matches `auth.uid()` |
| `phone_number` | varchar(20) | Unique, nullable |
| `full_name` | varchar(100) | Display name |
| `avatar_url` | text | Integer index (0–8) mapping to emoji avatars |
| `email` | text | Synced from Supabase auth |
| `managed_restaurant_id` | uuid | FK → restaurants.id (for dashboard access) |
| `is_super_admin` | boolean | Super admin flag |
| `created_at` | timestamptz | Auto-set |

#### `restaurants`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | varchar(255) | |
| `address` | text | |
| `logo_url` | text | Hero image URL |
| `cuisine_type` | text | Comma-separated, e.g. `"Desi BBQ, Karahi"` |
| `price_range` | text | `"$"` / `"$$"` / `"$$$"` / `"$$$$"` |
| `opening_hours` | jsonb | `{ "mon": "12:00-00:00", ... }` |
| `is_active` | boolean | Hidden from app if false |
| `created_at` | timestamptz | |

#### `menu_categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `restaurant_id` | uuid FK → restaurants.id | Cascade delete |
| `name` | varchar(100) | Section header in app |
| `sort_order` | integer | Controls display order |
| `created_at` | timestamptz | |

#### `menu_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `category_id` | uuid FK → menu_categories.id | Cascade delete |
| `name` | varchar(255) | |
| `description` | text | Optional |
| `price` | integer | Whole number in PKR (e.g. `2200`) |
| `image_url` | text | Dish photo URL |
| `is_available` | boolean | If false, hidden from menu |
| `created_at` | timestamptz | |

#### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → users.id | Cascade delete |
| `menu_item_id` | uuid FK → menu_items.id | Cascade delete |
| `rating_thumbs` | boolean | `true`=👍, `false`=👎, `null`=no rating |
| `private_note` | text | User-only. Never exposed to restaurant. |
| `public_note` | text | Visible to restaurant + other diners |
| `photo_url` | text | URL in Supabase Storage `review-pics` bucket |
| `updated_at` | timestamptz | Enforced by DB trigger (5-min edit window) |
| `created_at` | timestamptz | |

> **5-minute edit window:** A DB trigger rejects any `updated_at` set more than 5 minutes after `created_at`.

#### `liked_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → users.id | Cascade delete |
| `item_id` | uuid FK → menu_items.id | Cascade delete |
| `created_at` | timestamptz | |

#### `item_attributes` *(future use)*
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `menu_item_id` | uuid FK | |
| `attribute_name` | varchar(100) | e.g. `"Spice Level"` |
| `attribute_type` | varchar(50) | `"slider"` / `"boolean"` / `"text"` |
| `min_label` | varchar(50) | e.g. `"Too Mild"` |
| `max_label` | varchar(50) | e.g. `"Too Spicy"` |

#### `review_attribute_values` *(future use)*
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `review_id` | uuid FK → reviews.id | |
| `item_attribute_id` | uuid FK | |
| `value_numeric` | integer | Sliders (0–100) |
| `value_boolean` | boolean | Toggle attributes |
| `value_text` | text | Free-text attributes |

---

## 7. Row Level Security (RLS)

All user-facing tables have RLS enabled. Security is enforced at the database level, not the application layer.

### `users`
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read their own row | SELECT | `auth.uid() = id` |
| Users can update their own row | UPDATE | `auth.uid() = id` |
| Service role can read all | SELECT | Service role only |

### `restaurants`
| Policy | Operation | Rule |
|--------|-----------|------|
| All can view active restaurants | SELECT | `is_active = true` |
| Only service role can mutate | INSERT/UPDATE | Service role only |

### `reviews`
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read their own | SELECT | `auth.uid() = user_id` |
| Restaurant admins read public notes | SELECT | `public_note IS NOT NULL` (admin role) |
| Users can insert own reviews | INSERT | `auth.uid() = user_id` |
| Users can update within 5-min | UPDATE | `auth.uid() = user_id` + trigger |
| Users can delete own reviews | DELETE | `auth.uid() = user_id` |

### `liked_items`
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read their own | SELECT | `auth.uid() = user_id` |
| Users can insert their own | INSERT | `auth.uid() = user_id` |
| Users can delete their own | DELETE | `auth.uid() = user_id` |

---

## 8. Database SQL Files (Run Order)

| Order | File | Purpose |
|-------|------|---------|
| 1 | `schema.sql` | Create all 7 tables |
| 2 | `auth_trigger.sql` | Auto-create users row on Supabase Auth signup |
| 3 | `liked_items.sql` | liked_items table |
| 4 | `rls_policies.sql` | Enable RLS on all tables |
| 5 | `reviews_rls_complete.sql` | Reviews-specific RLS (SELECT/INSERT/UPDATE/DELETE) |
| 6 | `storage_policy.sql` | Storage bucket policies |
| 7 | `setup_roles.sql` | `restaurant_admin`, `super_admin` roles |
| 8 | `indexes.sql` | Performance indexes |
| 9 | `seed.sql` | 5 seed restaurants + menus |
| 10 | `seed_fake_reviews.sql` | Optional mock reviews for testing |

### Performance Indexes
```sql
CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX idx_menu_items_category         ON menu_items(category_id);
CREATE INDEX idx_item_attributes_item        ON item_attributes(menu_item_id);
CREATE INDEX idx_reviews_user                ON reviews(user_id);
CREATE INDEX idx_reviews_item                ON reviews(menu_item_id);
CREATE INDEX idx_review_values_review        ON review_attribute_values(review_id);
```

---

## 9. Storage

| Bucket | Purpose | Access |
|--------|---------|--------|
| `review-pics` | User-uploaded review photos | Authenticated users can upload; public read |

---

## 10. Environment Variables

### Mobile App — `mobile/.env`
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Dashboard — `dashboard/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-side only. It bypasses RLS. Never expose it client-side.

---

## 11. Running Locally

### Mobile App
```bash
cd mobile
npm install
npx expo start          # Expo Go (QR code scan)
npx expo start --web    # Browser at localhost:8081
npx expo start --tunnel # Android via Expo Go tunnel
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev             # http://localhost:3000
npm run build           # Production build
```

---

## 12. Deployed URLs

| Service | URL |
|---------|-----|
| Dashboard | Vercel (auto-deploy from `main` branch) |
| Mobile (web/PWA) | `npx expo start --web` or EAS hosted |
| APK (sideload) | `CraveSync.apk` in repo root |

---

## 13. User Roles

| Role | Access |
|------|--------|
| `authenticated` (diner) | Mobile app — browse, review, like dishes |
| `restaurant_admin` | Dashboard — manage their restaurant's menu and view public reviews |
| `super_admin` | Dashboard `/admin` — manage all restaurants, all users |

Role is stored in the `users` table as:
- `managed_restaurant_id` (uuid) — which restaurant this admin manages
- `is_super_admin` (boolean) — grants `/admin` access

---

## 14. Shipped Mobile App Features

### Authentication
- Email + password sign up / sign in / sign out
- Session persisted via Supabase Auth JWT
- Auto-creates `users` row on signup (DB trigger)

### Home Tab
- Dropdown search bar (restaurants + dishes, debounced 300ms, ≥2 chars)
- Recent search history (last 3 searches, stored in AsyncStorage)
- Trending dishes (by review volume)
- Favourite dishes (horizontal scroll)

### Restaurant Discovery
- Browse all active restaurants
- Restaurant profile: hero image, open/closed badge, cuisine tags, price range, address
- Menu by category with inline search

### Item Detail
- Dish photo, name, price in PKR
- Popularity score (% positive reviews)
- All public reviews with user name + time ago

### Review Flow
- One-tap thumbs up / thumbs down
- Private note (user-only food diary — never visible to restaurant)
- Public note (visible to restaurant and diners)
- Review photo upload (Supabase Storage)
- 5-minute edit window (enforced at DB trigger level)
- Review deletion

### Profile Tab
- Food diary (all of the user's reviews, timestamped)
- Edit review modal (within 5-min window)
- Review streak (consecutive days reviewed)
- Avatar selection (emoji-based, 0–8 index)
- Heart / favourite dishes

### Sidebar Drawer
- Profile info (username, avatar)
- Navigation links
- Sign out

---

## 15. Shipped Dashboard Features

| Feature | Description |
|---------|-------------|
| Admin login | Supabase Auth, email + password |
| Restaurant manager | Add/edit restaurant name, address, cuisine, logo, hours |
| Menu manager | Add/edit categories and items; upload dish photos |
| Image uploads | Supabase Storage for dish and restaurant photos |
| Live feedback feed | Public reviews sorted by dish and date |
| Insights panel | Positive/negative ratio per dish, popularity badge |
| Customer page | Overview of reviewing users |
| Campaign settings | Winback campaign configuration UI |
| Admin page | Super admin controls |

### Dashboard Performance Optimisations
- Auth injected via middleware headers (`x-user-id`, `x-user-email`) — zero extra DB roundtrip
- User profile metadata cached with `unstable_cache` (revalidate: 60s)
- Review feed cached with `unstable_cache` (revalidate: 5s)
- No `loading.tsx` root boundary — instant tab transitions (SPA-like feel)
- Settings page uses `revalidatePath('/settings')` after save

---

## 16. Data Flow — Key Flows

### Diner submits a review
```
User taps Submit
  → App.tsx: submitReview()
  → INSERT into reviews (rating_thumbs, private_note, public_note, photo_url)
      └── Supabase RLS: user_id must match auth.uid()
  → If photo selected: upload to Supabase Storage "review-pics"
      └── URL stored back in reviews.photo_url
  → Refresh diary + item review list
```

### Home search dropdown
```
User types ≥2 chars (debounced 300ms)
  → supabase.from('restaurants').ilike('name', query).limit(5)
  → supabase.from('menu_items').ilike('name', query).limit(5)
  → Dropdown: RESTAURANTS section + DISHES section
  → User taps → saveSearchToHistory() → AsyncStorage
```

### Dashboard loads review feed
```
Request hits middleware
  → x-user-id header injected
  → page.tsx reads header (no DB call for auth)
  → getCachedUserProfile(userId) → unstable_cache (60s TTL)
  → getCachedReviews(restaurantId) → unstable_cache (5s TTL)
  → Page renders with data
```

---

## 17. Seed Data — 5 Launch Restaurants

| Restaurant | Cuisine | Notable Dishes |
|-----------|---------|----------------|
| Kolachi | Upscale BBQ / Desi | Chicken Peshawari Karahi, Mutton Chops, Kolachi Special Handi |
| Javed Nihari | Traditional Nihari | Nalli Nihari, Maghaz Nihari, Sada Nihari |
| Xander's | Modern Cafe / Continental | Jalapeno Beef Burger, Feta & Spinach Pizza, Babarazzi Salad |
| Hot N Spicy | Fast Food / Street | Chicken Chutney Roll, Beef Bihari Roll, Garlic Mayo Fries |
| Sakura (Pearl Continental) | Fine Dining Japanese | Spicy Tuna Maki, Teppanyaki Beef, Ebi Tempura |

---

## 18. APK Build

### EAS Build (cloud — recommended)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview    # APK (sideload)
eas build --platform android --profile production # AAB (Play Store)
```

### Local Gradle Build
```bash
cd mobile
npx expo export --platform android
cd android
.\gradlew assembleRelease
# Output: mobile/android/app/build/outputs/apk/release/app-release.apk
```

Current sideloadable APK: `CraveSync.apk` in repo root (65MB).

---

## 19. Pricing & Business Model

### Go-To-Market: 3 months free trial on all tiers

| Tier | Name | Target |
|------|------|--------|
| 1 | Basic — The Feedback Starter | Small cafes and local eateries |
| 2 | Pro — The Growth Accelerator | Active standalone restaurants |
| 3 | Enterprise — The Kitchen Controller | Premium dine-in + franchise chains |

### Basic Tier Features
- Zero-install PWA tabletop QR code ratings (Thumbs Up/Down + Chef note)
- Live feedback feed sorted by dish and date
- Menu Manager (categories + items)
- Instagram Bio Menu Link

### Pro Tier Features (everything in Basic, plus)
- Automated Winback Campaigns (auto-email apology + discount to unhappy diners)
- AI Review Summarizer ("67% said chicken was too dry")
- Verified Social Proof Widget (Instagram Story graphics from verified ratings)
- Automated Weekly Performance Reports (WhatsApp/Email digest)
- Data Export (CSV download of all reviews + ratings)

### Enterprise Tier Features (everything in Pro, plus)
- Real-Time Table Rescue Alerts (SMS/WhatsApp to manager for negative in-table reviews)
- Shift & Chef Performance Tracking (correlate ratings with kitchen shifts)
- Multi-Branch Franchise Dashboard (aggregated analytics across locations)
- POS System Integration
- Dietary & Allergen Alerts

---

## 20. Customer Discovery Insights (190 Diner Survey)

| Metric | Value | Implication |
|--------|-------|-------------|
| Eat out weekly | 77.89% | High transaction volume for feedback loop |
| Frustration = hype vs. reality | 58.7% | Core pain point — diners fear wasted money |
| Ordering decisions are blind guesses | 82.6% | Dish-level ratings de-risk every order |
| Blocked by review friction | 75.2% | Must be 3-second flow, no sign-up barrier |
| Ready for one-tap rating | 80.5% | QR + thumbs up/down is the right format |
| Will review if it reaches the chef | 71.0% | **Golden Hook** — direct-to-kitchen pitch |
| Don't trust anonymous reviews | 34.7% | Verified dine-in ratings are differentiated |
| Discover via Instagram | 40.0% | Instagram bio menu link is high-priority |
| Reject private food diary | 47.4% | De-emphasise diary; make it passive/automatic |

**Strategic pivot from survey:**
- Primary diner hook changed from "private food diary" → "talk directly to the chef"
- PWA-first (no app install required at table scan)

---

## 21. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single `App.tsx` for mobile | Fast solo-developer iteration; refactor to screens when team scales |
| Supabase over custom API | Saves 4–6 weeks — instant Auth, Storage, RLS |
| No Redux/Zustand | React hooks sufficient for current single-file scale |
| PKR stored as integer | Avoids float precision issues; displayed as `PKR 2,200` |
| Reviews dual-purpose | One row = private diary entry + public feedback. `private_note` is user-only; `public_note` is shared |
| RLS over app-layer checks | Security enforced at DB level — malicious client cannot read others' private notes |
| Headers for auth in dashboard | Eliminates extra DB roundtrip per page load — latency improvement |
| `unstable_cache` for profiles | Profile data rarely changes; 60s TTL is safe and fast |

---

## 22. Documentation Index

| File | Audience | Topic |
|------|----------|-------|
| `README.md` | Developers | Project overview, quick start |
| `ROADMAP.md` | Team | Phased execution plan, pricing tiers |
| `MASTERPLAN.md` | Founders | 52-week strategic plan |
| `truth.md` | Playwright / QA | This file — complete source of truth |
| `docs/ARCHITECTURE.md` | Developers | System design, data flow |
| `docs/DATABASE.md` | Developers | Full schema, RLS reference |
| `docs/DEVELOPMENT.md` | Developers | Local setup, env vars |
| `docs/DEPLOYMENT.md` | Developers | APK build, Vercel deploy |
| `docs/SECURITY.md` | Developers | Auth model, RLS policies |
| `docs/FOR_RESTAURANTS.md` | Restaurant clients | Dashboard guide, onboarding |
| `docs/FOR_DINERS.md` | App users | How to use CraveSync |
| `docs/FAQ.md` | Both | Common questions |
| `docs/PRIVACY_POLICY.md` | Public | Data collection, private notes |
| `CHANGELOG.md` | Developers | Version history |
| `LAUNCH_PLAN.md` | Founders | 90-day go-to-market plan |
| `DATABASE_ACCESS_AUDIT.md` | Security | Query-level RLS audit |

---

## 23. Version History Summary

| Version | Status | Notes |
|---------|--------|-------|
| 0.1–0.9 | Complete | Core mobile + dashboard build |
| 1.0 | ✅ Released | Full feature set, APK built, SQA done |
| 1.x (next) | Planning | PWA QR rating page, Instagram bio link, winback campaigns |

---

*CraveSync — Data First. No Haste.*
