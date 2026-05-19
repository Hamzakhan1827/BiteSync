-- Phase 1: AI Follow-up Emails
-- Run this migration in your Supabase SQL editor

-- Add follow-up policy columns to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS followup_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS followup_policy TEXT DEFAULT 'apology_only'
    CHECK (followup_policy IN ('apology_only', 'discount_offer', 'free_item', 'custom_message')),
  ADD COLUMN IF NOT EXISTS followup_discount_percent INTEGER DEFAULT 10
    CHECK (followup_discount_percent BETWEEN 5 AND 50),
  ADD COLUMN IF NOT EXISTS followup_custom_template TEXT;

-- Track every follow-up email sent (prevents spam, enables audit)
CREATE TABLE IF NOT EXISTS ai_followup_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE UNIQUE, -- one follow-up per review
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  policy_used TEXT NOT NULL,
  generated_message TEXT,
  email_sent_to TEXT,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'failed', 'skipped')),
  skip_reason TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_followup_log_restaurant ON ai_followup_log(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_followup_log_user ON ai_followup_log(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_log_sent_at ON ai_followup_log(sent_at);

-- RLS: dashboard reads via service_role (supabase-admin), no public access needed
ALTER TABLE ai_followup_log ENABLE ROW LEVEL SECURITY;
