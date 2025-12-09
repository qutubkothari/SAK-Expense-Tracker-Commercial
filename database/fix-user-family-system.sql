-- Fix user and family system
-- This creates a proper multi-family structure where each new registration is independent

-- Step 1: Add family_id and role columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS family_id UUID,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Step 2: Set each existing user as admin of their own family
-- Generate unique family IDs for existing users
UPDATE users 
SET family_id = uuid_generate_v4(),
    role = 'admin'
WHERE family_id IS NULL;

-- Step 3: Generate unique invite codes for admins
UPDATE users 
SET invite_code = SUBSTRING(MD5(RANDOM()::TEXT || phone) FROM 1 FOR 8)
WHERE role = 'admin' AND invite_code IS NULL;

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);

-- Step 5: Update is_admin logic (all family admins are admins)
UPDATE users 
SET is_admin = TRUE 
WHERE role = 'admin';

-- Verify the changes
SELECT 
  id, 
  phone, 
  role, 
  family_id,
  invite_code,
  is_admin
FROM users
ORDER BY phone;
