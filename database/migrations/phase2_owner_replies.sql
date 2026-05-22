-- Phase 2: Owner Replies on Reviews
-- Run in Supabase SQL Editor

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS owner_reply TEXT,
  ADD COLUMN IF NOT EXISTS owner_reply_at TIMESTAMP WITH TIME ZONE;
