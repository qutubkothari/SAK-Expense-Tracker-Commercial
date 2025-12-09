@echo off
REM Quick script to check which GCP project is currently active

echo ========================================
echo Current GCP Project Check
echo ========================================
echo.

echo Current project:
gcloud config get-value project

echo.
echo Expected project: sak-expense-tracker
echo.

gcloud config get-value project | findstr "sak-expense-tracker" >nul
if %errorlevel% equ 0 (
    echo ✅ CORRECT: You are using the right project!
) else (
    echo ❌ WARNING: You are NOT using sak-expense-tracker!
    echo.
    echo To switch to the correct project, run:
    echo gcloud config set project sak-expense-tracker
)

echo.
echo ========================================
