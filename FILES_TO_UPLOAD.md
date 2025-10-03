# 📤 ไฟล์ที่ต้องอัพโหลดไปยัง FileZilla

## 🎯 ไฟล์สำคัญที่ต้องส่ง

### ✅ ไฟล์หลัก (ต้องส่ง)
```
pet-health-docs/
├── 📄 README_FOR_TEACHER.md          # ไฟล์หลักสำหรับอาจารย์
├── 📄 README.md                       # README หลัก
├── 📄 PROJECT_SUMMARY.md              # สรุปโปรเจค
├── 📄 UPLOAD_GUIDE.md                 # คู่มือการอัพโหลด
├── 📄 INSTALLATION_GUIDE.md           # คู่มือการติดตั้ง
├── 📄 FILES_TO_UPLOAD.md              # ไฟล์นี้
├── 📄 package.json                    # Root package.json
├── 📁 backend/                        # โฟลเดอร์ Backend
│   ├── 📄 package.json
│   ├── 📄 server.js
│   ├── 📁 routes/
│   ├── 📁 middleware/
│   ├── 📁 config/
│   ├── 📁 tests/
│   └── 📁 uploads/
├── 📁 frontend/                       # โฟลเดอร์ Frontend
│   ├── 📄 package.json
│   ├── 📁 src/
│   ├── 📁 public/
│   └── 📁 build/ (ถ้ามี)
├── 📁 database/                       # โฟลเดอร์ Database
│   ├── 📄 schema.sql
│   └── 📄 seed.sql
└── 📁 components/                     # โฟลเดอร์ Components
```

### ❌ ไฟล์ที่ไม่ต้องส่ง
```
node_modules/          # ไม่ต้องส่ง (ใหญ่เกินไป)
.git/                  # ไม่ต้องส่ง
.env                   # ไม่ต้องส่ง (มีข้อมูลลับ)
*.log                  # ไม่ต้องส่ง
.DS_Store              # ไม่ต้องส่ง
Thumbs.db              # ไม่ต้องส่ง
build/                 # ไม่ต้องส่ง (สร้างใหม่ได้)
dist/                  # ไม่ต้องส่ง
coverage/              # ไม่ต้องส่ง
.nyc_output/           # ไม่ต้องส่ง
```

---

## 📋 ขั้นตอนการเตรียมไฟล์

### 1. ลบไฟล์ที่ไม่จำเป็น
```bash
# ลบ node_modules
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules

# ลบไฟล์ log
rm -f *.log
rm -f backend/*.log
rm -f frontend/*.log

# ลบไฟล์ .env
rm -f .env
rm -f backend/.env
rm -f frontend/.env

# ลบไฟล์ system
rm -f .DS_Store
rm -f Thumbs.db
```

### 2. สร้างไฟล์ .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
build/
dist/
coverage/

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# System files
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE
.vscode/
.idea/
*.sublime-*

# Temporary files
tmp/
temp/
```

### 3. สร้างไฟล์ ZIP
1. **เลือกไฟล์ทั้งหมด** (ยกเว้น node_modules)
2. **คลิกขวา** → **Send to** → **Compressed (zipped) folder**
3. **ตั้งชื่อไฟล์** เช่น `pet-health-project-[ชื่อ-นามสกุล].zip`

---

## 📊 ข้อมูลไฟล์

### ขนาดไฟล์ (ประมาณ)
- **รวมทั้งหมด:** ~50-100 MB
- **หลังลบ node_modules:** ~10-20 MB
- **ไฟล์ ZIP:** ~5-10 MB

### จำนวนไฟล์
- **Total Files:** 150+ files
- **Source Code:** 100+ files
- **Documentation:** 10+ files
- **Configuration:** 5+ files

---

## 🔍 ตรวจสอบก่อนส่ง

### ✅ Checklist
- [ ] มีไฟล์ README_FOR_TEACHER.md
- [ ] มีไฟล์ package.json ทั้งหมด
- [ ] มีโฟลเดอร์ backend/ และ frontend/
- [ ] มีไฟล์ database schema
- [ ] ไม่มี node_modules
- [ ] ไม่มีไฟล์ .env
- [ ] ไฟล์ ZIP ไม่ใหญ่เกินไป
- [ ] ไฟล์ ZIP แตกได้

### 🧪 ทดสอบไฟล์
1. **แตกไฟล์ ZIP** ในเครื่องอื่น
2. **ตรวจสอบ** ว่ามีไฟล์ครบ
3. **ทดสอบ** การติดตั้ง dependencies
4. **ทดสอบ** การรันโปรเจค

---

## 📤 การอัพโหลด

### 1. เปิด FileZilla
1. **Host:** [ที่อยู่เซิร์ฟเวอร์ของอาจารย์]
2. **Username:** [ชื่อผู้ใช้]
3. **Password:** [รหัสผ่าน]
4. **Port:** [พอร์ต (ปกติ 21 หรือ 22)]

### 2. อัพโหลดไฟล์
1. **ลากไฟล์ ZIP** ไปยังโฟลเดอร์ที่อาจารย์กำหนด
2. **รอให้อัพโหลดเสร็จ**
3. **ตรวจสอบ** ว่าอัพโหลดสำเร็จ

### 3. ส่งข้อมูลการเข้าถึง
ส่งข้อมูลต่อไปนี้ให้อาจารย์:
- **ชื่อไฟล์:** `pet-health-project-[ชื่อ-นามสกุล].zip`
- **ขนาดไฟล์:** [X MB]
- **วันที่ส่ง:** [วันที่]
- **ข้อมูลการเข้าถึง:** [username/password]

---

## 📞 การติดต่อ

หากมีปัญหาการอัพโหลด:

**นักศึกษา:** [ชื่อ-นามสกุล]  
**Email:** [email@example.com]  
**Line:** [Line ID]  
**โทร:** [เบอร์โทร]

---

## 🎯 สรุป

1. **เตรียมไฟล์** - ลบ node_modules และไฟล์ที่ไม่จำเป็น
2. **สร้าง ZIP** - รวมไฟล์ทั้งหมดในไฟล์ ZIP เดียว
3. **ตรวจสอบ** - ตรวจสอบว่ามีไฟล์ครบ
4. **อัพโหลด** - ใช้ FileZilla อัพโหลดไปยังเซิร์ฟเวอร์
5. **ส่งข้อมูล** - ส่งข้อมูลการเข้าถึงให้อาจารย์

**หมายเหตุ:** อย่าลืมส่งข้อมูลการเข้าถึง (username/password) ให้อาจารย์ด้วย! 🔐

