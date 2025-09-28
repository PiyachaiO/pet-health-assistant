# 🐾 Pet Health Assistant

ระบบจัดการสุขภาพสัตว์เลี้ยงที่ครบครันสำหรับเจ้าของสัตว์เลี้ยง สัตวแพทย์ และผู้ดูแลระบบ

## ✨ Features

### 👤 สำหรับเจ้าของสัตว์เลี้ยง
- **จัดการข้อมูลสัตว์เลี้ยง** - เพิ่ม แก้ไข ดูข้อมูลสัตว์เลี้ยง
- **จองนัดหมาย** - จองนัดหมายกับสัตวแพทย์
- **ดูประวัติสุขภาพ** - ติดตามประวัติการรักษา
- **รับคำแนะนำโภชนาการ** - แผนโภชนาการที่เหมาะสม
- **อ่านบทความ** - ข้อมูลความรู้เกี่ยวกับสัตว์เลี้ยง

### 🩺 สำหรับสัตวแพทย์
- **จัดการนัดหมาย** - ดูและจัดการนัดหมายทั้งหมด
- **ดูข้อมูลผู้ป่วย** - ข้อมูลสัตว์เลี้ยงและเจ้าของ
- **บันทึกประวัติสุขภาพ** - บันทึกการตรวจและรักษา
- **สร้างแผนโภชนาการ** - ให้คำแนะนำโภชนาการ
- **เขียนบทความ** - แชร์ความรู้และประสบการณ์

### ⚙️ สำหรับผู้ดูแลระบบ
- **จัดการผู้ใช้** - อนุมัติ/ระงับบัญชีผู้ใช้
- **อนุมัติเนื้อหา** - อนุมัติบทความและแผนโภชนาการ
- **ดูสถิติ** - สถิติการใช้งานระบบ
- **จัดการข้อมูล** - จัดการข้อมูลทั้งหมดในระบบ

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
- **File Upload Security** - Secure file handling
- **Rate Limiting** - API abuse prevention
- **Input Validation** - XSS and injection prevention

## 📱 User Roles

### 👤 User (เจ้าของสัตว์เลี้ยง)
- จัดการข้อมูลสัตว์เลี้ยง
- จองนัดหมาย
- ดูประวัติสุขภาพ
- รับคำแนะนำโภชนาการ

### 🩺 Veterinarian (สัตวแพทย์)
- ดูและจัดการนัดหมาย
- บันทึกประวัติสุขภาพ
- สร้างแผนโภชนาการ
- เขียนบทความ

### ⚙️ Admin (ผู้ดูแลระบบ)
- จัดการผู้ใช้ทั้งหมด
- อนุมัติเนื้อหา
- ดูสถิติระบบ
- จัดการข้อมูลทั้งหมด

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