// AI Insights Service - Smart analytics and predictions

class AIInsightsService {
  constructor(supabase, userId) {
    this.supabase = supabase;
    this.userId = userId;
  }

  // Analyze spending patterns
  async analyzeSpendingPatterns(expenses) {
    const insights = [];
    
    // Group by day of week
    const dayPattern = this.analyzeDayOfWeekPattern(expenses);
    if (dayPattern.insight) insights.push(dayPattern.insight);
    
    // Analyze category trends
    const categoryTrends = this.analyzeCategoryTrends(expenses);
    insights.push(...categoryTrends);
    
    // Detect anomalies
    const anomalies = this.detectAnomalies(expenses);
    insights.push(...anomalies);
    
    // Weekend vs weekday analysis
    const weekendPattern = this.analyzeWeekendSpending(expenses);
    if (weekendPattern) insights.push(weekendPattern);
    
    return insights;
  }

  // Analyze day of week spending patterns
  analyzeDayOfWeekPattern(expenses) {
    const dayTotals = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    expenses.forEach(exp => {
      const day = new Date(exp.date).getDay();
      dayTotals[day] = (dayTotals[day] || 0) + parseFloat(exp.amount);
    });
    
    const maxDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
    if (maxDay && maxDay[1] > 0) {
      const avgDay = Object.values(dayTotals).reduce((a, b) => a + b, 0) / Object.keys(dayTotals).length;
      
      if (maxDay[1] > avgDay * 1.5) {
        return {
          insight: {
            type: 'pattern',
            title: `Peak spending on ${dayNames[maxDay[0]]}s`,
            description: `You spend ${((maxDay[1] / avgDay - 1) * 100).toFixed(0)}% more on ${dayNames[maxDay[0]]}s compared to other days.`,
            severity: 'info',
            icon: '📊'
          }
        };
      }
    }
    return {};
  }

  // Analyze category spending trends
  analyzeCategoryTrends(expenses) {
    const insights = [];
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Split expenses by month
    const lastMonthExp = expenses.filter(e => {
      const date = new Date(e.date);
      return date >= lastMonth && date < thisMonth;
    });
    
    const thisMonthExp = expenses.filter(e => new Date(e.date) >= thisMonth);
    
    // Compare categories
    const lastMonthByCategory = this.groupByCategory(lastMonthExp);
    const thisMonthByCategory = this.groupByCategory(thisMonthExp);
    
    Object.keys(thisMonthByCategory).forEach(category => {
      const currentSpend = thisMonthByCategory[category];
      const lastSpend = lastMonthByCategory[category] || 0;
      
      if (lastSpend > 0) {
        const percentChange = ((currentSpend - lastSpend) / lastSpend) * 100;
        
        if (Math.abs(percentChange) > 30) {
          insights.push({
            type: 'trend',
            title: `${category} spending ${percentChange > 0 ? 'increased' : 'decreased'}`,
            description: `${Math.abs(percentChange).toFixed(0)}% ${percentChange > 0 ? 'increase' : 'decrease'} from last month (₹${lastSpend.toFixed(0)} → ₹${currentSpend.toFixed(0)})`,
            severity: percentChange > 50 ? 'warning' : 'info',
            icon: percentChange > 0 ? '📈' : '📉',
            category
          });
        }
      }
    });
    
    return insights;
  }

  // Detect spending anomalies
  detectAnomalies(expenses) {
    const insights = [];
    const categoryStats = {};
    
    // Calculate mean and standard deviation per category
    expenses.forEach(exp => {
      const cat = exp.category?.name || 'Unknown';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { amounts: [], total: 0, count: 0 };
      }
      const amount = parseFloat(exp.amount);
      categoryStats[cat].amounts.push(amount);
      categoryStats[cat].total += amount;
      categoryStats[cat].count++;
    });
    
    // Find anomalies (expenses > 2 standard deviations)
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.count < 3) return; // Need enough data
      
      const mean = stats.total / stats.count;
      const variance = stats.amounts.reduce((sum, amount) => 
        sum + Math.pow(amount - mean, 2), 0) / stats.count;
      const stdDev = Math.sqrt(variance);
      
      stats.amounts.forEach((amount, idx) => {
        if (amount > mean + 2 * stdDev) {
          insights.push({
            type: 'anomaly',
            title: `Unusual ${category} expense detected`,
            description: `₹${amount.toFixed(0)} is ${((amount / mean - 1) * 100).toFixed(0)}% above your average of ₹${mean.toFixed(0)}`,
            severity: 'warning',
            icon: '⚠️',
            category
          });
        }
      });
    });
    
    return insights.slice(0, 3); // Limit to 3 anomalies
  }

  // Weekend vs weekday spending
  analyzeWeekendSpending(expenses) {
    let weekdayTotal = 0, weekendTotal = 0;
    let weekdayCount = 0, weekendCount = 0;
    
    expenses.forEach(exp => {
      const day = new Date(exp.date).getDay();
      const amount = parseFloat(exp.amount);
      
      if (day === 0 || day === 6) {
        weekendTotal += amount;
        weekendCount++;
      } else {
        weekdayTotal += amount;
        weekdayCount++;
      }
    });
    
    if (weekendCount > 0 && weekdayCount > 0) {
      const weekdayAvg = weekdayTotal / weekdayCount;
      const weekendAvg = weekendTotal / weekendCount;
      
      if (weekendAvg > weekdayAvg * 1.3) {
        return {
          type: 'pattern',
          title: 'Higher weekend spending',
          description: `You spend ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% more per day on weekends (₹${weekendAvg.toFixed(0)} vs ₹${weekdayAvg.toFixed(0)})`,
          severity: 'info',
          icon: '🎉'
        };
      }
    }
    
    return null;
  }

  // Predict next month's spending
  async predictNextMonth(expenses) {
    const predictions = {};
    const categoryGroups = this.groupByCategory(expenses);
    
    Object.entries(categoryGroups).forEach(([category, total]) => {
      // Simple moving average prediction
      const recentMonths = this.getRecentMonthlySpending(expenses, category, 3);
      if (recentMonths.length > 0) {
        const avg = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length;
        const trend = this.calculateTrend(recentMonths);
        const predicted = avg * (1 + trend);
        
        predictions[category] = {
          amount: predicted,
          confidence: Math.min(1, recentMonths.length / 3), // Higher confidence with more data
          trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
        };
      }
    });
    
    return predictions;
  }

  // Detect recurring expenses
  detectRecurringExpenses(expenses) {
    const recurring = [];
    const vendors = {};
    
    // Group by vendor/note
    expenses.forEach(exp => {
      const key = (exp.note || '').toLowerCase().trim();
      if (!key || key.length < 3) return;
      
      if (!vendors[key]) {
        vendors[key] = [];
      }
      vendors[key].push({
        date: new Date(exp.date),
        amount: parseFloat(exp.amount),
        category: exp.category?.name
      });
    });
    
    // Analyze patterns
    Object.entries(vendors).forEach(([vendor, transactions]) => {
      if (transactions.length < 3) return;
      
      // Sort by date
      transactions.sort((a, b) => a.date - b.date);
      
      // Calculate day intervals
      const intervals = [];
      for (let i = 1; i < transactions.length; i++) {
        const days = Math.round((transactions[i].date - transactions[i-1].date) / (1000 * 60 * 60 * 24));
        intervals.push(days);
      }
      
      // Check if intervals are consistent
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, int) => sum + Math.pow(int - avgInterval, 2), 0) / intervals.length;
      
      // If variance is low, it's likely recurring
      if (variance < avgInterval * 0.2 && avgInterval > 7) {
        const avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
        let frequency = 'monthly';
        
        if (avgInterval < 10) frequency = 'weekly';
        else if (avgInterval > 25 && avgInterval < 35) frequency = 'monthly';
        else if (avgInterval > 85 && avgInterval < 95) frequency = 'quarterly';
        else if (avgInterval > 350) frequency = 'yearly';
        
        recurring.push({
          vendor,
          frequency,
          avgAmount: avgAmount.toFixed(2),
          nextDue: new Date(transactions[transactions.length - 1].date.getTime() + avgInterval * 24 * 60 * 60 * 1000),
          category: transactions[0].category,
          confidence: Math.min(1, transactions.length / 5)
        });
      }
    });
    
    return recurring;
  }

  // Helper: Group expenses by category
  groupByCategory(expenses) {
    const groups = {};
    expenses.forEach(exp => {
      const cat = exp.category?.name || 'Unknown';
      groups[cat] = (groups[cat] || 0) + parseFloat(exp.amount);
    });
    return groups;
  }

  // Helper: Get recent monthly spending for a category
  getRecentMonthlySpending(expenses, category, months) {
    const monthlyTotals = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthExpenses = expenses.filter(exp => {
        const date = new Date(exp.date);
        return date >= monthStart && date <= monthEnd && 
               (exp.category?.name || 'Unknown') === category;
      });
      
      const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      monthlyTotals.push(total);
    }
    
    return monthlyTotals;
  }

  // Helper: Calculate trend (-1 to 1)
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (firstAvg === 0) return 0;
    return (secondAvg - firstAvg) / firstAvg;
  }

  // Auto-categorize based on patterns
  async suggestCategory(note) {
    // Check expense patterns
    const { data } = await this.supabase
      .from('expense_patterns')
      .select('category_id, subcategory_id, confidence')
      .eq('user_id', this.userId)
      .ilike('vendor_name', `%${note}%`)
      .order('confidence', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      return data[0];
    }
    
    return null;
  }

  // Save learning data
  async learnFromExpense(note, categoryId, subcategoryId) {
    if (!note || typeof note !== 'string' || note.length < 3) return;
    
    const vendorName = note.toLowerCase().trim();
    
    // Upsert pattern
    const { data, error } = await this.supabase
      .from('expense_patterns')
      .upsert({
        user_id: this.userId,
        vendor_name: vendorName,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id,vendor_name',
        ignoreDuplicates: false
      })
      .select();
    
    // Increment frequency if exists
    if (data && data.length > 0) {
      await this.supabase
        .from('expense_patterns')
        .update({ 
          frequency: data[0].frequency + 1,
          confidence: Math.min(1, data[0].confidence + 0.1)
        })
        .eq('id', data[0].id);
    }
  }
}

// Make AIInsightsService available globally
window.AIInsightsService = AIInsightsService;
