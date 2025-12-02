# Remove duplicate back buttons added by automation script
# Keep only the original back buttons in the page headers

$pagesDir = '../pages'

# Pattern to remove (the one added by our script)
$patternToRemove = @'
    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="\$router.push\('/dashboard\?tab=cryptowallet'\)" class="back-button">
        . Back to CryptoWallet
      </n-button>
    </div>

'@

# Get all *Network.vue files
$networkFiles = Get-ChildItem -Path $pagesDir -Filter "*Network.vue"

$removedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $networkFiles) {
    $filePath = $file.FullName
    $fileName = $file.Name

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Check if the duplicate back button exists
        if ($content -match '<!-- Back Button -->\s+<div style="margin-bottom: 16px;">') {
            # Remove the duplicate back button section
            $newContent = $content -replace '(\s+<!-- Back Button -->\s+<div style="margin-bottom: 16px;">\s+<n-button[^>]+>\s+. Back to CryptoWallet\s+</n-button>\s+</div>\s+)', "`n"

            if ($content -ne $newContent) {
                $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "Removed duplicate back button from $fileName" -ForegroundColor Green
                $removedCount++
            } else {
                Write-Host "Could not remove from $fileName (pattern mismatch)" -ForegroundColor Yellow
                $skippedCount++
            }
        } else {
            Write-Host "No duplicate back button in $fileName" -ForegroundColor Cyan
            $skippedCount++
        }
    } catch {
        Write-Host "Error processing $fileName : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n========== Summary ==========" -ForegroundColor Cyan
Write-Host "Removed: $removedCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Cyan
Write-Host "Errors: $errorCount" -ForegroundColor Yellow
Write-Host "============================`n" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
