-- =====================================================
-- CREATE PERMISSIVE RLS POLICIES FOR ANON ACCESS
-- =====================================================
-- This allows anon key to access everything
-- =====================================================

-- Enable RLS but create permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all access to users" ON users;
DROP POLICY IF EXISTS "Allow all access to categories" ON categories;
DROP POLICY IF EXISTS "Allow all access to subcategories" ON subcategories;
DROP POLICY IF EXISTS "Allow all access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all access to income" ON income;
DROP POLICY IF EXISTS "Allow all access to budgets" ON budgets;
DROP POLICY IF EXISTS "Allow all access to projects" ON projects;

-- Create permissive policies that allow everything for anon role
CREATE POLICY "Allow all access to users" ON users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to categories" ON categories
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to subcategories" ON subcategories
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to expenses" ON expenses
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to income" ON income
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to budgets" ON budgets
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to projects" ON projects
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
