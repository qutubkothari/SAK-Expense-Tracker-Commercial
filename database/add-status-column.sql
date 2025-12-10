-- Add status column to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing records to have active status
UPDATE user_subscriptions 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'status';
