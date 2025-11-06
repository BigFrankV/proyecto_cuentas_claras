#!/bin/bash
# Docker Management Script for Cuentas Claras
# Usage: ./docker-manage.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project name
PROJECT_NAME="cuentas-claras"
COMPOSE_FILE_PROD="docker-compose.yml"
COMPOSE_FILE_DEV="docker-compose.dev.yml"
ENV_FILE_PROD=".env.docker"
ENV_FILE_DEV=".env.docker.dev"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Help
show_help() {
    echo "Cuentas Claras Docker Management Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development environment"
    echo "  dev:down         Stop development environment"
    echo "  dev:logs         Show development logs"
    echo "  prod             Start production environment"
    echo "  prod:down        Stop production environment"
    echo "  prod:logs        Show production logs"
    echo "  build            Build all containers"
    echo "  build:prod       Build production containers"
    echo "  build:dev        Build development containers"
    echo "  rebuild          Rebuild all containers without cache"
    echo "  ps               Show running containers"
    echo "  exec:sh          Open shell in frontend container"
    echo "  clean            Clean up containers and volumes"
    echo "  clean:all        Clean all including images (WARNING: will delete images)"
    echo "  status           Show system status"
    echo "  stats            Show container resource usage"
    echo "  health           Check health of all services"
    echo "  db:backup        Backup database"
    echo "  db:restore       Restore database from backup"
    echo "  help             Show this help message"
}

# Dev environment
start_dev() {
    print_header "Starting Development Environment"
    
    if [ ! -f "$ENV_FILE_DEV" ]; then
        print_warning "Creating .env.docker.dev from template..."
        cp ".env.example" "$ENV_FILE_DEV" 2>/dev/null || true
    fi
    
    docker-compose -f "$COMPOSE_FILE_DEV" -p "${PROJECT_NAME}-dev" up -d
    print_success "Development environment started"
    show_dev_info
}

stop_dev() {
    print_header "Stopping Development Environment"
    docker-compose -f "$COMPOSE_FILE_DEV" -p "${PROJECT_NAME}-dev" down
    print_success "Development environment stopped"
}

dev_logs() {
    docker-compose -f "$COMPOSE_FILE_DEV" -p "${PROJECT_NAME}-dev" logs -f "${1:-frontend-dev}"
}

# Prod environment
start_prod() {
    print_header "Starting Production Environment"
    
    if [ ! -f "$ENV_FILE_PROD" ]; then
        print_error ".env.docker not found"
        print_warning "Creating .env.docker from template..."
        cp ".env.example" "$ENV_FILE_PROD" 2>/dev/null || true
        print_error "Please configure .env.docker before starting production"
        return 1
    fi
    
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" up -d
    print_success "Production environment started"
    show_prod_info
}

stop_prod() {
    print_header "Stopping Production Environment"
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" down
    print_success "Production environment stopped"
}

prod_logs() {
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" logs -f "${1:-frontend}"
}

# Build
build_all() {
    print_header "Building All Containers"
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" build
    print_success "Build completed"
}

build_prod() {
    print_header "Building Production Containers"
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" build --no-cache
    print_success "Production build completed"
}

build_dev() {
    print_header "Building Development Containers"
    docker-compose -f "$COMPOSE_FILE_DEV" -p "${PROJECT_NAME}-dev" build --no-cache
    print_success "Development build completed"
}

# Container management
show_containers() {
    print_header "Running Containers"
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" ps
}

open_shell() {
    print_header "Opening Shell in Frontend Container"
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" exec frontend sh
}

# Cleanup
cleanup() {
    print_header "Cleaning Up Containers"
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" down
    docker-compose -f "$COMPOSE_FILE_DEV" -p "${PROJECT_NAME}-dev" down
    print_success "Cleanup completed"
}

cleanup_all() {
    print_header "Cleaning Up Everything"
    print_warning "This will remove containers, volumes, and images. Continue? (yes/no)"
    read -r response
    
    if [ "$response" != "yes" ]; then
        print_warning "Cleanup cancelled"
        return
    fi
    
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" down -v
    docker-compose -f "$COMPOSE_FILE_DEV" -p "${PROJECT_NAME}-dev" down -v
    docker rmi "cuentas-claras-frontend" || true
    print_success "Full cleanup completed"
}

# Status
show_status() {
    print_header "System Status"
    echo ""
    
    echo "Docker Version:"
    docker --version
    echo ""
    
    echo "Running Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    echo ""
    
    echo "Network Status:"
    docker network ls | grep cuentas-claras || echo "No networks found"
}

# Stats
show_stats() {
    print_header "Container Resource Usage"
    docker stats --no-stream
}

# Health check
health_check() {
    print_header "Health Check"
    
    services=("frontend" "backend" "db" "redis")
    
    for service in "${services[@]}"; do
        container=$(docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" ps -q "$service" 2>/dev/null || echo "")
        
        if [ -z "$container" ]; then
            print_warning "$service: Not running"
        else
            health=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo "No health check")
            if [ "$health" = "healthy" ]; then
                print_success "$service: Healthy"
            else
                print_warning "$service: $health"
            fi
        fi
    done
}

# Database backup
db_backup() {
    print_header "Backing Up Database"
    
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/cuentas_claras_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" exec db \
        pg_dump -U "${DB_USER:-user}" "${DB_NAME:-cuentas_claras}" > "$BACKUP_FILE"
    
    print_success "Database backed up to: $BACKUP_FILE"
}

# Database restore
db_restore() {
    print_header "Restoring Database"
    
    if [ -z "$1" ]; then
        print_error "Usage: $0 db:restore <backup_file>"
        return 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        return 1
    fi
    
    docker-compose -f "$COMPOSE_FILE_PROD" -p "$PROJECT_NAME" exec -T db \
        psql -U "${DB_USER:-user}" "${DB_NAME:-cuentas_claras}" < "$1"
    
    print_success "Database restored from: $1"
}

# Info displays
show_dev_info() {
    echo ""
    print_header "Development Environment URLs"
    echo "Frontend: http://localhost:5173"
    echo "Backend: http://localhost:8000"
    echo "Database: localhost:5433"
    echo "  User: dev_user"
    echo "  Password: dev_password"
    echo "Redis: localhost:6380"
    echo ""
    echo "View logs: $0 dev:logs"
    echo "Stop: $0 dev:down"
}

show_prod_info() {
    echo ""
    print_header "Production Environment URLs"
    echo "Frontend: http://localhost:5173"
    echo "Backend: http://localhost:8000"
    echo "Database: localhost:5432"
    echo "Redis: localhost:6379"
    echo ""
    echo "View logs: $0 prod:logs"
    echo "Stop: $0 prod:down"
}

# Main command handler
case "${1:-help}" in
    dev)
        start_dev
        ;;
    dev:down)
        stop_dev
        ;;
    dev:logs)
        dev_logs "${2:-frontend-dev}"
        ;;
    prod)
        start_prod
        ;;
    prod:down)
        stop_prod
        ;;
    prod:logs)
        prod_logs "${2:-frontend}"
        ;;
    build)
        build_all
        ;;
    build:prod)
        build_prod
        ;;
    build:dev)
        build_dev
        ;;
    rebuild)
        docker-compose -f "$COMPOSE_FILE_PROD" build --no-cache
        docker-compose -f "$COMPOSE_FILE_DEV" build --no-cache
        print_success "Rebuild completed"
        ;;
    ps)
        show_containers
        ;;
    exec:sh)
        open_shell
        ;;
    clean)
        cleanup
        ;;
    clean:all)
        cleanup_all
        ;;
    status)
        show_status
        ;;
    stats)
        show_stats
        ;;
    health)
        health_check
        ;;
    db:backup)
        db_backup
        ;;
    db:restore)
        db_restore "${2}"
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
