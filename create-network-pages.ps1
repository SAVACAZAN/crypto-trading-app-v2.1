# Script to create network pages for all 29 new networks

$networks = @(
    @{Name="Secret Network"; Symbol="SCRT"; Icon="🔐"; API="generateSecretWallet"; Explorer="https://www.mintscan.io/secret/account/"},
    @{Name="Kujira"; Symbol="KUJI"; Icon="🐋"; API="generateKujiraWallet"; Explorer="https://www.mintscan.io/kujira/account/"},
    @{Name="Archway"; Symbol="ARCH"; Icon="🏛️"; API="generateArchwayWallet"; Explorer="https://www.mintscan.io/archway/account/"},
    @{Name="Thorchain"; Symbol="RUNE"; Icon="⚡"; API="generateThorchainWallet"; Explorer="https://viewblock.io/thorchain/address/"},
    @{Name="Waves"; Symbol="WAVES"; Icon="🌊"; API="generateWavesWallet"; Explorer="https://wavesexplorer.com/address/"},
    @{Name="Zilliqa"; Symbol="ZIL"; Icon="💠"; API="generateZilliqaWallet"; Explorer="https://viewblock.io/zilliqa/address/"},
    @{Name="NEO"; Symbol="NEO"; Icon="🟢"; API="generateNeoWallet"; Explorer="https://explorer.onegate.space/address/"},
    @{Name="Kadena"; Symbol="KDA"; Icon="⛓️"; API="generateKadenaWallet"; Explorer="https://explorer.chainweb.com/mainnet/account/"},
    @{Name="EOS"; Symbol="EOS"; Icon="🔷"; API="generateEOSWallet"; Explorer="https://bloks.io/account/"},
    @{Name="WAX"; Symbol="WAXP"; Icon="🎮"; API="generateWAXWallet"; Explorer="https://waxblock.io/account/"},
    @{Name="Ontology"; Symbol="ONT"; Icon="⭕"; API="generateOntologyWallet"; Explorer="https://explorer.ont.io/address/"},
    @{Name="Theta Network"; Symbol="THETA"; Icon="📺"; API="generateThetaWallet"; Explorer="https://explorer.thetatoken.org/account/"},
    @{Name="Casper Network"; Symbol="CSPR"; Icon="👻"; API="generateCasperWallet"; Explorer="https://cspr.live/account/"},
    @{Name="ICON"; Symbol="ICX"; Icon="🔵"; API="generateICONWallet"; Explorer="https://tracker.icon.community/address/"},
    @{Name="Qtum"; Symbol="QTUM"; Icon="💎"; API="generateQtumWallet"; Explorer="https://explorer.qtum.org/address/"},
    @{Name="Ergo"; Symbol="ERG"; Icon="🔺"; API="generateErgoWallet"; Explorer="https://explorer.ergoplatform.com/en/addresses/"},
    @{Name="NEM"; Symbol="XEM"; Icon="⬛"; API="generateNEMWallet"; Explorer="https://explorer.nemtool.com/#/s_account?account="},
    @{Name="Symbol"; Symbol="XYM"; Icon="⚛️"; API="generateSymbolWallet"; Explorer="https://symbol.fyi/accounts/"},
    @{Name="Nervos CKB"; Symbol="CKB"; Icon="🧬"; API="generateNervosCKBWallet"; Explorer="https://explorer.nervos.org/address/"},
    @{Name="Aleph Zero"; Symbol="AZERO"; Icon="0️⃣"; API="generateAlephZeroWallet"; Explorer="https://azero.dev/#/accounts/"},
    @{Name="Radix DLT"; Symbol="XRD"; Icon="🔴"; API="generateRadixWallet"; Explorer="https://dashboard.radixdlt.com/account/"},
    @{Name="Nibiru Chain"; Symbol="NIBI"; Icon="🌌"; API="generateNibiruWallet"; Explorer="https://explorer.nibiru.fi/nibiru-1/account/"},
    @{Name="Dymension"; Symbol="DYM"; Icon="🎯"; API="generateDymensionWallet"; Explorer="https://www.mintscan.io/dymension/account/"},
    @{Name="Immutable X"; Symbol="IMX"; Icon="🎨"; API="generateImmutableXWallet"; Explorer="https://immutascan.io/address/"},
    @{Name="Loopring"; Symbol="LRC"; Icon="⭕"; API="generateLoopringWallet"; Explorer="https://etherscan.io/address/"},
    @{Name="Ultra.io"; Symbol="UOS"; Icon="🎮"; API="generateUltraWallet"; Explorer="https://explorer.ultra.io/account/"},
    @{Name="Hyperliquid"; Symbol="HYPE"; Icon="⚡"; API="generateHyperliquidWallet"; Explorer="https://etherscan.io/address/"},
    @{Name="Constellation"; Symbol="DAG"; Icon="🌟"; API="generateConstellationWallet"; Explorer="https://dagexplorer.io/address/"},
    @{Name="LCX"; Symbol="LCX"; Icon="🏦"; API="generateLCXWallet"; Explorer="https://etherscan.io/address/"}
)

$template = @"
<script setup>
import { ref, computed, onMounted } from 'vue';

const userID = useCookie('userID');

// State
const wallets = ref([]);
const loading = ref(false);
const generatingWallet = ref(false);
const selectedWallet = ref(null);

// Stats
const totalWallets = computed(() => wallets.value.length);
const totalAddresses = computed(() => wallets.value.length);
const totalBalance = computed(() => {
  return wallets.value.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
});
const totalBalanceUSD = computed(() => {
  return wallets.value.reduce((sum, w) => sum + parseFloat(w.balanceUSD || 0), 0);
});

// Fetch wallets
async function fetchWallets() {
  if (!userID.value) {
    window.`$message?.error('Please login first!');
    return;
  }

  loading.value = true;

  try {
    const response = await `$fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: '{{NETWORK_NAME}}'
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
    } else {
      window.`$message?.error(response.message || 'Failed to fetch wallets');
    }
  } catch (error) {
    console.error('[{{NETWORK_NAME}}] Error fetching wallets:', error);
    window.`$message?.error('Error loading wallets');
  } finally {
    loading.value = false;
  }
}

// Generate wallet
async function handleGenerateWallet() {
  if (!userID.value) {
    window.`$message?.error('Please login first!');
    return;
  }

  generatingWallet.value = true;

  try {
    const response = await `$fetch('/api/v1/Wallets/{{API_NAME}}', {
      method: 'POST',
      body: {
        userID: userID.value,
        walletName: ``{{NETWORK_NAME}} Wallet `${Date.now()}``
      }
    });

    if (response.success) {
      window.`$message?.success('{{NETWORK_NAME}} wallet generated successfully!');
      await fetchWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[{{NETWORK_NAME}}] Error generating wallet:', error);
    window.`$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingWallet.value = false;
  }
}

// Copy to clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    window.`$message?.success(``{label} copied to clipboard!``);
  }).catch(() => {
    window.`$message?.error('Failed to copy to clipboard');
  });
}

// View wallet details
function viewWalletDetails(wallet) {
  selectedWallet.value = wallet;
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  if (address.length <= 20) return address;
  return ``{address.slice(0, 10)}...{address.slice(-8)}``;
}

// Format date
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  fetchWallets();
});
</script>

<template>
  <div class="network-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <n-button text @click="`$router.push('/dashboard?tab=cryptowallet')" class="back-button">
          ← Back
        </n-button>
        <div class="title-section">
          <span class="network-icon">{{ICON}}</span>
          <div>
            <h1>{{NETWORK_NAME}}</h1>
            <p class="subtitle">Manage your {{SYMBOL}} wallets and addresses</p>
          </div>
        </div>
        <div class="header-actions">
          <n-button type="primary" @click="handleGenerateWallet" :loading="generatingWallet">
            ➕ Generate Wallet
          </n-button>
          <n-button @click="fetchWallets" :loading="loading">
            🔄 Refresh
          </n-button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <n-card class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">👛</span>
          <div class="stat-info">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalWallets }}</span>
          </div>
        </div>
      </n-card>

      <n-card class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">📍</span>
          <div class="stat-info">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAddresses }}</span>
          </div>
        </div>
      </n-card>

      <n-card class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">💎</span>
          <div class="stat-info">
            <span class="stat-label">Total {{SYMBOL}}</span>
            <span class="stat-value">{{ totalBalance.toFixed(4) }}</span>
          </div>
        </div>
      </n-card>

      <n-card class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">💵</span>
          <div class="stat-info">
            <span class="stat-label">USD Value</span>
            <span class="stat-value">`${{ totalBalanceUSD.toFixed(2) }}</span>
          </div>
        </div>
      </n-card>

      <n-card class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">🌐</span>
          <div class="stat-info">
            <span class="stat-label">Network</span>
            <span class="stat-value">Mainnet</span>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Wallets List -->
    <n-card title="💼 Your {{NETWORK_NAME}} Wallets" style="margin-top: 24px;">
      <template #header-extra>
        <n-tag type="info">{{ totalWallets }} wallet{{ totalWallets !== 1 ? 's' : '' }}</n-tag>
      </template>

      <div v-if="loading" style="text-align: center; padding: 40px;">
        <n-spin size="large" />
        <p style="margin-top: 16px; color: rgba(255,255,255,0.6);">Loading wallets...</p>
      </div>

      <div v-else-if="wallets.length === 0" style="text-align: center; padding: 40px;">
        <span style="font-size: 48px;">{{ICON}}</span>
        <h3 style="margin-top: 16px;">No {{NETWORK_NAME}} Wallets Yet</h3>
        <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
          Generate your first {{NETWORK_NAME}} wallet to get started
        </p>
        <n-button type="primary" @click="handleGenerateWallet" :loading="generatingWallet">
          ➕ Generate Wallet
        </n-button>
      </div>

      <div v-else class="wallets-grid">
        <n-card
          v-for="wallet in wallets"
          :key="wallet._id"
          class="wallet-card"
          hoverable
        >
          <div class="wallet-header">
            <div class="wallet-title">
              <span class="wallet-emoji">{{ICON}}</span>
              <div>
                <h3>{{ wallet.walletName }}</h3>
                <n-tag size="small" type="success">{{ wallet.networkSymbol }}</n-tag>
              </div>
            </div>
            <n-button-group size="small">
              <n-button @click="viewWalletDetails(wallet)">
                👁️ View
              </n-button>
              <n-button @click="copyToClipboard(wallet.address, 'Address')">
                📋 Copy
              </n-button>
            </n-button-group>
          </div>

          <n-divider style="margin: 12px 0;" />

          <div class="wallet-info">
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value address" @click="copyToClipboard(wallet.address, 'Address')">
                {{ formatAddress(wallet.address) }}
              </span>
            </div>

            <div class="info-row">
              <span class="info-label">Balance:</span>
              <span class="info-value">{{ wallet.balance || '0' }} {{SYMBOL}}</span>
            </div>

            <div class="info-row">
              <span class="info-label">USD Value:</span>
              <span class="info-value">`${{ wallet.balanceUSD || '0.00' }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Created:</span>
              <span class="info-value">{{ formatDate(wallet.createdAt) }}</span>
            </div>
          </div>

          <n-divider style="margin: 12px 0;" />

          <div class="wallet-actions">
            <n-button size="small" type="primary" ghost @click="window.open(``{{EXPLORER}}`${wallet.address}``, '_blank')">
              🔍 View on Explorer
            </n-button>
          </div>
        </n-card>
      </div>
    </n-card>

    <!-- Wallet Details Modal -->
    <n-modal
      v-model:show="selectedWallet"
      preset="card"
      title="{{ICON}} Wallet Details"
      style="width: 600px; max-width: 95vw;"
    >
      <div v-if="selectedWallet" class="wallet-details">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="Wallet Name">
            {{ selectedWallet.walletName }}
          </n-descriptions-item>
          <n-descriptions-item label="Network">
            {{NETWORK_NAME}} ({{ selectedWallet.networkSymbol }})
          </n-descriptions-item>
          <n-descriptions-item label="Address">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="font-size: 12px; word-break: break-all;">{{ selectedWallet.address }}</code>
              <n-button size="tiny" @click="copyToClipboard(selectedWallet.address, 'Address')">
                📋
              </n-button>
            </div>
          </n-descriptions-item>
          <n-descriptions-item label="Balance">
            {{ selectedWallet.balance || '0' }} {{SYMBOL}}
          </n-descriptions-item>
          <n-descriptions-item label="USD Value">
            `${{ selectedWallet.balanceUSD || '0.00' }}
          </n-descriptions-item>
          <n-descriptions-item label="Created">
            {{ formatDate(selectedWallet.createdAt) }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <div style="display: flex; gap: 12px;">
          <n-button type="primary" block @click="window.open(``{{EXPLORER}}`${selectedWallet.address}``, '_blank')">
            🔍 View on Explorer
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.network-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.back-button {
  font-size: 16px;
  font-weight: 600;
  color: rgba(99, 102, 241, 0.9);
  margin-right: auto;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.back-button:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.network-icon {
  font-size: 48px;
  line-height: 1;
}

.title-section h1 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  line-height: 1;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.wallets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.wallet-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.wallet-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.wallet-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-emoji {
  font-size: 32px;
  line-height: 1;
}

.wallet-title h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #fff;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.info-value.address {
  cursor: pointer;
  color: #6366f1;
}

.info-value.address:hover {
  text-decoration: underline;
}

.wallet-actions {
  display: flex;
  gap: 8px;
}

.wallet-details {
  padding: 8px 0;
}
</style>
"@

foreach ($network in $networks) {
    $fileName = $network.Name -replace ' ', ''
    $filePath = "pages\$fileName.vue"

    $content = $template -replace '{{NETWORK_NAME}}', $network.Name
    $content = $content -replace '{{SYMBOL}}', $network.Symbol
    $content = $content -replace '{{ICON}}', $network.Icon
    $content = $content -replace '{{API_NAME}}', $network.API
    $content = $content -replace '{{EXPLORER}}', $network.Explorer

    $content | Out-File -FilePath $filePath -Encoding UTF8
    Write-Host "Created $filePath" -ForegroundColor Green
}

Write-Host "`nAll 29 network pages created successfully!" -ForegroundColor Cyan
