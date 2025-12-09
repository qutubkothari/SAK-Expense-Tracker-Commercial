# Family Expense Tracker - Design Brief & Feature Catalogue

## Project Overview
**App Name:** Family Expense Tracker  
**Target Platforms:** iOS, Android, Web (PWA)  
**App ID:** com.saksolution.expensetracker  
**Primary Users:** Families, individuals, small business owners  
**Design Style:** Modern, clean, professional with gradient accents  

---

## Brand Identity

### Color Palette
- **Primary**: `#667eea` (Purple-blue gradient start)
- **Secondary**: `#764ba2` (Purple gradient end)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Background**: `#f9fafb` (Light gray)
- **Dark Mode**: `#1f2937` (Dark gray)

### Typography
- **Primary Font**: System default (SF Pro for iOS, Roboto for Android)
- **Headers**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Small Text**: 12px

### Logo Requirements
- **App Icon**: 1024×1024px (rounded corners for iOS)
- **Splash Screen**: 2732×2732px with logo centered
- **Variations**: Light & Dark mode versions
- **Export Formats**: PNG, SVG, PDF

---

## Screen Designs Required (33 Screens)

### 1. Authentication & Onboarding (5 screens)

#### 1.1 Splash Screen
- Logo centered
- App name below logo
- Gradient background (#667eea to #764ba2)
- Loading indicator

#### 1.2 Login Screen
- Logo at top
- Phone number input with country code selector
- "Get OTP" button
- "Don't have an account? Sign up" link
- Social login options (Google, Apple)

#### 1.3 OTP Verification Screen
- 6-digit OTP input boxes
- Resend OTP timer (60 seconds)
- "Verify" button
- Back button

#### 1.4 Registration Screen
- Profile photo upload (circular)
- Full name input
- Email input (optional)
- "Create Account" button
- Terms & Privacy links

#### 1.5 Onboarding Carousel (3 slides)
**Slide 1:** "Track Every Expense"
- Illustration: Phone with expense list
- Text: "Easily add and categorize your daily expenses"

**Slide 2:** "AI-Powered Insights"
- Illustration: AI analyzing data
- Text: "Get smart spending insights and predictions"

**Slide 3:** "Family Sharing"
- Illustration: Family members connected
- Text: "Share expenses with family members"
- "Get Started" button

---

### 2. Dashboard/Home (3 screens)

#### 2.1 Main Dashboard
**Top Section:**
- Welcome message: "Hi, [Name]! 👋"
- Current month spending card
  - Total spent: ₹XX,XXX
  - vs last month: +/-XX%
  - Progress bar
  - Budget remaining

**Quick Actions Row:**
- Add Expense button (large, primary)
- Voice Input button
- Scan Receipt button
- Parse SMS button

**Recent Expenses List:**
- Last 5 expenses with:
  - Category icon (colored)
  - Merchant name
  - Amount with currency
  - Date/time
  - Swipe actions (edit, delete)

**Bottom Section:**
- Category breakdown (pie chart preview)
- "View All" link

**Navigation Bar:**
- Home (active)
- Analytics
- Budget
- Family
- Profile

#### 2.2 Dashboard (Premium User)
- Same as above but:
- No ads
- Premium badge in header
- Additional AI insights card
- "Unlock Premium Features" removed

#### 2.3 Dashboard (Dark Mode)
- Same layout
- Dark theme colors
- High contrast icons

---

### 3. Add Expense (4 screens)

#### 3.1 Add Expense Form
**Input Fields:**
- Amount (large, prominent with currency selector)
- Category dropdown (with icons)
- Subcategory dropdown (conditional)
- Description/Note
- Date picker (default: today)
- Location (optional, with GPS icon)
- Expense Type toggle: Personal / Business
- Attach photo button

**Buttons:**
- Save (primary)
- Cancel (secondary)

#### 3.2 Quick Add (Voice)
- Large microphone icon (animated when listening)
- "Listening..." status
- Voice waveform animation
- Parsed text shown below
- Confirm/Edit options

#### 3.3 Receipt Scanner
- Camera viewfinder
- Capture button
- Flash toggle
- Gallery icon
- Scanned text preview
- Edit extracted data

#### 3.4 SMS Parser
**Tabs:**
- Manual Entry
- Share SMS
- Auto-Capture Settings

**Manual Entry:**
- SMS text input area
- Parse button
- Parsed result card:
  - Amount
  - Currency
  - Merchant
  - Date
  - "Add This Expense" button

**Share SMS Instructions:**
- How to share SMS from messages app
- Test Share API button
- List of supported banks

---

### 4. Expense List & Details (3 screens)

#### 4.1 All Expenses View
**Header:**
- Month/Year selector
- Search icon
- Filter icon (category, date range, amount)
- Sort options (date, amount, category)

**List:**
- Grouped by date
- Each expense shows:
  - Category icon (left)
  - Merchant name
  - Description (gray, small)
  - Amount (right, colored)
  - Currency indicator
  - Business/Personal tag

**Floating Action Button:**
- Add expense (+ icon)

#### 4.2 Expense Detail Screen
**Full Details:**
- Large amount at top
- Category with icon
- Merchant name
- Full description
- Date & time
- Location (map if available)
- Currency
- Expense type badge
- Receipt image (if attached)
- Added by: User name (for family)

**Action Buttons:**
- Edit
- Delete
- Share
- Duplicate

#### 4.3 Edit Expense
- Same as Add Expense form
- Pre-filled with existing data
- "Update" button instead of "Save"

---

### 5. Categories & Subcategories (3 screens)

#### 5.1 Categories List
- Grid or list view toggle
- Each category card:
  - Icon (colored)
  - Name
  - Total spent this month
  - Number of transactions
  - Progress bar (if budget set)

**Admin Controls:**
- Add category button
- Edit/Delete options

#### 5.2 Add/Edit Category
- Category name input
- Icon picker (grid of icons)
- Color picker
- Budget amount (optional)
- Subcategories list
- Add subcategory button
- Save button

#### 5.3 Subcategories
- List under parent category
- Each shows:
  - Name
  - Amount spent
  - Transaction count
- Add/Edit/Delete options

---

### 6. Analytics & Insights (4 screens)

#### 6.1 Analytics Dashboard
**Time Period Selector:**
- This Week / This Month / This Year / Custom

**Charts:**
1. **Spending Trend** (Line chart)
   - Last 7/30 days
   - Amount on Y-axis
   - Date on X-axis

2. **Category Breakdown** (Pie chart)
   - Top 5 categories
   - Percentage labels
   - Color-coded

3. **Income vs Expenses** (Bar chart)
   - Monthly comparison
   - Green (income) vs Red (expenses)

**Stats Cards:**
- Total spent
- Average daily spending
- Most expensive category
- Number of transactions

#### 6.2 AI Insights (Premium)
**Insight Cards:**
- Each card has:
  - Icon (💡 for tips, ⚠️ for warnings, 📊 for trends)
  - Title
  - Description
  - Actionable suggestion
  - "Learn More" link

**Examples:**
- "You're spending 30% more on dining out this month"
- "Predicted monthly expense: ₹XX,XXX"
- "You can save ₹X,XXX by reducing coffee purchases"

#### 6.3 Reports
**Report Types:**
- Monthly Summary
- Category Report
- Tax Report (for business expenses)
- Custom Date Range

**Export Options:**
- PDF
- Excel
- CSV

**Report Preview:**
- Header with logo & dates
- Summary section
- Detailed breakdown
- Charts included
- Download/Share buttons

#### 6.4 Currency Comparison
- Multi-currency expense list
- Conversion rates display
- Total in base currency
- Currency-wise breakdown pie chart
- Exchange rate trends

---

### 7. Budget Management (3 screens)

#### 7.1 Budget Overview
**Monthly Budget Card:**
- Total budget: ₹XX,XXX
- Spent: ₹XX,XXX
- Remaining: ₹XX,XXX
- Progress bar (green → yellow → red)

**Category Budgets:**
- List of categories with budgets
- Each shows:
  - Category name & icon
  - Budget amount
  - Spent amount
  - Progress bar
  - Warning if over budget

**Add Budget Button:**
- Floating action button

#### 7.2 Set Budget
- Category selector
- Amount input
- Time period (Monthly / Yearly)
- Alert threshold (% slider)
- Rollover unused budget toggle
- Save button

#### 7.3 Budget Alerts
- List of budget warnings
- Each alert shows:
  - Category
  - Amount over/approaching limit
  - Percentage
  - Actions: View expenses, Adjust budget

---

### 8. Family Sharing (4 screens)

#### 8.1 Family Dashboard
**Family Card:**
- Family name
- Total members
- Total family spending this month
- Your contribution percentage

**Members List:**
- Each member shows:
  - Profile photo
  - Name
  - Role (Admin/Member)
  - Their spending this month
  - Tap to view details

**Actions:**
- Invite member button
- Family settings

#### 8.2 Invite Family Member
- Phone number input
- Send invitation button
- Pending invitations list
- Cancel invitation option

#### 8.3 Member Details
- Profile photo & name
- Total expenses
- Category breakdown (pie chart)
- Recent expenses list
- Filter: Show my expenses / Show family

#### 8.4 Family Settings (Admin only)
- Family name edit
- Remove members
- Transfer admin role
- Leave family
- Delete family

---

### 9. Profile & Settings (6 screens)

#### 9.1 Profile Screen
**User Info Section:**
- Profile photo (editable)
- Name
- Email
- Phone number
- Subscription tier badge

**Account Section:**
- My Subscription
- Currency Preferences
- Default Category
- Language

**App Settings:**
- Notifications
- Dark Mode toggle
- Auto-sync toggle
- Biometric lock toggle

**Other:**
- Help & Support
- Privacy Policy
- Terms of Service
- About App
- Logout

#### 9.2 Edit Profile
- Change profile photo
- Edit name
- Edit email
- Save button

#### 9.3 Currency Preferences
- Base currency selector
- Favorite currencies (multi-select)
- Auto-convert toggle
- Update exchange rates button
- Last updated timestamp

#### 9.4 Notification Settings
**Toggle Options:**
- Push notifications master switch
- Expense added
- Budget alerts
- Weekly summary
- Monthly report
- Family member activities
- Tips & suggestions

#### 9.5 Subscription/Paywall
**Free Tier Card:**
- Current plan
- Features included:
  - Basic expense tracking ✓
  - Limited categories ✓
  - Family sharing (2 members) ✓
  - Ads shown ✗

**Premium Plans:**

**Monthly: ₹199/month**
- All free features
- No ads
- Unlimited categories
- Unlimited family members
- AI insights
- Advanced analytics
- Export to Excel/PDF
- Priority support
- "Subscribe" button

**Yearly: ₹1,999/year** (Save 17%)
- Same as monthly
- "Best Value" badge
- "Subscribe" button

**Business: ₹299/month**
- All premium features
- Multiple businesses tracking
- Tax reports
- Expense approval workflow
- Invoice generation
- "Subscribe" button

**Comparison Table:**
- Feature comparison grid
- Checkmarks for included features

#### 9.6 Help & Support
- FAQ sections (expandable)
- Search bar
- Contact support button
- Video tutorials
- User guide link

---

### 10. Subscription Features (3 screens)

#### 10.1 Recurring Expenses
- List of detected recurring expenses
- Each shows:
  - Merchant
  - Amount
  - Frequency (Weekly/Monthly/Yearly)
  - Next expected date
  - Category
- Mark as subscription toggle
- Add manual subscription button

#### 10.2 Business Expense Tracking
**Business Selector:**
- Dropdown to switch between businesses
- Add new business button

**Business Dashboard:**
- Similar to personal dashboard
- Business-specific categories
- Tax-deductible toggle visible
- Client/Project tags

#### 10.3 CSV/Excel Import
- Upload file button
- Drag & drop area
- File format guide
- Column mapping interface
- Preview imported data
- Import button

---

### 11. Modals & Dialogs (6 screens)

#### 11.1 Feature Locked Modal
- Premium feature icon
- Feature name
- "Upgrade to unlock" message
- List of premium benefits
- "View Plans" button
- "Maybe Later" link

#### 11.2 Delete Confirmation
- Warning icon
- "Delete Expense?"
- "This action cannot be undone"
- Delete button (red)
- Cancel button

#### 11.3 Budget Alert Modal
- Alert icon (⚠️)
- Category name
- "You've exceeded your budget by XX%"
- Amount over budget
- View expenses button
- Adjust budget button

#### 11.4 Success Toast
- Checkmark icon
- Success message
- Auto-dismiss after 3 seconds
- Variations:
  - Expense added
  - Budget updated
  - Profile saved
  - etc.

#### 11.5 SMS Parsing Result
- Transaction detected checkmark
- Amount with currency
- Merchant name
- Date
- Edit fields
- "Add This Expense" button
- "Discard" button

#### 11.6 Ad Display (Free Users)
**Banner Ad:**
- 320×50px at bottom
- Close button
- "Upgrade to remove ads" text

**Interstitial Ad:**
- Full screen overlay
- Close button (enabled after 5 seconds)
- "Go Premium" button below ad

---

## Component Library

### Buttons

#### Primary Button
- Background: Gradient (#667eea to #764ba2)
- Text: White, bold
- Border radius: 8px
- Padding: 12px 24px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- States: Normal, Hover, Pressed, Disabled

#### Secondary Button
- Background: Transparent
- Border: 2px solid #667eea
- Text: #667eea, bold
- Border radius: 8px
- Padding: 12px 24px
- States: Normal, Hover, Pressed, Disabled

#### Icon Button
- Circular or square
- Size: 40×40px
- Icon centered
- Background: Light gray or transparent
- States: Normal, Hover, Pressed

### Input Fields

#### Text Input
- Border: 1px solid #e5e7eb
- Border radius: 8px
- Padding: 12px 16px
- Font size: 16px
- States: Default, Focus (blue border), Error (red border), Disabled

#### Dropdown/Select
- Same as text input
- Down arrow icon on right
- Dropdown list with search (if >10 items)

#### Date Picker
- Calendar icon on right
- Opens date picker modal
- Selected date highlighted

### Cards

#### Standard Card
- Background: White
- Border radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.05)
- Padding: 16px
- Hover: Slight shadow increase

#### Stat Card
- Same as standard card
- Large number at top (24-32px)
- Label below (14px, gray)
- Optional icon in corner

### Lists

#### Expense List Item
- Height: 72px
- Left: Category icon (40×40px)
- Center: Merchant name (16px), Description (14px, gray)
- Right: Amount (16px, bold), Currency (12px, gray)
- Divider between items
- Swipe actions: Edit (blue), Delete (red)

#### Category List Item
- Height: 80px
- Icon on left (48×48px, colored background)
- Name and amount
- Progress bar below
- Chevron right

### Charts

#### Line Chart
- Gradient fill below line
- Dots at data points
- Tooltip on hover
- Grid lines (subtle)
- X-axis labels
- Y-axis with currency

#### Pie Chart
- Color-coded segments
- Percentage labels
- Legend below
- Center shows total

#### Bar Chart
- Rounded corners on bars
- Labels on top of bars
- Grid lines
- Color: Green (positive), Red (negative)

---

## Icons Required (50+ icons)

### Categories (20 icons)
- 🍔 Food & Dining
- 🛒 Groceries
- 🏠 Housing/Rent
- 💡 Utilities
- 🚗 Transportation
- ⛽ Fuel
- 🏥 Healthcare
- 💊 Medicine
- 🎓 Education
- 👕 Shopping
- 🎬 Entertainment
- ✈️ Travel
- 💼 Business
- 🎁 Gifts
- 💰 Savings/Investment
- 📱 Subscriptions
- 🏋️ Fitness
- ✂️ Personal Care
- 🐾 Pets
- 🔧 Maintenance

### Actions (15 icons)
- ➕ Add
- ✏️ Edit
- 🗑️ Delete
- 📤 Share
- 💾 Save
- 🔄 Sync
- 🎤 Voice
- 📷 Camera
- 📊 Analytics
- 📅 Calendar
- 🔍 Search
- 🔔 Notifications
- ⚙️ Settings
- 👥 Family
- 👤 Profile

### Navigation (5 icons)
- 🏠 Home
- 📈 Analytics
- 💵 Budget
- 👨‍👩‍👧 Family
- 👤 Profile

### Other (10 icons)
- 💎 Premium/Crown
- ⭐ Featured
- ⚠️ Warning
- ✅ Success
- ❌ Error
- 💡 Insight/Tip
- 🔒 Lock
- 🌙 Dark mode
- ☀️ Light mode
- 📍 Location

---

## Animations & Interactions

### Micro-interactions
1. **Button Press**
   - Scale down to 0.95 on press
   - Bounce back on release

2. **Card Tap**
   - Subtle scale (1.0 to 0.98)
   - Background color shift

3. **List Item Swipe**
   - Reveal actions on swipe left/right
   - Spring animation on release

4. **Success Actions**
   - Checkmark animation (draw circle, draw check)
   - Confetti for major actions (upgrade, goal reached)

5. **Loading States**
   - Skeleton screens for data loading
   - Shimmer effect on placeholders
   - Spinner for quick actions

### Screen Transitions
1. **Page Navigation**
   - Slide from right (forward)
   - Slide from left (back)
   - Duration: 300ms
   - Easing: ease-out

2. **Modal Appearance**
   - Fade in background overlay
   - Scale up modal (0.9 to 1.0)
   - Duration: 250ms

3. **Bottom Sheet**
   - Slide up from bottom
   - Drag to dismiss
   - Snap points at 50%, 100%

### Chart Animations
1. **Line Chart**
   - Draw line from left to right (1000ms)
   - Fade in fill gradient

2. **Pie Chart**
   - Rotate segments into position (800ms)
   - Stagger animation (100ms delay between segments)

3. **Bar Chart**
   - Grow bars from bottom to full height (600ms)
   - Stagger animation

---

## Responsive Design

### Mobile Portrait (Primary)
- Screen width: 375-428px
- Single column layout
- Bottom navigation bar
- Floating action buttons

### Mobile Landscape
- Two-column layout where appropriate
- Side navigation (collapsed)
- Charts expand horizontally

### Tablet (iPad)
- Screen width: 768-1024px
- Two-column master-detail layout
- Side navigation always visible
- Larger cards and charts

### Web/Desktop
- Screen width: 1280px+
- Three-column layout
- Sidebar navigation
- Dashboard widgets
- Hover states prominent

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Minimum contrast ratio: 4.5:1 for text
- Touch targets: Minimum 44×44px
- Screen reader support
- Keyboard navigation
- Focus indicators
- Alt text for all images
- Error messages clear and helpful

### Additional Features
- Dark mode support
- Font size scaling (up to 200%)
- Reduced motion option
- Voice control support
- Color-blind friendly palette

---

## Export Deliverables

### For Development Team
1. **Figma/Sketch Files**
   - All screens organized by section
   - Component library
   - Reusable symbols/components
   - Style guide

2. **Design Specs**
   - Spacing measurements
   - Font sizes and weights
   - Color hex codes
   - Border radius values
   - Shadow specifications

3. **Assets Export**
   - Icons: SVG + PNG (@1x, @2x, @3x)
   - Images: WebP + PNG
   - App icons: All sizes for iOS/Android
   - Splash screens: All resolutions

4. **Prototype**
   - Interactive Figma prototype
   - User flow demonstrations
   - Animation previews

### For App Stores
1. **App Icons**
   - iOS: 1024×1024px (all required sizes)
   - Android: 512×512px (all densities)

2. **Screenshots** (5 per platform)
   - iPhone 6.7": 1290×2796px
   - iPhone 5.5": 1242×2208px
   - iPad Pro 12.9": 2048×2732px
   - Android Phone: 1080×1920px
   - Android Tablet: 1200×1920px

3. **Feature Graphic** (Android)
   - 1024×500px
   - Showcasing key features

4. **Promo Videos** (Optional)
   - 15-30 seconds
   - Demonstrate key features
   - 1080p resolution

---

## Design Principles

1. **Simplicity First**
   - Minimal clutter
   - Clear hierarchy
   - One primary action per screen

2. **Consistency**
   - Same patterns across screens
   - Familiar interactions
   - Predictable navigation

3. **Feedback**
   - Immediate response to actions
   - Loading states
   - Success/error messages

4. **Efficiency**
   - Quick expense entry
   - Smart defaults
   - Minimize taps

5. **Delight**
   - Smooth animations
   - Celebratory moments
   - Personalization

---

## Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Research & Discovery | 1 week | Competitor analysis, User personas |
| Wireframes | 1 week | Low-fidelity wireframes (all screens) |
| Visual Design | 2 weeks | High-fidelity designs (all screens) |
| Component Library | 1 week | Reusable components, Style guide |
| Prototyping | 1 week | Interactive prototype |
| Revisions | 1 week | Incorporate feedback |
| Asset Export | 2 days | All assets for development |

**Total: 6-7 weeks**

---

## Budget Estimate

| Item | Description | Quantity | Rate | Total |
|------|-------------|----------|------|-------|
| Wireframes | Low-fidelity screens | 33 screens | - | $990 |
| Visual Design | High-fidelity designs | 33 screens | - | $2,640 |
| Component Library | Reusable components | 1 set | - | $500 |
| Icons & Illustrations | Custom icons | 50+ icons | - | $400 |
| Prototyping | Interactive flows | 1 prototype | - | $400 |
| App Store Assets | Screenshots, icons | 2 platforms | - | $300 |
| Revisions | Design iterations | 2 rounds | - | $600 |

**Total: $5,830**

*(Rates vary by designer experience and location)*

---

## Questions for Designer

1. Do you need design system/style guide?
2. Will you provide motion design/animations?
3. Can you create marketing materials (banners, social media)?
4. Do you offer developer handoff support?
5. What's your typical turnaround time?
6. How many revision rounds are included?
7. Do you have experience with fintech apps?
8. Can you provide interactive prototypes?

---

## Contact & Next Steps

**Project Manager:** [Your Name]  
**Email:** [Your Email]  
**Timeline:** Start ASAP  
**Budget:** Flexible based on portfolio  

**To Apply:**
- Share portfolio (fintech/finance apps preferred)
- Estimated timeline
- Your rate/pricing
- Any questions about the project

---

**End of Design Brief**
