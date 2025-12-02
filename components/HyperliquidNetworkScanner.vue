<template>
  <div class="hyperliquid-scanner">
    <n-spin :show="loading" description="Scanning Hyperliquid network...">
      <div class="scanner-content">
        <!-- Wallet Address Display -->
        <n-card class="address-card" style="margin-bottom: 20px;">
          <div class="address-display">
            <div class="address-label">Scanning Hyperliquid Address:</div>
            <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
            <n-button
              v-if="props.walletAddress"
              text
              type="info"
              size="small"
              @click="openExplorer"
              style="margin-top: 8px;"
            >
              View on Hyperliquid Explorer →
            </n-button>
          </div>
        </n-card>

        <!-- Account Overview -->
        <n-card title="💰 Hyperliquid Account Balance" class="overview-card">
          <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="Spot Balance" :value="spotBalance">
                <template #prefix>$</template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="Perp Balance" :value="perpBalance">
                <template #prefix>$</template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="Total Account Value" :value="totalBalance">
                <template #prefix>
                  <span style="color: #00ff88;">$</span>
                </template>
              </n-statistic>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- Spot Assets -->
        <n-card title="🪙 Spot Wallet Assets" class="tokens-card" style="margin-top: 20px;">
          <template #header-extra>
            <n-button @click="fetchAccountData" :loading="loading" size="small" type="primary">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </template>
              Refresh
            </n-button>
          </template>

          <n-alert v-if="spotAssets.length === 0 && !loading" type="info" style="margin-bottom: 16px;">
            No spot assets found for this address
          </n-alert>

          <n-data-table
            v-if="spotAssets.length > 0"
            :columns="spotColumns"
            :data="spotAssets"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            striped
          />
        </n-card>

        <!-- Perps Wallet Assets -->
        <n-card title="💎 Perps Wallet Assets" class="tokens-card" style="margin-top: 20px;">
          <n-alert v-if="perpAssets.length === 0 && !loading" type="info" style="margin-bottom: 16px;">
            No assets found in Perpetuals account
          </n-alert>

          <n-data-table
            v-if="perpAssets.length > 0"
            :columns="perpAssetsColumns"
            :data="perpAssets"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            striped
          />

          <!-- Perp Summary -->
          <div v-if="perpSummary" style="margin-top: 20px;">
            <n-divider />
            <n-grid cols="2 s:3 m:4" :x-gap="12" :y-gap="12">
              <n-grid-item>
                <div class="summary-item">
                  <div class="summary-label">Account Value:</div>
                  <div class="summary-value">${{ perpSummary.accountValue }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="summary-item">
                  <div class="summary-label">Margin Used:</div>
                  <div class="summary-value">${{ perpSummary.totalMarginUsed }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="summary-item">
                  <div class="summary-label">Withdrawable:</div>
                  <div class="summary-value success">${{ perpSummary.withdrawable }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="summary-item">
                  <div class="summary-label">Total Position:</div>
                  <div class="summary-value">${{ perpSummary.totalNtlPos }}</div>
                </div>
              </n-grid-item>
            </n-grid>
          </div>
        </n-card>

        <!-- Perp Positions -->
        <n-card title="📈 Perpetual Positions" class="tokens-card" style="margin-top: 20px;">
          <n-alert v-if="perpPositions.length === 0 && !loading" type="info" style="margin-bottom: 16px;">
            No open perpetual positions
          </n-alert>

          <n-data-table
            v-if="perpPositions.length > 0"
            :columns="perpColumns"
            :data="perpPositions"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            striped
          />
        </n-card>

        <!-- Network Info -->
        <n-card title="ℹ️ Hyperliquid Network Information" style="margin-top: 20px;">
          <n-space vertical :size="12">
            <div class="info-item">
              <strong>Network:</strong> Hyperliquid (L1 Blockchain)
            </div>
            <div class="info-item">
              <strong>Type:</strong> Spot & Perpetuals Trading
            </div>
            <div class="info-item">
              <strong>Explorer:</strong> <a href="https://hyperliquid.xyz" target="_blank" rel="noopener">hyperliquid.xyz</a>
            </div>
            <div class="info-item">
              <strong>API:</strong> https://api.hyperliquid.xyz
            </div>
            <div class="info-item">
              <strong>Note:</strong> This scanner shows your Spot wallet balance and Perpetuals positions. Data is fetched directly from Hyperliquid public API.
            </div>
          </n-space>
        </n-card>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { h } from 'vue';

const props = defineProps({
  walletAddress: {
    type: String,
    required: true
  }
});

// State
const loading = ref(false);
const spotBalance = ref('0.00');
const perpBalance = ref('0.00');
const totalBalance = ref('0.00');
const spotAssets = ref([]);
const perpAssets = ref([]);
const perpPositions = ref([]);
const perpSummary = ref(null);

// Spot Assets Columns
const spotColumns = [
  {
    title: 'Asset',
    key: 'coin',
    render: (row) => h('span', { style: { fontWeight: 600, color: '#00ff88' } }, row.coin)
  },
  {
    title: 'Total',
    key: 'total',
    render: (row) => `${parseFloat(row.total).toFixed(6)}`
  },
  {
    title: 'Hold',
    key: 'hold',
    render: (row) => `${parseFloat(row.hold).toFixed(6)}`
  },
  {
    title: 'Available',
    key: 'available',
    render: (row) => {
      const available = parseFloat(row.total) - parseFloat(row.hold);
      return h('span', { style: { color: '#00ff88' } }, available.toFixed(6));
    }
  },
  {
    title: 'USD Value (Est)',
    key: 'usdValue',
    render: (row) => {
      const value = row.coin === 'USDC' ? parseFloat(row.total) : 0;
      return `$${value.toFixed(2)}`;
    }
  }
];

// Perps Wallet Assets Columns
const perpAssetsColumns = [
  {
    title: 'Asset',
    key: 'coin',
    render: (row) => h('span', { style: { fontWeight: 600, color: '#00ff88' } }, row.coin)
  },
  {
    title: 'Position',
    key: 'position',
    render: (row) => {
      const posVal = parseFloat(row.position);
      const color = posVal !== 0 ? '#00ff88' : '#888';
      return h('span', { style: { color } }, posVal.toFixed(6));
    }
  },
  {
    title: 'USD Value',
    key: 'usdValue',
    render: (row) => `$${parseFloat(row.usdValue).toFixed(2)}`
  },
  {
    title: 'Unrealized PnL',
    key: 'unrealizedPnl',
    render: (row) => {
      const pnl = parseFloat(row.unrealizedPnl);
      const color = pnl >= 0 ? '#00ff88' : '#ff4444';
      return h('span', { style: { color, fontWeight: 600 } }, `$${pnl.toFixed(2)}`);
    }
  }
];

// Perp Positions Columns
const perpColumns = [
  {
    title: 'Coin',
    key: 'coin',
    render: (row) => h('span', { style: { fontWeight: 600, color: '#00ff88' } }, row.coin)
  },
  {
    title: 'Size',
    key: 'szi',
    render: (row) => {
      const szi = parseFloat(row.szi);
      const color = szi > 0 ? '#00ff88' : '#ff4444';
      return h('span', { style: { color } }, szi.toFixed(4));
    }
  },
  {
    title: 'Entry Price',
    key: 'entryPx',
    render: (row) => `$${parseFloat(row.entryPx).toFixed(2)}`
  },
  {
    title: 'Leverage',
    key: 'leverage',
    render: (row) => `${row.leverage.value}x`
  },
  {
    title: 'Unrealized PnL',
    key: 'unrealizedPnl',
    render: (row) => {
      const pnl = parseFloat(row.unrealizedPnl);
      const color = pnl >= 0 ? '#00ff88' : '#ff4444';
      return h('span', { style: { color, fontWeight: 600 } }, `$${pnl.toFixed(2)}`);
    }
  },
  {
    title: 'Margin Used',
    key: 'marginUsed',
    render: (row) => `$${parseFloat(row.marginUsed).toFixed(2)}`
  },
  {
    title: 'Liq. Price',
    key: 'liquidationPx',
    render: (row) => {
      const liqPx = parseFloat(row.liquidationPx);
      return liqPx > 0 ? `$${liqPx.toFixed(2)}` : 'N/A';
    }
  }
];

// Open Hyperliquid Explorer
function openExplorer() {
  if (props.walletAddress) {
    window.open(`https://app.hyperliquid.xyz/explorer/${props.walletAddress}`, '_blank');
  }
}

// Fetch Account Data from Hyperliquid API
async function fetchAccountData() {
  if (!props.walletAddress) {
    console.warn('⚠️ No wallet address provided');
    return;
  }

  console.log(`🔍 Scanning Hyperliquid address: ${props.walletAddress.substring(0, 6)}...${props.walletAddress.substring(props.walletAddress.length - 4)}`);
  loading.value = true;

  try {
    // Fetch Spot Balance
    console.log('📊 Fetching Spot balance...');
    const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spotClearinghouseState',
        user: props.walletAddress
      })
    });

    const spotData = await spotResponse.json();
    console.log('Spot data:', spotData);

    // Process Spot Assets
    if (spotData && spotData.balances) {
      spotAssets.value = spotData.balances.map(b => ({
        coin: b.coin,
        total: b.total || '0',
        hold: b.hold || '0'
      }));

      // Calculate Spot Balance (assuming USDC)
      const usdcBalance = spotData.balances.find(b => b.coin === 'USDC');
      spotBalance.value = usdcBalance ? parseFloat(usdcBalance.total).toFixed(2) : '0.00';
    } else {
      spotAssets.value = [];
      spotBalance.value = '0.00';
    }

    // Fetch Perp Balance
    console.log('📊 Fetching Perp balance...');
    const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: props.walletAddress
      })
    });

    const perpData = await perpResponse.json();
    console.log('Perp data:', perpData);

    // Process Perp Assets (all assets including USDC collateral)
    if (perpData && perpData.assetPositions) {
      perpAssets.value = perpData.assetPositions.map(p => ({
        coin: p.position.coin,
        position: p.position.szi || '0',
        usdValue: p.position.positionValue || '0',
        unrealizedPnl: p.position.unrealizedPnl || '0'
      }));

      // Process Perp Positions (only open positions with non-zero size)
      perpPositions.value = perpData.assetPositions
        .filter(p => p.position && parseFloat(p.position.szi) !== 0)
        .map(p => ({
          coin: p.position.coin,
          szi: p.position.szi,
          entryPx: p.position.entryPx,
          leverage: p.position.leverage,
          unrealizedPnl: p.position.unrealizedPnl,
          marginUsed: p.position.marginUsed,
          liquidationPx: p.position.liquidationPx || 0,
          positionValue: p.position.positionValue
        }));
    } else {
      perpAssets.value = [];
      perpPositions.value = [];
    }

    // Process Perp Summary
    if (perpData && perpData.marginSummary) {
      perpSummary.value = {
        accountValue: parseFloat(perpData.marginSummary.accountValue || 0).toFixed(2),
        totalMarginUsed: parseFloat(perpData.marginSummary.totalMarginUsed || 0).toFixed(2),
        totalNtlPos: parseFloat(perpData.marginSummary.totalNtlPos || 0).toFixed(2),
        withdrawable: parseFloat(perpData.marginSummary.withdrawable || 0).toFixed(2)
      };

      perpBalance.value = perpSummary.value.accountValue;
    } else {
      perpBalance.value = '0.00';
    }

    // Calculate Total Balance
    totalBalance.value = (parseFloat(spotBalance.value) + parseFloat(perpBalance.value)).toFixed(2);

    console.log(`✅ Spot Balance: $${spotBalance.value}`);
    console.log(`✅ Perp Balance: $${perpBalance.value}`);
    console.log(`✅ Total Balance: $${totalBalance.value}`);

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid account data:', error);
    window.$message?.error('Failed to fetch Hyperliquid account data');
  } finally {
    loading.value = false;
  }
}

// Watch for wallet address changes
watch(() => props.walletAddress, (newAddress) => {
  if (newAddress) {
    fetchAccountData();
  }
});

// Mount
onMounted(() => {
  if (props.walletAddress) {
    fetchAccountData();
  }
});
</script>

<style scoped>
.hyperliquid-scanner {
  min-height: 400px;
}

.scanner-content {
  width: 100%;
}

.address-card {
  border: 1px solid rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.05);
}

.address-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-label {
  font-size: 13px;
  color: #888;
  font-weight: 600;
}

.address-value {
  font-size: 14px;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  word-break: break-all;
}

.overview-card,
.tokens-card {
  border: 1px solid rgba(0, 255, 136, 0.2);
  background: rgba(10, 10, 10, 0.5);
}

.overview-card :deep(.n-statistic) {
  text-align: center;
}

.overview-card :deep(.n-statistic__label) {
  color: #888;
  font-size: 13px;
  margin-bottom: 8px;
}

.overview-card :deep(.n-statistic__value) {
  color: #00ff88;
  font-size: 24px;
  font-weight: 600;
}

.summary-item {
  padding: 12px;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 136, 0.15);
}

.summary-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  color: #00ff88;
  font-weight: 600;
}

.summary-value.success {
  color: #00ff88;
}

.info-item {
  padding: 12px;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 136, 0.15);
  font-size: 13px;
  line-height: 1.6;
}

.info-item strong {
  color: #00ff88;
  margin-right: 8px;
}

.info-item a {
  color: #00ff88;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}
</style>
