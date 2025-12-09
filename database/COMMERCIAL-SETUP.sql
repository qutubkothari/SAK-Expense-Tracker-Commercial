-- ================================================================
-- BUSINESS EXPENSE MANAGER - COMMERCIAL DATABASE SETUP
-- ================================================================
-- Created: December 9, 2025
-- Purpose: Complete database schema for commercial version
-- Features: Single-user accounts, No RLS, No family system
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. USERS TABLE (Single Business User - No Family System)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  email TEXT,
  business_name TEXT,
  default_currency TEXT DEFAULT 'INR',
  default_language TEXT DEFAULT 'en',
  language_name TEXT DEFAULT 'English',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast phone lookup
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(is_premium);

-- ================================================================
-- 2. CATEGORIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Allow both user-specific and default categories
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_default ON categories(is_default);

-- ================================================================
-- 3. SUBCATEGORIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- ================================================================
-- 4. EXPENSES TABLE (Multi-Currency Support)
-- ================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  original_amount NUMERIC,
  exchange_rate NUMERIC DEFAULT 1.0,
  amount_inr NUMERIC,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  note TEXT,
  date TIMESTAMP NOT NULL,
  expense_type TEXT DEFAULT 'business', -- 'business', 'personal', 'travel'
  location TEXT,
  business_name TEXT,
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'bank', 'credit_card', 'debit_card', 'upi', 'wallet'
  payment_status TEXT DEFAULT 'paid', -- 'paid', 'unpaid'
  is_reimbursable BOOLEAN DEFAULT FALSE,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_business ON expenses(business_name);

-- ================================================================
-- 5. INCOME TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS income (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  amount_inr DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  source VARCHAR(255), -- Salary, Freelance, Business, Investment, etc.
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date DESC);

-- ================================================================
-- 6. BUDGETS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'monthly',
  start_date DATE,
  end_date DATE,
  alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_category ON budgets(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);

-- ================================================================
-- 7. BUDGET ALERTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  alert_type VARCHAR(20) NOT NULL,
  amount_spent DECIMAL(10, 2) NOT NULL,
  budget_amount DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_user ON budget_alerts(user_id, is_read);

-- ================================================================
-- 8. EXCHANGE RATES TABLE (Currency Support)
-- ================================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Insert common currencies
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  ('AED', 'INR', 22.5),
  ('USD', 'INR', 83.0),
  ('EUR', 'INR', 90.0),
  ('GBP', 'INR', 105.0),
  ('SGD', 'INR', 62.0),
  ('SAR', 'INR', 22.0),
  ('INR', 'INR', 1.0)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- ================================================================
-- 9. EXPENSE TYPES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS expense_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  color TEXT
);

INSERT INTO expense_types (name, icon, description, color) VALUES
  ('business', '💼', 'Business expenses', '#f093fb'),
  ('personal', '👤', 'Personal expenses', '#667eea'),
  ('travel', '✈️', 'Travel expenses', '#4facfe')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 10. TAX CATEGORIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS tax_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  is_deductible BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_categories_user ON tax_categories(user_id);

-- ================================================================
-- 11. SUBSCRIPTIONS TABLE (Recurring Expenses)
-- ================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly', 'weekly'
  next_billing_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  reminder_days INTEGER DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);

-- ================================================================
-- 12. AI INSIGHTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL, -- 'spending_pattern', 'budget_alert', 'recommendation'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id, is_read);

-- ================================================================
-- 13. USER PREFERENCES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  budget_alerts BOOLEAN DEFAULT TRUE,
  receipt_auto_scan BOOLEAN DEFAULT FALSE,
  voice_language TEXT DEFAULT 'en-US',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  first_day_of_week INTEGER DEFAULT 1, -- 0=Sunday, 1=Monday
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ================================================================
-- 14. INSERT DEFAULT CATEGORIES
-- ================================================================
INSERT INTO categories (name, icon, color, is_default, user_id) VALUES
  ('Food & Dining', '🍽️', '#43bfa0', TRUE, NULL),
  ('Transportation', '🚗', '#ffd166', TRUE, NULL),
  ('Shopping', '🛍️', '#b388eb', TRUE, NULL),
  ('Entertainment', '🎬', '#f67280', TRUE, NULL),
  ('Health', '🏥', '#5f6caf', TRUE, NULL),
  ('Bills & Utilities', '💡', '#3a506b', TRUE, NULL),
  ('Education', '📚', '#2d8f6f', TRUE, NULL),
  ('Personal Care', '💆', '#c06c84', TRUE, NULL),
  ('Travel', '✈️', '#4facfe', TRUE, NULL),
  ('Business', '💼', '#f093fb', TRUE, NULL)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 15. INSERT DEFAULT SUBCATEGORIES
-- ================================================================
INSERT INTO subcategories (category_id, name, icon, is_default) VALUES
  ((SELECT id FROM categories WHERE name = 'Food & Dining' AND is_default = TRUE LIMIT 1), 'Groceries', '🛒', TRUE),
  ((SELECT id FROM categories WHERE name = 'Food & Dining' AND is_default = TRUE LIMIT 1), 'Restaurants', '🍴', TRUE),
  ((SELECT id FROM categories WHERE name = 'Food & Dining' AND is_default = TRUE LIMIT 1), 'Coffee & Tea', '☕', TRUE),
  ((SELECT id FROM categories WHERE name = 'Transportation' AND is_default = TRUE LIMIT 1), 'Fuel', '⛽', TRUE),
  ((SELECT id FROM categories WHERE name = 'Transportation' AND is_default = TRUE LIMIT 1), 'Public Transit', '🚌', TRUE),
  ((SELECT id FROM categories WHERE name = 'Transportation' AND is_default = TRUE LIMIT 1), 'Taxi/Uber', '🚕', TRUE),
  ((SELECT id FROM categories WHERE name = 'Shopping' AND is_default = TRUE LIMIT 1), 'Clothing', '👕', TRUE),
  ((SELECT id FROM categories WHERE name = 'Shopping' AND is_default = TRUE LIMIT 1), 'Electronics', '📱', TRUE),
  ((SELECT id FROM categories WHERE name = 'Health' AND is_default = TRUE LIMIT 1), 'Doctor', '👨‍⚕️', TRUE),
  ((SELECT id FROM categories WHERE name = 'Health' AND is_default = TRUE LIMIT 1), 'Pharmacy', '💊', TRUE),
  ((SELECT id FROM categories WHERE name = 'Bills & Utilities' AND is_default = TRUE LIMIT 1), 'Electricity', '⚡', TRUE),
  ((SELECT id FROM categories WHERE name = 'Bills & Utilities' AND is_default = TRUE LIMIT 1), 'Internet', '🌐', TRUE)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 16. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_timestamp BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_timestamp BEFORE UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_timestamp BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_timestamp BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_timestamp BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 17. DISABLE RLS ON ALL TABLES (CLIENT REQUIREMENT)
-- ================================================================
-- Commercial version uses REST API without row-level security
-- Data access control handled at application layer

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE income DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- SETUP COMPLETE
-- ================================================================
SELECT 
  '✅ Business Expense Manager database setup complete!' AS status,
  'Single-user commercial version' AS version,
  'RLS disabled - REST API access' AS security_model,
  NOW() AS completed_at;
