// supabase is loaded globally from supabaseClient.js
import { login, register } from "./auth.js";
// AIInsightsService and CurrencyConverter are loaded via window globals from aiService.js and currencyService.js
// Mobile Debug Console
let debugLog = [];
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  debugLog.push({ type: 'log', message: args.join(' '), time: new Date().toLocaleTimeString() });
  updateDebugConsole();
};
console.error = function(...args) {
  originalConsoleError.apply(console, args);
  debugLog.push({ type: 'error', message: args.join(' '), time: new Date().toLocaleTimeString() });
  updateDebugConsole();
};
function updateDebugConsole() {
  const debugDiv = document.getElementById('debugLog');
  if (debugDiv) {
    debugDiv.innerHTML = debugLog.slice(-20).map(log => 
      `<div style="color: ${log.type === 'error' ? '#ff5555' : '#0f0'};">[${log.time}] ${log.message}</div>`
    ).join('');
  }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  // Note: AI Voice (Whisper) auto-detects language. This is only for fallback browser recognition.
  // You can change this to: 'ar-AE' (Arabic), 'hi-IN' (Hindi), 'ur-PK' (Urdu), 'gu-IN' (Gujarati), 'fr-FR' (French)
  recognition.lang = 'en-IN'; // Default: Indian English
  recognition.continuous = false;
  recognition.interimResults = true; // Get interim results to capture more
  recognition.maxAlternatives = 5; // Get more alternatives for better matching
}
let user = JSON.parse(localStorage.getItem("user"));
window.currentUser = user; // Make user globally available

// 🔄 MIGRATION: Fix legacy users with missing currency preferences
// If user exists but has no default_currency, fetch from database
if (user && !user.default_currency) {
  console.warn('⚠️ Legacy user detected - missing currency preferences, fetching from database...');
  (async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('default_currency, default_language, language_name')
        .eq('id', user.id)
        .single();
      
      if (data && data.default_currency) {
        console.log('✅ Updated user preferences from database:', data);
        user.default_currency = data.default_currency;
        user.default_language = data.default_language || 'en';
        user.language_name = data.language_name || 'English';
        localStorage.setItem('user', JSON.stringify(user));
        window.currentUser = user;
        location.reload(); // Reload to apply changes
      } else {
        console.warn('⚠️ User preferences not found in database, using defaults');
      }
    } catch (err) {
      console.error('❌ Failed to fetch user preferences:', err);
    }
  })();
}

// ⚠️ UNIVERSAL APP CONFIGURATION - NO HARDCODED VALUES
// Global default fallback if user has no preferences set (e.g., first-time users)
const GLOBAL_DEFAULT_CURRENCY = 'USD'; // Only used for brand new users without preferences
const GLOBAL_DEFAULT_LANGUAGE = 'en'; // Only used for brand new users without preferences

// Helper function to get user's currency with universal fallback
const getUserCurrency = () => user?.default_currency || GLOBAL_DEFAULT_CURRENCY;
// Helper function to get user's language with universal fallback  
const getUserLanguage = () => user?.default_language || GLOBAL_DEFAULT_LANGUAGE;

let isAdmin = false; // Admin flag
let allUsers = []; // Store all users for admin view
let adminViewMode = 'consolidated'; // 'consolidated' or 'individual'
let selectedUserId = null; // For individual user view
let categories = [];
let subcategories = [];
let expenses = [];
window.expenses = expenses; // Make expenses globally available for budget manager
let currentFilters = {};
let editingExpenseId = null;
let isRecognizing = false;
let aiService = null;
let currencyConverter = null;
let voiceIntelligence = null; // Traditional voice matching
let voiceAI = null; // New: AI-powered voice (Whisper + GPT-4)
let insights = [];
let recurringExpenses = [];
let predictions = {};
// Initialize app
if (!user) {
  document.getElementById("appSection").style.display = "none";
  document.getElementById("authSection").style.display = "block";
} else {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  checkAdminStatus();
  init();
}
async function init() {
  console.log("Initializing app...");
  try {
    console.log("Loading categories...");
    await loadCategories();
    console.log("Categories loaded:", categories.length);
    
    console.log("Loading expenses...");
    await loadExpenses();
    console.log("Expenses loaded:", expenses.length);
    
    console.log("Initializing AI service...");
    aiService = new window.AIInsightsService(supabase, user.id);
    
    // Initialize AI Voice if VoiceAI class is available
    if (window.VoiceAI) {
      // API key should be configured via user settings
      const OPENAI_API_KEY = localStorage.getItem('openai_api_key') || '';
      
      if (OPENAI_API_KEY && OPENAI_API_KEY.length > 10) {
        voiceAI = new window.VoiceAI(OPENAI_API_KEY);
        console.log('🤖 AI Voice initialized (Whisper + GPT-4)');
      } else {
        console.log('⚠️ OpenAI API key not configured, using traditional voice recognition');
      }
    }
    
    console.log("Initializing currency converter...");
    // Initialize with user's base currency
    const userBaseCurrency = getUserCurrency();
    currencyConverter = new window.CurrencyConverter(supabase, userBaseCurrency);
    await currencyConverter.loadRates();
    console.log(`Currency converter initialized with base: ${userBaseCurrency}`);
    
    console.log("Analyzing spending patterns...");
    await analyzeSpendingPatterns();
    
    console.log("Detecting recurring expenses...");
    await detectRecurring();
    
    console.log("Rendering all...");
    renderAll();
    
    console.log("Rendering admin panel if admin...");
    if (isAdmin) {
      showAdminPanel();
    }
    
    console.log("Setting up event handlers...");
    setupEventHandlers();
    
    console.log("Setting default date to today...");
    setDefaultDate();
    
    console.log("Loading user preferences...");
    loadUserPreferences();
    
    // Setup pull-to-refresh for mobile
    setupPullToRefresh();
    
    console.log("App initialization complete!");
  } catch (error) {
    console.error("Error during init:", error);
    alert("Failed to initialize app: " + error.message);
  }
}

// Pull-to-refresh functionality for mobile
async function setupPullToRefresh() {
  try {
    // Check if Capacitor is available (mobile app)
    if (window.Capacitor && window.Capacitor.Plugins) {
      console.log('📱 Setting up pull-to-refresh for mobile');
      
      // Add listener for pull-to-refresh gesture
      let startY = 0;
      let isPulling = false;
      const pullThreshold = 80;
      
      const appSection = document.getElementById('appSection');
      if (appSection) {
        appSection.addEventListener('touchstart', (e) => {
          if (appSection.scrollTop === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
          }
        });
        
        appSection.addEventListener('touchmove', (e) => {
          if (isPulling) {
            const currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > pullThreshold) {
              // Show refresh indicator
              const header = document.querySelector('header');
              if (header && !header.classList.contains('refreshing')) {
                header.style.opacity = '0.7';
              }
            }
          }
        });
        
        appSection.addEventListener('touchend', async (e) => {
          if (isPulling) {
            const endY = e.changedTouches[0].clientY;
            const pullDistance = endY - startY;
            
            if (pullDistance > pullThreshold) {
              // Trigger refresh
              console.log('🔄 Pull-to-refresh triggered');
              const header = document.querySelector('header');
              if (header) {
                header.classList.add('refreshing');
                header.style.opacity = '1';
              }
              
              await refreshData();
              
              if (header) {
                header.classList.remove('refreshing');
              }
            } else {
              // Reset visual feedback
              const header = document.querySelector('header');
              if (header) {
                header.style.opacity = '1';
              }
            }
            
            isPulling = false;
            startY = 0;
          }
        });
      }
    }
  } catch (error) {
    console.error('Error setting up pull-to-refresh:', error);
  }
}

// Refresh data function
async function refreshData() {
  try {
    console.log('🔄 Refreshing data...');
    await loadExpenses();
    await loadCategories();
    console.log('✅ Data refreshed successfully');
    
    // Show brief success message
    const header = document.querySelector('header h1');
    if (header) {
      const originalText = header.textContent;
      header.textContent = '✓ Refreshed';
      setTimeout(() => {
        header.textContent = originalText;
      }, 1500);
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
}

// Set today's date as default in date inputs
function setDefaultDate() {
  // For datetime-local input, we need full ISO string without 'Z' and seconds
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  const dateInput = document.getElementById("dateInput");
  if (dateInput && !dateInput.value) {
    dateInput.value = datetimeLocal;
  }
  
  // Initialize filter date inputs with default values (current month)
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const filterDateFrom = document.getElementById("filterDateFrom");
  const filterDateTo = document.getElementById("filterDateTo");
  
  // Restore last selected project from localStorage
  const projectSelect = document.getElementById("projectSelect");
  if (projectSelect) {
    const lastProject = localStorage.getItem('lastSelectedProject');
    if (lastProject) {
      projectSelect.value = lastProject;
    }
  }

  if (filterDateFrom && !filterDateFrom.value) {
    filterDateFrom.value = firstDayOfMonth;
  }
  if (filterDateTo && !filterDateTo.value) {
    filterDateTo.value = today;
  }
}

// Load user preferences and apply them
function loadUserPreferences() {
  if (!user) return;
  
  console.log('Loading user preferences:', user);
  
  // Set currency select default
  const currencySelect = document.getElementById("currencySelect");
  if (currencySelect && user.default_currency) {
    currencySelect.value = user.default_currency;
    console.log('✅ Default currency set to:', user.default_currency);
  }
  
  // Update currency converter base currency
  if (currencyConverter && user.default_currency) {
    currencyConverter.setBaseCurrency(user.default_currency);
    console.log('✅ Currency converter base set to:', user.default_currency);
  }
  
  // Load preferences into settings modal
  const userDefaultCurrency = document.getElementById("userDefaultCurrency");
  const userDefaultLanguage = document.getElementById("userDefaultLanguage");
  
  if (userDefaultCurrency && user.default_currency) {
    userDefaultCurrency.value = user.default_currency;
  }
  
  if (userDefaultLanguage && user.default_language && user.language_name) {
    userDefaultLanguage.value = `${user.default_language}|${user.language_name}`;
  }
}

// Save user preferences
async function saveUserPreferences() {
  if (!user) return;
  
  const currency = document.getElementById("userDefaultCurrency").value;
  const languageValue = document.getElementById("userDefaultLanguage").value;
  const [languageCode, languageName] = languageValue.split('|');
  
  console.log('Saving preferences:', { currency, languageCode, languageName });
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        default_currency: currency,
        default_language: languageCode,
        language_name: languageName
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update local storage
    user.default_currency = currency;
    user.default_language = languageCode;
    user.language_name = languageName;
    localStorage.setItem("user", JSON.stringify(user));
    window.currentUser = user;
    
    // Update currency converter base currency
    if (currencyConverter) {
      currencyConverter.setBaseCurrency(currency);
      console.log('✅ Currency converter base updated to:', currency);
    }
    
    // Apply new currency default
    const currencySelect = document.getElementById("currencySelect");
    if (currencySelect) {
      currencySelect.value = currency;
    }
    
    alert(`✅ Preferences saved!\n\nDefault Currency: ${currency}\nDefault Language: ${languageName}`);
    console.log('✅ Preferences updated:', data);
  } catch (error) {
    console.error('Error saving preferences:', error);
    alert('Error saving preferences: ' + error.message);
  }
}

// Initialize Voice Intelligence with category keywords
function initVoiceIntelligence(categoryKeywords) {
  if (window.VoiceIntelligence) {
    voiceIntelligence = new window.VoiceIntelligence();
    voiceIntelligence.loadDictionary(categoryKeywords);
  }
}
function setupEventHandlers() {
  // Save preferences button
  const savePreferencesBtn = document.getElementById("savePreferencesBtn");
  if (savePreferencesBtn) {
    savePreferencesBtn.onclick = saveUserPreferences;
  }
  
  // Category change handlers
  document.getElementById("categorySelect").onchange = function() {
    populateSubcategorySelect(this.value, document.getElementById("subcategorySelect"));
  };
  document.getElementById("filterCategory").onchange = function() {
    populateSubcategorySelect(this.value, document.getElementById("filterSubcategory"));
  };
  document.getElementById("editCategory").onchange = function() {
    populateSubcategorySelect(this.value, document.getElementById("editSubcategory"));
  };
  // Add expense
  document.getElementById("addBtn").onclick = addExpense;
  // Voice input
  if (recognition || voiceAI) {
    document.getElementById("voiceBtn").onclick = async () => {
      if (isRecognizing) {
        console.log("Recognition already in progress");
        return;
      }
      
      const voiceBtn = document.getElementById("voiceBtn");
      
      // Try AI voice first if available
      if (voiceAI) {
        try {
          isRecognizing = true;
          
          // Get user's preferred language for better recognition
          const userLanguage = getUserLanguage();
          const userLanguageName = user?.language_name || 'English';
          console.log(`🗣️ Using user's preferred language: ${userLanguageName} (${userLanguage})`);
          
          // Get user's default currency
          const userDefaultCurrency = getUserCurrency();
          console.log('═══════════════════════════════════════');
          console.log('🎙️ VOICE AI - CURRENCY DEBUG INFO');
          console.log('═══════════════════════════════════════');
          console.log('� User object:', user);
          console.log('💰 user.default_currency:', user?.default_currency);
          console.log('💵 getUserCurrency() result:', userDefaultCurrency);
          console.log('🌐 GLOBAL_DEFAULT_CURRENCY:', GLOBAL_DEFAULT_CURRENCY);
          console.log('═══════════════════════════════════════');
          
          const result = await voiceAI.processVoiceInput(categories, (status) => {
            voiceBtn.textContent = status;
            if (status.includes('Recording')) {
              voiceBtn.style.background = "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)";
            }
          }, userLanguage, userDefaultCurrency);
          
          console.log('🤖 AI Voice Result:', result);
          
          // Apply expense data from AI
          await applyAIVoiceResult(result);
          
        } catch (error) {
          console.error('AI voice error:', error);
          alert(error.message || 'Voice input failed. Please try again.');
        } finally {
          isRecognizing = false;
          voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Voice';
          voiceBtn.style.background = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
        }
        return;
      }
      
      // Fallback to traditional speech recognition
      if (!recognition) {
        alert("Voice recognition is not supported in your browser.");
        return;
      }
      
      try {
        console.log("Preparing voice recognition...");
        
        // Show "Get Ready" message
        voiceBtn.textContent = "🎤 Get Ready...";
        voiceBtn.style.background = "linear-gradient(135deg, #ffd166 0%, #f5576c 100%)";
        
        // Wait 1200ms (1.2 seconds) before starting recognition to ensure mic is fully active
        setTimeout(() => {
          console.log("Starting voice recognition...");
          isRecognizing = true;
          recognition.start();
          voiceBtn.textContent = "🎤 Listening...";
          voiceBtn.style.background = "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)";
        }, 1200);
      } catch (error) {
        console.error("Error starting recognition:", error);
        isRecognizing = false;
        alert("Error starting voice recognition: " + error.message);
      }
    };
    
    recognition.onstart = () => {
      console.log("Voice recognition started");
      isRecognizing = true;
    };
    
    recognition.onend = () => {
      console.log("Voice recognition ended");
      isRecognizing = false;
      document.getElementById("voiceBtn").innerHTML = '<i class="fas fa-microphone"></i> Voice';
      document.getElementById("voiceBtn").style.background = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    };
    
    recognition.onresult = async (event) => {
      // Get the latest result
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      
      // Only process if it's a final result
      if (!result.isFinal) {
        console.log("Interim result (waiting for final):", result[0].transcript);
        return;
      }
      
      // Log all alternatives for debugging
      console.log("Voice alternatives received:");
      for (let i = 0; i < result.length; i++) {
        console.log(`  ${i + 1}. "${result[i].transcript}" (confidence: ${result[i].confidence})`);
      }
      
      // Smart alternative selection - prefer alternatives with known keywords
      const knownKeywords = [
        // Grocery apps
        'zepto', 'blinkit', 'instamart', 'dunzo', 'bigbasket', 'grofers', 'dmart',
        // Food items
        'chicken', 'mutton', 'fish', 'meat', 'milk', 'vegetables', 'fruits',
        // Food delivery
        'swiggy', 'zomato', 'mcdonald', 'kfc', 'dominos', 'pizza', 'burger',
        // Transportation
        'uber', 'ola', 'rickshaw', 'metro', 'bus', 'fuel', 'petrol',
        // Services
        'salon', 'laundry', 'ironing', 'netflix', 'chatgpt', 'internet',
        // Deen
        'darees', 'deen', 'sadaqah', 'zakat', 'masjid'
      ];
      
      let selectedText = result[0].transcript.toLowerCase().trim();
      let selectedIndex = 0;
      
      // Check if any alternative contains known keywords
      for (let i = 0; i < Math.min(result.length, 5); i++) {
        const altText = result[i].transcript.toLowerCase();
        const hasKeyword = knownKeywords.some(keyword => altText.includes(keyword));
        if (hasKeyword) {
          selectedText = altText.trim();
          selectedIndex = i;
          console.log(`✅ Selected alternative ${i + 1} (contains known keyword)`);
          break;
        }
      }
      
      if (selectedIndex === 0) {
        console.log("Using best match (alternative 1):", selectedText);
      }
      
      if (selectedText) {
        await addExpenseFromVoice(selectedText);
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecognizing = false;
      document.getElementById("voiceBtn").innerHTML = '<i class="fas fa-microphone"></i> Voice';
      document.getElementById("voiceBtn").style.background = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
      
      if (event.error === 'no-speech') {
        alert("No speech detected. Please try again.");
      } else if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (event.error !== 'aborted') {
        alert("Voice recognition error: " + event.error);
      }
    };
  } else {
    // Speech recognition not supported
    document.getElementById("voiceBtn").onclick = () => {
      alert("Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
    };
    document.getElementById("voiceBtn").style.opacity = "0.5";
  }
  // Filters
  document.getElementById("applyFiltersBtn").onclick = async () => {
    currentFilters = {
      dateFrom: document.getElementById("filterDateFrom").value || null,
      dateTo: document.getElementById("filterDateTo").value || null,
      categoryId: document.getElementById("filterCategory").value || null,
      subcategoryId: document.getElementById("filterSubcategory").value || null,
      location: document.getElementById("filterLocation").value || null,
      business: document.getElementById("filterBusiness").value.trim() || null
    };
    await loadExpenses();
    renderAll();
  };
  document.getElementById("clearFiltersBtn").onclick = async () => {
    currentFilters = {};
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterCategory").value = "";
    document.getElementById("filterSubcategory").value = "";
    document.getElementById("filterLocation").value = "";
    document.getElementById("filterBusiness").value = "";
    await loadExpenses();
    renderAll();
  };
  // Export
  document.getElementById("exportBtn").onclick = exportCSV;
  
  // SMS Scanner
  document.getElementById("smsBtn").onclick = openSmsModal;
  document.getElementById("parseSmsBtn").onclick = parseSms;
  
  // Force refresh data from database
  document.getElementById("forceRefreshBtn").onclick = async () => {
    const btn = document.getElementById("forceRefreshBtn");
    const icon = btn.querySelector("i");
    
    btn.disabled = true;
    icon.classList.add("fa-spin");
    
    console.log("🔄 FORCE REFRESH: Clearing cache and reloading from database...");
    
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log("Clearing caches:", cacheNames);
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Reload expenses directly from database
      await loadExpenses();
      
      console.log("📊 Current expenses in memory:", expenses.map(e => ({
        id: e.id,
        amount: e.amount,
        note: e.note,
        date: e.date
      })));
      
      // Re-render everything
      await analyzeSpendingPatterns();
      renderAll();
      
      alert("✅ Data refreshed from database!");
    } catch (error) {
      console.error("Error during force refresh:", error);
      alert("❌ Error: " + error.message);
    } finally {
      btn.disabled = false;
      icon.classList.remove("fa-spin");
    }
  };
  
  // Refresh currency rates
  document.getElementById("refreshRatesBtn").onclick = async () => {
    const btn = document.getElementById("refreshRatesBtn");
    const icon = btn.querySelector("i");
    
    btn.disabled = true;
    icon.classList.add("fa-spin");
    
    try {
      const success = await currencyConverter.fetchLiveRates();
      if (success) {
        alert("✅ Exchange rates updated successfully!");
        console.log("Current rates:", currencyConverter.rates);
      } else {
        alert("❌ Failed to update exchange rates. Please try again.");
      }
    } catch (error) {
      console.error("Error updating rates:", error);
      alert("❌ Error updating rates: " + error.message);
    } finally {
      btn.disabled = false;
      icon.classList.remove("fa-spin");
    }
  };
  
  // Modal handlers
  document.getElementById("saveEditBtn").onclick = saveEdit;
  document.getElementById("cancelEditBtn").onclick = () => {
    document.getElementById("editModal").style.display = "none";
  };
  document.querySelector(".close").onclick = () => {
    document.getElementById("editModal").style.display = "none";
  };
  // Category Management
  document.getElementById("manageCategoriesBtn").onclick = openCategoryModal;
  document.getElementById("addCategoryBtn").onclick = addCategory;
  document.getElementById("addSubcategoryBtn").onclick = addSubcategory;
  
  // Income tracking
  const addIncomeBtn = document.getElementById("addIncomeBtn");
  if (addIncomeBtn) {
    addIncomeBtn.onclick = addIncome;
  }
  
  const voiceIncomeBtn = document.getElementById("voiceIncomeBtn");
  if (voiceIncomeBtn) {
    voiceIncomeBtn.onclick = handleVoiceIncome;
  }
  
  const incomeBudgetAmount = document.getElementById("incomeBudgetAmount");
  if (incomeBudgetAmount) {
    // Save budget on blur or enter key
    incomeBudgetAmount.onblur = saveIncomeBudget;
    incomeBudgetAmount.onkeypress = (e) => {
      if (e.key === 'Enter') {
        saveIncomeBudget();
      }
    };
  }
  
  // Debug Console
  document.getElementById("showDebugBtn").onclick = () => {
    const debugConsole = document.getElementById("debugConsole");
    debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
  };
}

// Apply AI voice result to expense form
async function applyAIVoiceResult(result) {
  try {
    console.log('🤖 Applying AI voice result:', result);
    
    // Validate required fields
    if (!result.amount) {
      throw new Error('Amount missing from voice recognition');
    }
    
    // Fill amount
    document.getElementById("amount").value = result.amount;
    console.log('✅ Amount set:', result.amount);
    
    // Fill note
    if (result.note) {
      document.getElementById("note").value = result.note;
      console.log('✅ Note set:', result.note);
    }
    
    // Fill date
    if (result.date) {
      // If AI provides just a date (YYYY-MM-DD), append current time
      if (result.date.length === 10) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById("dateInput").value = `${result.date}T${hours}:${minutes}`;
      } else {
        document.getElementById("dateInput").value = result.date;
      }
      console.log('✅ Date set:', document.getElementById("dateInput").value);
    } else {
      // Default to current date & time if no date specified
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
      document.getElementById("dateInput").value = datetimeLocal;
      console.log('✅ Date set to now:', datetimeLocal);
    }
    
    // Set currency
    if (result.currency) {
      const currencySelect = document.getElementById("currencySelect");
      if (currencySelect) {
        console.log('═══════════════════════════════════════');
        console.log('💱 CURRENCY ASSIGNMENT');
        console.log('═══════════════════════════════════════');
        console.log('🔄 Before:', currencySelect.value);
        console.log('🎯 Setting to:', result.currency);
        console.log('🚨 Is it USD?', result.currency === 'USD' ? '❌ YES - WRONG!' : '✅ NO - CORRECT!');
        currencySelect.value = result.currency;
        console.log('✅ After:', currencySelect.value);
        console.log('💰 Expected:', result.currency);
        console.log('🔍 Match?', currencySelect.value === result.currency ? '✅ YES' : '❌ NO - CURRENCY NOT SET!');
        console.log('═══════════════════════════════════════');
      } else {
        console.error('❌ currencySelect element not found!');
      }
    } else {
      console.error('❌ result.currency is MISSING!', result);
    }
    
    // Set location
    if (result.location) {
      const locationInput = document.getElementById("locationInput");
      if (locationInput) {
        locationInput.value = result.location;
        console.log('✅ Location set:', result.location);
      }
    }
    
    // Set expense type (personal/business) from AI detection
    if (result.expenseType) {
      const expenseTypeSelect = document.getElementById("expenseTypeSelect");
      if (expenseTypeSelect) {
        expenseTypeSelect.value = result.expenseType;
        console.log('✅ Expense type set:', result.expenseType);
      }
    }
    
    // AUTO-DETECT TRAVEL: If currency is different from home currency, auto-set to Travel category
    const homeCurrency = getUserCurrency();
    const isForeignCurrency = result.currency && result.currency !== homeCurrency;
    
    if (isForeignCurrency) {
      console.log('🌍 Foreign currency detected:', result.currency, 'vs home:', homeCurrency);
      // Note: Location should come from AI/user input, not hardcoded mappings
      // This makes the app work globally without region assumptions
    }
    
    // Set category - CRITICAL: must find a matching category
    let categorySet = false;
    
    // If foreign currency and no category specified, auto-set to Travel
    if (isForeignCurrency && !result.category) {
      const categorySelect = document.getElementById("categorySelect");
      const travelCategory = categories.find(c => c.name.toLowerCase().includes('travel'));
      
      if (travelCategory) {
        categorySelect.value = travelCategory.id;
        await populateSubcategorySelect(travelCategory.id, document.getElementById("subcategorySelect"));
        categorySet = true;
        console.log('✈️ Auto-category set to Travel (foreign currency)');
      }
    }
    
    // Otherwise use AI-suggested category
    if (!categorySet && result.category) {
      const categorySelect = document.getElementById("categorySelect");
      const matchingCategory = categories.find(c => 
        c.name.toLowerCase() === result.category.toLowerCase() ||
        c.name.toLowerCase().includes(result.category.toLowerCase()) ||
        result.category.toLowerCase().includes(c.name.toLowerCase())
      );
      
      if (matchingCategory) {
        categorySelect.value = matchingCategory.id;
        await populateSubcategorySelect(matchingCategory.id, document.getElementById("subcategorySelect"));
        categorySet = true;
        console.log('✅ Category set:', matchingCategory.name);
      } else {
        console.warn('⚠️ Category not found:', result.category);
      }
    }
    
    // If no category was set, default to "Shopping" or first available category
    if (!categorySet) {
      const categorySelect = document.getElementById("categorySelect");
      const defaultCategory = categories.find(c => c.name.toLowerCase().includes('shopping')) || categories[0];
      if (defaultCategory) {
        categorySelect.value = defaultCategory.id;
        await populateSubcategorySelect(defaultCategory.id, document.getElementById("subcategorySelect"));
        console.log('✅ Default category set:', defaultCategory.name);
      } else {
        throw new Error('No categories available');
      }
    }
    
    // Auto-submit the expense directly
    console.log('✅ Auto-submitting expense from voice input...');
    
    // Show quick confirmation
    const baseCurrency = getUserCurrency();
    const quickMsg = `✅ Adding: ${result.currency || baseCurrency} ${result.amount} - ${result.note}`;
    
    // Create a brief notification instead of blocking alert
    const notification = document.createElement('div');
    notification.textContent = quickMsg;
    notification.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #4CAF50; color: white; padding: 15px 30px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); font-weight: bold;';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
    
    // Submit the expense automatically
    await addExpense();
    
    console.log('✅ Expense added successfully via voice');
    
  } catch (error) {
    console.error('❌ Error applying AI voice result:', error);
    console.error('❌ Result was:', result);
    alert('Error saving voice expense: ' + error.message);
  }
}

// Auth handlers
// Toggle between login and register modes
let isRegisterMode = false;
document.getElementById("toggleAuthMode").onclick = () => {
  isRegisterMode = !isRegisterMode;
  const authTitle = document.getElementById("authTitle");
  const inviteCodeInput = document.getElementById("inviteCode");
  const registrationPreferences = document.getElementById("registrationPreferences");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const toggleBtn = document.getElementById("toggleAuthMode");
  
  if (isRegisterMode) {
    authTitle.textContent = "✨ Register";
    inviteCodeInput.style.display = "block";
    registrationPreferences.style.display = "block";
    loginBtn.style.display = "none";
    registerBtn.style.display = "block";
    toggleBtn.textContent = "Already have an account? Login";
  } else {
    authTitle.textContent = "🔒 Login";
    inviteCodeInput.style.display = "none";
    inviteCodeInput.value = "";
    registrationPreferences.style.display = "none";
    loginBtn.style.display = "block";
    registerBtn.style.display = "none";
    toggleBtn.textContent = "New user? Register here";
  }
};

// Initialize auth UI
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("registerBtn").style.display = "none";
});

document.getElementById("loginBtn").onclick = async () => {
  const countryCode = document.getElementById("countryCode").value;
  const phone = document.getElementById("phone").value.trim();
  const pin = document.getElementById("pin").value;
  
  if (!phone || !pin) {
    alert("Please enter phone number and PIN");
    return;
  }
  
  const fullPhone = countryCode + phone;
  const user = await login(fullPhone, pin);
  if (user) location.reload();
};

document.getElementById("registerBtn").onclick = async () => {
  const countryCode = document.getElementById("countryCode").value;
  const phone = document.getElementById("phone").value.trim();
  const pin = document.getElementById("pin").value;
  const inviteCode = document.getElementById("inviteCode").value.trim() || null;
  
  // Get user preferences
  const currency = document.getElementById("defaultCurrency").value;
  const languageValue = document.getElementById("defaultLanguage").value;
  const [languageCode, languageName] = languageValue.split('|');
  
  if (!phone || !pin) {
    alert("Please enter phone number and PIN");
    return;
  }
  
  console.log('Registering with preferences:', { currency, languageCode, languageName });
  
  const fullPhone = countryCode + phone;
  const newUser = await register(fullPhone, pin, inviteCode, currency, languageCode, languageName);
  if (newUser) {
    console.log('✅ Registration successful with preferences saved');
    if (newUser.role === 'admin') {
      alert(`✅ Registration successful!\n\nYour family invite code is: ${newUser.invite_code}\n\nShare this code with family members so they can join your family.`);
    } else {
      alert("✅ Successfully joined family!");
    }
    location.reload();
  }
};

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("user");
  location.reload();
};
// Close modals when clicking outside
window.onclick = function(event) {
  const editModal = document.getElementById("editModal");
  const categoryModal = document.getElementById("categoryModal");
  
  if (event.target === editModal) {
    editModal.style.display = "none";
  }
  if (event.target === categoryModal) {
    categoryModal.style.display = "none";
  }
};
// Load categories and subcategories
async function loadCategories() {
  // Force refresh from server (bypass cache)
  const { data: freshCategories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  const { data: freshSubcategories, error: subError } = await supabase
    .from('subcategories')
    .select('*')
    .order('name');
  
  if (!catError && freshCategories) {
    categories = freshCategories;
    console.log(`Categories loaded: ${categories.length}`);
  }
  
  if (!subError && freshSubcategories) {
    subcategories = freshSubcategories;
    console.log(`Subcategories loaded: ${subcategories.length}`);
  }
  
  populateCategorySelects();
}
function populateCategorySelects() {
  const selects = [
    document.getElementById("categorySelect"),
    document.getElementById("filterCategory"),
    document.getElementById("editCategory")
  ];
  
  // Remove duplicates based on category ID
  const uniqueCategories = Array.from(new Map(categories.map(cat => [cat.id, cat])).values());
  
  selects.forEach(select => {
    if (!select) return; // Skip if element doesn't exist
    select.innerHTML = '<option value="">Select Category</option>';
    uniqueCategories.forEach(cat => {
      select.innerHTML += `<option value="${cat.id}" data-icon="${cat.icon}">${cat.icon} ${cat.name}</option>`;
    });
  });
}
// Category change handler - removed, now in setupEventHandlers
function populateSubcategorySelect(categoryId, select) {
  if (!select) return; // Skip if element doesn't exist
  select.innerHTML = '<option value="">Select Subcategory</option>';
  if (!categoryId) return;
  
  const filtered = subcategories.filter(s => s.category_id === categoryId);
  // Remove duplicates based on subcategory ID
  const uniqueSubcategories = Array.from(new Map(filtered.map(sub => [sub.id, sub])).values());
  uniqueSubcategories.forEach(sub => {
    select.innerHTML += `<option value="${sub.id}">${sub.icon} ${sub.name}</option>`;
  });
}
// Add expense - moved to setupEventHandlers
async function addExpense() {
  const amount = parseFloat(document.getElementById("amount").value);
  const project = document.getElementById("projectSelect").value;
  const categoryId = document.getElementById("categorySelect").value;
  const subcategoryId = document.getElementById("subcategorySelect").value;
  const note = document.getElementById("note").value;
  const currency = document.getElementById("currencySelect").value;
  const expenseType = document.getElementById("expenseTypeSelect").value;
  const location = document.getElementById("locationInput").value.trim();
  const taxCategory = document.getElementById("taxCategorySelect")?.value || null;
  const paymentMethod = document.getElementById("paymentMethodSelect")?.value || 'cash';
  const paymentStatus = document.getElementById("paymentStatusSelect")?.value || 'paid';
  
  console.log('💰 addExpense() called with:', { amount, project, categoryId, subcategoryId, note, currency, expenseType, location, taxCategory, paymentMethod, paymentStatus });
  
  if (!amount || !categoryId) {
    console.error('❌ Validation failed: amount=' + amount + ', categoryId=' + categoryId);
    alert("Amount and category are required");
    return;
  }
  
  // Save last selected project to localStorage for persistence
  if (project) {
    localStorage.setItem('lastSelectedProject', project);
  }
  
  // Get user's base currency
  const baseCurrency = getUserCurrency();
  
  // Calculate base currency amount if different currency
  let originalAmount = amount;
  let exchangeRate = 1.0;
  let amountInBase = amount;
  
  if (currencyConverter && currency !== baseCurrency) {
    exchangeRate = currencyConverter.getRate(currency, baseCurrency);
    amountInBase = amount * exchangeRate;
    console.log(`Manual Entry Conversion: ${currency} ${originalAmount} × ${exchangeRate} = ${baseCurrency} ${amountInBase.toFixed(2)}`);
  }
  
  // Get date from input or use current date
  const dateInput = document.getElementById("dateInput").value;
  const expenseDate = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
  
  const expense = {
    id: crypto.randomUUID(), // Generate ID client-side for offline support
    user_id: user.id,
    amount: amountInBase,
    category_id: categoryId,
    subcategory_id: subcategoryId || null,
    project: project || null,
    note,
    date: expenseDate,
    currency: currency,
    original_amount: originalAmount,
    exchange_rate: exchangeRate,
    amount_inr: amountInBase, // Legacy field name, now stores amount in user's base currency
    expense_type: expenseType,
    location: location || null,
    is_reimbursable: expenseType === 'business',
    tax_category: (expenseType === 'business' && taxCategory) ? taxCategory : null,
    payment_method: paymentMethod,
    payment_status: paymentStatus
  };
  
  try {
    // Use sync manager for offline support
    await window.syncManager.insert('expenses', expense);
    
    // Let AI learn from this expense
    if (aiService) {
      try {
        await aiService.learnFromExpense({
          description: note,
          category_id: categoryId,
          subcategory_id: subcategoryId || null,
          amount: amount
        });
        console.log("AI learned from manual expense");
      } catch (aiError) {
        console.log("AI learning skipped:", aiError.message);
      }
    }
  } catch (error) {
    console.error(error);
    alert("Error adding expense");
    return;
  }
  
  // Show success message
  const categoryName = categories.find(c => c.id === categoryId)?.name || 'Unknown';
  alert(`✅ Expense Added!\n💰 ${currency} ${originalAmount}${currency !== baseCurrency ? ` (${baseCurrency} ${amountInBase.toFixed(2)})` : ''}\n📁 ${categoryName}\n📝 ${note || 'No note'}\n💳 ${paymentMethod}\n${paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}`);
  
  // Clear form and reset date to current date & time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  document.getElementById("amount").value = "";
  // Keep projectSelect unchanged (persists last selection)
  document.getElementById("categorySelect").value = "";
  document.getElementById("subcategorySelect").innerHTML = '<option value="">Select Subcategory</option>';
  document.getElementById("note").value = "";
  document.getElementById("dateInput").value = datetimeLocal;
  document.getElementById("currencySelect").value = getUserCurrency();
  document.getElementById("expenseTypeSelect").value = "personal";
  document.getElementById("locationInput").value = "";
  
  // Trigger event for ad manager
  window.dispatchEvent(new CustomEvent('expenseAdded', { detail: { amount, note } }));
  
  await loadExpenses();
  await analyzeSpendingPatterns();
  renderAll();
}
// Voice input - moved to setupEventHandlers
async function addExpenseFromVoice(text) {
  try {
    console.log("========================================");
    console.log("🎤 VOICE INPUT:", text);
    console.log("========================================");
    
    // Parse different patterns:
    // "add 250 zepto" - amount first
    // "zepto 250" - vendor/note first, amount last
    // "add 250 for food groceries" - explicit category
    
    let amount, remainingText;
  
  // Clean up text: remove currency symbols and extra punctuation
  text = text.replace(/[₹$€£]/g, '').trim();
  console.log("🔧 After currency removal:", text);
  
  // Fix common voice recognition errors with numbers (t1200 → 1200, r500 → 500, t100 → 100)
  text = text.replace(/\b[a-z](\d{2,})\b/gi, '$1');
  console.log("🔧 After letter prefix fix:", text);
  
  // Special handling: if text starts with "rs" or "rupees" without number, user might have said amount first
  // Browser might have cut off the beginning. Alert user to speak after "Listening..." appears
  if (/^(rs|rupees)\s+/i.test(text) && !/\d/.test(text)) {
    console.log("⚠️ No amount detected after 'rs/rupees'");
    
    // Extract the description (remove rs/rupees)
    const description = text.replace(/^(rs|rupees)\s+/i, '').trim();
    
    // Prompt for amount
    const amount = prompt(`Amount not captured by microphone.\n\nFor: "${description}"\n\nEnter amount (₹):`);
    
    if (amount && !isNaN(amount)) {
      // Reconstruct the text with amount
      text = `${amount} ${description}`;
      console.log("✅ Amount manually entered, proceeding with:", text);
    } else {
      alert("❌ Amount required. Please try again:\n\n1. Click Voice\n2. WAIT for 'Listening...'\n3. Say: 'ironing clothes 100' (amount at END)");
      return;
    }
  }
  
  console.log("🔍 Attempting pattern matching...");
  
  // Try pattern 1: amount first (e.g., "add 250 zepto" or "250 zepto" or "4.5 coffee")
  // Support commas and decimals in amounts: 14,382 or 1,200 or 4.5 or 12.50
  // Use word boundary to ensure we match complete numbers, not "7th"
  let match = text.match(/^(?:add\s+)?([\d,]+(?:\.\d+)?)\s+(.+)/i);
  console.log("🔍 Pattern 1 match result:", match);
  if (match) {
    const potentialAmount = match[1];
    console.log("🔍 Potential amount from pattern 1:", potentialAmount);
    // Validate it's a pure number with optional decimal (not "7th" which would be captured as "7")
    if (/^[\d,]+(?:\.\d+)?$/.test(potentialAmount)) {
      amount = parseFloat(potentialAmount.replace(/,/g, '')); // Remove commas before parsing
      remainingText = match[2].trim().replace(/[.,;!?]+$/g, ''); // Remove trailing punctuation
      console.log("✅ Pattern 1 matched (amount first)");
    } else {
      match = null; // Reset to try pattern 2
    }
  }
  
  if (!match) {
    // Try pattern 2: amount last (e.g., "zepto 250" or "add zepto 250" or "mcdonald's, 1200" or "coffee 4.5")
    // Match with optional comma/punctuation/space before amount (greedy match for text)
    // Support decimals: 250, 1,200, 4.5, 12.50
    match = text.match(/(?:add\s+)?(.+)[,.\s]+([\d,]+(?:\.\d+)?)$/i);
    if (match) {
      amount = parseFloat(match[2].replace(/,/g, '')); // Remove commas before parsing
      remainingText = match[1].trim().replace(/[.,;!?]+$/g, ''); // Remove trailing punctuation
      console.log("✅ Pattern 2 matched (amount last)");
    } else {
      alert("Could not understand. Try:\n• 'add 250 zepto'\n• 'zepto 250'\n• 'coffee 4.5'\n• 'add 250 for food groceries'\n\nYou said: " + text);
      return;
    }
  }
  
  console.log("💵 Amount:", amount);
  console.log("📝 Remaining text:", remainingText);
  
  // 📅 DATE PARSING - Extract date from text
  let expenseDate = new Date(); // Default to now
  const dateKeywords = {
    'yesterday': () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    },
    'today': () => new Date(),
    'monday': () => getPreviousWeekday(1),
    'tuesday': () => getPreviousWeekday(2),
    'wednesday': () => getPreviousWeekday(3),
    'thursday': () => getPreviousWeekday(4),
    'friday': () => getPreviousWeekday(5),
    'saturday': () => getPreviousWeekday(6),
    'sunday': () => getPreviousWeekday(0),
    'last week': () => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d;
    }
  };
  
  // Helper function to get previous weekday
  function getPreviousWeekday(targetDay) {
    const today = new Date();
    const currentDay = today.getDay();
    let daysAgo = currentDay - targetDay;
    if (daysAgo <= 0) daysAgo += 7; // Go to previous week if day hasn't occurred yet
    const result = new Date();
    result.setDate(today.getDate() - daysAgo);
    return result;
  }
  
  const lowerText = remainingText.toLowerCase();
  
  // Check for specific dates (e.g., "1st October", "15th Nov", "25 December")
  // Must have word boundary before the number to avoid matching amounts like "1200"
  const specificDateMatch = lowerText.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i);
  if (specificDateMatch) {
    const day = parseInt(specificDateMatch[1]);
    const monthStr = specificDateMatch[2].toLowerCase();
    
    // Validate day is reasonable (1-31)
    if (day < 1 || day > 31) {
      console.log(`⚠️ Invalid day: ${day}, ignoring date match`);
    } else {
      const monthMap = {
        'january': 0, 'jan': 0,
        'february': 1, 'feb': 1,
        'march': 2, 'mar': 2,
        'april': 3, 'apr': 3,
        'may': 4,
        'june': 5, 'jun': 5,
        'july': 6, 'jul': 6,
        'august': 7, 'aug': 7,
        'september': 8, 'sep': 8,
        'october': 9, 'oct': 9,
        'november': 10, 'nov': 10,
        'december': 11, 'dec': 11
      };
      
      const month = monthMap[monthStr];
      const currentYear = new Date().getFullYear();
      
      // Create date at noon to avoid timezone issues
      expenseDate = new Date(currentYear, month, day, 12, 0, 0);
      
      // If the date is in the future, assume it's from last year
      const now = new Date();
      if (expenseDate > now) {
        expenseDate.setFullYear(currentYear - 1);
      }
      
      remainingText = remainingText.replace(specificDateMatch[0], '').trim();
      console.log(`📅 Date detected: ${day} ${monthStr} (month index: ${month}) → ${expenseDate.toDateString()}`);
    }
  }
  // Check for standalone month name (e.g., "october", "november") - assume 1st of that month
  else if (lowerText.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i)) {
    const monthMatch = lowerText.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i);
    const monthStr = monthMatch[1].toLowerCase();
    
    const monthMap = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };
    
    const month = monthMap[monthStr];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Default to 1st of the month
    expenseDate = new Date(currentYear, month, 1, 12, 0, 0);
    
    // If month is in the future or is current month, use last year
    if (month > currentMonth) {
      expenseDate.setFullYear(currentYear - 1);
    }
    
    remainingText = remainingText.replace(monthMatch[0], '').trim();
    console.log(`📅 Date detected: ${monthStr} (standalone month) → 1st ${monthStr} → ${expenseDate.toDateString()}`);
  }
  // Check for relative days (e.g., "3 days ago", "5 days back")
  else if (lowerText.match(/(\d+)\s+days?\s+(ago|back)/i)) {
    const daysAgoMatch = lowerText.match(/(\d+)\s+days?\s+(ago|back)/i);
    const daysAgo = parseInt(daysAgoMatch[1]);
    expenseDate = new Date();
    expenseDate.setDate(expenseDate.getDate() - daysAgo);
    remainingText = remainingText.replace(daysAgoMatch[0], '').trim();
    console.log(`📅 Date detected: ${daysAgo} days ago → ${expenseDate.toDateString()}`);
  } else {
    // Check for keyword dates
    for (const [keyword, getDate] of Object.entries(dateKeywords)) {
      if (lowerText.includes(keyword)) {
        expenseDate = getDate();
        remainingText = remainingText.replace(new RegExp(keyword, 'gi'), '').trim();
        console.log(`📅 Date detected: ${keyword} → ${expenseDate.toDateString()}`);
        break;
      }
    }
  }
  
  // Check for "on [date]" pattern
  remainingText = remainingText.replace(/\bon\s+/gi, '').trim();
  
  console.log("📅 Final expense date:", expenseDate.toDateString());
  console.log("📝 After date extraction:", remainingText);
  
  // Clean up remaining text: remove extra punctuation, periods, and whitespace
  remainingText = remainingText.replace(/^[.,;!?\s]+|[.,;!?\s]+$/g, '').trim();
  
  // PRE-CORRECTIONS: Fix common browser mishearings BEFORE voice intelligence
  // "shining" is often misheard "ironing"
  if (remainingText.toLowerCase().includes('shining')) {
    console.log(`🔧 Pre-correction: "shining" → "ironing"`);
    remainingText = remainingText.replace(/shining/gi, 'ironing');
  }
  
  // "signing" is also often misheard "ironing"
  if (remainingText.toLowerCase().includes('signing')) {
    console.log(`🔧 Pre-correction: "signing" → "ironing"`);
    remainingText = remainingText.replace(/signing/gi, 'ironing');
  }
  
  // 🧠 INTELLIGENT VOICE CORRECTION - Uses phonetic matching + edit distance
  if (voiceIntelligence && remainingText.trim().length > 0) {
    const corrected = voiceIntelligence.correctPhrase(remainingText);
    if (corrected !== remainingText) {
      console.log(`🧠 Voice Intelligence: "${remainingText}" → "${corrected}"`);
      remainingText = corrected;
    }
  }
  
  console.log("📝 After intelligent correction:", remainingText);
  
  // Special case: if remaining text is ONLY "second", it's likely "chicken"
  if (remainingText.trim().toLowerCase() === 'second') {
    console.log(`🔧 Special correction: "second" (standalone) → "chicken"`);
    remainingText = 'chicken';
  }
  
  console.log("📝 After correction:", remainingText);
  
  // 🏢 BUSINESS NAME DETECTION
  const businessKeywords = {
    'Ecommerce': ['ecommerce', 'e-commerce', 'amazon business', 'seller', 'meesho seller'],
    'IT': ['software', 'development', 'coding', 'programming', 'website', 'app development'],
    'Trading NFF': ['trading', 'nff', 'trading nff', 'stock', 'forex', 'investment']
  };
  
  let detectedBusiness = null;
  let lowerRemainingBiz = remainingText.toLowerCase();
  
  // Use word boundary matching to avoid false positives like "electricity" matching "IT"
  for (const [businessName, keywords] of Object.entries(businessKeywords)) {
    const matchedKeyword = keywords.find(kw => {
      // Use word boundaries for single/short words
      const pattern = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return pattern.test(remainingText);
    });
    if (matchedKeyword) {
      detectedBusiness = businessName;
      console.log(`🏢 Business detected: "${matchedKeyword}" → ${businessName}`);
      // Remove business keyword from remaining text and clean up
      remainingText = remainingText.replace(new RegExp(`\\b${matchedKeyword}\\b`, 'gi'), '').trim();
      remainingText = remainingText.replace(/\s+/g, ' ').trim(); // Collapse multiple spaces
      break;
    }
  }
  
  // 🌍 CURRENCY & EXPENSE TYPE DETECTION
  const currencyDetection = currencyConverter ? currencyConverter.detectCurrency(remainingText) : { currency: getUserCurrency(), keyword: null };
  const expenseType = currencyConverter ? currencyConverter.detectExpenseType(remainingText) : 'personal';
  const detectedCurrency = currencyDetection.currency;
  const currencyKeyword = currencyDetection.keyword;
  
  // Map currency keywords to locations (don't save the keyword itself as location)
  let locationKeyword = null;
  if (currencyKeyword) {
    const currencyToLocation = {
      'dirham': 'dubai',
      'aed': 'dubai',
      'rupee': 'india',
      'rupees': 'india',
      'inr': 'india',
      'dollar': 'usa',
      'usd': 'usa',
      'pound': 'london',
      'gbp': 'london',
      'euro': 'europe',
      'eur': 'europe',
      'riyal': 'saudi',
      'sar': 'saudi'
    };
    locationKeyword = currencyToLocation[currencyKeyword.toLowerCase()] || null;
  }
  
  console.log(`💰 Currency: ${detectedCurrency}, Type: ${expenseType}, Location: ${locationKeyword || 'none'}, Business: ${detectedBusiness || 'none'}`);
  
  // Calculate base currency amount
  let originalAmount = amount;
  let exchangeRate = 1.0;
  let amountINR = amount; // Changed from amountBase to amountINR for consistency
  const userBaseCurrency = getUserCurrency();
  
  if (currencyConverter && detectedCurrency !== userBaseCurrency) {
    exchangeRate = currencyConverter.getRate(detectedCurrency, userBaseCurrency);
    amountINR = amount * exchangeRate;
    console.log(`Conversion: ${detectedCurrency} ${originalAmount} × ${exchangeRate} = ${userBaseCurrency} ${amountINR.toFixed(2)}`);
  }
  
  // Remove currency keywords from remaining text for cleaner note
  if (currencyKeyword) {
    remainingText = remainingText.replace(new RegExp(currencyKeyword, 'gi'), '').trim();
  }
  // Remove expense type keywords
  remainingText = remainingText.replace(/\b(business|work|office|travel|trip|vacation|personal)\b/gi, '').trim();
  
  // Smart category and subcategory detection
  // PRIORITY 1: Grocery delivery apps
  const groceryApps = ['zepto', 'blinkit', 'instamart', 'dunzo', 'bigbasket', 'grofers', 'dmart'];
  
  // PRIORITY 2: Category-specific keywords with subcategories
  const categoryKeywords = {
    'groceries': {
      keywords: ['groceries', 'grocery', 'kirana', 'general store', 'supermarket', 'provisions'],
      apps: groceryApps,
      items: {
        'milk': ['milk', 'dairy', 'curd', 'yogurt', 'yoghurt', 'butter', 'cheese', 'paneer', 'ghee'],
        'vegetables': ['vegetables', 'veggies', 'veggie', 'tomato', 'potato', 'onion', 'carrot', 'beans', 'cabbage', 'broccoli', 'spinach', 'cauliflower'],
        'fruits': ['fruits', 'fruit', 'apple', 'banana', 'orange', 'mango', 'grapes', 'watermelon', 'papaya', 'strawberry', 'kiwi'],
        'chicken': ['chicken', 'mutton', 'meat', 'lamb', 'pork', 'beef', 'fish', 'prawns', 'seafood'],
        'snacks': ['snacks', 'chips', 'biscuits', 'cookies', 'namkeen', 'kurkure', 'wafers'],
        'beverages': ['beverages', 'drinks', 'juice', 'cola', 'pepsi', 'coke', 'sprite', 'tea', 'coffee', 'water bottle'],
        'staples': ['staples', 'rice', 'wheat', 'atta', 'dal', 'flour', 'oil', 'sugar', 'salt', 'pulses']
      }
    },
    'food': {
      keywords: ['momos', 'momo', 'pizza', 'burger', 'biryani', 'dosa', 'samosa', 'paratha', 'thali', 'meal', 'breakfast', 'lunch', 'dinner', 'mcdonalds', "mcdonald's", 'kfc', 'dominos', 'subway', 'restaurant', 'swiggy', 'zomato'],
      subcategories: {
        'restaurants': ['restaurant', 'dining', 'mcdonalds', "mcdonald's", 'kfc', 'dominos', 'burger king', 'subway', 'swiggy', 'zomato'],
        'coffee': ['coffee', 'cafe', 'starbucks', 'tea', 'chai']
      }
    },
    'transportation': {
      keywords: ['uber', 'ola', 'taxi', 'cab', 'auto', 'rickshaw', 'metro', 'bus', 'train', 'fuel', 'petrol', 'diesel', 'fastag', 'fast tag', 'fasttag', 'toll', 'recharge', 'parking', 'nol', 'nol card'],
      subcategories: {
        'taxi': ['uber', 'ola', 'taxi', 'cab'],
        'fuel': ['fuel', 'petrol', 'diesel', 'gas'],
        'public transit': ['metro', 'bus', 'train', 'rickshaw', 'auto', 'nol', 'nol card'],
        'fastag': ['fastag', 'fast tag', 'fasttag', 'toll', 'recharge']
      }
    },
    'personal care': {
      keywords: ['salon', 'haircut', 'hair', 'spa', 'massage', 'laundry', 'ironing', 'iron', 'dry clean', 'drycleaning', 'washing', 'barber', 'car wash', 'car cleaning', 'car service'],
      subcategories: {
        'laundry': ['laundry', 'ironing', 'iron', 'dry clean', 'drycleaning', 'washing', 'clothes wash'],
        'salon': ['salon', 'haircut', 'hair', 'barber', 'grooming'],
        'spa': ['spa', 'massage', 'facial'],
        'car wash': ['car wash', 'car cleaning', 'car service']
      }
    },
    'entertainment': {
      keywords: ['movie', 'cinema', 'pvr', 'inox', 'theatre', 'netflix', 'amazon prime', 'hotstar', 'game', 'gaming'],
      subcategories: {
        'movies': ['movie', 'cinema', 'pvr', 'inox', 'theatre', 'film'],
        'streaming': ['netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube premium']
      }
    },
    'health': {
      keywords: ['doctor', 'hospital', 'clinic', 'medicine', 'pharmacy', 'medical', 'apollo', 'medplus', 'pills', 'tablets'],
      subcategories: {
        'doctor': ['doctor', 'hospital', 'clinic', 'consultation', 'apollo'],
        'pharmacy': ['pharmacy', 'medicine', 'medplus', 'pills', 'tablets', 'drugs']
      }
    },
    'shopping': {
      keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'clothes', 'clothing', 'shirt', 'pants', 'shoes', 'electronics', 'mobile', 'laptop', 'ecommerce', 'e-commerce', 'commerce', 'online', 'perfekt', 'perfect', 'scale', 'meesho', 'shopsy', 'seller', 'sale'],
      subcategories: {
        'clothing': ['clothes', 'clothing', 'shirt', 'pants', 'jeans', 'shoes', 'dress', 'myntra', 'fashion'],
        'electronics': ['electronics', 'mobile', 'phone', 'laptop', 'computer', 'gadget', 'headphones'],
        'ecommerce': ['ecommerce', 'e-commerce', 'commerce', 'seller', 'sale', 'meesho', 'perfekt', 'perfect', 'scale']
      }
    },
    'bills & utilities': {
      keywords: ['subscription', 'internet', 'wifi', 'broadband', 'electricity', 'water', 'gas', 'bill', 'utility', 'chatgpt', 'openai', 'cloud', 'hosting', 'domain', 'server', 'netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube premium'],
      subcategories: {
        'subscriptions': ['subscription', 'netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube premium', 'chatgpt', 'openai', 'cloud', 'hosting', 'domain'],
        'internet': ['internet', 'wifi', 'broadband', 'airtel', 'jio fiber', 'act fibernet'],
        'utilities': ['electricity', 'water', 'gas', 'utility', 'bill']
      }
    },
    'deen': {
      keywords: ['deen', 'darees', 'islamic', 'masjid', 'mosque', 'quran', 'sadaqah', 'zakat', 'donation', 'charity'],
      subcategories: {
        'darees': ['darees', 'dars', 'class', 'islamic class'],
        'sadaqah': ['sadaqah', 'charity', 'donation'],
        'zakat': ['zakat', 'zakaat']
      }
    },
    'travel': {
      keywords: ['hotel', 'motel', 'accommodation', 'stay', 'booking', 'airbnb', 'oyo', 'resort', 'flight', 'airplane', 'ticket', 'airport', 'train ticket', 'bus ticket', 'travel', 'trip', 'vacation', 'tour', 'sightseeing'],
      subcategories: {
        'accommodation': ['hotel', 'motel', 'accommodation', 'stay', 'booking', 'airbnb', 'oyo', 'resort', 'lodge', 'guesthouse'],
        'flights': ['flight', 'airplane', 'plane', 'air ticket', 'airline', 'airport'],
        'other travel': ['train ticket', 'bus ticket', 'tour', 'sightseeing', 'visa', 'passport']
      }
    },
    'education': {
      keywords: ['school', 'fees', 'tuition', 'college', 'university', 'education', 'books', 'stationery', 'notebook', 'pen', 'pencil', 'study', 'course', 'class', 'coaching'],
      subcategories: {
        'tuition': ['school', 'fees', 'tuition', 'college', 'university', 'coaching', 'classes'],
        'books': ['books', 'textbook', 'notebook', 'stationery', 'pen', 'pencil', 'paper']
      }
    }
  };
  
  // Initialize Voice Intelligence with keywords (first time only)
  if (!voiceIntelligence) {
    initVoiceIntelligence(categoryKeywords);
  }
  
  const lowerRemaining = remainingText.toLowerCase();
  console.log("=== SMART CATEGORY DETECTION ===");
  console.log("Input text:", lowerRemaining);
  
  let foundCategory = null;
  let subcategory = null;
  let note = remainingText;
  
  // SMART DETECTION LOGIC - Check all category keywords
  console.log("🔍 Scanning for category matches...");
  
  for (const [categoryType, categoryData] of Object.entries(categoryKeywords)) {
    if (foundCategory) break; // Already found
    
    // Check grocery apps first (special case)
    if (categoryType === 'groceries' && categoryData.apps) {
      const detectedApp = categoryData.apps.find(app => lowerRemaining.includes(app));
      if (detectedApp) {
        console.log(`✅ Detected grocery app: ${detectedApp}`);
        foundCategory = categories.find(c => c.name.toLowerCase().includes('food'));
        
        // Default to Groceries subcategory for grocery apps
        if (foundCategory) {
          subcategory = subcategories.find(s => 
            s.category_id === foundCategory.id && 
            s.name.toLowerCase().includes('groceries')
          );
          console.log(`  📦 Default subcategory: ${subcategory?.name || 'NOT FOUND'}`);
        }
        
        // Check for specific subcategory items (overrides default)
        if (categoryData.items) {
          for (const [subName, keywords] of Object.entries(categoryData.items)) {
            const matchedKeyword = keywords.find(kw => lowerRemaining.includes(kw));
            if (matchedKeyword && foundCategory) {
              console.log(`  ✅ Found specific item: ${matchedKeyword} → ${subName}`);
              subcategory = subcategories.find(s => 
                s.category_id === foundCategory.id && 
                s.name.toLowerCase().includes(subName)
              );
              break;
            }
          }
        }
        
        // Keep the app name in note if there's no other text
        const noteWithoutApp = remainingText.replace(new RegExp(detectedApp, 'gi'), '').trim();
        note = noteWithoutApp || detectedApp; // Keep app name if nothing else
        console.log(`  📝 Note: "${note}"`);
        break;
      }
    }
    
    // Check regular keywords
    if (categoryData.keywords) {
      const matchedKeyword = categoryData.keywords.find(kw => lowerRemaining.includes(kw));
      if (matchedKeyword) {
        console.log(`✅ Matched keyword "${matchedKeyword}" → ${categoryType}`);
        
        // Find category (handle different naming patterns)
        const categoryNameMap = {
          'groceries': 'food',
          'food': 'food',
          'transportation': 'transportation',
          'personal care': 'personal care',
          'entertainment': 'entertainment',
          'health': 'health',
          'shopping': 'shopping',
          'travel': 'travel',
          'deen': 'deen',
          'education': 'education'
        };
        
        const searchName = categoryNameMap[categoryType] || categoryType;
        foundCategory = categories.find(c => c.name.toLowerCase().includes(searchName));
        
        console.log(`  Category found: ${foundCategory?.name || 'NOT FOUND'}`);
        
        // Find subcategory
        if (categoryData.subcategories && foundCategory) {
          for (const [subName, subKeywords] of Object.entries(categoryData.subcategories)) {
            const matchedSubKeyword = subKeywords.find(kw => lowerRemaining.includes(kw));
            if (matchedSubKeyword) {
              console.log(`  ✅ Matched subcategory keyword "${matchedSubKeyword}" → ${subName}`);
              subcategory = subcategories.find(s => 
                s.category_id === foundCategory.id && 
                s.name.toLowerCase().includes(subName)
              );
              console.log(`    Subcategory: ${subcategory?.name || 'NOT FOUND'}`);
              break;
            }
          }
        }
        break;
      }
    }
    
    // Check grocery items directly (without app name)
    if (categoryType === 'groceries' && categoryData.items && !foundCategory) {
      for (const [subName, keywords] of Object.entries(categoryData.items)) {
        const matchedKeyword = keywords.find(kw => lowerRemaining.includes(kw));
        if (matchedKeyword) {
          console.log(`✅ Direct grocery item: ${matchedKeyword} → ${subName}`);
          foundCategory = categories.find(c => c.name.toLowerCase().includes('food'));
          
          if (foundCategory) {
            subcategory = subcategories.find(s => 
              s.category_id === foundCategory.id && 
              s.name.toLowerCase().includes('groceries')
            );
            if (subcategory) {
              console.log(`  Assigned to: ${foundCategory.name} > Groceries`);
            }
          }
          break;
        }
      }
    }
  }
  
  // Default to Shopping if still no category detected
  if (!foundCategory) {
    console.log("⚠️ No category detected, defaulting to Shopping");
    foundCategory = categories.find(c => c.name.toLowerCase().includes('shopping'));
  }
  
  if (!foundCategory) {
    const availableCategories = categories.map(c => c.name.split(' ')[0]).join(', ');
    alert(`Category not found.\nAvailable: ${availableCategories}`);
    return;
  }
  
  console.log("========================================");
  console.log("📊 FINAL RESULTS:");
  console.log("   Category:", foundCategory.name);
  console.log("   Subcategory:", subcategory?.name || "none");
  console.log("   Note:", note);
  console.log("   Currency:", detectedCurrency);
  console.log("   Type:", expenseType);
  console.log("========================================");
  
  // If subcategory not found yet, try to find from note
  if (!subcategory && note) {
    console.log("Looking for additional subcategory clues in note...");
    const noteLower = note.toLowerCase();
    if (!subcategory) {
      subcategory = subcategories.find(s => 
        s.category_id === foundCategory.id && 
        (noteLower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(noteLower))
      );
      console.log("Additional subcategory search result:", subcategory?.name || "none");
    }
  }
  
  console.log("Final - Category:", foundCategory.name, "Subcategory:", subcategory?.name || "none");
  console.log("Creating expense object...");
  
  // Get payment method and status from UI fields (user may have set them before voice input)
  const paymentMethod = document.getElementById("paymentMethodSelect")?.value || 'cash';
  const paymentStatus = document.getElementById("paymentStatusSelect")?.value || 'paid';
  
  const expense = {
    user_id: user.id,
    amount: amountINR, // Store INR amount for consistent reports
    category_id: foundCategory.id,
    subcategory_id: subcategory?.id || null,
    note: note.trim(),
    date: expenseDate.toISOString(), // Use parsed date
    // Multi-currency fields
    currency: detectedCurrency,
    original_amount: originalAmount,
    exchange_rate: exchangeRate,
    amount_inr: amountINR,
    expense_type: expenseType,
    location: locationKeyword || null,
    is_reimbursable: expenseType === 'business',
    business_name: detectedBusiness || null,
    payment_method: paymentMethod,
    payment_status: paymentStatus
  };
  
  console.log("Inserting expense:", JSON.stringify(expense, null, 2));
  
  const { data, error } = await supabase.from("expenses").insert([expense]).select();
  if (error) {
    console.error("Error inserting expense:", error);
    alert("Error adding expense: " + error.message);
    return;
  }
  
  console.log("Expense inserted successfully:", data);
  
  // Let AI learn from this expense for future auto-categorization
  if (aiService && data && data[0]) {
    try {
      await aiService.learnFromExpense({
        description: note.trim(),
        category_id: foundCategory.id,
        subcategory_id: subcategory?.id || null,
        amount: amount
      });
      console.log("AI learned from this expense");
    } catch (aiError) {
      console.log("AI learning skipped:", aiError.message);
    }
  }
  
  console.log("Reloading expenses after voice insert...");
  await loadExpenses();
  console.log("Re-analyzing patterns...");
  await analyzeSpendingPatterns();
  console.log("Rendering UI after voice insert...");
  renderAll();
  console.log("Voice insert complete!");
  
  // Show success with currency info
  let successMsg = `✅ Added: ${foundCategory.icon} ${foundCategory.name}`;
  if (detectedCurrency !== 'INR') {
    successMsg += `\n💰 ${detectedCurrency} ${originalAmount.toFixed(2)} (₹${amountINR.toFixed(0)})`;
  } else {
    successMsg += `\n💰 ₹${amountINR.toFixed(0)}`;
  }
  if (expenseType !== 'personal') {
    successMsg += `\n🏷️ ${expenseType.charAt(0).toUpperCase() + expenseType.slice(1)}`;
  }
  if (locationKeyword) {
    successMsg += `\n� ${locationKeyword.charAt(0).toUpperCase() + locationKeyword.slice(1)}`;
  }
  if (note) {
    successMsg += `\n📝 ${note}`;
  }
  alert(successMsg);
  } catch (error) {
    console.error("❌ Exception in addExpenseFromVoice:", error);
    console.error("❌ Error stack:", error.stack);
    alert("Failed to add expense: " + error.message + "\n\nCheck console for details.");
  }
}

// ==================== INCOME TRACKING FUNCTIONS ====================

// Add income entry
async function addIncome() {
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const source = document.getElementById("incomeSourceSelect").value;
  const note = document.getElementById("incomeNote").value;
  const currency = document.getElementById("incomeCurrencySelect").value;
  const dateInput = document.getElementById("incomeDateInput").value;
  
  console.log('💰 addIncome() called with:', { amount, source, note, currency, dateInput });
  
  if (!amount || !source) {
    alert("Amount and source are required");
    return;
  }
  
  // Get user's base currency
  const baseCurrency = getUserCurrency();
  
  // Calculate base currency amount if different currency
  let originalAmount = amount;
  let exchangeRate = 1.0;
  let amountInBase = amount;
  
  if (currencyConverter && currency !== baseCurrency) {
    exchangeRate = currencyConverter.getRate(currency, baseCurrency);
    amountInBase = amount * exchangeRate;
    console.log(`Income Conversion: ${currency} ${originalAmount} × ${exchangeRate} = ${baseCurrency} ${amountInBase.toFixed(2)}`);
  }
  
  // Get date from input or use current date
  const incomeDate = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
  
  const income = {
    id: crypto.randomUUID(),
    user_id: user.id,
    amount: originalAmount,
    amount_inr: amountInBase, // Converted amount in base currency
    currency: currency,
    source: source,
    description: note,
    date: incomeDate
  };
  
  try {
    const { data, error } = await supabase.from("income").insert([income]).select();
    
    if (error) {
      console.error('Error adding income:', error);
      alert("Error adding income: " + error.message);
      return;
    }
    
    console.log('✅ Income added successfully:', data);
    
    // Clear form
    document.getElementById("incomeAmount").value = "";
    document.getElementById("incomeSourceSelect").value = "";
    document.getElementById("incomeNote").value = "";
    document.getElementById("incomeCurrencySelect").value = getUserCurrency();
    
    // Reset date to current date & time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById("incomeDateInput").value = datetimeLocal;
    
    alert(`✅ Income Added!\n💰 ${currency} ${originalAmount}${currency !== baseCurrency ? ` (${baseCurrency} ${amountInBase.toFixed(2)})` : ''}\n📝 ${source}`);
    
    // Refresh display
    await loadExpenses(); // Will reload both expenses and income
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Error adding income");
  }
}

// Handle voice income entry
async function handleVoiceIncome() {
  // Voice income will be handled similar to voice expense
  alert("Voice income feature coming soon! For now, please use manual entry.");
}

// Save income budget
async function saveIncomeBudget() {
  const budgetAmount = parseFloat(document.getElementById("incomeBudgetAmount").value);
  
  if (!budgetAmount || budgetAmount <= 0) {
    alert("Please enter a valid budget amount");
    return;
  }
  
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const currency = getUserCurrency();
  
  try {
    // Check if budget already exists for this month/year
    const { data: existing, error: fetchError } = await supabase
      .from("income_budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      throw fetchError;
    }
    
    if (existing) {
      // Update existing budget
      const { error: updateError } = await supabase
        .from("income_budgets")
        .update({ 
          budgeted_income: budgetAmount,
          currency: currency
        })
        .eq("id", existing.id);
      
      if (updateError) throw updateError;
      console.log('✅ Income budget updated');
    } else {
      // Insert new budget
      const { error: insertError } = await supabase
        .from("income_budgets")
        .insert([{
          user_id: user.id,
          month: month,
          year: year,
          budgeted_income: budgetAmount,
          currency: currency
        }]);
      
      if (insertError) throw insertError;
      console.log('✅ Income budget created');
    }
    
    alert(`✅ Income Budget Set!\n💰 ${currency} ${budgetAmount}/month`);
  } catch (error) {
    console.error('Error saving income budget:', error);
    alert("Error saving income budget: " + error.message);
  }
}

// Check if user is admin
async function checkAdminStatus() {
  try {
    // Try to check if is_admin column exists
    const { data, error } = await supabase
      .from("users")
      .select("is_admin, phone")
      .eq("id", user.id)
      .single();
    
    if (error) {
      // If column doesn't exist, check if we need to inform the user
      if (error.code === '42703' || error.message.includes('column')) {
        console.log("ℹ️ Admin feature not set up. Run SQL: ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;");
      } else {
        console.log("Admin check error:", error.message);
      }
      return;
    }
    
    if (data && data.is_admin) {
      isAdmin = true;
      console.log("✅ Admin access granted");
      await loadAllUsers();
      showAdminPanel();
    } else {
      console.log("ℹ️ Not an admin user");
    }
  } catch (error) {
    console.log("Admin check failed:", error.message);
  }
}

// Load all users for admin
// Load all users for admin (only from same family)
async function loadAllUsers() {
  try {
    // If user doesn't have family_id yet, they need to logout and login
    if (!user.family_id) {
      console.log("⚠️ User missing family_id - please logout and login again");
      return;
    }
    
    const { data, error } = await supabase
      .from("users")
      .select("id, phone, role")
      .eq("family_id", user.family_id)
      .order("phone");
    
    if (error) {
      console.error("Error loading users:", error);
      return;
    }
    
    if (data) {
      allUsers = data;
      console.log("Loaded family members:", allUsers.length);
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// Load expenses
async function loadExpenses() {
  console.log("Loading expenses for user:", user.id);
  try {
    let allExpenses;
    
    // Use sync manager to get data (works offline/online)
    if (isAdmin && adminViewMode === 'consolidated') {
      console.log("Admin: Loading all family expenses (consolidated)");
      // Load all expenses and filter by family members
      allExpenses = await window.syncManager.getAll('expenses');
      
      // Filter to only show expenses from users in the same family
      if (user.family_id && allUsers.length > 0) {
        const familyUserIds = allUsers.map(u => u.id);
        allExpenses = allExpenses.filter(e => familyUserIds.includes(e.user_id));
        console.log(`Filtered to ${allExpenses.length} expenses from ${familyUserIds.length} family members`);
      }
    } else if (isAdmin && adminViewMode === 'individual' && selectedUserId) {
      console.log("Admin: Loading expenses for user:", selectedUserId);
      allExpenses = await window.syncManager.getAll('expenses', selectedUserId);
    } else {
      // Normal user: load only their expenses
      allExpenses = await window.syncManager.getAll('expenses', user.id);
    }
    
    // Sort by date descending
    allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Enrich with category and subcategory data
    const categories = await window.syncManager.getAll('categories');
    allExpenses = allExpenses.map(expense => {
      const category = categories.find(c => c.id === expense.category_id);
      return {
        ...expense,
        category: category ? { name: category.name, icon: category.icon, color: category.color } : null
      };
    });
    
    // Apply filters
    if (currentFilters.dateFrom) {
      allExpenses = allExpenses.filter(e => new Date(e.date) >= new Date(currentFilters.dateFrom));
    }
    if (currentFilters.dateTo) {
      allExpenses = allExpenses.filter(e => new Date(e.date) <= new Date(currentFilters.dateTo));
    }
    if (currentFilters.categoryId) {
      allExpenses = allExpenses.filter(e => e.category_id === currentFilters.categoryId);
    }
    if (currentFilters.subcategoryId) {
      allExpenses = allExpenses.filter(e => e.subcategory_id === currentFilters.subcategoryId);
    }
    
    // Apply client-side filters for location and business
    if (currentFilters.location) {
      if (currentFilters.location === 'dubai') {
        allExpenses = allExpenses.filter(e => 
          e.location && e.location.toLowerCase().includes('dubai')
        );
      } else if (currentFilters.location === 'mumbai') {
        allExpenses = allExpenses.filter(e => 
          e.location && e.location.toLowerCase().includes('mumbai')
        );
      } else if (currentFilters.location === 'other') {
        allExpenses = allExpenses.filter(e => 
          !e.location || !e.location.toLowerCase().includes('dubai')
        );
      }
    }
    
    if (currentFilters.business) {
      const searchTerm = currentFilters.business.toLowerCase();
      allExpenses = allExpenses.filter(e => 
        (e.note && e.note.toLowerCase().includes(searchTerm)) ||
        (e.description && e.description.toLowerCase().includes(searchTerm))
      );
    }
    
    expenses = allExpenses;
    console.log("Loaded expenses:", expenses.length);
  } catch (error) {
    console.error("Exception in loadExpenses:", error);
    alert("Failed to load expenses");
  }
}

// Make loadExpenses available globally for sync manager
window.loadExpenses = loadExpenses;

// Filters - moved to setupEventHandlers
// AI Analysis Functions
async function analyzeSpendingPatterns() {
  console.log("=== analyzeSpendingPatterns CALLED ===");
  console.log("aiService exists?", !!aiService);
  console.log("expenses.length:", expenses.length);
  
  if (!aiService) {
    console.log("Skipping AI analysis: no service");
    return;
  }
  
  try {
    insights = [];
    console.log("Insights array cleared");
    
    // Always show AI welcome message
    insights.push({
      type: 'info',
      icon: '🤖',
      title: 'AI Intelligence Active',
      description: `Smart insights will appear as you add more expenses. I'll analyze patterns, detect anomalies, and predict future spending!`
    });
    
    console.log("Added welcome insight, insights.length:", insights.length);
    
    if (expenses.length === 0) {
      console.log("No expenses yet, showing welcome message only");
      renderInsights();
      return;
    }
    
    console.log("Running spending pattern analysis with", expenses.length, "expenses...");
    const aiInsights = await aiService.analyzeSpendingPatterns(expenses);
    console.log("AI returned", aiInsights.length, "insights:", aiInsights);
    
    // Add AI-generated insights (they come with proper formatting already)
    aiInsights.forEach(insight => {
      insights.push({
        type: insight.type || 'info',
        icon: insight.icon || '📊',
        title: insight.title,
        description: insight.description
      });
    });
    
    // Calculate top category manually for summary
    const categoryTotals = {};
    expenses.forEach(exp => {
      const catName = exp.category?.name || 'Unknown';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(exp.amount);
    });
    
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ category: name, amount, percentage: (amount / total) * 100 }))
      .sort((a, b) => b.amount - a.amount);
    
    if (sortedCategories.length > 0 && sortedCategories[0].percentage > 30) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Top Spending Category',
        description: `${sortedCategories[0].category} accounts for ${sortedCategories[0].percentage.toFixed(1)}% of your total expenses (₹${sortedCategories[0].amount.toFixed(0)}).`
      });
    }
    
    // Run predictions only if we have enough data
    if (expenses.length >= 5) {
      console.log("Running predictions...");
      predictions = await aiService.predictNextMonth(expenses);
      
      if (predictions.total > 0) {
        insights.push({
          type: 'info',
          icon: '🔮',
          title: 'Next Month Prediction',
          description: `Based on your spending trends, you're likely to spend ₹${predictions.total.toFixed(0)} next month.`
        });
      }
    }
    
    console.log("Generated insights:", insights.length);
    console.log("About to call renderInsights()");
    renderInsights();
    console.log("renderInsights() completed");
    
  } catch (error) {
    console.error("!!! Error in analyzeSpendingPatterns:", error);
    console.error("Error stack:", error.stack);
    // Show error insight
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'AI Analysis Error',
      description: `Could not analyze patterns: ${error.message}. Make sure you've run the database schema.`
    });
    renderInsights();
  }
}
async function detectRecurring() {
  if (!aiService || expenses.length < 3) {
    console.log("Skipping recurring detection: insufficient expenses");
    return;
  }
  
  try {
    console.log("Detecting recurring expenses...");
    recurringExpenses = await aiService.detectRecurringExpenses(expenses);
    console.log("Found recurring expenses:", recurringExpenses.length);
    renderRecurring();
  } catch (error) {
    console.error("Error in detectRecurring:", error);
  }
}
function renderInsights() {
  console.log("=== renderInsights CALLED ===");
  console.log("insights array length:", insights.length);
  console.log("insights array:", insights);
  
  const container = document.getElementById('insightsContainer');
  const content = document.getElementById('insightsContent');
  console.log("Container found?", !!container);
  console.log("Content div found?", !!content);
  
  if (!container || !content) {
    console.log("!!! Insights container or content not found in DOM !!!");
    return;
  }
  
  if (insights.length === 0) {
    console.log("No insights, hiding container");
    container.style.display = 'none';
    content.innerHTML = '';
    return;
  }
  
  console.log("Rendering", insights.length, "insights...");
  container.style.display = 'block';
  content.innerHTML = insights.map((insight, index) => `
    <div class="insight-card ${insight.type}">
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-content">
        <div class="insight-title">${insight.title}</div>
        <div class="insight-description">${insight.description}</div>
      </div>
      <div class="insight-close" onclick="dismissInsight(${index})">×</div>
    </div>
  `).join('');
  
  console.log("Rendered HTML to container");
  
  // Update AI insights count in summary
  const aiCountElement = document.getElementById('insightCount');
  console.log("insightCount element found?", !!aiCountElement);
  
  if (aiCountElement) {
    aiCountElement.textContent = insights.length;
    console.log("Updated insight count to:", insights.length);
  } else {
    console.log("!!! insightCount element not found !!!");
  }
  
  console.log("=== renderInsights COMPLETED ===");
}
function renderRecurring() {
  const list = document.getElementById('recurringList');
  const alert = document.getElementById('recurringAlert');
  
  if (!list || !alert) return;
  
  if (recurringExpenses.length === 0) {
    alert.style.display = 'none';
    return;
  }
  
  alert.style.display = 'block';
  list.innerHTML = recurringExpenses.map(recurring => {
    const nextDueDate = new Date(recurring.nextDueDate);
    const daysUntil = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
      <div class="recurring-item">
        <div class="recurring-info">
          <h4>${recurring.description}</h4>
          <p>₹${recurring.amount.toFixed(0)} • ${recurring.frequency} • Next due: ${daysUntil} days</p>
        </div>
        <div class="recurring-actions">
          <button onclick="markRecurringPaid('${recurring.id}')">Mark Paid</button>
        </div>
      </div>
    `;
  }).join('');
}
window.dismissInsight = function(index) {
  insights.splice(index, 1);
  renderInsights();
};

// Close all insights at once
window.closeAllInsights = function() {
  insights = [];
  renderInsights();
  console.log('All insights dismissed');
};

window.markRecurringPaid = async function(recurringId) {
  // This would add a new expense and update the recurring record
  // For now, just remove from display
  recurringExpenses = recurringExpenses.filter(r => r.id !== recurringId);
  renderRecurring();
};

// Admin Panel Functions
function showAdminPanel() {
  // Insert admin panel after summary cards
  const summaryCards = document.querySelector('.summary-cards');
  if (!summaryCards) {
    console.error('Could not find summary-cards section');
    return;
  }
  
  // Check if admin panel already exists
  if (document.getElementById('adminPanel')) {
    console.log('Admin panel already exists');
    renderAdminContent();
    return;
  }
  
  const adminPanel = document.createElement('div');
  adminPanel.id = 'adminPanel';
  adminPanel.className = 'admin-panel';
  adminPanel.innerHTML = `
    <div class="admin-header">
      <h3>👨‍💼 Admin Panel</h3>
      <div class="admin-invite-code">
        <strong>Family Invite Code:</strong> 
        <span class="invite-code">${user.invite_code || 'N/A'}</span>
        <button onclick="copyInviteCode()" class="btn-icon" title="Copy invite code">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="admin-controls">
        <button class="admin-btn ${adminViewMode === 'consolidated' ? 'active' : ''}" onclick="switchAdminView('consolidated')">
          📊 Consolidated View
        </button>
        <button class="admin-btn ${adminViewMode === 'individual' ? 'active' : ''}" onclick="switchAdminView('individual')">
          👤 Individual View
        </button>
      </div>
    </div>
    <div id="adminContent"></div>
  `;
  
  // Insert after summary cards
  summaryCards.parentNode.insertBefore(adminPanel, summaryCards.nextSibling);
  console.log('✅ Admin panel rendered');
  renderAdminContent();
}

window.copyInviteCode = function() {
  const inviteCode = user.invite_code;
  if (!inviteCode) {
    alert("No invite code available");
    return;
  }
  
  navigator.clipboard.writeText(inviteCode).then(() => {
    alert(`✅ Invite code copied: ${inviteCode}\n\nShare this code with family members during registration.`);
  }).catch(err => {
    alert(`Invite code: ${inviteCode}\n\nCopy this and share with family members.`);
  });
};

window.switchAdminView = async function(mode) {
  adminViewMode = mode;
  selectedUserId = null;
  
  // Update button states
  document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  await loadExpenses();
  renderAdminContent();
  renderAll();
};

window.selectUser = async function(userId) {
  selectedUserId = userId;
  await loadExpenses();
  renderAll();
};

function renderAdminContent() {
  const content = document.getElementById('adminContent');
  if (!content) return;
  
  if (adminViewMode === 'consolidated') {
    renderConsolidatedView(content);
  } else {
    renderIndividualSelector(content);
  }
}

function renderConsolidatedView(container) {
  const userExpensesAll = {};
  const userExpensesMonth = {};
  let totalHousehold = 0;
  let totalThisMonth = 0;
  
  // Create a map of user IDs to phone numbers
  const userIdToPhone = {};
  allUsers.forEach(u => {
    userIdToPhone[u.id] = u.phone;
  });
  
  // Get current month/year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Group expenses by user (all time)
  expenses.forEach(e => {
    const userPhone = userIdToPhone[e.user_id];
    if (!userPhone) return; // Skip unknown users
    
    // All time stats
    if (!userExpensesAll[userPhone]) {
      userExpensesAll[userPhone] = {
        total: 0,
        count: 0,
        categories: {}
      };
    }
    userExpensesAll[userPhone].total += e.amount;
    userExpensesAll[userPhone].count += 1;
    totalHousehold += e.amount;
    
    // Track by category (all time)
    const catName = e.category?.name || 'Uncategorized';
    if (!userExpensesAll[userPhone].categories[catName]) {
      userExpensesAll[userPhone].categories[catName] = 0;
    }
    userExpensesAll[userPhone].categories[catName] += e.amount;
    
    // Current month stats
    const expDate = new Date(e.date);
    if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
      if (!userExpensesMonth[userPhone]) {
        userExpensesMonth[userPhone] = {
          total: 0,
          count: 0
        };
      }
      userExpensesMonth[userPhone].total += e.amount;
      userExpensesMonth[userPhone].count += 1;
      totalThisMonth += e.amount;
    }
  });
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[currentMonth];
  
  container.innerHTML = `
    <div class="consolidated-stats">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div class="household-total" style="background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);">
          <h2>${currentMonthName} ${currentYear}</h2>
          <div class="big-amount">₹${totalThisMonth.toFixed(0)}</div>
          <div class="stat-subtext">${Object.values(userExpensesMonth).reduce((sum, u) => sum + u.count, 0)} transactions</div>
        </div>
        <div class="household-total" style="background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);">
          <h2>All Time Total</h2>
          <div class="big-amount">₹${totalHousehold.toFixed(0)}</div>
          <div class="stat-subtext">${expenses.length} transactions</div>
        </div>
      </div>
      
      <div class="user-breakdown">
        <h3>Per User Breakdown (All Time)</h3>
        ${Object.entries(userExpensesAll).map(([phone, data]) => {
          const monthData = userExpensesMonth[phone] || { total: 0, count: 0 };
          return `
          <div class="user-card">
            <div class="user-header">
              <span class="user-phone">📱 ${phone}</span>
              <div>
                <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">
                  This month: ₹${monthData.total.toFixed(0)} (${monthData.count} txns)
                </div>
                <span class="user-total">Total: ₹${data.total.toFixed(0)}</span>
              </div>
            </div>
            <div class="user-stats">
              <span>${data.count} transactions</span>
              <span>${((data.total / totalHousehold) * 100).toFixed(1)}% of total</span>
            </div>
            <div class="user-categories">
              ${Object.entries(data.categories)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat, amt]) => `<span class="cat-tag">${cat}: ₹${amt.toFixed(0)}</span>`)
                .join('')}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderIndividualSelector(container) {
  container.innerHTML = `
    <div class="user-selector">
      <h3>Select User to View</h3>
      <div class="user-list">
        ${allUsers.map(u => `
          <button class="user-select-btn ${selectedUserId === u.id ? 'selected' : ''}" 
                  onclick="selectUser('${u.id}')">
            📱 ${u.phone}
            ${selectedUserId === u.id ? ' ✓' : ''}
          </button>
        `).join('')}
      </div>
      ${selectedUserId ? `
        <div class="selected-user-info">
          <p>Viewing expenses for: <strong>${allUsers.find(u => u.id === selectedUserId)?.phone}</strong></p>
        </div>
      ` : '<p class="hint">Select a user to view their expenses</p>'}
    </div>
  `;
}

// Render Detailed Analytics
function renderDetailedAnalytics() {
  if (expenses.length === 0) return;
  
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const expDate = new Date(e.date);
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  
  const lastMonth = expenses.filter(e => {
    const expDate = new Date(e.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear();
  });
  
  // 1. Spending Summary
  const totalThisMonth = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const totalLastMonth = lastMonth.reduce((sum, e) => sum + e.amount, 0);
  
  console.log('📊 Spending Summary Debug:');
  console.log(`October expenses count: ${lastMonth.length}`);
  console.log(`October total: ₹${totalLastMonth}`);
  console.log('October expenses details:');
  lastMonth.forEach(e => {
    console.log(`  ${e.date} - ${e.description || e.note}: ₹${e.amount} (amount_inr: ${e.amount_inr}, currency: ${e.currency})`);
  });
  
  const avgPerDay = thisMonth.length > 0 ? totalThisMonth / now.getDate() : 0;
  const projectedMonth = avgPerDay * 30;
  const changePercent = totalLastMonth > 0 ? (((totalThisMonth - totalLastMonth) / totalLastMonth) * 100).toFixed(1) : 0;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[now.getMonth()];
  const lastMonthName = monthNames[now.getMonth() - 1] || monthNames[11];
  
  document.getElementById('spendingSummary').innerHTML = `
    <div class="analytics-stat">
      <div class="analytics-stat-label">This Month (${currentMonthName})</div>
      <div class="analytics-stat-value">₹${totalThisMonth.toFixed(0)}</div>
      <div class="analytics-stat-subtext">${thisMonth.length} transactions</div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">Last Month (${lastMonthName})</div>
      <div class="analytics-stat-value">₹${totalLastMonth.toFixed(0)}</div>
      <div class="analytics-stat-subtext" style="color: ${changePercent > 0 ? '#f5576c' : '#43bfa0'}">
        ${changePercent > 0 ? '↑' : '↓'} ${Math.abs(changePercent)}% change
      </div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">Daily Average</div>
      <div class="analytics-stat-value">₹${avgPerDay.toFixed(0)}</div>
      <div class="analytics-stat-subtext">Last ${now.getDate()} days</div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">Projected (30 days)</div>
      <div class="analytics-stat-value">₹${projectedMonth.toFixed(0)}</div>
      <div class="analytics-stat-subtext">At current rate</div>
    </div>
  `;
  
  // 2. Top Categories
  const categoryTotals = {};
  thisMonth.forEach(e => {
    const catName = e.category?.name || 'Unknown';
    const catIcon = e.category?.icon || '❓';
    const catColor = e.category?.color || '#a0aec0';
    if (!categoryTotals[catName]) {
      categoryTotals[catName] = { amount: 0, count: 0, icon: catIcon, color: catColor };
    }
    categoryTotals[catName].amount += e.amount;
    categoryTotals[catName].count += 1;
  });
  
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5);
  
  document.getElementById('topCategories').innerHTML = topCategories.map(([name, data]) => `
    <div class="top-item">
      <div class="top-item-left">
        <div class="top-item-icon" style="background: ${data.color}20">${data.icon}</div>
        <div class="top-item-details">
          <div class="top-item-name">${name}</div>
          <div class="top-item-count">${data.count} transactions</div>
        </div>
      </div>
      <div class="top-item-amount">₹${data.amount.toFixed(0)}</div>
    </div>
  `).join('');
  
  // 3. Spending Patterns
  const dayOfWeek = {};
  const hourOfDay = {};
  thisMonth.forEach(e => {
    const date = new Date(e.date);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    
    dayOfWeek[day] = (dayOfWeek[day] || 0) + (e.amount_inr || e.amount);
    
    if (hour < 12) hourOfDay['Morning'] = (hourOfDay['Morning'] || 0) + (e.amount_inr || e.amount);
    else if (hour < 17) hourOfDay['Afternoon'] = (hourOfDay['Afternoon'] || 0) + (e.amount_inr || e.amount);
    else hourOfDay['Evening'] = (hourOfDay['Evening'] || 0) + (e.amount_inr || e.amount);
  });
  
  const topDay = Object.entries(dayOfWeek).sort((a, b) => b[1] - a[1])[0];
  const topTime = Object.entries(hourOfDay).sort((a, b) => b[1] - a[1])[0];
  const avgTransaction = totalThisMonth / thisMonth.length;
  
  document.getElementById('spendingPatterns').innerHTML = `
    <div class="analytics-stat">
      <div class="analytics-stat-label">Highest Spending Day</div>
      <div class="analytics-stat-value">${topDay?.[0] || 'N/A'}</div>
      <div class="analytics-stat-subtext">₹${topDay?.[1].toFixed(0) || 0}</div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">Highest Spending Time</div>
      <div class="analytics-stat-value">${topTime?.[0] || 'N/A'}</div>
      <div class="analytics-stat-subtext">₹${topTime?.[1].toFixed(0) || 0}</div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">Avg Transaction</div>
      <div class="analytics-stat-value">₹${avgTransaction.toFixed(0)}</div>
      <div class="analytics-stat-subtext">${thisMonth.length} this month</div>
    </div>
  `;
  
  // 4. AI Predictions
  const aiPredictionsHTML = [];
  
  if (totalLastMonth > 0 && projectedMonth > totalLastMonth * 1.2) {
    aiPredictionsHTML.push(`
      <div class="prediction-item alert">
        <div class="prediction-title">⚠️ High Spending Alert</div>
        <div class="prediction-text">You're on track to spend ₹${projectedMonth.toFixed(0)} this month, which is ${((projectedMonth/totalLastMonth - 1) * 100).toFixed(0)}% higher than last month. Consider reviewing your expenses.</div>
      </div>
    `);
  }
  
  if (totalLastMonth > 0 && avgPerDay > (totalLastMonth / 30) * 1.3) {
    aiPredictionsHTML.push(`
      <div class="prediction-item warning">
        <div class="prediction-title">📊 Daily Average Increase</div>
        <div class="prediction-text">Your daily average of ₹${avgPerDay.toFixed(0)} is higher than usual. Top spending: ${topCategories[0]?.[0] || 'N/A'}</div>
      </div>
    `);
  }
  
  if (aiPredictionsHTML.length === 0) {
    if (thisMonth.length === 0) {
      aiPredictionsHTML.push(`
        <div class="prediction-item">
          <div class="prediction-title">📝 No Data Yet</div>
          <div class="prediction-text">No expenses recorded this month. Add your first expense to see insights!</div>
        </div>
      `);
    } else {
      aiPredictionsHTML.push(`
        <div class="prediction-item">
          <div class="prediction-title">✅ On Track</div>
          <div class="prediction-text">Your spending is consistent with last month. Keep up the good work!</div>
        </div>
      `);
    }
  }
  
  document.getElementById('aiPredictions').innerHTML = aiPredictionsHTML.join('');
  
  // 5. Expense Type Breakdown
  const typeBreakdown = { personal: 0, business: 0, travel: 0 };
  thisMonth.forEach(e => {
    const type = e.expense_type || 'personal';
    typeBreakdown[type] += (e.amount_inr || e.amount);
  });
  
  document.getElementById('expenseTypeBreakdown').innerHTML = `
    <div class="analytics-stat">
      <div class="analytics-stat-label">👤 Personal</div>
      <div class="analytics-stat-value">₹${typeBreakdown.personal.toFixed(0)}</div>
      <div class="analytics-stat-subtext">${totalThisMonth > 0 ? ((typeBreakdown.personal/totalThisMonth)*100).toFixed(0) : 'NaN'}%</div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">💼 Business</div>
      <div class="analytics-stat-value">₹${typeBreakdown.business.toFixed(0)}</div>
      <div class="analytics-stat-subtext">${totalThisMonth > 0 ? ((typeBreakdown.business/totalThisMonth)*100).toFixed(0) : 'NaN'}% (Reimbursable)</div>
    </div>
    <div class="analytics-stat">
      <div class="analytics-stat-label">✈️ Travel</div>
      <div class="analytics-stat-value">₹${typeBreakdown.travel.toFixed(0)}</div>
      <div class="analytics-stat-subtext">${totalThisMonth > 0 ? ((typeBreakdown.travel/totalThisMonth)*100).toFixed(0) : 'NaN'}%</div>
    </div>
  `;
  
  // 6. Currency Summary
  const currencyBreakdown = {};
  thisMonth.forEach(e => {
    const curr = e.currency || 'INR';
    if (!currencyBreakdown[curr]) {
      currencyBreakdown[curr] = { original: 0, inr: 0 };
    }
    currencyBreakdown[curr].original += (e.original_amount || e.amount);
    currencyBreakdown[curr].inr += (e.amount_inr || e.amount);
  });
  
  document.getElementById('currencySummary').innerHTML = Object.entries(currencyBreakdown).map(([curr, data]) => `
    <div class="analytics-stat">
      <div class="analytics-stat-label">${curr}</div>
      <div class="analytics-stat-value">${curr === 'INR' ? '₹' : curr + ' '}${data.original.toFixed(0)}</div>
      ${curr !== 'INR' ? `<div class="analytics-stat-subtext">≈ ₹${data.inr.toFixed(0)}</div>` : ''}
    </div>
  `).join('');
}
// Render all
function renderAll() {
  console.log("renderAll called, expenses count:", expenses.length);
  try {
    renderSummary();
    renderExpenseList();
    renderCategoryChart();
    renderTrendChart();
    renderDetailedAnalytics(); // Add detailed analytics
    if (isAdmin && document.getElementById('adminContent')) {
      renderAdminContent(); // Refresh admin panel if it exists
    }
    // Check budget alerts
    if (window.checkAndShowBudgetAlerts) {
      window.checkAndShowBudgetAlerts();
    }
    console.log("All rendering completed successfully");
  } catch (error) {
    console.error("Error in renderAll:", error);
  }
}
function renderSummary() {
  // Get current month expenses
  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const expDate = new Date(e.date);
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  
  const total = currentMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const count = currentMonthExpenses.length;
  
  // Calculate monthly average (simplified)
  const monthlyAvg = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) / Math.max(1, new Set(expenses.map(e => e.date.slice(0, 7))).size);
  
  document.getElementById("totalAmount").textContent = `₹${total.toFixed(0)}`;
  document.getElementById("expenseCount").textContent = count;
  document.getElementById("monthlyAvg").textContent = `₹${monthlyAvg.toFixed(0)}`;
  
  // Update AI insights count
  const insightCountElement = document.getElementById('insightCount');
  if (insightCountElement) {
    insightCountElement.textContent = insights.length;
  }
}
function renderExpenseList() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";
  
  if (expenses.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #a0aec0;">No expenses found</p>';
    return;
  }
  
  expenses.forEach(exp => {
    const item = document.createElement("div");
    item.className = "expense-item";
    
    const category = exp.category || { name: "Unknown", icon: "❓", color: "#a0aec0" };
    const subcategory = exp.subcategory || null;
    
    // Currency display
    const currency = exp.currency || 'INR';
    const originalAmount = exp.original_amount || exp.amount;
    const amountINR = exp.amount; // Always use amount field as the source of truth
    const expenseType = exp.expense_type || 'personal';
    const location = exp.location;
    
    console.log(`Rendering expense ${exp.id}: amount=${exp.amount}, amount_inr=${exp.amount_inr}, display=${amountINR}`);
    
    let amountDisplay = `₹${parseFloat(amountINR).toFixed(0)}`;
    if (currency !== 'INR') {
      amountDisplay = `${currency} ${parseFloat(originalAmount).toFixed(2)}<br><small>₹${parseFloat(amountINR).toFixed(0)}</small>`;
    }
    
    // Type badge
    const typeBadge = expenseType !== 'personal' ? 
      `<span class="expense-type ${expenseType}">${expenseType === 'business' ? '💼' : '✈️'}</span>` : '';
    
    // Business badge
    const businessBadge = exp.business_name ? 
      `<span class="expense-business">🏢 ${exp.business_name}</span>` : '';
    
    // Payment status badge
    const paymentStatus = exp.payment_status || 'paid';
    const paymentBadge = paymentStatus === 'unpaid' ? 
      `<span class="expense-payment-status unpaid" title="Unpaid">⏳ Unpaid</span>` : 
      `<span class="expense-payment-status paid" title="Paid">✅</span>`;
    
    // Payment method display
    const paymentMethod = exp.payment_method || 'cash';
    const paymentMethodIcon = {
      cash: '💵',
      bank: '🏦',
      credit_card: '💳',
      debit_card: '💳',
      upi: '📱',
      wallet: '👛'
    }[paymentMethod] || '💳';
    
    item.innerHTML = `
      <div class="expense-icon" style="background: ${category.color}">
        ${category.icon}
      </div>
      <div class="expense-details">
        <div class="expense-category">${category.name} ${typeBadge} ${businessBadge} ${paymentBadge}</div>
        ${subcategory ? `<div class="expense-subcategory">${subcategory.icon} ${subcategory.name}</div>` : ''}
        ${exp.note ? `<div class="expense-note">${exp.note}</div>` : ''}
        ${location ? `<div class="expense-location">📍 ${location}</div>` : ''}
        <div class="expense-date">${new Date(exp.date).toLocaleString()} ${paymentMethodIcon}</div>
      </div>
      <div class="expense-amount">${amountDisplay}</div>
      <div class="expense-actions">
        <button class="btn-edit" onclick="editExpense('${exp.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteExpense('${exp.id}')"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    list.appendChild(item);
  });
}
// Edit expense
window.editExpense = async function(id) {
  const expense = expenses.find(e => e.id === id);
  if (!expense) return;
  
  editingExpenseId = id;
  document.getElementById("editAmount").value = expense.amount;
  document.getElementById("editCategory").value = expense.category_id;
  populateSubcategorySelect(expense.category_id, document.getElementById("editSubcategory"));
  document.getElementById("editSubcategory").value = expense.subcategory_id || "";
  document.getElementById("editNote").value = expense.note || "";
  document.getElementById("editDate").value = new Date(expense.date).toISOString().slice(0, 16);
  
  document.getElementById("editModal").style.display = "block";
};
async function saveEdit() {
  const amount = parseFloat(document.getElementById("editAmount").value);
  const categoryId = document.getElementById("editCategory").value;
  const subcategoryId = document.getElementById("editSubcategory").value;
  const note = document.getElementById("editNote").value;
  const date = document.getElementById("editDate").value;
  
  console.log("💾 Saving edit for expense:", editingExpenseId);
  console.log("New amount:", amount);
  console.log("New category:", categoryId);
  console.log("New subcategory:", subcategoryId);
  
  if (!amount || !categoryId) {
    alert("Amount and category are required");
    return;
  }
  
  const updateData = {
    amount,
    category_id: categoryId,
    subcategory_id: subcategoryId || null,
    note,
    date: new Date(date).toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log("Update data:", updateData);
  
  try {
    await window.syncManager.update('expenses', editingExpenseId, updateData);
    console.log("✅ Expense updated successfully");
    
    document.getElementById("editModal").style.display = "none";
    
    console.log("Reloading expenses...");
    await loadExpenses();
    
    console.log("Re-analyzing patterns...");
    await analyzeSpendingPatterns();
    
    console.log("Rendering UI...");
    renderAll();
    
    console.log("Edit complete!");
  } catch (error) {
    console.error("Error updating expense:", error);
    alert("Error updating expense: " + error.message);
  }
}
// Delete expense
window.deleteExpense = async function(id) {
  if (!confirm("Are you sure you want to delete this expense?")) return;
  
  try {
    await window.syncManager.delete('expenses', id);
    await loadExpenses();
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Error deleting expense");
  }
};
// Charts
let categoryChart, trendChart;
function renderCategoryChart() {
  try {
    const canvas = document.getElementById("categoryChart");
    if (!canvas) {
      console.error("categoryChart canvas not found");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    
    const categoryTotals = {};
    const categoryColors = {};
    
    expenses.forEach(exp => {
      const catName = exp.category?.name || "Unknown";
      const catColor = exp.category?.color || "#a0aec0";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(exp.amount);
      categoryColors[catName] = catColor;
    });
    
    if (categoryChart) {
      categoryChart.destroy();
      categoryChart = null;
    }
    
    if (Object.keys(categoryTotals).length === 0) {
      console.log("No data for category chart");
      return;
    }
    
    categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: Object.keys(categoryTotals).map(k => categoryColors[k])
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
    console.log("Category chart rendered successfully");
  } catch (error) {
    console.error("Error rendering category chart:", error);
  }
}
function renderTrendChart() {
  try {
    const canvas = document.getElementById("trendChart");
    if (!canvas) {
      console.error("trendChart canvas not found");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    
    // Group by date
    const dailyTotals = {};
    expenses.forEach(exp => {
      const date = exp.date.slice(0, 10);
      dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(exp.amount);
    });
    
    const sortedDates = Object.keys(dailyTotals).sort();
    const values = sortedDates.map(d => dailyTotals[d]);
    
    if (trendChart) {
      trendChart.destroy();
      trendChart = null;
    }
    
    if (sortedDates.length === 0) {
      console.log("No data for trend chart");
      return;
    }
    
    trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: sortedDates,
        datasets: [{
          label: "Daily Spending",
          data: values,
          borderColor: "#8B7355",
        backgroundColor: "rgba(139, 115, 85, 0.1)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
    console.log("Trend chart rendered successfully");
  } catch (error) {
    console.error("Error rendering trend chart:", error);
  }
}
// Export CSV - moved to setupEventHandlers
function exportCSV() {
  if (expenses.length === 0) {
    alert("No expenses to export");
    return;
  }
  
  const csv = "Date,Category,Subcategory,Amount,Note\n" + 
    expenses.map(e => 
      `${new Date(e.date).toLocaleString()},${e.category?.name || ""},${e.subcategory?.name || ""},${e.amount},"${e.note || ""}"`
    ).join("\n");
  
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
// Category Management Functions
async function openCategoryModal() {
  document.getElementById("categoryModal").style.display = "block";
  
  // Populate parent category select
  const parentSelect = document.getElementById("parentCategorySelect");
  parentSelect.innerHTML = '<option value="">Select Parent Category</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = `${cat.icon} ${cat.name}`;
    parentSelect.appendChild(option);
  });
  
  renderCategoriesList();
}
async function addCategory() {
  const name = document.getElementById("newCategoryName").value.trim();
  const icon = document.getElementById("newCategoryIcon").value.trim();
  const color = document.getElementById("newCategoryColor").value;
  
  if (!name || !icon) {
    alert("Please enter category name and icon");
    return;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("categories")
    .insert([{ user_id: user.id, name, icon, color }])
    .select();
  
  if (error) {
    console.error(error);
    alert("Error adding category: " + error.message);
    return;
  }
  
  // Clear inputs
  document.getElementById("newCategoryName").value = "";
  document.getElementById("newCategoryIcon").value = "";
  document.getElementById("newCategoryColor").value = "#43bfa0";
  
  // Reload and refresh
  await loadCategories();
  renderAll();
  openCategoryModal();
  alert(`✅ Category "${name}" added successfully!`);
}
async function addSubcategory() {
  const categoryId = document.getElementById("parentCategorySelect").value;
  const name = document.getElementById("newSubcategoryName").value.trim();
  const icon = document.getElementById("newSubcategoryIcon").value.trim();
  
  if (!categoryId || !name || !icon) {
    alert("Please select parent category and enter subcategory name and icon");
    return;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("subcategories")
    .insert([{ user_id: user.id, category_id: categoryId, name, icon }])
    .select();
  
  if (error) {
    console.error(error);
    alert("Error adding subcategory: " + error.message);
    return;
  }
  
  // Clear inputs
  document.getElementById("parentCategorySelect").value = "";
  document.getElementById("newSubcategoryName").value = "";
  document.getElementById("newSubcategoryIcon").value = "";
  
  // Reload and refresh
  await loadCategories();
  renderAll();
  openCategoryModal();
  alert(`✅ Subcategory "${name}" added successfully!`);
}
function renderCategoriesList() {
  const container = document.getElementById("categoriesList");
  container.innerHTML = "";
  
  categories.forEach(cat => {
    const catSubs = subcategories.filter(s => s.category_id === cat.id);
    
    const div = document.createElement("div");
    div.className = "category-item";
    div.innerHTML = `
      <div class="category-info">
        <div class="category-icon" style="background: ${cat.color};">${cat.icon}</div>
        <div class="category-details">
          <h4>${cat.name}</h4>
          <p>${catSubs.length} subcategories</p>
          <div>
            ${catSubs.map(s => `
              <span class="subcategory-badge">
                ${s.icon} ${s.name}
                <button class="subcategory-delete-btn" onclick="deleteSubcategory('${s.id}', '${s.name}')" title="Delete subcategory">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="category-actions">
        <button class="btn-delete" onclick="deleteCategory('${cat.id}', '${cat.name}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}
async function deleteCategory(categoryId, categoryName) {
  if (!confirm(`Are you sure you want to delete "${categoryName}"? This will set expenses with this category to "Uncategorized".`)) {
    return;
  }
  
  try {
    // First, update expenses to set category_id to null
    const { error: expenseError } = await supabase
      .from("expenses")
      .update({ category_id: null, subcategory_id: null })
      .eq("category_id", categoryId);
    
    if (expenseError) {
      console.error("Error updating expenses:", expenseError);
      alert("Error updating expenses: " + expenseError.message);
      return;
    }
    
    // Delete budgets associated with this category
    const { error: budgetError } = await supabase
      .from("budgets")
      .delete()
      .eq("category_id", categoryId);
    
    if (budgetError) {
      console.error("Error deleting budgets:", budgetError);
    }
    
    // Delete subcategories
    const { error: subcatError } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", categoryId);
    
    if (subcatError) {
      console.error("Error deleting subcategories:", subcatError);
    }
    
    // Finally, delete the category
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);
    
    if (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category: " + error.message);
      return;
    }
    
    await loadCategories();
    await loadExpenses();
    renderAll();
    openCategoryModal();
    alert(`✅ Category "${categoryName}" deleted successfully!`);
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred: " + err.message);
  }
}
// Make deleteCategory available globally
window.deleteCategory = deleteCategory;

async function deleteSubcategory(subcategoryId, subcategoryName) {
  const { error } = await supabase
    .from("subcategories")
    .delete()
    .eq("id", subcategoryId);
  
  if (error) {
    console.error(error);
    alert("Error deleting subcategory: " + error.message);
    return;
  }
  
  await loadCategories();
  await loadExpenses();
  renderAll();
  openCategoryModal();
}
// Make deleteSubcategory available globally
window.deleteSubcategory = deleteSubcategory;

// SMS Parsing Functions
function openSmsModal() {
  document.getElementById('smsModal').style.display = 'block';
  document.getElementById('smsText').value = '';
  document.getElementById('smsResult').style.display = 'none';
}

window.closeSmsModal = function() {
  document.getElementById('smsModal').style.display = 'none';
};

function parseSms() {
  const smsText = document.getElementById('smsText').value.trim();
  
  if (!smsText) {
    alert('Please paste an SMS message');
    return;
  }
  
  // Parse SMS patterns from various Indian banks
  const parsed = parseBankSms(smsText);
  
  if (parsed) {
    // Ensure currency is set
    parsed.currency = parsed.currency || 'INR';
    
    // Show result
    const resultDiv = document.getElementById('smsResult');
    resultDiv.style.display = 'block';
    
    // Get currency symbol
    const currencySymbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'AED ', 'SAR': 'SAR ', 'SGD': 'SGD ', 'MYR': 'MYR ', 'THB': 'THB ', 'JPY': '¥', 'CNY': '¥' };
    const symbol = currencySymbols[parsed.currency] || parsed.currency + ' ';
    
    console.log('📊 Displaying parsed result:', { currency: parsed.currency, symbol, date: parsed.date });
    
    resultDiv.innerHTML = `
      <div class="sms-parsed">
        <h3>✅ Transaction Detected</h3>
        <div class="parsed-field"><strong>Amount:</strong> ${symbol}${parsed.amount}</div>
        <div class="parsed-field"><strong>Currency:</strong> ${parsed.currency}</div>
        <div class="parsed-field"><strong>Merchant:</strong> ${parsed.merchant}</div>
        ${parsed.location ? `<div class="parsed-field"><strong>Location:</strong> ${parsed.location}</div>` : ''}
        <div class="parsed-field"><strong>Date:</strong> ${parsed.date || 'Today'}</div>
        <button onclick="applySmsToForm(${parsed.amount}, '${parsed.merchant.replace(/'/g, "\\'")}', '${(parsed.location || '').replace(/'/g, "\\'")}', '${parsed.date || ''}', '${parsed.currency}')" class="btn-primary">
          <i class="fas fa-check"></i> Add This Expense
        </button>
      </div>
    `;
  } else {
    alert('❌ Could not parse transaction details. Please ensure it\'s a valid bank SMS.');
  }
}

function parseBankSms(sms) {
  const text = sms.toLowerCase();
  let amount = null;
  let merchant = '';
  let location = '';
  let date = '';
  let currency = 'INR'; // Default currency
  
  // ===== CURRENCY DETECTION =====
  console.log('🔍 Parsing SMS:', sms.substring(0, 100));
  
  // Order matters: Check specific currencies first, then generic terms
  const currencyMap = [
    // Specific currencies first (higher priority)
    { keywords: ['aed', 'dirham', 'dhs'], code: 'AED' },
    { keywords: ['usd', 'dollar', '$'], code: 'USD' },
    { keywords: ['eur', 'euro', '€'], code: 'EUR' },
    { keywords: ['gbp', 'pound', '£'], code: 'GBP' },
    { keywords: ['sar', 'riyal'], code: 'SAR' },
    { keywords: ['sgd'], code: 'SGD' },
    { keywords: ['myr', 'ringgit'], code: 'MYR' },
    { keywords: ['thb', 'baht'], code: 'THB' },
    { keywords: ['jpy', 'yen', '¥'], code: 'JPY' },
    { keywords: ['cny', 'yuan'], code: 'CNY' },
    // Generic INR terms last (lowest priority)
    { keywords: ['inr', 'rupee', 'rupees', 'rs.', 'rs', '₹'], code: 'INR' }
  ];
  
  // Detect currency from SMS text (case-insensitive)
  for (const { keywords, code } of currencyMap) {
    if (keywords.some(keyword => text.includes(keyword))) {
      currency = code;
      console.log('💱 Detected currency:', code, 'from keyword in:', keywords);
      break;
    }
  }
  
  // ===== INTELLIGENT AMOUNT EXTRACTION =====
  // Step 1: Find amounts with transaction keywords (highest priority)
  const transactionKeywords = ['debited', 'credited', 'paid', 'sent', 'received', 'spent', 'withdrawn', 'payment', 'refund', 'txn', 'transaction', 'purchase', 'charge'];
  const priorityAmounts = [];
  
  for (const keyword of transactionKeywords) {
    // Match: "payment of Rs. 113.00" or "paid 113.00" or "debited INR 1,099.00" or "debited AED 50.00"
    const pattern = new RegExp(`${keyword}[\\s:of]*[\\s]*(rs\\.?|inr|aed|usd|eur|gbp|sar|₹|\\$|€|£)?[\\s]?([\\d,]+(?:\\.\\d{1,2})?)`, 'gi');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const amt = parseFloat(match[2].replace(/,/g, ''));
      if (amt >= 0.01 && amt <= 1000000) {
        priorityAmounts.push({ amount: amt, priority: 10, context: keyword });
      }
    }
  }
  
  // Step 2: Extract all amounts with currency symbols (medium priority)
  const currencySymbols = ['₹', '$', '€', '£', '¥', 'aed', 'sar', 'inr', 'usd', 'eur', 'gbp', 'jpy', 'cny', 'sgd', 'myr', 'thb', 'rs', 'rupees', 'dollars', 'euros', 'pounds'];
  const allAmounts = [];
  
  // Pattern: Rs.113.00 or $99.99 or INR 1,099.00
  const pattern1 = new RegExp(`([${currencySymbols.join('')}]|${currencySymbols.join('|')})[\\s.]?([\\d,]+(?:\\.\\d{1,2})?)`, 'gi');
  let match;
  while ((match = pattern1.exec(sms)) !== null) {
    const amt = parseFloat(match[2].replace(/,/g, ''));
    if (amt >= 0.01 && amt <= 1000000) {
      allAmounts.push({ amount: amt, priority: 5, context: 'currency' });
    }
  }
  
  // Step 3: Exclude balance amounts (lowest priority)
  const balanceKeywords = ['balance', 'bal', 'available', 'remaining', 'updated', 'current'];
  const excludePositions = [];
  
  for (const keyword of balanceKeywords) {
    const idx = text.indexOf(keyword);
    if (idx !== -1) {
      excludePositions.push({ start: idx, end: idx + 50 }); // Exclude 50 chars after balance keyword
    }
  }
  
  // Step 4: Filter out amounts that appear near balance keywords
  const filteredAmounts = allAmounts.filter(item => {
    const amountStr = item.amount.toString();
    const amountIdx = sms.toLowerCase().indexOf(amountStr);
    
    // Check if amount appears in excluded zone
    for (const zone of excludePositions) {
      if (amountIdx >= zone.start && amountIdx <= zone.end) {
        return false; // Skip this amount (it's a balance)
      }
    }
    return true;
  });
  
  // Step 5: Select the best amount
  // Priority: transaction keyword amounts > other amounts
  const candidates = [...priorityAmounts, ...filteredAmounts];
  
  if (candidates.length > 0) {
    // Sort by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);
    amount = candidates[0].amount;
    console.log('💰 Selected amount:', amount, 'from', candidates.length, 'candidates');
  }
  
  // ===== INTELLIGENT MERCHANT EXTRACTION =====
  const merchantPatterns = [
    // Pattern 1: "at MERCHANT" or "to MERCHANT"
    /(?:at|to|from)\s+([A-Z][A-Za-z0-9@\s\-'&.*]{2,40}?)(?:\s+(?:on|dated|by|upi|ref|bal|not|for|from|via)|$)/i,
    
    // Pattern 2: UPI ID (anything@anything)
    /([A-Za-z0-9._-]+@[A-Za-z0-9._-]+)/i,
    
    // Pattern 3: Between slashes in UPI reference (UPI/DR/REF/MERCHANT NAME/)
    /upi[\/\w]*\/[^\/]*\/[^\/]*\/([A-Z][A-Z\s]{3,30}?)\//i,
    
    // Pattern 4: After "for" keyword
    /\bfor\s+([A-Z][A-Za-z\s]{2,30}?)(?:\s+order|\s+on|\s+dated|$)/i,
    
    // Pattern 5: After "using" keyword  
    /\busing\s+([A-Z][A-Za-z\s]{2,30}?)(?:\s+is|\s+on|$)/i,
    
    // Pattern 6: Card ending (for card transactions)
    /(?:card|a\/c).*?(?:ending|no\.?|x)(\d{4})/i,
  ];
  
  for (const pattern of merchantPatterns) {
    const match = sms.match(pattern);
    if (match && match[1]) {
      merchant = match[1].trim();
      // Clean up merchant name
      merchant = merchant
        .replace(/\s+/g, ' ')
        .replace(/^(to|from|at)\s+/i, '')
        .substring(0, 50);
      if (merchant.length >= 3) break; // Valid merchant found
    }
  }
  
  // Fallback: Detect popular services/brands
  const knownMerchants = [
    'swiggy', 'zomato', 'zepto', 'blinkit', 'dunzo', 'amazon', 'flipkart', 'myntra',
    'uber', 'ola', 'rapido', 'netflix', 'spotify', 'prime', 'hotstar', 'jio',
    'airtel', 'vodafone', 'paytm', 'phonepe', 'gpay', 'googlepay', 'bhim',
    'makemytrip', 'goibibo', 'oyo', 'cleartrip', 'irctc', 'dominos', 'mcdonalds',
    'starbucks', 'kfc', 'pizzahut', 'subway', 'burgerking'
  ];
  
  if (!merchant || merchant.length < 3) {
    for (const brand of knownMerchants) {
      if (text.includes(brand)) {
        merchant = brand.charAt(0).toUpperCase() + brand.slice(1);
        break;
      }
    }
  }
  
  // ===== INTELLIGENT DATE EXTRACTION =====
  const datePatterns = [
    // DD-MON-YYYY (03-NOV-2025)
    /(\d{1,2})[-\/\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-\/\s](\d{2,4})/i,
    
    // DD-MM-YYYY or DD/MM/YYYY or DD-MM-YY
    /(?:on|dated?)\s*[:\s]*(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/i,
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
    
    // YYYY-MM-DD
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = sms.match(pattern);
    if (dateMatch) {
      try {
        let day, month, year;
        
        // Check if month is a name
        if (isNaN(dateMatch[2])) {
          const monthMap = {
            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
            'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
            'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
          };
          day = dateMatch[1].padStart(2, '0');
          month = monthMap[dateMatch[2].toLowerCase()] || '01';
          year = dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3];
        } 
        // Check if it's YYYY-MM-DD format
        else if (dateMatch[1].length === 4) {
          year = dateMatch[1];
          month = dateMatch[2].padStart(2, '0');
          day = dateMatch[3].padStart(2, '0');
        }
        // DD-MM-YYYY format
        else {
          day = dateMatch[1].padStart(2, '0');
          month = dateMatch[2].padStart(2, '0');
          year = dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3];
        }
        
        date = `${year}-${month}-${day}`;
        break;
      } catch (e) {
        console.log('Date parsing error:', e);
      }
    }
  }
  
  // If no date found, use today
  if (!date) {
    const today = new Date();
    date = today.toISOString().split('T')[0];
    console.log('📅 No date found in SMS, using today:', date);
  }
  
  // ===== VALIDATION =====
  if (amount && merchant) {
    console.log('✅ Parsed SMS - amount:', amount, 'merchant:', merchant, 'currency:', currency, 'location:', location, 'date:', date);
    return { amount, merchant, location, date, currency };
  }
  
  console.log('❌ Failed to parse SMS:', { amount, merchant, text: sms.substring(0, 100) });
  return null;
}

window.applySmsToForm = function(amount, merchant, location, date, currency = 'INR') {
  console.log('📝 Applying SMS to form:', { amount, merchant, location, date, currency });
  
  // Fill the form
  document.getElementById('amount').value = amount;
  document.getElementById('note').value = merchant;
  
  // Set currency
  const currencySelect = document.getElementById('currency');
  if (currencySelect && currency) {
    currencySelect.value = currency;
    console.log('💱 Set currency to:', currency);
  }
  
  if (location) {
    document.getElementById('locationInput').value = location;
    console.log('📍 Set location to:', location);
  }
  
  // Always set date - use today if not provided
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    if (date && date.trim()) {
      // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
      try {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        dateInput.value = formattedDate;
        console.log('📅 Set date to:', formattedDate);
      } catch (e) {
        console.error('Date parsing error:', e);
        // Fallback to today
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    } else {
      // Fallback to today if date is empty
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log('📅 Date was empty, set to today:', dateInput.value);
    }
  }
  
  // Close modal
  closeSmsModal();
  
  // Scroll to form
  document.querySelector('.add-expense-card').scrollIntoView({ behavior: 'smooth' });
  
  alert('✅ Expense details filled! Select category and click Add.');
};

// Merchant Whitelist Management
let trustedMerchants = JSON.parse(localStorage.getItem('trustedMerchants') || '[]');
let autoCapture = localStorage.getItem('autoCapture') === 'true';

window.switchSmsTab = function(tab) {
  // Hide all tabs
  document.querySelectorAll('.sms-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sms-tab').forEach(t => t.classList.remove('active'));
  
  // Show selected tab
  if (tab === 'manual') {
    document.getElementById('manualTab').classList.add('active');
    document.querySelector('.sms-tab:nth-child(1)').classList.add('active');
  } else if (tab === 'auto') {
    document.getElementById('autoTab').classList.add('active');
    document.querySelector('.sms-tab:nth-child(2)').classList.add('active');
    renderMerchantList();
  } else if (tab === 'share') {
    document.getElementById('shareTab').classList.add('active');
    document.querySelector('.sms-tab:nth-child(3)').classList.add('active');
  }
};

window.addTrustedMerchant = function() {
  const input = document.getElementById('newMerchant');
  const merchant = input.value.trim().toUpperCase();
  
  if (!merchant) {
    alert('Please enter a merchant name');
    return;
  }
  
  if (trustedMerchants.includes(merchant)) {
    alert('Merchant already in list');
    return;
  }
  
  trustedMerchants.push(merchant);
  localStorage.setItem('trustedMerchants', JSON.stringify(trustedMerchants));
  input.value = '';
  renderMerchantList();
};

window.removeTrustedMerchant = function(merchant) {
  trustedMerchants = trustedMerchants.filter(m => m !== merchant);
  localStorage.setItem('trustedMerchants', JSON.stringify(trustedMerchants));
  renderMerchantList();
};

function renderMerchantList() {
  const list = document.getElementById('merchantList');
  const toggle = document.getElementById('autoCapture');
  toggle.checked = autoCapture;
  
  if (trustedMerchants.length === 0) {
    list.innerHTML = '<p class="empty-state">No trusted merchants yet. Add some to enable auto-capture!</p>';
    return;
  }
  
  list.innerHTML = trustedMerchants.map(merchant => `
    <div class="merchant-item">
      <div class="merchant-name">
        <i class="fas fa-store"></i> ${merchant}
      </div>
      <button onclick="removeTrustedMerchant('${merchant}')" class="btn-delete-small">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

window.toggleAutoCapture = function() {
  autoCapture = document.getElementById('autoCapture').checked;
  localStorage.setItem('autoCapture', autoCapture);
  
  if (autoCapture && trustedMerchants.length === 0) {
    alert('⚠️ Add some trusted merchants first!');
    document.getElementById('autoCapture').checked = false;
    autoCapture = false;
    localStorage.setItem('autoCapture', 'false');
  }
};

window.testShareAPI = function() {
  if (navigator.share) {
    alert('✅ Share API is supported! You can share SMS to this app.');
  } else {
    alert('❌ Share API not supported on this browser/device. Use Chrome on Android.');
  }
};

// Handle shared text (from Web Share Target API) and voice shortcuts
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedText = urlParams.get('text');
  const action = urlParams.get('action');
  
  // Handle voice shortcut action
  if (action === 'voice') {
    // Start voice input directly
    setTimeout(() => {
      if (typeof startVoiceExpense === 'function') {
        startVoiceExpense();
      } else {
        alert('Voice feature is loading. Please try again in a moment.');
      }
    }, 1000); // Wait for app to fully initialize
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  // Handle add expense shortcut
  if (action === 'add') {
    setTimeout(() => {
      const amountInput = document.getElementById('amount');
      if (amountInput) {
        amountInput.focus();
      }
    }, 500);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  if (sharedText) {
    // Auto-parse shared SMS
    console.log('📱 Received shared SMS:', sharedText);
    const parsed = parseBankSms(sharedText);
    
    if (parsed) {
      // Check if merchant is trusted
      const merchantUpper = parsed.merchant.toUpperCase();
      const isTrusted = trustedMerchants.some(m => merchantUpper.includes(m) || m.includes(merchantUpper));
      
      if (autoCapture && isTrusted) {
        // Auto-add expense
        autoAddExpense(parsed);
      } else {
        // Show manual approval
        showSharedSmsApproval(parsed);
      }
    } else {
      alert('Could not parse the shared SMS. Please try manual entry.');
    }
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

function autoAddExpense(parsed) {
  // Auto-fill and submit
  document.getElementById('amount').value = parsed.amount;
  document.getElementById('note').value = parsed.merchant;
  
  if (parsed.location) {
    document.getElementById('locationInput').value = parsed.location;
  }
  
  if (parsed.date) {
    document.getElementById('dateInput').value = parsed.date;
  }
  
  // Try to guess category
  const category = guessCategory(parsed.merchant);
  if (category) {
    document.getElementById('categorySelect').value = category;
  }
  
  // Show notification
  alert(`✅ Auto-added: ${parsed.merchant} - ₹${parsed.amount}`);
  
  // Auto-submit if category detected
  if (category) {
    document.getElementById('addBtn').click();
  } else {
    // Scroll to form for manual category selection
    document.querySelector('.add-expense-card').scrollIntoView({ behavior: 'smooth' });
  }
}

function showSharedSmsApproval(parsed) {
  openSmsModal();
  switchSmsTab('manual');
  
  const resultDiv = document.getElementById('smsResult');
  resultDiv.style.display = 'block';
  
  // Get currency symbol
  const currencySymbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'AED ', 'SAR': 'SAR ', 'SGD': 'SGD ', 'MYR': 'MYR ', 'THB': 'THB ', 'JPY': '¥', 'CNY': '¥' };
  const symbol = currencySymbols[parsed.currency] || parsed.currency + ' ';
  
  // Format date for display
  let displayDate = '';
  if (parsed.date) {
    try {
      const dateObj = new Date(parsed.date);
      displayDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      displayDate = parsed.date;
    }
  }
  
  resultDiv.innerHTML = `
    <div class="sms-parsed">
      <h3>📱 Shared SMS Detected</h3>
      <div class="parsed-field"><strong>Amount:</strong> ${symbol}${parsed.amount}</div>
      <div class="parsed-field"><strong>Currency:</strong> ${parsed.currency}</div>
      <div class="parsed-field"><strong>Merchant:</strong> ${parsed.merchant}</div>
      ${parsed.location ? `<div class="parsed-field"><strong>Location:</strong> ${parsed.location}</div>` : ''}
      ${displayDate ? `<div class="parsed-field"><strong>Date:</strong> ${displayDate}</div>` : ''}
      <button onclick="applySmsToForm(${parsed.amount}, '${parsed.merchant}', '${parsed.location || ''}', '${parsed.date || ''}', '${parsed.currency}')" class="btn-primary">
        <i class="fas fa-check"></i> Add This Expense
      </button>
    </div>
  `;
}

function guessCategory(merchant) {
  const merchantLower = merchant.toLowerCase();
  
  // Food & Dining
  if (merchantLower.match(/restaurant|cafe|coffee|pizza|burger|food|swiggy|zomato|mcdonald|kfc|subway/)) {
    const foodCat = categories.find(c => c.name.toLowerCase().includes('food'));
    return foodCat?.id;
  }
  
  // Shopping
  if (merchantLower.match(/carrefour|lulu|mall|store|shop|amazon|flipkart|myntra/)) {
    const shopCat = categories.find(c => c.name.toLowerCase().includes('shopping'));
    return shopCat?.id;
  }
  
  // Transportation
  if (merchantLower.match(/uber|taxi|metro|bus|petrol|fuel|parking|emirates|airline/)) {
    const transCat = categories.find(c => c.name.toLowerCase().includes('transportation'));
    return transCat?.id;
  }
  
  // Travel
  if (merchantLower.match(/hotel|flight|booking|airbnb|airline|emirates|etihad/)) {
    const travelCat = categories.find(c => c.name.toLowerCase().includes('travel'));
    return travelCat?.id;
  }
  
  return null;
}

// Initialize Bill Reminder System
if (typeof window.billReminder !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('🔔 Initializing bill reminders...');
    window.billReminder.init();
  });
}

// Initialize Tax Category System
if (typeof window.taxCategories !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('💼 Initializing tax categories...');
    window.taxCategories.init();
  });
}
