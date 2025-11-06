@echo off
REM Docker Management Script for Cuentas Claras (Windows)
REM Usage: docker-manage.bat [command]

setlocal enabledelayedexpansion

REM Colors not supported in Windows CMD, using text only
REM Project name
set PROJECT_NAME=cuentas-claras
set COMPOSE_FILE_PROD=docker-compose.yml
set COMPOSE_FILE_DEV=docker-compose.dev.yml
set ENV_FILE_PROD=.env.docker
set ENV_FILE_DEV=.env.docker.dev

REM Get command
set "COMMAND=%1"
set "ARG1=%2"

if "%COMMAND%"=="" set "COMMAND=help"

if "%COMMAND%"=="dev" (
    call :start_dev
) else if "%COMMAND%"=="dev:down" (
    call :stop_dev
) else if "%COMMAND%"=="dev:logs" (
    call :dev_logs %ARG1%
) else if "%COMMAND%"=="prod" (
    call :start_prod
) else if "%COMMAND%"=="prod:down" (
    call :stop_prod
) else if "%COMMAND%"=="prod:logs" (
    call :prod_logs %ARG1%
) else if "%COMMAND%"=="build" (
    call :build_all
) else if "%COMMAND%"=="build:prod" (
    call :build_prod
) else if "%COMMAND%"=="build:dev" (
    call :build_dev
) else if "%COMMAND%"=="ps" (
    call :show_containers
) else if "%COMMAND%"=="exec:sh" (
    call :open_shell
) else if "%COMMAND%"=="clean" (
    call :cleanup
) else if "%COMMAND%"=="clean:all" (
    call :cleanup_all
) else if "%COMMAND%"=="status" (
    call :show_status
) else if "%COMMAND%"=="stats" (
    call :show_stats
) else if "%COMMAND%"=="health" (
    call :health_check
) else if "%COMMAND%"=="db:backup" (
    call :db_backup
) else if "%COMMAND%"=="db:restore" (
    call :db_restore %ARG1%
) else if "%COMMAND%"=="help" (
    call :show_help
) else (
    echo Unknown command: %COMMAND%
    echo.
    call :show_help
    exit /b 1
)

goto :eof

:show_help
echo Cuentas Claras Docker Management Script (Windows)
echo.
echo Usage: docker-manage.bat [command]
echo.
echo Commands:
echo   dev              Start development environment
echo   dev:down         Stop development environment
echo   dev:logs         Show development logs
echo   prod             Start production environment
echo   prod:down        Stop production environment
echo   prod:logs        Show production logs
echo   build            Build all containers
echo   build:prod       Build production containers
echo   build:dev        Build development containers
echo   ps               Show running containers
echo   exec:sh          Open shell in frontend container
echo   clean            Clean up containers and volumes
echo   clean:all        Clean all including images
echo   status           Show system status
echo   stats            Show container resource usage
echo   health           Check health of all services
echo   db:backup        Backup database
echo   db:restore       Restore database from backup
echo   help             Show this help message
exit /b 0

:start_dev
echo ================================
echo Starting Development Environment
echo ================================
if not exist "%ENV_FILE_DEV%" (
    echo Creating .env.docker.dev from template...
    copy .env.example %ENV_FILE_DEV% >nul 2>&1
)
docker-compose -f %COMPOSE_FILE_DEV% -p %PROJECT_NAME%-dev up -d
echo.
echo Development environment started
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo Database: localhost:5433
exit /b 0

:stop_dev
echo ================================
echo Stopping Development Environment
echo ================================
docker-compose -f %COMPOSE_FILE_DEV% -p %PROJECT_NAME%-dev down
echo Development environment stopped
exit /b 0

:dev_logs
if "%~1"=="" (
    set "SERVICE=frontend-dev"
) else (
    set "SERVICE=%~1"
)
docker-compose -f %COMPOSE_FILE_DEV% -p %PROJECT_NAME%-dev logs -f %SERVICE%
exit /b 0

:start_prod
echo ================================
echo Starting Production Environment
echo ================================
if not exist "%ENV_FILE_PROD%" (
    echo ERROR: .env.docker not found
    echo Please configure .env.docker before starting production
    exit /b 1
)
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% up -d
echo.
echo Production environment started
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
exit /b 0

:stop_prod
echo ================================
echo Stopping Production Environment
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% down
echo Production environment stopped
exit /b 0

:prod_logs
if "%~1"=="" (
    set "SERVICE=frontend"
) else (
    set "SERVICE=%~1"
)
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% logs -f %SERVICE%
exit /b 0

:build_all
echo ================================
echo Building All Containers
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% build
echo Build completed
exit /b 0

:build_prod
echo ================================
echo Building Production Containers
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% build --no-cache
echo Production build completed
exit /b 0

:build_dev
echo ================================
echo Building Development Containers
echo ================================
docker-compose -f %COMPOSE_FILE_DEV% -p %PROJECT_NAME%-dev build --no-cache
echo Development build completed
exit /b 0

:show_containers
echo ================================
echo Running Containers
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% ps
exit /b 0

:open_shell
echo ================================
echo Opening Shell in Frontend Container
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% exec frontend sh
exit /b 0

:cleanup
echo ================================
echo Cleaning Up Containers
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% down
docker-compose -f %COMPOSE_FILE_DEV% -p %PROJECT_NAME%-dev down
echo Cleanup completed
exit /b 0

:cleanup_all
echo ================================
echo Cleaning Up Everything
echo ================================
echo WARNING: This will remove containers, volumes, and images
echo Continue? (yes/no)
set /p response=
if /i "%response%"=="yes" (
    docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% down -v
    docker-compose -f %COMPOSE_FILE_DEV% -p %PROJECT_NAME%-dev down -v
    docker rmi cuentas-claras-frontend 2>nul
    echo Full cleanup completed
) else (
    echo Cleanup cancelled
)
exit /b 0

:show_status
echo ================================
echo System Status
echo ================================
echo.
echo Docker Version:
docker --version
echo.
echo Running Containers:
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.
exit /b 0

:show_stats
echo ================================
echo Container Resource Usage
echo ================================
docker stats --no-stream
exit /b 0

:health_check
echo ================================
echo Health Check
echo ================================
for %%S in (frontend backend db redis) do (
    for /f "tokens=*" %%C in ('docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% ps -q %%S 2^>nul') do (
        if "%%C"=="" (
            echo %%S: Not running
        ) else (
            for /f "tokens=*" %%H in ('docker inspect -f "{{.State.Health.Status}}" %%C 2^>nul') do (
                echo %%S: %%H
            )
        )
    )
)
exit /b 0

:db_backup
echo ================================
echo Backing Up Database
echo ================================
if not exist "backups" mkdir backups
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_FILE=backups\cuentas_claras_%mydate%_%mytime%.sql
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% exec -T db pg_dump -U user cuentas_claras > %BACKUP_FILE%
echo Database backed up to: %BACKUP_FILE%
exit /b 0

:db_restore
if "%~1"=="" (
    echo Usage: docker-manage.bat db:restore ^<backup_file^>
    exit /b 1
)
echo ================================
echo Restoring Database
echo ================================
docker-compose -f %COMPOSE_FILE_PROD% -p %PROJECT_NAME% exec -T db psql -U user cuentas_claras ^< "%~1"
echo Database restored from: %~1
exit /b 0
