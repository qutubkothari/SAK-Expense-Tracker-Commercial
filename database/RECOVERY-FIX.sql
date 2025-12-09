-- RECOVERY SCRIPT - Run this to fix the database after running everything together
-- Run each section and check for errors before proceeding

-- PART 1: Check current state
SELECT 'Checking categories table...' as status;
SELECT COUNT(*) as total_categories, 
       COUNT(user_id) as categories_with_user_id,
       COUNT(*) - COUNT(user_id) as categories_without_user_id
FROM categories;

SELECT 'Checking subcategories table...' as status;
SELECT COUNT(*) as total_subcategories,
       COUNT(user_id) as subcategories_with_user_id,
       COUNT(*) - COUNT(user_id) as subcategories_without_user_id
FROM subcategories;

-- PART 2: Get a user ID to assign orphan categories
SELECT 'Available user IDs from expenses:' as status;
SELECT DISTINCT user_id FROM expenses LIMIT 10;

-- PART 3: Assign orphan categories to a user
-- IMPORTANT: Replace 'REPLACE_WITH_USER_ID' with an actual user ID from PART 2
-- DO NOT RUN THIS YET - Replace the user ID first!

-- UPDATE categories 
-- SET user_id = 'REPLACE_WITH_USER_ID'
-- WHERE user_id IS NULL;

-- UPDATE subcategories 
-- SET user_id = 'REPLACE_WITH_USER_ID'
-- WHERE user_id IS NULL;

-- PART 4: If user_id column exists but constraint failed, drop and recreate
DO $$
BEGIN
  -- Remove NOT NULL constraint if it exists
  ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE subcategories ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop NOT NULL constraint: %', SQLERRM;
END $$;

-- PART 5: Verify and show what needs to be fixed
SELECT 'Categories needing user_id:' as status;
SELECT id, name, icon, user_id FROM categories WHERE user_id IS NULL LIMIT 20;

SELECT 'Subcategories needing user_id:' as status;
SELECT id, name, icon, user_id FROM subcategories WHERE user_id IS NULL LIMIT 20;

-- PART 6: Check if RLS is enabled
SELECT 'Checking RLS status:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('categories', 'subcategories');

-- PART 7: After you fix user_id (run PART 3 with correct user ID), 
-- then run this to complete the setup:

-- ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE subcategories ALTER COLUMN user_id SET NOT NULL;

-- ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
-- ALTER TABLE categories ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);

-- ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_id_name_key;
-- ALTER TABLE subcategories ADD CONSTRAINT subcategories_user_category_name_unique UNIQUE (user_id, category_id, name);

-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own categories" ON categories FOR SELECT
--   USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can insert own categories" ON categories FOR INSERT
--   WITH CHECK (user_id = auth.uid()::text);
-- CREATE POLICY "Users can update own categories" ON categories FOR UPDATE
--   USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can delete own categories" ON categories FOR DELETE
--   USING (user_id = auth.uid()::text);

-- CREATE POLICY "Users can view own subcategories" ON subcategories FOR SELECT
--   USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can insert own subcategories" ON subcategories FOR INSERT
--   WITH CHECK (user_id = auth.uid()::text);
-- CREATE POLICY "Users can update own subcategories" ON subcategories FOR UPDATE
--   USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can delete own subcategories" ON subcategories FOR DELETE
--   USING (user_id = auth.uid()::text);
