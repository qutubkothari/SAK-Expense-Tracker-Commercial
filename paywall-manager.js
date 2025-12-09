// Paywall Manager Module
// Handles subscription plans, limits, and premium features

let userSubscription = null;
let planLimits = {
  free: {
    name: 'Free',
    price: 0,
    expenseLimit: 50,
    features: {
      basicExpenses: true,
      voiceInput: true,
      smsScanner: true,
      categories: true,
      charts: true,
      ocr: false,
      budgets: false,
      export: false,
      csvImport: false,
      subscriptions: false
    }
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    currency: '$',
    expenseLimit: -1, // unlimited
    features: {
      basicExpenses: true,
      voiceInput: true,
      smsScanner: true,
      categories: true,
      charts: true,
      ocr: true,
      budgets: true,
      export: true,
      csvImport: true,
      subscriptions: true
    }
  },
  family: {
    name: 'Family',
    price: 9.99,
    currency: '$',
    expenseLimit: -1,
    features: {
      basicExpenses: true,
      voiceInput: true,
      smsScanner: true,
      categories: true,
      charts: true,
      ocr: true,
      budgets: true,
      export: true,
      csvImport: true,
      subscriptions: true,
      multiUser: true,
      sharing: true
    }
  },
  business: {
    name: 'Business',
    price: 19.99,
    currency: '$',
    expenseLimit: -1,
    features: {
      basicExpenses: true,
      voiceInput: true,
      smsScanner: true,
      categories: true,
      charts: true,
      ocr: true,
      budgets: true,
      export: true,
      csvImport: true,
      subscriptions: true,
      multiUser: true,
      sharing: true,
      analytics: true,
      api: true,
      priority: true
    }
  }
};

// Initialize Paywall Manager
async function initPaywallManager() {
  await loadUserSubscription();
  setupPaywallListeners();
  checkFeatureAccess();
  updateUIBasedOnPlan();
}

// Load user subscription status
async function loadUserSubscription() {
  try {
    const user = window.currentUser;
    if (!user) {
      console.log('No user logged in');
      return;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error('Error loading subscription:', error);
      return;
    }

    if (!data) {
      // Create default free subscription
      const { data: newSub, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
          expense_limit: 50,
          expenses_this_month: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return;
      }
      userSubscription = newSub;
    } else {
      userSubscription = data;
    }

    console.log('User subscription loaded:', userSubscription.plan_type);
    checkExpenseLimit();
  } catch (error) {
    console.error('Error in loadUserSubscription:', error);
  }
}

// Setup event listeners
function setupPaywallListeners() {
  const upgradeBtn = document.getElementById('upgradeBtn');
  const managePlanBtn = document.getElementById('managePlanBtn');
  const modal = document.getElementById('pricingModal');
  const closeBtn = modal?.querySelector('.close');
  const cancelBtn = document.getElementById('pricingCancelBtn');

  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', openPricingModal);
  }

  if (managePlanBtn) {
    managePlanBtn.addEventListener('click', openPricingModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  // Setup plan selection buttons
  document.querySelectorAll('.select-plan-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planType = e.target.dataset.plan;
      selectPlan(planType);
    });
  });
}

// Open pricing modal
function openPricingModal() {
  const modal = document.getElementById('pricingModal');
  if (modal) {
    modal.style.display = 'flex';
    updatePricingUI();
  }
}

// Update pricing UI based on current plan
function updatePricingUI() {
  const currentPlan = userSubscription?.plan_type || 'free';
  
  document.querySelectorAll('.pricing-card').forEach(card => {
    const planType = card.dataset.plan;
    const btn = card.querySelector('.select-plan-btn');
    
    if (planType === currentPlan) {
      btn.textContent = 'Current Plan';
      btn.disabled = true;
      btn.classList.add('disabled');
      card.classList.add('current-plan');
    } else {
      btn.textContent = planType === 'free' ? 'Downgrade' : 'Upgrade';
      btn.disabled = false;
      btn.classList.remove('disabled');
      card.classList.remove('current-plan');
    }
  });
}

// Check if user can add more expenses
async function checkExpenseLimit() {
  if (!userSubscription) return true;

  const { plan_type, expense_limit, expenses_this_month } = userSubscription;

  // Premium plans have unlimited expenses
  if (['premium', 'family', 'business'].includes(plan_type)) {
    return true;
  }

  // Check free plan limit
  if (expenses_this_month >= expense_limit) {
    showLimitReachedNotification();
    return false;
  }

  // Show warning at 80% of limit
  if (expenses_this_month >= expense_limit * 0.8) {
    const remaining = expense_limit - expenses_this_month;
    showLimitWarningNotification(remaining);
  }

  return true;
}

// Show limit reached notification
function showLimitReachedNotification() {
  const banner = document.getElementById('limitBanner');
  if (banner) {
    banner.style.display = 'flex';
    banner.innerHTML = `
      <div class="limit-banner-content">
        <i class="fas fa-exclamation-circle"></i>
        <div>
          <strong>Monthly Limit Reached</strong>
          <p>You've reached your limit of ${userSubscription.expense_limit} expenses this month. Upgrade to Premium for unlimited expenses!</p>
        </div>
      </div>
      <button class="btn-primary" onclick="openPricingModal()">
        <i class="fas fa-crown"></i> Upgrade Now
      </button>
    `;
  }
}

// Show limit warning notification
function showLimitWarningNotification(remaining) {
  const banner = document.getElementById('limitBanner');
  if (banner && banner.style.display !== 'flex') {
    banner.style.display = 'flex';
    banner.innerHTML = `
      <div class="limit-banner-content">
        <i class="fas fa-info-circle"></i>
        <div>
          <strong>Approaching Limit</strong>
          <p>You have ${remaining} expenses remaining this month. Upgrade for unlimited expenses.</p>
        </div>
      </div>
      <button class="btn-secondary" onclick="openPricingModal()">
        <i class="fas fa-crown"></i> View Plans
      </button>
    `;
  }
}

// Check feature access
function hasFeatureAccess(feature) {
  if (!userSubscription) return false;
  
  const plan = planLimits[userSubscription.plan_type];
  return plan?.features[feature] || false;
}

// Check if user can access a feature
function checkFeatureAccess() {
  // Disable premium features for free users
  const premiumFeatures = [
    { btn: 'receiptBtn', feature: 'ocr' },
    { btn: 'manageBudgetsBtn', feature: 'budgets' },
    { btn: 'exportBtn', feature: 'export' },
    { btn: 'importCSVBtn', feature: 'csvImport' },
    { btn: 'detectSubscriptionsBtn', feature: 'subscriptions' }
  ];

  premiumFeatures.forEach(({ btn, feature }) => {
    const button = document.getElementById(btn);
    if (button && !hasFeatureAccess(feature)) {
      button.addEventListener('click', (e) => {
        if (!hasFeatureAccess(feature)) {
          e.stopPropagation();
          showFeatureLockedModal(feature);
        }
      }, true);
      
      // Add premium badge
      if (!button.querySelector('.premium-badge')) {
        const badge = document.createElement('span');
        badge.className = 'premium-badge';
        badge.innerHTML = '<i class="fas fa-crown"></i>';
        badge.title = 'Premium Feature';
        button.appendChild(badge);
      }
    }
  });
}

// Show feature locked modal
function showFeatureLockedModal(feature) {
  const modal = document.getElementById('featureLockedModal');
  const featureName = document.getElementById('lockedFeatureName');
  
  const featureNames = {
    ocr: 'Receipt Scanner (OCR)',
    budgets: 'Budget Tracking',
    export: 'Advanced Export (Excel/PDF)',
    csvImport: 'CSV Import',
    subscriptions: 'Subscription Detection'
  };

  if (modal && featureName) {
    featureName.textContent = featureNames[feature] || 'This Feature';
    modal.style.display = 'flex';
  }
}

// Update UI based on plan
function updateUIBasedOnPlan() {
  const planBadge = document.getElementById('currentPlanBadge');
  const usageInfo = document.getElementById('usageInfo');

  if (planBadge && userSubscription) {
    const plan = planLimits[userSubscription.plan_type];
    planBadge.innerHTML = `
      <i class="fas fa-${userSubscription.plan_type === 'free' ? 'user' : 'crown'}"></i>
      ${plan.name}
    `;
    planBadge.className = `plan-badge plan-${userSubscription.plan_type}`;
  }

  if (usageInfo && userSubscription) {
    const { plan_type, expense_limit, expenses_this_month } = userSubscription;
    
    if (plan_type === 'free') {
      const percentage = (expenses_this_month / expense_limit) * 100;
      usageInfo.innerHTML = `
        <div class="usage-bar">
          <div class="usage-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="usage-text">${expenses_this_month} / ${expense_limit} expenses this month</p>
      `;
    } else {
      usageInfo.innerHTML = `
        <p class="usage-text unlimited">
          <i class="fas fa-infinity"></i> Unlimited expenses
        </p>
      `;
    }
  }
}

// Increment expense counter
async function incrementExpenseCounter() {
  if (!userSubscription) return false;

  if (!await checkExpenseLimit()) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        expenses_this_month: userSubscription.expenses_this_month + 1
      })
      .eq('user_id', userSubscription.user_id)
      .select()
      .single();

    if (error) throw error;

    userSubscription = data;
    updateUIBasedOnPlan();
    return true;
  } catch (error) {
    console.error('Error incrementing expense counter:', error);
    return false;
  }
}

// Select plan (mock implementation - integrate with Stripe/Razorpay)
async function selectPlan(planType) {
  const currentUser = window.currentUser;
  if (!currentUser) {
    alert('Please login first');
    return;
  }

  if (planType === userSubscription?.plan_type) {
    return;
  }

  // Show confirmation
  const plan = planLimits[planType];
  const message = planType === 'free' 
    ? 'Are you sure you want to downgrade to the Free plan? You will lose access to premium features.'
    : `Upgrade to ${plan.name} for ${plan.currency}${plan.price}/month?`;

  if (!confirm(message)) {
    return;
  }

  try {
    // In production, integrate with Stripe or Razorpay here
    // For now, just update the plan directly
    
    // Use userSubscription.user_id if available, otherwise use currentUser.id
    const userId = userSubscription?.user_id || currentUser.id;
    
    // First check if subscription exists
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    let data, error;
    
    if (existing) {
      // Update existing subscription
      const result = await supabase
        .from('user_subscriptions')
        .update({
          plan_type: planType,
          expense_limit: plan.expenseLimit === -1 ? 999999 : plan.expenseLimit,
          status: 'active'
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new subscription
      const result = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          expense_limit: plan.expenseLimit === -1 ? 999999 : plan.expenseLimit,
          status: 'active',
          expenses_this_month: 0
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    userSubscription = data;
    
    // Close modal and refresh UI
    document.getElementById('pricingModal').style.display = 'none';
    updateUIBasedOnPlan();
    checkFeatureAccess();
    
    showNotification(`Successfully ${planType === 'free' ? 'downgraded' : 'upgraded'} to ${plan.name} plan!`, 'success');
    
    // Reload page to apply changes
    setTimeout(() => location.reload(), 1500);

  } catch (error) {
    console.error('Error updating plan:', error);
    showNotification('Failed to update plan: ' + error.message, 'error');
  }
}

// Make functions globally accessible
window.openPricingModal = openPricingModal;
window.hasFeatureAccess = hasFeatureAccess;
window.incrementExpenseCounter = incrementExpenseCounter;

// Utility function
function showNotification(message, type) {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initPaywallManager);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { hasFeatureAccess, incrementExpenseCounter, loadUserSubscription };
}
