-- Add detailed grocery subcategories to Food & Dining category

-- Insert grocery-specific subcategories
INSERT INTO subcategories (category_id, name, icon) VALUES
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Milk', '🥛'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Vegetables', '🥬'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Fruits', '🍎'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Chicken', '🍗'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Snacks', '🍿'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Beverages', '🥤'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Staples', '🌾')
ON CONFLICT (category_id, name) DO NOTHING;

-- Also add missing subcategories from other updates
INSERT INTO subcategories (category_id, name, icon) VALUES
  ((SELECT id FROM categories WHERE name = 'Bills & Utilities'), 'Subscriptions', '📋'),
  ((SELECT id FROM categories WHERE name = 'Personal Care'), 'Car Wash', '🚗')
ON CONFLICT (category_id, name) DO NOTHING;
