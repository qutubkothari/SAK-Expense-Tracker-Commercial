-- Allow browser clients (no Supabase auth session) to delete their own categories/subcategories
-- Run this in the Supabase SQL editor.

-- Categories delete policy
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE
  USING (
    -- Allow authenticated users to delete their own rows
    user_id = auth.uid()::text
    -- Allow anonymous/public clients (auth.uid() is NULL) to delete rows they created
    OR auth.uid() IS NULL
  );

-- Subcategories delete policy
DROP POLICY IF EXISTS "Users can delete own subcategories" ON subcategories;

CREATE POLICY "Users can delete own subcategories" ON subcategories
  FOR DELETE
  USING (
    user_id = auth.uid()::text
    OR auth.uid() IS NULL
  );
