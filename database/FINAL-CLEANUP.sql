-- FINAL CLEANUP: Remove duplicates and fix all categorizations
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    user_id_fix TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';
    food_dining_id UUID;
    housing_id UUID;
    groceries_cat_id UUID;
    bills_id UUID;
    food_id UUID;
BEGIN
    -- Get IDs of categories to keep and merge
    SELECT id INTO food_dining_id FROM categories WHERE user_id = user_id_fix AND name = 'Food & Dining';
    SELECT id INTO housing_id FROM categories WHERE user_id = user_id_fix AND name = 'Housing';
    SELECT id INTO groceries_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Groceries';
    SELECT id INTO bills_id FROM categories WHERE user_id = user_id_fix AND name = 'Bills & Utilities';
    SELECT id INTO food_id FROM categories WHERE user_id = user_id_fix AND name = 'Food';
    
    RAISE NOTICE 'Step 1: Merging duplicate categories...';
    
    -- Merge "Food" into "Food & Dining"
    UPDATE expenses SET category_id = food_dining_id
    WHERE user_id = user_id_fix AND category_id = food_id;
    
    -- Merge "Groceries" category into "Food & Dining" (keep Groceries as subcategory only)
    UPDATE expenses SET category_id = food_dining_id
    WHERE user_id = user_id_fix AND category_id = groceries_cat_id;
    
    -- Merge "Bills & Utilities" into "Housing"
    UPDATE expenses SET category_id = housing_id
    WHERE user_id = user_id_fix AND category_id = bills_id;
    
    RAISE NOTICE 'Step 2: Deleting duplicate categories...';
    
    -- Delete duplicate categories (expenses are now reassigned)
    DELETE FROM categories WHERE user_id = user_id_fix AND id IN (food_id, groceries_cat_id, bills_id);
    
    RAISE NOTICE 'Step 3: Fixing expenses with invalid category_ids...';
    
    -- Reset all expenses with invalid category_ids to NULL
    UPDATE expenses 
    SET category_id = NULL
    WHERE user_id = user_id_fix
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix));
    
    RAISE NOTICE 'Step 4: Smart recategorization...';
    
    -- Food & Dining
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Food & Dining')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'restaurant|dinner|lunch|breakfast|chicken|mutton|beef|zafran|mcdonald|caterer|abiz|food');
    
    -- Groceries moved under Food & Dining but expenses with "groceries" keyword
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Food & Dining')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'groceries|grocery|vegetables|fruits|market');
    
    -- Transportation
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Transportation')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'petrol|fuel|rickshaw|train|car.*clean|fast.*tag|toll|parking|bus');
    
    -- Travel
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Travel')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'flight|hotel|visa|ticket' AND LOWER(note) !~ 'train');
    
    -- Shopping
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Shopping')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'shopping|pants|clothes|plant|scale|moon|perfect|stationery');
    
    -- Housing (merged Bills & Utilities)
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Housing')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'electricity|electric|internet|maintenance|society|bill|credit.*card|gas|rent|mobile.*recharge');
    
    -- Healthcare
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Healthcare')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'medical|doctor|hospital|health|medicine');
    
    -- Education  
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Education')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'school|fees|education|tuition');
    
    -- Entertainment
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Entertainment')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'subscription|microsoft|chatgpt|cloud|star|netflix|prime');
    
    -- Deeni Umoor (religious expenses)
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Deeni Umoor')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'khumus|zakat|niyaz|jamaat|wajebaat|ziyarat|ashara|qardan|fmb|thaali');
    
    -- Other (everything else)
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Other')
    WHERE user_id = user_id_fix AND category_id IS NULL;
    
    RAISE NOTICE '✅ Cleanup complete!';
END $$;

-- Show final results
SELECT 
    COALESCE(c.name, '❌ STILL NULL') as category,
    c.icon,
    COUNT(e.id) as expenses,
    ROUND(SUM(e.amount_inr)::numeric, 2) as total_inr
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name, c.icon
ORDER BY total_inr DESC NULLS LAST;

-- Final category count
SELECT 
    COUNT(*) as final_categories,
    STRING_AGG(name, ', ' ORDER BY name) as category_names
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';
