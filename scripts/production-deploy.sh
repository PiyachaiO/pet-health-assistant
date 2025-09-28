#!/bin/bash

# Pet Health Assistant - Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting Pet Health Assistant Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if production environment file exists
if [ ! -f "backend/.env.production" ]; then
    print_warning "Production environment file not found"
    print_status "Creating production environment template..."
    
    cat > backend/.env.production << EOF
# Production Environment Variables for Pet Health Assistant
# Update these values with your production configuration

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Supabase Configuration (Production)
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_strong_production_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=warn
LOG_FILE=/app/logs/app.log

# Security
ENABLE_SWAGGER=false
ENABLE_LOGGING=true
ENABLE_CORS=true
EOF
    
    print_warning "Please update backend/.env.production with your production values before continuing"
    print_status "Edit the file and run this script again"
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p nginx/ssl
mkdir -p backups

print_success "Directories created"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Build images
print_status "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check backend health
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
    print_status "Backend logs:"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_error "Frontend health check failed"
    print_status "Frontend logs:"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Show deployment status
print_status "Deployment Status:"
docker-compose -f docker-compose.prod.yml ps

print_success "🎉 Production deployment completed successfully!"
print_status "Your Pet Health Assistant is now running at:"
print_status "  - Frontend: http://localhost"
print_status "  - Backend API: http://localhost:5000"
print_status "  - Health Check: http://localhost:5000/api/health"

print_status "Useful commands:"
print_status "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "  - Stop services: docker-compose -f docker-compose.prod.yml down"
print_status "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
print_status "  - Update services: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"

print_warning "Don't forget to:"
print_warning "  1. Configure your domain and SSL certificates"
print_warning "  2. Set up monitoring and logging"
print_warning "  3. Configure backup strategies"
print_warning "  4. Update firewall rules if needed"
