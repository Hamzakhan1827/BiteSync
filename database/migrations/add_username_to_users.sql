-- ============================================================
-- CraveSync: Add username column to public.users
-- Keeps username in sync so reviews can display it via JOIN.
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Add the column (safe to re-run)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Backfill username from auth metadata for all existing users
UPDATE public.users pu
SET username = au.raw_user_meta_data->>'username'
FROM auth.users au
WHERE au.id = pu.id
  AND au.raw_user_meta_data->>'username' IS NOT NULL;

-- 3. Fix full_name for users still stuck on the 'CraveSync Diner' default
--    Replace it with their chosen username from auth metadata
UPDATE public.users pu
SET full_name = au.raw_user_meta_data->>'username'
FROM auth.users au
WHERE au.id = pu.id
  AND au.raw_user_meta_data->>'username' IS NOT NULL
  AND (pu.full_name = 'CraveSync Diner' OR pu.full_name IS NULL);

-- 4. Update the handle_new_user trigger to also write username on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_profile_id UUID;
  old_auth_still_exists BOOLEAN;
BEGIN
  SELECT id INTO existing_profile_id
  FROM public.users
  WHERE email = NEW.email;

  IF existing_profile_id IS NOT NULL AND existing_profile_id != NEW.id THEN
    SELECT EXISTS(
      SELECT 1 FROM auth.users WHERE id = existing_profile_id
    ) INTO old_auth_still_exists;

    IF old_auth_still_exists THEN
      RAISE WARNING 'handle_new_user: email % has two active auth users (% and %). Profile not migrated.',
        NEW.email, existing_profile_id, NEW.id;
      RETURN NEW;
    END IF;

    UPDATE public.users SET id = NEW.id WHERE id = existing_profile_id;

  ELSIF existing_profile_id IS NULL THEN
    INSERT INTO public.users (id, full_name, username, email, phone_number)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
      ),
      NEW.raw_user_meta_data->>'username',
      NEW.email,
      NEW.phone
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- VERIFICATION
-- SELECT id, full_name, username, email FROM public.users LIMIT 10;
