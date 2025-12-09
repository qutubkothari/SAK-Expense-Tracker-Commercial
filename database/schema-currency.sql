-- Multi-Currency and Expense Tags Support

-- Add currency and tags columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS original_amount NUMERIC,
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS amount_inr NUMERIC,
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'personal', -- 'personal', 'business', 'travel'
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_reimbursable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS business_name TEXT; -- 'Ecommerce', 'IT', 'Trading NFF'

-- Create currency exchange rates table (for caching)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Insert common currencies (will be updated with live rates)
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  ('AED', 'INR', 22.5),
  ('USD', 'INR', 83.0),
  ('EUR', 'INR', 90.0),
  ('GBP', 'INR', 105.0),
  ('SGD', 'INR', 62.0),
  ('INR', 'INR', 1.0)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Create expense types reference
CREATE TABLE IF NOT EXISTS expense_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  color TEXT
);

INSERT INTO expense_types (name, icon, description, color) VALUES
  ('personal', '👤', 'Personal expenses', '#667eea'),
  ('business', '💼', 'Business/work expenses (reimbursable)', '#f093fb'),
  ('travel', '✈️', 'Travel expenses', '#4facfe')
ON CONFLICT (name) DO NOTHING;

-- Update existing expenses to have currency fields
UPDATE expenses 
SET 
  currency = 'INR',
  original_amount = amount,
  amount_inr = amount,
  exchange_rate = 1.0
WHERE currency IS NULL;

-- Create index for currency queries
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_location ON expenses(location);
CREATE INDEX IF NOT EXISTS idx_expenses_business ON expenses(business_name);
