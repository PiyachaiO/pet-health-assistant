USE pet_health_assistant;

-- เพิ่มข้อมูลชนิดสัตว์
INSERT INTO species (name) VALUES 
('สุนัข'),
('แมว'),
('นก'),
('กระต่าย'),
('หนูแฮมสเตอร์'),
('ปลา'),
('เต่า');

-- เพิ่มข้อมูลสายพันธุ์สุนัข
INSERT INTO breeds (species_id, name, average_lifespan, average_weight_min, average_weight_max) VALUES 
(1, 'โกลเด้น รีทรีฟเวอร์', 12, 25.0, 35.0),
(1, 'ลาบราดอร์', 12, 25.0, 35.0),
(1, 'ชิสุ', 15, 4.0, 7.0),
(1, 'ปอมเมอเรเนียน', 14, 1.5, 3.0),
(1, 'บีเกิล', 13, 9.0, 11.0),
(1, 'ไซบีเรียน ฮัสกี้', 12, 16.0, 27.0);

-- เพิ่มข้อมูลสายพันธุ์แมว
INSERT INTO breeds (species_id, name, average_lifespan, average_weight_min, average_weight_max) VALUES 
(2, 'เปอร์เซีย', 15, 3.0, 5.5),
(2, 'สยาม', 15, 2.5, 4.5),
(2, 'เมนคูน', 13, 4.5, 8.0),
(2, 'บริติช ช็อตแฮร์', 14, 3.5, 7.0),
(2, 'รัสเซียน บลู', 16, 3.0, 5.0),
(2, 'แมวไทย', 16, 2.5, 4.0);

-- เพิ่มผู้ใช้ตัวอย่าง
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@pethealthassistant.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ผู้ดูแลระบบ', 'admin'),
('vet1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'สัตวแพทย์หญิง สมใจ', 'veterinarian'),
('vet2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'สัตวแพทย์ชาย วิทยา', 'veterinarian'),
('user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'คุณสมชาย ใจดี', 'user'),
('user2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'คุณสมหญิง รักสัตว์', 'user');

-- เพิ่มข้อมูลสัตวแพทย์
INSERT INTO veterinarians (user_id, license_number, specialization, clinic_name, years_of_experience, consultation_fee, is_verified) VALUES 
(2, 'VET001', 'สัตวแพทย์ทั่วไป', 'คลินิกสัตว์เลี้ยงใจดี', 8, 500.00, TRUE),
(3, 'VET002', 'ศัลยกรรมสัตว์', 'โรงพยาบาลสัตว์ขั้นสูง', 12, 800.00, TRUE);

-- เพิ่มข้อมูลสัตว์เลี้ยงตัวอย่าง
INSERT INTO pets (owner_id, name, species_id, breed_id, birth_date, gender, weight, color) VALUES 
(4, 'บัดดี้', 1, 1, '2020-05-15', 'male', 28.5, 'สีทอง'),
(4, 'ลูน่า', 2, 7, '2019-08-20', 'female', 4.2, 'สีขาว'),
(5, 'แม็กซ์', 1, 5, '2021-03-10', 'male', 10.5, 'สีน้ำตาลขาว'),
(5, 'เบลล่า', 2, 8, '2020-12-05', 'female', 5.8, 'สีเทา');

-- เพิ่มบทความตัวอย่าง
INSERT INTO articles (author_id, title, slug, excerpt, content, category, is_published, published_at) VALUES 
(2, 'การดูแลสุขภาพสุนัขในช่วงหน้าฝน', 'dog-care-rainy-season', 'เคล็ดลับการดูแลสุนัขให้แข็งแรงในช่วงหน้าฝน', 
'ในช่วงหน้าฝน สุนัขมักจะเจอปัญหาต่างๆ เช่น โรคผิวหนัง การติดเชื้อ และปัญหาการย่อยอาหาร นี่คือวิธีการดูแลที่ถูกต้อง...', 
'การดูแลทั่วไป', TRUE, NOW()),

(3, 'โภชนาการที่เหมาะสมสำหรับแมวสูงอายุ', 'senior-cat-nutrition', 'คำแนะนำด้านอาหารสำหรับแมวที่มีอายุมากขึ้น', 
'แมวสูงอายุต้องการโภชนาการที่แตกต่างจากแมววัยหนุ่ม เพื่อรักษาสุขภาพและคุณภาพชีวิตที่ดี...', 
'โภชนาการ', TRUE, NOW());

-- เพิ่มหมวดหมู่บทความ
INSERT INTO article_categories (name, slug, description) VALUES 
('การดูแลทั่วไป', 'general-care', 'เคล็ดลับการดูแลสัตว์เลี้ยงในชีวิตประจำวัน'),
('โภชนาการ', 'nutrition', 'คำแนะนำด้านอาหารและโภชนาการ'),
('สุขภาพ', 'health', 'ข้อมูลด้านสุขภาพและการรักษา'),
('พฤติกรรม', 'behavior', 'การเข้าใจและแก้ไขพฤติกรรมสัตว์เลี้ยง');

-- เพิ่มการตั้งค่าระบบ
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('site_name', 'Pet Health Assistant', 'ชื่อเว็บไซต์'),
('max_file_size', '5242880', 'ขนาดไฟล์สูงสุดที่อัพโหลดได้ (5MB)'),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf"]', 'ประเภทไฟล์ที่อนุญาต'),
('appointment_advance_days', '30', 'จำนวนวันล่วงหน้าที่สามารถจองนัดหมายได้'),
('notification_retention_days', '90', 'จำนวนวันที่เก็บการแจ้งเตือน');
