-- Add project column to expenses table for project-based expense tracking
-- This allows businesses to track expenses by project (exhibitions, clients, departments, etc.)

-- Add project column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS project TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project);

-- Create index for combined user_id + project queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_project ON expenses(user_id, project);

-- Verification query
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'expenses' AND column_name = 'project';

-- Sample projects for business expense tracking:
-- Events: "Exhibition Delhi", "Exhibition Chennai", "Conference Mumbai"
-- Clients: "Client Project A", "Client Project B"
-- Locations: "Delhi Office", "Mumbai Office"
-- Departments: "Marketing Campaign", "Sales Operations"
-- Internal: "General Operations", "Admin Overhead"
