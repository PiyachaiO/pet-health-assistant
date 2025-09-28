# ☁️ Cloud Deployment Guide

## 🚀 Platform Options

### 1. **DigitalOcean** (Recommended for beginners)
- **Cost**: $12-24/month
- **Setup**: 15 minutes
- **Features**: Droplets, Spaces, Managed Databases

### 2. **AWS** (Enterprise-grade)
- **Cost**: $20-50/month
- **Setup**: 30 minutes
- **Features**: EC2, S3, RDS, CloudFront

### 3. **Google Cloud Platform**
- **Cost**: $15-40/month
- **Setup**: 25 minutes
- **Features**: Compute Engine, Cloud Storage, Cloud SQL

### 4. **Azure**
- **Cost**: $18-45/month
- **Setup**: 30 minutes
- **Features**: Virtual Machines, Blob Storage, SQL Database

## 🌊 DigitalOcean Deployment (Recommended)

### Step 1: Create Droplet
```bash
# 1. Go to DigitalOcean Dashboard
# 2. Create new Droplet
# 3. Choose Ubuntu 22.04 LTS
# 4. Select $12/month plan (1GB RAM, 1 CPU)
# 5. Add SSH key
# 6. Create Droplet
```

### Step 2: Server Setup
```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment user
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
```

### Step 3: Deploy Application
```bash
# Switch to deploy user
su - deploy

# Clone repository
git clone https://github.com/your-username/pet-health-docs.git
cd pet-health-docs

# Create production environment
cp backend/env.example backend/.env.production
nano backend/.env.production  # Edit with your values

# Run deployment
chmod +x scripts/production-deploy.sh
./scripts/production-deploy.sh
```

### Step 4: Configure Domain & SSL
```bash
# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test SSL
curl https://your-domain.com
```

## ☁️ AWS Deployment

### Step 1: Create EC2 Instance
```bash
# 1. Go to AWS Console
# 2. Launch EC2 Instance
# 3. Choose Ubuntu Server 22.04 LTS
# 4. Select t3.micro (free tier) or t3.small
# 5. Configure Security Group:
#    - SSH (22): Your IP
#    - HTTP (80): 0.0.0.0/0
#    - HTTPS (443): 0.0.0.0/0
#    - Custom (5000): 0.0.0.0/0
# 6. Launch instance
```

### Step 2: Configure Security Group
```bash
# Add inbound rules:
# - Type: HTTP, Port: 80, Source: 0.0.0.0/0
# - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
# - Type: Custom TCP, Port: 5000, Source: 0.0.0.0/0
```

### Step 3: Deploy Application
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow same steps as DigitalOcean
# (Install Docker, Docker Compose, deploy app)
```

### Step 4: Configure Route 53 (Optional)
```bash
# 1. Go to Route 53
# 2. Create hosted zone
# 3. Add A record pointing to your EC2 IP
# 4. Update nameservers at your domain registrar
```

## 🔧 Google Cloud Platform

### Step 1: Create VM Instance
```bash
# 1. Go to GCP Console
# 2. Create VM Instance
# 3. Choose Ubuntu 22.04 LTS
# 4. Select e2-micro (free tier) or e2-small
# 5. Allow HTTP and HTTPS traffic
# 6. Create instance
```

### Step 2: Deploy Application
```bash
# Connect to VM
gcloud compute ssh your-instance-name --zone=your-zone

# Follow deployment steps
# (Same as DigitalOcean)
```

## 🔄 Automated Deployment with GitHub Actions

### Step 1: Create GitHub Secrets
```bash
# Go to GitHub Repository Settings > Secrets
# Add these secrets:
# - DROPLET_IP: Your server IP
# - DROPLET_USER: Your server username
# - SSH_PRIVATE_KEY: Your SSH private key
# - SUPABASE_URL: Your Supabase URL
# - SUPABASE_ANON_KEY: Your Supabase anon key
# - JWT_SECRET: Your JWT secret
```

### Step 2: Create GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.DROPLET_IP }}
        username: ${{ secrets.DROPLET_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd pet-health-docs
          git pull origin main
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml build --no-cache
          docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring Setup

### 1. **Uptime Monitoring**
```bash
# Use services like:
# - UptimeRobot (free)
# - Pingdom
# - StatusCake
```

### 2. **Error Tracking**
```bash
# Add to backend/.env.production:
SENTRY_DSN=your_sentry_dsn

# Install Sentry
npm install @sentry/node
```

### 3. **Log Management**
```bash
# Use services like:
# - Logtail
# - Papertrail
# - CloudWatch (AWS)
```

## 💰 Cost Estimation

### **DigitalOcean** (Recommended)
- **Droplet**: $12/month (1GB RAM, 1 CPU)
- **Spaces**: $5/month (250GB storage)
- **Total**: ~$17/month

### **AWS**
- **EC2 t3.micro**: Free tier (1 year)
- **S3**: $1-2/month
- **Route 53**: $0.50/month
- **Total**: ~$2-3/month (first year)

### **Google Cloud**
- **e2-micro**: Free tier (1 year)
- **Cloud Storage**: $1-2/month
- **Total**: ~$1-2/month (first year)

## 🛡️ Security Best Practices

### 1. **Server Security**
```bash
# Update system regularly
apt update && apt upgrade -y

# Configure firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Disable root login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart ssh
```

### 2. **Application Security**
```bash
# Use strong passwords
# Enable HTTPS only
# Configure CORS properly
# Set up rate limiting
# Regular security updates
```

### 3. **Database Security**
```bash
# Use Supabase RLS
# Regular backups
# Monitor access logs
# Use strong database passwords
```

## 🔄 Backup Strategy

### 1. **Automated Backups**
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend/uploads/

# Backup database (via Supabase dashboard)
# Keep last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/deploy/backup.sh
```

### 2. **Database Backups**
```bash
# Use Supabase dashboard:
# 1. Go to Settings > Database
# 2. Enable automated backups
# 3. Set retention period
```

## 📈 Scaling Options

### 1. **Vertical Scaling**
```bash
# Upgrade server resources:
# - More RAM
# - More CPU
# - More storage
```

### 2. **Horizontal Scaling**
```bash
# Use load balancer
# Multiple backend instances
# Database connection pooling
# CDN for static assets
```

## 🆘 Troubleshooting

### Common Issues:
1. **Services won't start**: Check logs, environment variables
2. **Database connection**: Check Supabase credentials
3. **File upload issues**: Check permissions, disk space
4. **SSL issues**: Check certificate, nginx config

### Support Resources:
- [DigitalOcean Community](https://www.digitalocean.com/community)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [GCP Documentation](https://cloud.google.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

**🎉 Your Pet Health Assistant is now ready for the cloud!**
