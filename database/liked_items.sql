-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS liked_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

ALTER TABLE liked_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own liked items" ON liked_items
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
