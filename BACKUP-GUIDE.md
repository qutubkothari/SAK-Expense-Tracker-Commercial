# SAK Expense Tracker - Backup & Recovery Guide

## 🛡️ Automated Backup System

Your database now has a comprehensive automated backup system with multiple layers of protection.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Get Your Database Password

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vgyudxqsjsjlgqwtynch/settings/database
2. Scroll to **Connection String** section
3. Copy your database password
4. Open `scripts/backup/daily-backup.ps1`
5. Replace `[YOUR-PASSWORD]` (appears 3 times) with your actual password

### Step 2: Install Supabase CLI

```powershell
# Using Scoop (recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using NPM
npm install -g supabase
```

### Step 3: Run Setup Script

```powershell
# Open PowerShell as Administrator (Right-click → Run as Administrator)
cd c:\Users\musta\OneDrive\Documents\GitHub\SAK-Expense-Tracker\scripts\backup
.\setup-scheduled-backup.ps1
```

The setup will ask:
- **Backup time**: When to run daily (default: 2:00 AM)
- **Cloud upload**: Upload to OneDrive? (default: no)

### Step 4: Test the Backup

```powershell
# Test manually (no admin required)
.\daily-backup.ps1
```

Check `C:\SAK-Backups` for the backup files.

---

## 🔄 Backup Features

### What Gets Backed Up

1. **Full Database Dump** - Complete snapshot including:
   - All tables: expenses, categories, subcategories, budgets, bills, subscriptions
   - All RLS policies and constraints
   - All indexes and sequences
   - User data from all 9 users (tenant-isolated)

2. **Individual Table Exports** - Separate files for each table (easier to restore specific data)

3. **Schema-Only Backup** - Database structure without data (quick structure recovery)

4. **Metadata File** - Backup information (date, size, tables included)

### Backup Schedule

- **Frequency**: Daily at configured time (default: 2:00 AM)
- **Retention**: Last 30 days (automatic cleanup)
- **Compression**: Automatically compressed to ZIP
- **Location**: `C:\SAK-Backups\YYYY-MM-DD_HHMMSS\`

### Backup Storage

- **Local**: `C:\SAK-Backups\` (30 days)
- **OneDrive** (optional): `C:\Users\musta\OneDrive\SAK-Database-Backups\`
- **Compressed Size**: ~2-10 MB per backup (depends on data)

---

## 🔧 Maintenance

### View Scheduled Task

1. Press `Win + R`, type `taskschd.msc`, press Enter
2. Look for: **SAK-Expense-Tracker-Daily-Backup**
3. Right-click → Properties to view/edit settings

### Check Backup Logs

```powershell
notepad C:\SAK-Backups\backup-log.txt
```

### Manual Backup (Anytime)

```powershell
cd scripts\backup
.\daily-backup.ps1

# With cloud upload
.\daily-backup.ps1 -UploadToCloud
```

### Change Backup Time

Run setup again:
```powershell
cd scripts\backup
.\setup-scheduled-backup.ps1
```

### Disable Backups

```powershell
# Open Task Scheduler
taskschd.msc

# Right-click "SAK-Expense-Tracker-Daily-Backup" → Disable
# Or delete the task entirely
```

---

## 🚨 Disaster Recovery

### Scenario 1: Accidental Data Deletion (Recent)

**Use Supabase Point-in-Time Recovery (PITR):**

1. Go to: https://supabase.com/dashboard/project/vgyudxqsjsjlgqwtynch/database/backups
2. Click "Point in Time Recovery"
3. Select the exact time before deletion
4. Click "Restore"

✅ **Recovery Time**: 5-10 minutes  
✅ **Data Loss**: Zero (if PITR is enabled)

### Scenario 2: Database Corruption or Major Issue

**Use Local Backup:**

1. Find the backup before the issue:
   ```powershell
   cd C:\SAK-Backups
   dir | sort LastWriteTime
   ```

2. Extract and review:
   ```powershell
   # Extract the zip file
   Expand-Archive "2024-11-27_020000.zip" -DestinationPath "restore-preview"
   
   # Check metadata
   cat restore-preview\2024-11-27_020000\metadata.json
   ```

3. Restore using Supabase Dashboard:
   - Go to: https://supabase.com/dashboard/project/vgyudxqsjsjlgqwtynch/editor
   - Open SQL Editor
   - Open `full-database-dump.sql` from the backup
   - Copy and paste contents
   - Run the query

4. Or use restore script:
   ```powershell
   cd scripts\backup
   .\restore-backup.ps1 -BackupFile "C:\SAK-Backups\2024-11-27_020000.zip"
   ```

✅ **Recovery Time**: 15-30 minutes  
✅ **Data Loss**: Up to 24 hours (daily backups)

### Scenario 3: Complete Server Loss

1. Create new Supabase project
2. Update connection strings in your app
3. Restore from latest backup (see Scenario 2)
4. Update app deployment with new Supabase URL

---

## 📊 Backup Strategy Summary

| Layer | Frequency | Retention | Purpose |
|-------|-----------|-----------|---------|
| **PITR** (Supabase) | Continuous | 7 days | Instant recovery from recent issues |
| **Automated Daily** | Every night | 30 days | Local recovery from any issue |
| **OneDrive** (optional) | Every night | Unlimited | Off-site disaster recovery |
| **Manual** | On-demand | As needed | Before major changes |

---

## ⚙️ Advanced Options

### Export Specific Table

```powershell
cd scripts\backup
supabase db dump --db-url "postgresql://postgres.vgyudxqsjsjlgqwtynch:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" --data-only -t public.expenses -f expenses-backup.sql
```

### Backup Before Major Changes

```powershell
cd scripts\backup
.\daily-backup.ps1 -BackupPath "C:\SAK-Backups\MANUAL-$(Get-Date -Format 'yyyy-MM-dd_HHmmss')"
```

### Restore Single Table

1. Extract specific table SQL from backup
2. In Supabase SQL Editor, run:
   ```sql
   -- Clear existing data (optional)
   TRUNCATE TABLE expenses CASCADE;
   
   -- Then paste and run the table backup SQL
   ```

### Monitor Backup Health

```powershell
# Check last backup
$lastBackup = Get-ChildItem C:\SAK-Backups -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
Write-Host "Last backup: $($lastBackup.Name)"
Write-Host "Created: $($lastBackup.CreationTime)"
Write-Host "Age: $([math]::Round(((Get-Date) - $lastBackup.CreationTime).TotalHours, 1)) hours ago"
```

---

## 🎯 Best Practices

1. **Test Restores Monthly** - Verify backups work
2. **Monitor Backup Logs** - Check weekly for errors
3. **Keep Multiple Copies** - Local + Cloud
4. **Document Recovery** - Know your process
5. **Backup Before Changes** - Manual backup before major updates

---

## 🆘 Support & Troubleshooting

### Backup Not Running?

1. Check Task Scheduler is running
2. Verify PowerShell execution policy: `Get-ExecutionPolicy` (should be RemoteSigned or Unrestricted)
3. Check backup log: `C:\SAK-Backups\backup-log.txt`

### Backup Failing?

1. Verify Supabase CLI installed: `supabase --version`
2. Check database password in `daily-backup.ps1`
3. Verify network connectivity to Supabase
4. Check disk space: `Get-PSDrive C`

### Need Immediate Backup?

```powershell
cd scripts\backup
.\daily-backup.ps1
```

---

## 📞 Emergency Contacts

- **Supabase Support**: https://supabase.com/dashboard/support/new
- **Backup Scripts**: `c:\Users\musta\OneDrive\Documents\GitHub\SAK-Expense-Tracker\scripts\backup\`
- **Backup Location**: `C:\SAK-Backups\`

---

## ✅ Setup Checklist

- [ ] Supabase CLI installed
- [ ] Database password updated in `daily-backup.ps1`
- [ ] Scheduled task created (run `setup-scheduled-backup.ps1`)
- [ ] Test backup completed successfully
- [ ] Backup log file created
- [ ] OneDrive sync configured (optional)
- [ ] Recovery procedure tested
- [ ] Team notified of backup schedule

---

**Last Updated**: November 27, 2024  
**Version**: 1.0  
**Backup System Status**: ✅ Production Ready
