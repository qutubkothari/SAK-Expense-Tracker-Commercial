# SAK Expense Tracker - Database Restore Script
# Use this script to restore from a backup

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [switch]$DryRun = $false
)

Write-Host "========== SAK Expense Tracker - Database Restore ==========" -ForegroundColor Cyan
Write-Host ""

# Check if backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

# Determine if it's a zip file or SQL file
$isZip = $BackupFile -like "*.zip"

if ($isZip) {
    Write-Host "Extracting backup archive..." -ForegroundColor Yellow
    $extractPath = Join-Path ([System.IO.Path]::GetTempPath()) "sak-restore-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Expand-Archive -Path $BackupFile -DestinationPath $extractPath -Force
    
    # Find the main SQL dump file
    $sqlFile = Get-ChildItem $extractPath -Filter "full-database-dump.sql" -Recurse | Select-Object -First 1
    if (-not $sqlFile) {
        Write-Host "ERROR: Could not find full-database-dump.sql in the archive" -ForegroundColor Red
        exit 1
    }
    $BackupFile = $sqlFile.FullName
    Write-Host "✓ Extracted to: $BackupFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backup file: $BackupFile" -ForegroundColor White
$size = (Get-Item $BackupFile).Length / 1MB
Write-Host "File size: $([math]::Round($size, 2)) MB" -ForegroundColor White
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This would restore the database from:" -ForegroundColor White
    Write-Host "  $BackupFile" -ForegroundColor White
    Write-Host ""
    Write-Host "To perform actual restore, run without -DryRun flag" -ForegroundColor Cyan
    exit 0
}

# Confirmation
Write-Host "⚠️  WARNING: This will OVERWRITE your current database!" -ForegroundColor Red
Write-Host "⚠️  Make sure you have a current backup before proceeding!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Type 'RESTORE' to continue, or anything else to cancel"

if ($confirm -ne "RESTORE") {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting restore process..." -ForegroundColor Cyan

try {
    # Check if Supabase CLI is installed
    $supabasePath = Get-Command supabase -ErrorAction SilentlyContinue
    if (-not $supabasePath) {
        Write-Host "ERROR: Supabase CLI not found. Install from: https://supabase.com/docs/guides/cli" -ForegroundColor Red
        exit 1
    }

    # Set location to project
    Set-Location "c:\Users\musta\OneDrive\Documents\GitHub\SAK-Expense-Tracker"

    # Execute restore
    Write-Host "Restoring database..." -ForegroundColor Yellow
    
    # Use psql to restore
    $dbUrl = "postgresql://postgres.vgyudxqsjsjlgqwtynch:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
    
    # Alternative restore command using psql directly
    Write-Host ""
    Write-Host "Run this command in your terminal:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "psql `"$dbUrl`" < `"$BackupFile`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use Supabase Dashboard:" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://supabase.com/dashboard/project/vgyudxqsjsjlgqwtynch/editor" -ForegroundColor White
    Write-Host "  2. Open SQL Editor" -ForegroundColor White
    Write-Host "  3. Paste the contents of: $BackupFile" -ForegroundColor White
    Write-Host "  4. Run the query" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "ERROR during restore: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "========== Restore Information Provided ==========" -ForegroundColor Green
