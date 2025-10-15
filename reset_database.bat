@echo off
REM ================================================================
REM Script para resetear la base de datos de Cuentas Claras
REM ================================================================
REM Este script elimina el volumen de Docker y reinicia los servicios
REM La base de datos se cargara automaticamente desde:
REM ccbackend/base/BBDD+pob_datos/01_cuentasclaras.sql
REM ================================================================

echo.
echo ========================================
echo  RESET BASE DE DATOS - CUENTAS CLARAS
echo ========================================
echo.
echo ATENCION: Esto borrara TODOS los datos locales de la BD
echo La BD se recargara desde: ccbackend\base\BBDD+pob_datos\01_cuentasclaras.sql
echo.
set /p confirmar="¿Estas seguro? (S/N): "

if /i "%confirmar%" NEQ "S" (
    echo.
    echo Operacion cancelada.
    pause
    exit /b
)

echo.
echo [1/4] Deteniendo contenedores y eliminando imagenes/volumenes...
docker-compose down --volumes --rmi all

if %errorlevel% neq 0 (
    echo ERROR: No se pudieron detener los contenedores
    pause
    exit /b 1
)

echo [2/3] Iniciando servicios...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ERROR: No se pudieron iniciar los contenedores
    pause
    exit /b 1
)

echo [3/3] Esperando inicializacion de la BD...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo  COMPLETADO
echo ========================================
echo.
echo La base de datos se esta inicializando automaticamente.
echo.
echo Para verificar el progreso:
echo   docker logs cuentasclaras_db
echo.
echo Para conectarse a la BD:
echo   docker exec -it cuentasclaras_db mysql -uapi_admin -papipassword cuentasclaras
echo.
echo phpMyAdmin disponible en: http://localhost:8080
echo API disponible en: http://localhost:3000
echo Frontend disponible en: http://localhost:5173
echo.

pause
