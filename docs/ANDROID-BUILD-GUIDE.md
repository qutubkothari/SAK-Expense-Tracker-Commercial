# Android App Build Guide

## 🎯 Quick Build Steps

### Step 1: Open Project in Android Studio
```powershell
npx cap open android
```
This will launch Android Studio with your project.

---

### Step 2: Generate Signing Key (First Time Only)

#### Option A: Using Android Studio UI
1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Click **Create new...** under Key store path
4. Fill in details:
   - **Key store path**: Choose location (e.g., `C:\Users\musta\release.keystore`)
   - **Password**: Create a strong password (SAVE THIS!)
   - **Alias**: expense-tracker
   - **Alias Password**: Same as above
   - **Validity**: 25 years
   - **First and Last Name**: Your name
   - **Organization**: SAK Solution
   - **Country**: AE (or your country code)
5. Click **OK**

#### Option B: Using Command Line (if you have JDK)
```powershell
keytool -genkey -v -keystore release.keystore -alias expense-tracker -keyalg RSA -keysize 2048 -validity 10000
```

**⚠️ IMPORTANT: Save your keystore file and passwords securely!**
- You need these for every app update
- If you lose them, you can't update your app on Play Store

---

### Step 3: Configure Signing in Android Studio

1. In Android Studio, open `android/app/build.gradle`
2. Add signing configuration:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file('C:\\Users\\musta\\release.keystore')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'expense-tracker'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

### Step 4: Update Version Info

In `android/app/build.gradle`, update:
```groovy
defaultConfig {
    applicationId "com.saksolution.expensetracker"
    versionCode 1        // Increment for each release (1, 2, 3...)
    versionName "1.0.0"  // Display version (1.0.0, 1.0.1, 1.1.0...)
}
```

---

### Step 5: Build Release Bundle

#### Option A: Using Android Studio UI
1. **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle** (AAB format for Play Store)
3. Choose your key store
4. Enter passwords
5. Select **release** build variant
6. Click **Finish**
7. Bundle will be at: `android/app/build/outputs/bundle/release/app-release.aab`

#### Option B: Using Terminal
```powershell
cd android
./gradlew bundleRelease
```

---

### Step 6: Test APK (Optional - for testing before Play Store)

To generate an APK for testing on your device:

```powershell
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

Install on device:
```powershell
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 📤 Upload to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app:
   - **App name**: Family Expense Tracker
   - **Default language**: English
   - **Type**: App
   - **Free/Paid**: Free
3. Complete store listing:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (at least 2)
   - Feature graphic (1024x500px)
   - App icon (512x512px)
4. Upload AAB file in **Production** → **Create new release**
5. Fill in release notes
6. Submit for review (1-3 days)

---

## 🔄 Future Updates

### Before Each Release:
1. Update your web files
2. Run `npx cap sync android`
3. Increment `versionCode` (e.g., 1 → 2)
4. Update `versionName` (e.g., "1.0.0" → "1.0.1")
5. Build new AAB
6. Upload to Play Store

---

## 🐛 Troubleshooting

### Build Errors
- Clean project: **Build** → **Clean Project**
- Rebuild: **Build** → **Rebuild Project**
- Invalidate cache: **File** → **Invalidate Caches / Restart**

### Signing Errors
- Verify keystore path is correct
- Check passwords are correct
- Ensure keystore file exists

### Gradle Errors
- Check internet connection (downloads dependencies)
- Update Android Gradle Plugin if prompted
- Sync project: **File** → **Sync Project with Gradle Files**

---

## 📋 App Details for Play Store

**App Name**: Family Expense Tracker  
**Package**: com.saksolution.expensetracker  
**Version**: 1.0.0  
**Min SDK**: 22 (Android 5.1)  
**Target SDK**: 34 (Android 14)

**Category**: Finance  
**Content Rating**: Everyone  
**Privacy Policy**: Required (host on your website)

---

## ✅ Pre-Launch Checklist

- [ ] App icon added (512x512px)
- [ ] Screenshots created (phone + tablet)
- [ ] Feature graphic created (1024x500px)
- [ ] Store description written
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Test APK installed and verified
- [ ] AAB file built successfully
- [ ] Signing key backed up securely
- [ ] Google Play Console account ready ($25 one-time fee)

---

**Next Command**: Run this to open Android Studio:
```powershell
npx cap open android
```
