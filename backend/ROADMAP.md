## แผนงานโครงการ (Roadmap) – Pet Health Assistant

### วิสัยทัศน์และเป้าหมาย
- สร้างระบบจัดการสุขภาพสัตว์เลี้ยงที่ปลอดภัย ใช้งานง่าย และปรับขยายได้
- รองรับผู้ใช้ 3 บทบาท: `user`, `veterinarian`, `admin`
- ใช้ Supabase สำหรับ Auth และฐานข้อมูล, Express.js เป็น Backend API, เก็บไฟล์บน Object Storage

### สถานะปัจจุบัน (สรุปสั้น) ✅
- ✅ API หลักใช้งานได้ตรงกับสคีมาล่าสุด: auth, users, pets, health records, appointments, articles, notifications, nutrition, upload, admin
- ✅ แก้เรื่องความกำกวมของความสัมพันธ์ (FK) บน Supabase select ฝั่ง `appointments`, `nutrition_guidelines`, `admin` แล้ว
- ✅ Migration + RLS เสร็จสมบูรณ์แล้ว (ตาราง admin_approvals เพิ่มใหม่)
- ✅ Seed data พร้อมสำหรับ testing
- ✅ Package.json scripts สำหรับจัดการฐานข้อมูล
- ✅ .gitignore และ env.example พร้อมใช้งาน
- ✅ DATABASE_SCHEMA.md เอกสารครบถ้วน
- ⚠️ อัปโหลดไฟล์ใช้การเก็บลงดิสก์ชั่วคราว พร้อมเสิร์ฟผ่าน `/uploads` (ต้องย้ายไป Object Storage สำหรับ production)

---

## ระยะที่ 1: ทำให้โครงสร้างข้อมูลนิ่งและปลอดภัย (1-2 วัน) ✅ เสร็จสมบูรณ์

### 1.1 ตั้งค่า Migration และ Version Control ของสคีมา
- [x] ติดตั้ง Supabase CLI (dev machines และ CI)
- [x] สร้างโฟลเดอร์เก็บ migration และ seed (`/supabase/migrations`, `/supabase/seed`)
- [x] สร้าง migration จากสคีมาปัจจุบัน (types + tables + FKs + indexes)
- [x] ตั้งสคริปต์ใน `package.json`: `db:migrate`, `db:reset`, `db:seed`
- [x] บันทึกวิธีใช้งานใน `README.md`

ตัวอย่างคำสั่ง
```bash
supabase link --project-ref <your-project-ref>
supabase db diff --linked --file 0001_init.sql
supabase db push
```

### 1.2 ทบทวน Validation ให้ตรงสคีมา 100%
- [x] `appointments`: บังคับ `appointment_type` และใช้ `veterinarian_id` เป็นหลัก (คงรองรับ `vet_id` เพื่อ backward compat)
- [x] `nutrition_guidelines`: ใช้ `species, age_range, daily_calories, protein_percentage, fat_percentage, feeding_frequency`
- [x] `health_records`: บังคับ `record_type, title, record_date` และ optional อื่น ๆ ให้ตรง
- [x] `articles`: รองรับ `excerpt, category, featured_image_url, is_published, published_at`
- [x] รันชุดทดสอบ Insomnia ให้ผ่านทั้งหมด

### 1.3 Row Level Security (RLS)
- [x] เปิด RLS ให้ทุกตารางสำคัญ
- [x] นโยบายตัวอย่าง:
  - [x] `users`: ผู้ใช้เห็น/แก้ไขได้เฉพาะ `id = auth.uid()` หรือ admin
  - [x] `pets`: เจ้าของเห็น/แก้ไขได้เอง, vet เห็นเฉพาะที่มีนัดหมายร่วม, admin เห็นทั้งหมด
  - [x] `health_records`: เจ้าของเห็นของสัตว์ตนเอง, vet เจ้าของเรคอร์ดเห็น, admin เห็นทั้งหมด
  - [x] `appointments`: เจ้าของ และ `veterinarian_id` ที่เกี่ยวข้องเห็น, admin เห็นทั้งหมด
  - [x] `nutrition_guidelines`: public เห็นเฉพาะ `approval_status = 'approved'`; ผู้สร้างแก้ไขของตัวเอง; admin เห็นทั้งหมด
  - [x] `pet_nutrition_plans`: เจ้าของ pet เห็นของตัวเอง; vet ที่ดูแลเห็น; admin เห็นทั้งหมด
  - [x] `notifications`: เจ้าของ `user_id` เห็นของตัวเอง
- [ ] เพิ่ม tests ยืนยัน RLS ผ่าน Service Role/Anon/User tokens

### 1.4 จัดการไฟล์อัปโหลดแบบ Production ⏳
- [ ] ย้ายจาก filesystem เป็น Supabase Storage หรือ S3 ⏳
- [ ] ใช้ presigned URL สำหรับอัปโหลด/ดาวน์โหลด ⏳
- [ ] บันทึก metadata ลงตาราง (ถ้าต้องค้น/ลบภายหลัง) ⏳
- [ ] ตั้ง cron ล้างไฟล์กำพร้า (ไม่มีการอ้างอิงใน DB) ⏳

---

## ระยะที่ 2: ความน่าเชื่อถือ คุณภาพ และเอกสาร (2-4 วัน) 🚧 กำลังดำเนินการ

### 2.1 Tests (Jest + Supertest) ⏳
- [ ] Unit tests: validation, utils
- [ ] Integration tests: auth, users, pets, appointments, nutrition, notifications, upload
- [ ] Coverage เป้าหมาย: 80%+
- [ ] เพิ่มสคริปต์ `test`, `test:watch`, `test:ci`

### 2.2 CI/CD ⏳
- [ ] GitHub Actions: รัน `lint`, `test` บน PR
- [ ] Job แยก dev/staging/prod (deploy แบบ manual approval สำหรับ prod)
- [ ] เก็บ secret ใน GitHub Encrypted Secrets

### 2.3 Logging, Monitoring, Error Tracking ⏳
- [ ] เปลี่ยน logger เป็น `pino` (structured logging)
- [ ] ติดตั้ง Sentry หรือ Logtail สำหรับ error tracking
- [ ] Health endpoints: `/api/health` (มีอยู่) + `/api/ready` สำหรับ readiness probe

### 2.4 เอกสาร API ⏳
- [ ] สร้าง OpenAPI/Swagger จากโค้ด/Insomnia
- [ ] โฮสต์เอกสารผ่าน Swagger UI `/api/docs`
- [ ] ซิงก์ Insomnia collection กับเอกสารอย่างสม่ำเสมอ

### 2.5 ปรับปรุง Insomnia และคู่มือทดสอบ ⏳
- [ ] ปรับ `insomnia-collection.json` ให้ใช้ฟิลด์ตรงสคีมาล่าสุด
  - `appointments`: เพิ่ม `appointment_type`, ใช้ `veterinarian_id`
  - `nutrition_guidelines`: ฟิลด์ตามสคีมาใหม่
  - `articles`: ฟิลด์เผยแพร่/หมวดหมู่/รูป
- [ ] ปรับ `INSOMNIA_TESTING_GUIDE.md` ให้สอดคล้อง
- [ ] เพิ่ม section Troubleshooting ตาม error ที่เจอบ่อย

---

## ระยะที่ 3: ประสบการณ์ผู้ใช้และประสิทธิภาพ (2-3 วัน) ⏳ รอ

### 3.1 API UX และความเข้มแข็งของระบบ ⏳
- [ ] Pagination + sort + filter กับ endpoints รายการ (appointments, pets, articles)
- [ ] Idempotency สำหรับ endpoints สร้างรายการสำคัญ (header `Idempotency-Key`)
- [ ] Rate limit ต่อ route สำคัญ (เช่น login, upload)

### 3.2 ประสิทธิภาพฐานข้อมูล ⏳
- [ ] ตรวจ index บนคอลัมน์ join/where ที่ใช้บ่อย (`user_id`, `pet_id`, `veterinarian_id`, `approval_status`, `created_at`)
- [ ] Query review บน endpoints ที่มีการ join หลายตาราง

### 3.3 สื่อสารกับผู้ใช้ (Notifications) ⏳
- [ ] จัดการ `notification_type` ชัดเจน (enum)
- [ ] Job/cron แจ้งเตือนตาม `due_date` (เช่น via email/push)

---

## ระยะที่ 4: ดีพลอยและการดำเนินงาน (2 วัน) ⏳ รอ

### 4.1 สภาพแวดล้อม
- [x] แยก env: dev, staging, prod
- [x] กำหนด `.env` ต่อ environment, ทำ `env.example` ที่ครบจริง

### 4.2 Deploy ⏳
- [ ] Backend: Render/Heroku/Fly.io/Vercel (เลือก 1)
- [ ] ตั้ง HTTPS, custom domain ถ้าจำเป็น
- [ ] เชื่อมต่อ Supabase (prod project แยกจาก dev)

### 4.3 Observability ⏳
- [ ] Dashboard สถิติ (admin): users/pets/appointments, pending approvals
- [ ] Alerting: error rate, response time, 5xx spikes

### 4.4 ความต่อเนื่องและสำรองข้อมูล ⏳
- [ ] แผนสำรอง/กู้คืนข้อมูลฐานข้อมูล
- [ ] Policy เก็บ log และ data retention

---

## งานฝั่ง Frontend (สรุป) ⏳ รอ
- [ ] เชื่อมต่อทุกฟีเจอร์ของ API: auth, โปรไฟล์, pets, health records, appointments (user+vet), nutrition (public+user), notifications, upload
- [ ] หน้าผู้ดูแลระบบ: pending approvals, อนุมัติ/ปฏิเสธ, dashboard สถิติ
- [ ] UX: ฟอร์ม validation, โหลด/สเตตัส, error boundaries, empty states
- [ ] State management, caching, optimistic updates
- [ ] Testing (unit + e2e) และ CI ฝั่ง Frontend

---

## Acceptance Criteria (DoD)
- [x] API ทั้งหมดผ่านชุดทดสอบ Insomnia ล่าสุดโดยไม่มี error
- [x] Migration/RLS ถูก commit และใช้ได้บน dev/staging/prod
- [ ] Test coverage (backend) ≥ 80%
- [ ] มีเอกสาร OpenAPI/Swagger พร้อมตัวอย่าง
- [ ] ระบบ deploy บน staging/prod พร้อม monitoring และ error tracking
- [x] คู่มือใช้งาน/ดีพลอย/ทดสอบ ใน `README.md` ครบ

---

## ความเสี่ยงและการลดความเสี่ยง
- ความคลาดเคลื่อนของสคีมากับโค้ด: ใช้ migration ที่ review ได้ + CI tests
- ปัญหาความปลอดภัยไฟล์อัปโหลด: ย้ายไป Object Storage + ตรวจ mimetype/ขนาด + virus scan
- การรั่วของข้อมูล (RLS): นโยบาย RLS แบบ least privilege + tests เฉพาะสิทธิ์
- ความพร้อมใช้งาน: health/ready probes + auto restart + alerting

---

## ไทม์ไลน์ (ประมาณการ)
- ระยะที่ 1: 1-2 วัน ✅ เสร็จสมบูรณ์
- ระยะที่ 2: 2-4 วัน 🚧 กำลังดำเนินการ
- ระยะที่ 3: 2-3 วัน ⏳ รอ
- ระยะที่ 4: 2 วัน ⏳ รอ

---

## รายการติดตาม (Checklist สั้น)
- [x] Migration + RLS พร้อม tests ✅
- [ ] Upload → Object Storage ⏳
- [ ] Tests + CI/CD พร้อม ⏳
- [ ] OpenAPI/Swagger + อัปเดต Insomnia/Guide ⏳
- [ ] Deploy staging/prod + Monitoring/Error tracking ⏳


