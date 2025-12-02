# Remove ALL duplicate back buttons - more aggressive pattern matching

$pagesDir = '../pages'
$networkFiles = Get-ChildItem -Path $pagesDir -Filter "*Network.vue"

$removedCount = 0
$skippedCount = 0

foreach ($file in $networkFiles) {
    $filePath = $file.FullName
    $fileName = $file.Name

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Check if file has the duplicate pattern:
        # 1. A standalone back button div BEFORE the header/card
        # 2. AND another back button somewhere else
        if ($content -match '<!-- Back Button -->' -and $content -match 'margin-bottom: 16px') {
            # Remove the first occurrence of the standalone back button block
            $pattern = '    <!-- Back Button -->\r?\n    <div style="margin-bottom: 16px;">\r?\n[^<]*<n-button[^>]+>[^<]*Back[^<]*</n-button>\r?\n    </div>\r?\n\r?\n'

            $newContent = $content -replace $pattern, ''

            if ($content -ne $newContent) {
                $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "Removed duplicate from $fileName" -ForegroundColor Green
                $removedCount++
            } else {
                # Try alternative pattern without double newline
                $pattern2 = '    <!-- Back Button -->\r?\n    <div style="margin-bottom: 16px;">\r?\n[^<]*<n-button[^>]+>[^<]*Back[^<]*</n-button>\r?\n    </div>\r?\n'
                $newContent = $content -replace $pattern2, ''

                if ($content -ne $newContent) {
                    $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                    Write-Host "Removed duplicate from $fileName (alt pattern)" -ForegroundColor Green
                    $removedCount++
                } else {
                    Write-Host "Could not remove from $fileName" -ForegroundColor Yellow
                    $skippedCount++
                }
            }
        } else {
            Write-Host "No duplicate in $fileName" -ForegroundColor Cyan
            $skippedCount++
        }
    } catch {
        Write-Host "Error: $fileName - $_" -ForegroundColor Red
    }
}

Write-Host "`n==========" -ForegroundColor Cyan
Write-Host "Removed: $removedCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
