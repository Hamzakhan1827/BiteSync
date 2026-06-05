-- Phase 2: Automatic User Syncing
-- This ensures that when someone logs in via Google/Email, their data is instantly added to your marketing table!

-- 1. Since users might sign up with Email only, Phone Number shouldn't be strictly required anymore.
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;

-- 2. Create the automation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone_number)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'CraveSync Diner'),
    new.phone
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
