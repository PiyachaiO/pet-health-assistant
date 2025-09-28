# 🔧 Pet Health Assistant - Backend API

Express.js API server สำหรับระบบจัดการสุขภาพสัตว์เลี้ยง

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Create environment file (Windows: สร้าง .env ตามหัวข้อ Environment Variables)

# Start development server
npm run dev

# Start production server
npm start
\`\`\`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ

### Users
- `GET /api/users/profile` - ดูข้อมูลโปรไฟล์
- `PUT /api/users/profile` - แก้ไขโปรไฟล์

### Pets
- `GET /api/pets` - ดูรายการสัตว์เลี้ยง
- `POST /api/pets` - เพิ่มสัตว์เลี้ยงใหม่
- `GET /api/pets/:id` - ดูข้อมูลสัตว์เลี้ยง
- `PUT /api/pets/:id` - แก้ไขข้อมูลสัตว์เลี้ยง
- `DELETE /api/pets/:id` - ลบสัตว์เลี้ยง

### Health Records
- `GET /api/pets/:petId/health-records` - ดูประวัติสุขภาพ
- `POST /api/pets/:petId/health-records` - เพิ่มประวัติสุขภาพ

### Appointments
- `GET /api/appointments` - ดูนัดหมาย
- `POST /api/appointments` - จองนัดหมาย
- `PATCH /api/appointments/:id/status` - อัพเดทสถานะนัดหมาย

### Admin
- `GET /api/admin/pending-approvals` - ดูรายการรออนุมัติ
- `PATCH /api/admin/appointments/:id/approve` - อนุมัติการนัดหมาย
- `PATCH /api/admin/nutrition-guidelines/:id/approve` - อนุมัติคำแนะนำโภชนาการ

### Veterinarian
- `GET /api/vet/appointments` - ดูนัดหมายของสัตวแพทย์
- `GET /api/vet/nutrition-guidelines` - ดูคำแนะนำโภชนาการ
- `POST /api/vet/nutrition-guidelines` - สร้างคำแนะนำโภชนาการ
- `POST /api/vet/appointments` - สร้างนัดหมายให้ผู้ใช้

### Notifications
- `GET /api/notifications` - ดูการแจ้งเตือน
- `PATCH /api/notifications/:id/mark-read` - ทำเครื่องหมายอ่านแล้ว
- `PATCH /api/notifications/:id/mark-completed` - ทำเครื่องหมายเสร็จสิ้น

### Articles
- `GET /api/articles` - ดูบทความ
- `GET /api/articles/:id` - ดูบทความเฉพาะ

### File Upload
- `POST /api/upload` - อัพโหลดไฟล์

## 🔒 Authentication

ใช้ JWT tokens ผ่าน Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## 🛡️ Security Features

- JWT authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Row Level Security (RLS)

## 📊 Environment Variables

\`\`\`env
NODE_ENV=development
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000

## 🗄️ Database (Supabase) & Migrations

แนะนำให้ใช้ Supabase CLI เพื่อจัดการสคีมาแบบ versioned

### การติดตั้ง Supabase CLI
```bash
npm install -g @supabase/cli
# หรือ
npx supabase --version
```

### การเชื่อมต่อกับ Supabase Project
```bash
# Login และ Link โปรเจค
npm run db:login
npm run db:link
```

### การจัดการ Migration
```bash
# สร้าง migration ใหม่
npm run db:new-migration <migration_name>

# ดูความแตกต่างระหว่าง local และ remote
npm run db:diff

# Push migration ไปยัง remote
npm run db:push

# Reset database (ระวัง! จะลบข้อมูลทั้งหมด)
npm run db:reset

# Seed ข้อมูลตัวอย่าง
npm run db:seed
```

### การจัดการ Local Development
```bash
# เริ่ม Supabase local
npm run db:local

# เปิด Supabase Studio
npm run db:studio

# ดู logs
npm run db:logs

# หยุด local Supabase
npm run db:stop
```

### การตรวจสอบสถานะ
```bash
# ดูสถานะการเชื่อมต่อ
npm run db:status

# ตรวจสอบ syntax ของ migration
npm run db:lint
```

### โครงสร้างฐานข้อมูล
- **Users**: ผู้ใช้, สัตวแพทย์, ผู้ดูแลระบบ
- **Pets**: ข้อมูลสัตว์เลี้ยง
- **Appointments**: นัดหมายการรักษา
- **Health Records**: ประวัติสุขภาพ
- **Articles**: บทความความรู้
- **Notifications**: การแจ้งเตือน
- **Nutrition Guidelines**: คำแนะนำโภชนาการ
- **Admin Approvals**: การอนุมัติจากผู้ดูแลระบบ

### Row Level Security (RLS)
ทุกตารางมี RLS policies ที่กำหนดสิทธิ์การเข้าถึงตามบทบาท:
- **Users**: เห็นและแก้ไขได้เฉพาะข้อมูลของตัวเอง
- **Veterinarians**: เห็นข้อมูลที่เกี่ยวข้องกับตัวเอง
- **Admins**: เข้าถึงได้ทุกข้อมูล

### หมายเหตุสำคัญ
- ตรวจสอบให้ migrations/นโยบาย RLS สอดคล้องกับสคีมาล่าสุด
- ใช้ `npm run db:diff` ก่อน push เพื่อดูการเปลี่ยนแปลง
- ข้อมูลใน production จะถูกลบเมื่อใช้ `db:reset` (ระวัง!)
