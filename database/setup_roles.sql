-- Phase 4: B2B Multi-Tenancy & Platform Owner Setup

-- 1. Add the necessary columns to the users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS managed_restaurant_id UUID REFERENCES restaurants(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 2. Setup the Kolachi Manager (Replace with the exact email you used to test earlier)
UPDATE public.users 
SET managed_restaurant_id = (SELECT id FROM restaurants WHERE name = 'Kolachi' LIMIT 1)
WHERE email = 'admin@kolachi.com';

-- 3. Setup YOUR Platform Owner Account (You can see ALL data across ALL restaurants)
-- NOTE: Make sure you have created an account with this email in your mobile app first!
UPDATE public.users 
SET is_super_admin = true 
WHERE email = 'jawan1827@gmail.com';
