// AI-Powered Voice Input using OpenAI Whisper + GPT-4
// Global multilingual expense tracking - works with ANY language, ANY accent


class VoiceAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.recordedMimeType = null; // Store the actual recorded format
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  // Start recording audio
  async startRecording() {
    try {
      console.log('🎤 Starting recording on', this.isIOS ? 'iOS' : 'other platform');
      
      // Try with advanced audio constraints first (but skip on iOS - not well supported)
      let stream;
      if (!this.isIOS) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1
            }
          });
          console.log('🎤 Using high-quality audio settings');
        } catch (err) {
          // Fallback to basic audio if advanced settings fail
          console.warn('Advanced audio settings not supported, using basic audio:', err.message);
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('🎤 Using basic audio settings');
        }
      } else {
        // iOS: use basic audio constraints only
        console.log('🎤 iOS detected - using basic audio constraints');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      // iOS browsers often only support audio/mp4
      let options = {};
      
      if (this.isIOS) {
        // iOS Safari/Chrome typically only supports audio/mp4
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        }
        // Don't set bitrate on iOS - causes issues
      } else {
        // Non-iOS: try WebM first
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
          options.audioBitsPerSecond = 128000;
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
          options.audioBitsPerSecond = 128000;
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        }
      }
      
      this.mediaRecorder = new MediaRecorder(stream, options);
      this.audioChunks = [];
      this.recordedMimeType = this.mediaRecorder.mimeType || options.mimeType || null;
      
      console.log('🎤 MediaRecorder created with:', this.recordedMimeType || 'default format', options.audioBitsPerSecond || 'default bitrate');
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('📦 Audio chunk received:', event.data.size, 'bytes');
        }
      };
      
      this.mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event.error);
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      console.log('🎤 Recording started successfully');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Could not access microphone. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone permission in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Microphone is being used by another application.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Your browser does not support audio recording. Try using Safari on iOS or Chrome on Android.';
      } else {
        errorMessage += error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Stop recording and return audio blob
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not currently recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // Use the stored mimeType from recording start
        const mimeType = this.recordedMimeType || this.mediaRecorder.mimeType || (this.isIOS ? 'audio/mp4' : 'audio/webm');
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        // Stop all audio tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        this.isRecording = false;
        this.audioChunks = [];
        
        console.log('🎤 Recording stopped, blob size:', audioBlob.size, 'bytes');
        console.log('🎤 Recording blob type:', audioBlob.type);
        console.log('🎤 Platform:', this.isIOS ? 'iOS' : 'Other');
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Transcribe audio using OpenAI Whisper API
  async transcribeAudio(audioBlob, userLanguage = null) {
    try {
      console.log('🎧 Transcribing audio with Whisper...');
      console.log('📊 Audio blob size:', audioBlob.size, 'bytes');
      console.log('📊 Audio blob type:', audioBlob.type);
      console.log('📊 Detected platform:', this.isIOS ? 'iOS' : 'Desktop/Android');
      
      // Determine file extension and MIME type based on platform and recorded format
      let fileName;
      let mimeType;
      
      // iOS always uses m4a, others use webm by default
      if (this.isIOS) {
        // iOS recordings are always m4a/mp4
        fileName = 'audio.m4a';
        mimeType = 'audio/mp4';
        console.log('📱 iOS detected - using M4A format for Whisper');
      } else if (audioBlob.type && audioBlob.type.includes('webm')) {
        // Desktop: WebM format
        fileName = 'audio.webm';
        mimeType = 'audio/webm';
        console.log('💻 Desktop detected - using WebM format for Whisper');
      } else if (audioBlob.type && audioBlob.type.includes('mp4')) {
        // MP4 format
        fileName = 'audio.m4a';
        mimeType = 'audio/mp4';
      } else if (audioBlob.type && audioBlob.type.includes('mpeg')) {
        // MP3 format
        fileName = 'audio.mp3';
        mimeType = 'audio/mpeg';
      } else if (audioBlob.type && audioBlob.type.includes('wav')) {
        // WAV format
        fileName = 'audio.wav';
        mimeType = 'audio/wav';
      } else if (audioBlob.type && audioBlob.type.includes('ogg')) {
        // OGG format
        fileName = 'audio.ogg';
        mimeType = 'audio/ogg';
      } else {
        // Fallback: use m4a as most compatible
        fileName = 'audio.m4a';
        mimeType = 'audio/mp4';
        console.warn('⚠️ Unknown/empty audio type, using M4A fallback');
      }
      
      console.log('✅ Final format for Whisper:', fileName, 'MIME:', mimeType);
      
      // Convert blob to file with correct extension and type
      const audioFile = new File([audioBlob], fileName, { type: mimeType });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      
      // Always use user's language preference as hint for better accuracy
      if (userLanguage) {
        formData.append('language', userLanguage);
        console.log(`🗣️ Language hint provided to Whisper: ${userLanguage}`);
      } else {
        // Default to English if no preference set
        formData.append('language', 'en');
        console.log('🌍 Defaulting to English for Whisper transcription');
      }
      
      formData.append('response_format', 'text');
      
      // SIMPLE NEUTRAL PROMPT - Let Whisper hear naturally, let GPT-4 handle currency detection
      const whisperPrompt = `Expense tracking. Common: food, taxi, groceries, coffee, lunch, dinner, restaurant, supermarket, hypermarket, mall. Brands: Zepto, Blinkit, Instamart, BigBasket, JioMart, Swiggy, Zomato, Lulu, Carrefour, Spinneys, Waitrose, Choithrams, Ola, Uber. Transport: NOL card, metro card, FastTag. Currency: dirhams, rupees, dollars, euros, pounds. Numbers: forty=40, fifty=50, hundred=100, thousand=1000.`;
      
      formData.append('prompt', whisperPrompt);
      formData.append('temperature', '0'); 
      console.log('💡 Whisper prompt (neutral):', whisperPrompt);
      
      console.log('📡 Sending to Whisper API...');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Whisper API error:', error);
        throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
      }

      const transcript = await response.text();
      console.log('✅ Whisper transcription result:', transcript);
      console.log('📝 Transcript length:', transcript.length, 'characters');
      
      return transcript.trim();
      
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  // NEW: Intelligent transcript correction using GPT-4
  async correctTranscript(transcript, userDefaultCurrency = 'USD') {
    try {
      console.log('🔧 Correcting transcript with GPT-4...');
      console.log('📝 Original transcript:', transcript);
      console.log('💰 User currency context:', userDefaultCurrency);
      
      // Currency context for correction
      const currencyContext = {
        'USD': 'dollars, dollar, bucks',
        'INR': 'rupees, rupee, Rs',
        'AED': 'dirhams, dirham, dhs',
        'EUR': 'euros, euro',
        'GBP': 'pounds, pound, sterling',
        'SAR': 'riyals, riyal',
        'QAR': 'riyals, riyal',
        'KWD': 'dinars, dinar',
        'OMR': 'riyals, riyal',
        'BHD': 'dinars, dinar'
      };
      
      const expectedCurrency = currencyContext[userDefaultCurrency] || userDefaultCurrency;
      
      const correctionPrompt = `You are a speech recognition error corrector for expense tracking.

USER CONTEXT:
- User's currency: ${userDefaultCurrency} (${expectedCurrency})
- Common phonetic errors: "dirhams"→"grams", "forty"→"43", "rupees"→similar sounds

TRANSCRIPT FROM WHISPER: "${transcript}"

TASK: Correct this transcript if it has errors. Common issues:
1. Numbers: "forty" might be heard as "43" or "fourteen"
2. Currency: "dirhams" confused with "grams", "rupees" with other words
3. If user's currency is ${userDefaultCurrency}, look for ${expectedCurrency} mentions

RULES:
- If transcript mentions wrong currency but phonetically similar to ${expectedCurrency}, correct it
- If numbers sound wrong (43 when likely forty=40), correct them
- Keep the original if it makes sense
- Return ONLY the corrected transcript, nothing else

Examples:
- "43 rupees food" + currency=AED → "40 dirhams food" (phonetic correction)
- "14 grams taxi" + currency=AED → "40 dirhams taxi" (fourteen→forty, grams→dirhams)
- "50 rupees coffee" + currency=INR → "50 rupees coffee" (correct, keep it)

Corrected transcript:`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You correct speech recognition errors in expense transcripts. Return only the corrected text, no explanations.' },
            { role: 'user', content: correctionPrompt }
          ],
          temperature: 0.3,
          max_tokens: 100
        })
      });

      if (!response.ok) {
        console.warn('⚠️ Correction failed, using original transcript');
        return transcript; // Fallback to original
      }

      const data = await response.json();
      const correctedTranscript = data.choices[0].message.content.trim();
      
      console.log('✅ Corrected transcript:', correctedTranscript);
      
      // If correction is too different or empty, use original
      if (!correctedTranscript || correctedTranscript.length < 3) {
        console.warn('⚠️ Correction too short, using original');
        return transcript;
      }
      
      return correctedTranscript;
      
    } catch (error) {
      console.error('❌ Correction error:', error);
      return transcript; // Fallback to original on error
    }
  }

  // Extract expense data from natural language using GPT-4
  async extractExpenseData(transcript, categories, userLanguage = null, userDefaultCurrency = 'USD') {
    try {
      console.log('═══════════════════════════════════════');
      console.log('🤖 GPT-4 EXTRACTION - INPUT PARAMETERS');
      console.log('═══════════════════════════════════════');
      console.log('� Transcript:', transcript);
      console.log('💰 User default currency:', userDefaultCurrency);
      console.log('🗣️ User language:', userLanguage || 'auto-detect');
      console.log('� Categories count:', categories.length);
      console.log('═══════════════════════════════════════');
      
      const categoryList = categories.map(c => c.name).join(', ');
      
      // Define common currency keywords AND location-based currency detection
      const currencyKeywords = {
        'USD': ['dollars', 'dollar', 'usd', 'bucks', 'usa', 'america', 'new york', 'los angeles', 'san francisco', 'chicago', 'miami'],
        'INR': ['rupees', 'rupee', 'inr', 'india', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'],
        'AED': ['dirhams', 'dirham', 'aed', 'dhs', 'dubai', 'abu dhabi', 'uae', 'sharjah', 'emirates'],
        'EUR': ['euros', 'euro', 'eur', 'germany', 'france', 'spain', 'italy', 'netherlands', 'belgium', 'portugal', 'greece', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam'],
        'GBP': ['pounds', 'pound', 'gbp', 'sterling', 'uk', 'london', 'britain', 'england', 'scotland', 'manchester'],
        'SAR': ['riyals', 'riyal', 'sar', 'saudi', 'riyadh', 'jeddah', 'saudi arabia'],
        'QAR': ['riyals', 'riyal', 'qar', 'qatar', 'doha'],
        'KWD': ['dinars', 'dinar', 'kwd', 'kuwait'],
        'OMR': ['riyals', 'riyal', 'omr', 'oman', 'muscat'],
        'BHD': ['dinars', 'dinar', 'bhd', 'bahrain'],
        'JPY': ['yen', 'jpy', 'japan', 'tokyo', 'osaka', 'kyoto'],
        'CNY': ['yuan', 'cny', 'rmb', 'china', 'beijing', 'shanghai', 'guangzhou', 'shenzhen'],
        'AUD': ['dollars', 'dollar', 'aud', 'australia', 'sydney', 'melbourne'],
        'CAD': ['dollars', 'dollar', 'cad', 'canada', 'toronto', 'vancouver'],
        'CHF': ['francs', 'franc', 'chf', 'switzerland', 'zurich', 'geneva']
      };
      
      // Build currency detection rules dynamically
      const currencyRules = Object.entries(currencyKeywords)
        .map(([code, keywords]) => `${keywords.join('/')} → ${code}`)
        .join(', ');
      
      const prompt = `You are a precise expense data extractor with GLOBAL INTELLIGENCE. Extract from: "${transcript}"

Available categories: ${categoryList}

STEP 1 - CURRENCY DETECTION (CRITICAL - EXPLICIT CURRENCY KEYWORDS OVERRIDE DEFAULT):

🚨 ABSOLUTE PRIORITY RULES (OVERRIDE EVERYTHING):
1. If transcript contains "dirham" or "dirhams" or "dhs" → ALWAYS use AED (never ignore this!)
2. If transcript contains "rupee" or "rupees" or "rupiya" → ALWAYS use INR
3. If transcript contains "dollar" or "dollars" or "bucks" → Check context (USD/AED/CAD/AUD)
4. If transcript contains "pound" or "pounds" → ALWAYS use GBP
5. If transcript contains "euro" or "euros" → ALWAYS use EUR
6. If transcript contains "riyal" or "riyals" → Check location (SAR/QAR/OMR)
7. If transcript contains "yen" → ALWAYS use JPY
8. If transcript contains "yuan" or "rmb" → ALWAYS use CNY

A) Check for explicit currency keywords first (HIGHEST PRIORITY):
${currencyRules}

🔥 CRITICAL: Currency keywords like "dirhams", "rupees", "pounds" etc. MUST be detected even if:
- User's default currency is different
- Transcript has typos or phonetic errors
- Context suggests another currency

B) If no currency keyword found, check for ANY city/country mentioned:
- Use your world knowledge to map ANY city/country to its currency
- Common hints: ${currencyRules}
- BUT you know ALL cities globally - not limited to this list!
- Examples of your intelligence:
  * "ajman" (not in list) → you know: Ajman is in UAE → AED
  * "riyadh" → you know: Saudi Arabia → SAR  
  * "barcelona" → you know: Spain → EUR
  * "singapore" → you know: Singapore → SGD
  * "toronto" → you know: Canada → CAD

C) ONLY if no currency word AND no location detected → Use ${userDefaultCurrency}

✅ CORRECT Examples:
- "40 dirhams food" → currency: "AED" (dirhams detected - IGNORE default currency!)
- "40 dirham food" → currency: "AED" (dirham detected - IGNORE default currency!)
- "40 dhs food" → currency: "AED" (dhs detected - IGNORE default currency!)
- "40 food dubai" → currency: "AED" (dubai → UAE → AED)
- "dinner 40 ajman" → currency: "AED" (ajman → UAE → AED, using your intelligence!)
- "50 rupees taxi" → currency: "INR" (rupees detected - IGNORE default currency!)
- "lunch 30 london" → currency: "GBP" (london → UK → GBP)
- "coffee 5 singapore" → currency: "SGD" (singapore detected, you know SGD!)
- "40 food" → currency: "${userDefaultCurrency}" (ONLY use default when NO currency/location found)

❌ WRONG Examples (DO NOT DO THIS):
- "40 dirhams food" → currency: "USD" (WRONG! Must be AED - dirhams keyword present!)
- "50 rupees taxi" → currency: "USD" (WRONG! Must be INR - rupees keyword present!)

STEP 2 - LOCATION EXTRACTION (INTELLIGENT INFERENCE):
- If location explicitly mentioned → Use that location (capitalize properly)
- If NO location mentioned BUT currency keyword detected → Infer default location:
  * "dirhams/dirham/dhs" → "Dubai" (most common AED location)
  * "rupees/rupee" → "India" (most common INR location)
  * "pounds/pound" → "London" (most common GBP location)
  * "euros/euro" → "Europe" (generic EUR location)
  * "riyal" + context → "Riyadh" (SAR) or "Doha" (QAR)
- Examples: 
  * "40 dirhams food" → location: "Dubai" (inferred from dirhams)
  * "50 rupees taxi" → location: "India" (inferred from rupees)
  * "40 dirhams food dubai" → location: "Dubai" (explicit, preferred)
  * "lunch 40" → location: null (no currency keyword, no location mentioned)

STEP 3 - AMOUNT EXTRACTION:
Convert spoken numbers: forty=40, fifty=50, hundred=100, thousand=1000
PRESERVE DECIMALS: 16.5 stays 16.5

STEP 4 - NOTE EXTRACTION (CLEAN DESCRIPTION):
Extract ONLY the item/description, WITHOUT amount, currency, location, OR date keywords
Remove: amount numbers, currency words, location names, date words (yesterday/today/last week/etc)
Examples:
- "40 dirhams for lunch" → note: "lunch" (NOT "40 dirhams for lunch")
- "dinner 40 dubai" → note: "dinner" 
- "50 rupees taxi ride" → note: "taxi ride"
- "coffee 5 starbucks" → note: "coffee starbucks"
- "500rs darees yesterday" → note: "darees" (remove "yesterday" and "500rs")
- "lunch 40 2 days ago" → note: "lunch" (remove "2 days ago" and "40")

STEP 5 - DATE EXTRACTION (INTELLIGENT RELATIVE DATES):
Today is ${new Date().toISOString().split('T')[0]}
- If "yesterday" mentioned → Calculate yesterday's date
- If "today" or no date mentioned → Use today's date  
- If "last week" / "last monday" etc → Calculate that date
- If "2 days ago" / "3 days back" → Calculate that date
- If specific date like "on 15th" or "Nov 12" → Use that date
Examples:
- "500rs darees yesterday" → date: "${(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })()}" (yesterday)
- "lunch 40" → date: "${new Date().toISOString().split('T')[0]}" (today)
- "dinner 50 last monday" → date: <calculate last monday>

STEP 6 - PAYMENT METHOD & STATUS DETECTION (NEW):
Detect payment method from keywords:
- "cash" / "paid cash" → payment_method: "cash"
- "card" / "credit card" / "debit card" → payment_method: "credit_card" or "debit_card"
- "bank" / "transfer" / "bank transfer" → payment_method: "bank"
- "upi" / "phonepe" / "gpay" / "paytm" → payment_method: "upi"
- "wallet" / "digital wallet" → payment_method: "wallet"
- If not mentioned → payment_method: "cash" (default)

Payment status:
- "unpaid" / "pending" / "will pay" / "to pay" / "due" → payment_status: "unpaid"
- "paid" / "done" / or nothing mentioned → payment_status: "paid" (default)

Examples:
- "40 rupees food paid by card" → payment_method: "credit_card", payment_status: "paid"
- "500 taxi unpaid" → payment_method: "cash", payment_status: "unpaid"
- "200 upi groceries" → payment_method: "upi", payment_status: "paid"

STEP 7 - INCOME DETECTION (NEW):
If transcript contains income keywords: "income", "earned", "salary", "received", "got paid", "payment received"
→ Set transaction_type: "income" and extract:
- amount: number
- source: salary/freelance/business/investment/rental/bonus/gift/refund/other
- description: what the income is for

Examples:
- "Income 5000 rupees salary" → transaction_type: "income", amount: 5000, currency: "INR", source: "salary"
- "Earned 1000 dollars freelance" → transaction_type: "income", amount: 1000, currency: "USD", source: "freelance"
- "Received 500 bonus" → transaction_type: "income", amount: 500, source: "bonus"

STEP 8 - RETURN JSON:
{
  "transaction_type": "expense" or "income" (default: "expense"),
  "amount": number,
  "currency": "ISO code from Step 1",
  "note": "clean description only",
  "category": "best match from categories" (for expenses only),
  "source": "income source" (for income only: salary/freelance/business/investment/rental/bonus/gift/refund/other),
  "date": "YYYY-MM-DD",
  "expenseType": "personal" or "business" (for expenses),
  "location": "city/country",
  "payment_method": "cash/bank/credit_card/debit_card/upi/wallet",
  "payment_status": "paid" or "unpaid"
}

COMPLETE EXAMPLES:
1. "40 dirhams food by card" → {"transaction_type": "expense", "amount": 40, "currency": "AED", "note": "food", "location": "Dubai", "payment_method": "credit_card", "payment_status": "paid", ...}
2. "50 rupees taxi unpaid" → {"transaction_type": "expense", "amount": 50, "currency": "INR", "note": "taxi", "payment_method": "cash", "payment_status": "unpaid", ...}
3. "Income 5000 rupees salary" → {"transaction_type": "income", "amount": 5000, "currency": "INR", "source": "salary", "note": "salary", ...}
3. "500rs darees yesterday" → {"amount": 500, "currency": "INR", "note": "darees", "location": "India", "date": "${(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })()}", ...}
4. "lunch 40 2 days ago" → {"amount": 40, "currency": "${userDefaultCurrency}", "note": "lunch", "location": null, "date": <2 days ago>, ...}
5. "coffee 5 london" → {"amount": 5, "currency": "GBP", "note": "coffee", "location": "London", "date": "${new Date().toISOString().split('T')[0]}", ...}

Return ONLY valid JSON, no markdown.`;

      console.log('📡 Sending to GPT-4...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Faster and cheaper than gpt-4
          messages: [
            {
              role: 'system',
              content: 'You are a universal multilingual expense tracking assistant. Extract structured expense data from ANY language globally. Understand numbers in all forms and languages. Detect currencies from keywords worldwide. NEVER return amount=0 unless explicitly zero. Keep descriptions in original language. Auto-detect business expenses from context (office, client, work, meeting, etc.). CATEGORY INTELLIGENCE: Zepto/Blinkit/Instamart/Swiggy Instamart/Dunzo/BigBasket/JioMart/Amazon Fresh/Flipkart Grocery → Groceries. Lulu/Carrefour/Spinneys/Waitrose/Choithrams/Asda/Tesco/Sainsbury → Groceries. Swiggy/Zomato/Uber Eats/Deliveroo/Talabat/DoorDash → Food Delivery. Ola/Uber/Careem/Lyft/Yandex Taxi → Transportation. No region-specific assumptions - be globally aware.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GPT API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 GPT-4 raw response:', data);
      const content = data.choices[0].message.content;
      console.log('📝 GPT-4 extracted content:', content);
      
      // Parse JSON from response
      let jsonStr = content.trim();
      console.log('🔧 Raw JSON string before cleanup:', jsonStr);
      
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.substring(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      }
      
      jsonStr = jsonStr.trim();
      console.log('🔧 Cleaned JSON string:', jsonStr);
      
      let expenseData;
      try {
        expenseData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Failed to parse:', jsonStr);
        throw new Error('GPT-4 returned invalid JSON: ' + parseError.message);
      }
      
      console.log('✅ Parsed expense data:', JSON.stringify(expenseData, null, 2));
      console.log('═══════════════════════════════════════');
      console.log('✅ GPT-4 EXTRACTION - OUTPUT');
      console.log('═══════════════════════════════════════');
      console.log('💰 Detected Amount:', expenseData.amount);
      console.log('💵 Detected Currency:', expenseData.currency);
      console.log('🚨 CURRENCY CHECK: Is it USD?', expenseData.currency === 'USD' ? '❌ YES - WRONG!' : '✅ NO - CORRECT!');
      console.log('🚨 CURRENCY TYPE:', typeof expenseData.currency);
      console.log('🏪 Merchant/Note:', expenseData.note);
      console.log('📍 Location:', expenseData.location || 'none');
      console.log('📅 Date:', expenseData.date);
      console.log('🏷️ Category:', expenseData.category);
      console.log('═══════════════════════════════════════');
      
      // Validate required fields (check for missing or zero amount)
      if (!expenseData.amount || expenseData.amount === 0 || !expenseData.note || expenseData.note.trim() === '') {
        console.error('❌ Missing or invalid required fields!');
        console.error('Amount:', expenseData.amount, 'Type:', typeof expenseData.amount);
        console.error('Note:', expenseData.note, 'Type:', typeof expenseData.note);
        console.error('Full response:', JSON.stringify(expenseData));
        throw new Error('Could not understand the speech. Please speak clearly with amount and description. Example: "100 dirhams Noon" or "Zepto 200 rupees"');
      }
      
      // Ensure amount is a number
      if (typeof expenseData.amount === 'string') {
        expenseData.amount = parseFloat(expenseData.amount);
      }
      
      return expenseData;
      
    } catch (error) {
      console.error('Expense extraction error:', error);
      throw error;
    }
  }

  // Complete voice input flow: record → transcribe → extract (NO correction - let GPT-4 detect currency naturally)
  async processVoiceInput(categories, onStatusChange, userLanguage = null, userDefaultCurrency = 'USD') {
    try {
      // Step 1: Record audio
      onStatusChange('🎤 Recording...');
      await this.startRecording();
      
      // Record for 7 seconds (increased from 5 for better clarity)
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      onStatusChange('🎤 Processing...');
      const audioBlob = await this.stopRecording();
      
      // Step 2: Transcribe with Whisper (use language hint if provided)
      onStatusChange('🎧 Understanding speech...');
      const transcript = await this.transcribeAudio(audioBlob, userLanguage);
      
      if (!transcript || transcript.length < 3) {
        throw new Error('No speech detected. Please try again.');
      }
      
      // Step 3: Extract expense data with GPT-4 (pass language hint and default currency)
      // GPT-4 will detect currency naturally from transcript ("dirhams" → AED, "rupees" → INR)
      onStatusChange('🤖 Analyzing...');
      const expenseData = await this.extractExpenseData(transcript, categories, userLanguage, userDefaultCurrency);
      
      onStatusChange('✅ Done!');
      
      return {
        transcript: transcript,
        ...expenseData
      };
      
    } catch (error) {
      onStatusChange('❌ Error');
      throw error;
    }
  }
}

// Helper function for date calculation
function getPreviousDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Export for use in app.js
window.VoiceAI = VoiceAI;
