-- =====================================================
-- NUCLEAR OPTION - DISABLE ALL RLS COMPLETELY
-- =====================================================

-- Get all tables in public schema and disable RLS
DO $$ 
DECLARE 
    t record;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t.tablename);
        RAISE NOTICE 'RLS disabled for: %', t.tablename;
    END LOOP;
END $$;

-- Drop ALL policies from ALL tables
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Policy dropped: % on %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- Verify everything is disabled
SELECT 
    tablename,
    rowsecurity AS rls_enabled,
    CASE 
        WHEN rowsecurity THEN '❌ RLS STILL ENABLED' 
        ELSE '✅ RLS DISABLED' 
    END AS status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for any remaining policies
SELECT 
    tablename,
    policyname,
    '❌ POLICY STILL EXISTS' AS warning
FROM pg_policies
WHERE schemaname = 'public';
