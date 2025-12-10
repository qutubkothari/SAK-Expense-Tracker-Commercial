-- Check all current categories and their user associations
SELECT 
  id,
  name,
  icon,
  color,
  user_id,
  is_default,
  created_at
FROM categories
ORDER BY created_at DESC;

-- Count categories by user_id
SELECT 
  COALESCE(user_id, 'NULL') AS user_id,
  COUNT(*) AS category_count
FROM categories
GROUP BY user_id;

-- Check all subcategories
SELECT 
  s.id,
  s.name AS subcategory_name,
  c.name AS category_name,
  s.created_at
FROM subcategories s
JOIN categories c ON s.category_id = c.id
ORDER BY c.name, s.name;

-- Count subcategories per category
SELECT 
  c.name AS category_name,
  COUNT(s.id) AS subcategory_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- Check if there are any user-specific categories (not NULL user_id)
SELECT 
  'User-specific categories' AS info,
  COUNT(*) AS count
FROM categories
WHERE user_id IS NOT NULL;

-- Check if there are any default categories (is_default = true)
SELECT 
  'Default categories' AS info,
  COUNT(*) AS count
FROM categories
WHERE is_default = true;
