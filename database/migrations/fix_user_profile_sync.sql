-- ============================================================
-- CraveSync: Permanent User Profile Sync Fix
-- Run in Supabase SQL Editor in one shot. Safe to re-run.
--
-- Edge cases covered:
--   1. Brand new email, first signup           → INSERT
--   2. Same user, same auth ID re-triggers     → ON CONFLICT DO NOTHING
--   3. Re-registration (same email, new ID)    → ID realignment with cascade
--   4. Auth user exists but no profile row     → backfill INSERT
--   5. Two active auth users claim same email  → BLOCKED (safety guard)
-- ============================================================


-- ============================================================
-- STEP 1: Fix enforce_review_edit_window
-- Only enforces the 5-min window for content edits.
-- user_id-only changes (account migration) are allowed through.
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_review_edit_window()
RETURNS TRIGGER AS $$
BEGIN
  -- Ownership transfers (user_id change) are not content edits.
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RETURN NEW;
  END IF;

  IF NOW() - OLD.created_at > INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Review edit window has expired. Reviews can only be edited within 5 minutes of submission.'
      USING ERRCODE = 'check_violation',
            HINT    = 'EDIT_WINDOW_EXPIRED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 2: Add ON UPDATE CASCADE to reviews FK
-- Only reviews references public.users(id).
-- liked_items and favourites reference auth.users(id) directly
-- so they are unaffected by profile ID changes.
-- ============================================================
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


-- ============================================================
-- STEP 3: Rewrite handle_new_user trigger
-- Handles all cases. Key safety rule: only realign profile IDs
-- when the old auth user no longer exists in auth.users.
-- This prevents two active users from ever collapsing together
-- (Supabase also enforces unique emails, so this is double-guarded).
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_profile_id UUID;
  old_auth_still_exists BOOLEAN;
BEGIN
  -- Check if this email already has a profile under a different UUID
  SELECT id INTO existing_profile_id
  FROM public.users
  WHERE email = NEW.email;

  IF existing_profile_id IS NOT NULL AND existing_profile_id != NEW.id THEN

    -- Safety guard: only migrate if the OLD auth user is truly gone.
    -- If the old auth user still exists, two active accounts would be claiming
    -- the same email — this should never happen on Supabase (unique email
    -- constraint), but we refuse to silently merge data if it somehow does.
    SELECT EXISTS(
      SELECT 1 FROM auth.users WHERE id = existing_profile_id
    ) INTO old_auth_still_exists;

    IF old_auth_still_exists THEN
      -- Two live auth users, same email — something is very wrong upstream.
      -- Do NOT touch either profile. Log it and abort safely.
      RAISE WARNING 'handle_new_user: email % has two active auth users (% and %). Profile not migrated.',
        NEW.email, existing_profile_id, NEW.id;
      RETURN NEW;
    END IF;

    -- Safe to migrate: old auth user is gone, new one takes the profile.
    -- ON UPDATE CASCADE propagates the new ID to reviews automatically.
    UPDATE public.users
    SET id = NEW.id
    WHERE id = existing_profile_id;

  ELSIF existing_profile_id IS NULL THEN
    -- Normal new user — create their profile.
    INSERT INTO public.users (id, full_name, email, phone_number)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
      ),
      NEW.email,
      NEW.phone
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  -- existing_profile_id = NEW.id means profile is already correct — do nothing.

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth user creation. Log the error for debugging.
  RAISE WARNING 'handle_new_user failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- STEP 4: One-time repair — fix existing mismatched profiles
-- Only realigns profiles where the old auth user is truly gone.
-- Skips any pair where both auth accounts are still active.
-- ============================================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT au.id AS new_id, pu.id AS old_id, au.email
    FROM auth.users au
    JOIN public.users pu ON au.email = pu.email
    WHERE au.id != pu.id
  LOOP
    -- Safety check: refuse to migrate if old auth user still exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = rec.old_id) THEN
      RAISE WARNING 'Skipping %: both auth users (% and %) are still active', rec.email, rec.old_id, rec.new_id;
      CONTINUE;
    END IF;

    RAISE NOTICE 'Migrating profile for % : % -> %', rec.email, rec.old_id, rec.new_id;
    UPDATE public.users SET id = rec.new_id WHERE id = rec.old_id;
    -- reviews.user_id follows via ON UPDATE CASCADE
  END LOOP;
END $$;


-- ============================================================
-- STEP 5: Backfill — create profiles for auth users with no row
-- ============================================================
INSERT INTO public.users (id, full_name, email, phone_number)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'username',
    split_part(au.email, '@', 1)
  ),
  au.email,
  au.phone
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- VERIFICATION
-- ============================================================

-- 1. No mismatched or missing profiles should remain:
-- SELECT au.id AS auth_id, pu.id AS profile_id, au.email
-- FROM auth.users au
-- LEFT JOIN public.users pu ON au.id = pu.id
-- WHERE pu.id IS NULL;
-- Expected: 0 rows

-- 2. reviews FK has ON UPDATE CASCADE:
-- SELECT rc.constraint_name, rc.update_rule
-- FROM information_schema.referential_constraints rc
-- JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
-- WHERE tc.table_name = 'reviews' AND rc.constraint_name = 'reviews_user_id_fkey';
-- Expected: update_rule = CASCADE

-- 3. Any warnings from the migration loop (two active users / skipped rows)?
-- Check the Messages tab in Supabase SQL editor after running.
