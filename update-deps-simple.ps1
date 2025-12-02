# Simple PowerShell script to update npm dependencies
# Handles Windows file locking issues

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  NPM Dependencies Update Script"  -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Step 1: Stop Node processes
Write-Host "Step 1: Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "Done" -ForegroundColor Green

# Step 2: Backup files
Write-Host ""
Write-Host "Step 2: Creating backups..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Copy-Item "package.json" "package.json.backup" -Force
}
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "package-lock.json.backup" -Force
}
Write-Host "Done" -ForegroundColor Green

# Step 3: Clean cache
Write-Host ""
Write-Host "Step 3: Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "Done" -ForegroundColor Green

# Step 4: Remove node_modules
Write-Host ""
Write-Host "Step 4: Removing node_modules..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes...)" -ForegroundColor Gray

if (Test-Path "node_modules") {
    # Method 1: Try robocopy (fastest on Windows)
    $emptyDir = Join-Path $env:TEMP "empty_npm_$(Get-Random)"
    New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null

    Write-Host "Using robocopy method..." -ForegroundColor Gray
    robocopy $emptyDir "node_modules" /MIR /NFL /NDL /NJH /NJS /nc /ns /np 2>&1 | Out-Null

    Remove-Item $emptyDir -Force -Recurse -ErrorAction SilentlyContinue
    Remove-Item "node_modules" -Force -Recurse -ErrorAction SilentlyContinue

    # If still exists, try direct delete
    if (Test-Path "node_modules") {
        Write-Host "Retrying with direct delete..." -ForegroundColor Gray
        cmd /c "rd /s /q node_modules" 2>&1 | Out-Null
    }
}

if (Test-Path "node_modules") {
    Write-Host "Warning: Could not fully remove node_modules" -ForegroundColor Red
    Write-Host "Some files may be locked. Continuing anyway..." -ForegroundColor Yellow
} else {
    Write-Host "Done" -ForegroundColor Green
}

# Step 5: Remove package-lock
Write-Host ""
Write-Host "Step 5: Removing package-lock.json..." -ForegroundColor Yellow
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
Write-Host "Done" -ForegroundColor Green

# Step 6: Install dependencies
Write-Host ""
Write-Host "Step 6: Installing dependencies..." -ForegroundColor Yellow
Write-Host "(This will take several minutes...)" -ForegroundColor Gray
Write-Host ""

npm install --legacy-peer-deps

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Installation Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green

    # Run audit
    Write-Host ""
    Write-Host "Running security audit..." -ForegroundColor Yellow
    npm audit --json 2>&1 | Out-File "audit-report.json" -Encoding UTF8

    try {
        $audit = Get-Content "audit-report.json" -Raw | ConvertFrom-Json
        if ($audit.metadata.vulnerabilities) {
            $v = $audit.metadata.vulnerabilities
            Write-Host ""
            Write-Host "Security Status:" -ForegroundColor Cyan
            Write-Host "  Critical: $($v.critical)" -ForegroundColor $(if($v.critical -gt 0){"Red"}else{"Green"})
            Write-Host "  High:     $($v.high)" -ForegroundColor $(if($v.high -gt 0){"Red"}else{"Green"})
            Write-Host "  Moderate: $($v.moderate)" -ForegroundColor $(if($v.moderate -gt 0){"Yellow"}else{"Green"})
            Write-Host "  Low:      $($v.low)" -ForegroundColor $(if($v.low -gt 0){"Yellow"}else{"Green"})
        }
    } catch {
        Write-Host "Could not parse audit report" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "Next: npm run dev" -ForegroundColor Cyan

} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Installation Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "To restore from backup:" -ForegroundColor Yellow
    Write-Host "  copy package.json.backup package.json" -ForegroundColor White
    Write-Host "  copy package-lock.json.backup package-lock.json" -ForegroundColor White
}

Write-Host ""
