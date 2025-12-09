-- FIX SUBCATEGORIES FOR USER 77db4b3c-946e-464d-ac75-65c064b84b98
-- This will create proper subcategories for each category

DO $$
DECLARE
    target_user_id TEXT := '77db4b3c-946e-464d-ac75-65c064b84b98';
    food_category_id UUID;
    housing_category_id UUID;
    transportation_category_id UUID;
    travel_category_id UUID;
    entertainment_category_id UUID;
    shopping_category_id UUID;
    healthcare_category_id UUID;
    education_category_id UUID;
    deeni_category_id UUID;
    gifts_category_id UUID;
    investment_category_id UUID;
    other_category_id UUID;
    personal_care_category_id UUID;
BEGIN
    -- Get category IDs for the target user
    SELECT id INTO food_category_id FROM categories WHERE user_id = target_user_id AND name = 'Food & Dining' LIMIT 1;
    SELECT id INTO housing_category_id FROM categories WHERE user_id = target_user_id AND name = 'Housing' LIMIT 1;
    SELECT id INTO transportation_category_id FROM categories WHERE user_id = target_user_id AND name = 'Transportation' LIMIT 1;
    SELECT id INTO travel_category_id FROM categories WHERE user_id = target_user_id AND name = 'Travel' LIMIT 1;
    SELECT id INTO entertainment_category_id FROM categories WHERE user_id = target_user_id AND name = 'Entertainment' LIMIT 1;
    SELECT id INTO shopping_category_id FROM categories WHERE user_id = target_user_id AND name = 'Shopping' LIMIT 1;
    SELECT id INTO healthcare_category_id FROM categories WHERE user_id = target_user_id AND name = 'Healthcare' LIMIT 1;
    SELECT id INTO education_category_id FROM categories WHERE user_id = target_user_id AND name = 'Education' LIMIT 1;
    SELECT id INTO deeni_category_id FROM categories WHERE user_id = target_user_id AND name = 'Deeni Umoor' LIMIT 1;
    SELECT id INTO gifts_category_id FROM categories WHERE user_id = target_user_id AND name = 'Gifts & Donations' LIMIT 1;
    SELECT id INTO investment_category_id FROM categories WHERE user_id = target_user_id AND name = 'Investment' LIMIT 1;
    SELECT id INTO other_category_id FROM categories WHERE user_id = target_user_id AND name = 'Other' LIMIT 1;
    SELECT id INTO personal_care_category_id FROM categories WHERE user_id = target_user_id AND name = 'Personal Care' LIMIT 1;

    -- Delete existing subcategories for this user to start fresh
    DELETE FROM subcategories WHERE user_id = target_user_id;

    -- Food & Dining subcategories
    IF food_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, food_category_id, 'Groceries', '🛒'),
        (target_user_id, food_category_id, 'Restaurants', '🍽️'),
        (target_user_id, food_category_id, 'Fast Food', '🍔'),
        (target_user_id, food_category_id, 'Delivery', '🚚'),
        (target_user_id, food_category_id, 'Cafe', '☕')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Housing subcategories
    IF housing_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, housing_category_id, 'Rent', '🏠'),
        (target_user_id, housing_category_id, 'Utilities', '💡'),
        (target_user_id, housing_category_id, 'Internet', '📶'),
        (target_user_id, housing_category_id, 'Maintenance', '🔧'),
        (target_user_id, housing_category_id, 'Furniture', '🛋️')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Transportation subcategories
    IF transportation_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, transportation_category_id, 'Fuel', '⛽'),
        (target_user_id, transportation_category_id, 'Public Transport', '🚌'),
        (target_user_id, transportation_category_id, 'Taxi/Ride', '🚕'),
        (target_user_id, transportation_category_id, 'Parking', '🅿️'),
        (target_user_id, transportation_category_id, 'Maintenance', '🔧')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Travel subcategories
    IF travel_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, travel_category_id, 'Flights', '✈️'),
        (target_user_id, travel_category_id, 'Hotels', '🏨'),
        (target_user_id, travel_category_id, 'Tours', '🗺️'),
        (target_user_id, travel_category_id, 'Visa', '📋'),
        (target_user_id, travel_category_id, 'Travel Insurance', '🛡️')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Entertainment subcategories
    IF entertainment_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, entertainment_category_id, 'Movies', '🎬'),
        (target_user_id, entertainment_category_id, 'Games', '🎮'),
        (target_user_id, entertainment_category_id, 'Concerts', '🎵'),
        (target_user_id, entertainment_category_id, 'Streaming', '📺'),
        (target_user_id, entertainment_category_id, 'Sports', '⚽')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Shopping subcategories
    IF shopping_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, shopping_category_id, 'Clothing', '👕'),
        (target_user_id, shopping_category_id, 'Electronics', '📱'),
        (target_user_id, shopping_category_id, 'Books', '📚'),
        (target_user_id, shopping_category_id, 'Home Goods', '🏠'),
        (target_user_id, shopping_category_id, 'Gifts', '🎁')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Healthcare subcategories
    IF healthcare_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, healthcare_category_id, 'Doctor', '👨‍⚕️'),
        (target_user_id, healthcare_category_id, 'Pharmacy', '💊'),
        (target_user_id, healthcare_category_id, 'Dental', '🦷'),
        (target_user_id, healthcare_category_id, 'Vision', '👓'),
        (target_user_id, healthcare_category_id, 'Insurance', '🛡️')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Education subcategories
    IF education_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, education_category_id, 'Tuition', '🎓'),
        (target_user_id, education_category_id, 'Books', '📚'),
        (target_user_id, education_category_id, 'Courses', '💻'),
        (target_user_id, education_category_id, 'Supplies', '✏️'),
        (target_user_id, education_category_id, 'School Fees', '🏫')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Deeni Umoor subcategories
    IF deeni_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, deeni_category_id, 'Zakat', '💰'),
        (target_user_id, deeni_category_id, 'Sadaqah', '🤲'),
        (target_user_id, deeni_category_id, 'Fitrana', '🌙'),
        (target_user_id, deeni_category_id, 'Religious Books', '📖'),
        (target_user_id, deeni_category_id, 'Mosque Donation', '🕌')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Gifts & Donations subcategories
    IF gifts_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, gifts_category_id, 'Birthday Gifts', '🎂'),
        (target_user_id, gifts_category_id, 'Wedding Gifts', '💍'),
        (target_user_id, gifts_category_id, 'Charity', '❤️'),
        (target_user_id, gifts_category_id, 'Festival Gifts', '🎉'),
        (target_user_id, gifts_category_id, 'Thank You Gifts', '🙏')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Investment subcategories
    IF investment_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, investment_category_id, 'Stocks', '📈'),
        (target_user_id, investment_category_id, 'Mutual Funds', '💼'),
        (target_user_id, investment_category_id, 'Real Estate', '🏢'),
        (target_user_id, investment_category_id, 'Crypto', '₿'),
        (target_user_id, investment_category_id, 'Savings', '🏦')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Other subcategories
    IF other_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, other_category_id, 'Miscellaneous', '📦'),
        (target_user_id, other_category_id, 'Fees & Charges', '💳'),
        (target_user_id, other_category_id, 'Penalties', '⚠️'),
        (target_user_id, other_category_id, 'Repairs', '🔨'),
        (target_user_id, other_category_id, 'Uncategorized', '❓')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Personal Care subcategories
    IF personal_care_category_id IS NOT NULL THEN
        INSERT INTO subcategories (user_id, category_id, name, icon) VALUES
        (target_user_id, personal_care_category_id, 'Haircut', '💇'),
        (target_user_id, personal_care_category_id, 'Salon/Spa', '💆'),
        (target_user_id, personal_care_category_id, 'Cosmetics', '💄'),
        (target_user_id, personal_care_category_id, 'Toiletries', '🧴'),
        (target_user_id, personal_care_category_id, 'Gym/Fitness', '💪')
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '✅ Subcategories created successfully';
END $$;

-- Verify subcategories were created
SELECT 
    c.name as category_name,
    COUNT(s.id) as subcategory_count,
    string_agg(s.name, ', ' ORDER BY s.name) as subcategories
FROM categories c
LEFT JOIN subcategories s ON c.id = s.category_id AND s.user_id = c.user_id
WHERE c.user_id = '77db4b3c-946e-464d-ac75-65c064b84b98'
GROUP BY c.name
ORDER BY c.name;
