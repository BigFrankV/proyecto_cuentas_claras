#!/bin/bash

# Script de instalación para el sistema de pasarelas de pago
# Sistema: Cuentas Claras - Payment Gateway Integration

echo "=================================================="
echo "   Instalación de Pasarelas de Pago"
echo "   Sistema: Cuentas Claras"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_info() {
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

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio del backend (ccbackend)"
    exit 1
fi

print_info "Verificando directorio del proyecto..."
if [ ! -d "src" ] || [ ! -f "src/app.js" ]; then
    print_error "Estructura de proyecto no válida. Asegúrese de estar en el directorio ccbackend"
    exit 1
fi

print_success "Directorio del proyecto verificado"

# 1. Instalar dependencias de Node.js
print_info "Instalando dependencias de Node.js..."
npm install transbank-sdk axios node-cron

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

# 2. Verificar estructura de directorios
print_info "Verificando estructura de directorios..."

# Crear directorios si no existen
mkdir -p src/services
mkdir -p src/middleware
mkdir -p src/routes
mkdir -p migrations
mkdir -p logs

print_success "Estructura de directorios verificada"

# 3. Verificar archivos del sistema de pagos
print_info "Verificando archivos del sistema de pagos..."

required_files=(
    "src/services/paymentGatewayService.js"
    "src/middleware/paymentMiddleware.js"
    "src/routes/paymentGateway.js"
    "migrations/add_payment_gateways.sql"
    ".env.payment.example"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Archivos faltantes:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    print_warning "Ejecute primero la instalación de archivos desde el asistente"
    exit 1
fi

print_success "Todos los archivos necesarios están presentes"

# 4. Configurar archivo de entorno
print_info "Configurando archivo de entorno..."

if [ ! -f ".env" ]; then
    print_warning "Archivo .env no encontrado, creando desde template..."
    cp .env.payment.example .env
    print_success "Archivo .env creado desde template"
else
    print_info "Archivo .env existente, agregando configuraciones de pago..."
    
    # Verificar si ya tiene configuraciones de pago
    if ! grep -q "WEBPAY_COMMERCE_CODE" .env; then
        echo "" >> .env
        echo "# Configuraciones de Pasarelas de Pago" >> .env
        cat .env.payment.example >> .env
        print_success "Configuraciones de pago agregadas a .env existente"
    else
        print_warning "Configuraciones de pago ya presentes en .env"
    fi
fi

# 5. Verificar configuración de base de datos
print_info "Verificando configuración de base de datos..."

if ! grep -q "DB_HOST" .env; then
    print_warning "Configuración de base de datos no encontrada en .env"
    echo "Agregue las siguientes variables a su archivo .env:"
    echo "DB_HOST=localhost"
    echo "DB_USER=root"
    echo "DB_PASSWORD=password"
    echo "DB_NAME=cuentas_claras"
fi

# 6. Ejecutar migración de base de datos (opcional)
read -p "¿Desea ejecutar la migración de base de datos ahora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Ejecutando migración de base de datos..."
    
    # Verificar si mysql está disponible
    if command -v mysql &> /dev/null; then
        # Leer configuración de .env
        if [ -f ".env" ]; then
            export $(cat .env | grep -v '^#' | xargs)
            
            mysql -h"${DB_HOST:-localhost}" -u"${DB_USER:-root}" -p"${DB_PASSWORD}" "${DB_NAME:-cuentas_claras}" < migrations/add_payment_gateways.sql
            
            if [ $? -eq 0 ]; then
                print_success "Migración de base de datos ejecutada correctamente"
            else
                print_error "Error al ejecutar migración de base de datos"
                print_warning "Puede ejecutarla manualmente más tarde con:"
                echo "mysql -u[usuario] -p[password] [database] < migrations/add_payment_gateways.sql"
            fi
        else
            print_error "Archivo .env no encontrado para configuración de BD"
        fi
    else
        print_warning "Cliente MySQL no encontrado. Ejecute la migración manualmente:"
        echo "mysql -u[usuario] -p[password] [database] < migrations/add_payment_gateways.sql"
    fi
else
    print_info "Migración omitida. Puede ejecutarla más tarde si es necesario."
fi

# 7. Actualizar archivo principal de rutas
print_info "Actualizando configuración de rutas..."

# Verificar si app.js existe y tiene la estructura esperada
if [ -f "src/app.js" ]; then
    # Verificar si ya incluye las rutas de payment gateway
    if ! grep -q "paymentGateway" src/app.js; then
        print_info "Agregando rutas de payment gateway a app.js..."
        echo "Agregue la siguiente línea a src/app.js en la sección de rutas:"
        echo "app.use('/api/gateway', require('./routes/paymentGateway'));"
    else
        print_success "Rutas de payment gateway ya configuradas"
    fi
else
    print_warning "Archivo src/app.js no encontrado"
fi

# 8. Verificar dependencias del frontend
print_info "Verificando configuración del frontend..."

if [ -d "../ccfrontend" ]; then
    cd ../ccfrontend
    
    if [ -f "package.json" ]; then
        # Verificar si react-bootstrap está instalado
        if npm list react-bootstrap &> /dev/null; then
            print_success "React Bootstrap está instalado en el frontend"
        else
            print_warning "React Bootstrap no está instalado en el frontend"
            echo "Ejecute: npm install react-bootstrap bootstrap"
        fi
    fi
    
    cd ../ccbackend
else
    print_warning "Directorio del frontend (ccfrontend) no encontrado"
fi

# 9. Instrucciones finales
echo ""
print_success "=================================================="
print_success "   INSTALACIÓN COMPLETADA"
print_success "=================================================="
echo ""
print_info "Pasos siguientes:"
echo ""
echo "1. Configurar credenciales en .env:"
echo "   - WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY (Transbank)"
echo "   - KHIPU_RECEIVER_ID y KHIPU_SECRET (Khipu)"
echo "   - MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_PUBLIC_KEY (MercadoPago)"
echo ""
echo "2. Verificar URLs de retorno en .env para su dominio"
echo ""
echo "3. Ejecutar migración de BD si no se hizo:"
echo "   mysql -u[user] -p[pass] [db] < migrations/add_payment_gateways.sql"
echo ""
echo "4. Reiniciar el servidor del backend:"
echo "   npm restart"
echo ""
echo "5. Verificar que las rutas de pago estén disponibles:"
echo "   GET /api/gateway/available"
echo ""
print_warning "IMPORTANTE: Para producción, cambiar variables de ambiente a 'production'"
print_warning "y usar credenciales reales de cada pasarela de pago"
echo ""
print_info "Para soporte, revisar documentación en:"
echo "- Transbank: https://www.transbankdevelopers.cl/"
echo "- Khipu: https://khipu.com/page/api-doc"
echo "- MercadoPago: https://www.mercadopago.cl/developers"

exit 0