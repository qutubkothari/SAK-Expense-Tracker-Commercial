-- FIX CATEGORY ASSIGNMENTS - Intelligently categorize expenses
-- Run this after EMERGENCY-CATEGORY-FIX.sql

-- ==========================================
-- Smart categorization based on expense descriptions
-- ==========================================

DO $$
DECLARE
    user_id_fix TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';
    food_cat_id UUID;
    transport_cat_id UUID;
    shopping_cat_id UUID;
    bills_cat_id UUID;
    healthcare_cat_id UUID;
    education_cat_id UUID;
    travel_cat_id UUID;
    groceries_cat_id UUID;
    entertainment_cat_id UUID;
    housing_cat_id UUID;
    other_cat_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO food_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Food & Dining';
    SELECT id INTO transport_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Transportation';
    SELECT id INTO shopping_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Shopping';
    SELECT id INTO bills_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Bills & Utilities';
    SELECT id INTO healthcare_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Healthcare';
    SELECT id INTO education_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Education';
    SELECT id INTO travel_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Travel';
    SELECT id INTO groceries_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Groceries';
    SELECT id INTO entertainment_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Entertainment';
    SELECT id INTO other_cat_id FROM categories WHERE user_id = user_id_fix AND name = 'Other';
    
    -- Try to get Housing category (might exist already)
    SELECT id INTO housing_cat_id FROM categories WHERE user_id = user_id_fix AND (name = 'Housing' OR name = 'Bills & Utilities');
    IF housing_cat_id IS NULL THEN
        housing_cat_id := bills_cat_id;
    END IF;

    -- Food & Dining
    UPDATE expenses SET category_id = food_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%restaurant%' OR LOWER(note) LIKE '%dinner%' OR LOWER(note) LIKE '%lunch%' OR
        LOWER(note) LIKE '%breakfast%' OR LOWER(note) LIKE '%food%' OR LOWER(note) LIKE '%eat%' OR
        LOWER(note) LIKE '%cafe%' OR LOWER(note) LIKE '%coffee%' OR LOWER(note) LIKE '%mcdonald%' OR
        LOWER(note) LIKE '%pizza%' OR LOWER(note) LIKE '%chicken%' OR LOWER(note) LIKE '%mutton%' OR
        LOWER(note) LIKE '%beef%' OR LOWER(note) LIKE '%zafran%'
    );

    -- Groceries
    UPDATE expenses SET category_id = groceries_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%groceries%' OR LOWER(note) LIKE '%grocery%' OR 
        LOWER(note) LIKE '%vegetables%' OR LOWER(note) LIKE '%fruits%' OR
        LOWER(note) LIKE '%market%' OR LOWER(note) LIKE '%super%'
    );

    -- Transportation
    UPDATE expenses SET category_id = transport_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%petrol%' OR LOWER(note) LIKE '%fuel%' OR LOWER(note) LIKE '%gas%' OR
        LOWER(note) LIKE '%uber%' OR LOWER(note) LIKE '%taxi%' OR LOWER(note) LIKE '%rickshaw%' OR
        LOWER(note) LIKE '%bus%' OR LOWER(note) LIKE '%train%' OR LOWER(note) LIKE '%car%' OR
        LOWER(note) LIKE '%toll%' OR LOWER(note) LIKE '%parking%' OR LOWER(note) LIKE '%fast tag%'
    );

    -- Travel
    UPDATE expenses SET category_id = travel_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%flight%' OR LOWER(note) LIKE '%ticket%' OR LOWER(note) LIKE '%hotel%' OR
        LOWER(note) LIKE '%travel%' OR LOWER(note) LIKE '%trip%' OR LOWER(note) LIKE '%visa%'
    );

    -- Shopping
    UPDATE expenses SET category_id = shopping_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%shopping%' OR LOWER(note) LIKE '%clothes%' OR LOWER(note) LIKE '%pants%' OR
        LOWER(note) LIKE '%shirt%' OR LOWER(note) LIKE '%shoes%' OR LOWER(note) LIKE '%amazon%' OR
        LOWER(note) LIKE '%flipkart%' OR LOWER(note) LIKE '%purchase%'
    );

    -- Bills & Utilities / Housing
    UPDATE expenses SET category_id = housing_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%electricity%' OR LOWER(note) LIKE '%electric%' OR LOWER(note) LIKE '%water%' OR
        LOWER(note) LIKE '%internet%' OR LOWER(note) LIKE '%wifi%' OR LOWER(note) LIKE '%broadband%' OR
        LOWER(note) LIKE '%maintenance%' OR LOWER(note) LIKE '%society%' OR LOWER(note) LIKE '%rent%' OR
        LOWER(note) LIKE '%bill%'
    );

    -- Healthcare
    UPDATE expenses SET category_id = healthcare_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%medical%' OR LOWER(note) LIKE '%doctor%' OR LOWER(note) LIKE '%hospital%' OR
        LOWER(note) LIKE '%medicine%' OR LOWER(note) LIKE '%pharmacy%' OR LOWER(note) LIKE '%health%'
    );

    -- Education
    UPDATE expenses SET category_id = education_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%school%' OR LOWER(note) LIKE '%education%' OR LOWER(note) LIKE '%fees%' OR
        LOWER(note) LIKE '%tuition%' OR LOWER(note) LIKE '%book%' OR LOWER(note) LIKE '%stationery%'
    );

    -- Entertainment/Subscriptions
    UPDATE expenses SET category_id = entertainment_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix))
    AND (
        LOWER(note) LIKE '%subscription%' OR LOWER(note) LIKE '%netflix%' OR LOWER(note) LIKE '%prime%' OR
        LOWER(note) LIKE '%spotify%' OR LOWER(note) LIKE '%microsoft%' OR LOWER(note) LIKE '%chatgpt%' OR
        LOWER(note) LIKE '%cloud%' OR LOWER(note) LIKE '%star%' OR LOWER(note) LIKE '%movie%'
    );

    -- Everything else goes to Other
    UPDATE expenses SET category_id = other_cat_id
    WHERE user_id = user_id_fix 
    AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = user_id_fix));

    RAISE NOTICE '✅ Smart categorization complete!';
END $$;

-- Verify categorization
SELECT 
    c.name as category,
    COUNT(e.id) as expense_count,
    SUM(e.amount_inr) as total_amount
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name
ORDER BY total_amount DESC;

-- Check for any still uncategorized
SELECT 
    COUNT(*) as still_uncategorized,
    '❌ Still need manual categorization' as message
FROM expenses
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
AND (category_id IS NULL OR category_id NOT IN (SELECT id FROM categories WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'))
HAVING COUNT(*) > 0;
