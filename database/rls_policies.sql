-- BiteSync Row Level Security (RLS) Policies
-- This ensures your database cannot be hacked or abused from the frontend

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_attribute_values ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access for Menus (Anyone can see restaurants and menus)
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view categories" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Public can view item attributes" ON item_attributes
  FOR SELECT USING (true);

-- 3. Users can only read and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Reviews Security (The most critical part)
-- Users can only see their own reviews (containing the private note)
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view attribute values linked to their reviews
CREATE POLICY "Users can view own review attributes" ON review_attribute_values
  FOR SELECT USING (
    review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own review attributes" ON review_attribute_values
  FOR INSERT WITH CHECK (
    review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
  );

-- Note: The Restaurant Dashboard will use the 'service_role' key on the backend
-- which automatically bypasses RLS, allowing the restaurant to read all public feedback securely.
