-- เพิ่ม notification_type สำหรับแผนโภชนาการ
-- รันใน Supabase SQL Editor

-- Option 1: ถ้าฐานข้อมูลรองรับ IF NOT EXISTS
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'nutrition_plan_created';

-- Option 2: ถ้าไม่รองรับ (จะ error ถ้า value มีอยู่แล้ว)
-- ALTER TYPE notification_type ADD VALUE 'nutrition_plan_created';

-- ตรวจสอบ enum values ทั้งหมด:
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'notification_type'::regtype;

