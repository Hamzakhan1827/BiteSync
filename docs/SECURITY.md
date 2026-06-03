# Security Model

BiteSync handles personal food diaries and private user notes. This document explains how data is protected at every layer.

---

## Authentication

BiteSync uses **Supabase Auth** with email + password.

- On signup, a trigger (`database/auth_trigger.sql`) automatically creates a matching row in the public `users` table, linking `auth.uid()` to the user's profile.
- All client requests are made with the **anon key** — a safe, public key. It only grants access to what RLS policies explicitly allow.
- The **service role key** (bypasses RLS) is only used server-side in the dashboard's Next.js API routes and is never shipped to the mobile client.

---

## Row Level Security (RLS)

Every user-facing table has RLS enabled. The principle is **default deny** — unless a policy explicitly grants access, a query returns nothing (not an error, just empty results, so the app cannot fingerprint what exists).

### The golden rules

| Rule | Enforced by |
|------|------------|
| A user can only read their own `private_note` | `reviews` SELECT policy: `auth.uid() = user_id` |
| A user can only update their own reviews | `reviews` UPDATE policy: `auth.uid() = user_id` |
| A user can only update within 5 minutes of posting | DB trigger on `reviews.updated_at` |
| A user cannot read another user's diary entries | `reviews` SELECT policy |
| Restaurant admins can only read `public_note`, not `private_note` | Policy scoped to `public_note IS NOT NULL` via admin role |
| No user can insert a review on behalf of another user | INSERT policy: `auth.uid() = user_id` |

---

## The 5-Minute Edit Window

Reviews can be edited up to 5 minutes after they are created. After that, the database rejects the update at the trigger level — not the application level — so it cannot be bypassed by a modified client.

The trigger is defined in `database/review_rate_limit.sql`.

---

## Data Privacy

| Data | Who can see it |
|------|---------------|
| `reviews.private_note` | The author only |
| `reviews.public_note` | The author + restaurant admin (read-only) |
| `reviews.rating_thumbs` | Powers aggregate scores shown publicly (not attributed to individuals) |
| `reviews.photo_url` | Public (stored in Supabase Storage with a public URL) |
| `users.full_name` | Shown on public reviews — user consents to this at review time |
| `users.phone_number` | Not currently used (email auth in v1); stored but not exposed |
| `liked_items` | The author only |

---

## Storage Security

Review photos are stored in the `review-pics` Supabase Storage bucket.

- **Upload**: Authenticated users only, path scoped to their `user_id`
- **Read**: Public (photos are linked in public reviews intentionally)
- **Delete**: The owner of the file, or service role

Policy defined in `database/storage_policy.sql`.

---

## Admin Roles

| Role | Access |
|------|--------|
| `authenticated` (default) | Read restaurants/menus, manage own reviews and liked items |
| `restaurant_admin` | Read public reviews for their restaurant, manage their menu via dashboard |
| `super_admin` | Full access to all tables, including user management |

Roles are stored in `users.role` column and checked in RLS policies.

---

## What to watch before production

- [ ] Rotate the Supabase anon key if it has been committed to a public repo
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is **never** in `mobile/.env`
- [ ] Verify `private_note` is excluded from any dashboard queries
- [ ] Confirm the 5-minute edit trigger is applied in the production database
- [ ] Review Supabase Auth → Email Templates if using email magic links
- [ ] Audit `super_admin_rls.sql` before adding any new admin accounts
