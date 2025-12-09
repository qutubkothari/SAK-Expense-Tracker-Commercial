-- Attach existing family member to admin account
-- Run this in Supabase SQL Editor

-- Step 1: First, find your admin's family_id and the member's id
-- Replace 'YOUR_ADMIN_PHONE' with your actual admin phone number
SELECT 
  id,
  phone,
  family_id,
  role,
  invite_code
FROM users
WHERE phone = 'YOUR_ADMIN_PHONE';  -- Replace with your admin phone

-- Step 2: Find the family member you want to attach
-- Replace 'MEMBER_PHONE' with the family member's phone number
SELECT 
  id,
  phone,
  family_id,
  role
FROM users
WHERE phone = 'MEMBER_PHONE';  -- Replace with member's phone

-- Step 3: Update the family member to join admin's family
-- Replace the VALUES below with actual values from Step 1 and Step 2
UPDATE users
SET 
  family_id = 'ADMIN_FAMILY_ID_FROM_STEP_1',  -- Copy family_id from admin
  role = 'member'
WHERE id = 'MEMBER_USER_ID_FROM_STEP_2';  -- Copy id from member

-- Step 4: Verify the change
SELECT 
  u1.phone as admin_phone,
  u1.family_id,
  u1.role as admin_role,
  u1.invite_code,
  u2.phone as member_phone,
  u2.role as member_role
FROM users u1
LEFT JOIN users u2 ON u1.family_id = u2.family_id AND u2.role = 'member'
WHERE u1.role = 'admin'
ORDER BY u1.phone;
