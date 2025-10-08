-- =====================================================
-- Migration: Add Vet Applications Table
-- Date: 2025-10-07 00:00:00
-- Description: Add vet_applications table for veterinarian upgrade requests
-- =====================================================

-- Create vet_applications table
CREATE TABLE IF NOT EXISTS public.vet_applications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- ข้อมูลการขอเป็นสัตวแพทย์
  license_number character varying(100),
  experience_years integer,
  workplace character varying(255),
  specialization character varying(100),
  additional_info text,
  
  -- ไฟล์เอกสาร
  license_document_url text,
  portfolio_url text,
  
  -- สถานะการอนุมัติ
  status approval_status DEFAULT 'pending',
  
  -- วันที่และผู้เกี่ยวข้อง
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.users(id),
  
  -- เหตุผลและหมายเหตุ
  rejection_reason text,
  admin_notes text,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT vet_applications_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX idx_vet_applications_user_id ON public.vet_applications USING btree (user_id);
CREATE INDEX idx_vet_applications_status ON public.vet_applications USING btree (status);
CREATE INDEX idx_vet_applications_submitted_at ON public.vet_applications USING btree (submitted_at);
CREATE INDEX idx_vet_applications_reviewed_by ON public.vet_applications USING btree (reviewed_by);

-- Enable RLS
ALTER TABLE public.vet_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own applications
CREATE POLICY "Users can view own vet applications" ON public.vet_applications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own vet applications" ON public.vet_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending vet applications" ON public.vet_applications
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all vet applications" ON public.vet_applications
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Admins can update all applications (approve/reject)
CREATE POLICY "Admins can update all vet applications" ON public.vet_applications
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Admins can delete applications
CREATE POLICY "Admins can delete vet applications" ON public.vet_applications
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Add trigger for updated_at
CREATE TRIGGER update_vet_applications_updated_at 
    BEFORE UPDATE ON public.vet_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.vet_applications TO anon, authenticated, service_role;

-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vet_applications_user_id_fkey' 
        AND table_name = 'vet_applications'
    ) THEN
        ALTER TABLE public.vet_applications 
        ADD CONSTRAINT vet_applications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vet_applications_reviewed_by_fkey' 
        AND table_name = 'vet_applications'
    ) THEN
        ALTER TABLE public.vet_applications 
        ADD CONSTRAINT vet_applications_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES public.users(id);
    END IF;
END $$;

-- Add check constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_experience_years' 
        AND table_name = 'vet_applications'
    ) THEN
        ALTER TABLE public.vet_applications 
        ADD CONSTRAINT check_experience_years 
        CHECK (experience_years >= 0 AND experience_years <= 50);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_license_number_length' 
        AND table_name = 'vet_applications'
    ) THEN
        ALTER TABLE public.vet_applications 
        ADD CONSTRAINT check_license_number_length 
        CHECK (char_length(license_number) >= 3);
    END IF;
END $$;

-- Add unique constraint for user_id to prevent multiple pending applications (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_vet_applications_user_pending'
    ) THEN
        CREATE UNIQUE INDEX idx_vet_applications_user_pending 
        ON public.vet_applications (user_id) 
        WHERE status = 'pending';
    END IF;
END $$;
