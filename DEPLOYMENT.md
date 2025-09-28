# 🚀 Pet Health Assistant - Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Docker** 20.10+ และ Docker Compose 2.0+
- **Node.js** 18+ (สำหรับ development)
- **Git** สำหรับ clone repository
- **Domain name** และ **SSL certificate** (สำหรับ production)

### Environment Setup
- **Supabase Project** พร้อม production database
- **Email service** (Gmail SMTP หรือ service อื่น)
- **Monitoring service** (Sentry, Logtail)

## 🔧 Environment Configuration

### 1. Backend Environment Variables

สร้างไฟล์ `backend/.env.production`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Supabase Configuration
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_strong_production_jwt_secret
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# JWT Configuration
JWT_SECRET=your_strong_production_jwt_secret
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=warn
LOG_FILE=/app/logs/app.log

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_production_email@gmail.com
SMTP_PASS=your_production_app_password

# External Services
SENTRY_DSN=your_production_sentry_dsn
LOGTAIL_TOKEN=your_production_logtail_token

# Security
ENABLE_SWAGGER=false
ENABLE_LOGGING=true
ENABLE_CORS=true
CORS_ORIGIN=https://your-domain.com
```

### 2. SSL Certificate Setup

```bash
# สร้าง SSL certificate directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

## 🐳 Docker Deployment

### 1. Quick Deployment

```bash
# Clone repository
git clone https://github.com/your-username/pet-health-docs.git
cd pet-health-docs

# Set up environment
cp backend/env.example backend/.env.production
# Edit backend/.env.production with your values

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 2. Manual Deployment Steps

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f

# 4. Health check
curl http://localhost:5000/api/health
```

## 🔍 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost

# Container status
docker-compose -f docker-compose.prod.yml ps
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

### Backup

```bash
# Backup uploads
docker cp pet-health-backend:/app/uploads ./backups/uploads-$(date +%Y%m%d)

# Backup logs
docker cp pet-health-backend:/app/logs ./backups/logs-$(date +%Y%m%d)

# Database backup (via Supabase dashboard)
```

## 🔄 Updates & Rollbacks

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Rollback

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
# (Implement your rollback strategy here)
```

## 🛡️ Security Considerations

### 1. Environment Variables
- ใช้ strong passwords และ secrets
- ไม่ commit `.env` files
- ใช้ environment-specific configurations

### 2. SSL/TLS
- ใช้ valid SSL certificates
- Enable HTTPS redirect
- Configure security headers

### 3. Database Security
- ใช้ Supabase RLS policies
- Regular security audits
- Backup strategies

### 4. File Upload Security
- Validate file types
- Scan for malware
- Limit file sizes

## 📊 Performance Optimization

### 1. Caching
- Enable gzip compression
- Cache static assets
- Use CDN for images

### 2. Database
- Optimize queries
- Use indexes
- Monitor performance

### 3. Monitoring
- Set up alerts
- Monitor resource usage
- Track errors

## 🆘 Troubleshooting

### Common Issues

#### 1. Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### 2. Database Connection Issues
- ตรวจสอบ Supabase credentials
- ตรวจสอบ network connectivity
- ตรวจสอบ RLS policies

#### 3. File Upload Issues
- ตรวจสอบ upload directory permissions
- ตรวจสอบ file size limits
- ตรวจสอบ CORS settings

### Support

หากพบปัญหา:
1. ตรวจสอบ logs
2. ตรวจสอบ environment variables
3. ตรวจสอบ network connectivity
4. ติดต่อ support team

## 📈 Scaling

### Horizontal Scaling
- ใช้ load balancer
- Scale backend services
- Use database connection pooling

### Vertical Scaling
- เพิ่ม server resources
- Optimize application code
- Use caching strategies

---

**หมายเหตุ**: เอกสารนี้ครอบคลุมการ deployment พื้นฐาน สำหรับ production environment ที่ซับซ้อนมากขึ้น ควรปรึกษา DevOps engineer เพิ่มเติม
