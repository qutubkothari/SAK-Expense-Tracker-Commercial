// SMS Reader Plugin - Auto-scan transaction SMS
const SmsReader = {
  async checkPermission() {
    if (!window.Capacitor || !window.Capacitor.Plugins.SmsReader) {
      console.warn('SMS Reader plugin not available (web platform)');
      return { granted: false };
    }
    try {
      const result = await window.Capacitor.Plugins.SmsReader.checkPermission();
      return result;
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return { granted: false };
    }
  },

  async requestPermission() {
    if (!window.Capacitor || !window.Capacitor.Plugins.SmsReader) {
      console.warn('SMS Reader plugin not available (web platform)');
      return { granted: false };
    }
    try {
      const result = await window.Capacitor.Plugins.SmsReader.requestPermission();
      return result;
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return { granted: false };
    }
  },

  async getRecentSms(days = 7) {
    if (!window.Capacitor || !window.Capacitor.Plugins.SmsReader) {
      console.warn('SMS Reader plugin not available (web platform)');
      return { messages: [] };
    }
    try {
      const result = await window.Capacitor.Plugins.SmsReader.getRecentSms({ days });
      return result;
    } catch (error) {
      console.error('Error reading SMS:', error);
      return { messages: [] };
    }
  }
};

// Auto-scan SMS on app load (if permission granted)
async function autoScanSms() {
  console.log('🔍 Auto-scanning SMS for transactions...');
  
  // Check permission
  const permStatus = await SmsReader.checkPermission();
  if (!permStatus.granted) {
    console.log('SMS permission not granted. Skipping auto-scan.');
    // Don't request permission automatically on app load - wait for manual trigger
    return;
  }

  await performSmsScan();
}

// Manual SMS scan (requests permission if needed)
async function manualSmsScan() {
  console.log('🔍 Manual SMS scan triggered...');
  
  // Check permission
  let permStatus = await SmsReader.checkPermission();
  
  if (!permStatus.granted) {
    console.log('Requesting SMS permission...');
    const requestResult = await SmsReader.requestPermission();
    if (!requestResult.granted) {
      alert('SMS permission is required to scan transaction messages. Please enable it in Settings > App Permissions > SMS.');
      return;
    }
    permStatus = requestResult;
  }

  await performSmsScan();
}

// Perform the actual SMS scanning
async function performSmsScan() {
  try {
    // Get SMS from last 7 days
    const result = await SmsReader.getRecentSms(7);
    console.log(`📱 Found ${result.messages.length} transaction SMS`);

    if (result.messages.length === 0) {
      alert('No transaction SMS found in the last 7 days.');
      return;
    }

    // Parse each SMS and check if it's already added
    const newTransactions = [];
    for (const sms of result.messages) {
      const parsed = parseBankSms(sms.body);
      if (parsed) {
        // Check if this transaction already exists
        const smsDate = new Date(sms.date);
        const exists = expenses.some(e => {
          const expDate = new Date(e.date);
          return Math.abs(e.amount - parsed.amount) < 1 &&
                 Math.abs(expDate - smsDate) < 60000 && // Within 1 minute
                 (e.note || '').toLowerCase().includes(parsed.merchant.toLowerCase().substring(0, 10));
        });

        if (!exists) {
          newTransactions.push({
            ...parsed,
            smsDate: smsDate,
            sender: sms.sender
          });
        }
      }
    }

    if (newTransactions.length > 0) {
      console.log(`✨ Found ${newTransactions.length} new transactions to import`);
      
      // Show notification to user
      showSmsImportNotification(newTransactions);
    } else {
      console.log('All SMS transactions already imported');
    }

  } catch (error) {
    console.error('Error auto-scanning SMS:', error);
  }
}

// Show notification for new SMS transactions
function showSmsImportNotification(transactions) {
  const notification = document.createElement('div');
  notification.className = 'sms-import-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-sms"></i>
      <div>
        <strong>${transactions.length} New Transaction${transactions.length > 1 ? 's' : ''} Found</strong>
        <p>From SMS messages</p>
      </div>
      <button onclick="showSmsImportModal()" class="btn-primary">Review</button>
      <button onclick="dismissSmsNotification()" class="btn-secondary"><i class="fas fa-times"></i></button>
    </div>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    padding: 15px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  window.pendingSmsTransactions = transactions;
}

window.dismissSmsNotification = function() {
  const notification = document.querySelector('.sms-import-notification');
  if (notification) notification.remove();
};

window.showSmsImportModal = function() {
  dismissSmsNotification();
  
  const transactions = window.pendingSmsTransactions || [];
  if (transactions.length === 0) {
    alert('No transactions to import');
    return;
  }

  // Show modal
  const modal = document.getElementById('smsImportModal');
  const list = document.getElementById('smsImportList');
  
  // Build transaction list HTML
  list.innerHTML = transactions.map((tx, index) => `
    <div class="sms-transaction-item" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: white;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <input type="checkbox" id="sms_${index}" checked style="margin-right: 10px; width: 18px; height: 18px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 16px; color: #2d3748;">₹${tx.amount.toFixed(2)}</div>
          <div style="color: #718096; font-size: 14px;">${tx.merchant}</div>
          <div style="color: #a0aec0; font-size: 12px;">${new Date(tx.smsDate).toLocaleString()}</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <select id="category_${index}" class="input-select" onchange="loadSubcategoriesForSms(${index})" style="font-size: 14px;">
          <option value="">Select Category</option>
        </select>
        <select id="subcategory_${index}" class="input-select" style="font-size: 14px;">
          <option value="">Select Subcategory</option>
        </select>
      </div>
      <input type="text" id="note_${index}" class="input-note" placeholder="Add note (optional)" value="${tx.merchant}" style="margin-top: 10px; font-size: 14px;">
    </div>
  `).join('');

  // Populate category dropdowns
  setTimeout(() => {
    transactions.forEach((tx, index) => {
      const categorySelect = document.getElementById(`category_${index}`);
      if (categorySelect && window.categories) {
        window.categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = `${cat.icon} ${cat.name}`;
          categorySelect.appendChild(option);
        });
      }
    });
  }, 100);

  modal.style.display = 'block';
};

window.closeSmsImportModal = function() {
  document.getElementById('smsImportModal').style.display = 'none';
};

window.loadSubcategoriesForSms = function(index) {
  const categorySelect = document.getElementById(`category_${index}`);
  const subcategorySelect = document.getElementById(`subcategory_${index}`);
  const categoryId = categorySelect.value;

  subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

  if (categoryId && window.subcategories) {
    const subs = window.subcategories.filter(s => s.category_id === categoryId);
    subs.forEach(sub => {
      const option = document.createElement('option');
      option.value = sub.id;
      option.textContent = `${sub.icon} ${sub.name}`;
      subcategorySelect.appendChild(option);
    });
  }
};

window.importSelectedTransactions = async function() {
  const transactions = window.pendingSmsTransactions || [];
  const imported = [];

  for (let i = 0; i < transactions.length; i++) {
    const checkbox = document.getElementById(`sms_${i}`);
    if (!checkbox || !checkbox.checked) continue;

    const categoryId = document.getElementById(`category_${i}`).value;
    const subcategoryId = document.getElementById(`subcategory_${i}`).value;
    const note = document.getElementById(`note_${i}`).value;

    if (!categoryId) {
      alert(`Please select a category for transaction ${i + 1}`);
      return;
    }

    const tx = transactions[i];
    const expense = {
      amount: tx.amount,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      note: note || tx.merchant,
      date: tx.smsDate.toISOString(),
      currency: 'INR',
      user_id: window.currentUser?.id,
      payment_method: 'upi',
      payment_status: 'paid'
    };

    try {
      const { data, error } = await window.supabase
        .from('expenses')
        .insert([expense])
        .select();

      if (error) throw error;
      imported.push(data[0]);
    } catch (error) {
      console.error('Error importing transaction:', error);
      alert('Failed to import transaction: ' + error.message);
      return;
    }
  }

  if (imported.length > 0) {
    alert(`Successfully imported ${imported.length} transaction(s)!`);
    window.closeSmsImportModal();
    
    // Refresh expenses list
    if (window.loadExpenses) {
      await window.loadExpenses();
    }
  }
};


// Request SMS permission on first use
async function requestSmsPermissionIfNeeded() {
  const permStatus = await SmsReader.checkPermission();
  if (!permStatus.granted) {
    const result = await SmsReader.requestPermission();
    if (result.granted) {
      console.log('✅ SMS permission granted');
      autoScanSms();
    } else {
      console.log('❌ SMS permission denied');
    }
  }
}

export { SmsReader, autoScanSms, manualSmsScan, requestSmsPermissionIfNeeded };
