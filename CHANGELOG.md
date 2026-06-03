# Changelog

All notable changes to BiteSync are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2025-05-25 — Initial Production Release

### Added
- Mobile app: Home, Review, and Profile tabs
- Inline dropdown search on Home with recent search history (AsyncStorage)
- Restaurant discovery: browse by restaurant, filter by name
- Restaurant page: hero image, open/closed badge, cuisine tags overlaid on image, address, menu by category
- Food diary (Profile tab): view all past reviews, edit within 5-minute window, delete
- Public reviews on item detail page: show author name, avatar emoji, note, photo, timestamp
- Liked/favourite dishes: heart button on menu items, "Your Favourite Dishes" horizontal scroll on home
- Trending dishes section on home based on review volume
- Review submission: thumbs up/down, private note, public note, optional photo upload
- Photo viewer: tap review photo to see full screen
- Review streak counter (consecutive days reviewed)
- Sidebar drawer: profile info, navigation, sign out, BiteSync branding footer
- Bottom tab bar: Home, Review, Profile (slim, premium design)
- Restaurant dashboard: menu management (add restaurant, category, item), view public reviews
- Database: full schema, RLS policies on all tables, 5-minute edit window trigger
- Supabase Storage: `review-pics` bucket for user photo uploads
- Seed data: 5 Karachi restaurants (Kolachi, Javed Nihari, Xanders, Hot N Spicy, Sakura)

### Security
- RLS enabled on all tables — default deny
- Private notes never exposed to restaurant admins
- 5-minute review edit window enforced at database trigger level
- Service role key confined to server-side dashboard only

---

## Upcoming

### [1.1.0] — Planned
- Remove the gap between header and restaurant hero image (flush layout)
- Horizontal category tab bar inside restaurant page
- "Deals" banner section on restaurant page (placeholder ready)

### [1.2.0] — Planned
- QR code generator for restaurant standees
- AI review summariser for restaurant dashboard ("70% said the chicken was too dry")
- Gamification: reviewer badges and streak milestones

### [2.0.0] — Future
- SaaS billing portal (Stripe / SadaPay)
- Data export for restaurants (CSV download)
- Waiter rating and digital tip
- Dietary alert system (flag allergens)
- Social dining: shareable food diary link
