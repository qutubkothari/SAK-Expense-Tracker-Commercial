-- Add the missing 10th subcategory to Office & Administration
INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, 'Administrative Staff', '👔', NOW()
FROM categories c
WHERE c.name = 'Office & Administration'
AND NOT EXISTS (
  SELECT 1 FROM subcategories s 
  WHERE s.category_id = c.id 
  AND s.name = 'Administrative Staff'
);

-- Verify all categories have 10 subcategories
SELECT c.name AS category_name, COUNT(s.id) AS subcategory_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
