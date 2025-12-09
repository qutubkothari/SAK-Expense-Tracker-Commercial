-- Add subcategory_id column to budgets table for subcategory-level budgets

-- Add the subcategory_id column if it doesn't exist
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_budgets_subcategory ON budgets(subcategory_id);

-- Update the combined index to include subcategory
DROP INDEX IF EXISTS idx_budgets_user_category;
CREATE INDEX IF NOT EXISTS idx_budgets_user_category_subcat ON budgets(user_id, category_id, subcategory_id);

-- Comments for documentation
COMMENT ON COLUMN budgets.subcategory_id IS 'Optional subcategory for more granular budget tracking (e.g., Mutton within Groceries)';
