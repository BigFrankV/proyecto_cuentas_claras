@echo off
setlocal enabledelayedexpansion

REM Interactive Docker menu for Windows CMD
REM Usage: scripts\docker_menu.bat

:: Try to load environment from .env if present (simple parser)
if exist .env (
  for /f "usebackq tokens=1* delims==" %%A in (`type .env ^| findstr /R "^[A-Z_][A-Z0-9_]*="`) do (
    if not defined %%A set %%A=%%B
  )
)

n:menu
cls
echo ================== Docker helper - Cuentas Claras ==================
echo 1) Build & Up (detached)
echo 2) Up (detached)
echo 3) Build only
echo 4) Down (remove volumes)
echo 5) Logs (follow)
echo 6) Exec shell in API container
echo 7) Run tests locally (requires node installed)
echo 8) Run tests in container (may require dev deps)
echo 9) Import DB schema from base/schema.sql into running DB
echo 0) Exit
echo ==================================================================
set /p choice=Choose an option [0-9]: 

if "%choice%"=="1" goto build_up
if "%choice%"=="2" goto up
if "%choice%"=="3" goto build
if "%choice%"=="4" goto down
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto exec_shell
if "%choice%"=="7" goto tests_local
if "%choice%"=="8" goto tests_container
if "%choice%"=="9" goto import_schema
if "%choice%"=="0" goto end

echo Invalid choice
pause
goto menu

:build_up
echo Building and starting containers (detached)...
docker compose up --build -d
echo Done.
pause
goto menu

:up
echo Starting containers (detached)...
docker compose up -d
echo Done.
pause
goto menu

:build
echo Building images...
docker compose build
echo Done.
pause
goto menu

:down
echo Stopping and removing containers (including volumes)...
docker compose down -v --remove-orphans
echo Done.
pause
goto menu

:logs
echo Attaching to logs (Ctrl+C to stop)...
docker compose logs -f --tail=200
echo Logs detached.
pause
goto menu

:exec_shell
echo Opening shell in api container (sh). Use exit to return.
docker compose exec api sh
goto menu

:tests_local
echo Running tests locally (requires repository dependencies installed)...
if exist package.json (
  npm test
) else (
  echo package.json not found in current folder.
)
pause
goto menu

:tests_container
echo Running tests inside container (may fail if image lacks devDependencies).
echo If you want reliable container tests, create a dev image that installs devDependencies.
docker compose run --rm --service-ports --entrypoint "npm test" api
pause
goto menu

:import_schema
if not exist base\schema.sql (
  echo schema file not found: base\schema.sql
  pause
  goto menu
)

echo Importing base/schema.sql into MySQL container 'db'...
echo This assumes the DB container is named by docker compose service 'db'.
type base\schema.sql | docker compose exec -T db mysql -u%DB_USER% -p%DB_PASSWORD% %DB_NAME%
echo Import finished.
pause
goto menu

:end
echo Goodbye.
endlocal
exit /b 0
