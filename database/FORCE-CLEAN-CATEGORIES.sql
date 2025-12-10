-- =====================================================
-- FORCE CLEAN ALL CATEGORIES - NUCLEAR OPTION
-- =====================================================
-- This will completely wipe and recreate everything
-- =====================================================

-- Step 1: Drop all foreign key constraints temporarily
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_subcategory_id_fkey;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

-- Step 2: TRUNCATE (complete wipe) instead of DELETE
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE subcategories CASCADE;

-- Step 3: Recreate foreign key constraints
ALTER TABLE subcategories 
  ADD CONSTRAINT subcategories_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE expenses 
  ADD CONSTRAINT expenses_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE expenses 
  ADD CONSTRAINT expenses_subcategory_id_fkey 
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL;

ALTER TABLE budgets 
  ADD CONSTRAINT budgets_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Step 4: Insert ONLY Business Categories

-- 1. OFFICE & ADMINISTRATION
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Office & Administration', '🏢', '#8B7355', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
FROM categories c, (VALUES
  ('Office Rent', '🏠'),
  ('Office Supplies', '📎'),
  ('Furniture & Fixtures', '🪑'),
  ('Equipment & Machinery', '⚙️'),
  ('Maintenance & Repairs', '🔧'),
  ('Internet & Phone', '📞'),
  ('Printing & Stationery', '🖨️'),
  ('Postage & Courier', '📦'),
  ('Cleaning Services', '🧹'),
  ('Administrative Staff', '👔')
) AS sub(subcategory_name, subcategory_icon)
WHERE c.name = 'Office & Administration';

-- 2. EMPLOYEE EXPENSES
INSERT INTO categories (id, name, icon, color, user_id, created_at) 
VALUES (gen_random_uuid(), 'Employee Expenses', '👥', '#A0826D', NULL, NOW());

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

INSERT INTO subcategories (id, category_id, name, icon, created_at) 
SELECT gen_random_uuid(), c.id, subcategory_name, subcategory_icon, NOW()
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

-- Verification
SELECT 'Categories Created:', COUNT(*) FROM categories;
SELECT 'Subcategories Created:', COUNT(*) FROM subcategories;

SELECT c.name AS category_name, COUNT(s.id) AS subcategory_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
