-- DIAGNOSE RLS ISSUE - Why can't user 77db4b3c-946e-464d-ac75-65c064b84b98 see their categories?

-- Step 1: Show current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('categories', 'subcategories')
ORDER BY tablename, policyname;

-- Step 2: Check if categories exist for this user
SELECT 
    'Direct SELECT (bypasses RLS)' as test,
    COUNT(*) as count
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';

-- Step 3: Check auth.uid() function behavior
SELECT 
    'auth.uid() result' as test,
    auth.uid() as current_user_id,
    auth.uid()::text as current_user_id_text;

-- Step 4: Test what happens when we query as this user
-- This simulates what the app does
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Count categories that would be visible to this user via RLS
    SELECT COUNT(*) INTO test_count
    FROM categories
    WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';
    
    RAISE NOTICE 'Categories visible to user (RLS applied): %', test_count;
END $$;

-- Step 5: Show the exact RLS policy definition
SELECT 
    tablename,
    policyname,
    CASE cmd
        WHEN 'SELECT' THEN 'SELECT'
        WHEN 'INSERT' THEN 'INSERT'
        WHEN 'UPDATE' THEN 'UPDATE'
        WHEN 'DELETE' THEN 'DELETE'
        ELSE 'ALL'
    END as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY policyname;
