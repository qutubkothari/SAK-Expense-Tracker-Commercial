-- =====================================================
-- GRANT PUBLIC ACCESS TO USERS TABLE
-- =====================================================
-- This will allow the anon key to access users for login
-- =====================================================

-- First, verify RLS is disabled
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to anon role (for login to work)
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on all tables
GRANT ALL ON categories TO anon;
GRANT ALL ON subcategories TO anon;
GRANT ALL ON expenses TO anon;
GRANT ALL ON income TO anon;
GRANT ALL ON budgets TO anon;
GRANT ALL ON budget_alerts TO anon;
GRANT ALL ON projects TO anon;

-- Grant sequence permissions if needed
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify permissions
SELECT 
  tablename,
  has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') as can_select,
  has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT') as can_insert
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'categories', 'subcategories', 'expenses');
