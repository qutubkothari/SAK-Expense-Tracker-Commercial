-- FIX RLS POLICIES - Allow External Projects to Read Categories
-- Run this in Supabase SQL Editor

-- Add public read access to categories and subcategories
-- This allows external projects to read data without authentication
-- Users still need auth to INSERT/UPDATE/DELETE

-- For Categories - Public Read Access
DROP POLICY IF EXISTS "Public read access for categories" ON categories;
CREATE POLICY "Public read access for categories" ON categories
  FOR SELECT
  USING (true);  -- Allow all reads

-- For Subcategories - Public Read Access
DROP POLICY IF EXISTS "Public read access for subcategories" ON subcategories;
CREATE POLICY "Public read access for subcategories" ON subcategories
  FOR SELECT
  USING (true);  -- Allow all reads

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('categories', 'subcategories')
ORDER BY tablename, policyname;

-- Test queries (should now work without authentication)
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_subcategories FROM subcategories;

SELECT 'RLS policies updated! External projects can now read categories.' as status;

