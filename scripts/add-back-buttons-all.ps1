# Add back buttons to ALL network pages that don't have them

$pagesDir = '../pages'
$backButtonBlock = @'
    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back to CryptoWallet
      </n-button>
    </div>

'@

# Get all *Network.vue files
$networkFiles = Get-ChildItem -Path $pagesDir -Filter "*Network.vue"

$processedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $networkFiles) {
    $filePath = $file.FullName
    $fileName = $file.Name

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Check if back button already exists
        if ($content -match 'Back to CryptoWallet|Back</n-button>|← Back') {
            Write-Host "Back button already exists in $fileName" -ForegroundColor Cyan
            $skippedCount++
        } else {
            # Try to find the pattern and add back button
            if ($content -match '(<template>\s+<div class="[^"]*(-network)?-page">)') {
                $newContent = $content -replace '(<template>\s+<div class="[^"]*(-network)?-page">)', "`$1`n$backButtonBlock"

                $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "Added back button to $fileName" -ForegroundColor Green
                $processedCount++
            } else {
                Write-Host "Pattern not found in $fileName" -ForegroundColor Yellow
                $errorCount++
            }
        }
    } catch {
        Write-Host "Error processing $fileName : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n========== Summary ==========" -ForegroundColor Cyan
Write-Host "Added: $processedCount" -ForegroundColor Green
Write-Host "Skipped (already has button): $skippedCount" -ForegroundColor Cyan
Write-Host "Errors: $errorCount" -ForegroundColor Yellow
Write-Host "============================`n" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
