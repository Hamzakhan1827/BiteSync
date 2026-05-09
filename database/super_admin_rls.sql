-- SUPER ADMIN RLS FIX 
-- Run this in the Supabase SQL Editor

-- 0. Ensure users can read their own data from the users table (required for EXISTS checks to work)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
TO authenticated
USING (true);


-- 1. Policies for restaurants table
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can manage all restaurants" ON restaurants;
CREATE POLICY "Super admins can manage all restaurants"
ON restaurants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_super_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_super_admin = true
  )
);

DROP POLICY IF EXISTS "Public can view all restaurants" ON restaurants;
CREATE POLICY "Public can view all restaurants"
ON restaurants
FOR SELECT
TO public
USING (true);


-- 2. Policies for menu_items table
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins and managers can manage menu items" ON menu_items;
CREATE POLICY "Super admins and managers can manage menu items"
ON menu_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (
      users.is_super_admin = true OR 
      EXISTS (
        SELECT 1 FROM menu_categories 
        WHERE menu_categories.id = menu_items.category_id 
        AND menu_categories.restaurant_id = users.managed_restaurant_id
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (
      users.is_super_admin = true OR 
      EXISTS (
        SELECT 1 FROM menu_categories 
        WHERE menu_categories.id = menu_items.category_id 
        AND menu_categories.restaurant_id = users.managed_restaurant_id
      )
    )
  )
);

DROP POLICY IF EXISTS "Public can view all menu items" ON menu_items;
CREATE POLICY "Public can view all menu items"
ON menu_items
FOR SELECT
TO public
USING (true);


-- 3. Policies for menu_categories table
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins and managers can manage categories" ON menu_categories;
CREATE POLICY "Super admins and managers can manage categories"
ON menu_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.is_super_admin = true OR users.managed_restaurant_id = menu_categories.restaurant_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.is_super_admin = true OR users.managed_restaurant_id = menu_categories.restaurant_id)
  )
);

DROP POLICY IF EXISTS "Public can view all categories" ON menu_categories;
CREATE POLICY "Public can view all categories"
ON menu_categories
FOR SELECT
TO public
USING (true);
