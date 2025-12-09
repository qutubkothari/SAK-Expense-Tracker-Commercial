-- GET ALL CATEGORIES AND SUBCATEGORIES DATA
-- This will show everything to diagnose the issue

-- 1. Show all categories for this user
SELECT 
    'CATEGORIES' as type,
    id::text as category_id,
    user_id,
    name,
    icon,
    color,
    created_at
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY name;

-- 2. Show all subcategories for this user
SELECT 
    'SUBCATEGORIES' as type,
    s.id::text as subcategory_id,
    s.category_id::text,
    c.name as category_name,
    s.user_id,
    s.name as subcategory_name,
    s.icon,
    s.created_at
FROM subcategories s
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY c.name, s.name;

-- 3. Check for duplicate category names
SELECT 
    user_id,
    name,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as category_ids
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY user_id, name
HAVING COUNT(*) > 1;

-- 4. Check for orphaned subcategories (category doesn't exist)
SELECT 
    s.id::text as orphaned_subcategory_id,
    s.name as subcategory_name,
    s.category_id::text as missing_category_id,
    s.user_id
FROM subcategories s
WHERE s.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
AND s.category_id NOT IN (SELECT id FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98');

-- 5. Count summary
SELECT 
    (SELECT COUNT(*) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as total_categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as total_subcategories,
    (SELECT COUNT(DISTINCT name) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as unique_category_names;
