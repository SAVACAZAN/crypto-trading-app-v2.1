# Add back buttons to the 10 newly created Phase 2 pages

$networks = @(
    'zkSyncNetwork',
    'FantomNetwork',
    'LineaNetwork',
    'ScrollNetwork',
    'BlastNetwork',
    'MantleNetwork',
    'CronosNetwork',
    'HarmonyNetwork',
    'MoonbeamNetwork',
    'GnosisNetwork'
)

$pagesDir = '../pages'

foreach ($network in $networks) {
    $filePath = "$pagesDir/$network.vue"

    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Check if back button already exists
        if ($content -notmatch 'Back' -and $content -notmatch 'dashboard\?tab=cryptowallet') {
            # Find the first <n-card and add back button before it
            $pattern = '(<template>\s+<div class="[^"]*-network-page">\s+)(<!-- Header Card -->)'

            $backButton = @'
<!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>


'@

            $newContent = $content -replace $pattern, "`$1$backButton`$2"

            if ($content -ne $newContent) {
                $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "Added back button to $network.vue" -ForegroundColor Green
            } else {
                Write-Host "Could not match pattern in $network.vue" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Back button already exists in $network.vue" -ForegroundColor Cyan
        }
    } else {
        Write-Host "File not found: $network.vue" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green
