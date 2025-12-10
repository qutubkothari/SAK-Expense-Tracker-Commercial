-- =====================================================
-- COMPLETELY DISABLE RLS - NO POLICIES
-- =====================================================
-- Simple approach like your other projects
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE income DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "Allow all access to users" ON users;
DROP POLICY IF EXISTS "Allow all access to categories" ON categories;
DROP POLICY IF EXISTS "Allow all access to subcategories" ON subcategories;
DROP POLICY IF EXISTS "Allow all access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all access to income" ON income;
DROP POLICY IF EXISTS "Allow all access to budgets" ON budgets;
DROP POLICY IF EXISTS "Allow all access to projects" ON projects;

-- Verify RLS is completely disabled
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
