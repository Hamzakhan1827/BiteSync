-- CraveSync v2 migrations — run in Supabase SQL Editor

-- 1. Add cuisine_type and opening_hours to restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine_type TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- 2. Add photo_url to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 3. Favourites table
CREATE TABLE IF NOT EXISTS favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- 4. RLS for favourites
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favourites" ON favourites
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Seed cuisine types + opening hours for demo restaurants
-- Replace IDs with your actual restaurant IDs from the restaurants table
-- Run: SELECT id, name FROM restaurants; first to get the correct IDs

-- Example seed (update the WHERE clauses with real restaurant names):
UPDATE restaurants SET cuisine_type = 'Desi, BBQ', opening_hours = '12:00 PM - 11:00 PM' WHERE name ILIKE '%Kolachi%';
UPDATE restaurants SET cuisine_type = 'Desi, Nihari', opening_hours = '7:00 AM - 3:00 PM' WHERE name ILIKE '%Nihari%';
UPDATE restaurants SET cuisine_type = 'Fast Food, Burgers', opening_hours = '10:00 AM - 12:00 AM' WHERE name ILIKE '%Xander%';
UPDATE restaurants SET cuisine_type = 'Fast Food, Spicy', opening_hours = '11:00 AM - 11:00 PM' WHERE name ILIKE '%Spicy%';
UPDATE restaurants SET cuisine_type = 'Japanese, Sushi', opening_hours = '1:00 PM - 11:00 PM' WHERE name ILIKE '%Sakura%';
