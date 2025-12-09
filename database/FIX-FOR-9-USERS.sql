-- FIX FOR EXISTING USERS - Run this in Supabase SQL Editor

-- Step 1: Add user_id columns if they don't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 2: Assign ALL existing categories to the first user temporarily
-- (We'll create copies for other users next)
UPDATE categories 
SET user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
WHERE user_id IS NULL;

UPDATE subcategories 
SET user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
WHERE user_id IS NULL;

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

-- Step 8: Create RLS policies
CREATE POLICY "Users can view own categories" ON categories FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own categories" ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own categories" ON categories FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own categories" ON categories FOR DELETE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view own subcategories" ON subcategories FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own subcategories" ON subcategories FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subcategories" ON subcategories FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own subcategories" ON subcategories FOR DELETE
  USING (user_id = auth.uid()::text);

-- Step 9: Create default categories for ALL other users
INSERT INTO categories (user_id, name, icon, color)
SELECT DISTINCT e.user_id, c.name, c.icon, c.color
FROM (
  VALUES 
    ('c1dff2c8-fee5-483e-9df2-9b7615a9b07f'),
    ('ea4158af-e416-42d3-ac0f-632c0e3b4bef'),
    ('78a570c6-765d-4b02-9df1-848d4ace3847'),
    ('35a24c1e-cb40-475d-8762-074f50e9ca5f'),
    ('4b73ea9d-513d-4333-b8f6-b46c8d87d332'),
    ('77db4b3c-946e-464d-ac75-65c064b84b98'),
    ('588285f3-8141-4a3a-88e4-9e7b4cbb36b3'),
    ('8c48a2a5-49f5-4e17-8c6d-45f0717be6b1')
) AS e(user_id)
CROSS JOIN (
  SELECT DISTINCT name, icon, color 
  FROM categories 
  WHERE user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
) AS c
ON CONFLICT (user_id, name) DO NOTHING;

-- Step 10: Copy subcategories for all users
INSERT INTO subcategories (user_id, category_id, name, icon)
SELECT DISTINCT 
  u.user_id,
  new_cat.id,
  s.name,
  s.icon
FROM (
  VALUES 
    ('c1dff2c8-fee5-483e-9df2-9b7615a9b07f'),
    ('ea4158af-e416-42d3-ac0f-632c0e3b4bef'),
    ('78a570c6-765d-4b02-9df1-848d4ace3847'),
    ('35a24c1e-cb40-475d-8762-074f50e9ca5f'),
    ('4b73ea9d-513d-4333-b8f6-b46c8d87d332'),
    ('77db4b3c-946e-464d-ac75-65c064b84b98'),
    ('588285f3-8141-4a3a-88e4-9e7b4cbb36b3'),
    ('8c48a2a5-49f5-4e17-8c6d-45f0717be6b1')
) AS u(user_id)
CROSS JOIN subcategories s
INNER JOIN categories old_cat ON s.category_id = old_cat.id
INNER JOIN categories new_cat ON new_cat.user_id = u.user_id AND new_cat.name = old_cat.name
WHERE s.user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
ON CONFLICT (user_id, category_id, name) DO NOTHING;

SELECT 'Setup complete! All 9 users now have their own categories.' as result;
