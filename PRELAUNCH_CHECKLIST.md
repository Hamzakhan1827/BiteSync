# BiteSync — Pre-Launch & Deferred Work Master List

---

## 🔴 MUST DO Before Play Store Submission

These are non-negotiable items that Play Store or your users **will** catch.

### App Store Metadata (app.json is missing these)
- [ ] **`versionCode`** — Add `versionCode: 1` under `android` in `app.json`. Without this, Play Store rejects the upload.
- [ ] **`permissions`** — Explicitly declare only the permissions you use (`CAMERA`, `READ_EXTERNAL_STORAGE`, `INTERNET`). Less permissions = faster approval.
- [ ] **Privacy Policy URL** — Play Store requires a public URL to your privacy policy. You need to write and host one (can be a simple link in bio page or GitHub page). Required for any app that collects user data (yours does — email, photos, food diary).
- [ ] **App Description** — Prepare a short (80 chars) and long (4000 chars) description for the Play Store listing.
- [ ] **Screenshots** — Minimum 2 screenshots required. Ideal: 4–5 showing Home, Menu, Review modal, and Profile.
- [ ] **Content Rating** — Fill out the IARC questionnaire in Play Console (5 minutes, needed for all apps).

### Database SQL (Must Run in Supabase Before Launch)
```sql
-- Fix ghost row bug (run this FIRST)
DELETE FROM public.users WHERE id NOT IN (SELECT id FROM auth.users);

-- Link Auth to public profile (prevents ghost rows forever)
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Keep reviews on account deletion (shows as "Deleted User")
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE SET NULL;
```

### Dashboard Data Load — Critical Scaling Bug
- [ ] **The dashboard fetches ALL reviews with no LIMIT.** On 100k users, `page.tsx` line 47 does `select(*).order(created_at)` with NO pagination. This will time out and crash the dashboard at ~5,000+ reviews. Fix: Add `.limit(500)` to the query and paginate the analytics.

---

## 🟡 Should Do (Polish & Stability)

### Mobile App — Missing Features Found in Audit
- [ ] **No "Delete My Review" button** — `DATABASE_ACCESS_AUDIT.md` line 96 explicitly flags this. The RLS policy exists but the UI doesn't. A user with a bad review has no way to remove it.
- [ ] **Offline Mode** — `MASTERPLAN.md` Week 25-26 planned this. Currently if the user has no internet the whole app shows empty. Should cache the last known restaurant list and diary in AsyncStorage.
- [ ] **QR Code Scanner** — `MASTERPLAN.md` Week 19-20 planned a QR scanner so users can scan a table code to instantly open the right restaurant menu. This is the killer feature that makes BiteSync feel premium in restaurants.
- [ ] **Confetti animation on review submit** — `MASTERPLAN.md` Week 39-40 planned micro-animations. The current success toast is a simple modal. A confetti burst would make the experience feel 10x better.
- [ ] **Search placeholder has typo** — `App.tsx:1385` has `"Search restaurants or dishes ??"` — the `??` is a typo leftover. Fix to `"Search restaurants or dishes..."`.

### Dashboard — Missing Features
- [ ] **CSV Export** — `MASTERPLAN.md` Phase 4 (Week 33-34) planned this as critical for the B2B pitch. Restaurants need to export their review data to Excel. This is also a strong upsell feature.
- [ ] **2FA for restaurant managers** — `IMPLEMENTATION_GUIDE.md` line 360 flagged this. A restaurant admin account being hacked means a competitor sees all customer feedback.
- [ ] **Admin Audit Logging** — Every time a restaurant manager logs into the dashboard, that action should be recorded. Standard requirement for any B2B SaaS.

---

## 🟢 Future Roadmap (From MASTERPLAN.md — Deferred Features)

These were planned but not built yet. Pick one per sprint.

| Feature | Value | Effort |
|---------|-------|--------|
| **AI Review Summarizer** | Very High — Chef sees "60% said chicken was dry" instead of reading 100 notes | High |
| **Gamification / Badges** | High — "Top Reviewer at Xander's" keeps users coming back | Medium |
| **Dietary Alerts** | High — "Peanut Allergy" highlights dangerous items in red | Medium |
| **Social Diary Sharing** | Medium — Share your food diary link with friends | Low |
| **Waiter Rating** | Medium — Rate specific staff, useful for restaurants | Medium |
| **Data Heatmaps** | High (B2B) — Shows restaurants which menu sections get the most attention | High |
| **Menu A/B Testing** | Very High (B2B) — Let restaurants test two descriptions for an item | High |
| **SadaPay / Stripe Billing** | Critical for Revenue — Charge restaurants a monthly SaaS fee | High |

---

## 📊 100k User Architecture Assessment

### What will break first and why:

| Component | Current Limit | Breaks At | Fix |
|-----------|--------------|-----------|-----|
| Dashboard `page.tsx` query | Fetches ALL reviews | ~5,000 reviews | Add `.limit()` + pagination |
| `fetchTrending()` in app | Full table scan on reviews | ~50,000 reviews | Add a materialized view or scheduled cron |
| Supabase Free Tier | 500MB DB, 2GB bandwidth | ~10,000 active users | Upgrade to Pro ($25/mo) |
| Review photos storage | No size limit per image | ~20,000 photos | Compress images before upload (use `ImageManipulator`) |
| `public.users` table | No email index | ~100,000 users | Add `CREATE INDEX idx_users_email ON users(email)` |

### Indexes to add NOW (free, instant, no downtime):
```sql
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id);
```

---

## ✅ Already Done & Confirmed Working

- ✅ RLS on all tables (users can only see/edit their own data)
- ✅ 5-minute review edit window (enforced at DB trigger level, not just frontend)
- ✅ Auth rate limiter (5 attempts → 5 minute cooldown)
- ✅ Spam prevention on all buttons (loading state + disabled)
- ✅ Input length caps (500 chars public note, 1000 chars private)
- ✅ "Deleted User" fallback across mobile app and dashboard
- ✅ Storage scoped to `review-photos/{user_id}/`
- ✅ Service role key server-side only (never in APK)
- ✅ Sidebar z-index fix on Android
- ✅ KeyboardAvoidingView on auth screen
- ✅ Session persistence (user stays logged in after app restart)
- ✅ Forgot Password button restored

---

## 🏪 Play Store Submission Order

1. Run the 3 SQL commands above in Supabase
2. Add `versionCode: 1` to `app.json`, rebuild APK
3. Write a 1-page Privacy Policy and host it
4. Take 4 screenshots of the app
5. Create Play Console account ($25 one-time fee)
6. Upload APK → Fill in metadata → Submit for review (3–7 days)
