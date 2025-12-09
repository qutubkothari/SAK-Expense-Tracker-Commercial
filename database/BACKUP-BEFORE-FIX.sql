-- BACKUP SCRIPT - Run this BEFORE the fix to create a backup

-- Backup categories
CREATE TABLE IF NOT EXISTS categories_backup_20251127 AS 
SELECT * FROM categories;

-- Backup subcategories
CREATE TABLE IF NOT EXISTS subcategories_backup_20251127 AS 
SELECT * FROM subcategories;

-- Backup expenses
CREATE TABLE IF NOT EXISTS expenses_backup_20251127 AS 
SELECT * FROM expenses;

-- Verify backups
SELECT 'Categories backup:' as table_name, COUNT(*) as row_count FROM categories_backup_20251127
UNION ALL
SELECT 'Subcategories backup:', COUNT(*) FROM subcategories_backup_20251127
UNION ALL
SELECT 'Expenses backup:', COUNT(*) FROM expenses_backup_20251127;

-- If you need to restore, run:
-- DROP TABLE categories;
-- CREATE TABLE categories AS SELECT * FROM categories_backup_20251127;
-- (same for subcategories and expenses)
