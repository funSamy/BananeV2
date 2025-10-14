# BananeV2 - Quick Start Script
# This script builds and deploys the complete application

Write-Host "🍌 BananeV2 Production Deployment Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Service installation will require Administrator privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = $scriptPath
$frontendPath = Join-Path $rootPath "frontend"
$backendPath = Join-Path $rootPath "backend"

Write-Host "📂 Project root: $rootPath" -ForegroundColor Cyan
Write-Host ""

# Menu
function Show-Menu {
    Write-Host "Select an option:" -ForegroundColor Yellow
    Write-Host "1. Full Build (Frontend + Backend)"
    Write-Host "2. Build Frontend Only"
    Write-Host "3. Build Backend Only"
    Write-Host "4. Install Windows Service (requires Admin)"
    Write-Host "5. Start Service"
    Write-Host "6. Stop Service"
    Write-Host "7. Restart Service"
    Write-Host "8. Uninstall Service (requires Admin)"
    Write-Host "9. Run in Development Mode"
    Write-Host "0. Exit"
    Write-Host ""
}

function Build-Frontend {
    Write-Host "🎨 Building Frontend..." -ForegroundColor Green
    Set-Location $frontendPath
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
        yarn install
    }
    
    Write-Host "🔨 Building production bundle..." -ForegroundColor Cyan
    yarn build:production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        return $false
    }
    
    Set-Location $rootPath
    return $true
}

function Build-Backend {
    Write-Host "⚙️  Building Backend..." -ForegroundColor Green
    Set-Location $backendPath
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
        yarn install
    }
    
    Write-Host "🔨 Building backend and running migrations..." -ForegroundColor Cyan
    yarn build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed!" -ForegroundColor Red
        return $false
    }
    
    Set-Location $rootPath
    return $true
}

function Install-Service {
    if (-not $isAdmin) {
        Write-Host "❌ Administrator privileges required for service installation!" -ForegroundColor Red
        Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
        return
    }
    
    Write-Host "📦 Installing Windows Service..." -ForegroundColor Green
    Set-Location $backendPath
    
    # Make sure everything is built first
    if (-not (Test-Path ".\backend\dist\src\main.js")) {
        Write-Host "⚠️  Backend not built. Building now..." -ForegroundColor Yellow
        $buildSuccess = Build-Backend
        if (-not $buildSuccess) {
            Write-Host "❌ Cannot install service without successful build!" -ForegroundColor Red
            return
        }
    }
    
    yarn service:install
    Set-Location $rootPath
}

function Start-AppService {
    Write-Host "▶️  Starting BananeV2 Service..." -ForegroundColor Green
    Set-Location $backendPath
    yarn service:start
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "🌐 Application should be available at: http://localhost:5000" -ForegroundColor Cyan
    Set-Location $rootPath
}

function Stop-AppService {
    Write-Host "⏹️  Stopping BananeV2 Service..." -ForegroundColor Yellow
    Set-Location $backendPath
    yarn service:stop
    Set-Location $rootPath
}

function Restart-AppService {
    Write-Host "🔄 Restarting BananeV2 Service..." -ForegroundColor Yellow
    Set-Location $backendPath
    yarn service:restart
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "🌐 Application should be available at: http://localhost:5000" -ForegroundColor Cyan
    Set-Location $rootPath
}

function Uninstall-Service {
    if (-not $isAdmin) {
        Write-Host "❌ Administrator privileges required for service uninstallation!" -ForegroundColor Red
        Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
        return
    }
    
    Write-Host "🗑️  Uninstalling Windows Service..." -ForegroundColor Yellow
    Set-Location $backendPath
    yarn service:uninstall
    Set-Location $rootPath
}

function Run-Development {
    Write-Host "🔧 Starting Development Mode..." -ForegroundColor Green
    Write-Host ""
    Write-Host "This will start both frontend and backend in development mode." -ForegroundColor Cyan
    Write-Host "You'll need two terminal windows:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  yarn start:dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Gray
    Write-Host "  yarn dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    Write-Host ""
    
    switch ($choice) {
        "1" {
            Write-Host "🚀 Full Build Started..." -ForegroundColor Green
            Write-Host ""
            $frontendSuccess = Build-Frontend
            if ($frontendSuccess) {
                $backendSuccess = Build-Backend
                if ($backendSuccess) {
                    Write-Host ""
                    Write-Host "✅ Full build completed successfully!" -ForegroundColor Green
                    Write-Host "   You can now install and start the Windows service (option 4)" -ForegroundColor Cyan
                }
            }
        }
        "2" { Build-Frontend }
        "3" { Build-Backend }
        "4" { Install-Service }
        "5" { Start-AppService }
        "6" { Stop-AppService }
        "7" { Restart-AppService }
        "8" { Uninstall-Service }
        "9" { Run-Development }
        "0" { 
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            break 
        }
        default { Write-Host "❌ Invalid choice. Please try again." -ForegroundColor Red }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
    Write-Host "🍌 BananeV2 Production Deployment Script" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
} while ($choice -ne "0")
