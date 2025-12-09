-- AI Features Database Schema Extensions

-- Add columns to existing expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confidence_score FLOAT DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS detected_pattern TEXT,
ADD COLUMN IF NOT EXISTS is_anomaly BOOLEAN DEFAULT FALSE;

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'weekly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  alert_threshold FLOAT DEFAULT 0.8, -- Alert at 80%
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recurring expenses tracking
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id uuid REFERENCES categories(id),
  subcategory_id uuid REFERENCES subcategories(id),
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  next_due_date DATE NOT NULL,
  vendor_name TEXT,
  description TEXT,
  auto_add BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vendor_name, frequency)
);

-- AI Insights storage
CREATE TABLE IF NOT EXISTS insights (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'trend', 'anomaly', 'recommendation', 'pattern'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  category_id uuid REFERENCES categories(id),
  data JSONB, -- Store additional data
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Spending predictions
CREATE TABLE IF NOT EXISTS predictions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id uuid REFERENCES categories(id),
  predicted_amount NUMERIC NOT NULL,
  confidence FLOAT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  actual_amount NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning data for auto-categorization
CREATE TABLE IF NOT EXISTS expense_patterns (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  category_id uuid REFERENCES categories(id),
  subcategory_id uuid REFERENCES subcategories(id),
  frequency INT DEFAULT 1,
  last_used TIMESTAMP DEFAULT NOW(),
  confidence FLOAT DEFAULT 1.0,
  UNIQUE(user_id, vendor_name)
);

-- Notifications/Alerts
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'budget_alert', 'anomaly', 'bill_reminder', 'insight'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_patterns_user ON expense_patterns(user_id, vendor_name);
