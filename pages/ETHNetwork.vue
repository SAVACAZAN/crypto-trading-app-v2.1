<script setup>
import { ref, computed, onMounted } from 'vue';

const userID = useCookie('userID');

// State
const wallets = ref([]);
const loading = ref(false);
const showGenerateForm = ref(false);
const generatingWallet = ref(false);
const selectedWallet = ref(null);

// Stats
const totalWallets = computed(() => wallets.value.length);
const totalAddresses = computed(() => {
  // For Ethereum, each wallet = 1 address
  return wallets.value.length;
});
const totalBalance = computed(() => {
  return wallets.value.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
});
const totalBalanceUSD = computed(() => {
  return wallets.value.reduce((sum, w) => sum + parseFloat(w.balanceUSD || 0), 0);
});

// Fetch wallets from database
async function fetchWallets() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Ethereum'
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
      console.log(`[Ethereum] Loaded ${wallets.value.length} wallets`);
    } else {
      window.$message?.error(response.message || 'Failed to fetch wallets');
    }
  } catch (error) {
    console.error('[Ethereum] Error fetching wallets:', error);
    window.$message?.error('Error loading wallets');
  } finally {
    loading.value = false;
  }
}

// Generate new wallet
async function handleGenerateWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  generatingWallet.value = true;

  try {
    const response = await $fetch('/api/v1/Wallets/generateEthereumWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        walletName: `Ethereum Wallet ${Date.now()}`
      }
    });

    if (response.success) {
      window.$message?.success('Ethereum wallet generated successfully!');
      showGenerateForm.value = false;

      // Refresh wallet list
      await fetchWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }

  } catch (error) {
    console.error('[Ethereum] Error generating wallet:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingWallet.value = false;
  }
}

// Copy to clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    window.$message?.success(`${label} copied to clipboard!`);
  }).catch(() => {
    window.$message?.error('Failed to copy to clipboard');
  });
}

// View wallet details
function viewWalletDetails(wallet) {
  selectedWallet.value = wallet;
}

// Format address (show first 10 and last 8 chars)
function formatAddress(address) {
  if (!address) return '';
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
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

// Load wallets on mount
onMounted(() => {
  fetchWallets();
});
</script>

<template>
  <div class="ethereum-network-page">
    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <span class="network-icon">Ξ</span>
          <div>
            <h1>Ethereum Network</h1>
            <p class="subtitle">Manage your ETH wallets and addresses</p>
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
            <span class="stat-label">Total ETH</span>
            <span class="stat-value">{{ totalBalance.toFixed(4) }}</span>
          </div>
        </div>
      </n-card>

      <n-card class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">💵</span>
          <div class="stat-info">
            <span class="stat-label">USD Value</span>
            <span class="stat-value">${{ totalBalanceUSD.toFixed(2) }}</span>
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
    <n-card title="💼 Your Ethereum Wallets" style="margin-top: 24px;">
      <template #header-extra>
        <n-tag type="info">{{ totalWallets }} wallet{{ totalWallets !== 1 ? 's' : '' }}</n-tag>
      </template>

      <div v-if="loading" style="text-align: center; padding: 40px;">
        <n-spin size="large" />
        <p style="margin-top: 16px; color: rgba(255,255,255,0.6);">Loading wallets...</p>
      </div>

      <div v-else-if="wallets.length === 0" style="text-align: center; padding: 40px;">
        <span style="font-size: 48px;">Ξ</span>
        <h3 style="margin-top: 16px;">No Ethereum Wallets Yet</h3>
        <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
          Generate your first Ethereum wallet to get started
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
              <span class="wallet-emoji">Ξ</span>
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
              <span class="info-value">{{ wallet.balance || '0' }} ETH</span>
            </div>

            <div class="info-row">
              <span class="info-label">USD Value:</span>
              <span class="info-value">${{ wallet.balanceUSD || '0.00' }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Created:</span>
              <span class="info-value">{{ formatDate(wallet.createdAt) }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Last Used:</span>
              <span class="info-value">{{ formatDate(wallet.lastUsed) }}</span>
            </div>
          </div>

          <n-divider style="margin: 12px 0;" />

          <div class="wallet-actions">
            <n-button size="small" type="primary" ghost @click="window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')">
              🔍 View on Etherscan
            </n-button>
            <n-button size="small" type="info" ghost>
              💸 Send ETH
            </n-button>
          </div>
        </n-card>
      </div>
    </n-card>

    <!-- Wallet Details Modal -->
    <n-modal
      v-model:show="selectedWallet"
      preset="card"
      title="Ξ Wallet Details"
      style="width: 600px; max-width: 95vw;"
    >
      <div v-if="selectedWallet" class="wallet-details">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="Wallet Name">
            {{ selectedWallet.walletName }}
          </n-descriptions-item>
          <n-descriptions-item label="Network">
            Ethereum ({{ selectedWallet.networkSymbol }})
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
            {{ selectedWallet.balance || '0' }} ETH
          </n-descriptions-item>
          <n-descriptions-item label="USD Value">
            ${{ selectedWallet.balanceUSD || '0.00' }}
          </n-descriptions-item>
          <n-descriptions-item label="Created">
            {{ formatDate(selectedWallet.createdAt) }}
          </n-descriptions-item>
          <n-descriptions-item label="Last Used">
            {{ formatDate(selectedWallet.lastUsed) }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <div style="display: flex; gap: 12px;">
          <n-button type="primary" block @click="window.open(`https://etherscan.io/address/${selectedWallet.address}`, '_blank')">
            🔍 View on Etherscan
          </n-button>
          <n-button type="info" block>
            💸 Send ETH
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.ethereum-network-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
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
