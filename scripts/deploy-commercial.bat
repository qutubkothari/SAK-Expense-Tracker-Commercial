@echo off
echo ========================================
echo SAK Expense Tracker COMMERCIAL - Deploy Script
echo ========================================
echo.

REM Define the correct project ID
set CORRECT_PROJECT=sak-expense-tracker-commercial

REM Step 1: Check current project
echo [Step 1] Checking current Google Cloud project...
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set CURRENT_PROJECT=%%i

if "%CURRENT_PROJECT%"=="" (
    echo [WARNING] No project currently set.
    echo Setting to correct project: %CORRECT_PROJECT%
    goto SET_PROJECT
)

echo Current project: %CURRENT_PROJECT%
echo Expected project: %CORRECT_PROJECT%
echo.

REM Step 2: Validate project ID
if not "%CURRENT_PROJECT%"=="%CORRECT_PROJECT%" (
    echo [ERROR] Wrong project detected!
    echo Current: %CURRENT_PROJECT%
    echo Required: %CORRECT_PROJECT%
    echo.
    echo [STOPPING] Deployment aborted to prevent overwriting wrong project.
    echo.
    
    :SET_PROJECT
    echo [Step 2] Setting correct project...
    gcloud config set project %CORRECT_PROJECT%
    
    if errorlevel 1 (
        echo [ERROR] Failed to set project. Please check if project exists.
        pause
        exit /b 1
    )
    
    echo [SUCCESS] Project set to %CORRECT_PROJECT%
    echo.
    
    REM Verify the change
    for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set VERIFIED_PROJECT=%%i
    
    if not "%VERIFIED_PROJECT%"=="%CORRECT_PROJECT%" (
        echo [ERROR] Project verification failed!
        echo Expected: %CORRECT_PROJECT%
        echo Got: %VERIFIED_PROJECT%
        pause
        exit /b 1
    )
    
    echo [VERIFIED] Project correctly set to %CORRECT_PROJECT%
    echo.
)

REM Step 3: Sync files to www directory
echo [Step 3] Syncing files to www directory...
copy /Y "index.html" "www\index.html" >nul
copy /Y "style.css" "www\style.css" >nul
copy /Y "app.js" "www\app.js" >nul
echo [SUCCESS] Files synced to www directory
echo.

REM Step 4: Deploy to App Engine
echo [Step 4] Deploying to App Engine...
echo Project: %CORRECT_PROJECT%
echo.
gcloud app deploy --quiet

if errorlevel 1 (
    echo.
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo [Step 5] Final verification...
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set FINAL_PROJECT=%%i
echo Final project: %FINAL_PROJECT%

if "%FINAL_PROJECT%"=="%CORRECT_PROJECT%" (
    echo [SUCCESS] Verified correct project after deployment
) else (
    echo [WARNING] Project changed during deployment!
)

echo.
echo ========================================
echo Deployment Complete!
echo Project: %CORRECT_PROJECT%
echo App URL: https://%CORRECT_PROJECT%.df.r.appspot.com
echo ========================================
echo.
pause
