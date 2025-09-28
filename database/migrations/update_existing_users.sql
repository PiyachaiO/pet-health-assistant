-- Migration: Update existing users to have is_active and last_login fields
-- Date: 2025-01-11

-- Update existing users to have is_active = true and last_login = NOW()
UPDATE users 
SET 
  is_active = true,
  last_login = NOW()
WHERE is_active IS NULL OR last_login IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.is_active IS 'User account status - true for active, false for suspended';
COMMENT ON COLUMN users.last_login IS 'Last login timestamp for user activity tracking';
