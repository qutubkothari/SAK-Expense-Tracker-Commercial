# CRITICAL: Family System Fix - Deployment Instructions

## 🚨 **IMPORTANT: Run SQL First Before Deploying Code**

### Step 1: Update Database Schema (Supabase SQL Editor)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `fix-user-family-system.sql`
3. Click **Run** to execute
4. **Verify**: Check the results to ensure all users now have:
   - `family_id` (UUID)
   - `role` (admin or member)
   - `invite_code` (for admins only)

### Step 2: Deploy Code Changes

Run in terminal:
```powershell
cd "c:\Users\musta\OneDrive\Documents\GitHub\SAK Expense Tracker"
gcloud app deploy --quiet
```

## What This Fix Does:

### ✅ BEFORE (Broken):
- All new registrations shared same family_id
- Everyone could see everyone's expenses
- No proper family separation

### ✅ AFTER (Fixed):
- **New Registration WITHOUT invite code:**
  - Creates NEW independent family
  - User becomes ADMIN with unique `invite_code`
  - Can view own expenses only
  - Can share invite code with family members

- **New Registration WITH invite code:**
  - Joins existing family as MEMBER
  - Admin can see all family expenses
  - Members see only their own expenses

## How Family System Works:

1. **User A registers** (no invite code)
   - Gets family_id: `abc-123`
   - Role: `admin`
   - Invite code: `XYZ789PQ`
   - Can see only own expenses

2. **User A shares invite code** with family
   - Shows in Admin Panel: "Family Invite Code: XYZ789PQ"
   - Copy button available

3. **User B registers** with invite code `XYZ789PQ`
   - Joins family_id: `abc-123`
   - Role: `member`
   - No invite code (not admin)

4. **User A (admin) can now:**
   - See consolidated view of all family expenses
   - See individual view per family member
   - Share invite code with more family members

5. **User B (member) can:**
   - See only own expenses
   - Cannot see other family members' data

## UI Changes:

### Login/Register Screen:
- Toggle between Login and Register modes
- Register shows optional "Family Invite Code" field
- Upon successful registration:
  - **Admin**: Shows popup with invite code to share
  - **Member**: Shows "Successfully joined family"

### Admin Panel (for admins only):
- Displays family invite code with copy button
- Consolidated view shows all family expenses
- Individual view shows per-member breakdown

## Testing Steps:

1. **Test New Independent Admin:**
   - Register new user WITHOUT invite code
   - Should see invite code in popup
   - Check Admin Panel shows invite code
   - Verify can only see own expenses

2. **Test Family Member:**
   - Copy invite code from first user
   - Register second user WITH that invite code
   - Should see "Successfully joined family"
   - Verify member sees only own expenses
   - Login as first user (admin)
   - Verify admin now sees both users in consolidated view

3. **Test Multiple Families:**
   - Register third user WITHOUT invite code
   - Should create separate family with different invite code
   - Verify third user cannot see first two users' data

## Rollback Plan (if needed):

If something goes wrong, you can revert the database changes:
```sql
-- Remove new columns
ALTER TABLE users 
DROP COLUMN IF EXISTS family_id,
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS invite_code;
```

Then redeploy previous code version from Git history.
