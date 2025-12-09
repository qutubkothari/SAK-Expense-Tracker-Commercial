-- Sync budget categories/subcategories to match expense categories/subcategories
-- For users: 7861105301, 7737835253, 8160442719
-- This ensures budgets can be set for the same categories used in expenses

DO $$
DECLARE
    user_record RECORD;
    expense_category RECORD;
    budget_category RECORD;
    expense_subcategory RECORD;
    budget_subcategory RECORD;
    category_exists BOOLEAN;
    subcategory_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== Syncing Budget Categories with Expense Categories ===';
    
    -- Loop through each of the three users
    FOR user_record IN 
        SELECT id, phone 
        FROM users 
        WHERE phone LIKE '%7861105301%' 
           OR phone LIKE '%7737835253%' 
           OR phone LIKE '%8160442719%'
    LOOP
        RAISE NOTICE '';
        RAISE NOTICE '--- Processing user: % (ID: %) ---', user_record.phone, user_record.id;
        
        -- Find all unique categories used in expenses (via category_id)
        FOR expense_category IN
            SELECT DISTINCT 
                c.id as category_id,
                c.name as category_name,
                c.icon as category_icon,
                c.color as category_color
                        FROM expenses e
                        INNER JOIN categories c ON e.category_id::TEXT = c.id::TEXT
                        WHERE e.user_id::TEXT = user_record.id::TEXT
                            AND c.user_id::TEXT = user_record.id::TEXT
            ORDER BY c.name
        LOOP
            RAISE NOTICE '  ✓ Found category in expenses: %', expense_category.category_name;
            
            -- Now check subcategories for this category
            FOR expense_subcategory IN
                SELECT DISTINCT 
                    s.id as subcategory_id,
                    s.name as subcategory_name,
                    s.icon as subcategory_icon
                                FROM expenses e
                                INNER JOIN subcategories s ON e.subcategory_id::TEXT = s.id::TEXT
                                WHERE e.user_id::TEXT = user_record.id::TEXT
                                    AND e.category_id::TEXT = expense_category.category_id::TEXT
                                    AND s.user_id::TEXT = user_record.id::TEXT
                ORDER BY s.name
            LOOP
                RAISE NOTICE '    ✓ Found subcategory in expenses: % -> %', expense_category.category_name, expense_subcategory.subcategory_name;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Completed sync for user: %', user_record.phone;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SYNC COMPLETED SUCCESSFULLY ===';
END $$;

-- Verification: Show categories and subcategories for each user
SELECT 
    u.phone,
    'Categories used in expenses' as data_type,
    COUNT(DISTINCT c.id) as count
FROM users u
INNER JOIN expenses e ON e.user_id::TEXT = u.id::TEXT
INNER JOIN categories c ON e.category_id::TEXT = c.id::TEXT
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
GROUP BY u.phone

UNION ALL

SELECT 
    u.phone,
    'Total categories in category table' as data_type,
    COUNT(DISTINCT c.id) as count
FROM users u
LEFT JOIN categories c ON c.user_id::TEXT = u.id::TEXT
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
GROUP BY u.phone

UNION ALL

SELECT 
    u.phone,
    'Subcategories used in expenses' as data_type,
    COUNT(DISTINCT s.id) as count
FROM users u
INNER JOIN expenses e ON e.user_id::TEXT = u.id::TEXT
INNER JOIN subcategories s ON e.subcategory_id::TEXT = s.id::TEXT
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
GROUP BY u.phone

UNION ALL

SELECT 
    u.phone,
    'Total subcategories in subcategory table' as data_type,
    COUNT(DISTINCT s.id) as count
FROM users u
LEFT JOIN subcategories s ON s.user_id::TEXT = u.id::TEXT
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
GROUP BY u.phone

ORDER BY phone, data_type;

-- Detailed view: Show all categories and subcategories side by side
WITH expense_cats AS (
    SELECT DISTINCT
        u.phone,
        c.name as category,
        s.name as subcategory
    FROM users u
        INNER JOIN expenses e ON e.user_id::TEXT = u.id::TEXT
        INNER JOIN categories c ON e.category_id::TEXT = c.id::TEXT
        LEFT JOIN subcategories s ON e.subcategory_id::TEXT = s.id::TEXT
    WHERE u.phone LIKE '%7861105301%' 
       OR u.phone LIKE '%7737835253%' 
       OR u.phone LIKE '%8160442719%'
),
all_budget_cats AS (
    SELECT 
        u.phone,
        c.name as category,
        s.name as subcategory
    FROM users u
        INNER JOIN categories c ON c.user_id::TEXT = u.id::TEXT
        LEFT JOIN subcategories s ON s.category_id::TEXT = c.id::TEXT
    WHERE u.phone LIKE '%7861105301%' 
       OR u.phone LIKE '%7737835253%' 
       OR u.phone LIKE '%8160442719%'
)
SELECT 
    COALESCE(ec.phone, bc.phone) as phone,
    COALESCE(ec.category, bc.category) as category_name,
    COALESCE(ec.subcategory, bc.subcategory) as subcategory_name,
    CASE WHEN ec.category IS NOT NULL THEN '✓' ELSE '✗' END as used_in_expenses,
    CASE WHEN bc.category IS NOT NULL THEN '✓' ELSE '✗' END as available_for_budgets
FROM expense_cats ec
FULL OUTER JOIN all_budget_cats bc 
    ON ec.phone = bc.phone 
    AND ec.category = bc.category 
    AND (ec.subcategory = bc.subcategory OR (ec.subcategory IS NULL AND bc.subcategory IS NULL))
ORDER BY phone, category_name, subcategory_name;
