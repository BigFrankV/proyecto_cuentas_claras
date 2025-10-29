@echo off
setlocal enabledelayedexpansion

REM Verificar Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no encontrado. Instala desde https://nodejs.org
    pause
    exit /b 1
)

REM Menu
:menu
cls
echo.
echo ============================================================================
echo   CI/CD Local - Cuentas Claras
echo ============================================================================
echo.
echo 1) Build COMPLETO (Frontend + Backend)
echo 2) Build FRONTEND solamente
echo 3) Build BACKEND solamente
echo 4) Modo WATCH (recompila en cambios)
echo 0) Salir
echo.
set /p choice="Selecciona una opcion (0-4): "

if "%choice%"=="1" (
    echo.
    echo Iniciando build completo...
    echo.
    node ci-cd-local.js
    pause
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Iniciando build frontend...
    echo.
    node ci-cd-local.js --front
    pause
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo Iniciando build backend...
    echo.
    node ci-cd-local.js --back
    pause
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Iniciando modo WATCH (Presiona Ctrl+C para salir)
    echo.
    timeout /t 2 /nobreak
    node ci-cd-local.js --watch
    goto menu
)

if "%choice%"=="0" (
    echo Saliendo...
    exit /b 0
)

echo Opcion no valida
timeout /t 2 /nobreak
goto menu
