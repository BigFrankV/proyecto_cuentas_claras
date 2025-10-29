@echo off
REM ============================================================================
REM CI/CD Local - Script Batch para Windows
REM Facilita la ejecución del CI/CD local
REM ============================================================================

setlocal enabledelayedexpansion

REM Colores (usando caracteres especiales)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Verificar que Node.js esté instalado
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo %RED%ERROR: Node.js no está instalado%RESET%
    echo.
    echo Por favor instala Node.js desde https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Mostrar menu
:menu
cls
echo.
echo ============================================================================
echo   CI/CD Local - Cuentas Claras
echo ============================================================================
echo.
echo Opciones disponibles:
echo.
echo   1) Build COMPLETO (Frontend + Backend)
echo   2) Build FRONTEND solamente
echo   3) Build BACKEND solamente
echo   4) Modo WATCH (recompila en cambios)
echo   5) Limpiar outputs antiguos
echo   6) Ver últimos builds
echo   7) Configuración inicial
echo   0) Salir
echo.
set /p choice="Selecciona una opción (0-7): "

if "%choice%"=="1" goto build_complete
if "%choice%"=="2" goto build_front
if "%choice%"=="3" goto build_back
if "%choice%"=="4" goto build_watch
if "%choice%"=="5" goto cleanup
if "%choice%"=="6" goto view_builds
if "%choice%"=="7" goto setup
if "%choice%"=="0" goto end

echo.
echo %RED%Opción no válida%RESET%
echo.
timeout /t 2 /nobreak
goto menu

REM ============================================================================
REM Build Completo
REM ============================================================================
:build_complete
echo.
echo %BLUE%Iniciando build completo...%RESET%
echo.
call node ci-cd-local.js
if errorlevel 1 (
    echo.
    echo %RED%Build FALLÓ%RESET%
    pause
) else (
    echo.
    echo %GREEN%Build EXITOSO%RESET%
    echo.
    echo Los outputs están en: ci-cd-outputs\
    echo   - Frontend: ci-cd-outputs\front_ok\
    echo   - Backend:  ci-cd-outputs\back_ok\
    echo.
    pause
)
goto menu

REM ============================================================================
REM Build Frontend
REM ============================================================================
:build_front
echo.
echo %BLUE%Iniciando build frontend...%RESET%
echo.
call node ci-cd-local.js --front
if errorlevel 1 (
    echo.
    echo %RED%Build Frontend FALLÓ%RESET%
    pause
) else (
    echo.
    echo %GREEN%Build Frontend EXITOSO%RESET%
    echo.
    echo Output: ci-cd-outputs\front_ok\
    echo.
    pause
)
goto menu

REM ============================================================================
REM Build Backend
REM ============================================================================
:build_back
echo.
echo %BLUE%Iniciando build backend...%RESET%
echo.
call node ci-cd-local.js --back
if errorlevel 1 (
    echo.
    echo %RED%Build Backend FALLÓ%RESET%
    pause
) else (
    echo.
    echo %GREEN%Build Backend EXITOSO%RESET%
    echo.
    echo Output: ci-cd-outputs\back_ok\
    echo.
    pause
)
goto menu

REM ============================================================================
REM Watch Mode
REM ============================================================================
:build_watch
echo.
echo %YELLOW%Iniciando modo WATCH%RESET%
echo.
echo El CI/CD recompilará automáticamente cuando hagas cambios...
echo Presiona Ctrl+C para salir
echo.
timeout /t 3 /nobreak
call node ci-cd-local.js --watch
goto menu

REM ============================================================================
REM Limpiar Outputs Antiguos
REM ============================================================================
:cleanup
echo.
echo %YELLOW%Limpiando outputs antiguos (> 7 días)...%RESET%
echo.

REM Contar carpetas antes
for /d %%D in (ci-cd-outputs\front_ok\frontend_*) do (
    set /a count_front+=1
)
for /d %%D in (ci-cd-outputs\back_ok\backend_*) do (
    set /a count_back+=1
)

echo Frontend builds: !count_front!
echo Backend builds: !count_back!
echo.
set /p confirm="¿Deseas continuar con la limpieza? (S/N): "

if /i "%confirm%"=="S" (
    echo Limpiando...
    REM Eliminar carpetas antiguas
    for /d %%D in (ci-cd-outputs\front_ok\frontend_*) do (
        for /f %%A in ('powershell -Command "[Math]::Floor((New-TimeSpan -Start (Get-Item '%%D').CreationTime -End (Get-Date)).TotalDays)"') do (
            if %%A GTR 7 (
                echo   Eliminando: %%D
                rmdir /s /q "%%D" 2>nul
            )
        )
    )
    echo.
    echo %GREEN%Limpieza completada%RESET%
) else (
    echo Limpieza cancelada
)

echo.
pause
goto menu

REM ============================================================================
REM Ver Últimos Builds
REM ============================================================================
:view_builds
echo.
echo %BLUE%Últimos Builds%RESET%
echo.
echo --- FRONTEND ---
if exist "ci-cd-outputs\front_ok" (
    for /d %%D in (ci-cd-outputs\front_ok\frontend_*) do (
        echo   %%~nD
    )
) else (
    echo   (ninguno)
)

echo.
echo --- BACKEND ---
if exist "ci-cd-outputs\back_ok" (
    for /d %%D in (ci-cd-outputs\back_ok\backend_*) do (
        echo   %%~nD
    )
) else (
    echo   (ninguno)
)

echo.
echo --- SYMLINK LATEST ---
if exist "ci-cd-outputs\front_ok\latest" (
    echo   Frontend latest: !ci-cd-outputs\front_ok\latest!
)
if exist "ci-cd-outputs\back_ok\latest" (
    echo   Backend latest: !ci-cd-outputs\back_ok\latest!
)

echo.
pause
goto menu

REM ============================================================================
REM Setup Inicial
REM ============================================================================
:setup
cls
echo.
echo ============================================================================
echo   CONFIGURACIÓN INICIAL
echo ============================================================================
echo.
echo Se instalarán las dependencias necesarias para CI/CD local...
echo.
pause

echo.
echo %BLUE%Instalando chalk (para colores en logs)...%RESET%
call npm install --save-dev chalk
if errorlevel 1 (
    echo %RED%Error installing chalk%RESET%
    goto end
)

echo.
echo %BLUE%Instalando chokidar (para watch mode)...%RESET%
call npm install --save-dev chokidar
if errorlevel 1 (
    echo %RED%Error installing chokidar%RESET%
    goto end
)

echo.
echo %BLUE%Instalando dependencias backend...%RESET%
cd ccbackend
call npm install
cd ..

echo.
echo %BLUE%Instalando dependencias frontend...%RESET%
cd ccfrontend
call npm install
cd ..

echo.
echo %GREEN%✓ Configuración completada exitosamente%RESET%
echo.
echo Ahora puedes usar:
echo   - Opción 1: Build COMPLETO
echo   - Opción 4: Modo WATCH
echo.
pause
goto menu

REM ============================================================================
REM End
REM ============================================================================
:end
echo.
echo Saliendo...
exit /b 0
