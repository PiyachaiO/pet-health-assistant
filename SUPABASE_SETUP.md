# คู่มือการตั้งค่า Supabase สำหรับ Pet Health Assistant

## 📋 ขั้นตอนการตั้งค่า Supabase

### 1. สร้างโปรเจค Supabase

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. คลิก "New Project"
3. เลือก Organization หรือสร้างใหม่
4. กรอกข้อมูลโปรเจค:
   - **Project Name**: `pet-health-assistant`
   - **Database Password**: สร้างรหัสผ่านที่แข็งแรง (เก็บไว้ให้ดี)
   - **Region**: เลือกที่ใกล้ที่สุด (Singapore สำหรับไทย)
5. คลิก "Create new project"
6. รอประมาณ 2-3 นาทีให้โปรเจคสร้างเสร็จ

### 2. ดึงข้อมูล API Keys

หลังจากโปรเจคสร้างเสร็จแล้ว:

1. ไปที่ **Settings** > **API**
2. คัดลอกข้อมูลต่อไปนี้:
   - **Project URL**
   - **anon public key**
   - **service_role key** (เก็บเป็นความลับ)

### 3. ตั้งค่า Database Schema

1. ไปที่ **SQL Editor** ในแดชบอร์ด Supabase
2. คลิก "New query"
3. คัดลอกเนื้อหาจากไฟล์ `database/supabase-schema.sql`
4. วางในช่อง SQL Editor และกด **Run**
5. ตรวจสอบว่าตารางทั้งหมดถูกสร้างเรียบร้อย

### 4. เพิ่มข้อมูลเริ่มต้น

1. ใน SQL Editor ให้รันโค้ดจากไฟล์ `database/supabase-seed.sql`
2. ตรวจสอบข้อมูลในแท็บ **Table Editor**

### 5. ตั้งค่า Authentication

1. ไปที่ **Authentication > Settings**
2. ตั้งค่าดังนี้:
   - **Site URL**: `http://localhost:3000` (สำหรับ development)
   - **Redirect URLs**: `http://localhost:3000/**`
3. เปิดใช้งาน **Email confirmations** (ถ้าต้องการ)

### 6. ตั้งค่า Storage (ถ้าต้องการอัพโหลดรูป)

1. ไปที่ **Storage**
2. สร้าง bucket ใหม่ชื่อ `pet-photos`
3. ตั้งค่า Policy:
   \`\`\`sql
   -- Allow users to upload their own pet photos
   CREATE POLICY "Users can upload pet photos" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow users to view pet photos
   CREATE POLICY "Pet photos are publicly viewable" ON storage.objects
   FOR SELECT USING (bucket_id = 'pet-photos');
   \`\`\`

### 7. ตั้งค่า Environment Variables

#### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=5000

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

FRONTEND_URL=http://localhost:3000
\`\`\`

#### Frontend (.env)
\`\`\`env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Pet Health Assistant
REACT_APP_VERSION=1.0.0
\`\`\`

### 8. ทดสอบการเชื่อมต่อ

1. ติดตั้ง dependencies:
\`\`\`bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
\`\`\`

2. รันแอปพลิเคชัน:
\`\`\`bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
\`\`\`

3. เข้าใช้งาน:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Supabase Dashboard**: https://supabase.com/dashboard/project/your-project-id

## 👤 บัญชีทดสอบ

หลังจากรัน seed data แล้ว คุณสามารถใช้บัญชีเหล่านี้ในการทดสอบ:

### Admin
- **Email**: admin@pethealthassistant.com
- **Password**: password

### Veterinarian
- **Email**: vet1@pethealthassistant.com
- **Password**: password

### User
- **Email**: user1@example.com
- **Password**: password

## 🔒 ความปลอดภัย

### Row Level Security (RLS)
Supabase ใช้ RLS เพื่อความปลอดภัย:
- ผู้ใช้เห็นเฉพาะข้อมูลของตัวเอง
- สัตวแพทย์เห็นเฉพาะนัดหมายที่ได้รับมอบหมาย
- แอดมินเห็นข้อมูลทั้งหมด

### API Security
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection

## 📊 การตรวจสอบข้อมูล

### ใน Supabase Dashboard:
1. **Table Editor**: ดูและแก้ไขข้อมูลในตาราง
2. **SQL Editor**: รัน SQL queries
3. **Auth**: จัดการผู้ใช้
4. **Storage**: จัดการไฟล์
5. **Logs**: ดู logs และ errors

### API Endpoints สำคัญ:
- `GET /api/health` - ตรวจสอบสถานะ server
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/pets` - ดูรายการสัตว์เลี้ยง
- `GET /api/appointments` - ดูนัดหมาย

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:

1. **Connection Error**
   - ตรวจสอบ SUPABASE_URL และ API keys
   - ตรวจสอบ internet connection

2. **Authentication Error**
   - ตรวจสอบ JWT_SECRET
   - ตรวจสอบ token expiration

3. **RLS Policy Error**
   - ตรวจสอบ policies ใน Supabase
   - ตรวจสอบ user permissions

4. **CORS Error**
   - ตรวจสอบ FRONTEND_URL ใน backend
   - ตรวจสอบ CORS settings

### Logs และ Debugging:
\`\`\`bash
# Backend logs
cd backend
npm run dev

# ดู Supabase logs ใน Dashboard > Logs
\`\`\`

## 📈 Production Deployment

### Environment Variables สำหรับ Production:
\`\`\`env
NODE_ENV=production
SUPABASE_URL=https://your-project-id.supabase.co
FRONTEND_URL=https://your-domain.com
\`\`\`

### Security Checklist:
- [ ] เปลี่ยน JWT_SECRET
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] เปิดใช้งาน HTTPS
- [ ] ตรวจสอบ RLS policies
- [ ] ตั้งค่า rate limiting
- [ ] เปิดใช้งาน monitoring

## 🆘 การขอความช่วยเหลือ

หากพบปัญหา:
1. ตรวจสอบ logs ใน Supabase Dashboard
2. ตรวจสอบ browser console
3. ตรวจสอบ network requests
4. อ่าน [Supabase Documentation](https://supabase.com/docs)
