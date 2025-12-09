-- Copy categories, subcategories, and budgets from user 7861105301 to 7737835253 and 8160442719
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    source_user_id TEXT;
    target_user_id_1 TEXT;
    target_user_id_2 TEXT;
    category_record RECORD;
    new_category_id UUID;
    old_category_id UUID;
    subcategory_record RECORD;
    new_subcategory_id UUID;
    old_subcategory_id UUID;
    budget_record RECORD;
    category_id_map JSONB := '{}';
    subcategory_id_map JSONB := '{}';
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
    
    -------------------------------------------
    -- COPY TO USER 1: 7737835253
    -------------------------------------------
    RAISE NOTICE '=== Copying to user 7737835253 ===';
    
    -- Delete existing data for target user 1
    DELETE FROM budgets WHERE user_id = target_user_id_1::UUID;
    DELETE FROM categories WHERE user_id = target_user_id_1;
    RAISE NOTICE 'Deleted existing data for user 1';
    
    -- Reset ID maps
    category_id_map := '{}';
    subcategory_id_map := '{}';
    
    -- Copy categories and build ID map
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
        
        -- Store mapping
        category_id_map := jsonb_set(category_id_map, ARRAY[old_category_id::TEXT], to_jsonb(new_category_id::TEXT));
        
        RAISE NOTICE 'Copied category: % (Old ID: %, New ID: %)', category_record.name, old_category_id, new_category_id;
        
        -- Copy subcategories for this category
        FOR subcategory_record IN
            SELECT * FROM subcategories
            WHERE category_id = old_category_id
            ORDER BY name
        LOOP
            old_subcategory_id := subcategory_record.id;
            
            INSERT INTO subcategories (category_id, name, icon, user_id)
            VALUES (
                new_category_id,
                subcategory_record.name,
                subcategory_record.icon,
                target_user_id_1
            )
            RETURNING id INTO new_subcategory_id;
            
            -- Store mapping
            subcategory_id_map := jsonb_set(subcategory_id_map, ARRAY[old_subcategory_id::TEXT], to_jsonb(new_subcategory_id::TEXT));
            
            RAISE NOTICE '  - Copied subcategory: % (Old ID: %, New ID: %)', subcategory_record.name, old_subcategory_id, new_subcategory_id;
        END LOOP;
    END LOOP;
    
    -- Copy budgets using the ID maps
    FOR budget_record IN
        SELECT * FROM budgets
        WHERE user_id = source_user_id::UUID
    LOOP
        INSERT INTO budgets (
            user_id, 
            category_id, 
            subcategory_id, 
            amount, 
            period, 
            start_date, 
            end_date, 
            alert_threshold, 
            is_active
        )
        VALUES (
            target_user_id_1::UUID,
            (category_id_map->>budget_record.category_id::TEXT)::UUID,
            (subcategory_id_map->>budget_record.subcategory_id::TEXT)::UUID,
            budget_record.amount,
            budget_record.period,
            budget_record.start_date,
            budget_record.end_date,
            budget_record.alert_threshold,
            budget_record.is_active
        );
        
        RAISE NOTICE '  - Copied budget: Amount=%, Period=%', budget_record.amount, budget_record.period;
    END LOOP;
    
    -------------------------------------------
    -- COPY TO USER 2: 8160442719
    -------------------------------------------
    RAISE NOTICE '=== Copying to user 8160442719 ===';
    
    -- Delete existing data for target user 2
    DELETE FROM budgets WHERE user_id = target_user_id_2::UUID;
    DELETE FROM categories WHERE user_id = target_user_id_2;
    RAISE NOTICE 'Deleted existing data for user 2';
    
    -- Reset ID maps
    category_id_map := '{}';
    subcategory_id_map := '{}';
    
    -- Copy categories and build ID map
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
        
        -- Store mapping
        category_id_map := jsonb_set(category_id_map, ARRAY[old_category_id::TEXT], to_jsonb(new_category_id::TEXT));
        
        RAISE NOTICE 'Copied category: % (Old ID: %, New ID: %)', category_record.name, old_category_id, new_category_id;
        
        -- Copy subcategories for this category
        FOR subcategory_record IN
            SELECT * FROM subcategories
            WHERE category_id = old_category_id
            ORDER BY name
        LOOP
            old_subcategory_id := subcategory_record.id;
            
            INSERT INTO subcategories (category_id, name, icon, user_id)
            VALUES (
                new_category_id,
                subcategory_record.name,
                subcategory_record.icon,
                target_user_id_2
            )
            RETURNING id INTO new_subcategory_id;
            
            -- Store mapping
            subcategory_id_map := jsonb_set(subcategory_id_map, ARRAY[old_subcategory_id::TEXT], to_jsonb(new_subcategory_id::TEXT));
            
            RAISE NOTICE '  - Copied subcategory: % (Old ID: %, New ID: %)', subcategory_record.name, old_subcategory_id, new_subcategory_id;
        END LOOP;
    END LOOP;
    
    -- Copy budgets using the ID maps
    FOR budget_record IN
        SELECT * FROM budgets
        WHERE user_id = source_user_id::UUID
    LOOP
        INSERT INTO budgets (
            user_id, 
            category_id, 
            subcategory_id, 
            amount, 
            period, 
            start_date, 
            end_date, 
            alert_threshold, 
            is_active
        )
        VALUES (
            target_user_id_2::UUID,
            (category_id_map->>budget_record.category_id::TEXT)::UUID,
            (subcategory_id_map->>budget_record.subcategory_id::TEXT)::UUID,
            budget_record.amount,
            budget_record.period,
            budget_record.start_date,
            budget_record.end_date,
            budget_record.alert_threshold,
            budget_record.is_active
        );
        
        RAISE NOTICE '  - Copied budget: Amount=%, Period=%', budget_record.amount, budget_record.period;
    END LOOP;
    
    RAISE NOTICE '=== COPY COMPLETED SUCCESSFULLY ===';
END $$;

-- Verify the copy - Categories and Subcategories
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

-- Verify the copy - Budgets
SELECT 
    u.phone,
    COUNT(b.id) as budget_count,
    SUM(b.amount) as total_budget_amount
FROM users u
LEFT JOIN budgets b ON b.user_id = u.id
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
GROUP BY u.phone
ORDER BY u.phone;

-- Show detailed breakdown
SELECT 
    u.phone,
    c.name as category_name,
    s.name as subcategory_name,
    b.amount as budget_amount,
    b.period,
    b.is_active
FROM users u
LEFT JOIN categories c ON c.user_id = u.id::TEXT
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN budgets b ON b.user_id = u.id AND (b.category_id = c.id OR b.subcategory_id = s.id)
WHERE u.phone LIKE '%7861105301%' 
   OR u.phone LIKE '%7737835253%' 
   OR u.phone LIKE '%8160442719%'
ORDER BY u.phone, c.name, s.name;
