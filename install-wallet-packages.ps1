# Install Wallet Packages Script
# This script installs all necessary packages for non-EVM wallet generation

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Wallet Packages Installation Script" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Define package groups
$phase1Packages = @(
    "bitcoinjs-lib",
    "bip32",
    "@solana/web3.js",
    "bs58",
    "@polkadot/keyring",
    "@cosmjs/stargate",
    "stellar-sdk",
    "near-api-js"
)

$phase2Packages = @(
    "@emurgo/cardano-serialization-lib-nodejs",
    "cardano-wallet-js",
    "ripple-lib",
    "ripple-keypairs",
    "ton",
    "ton-crypto",
    "ton-core"
)

$phase3Packages = @(
    "@taquito/taquito",
    "@taquito/signer",
    "@hashgraph/sdk",
    "@dfinity/agent",
    "@dfinity/identity",
    "@iota/sdk",
    "eosjs",
    "eosjs-ecc"
)

$additionalPackages = @(
    "@cityofzion/neon-js",
    "@waves/waves-crypto",
    "@stacks/transactions",
    "@stacks/wallet-sdk",
    "monero-javascript",
    "@glif/filecoin-address",
    "@zondax/filecoin-signing-tools",
    "thor-devkit",
    "@zilliqa-js/zilliqa",
    "@onflow/fcl",
    "@onflow/types",
    "@multiversx/sdk-core",
    "@multiversx/sdk-wallet",
    "casper-js-sdk",
    "mina-signer",
    "litecore-lib",
    "bitcore-lib-doge",
    "@psf/bitcoincashjs-lib",
    "bitcore-lib-zcash"
)

# Function to install packages
function Install-Packages {
    param (
        [string]$PhaseName,
        [array]$Packages,
        [string]$Color = "Green"
    )

    Write-Host ""
    Write-Host "[$PhaseName] Installing $($Packages.Count) packages..." -ForegroundColor $Color
    Write-Host "Packages: $($Packages -join ', ')" -ForegroundColor Gray
    Write-Host ""

    $packageString = $Packages -join ' '
    $command = "npm install $packageString --legacy-peer-deps"

    Write-Host "Running: $command" -ForegroundColor DarkGray
    Invoke-Expression $command

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ [$PhaseName] Installation completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ [$PhaseName] Installation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        return $false
    }
    return $true
}

# Start installation
Write-Host "Starting wallet packages installation..." -ForegroundColor Yellow
Write-Host "This will install packages in 4 phases to avoid conflicts." -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date

# Phase 1: Essential Networks (Bitcoin, Solana, Cosmos, Polkadot, Stellar, Near)
$success1 = Install-Packages -PhaseName "PHASE 1" -Packages $phase1Packages -Color "Cyan"
if (-not $success1) {
    Write-Host ""
    Write-Host "Installation failed at Phase 1. Please check errors above." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# Phase 2: Popular Alts (Cardano, Ripple, TON)
$success2 = Install-Packages -PhaseName "PHASE 2" -Packages $phase2Packages -Color "Magenta"
if (-not $success2) {
    Write-Host ""
    Write-Host "Installation failed at Phase 2. Please check errors above." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# Phase 3: Extended Support (Tezos, Hedera, ICP, IOTA, EOS)
$success3 = Install-Packages -PhaseName "PHASE 3" -Packages $phase3Packages -Color "Yellow"
if (-not $success3) {
    Write-Host ""
    Write-Host "Installation failed at Phase 3. Please check errors above." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# Phase 4: Additional Networks
$success4 = Install-Packages -PhaseName "PHASE 4" -Packages $additionalPackages -Color "Green"
if (-not $success4) {
    Write-Host ""
    Write-Host "Installation failed at Phase 4. Please check errors above." -ForegroundColor Red
    exit 1
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total packages installed: $($phase1Packages.Count + $phase2Packages.Count + $phase3Packages.Count + $additionalPackages.Count)" -ForegroundColor Yellow
Write-Host "Time taken: $($duration.Minutes) minutes $($duration.Seconds) seconds" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update nuxt.config.ts with new package configurations" -ForegroundColor White
Write-Host "2. Create API endpoints for non-EVM wallet generation" -ForegroundColor White
Write-Host "3. Add UI buttons for wallet generation" -ForegroundColor White
Write-Host ""
Write-Host "See WALLET_PACKAGES.md for detailed documentation." -ForegroundColor Gray
Write-Host ""
