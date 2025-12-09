 copy the categories and sub categories from 7861105301 to 7737835253 and 8160442719# OpenAI Proxy Deployment Guide

## Quick Setup (Required for Voice AI to work)

The OpenAI Whisper API has CORS restrictions, so we need a backend proxy.

### Option 1: Deploy Cloud Function (Recommended)

1. **Set your OpenAI API Key as environment variable:**
   ```powershell
   $env:OPENAI_API_KEY = "sk-your-openai-api-key-here"
   ```

2. **Deploy the cloud function:**
   ```powershell
   cd functions
   gcloud functions deploy openaiProxy --runtime nodejs18 --trigger-http --allow-unauthenticated --region us-central1 --entry-point=openaiProxy --set-env-vars OPENAI_API_KEY=$env:OPENAI_API_KEY --timeout=60s --memory=256MB
   ```

3. **Note the function URL:**
   - URL will be: `https://us-central1-sak-expense-tracker.cloudfunctions.net/openaiProxy`
   - This is already configured in `www/voiceAI.js`

### Option 2: Use Existing Deployment Script

Just run:
```powershell
$env:OPENAI_API_KEY = "sk-your-key-here"
.\deploy-proxy.bat
```

### Verification

After deployment, test the function:
```powershell
curl "https://us-central1-sak-expense-tracker.cloudfunctions.net/openaiProxy"
```

### Main App Deployment

The main app has been deployed with the proxy integration. Voice AI will now work without CORS errors.

## What Was Fixed

1. ✅ Created OpenAI proxy cloud function to handle CORS
2. ✅ Updated `www/voiceAI.js` to use proxy endpoint
3. ✅ Updated service worker to handle API requests properly
4. ✅ Main app deployed with all changes

## Next Steps

1. Deploy the cloud function using one of the methods above
2. Your voice AI feature will work without CORS errors
3. The proxy handles authentication securely on the backend
