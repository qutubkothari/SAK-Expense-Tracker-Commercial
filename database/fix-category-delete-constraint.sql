-- Fix category deletion constraint to allow categories to be deleted
-- This changes the foreign key constraint to SET NULL instead of RESTRICT

-- Fix expenses table
ALTER TABLE IF EXISTS expenses 
DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;

ALTER TABLE IF EXISTS expenses 
ADD CONSTRAINT expenses_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

ALTER TABLE IF EXISTS expenses 
DROP CONSTRAINT IF EXISTS expenses_subcategory_id_fkey;

ALTER TABLE IF EXISTS expenses 
ADD CONSTRAINT expenses_subcategory_id_fkey 
FOREIGN KEY (subcategory_id) 
REFERENCES subcategories(id) 
ON DELETE SET NULL;

-- Fix recurring_expenses table if it exists
ALTER TABLE IF EXISTS recurring_expenses 
DROP CONSTRAINT IF EXISTS recurring_expenses_category_id_fkey;

ALTER TABLE IF EXISTS recurring_expenses 
ADD CONSTRAINT recurring_expenses_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

ALTER TABLE IF EXISTS recurring_expenses 
DROP CONSTRAINT IF EXISTS recurring_expenses_subcategory_id_fkey;

ALTER TABLE IF EXISTS recurring_expenses 
ADD CONSTRAINT recurring_expenses_subcategory_id_fkey 
FOREIGN KEY (subcategory_id) 
REFERENCES subcategories(id) 
ON DELETE SET NULL;

-- Fix ai_suggestions table if it exists
ALTER TABLE IF EXISTS ai_suggestions 
DROP CONSTRAINT IF EXISTS ai_suggestions_category_id_fkey;

ALTER TABLE IF EXISTS ai_suggestions 
ADD CONSTRAINT ai_suggestions_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

-- Fix receipt_scans table if it exists
ALTER TABLE IF EXISTS receipt_scans 
DROP CONSTRAINT IF EXISTS receipt_scans_category_id_fkey;

ALTER TABLE IF EXISTS receipt_scans 
ADD CONSTRAINT receipt_scans_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

-- Fix voice_commands table if it exists
ALTER TABLE IF EXISTS voice_commands 
DROP CONSTRAINT IF EXISTS voice_commands_category_id_fkey;

ALTER TABLE IF EXISTS voice_commands 
ADD CONSTRAINT voice_commands_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

ALTER TABLE IF EXISTS voice_commands 
DROP CONSTRAINT IF EXISTS voice_commands_subcategory_id_fkey;

ALTER TABLE IF EXISTS voice_commands 
ADD CONSTRAINT voice_commands_subcategory_id_fkey 
FOREIGN KEY (subcategory_id) 
REFERENCES subcategories(id) 
ON DELETE SET NULL;
