# Deployment Scripts

This folder contains automated deployment scripts for the SAK Expense Tracker app.

## ⚠️ IMPORTANT: Project Configuration

This app deploys to: **`sak-expense-tracker`**

Both scripts automatically set the correct GCP project before deployment to avoid deploying to the wrong project (e.g., `sak-whatsapp-ai-sales-assist`).

## Available Scripts

### 1. `deploy.bat` (Windows)
**Simple deployment script** - deploys current code to Google App Engine.

```bash
.\scripts\deploy.bat
```

**What it does:**
- Sets GCP project to `sak-expense-tracker`
- Deploys to App Engine
- Shows confirmation with app URL

### 2. `auto-deploy.sh` (Linux/Mac)
**Full deployment pipeline** - commits to Git, pushes to GitHub, and deploys to Google Cloud.

```bash
./scripts/auto-deploy.sh "Your commit message"
```

**What it does:**
1. Adds all changes to Git
2. Commits with your message (or auto-generated timestamp)
3. Pushes to GitHub (`origin/main`)
4. Sets GCP project to `sak-expense-tracker`
5. Deploys to App Engine

## Manual Deployment

If you need to deploy manually:

```bash
# ALWAYS set the project first
gcloud config set project sak-expense-tracker

# Then deploy
gcloud app deploy --quiet
```

## Verify Deployment

After deployment, check:
- **App URL:** https://sak-expense-tracker.df.r.appspot.com
- **Status:** Should return 200 OK

```bash
# Check app status
curl -I https://sak-expense-tracker.df.r.appspot.com
```

## Troubleshooting

### "Service Unavailable" Error
- Check if you deployed to the correct project
- Verify with: `gcloud config get-value project`
- Should show: `sak-expense-tracker`

### Wrong Project
If you accidentally deployed to the wrong project:

```bash
# Switch back to correct project
gcloud config set project sak-expense-tracker

# Redeploy
gcloud app deploy --quiet
```

## Project List

Available GCP projects:
- `sak-expense-tracker` ← **This app**
- `sak-whatsapp-ai-sales-assist` ← Different project
- Other projects...

Always double-check before deploying!
