-- Generate invite codes for existing admin users who don't have one
-- This ensures all admins can share their organization invite code

-- First, ensure the necessary columns exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Set role for existing admins based on is_admin column
UPDATE users 
SET role = 'admin'
WHERE is_admin = true AND (role IS NULL OR role != 'admin');

-- Generate invite codes for admin users
UPDATE users 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || phone) FROM 1 FOR 8))
WHERE is_admin = true 
  AND (invite_code IS NULL OR invite_code = '');

-- Verify the update
SELECT phone, is_admin, role, invite_code 
FROM users 
WHERE is_admin = true 
ORDER BY created_at;
