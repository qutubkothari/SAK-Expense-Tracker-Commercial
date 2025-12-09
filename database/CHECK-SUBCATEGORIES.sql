-- Check all subcategories and their parent categories
SELECT 
    s.id as subcategory_id,
    s.name as subcategory_name,
    s.icon as subcategory_icon,
    s.category_id,
    c.name as parent_category_name,
    c.user_id as category_user_id,
    s.user_id as subcategory_user_id
FROM subcategories s
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
   OR c.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY c.name, s.name;

-- Count subcategories per category for your user
SELECT 
    c.name as category_name,
    c.id as category_id,
    COUNT(s.id) as subcategory_count
FROM categories c
LEFT JOIN subcategories s ON c.id = s.category_id AND s.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
WHERE c.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name, c.id
ORDER BY c.name;
