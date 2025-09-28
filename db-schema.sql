-- Database Schema for Pet Health Assistant
-- PostgreSQL Database

-- Users table (ผู้ใช้งานทั้งหมด)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'veterinarian', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Veterinarians table (ข้อมูลเพิ่มเติมสำหรับสัตวแพทย์)
CREATE TABLE veterinarians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization TEXT,
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    years_of_experience INTEGER,
    bio TEXT,
    consultation_fee DECIMAL(10,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet species and breeds (ชนิดและสายพันธุ์สัตว์)
CREATE TABLE species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE breeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID REFERENCES species(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    average_lifespan INTEGER, -- in years
    average_weight_min DECIMAL(5,2), -- in kg
    average_weight_max DECIMAL(5,2), -- in kg
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets table (ข้อมูลสัตว์เลี้ยง)
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species_id UUID REFERENCES species(id),
    breed_id UUID REFERENCES breeds(id),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    weight DECIMAL(5,2), -- current weight in kg
    color VARCHAR(100),
    microchip_id VARCHAR(50),
    profile_image_url TEXT,
    special_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health records (บันทึกสุขภาพ)
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('vaccination', 'medication', 'checkup', 'surgery', 'illness', 'injury')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    veterinarian_id UUID REFERENCES veterinarians(id),
    record_date DATE NOT NULL,
    next_due_date DATE,
    cost DECIMAL(10,2),
    attachments JSONB, -- for storing file URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccinations (การฉีดวัคซีน)
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_record_id UUID REFERENCES health_records(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    batch_number VARCHAR(100),
    expiry_date DATE,
    next_due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications (การให้ยา)
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_record_id UUID REFERENCES health_records(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100), -- e.g., "twice daily", "every 8 hours"
    duration_days INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition guidelines (คำแนะนำโภชนาการ)
CREATE TABLE nutrition_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veterinarian_id UUID REFERENCES veterinarians(id),
    species_id UUID REFERENCES species(id),
    breed_id UUID REFERENCES breeds(id),
    age_min_months INTEGER,
    age_max_months INTEGER,
    weight_min_kg DECIMAL(5,2),
    weight_max_kg DECIMAL(5,2),
    daily_calories INTEGER,
    protein_percentage DECIMAL(5,2),
    fat_percentage DECIMAL(5,2),
    carb_percentage DECIMAL(5,2),
    feeding_frequency INTEGER, -- times per day
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet nutrition assignments (การกำหนดโภชนาการให้สัตว์เลี้ยง)
CREATE TABLE pet_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    nutrition_guideline_id UUID REFERENCES nutrition_guidelines(id),
    veterinarian_id UUID REFERENCES veterinarians(id),
    custom_instructions TEXT,
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications/Reminders (การแจ้งเตือน)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('vaccination', 'medication', 'checkup', 'nutrition', 'general')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments (การนัดหมาย)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES veterinarians(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN ('checkup', 'vaccination', 'consultation', 'surgery', 'emergency')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles (บทความ)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category VARCHAR(100),
    tags TEXT[], -- array of tags
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article categories (หมวดหมู่บทความ)
CREATE TABLE article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions (สำหรับ authentication)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings (การตั้งค่าระบบ)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs (บันทึกการใช้งาน)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_due_date ON notifications(due_date);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_vet_id ON appointments(veterinarian_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_articles_published ON articles(is_published);
CREATE INDEX idx_articles_category ON articles(category);

-- Insert default data
INSERT INTO species (name) VALUES 
('สุนัข'),
('แมว'),
('นก'),
('กระต่าย'),
('หนูแฮมสเตอร์');

INSERT INTO breeds (species_id, name, average_lifespan, average_weight_min, average_weight_max) 
SELECT s.id, 'ลาบราดอร์', 12, 25.0, 36.0 FROM species s WHERE s.name = 'สุนัข'
UNION ALL
SELECT s.id, 'โกลเด้น รีทรีฟเวอร์', 12, 25.0, 34.0 FROM species s WHERE s.name = 'สุนัข'
UNION ALL
SELECT s.id, 'ชิวาวา', 15, 1.5, 3.0 FROM species s WHERE s.name = 'สุนัข'
UNION ALL
SELECT s.id, 'แมวเปอร์เซีย', 15, 3.0, 5.5 FROM species s WHERE s.name = 'แมว'
UNION ALL
SELECT s.id, 'แมวสยาม', 15, 2.5, 4.5 FROM species s WHERE s.name = 'แมว';

INSERT INTO article_categories (name, slug, description) VALUES
('การดูแลทั่วไป', 'general-care', 'เคล็ดลับการดูแลสัตว์เลี้ยงในชีวิตประจำวัน'),
('โภชนาการ', 'nutrition', 'ข้อมูลเกี่ยวกับอาหารและโภชนาการสัตว์เลี้ยง'),
('สุขภาพและโรคภัย', 'health-disease', 'ข้อมูลเกี่ยวกับโรคและการรักษา'),
('พฤติกรรม', 'behavior', 'การเข้าใจและแก้ไขพฤติกรรมสัตว์เลี้ยง'),
('การฝึก', 'training', 'วิธีการฝึกสัตว์เลี้ยง');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('notification_advance_days', '7', 'จำนวนวันที่แจ้งเตือนล่วงหน้า'),
('max_pets_per_user', '10', 'จำนวนสัตว์เลี้ยงสูงสุดต่อผู้ใช้'),
('appointment_duration_default', '30', 'ระยะเวลานัดหมายเริ่มต้น (นาที)'),
('site_maintenance', 'false', 'สถานะการปิดปรับปรุงระบบ');
