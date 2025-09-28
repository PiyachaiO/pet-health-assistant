#!/bin/bash

# Pet Health Assistant - Vercel + Render Deployment Script
# This script helps you deploy to Vercel (Frontend) + Render (Backend)

set -e  # Exit on any error

echo "🚀 Pet Health Assistant - Vercel + Render Deployment"
echo "=================================================="

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

print_status "Starting Vercel + Render deployment process..."

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_success "Project structure check passed"

# Create environment files if they don't exist
print_status "Setting up environment files..."

# Frontend environment
if [ ! -f "frontend/.env.production" ]; then
    print_status "Creating frontend/.env.production..."
    cat > frontend/.env.production << EOF
# Production Environment Variables for Frontend
REACT_APP_API_URL=https://pet-health-backend.onrender.com
REACT_APP_ENV=production
EOF
    print_success "Frontend environment file created"
else
    print_warning "Frontend environment file already exists"
fi

# Backend environment
if [ ! -f "backend/.env.production" ]; then
    print_status "Creating backend/.env.production template..."
    cat > backend/.env.production << EOF
# Production Environment Variables for Backend
NODE_ENV=production
PORT=10000

# Supabase Configuration (Production)
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_strong_production_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://pet-health-assistant.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=warn
LOG_FILE=/tmp/app.log

# Security
ENABLE_SWAGGER=false
ENABLE_LOGGING=true
ENABLE_CORS=true
EOF
    print_success "Backend environment file created"
    print_warning "Please update backend/.env.production with your production values"
else
    print_warning "Backend environment file already exists"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI already installed"
fi

# Display deployment instructions
echo ""
echo "🎯 Deployment Instructions:"
echo "=========================="
echo ""
echo "📋 Step 1: Deploy Backend to Render"
echo "-----------------------------------"
echo "1. Go to https://render.com"
echo "2. Create a new account"
echo "3. Connect your GitHub repository"
echo "4. Click 'New Web Service'"
echo "5. Select your repository and set:"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Environment: Node"
echo "6. Add environment variables from backend/.env.production"
echo "7. Click 'Create Web Service'"
echo ""
echo "📋 Step 2: Deploy Frontend to Vercel"
echo "------------------------------------"
echo "1. Go to https://vercel.com"
echo "2. Create a new account"
echo "3. Connect your GitHub repository"
echo "4. Click 'Import Project'"
echo "5. Set:"
echo "   - Framework Preset: Create React App"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: build"
echo "6. Add environment variables:"
echo "   - REACT_APP_API_URL: https://your-render-app.onrender.com"
echo "7. Click 'Deploy'"
echo ""
echo "📋 Step 3: Update Configuration"
echo "------------------------------"
echo "1. After Render deployment, update vercel.json with your Render URL"
echo "2. Update frontend/.env.production with your Render URL"
echo "3. Redeploy Vercel if needed"
echo ""

# Ask if user wants to proceed with Vercel deployment
read -p "Do you want to proceed with Vercel deployment now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting Vercel deployment..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_status "Please log in to Vercel..."
        vercel login
    fi
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    cd frontend
    vercel --prod
    cd ..
    
    print_success "Vercel deployment completed!"
    print_status "Your frontend is now deployed to Vercel"
else
    print_status "Skipping Vercel deployment. You can deploy manually later."
fi

echo ""
echo "🎉 Deployment Setup Complete!"
echo "============================"
echo ""
echo "📊 Next Steps:"
echo "1. Deploy backend to Render (follow instructions above)"
echo "2. Update configuration files with your Render URL"
echo "3. Test your application"
echo "4. Set up monitoring (optional)"
echo ""
echo "📚 Documentation:"
echo "- Vercel: https://vercel.com/docs"
echo "- Render: https://render.com/docs"
echo "- This project: DEPLOYMENT_VERCEL_RENDER.md"
echo ""
echo "🆘 Need Help?"
echo "- Check the logs in Vercel/Render dashboards"
echo "- Verify environment variables"
echo "- Test API endpoints manually"
echo ""
print_success "Happy deploying! 🚀"
