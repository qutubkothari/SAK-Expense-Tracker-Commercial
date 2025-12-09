# Business Expense Tracking Guide

## Your 3 Businesses

The app now tracks expenses across your 3 businesses automatically:

### 1. **Ecommerce** (Amazon Business)
**Trigger Keywords:** 
- `ecommerce`
- `e-commerce`
- `amazon business`
- `amazon`

**Example Voice Inputs:**
- "200 rickshaw ecommerce" → Transportation with 🏢 Ecommerce tag
- "5000 amazon hosting" → Bills & Utilities > Subscriptions, 🏢 Ecommerce
- "1500 marketing ecommerce" → Category detected, 🏢 Ecommerce

---

### 2. **IT** (Software/Tech Business)
**Trigger Keywords:**
- `it`
- `software`
- `tech`
- `development`
- `coding`

**Example Voice Inputs:**
- "937 ChatGPT IT" → Bills & Utilities > Subscriptions, 🏢 IT
- "2000 server IT" → Bills & Utilities, 🏢 IT
- "500 domain software" → Bills & Utilities > Subscriptions, 🏢 IT

---

### 3. **Trading NFF** (Trading Business)
**Trigger Keywords:**
- `trading`
- `nff`
- `trading nff`
- `stock`
- `forex`

**Example Voice Inputs:**
- "15000 trading fees NFF" → Category detected, 🏢 Trading NFF
- "300 internet trading" → Bills & Utilities > Internet, 🏢 Trading NFF
- "1000 stock analysis" → Category detected, 🏢 Trading NFF

---

## How It Works

1. **Voice Input:** Say amount + description + business keyword
   - Example: "937 ChatGPT subscription IT"
   
2. **Detection:** System extracts:
   - Amount: 937
   - Category: Bills & Utilities (from "subscription", "ChatGPT")
   - Business: IT (from keyword "IT")
   - Type: Business (auto-marked as reimbursable)

3. **Display:** Expense shows with purple 🏢 badge showing business name

4. **Reports:** Filter expenses by business for separate P&L tracking

---

## Database Setup Required

**⚠️ IMPORTANT:** Run this SQL in Supabase to enable business tracking:

```sql
-- Add business_name column to expenses
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Create index for fast business filtering
CREATE INDEX IF NOT EXISTS idx_expenses_business ON expenses(business_name);
```

**Steps:**
1. Go to https://supabase.com/dashboard
2. Select project: `sbhlptxnxlpxwaikfpqk`
3. Click "SQL Editor"
4. Paste the SQL above
5. Click "Run"

---

## Visual Indicators

In the expense list, you'll see:
- **💼 Business** badge = Business expense (reimbursable)
- **🏢 Ecommerce** badge = Ecommerce business expense
- **🏢 IT** badge = IT business expense
- **🏢 Trading NFF** badge = Trading business expense

---

## Tips

1. **Combine with other features:**
   - "200 rickshaw ecommerce business" → Transportation, Business type, Ecommerce
   - "5000 Dubai hosting IT" → AED currency, IT business
   - "1500 chatgpt subscription IT 1st october" → Specific date, IT business

2. **Default behavior:**
   - If no business keyword detected → Shows no business badge
   - Business keyword is removed from note (cleaner display)
   - Business detected → Auto-marks as "business" expense type

3. **Future reports:**
   - Filter by business to see profit/loss per business
   - Compare expenses across all 3 businesses
   - Export business-specific reports for tax filing

---

## Next Steps

After running the SQL schema:
1. Test: "937 chatgpt IT" (should show Bills & Utilities with 🏢 IT badge)
2. Test: "200 rickshaw ecommerce" (should show Transportation with 🏢 Ecommerce badge)
3. Test: "1000 trading fees NFF" (should show with 🏢 Trading NFF badge)
