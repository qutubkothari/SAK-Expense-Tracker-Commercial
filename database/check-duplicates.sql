-- CHECK FOR DUPLICATE EXPENSES
-- This will show if expenses are duplicated in the database

SELECT 
    'Checking for duplicate expenses...' as status;

-- Show expenses grouped by category
SELECT 
    c.name as category,
    COUNT(e.id) as expense_count,
    ROUND(SUM(e.amount_inr)::numeric, 2) as total
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name, c.id
ORDER BY c.name;

-- Check for actual duplicate expense records (same amount, date, note)
SELECT 
    note,
    amount,
    date,
    category_id,
    COUNT(*) as duplicate_count
FROM expenses
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY note, amount, date, category_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Total unique expenses
SELECT 
    COUNT(DISTINCT id) as total_unique_expenses,
    COUNT(id) as total_expense_records,
    COUNT(id) - COUNT(DISTINCT id) as potential_duplicates
FROM expenses
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';
