-- =====================================================
-- FIX USERS TABLE FOR COMMERCIAL DATABASE
-- =====================================================
-- This will add the missing 'pin' column and set up proper auth
-- =====================================================

-- Add pin column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin TEXT;

-- Create a default admin user for testing
-- Phone: +919537653927, PIN: 5253
INSERT INTO users (id, phone, pin, full_name, email, role, is_active, created_at, updated_at)
VALUES (
  'acb03f62-dfb1-4191-80d6-a526b28fda50',
  '+919537653927',
  '5253',
  'Admin User',
  'admin@business.com',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  pin = '5253',
  phone = '+919537653927';

-- Add default_currency and default_language if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'INR';
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language_name TEXT DEFAULT 'English';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Verify the user was created
SELECT id, phone, pin, full_name, email, role, default_currency, default_language
FROM users
WHERE phone = '+919537653927';
