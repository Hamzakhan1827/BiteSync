-- ============================================================
-- BiteSync: DB-Level Review Rate Limiting
-- Enforces limits that the mobile client already checks,
-- but now they cannot be bypassed by direct API calls.
--
-- Rules enforced:
--   - Max 5 reviews per user per calendar day (UTC)
--   - Max 2 reviews per user per menu item per calendar day (UTC)
--
-- Run in Supabase SQL Editor AFTER security_hardening.sql
-- ============================================================


CREATE OR REPLACE FUNCTION enforce_review_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  today_start TIMESTAMPTZ;
  daily_count  INTEGER;
  item_count   INTEGER;
BEGIN
  -- Use UTC day boundary so limits are consistent regardless of user timezone
  today_start := DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';

  -- Count total reviews this user has submitted today
  SELECT COUNT(*) INTO daily_count
  FROM reviews
  WHERE user_id    = NEW.user_id
    AND created_at >= today_start;

  IF daily_count >= 5 THEN
    RAISE EXCEPTION 'Daily review limit reached. You can submit up to 5 reviews per day.'
      USING ERRCODE = 'check_violation',
            HINT    = 'DAILY_LIMIT_REACHED';
  END IF;

  -- Count how many times this user reviewed this specific item today
  SELECT COUNT(*) INTO item_count
  FROM reviews
  WHERE user_id      = NEW.user_id
    AND menu_item_id = NEW.menu_item_id
    AND created_at  >= today_start;

  IF item_count >= 2 THEN
    RAISE EXCEPTION 'Item review limit reached. You can review the same dish up to 2 times per day.'
      USING ERRCODE = 'check_violation',
            HINT    = 'ITEM_LIMIT_REACHED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Drop and recreate so re-runs are idempotent
DROP TRIGGER IF EXISTS trg_enforce_review_rate_limit ON reviews;

CREATE TRIGGER trg_enforce_review_rate_limit
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION enforce_review_rate_limit();


-- ============================================================
-- INDEX: speeds up the COUNT queries in the trigger
-- Without this, every review insert scans the reviews table.
-- Critical for performance at 100k+ users.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reviews_user_created
  ON reviews (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_item_created
  ON reviews (user_id, menu_item_id, created_at DESC);


-- ============================================================
-- VERIFICATION — run these after applying to confirm
-- ============================================================

-- 1. Confirm trigger exists:
-- SELECT trigger_name, event_manipulation, action_timing
-- FROM information_schema.triggers
-- WHERE trigger_name = 'trg_enforce_review_rate_limit';

-- 2. Confirm indexes exist:
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'reviews'
--   AND indexname IN ('idx_reviews_user_created', 'idx_reviews_user_item_created');

-- 3. Manual smoke test (use a real user_id and menu_item_id from your DB):
-- INSERT INTO reviews (user_id, menu_item_id, rating_thumbs)
-- VALUES ('your-user-uuid', 'your-item-uuid', true);
-- Run it 3 times for the same item — the 3rd should throw ITEM_LIMIT_REACHED.
-- Run it 6 times total across different items — the 6th should throw DAILY_LIMIT_REACHED.
