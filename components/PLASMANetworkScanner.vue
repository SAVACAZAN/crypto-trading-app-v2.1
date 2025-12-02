<template>
  <div class="plasma-scanner">
    <!-- Address Display Card -->
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Plasma Network Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button
            type="info"
            @click="openExplorer"
            :disabled="!props.walletAddress"
          >
            View on Explorer →
          </n-button>
          <n-button
            type="success"
            @click="addToMetaMask"
            ghost
          >
            🦊 Add PLASMA to MetaMask
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- Loading State -->
    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Plasma network...</div>
    </div>

    <!-- Main Content -->
    <div v-else-if="props.walletAddress">
      <!-- Balance Overview Card -->
      <n-card title="💰 Plasma Network Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3 l:3" responsive="screen" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="ETH Balance (on Plasma)" :value="plasmaBalance">
              <template #suffix>
                <span style="font-size: 14px; color: #9333ea;">ETH</span>
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="USD Value (Estimated)" :value="usdValue">
              <template #prefix>
                <span style="color: #10b981;">$</span>
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="Token Count" :value="tokenCount">
              <template #prefix>
                <span style="font-size: 18px;">🪙</span>
              </template>
            </n-statistic>
          </n-gi>
        </n-grid>
      </n-card>

      <!-- Tokens Table -->
      <n-card title="🪙 Tokens on Plasma Network" style="margin-bottom: 20px;">
        <n-data-table
          :columns="tokenColumns"
          :data="tokens"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          striped
        />
        <div v-if="tokens.length === 0" style="text-align: center; padding: 40px; color: #999;">
          No tokens with balance found on Plasma network
        </div>
      </n-card>

      <!-- Network Info Card -->
      <n-card title="ℹ️ Plasma Network Information">
        <div class="info-grid">
          <div class="info-item">
            <strong>Network:</strong> Plasma (Ethereum Layer 2)
          </div>
          <div class="info-item">
            <strong>Chain ID:</strong> 369 (Mainnet)
          </div>
          <div class="info-item">
            <strong>RPC Endpoint:</strong> https://rpc.mainnet.pulsechain.com
          </div>
          <div class="info-item">
            <strong>Block Explorer:</strong> <a href="https://scan.pulsechain.com" target="_blank">PulseScan</a>
          </div>
          <div class="info-item">
            <strong>Native Token:</strong> PLS
          </div>
          <div class="info-item">
            <strong>Scanning:</strong> ERC-20 tokens only (NFTs not included)
          </div>
        </div>
      </n-card>
    </div>

    <!-- No Address Selected -->
    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🟣</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Wallet Selected</div>
      <div style="color: #666;">Please select a Hyperliquid account to scan on Plasma network</div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
// import { ethers } from 'ethers';

const props = defineProps({
  walletAddress: {
    type: String,
    default: ''
  }
});

// Reactive state
const loading = ref(false);
const plasmaBalance = ref('0.000000');
const tokens = ref([]);
const tokenCount = computed(() => tokens.value.length);
const usdValue = computed(() => {
  const plsPrice = 0.00001; // Approximate PLS price
  const plsBal = parseFloat(plasmaBalance.value);
  const tokensUsd = tokens.value.reduce((sum, token) => sum + parseFloat(token.valueUsd || 0), 0);
  return ((plsBal * plsPrice) + tokensUsd).toFixed(2);
});

// Popular PulseChain tokens (using PulseChain as reference for Plasma)
const PLASMA_TOKENS = [
  { name: 'Wrapped PLS', symbol: 'WPLS', contract: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', decimals: 18 },
  { name: 'PulseX', symbol: 'PLSX', contract: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', decimals: 18 },
  { name: 'Incentive Token', symbol: 'INC', contract: '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d', decimals: 18 },
  { name: 'Hex', symbol: 'HEX', contract: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', decimals: 8 },
  { name: 'USD Coin', symbol: 'USDC', contract: '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', decimals: 6 },
  { name: 'Tether USD', symbol: 'USDT', contract: '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f', decimals: 6 },
  { name: 'Dai Stablecoin', symbol: 'DAI', contract: '0xefD766cCb38EaF1dfd701853BFCe31359239F305', decimals: 18 },
  { name: 'Wrapped Ether', symbol: 'WETH', contract: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C', decimals: 18 },
];

// ERC-20 ABI
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// Token table columns
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
    align: 'right'
  },
  {
    title: 'Value (USD)',
    key: 'valueUsd',
    align: 'right',
    render: (row) => `$${row.valueUsd}`
  },
  {
    title: 'Contract',
    key: 'contract',
    render: (row) => {
      return `${row.contract.substring(0, 6)}...${row.contract.substring(row.contract.length - 4)}`;
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row) => {
      return h(
        'a',
        {
          href: `https://scan.pulsechain.com/token/${row.contract}?a=${props.walletAddress}`,
          target: '_blank',
          style: 'color: #9333ea; text-decoration: none;'
        },
        'View on Explorer →'
      );
    }
  }
];

// Fetch wallet data from Plasma/PulseChain network
async function fetchWalletData() {
  if (!props.walletAddress) return;

  console.log(`🔍 Scanning Plasma network address: ${props.walletAddress.substring(0, 6)}...${props.walletAddress.substring(props.walletAddress.length - 4)}`);
  loading.value = true;

  try {
    // Connect to PulseChain network
    const provider = new ethers.JsonRpcProvider('https://rpc.pulsechain.com');

    // Get PLS balance
    const balance = await provider.getBalance(props.walletAddress);
    plasmaBalance.value = parseFloat(ethers.formatEther(balance)).toFixed(6);
    console.log(`💰 PLS Balance on Plasma: ${plasmaBalance.value} PLS`);

    // Scan for tokens
    const foundTokens = [];
    let scannedCount = 0;

    for (const tokenInfo of PLASMA_TOKENS) {
      try {
        const tokenContract = new ethers.Contract(tokenInfo.contract, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(props.walletAddress);
        const balanceFormatted = parseFloat(ethers.formatUnits(balance, tokenInfo.decimals));

        scannedCount++;

        if (balanceFormatted > 0) {
          foundTokens.push({
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            balance: balanceFormatted.toFixed(4),
            valueUsd: calculateUsdValue(tokenInfo.symbol, balanceFormatted),
            contract: tokenInfo.contract
          });
          console.log(`  ✅ ${tokenInfo.symbol}: ${balanceFormatted.toFixed(4)}`);
        }
      } catch (error) {
        console.error(`  ❌ Error fetching ${tokenInfo.symbol}:`, error.message);
      }
    }

    tokens.value = foundTokens;
    console.log(`✅ Scanned ${scannedCount} tokens, found ${foundTokens.length} with balance > 0 on Plasma`);

  } catch (error) {
    console.error('❌ Error fetching Plasma wallet data:', error);
  } finally {
    loading.value = false;
  }
}

// Calculate approximate USD value
function calculateUsdValue(symbol, balance) {
  const prices = {
    'WPLS': 0.00001,
    'PLSX': 0.00002,
    'INC': 0.0001,
    'HEX': 0.005,
    'USDC': 1,
    'USDT': 1,
    'DAI': 1,
    'WETH': 2500
  };

  const price = prices[symbol] || 0;
  return (balance * price).toFixed(2);
}

// Open block explorer
function openExplorer() {
  if (props.walletAddress) {
    window.open(`https://scan.pulsechain.com/address/${props.walletAddress}`, '_blank');
  }
}

// Add PulseChain Network to MetaMask
async function addToMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed! Please install MetaMask extension.');
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x171', // 369 in hex
        chainName: 'PulseChain',
        nativeCurrency: {
          name: 'Pulse',
          symbol: 'PLS',
          decimals: 18
        },
        rpcUrls: ['https://rpc.pulsechain.com'],
        blockExplorerUrls: ['https://scan.pulsechain.com']
      }]
    });
    console.log('✅ PulseChain Network added to MetaMask successfully!');
  } catch (error) {
    console.error('❌ Error adding PulseChain Network to MetaMask:', error);
    if (error.code === 4001) {
      alert('You rejected the request to add PulseChain Network.');
    } else {
      alert('Failed to add PulseChain Network to MetaMask. Please try again.');
    }
  }
}

// Watch for wallet address changes
watch(() => props.walletAddress, (newAddress) => {
  if (newAddress) {
    fetchWalletData();
  }
});

// Fetch data on mount
onMounted(() => {
  if (props.walletAddress) {
    fetchWalletData();
  }
});
</script>

<style scoped>
.plasma-scanner {
  max-width: 1200px;
  margin: 0 auto;
}

.address-card {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  border: none;
}

.address-display {
  color: white;
}

.address-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.address-value {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
}

.info-item strong {
  color: #9333ea;
  margin-right: 8px;
}

.info-item a {
  color: #9333ea;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}
</style>
