-- Check for duplicate category records in database
SELECT 
    name,
    user_id,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as ids
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY name, user_id
ORDER BY count DESC, name;

-- Also check total categories
SELECT COUNT(*) as total_categories
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';
