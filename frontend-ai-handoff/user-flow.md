# User Flow

## Flow: จัดการผู้ใช้
1. ผู้ใช้เปิดหน้า /users
    → เรียก GET /users
    → แสดงรายชื่อผู้ใช้ทั้งหมด

2. กดปุ่ม "Add User"
    → เปิด modal กรอกข้อมูล
    → กด Save → POST /users
    → refresh list

3. กดปุ่ม "Edit" ที่ผู้ใช้คนใดคนหนึ่ง
    → GET /users/:id
    → แสดงข้อมูลในฟอร์มแก้ไข
    → PUT /users/:id

4. กดปุ่ม "Delete"
    → DELETE /users/:id
    → refresh list
