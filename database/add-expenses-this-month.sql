-- Add expenses_this_month column to track monthly expense count
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS expenses_this_month INTEGER DEFAULT 0;

-- Update existing records to have 0 as default
UPDATE user_subscriptions 
SET expenses_this_month = 0 
WHERE expenses_this_month IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'expenses_this_month';
