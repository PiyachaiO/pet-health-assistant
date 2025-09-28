-- Seed data สำหรับ testing
-- ข้อมูลตัวอย่างสำหรับ Pet Health Assistant

-- สร้าง users ตัวอย่าง
INSERT INTO public.users (email, password_hash, full_name, role) VALUES
('admin@pethealth.com', '$2b$10$example_hash_admin', 'Admin User', 'admin'),
('vet@pethealth.com', '$2b$10$example_hash_vet', 'Dr. Veterinarian', 'veterinarian'),
('user@pethealth.com', '$2b$10$example_hash_user', 'Regular User', 'user')
ON CONFLICT (email) DO NOTHING;

-- สร้าง pets ตัวอย่าง (หลังจากมี users แล้ว)
INSERT INTO public.pets (user_id, name, species, breed, birth_date, gender, weight, color) VALUES
(
    (SELECT id FROM public.users WHERE email = 'user@pethealth.com'),
    'Buddy',
    'Dog',
    'Golden Retriever',
    '2020-01-15',
    'male',
    25.5,
    'Golden'
),
(
    (SELECT id FROM public.users WHERE email = 'user@pethealth.com'),
    'Whiskers',
    'Cat',
    'Persian',
    '2019-06-20',
    'female',
    4.2,
    'White'
)
ON CONFLICT DO NOTHING;

-- สร้าง nutrition guidelines ตัวอย่าง (หลังจากมี vet แล้ว)
INSERT INTO public.nutrition_guidelines (
    veterinarian_id, 
    species, 
    age_range, 
    daily_calories, 
    protein_percentage, 
    fat_percentage, 
    feeding_frequency,
    instructions,
    approval_status
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'Dog',
    'Adult (1-7 years)',
    800,
    25.0,
    15.0,
    2,
    'Feed twice daily with fresh water always available. Adjust portions based on activity level.',
    'pending'
),
(
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'Cat',
    'Adult (1-10 years)',
    250,
    30.0,
    20.0,
    2,
    'Cats prefer fresh food and clean water.',
    'pending'
)
ON CONFLICT DO NOTHING;

-- สร้าง admin_approvals ตัวอย่าง (หลังจากมี nutrition guidelines แล้ว)
INSERT INTO public.admin_approvals (
    table_name,
    record_id,
    action,
    status,
    requested_by,
    notes
) VALUES
(
    'nutrition_guidelines',
    (SELECT id FROM public.nutrition_guidelines WHERE species = 'Dog' LIMIT 1),
    'create',
    'pending',
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'คำแนะนำโภชนาการสำหรับสุนัขโต'
),
(
    'nutrition_guidelines',
    (SELECT id FROM public.nutrition_guidelines WHERE species = 'Cat' LIMIT 1),
    'create',
    'pending',
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'คำแนะนำโภชนาการสำหรับแมวโต'
)
ON CONFLICT DO NOTHING;

-- สร้าง articles ตัวอย่าง (หลังจากมี vet แล้ว)
INSERT INTO public.articles (
    author_id,
    title,
    excerpt,
    content,
    category,
    is_published,
    published_at
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'การดูแลสุขภาพสุนัขในฤดูร้อน',
    'เคล็ดลับการดูแลสุนัขในช่วงอากาศร้อน เพื่อป้องกันปัญหาสุขภาพ',
    'เนื้อหาบทความเกี่ยวกับการดูแลสุนัขในฤดูร้อน...',
    'Pet Care',
    true,
    NOW()
),
(
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'โภชนาการที่เหมาะสมสำหรับแมว',
    'แนะนำอาหารและโภชนาการที่เหมาะสมสำหรับแมวในแต่ละช่วงอายุ',
    'เนื้อหาบทความเกี่ยวกับโภชนาการแมว...',
    'Nutrition',
    false,
    NULL
)
ON CONFLICT DO NOTHING;

-- สร้าง appointments ตัวอย่าง (หลังจากมี users และ pets แล้ว)
INSERT INTO public.appointments (
    user_id,
    pet_id,
    veterinarian_id,
    appointment_type,
    appointment_date,
    status,
    reason,
    approval_status
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'user@pethealth.com'),
    (SELECT id FROM public.pets WHERE name = 'Buddy' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'checkup',
    NOW() + INTERVAL '7 days',
    'scheduled',
    'ตรวจสุขภาพประจำปี',
    'pending'
),
(
    (SELECT id FROM public.users WHERE email = 'user@pethealth.com'),
    (SELECT id FROM public.pets WHERE name = 'Whiskers' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    'vaccination',
    NOW() + INTERVAL '14 days',
    'scheduled',
    'ฉีดวัคซีนประจำปี',
    'pending'
)
ON CONFLICT DO NOTHING;

-- สร้าง health records ตัวอย่าง (หลังจากมี pets และ vet แล้ว)
INSERT INTO public.health_records (
    pet_id,
    record_type,
    title,
    description,
    record_date,
    veterinarian_id,
    weight,
    notes
) VALUES
(
    (SELECT id FROM public.pets WHERE name = 'Buddy' LIMIT 1),
    'checkup',
    'ตรวจสุขภาพประจำปี',
    'ตรวจสุขภาพทั่วไป สุนัขแข็งแรงดี',
    CURRENT_DATE - INTERVAL '30 days',
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    25.5,
    'แนะนำให้ออกกำลังกายเพิ่มขึ้น'
),
(
    (SELECT id FROM public.pets WHERE name = 'Whiskers' LIMIT 1),
    'vaccination',
    'ฉีดวัคซีนประจำปี',
    'ฉีดวัคซีนป้องกันโรคต่างๆ',
    CURRENT_DATE - INTERVAL '60 days',
    (SELECT id FROM public.users WHERE email = 'vet@pethealth.com'),
    4.2,
    'แมวแข็งแรงดี วัคซีนครบถ้วน'
)
ON CONFLICT DO NOTHING;

-- สร้าง notifications ตัวอย่าง (หลังจากมี users และ pets แล้ว)
INSERT INTO public.notifications (
    user_id,
    pet_id,
    notification_type,
    title,
    message,
    due_date,
    priority
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'user@pethealth.com'),
    (SELECT id FROM public.pets WHERE name = 'Buddy' LIMIT 1),
    'checkup_due',
    'ถึงเวลาตรวจสุขภาพประจำปี',
    'Buddy ควรได้รับการตรวจสุขภาพประจำปีภายใน 7 วัน',
    CURRENT_DATE + INTERVAL '7 days',
    'medium'
),
(
    (SELECT id FROM public.users WHERE email = 'user@pethealth.com'),
    (SELECT id FROM public.pets WHERE name = 'Whiskers' LIMIT 1),
    'vaccination_due',
    'ถึงเวลาฉีดวัคซีนประจำปี',
    'Whiskers ควรได้รับการฉีดวัคซีนประจำปีภายใน 14 วัน',
    CURRENT_DATE + INTERVAL '14 days',
    'high'
)
ON CONFLICT DO NOTHING;
