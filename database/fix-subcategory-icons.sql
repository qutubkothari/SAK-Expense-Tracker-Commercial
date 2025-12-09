-- FIX SUBCATEGORY ICONS - Replace text abbreviations with proper emojis
-- Run this in Supabase SQL Editor

UPDATE subcategories 
SET icon = CASE name
    -- Deeni Umoor subcategories
    WHEN 'Ashara Mubaraka' THEN '🕌'
    WHEN 'FMB Thaali/Niyaz' THEN '🍲'
    WHEN 'Jamaat Expenses' THEN '🕌'
    WHEN 'Khumus' THEN '💰'
    WHEN 'Others' THEN '📌'
    WHEN 'Qardan Hasanah' THEN '🤝'
    WHEN 'Wajebaat' THEN '📿'
    WHEN 'Ziyarat' THEN '🕋'
    
    -- Food subcategories
    WHEN 'Groceries' THEN '🛒'
    WHEN 'Restaurants/Dine Out' THEN '🍽️'
    
    -- Housing subcategories
    WHEN 'Electricity' THEN '⚡'
    WHEN 'Gas' THEN '🔥'
    WHEN 'Internet' THEN '🌐'
    WHEN 'Mobile Recharges' THEN '📱'
    WHEN 'Rent/Maintenance' THEN '🏠'
    
    -- Transportation subcategories
    WHEN 'Fuel' THEN '⛽'
    WHEN 'Repairs/Maintenance' THEN '🔧'
    
    ELSE icon  -- Keep existing if not in the list
END
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
AND (
    icon IN ('AM', 'JM', 'QH', 'W', 'Z', 'Ot', 'RM', '5️', '👨')  -- Text abbreviations to replace
    OR LENGTH(icon) <= 2  -- Short text that should be emoji
);

-- Verify the fix
SELECT 
    c.name as category,
    s.name as subcategory,
    s.icon as new_icon
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE s.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY c.name, s.name;

-- Summary
SELECT 
    COUNT(*) as total_subcategories,
    COUNT(CASE WHEN LENGTH(icon) > 1 THEN 1 END) as emoji_icons,
    COUNT(CASE WHEN LENGTH(icon) <= 2 THEN 1 END) as text_icons
FROM subcategories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';
