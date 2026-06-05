# Architecture

This document covers how CraveSync is structured, how data flows through the system, and the decisions behind the design.

---

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                        CLIENTS                           │
│                                                          │
│   ┌─────────────────┐        ┌──────────────────────┐   │
│   │  Mobile App      │        │  Restaurant Dashboard │   │
│   │  React Native    │        │  Next.js (App Router) │   │
│   │  Expo 54         │        │  localhost:3000        │   │
│   │  Android / Web   │        │  (Web only)           │   │
│   └────────┬────────┘        └──────────┬───────────┘   │
│            │                            │                │
└────────────┼────────────────────────────┼────────────────┘
             │  HTTPS + Supabase JS SDK   │
             ▼                            ▼
┌──────────────────────────────────────────────────────────┐
│                       SUPABASE                           │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  Auth        │  │  PostgreSQL  │  │  Storage     │  │
│   │  Email/Pass  │  │  (Primary DB)│  │  (Images)    │  │
│   │  JWT tokens  │  │  + RLS       │  │  review-pics │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Mobile App (`/mobile`)

The mobile app is the primary user-facing product. It is a single-file React Native application (`App.tsx`) which manages all screens, state, and navigation through a custom tab-and-stack pattern without a routing library.

**Navigation model:**

```
App
├── Auth Screen           (if no session)
└── Main App              (if authenticated)
    ├── Sidebar Drawer    (hamburger menu)
    ├── Bottom Tab Bar    (Home | Review | Profile)
    │
    ├── [Home Tab]
    │   ├── Landing       (dropdown search + favourites + trending)
    │   └── Restaurant → Menu → Item Detail
    │
    ├── [Review Tab]
    │   └── Restaurant List → Menu → Item Detail → Rate Meal modal
    │
    └── [Profile Tab]
        └── Food Diary + Edit Review modal
```

**State management:** All state is managed with React `useState` / `useEffect` hooks directly in `App.tsx`. No Redux or Zustand — kept intentionally simple for the single-developer phase.

**Key state groups:**

| Group | Variables |
|-------|-----------|
| Auth | `session`, `email`, `password` |
| Navigation | `currentTab`, `homeView`, `selectedRestaurant`, `detailItem` |
| Restaurants | `restaurants`, `filteredRestaurants`, `restaurantRatings` |
| Menu | `menuItems`, `menuLoading`, `menuSearchQuery` |
| Reviews | `itemReviews`, `reviewStats`, `diaryEntries` |
| Profile | `profileUsername`, `profileAvatar`, `likedItems`, `reviewStreak` |
| Home Search | `homeSearchText`, `homeDropdownRestaurants`, `homeDropdownDishes`, `searchHistory` |

---

### 2. Restaurant Dashboard (`/dashboard`)

A Next.js 14 App Router application used by restaurant operators and the CraveSync admin team.

**Key pages:**
- `/` — Login
- `/dashboard` — Overview (restaurants listed)
- `/dashboard/[restaurantId]` — Menu manager (categories + items)
- `/dashboard/[restaurantId]/reviews` — Live public reviews

**Access control:** Protected via Supabase Auth. Only accounts with the `restaurant_admin` or `super_admin` role (stored in the `users` table) can access the dashboard.

---

### 3. Database (`/database`)

Hosted on Supabase (managed PostgreSQL). All schema, RLS policies, and seed data are version-controlled as `.sql` files.

See [`DATABASE.md`](DATABASE.md) for the full schema and policy reference.

---

## Data Flow Examples

### User submits a review

```
User taps "Submit"
      │
      ▼
App.tsx: submitReview()
      │
      ├── INSERT into reviews (rating_thumbs, private_note, public_note, photo_url)
      │         └── Supabase RLS: user_id must match auth.uid()
      │
      ├── If photo selected:
      │     └── Upload to Supabase Storage bucket "review-pics"
      │           URL stored back in reviews.photo_url
      │
      └── Refresh diary + item review list
```

### Home search dropdown

```
User types in search bar (≥2 chars)
      │
      ▼
useEffect [homeSearchText] — debounced 300ms
      │
      ├── supabase.from('restaurants').ilike('name', query).limit(5)
      └── supabase.from('menu_items').ilike('name', query).limit(5)
            │
            ▼
      Dropdown renders: RESTAURANTS section + DISHES section
            │
            ▼
      User taps result → saveSearchToHistory() → AsyncStorage
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single `App.tsx` file | Fast iteration during early development; avoids over-engineering for a solo/small team. Refactor to screens when team scales. |
| Supabase over custom API | Instant Auth, Storage, and RLS without writing a backend. Saves 4–6 weeks of API development. |
| No state management library | At current scale (one file, linear navigation) React hooks are sufficient. Redux would add overhead without benefit. |
| PKR stored as integer | Avoids floating point issues. `2200` = PKR 2,200. Displayed as `PKR {value}`. |
| Reviews dual-purpose | One `reviews` row serves as both the user's private diary entry and the restaurant's public feedback. `private_note` is user-only; `public_note` is shared. |
| RLS over application-layer checks | Security is enforced at the database level, not just the frontend. Even a malicious client cannot read or modify another user's private notes. |
