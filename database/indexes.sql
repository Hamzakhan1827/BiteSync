-- ============================================================
-- BiteSync: Performance Indexes for 100k+ Users
-- Run in Supabase SQL Editor
--
-- NOTE: indexes from review_rate_limit.sql already cover:
--   idx_reviews_user_created          (user_id, created_at DESC)
--   idx_reviews_user_item_created     (user_id, menu_item_id, created_at DESC)
--
-- NOTE: indexes from liked_items.sql already cover:
--   idx_liked_items_user              (user_id)
--   idx_liked_items_item              (menu_item_id)
--
-- This file covers all remaining hot query paths.
-- ============================================================


-- ============================================================
-- reviews table
-- ============================================================

-- fetchItemReviews: public note feed per dish (paginated, ordered)
-- Powers the "What Diners Are Saying" section on item detail page.
-- Partial index — only indexes rows that actually have a public note,
-- keeping the index small while covering 100% of the query.
CREATE INDEX IF NOT EXISTS idx_reviews_item_public_note
  ON reviews (menu_item_id, created_at DESC)
  WHERE public_note IS NOT NULL AND public_note != '';

-- fetchRestaurantRatings / fetchMenu stats: rating aggregation per item
-- Already partially covered by idx_reviews_user_item_created but that
-- filters by user_id. This one is for cross-user aggregation per item.
CREATE INDEX IF NOT EXISTS idx_reviews_item_rating
  ON reviews (menu_item_id, rating_thumbs)
  WHERE rating_thumbs IS NOT NULL;


-- ============================================================
-- menu_items table
-- ============================================================

-- fetchMenu: filter available items by category (restaurant join path)
CREATE INDEX IF NOT EXISTS idx_menu_items_category_available
  ON menu_items (category_id)
  WHERE is_available = true;

-- Global dish search: ilike on name (used in search view)
-- Note: PostgreSQL can use this for prefix matches and trigram if
-- pg_trgm is enabled. For now it speeds up equality/prefix lookups.
CREATE INDEX IF NOT EXISTS idx_menu_items_name
  ON menu_items (name);


-- ============================================================
-- menu_categories table
-- ============================================================

-- fetchMenu inner join path: categories → restaurant
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant
  ON menu_categories (restaurant_id);


-- ============================================================
-- restaurants table
-- ============================================================

-- Main listing: only active restaurants are shown
CREATE INDEX IF NOT EXISTS idx_restaurants_active
  ON restaurants (is_active, created_at DESC)
  WHERE is_active = true;


-- ============================================================
-- favourites table
-- ============================================================

-- fetchFavourites: user's saved restaurants
CREATE INDEX IF NOT EXISTS idx_favourites_user
  ON favourites (user_id);


-- ============================================================
-- VERIFICATION — run after applying
-- ============================================================

-- SELECT indexname, tablename, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexname IN (
--     'idx_reviews_item_public_note',
--     'idx_reviews_item_rating',
--     'idx_menu_items_category_available',
--     'idx_menu_items_name',
--     'idx_menu_categories_restaurant',
--     'idx_restaurants_active',
--     'idx_favourites_user'
--   )
-- ORDER BY tablename, indexname;
