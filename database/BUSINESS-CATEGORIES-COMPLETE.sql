-- =====================================================
-- COMPLETE BUSINESS CATEGORIES & INCOME SOURCES SETUP
-- =====================================================
-- This script:
-- 1. Deletes ALL existing categories and subcategories
-- 2. Adds comprehensive business expense categories
-- 3. Updates income sources to: Petty Cash, Bank Transfer, Check
-- =====================================================

-- Step 1: Delete ALL existing categories and subcategories
-- (This will cascade delete subcategories due to foreign key)
DELETE FROM categories;
DELETE FROM subcategories;

-- Step 2: Insert Professional Business Expense Categories with Subcategories

-- 1. OFFICE & ADMINISTRATION
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Office & Administration', '🏢', '#8B7355', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Office Rent', '🏠'),
  ('Office Supplies', '📎'),
  ('Furniture & Fixtures', '🪑'),
  ('Equipment & Machinery', '⚙️'),
  ('Maintenance & Repairs', '🔧'),
  ('Utilities (Electric/Water/Gas)', '💡'),
  ('Internet & Phone', '📞'),
  ('Printing & Stationery', '🖨️'),
  ('Postage & Courier', '📦'),
  ('Cleaning Services', '🧹')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Office & Administration';

-- 2. EMPLOYEE EXPENSES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Employee Expenses', '👥', '#A0826D', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Salaries & Wages', '💰'),
  ('Employee Benefits', '🎁'),
  ('Bonuses & Incentives', '🏆'),
  ('Training & Development', '📚'),
  ('Recruitment Costs', '📝'),
  ('Team Building Activities', '🤝'),
  ('Employee Meals', '🍽️'),
  ('Staff Uniforms', '👔'),
  ('Health Insurance', '🏥'),
  ('Provident Fund (PF/EPF)', '🏦')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Employee Expenses';

-- 3. TRAVEL & TRANSPORTATION
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Travel & Transportation', '✈️', '#C9B8A3', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Air Travel', '✈️'),
  ('Train Travel', '🚆'),
  ('Local Transport (Cab/Auto)', '🚕'),
  ('Fuel & Vehicle Expenses', '⛽'),
  ('Vehicle Maintenance', '🔧'),
  ('Toll & Parking', '🅿️'),
  ('Hotel & Accommodation', '🏨'),
  ('Meals (Business Travel)', '🍴'),
  ('Per Diem Allowance', '💵'),
  ('Visa & Travel Documents', '📄')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Travel & Transportation';

-- 4. MARKETING & ADVERTISING
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Marketing & Advertising', '📢', '#8B7355', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Digital Marketing', '💻'),
  ('Social Media Ads', '📱'),
  ('Google Ads / PPC', '🔍'),
  ('Print Advertising', '📰'),
  ('Promotional Materials', '📋'),
  ('Trade Shows & Events', '🎪'),
  ('Sponsorships', '🎯'),
  ('Brand Design', '🎨'),
  ('SEO Services', '📈'),
  ('Content Creation', '✍️')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Marketing & Advertising';

-- 5. PROFESSIONAL SERVICES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Professional Services', '⚖️', '#A0826D', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Legal Fees', '⚖️'),
  ('Accounting Services', '📊'),
  ('Audit Fees', '🔍'),
  ('Consulting Fees', '💼'),
  ('Tax Preparation', '📄'),
  ('Business Registration', '📝'),
  ('License & Permits', '📜'),
  ('Patent & Trademark', '©️'),
  ('Notary Services', '✒️'),
  ('Background Verification', '🔐')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Professional Services';

-- 6. TECHNOLOGY & SOFTWARE
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Technology & Software', '💻', '#C9B8A3', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Software Subscriptions (SaaS)', '☁️'),
  ('Hardware Purchase', '🖥️'),
  ('IT Support & Maintenance', '🔧'),
  ('Cloud Storage', '💾'),
  ('Domain & Hosting', '🌐'),
  ('Cybersecurity', '🔒'),
  ('Software Licenses', '🔑'),
  ('Development Tools', '⚡'),
  ('Communication Tools', '💬'),
  ('Project Management Software', '📋')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Technology & Software';

-- 7. SALES & CLIENT ENTERTAINMENT
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Sales & Client Entertainment', '🤝', '#8B7355', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Client Meetings & Meals', '🍽️'),
  ('Business Gifts', '🎁'),
  ('Corporate Events', '🎉'),
  ('Sales Commission', '💰'),
  ('Customer Support Costs', '📞'),
  ('Client Site Visits', '🚗'),
  ('Hospitality', '🏨'),
  ('Conference Attendance', '🎤'),
  ('Entertainment', '🎭'),
  ('Vendor Relations', '🤝')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Sales & Client Entertainment';

-- 8. FINANCIAL EXPENSES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Financial Expenses', '💳', '#A0826D', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Bank Charges', '🏦'),
  ('Interest on Loans', '📈'),
  ('Credit Card Fees', '💳'),
  ('Payment Gateway Charges', '💸'),
  ('Foreign Exchange Loss', '💱'),
  ('Late Payment Penalties', '⚠️'),
  ('Insurance Premiums', '🛡️'),
  ('Investment Expenses', '📊'),
  ('Loan Processing Fees', '📄'),
  ('Financial Advisory', '💼')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Financial Expenses';

-- 9. INVENTORY & SUPPLIES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Inventory & Supplies', '📦', '#C9B8A3', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Raw Materials', '🏗️'),
  ('Finished Goods', '📦'),
  ('Packaging Materials', '📦'),
  ('Warehouse Costs', '🏭'),
  ('Inventory Management', '📊'),
  ('Freight & Shipping', '🚚'),
  ('Import Duties', '🛃'),
  ('Quality Control', '✅'),
  ('Stock Loss/Damage', '⚠️'),
  ('Supplier Payments', '💰')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Inventory & Supplies';

-- 10. TAXES & COMPLIANCE
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Taxes & Compliance', '📋', '#8B7355', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('GST/VAT Payment', '💰'),
  ('Income Tax (TDS)', '📊'),
  ('Property Tax', '🏠'),
  ('Professional Tax', '📄'),
  ('Corporate Tax', '🏢'),
  ('Regulatory Compliance', '⚖️'),
  ('Filing Fees', '📝'),
  ('Penalties & Fines', '⚠️'),
  ('Stamp Duty', '📜'),
  ('Government Fees', '🏛️')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Taxes & Compliance';

-- 11. UTILITIES & FACILITIES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Utilities & Facilities', '⚡', '#A0826D', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Electricity', '💡'),
  ('Water Supply', '💧'),
  ('Gas & Fuel', '🔥'),
  ('Security Services', '🔒'),
  ('Pest Control', '🐜'),
  ('Waste Management', '🗑️'),
  ('Fire Safety Equipment', '🧯'),
  ('Facility Management', '🏢'),
  ('Generator Maintenance', '⚙️'),
  ('HVAC Services', '❄️')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Utilities & Facilities';

-- 12. RESEARCH & DEVELOPMENT
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Research & Development', '🔬', '#C9B8A3', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Product Development', '🛠️'),
  ('Market Research', '📊'),
  ('Testing & Quality Assurance', '✅'),
  ('Prototype Development', '🔧'),
  ('Lab Equipment', '🔬'),
  ('Research Materials', '📚'),
  ('Innovation Projects', '💡'),
  ('Technical Documentation', '📄'),
  ('Patent Research', '🔍'),
  ('Competitor Analysis', '📈')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Research & Development';

-- 13. MISCELLANEOUS EXPENSES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Miscellaneous Expenses', '📝', '#8B7355', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Donations & CSR', '❤️'),
  ('Subscriptions & Memberships', '📰'),
  ('Books & Publications', '📚'),
  ('Contingency Expenses', '💼'),
  ('Petty Cash Expenses', '💵'),
  ('Staff Welfare', '🎁'),
  ('Office Celebrations', '🎉'),
  ('Emergency Repairs', '🚨'),
  ('Lost & Found', '🔍'),
  ('Other Expenses', '📋')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Miscellaneous Expenses';

-- Step 3: Update Income Sources
-- Delete the income_sources table and recreate with business payment methods
DROP TABLE IF EXISTS income_sources CASCADE;

CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '💰',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Business Payment Methods
INSERT INTO income_sources (name, icon, description) VALUES
  ('Petty Cash', '💵', 'Cash payments received'),
  ('Bank Transfer', '🏦', 'Direct bank transfers and wire transfers'),
  ('Check', '📝', 'Payment received via check/cheque');

-- Step 4: Update the income table to reference income_sources (if needed)
-- Add source_type column to income table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='income' AND column_name='source_type') THEN
        ALTER TABLE income ADD COLUMN source_type TEXT DEFAULT 'Bank Transfer';
    END IF;
END $$;

-- Update existing income records to use one of the new sources
UPDATE income SET source_type = 'Bank Transfer' WHERE source_type NOT IN ('Petty Cash', 'Bank Transfer', 'Check');

-- Verification queries
SELECT 'Categories Created:', COUNT(*) FROM categories;
SELECT 'Subcategories Created:', COUNT(*) FROM subcategories;
SELECT 'Income Sources Created:', COUNT(*) FROM income_sources;

-- Show summary
SELECT 
  c.name AS category_name,
  COUNT(s.id) AS subcategory_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
GROUP BY c.name
ORDER BY c.name;

SELECT * FROM income_sources ORDER BY name;

