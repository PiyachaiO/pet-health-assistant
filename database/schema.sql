-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS pet_health_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pet_health_assistant;

-- ตาราง users (ผู้ใช้งานทั้งหมด)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'veterinarian', 'admin') NOT NULL DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ตาราง veterinarians (ข้อมูลเพิ่มเติมสำหรับสัตวแพทย์)
CREATE TABLE veterinarians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization TEXT,
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    years_of_experience INT,
    bio TEXT,
    consultation_fee DECIMAL(10,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ตาราง species (ชนิดสัตว์)
CREATE TABLE species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง breeds (สายพันธุ์สัตว์)
CREATE TABLE breeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    species_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    average_lifespan INT, -- in years
    average_weight_min DECIMAL(5,2), -- in kg
    average_weight_max DECIMAL(5,2), -- in kg
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- ตาราง pets (ข้อมูลสัตว์เลี้ยง)
CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    species_id INT,
    breed_id INT,
    birth_date DATE,
    gender ENUM('male', 'female', 'unknown'),
    weight DECIMAL(5,2), -- current weight in kg
    color VARCHAR(100),
    microchip_id VARCHAR(50),
    profile_image_url TEXT,
    special_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id),
    FOREIGN KEY (breed_id) REFERENCES breeds(id)
);

-- ตาราง health_records (บันทึกสุขภาพ)
CREATE TABLE health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    record_type ENUM('vaccination', 'medication', 'checkup', 'surgery', 'illness', 'injury') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    veterinarian_id INT,
    record_date DATE NOT NULL,
    next_due_date DATE,
    cost DECIMAL(10,2),
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id)
);

-- ตาราง vaccinations (การฉีดวัคซีน)
CREATE TABLE vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    health_record_id INT NOT NULL,
    vaccine_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    batch_number VARCHAR(100),
    expiry_date DATE,
    next_due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE
);

-- ตาราง medications (การให้ยา)
CREATE TABLE medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    health_record_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INT,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE
);

-- ตาราง nutrition_guidelines (คำแนะนำโภชนาการ) - เพิ่มระบบอนุมัติ
CREATE TABLE nutrition_guidelines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    veterinarian_id INT,
    species_id INT,
    breed_id INT,
    age_min_months INT,
    age_max_months INT,
    weight_min_kg DECIMAL(5,2),
    weight_max_kg DECIMAL(5,2),
    daily_calories INT,
    protein_percentage DECIMAL(5,2),
    fat_percentage DECIMAL(5,2),
    carb_percentage DECIMAL(5,2),
    feeding_frequency INT,
    special_instructions TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id),
    FOREIGN KEY (species_id) REFERENCES species(id),
    FOREIGN KEY (breed_id) REFERENCES breeds(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ตาราง pet_nutrition (การกำหนดโภชนาการให้สัตว์เลี้ยง)
CREATE TABLE pet_nutrition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    nutrition_guideline_id INT NOT NULL,
    veterinarian_id INT,
    custom_instructions TEXT,
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (nutrition_guideline_id) REFERENCES nutrition_guidelines(id),
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id)
);

-- ตาราง notifications (การแจ้งเตือน)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    notification_type ENUM('vaccination', 'medication', 'checkup', 'nutrition', 'appointment', 'approval', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- ตาราง appointments (การนัดหมาย) - เพิ่มระบบอนุมัติ
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    veterinarian_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    appointment_type ENUM('checkup', 'vaccination', 'consultation', 'surgery', 'emergency') NOT NULL,
    status ENUM('pending', 'confirmed', 'approved', 'completed', 'cancelled', 'rejected', 'no_show') DEFAULT 'pending',
    notes TEXT,
    cost DECIMAL(10,2),
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    created_by_role ENUM('user', 'veterinarian') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ตาราง articles (บทความ)
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category VARCHAR(100),
    tags JSON,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- ตาราง article_categories (หมวดหมู่บทความ)
CREATE TABLE article_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง user_sessions (สำหรับ authentication)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ตาราง system_settings (การตั้งค่าระบบ)
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ตาราง audit_logs (บันทึกการใช้งาน)
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ตาราง approval_requests (คำขออนุมัติ)
CREATE TABLE approval_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_type ENUM('nutrition_guideline', 'appointment') NOT NULL,
    reference_id INT NOT NULL, -- ID ของ nutrition_guideline หรือ appointment
    requested_by INT NOT NULL,
    request_data JSON,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- สร้าง indexes สำหรับประสิทธิภาพ
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_due_date ON notifications(due_date);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_vet_id ON appointments(veterinarian_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_articles_published ON articles(is_published);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_nutrition_guidelines_status ON nutrition_guidelines(status);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_type ON approval_requests(request_type);
