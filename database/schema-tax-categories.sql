-- Tax Category System Schema Update
-- Run this in Supabase SQL Editor to add tax category support

-- Add tax_category column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tax_category VARCHAR(50);

-- Add tax_country preference to track user's tax jurisdiction
-- This will be stored in user_preferences JSONB field, no schema change needed

-- Create index for faster tax queries
CREATE INDEX IF NOT EXISTS idx_expenses_tax_category ON expenses(tax_category);
CREATE INDEX IF NOT EXISTS idx_expenses_business ON expenses(expense_type) WHERE expense_type = 'business';

-- Add comments for documentation
COMMENT ON COLUMN expenses.tax_category IS 'Tax category code for business expense classification (e.g., SCH_C_8, HMRC_ADV, IT_TRAVEL)';

-- Sample query to verify
-- SELECT tax_category, COUNT(*), SUM(amount) 
-- FROM expenses 
-- WHERE expense_type = 'business' 
-- GROUP BY tax_category;

