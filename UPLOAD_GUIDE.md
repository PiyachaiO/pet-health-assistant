# 📤 คู่มือการอัพโหลดโปรเจคไปยัง FileZilla

## 🎯 ไฟล์ที่ต้องอัพโหลด

### ✅ ไฟล์ที่ต้องส่ง (สำคัญ)
```
pet-health-docs/
├── 📄 README_FOR_TEACHER.md          # ไฟล์หลักสำหรับอาจารย์
├── 📄 README.md                       # README หลัก
├── 📁 backend/                        # โฟลเดอร์ Backend
│   ├── 📄 package.json
│   ├── 📄 server.js
│   ├── 📁 routes/
│   ├── 📁 middleware/
│   ├── 📁 config/
│   └── 📁 tests/
├── 📁 frontend/                       # โฟลเดอร์ Frontend
│   ├── 📄 package.json
│   ├── 📁 src/
│   ├── 📁 public/
│   └── 📁 build/ (ถ้ามี)
├── 📁 database/                       # โฟลเดอร์ Database
│   ├── 📄 schema.sql
│   └── 📄 seed.sql
└── 📄 package.json                    # Root package.json
```

### ❌ ไฟล์ที่ไม่ต้องส่ง
```
node_modules/          # ไม่ต้องส่ง (ใหญ่เกินไป)
.git/                  # ไม่ต้องส่ง
.env                   # ไม่ต้องส่ง (มีข้อมูลลับ)
*.log                  # ไม่ต้องส่ง
.DS_Store              # ไม่ต้องส่ง
Thumbs.db              # ไม่ต้องส่ง
```

---

## 📋 ขั้นตอนการอัพโหลด

### 1. เตรียมไฟล์
1. **ลบ node_modules** (ถ้ามี)
   ```bash
   # ลบ node_modules ทั้งหมด
   rm -rf node_modules
   rm -rf backend/node_modules
   rm -rf frontend/node_modules
   ```

2. **ลบไฟล์ที่ไม่จำเป็น**
   ```bash
   # ลบไฟล์ log
   rm -f *.log
   rm -f backend/*.log
   rm -f frontend/*.log
   
   # ลบไฟล์ .env (ถ้ามี)
   rm -f .env
   rm -f backend/.env
   rm -f frontend/.env
   ```

3. **สร้างไฟล์ .gitignore** (ถ้าไม่มี)
   ```gitignore
   node_modules/
   .env
   *.log
   .DS_Store
   Thumbs.db
   build/
   dist/
   ```

### 2. สร้างไฟล์ ZIP
1. **เลือกไฟล์ทั้งหมด** (ยกเว้น node_modules)
2. **คลิกขวา** → **Send to** → **Compressed (zipped) folder**
3. **ตั้งชื่อไฟล์** เช่น `pet-health-project-[ชื่อ-นามสกุล].zip`

### 3. อัพโหลดผ่าน FileZilla
1. **เปิด FileZilla**
2. **เชื่อมต่อ** ไปยังเซิร์ฟเวอร์ของอาจารย์
3. **ลากไฟล์ ZIP** ไปยังโฟลเดอร์ที่อาจารย์กำหนด
4. **รอให้อัพโหลดเสร็จ**

---

## 📝 ข้อมูลที่ต้องกรอกใน FileZilla

### ข้อมูลการเชื่อมต่อ
- **Host:** [ที่อยู่เซิร์ฟเวอร์ของอาจารย์]
- **Username:** [ชื่อผู้ใช้]
- **Password:** [รหัสผ่าน]
- **Port:** [พอร์ต (ปกติ 21 หรือ 22)]

### ข้อมูลโปรเจค
- **ชื่อไฟล์:** `pet-health-project-[ชื่อ-นามสกุล].zip`
- **ขนาดไฟล์:** [ประมาณ X MB]
- **วันที่ส่ง:** [วันที่]

---

## 🔍 ตรวจสอบก่อนส่ง

### ✅ Checklist
- [ ] มีไฟล์ README_FOR_TEACHER.md
- [ ] มีไฟล์ package.json ทั้งหมด
- [ ] มีโฟลเดอร์ backend/ และ frontend/
- [ ] มีไฟล์ database schema
- [ ] ไม่มี node_modules
- [ ] ไม่มีไฟล์ .env
- [ ] ไฟล์ ZIP ไม่ใหญ่เกินไป (< 50MB)

### 🧪 ทดสอบไฟล์
1. **แตกไฟล์ ZIP** ในเครื่องอื่น
2. **ตรวจสอบ** ว่ามีไฟล์ครบ
3. **ทดสอบ** การติดตั้ง dependencies
4. **ทดสอบ** การรันโปรเจค

---

## 📞 หากมีปัญหา

### ปัญหาที่พบบ่อย
1. **ไฟล์ใหญ่เกินไป**
   - ลบ node_modules
   - ลบไฟล์ build ที่ไม่จำเป็น
   - ใช้ Git LFS (ถ้าจำเป็น)

2. **ไฟล์หาย**
   - ตรวจสอบ .gitignore
   - ตรวจสอบการ copy ไฟล์

3. **อัพโหลดไม่สำเร็จ**
   - ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
   - ลองอัพโหลดใหม่
   - ติดต่ออาจารย์

### การติดต่อ
- **Email:** [email@example.com]
- **Line:** [Line ID]
- **โทร:** [เบอร์โทร]

---

## 🎯 สรุป

1. **เตรียมไฟล์** - ลบ node_modules และไฟล์ที่ไม่จำเป็น
2. **สร้าง ZIP** - รวมไฟล์ทั้งหมดในไฟล์ ZIP เดียว
3. **อัพโหลด** - ใช้ FileZilla อัพโหลดไปยังเซิร์ฟเวอร์
4. **ตรวจสอบ** - ตรวจสอบว่าอัพโหลดสำเร็จ

**หมายเหตุ:** อย่าลืมส่งข้อมูลการเข้าถึง (username/password) ให้อาจารย์ด้วย! 🔐

