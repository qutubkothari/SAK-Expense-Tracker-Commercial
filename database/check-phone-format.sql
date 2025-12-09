-- Check the actual phone format in the database
SELECT id, phone, email, created_at 
FROM users 
WHERE phone LIKE '%7861105301%' 
   OR phone LIKE '%7737835253%' 
   OR phone LIKE '%8160442719%'
ORDER BY phone;

-- Also check all users to see the phone format pattern
SELECT id, phone, email, created_at 
FROM users 
ORDER BY created_at DESC
LIMIT 20;
