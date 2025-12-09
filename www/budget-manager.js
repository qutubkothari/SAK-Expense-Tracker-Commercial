// Budget Management Module
let budgets = [];
let budgetAlerts = [];

// Open budget modal
window.openBudgetModal = async function() {
  console.log('📊 Opening budget modal...');
  const modal = document.getElementById('budgetModal');
  if (!modal) {
    console.error('❌ Budget modal not found!');
    return;
  }
  modal.style.display = 'flex';
  console.log('Loading budgets and populating categories...');
  await populateBudgetCategories(); // Changed to await
  await loadBudgets();
  await renderBudgetOverview();
  console.log('Budget modal opened successfully');
};

// Close budget modal
window.closeBudgetModal = function() {
  document.getElementById('budgetModal').style.display = 'none';
};

// Populate categories in budget dropdown
async function populateBudgetCategories() {
  const select = document.getElementById('budgetCategorySelect');
  
  console.log('📂 Populating budget categories. Available categories:', window.categories?.length || 0);
  
  // If categories aren't loaded, load them from Supabase
  if (!window.categories || window.categories.length === 0) {
    console.log('Loading categories from database...');
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        window.categories = data;
        console.log('✅ Loaded', data.length, 'categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
  
  // Clear existing options (except first two)
  while (select.options.length > 2) {
    select.remove(2);
  }
  
  // Add category options - use window.categories to access global variable
  if (window.categories && window.categories.length > 0) {
    console.log('Adding', window.categories.length, 'categories to dropdown');
    window.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon} ${cat.name}`;
      select.appendChild(option);
      console.log('Added category:', cat.name);
    });
  } else {
    console.warn('⚠️ No categories found in window.categories');
  }
}

// Populate subcategories based on selected category
window.populateBudgetSubcategories = async function() {
  const categoryId = document.getElementById('budgetCategorySelect').value;
  const subcategorySelect = document.getElementById('budgetSubcategorySelect');
  
  // Hide subcategory dropdown if no category or overall selected
  if (!categoryId || categoryId === 'overall') {
    subcategorySelect.style.display = 'none';
    return;
  }
  
  // Clear existing subcategories
  subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
  
  // Load subcategories for the selected category
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      subcategorySelect.style.display = 'block';
      data.forEach(subcat => {
        const option = document.createElement('option');
        option.value = subcat.id;
        option.textContent = `${subcat.icon} ${subcat.name}`;
        subcategorySelect.appendChild(option);
      });
    } else {
      subcategorySelect.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading subcategories:', error);
    subcategorySelect.style.display = 'none';
  }
};

// Load budgets from Supabase
async function loadBudgets() {
  try {
    const currentUser = window.currentUser;
    if (!currentUser || !currentUser.id) {
      console.log('No user logged in');
      return;
    }
    
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, icon, color),
        subcategory:subcategories(id, name, icon)
      `)
      .eq('user_id', currentUser.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    budgets = data || [];
    console.log('Loaded budgets:', budgets.length);
    renderBudgetsList();
    
  } catch (error) {
    console.error('Error loading budgets:', error);
    if (error.code === '42P01') {
      alert('Budgets table not found. Please run budget-setup.sql in Supabase SQL Editor first.');
    }
  }
}

// Add new budget
window.addBudget = async function() {
  const categoryId = document.getElementById('budgetCategorySelect').value;
  const subcategoryId = document.getElementById('budgetSubcategorySelect')?.value || null;
  const amount = parseFloat(document.getElementById('budgetAmount').value);
  const period = document.getElementById('budgetPeriod').value;
  let alertThreshold = parseFloat(document.getElementById('budgetAlert').value) || 80;
  
  // Get current user from global variable
  const currentUser = window.currentUser;
  if (!currentUser || !currentUser.id) {
    alert('Please login first');
    console.error('No user found. window.currentUser:', currentUser);
    return;
  }
  
  console.log('Current user:', currentUser.id);
  
  if (!amount || amount <= 0) {
    alert('Please enter a valid budget amount');
    return;
  }
  
  // Validate amount is within database limits (DECIMAL(10,2) max is 99,999,999.99)
  if (amount > 99999999.99) {
    alert('Budget amount is too large. Maximum is ₹99,999,999.99');
    return;
  }
  
  // Validate alert threshold is a percentage (1-100)
  if (alertThreshold < 1 || alertThreshold > 100) {
    alert('Alert threshold must be between 1% and 100%');
    return;
  }
  
  // Ensure alert threshold fits in DECIMAL(5,2) - round to 2 decimal places
  alertThreshold = Math.min(100, Math.max(1, Math.round(alertThreshold * 100) / 100));
  
  // Round to 2 decimal places to prevent overflow
  const roundedAmount = Math.round(amount * 100) / 100;
  
  try {
    // Set start/end dates based on period
    const now = new Date();
    let startDate, endDate;
    
    if (period === 'monthly') {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${nextMonth.getDate()}`;
    }
    
    const budgetData = {
      user_id: currentUser.id,
      category_id: (categoryId && categoryId !== 'overall') ? categoryId : null,
      subcategory_id: (subcategoryId && subcategoryId !== '') ? subcategoryId : null,
      amount: roundedAmount,
      period: period,
      alert_threshold: alertThreshold,
      is_active: true,
      start_date: startDate || null,
      end_date: endDate || null
    };
    
    console.log('Inserting budget:', budgetData);
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([budgetData])
      .select();
    
    if (error) throw error;
    
    console.log('Budget added:', data);
    
    // Clear form
    document.getElementById('budgetCategorySelect').value = '';
    document.getElementById('budgetAmount').value = '';
    document.getElementById('budgetPeriod').value = 'monthly';
    document.getElementById('budgetAlert').value = '80';
    
    // Reload budgets
    await loadBudgets();
    await renderBudgetOverview();
    
    alert('✅ Budget set successfully!');
    
  } catch (error) {
    console.error('Error adding budget:', error);
    alert('Failed to add budget: ' + error.message);
  }
};

// Delete budget
window.deleteBudget = async function(budgetId) {
  if (!confirm('Are you sure you want to delete this budget?')) return;
  
  try {
    const { error } = await supabase
      .from('budgets')
      .update({ is_active: false })
      .eq('id', budgetId);
    
    if (error) throw error;
    
    await loadBudgets();
    await renderBudgetOverview();
    
  } catch (error) {
    console.error('Error deleting budget:', error);
    alert('Failed to delete budget');
  }
};

// Render budgets list
function renderBudgetsList() {
  const container = document.getElementById('budgetsList');
  
  console.log('📋 Rendering budgets list. Total budgets:', budgets.length);
  
  if (!container) {
    console.error('❌ budgetsList container not found!');
    return;
  }
  
  if (budgets.length === 0) {
    container.innerHTML = '<p class="empty-state">No budgets set. Create your first budget above!</p>';
    return;
  }
  
  container.innerHTML = budgets.map(budget => {
    const categoryName = budget.category ? `${budget.category.icon} ${budget.category.name}` : '📊 Overall';
    const subcategoryName = budget.subcategory ? ` > ${budget.subcategory.icon} ${budget.subcategory.name}` : '';
    const periodLabel = budget.period.charAt(0).toUpperCase() + budget.period.slice(1);
    
    console.log('Rendering budget:', categoryName + subcategoryName, budget.amount);
    
    return `
      <div class="budget-item">
        <div class="budget-info">
          <div class="budget-category">${categoryName}${subcategoryName}</div>
          <div class="budget-details">
            <span class="budget-amount">₹${budget.amount.toFixed(0)}</span>
            <span class="budget-period">${periodLabel}</span>
            <span class="budget-alert-threshold">Alert: ${budget.alert_threshold}%</span>
          </div>
        </div>
        <button onclick="deleteBudget('${budget.id}')" class="btn-icon btn-danger">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');
}

// Render budget overview with progress bars
async function renderBudgetOverview() {
  const container = document.getElementById('budgetOverview');
  
  if (budgets.length === 0) {
    container.innerHTML = '<p class="empty-state">Set budgets to see your spending progress here.</p>';
    return;
  }
  
  // Calculate spending for each budget
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  console.log('Budget calculation - Current month:', currentMonth, 'Year:', currentYear);
  
  // Get expenses from global variable or load from database
  let allExpenses = window.expenses || [];
  
  if (allExpenses.length === 0) {
    console.log('⚠️ No expenses in window.expenses, loading from database...');
    try {
      const currentUser = window.currentUser;
      if (currentUser && currentUser.id) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('date', { ascending: false });
        
        if (!error && data) {
          allExpenses = data;
          console.log('✅ Loaded', allExpenses.length, 'expenses from database');
        }
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  }
  
  console.log('Total expenses available:', allExpenses.length);
  
  const budgetProgress = await Promise.all(budgets.map(async budget => {
    let spent = 0;
    
    if (budget.category_id) {
      // Category-specific budget (with optional subcategory)
      const categoryExpenses = allExpenses.filter(e => {
        const expDate = new Date(e.date);
        const categoryMatch = e.category_id === budget.category_id;
        const subcategoryMatch = budget.subcategory_id ? e.subcategory_id === budget.subcategory_id : true;
        const dateMatch = expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        return categoryMatch && subcategoryMatch && dateMatch;
      });
      spent = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const budgetName = budget.subcategory ? `${budget.category?.name} > ${budget.subcategory.name}` : budget.category?.name;
      console.log(`Category budget ${budgetName}: ${categoryExpenses.length} expenses, spent: ₹${spent.toFixed(2)}`);
    } else {
      // Overall budget
      const monthExpenses = allExpenses.filter(e => {
        const expDate = new Date(e.date);
        const match = expDate.getMonth() === currentMonth &&
               expDate.getFullYear() === currentYear;
        return match;
      });
      spent = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      console.log(`Overall budget: ${monthExpenses.length} expenses, spent: ₹${spent.toFixed(2)}`);
    }
    
    const percentage = (spent / budget.amount) * 100;
    const remaining = Math.max(0, budget.amount - spent);
    
    return {
      budget,
      spent,
      remaining,
      percentage: Math.min(100, percentage)
    };
  }));
  
  container.innerHTML = budgetProgress.map(({ budget, spent, remaining, percentage }) => {
    const categoryName = budget.category ? `${budget.category.icon} ${budget.category.name}` : '📊 Overall Budget';
    const isWarning = percentage >= budget.alert_threshold;
    const isExceeded = percentage >= 100;
    
    let statusClass = 'budget-ok';
    let statusIcon = '✅';
    if (isExceeded) {
      statusClass = 'budget-exceeded';
      statusIcon = '🚨';
    } else if (isWarning) {
      statusClass = 'budget-warning';
      statusIcon = '⚠️';
    }
    
    return `
      <div class="budget-progress-card ${statusClass}">
        <div class="budget-header-row">
          <h4>${statusIcon} ${categoryName}</h4>
          <span class="budget-percentage">${percentage.toFixed(1)}%</span>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill ${statusClass}" style="width: ${Math.min(100, percentage)}%"></div>
        </div>
        
        <div class="budget-stats-row">
          <div class="budget-stat">
            <span class="stat-label">Spent</span>
            <span class="stat-value spent">₹${spent.toFixed(0)}</span>
          </div>
          <div class="budget-stat">
            <span class="stat-label">Budget</span>
            <span class="stat-value">₹${budget.amount.toFixed(0)}</span>
          </div>
          <div class="budget-stat">
            <span class="stat-label">Remaining</span>
            <span class="stat-value ${remaining > 0 ? 'remaining' : 'exceeded'}">₹${remaining.toFixed(0)}</span>
          </div>
        </div>
        
        ${isExceeded ? '<div class="budget-alert exceeded">Budget exceeded! Consider reviewing expenses.</div>' : ''}
        ${isWarning && !isExceeded ? `<div class="budget-alert warning">Warning: ${percentage.toFixed(0)}% of budget used</div>` : ''}
      </div>
    `;
  }).join('');
  
  // Check for alerts and show notification banner
  checkBudgetAlerts(budgetProgress);
}

// Check budget alerts and show notifications
function checkBudgetAlerts(budgetProgress) {
  const alerts = budgetProgress.filter(({ percentage, budget }) => 
    percentage >= budget.alert_threshold
  );
  
  if (alerts.length > 0) {
    showBudgetAlertBanner(alerts);
  }
  
  // Also check for AI-predicted overspending
  checkPredictiveAlerts(budgetProgress);
}

// AI-Powered Predictive Budget Alerts
async function checkPredictiveAlerts(budgetProgress) {
  try {
    // Only check if we have AI service available
    if (typeof window.aiService === 'undefined' || !window.aiService.predictNextMonth) {
      return;
    }
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();
    const daysRemaining = daysInMonth - currentDay;
    
    // Only show predictive alerts after 10 days into month
    if (currentDay < 10) return;
    
    // Get AI predictions
    const predictions = await window.aiService.predictNextMonth();
    if (!predictions || !predictions.categoryPredictions) return;
    
    // Check each monthly budget against AI predictions
    for (const progress of budgetProgress) {
      if (progress.budget.period !== 'monthly') continue;
      
      const budget = progress.budget;
      const categoryPrediction = predictions.categoryPredictions.find(p => 
        p.category === budget.category?.name || p.categoryId === budget.category_id
      );
      
      if (!categoryPrediction) continue;
      
      // Calculate projected spending based on current pace
      const currentSpent = progress.spent;
      const dailyAverage = currentSpent / currentDay;
      const projectedTotal = dailyAverage * daysInMonth;
      
      // Variance analysis: projected spending vs budget
      const variance = projectedTotal - budget.amount;
      const variancePercentage = (variance / budget.amount) * 100;
      
      // Alert if projected to exceed budget by 10% or more
      if (variancePercentage >= 10 && progress.percentage < 100) {
        showPredictiveAlert(budget, currentSpent, projectedTotal, variance, daysRemaining);
        break; // Show one alert at a time
      }
    }
  } catch (error) {
    console.error('Error checking predictive alerts:', error);
  }
}

// Show predictive overspending alert
function showPredictiveAlert(budget, currentSpent, projectedTotal, variance, daysRemaining) {
  // Check if we already showed this alert today
  const alertKey = `predictiveAlert_${budget.id}_${new Date().toISOString().split('T')[0]}`;
  if (localStorage.getItem(alertKey)) return;
  
  // Remove existing predictive alert if any
  const existingAlert = document.getElementById('predictiveBudgetAlert');
  if (existingAlert) existingAlert.remove();
  
  const currencySymbol = getCurrencySymbol();
  const categoryName = budget.category?.name || 'this category';
  const categoryIcon = budget.category?.icon || '💰';
  
  const banner = document.createElement('div');
  banner.id = 'predictiveBudgetAlert';
  banner.className = 'budget-banner predictive';
  banner.innerHTML = `
    <div class="alert-content">
      <span class="alert-icon">⚡</span>
      <div class="alert-details">
        <div class="alert-message">
          <strong>AI Budget Alert: ${categoryIcon} ${categoryName}</strong>
        </div>
        <div class="alert-prediction">
          At your current pace, you'll spend <strong>${currencySymbol}${projectedTotal.toFixed(0)}</strong> 
          this month (Budget: ${currencySymbol}${budget.amount.toFixed(0)})
        </div>
        <div class="alert-advice">
          💡 Save <strong>${currencySymbol}${(variance / daysRemaining).toFixed(0)}/day</strong> 
          for the next ${daysRemaining} days to stay on budget
        </div>
      </div>
      <button onclick="openBudgetModal()" class="btn-alert-action">View Budget</button>
      <button onclick="dismissPredictiveAlert('${budget.id}')" class="btn-close-alert">×</button>
    </div>
  `;
  
  // Insert after summary cards
  const summaryCards = document.querySelector('.summary-cards');
  if (summaryCards) {
    summaryCards.insertAdjacentElement('afterend', banner);
  }
  
  // Mark as shown
  localStorage.setItem(alertKey, 'shown');
  
  // Show notification toast
  if (typeof showNotification === 'function') {
    showNotification(
      `⚡ Budget Alert: You're on track to overspend on ${categoryName} by ${currencySymbol}${variance.toFixed(0)}`,
      'warning',
      6000
    );
  }
}

// Dismiss predictive alert
window.dismissPredictiveAlert = function(budgetId) {
  const alert = document.getElementById('predictiveBudgetAlert');
  if (alert) alert.remove();
};

// Get currency symbol helper
function getCurrencySymbol() {
  try {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    const currency = preferences.currency || 'USD';
    
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'AED': 'د.إ',
      'SAR': 'ر.س', 'QAR': 'ر.ق', 'KWD': 'د.ك', 'OMR': 'ر.ع',
      'BHD': 'د.ب', 'PKR': '₨', 'BDT': '৳', 'LKR': '₨', 'SGD': 'S$'
    };
    
    return symbols[currency] || '$';
  } catch (error) {
    return '$';
  }
}

// Show budget alert banner on main dashboard
function showBudgetAlertBanner(alerts) {
  // Remove existing alert if any
  const existingAlert = document.getElementById('budgetAlertBanner');
  if (existingAlert) existingAlert.remove();
  
  const exceededAlerts = alerts.filter(({ percentage }) => percentage >= 100);
  const warningAlerts = alerts.filter(({ percentage }) => percentage < 100);
  
  let message = '';
  let icon = '';
  let className = '';
  
  if (exceededAlerts.length > 0) {
    message = `🚨 ${exceededAlerts.length} budget(s) exceeded!`;
    className = 'budget-banner exceeded';
    icon = '🚨';
  } else if (warningAlerts.length > 0) {
    message = `⚠️ ${warningAlerts.length} budget(s) approaching limit`;
    className = 'budget-banner warning';
    icon = '⚠️';
  }
  
  if (message) {
    const banner = document.createElement('div');
    banner.id = 'budgetAlertBanner';
    banner.className = className;
    banner.innerHTML = `
      <div class="alert-content">
        <span class="alert-icon">${icon}</span>
        <span class="alert-message">${message}</span>
        <button onclick="openBudgetModal()" class="btn-alert-action">View Budgets</button>
        <button onclick="this.parentElement.parentElement.remove()" class="btn-close-alert">×</button>
      </div>
    `;
    
    // Insert after summary cards
    const summaryCards = document.querySelector('.summary-cards');
    if (summaryCards) {
      summaryCards.insertAdjacentElement('afterend', banner);
    }
  }
}

// Initialize budget management
document.addEventListener('DOMContentLoaded', function() {
  const budgetsBtn = document.getElementById('manageBudgetsBtn');
  if (budgetsBtn) {
    budgetsBtn.addEventListener('click', openBudgetModal);
  }
  
  const addBudgetBtn = document.getElementById('addBudgetBtn');
  if (addBudgetBtn) {
    addBudgetBtn.addEventListener('click', addBudget);
  }
});

// Export function to be called after expenses are loaded
window.checkAndShowBudgetAlerts = async function() {
  if (budgets.length === 0) {
    await loadBudgets();
  }
  
  if (budgets.length > 0) {
    await renderBudgetOverview();
  }
};
