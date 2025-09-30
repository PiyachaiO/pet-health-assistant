# 🎨 Pet Health Assistant - Frontend

React.js frontend application สำหรับระบบจัดการสุขภาพสัตว์เลี้ยง

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start

# Build for production
npm run build
\`\`\`

## 📱 Features

### 👥 User Features
- ✅ User registration and authentication
- 🐾 Pet profile management
- 📋 Health records tracking
- 💉 Vaccination reminders
- 📅 Appointment booking
- 🍖 Nutrition recommendations
- 📚 Educational articles

### 👨‍⚕️ Veterinarian Features
- 📊 Dashboard with statistics
- 📅 Appointment management
- 💊 Nutrition guideline creation
- 👥 Patient management

### 👨‍💼 Admin Features
- ✅ Approval system
- 👥 User management
- 📈 System statistics

## 🏗️ Project Structure

\`\`\`
src/
├── components/          # Reusable components
│   ├── AddPetModal.js
│   ├── AddHealthRecordModal.js
│   ├── BookAppointmentModal.js
│   ├── AddNutritionModal.js
│   ├── ImageUpload.js
│   ├── Navbar.js
│   └── ProtectedRoute.js
├── contexts/            # React contexts
│   └── AuthContext.js
├── hooks/               # Custom hooks
│   ├── useApi.js
│   ├── useLocalStorage.js
│   └── index.js
├── pages/              # Page components
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── PetProfile.js
│   ├── Appointments.js
│   ├── VetDashboard.js
│   ├── AdminDashboard.js
│   ├── Articles.js
│   ├── ArticleDetail.js
│   ├── Notifications.js
│   └── NutritionRecommendation.js
├── services/           # API services
│   ├── api.js
│   ├── authService.js
│   ├── petService.js
│   ├── appointmentService.js
│   ├── articleService.js
│   ├── notificationService.js
│   ├── nutritionService.js
│   ├── uploadService.js
│   ├── adminService.js
│   └── index.js
├── utils/              # Utility functions
│   ├── constants.js
│   └── helpers.js
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
\`\`\`

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS classes** - For common components
- **Responsive design** - Mobile-first approach
- **Thai fonts** - Inter + Noto Sans Thai

## 🔧 Environment Variables

\`\`\`env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Supabase Configuration (if using Supabase)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
REACT_APP_NAME=Pet Health Assistant
REACT_APP_VERSION=1.0.0

# Development Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info
\`\`\`

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Client-side routing

### HTTP & State
- `axios` - HTTP client
- `@supabase/supabase-js` - Supabase client

### UI & Icons
- `lucide-react` - Icon library
- `tailwindcss` - CSS framework

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
\`\`\`

## 🚀 Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Deploy to Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Deploy to Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Set environment variables
\`\`\`

ตอนนี้โปรเจคได้ถูกจัดระเบียบแยกเป็น 2 โฟลเดอร์ที่ชัดเจนแล้ว และเปลี่ยนไปใช้ Supabase เรียบร้อย! 

## 📁 โครงสร้างโปรเจคใหม่:

\`\`\`
pet-health-assistant/
├── 📁 backend/                 # Backend API (Express.js + Supabase)
├── 📁 frontend/               # Frontend App (React.js)
├── 📁 database/               # Database Schema & Seed
├── 📄 README.md               # คู่มือหลัก
└── 📄 SUPABASE_SETUP.md       # คู่มือตั้งค่า Supabase
\`\`\`

## 🎯 ข้อดีของการแยกโฟลเดอร์:

1. **แยกความรับผิดชอบชัดเจน** - Frontend/Backend แยกกัน
2. **Deploy แยกกัน** - สามารถ deploy แต่ละส่วนแยกกัน
3. **จัดการ dependencies** - แต่ละโฟลเดอร์มี package.json ของตัวเอง
4. **ทีมงานแยกกัน** - Frontend/Backend developer ทำงานแยกกัน
5. **Scaling** - ขยายแต่ละส่วนได้อิสระ

## 🚀 วิธีการใช้งาน:

1. **Clone repository**
2. **ตั้งค่า Supabase** ตาม `SUPABASE_SETUP.md`
3. **รัน Backend**: `cd backend && npm install && npm run dev`
4. **รัน Frontend**: `cd frontend && npm install && npm start`

ระบบพร้อมใช้งานแล้ว! 🎉
