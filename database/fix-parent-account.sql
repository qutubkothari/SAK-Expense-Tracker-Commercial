-- RESTORE CATEGORIES FOR PARENT ACCOUNT (588285f3-8141-4a3a-88e4-9e7b4cbb36b3)
-- Step 1: Fix parent account first, then family member

DO $$ 
DECLARE
    parent_id TEXT := '588285f3-8141-4a3a-88e4-9e7b4cbb36b3';
    reference_user_id TEXT := '8986d7b5-3810-4b4c-9400-c74778595760';  -- User with correct categories
    categories_restored INTEGER := 0;
    subcategories_restored INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESTORING PARENT ACCOUNT CATEGORIES';
    RAISE NOTICE 'Parent ID: %', parent_id;
    RAISE NOTICE '========================================';
    
    -- Step 1: Restore all categories from reference user
    INSERT INTO categories (user_id, name, icon, color)
    SELECT 
        parent_id,
        c.name,
        c.icon,
        c.color
    FROM categories c
    WHERE c.user_id = reference_user_id
    ON CONFLICT (user_id, name) DO NOTHING;
    
    GET DIAGNOSTICS categories_restored = ROW_COUNT;
    RAISE NOTICE '✓ Categories restored: %', categories_restored;
    
    -- Step 2: Restore subcategories
    INSERT INTO subcategories (user_id, category_id, name, icon)
    SELECT DISTINCT 
        parent_id,
        new_cat.id,
        s.name,
        s.icon
    FROM subcategories s
    INNER JOIN categories old_cat ON s.category_id = old_cat.id
    INNER JOIN categories new_cat ON new_cat.user_id = parent_id AND new_cat.name = old_cat.name
    WHERE s.user_id = reference_user_id
    ON CONFLICT (user_id, category_id, name) DO NOTHING;
    
    GET DIAGNOSTICS subcategories_restored = ROW_COUNT;
    RAISE NOTICE '✓ Subcategories restored: %', subcategories_restored;
    
    -- Step 3: Show results
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PARENT ACCOUNT STATUS:';
    RAISE NOTICE 'Total categories: %', (SELECT COUNT(*) FROM categories WHERE user_id = parent_id);
    RAISE NOTICE 'Total subcategories: %', (SELECT COUNT(*) FROM subcategories WHERE user_id = parent_id);
    RAISE NOTICE 'Total expenses: %', (SELECT COUNT(*) FROM expenses WHERE user_id = parent_id);
    RAISE NOTICE 'Expenses without category: %', (SELECT COUNT(*) FROM expenses WHERE user_id = parent_id AND category_id IS NULL);
    RAISE NOTICE '========================================';
    
END $$;

-- Verify parent restoration
SELECT 
    'Parent Account Restored!' as status,
    (SELECT COUNT(*) FROM categories WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as categories,
    (SELECT COUNT(*) FROM subcategories WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as subcategories,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3') as total_expenses,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3' AND category_id IS NULL) as uncategorized_expenses;

-- Show the restored categories
SELECT name, icon, color
FROM categories
WHERE user_id = '588285f3-8141-4a3a-88e4-9e7b4cbb36b3'
ORDER BY name;
