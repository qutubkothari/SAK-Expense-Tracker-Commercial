-- RESET AND RECATEGORIZE ALL EXPENSES
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    user_id_fix TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';
BEGIN
    -- Reset ALL expenses to NULL (clear invalid category_ids)
    UPDATE expenses 
    SET category_id = NULL
    WHERE user_id = user_id_fix;
    
    RAISE NOTICE 'All expenses reset. Starting smart categorization...';
    
    -- Food & Dining
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Food & Dining')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'restaurant|dinner|lunch|breakfast|chicken|mutton|beef|zafran|mcdonald|caterer|abiz');
    
    -- Groceries
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Groceries')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'groceries|grocery|vegetables|fruits|market');
    
    -- Transportation
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Transportation')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'petrol|fuel|rickshaw|train|car.*clean|fast.*tag|toll|parking');
    
    -- Travel
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Travel')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'flight|hotel|visa|ticket' AND LOWER(note) !~ 'train');
    
    -- Shopping
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Shopping')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'shopping|pants|clothes|plant|scale|moon|perfect');
    
    -- Bills & Utilities
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Bills & Utilities')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'electricity|electric|internet|maintenance|society|bill|credit.*card');
    
    -- Healthcare
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Healthcare')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'medical|doctor|hospital|health|medicine');
    
    -- Education  
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Education')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'school|fees|stationery|education|tuition');
    
    -- Entertainment
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Entertainment')
    WHERE user_id = user_id_fix AND category_id IS NULL
    AND (LOWER(note) ~ 'subscription|microsoft|chatgpt|cloud|star|netflix|prime');
    
    -- Other (everything else)
    UPDATE expenses SET category_id = (SELECT id FROM categories WHERE user_id = user_id_fix AND name = 'Other')
    WHERE user_id = user_id_fix AND category_id IS NULL;
    
    RAISE NOTICE '✅ Done!';
END $$;

-- Show results
SELECT 
    COALESCE(c.name, '❌ NULL') as category,
    c.icon,
    COUNT(e.id) as expenses,
    ROUND(SUM(e.amount_inr)::numeric, 2) as total
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name, c.icon
ORDER BY total DESC NULLS LAST;
