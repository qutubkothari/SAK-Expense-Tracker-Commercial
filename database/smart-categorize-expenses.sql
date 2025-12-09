-- SMART CATEGORIZATION - Auto-assign expenses to categories
-- This will fix the "?" issue by assigning categories to all uncategorized expenses

DO $$ 
DECLARE
    target_user_id TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';  -- Family member ID
    groceries_id UUID;
    transport_id UUID;
    utilities_id UUID;
    food_id UUID;
    shopping_id UUID;
    health_id UUID;
    entertainment_id UUID;
    education_id UUID;
    other_id UUID;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting smart categorization for user: %', target_user_id;
    
    -- Get category IDs
    SELECT id INTO groceries_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%grocery%' OR name ILIKE '%groceries%' LIMIT 1;
    SELECT id INTO transport_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%transport%' OR name ILIKE '%travel%' LIMIT 1;
    SELECT id INTO utilities_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%utilities%' OR name ILIKE '%bill%' LIMIT 1;
    SELECT id INTO food_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%food%' OR name ILIKE '%dining%' OR name ILIKE '%restaurant%' LIMIT 1;
    SELECT id INTO shopping_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%shopping%' OR name ILIKE '%clothes%' LIMIT 1;
    SELECT id INTO health_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%health%' OR name ILIKE '%medical%' LIMIT 1;
    SELECT id INTO entertainment_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%entertainment%' OR name ILIKE '%movie%' LIMIT 1;
    SELECT id INTO education_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%education%' OR name ILIKE '%fees%' OR name ILIKE '%school%' LIMIT 1;
    SELECT id INTO other_id FROM categories WHERE user_id = target_user_id AND name ILIKE '%other%' LIMIT 1;
    
    -- Categorize Groceries
    IF groceries_id IS NOT NULL THEN
        UPDATE expenses SET category_id = groceries_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%grocery%' OR description ILIKE '%supermarket%' OR 
            description ILIKE '%vegetables%' OR description ILIKE '%fruits%' OR
            description ILIKE '%milk%' OR description ILIKE '%bread%' OR
            description ILIKE '%rice%' OR description ILIKE '%dmart%' OR
            description ILIKE '%reliance%' OR description ILIKE '%bazar%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Groceries: % expenses', updated_count;
    END IF;
    
    -- Categorize Transport
    IF transport_id IS NOT NULL THEN
        UPDATE expenses SET category_id = transport_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%uber%' OR description ILIKE '%ola%' OR 
            description ILIKE '%taxi%' OR description ILIKE '%bus%' OR
            description ILIKE '%metro%' OR description ILIKE '%fuel%' OR
            description ILIKE '%petrol%' OR description ILIKE '%diesel%' OR
            description ILIKE '%rapido%' OR description ILIKE '%auto%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Transport: % expenses', updated_count;
    END IF;
    
    -- Categorize Utilities
    IF utilities_id IS NOT NULL THEN
        UPDATE expenses SET category_id = utilities_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%electricity%' OR description ILIKE '%water%' OR 
            description ILIKE '%internet%' OR description ILIKE '%wifi%' OR
            description ILIKE '%mobile%' OR description ILIKE '%recharge%' OR
            description ILIKE '%bill%' OR description ILIKE '%gas%' OR
            description ILIKE '%cylinder%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Utilities: % expenses', updated_count;
    END IF;
    
    -- Categorize Food/Dining
    IF food_id IS NOT NULL THEN
        UPDATE expenses SET category_id = food_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%restaurant%' OR description ILIKE '%food%' OR 
            description ILIKE '%lunch%' OR description ILIKE '%dinner%' OR
            description ILIKE '%breakfast%' OR description ILIKE '%zomato%' OR
            description ILIKE '%swiggy%' OR description ILIKE '%cafe%' OR
            description ILIKE '%pizza%' OR description ILIKE '%burger%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Food/Dining: % expenses', updated_count;
    END IF;
    
    -- Categorize Shopping
    IF shopping_id IS NOT NULL THEN
        UPDATE expenses SET category_id = shopping_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%shopping%' OR description ILIKE '%amazon%' OR 
            description ILIKE '%flipkart%' OR description ILIKE '%myntra%' OR
            description ILIKE '%clothes%' OR description ILIKE '%shoes%' OR
            description ILIKE '%shirt%' OR description ILIKE '%pants%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Shopping: % expenses', updated_count;
    END IF;
    
    -- Categorize Health
    IF health_id IS NOT NULL THEN
        UPDATE expenses SET category_id = health_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%doctor%' OR description ILIKE '%hospital%' OR 
            description ILIKE '%medicine%' OR description ILIKE '%pharmacy%' OR
            description ILIKE '%medical%' OR description ILIKE '%health%' OR
            description ILIKE '%clinic%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Health: % expenses', updated_count;
    END IF;
    
    -- Categorize Entertainment
    IF entertainment_id IS NOT NULL THEN
        UPDATE expenses SET category_id = entertainment_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%movie%' OR description ILIKE '%cinema%' OR 
            description ILIKE '%netflix%' OR description ILIKE '%prime%' OR
            description ILIKE '%spotify%' OR description ILIKE '%game%' OR
            description ILIKE '%entertainment%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Entertainment: % expenses', updated_count;
    END IF;
    
    -- Categorize Education
    IF education_id IS NOT NULL THEN
        UPDATE expenses SET category_id = education_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL
        AND (
            description ILIKE '%school%' OR description ILIKE '%fees%' OR 
            description ILIKE '%tuition%' OR description ILIKE '%course%' OR
            description ILIKE '%education%' OR description ILIKE '%books%' OR
            description ILIKE '%college%'
        );
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Education: % expenses', updated_count;
    END IF;
    
    -- Categorize remaining as "Other"
    IF other_id IS NOT NULL THEN
        UPDATE expenses SET category_id = other_id
        WHERE user_id = target_user_id 
        AND category_id IS NULL;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Other: % expenses', updated_count;
    END IF;
    
    RAISE NOTICE 'Smart categorization complete!';
END $$;

-- Show results
SELECT 
    'Categorization Complete!' as status,
    COUNT(*) as total_expenses,
    COUNT(category_id) as categorized,
    COUNT(*) - COUNT(category_id) as still_uncategorized
FROM expenses
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';

-- Show breakdown by category
SELECT 
    c.name as category,
    COUNT(e.id) as expense_count
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name
ORDER BY expense_count DESC;
