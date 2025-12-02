# PowerShell script to safely update npm dependencies on Windows
# This handles file locking issues common on Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NPM Dependencies Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Step 1: Checking for running Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) running Node process(es)" -ForegroundColor Yellow
    $answer = Read-Host "Do you want to stop them? (y/n)"
    if ($answer -eq 'y') {
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Write-Host "Node processes stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "Step 2: Backing up package.json and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Copy-Item "package.json" "package.json.backup" -Force
    Write-Host "✓ package.json backed up" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "package-lock.json.backup" -Force
    Write-Host "✓ package-lock.json backed up" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Cache cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Removing node_modules (this may take a while)..." -ForegroundColor Yellow

# Try to remove node_modules with retry logic
$maxAttempts = 3
$attempt = 1
$removed = $false

while ($attempt -le $maxAttempts -and -not $removed) {
    try {
        if (Test-Path "node_modules") {
            Write-Host "Attempt $attempt of $maxAttempts..." -ForegroundColor Yellow

            # Use robocopy to delete (fastest method on Windows)
            $emptyDir = Join-Path $env:TEMP "empty_$(Get-Random)"
            New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
            robocopy $emptyDir "node_modules" /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
            Remove-Item $emptyDir -Force -Recurse
            Remove-Item "node_modules" -Force -Recurse

            Write-Host "✓ node_modules removed" -ForegroundColor Green
            $removed = $true
        } else {
            Write-Host "✓ node_modules doesn't exist (skip)" -ForegroundColor Green
            $removed = $true
        }
    }
    catch {
        Write-Host "Failed: $_" -ForegroundColor Red
        $attempt++
        if ($attempt -le $maxAttempts) {
            Write-Host "Waiting 5 seconds before retry..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $removed) {
    Write-Host "⚠ Could not remove node_modules automatically" -ForegroundColor Red
    Write-Host "Please close all editors and applications, then manually delete the node_modules folder" -ForegroundColor Yellow
    Read-Host "Press Enter when ready to continue"
}

Write-Host ""
Write-Host "Step 5: Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "✓ package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "✓ package-lock.json doesn't exist (skip)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 6: Installing dependencies with --legacy-peer-deps..." -ForegroundColor Yellow
Write-Host "(This may take several minutes...)" -ForegroundColor Gray
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green

    Write-Host ""
    Write-Host "Step 7: Running security audit..." -ForegroundColor Yellow
    npm audit --json > audit-report.json 2>&1

    $auditData = Get-Content "audit-report.json" | ConvertFrom-Json
    if ($auditData.metadata.vulnerabilities) {
        $vulns = $auditData.metadata.vulnerabilities
        Write-Host ""
        Write-Host "Security Vulnerabilities:" -ForegroundColor Yellow
        Write-Host "  Critical: $($vulns.critical)" -ForegroundColor Red
        Write-Host "  High:     $($vulns.high)" -ForegroundColor Red
        Write-Host "  Moderate: $($vulns.moderate)" -ForegroundColor Yellow
        Write-Host "  Low:      $($vulns.low)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Update Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test your application: npm run dev" -ForegroundColor White
    Write-Host "2. Check the audit report: audit-report.json" -ForegroundColor White
    Write-Host "3. If issues occur, restore from backup:" -ForegroundColor White
    Write-Host "   - copy package.json.backup package.json" -ForegroundColor Gray
    Write-Host "   - copy package-lock.json.backup package-lock.json" -ForegroundColor Gray
    Write-Host "   - npm install --legacy-peer-deps" -ForegroundColor Gray

} else {
    Write-Host ""
    Write-Host "✗ Installation failed!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To restore from backup:" -ForegroundColor Yellow
    Write-Host "  copy package.json.backup package.json" -ForegroundColor White
    Write-Host "  copy package-lock.json.backup package-lock.json" -ForegroundColor White
    Write-Host "  npm install --legacy-peer-deps" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
