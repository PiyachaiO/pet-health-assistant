# 🐾 Pet Health Management System
## ระบบจัดการสุขภาพสัตว์เลี้ยง

**นักศึกษา:** [ชื่อ-นามสกุล]  
**รหัสนักศึกษา:** [รหัสนักศึกษา]  
**วิชา:** [ชื่อวิชา]  
**อาจารย์:** [ชื่ออาจารย์]  
**วันที่ส่ง:** [วันที่]

---

## 📋 ข้อมูลโปรเจค

### 🎯 วัตถุประสงค์
ระบบจัดการสุขภาพสัตว์เลี้ยงที่ช่วยให้เจ้าของสัตว์เลี้ยงสามารถ:
- จัดการข้อมูลสัตว์เลี้ยง
- บันทึกประวัติสุขภาพ
- จองนัดหมายกับสัตวแพทย์
- รับคำแนะนำด้านโภชนาการ
- อ่านบทความความรู้เกี่ยวกับสัตว์เลี้ยง

### 🏗️ สถาปัตยกรรมระบบ
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + Supabase Auth
- **File Upload:** Multer + Sharp

---

## 📁 โครงสร้างโปรเจค

```
pet-health-docs/
├── 📁 backend/                 # Backend API Server
│   ├── 📁 routes/             # API Routes
│   ├── 📁 middleware/         # Middleware Functions
│   ├── 📁 config/             # Database Configuration
│   ├── 📁 tests/              # Backend Tests
│   ├── 📄 server.js           # Main Server File
│   └── 📄 package.json        # Backend Dependencies
├── 📁 frontend/               # React Frontend
│   ├── 📁 src/                # Source Code
│   │   ├── 📁 components/     # React Components
│   │   ├── 📁 pages/          # Page Components
│   │   ├── 📁 services/       # API Services
│   │   └── 📁 hooks/          # Custom Hooks
│   ├── 📁 public/             # Static Files
│   └── 📄 package.json        # Frontend Dependencies
├── 📁 database/               # Database Schema
│   ├── 📄 schema.sql          # Database Schema
│   └── 📄 seed.sql            # Sample Data
└── 📄 README_FOR_TEACHER.md   # ไฟล์นี้
```

---

## 🚀 วิธีการติดตั้งและรันโปรเจค

### ข้อกำหนดระบบ
- Node.js (v16 ขึ้นไป)
- npm หรือ yarn
- Git
- Browser (Chrome, Firefox, Safari)

### 1. ติดตั้ง Dependencies

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

### 2. ตั้งค่า Environment Variables

#### Backend (.env)
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. ตั้งค่าฐานข้อมูล
1. สร้างโปรเจค Supabase ใหม่
2. Import schema จาก `database/schema.sql`
3. Import sample data จาก `database/seed.sql`

### 4. รันโปรเจค

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

### 5. เข้าถึงระบบ
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Documentation:** http://localhost:5000/api-docs

---

## 🎨 ฟีเจอร์หลัก

### 👤 สำหรับเจ้าของสัตว์เลี้ยง
- ✅ ลงทะเบียนและเข้าสู่ระบบ
- 🐾 จัดการข้อมูลสัตว์เลี้ยง
- 📋 บันทึกประวัติสุขภาพ
- 💉 ตั้งการแจ้งเตือนวัคซีน
- 📅 จองนัดหมายกับสัตวแพทย์
- 🍖 รับคำแนะนำด้านโภชนาการ
- 📚 อ่านบทความความรู้

### 👨‍⚕️ สำหรับสัตวแพทย์
- 📊 Dashboard สถิติผู้ป่วย
- 📅 จัดการนัดหมาย
- 💊 สร้างคำแนะนำโภชนาการ
- 👥 จัดการข้อมูลผู้ป่วย
- 📝 บันทึกการรักษา

### 👨‍💼 สำหรับผู้ดูแลระบบ
- ✅ อนุมัติการลงทะเบียนสัตวแพทย์
- 👥 จัดการผู้ใช้
- 📈 สถิติระบบ
- 🔧 การตั้งค่าระบบ

---

## 🧪 การทดสอบ

### รันการทดสอบ
```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test
```

### การทดสอบ API
- ใช้ไฟล์ `backend/insomnia-collection.json` ใน Insomnia
- หรือใช้ไฟล์ `backend/INSOMNIA_TESTING_GUIDE.md`

---

## 📊 ข้อมูลเทคนิค

### Dependencies หลัก
- **Frontend:** React 18, React Router, Axios, Tailwind CSS
- **Backend:** Express.js, Supabase, JWT, Multer, Sharp
- **Database:** PostgreSQL (ผ่าน Supabase)

### Security Features
- JWT Authentication
- Password Hashing (bcrypt)
- Input Validation
- CORS Protection
- Rate Limiting
- File Upload Security

### Performance Features
- Image Optimization (Sharp)
- Compression Middleware
- Database Indexing
- Caching Headers

---

## 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Touch-friendly interface
- Optimized for mobile devices

---

## 🔧 การ Deploy

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Docker Support
```bash
# Build Docker images
docker-compose build

# Run with Docker
docker-compose up
```

---

## 📞 การติดต่อ

**นักศึกษา:** [ชื่อ-นามสกุล]  
**Email:** [email@example.com]  
**GitHub:** [github-username]  
**วันที่ส่ง:** [วันที่]

---

## 📝 หมายเหตุ

1. **Database:** ใช้ Supabase (PostgreSQL) เป็นฐานข้อมูลหลัก
2. **Authentication:** ใช้ Supabase Auth + JWT
3. **File Upload:** รองรับการอัพโหลดรูปภาพสัตว์เลี้ยง
4. **Testing:** มีการทดสอบทั้ง Frontend และ Backend
5. **Documentation:** มี API Documentation และ User Guide

---

## 🎯 สรุป

โปรเจคนี้เป็นระบบจัดการสุขภาพสัตว์เลี้ยงที่ครบครัน ประกอบด้วย:
- **Frontend:** React.js พร้อม UI/UX ที่สวยงาม
- **Backend:** Express.js API ที่มีประสิทธิภาพ
- **Database:** Supabase PostgreSQL ที่ปลอดภัย
- **Features:** ฟีเจอร์ครบครันสำหรับทุกประเภทผู้ใช้

ระบบพร้อมใช้งานและสามารถขยายต่อได้ในอนาคต! 🚀

