# 🐾 Pet Health Assistant

ระบบจัดการสุขภาพสัตว์เลี้ยงที่ครบครันสำหรับเจ้าของสัตว์เลี้ยง สัตวแพทย์ และผู้ดูแลระบบ

## ✨ Features

### 👤 สำหรับเจ้าของสัตว์เลี้ยง
- **จัดการข้อมูลสัตว์เลี้ยง** - เพิ่ม แก้ไข ดูข้อมูลสัตว์เลี้ยง พร้อมอัปโหลดรูปภาพ
- **จองนัดหมาย** - จองนัดหมายกับสัตวแพทย์
- **ดูประวัติสุขภาพ** - ติดตามประวัติการรักษา
- **รับคำแนะนำโภชนาการ** - แผนโภชนาการที่เหมาะสม
- **อ่านบทความ** - ข้อมูลความรู้เกี่ยวกับสัตว์เลี้ยง
- **จัดการโปรไฟล์** - อัปโหลดรูปโปรไฟล์และข้อมูลส่วนตัว
- **รับการแจ้งเตือน** - ระบบแจ้งเตือนสำหรับนัดหมายและสุขภาพสัตว์เลี้ยง

### 🩺 สำหรับสัตวแพทย์
- **จัดการนัดหมาย** - ดูและจัดการนัดหมายทั้งหมด พร้อมอัปเดทสถานะ
- **ดูข้อมูลผู้ป่วย** - ข้อมูลสัตว์เลี้ยงและเจ้าของ พร้อมรูปภาพ
- **บันทึกประวัติสุขภาพ** - บันทึกการตรวจและรักษา
- **สร้างแผนโภชนาการ** - ให้คำแนะนำโภชนาการ
- **เขียนบทความ** - แชร์ความรู้และประสบการณ์
- **จัดการโปรไฟล์** - อัปโหลดรูปโปรไฟล์และข้อมูลส่วนตัว
- **ดูสถิติ** - สถิติการทำงานและผู้ป่วย

### ⚙️ สำหรับผู้ดูแลระบบ
- **จัดการผู้ใช้** - อนุมัติ/ระงับบัญชีผู้ใช้ พร้อมดูรูปโปรไฟล์
- **อนุมัติเนื้อหา** - อนุมัติบทความและแผนโภชนาการ
- **อนุมัติการนัดหมาย** - อนุมัติการนัดหมายที่รอการอนุมัติ
- **ดูสถิติ** - สถิติการใช้งานระบบและข้อมูลภาพรวม
- **จัดการข้อมูล** - จัดการข้อมูลทั้งหมดในระบบ
- **จัดการบทความ** - อนุมัติและจัดการบทความทั้งหมด

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI Framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **Supabase** - Database & Authentication
- **JWT** - Authentication
- **Multer** - File Upload
- **Sharp** - Image Processing
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - API Protection

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)**
- **Real-time subscriptions**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm หรือ yarn
- Supabase account

### Installation

1. **Clone repository**
```bash
git clone https://github.com/your-username/pet-health-docs.git
cd pet-health-docs
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment setup**
```bash
# Copy environment file
cp backend/env.example backend/.env

# Edit with your Supabase credentials
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Start development servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

5. **Access application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
pet-health-docs/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── middleware/          # Authentication, validation
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── database/               # Database schemas
├── docs/                   # Documentation
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm test            # Run tests
npm run db:migrate  # Run database migrations
```

### Frontend Development
```bash
cd frontend
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Database Schema

### Core Tables
- **users** - ผู้ใช้ (เจ้าของ, สัตวแพทย์, แอดมิน)
- **pets** - ข้อมูลสัตว์เลี้ยง
- **appointments** - การนัดหมาย
- **health_records** - ประวัติสุขภาพ
- **nutrition_guidelines** - แนวทางโภชนาการ
- **articles** - บทความ
- **notifications** - การแจ้งเตือน

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Row Level Security** - Database-level security
- **Role-based Access** - User permission system
- **File Upload Security** - Secure file handling with validation
- **Rate Limiting** - API abuse prevention
- **Input Validation** - XSS and injection prevention
- **CORS Protection** - Cross-origin request security
- **Image Processing** - Safe image resizing and optimization

## 🖼️ Image Upload System

### Features
- **Pet Images** - Upload and display pet photos
- **Profile Pictures** - User profile image management
- **Article Images** - Featured images for articles
- **Base64 Encoding** - Secure image display
- **Image Optimization** - Automatic resizing with Sharp
- **Error Handling** - Fallback icons for missing images
- **CORS Support** - Cross-origin image serving

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Pets Management
- `GET /api/pets` - Get user's pets
- `POST /api/pets` - Create new pet
- `PUT /api/pets/:id` - Update pet information
- `GET /api/pets/:id` - Get pet details

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id/status` - Update appointment status

### File Upload
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/image/:filename` - Serve images

### Admin
- `GET /api/admin/statistics` - Get system statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status

## 📱 User Roles

### 👤 User (เจ้าของสัตว์เลี้ยง)
- จัดการข้อมูลสัตว์เลี้ยง
- จองนัดหมาย
- ดูประวัติสุขภาพ
- รับคำแนะนำโภชนาการ
- อัปโหลดรูปภาพสัตว์เลี้ยง
- จัดการโปรไฟล์ส่วนตัว

### 🩺 Veterinarian (สัตวแพทย์)
- ดูและจัดการนัดหมาย
- บันทึกประวัติสุขภาพ
- สร้างแผนโภชนาการ
- เขียนบทความ
- ดูข้อมูลผู้ป่วย
- อัปโหลดรูปโปรไฟล์

### ⚙️ Admin (ผู้ดูแลระบบ)
- จัดการผู้ใช้ทั้งหมด
- อนุมัติเนื้อหา
- ดูสถิติระบบ
- จัดการข้อมูลทั้งหมด
- อนุมัติการนัดหมาย

## 🚀 Deployment

ดูคู่มือการ deploy ที่ [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📋 Production Checklist

ดูรายการตรวจสอบที่ [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- สร้าง Issue ใน GitHub repository
- ติดต่อทีมพัฒนา

## 🙏 Acknowledgments

- Supabase สำหรับ database และ authentication
- React community สำหรับ UI components
- Tailwind CSS สำหรับ styling framework