// Subscription Detector Module
// Automatically detects recurring transactions and manages subscriptions

let userSubscriptions = [];
let detectedPatterns = [];

// Initialize Subscription Detector
function initSubscriptionDetector() {
  const detectBtn = document.getElementById('detectSubscriptionsBtn');
  const modal = document.getElementById('subscriptionsModal');
  
  // Check if elements exist
  if (!detectBtn || !modal) {
    console.log('Subscription detector elements not found - feature may be disabled');
    return;
  }
  
  const closeBtn = modal.querySelector('.close');
  const cancelBtn = document.getElementById('subscriptionsCancelBtn');
  const scanBtn = document.getElementById('scanSubscriptionsBtn');

  // Open modal
  detectBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    loadSubscriptions();
    
    // Render reminders when modal opens
    if (typeof window.billReminder !== 'undefined') {
      window.billReminder.render();
    }
  });

  // Close modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  cancelBtn.addEventListener('click', () => modal.style.display = 'none');

  // Scan for subscriptions
  scanBtn.addEventListener('click', scanForSubscriptions);

  // Load on page load
  loadSubscriptions();
  renderSubscriptionWidget();
}

// Load existing subscriptions from database
async function loadSubscriptions() {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('next_payment_date', { ascending: true });

    if (error) throw error;

    userSubscriptions = data || [];
    console.log('Loaded subscriptions:', userSubscriptions.length);
    
    renderSubscriptionsList();
    renderSubscriptionWidget();
    
    // Update bill reminders if available
    if (typeof window.billReminder !== 'undefined') {
      window.billReminder.check().then(() => {
        window.billReminder.render();
      });
    }
  } catch (error) {
    console.error('Error loading subscriptions:', error);
  }
}

// Scan expenses for subscription patterns
async function scanForSubscriptions() {
  const scanBtn = document.getElementById('scanSubscriptionsBtn');
  const scanStatus = document.getElementById('scanStatus');
  
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
  scanStatus.style.display = 'block';
  scanStatus.innerHTML = '<i class="fas fa-search"></i> Analyzing your expenses for recurring patterns...';

  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Get all expenses from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', sixMonthsAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;

    if (!expenses || expenses.length < 5) {
      scanStatus.innerHTML = '<i class="fas fa-info-circle"></i> Not enough expense data. Need at least 5 expenses to detect patterns.';
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="fas fa-search"></i> Scan for Subscriptions';
      return;
    }

    // Analyze patterns
    detectedPatterns = analyzeRecurringPatterns(expenses);
    
    if (detectedPatterns.length === 0) {
      scanStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #48bb78;"></i> No new recurring patterns detected. Your expenses look unique!';
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="fas fa-search"></i> Scan for Subscriptions';
      return;
    }

    // Show detected patterns
    scanStatus.innerHTML = `<i class="fas fa-check-circle" style="color: #48bb78;"></i> Found ${detectedPatterns.length} potential subscription(s)!`;
    renderDetectedPatterns();
    scanBtn.disabled = false;
    scanBtn.innerHTML = '<i class="fas fa-search"></i> Scan Again';

  } catch (error) {
    console.error('Error scanning subscriptions:', error);
    scanStatus.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f56565;"></i> Error: ${error.message}`;
    scanBtn.disabled = false;
    scanBtn.innerHTML = '<i class="fas fa-search"></i> Scan for Subscriptions';
  }
}

// Analyze expenses for recurring patterns
function analyzeRecurringPatterns(expenses) {
  const patterns = [];
  const merchantGroups = {};

  // Group expenses by similar merchant names
  expenses.forEach(expense => {
    if (!expense.note) return;
    
    const merchant = normalizeMerchantName(expense.note);
    if (!merchant) return;

    if (!merchantGroups[merchant]) {
      merchantGroups[merchant] = [];
    }
    merchantGroups[merchant].push(expense);
  });

  // Analyze each merchant group for recurring patterns
  Object.entries(merchantGroups).forEach(([merchant, expenseList]) => {
    if (expenseList.length < 3) return; // Need at least 3 occurrences

    // Sort by date
    expenseList.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Check if amounts are similar (within 10% variance)
    const amounts = expenseList.map(e => e.amount);
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const maxVariance = avgAmount * 0.1;
    const similarAmounts = amounts.every(amt => Math.abs(amt - avgAmount) <= maxVariance);

    if (!similarAmounts) return;

    // Check date intervals
    const intervals = [];
    for (let i = 1; i < expenseList.length; i++) {
      const date1 = new Date(expenseList[i - 1].date);
      const date2 = new Date(expenseList[i].date);
      const daysDiff = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
      intervals.push(daysDiff);
    }

    // Determine frequency
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    let frequency = 'monthly';
    let confidence = 70;

    if (avgInterval >= 25 && avgInterval <= 35) {
      frequency = 'monthly';
      confidence = 85;
    } else if (avgInterval >= 5 && avgInterval <= 9) {
      frequency = 'weekly';
      confidence = 80;
    } else if (avgInterval >= 350 && avgInterval <= 380) {
      frequency = 'yearly';
      confidence = 75;
    } else {
      // Irregular pattern, lower confidence
      confidence = 60;
    }

    // Check if already exists in subscriptions
    const existingSub = userSubscriptions.find(sub => 
      normalizeMerchantName(sub.merchant_name) === merchant &&
      Math.abs(sub.amount - avgAmount) <= maxVariance
    );

    if (existingSub) return; // Skip if already tracked

    // Calculate next payment date
    const lastPayment = new Date(expenseList[expenseList.length - 1].date);
    const nextPayment = new Date(lastPayment);
    
    if (frequency === 'monthly') {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    } else if (frequency === 'weekly') {
      nextPayment.setDate(nextPayment.getDate() + 7);
    } else if (frequency === 'yearly') {
      nextPayment.setFullYear(nextPayment.getFullYear() + 1);
    }

    patterns.push({
      merchant: expenseList[0].note, // Use original note
      amount: avgAmount,
      frequency: frequency,
      confidence: confidence,
      occurrences: expenseList.length,
      lastPayment: expenseList[expenseList.length - 1].date,
      nextPayment: nextPayment.toISOString().split('T')[0],
      categoryId: expenseList[0].category_id,
      expenseIds: expenseList.map(e => e.id)
    });
  });

  // Sort by confidence
  return patterns.sort((a, b) => b.confidence - a.confidence);
}

// Normalize merchant name for comparison
function normalizeMerchantName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\b(subscription|monthly|payment|bill|auto|recurring)\b/g, '') // Remove common words
    .trim()
    .substring(0, 30); // First 30 chars
}

// Render detected patterns
function renderDetectedPatterns() {
  const container = document.getElementById('detectedPatternsList');
  
  if (detectedPatterns.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #a0aec0;">No patterns detected yet. Click "Scan for Subscriptions" to analyze.</p>';
    return;
  }

  container.innerHTML = detectedPatterns.map(pattern => `
    <div class="detected-pattern-card">
      <div class="pattern-info">
        <h4>${escapeHtml(pattern.merchant)}</h4>
        <div class="pattern-details">
          <span class="pattern-amount">₹${pattern.amount.toFixed(2)}/${pattern.frequency}</span>
          <span class="pattern-confidence" style="color: ${pattern.confidence >= 80 ? '#48bb78' : '#ed8936'};">
            ${pattern.confidence}% confidence
          </span>
          <span class="pattern-occurrences">${pattern.occurrences} occurrences</span>
        </div>
        <p class="pattern-next">Next payment: ${formatDate(pattern.nextPayment)}</p>
      </div>
      <div class="pattern-actions">
        <button class="btn-primary btn-sm" onclick="confirmSubscription('${encodeURIComponent(JSON.stringify(pattern))}')">
          <i class="fas fa-check"></i> Track
        </button>
        <button class="btn-secondary btn-sm" onclick="ignorePattern(${detectedPatterns.indexOf(pattern)})">
          <i class="fas fa-times"></i> Ignore
        </button>
      </div>
    </div>
  `).join('');
}

// Confirm and save subscription
window.confirmSubscription = async function(encodedPattern) {
  try {
    const pattern = JSON.parse(decodeURIComponent(encodedPattern));
    const user = (await supabase.auth.getUser()).data.user;

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        merchant_name: pattern.merchant,
        amount: pattern.amount,
        category_id: pattern.categoryId,
        frequency: pattern.frequency,
        next_payment_date: pattern.nextPayment,
        last_payment_date: pattern.lastPayment,
        is_active: true,
        is_confirmed: true,
        detection_confidence: pattern.confidence,
        occurrence_count: pattern.occurrences
      })
      .select()
      .single();

    if (subError) throw subError;

    // Link expense transactions
    const transactions = pattern.expenseIds.map(expenseId => ({
      subscription_id: subscription.id,
      expense_id: expenseId
    }));

    const { error: transError } = await supabase
      .from('subscription_transactions')
      .insert(transactions);

    if (transError) console.warn('Error linking transactions:', transError);

    // Remove from detected patterns
    const index = detectedPatterns.findIndex(p => p.merchant === pattern.merchant);
    if (index > -1) {
      detectedPatterns.splice(index, 1);
    }

    // Refresh
    await loadSubscriptions();
    renderDetectedPatterns();
    
    showNotification('Subscription tracked successfully!', 'success');
  } catch (error) {
    console.error('Error confirming subscription:', error);
    showNotification('Failed to track subscription: ' + error.message, 'error');
  }
};

// Ignore pattern
window.ignorePattern = function(index) {
  detectedPatterns.splice(index, 1);
  renderDetectedPatterns();
};

// Render subscriptions list
function renderSubscriptionsList() {
  const container = document.getElementById('subscriptionsList');
  
  if (userSubscriptions.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #a0aec0; padding: 20px;">No subscriptions tracked yet.</p>';
    return;
  }

  container.innerHTML = userSubscriptions.map(sub => {
    const daysUntil = Math.ceil((new Date(sub.next_payment_date) - new Date()) / (1000 * 60 * 60 * 24));
    const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
    const isPast = daysUntil < 0;

    return `
      <div class="subscription-card ${isUpcoming ? 'upcoming' : ''} ${isPast ? 'overdue' : ''}">
        <div class="subscription-header">
          <div class="subscription-merchant">
            <h4>${escapeHtml(sub.merchant_name)}</h4>
            ${sub.category ? `<span class="category-badge" style="background: ${sub.category.color || '#667eea'};">
              ${sub.category.icon || '📁'} ${sub.category.name}
            </span>` : ''}
          </div>
          <div class="subscription-amount">₹${sub.amount.toFixed(2)}</div>
        </div>
        <div class="subscription-details">
          <span><i class="fas fa-calendar"></i> ${capitalizeFirst(sub.frequency)}</span>
          <span><i class="fas fa-clock"></i> ${isPast ? 'Overdue' : isUpcoming ? `Due in ${daysUntil} day(s)` : formatDate(sub.next_payment_date)}</span>
          <span><i class="fas fa-chart-line"></i> ${sub.occurrence_count} payment(s)</span>
        </div>
        ${sub.notes ? `<p class="subscription-notes">${escapeHtml(sub.notes)}</p>` : ''}
        <div class="subscription-actions">
          <button class="btn-icon-sm" onclick="editSubscription('${sub.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon-sm" onclick="toggleSubscription('${sub.id}', ${!sub.is_active})" title="${sub.is_active ? 'Pause' : 'Resume'}">
            <i class="fas fa-${sub.is_active ? 'pause' : 'play'}"></i>
          </button>
          <button class="btn-icon-sm" onclick="deleteSubscription('${sub.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render subscription widget on dashboard
function renderSubscriptionWidget() {
  const widget = document.getElementById('subscriptionsWidget');
  if (!widget) return;

  const activeSubscriptions = userSubscriptions.filter(sub => sub.is_active);
  
  if (activeSubscriptions.length === 0) {
    widget.style.display = 'none';
    return;
  }

  widget.style.display = 'block';

  // Calculate totals
  const monthlyTotal = activeSubscriptions
    .filter(sub => sub.frequency === 'monthly')
    .reduce((sum, sub) => sum + parseFloat(sub.amount), 0);

  const weeklyTotal = activeSubscriptions
    .filter(sub => sub.frequency === 'weekly')
    .reduce((sum, sub) => sum + parseFloat(sub.amount), 0);

  const yearlyTotal = activeSubscriptions
    .filter(sub => sub.frequency === 'yearly')
    .reduce((sum, sub) => sum + parseFloat(sub.amount), 0);

  const estimatedMonthly = monthlyTotal + (weeklyTotal * 4.33) + (yearlyTotal / 12);

  // Get upcoming subscriptions (next 7 days)
  const upcoming = activeSubscriptions.filter(sub => {
    const daysUntil = Math.ceil((new Date(sub.next_payment_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  }).sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date));

  widget.innerHTML = `
    <div class="widget-header">
      <h3><i class="fas fa-sync-alt"></i> Subscriptions</h3>
      <button class="btn-secondary btn-sm" id="detectSubscriptionsBtn">
        <i class="fas fa-search"></i> Manage
      </button>
    </div>
    <div class="subscriptions-summary">
      <div class="sub-stat">
        <span class="sub-stat-value">₹${estimatedMonthly.toFixed(0)}</span>
        <span class="sub-stat-label">Est. Monthly</span>
      </div>
      <div class="sub-stat">
        <span class="sub-stat-value">${activeSubscriptions.length}</span>
        <span class="sub-stat-label">Active</span>
      </div>
    </div>
    ${upcoming.length > 0 ? `
      <div class="upcoming-subscriptions">
        <h4>Upcoming Payments</h4>
        ${upcoming.slice(0, 3).map(sub => {
          const daysUntil = Math.ceil((new Date(sub.next_payment_date) - new Date()) / (1000 * 60 * 60 * 24));
          return `
            <div class="upcoming-sub-item">
              <div>
                <strong>${escapeHtml(sub.merchant_name)}</strong>
                <span class="sub-date">in ${daysUntil} day(s)</span>
              </div>
              <span class="sub-amount">₹${sub.amount.toFixed(2)}</span>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}
  `;

  // Re-attach event listener for manage button
  document.getElementById('detectSubscriptionsBtn').addEventListener('click', () => {
    document.getElementById('subscriptionsModal').style.display = 'flex';
    loadSubscriptions();
  });
}

// Edit subscription
window.editSubscription = async function(id) {
  // TODO: Implement edit modal
  console.log('Edit subscription:', id);
  showNotification('Edit feature coming soon!', 'info');
};

// Toggle subscription active state
window.toggleSubscription = async function(id, newState) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: newState })
      .eq('id', id);

    if (error) throw error;

    await loadSubscriptions();
    showNotification(`Subscription ${newState ? 'resumed' : 'paused'}!`, 'success');
  } catch (error) {
    console.error('Error toggling subscription:', error);
    showNotification('Failed to update subscription', 'error');
  }
};

// Delete subscription
window.deleteSubscription = async function(id) {
  if (!confirm('Are you sure you want to delete this subscription?')) return;

  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await loadSubscriptions();
    showNotification('Subscription deleted!', 'success');
  } catch (error) {
    console.error('Error deleting subscription:', error);
    showNotification('Failed to delete subscription', 'error');
  }
};

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type) {
  // Use existing notification system if available
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initSubscriptionDetector);
