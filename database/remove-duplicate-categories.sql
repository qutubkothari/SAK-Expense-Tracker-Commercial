-- Remove duplicate categories and subcategories for specific users
-- Users: 7861105301, 7737835253, 8160442719
-- Keeps the earliest category/subcategory per name and deletes the rest

WITH target_users AS (
    SELECT id::TEXT AS id_text, phone
    FROM users
    WHERE phone IN ('7861105301','7737835253','8160442719')
),
cat_dupes AS (
    SELECT id
    FROM (
        SELECT c.id,
               ROW_NUMBER() OVER (PARTITION BY c.user_id, c.name ORDER BY c.created_at) AS rn
        FROM categories c
        JOIN target_users u ON c.user_id = u.id_text
    ) ranked
    WHERE rn > 1
),
sub_dupes AS (
    SELECT id
    FROM (
        SELECT s.id,
               ROW_NUMBER() OVER (
                   PARTITION BY s.user_id, s.category_id, s.name
                   ORDER BY s.created_at
               ) AS rn
        FROM subcategories s
        JOIN target_users u ON s.user_id = u.id_text
    ) ranked
    WHERE rn > 1
)
DELETE FROM subcategories WHERE id IN (SELECT id FROM sub_dupes);

-- Delete duplicate categories (cascades to their subcategories/budgets)
WITH target_users AS (
    SELECT id::TEXT AS id_text, phone
    FROM users
    WHERE phone IN ('7861105301','7737835253','8160442719')
),
cat_dupes AS (
    SELECT id
    FROM (
        SELECT c.id,
               ROW_NUMBER() OVER (PARTITION BY c.user_id, c.name ORDER BY c.created_at) AS rn
        FROM categories c
        JOIN target_users u ON c.user_id = u.id_text
    ) ranked
    WHERE rn > 1
)
DELETE FROM categories WHERE id IN (SELECT id FROM cat_dupes);

-- Verification
SELECT u.phone,
       COUNT(DISTINCT c.name) AS unique_categories,
       COUNT(c.id) AS total_category_rows
FROM users u
LEFT JOIN categories c ON c.user_id = u.id::TEXT
WHERE u.phone IN ('7861105301','7737835253','8160442719')
GROUP BY u.phone
ORDER BY u.phone;

SELECT u.phone,
       COUNT(DISTINCT s.name) AS unique_subcategories,
       COUNT(s.id) AS total_subcategory_rows
FROM users u
LEFT JOIN subcategories s ON s.user_id = u.id::TEXT
WHERE u.phone IN ('7861105301','7737835253','8160442719')
GROUP BY u.phone
ORDER BY u.phone;
