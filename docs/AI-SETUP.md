# AI Features Setup Guide

## Step 1: Update Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `sbhlptxnxlpxwaikfpqk`
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the contents of `schema-ai.sql`
5. Click **Run** to execute

This will create the new tables for AI features:
- `budgets` - Budget tracking per category
- `recurring_expenses` - Auto-detected recurring bills
- `insights` - AI-generated insights
- `predictions` - Spending predictions
- `expense_patterns` - Learning data for auto-categorization
- `notifications` - Smart alerts

## Step 2: Deploy

The AI features are automatically integrated. Just deploy:
```powershell
.\deploy.ps1
```

## Features Included

✅ **Smart Insights** - Automatic pattern detection
✅ **Spending Predictions** - ML-based forecasting
✅ **Budget Management** - Set and track budgets
✅ **Anomaly Detection** - Unusual spending alerts
✅ **Recurring Detection** - Auto-find subscriptions
✅ **Auto-Categorization** - Learn from your patterns
✅ **Natural Language Queries** - Ask questions
✅ **Receipt OCR** - Coming in next update
✅ **Advanced Analytics** - Trends and comparisons

## Next Steps

After running the schema, the app will automatically:
- Analyze your spending patterns
- Detect recurring expenses
- Show smart insights
- Predict future spending
- Learn your categorization habits
