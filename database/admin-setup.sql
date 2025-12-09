-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- To make yourself admin, run this with your phone number:
-- UPDATE users SET is_admin = TRUE WHERE phone = 'YOUR_PHONE_NUMBER';

-- Example:
-- UPDATE users SET is_admin = TRUE WHERE phone = '+919876543210';
