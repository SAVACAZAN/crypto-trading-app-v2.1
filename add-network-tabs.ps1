# Script to add network scanner tabs to hyperliquid.vue

$file = "pages/hyperliquid.vue"
$content = Get-Content $file -Raw

# Add imports after ARBNetworkScanner
$importsToAdd = @"
import BASENetworkScanner from '~/components/BASENetworkScanner.vue';
import PLASMANetworkScanner from '~/components/PLASMANetworkScanner.vue';
import OptimismNetworkScanner from '~/components/OptimismNetworkScanner.vue';
import AvalancheNetworkScanner from '~/components/AvalancheNetworkScanner.vue';
import AlgorandNetworkScanner from '~/components/AlgorandNetworkScanner.vue';
import NobleNetworkScanner from '~/components/NobleNetworkScanner.vue';
import SuiNetworkScanner from '~/components/SuiNetworkScanner.vue';
"@

$content = $content -replace "(import ARBNetworkScanner from '~/components/ARBNetworkScanner\.vue';)", "`$1`n$importsToAdd"

# Add tabs after ARB Network tab
$tabsToAdd = @"

      <!-- BASE Network Scanner Tab -->
      <n-tab-pane name="basenetwork" tab="🔵 BASE Network">
        <BASENetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- PLASMA Network Scanner Tab -->
      <n-tab-pane name="plasmanetwork" tab="🟣 PLASMA Network">
        <PLASMANetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Optimism Network Scanner Tab -->
      <n-tab-pane name="optimismnetwork" tab="🔴 Optimism Network">
        <OptimismNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Avalanche Network Scanner Tab -->
      <n-tab-pane name="avalanchenetwork" tab="🔺 Avalanche Network">
        <AvalancheNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Algorand Network Scanner Tab -->
      <n-tab-pane name="algorandnetwork" tab="⬛ Algorand Network">
        <AlgorandNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Noble Network Scanner Tab -->
      <n-tab-pane name="noblenetwork" tab="👑 Noble Network">
        <NobleNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Sui Network Scanner Tab -->
      <n-tab-pane name="suinetwork" tab="🌊 Sui Network">
        <SuiNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>
"@

$content = $content -replace "(<!-- ARB Network Scanner Tab -->[\s\S]*?</n-tab-pane>)", "`$1$tabsToAdd"

Set-Content $file -Value $content -NoNewline
Write-Host "✅ Successfully added network scanner tabs to hyperliquid.vue"
