# AI Configuration Guide

## OpenAI API Setup for Intelligent Receipt Scanning

Your receipt scanner now uses **GPT-4 Vision** for intelligent extraction! No more regex patterns - AI understands receipts in any language.

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or login to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### Step 2: Add API Key to Your App

Open `www/receipt-scanner.js` and `receipt-scanner.js` and replace this line:

```javascript
const OPENAI_API_KEY = 'sk-proj-your-key-here'; // TODO: Move to secure storage
```

With your actual key:

```javascript
const OPENAI_API_KEY = 'sk-proj-ABC123...'; // Your real key
```

### Step 3: How It Works

**AI-First Approach:**
1. ✅ **Primary**: GPT-4 Vision analyzes the receipt image directly
   - Understands Arabic, English, and mixed languages
   - Extracts: merchant, amount, currency, date, items
   - Suggests category automatically
   - No regex patterns needed!

2. 🔄 **Fallback**: If AI is unavailable, uses traditional Tesseract OCR
   - Still works offline
   - Uses the old regex-based extraction

**Cost**: ~$0.01-0.02 per receipt scan (very affordable for personal use)

### Step 4: Voice Input Intelligence (Coming Next)

Similarly, we can upgrade voice to use OpenAI Whisper API for:
- Better speech recognition in any accent
- Automatic language detection
- Natural language understanding ("fifty dirhams for groceries" → amount: 50, category: groceries)

Would you like me to implement AI-powered voice input as well?

### Security Note

⚠️ **For production**, move the API key to:
- Environment variables
- Supabase Edge Functions with secrets
- A backend proxy to hide the key from frontend

For now, since your app is on Google App Engine, you can use environment variables in `app.yaml`.

