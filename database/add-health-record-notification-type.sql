-- เพิ่ม notification_type สำหรับบันทึกสุขภาพ
-- รันใน Supabase SQL Editor

-- เพิ่ม health_record_updated ถ้ายังไม่มี
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'health_record_updated';

-- ตรวจสอบ enum values ทั้งหมด:
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'notification_type'::regtype ORDER BY enumlabel;

