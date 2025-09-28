-- Fix pet_nutrition_plans table - add missing policies and index
-- The veterinarian_id column already exists, so we only need to add policies and index

-- Create index for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_pet_nutrition_plans_veterinarian_id ON pet_nutrition_plans(veterinarian_id);

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view nutrition plans for own pets" ON pet_nutrition_plans;
DROP POLICY IF EXISTS "Veterinarians can view own nutrition plans" ON pet_nutrition_plans;
DROP POLICY IF EXISTS "Veterinarians can insert nutrition plans" ON pet_nutrition_plans;
DROP POLICY IF EXISTS "Veterinarians can update own nutrition plans" ON pet_nutrition_plans;
DROP POLICY IF EXISTS "Veterinarians can delete own nutrition plans" ON pet_nutrition_plans;

-- Add RLS policies for pet_nutrition_plans
CREATE POLICY "Users can view nutrition plans for own pets" ON pet_nutrition_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets 
            WHERE pets.id = pet_nutrition_plans.pet_id 
            AND pets.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Veterinarians can view own nutrition plans" ON pet_nutrition_plans
    FOR SELECT USING (auth.uid()::text = veterinarian_id::text);

CREATE POLICY "Veterinarians can insert nutrition plans" ON pet_nutrition_plans
    FOR INSERT WITH CHECK (auth.uid()::text = veterinarian_id::text);

CREATE POLICY "Veterinarians can update own nutrition plans" ON pet_nutrition_plans
    FOR UPDATE USING (auth.uid()::text = veterinarian_id::text);

CREATE POLICY "Veterinarians can delete own nutrition plans" ON pet_nutrition_plans
    FOR DELETE USING (auth.uid()::text = veterinarian_id::text);

-- Update existing records to set veterinarian_id to NULL (they were created by users, not vets)
-- This is safe because the column allows NULL values
UPDATE pet_nutrition_plans 
SET veterinarian_id = NULL 
WHERE veterinarian_id IS NULL;
