-- EMERGENCY FIX: Restore categories for user with phone 919537653927
-- This user has no categories, causing "?" to appear everywhere

-- Step 1: Find the user_id for phone 919537653927
DO $$
DECLARE
    target_user_id TEXT;
    parent_user_id TEXT := '588285f3-8141-4a3a-88e4-9e7b4cbb36b3';
    reference_user_id TEXT := '8986d7b5-3810-4b4c-9400-c74778595760';
    categories_count INTEGER;
    expenses_count INTEGER;
BEGIN
    -- Find user by phone
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE phone LIKE '%919537653927%' OR phone = '919537653927' OR phone = '+919537653927'
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'ERROR: User not found with phone 919537653927';
        RAISE NOTICE 'Checking if this is the family member ID...';
        target_user_id := '77db4b3c-946e-464d-ac75-65c064b84b98';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Target User ID: %', target_user_id;
    RAISE NOTICE '========================================';
    
    -- Check current status
    SELECT COUNT(*) INTO categories_count FROM categories WHERE user_id = target_user_id;
    SELECT COUNT(*) INTO expenses_count FROM expenses WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Current categories: %', categories_count;
    RAISE NOTICE 'Total expenses: %', expenses_count;
    
    -- If no categories, restore from parent or reference user
    IF categories_count = 0 THEN
        RAISE NOTICE 'Restoring categories...';
        
        -- First try from parent account
        INSERT INTO categories (user_id, name, icon, color)
        SELECT 
            target_user_id,
            c.name,
            c.icon,
            c.color
        FROM categories c
        WHERE c.user_id = parent_user_id
        ON CONFLICT (user_id, name) DO NOTHING;
        
        GET DIAGNOSTICS categories_count = ROW_COUNT;
        RAISE NOTICE '✓ Restored % categories from parent', categories_count;
        
        -- If still no categories, use reference user
        IF categories_count = 0 THEN
            INSERT INTO categories (user_id, name, icon, color)
            SELECT 
                target_user_id,
                c.name,
                c.icon,
                c.color
            FROM categories c
            WHERE c.user_id = reference_user_id
            ON CONFLICT (user_id, name) DO NOTHING;
            
            GET DIAGNOSTICS categories_count = ROW_COUNT;
            RAISE NOTICE '✓ Restored % categories from reference user', categories_count;
        END IF;
        
        -- Restore subcategories
        INSERT INTO subcategories (user_id, category_id, name, icon)
        SELECT DISTINCT 
            target_user_id,
            new_cat.id,
            s.name,
            s.icon
        FROM subcategories s
        INNER JOIN categories old_cat ON s.category_id = old_cat.id
        INNER JOIN categories new_cat ON new_cat.user_id = target_user_id AND new_cat.name = old_cat.name
        WHERE s.user_id IN (parent_user_id, reference_user_id)
        ON CONFLICT (user_id, category_id, name) DO NOTHING;
        
        RAISE NOTICE '✓ Subcategories restored';
    ELSE
        RAISE NOTICE 'User already has categories. No restoration needed.';
    END IF;
    
    -- Show final status
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL STATUS:';
    RAISE NOTICE 'Total categories: %', (SELECT COUNT(*) FROM categories WHERE user_id = target_user_id);
    RAISE NOTICE 'Total subcategories: %', (SELECT COUNT(*) FROM subcategories WHERE user_id = target_user_id);
    RAISE NOTICE 'Total expenses: %', (SELECT COUNT(*) FROM expenses WHERE user_id = target_user_id);
    RAISE NOTICE 'Uncategorized expenses: %', (SELECT COUNT(*) FROM expenses WHERE user_id = target_user_id AND category_id IS NULL);
    RAISE NOTICE '========================================';
    
END $$;

-- Verify restoration
SELECT 
    'User Categories Fixed!' as status,
    u.phone,
    u.id::text as user_id,
    (SELECT COUNT(*) FROM categories c WHERE c.user_id = u.id::text) as categories,
    (SELECT COUNT(*) FROM subcategories s WHERE s.user_id = u.id::text) as subcategories,
    (SELECT COUNT(*) FROM expenses e WHERE e.user_id = u.id::text) as total_expenses,
    (SELECT COUNT(*) FROM expenses e WHERE e.user_id = u.id::text AND e.category_id IS NULL) as uncategorized
FROM auth.users u
WHERE phone LIKE '%919537653927%' OR phone = '919537653927' OR phone = '+919537653927'
LIMIT 1;

-- Show their categories
SELECT c.name, c.icon, c.color
FROM categories c
JOIN auth.users u ON c.user_id = u.id::text
WHERE u.phone LIKE '%919537653927%' OR u.phone = '919537653927' OR u.phone = '+919537653927'
ORDER BY c.name;
