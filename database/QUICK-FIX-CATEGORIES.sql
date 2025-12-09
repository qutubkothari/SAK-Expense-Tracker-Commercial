-- QUICK FIX: Restore categories for user 77db4b3c-946e-464d-ac75-65c064b84b98
-- Parent has 4 categories, 17 subcategories - copying to family member

-- Step 1: Copy categories from parent to family member
INSERT INTO categories (user_id, name, icon, color)
SELECT 
    '77db4b3c-946e-464d-ac75-65c064b84b98',
    c.name,
    c.icon,
    c.color
FROM categories c
WHERE c.user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3'
ON CONFLICT (user_id, name) DO NOTHING;

-- Step 2: Copy subcategories from parent to family member
INSERT INTO subcategories (user_id, category_id, name, icon)
SELECT DISTINCT 
    '77db4b3c-946e-464d-ac75-65c064b84b98',
    new_cat.id,
    s.name,
    s.icon
FROM subcategories s
INNER JOIN categories old_cat ON s.category_id = old_cat.id
INNER JOIN categories new_cat ON new_cat.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND new_cat.name = old_cat.name
WHERE s.user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3'
ON CONFLICT (user_id, category_id, name) DO NOTHING;

-- Step 3: Verify restoration
SELECT 
    '77db4b3c-946e-464d-ac75-65c064b84b98' as user_id,
    (SELECT COUNT(*) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as subcategories,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as expenses,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND category_id IS NULL) as uncategorized;

-- Step 4: Show restored categories
SELECT name, icon, color
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY name;

SELECT 'Categories restored successfully! User should now see category names instead of ?' as status;
