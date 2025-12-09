-- SIMPLE FIX: Since there are no expenses or users yet, we can start fresh

-- Step 1: Clear existing categories (since they're not assigned to anyone)
DELETE FROM subcategories;
DELETE FROM categories;

-- Step 2: Add user_id columns
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 3: Drop old constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_id_name_key;

-- Step 4: Make user_id required
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE subcategories ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Add new unique constraints (per user)
ALTER TABLE categories ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);
ALTER TABLE subcategories ADD CONSTRAINT subcategories_user_category_name_unique UNIQUE (user_id, category_id, name);

-- Step 6: Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

DROP POLICY IF EXISTS "Users can view own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can insert own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can update own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can delete own subcategories" ON subcategories;

-- Step 8: Create RLS policies for categories
CREATE POLICY "Users can view own categories" ON categories FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own categories" ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own categories" ON categories FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own categories" ON categories FOR DELETE
  USING (user_id = auth.uid()::text);

-- Step 9: Create RLS policies for subcategories
CREATE POLICY "Users can view own subcategories" ON subcategories FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own subcategories" ON subcategories FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subcategories" ON subcategories FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own subcategories" ON subcategories FOR DELETE
  USING (user_id = auth.uid()::text);

-- Step 10: Create a trigger to auto-create categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default categories for the new user
  INSERT INTO categories (user_id, name, icon, color) VALUES
    (NEW.id::text, 'Food & Dining', '🍽️', '#43bfa0'),
    (NEW.id::text, 'Transportation', '🚗', '#ffd166'),
    (NEW.id::text, 'Shopping', '🛍️', '#b388eb'),
    (NEW.id::text, 'Entertainment', '🎬', '#f67280'),
    (NEW.id::text, 'Bills & Utilities', '💡', '#4ecdc4'),
    (NEW.id::text, 'Healthcare', '🏥', '#ff6b6b'),
    (NEW.id::text, 'Education', '📚', '#95e1d3'),
    (NEW.id::text, 'Personal Care', '💅', '#feca57'),
    (NEW.id::text, 'Travel', '✈️', '#48dbfb'),
    (NEW.id::text, 'Groceries', '🛒', '#a8e6cf'),
    (NEW.id::text, 'Income', '💰', '#26de81'),
    (NEW.id::text, 'Other', '📦', '#a5b1c2')
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table (if you have access)
-- If this fails, users will need to create categories manually on first login
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- Done! Users will now get default categories automatically when they sign up
SELECT 'Setup complete! Categories are now user-specific.' as result;
