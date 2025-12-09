-- DELETE ALL DUPLICATE CATEGORIES - KEEP ONLY 13 CLEAN ONES
-- This will actually delete the duplicate rows from the database

-- First, let's see what we're deleting
SELECT id, name, icon, user_id 
FROM categories 
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
ORDER BY name;

-- DELETE duplicates - keep only the first occurrence of each category name
DELETE FROM categories
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, name,
      ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at) as rn
    FROM categories
    WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
  ) t
  WHERE rn > 1
);

-- Verify we now have only 13 categories
SELECT COUNT(*) as final_count, 
       string_agg(name, ', ' ORDER BY name) as category_names
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';
