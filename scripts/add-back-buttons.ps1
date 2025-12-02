# Add back buttons to all Phase 3+ network pages

$networks = @(
    'ImmutableZkEVMNetwork',
    'BeamNetwork',
    'OasysNetwork',
    'PolygonZkEVMNetwork',
    'BobaNetwork',
    'MetisNetwork',
    'AuroraNetwork',
    'RedstoneNetwork',
    'OpBNBNetwork',
    'ArbitrumNovaNetwork',
    'ZoraNetwork',
    'MantaPacificNetwork',
    'MorphL2Network',
    'XaiNetwork',
    'FraxtalNetwork',
    'TaikoNetwork',
    'ModeNetworkNetwork',
    'CeloNetwork',
    'HederaNetwork',
    'SeiNetwork',
    'KavaNetwork',
    'ShimmerEVMNetwork',
    'ConfluxESpaceNetwork',
    'OasisEmeraldNetwork',
    'EnergyWebNetwork',
    'TelosEVMNetwork',
    'HorizenEONNetwork',
    'VictionNetwork',
    'FuseNetwork',
    'SyscoinNetwork',
    'ThunderCoreNetwork',
    'AstarNetwork',
    'ShidenNetwork',
    'EfinityNetwork',
    'WorldChainNetwork',
    'SonicNetwork',
    'FlareNetwork',
    'SongbirdNetwork',
    'ZetaChainNetwork',
    'SmartBCHNetwork',
    'RSKNetwork',
    'WanchainNetwork',
    'GoChainNetwork',
    'CantoNetwork'
)

$pagesDir = '../pages'
$backButtonBlock = @'
    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back to CryptoWallet
      </n-button>
    </div>

'@

foreach ($network in $networks) {
    $filePath = "$pagesDir/$network.vue"

    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Check if back button already exists
        if ($content -notmatch 'Back to CryptoWallet') {
            # Find <template>\n  <div class="xxx-network-page"> and insert after
            if ($content -match '(<template>\s+<div class="[^"]*-network-page">)') {
                $newContent = $content -replace '(<template>\s+<div class="[^"]*-network-page">)', "`$1`n$backButtonBlock"

                $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "Added back button to $network.vue" -ForegroundColor Green
            } else {
                Write-Host "Pattern not found in $network.vue" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Back button already exists in $network.vue" -ForegroundColor Cyan
        }
    } else {
        Write-Host "File not found: $network.vue" -ForegroundColor Red
    }
}

Write-Host "Done!" -ForegroundColor Green
