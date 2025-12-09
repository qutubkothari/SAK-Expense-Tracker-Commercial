-- URGENT FIX: Add user_id to categories and enable RLS
-- This will make categories user-specific instead of shared

-- Step 1: Add user_id column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 2: Add user_id column to subcategories table
ALTER TABLE subcategories 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 3: Get all distinct users and create categories for each
DO $$
DECLARE
  user_record RECORD;
  temp_user_id TEXT;
BEGIN
  -- Get the first user for temporary assignment
  SELECT DISTINCT user_id INTO temp_user_id FROM expenses LIMIT 1;
  
  -- If we have a user, assign all existing categories to them
  IF temp_user_id IS NOT NULL THEN
    UPDATE categories 
    SET user_id = temp_user_id
    WHERE user_id IS NULL;
    
    UPDATE subcategories 
    SET user_id = temp_user_id
    WHERE user_id IS NULL;
  ELSE
    -- If no expenses exist, delete orphan categories
    DELETE FROM subcategories WHERE user_id IS NULL;
    DELETE FROM categories WHERE user_id IS NULL;
  END IF;
END $$;

-- Step 4: Make user_id NOT NULL after populating
ALTER TABLE categories 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE subcategories 
ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Drop the UNIQUE constraint on category name (since now it's per user)
ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_name_key;

-- Step 6: Add new unique constraint per user
ALTER TABLE categories 
ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);

ALTER TABLE subcategories 
DROP CONSTRAINT IF EXISTS subcategories_category_id_name_key;

ALTER TABLE subcategories 
ADD CONSTRAINT subcategories_user_category_name_unique UNIQUE (user_id, category_id, name);

-- Step 7: Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 8: Enable RLS on subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (user_id = current_user OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (user_id = current_user OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (user_id = current_user OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (user_id = current_user OR user_id = auth.uid()::text);

-- Step 10: Create RLS policies for subcategories
DROP POLICY IF EXISTS "Users can view own subcategories" ON subcategories;
CREATE POLICY "Users can view own subcategories"
  ON subcategories FOR SELECT
  USING (user_id = current_user OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own subcategories" ON subcategories;
CREATE POLICY "Users can insert own subcategories"
  ON subcategories FOR INSERT
  WITH CHECK (user_id = current_user OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own subcategories" ON subcategories;
CREATE POLICY "Users can update own subcategories"
  ON subcategories FOR UPDATE
  USING (user_id = current_user OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own subcategories" ON subcategories;
CREATE POLICY "Users can delete own subcategories"
  ON subcategories FOR DELETE
  USING (user_id = current_user OR user_id = auth.uid()::text);

-- Step 11: Create function to initialize default categories for new users
CREATE OR REPLACE FUNCTION initialize_user_categories(p_user_id TEXT)
RETURNS void AS $$
BEGIN
  -- Insert default categories for the user
  INSERT INTO categories (user_id, name, icon, color) VALUES
    (p_user_id, 'Food & Dining', '🍽️', '#43bfa0'),
    (p_user_id, 'Transportation', '🚗', '#ffd166'),
    (p_user_id, 'Shopping', '🛍️', '#b388eb'),
    (p_user_id, 'Entertainment', '🎬', '#f67280'),
    (p_user_id, 'Bills & Utilities', '💡', '#4ecdc4'),
    (p_user_id, 'Healthcare', '🏥', '#ff6b6b'),
    (p_user_id, 'Education', '📚', '#95e1d3'),
    (p_user_id, 'Personal Care', '💅', '#feca57'),
    (p_user_id, 'Travel', '✈️', '#48dbfb'),
    (p_user_id, 'Groceries', '🛒', '#a8e6cf'),
    (p_user_id, 'Income', '💰', '#26de81'),
    (p_user_id, 'Savings', '🏦', '#20bf6b'),
    (p_user_id, 'Investments', '📈', '#4b7bec'),
    (p_user_id, 'Gifts & Donations', '🎁', '#fc5c65'),
    (p_user_id, 'Other', '📦', '#a5b1c2')
  ON CONFLICT (user_id, name) DO NOTHING;
  
  -- Add common subcategories
  INSERT INTO subcategories (user_id, category_id, name, icon)
  SELECT 
    p_user_id,
    c.id,
    s.name,
    s.icon
  FROM categories c
  CROSS JOIN LATERAL (
    VALUES 
      ('Restaurants', '🍴'),
      ('Fast Food', '🍔'),
      ('Groceries', '🛒'),
      ('Coffee & Tea', '☕')
  ) AS s(name, icon)
  WHERE c.user_id = p_user_id AND c.name = 'Food & Dining'
  ON CONFLICT (user_id, category_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
