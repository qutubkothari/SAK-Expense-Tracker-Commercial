-- =====================================================
-- CREATE MISSING USER_SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_type TEXT DEFAULT 'free',
  is_premium BOOLEAN DEFAULT false,
  premium_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- Create default subscription for existing user
INSERT INTO user_subscriptions (user_id, subscription_type, is_premium)
VALUES ('acb03f62-dfb1-4191-80d6-a526b28fda50', 'free', false)
ON CONFLICT DO NOTHING;

-- Verify
SELECT * FROM user_subscriptions;
