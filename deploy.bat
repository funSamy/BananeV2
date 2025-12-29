@echo off
setlocal enabledelayedexpansion

:: BananeV2 - Quick Start Script (Batch Version)
:: This script builds and deploys the complete application

color 0A
echo.
echo ============================================
echo   BananeV2 Production Deployment Script
echo ============================================
echo.
color

:: Check if running as Administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    set "IS_ADMIN=1"
) else (
    set "IS_ADMIN=0"
    echo WARNING: Not running as Administrator
    echo          Service installation will require Administrator privileges
    echo.
)

:: Get the script directory
set "ROOT_PATH=%~dp0"
set "FRONTEND_PATH=%ROOT_PATH%frontend"
set "BACKEND_PATH=%ROOT_PATH%backend"

echo Project root: %ROOT_PATH%
echo.

:MENU
cls
echo.
echo ============================================
echo   BananeV2 Production Deployment Script
echo ============================================
echo.
echo Select an option:
echo.
echo 1. Full Build (Frontend + Backend)
echo 2. Build Frontend Only
echo 3. Build Backend Only
echo 4. Install Windows Service (requires Admin)
echo 5. Start Service
echo 6. Stop Service
echo 7. Restart Service
echo 8. Uninstall Service (requires Admin)
echo 9. Run in Development Mode
echo 0. Exit
echo.
set /p "CHOICE=Enter your choice: "
echo.

if "%CHOICE%"=="1" goto FULL_BUILD
if "%CHOICE%"=="2" goto BUILD_FRONTEND
if "%CHOICE%"=="3" goto BUILD_BACKEND
if "%CHOICE%"=="4" goto INSTALL_SERVICE
if "%CHOICE%"=="5" goto START_SERVICE
if "%CHOICE%"=="6" goto STOP_SERVICE
if "%CHOICE%"=="7" goto RESTART_SERVICE
if "%CHOICE%"=="8" goto UNINSTALL_SERVICE
if "%CHOICE%"=="9" goto RUN_DEV
if "%CHOICE%"=="0" goto EXIT
echo Invalid choice. Please try again.
pause
goto MENU

:FULL_BUILD
echo ============================================
echo   Full Build Started...
echo ============================================
echo.
call :BUILD_FRONTEND_FUNC
if !errorlevel! neq 0 goto END_SECTION
call :BUILD_BACKEND_FUNC
if !errorlevel! neq 0 goto END_SECTION
echo.
echo ============================================
echo   Full build completed successfully!
echo   You can now install and start the Windows service (option 4)
echo ============================================
goto END_SECTION

:BUILD_FRONTEND
call :BUILD_FRONTEND_FUNC
goto END_SECTION

:BUILD_BACKEND
call :BUILD_BACKEND_FUNC
goto END_SECTION

:INSTALL_SERVICE
if "%IS_ADMIN%"=="0" (
    echo ============================================
    echo   ERROR: Administrator privileges required!
    echo ============================================
    echo.
    echo Please run this script as Administrator and try again.
    echo Right-click the script and select "Run as administrator"
    echo.
    goto END_SECTION
)

echo ============================================
echo   Installing Windows Service...
echo ============================================
echo.
cd /d "%BACKEND_PATH%"

:: Check if backend is built
if not exist "dist\src\main.js" (
    echo WARNING: Backend not built. Building now...
    call :BUILD_BACKEND_FUNC
    if !errorlevel! neq 0 (
        echo.
        echo ERROR: Cannot install service without successful build!
        cd /d "%ROOT_PATH%"
        goto END_SECTION
    )
)

call yarn service:install
cd /d "%ROOT_PATH%"
goto END_SECTION

:START_SERVICE
echo ============================================
echo   Starting BananeV2 Service...
echo ============================================
echo.
cd /d "%BACKEND_PATH%"
call yarn service:start
timeout /t 3 /nobreak >nul
echo.
echo Application should be available at: http://localhost:1965
cd /d "%ROOT_PATH%"
goto END_SECTION

:STOP_SERVICE
echo ============================================
echo   Stopping BananeV2 Service...
echo ============================================
echo.
cd /d "%BACKEND_PATH%"
call yarn service:stop
cd /d "%ROOT_PATH%"
goto END_SECTION

:RESTART_SERVICE
echo ============================================
echo   Restarting BananeV2 Service...
echo ============================================
echo.
cd /d "%BACKEND_PATH%"
call yarn service:restart
timeout /t 3 /nobreak >nul
echo.
echo Application should be available at: http://localhost:1965
cd /d "%ROOT_PATH%"
goto END_SECTION

:UNINSTALL_SERVICE
if "%IS_ADMIN%"=="0" (
    echo ============================================
    echo   ERROR: Administrator privileges required!
    echo ============================================
    echo.
    echo Please run this script as Administrator and try again.
    echo Right-click the script and select "Run as administrator"
    echo.
    goto END_SECTION
)

echo ============================================
echo   Uninstalling Windows Service...
echo ============================================
echo.
cd /d "%BACKEND_PATH%"
call yarn service:uninstall
cd /d "%ROOT_PATH%"
goto END_SECTION

:RUN_DEV
echo ============================================
echo   Development Mode Instructions
echo ============================================
echo.
echo This will start both frontend and backend in development mode.
echo You'll need two terminal windows:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   bun run start:dev
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   yarn dev
echo.
goto END_SECTION

:BUILD_FRONTEND_FUNC
echo ============================================
echo   Building Frontend...
echo ============================================
echo.
cd /d "%FRONTEND_PATH%"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call yarn install
    if !errorlevel! neq 0 (
        echo.
        echo ERROR: Frontend dependency installation failed!
        cd /d "%ROOT_PATH%"
        exit /b 1
    )
)

echo Building production bundle...
call yarn build:production

if !errorlevel! equ 0 (
    echo.
    echo Frontend build completed successfully!
    cd /d "%ROOT_PATH%"
    exit /b 0
) else (
    echo.
    echo ERROR: Frontend build failed!
    cd /d "%ROOT_PATH%"
    exit /b 1
)

:BUILD_BACKEND_FUNC
echo ============================================
echo   Building Backend...
echo ============================================
echo.
cd /d "%BACKEND_PATH%"

if not exist "node_modules" (
    echo Installing backend dependencies...
    call yarn install
    if !errorlevel! neq 0 (
        echo.
        echo ERROR: Backend dependency installation failed!
        cd /d "%ROOT_PATH%"
        exit /b 1
    )
)

echo Building backend and running migrations...
call yarn build

if !errorlevel! equ 0 (
    echo.
    echo Backend build completed successfully!
    cd /d "%ROOT_PATH%"
    exit /b 0
) else (
    echo.
    echo ERROR: Backend build failed!
    cd /d "%ROOT_PATH%"
    exit /b 1
)

:END_SECTION
echo.
echo Press any key to continue...
pause >nul
goto MENU

:EXIT
cls
echo.
echo ============================================
echo   Goodbye! Thank you for using BananeV2
echo ============================================
echo.
timeout /t 2 /nobreak >nul
exit /b 0