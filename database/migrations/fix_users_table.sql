-- Fix users table by adding missing columns
-- Date: 2025-01-11

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing users to have is_active = true
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Add comments for documentation
COMMENT ON COLUMN users.is_active IS 'User account status - true for active, false for suspended';
COMMENT ON COLUMN users.last_login IS 'Last login timestamp for user activity tracking';

