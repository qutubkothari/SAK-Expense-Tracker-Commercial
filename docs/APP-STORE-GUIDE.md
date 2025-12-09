# App Store Build & Submission Guide

## ✅ Prerequisites Completed
- ✅ Capacitor installed
- ✅ Android project created
- ✅ iOS project created
- ✅ You have Apple & Google developer accounts

---

## 📱 Build Android APK/AAB

### Step 1: Install Android Studio
1. Download from https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio

### Step 2: Open Project in Android Studio
```bash
cd "c:\Users\musta\OneDrive\Documents\GitHub\SAK Expense Tracker"
npx cap open android
```

### Step 3: Configure App Details
In Android Studio:
1. Open `android/app/build.gradle`
2. Update version info:
```gradle
android {
    defaultConfig {
        applicationId "com.saksolution.expensetracker"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 4: Generate Signing Key
```bash
cd android/app
keytool -genkey -v -keystore release.keystore -alias expense-tracker -keyalg RSA -keysize 2048 -validity 10000
```
**Save the password securely!**

### Step 5: Configure Signing
Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=expense-tracker
storeFile=release.keystore
```

Update `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 6: Build Release AAB (for Google Play)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 7: Upload to Google Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Fill in app details:
   - **App name**: Family Expense Tracker
   - **Category**: Finance
   - **Privacy Policy URL**: https://exp.saksolution.com/privacy
4. Upload AAB file
5. Create store listing (use screenshots and description from MONETIZATION-GUIDE.md)
6. Submit for review

**Review time**: 1-3 days

---

## 🍎 Build iOS App

### Step 1: Install Xcode (Mac Required)
1. Download from Mac App Store
2. Install Command Line Tools:
```bash
xcode-select --install
```

### Step 2: Install CocoaPods
```bash
sudo gem install cocoapods
```

### Step 3: Open Project in Xcode
```bash
cd "c:\Users\musta\OneDrive\Documents\GitHub\SAK Expense Tracker"
npx cap open ios
```

**Note**: You'll need to transfer the project to a Mac or use a Mac build service.

### Step 4: Configure Signing
In Xcode:
1. Select project in left sidebar
2. Go to **Signing & Capabilities**
3. Select your Apple Developer Team
4. Enable **Automatic manage signing**

### Step 5: Update Version
1. Select **App** target
2. General tab
3. Set **Version**: 1.0.0
4. Set **Build**: 1

### Step 6: Create Archive
1. Product → Scheme → Edit Scheme
2. Set **Build Configuration** to **Release**
3. Product → Archive
4. Wait for build to complete

### Step 7: Upload to App Store Connect
1. Window → Organizer
2. Select your archive
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Follow wizard to upload

### Step 8: Submit for Review in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Fill in app information:
   - **Name**: Family Expense Tracker
   - **Subtitle**: Budget & Expense Manager
   - **Category**: Finance
   - **Privacy Policy**: https://exp.saksolution.com/privacy
3. Add screenshots (1242x2688 for iPhone)
4. Submit for review

**Review time**: 1-7 days

---

## 📸 App Store Assets Needed

### Screenshots Required

**Android (Google Play)**:
- Phone: 1080x1920 (minimum 2 screenshots)
- Tablet: 1200x1920 (recommended)

**iOS (App Store)**:
- iPhone 6.5": 1242x2688 (required)
- iPhone 5.5": 1242x2208 (optional)
- iPad Pro 12.9": 2048x2732 (if targeting iPad)

### App Icon
- **Android**: 512x512 PNG (created in `android/app/src/main/res/`)
- **iOS**: 1024x1024 PNG (added in Xcode Assets)

### Feature Graphic (Google Play only)
- Size: 1024x500 PNG
- Showcases main app features

---

## 🔄 Updating Your App

When you make changes to the web code:

```bash
# 1. Copy updated files to www
Copy-Item *.html,*.js,*.css -Destination www\ -Force

# 2. Sync with native projects
npx cap sync

# 3. Rebuild Android
cd android
./gradlew bundleRelease

# 4. Upload new AAB to Google Play Console
# (iOS requires rebuilding in Xcode on Mac)
```

---

## 💰 Pricing Strategy

### Google Play Store
- **Free** download
- **In-app subscription**: ₹299/month ($3.99)
- Or **One-time purchase**: ₹2,999 ($39.99)

### Apple App Store
- **Free** download
- **In-app subscription**: ₹299/month ($3.99)
- Or **One-time purchase**: ₹2,999 ($39.99)

**Why charge more than web?**
- App stores take 30% commission
- Users expect premium experience
- Native app benefits (better performance, push notifications)

---

## 🚀 Launch Checklist

### Before Submission
- [ ] Test app thoroughly on real devices
- [ ] Create privacy policy page
- [ ] Prepare app description
- [ ] Create 5+ screenshots
- [ ] Design app icon
- [ ] Set up pricing/subscriptions
- [ ] Test in-app purchases (if using)

### After Approval
- [ ] Promote on social media
- [ ] Submit to app review sites
- [ ] Reach out to tech bloggers
- [ ] Run Google Ads campaign
- [ ] Monitor reviews and respond
- [ ] Track downloads in consoles

---

## 📊 App Store Optimization (ASO)

### Keywords to Target
- expense tracker
- budget app
- family expenses
- money manager
- spending tracker
- finance app
- bill tracker
- SMS expense

### Tips for Better Rankings
1. Encourage user reviews (5-star)
2. Respond to all reviews
3. Update regularly (shows active development)
4. Localize for multiple languages
5. Cross-promote on your website

---

## 🆘 Common Issues

### Android Build Errors
**Error**: "SDK location not found"
**Fix**: Create `local.properties` in android folder:
```
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### iOS Build Errors
**Error**: "Provisioning profile doesn't match"
**Fix**: 
1. Xcode → Preferences → Accounts
2. Download Manual Profiles
3. Clean Build Folder (Cmd+Shift+K)

### Capacitor Sync Issues
**Fix**:
```bash
npx cap sync --force
```

---

## 📞 Next Steps

1. **Today**: Build Android APK and test on device
2. **Tomorrow**: Upload to Google Play (internal testing)
3. **This week**: Transfer iOS project to Mac and build
4. **Next week**: Submit both apps for review
5. **Week 3**: Apps go live! 🎉

---

## Support Contacts

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer**: https://developer.android.com
- **Apple Developer**: https://developer.apple.com
- **Your Support**: support@saksolution.com

Good luck with your launch! 🚀
