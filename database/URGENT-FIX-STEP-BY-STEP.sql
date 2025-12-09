-- Run these commands ONE BY ONE in Supabase SQL Editor

-- STEP 1: Add user_id columns
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- STEP 2: Check if there are any users in expenses table
SELECT DISTINCT user_id FROM expenses LIMIT 5;
-- Copy one of these user IDs for the next step

-- STEP 3: Assign all existing categories to the first user
-- REPLACE 'PASTE_USER_ID_HERE' with an actual user ID from step 2
UPDATE categories 
SET user_id = 'PASTE_USER_ID_HERE'
WHERE user_id IS NULL;

UPDATE subcategories 
SET user_id = 'PASTE_USER_ID_HERE'
WHERE user_id IS NULL;

-- STEP 4: Verify all categories have user_id
SELECT COUNT(*) FROM categories WHERE user_id IS NULL;
SELECT COUNT(*) FROM subcategories WHERE user_id IS NULL;
-- Both should return 0

-- STEP 5: Make user_id required
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE subcategories ALTER COLUMN user_id SET NOT NULL;

-- STEP 6: Update unique constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);

ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_id_name_key;
ALTER TABLE subcategories ADD CONSTRAINT subcategories_user_category_name_unique UNIQUE (user_id, category_id, name);

-- STEP 7: Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create RLS policies for categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE
  USING (user_id = auth.uid()::text);

-- STEP 9: Create RLS policies for subcategories
DROP POLICY IF EXISTS "Users can view own subcategories" ON subcategories;
CREATE POLICY "Users can view own subcategories" ON subcategories FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own subcategories" ON subcategories;
CREATE POLICY "Users can insert own subcategories" ON subcategories FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own subcategories" ON subcategories;
CREATE POLICY "Users can update own subcategories" ON subcategories FOR UPDATE
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own subcategories" ON subcategories;
CREATE POLICY "Users can delete own subcategories" ON subcategories FOR DELETE
  USING (user_id = auth.uid()::text);

-- STEP 10: Get list of all users who need categories
SELECT DISTINCT user_id FROM expenses;

-- STEP 11: For EACH user from step 10, run this (replace USER_ID):
-- This will give them default categories
INSERT INTO categories (user_id, name, icon, color) VALUES
  ('USER_ID', 'Food & Dining', '🍽️', '#43bfa0'),
  ('USER_ID', 'Transportation', '🚗', '#ffd166'),
  ('USER_ID', 'Shopping', '🛍️', '#b388eb'),
  ('USER_ID', 'Entertainment', '🎬', '#f67280'),
  ('USER_ID', 'Bills & Utilities', '💡', '#4ecdc4'),
  ('USER_ID', 'Healthcare', '🏥', '#ff6b6b'),
  ('USER_ID', 'Education', '📚', '#95e1d3'),
  ('USER_ID', 'Personal Care', '💅', '#feca57'),
  ('USER_ID', 'Travel', '✈️', '#48dbfb'),
  ('USER_ID', 'Groceries', '🛒', '#a8e6cf')
ON CONFLICT (user_id, name) DO NOTHING;
