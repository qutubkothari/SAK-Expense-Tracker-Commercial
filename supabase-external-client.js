// Supabase Client Configuration - For External Projects
// Use this code to connect to your SAK Expense Tracker database from other projects

import { createClient } from '@supabase/supabase-js'

// Your Supabase Project Credentials
const SUPABASE_URL = 'https://vgyudxqsjsjlgqwtynch.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZneXVkeHFzanNqbGdxd3R5bmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0OTQyODksImV4cCI6MjA0NzA3MDI4OX0.qH8VGvhG1YHBVzKNqMGh9tYvKPL8V4aLGNpvNXJYqLU'

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionFromUrl: true
  }
})

export default supabase

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Query Expenses
async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error fetching expenses:', error)
    return null
  }
  
  return data
}

// Example 2: Query Categories (No Auth Required after running fix-rls-policy.sql)
async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error.message)
    console.error('Full error:', error)
    return null
  }
  
  console.log(`Found ${data.length} categories`)
  return data
}

// Example 2b: Query Categories for Specific User (Auth Required)
async function getCategoriesForUser(userId) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return null
  }
  
  return data
}

// Example 3: Insert New Expense
async function addExpense(expenseData) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      user_id: expenseData.userId,
      amount: expenseData.amount,
      category_id: expenseData.categoryId,
      subcategory_id: expenseData.subcategoryId,
      description: expenseData.description,
      date: expenseData.date,
      payment_method: expenseData.paymentMethod
    }])
    .select()
  
  if (error) {
    console.error('Error adding expense:', error)
    return null
  }
  
  return data[0]
}

// Example 4: Authentication - Sign In
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  
  if (error) {
    console.error('Error signing in:', error)
    return null
  }
  
  return data
}

// Example 5: Get Current User
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

// Example 6: Listen to Real-time Changes
function subscribeToExpenses(callback) {
  const subscription = supabase
    .channel('expenses-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, 
      (payload) => {
        console.log('Change received!', payload)
        callback(payload)
      }
    )
    .subscribe()
  
  return subscription
}

// Example 7: Query with Joins
async function getExpensesWithCategories() {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories (
        id,
        name,
        icon,
        color
      ),
      subcategories (
        id,
        name,
        icon
      )
    `)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return null
  }
  
  return data
}

// Example 8: Get User's Monthly Summary
async function getMonthlySummary(userId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`
  
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, category_id')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
  
  if (error) {
    console.error('Error:', error)
    return null
  }
  
  // Calculate total
  const total = data.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
  
  return {
    total,
    count: data.length,
    expenses: data
  }
}

// ============================================
// IMPORTANT NOTES
// ============================================

/*
1. RLS (Row Level Security) is ENABLED
   - Users can only access their own data
   - Must be authenticated to query/insert data

2. Authentication Required
   - Use signIn() first to authenticate
   - Or use existing auth token

3. Available Tables:
   - expenses
   - categories
   - subcategories
   - budgets
   - budget_alerts
   - bills
   - subscriptions
   - user_preferences
   - currency_rates
   - tax_categories
   - receipts

4. Common Error: "Row Level Security Policy Violation"
   - Means user is not authenticated
   - Or trying to access another user's data
   - Solution: Ensure proper authentication and user_id filtering

5. Cors Issues:
   - Already configured in Supabase to allow all origins
   - If issues persist, check Supabase Dashboard > Settings > API

6. Rate Limits:
   - Free tier: 500,000 read + 100,000 write per month
   - If exceeded, upgrade plan
*/
