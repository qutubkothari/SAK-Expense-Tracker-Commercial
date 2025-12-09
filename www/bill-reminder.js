// Bill & Subscription Reminder System
// Smart notification system for upcoming payments

let reminderCheckInterval = null;
let upcomingReminders = [];

// Initialize Bill Reminder System
function initBillReminders() {
  console.log('🔔 Initializing Bill Reminder System...');
  
  // Check for upcoming bills immediately
  checkUpcomingBills();
  
  // Check every hour for new reminders
  reminderCheckInterval = setInterval(checkUpcomingBills, 60 * 60 * 1000);
  
  // Check on visibility change (when user returns to app)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkUpcomingBills();
    }
  });
  
  // Setup notification permission button
  setupNotificationPermission();
}

// Setup notification permission UI
function setupNotificationPermission() {
  const settingsModal = document.getElementById('settingsModal');
  if (!settingsModal) return;
  
  // Check if notifications section exists, if not add it
  let notifSection = document.getElementById('notificationSettings');
  if (!notifSection) {
    const settingsContent = settingsModal.querySelector('.settings-group');
    if (settingsContent) {
      const notifHTML = `
        <div id="notificationSettings" class="settings-section">
          <h3>🔔 Notifications</h3>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="enableReminders" checked>
              <span>Bill payment reminders</span>
            </label>
            <p class="setting-description">Get notified 3 days before bills are due</p>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="enableBrowserNotifications">
              <span>Browser notifications</span>
            </label>
            <p class="setting-description">Enable push notifications (requires permission)</p>
            <button id="requestNotificationPermission" class="btn-secondary" style="margin-top: 8px; display: none;">
              Enable Notifications
            </button>
          </div>
          <div class="setting-item">
            <label>Reminder days before due date:</label>
            <select id="reminderDaysBefore">
              <option value="1">1 day</option>
              <option value="2">2 days</option>
              <option value="3" selected>3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
            </select>
          </div>
        </div>
      `;
      settingsContent.insertAdjacentHTML('beforeend', notifHTML);
    }
  }
  
  // Load saved settings
  loadReminderSettings();
  
  // Setup event listeners
  const enableReminders = document.getElementById('enableReminders');
  const enableBrowserNotifications = document.getElementById('enableBrowserNotifications');
  const reminderDaysBefore = document.getElementById('reminderDaysBefore');
  const requestPermissionBtn = document.getElementById('requestNotificationPermission');
  
  if (enableReminders) {
    enableReminders.addEventListener('change', saveReminderSettings);
  }
  
  if (enableBrowserNotifications) {
    enableBrowserNotifications.addEventListener('change', (e) => {
      if (e.target.checked && Notification.permission !== 'granted') {
        requestNotificationPermission();
      }
      saveReminderSettings();
    });
    
    // Show/hide permission button based on notification status
    updateNotificationUI();
  }
  
  if (reminderDaysBefore) {
    reminderDaysBefore.addEventListener('change', saveReminderSettings);
  }
  
  if (requestPermissionBtn) {
    requestPermissionBtn.addEventListener('click', requestNotificationPermission);
  }
}

// Update notification UI based on permission status
function updateNotificationUI() {
  const enableBrowserNotifications = document.getElementById('enableBrowserNotifications');
  const requestPermissionBtn = document.getElementById('requestNotificationPermission');
  
  if (!enableBrowserNotifications || !requestPermissionBtn) return;
  
  if (Notification.permission === 'granted') {
    enableBrowserNotifications.checked = true;
    enableBrowserNotifications.disabled = false;
    requestPermissionBtn.style.display = 'none';
  } else if (Notification.permission === 'denied') {
    enableBrowserNotifications.checked = false;
    enableBrowserNotifications.disabled = true;
    requestPermissionBtn.style.display = 'none';
  } else {
    enableBrowserNotifications.checked = false;
    requestPermissionBtn.style.display = 'block';
  }
}

// Request browser notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showNotification('Browser notifications not supported', 'error');
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      showNotification('Notifications enabled! You\'ll get reminders for upcoming bills', 'success');
      updateNotificationUI();
      saveReminderSettings();
      
      // Send test notification
      new Notification('Bill Reminders Enabled 🔔', {
        body: 'You\'ll receive reminders before your bills are due',
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-72x72.png'
      });
    } else {
      showNotification('Notification permission denied', 'error');
      updateNotificationUI();
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    showNotification('Failed to enable notifications', 'error');
  }
}

// Load reminder settings from localStorage
function loadReminderSettings() {
  const settings = JSON.parse(localStorage.getItem('reminderSettings') || '{}');
  
  const enableReminders = document.getElementById('enableReminders');
  const enableBrowserNotifications = document.getElementById('enableBrowserNotifications');
  const reminderDaysBefore = document.getElementById('reminderDaysBefore');
  
  if (enableReminders) {
    enableReminders.checked = settings.enabled !== false; // Default true
  }
  
  if (enableBrowserNotifications && Notification.permission === 'granted') {
    enableBrowserNotifications.checked = settings.browserNotifications !== false;
  }
  
  if (reminderDaysBefore && settings.daysBefore) {
    reminderDaysBefore.value = settings.daysBefore;
  }
  
  return settings;
}

// Save reminder settings to localStorage
function saveReminderSettings() {
  const enableReminders = document.getElementById('enableReminders');
  const enableBrowserNotifications = document.getElementById('enableBrowserNotifications');
  const reminderDaysBefore = document.getElementById('reminderDaysBefore');
  
  const settings = {
    enabled: enableReminders ? enableReminders.checked : true,
    browserNotifications: enableBrowserNotifications ? enableBrowserNotifications.checked : false,
    daysBefore: reminderDaysBefore ? parseInt(reminderDaysBefore.value) : 3
  };
  
  localStorage.setItem('reminderSettings', JSON.stringify(settings));
  
  // Recheck bills with new settings
  checkUpcomingBills();
}

// Check for upcoming bills and create reminders
async function checkUpcomingBills() {
  try {
    const settings = loadReminderSettings();
    
    // Skip if reminders disabled
    if (!settings.enabled) {
      console.log('Reminders disabled');
      return;
    }
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    
    const daysBefore = settings.daysBefore || 3;
    const today = new Date();
    const checkUntil = new Date();
    checkUntil.setDate(today.getDate() + daysBefore);
    
    // Get active subscriptions with upcoming payments
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .lte('next_payment_date', checkUntil.toISOString().split('T')[0])
      .gte('next_payment_date', today.toISOString().split('T')[0]);
    
    if (error) throw error;
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No upcoming bills in next', daysBefore, 'days');
      upcomingReminders = [];
      updateReminderBadge(0);
      return;
    }
    
    console.log(`Found ${subscriptions.length} upcoming bills`);
    
    // Process reminders
    upcomingReminders = subscriptions.map(sub => {
      const dueDate = new Date(sub.next_payment_date);
      const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        id: sub.id,
        merchant: sub.merchant_name,
        amount: sub.amount,
        dueDate: sub.next_payment_date,
        daysUntil: daysUntil,
        category: sub.category,
        isOverdue: daysUntil < 0
      };
    });
    
    // Sort by days until due
    upcomingReminders.sort((a, b) => a.daysUntil - b.daysUntil);
    
    // Update UI badge
    updateReminderBadge(upcomingReminders.length);
    
    // Show in-app notifications
    showReminderNotifications(upcomingReminders, settings);
    
    // Send browser notifications if enabled
    if (settings.browserNotifications && Notification.permission === 'granted') {
      sendBrowserNotifications(upcomingReminders);
    }
    
  } catch (error) {
    console.error('Error checking upcoming bills:', error);
  }
}

// Update reminder badge count
function updateReminderBadge(count) {
  let badge = document.getElementById('reminderBadge');
  
  if (!badge && count > 0) {
    // Create badge if it doesn't exist
    const detectBtn = document.getElementById('detectSubscriptionsBtn');
    if (detectBtn) {
      badge = document.createElement('span');
      badge.id = 'reminderBadge';
      badge.className = 'reminder-badge';
      detectBtn.style.position = 'relative';
      detectBtn.appendChild(badge);
    }
  }
  
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Show in-app reminder notifications
function showReminderNotifications(reminders, settings) {
  if (!reminders || reminders.length === 0) return;
  
  // Check if we already showed notifications today
  const lastShown = localStorage.getItem('lastReminderShown');
  const today = new Date().toISOString().split('T')[0];
  
  if (lastShown === today) {
    console.log('Already showed reminders today');
    return;
  }
  
  // Show consolidated notification
  const overdueCount = reminders.filter(r => r.isOverdue).length;
  const upcomingCount = reminders.filter(r => !r.isOverdue).length;
  
  let message = '';
  if (overdueCount > 0) {
    message = `⚠️ ${overdueCount} overdue payment${overdueCount > 1 ? 's' : ''}`;
  }
  if (upcomingCount > 0) {
    if (message) message += ' and ';
    message += `🔔 ${upcomingCount} upcoming payment${upcomingCount > 1 ? 's' : ''}`;
  }
  
  if (message) {
    showNotification(message + ' - Check your subscriptions', 'info', 8000);
    localStorage.setItem('lastReminderShown', today);
  }
}

// Send browser push notifications
function sendBrowserNotifications(reminders) {
  if (!reminders || reminders.length === 0) return;
  
  // Check if we already sent notifications today
  const lastSent = localStorage.getItem('lastBrowserNotificationSent');
  const today = new Date().toISOString().split('T')[0];
  
  if (lastSent === today) {
    console.log('Already sent browser notifications today');
    return;
  }
  
  // Send notification for most urgent bill
  const mostUrgent = reminders[0];
  
  const title = mostUrgent.isOverdue 
    ? `⚠️ Overdue Payment: ${mostUrgent.merchant}`
    : `🔔 Bill Due Soon: ${mostUrgent.merchant}`;
  
  const daysText = mostUrgent.isOverdue
    ? `Overdue by ${Math.abs(mostUrgent.daysUntil)} day${Math.abs(mostUrgent.daysUntil) > 1 ? 's' : ''}`
    : mostUrgent.daysUntil === 0
    ? 'Due today'
    : `Due in ${mostUrgent.daysUntil} day${mostUrgent.daysUntil > 1 ? 's' : ''}`;
  
  const body = `${daysText} - Amount: ${getCurrencySymbol()}${mostUrgent.amount.toFixed(2)}`;
  
  new Notification(title, {
    body: body,
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    tag: `bill-reminder-${mostUrgent.id}`, // Prevent duplicate notifications
    requireInteraction: mostUrgent.isOverdue, // Stay visible if overdue
    data: {
      url: window.location.origin,
      subscriptionId: mostUrgent.id
    }
  });
  
  localStorage.setItem('lastBrowserNotificationSent', today);
}

// Get currency symbol from user preferences
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

// Render upcoming reminders in subscriptions modal
function renderUpcomingReminders() {
  const container = document.getElementById('upcomingRemindersContainer');
  if (!container) return;
  
  if (!upcomingReminders || upcomingReminders.length === 0) {
    container.innerHTML = '<p class="no-reminders">No upcoming bills in the next few days 👍</p>';
    return;
  }
  
  const html = upcomingReminders.map(reminder => {
    const daysText = reminder.isOverdue
      ? `<span class="overdue">Overdue by ${Math.abs(reminder.daysUntil)} day${Math.abs(reminder.daysUntil) > 1 ? 's' : ''}</span>`
      : reminder.daysUntil === 0
      ? '<span class="due-today">Due today</span>'
      : `<span class="due-soon">Due in ${reminder.daysUntil} day${reminder.daysUntil > 1 ? 's' : ''}</span>`;
    
    const icon = reminder.category?.icon || '💰';
    const color = reminder.category?.color || '#666';
    
    return `
      <div class="reminder-card ${reminder.isOverdue ? 'overdue' : ''}">
        <div class="reminder-icon" style="background: ${color}20; color: ${color}">
          ${icon}
        </div>
        <div class="reminder-details">
          <h4>${reminder.merchant}</h4>
          <p class="reminder-amount">${getCurrencySymbol()}${reminder.amount.toFixed(2)}</p>
          <p class="reminder-due">${daysText} • ${new Date(reminder.dueDate).toLocaleDateString()}</p>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
  }
});

// Export functions for use in other modules
window.billReminder = {
  init: initBillReminders,
  check: checkUpcomingBills,
  render: renderUpcomingReminders,
  getUpcoming: () => upcomingReminders
};
