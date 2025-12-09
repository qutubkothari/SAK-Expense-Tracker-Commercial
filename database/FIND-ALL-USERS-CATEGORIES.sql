-- FIND ALL CATEGORIES BY USER
-- This will show us who owns which categories

SELECT 
    COALESCE(user_id, 'NULL') as user_id,
    COUNT(*) as count,
    string_agg(name, ', ' ORDER BY name) as category_names
FROM categories
GROUP BY user_id
ORDER BY count DESC;

-- Count total
SELECT COUNT(*) as total_categories_in_database FROM categories;

-- Show all categories for YOUR user specifically
SELECT id, name, icon, created_at
FROM categories  
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY name;
