-- Set demo opening hours for all restaurants
-- Run this in Supabase SQL Editor

-- Add column if not already added (safe to re-run)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- Set timings for each restaurant
UPDATE restaurants SET opening_hours = '12:00 PM - 11:00 PM' WHERE name ILIKE '%Kolachi%';
UPDATE restaurants SET opening_hours = '7:00 AM - 3:00 PM'   WHERE name ILIKE '%Nihari%';
UPDATE restaurants SET opening_hours = '10:00 AM - 11:00 PM'  WHERE name ILIKE '%Xander%';
UPDATE restaurants SET opening_hours = '11:00 AM - 11:00 PM'  WHERE name ILIKE '%Spicy%';
UPDATE restaurants SET opening_hours = '1:00 PM - 10:00 PM'   WHERE name ILIKE '%Sakura%';

-- Verify the result
SELECT name, opening_hours FROM restaurants ORDER BY name;
