# 🎯 Business Expense Manager - Commercial Version Setup Guide

**Project:** SAK-Expense-Tracker-Commercial  
**Created:** December 9, 2025  
**Status:** Ready for Database Setup & Testing  
**Repository:** https://github.com/qutubkothari/SAK-Expense-Tracker-Commercial

---

## ✅ Completed Setup Steps

### 1. Project Initialization
- ✅ Copied from SAK-Expense-Tracker (excluded node_modules, build files, .git)
- ✅ Created fresh Git repository with clean history
- ✅ Pushed to GitHub successfully

### 2. Rebranding Complete
- ✅ **App Name:** Business Expense Manager
- ✅ **Short Name:** BizExpense
- ✅ **Android Package:** `com.businessexpensemanager.app`
- ✅ **Updated Files:**
  - `index.html` - Page title
  - `manifest.json` - App metadata
  - `build.gradle` - Android package ID
  - `capacitor.config.json` - App identifier
  - `strings.xml` - Android app name

### 3. Google Cloud Configuration
- ✅ **Project ID:** sak-expense-tracker-commercial
- ✅ **Project Created:** Ready for deployment
- ✅ **App Engine:** Configured in app.yaml

### 4. Supabase Configuration
- ✅ **URL:** https://hcjsmankbnnehylughxy.supabase.co
- ✅ **Anon Key:** Configured in supabaseClient.js
- ⚠️ **Database:** Not yet set up (see Next Steps below)

### 5. Family Features Removed
- ✅ **Removed invite code system**
- ✅ **Removed family_id references**
- ✅ **Removed family member management**
- ✅ **Simplified to single-user accounts**
- ✅ **Updated registration flow**
- ✅ **Updated onboarding for business use**

### 6. Database Schema Created
- ✅ **Master Setup Script:** `database/COMMERCIAL-SETUP.sql`
- ✅ **Features:**
  - Single-user business accounts
  - RLS disabled (REST API access)
  - Multi-currency support
  - Business expense tracking
  - Tax categories
  - Subscriptions management
  - AI insights
  - Budget management

### 7. Security Updates
- ✅ Removed hardcoded API keys
- ✅ Added placeholders for OpenAI API configuration
- ✅ Clean git history (no secrets)

---

## 🔄 Next Steps (In Order)

### Step 1: Database Setup

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/hcjsmankbnnehylughxy
   - Navigate to SQL Editor

2. **Run the Master Setup Script:**
   ```sql
   -- Copy and paste the entire content of:
   database/COMMERCIAL-SETUP.sql
   
   -- This will create:
   -- ✓ Users table (no family system)
   -- ✓ Categories & Subcategories
   -- ✓ Expenses table (multi-currency)
   -- ✓ Income tracking
   -- ✓ Budgets & alerts
   -- ✓ Tax categories
   -- ✓ Subscriptions
   -- ✓ AI insights
   -- ✓ User preferences
   -- ✓ Exchange rates
   -- ✓ All indexes and triggers
   -- ✓ RLS DISABLED on all tables
   ```

3. **Verify Database Setup:**
   ```sql
   -- Check that all tables are created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Verify RLS is disabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   -- rowsecurity should be 'f' (false) for all tables
   
   -- Check default categories
   SELECT COUNT(*) as category_count FROM categories WHERE is_default = TRUE;
   -- Should return 10 categories
   ```

### Step 2: Configure OpenAI API (Optional)

If you want AI features (Receipt Scanner, Voice AI):

1. Get OpenAI API Key from: https://platform.openai.com/api-keys

2. Update these files with your key:
   - `app.js` (line 123)
   - `www/app.js` (line 127)
   - `receipt-scanner.js` (line 6)
   - `www/receipt-scanner.js` (line 6)

   Replace: `YOUR_OPENAI_API_KEY_HERE`  
   With: `sk-proj-your-actual-key`

**Note:** For production, move this to environment variables or Supabase Edge Functions.

### Step 3: Test Web App Locally

1. **Start Local Server:**
   ```powershell
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js
   npx http-server -p 8000
   ```

2. **Open in Browser:**
   ```
   http://localhost:8000
   ```

3. **Test Registration:**
   - Click "Register"
   - Select country code (default +91)
   - Enter phone: `9876543210`
   - Enter PIN: `1234`
   - Select currency: INR
   - Select language: English
   - Click Register
   - Should see: "✅ Registration successful! Welcome to Business Expense Manager."

4. **Test Login:**
   - Enter same phone and PIN
   - Should load dashboard

5. **Test Core Features:**
   - ✓ Add expense
   - ✓ Select category
   - ✓ View expense list
   - ✓ Edit expense
   - ✓ Delete expense
   - ✓ Filter by date
   - ✓ Create budget
   - ✓ Export data

### Step 4: Build Android APK

1. **Sync Capacitor:**
   ```powershell
   npx cap sync android
   ```

2. **Open in Android Studio:**
   ```powershell
   npx cap open android
   ```

3. **Build Release APK:**
   - Build → Generate Signed Bundle / APK
   - Select APK
   - Use keystore from `android/keystore.properties`
   - Build variant: `release`

4. **Output Location:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Step 5: Deploy to Google App Engine (Optional)

Only if you want web version hosted:

```powershell
gcloud config set project sak-expense-tracker-commercial
gcloud app deploy
```

---

## 📊 Database Schema Summary

### Core Tables

1. **users** - Single business user accounts
   - No family_id, invite_code, or role fields
   - Includes default_currency, default_language
   - Premium status tracking

2. **expenses** - Multi-currency expense tracking
   - amount, currency, exchange_rate
   - expense_type (business/personal/travel)
   - location, business_name
   - payment_method, payment_status
   - is_reimbursable flag

3. **categories** - Expense categories
   - User-specific or default categories
   - 10 default categories provided

4. **subcategories** - Subcategories for detailed tracking

5. **income** - Income source tracking

6. **budgets** - Category budgets with alerts

7. **subscriptions** - Recurring expense tracking

8. **tax_categories** - Tax deduction tracking

9. **ai_insights** - AI-generated insights

10. **user_preferences** - User settings

### Important: RLS Disabled

All tables have Row Level Security **DISABLED** as per client requirement.  
Data access control is handled at the application layer through user_id filtering.

---

## 🔒 Security Notes

### Current Configuration:
- ✅ No hardcoded secrets in Git
- ✅ Supabase anon key in code (public by design)
- ⚠️ OpenAI API key needs configuration
- ⚠️ RLS disabled (use with caution)

### Production Recommendations:
1. Enable HTTPS only
2. Add rate limiting
3. Implement proper authentication
4. Move OpenAI key to environment variables
5. Add input validation
6. Consider enabling RLS with proper policies

---

## 🎯 Key Differences from Original

| Feature | Original | Commercial |
|---------|----------|------------|
| **User System** | Family-based with invite codes | Single business user |
| **Accounts** | Admin + Members | Individual accounts |
| **Database Security** | RLS enabled | RLS disabled |
| **Branding** | Family Expense Tracker | Business Expense Manager |
| **Target** | Personal/Family use | Business expense tracking |
| **Supabase Project** | Different project | New dedicated project |

---

## 📱 Testing Checklist

Before building final APK:

- [ ] Database schema runs successfully
- [ ] Registration works
- [ ] Login works
- [ ] Add expense works
- [ ] Categories load correctly
- [ ] Budgets can be created
- [ ] Data persists after logout/login
- [ ] Multi-currency conversion works
- [ ] Export functions work
- [ ] Voice input works (if API configured)
- [ ] Receipt scanner works (if API configured)
- [ ] SMS scanner works
- [ ] App theme toggle works
- [ ] Onboarding shows on first launch

---

## 🐛 Troubleshooting

### Issue: "Categories not loading"
**Solution:** Run the database setup script again. Check that default categories were inserted.

### Issue: "Registration fails"
**Solution:** Check Supabase connection. Verify users table exists.

### Issue: "Expenses not saving"
**Solution:** Check that expenses table has user_id column. Verify user is logged in.

### Issue: "RLS policy error"
**Solution:** Verify RLS is disabled on all tables using the verification query above.

### Issue: "Build fails in Android Studio"
**Solution:** 
1. Sync Gradle files
2. Clean build: Build → Clean Project
3. Rebuild: Build → Rebuild Project

---

## 📞 Support

For issues or questions:
- Check database setup first
- Review console logs in browser
- Check Supabase logs
- Verify all configuration files updated

---

## 🚀 Production Deployment Checklist

When ready to release:

- [ ] Database fully tested
- [ ] All API keys configured
- [ ] OpenAI API key secured
- [ ] Keystore properly configured
- [ ] App signed with release key
- [ ] Version number updated
- [ ] App tested on real devices
- [ ] Privacy policy updated
- [ ] Terms of service prepared
- [ ] Google Play Store listing ready
- [ ] Screenshots prepared
- [ ] App icon finalized

---

**Last Updated:** December 9, 2025  
**Version:** 1.0.0-commercial  
**Status:** Database setup required before testing
