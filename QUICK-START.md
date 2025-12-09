# Quick Start - Business Expense Manager

## 1️⃣ Database Setup (5 minutes)

1. Open Supabase: https://supabase.com/dashboard/project/hcjsmankbnnehylughxy
2. Go to SQL Editor
3. Copy entire content from `database/COMMERCIAL-SETUP.sql`
4. Paste and Execute
5. Verify success message: "✅ Business Expense Manager database setup complete!"

## 2️⃣ Test App (2 minutes)

```powershell
# Start local server
python -m http.server 8000

# Open browser
http://localhost:8000
```

**Test Registration:**
- Click "Register"
- Phone: 9876543210
- PIN: 1234
- Currency: INR
- Language: English
- Register ✓

**Test Features:**
- Add expense ✓
- View expenses ✓
- Create budget ✓
- Export data ✓

## 3️⃣ Build Android APK (10 minutes)

```powershell
# Sync and build
npx cap sync android
npx cap open android
```

In Android Studio:
- Build → Generate Signed Bundle / APK
- Select: APK → Release
- Output: `android/app/build/outputs/apk/release/`

## 📱 Quick Test on Device

1. Copy APK to phone
2. Install and open
3. Register with test account
4. Add 3-5 test expenses
5. Verify data persists after restart

## ✅ That's It!

Your commercial version is ready. See `SETUP-GUIDE.md` for detailed configuration.

---

**Repository:** https://github.com/qutubkothari/SAK-Expense-Tracker-Commercial  
**Supabase:** https://hcjsmankbnnehylughxy.supabase.co  
**GCloud Project:** sak-expense-tracker-commercial
