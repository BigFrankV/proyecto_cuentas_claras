# ================================================================
# Script para resetear la base de datos de Cuentas Claras
# ================================================================
# Este script elimina el volumen de Docker y reinicia los servicios
# La base de datos se cargará automáticamente desde:
# ccbackend/base/BBDD+pob_datos/01_cuentasclaras.sql
# ================================================================

Write-Host ""
Write-Host "========================================"
Write-Host " RESET BASE DE DATOS - CUENTAS CLARAS"
Write-Host "========================================"
Write-Host ""
Write-Host "ATENCIÓN: Esto borrará TODOS los datos locales de la BD" -ForegroundColor Yellow
Write-Host "La BD se recargará desde: ccbackend\base\BBDD+pob_datos\01_cuentasclaras.sql"
Write-Host ""

$confirmar = Read-Host "¿Estás seguro? (S/N)"

if ($confirmar -ne "S" -and $confirmar -ne "s") {
    Write-Host ""
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "[1/4] Deteniendo contenedores..." -ForegroundColor Cyan
docker-compose down

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron detener los contenedores" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Eliminando volumen de base de datos..." -ForegroundColor Cyan
docker volume rm proyecto_cuentas_claras_db_data

if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: El volumen podría no existir o ya estaba eliminado" -ForegroundColor Yellow
}

Write-Host "[3/4] Iniciando servicios..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron iniciar los contenedores" -ForegroundColor Red
    exit 1
}

Write-Host "[4/4] Esperando inicialización de la BD..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================"
Write-Host " COMPLETADO" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "La base de datos se está inicializando automáticamente."
Write-Host ""
Write-Host "Para verificar el progreso:"
Write-Host "  docker logs cuentasclaras_db" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para conectarse a la BD:"
Write-Host "  docker exec -it cuentasclaras_db mysql -uapi_admin -papipassword cuentasclaras" -ForegroundColor Cyan
Write-Host ""
Write-Host "phpMyAdmin disponible en: http://localhost:8080" -ForegroundColor Green
Write-Host "API disponible en: http://localhost:3000" -ForegroundColor Green
Write-Host ""
