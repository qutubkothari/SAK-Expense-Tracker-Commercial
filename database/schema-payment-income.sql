-- Add payment method, payment status, and income tracking fields
-- Run this SQL in your Supabase SQL Editor

-- 1. Add payment_method and payment_status columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'paid';

-- Add comment to explain the columns
COMMENT ON COLUMN expenses.payment_method IS 'Payment method: cash, bank, credit_card, debit_card, upi, wallet';
COMMENT ON COLUMN expenses.payment_status IS 'Payment status: paid or unpaid';

-- 2. Create income tracking table
CREATE TABLE IF NOT EXISTS income (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  amount_inr DECIMAL(10, 2) NOT NULL, -- Converted to INR for consistency
  currency VARCHAR(10) DEFAULT 'INR',
  source VARCHAR(255), -- Salary, Freelance, Business, Investment, etc.
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_income_user_created ON income(user_id, created_at DESC);

-- 3. Create income budget table (monthly budgets)
CREATE TABLE IF NOT EXISTS income_budgets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  budgeted_income DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one budget per user per month
  CONSTRAINT unique_income_budget UNIQUE (user_id, month, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_income_budget_user ON income_budgets(user_id, year, month);

-- Note: RLS (Row Level Security) is not enabled since this app uses custom authentication
-- Data access control is handled at the application layer
-- If you want to enable RLS in the future, you'll need to set up proper policies

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_income_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_income_timestamp
  BEFORE UPDATE ON income
  FOR EACH ROW
  EXECUTE FUNCTION update_income_updated_at();

CREATE TRIGGER update_income_budgets_timestamp
  BEFORE UPDATE ON income_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_income_updated_at();

-- Success message
SELECT 'Schema updated successfully! Payment method, payment status, and income tracking features added.' AS message;
