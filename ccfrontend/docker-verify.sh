#!/bin/bash
# Docker Setup Verification Script
# Verifica que la configuración de Docker está completa y correcta

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

check_file() {
    local file=$1
    local desc=$2
    TOTAL=$((TOTAL + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $desc - NOT FOUND: $file"
        FAILED=$((FAILED + 1))
    fi
}

check_command() {
    local cmd=$1
    local desc=$2
    TOTAL=$((TOTAL + 1))
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n1)
        echo -e "${GREEN}✓${NC} $desc - $version"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $desc - NOT INSTALLED"
        FAILED=$((FAILED + 1))
    fi
}

check_port() {
    local port=$1
    local desc=$2
    TOTAL=$((TOTAL + 1))
    
    if ! nc -z localhost "$port" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $desc - Port $port available"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠${NC} $desc - Port $port in use"
        FAILED=$((FAILED + 1))
    fi
}

check_env_var() {
    local var=$1
    local file=$2
    local desc=$3
    TOTAL=$((TOTAL + 1))
    
    if [ -f "$file" ] && grep -q "^$var=" "$file"; then
        echo -e "${GREEN}✓${NC} $desc"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠${NC} $desc - Variable not found in $file"
        FAILED=$((FAILED + 1))
    fi
}

# Start
print_header "Docker Setup Verification - Cuentas Claras"

# 1. Check Prerequisites
print_header "1️⃣  PREREQUISITES"

check_command "docker" "Docker CLI"
check_command "docker-compose" "Docker Compose"
check_command "git" "Git"

# 2. Check Docker Files
print_header "2️⃣  DOCKER FILES"

check_file "Dockerfile" "Production Dockerfile"
check_file "Dockerfile.dev" "Development Dockerfile"
check_file "docker-compose.yml" "Production Compose"
check_file "docker-compose.dev.yml" "Development Compose"
check_file ".dockerignore" ".dockerignore"

# 3. Check Configuration Files
print_header "3️⃣  CONFIGURATION FILES"

check_file ".env.example" "Environment template"
check_file ".env.production" "Production env"
check_file ".env.development" "Development env"
check_file ".env.docker" "Docker compose env (prod)"
check_file ".env.docker.dev" "Docker compose env (dev)"

# 4. Check Management Scripts
print_header "4️⃣  MANAGEMENT SCRIPTS"

check_file "docker-manage.sh" "Linux/macOS script"
check_file "docker-manage.bat" "Windows script"
check_file "nginx.conf" "Nginx configuration"

# 5. Check Documentation
print_header "5️⃣  DOCUMENTATION"

check_file "DOCKER_README.md" "Main documentation"
check_file "DOCKER_SETUP.md" "Detailed setup"
check_file "DOCKER_QUICKSTART.md" "Quick start guide"
check_file "DOCKER_WINDOWS.md" "Windows guide"
check_file "CONFIGURATION_COMPLETE.md" "Configuration summary"

# 6. Check Source Files
print_header "6️⃣  SOURCE FILES"

check_file "package.json" "Package.json"
check_file "next.config.js" "Next.js config"
check_file "tsconfig.json" "TypeScript config"

# 7. Check Docker Daemon
print_header "7️⃣  DOCKER DAEMON"

TOTAL=$((TOTAL + 1))
if docker ps &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker daemon running"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} Docker daemon not running"
    FAILED=$((FAILED + 1))
fi

# 8. Check Docker Images
print_header "8️⃣  DOCKER IMAGES"

TOTAL=$((TOTAL + 1))
if docker images | grep -q "node"; then
    echo -e "${GREEN}✓${NC} Node.js image available"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Node.js image not found (will be pulled on build)"
    FAILED=$((FAILED + 1))
fi

TOTAL=$((TOTAL + 1))
if docker images | grep -q "postgres"; then
    echo -e "${GREEN}✓${NC} PostgreSQL image available"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL image not found (will be pulled on build)"
    FAILED=$((FAILED + 1))
fi

TOTAL=$((TOTAL + 1))
if docker images | grep -q "redis"; then
    echo -e "${GREEN}✓${NC} Redis image available"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Redis image not found (will be pulled on build)"
    FAILED=$((FAILED + 1))
fi

# 9. Check Available Ports
print_header "9️⃣  AVAILABLE PORTS"

check_port 5173 "Frontend port"
check_port 8000 "Backend port"
check_port 5432 "Database port"
check_port 6379 "Redis port"

# 10. Check Environment Variables
print_header "🔟 ENVIRONMENT VARIABLES"

check_env_var "API_BASE_URL" ".env.docker" "API_BASE_URL in .env.docker"
check_env_var "NODE_ENV" ".env.production" "NODE_ENV in .env.production"
check_env_var "DB_NAME" ".env.docker" "DB_NAME in .env.docker"

# 11. Check Git
print_header "1️⃣1️⃣  GIT REPOSITORY"

TOTAL=$((TOTAL + 1))
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    PASSED=$((PASSED + 1))
    
    TOTAL=$((TOTAL + 1))
    git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    echo -e "${GREEN}✓${NC} Current branch: $git_branch"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Not a git repository"
    FAILED=$((FAILED + 1))
fi

# 12. Quick Build Test
print_header "1️⃣2️⃣  BUILD TEST (Optional)"

echo -e "${YELLOW}ℹ${NC} To test Docker build, run:"
echo "  docker build -t cuentas-claras-frontend:test ."
echo ""

# Summary
print_header "VERIFICATION SUMMARY"

echo -e "Total checks: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Issues: ${YELLOW}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your Docker configuration is ready to use."
    echo ""
    echo "Next steps:"
    echo "  1. Review .env.docker and .env.docker.dev"
    echo "  2. Run: docker-manage.sh dev"
    echo "  3. Access: http://localhost:5173"
    exit 0
else
    echo -e "${RED}✗ Some issues found${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    exit 1
fi
