-- =====================================================
-- FIX BUDGETS TABLE RELATIONSHIPS
-- =====================================================

-- Add subcategory_id column to budgets if it doesn't exist
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS subcategory_id UUID;

-- Add foreign key constraint for subcategory
ALTER TABLE budgets 
  ADD CONSTRAINT budgets_subcategory_id_fkey 
  FOREIGN KEY (subcategory_id) 
  REFERENCES subcategories(id) 
  ON DELETE SET NULL;

-- Verify the relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='budgets'
  AND tc.table_schema = 'public';
