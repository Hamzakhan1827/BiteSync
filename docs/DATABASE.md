# Database Reference

All tables live in a Supabase-hosted PostgreSQL instance. Row Level Security (RLS) is enabled on every user-facing table.

---

## Entity Relationship Overview

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

---

## Tables

### `users`
Stores diner profiles. Populated automatically via a trigger on `auth.users` (Supabase Auth).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Matches `auth.uid()` |
| `phone_number` | `varchar(20)` | Unique, nullable (email auth used in v1) |
| `full_name` | `varchar(100)` | Displayed in reviews |
| `avatar_url` | `text` | Stores integer index (0–8) mapping to emoji avatars |
| `created_at` | `timestamptz` | Auto-set |

---

### `restaurants`
Managed by the admin dashboard. Public read for all authenticated users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `varchar(255)` | |
| `address` | `text` | |
| `logo_url` | `text` | URL to restaurant logo / hero image |
| `cuisine_type` | `text` | Comma-separated tags, e.g. `"Desi BBQ, Karahi"` |
| `price_range` | `text` | `"$"` / `"$$"` / `"$$$"` / `"$$$$"` |
| `opening_hours` | `jsonb` | `{ "mon": "12:00-00:00", "fri": "12:00-02:00", ... }` |
| `is_active` | `boolean` | Hidden from app if false |
| `created_at` | `timestamptz` | |

---

### `menu_categories`
Groups menu items within a restaurant (e.g. "Karahi & Handi", "BBQ Specials").

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `restaurant_id` | `uuid` FK → `restaurants.id` | Cascade delete |
| `name` | `varchar(100)` | Shown as section header in app |
| `sort_order` | `integer` | Controls display order |
| `created_at` | `timestamptz` | |

---

### `menu_items`
Individual dishes. Linked to a category (and therefore a restaurant).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `category_id` | `uuid` FK → `menu_categories.id` | Cascade delete |
| `name` | `varchar(255)` | |
| `description` | `text` | Optional |
| `price` | `integer` | Stored as whole number in PKR (e.g. `2200`) |
| `image_url` | `text` | URL to dish photo |
| `is_available` | `boolean` | If false, hidden from menu |
| `created_at` | `timestamptz` | |

---

### `reviews`
The dual-purpose core table. Serves as both the user's private food diary and the restaurant's public feedback feed.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `users.id` | Cascade delete |
| `menu_item_id` | `uuid` FK → `menu_items.id` | Cascade delete |
| `rating_thumbs` | `boolean` | `true` = 👍, `false` = 👎, `null` = no rating |
| `private_note` | `text` | Only the author can read this |
| `public_note` | `text` | Visible to restaurant and other diners |
| `photo_url` | `text` | URL to uploaded review photo (Supabase Storage) |
| `updated_at` | `timestamptz` | Set by DB trigger; used for 5-min edit window |
| `created_at` | `timestamptz` | |

> **Edit window:** A database trigger enforces that `updated_at` cannot be set more than 5 minutes after `created_at`. Edits outside this window are rejected.

---

### `liked_items`
Tracks a user's saved/favourite dishes.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `users.id` | Cascade delete |
| `item_id` | `uuid` FK → `menu_items.id` | Cascade delete |
| `created_at` | `timestamptz` | |

---

### `item_attributes` *(future use)*
Defines custom rating dimensions per dish (e.g. "Spice Level", "Crispiness"). Not yet active in the v1 UI.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `menu_item_id` | `uuid` FK | |
| `attribute_name` | `varchar(100)` | e.g. `"Spice Level"` |
| `attribute_type` | `varchar(50)` | `"slider"` / `"boolean"` / `"text"` |
| `min_label` | `varchar(50)` | e.g. `"Too Mild"` |
| `max_label` | `varchar(50)` | e.g. `"Too Spicy"` |

---

### `review_attribute_values` *(future use)*
Stores the diner's response to each attribute for a given review.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `review_id` | `uuid` FK → `reviews.id` | |
| `item_attribute_id` | `uuid` FK | |
| `value_numeric` | `integer` | For sliders (0–100) |
| `value_boolean` | `boolean` | For toggle attributes |
| `value_text` | `text` | For free-text attributes |

---

## Row Level Security (RLS)

All user-facing tables have RLS enabled. The policies below are the enforced rules.

### `users`
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read their own row | SELECT | `auth.uid() = id` |
| Users can update their own row | UPDATE | `auth.uid() = id` |
| Service role can read all | SELECT | `true` (service role only) |

### `restaurants`
| Policy | Operation | Rule |
|--------|-----------|------|
| All authenticated users can read | SELECT | `auth.role() = 'authenticated'` |
| Only service role can insert/update | INSERT/UPDATE | Service role only |

### `reviews`
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read their own reviews | SELECT | `auth.uid() = user_id` |
| Restaurant admins can read public notes | SELECT | `public_note IS NOT NULL` (via admin role) |
| Users can insert their own reviews | INSERT | `auth.uid() = user_id` |
| Users can update within 5-min window | UPDATE | `auth.uid() = user_id` (trigger enforces time limit) |
| Users can delete their own reviews | DELETE | `auth.uid() = user_id` |

### `liked_items`
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read their own | SELECT | `auth.uid() = user_id` |
| Users can insert their own | INSERT | `auth.uid() = user_id` |
| Users can delete their own | DELETE | `auth.uid() = user_id` |

---

## Indexes

All indexes are defined in `database/indexes.sql`.

```sql
CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX idx_menu_items_category         ON menu_items(category_id);
CREATE INDEX idx_item_attributes_item        ON item_attributes(menu_item_id);
CREATE INDEX idx_reviews_user                ON reviews(user_id);
CREATE INDEX idx_reviews_item                ON reviews(menu_item_id);
CREATE INDEX idx_review_values_review        ON review_attribute_values(review_id);
```

---

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `review-pics` | User-uploaded review photos | Authenticated users can upload; public read |

---

## SQL Files Reference

| File | Purpose |
|------|---------|
| `schema.sql` | Full table definitions |
| `rls_policies.sql` | All RLS policies |
| `reviews_rls_complete.sql` | Reviews-specific RLS (SELECT, INSERT, UPDATE, DELETE) |
| `auth_trigger.sql` | Auto-creates `users` row on Supabase Auth signup |
| `indexes.sql` | Performance indexes |
| `seed.sql` | 5 seed restaurants + menus |
| `seed_fake_reviews.sql` | Mock reviews for testing |
| `security_hardening.sql` | Additional security constraints |
| `review_rate_limit.sql` | 5-minute edit window trigger |
| `liked_items.sql` | liked_items table + policies |
| `storage_policy.sql` | Storage bucket policies |
| `setup_roles.sql` | `restaurant_admin`, `super_admin` roles |
