<template>
  <div class="arb-scanner">
    <n-spin :show="loading" description="Scanning Arbitrum network...">
      <div class="scanner-content">
        <!-- Wallet Address Display -->
        <n-card class="address-card" style="margin-bottom: 20px;">
          <div class="address-display">
            <div class="address-label">Scanning Arbitrum Address:</div>
            <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
            <n-button
              v-if="props.walletAddress"
              text
              type="info"
              size="small"
              @click="openArbiscan"
              style="margin-top: 8px;"
            >
              View on Arbiscan →
            </n-button>
          </div>
        </n-card>

        <!-- Wallet Overview -->
        <n-card title="Arbitrum Wallet Balance" class="overview-card">
          <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-statistic label="ETH Balance (on Arbitrum)" :value="arbBalance">
                <template #prefix>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d81e0" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </template>
                <template #suffix>ETH</template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="USD Value" :value="usdValue">
                <template #prefix>$</template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="Token Count" :value="tokenCount">
                <template #prefix>🪙</template>
              </n-statistic>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- Tokens List -->
        <n-card title="Tokens on Arbitrum" class="tokens-card" style="margin-top: 20px;">
          <template #header-extra>
            <n-button @click="fetchWalletData" :loading="loading" size="small" type="primary">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </template>
              Refresh
            </n-button>
          </template>

          <n-alert v-if="tokens.length === 0 && !loading" type="info" style="margin-bottom: 16px;">
            No tokens found on Arbitrum network for this address
          </n-alert>

          <n-data-table
            v-if="tokens.length > 0"
            :columns="tokenColumns"
            :data="tokens"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            striped
          />
        </n-card>

        <!-- Info Box -->
        <n-card title="ℹ️ Network Information" style="margin-top: 20px;">
          <n-space vertical :size="12">
            <div class="info-item">
              <strong>Network:</strong> Arbitrum One (Layer 2)
            </div>
            <div class="info-item">
              <strong>Chain ID:</strong> 42161
            </div>
            <div class="info-item">
              <strong>RPC:</strong> https://arb1.arbitrum.io/rpc
            </div>
            <div class="info-item">
              <strong>Explorer:</strong> <a href="https://arbiscan.io" target="_blank" rel="noopener">arbiscan.io</a>
            </div>
            <div class="info-item">
              <strong>Note:</strong> Scanning for ERC-20 tokens on Arbitrum network. NFTs are not included in this scan.
            </div>
          </n-space>
        </n-card>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
// import { ethers } from 'ethers';

const props = defineProps({
  walletAddress: {
    type: String,
    required: true
  }
});

// State
const loading = ref(false);
const arbBalance = ref('0.0000');
const usdValue = ref('0.00');
const tokenCount = ref(0);
const tokens = ref([]);
const transactions = ref([]);

// Token columns
const tokenColumns = [
  {
    title: 'Token',
    key: 'name',
    render: (row) => {
      return `${row.name} (${row.symbol})`;
    }
  },
  {
    title: 'Balance',
    key: 'balance',
    render: (row) => {
      return `${row.balance} ${row.symbol}`;
    }
  },
  {
    title: 'Value (USD)',
    key: 'valueUsd',
    render: (row) => {
      return `$${row.valueUsd}`;
    }
  },
  {
    title: 'Contract',
    key: 'contract',
    render: (row) => {
      return row.contract.substring(0, 6) + '...' + row.contract.substring(row.contract.length - 4);
    }
  }
];

// Transaction columns
const txColumns = [
  {
    title: 'Hash',
    key: 'hash',
    render: (row) => {
      return row.hash.substring(0, 10) + '...';
    }
  },
  {
    title: 'Type',
    key: 'type'
  },
  {
    title: 'Amount',
    key: 'amount'
  },
  {
    title: 'Status',
    key: 'status',
    render: (row) => {
      const color = row.status === 'Success' ? 'success' : 'error';
      return h('span', { style: { color: color === 'success' ? '#00ff88' : '#ff4444' } }, row.status);
    }
  },
  {
    title: 'Time',
    key: 'timestamp'
  }
];

// List of popular Arbitrum tokens
const ARBITRUM_TOKENS = [
  { name: 'USD Coin', symbol: 'USDC', contract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
  { name: 'Tether USD', symbol: 'USDT', contract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
  { name: 'Arbitrum', symbol: 'ARB', contract: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18 },
  { name: 'Wrapped BTC', symbol: 'WBTC', contract: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8 },
  { name: 'Wrapped Ether', symbol: 'WETH', contract: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 },
  { name: 'Dai Stablecoin', symbol: 'DAI', contract: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 },
  { name: 'Chainlink', symbol: 'LINK', contract: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', decimals: 18 },
  { name: 'Uniswap', symbol: 'UNI', contract: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', decimals: 18 },
  { name: 'GMX', symbol: 'GMX', contract: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', decimals: 18 },
  { name: 'Pendle', symbol: 'PENDLE', contract: '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', decimals: 18 },
  { name: 'Radiant', symbol: 'RDNT', contract: '0x3082CC23568eA640225c2467653dB90e9250AaA0', decimals: 18 },
  { name: 'Magic', symbol: 'MAGIC', contract: '0x539bdE0d7Dbd336b79148AA742883198BBF60342', decimals: 18 }
];

// ERC-20 ABI for balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// Function to open Arbiscan
function openArbiscan() {
  if (props.walletAddress) {
    window.open(`https://arbiscan.io/address/${props.walletAddress}`, '_blank');
  }
}

// Functions
async function fetchWalletData() {
  if (!props.walletAddress) {
    console.warn('⚠️ No wallet address provided');
    return;
  }

  console.log(`🔍 Scanning Arbitrum address: ${props.walletAddress.substring(0, 6)}...${props.walletAddress.substring(props.walletAddress.length - 4)}`);
  loading.value = true;

  try {
    // Connect to Arbitrum network
    const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

    // Get ETH balance on Arbitrum
    const balance = await provider.getBalance(props.walletAddress);
    arbBalance.value = parseFloat(ethers.formatEther(balance)).toFixed(6);
    console.log(`💰 ETH Balance on Arbitrum: ${arbBalance.value} ETH`);

    // Get ETH price (placeholder - in production use price API)
    const ethPriceUsd = 3800; // Placeholder
    usdValue.value = (parseFloat(arbBalance.value) * ethPriceUsd).toFixed(2);
    console.log(`💵 ETH Price: $${ethPriceUsd} | Balance USD: $${usdValue.value}`);

    // Scan for tokens on Arbitrum
    console.log(`🔍 Checking ${ARBITRUM_TOKENS.length} token contracts on Arbitrum...`);
    const foundTokens = [];

    for (const tokenInfo of ARBITRUM_TOKENS) {
      try {
        const tokenContract = new ethers.Contract(
          tokenInfo.contract,
          ERC20_ABI,
          provider
        );

        console.log(`🔎 Checking ${tokenInfo.symbol} (${tokenInfo.contract.substring(0, 6)}...${tokenInfo.contract.substring(tokenInfo.contract.length - 4)})`);

        const balance = await tokenContract.balanceOf(props.walletAddress);
        const balanceFormatted = parseFloat(ethers.formatUnits(balance, tokenInfo.decimals));

        console.log(`💾 Balance raw: ${balance.toString()}`);

        if (balanceFormatted > 0) {
          console.log(`✅ HAS BALANCE > 0!`);
          console.log(`✅ ${tokenInfo.symbol}: ${balanceFormatted.toFixed(4)}`);

          // Estimate USD value (placeholder)
          let usdValue = '0.00';
          if (tokenInfo.symbol === 'USDC' || tokenInfo.symbol === 'USDT' || tokenInfo.symbol === 'DAI') {
            usdValue = balanceFormatted.toFixed(2);
          } else if (tokenInfo.symbol === 'WETH') {
            usdValue = (balanceFormatted * 3800).toFixed(2);
          } else if (tokenInfo.symbol === 'ARB') {
            usdValue = (balanceFormatted * 0.75).toFixed(2); // ARB price placeholder
          }

          foundTokens.push({
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            balance: balanceFormatted.toFixed(4),
            valueUsd: usdValue,
            contract: tokenInfo.contract
          });
        }
      } catch (error) {
        console.log(`  ⏭️  Skipped ${tokenInfo.symbol}: ${error.message}`);
      }
    }

    tokens.value = foundTokens;
    tokenCount.value = foundTokens.length;

    console.log(`✅ Found ${foundTokens.length} tokens with balance > 0 on Arbitrum`);
  } catch (error) {
    console.error('❌ Error fetching ARB wallet data:', error);
    window.$message?.error('Failed to fetch Arbitrum wallet data');
  } finally {
    loading.value = false;
  }
}

// Watch for wallet address changes
watch(() => props.walletAddress, (newAddress) => {
  if (newAddress) {
    fetchWalletData();
  }
});

// Mount
onMounted(() => {
  if (props.walletAddress) {
    fetchWalletData();
  }
});
</script>

<style scoped>
.arb-scanner {
  min-height: 400px;
}

.scanner-content {
  width: 100%;
}

.address-card {
  border: 1px solid rgba(45, 129, 224, 0.3);
  background: rgba(45, 129, 224, 0.05);
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
  color: #2d81e0;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  word-break: break-all;
}

.overview-card,
.tokens-card,
.transactions-card {
  border: 1px solid rgba(45, 129, 224, 0.2);
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
  color: #2d81e0;
  font-size: 24px;
  font-weight: 600;
}

.info-item {
  padding: 12px;
  background: rgba(45, 129, 224, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(45, 129, 224, 0.15);
  font-size: 13px;
  line-height: 1.6;
}

.info-item strong {
  color: #2d81e0;
  margin-right: 8px;
}

.info-item a {
  color: #2d81e0;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}
</style>
