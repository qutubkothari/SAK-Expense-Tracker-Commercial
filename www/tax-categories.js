// Tax Category Mapping System for Business Users
// IRS/Tax authority category tagging for expense tracking

const TAX_CATEGORIES = {
  // IRS Schedule C Categories (US)
  US: {
    'advertising': { name: 'Advertising', code: 'SCH_C_8', deductible: true },
    'car_truck': { name: 'Car & Truck Expenses', code: 'SCH_C_9', deductible: true },
    'commissions': { name: 'Commissions & Fees', code: 'SCH_C_10', deductible: true },
    'contract_labor': { name: 'Contract Labor', code: 'SCH_C_11', deductible: true },
    'depreciation': { name: 'Depreciation', code: 'SCH_C_13', deductible: true },
    'insurance': { name: 'Insurance', code: 'SCH_C_15', deductible: true },
    'interest': { name: 'Interest (Mortgage/Business)', code: 'SCH_C_16a', deductible: true },
    'legal': { name: 'Legal & Professional Services', code: 'SCH_C_17', deductible: true },
    'office_expense': { name: 'Office Expense', code: 'SCH_C_18', deductible: true },
    'rent_lease': { name: 'Rent or Lease', code: 'SCH_C_20a', deductible: true },
    'repairs': { name: 'Repairs & Maintenance', code: 'SCH_C_21', deductible: true },
    'supplies': { name: 'Supplies', code: 'SCH_C_22', deductible: true },
    'taxes_licenses': { name: 'Taxes & Licenses', code: 'SCH_C_23', deductible: true },
    'travel': { name: 'Travel', code: 'SCH_C_24a', deductible: true },
    'meals': { name: 'Meals (50% deductible)', code: 'SCH_C_24b', deductible: true, deductionRate: 0.5 },
    'utilities': { name: 'Utilities', code: 'SCH_C_25', deductible: true },
    'wages': { name: 'Wages', code: 'SCH_C_26', deductible: true },
    'other': { name: 'Other Expenses', code: 'SCH_C_27a', deductible: true },
    'home_office': { name: 'Home Office (Form 8829)', code: 'FORM_8829', deductible: true },
    'non_deductible': { name: 'Personal/Non-Deductible', code: 'PERSONAL', deductible: false }
  },
  
  // UK HMRC Categories
  UK: {
    'cost_of_sales': { name: 'Cost of Sales', code: 'HMRC_COS', deductible: true },
    'construction_costs': { name: 'Construction Industry Costs', code: 'HMRC_CIC', deductible: true },
    'staff_costs': { name: 'Staff Costs', code: 'HMRC_STAFF', deductible: true },
    'travel_subsistence': { name: 'Travel & Subsistence', code: 'HMRC_TRAVEL', deductible: true },
    'premises_costs': { name: 'Premises Costs', code: 'HMRC_PREMISES', deductible: true },
    'repairs': { name: 'Repairs & Renewals', code: 'HMRC_REPAIRS', deductible: true },
    'accountancy': { name: 'Accountancy', code: 'HMRC_ACCT', deductible: true },
    'legal': { name: 'Legal & Professional', code: 'HMRC_LEGAL', deductible: true },
    'advertising': { name: 'Advertising & Marketing', code: 'HMRC_ADV', deductible: true },
    'insurance': { name: 'Insurance', code: 'HMRC_INS', deductible: true },
    'office_costs': { name: 'Office & General Costs', code: 'HMRC_OFFICE', deductible: true },
    'phone_internet': { name: 'Phone & Internet', code: 'HMRC_COMMS', deductible: true },
    'finance_costs': { name: 'Finance Costs', code: 'HMRC_FIN', deductible: true },
    'depreciation': { name: 'Depreciation', code: 'HMRC_DEP', deductible: true },
    'other': { name: 'Other Business Expenses', code: 'HMRC_OTHER', deductible: true },
    'personal': { name: 'Personal/Disallowable', code: 'HMRC_PERSONAL', deductible: false }
  },
  
  // India IT Categories
  IN: {
    'salary': { name: 'Salary & Wages', code: 'IT_SALARY', deductible: true },
    'rent': { name: 'Rent', code: 'IT_RENT', deductible: true },
    'repairs': { name: 'Repairs & Maintenance', code: 'IT_REPAIRS', deductible: true },
    'insurance': { name: 'Insurance', code: 'IT_INSURANCE', deductible: true },
    'depreciation': { name: 'Depreciation', code: 'IT_DEP', deductible: true },
    'interest': { name: 'Interest on Loans', code: 'IT_INTEREST', deductible: true },
    'professional_fees': { name: 'Professional Fees', code: 'IT_PROF', deductible: true },
    'travel': { name: 'Travel & Conveyance', code: 'IT_TRAVEL', deductible: true },
    'communication': { name: 'Communication Costs', code: 'IT_COMM', deductible: true },
    'legal': { name: 'Legal & Consulting', code: 'IT_LEGAL', deductible: true },
    'advertising': { name: 'Advertising & Publicity', code: 'IT_ADV', deductible: true },
    'office': { name: 'Office Expenses', code: 'IT_OFFICE', deductible: true },
    'bad_debts': { name: 'Bad Debts', code: 'IT_BADDEBTS', deductible: true },
    'other': { name: 'Other Business Expenses', code: 'IT_OTHER', deductible: true },
    'personal': { name: 'Personal/Non-Business', code: 'IT_PERSONAL', deductible: false }
  },
  
  // UAE - No income tax but VAT categories
  UAE: {
    'zero_rated': { name: 'Zero-Rated Supplies', code: 'VAT_ZERO', vatRate: 0 },
    'exempt': { name: 'Exempt Supplies', code: 'VAT_EXEMPT', vatRate: 0 },
    'standard': { name: 'Standard Rated (5%)', code: 'VAT_STD', vatRate: 5 },
    'out_of_scope': { name: 'Out of Scope', code: 'VAT_OOS', vatRate: 0 },
    'capital_goods': { name: 'Capital Goods', code: 'VAT_CAPITAL', vatRate: 5 },
    'services': { name: 'Services', code: 'VAT_SERVICES', vatRate: 5 },
    'imports': { name: 'Imports', code: 'VAT_IMPORT', vatRate: 5 },
    'personal': { name: 'Personal/Non-Business', code: 'VAT_PERSONAL', vatRate: 0 }
  }
};

// Initialize tax category system
function initTaxCategories() {
  console.log('💼 Initializing Tax Category System...');
  
  // Add tax category dropdown to expense form
  addTaxCategoryDropdown();
  
  // Setup tax category filter in reports
  setupTaxCategoryFilter();
  
  // Add tax report section
  addTaxReportSection();
}

// Add tax category dropdown to expense form
function addTaxCategoryDropdown() {
  const expenseForm = document.getElementById('expenseForm');
  if (!expenseForm) return;
  
  // Check if already exists
  if (document.getElementById('taxCategorySelect')) return;
  
  // Get user's country for relevant categories
  const userCountry = getUserTaxCountry();
  const categories = TAX_CATEGORIES[userCountry] || TAX_CATEGORIES.US;
  
  const taxCategoryHTML = `
    <div class="input-group" id="taxCategoryGroup" style="display: none;">
      <label for="taxCategorySelect">
        <i class="fas fa-file-invoice"></i> Tax Category
      </label>
      <select id="taxCategorySelect" class="category-select">
        <option value="">Select tax category (optional)</option>
        ${Object.entries(categories).map(([key, cat]) => `
          <option value="${key}">${cat.name}${cat.deductible === false ? ' (Non-deductible)' : ''}</option>
        `).join('')}
      </select>
      <p class="setting-description">For business expense tax reporting</p>
    </div>
  `;
  
  // Insert after expense type selection
  const expenseTypeSelect = document.getElementById('expenseType');
  if (expenseTypeSelect && expenseTypeSelect.parentElement) {
    expenseTypeSelect.parentElement.insertAdjacentHTML('afterend', taxCategoryHTML);
  }
  
  // Show/hide based on expense type
  if (expenseTypeSelect) {
    expenseTypeSelect.addEventListener('change', (e) => {
      const taxGroup = document.getElementById('taxCategoryGroup');
      if (taxGroup) {
        taxGroup.style.display = e.target.value === 'business' ? 'block' : 'none';
      }
    });
  }
}

// Get user's tax country from preferences
function getUserTaxCountry() {
  try {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    // Detect from currency or allow user to set explicitly
    const currency = preferences.currency || 'USD';
    const taxCountry = preferences.taxCountry;
    
    if (taxCountry) return taxCountry;
    
    // Auto-detect from currency
    const currencyToCountry = {
      'USD': 'US',
      'GBP': 'UK',
      'INR': 'IN',
      'AED': 'UAE',
      'SAR': 'UAE', // Similar VAT system
      'EUR': 'UK'   // Use UK as proxy for EU
    };
    
    return currencyToCountry[currency] || 'US';
  } catch (error) {
    return 'US';
  }
}

// Setup tax category filter in analytics
function setupTaxCategoryFilter() {
  // This will be integrated with the reports section
  console.log('Tax category filters ready');
}

// Add tax report section to analytics
function addTaxReportSection() {
  const analyticsModal = document.getElementById('analyticsModal');
  if (!analyticsModal) return;
  
  // Check if already exists
  if (document.getElementById('taxReportSection')) return;
  
  const modalBody = analyticsModal.querySelector('.modal-body');
  if (!modalBody) return;
  
  const taxReportHTML = `
    <div id="taxReportSection" class="analytics-section" style="margin-top: 30px;">
      <div class="section-header">
        <h3><i class="fas fa-file-invoice-dollar"></i> Tax Summary</h3>
        <select id="taxReportYear" class="year-select">
          <option value="${new Date().getFullYear()}">${new Date().getFullYear()}</option>
          <option value="${new Date().getFullYear() - 1}">${new Date().getFullYear() - 1}</option>
        </select>
      </div>
      <div id="taxSummaryContent" class="tax-summary">
        <p style="text-align: center; color: #a0aec0;">Loading tax summary...</p>
      </div>
      <div class="tax-report-actions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
        <button class="btn-secondary" onclick="exportTaxReport()">
          <i class="fas fa-download"></i> Export Tax Report
        </button>
        <button class="btn-secondary" onclick="printTaxReport()">
          <i class="fas fa-print"></i> Print Summary
        </button>
      </div>
    </div>
  `;
  
  modalBody.insertAdjacentHTML('beforeend', taxReportHTML);
  
  // Setup year change listener
  const yearSelect = document.getElementById('taxReportYear');
  if (yearSelect) {
    yearSelect.addEventListener('change', () => generateTaxSummary());
  }
}

// Generate tax summary report
async function generateTaxSummary(year = new Date().getFullYear()) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    // Get all business expenses for the year
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('expense_type', 'business')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const userCountry = getUserTaxCountry();
    const categories = TAX_CATEGORIES[userCountry] || TAX_CATEGORIES.US;
    
    // Group by tax category
    const taxBreakdown = {};
    let totalDeductible = 0;
    let totalNonDeductible = 0;
    
    expenses.forEach(exp => {
      const taxCat = exp.tax_category || 'other';
      const catInfo = categories[taxCat] || categories.other;
      
      if (!taxBreakdown[taxCat]) {
        taxBreakdown[taxCat] = {
          name: catInfo.name,
          code: catInfo.code,
          total: 0,
          count: 0,
          deductible: catInfo.deductible !== false,
          deductionRate: catInfo.deductionRate || 1
        };
      }
      
      taxBreakdown[taxCat].total += exp.amount;
      taxBreakdown[taxCat].count += 1;
      
      const deductibleAmount = exp.amount * (catInfo.deductionRate || 1);
      if (catInfo.deductible !== false) {
        totalDeductible += deductibleAmount;
      } else {
        totalNonDeductible += exp.amount;
      }
    });
    
    // Render tax summary
    renderTaxSummary(taxBreakdown, totalDeductible, totalNonDeductible, year);
    
  } catch (error) {
    console.error('Error generating tax summary:', error);
    const container = document.getElementById('taxSummaryContent');
    if (container) {
      container.innerHTML = '<p style="color: #ef4444;">Error loading tax summary</p>';
    }
  }
}

// Render tax summary UI
function renderTaxSummary(breakdown, totalDeductible, totalNonDeductible, year) {
  const container = document.getElementById('taxSummaryContent');
  if (!container) return;
  
  const currencySymbol = getCurrencySymbolTax();
  const userCountry = getUserTaxCountry();
  
  let html = `
    <div class="tax-summary-header">
      <div class="tax-total-card deductible">
        <div class="tax-label">Total Deductible</div>
        <div class="tax-amount">${currencySymbol}${totalDeductible.toFixed(2)}</div>
      </div>
      <div class="tax-total-card non-deductible">
        <div class="tax-label">Non-Deductible</div>
        <div class="tax-amount">${currencySymbol}${totalNonDeductible.toFixed(2)}</div>
      </div>
      <div class="tax-total-card total">
        <div class="tax-label">Total Business Expenses</div>
        <div class="tax-amount">${currencySymbol}${(totalDeductible + totalNonDeductible).toFixed(2)}</div>
      </div>
    </div>
    
    <div class="tax-breakdown">
      <h4>Breakdown by Category</h4>
      <div class="tax-categories-list">
        ${Object.entries(breakdown).map(([key, cat]) => `
          <div class="tax-category-item ${cat.deductible ? 'deductible' : 'non-deductible'}">
            <div class="tax-cat-info">
              <span class="tax-cat-name">${cat.name}</span>
              <span class="tax-cat-code">${cat.code}</span>
            </div>
            <div class="tax-cat-stats">
              <span class="tax-cat-count">${cat.count} expense${cat.count > 1 ? 's' : ''}</span>
              <span class="tax-cat-amount">${currencySymbol}${cat.total.toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="tax-disclaimer">
      <i class="fas fa-info-circle"></i>
      <p>This is a summary for your records. Consult a tax professional for filing. Tax rules vary by jurisdiction and individual circumstances.</p>
    </div>
  `;
  
  container.innerHTML = html;
}

// Export tax report
window.exportTaxReport = async function() {
  const year = document.getElementById('taxReportYear')?.value || new Date().getFullYear();
  
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('expense_type', 'business')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const userCountry = getUserTaxCountry();
    const categories = TAX_CATEGORIES[userCountry] || TAX_CATEGORIES.US;
    
    // Prepare CSV data
    const csvData = expenses.map(exp => {
      const taxCat = exp.tax_category || 'other';
      const catInfo = categories[taxCat] || categories.other;
      
      return {
        'Date': exp.date,
        'Description': exp.note,
        'Amount': exp.amount,
        'Category': exp.category,
        'Tax Category': catInfo.name,
        'Tax Code': catInfo.code,
        'Deductible': catInfo.deductible !== false ? 'Yes' : 'No',
        'Deduction Rate': (catInfo.deductionRate || 1) * 100 + '%',
        'Location': exp.location || ''
      };
    });
    
    // Convert to CSV
    const csv = Papa.unparse(csvData);
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Report_${year}_${userCountry}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (typeof showNotification === 'function') {
      showNotification(`Tax report exported for ${year}`, 'success');
    }
    
  } catch (error) {
    console.error('Error exporting tax report:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error exporting tax report', 'error');
    }
  }
};

// Print tax report
window.printTaxReport = function() {
  const taxSection = document.getElementById('taxSummaryContent');
  if (!taxSection) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Tax Report - ${new Date().getFullYear()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          .tax-summary-header { display: flex; gap: 20px; margin: 20px 0; }
          .tax-total-card { padding: 15px; border: 2px solid #ddd; border-radius: 8px; flex: 1; }
          .tax-label { font-size: 0.9em; color: #666; margin-bottom: 5px; }
          .tax-amount { font-size: 1.5em; font-weight: bold; color: #333; }
          .tax-category-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          .tax-disclaimer { margin-top: 30px; padding: 15px; background: #f3f4f6; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <h1>Tax Report - ${new Date().getFullYear()}</h1>
        ${taxSection.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

// Helper function
function getCurrencySymbolTax() {
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

// Export for global access
window.taxCategories = {
  init: initTaxCategories,
  generateSummary: generateTaxSummary,
  getCategories: (country) => TAX_CATEGORIES[country] || TAX_CATEGORIES.US,
  getUserCountry: getUserTaxCountry
};
