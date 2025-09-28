# 🧪 Insomnia Testing Guide - Pet Health Assistant API

## 📋 ภาพรวม
คู่มือการทดสอบ API สำหรับระบบจัดการสุขภาพสัตว์เลี้ยง (Pet Health Assistant) ใช้ Insomnia เป็นเครื่องมือในการทดสอบ

## 🚀 การตั้งค่าเริ่มต้น

### 1. การติดตั้ง Insomnia
- ดาวน์โหลดและติดตั้ง Insomnia จาก https://insomnia.rest/
- เปิด Insomnia และสร้าง Workspace ใหม่

### 2. การนำเข้า Collection
- เปิดไฟล์ `insomnia-collection.json` ใน Insomnia
- เลือก "Import Data" และเลือกไฟล์ collection
- Collection จะถูกนำเข้าและพร้อมใช้งาน

### 3. การตั้งค่า Environment
- เลือก Environment "Development"
- ตั้งค่าตัวแปรต่อไปนี้:
  ```
  base_url: http://localhost:5000
  access_token: (จะถูกเติมอัตโนมัติหลัง login)
  pet_id: (จะถูกเติมอัตโนมัติหลังสร้าง pet)
  vet_id: (ID ของสัตวแพทย์)
  appointment_id: (จะถูกเติมอัตโนมัติหลังสร้าง appointment)
  notification_id: (จะถูกเติมอัตโนมัติหลังสร้าง notification)
  ```

## 🔧 การเตรียมเซิร์ฟเวอร์

### 1. เริ่มต้นเซิร์ฟเวอร์
```bash
cd backend
npm install
npm start
```

### 2. ตรวจสอบการทำงาน
- ทดสอบ Health Check: `GET {{ _.base_url }}/api/health`
- ควรได้รับ response: `{"status":"OK","timestamp":"...","uptime":...}`

## 📝 ขั้นตอนการทดสอบ

### 🔐 1. การยืนยันตัวตน (Authentication)

#### 1.1 ลงทะเบียนผู้ใช้ใหม่
- **Request**: `POST {{ _.base_url }}/api/auth/register`
- **Body**:
  ```json
  {
    "email": "user@pethealth.com",
  "password": "password123",
  "full_name": "Test User",
  "role": "user",
  "phone": "0812345678",
  "address": "123 Test Street"
}
```
- **Expected Response**: 201 Created
- **Notes**: เก็บ user_id จาก response สำหรับการทดสอบต่อไป
- **Possible Errors**:
  - `USER_EXISTS`: ผู้ใช้มีอยู่แล้ว
  - `REGISTRATION_FAILED`: การลงทะเบียนล้มเหลว (ตรวจสอบ email format)
  - `PROFILE_CREATION_FAILED`: การสร้างโปรไฟล์ล้มเหลว

#### 1.2 ลงทะเบียนสัตวแพทย์
- **Request**: `POST {{ _.base_url }}/api/auth/register`
- **Body**:
  ```json
  {
    "email": "vet@pethealth.com",
    "password": "password123",
    "full_name": "Dr. Somchai Petvet",
    "role": "veterinarian",
    "phone": "0812345679",
    "address": "123 Veterinary Clinic, Bangkok"
  }
  ```
- **Expected Response**: 201 Created
- **Important**: เก็บ vet_id จาก response สำหรับการทดสอบ

#### 1.3 เข้าสู่ระบบ
- **Request**: `POST {{ _.base_url }}/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@pethealth.com",
  "password": "password123"
}
```
- **Expected Response**: 200 OK
- **Important**: คัดลอก `access_token` จาก response และใส่ใน Environment Variable
- **Possible Errors**:
  - `LOGIN_FAILED`: การเข้าสู่ระบบล้มเหลว (ตรวจสอบ email/password)
  - `PROFILE_FETCH_FAILED`: ไม่พบโปรไฟล์ผู้ใช้

### 👤 2. การจัดการผู้ใช้ (Users)

#### 2.1 ดูข้อมูลโปรไฟล์
- **Request**: `GET {{ _.base_url }}/api/users/profile`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 2.2 อัปเดตโปรไฟล์
- **Request**: `PUT {{ _.base_url }}/api/users/profile`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**:
  ```json
  {
    "full_name": "Updated Name",
    "phone": "0898765432",
    "address": "456 Updated Street"
  }
  ```
- **Expected Response**: 200 OK

### 🐾 3. การจัดการสัตว์เลี้ยง (Pets)

#### 3.1 สร้างสัตว์เลี้ยงใหม่
- **Request**: `POST {{ _.base_url }}/api/pets`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**:
  ```json
{
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
    "birth_date": "2022-05-15",
  "weight": 25.5,
  "gender": "male",
    "color": "golden"
  }
  ```
- **Expected Response**: 201 Created
- **Important**: เก็บ `pet_id` จาก response และใส่ใน Environment Variable

#### 3.2 ดูรายการสัตว์เลี้ยงทั้งหมด
- **Request**: `GET {{ _.base_url }}/api/pets`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 3.3 ดูข้อมูลสัตว์เลี้ยงเฉพาะ
- **Request**: `GET {{ _.base_url }}/api/pets/{{ _.pet_id }}`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 3.4 อัปเดตข้อมูลสัตว์เลี้ยง
- **Request**: `PUT {{ _.base_url }}/api/pets/{{ _.pet_id }}`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**:
  ```json
  {
    "name": "Buddy Updated",
    "weight": 26.0,
    "color": "light golden"
  }
  ```
- **Expected Response**: 200 OK

#### 3.5 ดูประวัติสุขภาพสัตว์เลี้ยง
- **Request**: `GET {{ _.base_url }}/api/pets/{{ _.pet_id }}/health-records`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 3.6 สร้างประวัติสุขภาพ (สำหรับสัตว์แพทย์)
- **Request**: `POST {{ _.base_url }}/api/pets/{{ _.pet_id }}/health-records`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body** (สำหรับสัตว์แพทย์):
  ```json
  {
    "record_date": "2025-07-31",
    "diagnosis": "ไข้หวัด",
    "treatment": "ให้ยาลดไข้",
    "weight": 25.5,
    "notes": "อาการดีขึ้นแล้ว"
  }
  ```
- **Body** (สำหรับเจ้าของสัตว์):
  ```json
  {
    "record_date": "2025-07-31",
    "veterinarian_id": "{{ _.vet_id }}",
    "diagnosis": "ไข้หวัด",
    "treatment": "ให้ยาลดไข้",
    "weight": 25.5,
    "notes": "อาการดีขึ้นแล้ว"
  }
  ```
- **Expected Response**: 201 Created

#### 3.7 ลบสัตว์เลี้ยง
- **Request**: `DELETE {{ _.base_url }}/api/pets/{{ _.pet_id }}`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 204 No Content

### 📅 4. การจัดการนัดหมาย (Appointments)

#### 4.1 สร้างนัดหมายใหม่
- **Request**: `POST {{ _.base_url }}/api/appointments`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**:
  ```json
{
  "pet_id": "{{ _.pet_id }}",
  "vet_id": "{{ _.vet_id }}",
  "appointment_date": "2025-08-15T10:00:00Z",
  "reason": "Annual checkup",
  "notes": "Regular health check"
}
```
- **Expected Response**: 201 Created
- **Important**: เก็บ `appointment_id` จาก response และใส่ใน Environment Variable

#### 4.2 ดูรายการนัดหมาย
- **Request**: `GET {{ _.base_url }}/api/appointments`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 4.3 ดูรายการนัดหมายสำหรับสัตวแพทย์
- **Request**: `GET {{ _.base_url }}/api/appointments/vet`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK
- **Notes**: ต้องใช้ account ของสัตวแพทย์

#### 4.4 ยกเลิกนัดหมาย
- **Request**: `PATCH {{ _.base_url }}/api/appointments/{{ _.appointment_id }}/cancel`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

### 📚 5. การจัดการบทความ (Articles)

#### 5.1 ดูบทความที่เผยแพร่แล้ว (Public)
- **Request**: `GET {{ _.base_url }}/api/articles`
- **Expected Response**: 200 OK
- **Notes**: ไม่ต้องใช้ Authorization

#### 5.2 สร้างบทความใหม่ (Admin/Vet)
- **Request**: `POST {{ _.base_url }}/api/articles`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**:
  ```json
{
  "title": "การดูแลสุขภาพสัตว์เลี้ยง",
  "content": "เนื้อหาบทความ...",
  "summary": "สรุปบทความ",
  "tags": ["health", "care"]
}
```
- **Expected Response**: 201 Created
- **Notes**: ต้องใช้ account ของ Admin หรือ Vet

### 🔔 6. การจัดการการแจ้งเตือน (Notifications)

#### 6.1 ดูการแจ้งเตือน
- **Request**: `GET {{ _.base_url }}/api/notifications`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 6.2 ดูจำนวนการแจ้งเตือนที่ยังไม่อ่าน
- **Request**: `GET {{ _.base_url }}/api/notifications/unread/count`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 6.3 ทำเครื่องหมายอ่านแล้ว
- **Request**: `PATCH {{ _.base_url }}/api/notifications/{{ _.notification_id }}/read`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

### 🍖 7. การจัดการโภชนาการ (Nutrition)

#### 7.1 ดูแนวทางโภชนาการที่เผยแพร่แล้ว (Public)
- **Request**: `GET {{ _.base_url }}/api/nutrition/guidelines`
- **Expected Response**: 200 OK
- **Notes**: ไม่ต้องใช้ Authorization

#### 7.2 ดูคำแนะนำโภชนาการ
- **Request**: `GET {{ _.base_url }}/api/nutrition/recommendations`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

#### 7.3 สร้างแนวทางโภชนาการ (Vet/Admin)
- **Request**: `POST {{ _.base_url }}/api/nutrition/guidelines`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**:
  ```json
  {
    "title": "โภชนาการสำหรับสุนัข",
    "description": "แนวทางโภชนาการสำหรับสุนัข",
    "species": "dog",
    "age_group": "adult",
    "diet_type": "dry"
  }
  ```
- **Expected Response**: 201 Created
- **Notes**: ต้องใช้ account ของ Vet หรือ Admin

### 📁 8. การอัปโหลดไฟล์ (File Upload)

#### 8.1 อัปโหลดไฟล์
- **Request**: `POST {{ _.base_url }}/api/upload`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Body**: Form Data
  - Key: `file`
  - Type: File
  - Value: เลือกไฟล์ที่ต้องการอัปโหลด
- **Expected Response**: 201 Created

#### 8.2 ดูรายการไฟล์ที่อัปโหลด
- **Request**: `GET {{ _.base_url }}/api/upload`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK

### ⚙️ 9. การจัดการผู้ดูแลระบบ (Admin)

#### 9.1 ดูรายการรออนุมัติ (Admin)
- **Request**: `GET {{ _.base_url }}/api/admin/pending-approvals`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK
- **Notes**: ต้องใช้ account ของ Admin

#### 9.2 อนุมัติการนัดหมาย (Admin)
- **Request**: `PATCH {{ _.base_url }}/api/admin/appointments/{{ _.appointment_id }}/approve`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK
- **Notes**: ต้องใช้ account ของ Admin

#### 9.3 ดูสถิติระบบ (Admin)
- **Request**: `GET {{ _.base_url }}/api/admin/statistics`
- **Headers**: `Authorization: Bearer {{ _.access_token }}`
- **Expected Response**: 200 OK
- **Notes**: ต้องใช้ account ของ Admin

## 🔍 การทดสอบ Error Cases

### 1. การทดสอบ Authentication
- ทดสอบ API ที่ต้องใช้ Authorization โดยไม่ส่ง token
- Expected: 401 Unauthorized

### 2. การทดสอบ Validation
- ส่งข้อมูลที่ไม่ถูกต้อง (เช่น email ไม่ถูก format)
- Expected: 400 Bad Request พร้อม error message

### 3. การทดสอบ Authorization
- ทดสอบ Admin API ด้วย user account ปกติ
- Expected: 403 Forbidden

### 4. การทดสอบ Not Found
- ทดสอบ API ด้วย ID ที่ไม่มีอยู่
- Expected: 404 Not Found

## 📊 การตรวจสอบผลลัพธ์

### 1. Status Codes
- 200: OK (สำเร็จ)
- 201: Created (สร้างใหม่สำเร็จ)
- 204: No Content (ลบสำเร็จ)
- 400: Bad Request (ข้อมูลไม่ถูกต้อง)
- 401: Unauthorized (ไม่มีการยืนยันตัวตน)
- 403: Forbidden (ไม่มีสิทธิ์)
- 404: Not Found (ไม่พบข้อมูล)
- 500: Internal Server Error (ข้อผิดพลาดเซิร์ฟเวอร์)

### 2. Response Format
```json
{
  "message": "ข้อความตอบกลับ",
  "data": {
    // ข้อมูลที่ส่งกลับ
  }
}
```

### 3. Error Format
```json
{
  "error": "ข้อความข้อผิดพลาด",
  "code": "ERROR_CODE"
}
```

### 4. Common Error Codes
- `USER_EXISTS`: ผู้ใช้มีอยู่แล้ว
- `REGISTRATION_FAILED`: การลงทะเบียนล้มเหลว
- `LOGIN_FAILED`: การเข้าสู่ระบบล้มเหลว
- `PROFILE_FETCH_FAILED`: ไม่พบโปรไฟล์ผู้ใช้
- `PROFILE_CREATION_FAILED`: การสร้างโปรไฟล์ล้มเหลว
- `ACCESS_DENIED`: ไม่มีสิทธิ์เข้าถึง
- `VALIDATION_FAILED`: ข้อมูลไม่ถูกต้อง

## 🎯 เคล็ดลับการทดสอบ

### 1. การจัดการ Environment Variables
- ใช้ Environment Variables เพื่อเก็บข้อมูลที่ใช้ร่วมกัน
- อัปเดต variables หลังจากการสร้างข้อมูลใหม่

### 2. การทดสอบตามลำดับ
- ทดสอบตามลำดับที่กำหนดไว้
- เก็บ ID ที่จำเป็นสำหรับการทดสอบขั้นตอนต่อไป

### 3. การตรวจสอบ Response
- ตรวจสอบ status code และ response body
- ตรวจสอบว่าข้อมูลที่ส่งกลับถูกต้อง

### 4. การทดสอบ Edge Cases
- ทดสอบกรณีข้อมูลขอบเขต
- ทดสอบกรณีข้อมูลไม่ถูกต้อง

## 🚨 การแก้ไขปัญหา

### 1. Server ไม่เริ่มต้น
- ตรวจสอบ port 5000 ไม่ถูกใช้งาน
- ตรวจสอบไฟล์ .env ถูกต้อง
- ตรวจสอบ dependencies ติดตั้งครบ

### 2. Registration Error
- **Email format**: ใช้ email ที่ถูกต้อง เช่น `user@pethealth.com`, `test@gmail.com`
- **Password**: ต้องมีอย่างน้อย 6 ตัวอักษร
- **Duplicate email**: ตรวจสอบว่า email ไม่ซ้ำกับที่มีอยู่แล้ว
- **Role validation**: ใช้ `user`, `veterinarian`, หรือ `admin`

### 3. Login Error
- ตรวจสอบ email และ password ถูกต้อง
- ตรวจสอบว่าได้ register user แล้ว
- ตรวจสอบ Supabase connection

### 4. Authentication Error
- ตรวจสอบ token ถูกต้อง
- ตรวจสอบ token ไม่หมดอายุ
- ตรวจสอบ format ของ Authorization header

### 5. Database Error
- ตรวจสอบการเชื่อมต่อ Supabase
- ตรวจสอบ environment variables
- ตรวจสอบสิทธิ์การเข้าถึง database

## 📝 บันทึกการทดสอบ

### 📧 **ตัวอย่าง Email ที่ใช้ทดสอบ**
```json
// User accounts
{
  "email": "user@pethealth.com",
  "password": "password123"
}

{
  "email": "vet@pethealth.com", 
  "password": "password123"
}

{
  "email": "admin@pethealth.com",
  "password": "password123"
}

// หรือใช้ email จริง
{
  "email": "your-email@gmail.com",
  "password": "your-password"
}
```

สร้างไฟล์บันทึกการทดสอบเพื่อติดตามผลลัพธ์:

```markdown
# Test Results - [Date]

## Authentication
- [ ] Register User
- [ ] Register Veterinarian
- [ ] Login User

## Users
- [ ] Get Profile
- [ ] Update Profile

## Pets
- [ ] Create Pet
- [ ] Get All Pets
- [ ] Get Pet
- [ ] Update Pet
- [ ] Get Health Records
- [ ] Create Health Record
- [ ] Delete Pet

## Appointments
- [ ] Create Appointment
- [ ] Get Appointments
- [ ] Get Vet Appointments
- [ ] Cancel Appointment

## Articles
- [ ] Get Articles (Public)
- [ ] Create Article (Admin/Vet)

## Notifications
- [ ] Get Notifications
- [ ] Get Unread Count
- [ ] Mark as Read

## Nutrition
- [ ] Get Nutrition Guidelines (Public)
- [ ] Get Nutrition Recommendations
- [ ] Create Nutrition Guideline (Vet/Admin)

## File Upload
- [ ] Upload File
- [ ] Get Uploads

## Admin
- [ ] Get Pending Approvals
- [ ] Approve Appointment
- [ ] Get Statistics

## Notes
- ข้อสังเกตหรือปัญหาที่พบ
- การแก้ไขที่ทำ
```

## 🎉 สรุป

คู่มือนี้ครอบคลุมการทดสอบ API ทั้งหมดของระบบ Pet Health Assistant โดยใช้ Insomnia เป็นเครื่องมือหลัก การทดสอบตามลำดับที่กำหนดจะช่วยให้มั่นใจว่าระบบทำงานได้อย่างถูกต้องและครบถ้วน 