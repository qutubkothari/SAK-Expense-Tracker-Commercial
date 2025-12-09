# App Sitemap & User Flow

## Information Architecture

```
Family Expense Tracker
│
├── 🔐 Authentication
│   ├── Splash Screen
│   ├── Login (Phone + OTP)
│   ├── Register
│   └── Onboarding (3 slides)
│
├── 🏠 Home/Dashboard *
│   ├── Quick Actions
│   │   ├── Add Expense
│   │   ├── Voice Input
│   │   ├── Scan Receipt
│   │   └── Parse SMS
│   ├── Recent Expenses (→ All Expenses)
│   ├── Budget Widget (→ Budget)
│   └── Insights Preview (→ Analytics)
│
├── ➕ Add Expense
│   ├── Manual Entry Form
│   ├── Voice Input
│   ├── Receipt Scanner
│   └── SMS Parser
│       ├── Manual SMS Entry
│       ├── Share SMS Instructions
│       └── Auto-Capture Settings
│
├── 📝 Expenses
│   ├── All Expenses List
│   │   ├── Filters (Date, Category, Amount)
│   │   ├── Sort Options
│   │   └── Search
│   ├── Expense Details
│   │   ├── View Full Info
│   │   ├── Edit Expense
│   │   ├── Delete Expense
│   │   └── Share Expense
│   └── Categories Management
│       ├── All Categories
│       ├── Add/Edit Category
│       └── Subcategories
│
├── 📊 Analytics *
│   ├── Overview Dashboard
│   │   ├── Spending Trends (Line Chart)
│   │   ├── Category Breakdown (Pie Chart)
│   │   ├── Income vs Expenses (Bar Chart)
│   │   └── Key Stats Cards
│   ├── AI Insights (Premium)
│   │   ├── Spending Patterns
│   │   ├── Predictions
│   │   ├── Recommendations
│   │   └── Anomaly Detection
│   ├── Reports
│   │   ├── Monthly Summary
│   │   ├── Category Report
│   │   ├── Tax Report
│   │   └── Custom Report
│   └── Currency Comparison
│
├── 💰 Budget *
│   ├── Budget Overview
│   │   ├── Monthly Budget Status
│   │   ├── Category Budgets
│   │   └── Budget Alerts
│   ├── Set/Edit Budget
│   │   ├── Select Category
│   │   ├── Set Amount
│   │   ├── Alert Threshold
│   │   └── Time Period
│   └── Budget History
│
├── 👨‍👩‍👧 Family *
│   ├── Family Dashboard
│   │   ├── Family Overview
│   │   ├── Members List
│   │   └── Total Family Spending
│   ├── Invite Member
│   │   ├── Send Invitation
│   │   └── Pending Invitations
│   ├── Member Details
│   │   ├── Member's Expenses
│   │   ├── Category Breakdown
│   │   └── Contribution Stats
│   └── Family Settings (Admin)
│       ├── Manage Members
│       ├── Family Name
│       └── Permissions
│
└── 👤 Profile *
    ├── User Profile
    │   ├── Edit Profile
    │   ├── Change Photo
    │   └── Account Info
    ├── Subscription
    │   ├── Current Plan
    │   ├── Upgrade Options
    │   └── Billing History
    ├── Settings
    │   ├── Currency Preferences
    │   ├── Notifications
    │   ├── Dark Mode
    │   ├── Language
    │   ├── Auto-sync
    │   └── Biometric Lock
    ├── Premium Features
    │   ├── Recurring Expenses
    │   ├── Business Tracking
    │   ├── CSV Import
    │   └── Advanced Exports
    ├── Help & Support
    │   ├── FAQ
    │   ├── Contact Support
    │   ├── Video Tutorials
    │   └── User Guide
    └── Legal
        ├── Privacy Policy
        ├── Terms of Service
        └── About App

* = Bottom Navigation Items
```

---

## User Flows

### Flow 1: First-Time User Sign Up
```
Splash Screen
    ↓
Onboarding Carousel
    ↓ (Skip or complete 3 slides)
Login Screen
    ↓ (No account → Sign Up)
Registration Screen
    ↓ (Enter phone number)
OTP Verification
    ↓ (Enter OTP)
Complete Profile (Name, Photo)
    ↓
Dashboard (First-time tips)
    ↓
Add First Expense Prompt
```

### Flow 2: Quick Expense Entry (Voice)
```
Dashboard
    ↓ (Tap microphone icon)
Voice Input Screen
    ↓ (Speak: "50 dollars for coffee at Starbucks")
Voice Recognition Processing
    ↓
Parsed Data Preview
    - Amount: $50
    - Category: Food & Dining (auto-detected)
    - Merchant: Starbucks
    - Date: Today
    ↓ (User confirms or edits)
Save Expense
    ↓
Success Toast
    ↓
Return to Dashboard (updated totals)
```

### Flow 3: SMS Expense Parsing
```
Receive Bank SMS
    ↓
Share SMS to App
    OR
Open App → SMS Tab
    ↓
SMS Auto-detected / Paste SMS
    ↓
Parse SMS
    ↓
Show Parsed Result:
    - Amount: ₹43
    - Currency: AED (detected)
    - Merchant: Food Path Restaurant
    - Date: Today
    ↓ (Edit if needed)
Add This Expense
    ↓
Expense Added to List
    ↓
Dashboard Updated
```

### Flow 4: Budget Management
```
Dashboard
    ↓ (Tap Budget tab)
Budget Overview
    - See current spending vs budget
    - Category budgets
    ↓ (Tap "Set Budget" or edit existing)
Set Budget Screen
    ↓ (Select category)
Enter Amount & Alert Threshold
    ↓ (Set 80% alert)
Save Budget
    ↓
Budget Overview (updated)
    ↓ (When 80% spent)
Push Notification Alert
    ↓ (User taps notification)
Budget Alert Modal
    - Category: Food & Dining
    - 85% of ₹5,000 spent
    - Remaining: ₹750
    ↓ (View Expenses)
Filtered Expense List (Food category)
```

### Flow 5: Family Expense Sharing
```
Profile Tab
    ↓ (Tap Family)
Family Dashboard (Empty)
    ↓ (Create Family)
Enter Family Name
    ↓ (Invite Members)
Enter Phone Numbers
    ↓
Send Invitations
    ↓
Pending Status Shown
    ↓ (When member accepts)
Member Added to Family
    ↓
Add Expense (User 1)
    ↓
Expense Visible to All Family
    ↓
Push Notification to Family (User 2)
    "Dad added ₹500 for Groceries"
    ↓
View in Family Dashboard
```

### Flow 6: Monthly Report Export
```
Analytics Tab
    ↓
Reports Section
    ↓ (Tap "Monthly Report")
Select Month
    ↓
Report Preview Generated:
    - Summary stats
    - Category breakdown
    - Spending trends chart
    - Top expenses
    ↓ (Choose export format)
Select: PDF / Excel / CSV
    ↓
Generate File (Loading)
    ↓
Download Complete
    ↓ (Share options)
Share via Email/WhatsApp/Save
```

### Flow 7: Upgrade to Premium
```
Dashboard (Free User)
    ↓ (See "Upgrade" banner OR try premium feature)
Feature Locked Modal
    "Unlock AI Insights with Premium"
    ↓ (Tap "View Plans")
Subscription Screen
    - Free (Current)
    - Monthly ₹199
    - Yearly ₹1,999 (Save 17%)
    - Business ₹299
    ↓ (Select plan)
Payment Screen
    - Plan details
    - Amount
    - Payment methods
    ↓ (Complete payment)
Payment Processing
    ↓
Success! Premium Activated
    ↓
Dashboard (Premium badges shown)
    - No ads
    - AI insights card
    - Premium features unlocked
```

### Flow 8: Receipt Scanning
```
Add Expense
    ↓ (Tap "Scan Receipt")
Camera Opens
    ↓ (Take photo OR select from gallery)
Image Captured
    ↓
OCR Processing (Loading)
    ↓
Extracted Data:
    - Amount: ₹1,234.56
    - Merchant: ABC Store
    - Date: DD/MM/YYYY
    - Items: [List if available]
    ↓ (Edit if needed)
Confirm & Save
    ↓
Expense Added with Receipt Attached
    ↓
View in Expense Details (Receipt thumbnail)
```

### Flow 9: Setting Category Budget Alert
```
Budget Tab
    ↓
Select Category (e.g., Food & Dining)
    ↓
Edit Budget
    ↓
Set Alert at 80%
    ↓
Save
    ↓
[User spends throughout month]
    ↓
When 80% threshold reached:
Push Notification
    "⚠️ Alert: You've spent 80% of your Food budget"
    ↓ (Tap notification)
Budget Detail Screen
    - Current: ₹4,000 / ₹5,000
    - Remaining: ₹1,000
    - Days left in month: 10
    - Action buttons:
        * View Expenses
        * Adjust Budget
        * Ignore
```

### Flow 10: Dark Mode Toggle
```
Profile Tab
    ↓
Settings
    ↓
Dark Mode Toggle
    ↓ (Tap to enable)
Smooth Theme Transition Animation
    - Background fades from light to dark
    - Text colors invert
    - Charts update colors
    - Icons adapt
    ↓
App Now in Dark Mode
    (Preference saved automatically)
```

---

## Navigation Patterns

### Bottom Navigation (Primary - 5 tabs)
1. **Home** - Dashboard overview
2. **Analytics** - Charts & insights
3. **Budget** - Budget management
4. **Family** - Family sharing
5. **Profile** - Settings & account

### Top Navigation
- **Back Button** (left)
- **Screen Title** (center)
- **Action Icons** (right)
  - Search
  - Filter
  - Settings (context-specific)

### Floating Action Button (FAB)
- **Primary Action**: Add Expense
- **Position**: Bottom right
- **Behavior**: Hides on scroll down, shows on scroll up
- **States**: Normal, Pressed, Disabled

### Drawer/Sidebar (Optional for tablet/web)
- Profile summary
- Navigation menu
- Quick stats
- Settings

---

## Modal Types

### Full-Screen Modals
- Add/Edit Expense
- Category Management
- Reports
- Subscription Plans

### Bottom Sheets
- Quick filters
- Sort options
- Date picker
- Category picker

### Alert Dialogs
- Delete confirmation
- Budget alerts
- Error messages
- Success messages

### Overlay Modals
- Feature locked (upgrade prompt)
- SMS parsing result
- Ad display (interstitial)

---

## Gesture Controls

### Swipe Actions
- **Left on expense**: Edit
- **Right on expense**: Delete
- **Down on screen**: Refresh

### Pull Actions
- **Pull down**: Refresh data
- **Pull up**: Load more (infinite scroll)

### Tap Gestures
- **Single tap**: Select/Open
- **Double tap**: Quick action (e.g., mark as favorite)
- **Long press**: Context menu or bulk select mode

### Pinch & Zoom
- **Charts**: Zoom in/out on data
- **Receipt images**: Zoom to view details

---

## State Management

### Empty States
- **No Expenses**: 
  - Illustration
  - "No expenses yet"
  - "Add your first expense" button

- **No Budget Set**:
  - Illustration
  - "Set a budget to track spending"
  - "Set Budget" button

- **No Family Members**:
  - Illustration
  - "Share expenses with family"
  - "Invite Members" button

### Loading States
- **Skeleton Screens** for:
  - Expense list
  - Charts
  - Dashboard cards

- **Spinners** for:
  - Button actions
  - API calls
  - File uploads

### Error States
- **No Internet**:
  - Cloud with X icon
  - "No internet connection"
  - "Retry" button
  - "View cached data" option

- **API Error**:
  - Error icon
  - Error message
  - "Try Again" button
  - "Report Issue" link

### Success States
- **Expense Added**: Green checkmark toast
- **Budget Updated**: Success banner
- **Profile Saved**: Toast notification
- **Payment Success**: Full-screen success with confetti

---

## Notification Types

### Push Notifications
1. **Budget Alerts** (Critical)
   - "⚠️ You've exceeded your Food budget by 10%"

2. **Weekly Summary** (Informational)
   - "📊 You spent ₹5,432 this week, 12% less than last week"

3. **Family Activity** (Social)
   - "👨‍👩‍👧 Mom added ₹1,200 for Groceries"

4. **Tips & Insights** (Promotional)
   - "💡 Tip: You can save by cooking at home 3 more days"

5. **Subscription** (Transactional)
   - "💳 Your Premium subscription renews in 3 days"

### In-App Notifications
- Badge on Family tab (new activity)
- Dot indicator on Analytics (new insights)
- Banner at top (announcements)

---

## Accessibility Features

### Screen Reader Support
- All buttons labeled
- Images have alt text
- Form inputs have labels
- Navigation landmarks

### Keyboard Navigation
- Tab order logical
- Enter to submit
- Escape to close modals
- Arrow keys for lists

### Visual Accessibility
- High contrast mode
- Large text support (up to 200%)
- Color-blind friendly palette
- No color-only indicators

### Motor Accessibility
- Large touch targets (44×44px min)
- No time-based interactions
- Easy-to-reach primary actions
- Voice control support

---

## Security & Privacy

### Biometric Lock
- Face ID / Touch ID / Fingerprint
- Lock screen after X minutes inactivity
- Require unlock for:
  - App open
  - View expenses
  - Change settings

### Data Privacy
- No expense data in notifications preview
- Blur app content in app switcher
- Session timeout after 15 min
- Secure data transmission (HTTPS)

---

## Performance Targets

### Load Times
- **App Launch**: <2 seconds
- **Screen Transition**: <300ms
- **API Response**: <1 second
- **Image Load**: <500ms

### Offline Support
- View all synced expenses
- Add expenses offline (sync later)
- View cached analytics
- Show "Offline" indicator

### Data Usage
- Optimize images (WebP format)
- Lazy load lists
- Cache frequently used data
- Compress API responses

---

**End of Sitemap & User Flow Document**
