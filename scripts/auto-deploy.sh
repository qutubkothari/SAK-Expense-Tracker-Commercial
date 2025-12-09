#!/bin/bash

# SAK Expense Tracker - Automated Deployment Script
# This script automatically commits to GitHub and deploys to Google Cloud

echo "🚀 SAK Expense Tracker - Auto Deploy"
echo "====================================="

# Get commit message from user or use default
if [ -z "$1" ]; then
    echo "📝 Enter commit message (or press Enter for default):"
    read commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
else
    commit_message="$1"
fi

echo ""
echo "📦 Step 1: Adding files to Git..."
git add .

echo ""
echo "💾 Step 2: Committing changes..."
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
else
    echo "⚠️  No changes to commit or commit failed"
fi

echo ""
echo "📤 Step 3: Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Pushed to GitHub successfully!"
else
    echo "❌ GitHub push failed!"
    exit 1
fi

echo ""
echo "☁️  Step 4: Deploying to Google Cloud..."
echo "🔧 Setting project to sak-expense-tracker..."
gcloud config set project sak-expense-tracker
gcloud app deploy --quiet

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "====================================="
    echo "📍 Live at: https://sak-expense-tracker.df.r.appspot.com"
    echo "🗂️  GitHub: https://github.com/qutubkothari/SAK-Expense-Tracker"
else
    echo "❌ Google Cloud deployment failed!"
    exit 1
fi
