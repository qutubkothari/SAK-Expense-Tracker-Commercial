@echo off
echo ========================================
echo SAK Expense Tracker - Deploy Script
echo ========================================
echo.

REM Validate current project to prevent accidental overwrites
echo Checking current project...
for /f "tokens=*" %%i in ('gcloud config get-value project') do set CURRENT_PROJECT=%%i
echo Current project: %CURRENT_PROJECT%

REM Check if we're accidentally in the WhatsApp AI project
if "%CURRENT_PROJECT%"=="sak-whatsapp-ai-sales-assist" (
    echo.
    echo [ERROR] Cannot deploy Expense Tracker to WhatsApp AI project!
    echo Current project: %CURRENT_PROJECT%
    echo Expected project: sak-expense-tracker
    echo Aborting deployment to prevent overwriting WhatsApp AI!
    echo.
    pause
    exit /b 1
)

REM Set the correct Google Cloud project
set PROJECT_ID=sak-expense-tracker

echo Setting project to %PROJECT_ID%...
gcloud config set project %PROJECT_ID%

echo.
echo Deploying to App Engine...
REM Deploy to App Engine (always deploy latest changes)
gcloud app deploy --quiet

echo.
echo ========================================
echo Deployment Complete!
echo App URL: https://sak-expense-tracker.df.r.appspot.com
echo ========================================
