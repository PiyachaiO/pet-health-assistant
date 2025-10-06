-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'veterinarian', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'unknown');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled');
CREATE TYPE appointment_type AS ENUM ('checkup', 'vaccination', 'consultation', 'surgery', 'emergency');
CREATE TYPE record_type AS ENUM ('vaccination', 'medication', 'checkup', 'surgery', 'illness', 'injury');
CREATE TYPE notification_type AS ENUM (
    'vaccination_due', 
    'medication_reminder', 
    'appointment_reminder', 
    'checkup_due',
    'article_published',
    'nutrition_plan_created',
    'health_record_updated'
);
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets table
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    birth_date DATE,
    gender gender_type,
    weight DECIMAL(5,2),
    color VARCHAR(100),
    microchip_id VARCHAR(50),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health records table
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    record_type record_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL,
    next_due_date DATE,
    veterinarian_id UUID REFERENCES users(id),
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES users(id),
    appointment_type appointment_type NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    diagnosis TEXT,
    treatment TEXT,
    approval_status approval_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition guidelines table
CREATE TABLE nutrition_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    veterinarian_id UUID REFERENCES users(id) ON DELETE CASCADE,
    species VARCHAR(100) NOT NULL,
    age_range VARCHAR(50) NOT NULL,
    daily_calories INTEGER NOT NULL,
    protein_percentage DECIMAL(5,2) NOT NULL,
    fat_percentage DECIMAL(5,2) NOT NULL,
    feeding_frequency INTEGER NOT NULL,
    instructions TEXT,
    approval_status approval_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet nutrition plans table
CREATE TABLE pet_nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    guideline_id UUID REFERENCES nutrition_guidelines(id),
    veterinarian_id UUID REFERENCES users(id) ON DELETE CASCADE,
    custom_calories INTEGER,
    custom_instructions TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    priority priority_level DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    featured_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_veterinarian_id ON appointments(veterinarian_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_pet_nutrition_plans_veterinarian_id ON pet_nutrition_plans(veterinarian_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_due_date ON notifications(due_date);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(is_published);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for pets
CREATE POLICY "Users can view own pets" ON pets
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own pets" ON pets
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own pets" ON pets
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own pets" ON pets
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for health records
CREATE POLICY "Users can view own pet health records" ON health_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets 
            WHERE pets.id = health_records.pet_id 
            AND pets.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert health records for own pets" ON health_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets 
            WHERE pets.id = health_records.pet_id 
            AND pets.user_id::text = auth.uid()::text
        )
    );

-- RLS Policies for appointments
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Veterinarians can view assigned appointments" ON appointments
    FOR SELECT USING (auth.uid()::text = veterinarian_id::text);

-- RLS Policies for pet_nutrition_plans
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

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for articles
CREATE POLICY "Anyone can view published articles" ON articles
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can view own articles" ON articles
    FOR SELECT USING (auth.uid()::text = author_id::text);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_guidelines_updated_at BEFORE UPDATE ON nutrition_guidelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_nutrition_plans_updated_at BEFORE UPDATE ON pet_nutrition_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
