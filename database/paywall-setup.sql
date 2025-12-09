-- User Subscriptions & Paywall Setup SQL
-- Run this in Supabase SQL Editor

-- Create user_subscriptions table to track premium memberships
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- free, premium, family, business
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, expired, trialing
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  razorpay_customer_id VARCHAR(255),
  razorpay_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  expense_limit INTEGER DEFAULT 50, -- Monthly expense limit
  expenses_this_month INTEGER DEFAULT 0,
  features_enabled JSONB DEFAULT '{"ocr": false, "budgets": false, "export": false, "csv_import": false, "subscriptions": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay ON user_subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Create payment_history table for transaction records
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(20) DEFAULT 'stripe', -- stripe, razorpay
  transaction_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, refunded
  plan_type VARCHAR(20),
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for payment history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_transaction ON payment_history(transaction_id);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for payment_history
CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Function to reset monthly expense counter
CREATE OR REPLACE FUNCTION reset_monthly_expense_counters()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET expenses_this_month = 0
  WHERE date_trunc('month', updated_at) < date_trunc('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION has_feature_access(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN plan_type IN ('premium', 'family', 'business') THEN TRUE
      WHEN features_enabled ? p_feature THEN (features_enabled->>p_feature)::boolean
      ELSE FALSE
    END INTO v_has_access
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active';
  
  RETURN COALESCE(v_has_access, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to increment expense counter
CREATE OR REPLACE FUNCTION increment_expense_counter(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_can_add BOOLEAN;
  v_current_count INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT expenses_this_month, expense_limit INTO v_current_count, v_limit
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active';
  
  IF v_current_count IS NULL THEN
    -- Create default subscription for new user
    INSERT INTO user_subscriptions (user_id, plan_type, status, expense_limit, expenses_this_month)
    VALUES (p_user_id, 'free', 'active', 50, 1)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN TRUE;
  END IF;
  
  IF v_current_count < v_limit THEN
    UPDATE user_subscriptions
    SET expenses_this_month = expenses_this_month + 1
    WHERE user_id = p_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create default free subscription for existing users
INSERT INTO user_subscriptions (user_id, plan_type, status, expense_limit, expenses_this_month)
SELECT id, 'free', 'active', 50, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_subscriptions IS 'Stores user subscription plans and limits';
COMMENT ON TABLE payment_history IS 'Records all payment transactions';
COMMENT ON COLUMN user_subscriptions.expense_limit IS 'Maximum expenses allowed per month';
COMMENT ON COLUMN user_subscriptions.expenses_this_month IS 'Current month expense count';
COMMENT ON COLUMN user_subscriptions.features_enabled IS 'JSON object of enabled features';
