-- Add plan_type column to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- Update existing records to match subscription_type
UPDATE user_subscriptions 
SET plan_type = subscription_type 
WHERE plan_type IS NULL OR plan_type = 'free';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'plan_type';
