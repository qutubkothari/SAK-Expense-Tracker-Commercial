# Visual Design Reference Sheet

## 🎨 Color Palette

### Primary Colors
```
Purple Blue (Primary)    #667eea  RGB(102, 126, 234)
Purple (Secondary)       #764ba2  RGB(118, 75, 162)
```

### Semantic Colors
```
Success Green           #10b981  RGB(16, 185, 129)
Warning Amber          #f59e0b  RGB(245, 158, 11)
Error Red              #ef4444  RGB(239, 68, 68)
Info Blue              #3b82f6  RGB(59, 130, 246)
```

### Neutral Colors (Light Mode)
```
Background             #f9fafb  RGB(249, 250, 251)
Surface                #ffffff  RGB(255, 255, 255)
Border                 #e5e7eb  RGB(229, 231, 235)
Text Primary           #111827  RGB(17, 24, 39)
Text Secondary         #6b7280  RGB(107, 114, 128)
Text Disabled          #9ca3af  RGB(156, 163, 175)
```

### Neutral Colors (Dark Mode)
```
Background             #111827  RGB(17, 24, 39)
Surface                #1f2937  RGB(31, 41, 55)
Border                 #374151  RGB(55, 65, 81)
Text Primary           #f9fafb  RGB(249, 250, 251)
Text Secondary         #9ca3af  RGB(156, 163, 175)
Text Disabled          #6b7280  RGB(107, 114, 128)
```

### Category Colors (20 colors)
```
Food & Dining          #ef4444  (Red)
Groceries              #f97316  (Orange)
Housing                #8b5cf6  (Purple)
Utilities              #eab308  (Yellow)
Transportation         #06b6d4  (Cyan)
Fuel                   #f59e0b  (Amber)
Healthcare             #ec4899  (Pink)
Medicine               #db2777  (Deep Pink)
Education              #3b82f6  (Blue)
Shopping               #6366f1  (Indigo)
Entertainment          #14b8a6  (Teal)
Travel                 #0ea5e9  (Sky Blue)
Business               #6b7280  (Gray)
Gifts                  #f43f5e  (Rose)
Savings                #10b981  (Green)
Subscriptions          #8b5cf6  (Violet)
Fitness                #84cc16  (Lime)
Personal Care          #a855f7  (Purple)
Pets                   #fb923c  (Orange)
Maintenance            #94a3b8  (Slate)
```

---

## 📐 Layout Grid

### Mobile (375px - 428px)
```
Columns: 4
Gutter: 16px
Margin: 16px
Max Width: 428px
```

### Tablet (768px - 1024px)
```
Columns: 8
Gutter: 24px
Margin: 32px
Max Width: 1024px
```

### Desktop (1280px+)
```
Columns: 12
Gutter: 24px
Margin: 64px
Max Width: 1440px
```

---

## 🔤 Typography Scale

### Headings
```
H1: 32px / 40px line-height / Bold
H2: 24px / 32px line-height / Bold
H3: 20px / 28px line-height / Semibold
H4: 18px / 24px line-height / Semibold
H5: 16px / 24px line-height / Semibold
H6: 14px / 20px line-height / Semibold
```

### Body Text
```
Large:   16px / 24px line-height / Regular
Base:    14px / 20px line-height / Regular
Small:   12px / 16px line-height / Regular
Tiny:    10px / 14px line-height / Regular
```

### Special
```
Button:  16px / 24px line-height / Semibold
Link:    14px / 20px line-height / Medium (underline)
Caption: 12px / 16px line-height / Regular (gray)
Label:   12px / 16px line-height / Medium (uppercase)
```

### Font Weights
```
Regular:  400
Medium:   500
Semibold: 600
Bold:     700
```

---

## 📏 Spacing System

### Base Unit: 4px

```
0:   0px
1:   4px    (tight spacing)
2:   8px    (small spacing)
3:   12px   (default spacing)
4:   16px   (comfortable spacing)
5:   20px
6:   24px   (section spacing)
8:   32px   (large spacing)
10:  40px
12:  48px   (major section)
16:  64px
20:  80px
24:  96px
```

### Common Uses
```
Card padding:           16px
Button padding:         12px 24px
Input padding:          12px 16px
List item padding:      16px
Section spacing:        24px - 32px
Screen margin:          16px (mobile), 32px (tablet), 64px (desktop)
```

---

## 🔲 Border Radius

```
None:    0px
Small:   4px    (tags, badges)
Medium:  8px    (buttons, inputs, cards)
Large:   12px   (containers, modals)
XL:      16px   (large cards)
2XL:     24px   (featured sections)
Full:    9999px (pills, circular buttons)
Circle:  50%    (avatars, icon buttons)
```

### Component Examples
```
Button:           8px
Input Field:      8px
Card:             12px
Modal:            12px
Chip/Tag:         4px or 9999px (pill)
Avatar:           50%
Bottom Sheet:     16px (top corners only)
```

---

## 🌑 Shadows

### Light Mode
```
XS:  0 1px 2px rgba(0, 0, 0, 0.05)
SM:  0 1px 3px rgba(0, 0, 0, 0.1)
MD:  0 2px 8px rgba(0, 0, 0, 0.05)
LG:  0 4px 12px rgba(0, 0, 0, 0.1)
XL:  0 8px 24px rgba(0, 0, 0, 0.15)
2XL: 0 16px 48px rgba(0, 0, 0, 0.2)
```

### Dark Mode
```
XS:  0 1px 2px rgba(0, 0, 0, 0.3)
SM:  0 1px 3px rgba(0, 0, 0, 0.4)
MD:  0 2px 8px rgba(0, 0, 0, 0.3)
LG:  0 4px 12px rgba(0, 0, 0, 0.4)
XL:  0 8px 24px rgba(0, 0, 0, 0.5)
2XL: 0 16px 48px rgba(0, 0, 0, 0.6)
```

### Component Usage
```
Button:           SM shadow
Card (resting):   MD shadow
Card (hover):     LG shadow
Modal:            XL shadow
Dropdown:         LG shadow
FAB:              LG shadow
Bottom Nav:       MD shadow (top only)
```

---

## 📐 Component Sizes

### Buttons
```
Small:  height 32px, padding 8px 16px,  font 14px
Medium: height 40px, padding 12px 24px, font 16px
Large:  height 48px, padding 16px 32px, font 18px
```

### Icon Buttons
```
Small:  32×32px, icon 16px
Medium: 40×40px, icon 20px
Large:  48×48px, icon 24px
XL:     56×56px, icon 28px
```

### Input Fields
```
Small:  height 32px, padding 8px 12px,  font 14px
Medium: height 40px, padding 12px 16px, font 16px
Large:  height 48px, padding 16px 20px, font 18px
```

### Avatars
```
XS:  24×24px
SM:  32×32px
MD:  40×40px
LG:  48×48px
XL:  64×64px
2XL: 96×96px
```

### Icons
```
XS:  12×12px (inline with text)
SM:  16×16px (buttons, list items)
MD:  20×20px (nav bar)
LG:  24×24px (main actions)
XL:  32×32px (category icons)
2XL: 48×48px (feature illustrations)
```

---

## 🎯 Touch Targets

### Minimum Sizes (WCAG AAA)
```
Touch Target:      44×44px minimum
Comfortable:       48×48px recommended
Icon Button:       40×40px minimum
Text Link:         44px height minimum
```

### Spacing Between Targets
```
Minimum:   8px
Comfortable: 16px
```

---

## 🎨 Gradient Styles

### Primary Gradient
```
Linear Gradient: 135deg
From: #667eea (top-left)
To:   #764ba2 (bottom-right)

CSS: background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Success Gradient
```
From: #10b981
To:   #059669
```

### Warning Gradient
```
From: #f59e0b
To:   #d97706
```

### Error Gradient
```
From: #ef4444
To:   #dc2626
```

### Usage
```
Primary Button Background
Card Headers (optional)
Charts (subtle gradients)
Splash Screen
Premium Badges
```

---

## 📊 Chart Styles

### Line Chart
```
Line Width:       2px
Point Radius:     4px
Grid Lines:       #e5e7eb (light) / #374151 (dark)
Grid Line Width:  1px
Gradient Fill:    Primary color, 20% opacity
```

### Pie/Donut Chart
```
Segment Spacing:  2px
Border Radius:    4px (outer corners)
Center Hole:      60% (donut)
Labels:           Outside, with lines
```

### Bar Chart
```
Bar Width:        80% of space
Bar Radius:       4px (top corners)
Grid Lines:       Horizontal only
Bar Spacing:      8px
```

### Colors for Charts
```
Use category colors for variety
Ensure sufficient contrast
Maximum 8 colors in one chart
Use gradients for depth
```

---

## 🎭 States & Variants

### Button States
```
Default:  100% opacity, gradient background
Hover:    105% scale, brighter gradient
Active:   95% scale, pressed appearance
Disabled: 40% opacity, no gradient
Loading:  Spinner inside, disabled state
```

### Input States
```
Default:  Border #e5e7eb
Focus:    Border #667eea (2px), glow shadow
Error:    Border #ef4444 (2px), error message below
Disabled: Background #f3f4f6, text #9ca3af
Filled:   Background white, border visible
```

### Card States
```
Default:  MD shadow, white background
Hover:    LG shadow, subtle scale (1.02)
Active:   Pressed appearance, SM shadow
Selected: Border #667eea (2px)
```

### List Item States
```
Default:  Transparent background
Hover:    Background #f3f4f6 (light) / #374151 (dark)
Active:   Background #e5e7eb
Selected: Background #ede9fe, border left #667eea (4px)
```

---

## 🔔 Notification Styles

### Toast Notifications
```
Success: Green background, white text, checkmark icon
Error:   Red background, white text, X icon
Warning: Amber background, dark text, alert icon
Info:    Blue background, white text, info icon

Position: Top center or bottom
Duration: 3 seconds
Animation: Slide in from top/bottom, fade out
```

### Badge/Counter
```
Size:       16×16px minimum
Background: Red (#ef4444)
Text:       White, 10px bold
Position:   Top-right corner
Border:     2px white border
Max Value:  99+ (show "99+" if more)
```

---

## 📱 Screen Examples

### Dashboard Layout
```
┌──────────────────────────┐
│  👋 Hi, Name!            │ 16px padding
│                          │
│  ┌────────────────────┐  │ Monthly Spending Card
│  │ This Month         │  │ 12px radius
│  │ ₹ XX,XXX          │  │ MD shadow
│  │ [Progress Bar]     │  │
│  └────────────────────┘  │
│                          │
│  [+Add] [🎤] [📷] [📱]  │ Quick Actions (4 buttons)
│                          │
│  Recent Expenses         │
│  ┌────────────────────┐  │ List Item
│  │ 🍔 $20  McDonald's │  │ 72px height
│  ├────────────────────┤  │ 1px divider
│  │ 🛒 $45  Groceries  │  │
│  └────────────────────┘  │
│                          │
│  [Analytics] [View All]  │ Links
└──────────────────────────┘
│🏠│📊│💰│👨‍👩‍👧│👤│         Bottom Nav (56px)
```

### Add Expense Form
```
┌──────────────────────────┐
│  ← Add Expense        ✓  │ Nav bar (56px)
├──────────────────────────┤
│                          │
│  Amount                  │ Label (12px)
│  ┌────────────────────┐  │ Input (48px height)
│  │  ₹  1,234.56      ▼│  │ Large text
│  └────────────────────┘  │
│                          │ 24px spacing
│  Category                │
│  ┌────────────────────┐  │
│  │  🍔 Food & Dining ▼│  │ Dropdown
│  └────────────────────┘  │
│                          │
│  Subcategory             │
│  ┌────────────────────┐  │
│  │  Restaurant       ▼│  │
│  └────────────────────┘  │
│                          │
│  Description             │
│  ┌────────────────────┐  │
│  │  Lunch at Cafe     │  │ Text area
│  └────────────────────┘  │
│                          │
│  Date       📅           │ Date picker
│  └────────────────────┘  │
│                          │
│  [  Cancel  ] [ Save  ]  │ Action buttons
└──────────────────────────┘
```

### Analytics Screen
```
┌──────────────────────────┐
│  Analytics          🔍⚙  │ Nav bar
├──────────────────────────┤
│  [Week][Month][Year]     │ Tabs (40px)
│                          │
│  ┌────────────────────┐  │ Line Chart Card
│  │   Spending Trend   │  │ 200px height
│  │   [Line Chart]     │  │
│  └────────────────────┘  │
│                          │
│  ┌──────┐  ┌──────┐     │ Stat Cards Row
│  │ Total│  │  Avg │     │ 2 columns
│  │₹5,432│  │ ₹181 │     │ 80px height
│  └──────┘  └──────┘     │
│                          │
│  ┌────────────────────┐  │ Pie Chart Card
│  │ Category Breakdown │  │
│  │   [Pie Chart]      │  │ 220px height
│  │   [Legend]         │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## 🎨 Icon Design Guidelines

### Style
```
Line Icons: 2px stroke
Outline style (not filled)
24×24px artboard
20×20px icon size (2px padding)
Rounded corners: 2px line cap
Consistent stroke throughout
```

### Examples
```
Home:      Simple house outline
Analytics: Line graph with points
Budget:    Pie chart or coins
Family:    Group of people
Profile:   Single person silhouette
Add:       Plus sign in circle
Delete:    Trash can
Edit:      Pencil
Save:      Check mark
Cancel:    X mark
```

---

## ✅ Design Checklist

### Before Starting
- [ ] Read all documentation
- [ ] Understand user flows
- [ ] Research competitors
- [ ] Create mood board
- [ ] Get brand assets (if any)

### Wireframe Phase
- [ ] Layout hierarchy clear
- [ ] Navigation intuitive
- [ ] Content prioritized
- [ ] Edge cases considered
- [ ] Feedback received

### Visual Design Phase
- [ ] Style guide created
- [ ] Components designed
- [ ] All screens completed
- [ ] Dark mode designed
- [ ] Responsive layouts
- [ ] Empty states designed
- [ ] Error states designed
- [ ] Loading states designed

### Final Checks
- [ ] Consistency throughout
- [ ] Touch targets 44×44px min
- [ ] Text contrast 4.5:1 min
- [ ] All states designed
- [ ] Animations specified
- [ ] Assets exported
- [ ] Documentation complete

---

**This reference sheet should be your quick guide while designing!**
**Keep it handy for consistent design decisions.**
