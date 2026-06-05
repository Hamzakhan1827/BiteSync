-- Demo Account Setup Script

-- 1. Setup Kolachi Manager
-- Sign up on the Dashboard with 'kolachi@cravesync.com' first, then run this:
UPDATE public.users 
SET managed_restaurant_id = (SELECT id FROM restaurants WHERE name = 'Kolachi' LIMIT 1)
WHERE email = 'kolachi@cravesync.com';

-- 2. Setup Xander's Manager
-- Sign up on the Dashboard with 'xanders@cravesync.com' first, then run this:
UPDATE public.users 
SET managed_restaurant_id = (SELECT id FROM restaurants WHERE name = 'Xanders' LIMIT 1)
WHERE email = 'xanders@cravesync.com';
