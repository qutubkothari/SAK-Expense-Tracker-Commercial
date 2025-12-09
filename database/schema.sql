-- Enhanced schema for professional expense tracker

-- Categories table with icons
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Create expenses table if not exists (don't drop existing data)
CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  note TEXT,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories with icons (skip if already exist)
INSERT INTO categories (name, icon, color) VALUES
  ('Food & Dining', '🍽️', '#43bfa0'),
  ('Transportation', '🚗', '#ffd166'),
  ('Shopping', '🛍️', '#b388eb'),
  ('Entertainment', '🎬', '#f67280'),
  ('Health', '🏥', '#5f6caf'),
  ('Bills & Utilities', '💡', '#3a506b'),
  ('Education', '📚', '#2d8f6f'),
  ('Personal Care', '💆', '#c06c84')
ON CONFLICT (name) DO NOTHING;

-- Insert default subcategories (skip if already exist)
INSERT INTO subcategories (category_id, name, icon) VALUES
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Groceries', '🛒'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Milk', '🥛'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Vegetables', '🥬'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Fruits', '🍎'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Chicken', '🍗'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Snacks', '�'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Beverages', '🥤'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Staples', '🌾'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Restaurants', '�🍴'),
  ((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Coffee & Tea', '☕'),
  ((SELECT id FROM categories WHERE name = 'Transportation'), 'Fuel', '⛽'),
  ((SELECT id FROM categories WHERE name = 'Transportation'), 'Public Transit', '🚌'),
  ((SELECT id FROM categories WHERE name = 'Transportation'), 'Taxi/Uber', '🚕'),
  ((SELECT id FROM categories WHERE name = 'Shopping'), 'Clothing', '👕'),
  ((SELECT id FROM categories WHERE name = 'Shopping'), 'Electronics', '📱'),
  ((SELECT id FROM categories WHERE name = 'Shopping'), 'Home & Garden', '🏡'),
  ((SELECT id FROM categories WHERE name = 'Entertainment'), 'Movies', '🎥'),
  ((SELECT id FROM categories WHERE name = 'Entertainment'), 'Sports', '⚽'),
  ((SELECT id FROM categories WHERE name = 'Health'), 'Doctor', '👨‍⚕️'),
  ((SELECT id FROM categories WHERE name = 'Health'), 'Pharmacy', '💊'),
  ((SELECT id FROM categories WHERE name = 'Bills & Utilities'), 'Electricity', '⚡'),
  ((SELECT id FROM categories WHERE name = 'Bills & Utilities'), 'Internet', '🌐'),
  ((SELECT id FROM categories WHERE name = 'Bills & Utilities'), 'Subscriptions', '📋'),
  ((SELECT id FROM categories WHERE name = 'Education'), 'Books', '📖'),
  ((SELECT id FROM categories WHERE name = 'Education'), 'Courses', '🎓'),
  ((SELECT id FROM categories WHERE name = 'Personal Care'), 'Laundry', '🧺'),
  ((SELECT id FROM categories WHERE name = 'Personal Care'), 'Salon', '💇'),
  ((SELECT id FROM categories WHERE name = 'Personal Care'), 'Spa', '💆'),
  ((SELECT id FROM categories WHERE name = 'Personal Care'), 'Car Wash', '🚗')
ON CONFLICT (category_id, name) DO NOTHING;
