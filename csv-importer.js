// CSV Importer Module
// Handles bank statement CSV imports with column mapping and auto-categorization

let csvData = null;
let csvHeaders = [];
let mappedData = [];
let userCategories = [];

// Initialize CSV Importer
function initCSVImporter() {
  const importBtn = document.getElementById('importCSVBtn');
  const modal = document.getElementById('csvImportModal');
  const closeBtn = modal.querySelector('.close');
  const cancelBtn = document.getElementById('csvCancelBtn');
  const fileInput = document.getElementById('csvFileInput');
  const selectBtn = document.getElementById('csvSelectBtn');
  const uploadArea = document.getElementById('csvUploadArea');
  const removeBtn = document.getElementById('csvRemoveBtn');
  const nextBtn = document.getElementById('csvNextBtn');
  const importExpensesBtn = document.getElementById('csvImportBtn');

  // Open modal
  importBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    resetCSVImporter();
    loadUserCategories();
  });

  // Close modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  cancelBtn.addEventListener('click', () => modal.style.display = 'none');

  // File selection
  selectBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  removeBtn.addEventListener('click', removeFile);

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = 'rgba(102, 126, 234, 0.05)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#cbd5e0';
    uploadArea.style.background = 'transparent';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#cbd5e0';
    uploadArea.style.background = 'transparent';
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  });

  // Next button (Step 1 -> Step 2)
  nextBtn.addEventListener('click', () => {
    if (csvData && csvHeaders.length > 0) {
      showMappingSection();
    }
  });

  // Import button (Step 3)
  importExpensesBtn.addEventListener('click', performImport);

  // Column mapping change handlers
  document.getElementById('csvDateColumn').addEventListener('change', updatePreview);
  document.getElementById('csvAmountColumn').addEventListener('change', handleAmountColumnChange);
  document.getElementById('csvDebitColumn').addEventListener('change', handleAmountColumnChange);
  document.getElementById('csvCreditColumn').addEventListener('change', handleAmountColumnChange);
  document.getElementById('csvDescriptionColumn').addEventListener('change', updatePreview);
  document.getElementById('csvCategoryColumn').addEventListener('change', updatePreview);
  document.getElementById('csvSkipFirstRow').addEventListener('change', updatePreview);
}

// Reset importer state
function resetCSVImporter() {
  csvData = null;
  csvHeaders = [];
  mappedData = [];
  document.getElementById('csvUploadSection').style.display = 'block';
  document.getElementById('csvMappingSection').style.display = 'none';
  document.getElementById('csvPreviewSection').style.display = 'none';
  document.getElementById('csvImportProgress').style.display = 'none';
  document.getElementById('csvFileInfo').style.display = 'none';
  document.getElementById('csvNextBtn').style.display = 'none';
  document.getElementById('csvImportBtn').style.display = 'none';
  document.getElementById('csvFileInput').value = '';
}

// Handle file selection
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
}

// Handle file processing
function handleFile(file) {
  if (!file.name.endsWith('.csv')) {
    alert('Please select a CSV file');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert('File is too large. Maximum size is 10MB');
    return;
  }

  // Show file info
  document.getElementById('csvFileName').textContent = file.name;
  document.getElementById('csvFileInfo').style.display = 'flex';
  document.getElementById('csvUploadArea').style.display = 'none';

  // Parse CSV
  parseCSV(file);
}

// Remove selected file
function removeFile() {
  document.getElementById('csvFileInput').value = '';
  document.getElementById('csvFileInfo').style.display = 'none';
  document.getElementById('csvUploadArea').style.display = 'flex';
  document.getElementById('csvNextBtn').style.display = 'none';
  csvData = null;
  csvHeaders = [];
}

// Parse CSV file using Papa Parse
function parseCSV(file) {
  Papa.parse(file, {
    complete: (results) => {
      if (results.errors.length > 0) {
        console.error('CSV Parse Errors:', results.errors);
        alert('Error parsing CSV file. Please check the file format.');
        return;
      }

      csvData = results.data.filter(row => row.some(cell => cell.trim() !== ''));
      
      if (csvData.length < 2) {
        alert('CSV file appears to be empty or invalid');
        return;
      }

      // First row is likely headers
      csvHeaders = csvData[0].map(h => h.trim());
      
      console.log('CSV Parsed:', csvData.length, 'rows,', csvHeaders.length, 'columns');
      console.log('Headers:', csvHeaders);
      
      // Show next button
      document.getElementById('csvNextBtn').style.display = 'inline-block';
    },
    error: (error) => {
      console.error('CSV Parse Error:', error);
      alert('Failed to parse CSV file');
    }
  });
}

// Show column mapping section
function showMappingSection() {
  document.getElementById('csvUploadSection').style.display = 'none';
  document.getElementById('csvMappingSection').style.display = 'block';
  
  // Populate column dropdowns
  populateColumnDropdowns();
  
  // Auto-detect columns
  autoDetectColumns();
}

// Populate column selection dropdowns
function populateColumnDropdowns() {
  const selects = [
    'csvDateColumn',
    'csvAmountColumn',
    'csvDebitColumn',
    'csvCreditColumn',
    'csvDescriptionColumn',
    'csvCategoryColumn'
  ];

  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    // Keep first option (placeholder)
    select.innerHTML = select.options[0].outerHTML;
    
    csvHeaders.forEach((header, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = header;
      select.appendChild(option);
    });
  });
}

// Auto-detect column mappings
function autoDetectColumns() {
  csvHeaders.forEach((header, index) => {
    const lowerHeader = header.toLowerCase();
    
    // Date detection
    if (lowerHeader.includes('date') || lowerHeader.includes('transaction date')) {
      document.getElementById('csvDateColumn').value = index;
    }
    
    // Amount detection
    if (lowerHeader.includes('amount') && !lowerHeader.includes('debit') && !lowerHeader.includes('credit')) {
      document.getElementById('csvAmountColumn').value = index;
    }
    
    // Debit detection
    if (lowerHeader.includes('debit') || lowerHeader.includes('withdrawal')) {
      document.getElementById('csvDebitColumn').value = index;
    }
    
    // Credit detection
    if (lowerHeader.includes('credit') || lowerHeader.includes('deposit')) {
      document.getElementById('csvCreditColumn').value = index;
    }
    
    // Description detection
    if (lowerHeader.includes('description') || lowerHeader.includes('narration') || 
        lowerHeader.includes('particular') || lowerHeader.includes('details')) {
      document.getElementById('csvDescriptionColumn').value = index;
    }
    
    // Category detection
    if (lowerHeader.includes('category') || lowerHeader.includes('type')) {
      document.getElementById('csvCategoryColumn').value = index;
    }
  });

  // Trigger preview update
  updatePreview();
}

// Handle amount column selection logic
function handleAmountColumnChange() {
  const amountCol = document.getElementById('csvAmountColumn').value;
  const debitCol = document.getElementById('csvDebitColumn').value;
  const creditCol = document.getElementById('csvCreditColumn').value;

  // If amount column is selected, clear debit/credit
  if (amountCol) {
    document.getElementById('csvDebitColumn').value = '';
    document.getElementById('csvCreditColumn').value = '';
  }

  // If debit or credit is selected, clear amount
  if (debitCol || creditCol) {
    document.getElementById('csvAmountColumn').value = '';
  }

  updatePreview();
}

// Update preview section
function updatePreview() {
  const dateCol = parseInt(document.getElementById('csvDateColumn').value);
  const amountCol = parseInt(document.getElementById('csvAmountColumn').value);
  const debitCol = parseInt(document.getElementById('csvDebitColumn').value);
  const creditCol = parseInt(document.getElementById('csvCreditColumn').value);
  const descCol = parseInt(document.getElementById('csvDescriptionColumn').value);
  const categoryCol = parseInt(document.getElementById('csvCategoryColumn').value);
  const skipFirst = document.getElementById('csvSkipFirstRow').checked;

  // Validate required fields
  if (isNaN(dateCol) || isNaN(descCol)) {
    document.getElementById('csvPreviewSection').style.display = 'none';
    document.getElementById('csvImportBtn').style.display = 'none';
    return;
  }

  if (isNaN(amountCol) && (isNaN(debitCol) || isNaN(creditCol))) {
    document.getElementById('csvPreviewSection').style.display = 'none';
    document.getElementById('csvImportBtn').style.display = 'none';
    return;
  }

  // Map data
  const startRow = skipFirst ? 1 : 0;
  mappedData = [];

  for (let i = startRow; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Skip empty rows
    if (row.every(cell => !cell || cell.trim() === '')) continue;

    // Parse date
    const dateFormat = document.getElementById('csvDateFormat').value;
    const dateStr = row[dateCol];
    const parsedDate = parseCSVDate(dateStr, dateFormat);
    
    if (!parsedDate) continue; // Skip invalid dates

    // Parse amount
    let amount = 0;
    if (!isNaN(amountCol)) {
      amount = parseFloat(row[amountCol].replace(/[^0-9.-]/g, '')) || 0;
    } else {
      const debit = parseFloat(row[debitCol]?.replace(/[^0-9.-]/g, '') || 0);
      const credit = parseFloat(row[creditCol]?.replace(/[^0-9.-]/g, '') || 0);
      amount = debit > 0 ? debit : credit;
    }

    if (amount <= 0) continue; // Skip zero or negative amounts

    // Get description
    const description = row[descCol]?.trim() || 'Imported expense';

    // Get or detect category
    let category = null;
    if (!isNaN(categoryCol) && row[categoryCol]) {
      category = row[categoryCol].trim();
    } else {
      category = detectCategory(description);
    }

    mappedData.push({
      date: parsedDate,
      amount: Math.abs(amount),
      description: description,
      category: category
    });
  }

  // Show preview
  if (mappedData.length > 0) {
    displayPreview();
    document.getElementById('csvPreviewSection').style.display = 'block';
    document.getElementById('csvImportBtn').style.display = 'inline-block';
    document.getElementById('csvImportCount').textContent = `(${mappedData.length})`;
  } else {
    document.getElementById('csvPreviewSection').style.display = 'none';
    document.getElementById('csvImportBtn').style.display = 'none';
    alert('No valid expense data found in CSV');
  }
}

// Parse CSV date with format
function parseCSVDate(dateStr, format) {
  if (!dateStr) return null;

  dateStr = dateStr.trim();
  
  try {
    let day, month, year;

    if (format === 'DD/MM/YYYY') {
      [day, month, year] = dateStr.split(/[\/\-\.]/);
    } else if (format === 'MM/DD/YYYY') {
      [month, day, year] = dateStr.split(/[\/\-\.]/);
    } else if (format === 'YYYY-MM-DD') {
      [year, month, day] = dateStr.split(/[\/\-\.]/);
    } else if (format === 'DD-MM-YYYY') {
      [day, month, year] = dateStr.split(/[\/\-\.]/);
    }

    // Handle 2-digit years
    if (year.length === 2) {
      year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    }

    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    
    // Validate date
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date parse error:', dateStr, error);
    return null;
  }
}

// Detect category from description
function detectCategory(description) {
  const desc = description.toLowerCase();

  // Category keywords mapping
  const categoryKeywords = {
    'Food': ['restaurant', 'cafe', 'food', 'grocery', 'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'mcdonald', 'starbucks', 'dunkin'],
    'Transport': ['uber', 'ola', 'lyft', 'cab', 'taxi', 'metro', 'bus', 'train', 'fuel', 'petrol', 'gas', 'parking'],
    'Shopping': ['amazon', 'flipkart', 'walmart', 'target', 'mall', 'shop', 'store', 'online'],
    'Entertainment': ['netflix', 'spotify', 'movie', 'cinema', 'theatre', 'concert', 'game', 'steam', 'xbox', 'playstation'],
    'Bills': ['electricity', 'water', 'internet', 'phone', 'mobile', 'broadband', 'utility', 'bill payment'],
    'Healthcare': ['hospital', 'clinic', 'pharmacy', 'medicine', 'doctor', 'medical', 'health'],
    'Education': ['school', 'college', 'university', 'course', 'tuition', 'book', 'udemy', 'coursera']
  };

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        // Check if user has this category
        const userCategory = userCategories.find(c => c.name === category);
        return userCategory ? category : null;
      }
    }
  }

  return null;
}

// Display preview table
function displayPreview() {
  const stats = document.getElementById('csvStats');
  const table = document.getElementById('csvPreviewTable');
  const thead = document.getElementById('csvPreviewHead');
  const tbody = document.getElementById('csvPreviewBody');

  // Show stats
  const totalAmount = mappedData.reduce((sum, item) => sum + item.amount, 0);
  const categorized = mappedData.filter(item => item.category).length;
  
  stats.innerHTML = `
    <div class="stat-item">
      <strong>${mappedData.length}</strong>
      <span>Expenses</span>
    </div>
    <div class="stat-item">
      <strong>₹${totalAmount.toFixed(2)}</strong>
      <span>Total Amount</span>
    </div>
    <div class="stat-item">
      <strong>${categorized}</strong>
      <span>Auto-categorized</span>
    </div>
  `;

  // Build table header
  thead.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Amount</th>
      <th>Description</th>
      <th>Category</th>
    </tr>
  `;

  // Build table body (show first 10 rows)
  tbody.innerHTML = '';
  const previewCount = Math.min(10, mappedData.length);
  
  for (let i = 0; i < previewCount; i++) {
    const item = mappedData[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.date}</td>
      <td>₹${item.amount.toFixed(2)}</td>
      <td>${item.description}</td>
      <td>${item.category ? `<span class="category-badge">${item.category}</span>` : '<span style="color: #a0aec0;">Uncategorized</span>'}</td>
    `;
    tbody.appendChild(row);
  }

  if (mappedData.length > 10) {
    const moreRow = document.createElement('tr');
    moreRow.innerHTML = `<td colspan="4" style="text-align: center; color: #718096;">... and ${mappedData.length - 10} more expenses</td>`;
    tbody.appendChild(moreRow);
  }
}

// Load user categories
async function loadUserCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user.id);

    if (error) throw error;
    
    userCategories = data || [];
    console.log('Loaded categories for CSV import:', userCategories.length);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Perform bulk import
async function performImport() {
  if (mappedData.length === 0) {
    alert('No data to import');
    return;
  }

  // Show progress
  document.getElementById('csvPreviewSection').style.display = 'none';
  document.getElementById('csvImportProgress').style.display = 'block';
  document.getElementById('csvImportBtn').disabled = true;

  const progressBar = document.getElementById('csvProgressBar');
  const progressText = document.getElementById('csvProgressText');

  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    // Prepare expenses for bulk insert
    const expenses = [];
    
    for (let i = 0; i < mappedData.length; i++) {
      const item = mappedData[i];
      
      // Find category ID
      let categoryId = null;
      if (item.category) {
        const category = userCategories.find(c => c.name === item.category);
        categoryId = category ? category.id : null;
      }

      expenses.push({
        user_id: user.id,
        amount: item.amount,
        category_id: categoryId,
        note: item.description,
        date: item.date,
        created_at: new Date().toISOString()
      });

      // Update progress
      const progress = ((i + 1) / mappedData.length) * 100;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `Importing ${i + 1} of ${mappedData.length} expenses...`;
    }

    // Bulk insert (Supabase supports up to 1000 rows per insert)
    const batchSize = 500;
    for (let i = 0; i < expenses.length; i += batchSize) {
      const batch = expenses.slice(i, i + batchSize);
      const { error } = await supabase
        .from('expenses')
        .insert(batch);

      if (error) throw error;
    }

    // Success
    progressText.innerHTML = `<i class="fas fa-check-circle" style="color: #48bb78;"></i> Successfully imported ${mappedData.length} expenses!`;
    
    // Reload expenses in main app
    setTimeout(() => {
      document.getElementById('csvImportModal').style.display = 'none';
      if (window.loadExpenses) {
        window.loadExpenses();
      }
      location.reload(); // Reload to update all data
    }, 2000);

  } catch (error) {
    console.error('Import error:', error);
    progressText.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f56565;"></i> Import failed: ${error.message}`;
    document.getElementById('csvImportBtn').disabled = false;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initCSVImporter);
