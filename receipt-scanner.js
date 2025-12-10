// Receipt Scanner Module - AI-Powered
let receiptImageData = null;
let scannedReceiptData = null;

// OpenAI API Configuration - Store in user settings or environment
const OPENAI_API_KEY = localStorage.getItem('openai_api_key') || '';

// Open receipt modal
window.openReceiptModal = function() {
  document.getElementById('receiptModal').style.display = 'flex';
  clearReceiptImage();
};

// Close receipt modal
window.closeReceiptModal = function() {
  document.getElementById('receiptModal').style.display = 'none';
  clearReceiptImage();
};

// Clear receipt image and reset
window.clearReceiptImage = function() {
  receiptImageData = null;
  scannedReceiptData = null;
  
  document.getElementById('receiptPreview').style.display = 'none';
  document.getElementById('receiptUploadPrompt').style.display = 'block';
  document.getElementById('ocrProgress').style.display = 'none';
  document.getElementById('ocrResult').style.display = 'none';
  document.getElementById('receiptImage').src = '';
  document.getElementById('receiptFileInput').value = '';
  
  // Reset capture attribute
  document.getElementById('receiptFileInput').setAttribute('capture', 'environment');
};

// Handle receipt file upload
window.handleReceiptUpload = async function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Image too large. Please select an image under 10MB');
    return;
  }
  
  // Show preview
  const reader = new FileReader();
  reader.onload = async function(e) {
    receiptImageData = {
      file: file,
      dataUrl: e.target.result
    };
    
    document.getElementById('receiptImage').src = e.target.result;
    document.getElementById('receiptPreview').style.display = 'block';
    document.getElementById('receiptUploadPrompt').style.display = 'none';
    
    // Start OCR processing
    await performOCR(e.target.result);
  };
  
  reader.readAsDataURL(file);
};

// Analyze receipt using OpenAI GPT-4 Vision API
async function analyzeReceiptWithAI(imageDataUrl) {
  console.log('🚀 Calling OpenAI GPT-4 Vision API...');
  
  // Check if API key is configured
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('your-key-here')) {
    throw new Error('OpenAI API key not configured');
  }
  
  // Convert data URL to base64 (remove the data:image/...;base64, prefix)
  const base64Image = imageDataUrl.split(',')[1];
  console.log('📸 Image size:', (base64Image.length * 0.75 / 1024).toFixed(2), 'KB');
  
  const prompt = `Analyze this receipt image and extract the following information in JSON format:
  
{
  "merchant": "merchant/store name (clean, no special characters)",
  "amount": total amount as number (e.g., 11.55),
  "currency": "currency code (AED, SAR, INR, USD, etc.)",
  "date": "date in YYYY-MM-DD format",
  "items": ["list", "of", "items"] (optional),
  "category": "suggested category: groceries, dining, transport, shopping, healthcare, utilities, entertainment, or other"
}

Important:
- Extract the TOTAL amount (not subtotal or VAT)
- Handle Arabic and English text
- Clean merchant names (remove special characters, tax IDs)
- Infer currency from symbols or context (د.إ = AED, ر.س = SAR, ₹ = INR)
- Return only valid JSON, no markdown or explanation`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o', // Using gpt-4o (supports vision and is faster/cheaper)
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1 // Low temperature for consistent extraction
    })
  });

  console.log('📡 API request sent, waiting for response...');

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ OpenAI API Error:', error);
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log('📥 Raw API response:', data);
  const content = data.choices[0].message.content;
  console.log('📝 Extracted content:', content);
  
  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.substring(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.substring(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.substring(0, jsonStr.length - 3);
  }
  
  const result = JSON.parse(jsonStr.trim());
  
  // Validate required fields
  if (!result.amount || !result.merchant) {
    throw new Error('AI could not extract required fields');
  }
  
  return result;
}

// Perform OCR on receipt image
async function performOCR(imageData) {
  document.getElementById('ocrProgress').style.display = 'block';
  document.getElementById('ocrResult').style.display = 'none';
  
  try {
    document.querySelector('.ocr-status').textContent = '🤖 Using AI to analyze receipt...';
    
    // Try OpenAI GPT-4 Vision first (more intelligent and accurate)
    try {
      console.log('🔍 Starting AI receipt analysis...');
      const aiResult = await analyzeReceiptWithAI(imageData);
      console.log('📊 AI returned result:', JSON.stringify(aiResult, null, 2));
      
      if (aiResult && aiResult.amount) {
        console.log('✅ AI analysis successful - Merchant:', aiResult.merchant, 'Amount:', aiResult.amount);
        scannedReceiptData = aiResult;
        displayOCRResults(aiResult);
        return;
      } else {
        console.warn('⚠️ AI returned incomplete data:', aiResult);
      }
    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError);
      console.error('Error details:', aiError.message, aiError.stack);
      document.querySelector('.ocr-status').textContent = 'Using traditional OCR...';
    }
    
    // Fallback to traditional Tesseract OCR
    const { createWorker } = Tesseract;
    // Support multiple languages including Arabic
    const worker = await createWorker(['eng', 'ara'], 1, {
      logger: m => {
        console.log(m);
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100);
          document.querySelector('.ocr-status').textContent = `Recognizing text... ${progress}%`;
        }
      }
    });
    
    document.querySelector('.ocr-status').textContent = 'Analyzing receipt...';
    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();
    
    console.log('OCR Text:', text);
    
    // Parse receipt data
    scannedReceiptData = parseReceiptText(text);
    
    // Show results
    displayOCRResults(scannedReceiptData);
    
  } catch (error) {
    console.error('OCR Error:', error);
    document.getElementById('ocrProgress').style.display = 'none';
    alert('Failed to scan receipt. Please try again or enter manually.');
  }
}

// Parse receipt text to extract data
function parseReceiptText(text) {
  const result = {
    amount: null,
    merchant: null,
    date: null,
    currency: null,
    rawText: text
  };
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Detect currency first
  if (text.match(/\bAED\b/i) || text.match(/د\.إ/)) {
    result.currency = 'AED';
  } else if (text.match(/\bSAR\b/i) || text.match(/ريال/)) {
    result.currency = 'SAR';
  } else if (text.match(/\bQAR\b/i)) {
    result.currency = 'QAR';
  } else if (text.match(/\bKWD\b/i)) {
    result.currency = 'KWD';
  } else if (text.match(/\bINR\b|Rs\.?|₹/i)) {
    result.currency = 'INR';
  } else {
    result.currency = 'AED'; // Default for UAE
  }
  
  // Extract amount - look for currency symbols and numbers (including Arabic patterns)
  // Priority: Look for final total first, then fallback to other patterns
  
  console.log('OCR Text for amount parsing:', text);
  
  // Helper function to properly convert amount string to number
  const parseAmount = (amountStr) => {
    // Check if comma is decimal separator (format: 11,55)
    if (amountStr.includes(',') && !amountStr.includes('.')) {
      const parts = amountStr.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        // Comma is decimal separator (European format)
        return parseFloat(amountStr.replace(',', '.'));
      }
    }
    // Otherwise treat comma as thousands separator and remove it
    return parseFloat(amountStr.replace(/,/g, ''));
  };
  
  let amounts = [];
  
  // Strategy 1: Find all numbers with decimals near "Total" keywords (EXCLUDE VAT/Tax AND tax registration numbers)
  const totalKeywords = /(?:Total|المجموع|الإجمالي|المبلغ|الصافي)/gi;
  const matches = text.matchAll(totalKeywords);
  
  for (const match of matches) {
    // Look for numbers after the keyword (within next 50 characters)
    const searchStart = match.index;
    const searchText = text.substring(searchStart, searchStart + 50);
    const numberMatch = searchText.match(/(\d+[,\.]\d{2})/);
    
    if (numberMatch) {
      const amount = parseAmount(numberMatch[1]);
      console.log(`Found amount ${numberMatch[1]} (${amount}) near keyword "${match[0]}"`);
      // Exclude very small amounts (likely VAT/tax, not total)
      if (amount > 1.0) {
        amounts.push({
          value: numberMatch[1],
          keyword: match[0],
          index: searchStart,
          amount: amount
        });
      }
    }
  }
  
  // Strategy 2: Find all standalone decimal amounts in the text (greater than 1.0)
  // BUT exclude amounts that appear on tax registration lines
  const allAmounts = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines that contain tax registration keywords or tax-related terms
    // Check for TRN (Tax Registration Number), VAT numbers, or Arabic tax terms
    if (/(?:TRN|VAT\s*(?:REG|NO)|TAX\s*(?:REG|NO|ID)|رقم|ضريبية|ضريب)/i.test(line)) {
      console.log(`Skipping tax/registration line: "${line}"`);
      continue;
    }
    
    // Find all amounts in this line
    const lineMatches = [...line.matchAll(/(\d+[,\.]\d{2})/g)];
    for (const match of lineMatches) {
      const amount = parseAmount(match[1]);
      if (amount > 1.0) {
        allAmounts.push({
          value: match[1],
          index: match.index,
          amount: amount,
          line: line
        });
        console.log(`Found amount ${match[1]} (${amount}) in line: "${line}"`);
      }
    }
  }
  
  console.log('All amounts found (>1.0):', allAmounts.map(a => `${a.value}=${a.amount}`));
  
  // If we found amounts with "Total" keywords, pick the LARGEST (not last by position)
  if (amounts.length > 0) {
    console.log('Using keyword-based amounts:', amounts.map(a => `${a.value}=${a.amount}`));
    // Sort by amount value - pick the largest
    amounts.sort((a, b) => b.amount - a.amount);
    const bestMatch = amounts[0];
    result.amount = bestMatch.amount;
    console.log('Selected amount from keywords:', bestMatch.amount);
  } else if (allAmounts.length > 0) {
    // Fallback: Use the LARGEST amount found (likely the total, not subtotals or VAT)
    allAmounts.sort((a, b) => b.amount - a.amount);
    const largestAmount = allAmounts[0];
    result.amount = largestAmount.amount;
    console.log('Selected largest amount:', largestAmount.amount);
  }
  
  // Final validation
  if (result.amount && (isNaN(result.amount) || result.amount <= 0)) {
    result.amount = null;
  }
  
  // Extract merchant name - clean up junk characters
  const merchantCandidates = lines.slice(0, 10);
  const merchantLine = merchantCandidates.find(line => {
    // Remove non-printable and junk characters
    const cleaned = line.replace(/[^\x20-\x7E\u0600-\u06FF]/g, '').trim();
    return cleaned.length > 3 && 
      cleaned.length < 50 && 
      !/^\d+$/.test(cleaned) &&
      !cleaned.toLowerCase().includes('receipt') &&
      !cleaned.toLowerCase().includes('invoice') &&
      !cleaned.toLowerCase().includes('bill') &&
      !cleaned.toLowerCase().includes('tax') &&
      !/^[\W_]+$/.test(cleaned) && // Not just symbols
      /[a-zA-Z\u0600-\u06FF]/.test(cleaned); // Contains actual letters
  });
  
  if (merchantLine) {
    // Clean merchant name
    result.merchant = merchantLine.replace(/[^\x20-\x7E\u0600-\u06FF]/g, '').trim();
  }
  
  // Extract date - including Arabic date formats
  const datePatterns = [
    // YYYY-MM-DD format first (most reliable) - with timestamp
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+\d{1,2}:\d{2}/,
    // YYYY-MM-DD standalone
    /(?:^|\s)(\d{4}[-/]\d{1,2}[-/]\d{1,2})(?:\s|$)/,
    // Date with text markers
    /(?:DATE|Date|التاريخ|تاريخ)[\s:]*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
    // Month name formats (English)
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
    // DD-MM-YYYY or DD/MM/YYYY (comes after YYYY-MM-DD to avoid confusion)
    /(?:DATE|Date|التاريخ|تاريخ)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    /\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/,
    // With spaces
    /(\d{1,2}\s+\d{1,2}\s+\d{4})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1];
      const parsedDate = parseReceiptDate(dateStr);
      if (parsedDate) {
        result.date = parsedDate;
        break;
      }
    }
  }
  
  return result;
}

// Parse date string to YYYY-MM-DD format
function parseReceiptDate(dateStr) {
  try {
    // Check for YYYY-MM-DD format first (most reliable)
    const isoFormat = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
    const isoMatch = dateStr.match(isoFormat);
    if (isoMatch) {
      let year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      
      // Validate date is reasonable
      let yearNum = parseInt(year);
      
      // Fix common OCR errors: 2028 should be 2025, 2026-2029 likely means 2025
      const currentYear = new Date().getFullYear();
      if (yearNum > currentYear + 1) {
        // Likely OCR error - could be reading 5 as 8
        if (yearNum >= 2026 && yearNum <= 2029) {
          year = '2025';
          yearNum = 2025;
        }
      }
      
      if (yearNum >= 2020 && yearNum <= 2030) {
        return `${year}-${month}-${day}`;
      }
    }
    
    // Try DD-MM-YYYY format
    const ddmmyyyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
    const ddMatch = dateStr.match(ddmmyyyy);
    if (ddMatch) {
      const day = ddMatch[1].padStart(2, '0');
      const month = ddMatch[2].padStart(2, '0');
      let year = ddMatch[3];
      
      // Fix OCR year errors
      let yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (yearNum > currentYear + 1 && yearNum >= 2026 && yearNum <= 2029) {
        year = '2025';
        yearNum = 2025;
      }
      
      // Validate
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      if (dayNum <= 31 && monthNum <= 12 && yearNum >= 2020 && yearNum <= 2030) {
        return `${year}-${month}-${day}`;
      }
    }
    
    // Try DD-MM-YY format
    const ddmmyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/;
    const yyMatch = dateStr.match(ddmmyy);
    if (yyMatch) {
      const day = yyMatch[1].padStart(2, '0');
      const month = yyMatch[2].padStart(2, '0');
      let year = '20' + yyMatch[3];
      
      // Fix OCR errors in 2-digit year
      let yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (yearNum > currentYear + 1) {
        // Fix common errors: 28 -> 25, 26-29 -> 25
        const lastTwo = parseInt(yyMatch[3]);
        if (lastTwo >= 26 && lastTwo <= 29) {
          year = '2025';
          yearNum = 2025;
        }
      }
      
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      if (dayNum <= 31 && monthNum <= 12) {
        return `${year}-${month}-${day}`;
      }
    }
    
    // Try parsing month name format (e.g., "15 Nov 2024")
    const monthMatch = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})/);
    if (monthMatch) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex(m => monthMatch[2].toLowerCase().startsWith(m));
      
      if (monthIndex !== -1) {
        let year = monthMatch[3];
        if (year.length === 2) year = '20' + year;
        
        const month = String(monthIndex + 1).padStart(2, '0');
        const day = monthMatch[1].padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

// Display OCR results
function displayOCRResults(data) {
  document.getElementById('ocrProgress').style.display = 'none';
  document.getElementById('ocrResult').style.display = 'block';
  
  // Display with correct currency symbol
  const currencySymbols = {
    'AED': 'AED',
    'SAR': 'SAR',
    'QAR': 'QAR',
    'KWD': 'KWD',
    'INR': '₹'
  };
  const symbol = currencySymbols[data.currency] || data.currency || 'AED';
  
  document.getElementById('scannedAmount').textContent = data.amount ? `${symbol} ${data.amount.toFixed(2)}` : 'Not detected';
  document.getElementById('scannedMerchant').textContent = data.merchant || 'Not detected';
  document.getElementById('scannedDate').textContent = data.date || 'Not detected';
}

// Apply scanned data to expense form
window.applyReceiptData = function() {
  if (!scannedReceiptData) return;
  
  // Fill amount
  if (scannedReceiptData.amount) {
    document.getElementById('amount').value = scannedReceiptData.amount;
  }
  
  // Fill note with merchant name
  if (scannedReceiptData.merchant) {
    document.getElementById('note').value = scannedReceiptData.merchant;
  }
  
  // Fill date
  if (scannedReceiptData.date) {
    document.getElementById('dateInput').value = scannedReceiptData.date;
  }
  
  // Auto-select category if AI suggested one
  if (scannedReceiptData.category) {
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
      // Try to find matching category
      const categories = {
        'groceries': 'groceries',
        'dining': 'diningOut',
        'transport': 'transportation',
        'shopping': 'shopping',
        'healthcare': 'healthcare',
        'utilities': 'utilities',
        'entertainment': 'entertainment'
      };
      
      const mappedCategory = categories[scannedReceiptData.category.toLowerCase()];
      if (mappedCategory) {
        categorySelect.value = mappedCategory;
        console.log(`✅ Auto-selected category: ${mappedCategory}`);
      }
    }
  }
  
  // Close modal
  closeReceiptModal();
  
  // Show success message
  alert('✅ Receipt data applied! Please review and save.');
};

// Initialize receipt scanner
document.addEventListener('DOMContentLoaded', function() {
  const receiptBtn = document.getElementById('receiptBtn');
  if (receiptBtn) {
    receiptBtn.addEventListener('click', openReceiptModal);
  }
});
