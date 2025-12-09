-- Subscription Detection Setup SQL
-- Run this in Supabase SQL Editor

-- Drop existing table if needed (be careful in production!)
-- DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, weekly, yearly
  next_payment_date DATE NOT NULL,
  last_payment_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_confirmed BOOLEAN DEFAULT false, -- User confirmed this is a subscription
  detection_confidence DECIMAL(5, 2) DEFAULT 0.0, -- 0-100 confidence score
  occurrence_count INTEGER DEFAULT 0, -- Number of times detected
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON subscriptions(next_payment_date);

-- Create subscription_transactions junction table (links expenses to subscriptions)
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subscription_id, expense_id)
);

-- Create index for junction table
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_sub ON subscription_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_exp ON subscription_transactions(expense_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription transactions" ON subscription_transactions;
DROP POLICY IF EXISTS "Users can insert their own subscription transactions" ON subscription_transactions;
DROP POLICY IF EXISTS "Users can delete their own subscription transactions" ON subscription_transactions;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for subscription_transactions
CREATE POLICY "Users can view their own subscription transactions"
  ON subscription_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_transactions.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own subscription transactions"
  ON subscription_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_transactions.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own subscription transactions"
  ON subscription_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_transactions.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Grant permissions (if needed)
-- GRANT ALL ON subscriptions TO authenticated;
-- GRANT ALL ON subscription_transactions TO authenticated;

COMMENT ON TABLE subscriptions IS 'Stores detected recurring subscriptions and bills';
COMMENT ON TABLE subscription_transactions IS 'Links expenses to detected subscriptions';
COMMENT ON COLUMN subscriptions.detection_confidence IS 'Confidence score (0-100) based on pattern matching';
COMMENT ON COLUMN subscriptions.occurrence_count IS 'Number of times this pattern was detected';
COMMENT ON COLUMN subscriptions.is_confirmed IS 'Whether user has confirmed this is a real subscription';
