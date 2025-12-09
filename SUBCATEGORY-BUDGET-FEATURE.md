# Subcategory Budget Feature

## Overview
You can now create budgets at the subcategory level for more granular expense tracking!

## How to Use

### 1. Database Setup (IMPORTANT - Run This First!)
Before using subcategory budgets, you need to update your Supabase database:

1. Go to your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT
2. Click on "SQL Editor" in the left sidebar
3. Open the file: `database/budget-subcategory-update.sql`
4. Copy all the SQL and paste it into the SQL Editor
5. Click "Run" to execute the migration
6. This adds the `subcategory_id` column to your budgets table

### 2. Creating Budgets

#### Category-Level Budget (e.g., All Groceries)
1. Open the Budgets modal (click "Budgets" button)
2. Select a category (e.g., "🛒 Groceries")
3. The subcategory dropdown will show "All Subcategories" (default)
4. Enter your budget amount
5. Select period (Monthly/Weekly/Yearly)
6. Set alert threshold (e.g., 80%)
7. Click "Set Budget"

#### Subcategory-Level Budget (e.g., Mutton only)
1. Open the Budgets modal
2. Select a category (e.g., "🛒 Groceries")
3. A subcategory dropdown will appear
4. Select a specific subcategory (e.g., "🥩 Mutton")
5. Enter your budget amount (e.g., ₹5000 for mutton)
6. Select period
7. Set alert threshold
8. Click "Set Budget"

### 3. Examples

**Example 1: Overall Grocery Budget**
- Category: Groceries
- Subcategory: All Subcategories
- Amount: ₹20,000
- Period: Monthly
- This tracks ALL grocery expenses

**Example 2: Mutton Budget**
- Category: Groceries  
- Subcategory: Mutton
- Amount: ₹5,000
- Period: Monthly
- This tracks ONLY mutton expenses

**Example 3: School Fees Budget**
- Category: Education
- Subcategory: School Fees
- Amount: ₹15,000
- Period: Monthly
- This tracks only school fees

### 4. Budget Display

Budgets are displayed with their category and subcategory:
- "🛒 Groceries" (all groceries)
- "🛒 Groceries > 🥩 Mutton" (only mutton)
- "📚 Education > 🏫 School Fees" (only school fees)

### 5. Progress Tracking

The app calculates spending separately for each budget:
- If you set a budget for "Groceries", it tracks all grocery expenses
- If you set a budget for "Groceries > Mutton", it tracks only mutton expenses
- You can have both budgets active at the same time!

### 6. Alerts

When spending reaches your alert threshold (default 80%), you'll see warnings:
- Yellow warning: Approaching budget limit
- Red alert: Budget exceeded

## Benefits

✅ **Granular Control**: Set specific budgets for frequently overspent items
✅ **Better Tracking**: Monitor specific expense types (like mutton, chicken, etc.)
✅ **Flexible**: Mix category-level and subcategory-level budgets
✅ **Clear Display**: See exactly which budget applies to each expense
✅ **Real-time Alerts**: Get notified when approaching limits

## Notes

- Subcategory budgets are optional - you can still use category-level budgets only
- The subcategory dropdown only appears when you select a category (not "Overall Budget")
- If a category has no subcategories, the dropdown won't appear
- You can have multiple budgets: overall, category-level, and subcategory-level

## Files Updated
- `index.html` - Added subcategory dropdown
- `budget-manager.js` - Full subcategory budget support
- `database/budget-subcategory-update.sql` - Database migration
