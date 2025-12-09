-- COMPLETE FIX FOR USER +919537653927 (77db4b3c-946e-464d-ac75-65c064b84b98)
-- This user shows "Categories loaded: 0" in the app

-- Step 1: Restore categories from reference user (has all default categories)
INSERT INTO categories (user_id, name, icon, color)
SELECT 
    '77db4b3c-946e-464d-ac75-65c064b84b98',
    c.name,
    c.icon,
    c.color
FROM categories c
WHERE c.user_id = '8986d7b5-3810-4b4c-9400-c74778595760'  -- Reference user
ON CONFLICT (user_id, name) DO NOTHING;

-- Step 2: Restore subcategories
INSERT INTO subcategories (user_id, category_id, name, icon)
SELECT DISTINCT 
    '77db4b3c-946e-464d-ac75-65c064b84b98',
    new_cat.id,
    s.name,
    s.icon
FROM subcategories s
INNER JOIN categories old_cat ON s.category_id = old_cat.id
INNER JOIN categories new_cat ON new_cat.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND new_cat.name = old_cat.name
WHERE s.user_id = '8986d7b5-3810-4b4c-9400-c74778595760'
ON CONFLICT (user_id, category_id, name) DO NOTHING;

-- Step 3: Link all expenses to first category
DO $$
DECLARE
    user_id_to_fix TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';
    first_category_id UUID;
    updated_count INTEGER;
BEGIN
    SELECT id INTO first_category_id 
    FROM categories 
    WHERE user_id = user_id_to_fix 
    ORDER BY name
    LIMIT 1;
    
    IF first_category_id IS NULL THEN
        RAISE EXCEPTION 'No categories after restore!';
    END IF;
    
    UPDATE expenses 
    SET category_id = first_category_id
    WHERE user_id = user_id_to_fix 
    AND category_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Fixed % expenses', updated_count;
END $$;

-- Verify
SELECT 
    'FIXED!' as status,
    (SELECT COUNT(*) FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as categories,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98') as total_expenses,
    (SELECT COUNT(*) FROM expenses WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98' AND category_id IS NOT NULL) as categorized;
