-- Copy categories and subcategories from user 7861105301 to 7737835253 and 8160442719
-- Run this in Supabase SQL Editor

-- First, let's find the user IDs for these phone numbers
DO $$
DECLARE
    source_user_id TEXT;
    target_user_id_1 TEXT;
    target_user_id_2 TEXT;
    category_record RECORD;
    new_category_id UUID;
    old_category_id UUID;
    subcategory_record RECORD;
BEGIN
    -- Get source user ID (try multiple phone formats)
    SELECT id INTO source_user_id FROM users 
    WHERE phone LIKE '%7861105301%' 
    LIMIT 1;
    
    -- Get target user IDs (try multiple phone formats)
    SELECT id INTO target_user_id_1 FROM users 
    WHERE phone LIKE '%7737835253%'
    LIMIT 1;
    
    SELECT id INTO target_user_id_2 FROM users 
    WHERE phone LIKE '%8160442719%'
    LIMIT 1;
    
    RAISE NOTICE 'Source user ID: %', source_user_id;
    RAISE NOTICE 'Target user 1 ID: %', target_user_id_1;
    RAISE NOTICE 'Target user 2 ID: %', target_user_id_2;
    
    IF source_user_id IS NULL THEN
        RAISE EXCEPTION 'Source user not found! Check if user with phone containing 7861105301 exists.';
    END IF;
    
    IF target_user_id_1 IS NULL THEN
        RAISE EXCEPTION 'Target user 1 not found! Check if user with phone containing 7737835253 exists.';
    END IF;
    
    IF target_user_id_2 IS NULL THEN
        RAISE EXCEPTION 'Target user 2 not found! Check if user with phone containing 8160442719 exists.';
    END IF;
    
    -- Copy categories and subcategories to target_user_id_1
    RAISE NOTICE '=== Copying to user 7737835253 ===';
    
    -- Delete existing categories for target user 1 (cascades to subcategories)
    DELETE FROM categories WHERE user_id = target_user_id_1;
    RAISE NOTICE 'Deleted existing categories for user 1';
    
    -- Copy categories
    FOR category_record IN 
        SELECT * FROM categories 
        WHERE user_id = source_user_id 
        ORDER BY name
    LOOP
        old_category_id := category_record.id;
        
        -- Insert category for target user 1
        INSERT INTO categories (user_id, name, icon, color)
        VALUES (
            target_user_id_1,
            category_record.name,
            category_record.icon,
            category_record.color
        )
        RETURNING id INTO new_category_id;
        
        RAISE NOTICE 'Copied category: % (ID: %)', category_record.name, new_category_id;
        
        -- Copy subcategories for this category
        FOR subcategory_record IN
            SELECT * FROM subcategories
            WHERE category_id = old_category_id
            ORDER BY name
        LOOP
            INSERT INTO subcategories (category_id, name, icon, user_id)
            VALUES (
                new_category_id,
                subcategory_record.name,
                subcategory_record.icon,
                target_user_id_1
            );
            
            RAISE NOTICE '  - Copied subcategory: %', subcategory_record.name;
        END LOOP;
    END LOOP;
    
    -- Copy categories and subcategories to target_user_id_2
    RAISE NOTICE '=== Copying to user 8160442719 ===';
    
    -- Delete existing categories for target user 2 (cascades to subcategories)
    DELETE FROM categories WHERE user_id = target_user_id_2;
    RAISE NOTICE 'Deleted existing categories for user 2';
    
    -- Copy categories
    FOR category_record IN 
        SELECT * FROM categories 
        WHERE user_id = source_user_id 
        ORDER BY name
    LOOP
        old_category_id := category_record.id;
        
        -- Insert category for target user 2
        INSERT INTO categories (user_id, name, icon, color)
        VALUES (
            target_user_id_2,
            category_record.name,
            category_record.icon,
            category_record.color
        )
        RETURNING id INTO new_category_id;
        
        RAISE NOTICE 'Copied category: % (ID: %)', category_record.name, new_category_id;
        
        -- Copy subcategories for this category
        FOR subcategory_record IN
            SELECT * FROM subcategories
            WHERE category_id = old_category_id
            ORDER BY name
        LOOP
            INSERT INTO subcategories (category_id, name, icon, user_id)
            VALUES (
                new_category_id,
                subcategory_record.name,
                subcategory_record.icon,
                target_user_id_2
            );
            
            RAISE NOTICE '  - Copied subcategory: %', subcategory_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '=== COPY COMPLETED SUCCESSFULLY ===';
END $$;

-- Verify the copy
SELECT 
    u.phone,
    COUNT(DISTINCT c.id) as category_count,
    COUNT(DISTINCT s.id) as subcategory_count
FROM users u
LEFT JOIN categories c ON c.user_id = u.id::TEXT
LEFT JOIN subcategories s ON s.user_id = u.id::TEXT
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
GROUP BY u.phone
ORDER BY u.phone;

-- Show all categories and subcategories for verification
SELECT 
    u.phone,
    c.name as category_name,
    c.icon as category_icon,
    s.name as subcategory_name,
    s.icon as subcategory_icon
FROM users u
LEFT JOIN categories c ON c.user_id = u.id::TEXT
LEFT JOIN subcategories s ON s.category_id = c.id
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
ORDER BY u.phone, c.name, s.name;
