# Script de instalación para el sistema de pasarelas de pago
# Sistema: Cuentas Claras - Payment Gateway Integration
# PowerShell version for Windows

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Instalación de Pasarelas de Pago" -ForegroundColor Cyan
Write-Host "   Sistema: Cuentas Claras" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Funciones para output con colores
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error "Este script debe ejecutarse desde el directorio del backend (ccbackend)"
    exit 1
}

Write-Info "Verificando directorio del proyecto..."
if (-not (Test-Path "src") -or -not (Test-Path "src/app.js")) {
    Write-Error "Estructura de proyecto no válida. Asegúrese de estar en el directorio ccbackend"
    exit 1
}

Write-Success "Directorio del proyecto verificado"

# 1. Instalar dependencias de Node.js
Write-Info "Instalando dependencias de Node.js..."
$npmResult = & npm install transbank-sdk axios node-cron 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencias instaladas correctamente"
} else {
    Write-Error "Error al instalar dependencias"
    Write-Host $npmResult
    exit 1
}

# 2. Verificar estructura de directorios
Write-Info "Verificando estructura de directorios..."

# Crear directorios si no existen
$directories = @("src\services", "src\middleware", "src\routes", "migrations", "logs")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Info "Directorio creado: $dir"
    }
}

Write-Success "Estructura de directorios verificada"

# 3. Verificar archivos del sistema de pagos
Write-Info "Verificando archivos del sistema de pagos..."

$requiredFiles = @(
    "src\services\paymentGatewayService.js",
    "src\middleware\paymentMiddleware.js",
    "src\routes\paymentGateway.js",
    "migrations\add_payment_gateways.sql",
    ".env.payment.example"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error "Archivos faltantes:"
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Warning "Ejecute primero la instalación de archivos desde el asistente"
    exit 1
}

Write-Success "Todos los archivos necesarios están presentes"

# 4. Configurar archivo de entorno
Write-Info "Configurando archivo de entorno..."

if (-not (Test-Path ".env")) {
    Write-Warning "Archivo .env no encontrado, creando desde template..."
    Copy-Item ".env.payment.example" ".env"
    Write-Success "Archivo .env creado desde template"
} else {
    Write-Info "Archivo .env existente, verificando configuraciones de pago..."
    
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch "WEBPAY_COMMERCE_CODE") {
        Write-Info "Agregando configuraciones de pago..."
        Add-Content ".env" ""
        Add-Content ".env" "# Configuraciones de Pasarelas de Pago"
        Get-Content ".env.payment.example" | Add-Content ".env"
        Write-Success "Configuraciones de pago agregadas a .env existente"
    } else {
        Write-Warning "Configuraciones de pago ya presentes en .env"
    }
}

# 5. Verificar configuración de base de datos
Write-Info "Verificando configuración de base de datos..."

$envContent = Get-Content ".env" -Raw -ErrorAction SilentlyContinue
if ($envContent -notmatch "DB_HOST") {
    Write-Warning "Configuración de base de datos no encontrada en .env"
    Write-Host "Agregue las siguientes variables a su archivo .env:"
    Write-Host "DB_HOST=localhost"
    Write-Host "DB_USER=root"
    Write-Host "DB_PASSWORD=password"
    Write-Host "DB_NAME=cuentas_claras"
}

# 6. Ejecutar migración de base de datos (opcional)
$response = Read-Host "¿Desea ejecutar la migración de base de datos ahora? (y/N)"
if ($response -match "^[Yy]$") {
    Write-Info "Ejecutando migración de base de datos..."
    
    # Verificar si mysql está disponible
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysqlPath) {
        # Leer configuración de .env
        if (Test-Path ".env") {
            $envVars = @{}
            Get-Content ".env" | ForEach-Object {
                if ($_ -match "^([^#][^=]+)=(.*)$") {
                    $envVars[$matches[1]] = $matches[2]
                }
            }
            
            $dbHost = $envVars["DB_HOST"] ?? "localhost"
            $dbUser = $envVars["DB_USER"] ?? "root"
            $dbPassword = $envVars["DB_PASSWORD"] ?? ""
            $dbName = $envVars["DB_NAME"] ?? "cuentas_claras"
            
            try {
                $sqlContent = Get-Content "migrations\add_payment_gateways.sql" -Raw
                & mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $sqlContent
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Migración de base de datos ejecutada correctamente"
                } else {
                    throw "Error en la ejecución de MySQL"
                }
            } catch {
                Write-Error "Error al ejecutar migración de base de datos"
                Write-Warning "Puede ejecutarla manualmente más tarde con:"
                Write-Host "mysql -u[usuario] -p[password] [database] < migrations\add_payment_gateways.sql"
            }
        } else {
            Write-Error "Archivo .env no encontrado para configuración de BD"
        }
    } else {
        Write-Warning "Cliente MySQL no encontrado. Ejecute la migración manualmente:"
        Write-Host "mysql -u[usuario] -p[password] [database] < migrations\add_payment_gateways.sql"
    }
} else {
    Write-Info "Migración omitida. Puede ejecutarla más tarde si es necesario."
}

# 7. Actualizar archivo principal de rutas
Write-Info "Actualizando configuración de rutas..."

if (Test-Path "src\app.js") {
    $appContent = Get-Content "src\app.js" -Raw
    if ($appContent -notmatch "paymentGateway") {
        Write-Info "Agregando rutas de payment gateway a app.js..."
        Write-Host "Agregue la siguiente línea a src\app.js en la sección de rutas:"
        Write-Host "app.use('/api/gateway', require('./routes/paymentGateway'));" -ForegroundColor Yellow
    } else {
        Write-Success "Rutas de payment gateway ya configuradas"
    }
} else {
    Write-Warning "Archivo src\app.js no encontrado"
}

# 8. Verificar dependencias del frontend
Write-Info "Verificando configuración del frontend..."

if (Test-Path "..\ccfrontend") {
    Push-Location "..\ccfrontend"
    
    if (Test-Path "package.json") {
        # Verificar si react-bootstrap está instalado
        $npmList = & npm list react-bootstrap 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "React Bootstrap está instalado en el frontend"
        } else {
            Write-Warning "React Bootstrap no está instalado en el frontend"
            Write-Host "Ejecute: npm install react-bootstrap bootstrap"
        }
    }
    
    Pop-Location
} else {
    Write-Warning "Directorio del frontend (ccfrontend) no encontrado"
}

# 9. Instrucciones finales
Write-Host ""
Write-Success "=================================================="
Write-Success "   INSTALACIÓN COMPLETADA"
Write-Success "=================================================="
Write-Host ""
Write-Info "Pasos siguientes:"
Write-Host ""
Write-Host "1. Configurar credenciales en .env:"
Write-Host "   - WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY (Transbank)"
Write-Host "   - KHIPU_RECEIVER_ID y KHIPU_SECRET (Khipu)"
Write-Host "   - MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_PUBLIC_KEY (MercadoPago)"
Write-Host ""
Write-Host "2. Verificar URLs de retorno en .env para su dominio"
Write-Host ""
Write-Host "3. Ejecutar migración de BD si no se hizo:"
Write-Host "   mysql -u[user] -p[pass] [db] < migrations\add_payment_gateways.sql"
Write-Host ""
Write-Host "4. Reiniciar el servidor del backend:"
Write-Host "   npm restart"
Write-Host ""
Write-Host "5. Verificar que las rutas de pago estén disponibles:"
Write-Host "   GET /api/gateway/available"
Write-Host ""
Write-Warning "IMPORTANTE: Para producción, cambiar variables de ambiente a 'production'"
Write-Warning "y usar credenciales reales de cada pasarela de pago"
Write-Host ""
Write-Info "Para soporte, revisar documentación en:"
Write-Host "- Transbank: https://www.transbankdevelopers.cl/"
Write-Host "- Khipu: https://khipu.com/page/api-doc"
Write-Host "- MercadoPago: https://www.mercadopago.cl/developers"

# Pausa para que el usuario pueda leer las instrucciones
Write-Host ""
Write-Host "Presione cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")