-- RESTORE CATEGORIES FOR AFFECTED USER
-- This script will restore all default categories for a user who lost them

-- STEP 1: First, run check-user-status.sql to find the user_id
-- STEP 2: Replace 'USER_ID_HERE' below with the actual user_id

-- USER_ID to restore (replace this):
DO $$ 
DECLARE
    target_user_id TEXT := 'USER_ID_HERE';  -- REPLACE THIS WITH ACTUAL USER_ID
    reference_user_id TEXT := '8986d7b5-3810-4b4c-9400-c74778595760';  -- User with correct categories
BEGIN
    RAISE NOTICE 'Restoring categories for user: %', target_user_id;
    
    -- Step 1: Restore all categories from reference user
    INSERT INTO categories (user_id, name, icon, color)
    SELECT 
        target_user_id,
        c.name,
        c.icon,
        c.color
    FROM categories c
    WHERE c.user_id = reference_user_id
    ON CONFLICT (user_id, name) DO NOTHING;
    
    RAISE NOTICE 'Categories restored!';
    
    -- Step 2: Restore subcategories
    INSERT INTO subcategories (user_id, category_id, name, icon)
    SELECT DISTINCT 
        target_user_id,
        new_cat.id,
        s.name,
        s.icon
    FROM subcategories s
    INNER JOIN categories old_cat ON s.category_id = old_cat.id
    INNER JOIN categories new_cat ON new_cat.user_id = target_user_id AND new_cat.name = old_cat.name
    WHERE s.user_id = reference_user_id
    ON CONFLICT (user_id, category_id, name) DO NOTHING;
    
    RAISE NOTICE 'Subcategories restored!';
    
    -- Step 3: Show results
    RAISE NOTICE 'Total categories now: %', (SELECT COUNT(*) FROM categories WHERE user_id = target_user_id);
    RAISE NOTICE 'Total subcategories now: %', (SELECT COUNT(*) FROM subcategories WHERE user_id = target_user_id);
    
END $$;

-- Verify restoration
SELECT 'Categories restored!' as status,
       COUNT(*) as total_categories
FROM categories
WHERE user_id = 'USER_ID_HERE';

-- Show the restored categories
SELECT name, icon, color
FROM categories
WHERE user_id = 'USER_ID_HERE'
ORDER BY name;
