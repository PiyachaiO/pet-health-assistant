-- Migration: Add missing fields for Admin functionality
-- Date: 2025-01-11

-- Add missing fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add missing fields to nutrition_guidelines table
ALTER TABLE nutrition_guidelines 
ADD COLUMN IF NOT EXISTS breed VARCHAR(100);

-- Update existing users to have is_active = true
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- Create index for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_nutrition_guidelines_breed ON nutrition_guidelines(breed);

-- Add comments for documentation
COMMENT ON COLUMN users.is_active IS 'User account status - true for active, false for suspended';
COMMENT ON COLUMN users.last_login IS 'Last login timestamp for user activity tracking';
COMMENT ON COLUMN nutrition_guidelines.breed IS 'Specific breed for nutrition guidelines (optional)';
