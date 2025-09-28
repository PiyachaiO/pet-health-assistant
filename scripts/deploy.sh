#!/bin/bash

# =====================================================
# Pet Health Assistant Deployment Script
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="pet-health-assistant"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
    fi
    log "Docker is running ✓"
}

# Backup current deployment
backup() {
    log "Creating backup..."
    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
    mkdir -p $BACKUP_DIR
    
    if [ -d "./uploads" ]; then
        cp -r ./uploads $BACKUP_DIR/$BACKUP_NAME/
    fi
    
    if [ -d "./logs" ]; then
        cp -r ./logs $BACKUP_DIR/$BACKUP_NAME/
    fi
    
    log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build new images
    log "Building new images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
        error "Some services are unhealthy. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    fi
    
    log "Deployment completed successfully! ✓"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    docker-compose -f docker-compose.prod.yml down
    # Add rollback logic here
    log "Rollback completed"
}

# Main execution
main() {
    log "Starting deployment process..."
    
    check_docker
    backup
    deploy
    
    log "Deployment completed successfully!"
    log "Services are running at:"
    log "- Frontend: http://localhost"
    log "- Backend: http://localhost:5000"
    log "- API Health: http://localhost:5000/api/health"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "backup")
        backup
        ;;
    *)
        main
        ;;
esac
