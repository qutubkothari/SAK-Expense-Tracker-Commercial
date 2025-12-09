-- Add Income Sources dropdown for all users
-- This creates a standardized list of income sources
-- Safe to run multiple times - won't affect existing data

-- 1. Create income_sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert standard income sources
INSERT INTO income_sources (name, display_order) VALUES
  ('Business', 1),
  ('Profession', 2),
  ('Salary', 3),
  ('Investment', 4),
  ('Property Rent', 5),
  ('Home Industry', 6),
  ('Others', 7),
  ('Surplus / (Deficit) from Last Month', 8)
ON CONFLICT (name) DO NOTHING;

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_income_sources_active ON income_sources(is_active, display_order);

-- 4. Update existing income table to reference income sources (optional - keeps backward compatibility)
-- The income.source column can still be free text, but UI will show dropdown

-- 5. Verify the data
SELECT * FROM income_sources ORDER BY display_order;

-- Note: This doesn't modify any existing user data
-- Existing income records will keep their source values
-- The dropdown will just provide standardized options for new entries
