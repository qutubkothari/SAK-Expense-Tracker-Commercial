@echo off
echo ========================================
echo Deploying OpenAI Proxy Cloud Function
echo ========================================

echo.
echo Setting project...
gcloud config set project sak-expense-tracker

echo.
echo Deploying function...
cd functions
gcloud functions deploy openaiProxy ^
  --runtime nodejs18 ^
  --trigger-http ^
  --allow-unauthenticated ^
  --region us-central1 ^
  --entry-point=openaiProxy ^
  --set-env-vars OPENAI_API_KEY=%OPENAI_API_KEY% ^
  --timeout=60s ^
  --memory=256MB

cd ..
echo.
echo ========================================
echo Deployment complete!
echo Function URL: https://us-central1-sak-expense-tracker.cloudfunctions.net/openaiProxy
echo ========================================
pause
