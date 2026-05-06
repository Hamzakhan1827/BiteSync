-- Demo Account Setup Script

-- 1. Setup Kolachi Manager
-- Sign up on the Dashboard with 'kolachi@bitesync.com' first, then run this:
UPDATE public.users 
SET managed_restaurant_id = (SELECT id FROM restaurants WHERE name = 'Kolachi' LIMIT 1)
WHERE email = 'kolachi@bitesync.com';

-- 2. Setup Xander's Manager
-- Sign up on the Dashboard with 'xanders@bitesync.com' first, then run this:
UPDATE public.users 
SET managed_restaurant_id = (SELECT id FROM restaurants WHERE name = 'Xanders' LIMIT 1)
WHERE email = 'xanders@bitesync.com';
