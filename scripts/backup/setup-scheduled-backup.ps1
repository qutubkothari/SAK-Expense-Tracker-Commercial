# Setup Windows Task Scheduler for Automated Daily Backups
# Run this script once to configure the scheduled task
# This script must be run as Administrator

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "========== SAK Expense Tracker - Backup Scheduler Setup ==========" -ForegroundColor Cyan
Write-Host ""

# Configuration
$taskName = "SAK-Expense-Tracker-Daily-Backup"
$scriptPath = "c:\Users\musta\OneDrive\Documents\GitHub\SAK-Expense-Tracker\scripts\backup\daily-backup.ps1"
$backupPath = "C:\SAK-Backups"

# Ask user for backup time
Write-Host "When would you like the backup to run daily?" -ForegroundColor Yellow
$hour = Read-Host "Enter hour (0-23, default is 2 for 2:00 AM)"
if ([string]::IsNullOrWhiteSpace($hour)) { $hour = 2 }

$minute = Read-Host "Enter minute (0-59, default is 0)"
if ([string]::IsNullOrWhiteSpace($minute)) { $minute = 0 }

# Ask about cloud backup
Write-Host ""
$uploadCloud = Read-Host "Upload backups to OneDrive? (y/n, default is n)"
$uploadCloudParam = if ($uploadCloud -eq 'y') { "-UploadToCloud" } else { "" }

# Create backup directory
Write-Host ""
Write-Host "Creating backup directory at: $backupPath" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupPath | Out-Null

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing scheduled task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the scheduled task
Write-Host "Creating scheduled task: $taskName" -ForegroundColor Cyan

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -BackupPath `"$backupPath`" $uploadCloudParam"

$trigger = New-ScheduledTaskTrigger -Daily -At "$($hour):$($minute)"

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
    -Description "Automated daily backup of SAK Expense Tracker Supabase database"

Register-ScheduledTask -TaskName $taskName -InputObject $task | Out-Null

Write-Host ""
Write-Host "========== Setup Complete! ==========" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Scheduled Task Created: $taskName" -ForegroundColor Green
Write-Host "✓ Backup Time: Daily at $($hour):$($minute):00" -ForegroundColor Green
Write-Host "✓ Backup Location: $backupPath" -ForegroundColor Green
Write-Host "✓ Retention: Last 30 days (automatic cleanup)" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Update database password in daily-backup.ps1" -ForegroundColor Yellow
Write-Host "  File: $scriptPath" -ForegroundColor Yellow
Write-Host "  Replace [YOUR-PASSWORD] with your actual Supabase database password" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test the backup now, run:" -ForegroundColor Cyan
Write-Host "  cd scripts\backup" -ForegroundColor White
Write-Host "  .\daily-backup.ps1" -ForegroundColor White
Write-Host ""
Write-Host "To view the scheduled task:" -ForegroundColor Cyan
Write-Host "  Open Task Scheduler (taskschd.msc)" -ForegroundColor White
Write-Host "  Look for: $taskName" -ForegroundColor White
Write-Host ""
