-- Verify if categories were restored for user 77db4b3c-946e-464d-ac75-65c064b84b98

SELECT 
    'Family Member Status:' as check_type,
    (SELECT COUNT(*) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as subcategories,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as total_expenses

UNION ALL

SELECT 
    'Parent Status:' as check_type,
    (SELECT COUNT(*) FROM categories WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as subcategories,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as total_expenses;

-- Show what categories the family member has (if any)
SELECT 'Family Member Categories:' as info, name, icon, color
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY name;

-- Check if expenses have proper category_id linkage
SELECT 
    'Expense Check:' as info,
    e.id,
    e.amount,
    e.category_id,
    c.name as category_name
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id AND c.user_id = e.user_id
WHERE e.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
LIMIT 5;
