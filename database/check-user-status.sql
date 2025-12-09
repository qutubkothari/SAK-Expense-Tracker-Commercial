-- COMPREHENSIVE DATABASE CHECK for user 919537653927
-- Run this to diagnose the issue

-- Step 1: Check auth.users table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Find the user by phone in auth.users
SELECT id::text as user_id, phone, email, created_at
FROM auth.users 
WHERE phone LIKE '%919537653927%' OR phone = '919537653927' OR phone = '+919537653927';

-- Step 3: Check if user exists in public.users table
SELECT id, phone
FROM public.users 
WHERE phone LIKE '%919537653927%' OR phone = '919537653927' OR phone = '+919537653927';

-- Step 4: Check categories table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'categories'
ORDER BY ordinal_position;

-- Step 5: Check if user_id 77db4b3c-946e-464d-ac75-65c064b84b98 exists
SELECT 
    '77db4b3c-946e-464d-ac75-65c064b84b98' as user_id,
    (SELECT COUNT(*) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as subcategories,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as expenses;

-- Step 6: Check parent user
SELECT 
    '588285f3-8141-4a3a-88e4-9e7b4cbb36b3' as parent_user_id,
    (SELECT COUNT(*) FROM categories WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as subcategories;

-- Step 7: Show all users with expenses but no categories
SELECT 
    e.user_id,
    COUNT(DISTINCT e.id) as expense_count,
    (SELECT COUNT(*) FROM categories c WHERE c.user_id = e.user_id) as category_count
FROM expenses e
GROUP BY e.user_id
HAVING (SELECT COUNT(*) FROM categories c WHERE c.user_id = e.user_id) = 0
ORDER BY expense_count DESC;
