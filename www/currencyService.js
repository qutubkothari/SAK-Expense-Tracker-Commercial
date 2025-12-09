// Currency Converter Service

class CurrencyConverter {
  constructor(supabase) {
    this.supabase = supabase;
    this.rates = {};
    this.baseCurrency = 'INR';
  }

  // Load exchange rates from database
  async loadRates() {
    const { data, error } = await this.supabase
      .from('exchange_rates')
      .select('*');
    
    if (!error && data) {
      data.forEach(rate => {
        const key = `${rate.from_currency}_${rate.to_currency}`;
        this.rates[key] = rate.rate;
        this.lastUpdated = rate.updated_at;
      });
      console.log('Loaded exchange rates:', this.rates);
      
      // Auto-update if rates are older than 24 hours
      if (this.needsUpdate()) {
        console.log('Exchange rates are outdated, fetching latest...');
        setTimeout(() => this.fetchLiveRates(), 2000); // Delay to not block initial load
      }
    } else if (!data || data.length === 0) {
      console.log('No exchange rates found, fetching from API...');
      setTimeout(() => this.fetchLiveRates(), 2000);
    }
    
    return this.rates;
  }

  // Check if rates need updating (older than 24 hours)
  needsUpdate() {
    if (!this.lastUpdated) return true;
    
    const lastUpdate = new Date(this.lastUpdated);
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceUpdate > 24;
  }

  // Convert amount to INR
  convertToINR(amount, fromCurrency) {
    if (fromCurrency === 'INR') return amount;
    
    const key = `${fromCurrency}_INR`;
    const rate = this.rates[key];
    
    if (!rate) {
      console.warn(`No exchange rate found for ${fromCurrency} to INR, using 1:1`);
      return amount;
    }
    
    return amount * rate;
  }

  // Get exchange rate
  getRate(fromCurrency, toCurrency = 'INR') {
    if (fromCurrency === toCurrency) return 1.0;
    
    const key = `${fromCurrency}_${toCurrency}`;
    return this.rates[key] || 1.0;
  }

  // Update exchange rate in database
  async updateRate(fromCurrency, toCurrency, rate) {
    const { error } = await this.supabase
      .from('exchange_rates')
      .upsert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: rate,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'from_currency,to_currency'
      });
    
    if (!error) {
      const key = `${fromCurrency}_${toCurrency}`;
      this.rates[key] = rate;
      console.log(`Updated rate ${fromCurrency}→${toCurrency}: ${rate}`);
    }
    
    return !error;
  }

  // Fetch live rates from API (optional - can be called manually)
  async fetchLiveRates() {
    try {
      // Using exchangerate-api.com free tier
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      const data = await response.json();
      
      if (data && data.rates) {
        // Convert rates to "X to INR" format
        const currencies = ['AED', 'USD', 'EUR', 'GBP', 'SGD'];
        
        for (const currency of currencies) {
          if (data.rates[currency]) {
            // Since API gives INR to X, we need X to INR
            const rate = 1 / data.rates[currency];
            await this.updateRate(currency, 'INR', rate);
          }
        }
        
        console.log('Live rates updated successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to fetch live rates:', error);
      return false;
    }
  }

  // Detect currency from location keywords
  detectCurrency(text) {
    const lowerText = text.toLowerCase();
    
    const currencyMap = {
      'dubai': 'AED',
      'uae': 'AED',
      'emirates': 'AED',
      'usa': 'USD',
      'america': 'USD',
      'dollar': 'USD',
      'uk': 'GBP',
      'london': 'GBP',
      'pound': 'GBP',
      'singapore': 'SGD',
      'euro': 'EUR',
      'europe': 'EUR',
      'germany': 'EUR',
      'france': 'EUR'
    };
    
    for (const [keyword, currency] of Object.entries(currencyMap)) {
      if (lowerText.includes(keyword)) {
        return { currency, keyword };
      }
    }
    
    return { currency: 'INR', keyword: null };
  }

  // Detect expense type from keywords
  detectExpenseType(text) {
    const lowerText = text.toLowerCase();
    
    // Business keywords - including ecommerce and common mishearings
    const businessKeywords = [
      'business', 'work', 'office', 'client', 'meeting', 'project',
      'ecommerce', 'e-commerce', 'commerce', 'online business', 'sale', 'sales',
      'amazon', 'flipkart', 'meesho', 'shop', 'seller', 'store',
      'perfekt', 'perfect', 'scale', 'scaling'  // Common mishearings
    ];
    
    for (const keyword of businessKeywords) {
      if (lowerText.includes(keyword)) {
        return 'business';
      }
    }
    
    // Travel keywords - includes hotels, flights, tours, etc.
    const travelKeywords = [
      'travel', 'trip', 'vacation', 'tour', 'holiday',
      'hotel', 'motel', 'resort', 'accommodation', 'stay', 'booking',
      'flight', 'airplane', 'airline', 'airport', 'ticket',
      'oyo', 'airbnb', 'goibibo', 'makemytrip', 'yatra'
    ];
    
    for (const keyword of travelKeywords) {
      if (lowerText.includes(keyword)) {
        return 'travel';
      }
    }
    
    return 'personal';
  }

  // Set base currency for conversions
  setBaseCurrency(currency) {
    this.baseCurrency = currency;
    console.log('Base currency set to:', currency);
  }

  // Format currency display
  formatAmount(amount, currency) {
    const symbols = {
      'INR': '₹',
      'AED': 'AED ',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'SGD': 'S$'
    };
    
    const symbol = symbols[currency] || currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
  }
}

// Make CurrencyConverter available globally
window.CurrencyConverter = CurrencyConverter;
