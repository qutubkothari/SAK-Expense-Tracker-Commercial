# SAK Expense Tracker - Automated Daily Backup Script
# This script backs up your Supabase database to local storage and optionally to cloud storage
# Run this script daily via Windows Task Scheduler

param(
    [string]$BackupPath = "C:\SAK-Backups",
    [switch]$UploadToCloud = $false
)

# Configuration
$ProjectRef = "vgyudxqsjsjlgqwtynch"  # Your Supabase project reference
$DatabaseName = "postgres"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$BackupFolder = Join-Path $BackupPath $Timestamp
$LogFile = Join-Path $BackupPath "backup-log.txt"

# Create backup directory
New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null

# Function to log messages
function Write-Log {
    param([string]$Message)
    $LogMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "========== Starting Backup =========="
Write-Log "Backup Location: $BackupFolder"

try {
    # Check if Supabase CLI is installed
    $supabasePath = Get-Command supabase -ErrorAction SilentlyContinue
    if (-not $supabasePath) {
        Write-Log "ERROR: Supabase CLI not found. Install from: https://supabase.com/docs/guides/cli"
        exit 1
    }

    # Backup 1: Full database dump using Supabase CLI
    Write-Log "Creating full database dump..."
    $dumpFile = Join-Path $BackupFolder "full-database-dump.sql"
    
    # Link to project if not already linked
    Set-Location "c:\Users\musta\OneDrive\Documents\GitHub\SAK-Expense-Tracker"
    
    # Export schema and data
    supabase db dump --db-url "postgresql://postgres.vgyudxqsjsjlgqwtynch:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f $dumpFile
    
    if (Test-Path $dumpFile) {
        $size = (Get-Item $dumpFile).Length / 1MB
        Write-Log "✓ Full database dump created: $([math]::Round($size, 2)) MB"
    } else {
        Write-Log "✗ Failed to create database dump"
    }

    # Backup 2: Individual table exports (human-readable format)
    Write-Log "Exporting individual tables..."
    $tables = @('expenses', 'categories', 'subcategories', 'budgets', 'budget_alerts', 
                'bills', 'subscriptions', 'user_preferences', 'currency_rates', 
                'tax_categories', 'receipts')
    
    foreach ($table in $tables) {
        $tableFile = Join-Path $BackupFolder "$table.sql"
        supabase db dump --db-url "postgresql://postgres.vgyudxqsjsjlgqwtynch:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" --data-only -t public.$table -f $tableFile
        if (Test-Path $tableFile) {
            Write-Log "  ✓ Exported table: $table"
        }
    }

    # Backup 3: Schema-only backup (for quick restore structure)
    Write-Log "Creating schema-only backup..."
    $schemaFile = Join-Path $BackupFolder "schema-only.sql"
    supabase db dump --db-url "postgresql://postgres.vgyudxqsjsjlgqwtynch:[YOUR-PASSWORD]@aws-0-ap-southeast-com:6543/postgres" --schema-only -f $schemaFile
    Write-Log "✓ Schema backup created"

    # Backup 4: Create metadata file
    Write-Log "Creating metadata..."
    $metadata = @{
        BackupDate = $Timestamp
        ProjectRef = $ProjectRef
        TablesBackedUp = $tables
        BackupType = "Automated Daily Backup"
        ScriptVersion = "1.0"
        TotalSize = (Get-ChildItem $BackupFolder -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    }
    $metadata | ConvertTo-Json | Out-File (Join-Path $BackupFolder "metadata.json")
    Write-Log "✓ Metadata created"

    # Backup 5: Compress the backup
    Write-Log "Compressing backup..."
    $zipFile = "$BackupFolder.zip"
    Compress-Archive -Path $BackupFolder -DestinationPath $zipFile -Force
    $zipSize = (Get-Item $zipFile).Length / 1MB
    Write-Log "✓ Backup compressed: $([math]::Round($zipSize, 2)) MB"

    # Cleanup: Keep only last 30 days of backups
    Write-Log "Cleaning old backups (keeping last 30 days)..."
    $cutoffDate = (Get-Date).AddDays(-30)
    Get-ChildItem $BackupPath -Directory | Where-Object { 
        $_.Name -match '^\d{4}-\d{2}-\d{2}_\d{6}$' -and $_.CreationTime -lt $cutoffDate 
    } | ForEach-Object {
        Remove-Item $_.FullName -Recurse -Force
        Write-Log "  Removed old backup: $($_.Name)"
    }
    
    # Cleanup old zip files
    Get-ChildItem $BackupPath -Filter "*.zip" | Where-Object { 
        $_.CreationTime -lt $cutoffDate 
    } | ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Log "  Removed old zip: $($_.Name)"
    }

    # Optional: Upload to cloud storage (OneDrive/Google Drive/Dropbox)
    if ($UploadToCloud) {
        Write-Log "Uploading to cloud storage..."
        # Example: Copy to OneDrive
        $cloudPath = "C:\Users\musta\OneDrive\SAK-Database-Backups"
        if (Test-Path $cloudPath) {
            Copy-Item $zipFile -Destination $cloudPath -Force
            Write-Log "✓ Uploaded to OneDrive"
        } else {
            Write-Log "⚠ Cloud path not found: $cloudPath"
        }
    }

    Write-Log "========== Backup Completed Successfully =========="
    Write-Log "Total backup size: $([math]::Round($zipSize, 2)) MB"
    
    # Send success notification (optional - requires setup)
    # You can add email notification here if needed

} catch {
    Write-Log "========== ERROR DURING BACKUP =========="
    Write-Log "Error: $($_.Exception.Message)"
    Write-Log "Stack Trace: $($_.ScriptStackTrace)"
    
    # Send error notification (optional)
    exit 1
}

# Return success
exit 0
