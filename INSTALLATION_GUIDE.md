# 🛠️ คู่มือการติดตั้งและรันโปรเจค

## 📋 ข้อกำหนดระบบ

### Software Requirements
- **Node.js:** v16.0.0 หรือใหม่กว่า
- **npm:** v8.0.0 หรือใหม่กว่า
- **Git:** v2.30.0 หรือใหม่กว่า
- **Browser:** Chrome, Firefox, Safari, Edge

### Hardware Requirements
- **RAM:** 4GB ขึ้นไป
- **Storage:** 2GB ว่าง
- **Internet:** สำหรับติดตั้ง dependencies

---

## 🚀 ขั้นตอนการติดตั้ง

### 1. ดาวน์โหลดและติดตั้ง Node.js
1. ไปที่ https://nodejs.org/
2. ดาวน์โหลด LTS version
3. ติดตั้งตามขั้นตอน
4. ตรวจสอบการติดตั้ง:
   ```bash
   node --version
   npm --version
   ```

### 2. Clone โปรเจค
```bash
# ใช้ Git (ถ้ามี)
git clone [repository-url]
cd pet-health-docs

# หรือแตกไฟล์ ZIP
# แตกไฟล์ pet-health-project-[ชื่อ].zip
cd pet-health-docs
```

### 3. ติดตั้ง Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. ตั้งค่า Environment Variables

#### Backend (.env)
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:
```env
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
```

#### Frontend (.env)
สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
REACT_APP_NAME=Pet Health Assistant
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

### 5. ตั้งค่าฐานข้อมูล Supabase

#### 5.1 สร้างโปรเจค Supabase
1. ไปที่ https://supabase.com/
2. สร้างบัญชีใหม่
3. สร้างโปรเจคใหม่
4. ตั้งชื่อโปรเจค: `pet-health-db`
5. เลือก Region: `Southeast Asia (Singapore)`
6. ตั้งรหัสผ่านฐานข้อมูล

#### 5.2 Import Schema
1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. Copy เนื้อหาจากไฟล์ `database/schema.sql`
3. Paste และรัน SQL
4. ตรวจสอบว่าสร้างตารางสำเร็จ

#### 5.3 Import Sample Data
1. Copy เนื้อหาจากไฟล์ `database/seed.sql`
2. Paste และรัน SQL
3. ตรวจสอบว่ามีข้อมูลตัวอย่าง

#### 5.4 ตั้งค่า Authentication
1. ไปที่ **Authentication** → **Settings**
2. เปิด **Enable email confirmations**
3. ตั้งค่า **Site URL**: `http://localhost:3000`
4. ตั้งค่า **Redirect URLs**: `http://localhost:3000`

#### 5.5 ตั้งค่า Row Level Security (RLS)
1. ไปที่ **Authentication** → **Policies**
2. สร้าง Policy สำหรับแต่ละตาราง
3. ตั้งค่าให้ผู้ใช้เข้าถึงข้อมูลของตัวเองเท่านั้น

---

## 🏃‍♂️ การรันโปรเจค

### 1. รัน Backend Server
```bash
cd backend
npm run dev
```
**ผลลัพธ์:** Server รันที่ http://localhost:5000

### 2. รัน Frontend (Terminal ใหม่)
```bash
cd frontend
npm start
```
**ผลลัพธ์:** Frontend รันที่ http://localhost:3000

### 3. ตรวจสอบการทำงาน
1. เปิด Browser ไปที่ http://localhost:3000
2. ตรวจสอบว่าเว็บไซต์โหลดได้
3. ทดสอบการลงทะเบียน
4. ทดสอบการเข้าสู่ระบบ

---

## 🧪 การทดสอบ

### 1. ทดสอบ Backend
```bash
cd backend
npm test
```

### 2. ทดสอบ Frontend
```bash
cd frontend
npm test
```

### 3. ทดสอบ API
ใช้ไฟล์ `backend/insomnia-collection.json` ใน Insomnia:
1. เปิด Insomnia
2. Import Collection
3. เลือกไฟล์ `insomnia-collection.json`
4. ทดสอบ API endpoints

---

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Port ถูกใช้งานแล้ว
```bash
# หา process ที่ใช้ port 5000
netstat -ano | findstr :5000

# หา process ที่ใช้ port 3000
netstat -ano | findstr :3000

# ฆ่า process
taskkill /PID [PID_NUMBER] /F
```

#### 2. Dependencies ติดตั้งไม่สำเร็จ
```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# ติดตั้งใหม่
npm install
```

#### 3. Database Connection Error
- ตรวจสอบ SUPABASE_URL และ SUPABASE_ANON_KEY
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบ Supabase Project Status

#### 4. CORS Error
- ตรวจสอบ REACT_APP_API_URL
- ตรวจสอบ CORS settings ใน backend

#### 5. File Upload Error
- ตรวจสอบ UPLOAD_DIR
- ตรวจสอบ permissions ของโฟลเดอร์ uploads
- ตรวจสอบ MAX_FILE_SIZE

---

## 📊 ตรวจสอบสถานะ

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Health Check
```bash
curl http://localhost:3000
```

### 3. Database Connection
```bash
# ตรวจสอบใน Supabase Dashboard
# ไปที่ Database → Logs
```

---

## 🚀 Production Build

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. รัน Production
```bash
cd backend
npm start
```

### 3. ตรวจสอบ Production
- เปิด http://localhost:5000
- ตรวจสอบว่า static files โหลดได้

---

## 📞 การติดต่อ

หากมีปัญหาการติดตั้งหรือรันโปรเจค:

**นักศึกษา:** [ชื่อ-นามสกุล]  
**Email:** [email@example.com]  
**Line:** [Line ID]  
**โทร:** [เบอร์โทร]

---

## 🎯 สรุป

1. **ติดตั้ง Node.js** และ npm
2. **Clone โปรเจค** หรือแตกไฟล์ ZIP
3. **ติดตั้ง dependencies** สำหรับ backend และ frontend
4. **ตั้งค่า environment variables**
5. **ตั้งค่าฐานข้อมูล Supabase**
6. **รัน backend** และ **frontend**
7. **ทดสอบการทำงาน**

**หมายเหตุ:** อย่าลืมตั้งค่า Supabase ให้ถูกต้องก่อนรันโปรเจค! 🔐

