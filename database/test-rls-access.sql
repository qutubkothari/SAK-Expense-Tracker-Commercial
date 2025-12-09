-- TEST: Verify categories are accessible via RLS for user 77db4b3c-946e-464d-ac75-65c064b84b98

-- Simulate what the app does: try to SELECT categories for this user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "77db4b3c-946e-464d-ac75-65c064b84b98"}';

-- This should return 4 categories
SELECT id, user_id, name, icon, color
FROM categories
WHERE user_id = '77db4b3c-946e-464d-ac75-65c064b84b98';

-- Reset
RESET role;
RESET request.jwt.claims;

-- Check RLS policies on categories
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY policyname;
