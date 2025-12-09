// Export Manager Module
// Handles Excel and PDF exports with charts and summaries

let exportData = {
  expenses: [],
  categories: [],
  summary: {},
  dateRange: { start: '', end: '' }
};

// Initialize Export Manager
function initExportManager() {
  const exportBtn = document.getElementById('exportBtn');
  const modal = document.getElementById('exportModal');
  const closeBtn = modal.querySelector('.close');
  const cancelBtn = document.getElementById('exportCancelBtn');
  const excelBtn = document.getElementById('exportExcelBtn');
  const pdfBtn = document.getElementById('exportPDFBtn');

  // Open modal
  exportBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    prepareExportData();
  });

  // Close modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  cancelBtn.addEventListener('click', () => modal.style.display = 'none');

  // Export buttons
  excelBtn.addEventListener('click', exportToExcel);
  pdfBtn.addEventListener('click', exportToPDF);

  // Date range filters
  document.getElementById('exportStartDate').addEventListener('change', updateExportPreview);
  document.getElementById('exportEndDate').addEventListener('change', updateExportPreview);
}

// Prepare data for export
async function prepareExportData() {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Get date range from filters or use all time
    const startDate = document.getElementById('exportStartDate').value || '2020-01-01';
    const endDate = document.getElementById('exportEndDate').value || new Date().toISOString().split('T')[0];

    exportData.dateRange = { start: startDate, end: endDate };

    // Set default dates if empty
    if (!document.getElementById('exportStartDate').value) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      document.getElementById('exportStartDate').value = threeMonthsAgo.toISOString().split('T')[0];
      exportData.dateRange.start = threeMonthsAgo.toISOString().split('T')[0];
    }
    if (!document.getElementById('exportEndDate').value) {
      document.getElementById('exportEndDate').value = endDate;
    }

    // Fetch expenses
    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('*, category:categories(name, icon, color)')
      .eq('user_id', user.id)
      .gte('date', exportData.dateRange.start)
      .lte('date', exportData.dateRange.end)
      .order('date', { ascending: false });

    if (expError) throw expError;

    exportData.expenses = expenses || [];

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (catError) throw catError;

    exportData.categories = categories || [];

    // Calculate summary
    calculateExportSummary();
    updateExportPreview();

  } catch (error) {
    console.error('Error preparing export data:', error);
    alert('Failed to prepare export data: ' + error.message);
  }
}

// Calculate summary statistics
function calculateExportSummary() {
  const expenses = exportData.expenses;
  
  exportData.summary = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
    avgExpense: 0,
    categoryBreakdown: {},
    monthlyTrends: {},
    topExpenses: []
  };

  if (expenses.length > 0) {
    exportData.summary.avgExpense = exportData.summary.totalAmount / expenses.length;
  }

  // Category breakdown
  expenses.forEach(expense => {
    const catName = expense.category?.name || 'Uncategorized';
    if (!exportData.summary.categoryBreakdown[catName]) {
      exportData.summary.categoryBreakdown[catName] = {
        count: 0,
        total: 0,
        icon: expense.category?.icon || '📁',
        color: expense.category?.color || '#667eea'
      };
    }
    exportData.summary.categoryBreakdown[catName].count++;
    exportData.summary.categoryBreakdown[catName].total += parseFloat(expense.amount);
  });

  // Monthly trends
  expenses.forEach(expense => {
    const monthKey = expense.date.substring(0, 7); // YYYY-MM
    if (!exportData.summary.monthlyTrends[monthKey]) {
      exportData.summary.monthlyTrends[monthKey] = { count: 0, total: 0 };
    }
    exportData.summary.monthlyTrends[monthKey].count++;
    exportData.summary.monthlyTrends[monthKey].total += parseFloat(expense.amount);
  });

  // Top 10 expenses
  exportData.summary.topExpenses = [...expenses]
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 10);
}

// Update export preview
function updateExportPreview() {
  prepareExportData();

  const preview = document.getElementById('exportPreview');
  const { totalExpenses, totalAmount, avgExpense, categoryBreakdown } = exportData.summary;

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  preview.innerHTML = `
    <div class="export-stats">
      <div class="export-stat">
        <span class="stat-label">Total Expenses</span>
        <span class="stat-value">${totalExpenses}</span>
      </div>
      <div class="export-stat">
        <span class="stat-label">Total Amount</span>
        <span class="stat-value">₹${totalAmount.toFixed(2)}</span>
      </div>
      <div class="export-stat">
        <span class="stat-label">Average</span>
        <span class="stat-value">₹${avgExpense.toFixed(2)}</span>
      </div>
    </div>
    <div class="export-categories">
      <h4>Top Categories</h4>
      ${topCategories.map(([name, data]) => `
        <div class="export-category-item">
          <span>${data.icon} ${name}</span>
          <span>₹${data.total.toFixed(2)} (${data.count})</span>
        </div>
      `).join('')}
    </div>
  `;
}

// Export to Excel
async function exportToExcel() {
  const btn = document.getElementById('exportExcelBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Excel...';

  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      ['Expense Report Summary'],
      ['Generated on:', new Date().toLocaleDateString()],
      ['Date Range:', `${exportData.dateRange.start} to ${exportData.dateRange.end}`],
      [],
      ['Total Expenses:', exportData.summary.totalExpenses],
      ['Total Amount:', `₹${exportData.summary.totalAmount.toFixed(2)}`],
      ['Average Expense:', `₹${exportData.summary.avgExpense.toFixed(2)}`],
      [],
      ['Category Breakdown:'],
      ['Category', 'Count', 'Amount']
    ];

    Object.entries(exportData.summary.categoryBreakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([name, data]) => {
        summaryData.push([name, data.count, data.total.toFixed(2)]);
      });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Sheet 2: All Expenses
    const expensesData = [
      ['Date', 'Amount', 'Category', 'Description', 'Payment Method']
    ];

    exportData.expenses.forEach(expense => {
      expensesData.push([
        expense.date,
        parseFloat(expense.amount).toFixed(2),
        expense.category?.name || 'Uncategorized',
        expense.note || '',
        expense.payment_method || 'Cash'
      ]);
    });

    const wsExpenses = XLSX.utils.aoa_to_sheet(expensesData);
    wsExpenses['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'All Expenses');

    // Sheet 3: Monthly Trends
    const trendsData = [
      ['Month', 'Expense Count', 'Total Amount', 'Average']
    ];

    Object.entries(exportData.summary.monthlyTrends)
      .sort()
      .forEach(([month, data]) => {
        trendsData.push([
          month,
          data.count,
          data.total.toFixed(2),
          (data.total / data.count).toFixed(2)
        ]);
      });

    const wsTrends = XLSX.utils.aoa_to_sheet(trendsData);
    wsTrends['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsTrends, 'Monthly Trends');

    // Sheet 4: Category Details
    const categoryData = [
      ['Category', 'Total Expenses', 'Total Amount', 'Average', 'Percentage']
    ];

    Object.entries(exportData.summary.categoryBreakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([name, data]) => {
        const percentage = (data.total / exportData.summary.totalAmount * 100).toFixed(1);
        categoryData.push([
          name,
          data.count,
          data.total.toFixed(2),
          (data.total / data.count).toFixed(2),
          `${percentage}%`
        ]);
      });

    const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
    wsCategory['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Analysis');

    // Sheet 5: Top Expenses
    const topExpensesData = [
      ['Date', 'Amount', 'Category', 'Description']
    ];

    exportData.summary.topExpenses.forEach(expense => {
      topExpensesData.push([
        expense.date,
        parseFloat(expense.amount).toFixed(2),
        expense.category?.name || 'Uncategorized',
        expense.note || ''
      ]);
    });

    const wsTop = XLSX.utils.aoa_to_sheet(topExpensesData);
    wsTop['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsTop, 'Top 10 Expenses');

    // Generate file
    const fileName = `Expense_Report_${exportData.dateRange.start}_to_${exportData.dateRange.end}.xlsx`;
    XLSX.writeFile(wb, fileName);

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-excel"></i> Export to Excel';
    showNotification('Excel file downloaded successfully!', 'success');

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-excel"></i> Export to Excel';
    showNotification('Failed to export Excel: ' + error.message, 'error');
  }
}

// Export to PDF
async function exportToPDF() {
  const btn = document.getElementById('exportPDFBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Title
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Expense Report', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
    
    yPos += 5;
    doc.text(`Period: ${exportData.dateRange.start} to ${exportData.dateRange.end}`, margin, yPos);
    
    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const summaryLines = [
      `Total Expenses: ${exportData.summary.totalExpenses}`,
      `Total Amount: ₹${exportData.summary.totalAmount.toFixed(2)}`,
      `Average Expense: ₹${exportData.summary.avgExpense.toFixed(2)}`
    ];

    summaryLines.forEach(line => {
      doc.text(line, margin + 5, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Category Breakdown
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Category Breakdown', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const categories = Object.entries(exportData.summary.categoryBreakdown)
      .sort((a, b) => b[1].total - a[1].total);

    // Create table data
    const categoryTableData = categories.map(([name, data]) => {
      const percentage = (data.total / exportData.summary.totalAmount * 100).toFixed(1);
      return [
        name,
        data.count.toString(),
        `₹${data.total.toFixed(2)}`,
        `${percentage}%`
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['Category', 'Count', 'Amount', 'Percentage']],
      body: categoryTableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Monthly Trends
    doc.setFontSize(14);
    doc.text('Monthly Trends', margin, yPos);
    yPos += 10;

    const monthlyTableData = Object.entries(exportData.summary.monthlyTrends)
      .sort()
      .map(([month, data]) => [
        month,
        data.count.toString(),
        `₹${data.total.toFixed(2)}`,
        `₹${(data.total / data.count).toFixed(2)}`
      ]);

    doc.autoTable({
      startY: yPos,
      head: [['Month', 'Count', 'Total', 'Average']],
      body: monthlyTableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page for top expenses
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Top 10 Expenses
    doc.setFontSize(14);
    doc.text('Top 10 Expenses', margin, yPos);
    yPos += 10;

    const topExpensesTableData = exportData.summary.topExpenses.map(expense => [
      expense.date,
      `₹${parseFloat(expense.amount).toFixed(2)}`,
      expense.category?.name || 'Uncategorized',
      (expense.note || '').substring(0, 40) // Truncate long descriptions
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Amount', 'Category', 'Description']],
      body: topExpensesTableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        3: { cellWidth: 60 }
      }
    });

    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `Expense_Report_${exportData.dateRange.start}_to_${exportData.dateRange.end}.pdf`;
    doc.save(fileName);

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Export to PDF';
    showNotification('PDF file downloaded successfully!', 'success');

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Export to PDF';
    showNotification('Failed to export PDF: ' + error.message, 'error');
  }
}

// Utility function
function showNotification(message, type) {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initExportManager);
