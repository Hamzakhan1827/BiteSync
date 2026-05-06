-- Phase 2: Security Lockdown
-- Now that our Mobile App uses real Authentication and our Dashboard uses the secure Service Key,
-- we must delete the temporary wireframe bypasses to protect our data.

DROP POLICY IF EXISTS "Allow public inserts during wireframe phase" ON reviews;
DROP POLICY IF EXISTS "Allow public select during wireframe phase" ON reviews;

-- The Database is now officially impenetrable again. 
-- Only logged-in diners can review, and only your secure Dashboard can read!
