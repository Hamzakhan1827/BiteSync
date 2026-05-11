-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS liked_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

ALTER TABLE liked_items ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own liked items
CREATE POLICY "Users can view own liked items" ON liked_items
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT / UPDATE / DELETE: users can manage their own
CREATE POLICY "Users manage own liked items" ON liked_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_liked_items_user ON liked_items(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_items_item ON liked_items(menu_item_id);
