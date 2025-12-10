-- =====================================================
-- ADD IS_ADMIN COLUMN TO USERS
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set the current user as admin
UPDATE users 
SET is_admin = true 
WHERE id = 'acb03f62-dfb1-4191-80d6-a526b28fda50';

-- Verify
SELECT id, phone, email, is_admin FROM users;
