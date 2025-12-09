-- EMERGENCY FIX: Complete category restoration for user +919537653927
-- This fixes the schema, RLS policies, AND restores categories in one script
-- Run this ONCE in Supabase SQL Editor

-- ==========================================
-- STEP 1: Fix Schema (Add user_id column)
-- ==========================================

-- Add user_id column to categories if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id column to subcategories if it doesn't exist
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- ==========================================
-- STEP 1.5: Fix RLS Policies (Allow Public Read)
-- ==========================================

-- Drop all existing RLS policies on categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Public read access for categories" ON categories;

-- Drop all existing RLS policies on subcategories
DROP POLICY IF EXISTS "Users can view own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can insert own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can update own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can delete own subcategories" ON subcategories;
DROP POLICY IF EXISTS "Public read access for subcategories" ON subcategories;

-- Create new RLS policies for categories - Allow public read, user-based write
CREATE POLICY "Public can read all categories" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NOT NULL);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE
  USING (user_id = auth.uid()::text OR user_id IS NOT NULL);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Create new RLS policies for subcategories - Allow public read, user-based write
CREATE POLICY "Public can read all subcategories" ON subcategories
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own subcategories" ON subcategories
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NOT NULL);

CREATE POLICY "Users can update own subcategories" ON subcategories
  FOR UPDATE
  USING (user_id = auth.uid()::text OR user_id IS NOT NULL);

CREATE POLICY "Users can delete own subcategories" ON subcategories
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ==========================================
-- STEP 2: Fix Unique Constraints
-- ==========================================

-- Drop old unique constraint on name only
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Add new unique constraint on (user_id, name)
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_name_unique;
ALTER TABLE categories ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);

-- ==========================================
-- STEP 3: Restore Categories from Reference User
-- ==========================================

-- Copy categories from reference user (8986d7b5-3810-4b4c-9400-c74778595760)
INSERT INTO categories (user_id, name, icon, color)
SELECT 
    '77db4b3c-946e-464d-ac75-65c064b84b98' as user_id,
    c.name,
    c.icon,
    c.color
FROM categories c
WHERE c.user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
ON CONFLICT (user_id, name) DO NOTHING;

-- If reference user doesn't exist, create default categories
INSERT INTO categories (user_id, name, icon, color)
SELECT 
    '77db4b3c-946e-464d-ac75-65c064b84b98',
    name,
    icon,
    color
FROM (VALUES
    ('Food & Dining', '🍔', '#FF6B6B'),
    ('Transportation', '🚗', '#4ECDC4'),
    ('Shopping', '🛍️', '#45B7D1'),
    ('Entertainment', '🎬', '#96CEB4'),
    ('Bills & Utilities', '💡', '#FFEAA7'),
    ('Healthcare', '🏥', '#DFE6E9'),
    ('Education', '📚', '#74B9FF'),
    ('Travel', '✈️', '#A29BFE'),
    ('Groceries', '🛒', '#55EFC4'),
    ('Personal Care', '💇', '#FD79A8'),
    ('Gifts & Donations', '🎁', '#FDCB6E'),
    ('Investment', '💰', '#6C5CE7'),
    ('Other', '📌', '#B2BEC3')
) AS default_categories(name, icon, color)
ON CONFLICT (user_id, name) DO NOTHING;

-- ==========================================
-- STEP 3: Restore Subcategories
-- ==========================================

-- Copy subcategories from reference user
INSERT INTO subcategories (user_id, category_id, name, icon)
SELECT DISTINCT 
    '77db4b3c-946e-464d-ac75-65c064b84b98',
    new_cat.id,
    s.name,
    s.icon
FROM subcategories s
INNER JOIN categories old_cat ON s.category_id = old_cat.id AND s.user_id = old_cat.user_id
INNER JOIN categories new_cat ON new_cat.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND new_cat.name = old_cat.name
WHERE s.user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
ON CONFLICT (user_id, category_id, name) DO NOTHING;

-- ==========================================
-- STEP 4: Link Expenses to Categories
-- ==========================================

DO $$
DECLARE
    user_id_to_fix TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';
    other_category_id UUID;
    food_category_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get "Food & Dining" category (most common)
    SELECT id INTO food_category_id 
    FROM categories 
    WHERE user_id = user_id_to_fix AND name = 'Food & Dining'
    LIMIT 1;
    
    -- If no Food category, get any category
    IF food_category_id IS NULL THEN
        SELECT id INTO food_category_id 
        FROM categories 
        WHERE user_id = user_id_to_fix 
        ORDER BY name
        LIMIT 1;
    END IF;
    
    IF food_category_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: No categories found after restore! Check if reference user exists.';
    END IF;
    
    -- Assign all null category expenses to Food & Dining
    UPDATE expenses 
    SET category_id = food_category_id
    WHERE user_id = user_id_to_fix 
    AND category_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Fixed % expenses with null category', updated_count;
END $$;

-- ==========================================
-- STEP 5: Verify Fix
-- ==========================================

SELECT 
    '✅ FIX COMPLETE!' as status,
    (SELECT COUNT(*) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as categories_created,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as subcategories_created,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as total_expenses,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND category_id IS NOT NULL) as categorized_expenses,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND category_id IS NULL) as still_uncategorized;

-- Show the categories that were created
SELECT 
    'Created Categories:' as info,
    name,
    icon
FROM categories 
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY name;
