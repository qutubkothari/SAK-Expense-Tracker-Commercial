-- Add missing columns to user_subscriptions table for full paywall functionality
-- This fixes: "Could not find the 'expense_limit' column of 'user_subscriptions'"

-- Add expense_limit column (tracks monthly expense limit per plan)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS expense_limit INTEGER DEFAULT 50;

-- Add expense_count column (tracks current month's expense count)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS expense_count INTEGER DEFAULT 0;

-- Add last_reset_date column (tracks when expense_count was last reset)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;

-- Add stripe_customer_id for payment processing
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add stripe_subscription_id for subscription management
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add plan_features column for storing plan-specific features as JSON
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS plan_features JSONB DEFAULT '{}'::jsonb;

-- Update existing free users with correct limits
UPDATE user_subscriptions 
SET expense_limit = 50,
    expense_count = 0,
    last_reset_date = CURRENT_DATE
WHERE subscription_type = 'free' AND expense_limit IS NULL;

-- Update existing premium users with higher limits
UPDATE user_subscriptions 
SET expense_limit = 999999,
    expense_count = 0,
    last_reset_date = CURRENT_DATE
WHERE subscription_type IN ('premium', 'premium_monthly', 'premium_yearly') AND expense_limit IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Check existing data
SELECT 
    user_id,
    subscription_type,
    is_premium,
    expense_limit,
    expense_count,
    last_reset_date,
    created_at
FROM user_subscriptions
LIMIT 5;
