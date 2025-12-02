<template>
  <div class="eth-network-container">
    <!-- Header Section -->
    <div class="section-header">
      <div class="header-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#627eea" stroke-width="2">
          <polygon points="12 2 4 10 12 14 20 10 12 2"></polygon>
          <polygon points="12 22 4 14 12 18 20 14 12 22"></polygon>
        </svg>
      </div>
      <div>
        <h2 class="section-title">Ethereum Network Scanner</h2>
        <p class="section-subtitle">Scan any Ethereum address to view ERC-20 tokens and balances</p>
      </div>
    </div>

    <!-- Address Input Section -->
    <n-card class="scan-card">
      <n-space vertical :size="16">
        <div class="form-group">
          <label class="form-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Ethereum Address
          </label>
          <n-input
            v-model:value="ethAddress"
            placeholder="0x..."
            size="large"
            clearable
            @keyup.enter="scanAddress"
          >
            <template #suffix>
              <n-button
                text
                @click="pasteAddress"
                style="padding: 0 8px;"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </n-button>
            </template>
          </n-input>
          <span class="form-hint">Enter a valid Ethereum address (0x...)</span>
        </div>

        <n-button
          type="primary"
          size="large"
          @click="scanAddress"
          :loading="loading"
          :disabled="!isValidAddress"
          block
          strong
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </template>
          Scan Address
        </n-button>
      </n-space>
    </n-card>

    <!-- Results Section -->
    <div v-if="scanned && !loading" class="results-section">
      <!-- Address Info Card -->
      <n-card class="info-card">
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 8px; background: linear-gradient(135deg, #627eea 0%, #4c5fd5 100%); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px;">Address Information</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">{{ maskAddress(ethAddress) }}</p>
            </div>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ETH Balance</span>
            <span class="info-value eth-balance">{{ formatBalance(ethBalance) }} ETH</span>
          </div>
          <div class="info-item">
            <span class="info-label">USD Value</span>
            <span class="info-value">${{ formatUSD(ethBalanceUSD) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Tokens</span>
            <span class="info-value">{{ tokens.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Network</span>
            <span class="info-value">
              <n-tag :bordered="false" type="info" size="small">Ethereum Mainnet</n-tag>
            </span>
          </div>
        </div>

        <n-button
          text
          type="primary"
          @click="openEtherscan"
          style="margin-top: 12px;"
        >
          View on Etherscan
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </template>
        </n-button>
      </n-card>

      <!-- Tokens Table -->
      <n-card>
        <template #header>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px;">ERC-20 Tokens</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">
                  {{ tokens.length }} token(s) found
                </p>
              </div>
            </div>
            <n-button @click="scanAddress" :loading="loading" size="medium">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </template>
              Refresh
            </n-button>
          </div>
        </template>

        <n-space vertical :size="16">
          <!-- Search -->
          <n-input v-model:value="tokenSearch" placeholder="Search tokens... (e.g., USDT, DAI)" size="large" clearable>
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </template>
          </n-input>

          <!-- Tokens Data Table -->
          <n-data-table
            v-if="tokens.length > 0"
            :columns="tokenColumns"
            :data="filteredTokens"
            :pagination="{ pageSize: 20 }"
            :bordered="false"
            striped
          />

          <!-- Empty State -->
          <n-empty v-else description="No ERC-20 tokens found for this address" style="padding: 60px 20px;">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </template>
          </n-empty>
        </n-space>
      </n-card>

      <!-- NFT Collections Card with Tabs -->
      <n-card>
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 8px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px;">NFT Collections</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">
                Browse NFTs from your wallet or explore collections
              </p>
            </div>
          </div>
        </template>

        <n-tabs type="line" animated>
          <!-- Tab 1: My Wallet NFTs -->
          <n-tab-pane name="myWallet" tab="My Wallet">
            <n-space vertical :size="16">
              <!-- NFT Collections Grid -->
              <div v-if="nfts.length > 0" class="nft-grid">
            <div
              v-for="(nft, index) in nfts"
              :key="nft.contractAddress"
              class="nft-collection-section"
            >
              <!-- Collection Header -->
              <div class="nft-collection-header">
                <!-- Logo + Info -->
                <div style="display: flex; align-items: center; gap: 16px;">
                  <!-- Collection Logo -->
                  <div class="nft-header-logo-container">
                    <img
                      v-if="nft.logo"
                      :src="nft.logo"
                      :alt="nft.name"
                      class="nft-header-logo"
                      @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }"
                    />
                    <div class="nft-header-logo-fallback" :style="nft.logo ? 'display: none;' : ''">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  </div>

                  <!-- Collection Info -->
                  <div class="nft-collection-info">
                    <h4 class="nft-collection-name">{{ nft.name || 'Unknown Collection' }}</h4>
                    <p class="nft-collection-symbol">{{ nft.symbol || 'N/A' }}</p>
                  </div>
                </div>

                <!-- Balance Badge -->
                <div class="nft-balance-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                  <span>{{ nft.balance }} NFT{{ nft.balance > 1 ? 's' : '' }}</span>
                </div>
              </div>

              <!-- Individual NFT Images Grid -->
              <div v-if="nft.nfts && nft.nfts.length > 0" class="nft-images-grid">
                <div
                  v-for="(item, idx) in nft.nfts"
                  :key="item.tokenId"
                  class="nft-image-item"
                  :title="`${item.name} - Token ID: ${item.tokenId}`"
                >
                  <div class="nft-image-wrapper">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.name"
                      class="nft-image-thumb"
                      @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }"
                    />
                    <div class="nft-image-fallback" :style="item.image ? 'display: none;' : ''">
                      <span class="nft-token-id">#{{ item.tokenId }}</span>
                    </div>
                  </div>
                  <p class="nft-item-name">{{ item.name }}</p>
                </div>
              </div>

              <!-- NFT Actions -->
              <div class="nft-actions">
                <n-button
                  text
                  type="primary"
                  size="small"
                  @click="openNFTOnEtherscan(nft.contractAddress)"
                >
                  View on Etherscan →
                </n-button>
              </div>
            </div>
          </div>

              <!-- Empty State -->
              <n-empty v-else description="No NFT collections found for this address" style="padding: 60px 20px;">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </template>
              </n-empty>
            </n-space>
          </n-tab-pane>

          <!-- Tab 2: TIAMONDS Collection (All NFTs) -->
          <n-tab-pane name="tiamondsCollection" tab="TIAMONDS Collection">
            <n-space vertical :size="16">
              <!-- Search/Filter -->
              <n-input
                v-model:value="nftSearch"
                placeholder="Search by name or token ID..."
                size="large"
                clearable
              >
                <template #prefix>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </template>
              </n-input>

              <!-- Collection Info Header -->
              <div class="collection-stats">
                <div class="stat-item">
                  <span class="stat-label">Total NFTs:</span>
                  <span class="stat-value">{{ allTiamondsNFTs.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Filtered:</span>
                  <span class="stat-value">{{ filteredTiamondsNFTs.length }}</span>
                </div>
              </div>

              <!-- All TIAMONDS NFTs Grid -->
              <div v-if="filteredTiamondsNFTs.length > 0" class="nft-images-grid">
                <div
                  v-for="item in filteredTiamondsNFTs"
                  :key="item.tokenId"
                  class="nft-image-item"
                  :title="`${item.name} - Token ID: ${item.tokenId} - Owner: ${maskAddress(item.owner)}`"
                >
                  <div class="nft-image-wrapper">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.name"
                      class="nft-image-thumb"
                      @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }"
                    />
                    <div class="nft-image-fallback" :style="item.image ? 'display: none;' : ''">
                      <span class="nft-token-id">#{{ item.tokenId }}</span>
                    </div>
                  </div>
                  <p class="nft-item-name">{{ item.name }}</p>
                  <p class="nft-item-owner">{{ maskAddress(item.owner) }}</p>
                </div>
              </div>

              <!-- Empty State for Filtered Results -->
              <n-empty v-else description="No TIAMONDS NFTs match your search" style="padding: 60px 20px;">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </template>
              </n-empty>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>

    <!-- Empty State (No Scan Yet) -->
    <div v-if="!scanned && !loading" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#627eea" stroke-width="1.5">
        <polygon points="12 2 4 10 12 14 20 10 12 2"></polygon>
        <polygon points="12 22 4 14 12 18 20 14 12 22"></polygon>
      </svg>
      <h3>Scan an Ethereum Address</h3>
      <p>Enter an Ethereum address above to view all ERC-20 tokens and their balances</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, watch } from 'vue';
import { useNotification } from 'naive-ui';
import { TIAMONDS_NFTS } from '~/data/tiamonds-nfts.js';

const notification = useNotification();

// Props
const props = defineProps({
  walletAddress: {
    type: String,
    default: ''
  }
});

// State
const ethAddress = ref('');
const ethBalance = ref(0);
const ethBalanceUSD = ref(0);
const tokens = ref([]);
const nfts = ref([]);
const loading = ref(false);
const scanned = ref(false);
const tokenSearch = ref('');
const nftSearch = ref('');

// Hardcoded TIAMONDS NFT data (loaded from downloaded collection)
const allTiamondsNFTs = ref(TIAMONDS_NFTS);

// Computed
const isValidAddress = computed(() => {
  return /^0x[a-fA-F0-9]{40}$/.test(ethAddress.value);
});

// Watch for wallet address changes from parent
watch(() => props.walletAddress, (newAddress) => {
  if (newAddress && /^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
    ethAddress.value = newAddress;
    // Auto-scan when address is set from parent
    scanAddress();
  }
}, { immediate: true });

const filteredTokens = computed(() => {
  if (!tokenSearch.value) return tokens.value;

  const search = tokenSearch.value.toLowerCase();
  return tokens.value.filter(token =>
    token.name?.toLowerCase().includes(search) ||
    token.symbol?.toLowerCase().includes(search) ||
    token.contractAddress?.toLowerCase().includes(search)
  );
});

const filteredTiamondsNFTs = computed(() => {
  if (!nftSearch.value) return allTiamondsNFTs.value;

  const search = nftSearch.value.toLowerCase();
  return allTiamondsNFTs.value.filter(nft =>
    nft.name?.toLowerCase().includes(search) ||
    nft.tokenId?.toString().includes(search) ||
    nft.owner?.toLowerCase().includes(search)
  );
});

// Token table columns
const tokenColumns = [
  {
    title: '#',
    key: 'index',
    width: 60,
    render: (row, index) => index + 1
  },
  {
    title: 'Token',
    key: 'name',
    width: 250,
    render: (row) => h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
      // Logo
      row.logo
        ? h('img', {
            src: row.logo,
            alt: row.symbol,
            style: 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover;',
            onError: (e) => { e.target.style.display = 'none'; }
          })
        : h('div', {
            style: 'width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #627eea 0%, #4c5fd5 100%); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff;'
          }, (row.symbol || '?').charAt(0)),
      // Token info
      h('div', { style: 'display: flex; flex-direction: column;' }, [
        h('span', { style: 'font-weight: 600; color: #fff;' }, row.name || 'Unknown'),
        h('span', { style: 'font-size: 12px; color: #888;' }, row.symbol || 'N/A')
      ])
    ])
  },
  {
    title: 'Balance',
    key: 'balance',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 700; color: #10b981;' }, formatTokenBalance(row.balance, row.decimals))
  },
  {
    title: 'Price (USD)',
    key: 'price',
    width: 120,
    render: (row) => row.price ? h('span', { style: 'color: #fbbf24;' }, `$${parseFloat(row.price).toFixed(4)}`) : h('span', { style: 'color: #666;' }, 'N/A')
  },
  {
    title: 'Value (USD)',
    key: 'valueUSD',
    width: 140,
    render: (row) => {
      const value = calculateTokenValue(row.balance, row.decimals, row.price);
      return h('span', { style: 'font-weight: 600; color: #3b82f6;' }, `$${value.toFixed(2)}`);
    }
  },
  {
    title: 'Contract',
    key: 'contractAddress',
    width: 160,
    render: (row) => h('code', { style: 'font-size: 11px; color: #888;' }, maskAddress(row.contractAddress))
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (row) => h('a', {
      href: `https://etherscan.io/token/${row.contractAddress}?a=${ethAddress.value}`,
      target: '_blank',
      style: 'color: #627eea; text-decoration: none; font-size: 12px;'
    }, 'View →')
  }
];

// Functions
async function pasteAddress() {
  try {
    const text = await navigator.clipboard.readText();
    if (/^0x[a-fA-F0-9]{40}$/.test(text)) {
      ethAddress.value = text;
      notification.success({
        content: "Address Pasted",
        meta: "Ethereum address pasted from clipboard",
        duration: 2000
      });
    } else {
      notification.warning({
        content: "Invalid Address",
        meta: "Clipboard doesn't contain a valid Ethereum address",
        duration: 2000
      });
    }
  } catch (error) {
    notification.error({
      content: "Paste Failed",
      meta: "Could not access clipboard",
      duration: 2000
    });
  }
}

async function scanAddress() {
  if (!isValidAddress.value) {
    notification.error({
      content: "Invalid Address",
      meta: "Please enter a valid Ethereum address",
      duration: 2000
    });
    return;
  }

  loading.value = true;

  try {
    // Fetch ETH balance and tokens from API
    const response = await $fetch('/api/v1/ethereum/scanAddress', {
      method: 'POST',
      body: {
        address: ethAddress.value
      }
    });

    if (response.success) {
      ethBalance.value = response.data.ethBalance || 0;
      ethBalanceUSD.value = response.data.ethBalanceUSD || 0;
      tokens.value = response.data.tokens || [];
      nfts.value = response.data.nfts || [];
      scanned.value = true;

      notification.success({
        content: "Scan Complete",
        meta: `Found ${tokens.value.length} ERC-20 token(s) and ${nfts.value.length} NFT collection(s)`,
        duration: 3000
      });
    } else {
      throw new Error(response.message || 'Failed to scan address');
    }
  } catch (error) {
    console.error('Error scanning address:', error);
    notification.error({
      content: "Scan Failed",
      meta: error.message || "Could not scan Ethereum address",
      duration: 3000
    });

    // Set empty data on error
    ethBalance.value = 0;
    ethBalanceUSD.value = 0;
    tokens.value = [];
    nfts.value = [];
    scanned.value = true;
  } finally {
    loading.value = false;
  }
}

function openEtherscan() {
  window.open(`https://etherscan.io/address/${ethAddress.value}`, '_blank');
}

function openNFTOnEtherscan(contractAddress) {
  window.open(`https://etherscan.io/token/${contractAddress}?a=${ethAddress.value}`, '_blank');
}

// Helper functions
function maskAddress(address) {
  if (!address) return 'N/A';
  if (address.length <= 10) return address;
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

function formatBalance(balance) {
  if (!balance) return '0.0000';
  return parseFloat(balance).toFixed(4);
}

function formatUSD(amount) {
  if (!amount) return '0.00';
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatTokenBalance(balance, decimals) {
  if (!balance) return '0';
  const divisor = Math.pow(10, decimals || 18);
  const value = parseFloat(balance) / divisor;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
}

function calculateTokenValue(balance, decimals, price) {
  if (!balance || !price) return 0;
  const divisor = Math.pow(10, decimals || 18);
  const tokenAmount = parseFloat(balance) / divisor;
  return tokenAmount * parseFloat(price);
}
</script>

<style scoped>
.eth-network-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(98, 126, 234, 0.1) 0%, rgba(76, 95, 213, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(98, 126, 234, 0.2);
}

.header-icon {
  padding: 12px;
  background: linear-gradient(135deg, #627eea 0%, #4c5fd5 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #627eea;
}

.section-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #888;
}

.scan-card {
  margin-bottom: 24px;
  border: 2px solid rgba(98, 126, 234, 0.3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  border: 2px solid rgba(98, 126, 234, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 18px;
  font-weight: 700;
  color: #e5e7eb;
}

.eth-balance {
  color: #627eea;
  text-shadow: 0 0 10px rgba(98, 126, 234, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 2px dashed rgba(98, 126, 234, 0.3);
  margin-top: 24px;
}

.empty-state h3 {
  margin: 20px 0 8px 0;
  font-size: 20px;
  color: #627eea;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #888;
  max-width: 400px;
}

/* NFT Collections Grid */
.nft-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nft-collection-section {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nft-collection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nft-header-logo-container {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(236, 72, 153, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nft-header-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-header-logo-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
}

.nft-collection-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nft-collection-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.nft-collection-symbol {
  margin: 0;
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.nft-balance-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(236, 72, 153, 0.15);
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #ec4899;
  width: fit-content;
}

.nft-actions {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* NFT Images Grid */
.nft-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  padding: 12px 0;
}

.nft-image-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nft-image-wrapper {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(236, 72, 153, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.nft-image-item:hover .nft-image-wrapper {
  transform: scale(1.05);
  border-color: rgba(236, 72, 153, 0.5);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
}

.nft-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.nft-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
}

.nft-token-id {
  font-size: 12px;
  font-weight: 700;
  color: #ec4899;
}

.nft-item-name {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: #ccc;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.nft-item-owner {
  margin: 0;
  font-size: 10px;
  font-weight: 500;
  color: #888;
  text-align: center;
  font-family: 'Courier New', monospace;
}

/* Collection Stats */
.collection-stats {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: rgba(236, 72, 153, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: #888;
  font-weight: 600;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #ec4899;
}
</style>
