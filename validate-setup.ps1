# BananeV2 - Setup Validation Script
# This script checks if everything is properly configured

Write-Host "🔍 BananeV2 Setup Validation" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

$issues = @()
$warnings = @()

# Get paths
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = $scriptPath
$frontendPath = Join-Path $rootPath "frontend"
$backendPath = Join-Path $rootPath "backend"

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    
    # Parse version
    $versionNum = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNum -lt 18) {
        $warnings += "Node.js version is $nodeVersion. Version 18 or higher is recommended."
    }
} catch {
    $issues += "Node.js is not installed or not in PATH"
    Write-Host "  ❌ Node.js not found" -ForegroundColor Red
}

# Check Yarn
Write-Host "Checking Yarn..." -ForegroundColor Cyan
try {
    $yarnVersion = yarn --version
    Write-Host "  ✅ Yarn: v$yarnVersion" -ForegroundColor Green
} catch {
    $issues += "Yarn is not installed or not in PATH"
    Write-Host "  ❌ Yarn not found" -ForegroundColor Red
}

# Check Backend Directory
Write-Host "Checking Backend..." -ForegroundColor Cyan
if (Test-Path $backendPath) {
    Write-Host "  ✅ Backend directory exists" -ForegroundColor Green
    
    # Check package.json
    if (Test-Path (Join-Path $backendPath "package.json")) {
        Write-Host "  ✅ Backend package.json found" -ForegroundColor Green
    } else {
        $issues += "Backend package.json not found"
        Write-Host "  ❌ Backend package.json missing" -ForegroundColor Red
    }
    
    # Check node_modules
    if (Test-Path (Join-Path $backendPath "node_modules")) {
        Write-Host "  ✅ Backend dependencies installed" -ForegroundColor Green
    } else {
        $warnings += "Backend dependencies not installed. Run 'yarn install' in backend directory."
        Write-Host "  ⚠️  Backend dependencies not installed" -ForegroundColor Yellow
    }
    
    # Check .env file
    if (Test-Path (Join-Path $backendPath ".env")) {
        Write-Host "  ✅ Backend .env file exists" -ForegroundColor Green
        
        # Check critical env vars
        $envContent = Get-Content (Join-Path $backendPath ".env") -Raw
        if ($envContent -match "DATABASE_URL") {
            Write-Host "  ✅ DATABASE_URL configured" -ForegroundColor Green
        } else {
            $warnings += "DATABASE_URL not found in backend .env"
            Write-Host "  ⚠️  DATABASE_URL not configured" -ForegroundColor Yellow
        }
        
        if ($envContent -match "JWT_SECRET") {
            Write-Host "  ✅ JWT_SECRET configured" -ForegroundColor Green
        } else {
            $warnings += "JWT_SECRET not found in backend .env"
            Write-Host "  ⚠️  JWT_SECRET not configured" -ForegroundColor Yellow
        }
    } else {
        $warnings += "Backend .env file not found. Copy from .env.example if available."
        Write-Host "  ⚠️  Backend .env file missing" -ForegroundColor Yellow
    }
    
    # Check build
    if (Test-Path (Join-Path $backendPath "dist")) {
        Write-Host "  ✅ Backend build exists" -ForegroundColor Green
    } else {
        $warnings += "Backend not built. Run 'yarn build' in backend directory."
        Write-Host "  ⚠️  Backend not built" -ForegroundColor Yellow
    }
    
} else {
    $issues += "Backend directory not found"
    Write-Host "  ❌ Backend directory not found" -ForegroundColor Red
}

# Check Frontend Directory
Write-Host "Checking Frontend..." -ForegroundColor Cyan
if (Test-Path $frontendPath) {
    Write-Host "  ✅ Frontend directory exists" -ForegroundColor Green
    
    # Check package.json
    if (Test-Path (Join-Path $frontendPath "package.json")) {
        Write-Host "  ✅ Frontend package.json found" -ForegroundColor Green
    } else {
        $issues += "Frontend package.json not found"
        Write-Host "  ❌ Frontend package.json missing" -ForegroundColor Red
    }
    
    # Check node_modules
    if (Test-Path (Join-Path $frontendPath "node_modules")) {
        Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        $warnings += "Frontend dependencies not installed. Run 'yarn install' in frontend directory."
        Write-Host "  ⚠️  Frontend dependencies not installed" -ForegroundColor Yellow
    }
    
    # Check .env files
    if (Test-Path (Join-Path $frontendPath ".env.development")) {
        Write-Host "  ✅ Frontend .env.development exists" -ForegroundColor Green
    } else {
        $warnings += "Frontend .env.development not found"
        Write-Host "  ⚠️  Frontend .env.development missing" -ForegroundColor Yellow
    }
    
    if (Test-Path (Join-Path $frontendPath ".env.production")) {
        Write-Host "  ✅ Frontend .env.production exists" -ForegroundColor Green
    } else {
        $warnings += "Frontend .env.production not found"
        Write-Host "  ⚠️  Frontend .env.production missing" -ForegroundColor Yellow
    }
    
    # Check build
    if (Test-Path (Join-Path $frontendPath "dist")) {
        Write-Host "  ✅ Frontend build exists" -ForegroundColor Green
        
        # Check if index.html exists
        if (Test-Path (Join-Path $frontendPath "dist\index.html")) {
            Write-Host "  ✅ Frontend index.html found" -ForegroundColor Green
        } else {
            $warnings += "Frontend build incomplete. Run 'yarn build:production' in frontend directory."
            Write-Host "  ⚠️  Frontend build incomplete" -ForegroundColor Yellow
        }
    } else {
        $warnings += "Frontend not built. Run 'yarn build:production' in frontend directory."
        Write-Host "  ⚠️  Frontend not built" -ForegroundColor Yellow
    }
    
} else {
    $issues += "Frontend directory not found"
    Write-Host "  ❌ Frontend directory not found" -ForegroundColor Red
}

# Check Database
Write-Host "Checking Database..." -ForegroundColor Cyan
$dbPath = Join-Path $backendPath "prisma\bin\database.db"
if (Test-Path $dbPath) {
    Write-Host "  ✅ Database file exists" -ForegroundColor Green
} else {
    $warnings += "Database not initialized. Run 'yarn migrate' in backend directory."
    Write-Host "  ⚠️  Database not initialized" -ForegroundColor Yellow
}

# Check if running as Admin
Write-Host "Checking Privileges..." -ForegroundColor Cyan
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    Write-Host "  ✅ Running as Administrator" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Not running as Administrator (required for service installation)" -ForegroundColor Gray
}

# Check if service is installed
Write-Host "Checking Windows Service..." -ForegroundColor Cyan
$service = Get-Service -Name "BananeV2 Production Manager" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "  ✅ Service is installed" -ForegroundColor Green
    Write-Host "     Status: $($service.Status)" -ForegroundColor Gray
    Write-Host "     Startup Type: $($service.StartType)" -ForegroundColor Gray
} else {
    Write-Host "  ℹ️  Service not installed" -ForegroundColor Gray
}

# Check Port Availability
Write-Host "Checking Port Availability..." -ForegroundColor Cyan
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portInUse) {
    $warnings += "Port 5000 is already in use. Service may fail to start."
    Write-Host "  ⚠️  Port 5000 is in use" -ForegroundColor Yellow
    $portInUse | ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "     Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  ✅ Port 5000 is available" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Validation Summary" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "✅ No critical issues found!" -ForegroundColor Green
} else {
    Write-Host "❌ Critical Issues ($($issues.Count)):" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
}

Write-Host ""

if ($warnings.Count -eq 0) {
    Write-Host "✅ No warnings!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warnings ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
}

Write-Host ""

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 Your setup looks perfect! Ready to deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run '.\deploy.ps1' to build and deploy" -ForegroundColor Gray
    Write-Host "  2. Or manually build: 'cd backend && yarn build:full'" -ForegroundColor Gray
    Write-Host "  3. Install service: 'cd backend && yarn service:install' (as Admin)" -ForegroundColor Gray
} elseif ($issues.Count -eq 0) {
    Write-Host "⚠️  Please address the warnings before deploying to production." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can still proceed with:" -ForegroundColor Cyan
    Write-Host "  • Development mode: 'yarn start:dev' in backend & 'yarn dev' in frontend" -ForegroundColor Gray
    Write-Host "  • Or fix the warnings and build for production" -ForegroundColor Gray
} else {
    Write-Host "❌ Please fix the critical issues before proceeding." -ForegroundColor Red
}

Write-Host ""
