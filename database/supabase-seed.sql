-- Insert sample users (passwords are hashed for 'password')
INSERT INTO users (id, email, password_hash, full_name, role, phone, address, is_active, last_login) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@pethealthassistant.com', '$2b$10$rOzJqZxjdebZzgqObWkYs.TPUZbmU.TGtqNjQQjKQk7LQQJqJQJqK', 'ผู้ดูแลระบบ', 'admin', '02-123-4567', 'กรุงเทพมหานคร', true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'vet1@pethealthassistant.com', '$2b$10$rOzJqZxjdebZzgqObWkYs.TPUZbmU.TGtqNjQQjKQk7LQQJqJQJqK', 'สัตวแพทย์หญิงสมใจ ใจดี', 'veterinarian', '02-234-5678', 'กรุงเทพมหานคร', true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'vet2@pethealthassistant.com', '$2b$10$rOzJqZxjdebZzgqObWkYs.TPUZbmU.TGtqNjQQjKQk7LQQJqJQJqK', 'สัตวแพทย์ชายสมชาย รักสัตว์', 'veterinarian', '02-345-6789', 'กรุงเทพมหานคร', true, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'user1@example.com', '$2b$10$rOzJqZxjdebZzgqObWkYs.TPUZbmU.TGtqNjQQjKQk7LQQJqJQJqK', 'สมศรี ใจดี', 'user', '08-123-4567', 'กรุงเทพมหานคร', true, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'user2@example.com', '$2b$10$rOzJqZxjdebZzgqObWkYs.TPUZbmU.TGtqNjQQjKQk7LQQJqJQJqK', 'สมชาย รักสัตว์', 'user', '08-234-5678', 'นนทบุรี', true, NOW());

-- Insert sample pets
INSERT INTO pets (id, user_id, name, species, breed, birth_date, gender, weight, color) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'มิโกะ', 'แมว', 'เปอร์เซีย', '2022-03-15', 'female', 3.5, 'ขาว'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'ชิบะ', 'สุนัข', 'ชิบะ อินุ', '2021-08-20', 'male', 12.0, 'น้ำตาลแดง'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'ลูกโป่ง', 'สุนัข', 'โกลเด้น รีทรีฟเวอร์', '2020-12-10', 'male', 28.5, 'ทอง'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'นางฟ้า', 'แมว', 'ไทย', '2023-01-05', 'female', 2.8, 'เทา');

-- Insert sample health records
INSERT INTO health_records (id, pet_id, record_type, title, description, record_date, next_due_date, veterinarian_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'vaccination', 'วัคซีนป้องกันโรครวม 3 in 1', 'ฉีดวัคซีนป้องกันโรค Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia', '2024-01-15', '2025-01-15', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'vaccination', 'วัคซีนป้องกันพิษสุนัขบ้า', 'ฉีดวัคซีนป้องกันโรคพิษสุนัขบ้า', '2024-02-01', '2025-02-01', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'checkup', 'ตรวจสุขภาพประจำปี', 'ตรวจสุขภาพทั่วไป น้ำหนัก 28.5 กก. สุขภาพแข็งแรงดี', '2024-01-20', '2025-01-20', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample nutrition guidelines
INSERT INTO nutrition_guidelines (id, veterinarian_id, species, age_range, daily_calories, protein_percentage, fat_percentage, feeding_frequency, instructions, approval_status, approved_by, approved_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'แมว', '1-7 ปี', 300, 32.0, 15.0, 2, 'ให้อาหารแมวโตเต็มวัย คุณภาพดี แบ่งเป็น 2 มื้อ เช้า-เย็น', 'approved', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'สุนัข', '1-7 ปี', 800, 28.0, 17.0, 2, 'ให้อาหารสุนัขโตเต็มวัย แบ่งเป็น 2 มื้อ ควบคุมปริมาณไม่ให้อ้วน', 'approved', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'แมว', '0-1 ปี', 400, 35.0, 18.0, 3, 'อาหารลูกแมว โปรตีนสูง แบ่งเป็น 3 มื้อ', 'pending', NULL, NULL);

-- Insert sample appointments
INSERT INTO appointments (id, user_id, pet_id, veterinarian_id, appointment_type, appointment_date, status, notes, approval_status) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'checkup', '2024-02-15 10:00:00+07', 'scheduled', 'ตรวจสุขภาพประจำปี', 'pending'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'vaccination', '2024-02-20 14:30:00+07', 'confirmed', 'ฉีดวัคซีนป้องกันโรครวม', 'approved'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'consultation', '2024-02-25 16:00:00+07', 'scheduled', 'ปรึกษาเรื่องพฤติกรรม', 'pending');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, pet_id, notification_type, title, message, due_date, priority) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'vaccination_due', 'ถึงเวลาฉีดวัคซีน', 'มิโกะ ถึงเวลาฉีดวัคซีนป้องกันโรครวมแล้ว', '2025-01-15', 'high'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'checkup_due', 'ถึงเวลาตรวจสุขภาพ', 'ลูกโป่ง ควรตรวจสุขภาพประจำปีแล้ว', '2025-01-20', 'medium'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'appointment_reminder', 'แจ้งเตือนนัดหมาย', 'คุณมีนัดหมายกับสัตวแพทย์วันพรุ่งนี้', '2024-02-25', 'high');

-- Insert sample articles
INSERT INTO articles (id, author_id, title, excerpt, content, category, is_published, published_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'การดูแลสุขภาพแมวในช่วงหน้าร้อน', 'เคล็ดลับการดูแลแมวให้ปลอดภัยในช่วงอากาศร้อน', 'ในช่วงหน้าร้อน แมวต้องการการดูแลพิเศษ เนื่องจากแมวไม่สามารถระบายความร้อนได้ดีเท่าสุนัข การให้น้ำสะอาดเพียงพอ การหาที่ร่มเงา และการสังเกตอาการเหนื่อยล้าเป็นสิ่งสำคัญ...', 'การดูแลทั่วไป', true, NOW()),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'โภชนาการที่เหมาะสมสำหรับสุนัขพันธุ์ใหญ่', 'คำแนะนำการให้อาหารสุนัขพันธุ์ใหญ่ให้เติบโตแข็งแรง', 'สุนัขพันธุ์ใหญ่มีความต้องการโภชนาการที่แตกต่างจากสุนัขพันธุ์เล็ก โดยเฉพาะในช่วงลูกสุนัข ต้องการโปรตีนและแคลเซียมในปริมาณที่เหมาะสม เพื่อการเจริญเติบโตที่สมดุล...', 'โภชนาการ', true, NOW()),
('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'สัญญาณเตือนโรคไตในแมว', 'รู้จักอาการเบื้องต้นของโรคไตในแมวเพื่อการรักษาที่ทันท่วงที', 'โรคไตเป็นโรคที่พบบ่อยในแมวสูงอายุ อาการเบื้องต้นที่ควรสังเกต ได้แก่ การดื่มน้ำมาก การขับปัสสาวะบ่อย การสูญเสียน้ำหนัก และการอาเจียน หากพบอาการเหล่านี้ควรพาไปพบสัตวแพทย์ทันที...', 'สุขภาพและโรคภัย', true, NOW());
