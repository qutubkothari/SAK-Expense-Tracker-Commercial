-- DIAGNOSTIC: Check actual database state
-- Run this to see what's really in the database

-- 1. Check if categories table has user_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'categories'
ORDER BY ordinal_position;

-- 2. Check how many categories exist (with and without user_id)
SELECT 
    COUNT(*) as total_categories,
    COUNT(user_id) as categories_with_user_id,
    COUNT(*) - COUNT(user_id) as categories_without_user_id
FROM categories;

-- 3. Show sample categories
SELECT id, name, icon, user_id
FROM categories
LIMIT 10;

-- 4. Check specifically for user 77db4b3c-946e-464d-ac75-65c064b84b98
SELECT 
    COUNT(*) as count,
    'Categories for user 77db4b3c' as description
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';

-- 5. Check what the app would actually query (what supabase.from('categories').select('*') returns)
SELECT *
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
LIMIT 5;

-- 6. Check RLS policies on categories table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'categories';

-- 7. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'categories';
