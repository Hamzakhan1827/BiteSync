-- ============================================================
-- CraveSync Security Hardening
-- Run in Supabase SQL Editor AFTER reviews_rls_complete.sql
-- ============================================================


-- ============================================================
-- 1. ENFORCE 5-MINUTE EDIT WINDOW AT THE DATABASE LEVEL
--    The audit noted this was frontend-only. A user calling the
--    Supabase API directly could bypass it. This trigger makes
--    it airtight at the DB level regardless of client.
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_review_edit_window()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates only within 5 minutes of creation
  IF NOW() - OLD.created_at > INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Review edit window has expired. Reviews can only be edited within 5 minutes of submission.'
      USING ERRCODE = 'check_violation',
            HINT    = 'EDIT_WINDOW_EXPIRED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present, then recreate
DROP TRIGGER IF EXISTS trg_enforce_review_edit_window ON reviews;

CREATE TRIGGER trg_enforce_review_edit_window
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION enforce_review_edit_window();


-- ============================================================
-- 2. HARDEN STORAGE: Enforce path-based ownership on uploads
--    Current policy lets ANY authenticated user upload to ANY
--    path in the review-photos bucket. This scopes uploads to
--    paths that start with the user's own UID.
--    Convention: review-photos/{user_id}/{filename}
-- ============================================================

-- Remove the overly-permissive upload policy
DROP POLICY IF EXISTS "Authenticated users can upload review photos" ON storage.objects;

-- Replace with owner-scoped upload policy
CREATE POLICY "Users can only upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete only their own photos
DROP POLICY IF EXISTS "Users can delete own review photos" ON storage.objects;
CREATE POLICY "Users can delete own review photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update (overwrite) only their own photos
DROP POLICY IF EXISTS "Users can update own review photos" ON storage.objects;
CREATE POLICY "Users can update own review photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 3. FILL MISSING RLS GAPS: review_attribute_values
--    The original rls_policies.sql only has SELECT + INSERT.
--    UPDATE and DELETE are missing — meaning a user who crafts
--    a direct API call could mutate or delete any row they can
--    reference by review_id if those operations are unguarded.
-- ============================================================

-- UPDATE: only allow on attributes belonging to own reviews
DROP POLICY IF EXISTS "Users can update own review attributes" ON review_attribute_values;
CREATE POLICY "Users can update own review attributes"
ON review_attribute_values FOR UPDATE
USING (
  review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
)
WITH CHECK (
  review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
);

-- DELETE: only allow on attributes belonging to own reviews
DROP POLICY IF EXISTS "Users can delete own review attributes" ON review_attribute_values;
CREATE POLICY "Users can delete own review attributes"
ON review_attribute_values FOR DELETE
USING (
  review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
);


-- ============================================================
-- 4. LOCK DOWN users TABLE: Missing INSERT policy
--    Without an explicit INSERT policy, a user could potentially
--    insert arbitrary rows into the users table.
--    The auth trigger handles legitimate profile creation, so
--    no direct INSERT from the client should be needed.
-- ============================================================

DROP POLICY IF EXISTS "No direct user row creation" ON users;
CREATE POLICY "No direct user row creation"
ON users FOR INSERT
WITH CHECK (false);
-- Note: The auth trigger (auth_trigger.sql) creates rows via
-- SECURITY DEFINER so it bypasses this policy correctly.


-- ============================================================
-- VERIFICATION QUERIES (run these after applying to confirm)
-- ============================================================

-- Check trigger exists:
-- SELECT trigger_name, event_manipulation, action_timing
-- FROM information_schema.triggers
-- WHERE trigger_name = 'trg_enforce_review_edit_window';

-- Check all policies on reviews:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'reviews';

-- Check storage policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects';

-- Check review_attribute_values policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'review_attribute_values';
