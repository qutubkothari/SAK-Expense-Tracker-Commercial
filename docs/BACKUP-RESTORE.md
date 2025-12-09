# Backup & Restore Guide

## 🔖 Current Backup: v1.0-globalized

**Created**: November 8, 2025  
**Status**: Fully globalized, 80% feature complete  
**Branch**: `backup/v1.0-globalized`  
**Tag**: `v1.0-globalized`

### What's Included in This Backup:
✅ Fully globalized (no hardcoded INR, regions, merchants, languages)  
✅ AI-powered voice input (OpenAI Whisper + GPT-4o-mini)  
✅ AI-powered receipt scanning (GPT-4 Vision)  
✅ SMS bank parsing (universal, no region locks)  
✅ Smart business expense detection  
✅ Multi-currency support (14 currencies)  
✅ Auto-travel detection  
✅ Family expense sharing  
✅ Budget tracking  
✅ Subscription detection  
✅ Export to Excel/PDF/CSV  
✅ Offline-first PWA  
✅ Auto-deployment scripts  

### What's Coming Next (Not in This Backup):
⏳ Bill payment reminder system  
⏳ Enhanced budget variance alerts  
⏳ Tax category mapping for business users  
⏳ Database schema update (amount_inr → amount_base)  

---

## 🔄 How to Restore This Version

### Option 1: Using Git Tag (Recommended)
```bash
# View available backups
git tag -l

# Restore to v1.0-globalized
git checkout v1.0-globalized

# Create new branch from backup (if you want to continue from here)
git checkout -b restore-v1.0 v1.0-globalized

# Or reset main branch to this version (CAUTION: destroys newer changes)
git checkout main
git reset --hard v1.0-globalized
```

### Option 2: Using Backup Branch
```bash
# Switch to backup branch
git checkout backup/v1.0-globalized

# Create new branch from backup
git checkout -b my-new-branch

# Or merge backup into main
git checkout main
git merge backup/v1.0-globalized
```

### Option 3: Cherry-Pick Specific Changes
```bash
# View commits in backup
git log backup/v1.0-globalized

# Cherry-pick specific commit
git cherry-pick <commit-hash>
```

---

## 📦 Deployed Version Info

**Live URL**: https://sak-expense-tracker.df.r.appspot.com  
**Last Deploy**: November 8, 2025  
**Version**: 20251108t212449  
**Commit**: a041199  

To rollback production to this version:
```bash
# List versions
gcloud app versions list

# Set traffic to specific version
gcloud app versions migrate 20251108t212449

# Or deploy from this backup
git checkout v1.0-globalized
gcloud app deploy --quiet
```

---

## 🗂️ Database Backup (Future)

**Note**: For complete backup, also backup Supabase database:

1. Go to Supabase Dashboard
2. Settings → Database → Backups
3. Create manual backup labeled "v1.0-globalized"
4. Download SQL dump if needed

Schema files included in git:
- `schema.sql` (main expenses table)
- `schema-ai.sql` (AI insights)
- `schema-currency.sql` (currency conversions)
- `budget-setup.sql` (budgets)
- `paywall-setup.sql` (subscriptions)
- `subscription-setup.sql` (recurring expenses)

---

## 🚨 Emergency Rollback Procedure

If new features break production:

1. **Quick rollback** (uses backup tag):
   ```bash
   git checkout v1.0-globalized
   gcloud app deploy --quiet
   ```

2. **Full reset** (resets main branch):
   ```bash
   git checkout main
   git reset --hard v1.0-globalized
   git push --force origin main
   gcloud app deploy --quiet
   ```

3. **Database rollback** (if schema changed):
   - Restore Supabase backup from dashboard
   - Or revert schema changes manually

---

## 📝 Change Log

### v1.0-globalized (November 8, 2025)
**Theme**: Complete globalization for worldwide monetization

**Major Changes**:
- Removed all hardcoded base currency references (INR → dynamic)
- Removed hardcoded currency-to-location mappings
- Removed region-specific merchant names from AI prompts
- Removed all language-specific examples
- Fixed Whisper language detection (always pass hint)
- Added smart business expense detection
- Created auto-deployment scripts (Unix + Windows)

**Files Modified**:
- `currencyService.js` - Dynamic base currency system
- `voiceAI.js` - Language-agnostic AI prompts
- `app.js` - Business expense detection
- `auto-deploy.sh` - Unix deployment script
- `auto-deploy.bat` - Windows deployment script

**Commits**: 21+ deployments during globalization session

---

## 🎯 Version History

| Version | Date | Description | Tag |
|---------|------|-------------|-----|
| v1.0-globalized | Nov 8, 2025 | Fully globalized, pre-monetization features | `v1.0-globalized` |
| (future) v1.1-monetization | TBD | +Bill reminders, tax categories, budget alerts | TBD |
| (future) v1.2-banking | TBD | +Plaid integration, investment tracking | TBD |

---

## 💡 Best Practices

1. **Before Major Changes**: Always create backup tag + branch
2. **Tag Naming**: Use semantic versioning (v1.0, v1.1, v2.0)
3. **Branch Naming**: Use `backup/vX.Y-description` format
4. **Deploy Testing**: Test on local first, then deploy
5. **Database Backups**: Manual Supabase backup before schema changes

---

## 🆘 Help

- **Restore failed?** Check git log: `git log --oneline --graph --all`
- **Lost commit?** Use reflog: `git reflog`
- **Need older backup?** View all tags: `git tag -l -n`
- **Production broken?** Rollback: `git checkout v1.0-globalized && gcloud app deploy`

**Contact**: Check GitHub issues or repository owner
