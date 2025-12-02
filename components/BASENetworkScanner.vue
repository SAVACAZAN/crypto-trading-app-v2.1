<template>
  <div class="base-scanner">
    <!-- Address Display Card -->
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Base Network Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button
            type="info"
            @click="openBasescan"
            :disabled="!props.walletAddress"
          >
            View on Basescan →
          </n-button>
          <n-button
            type="success"
            @click="addToMetaMask"
            ghost
          >
            🦊 Add BASE to MetaMask
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- Loading State -->
    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Base network...</div>
    </div>

    <!-- Main Content -->
    <div v-else-if="props.walletAddress">
      <!-- Balance Overview Card -->
      <n-card title="💰 Base Network Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3 l:3" responsive="screen" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="ETH Balance (on Base)" :value="baseBalance">
              <template #suffix>
                <span style="font-size: 14px; color: #0052FF;">ETH</span>
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
      <n-card title="🪙 Tokens on Base Network" style="margin-bottom: 20px;">
        <n-data-table
          :columns="tokenColumns"
          :data="tokens"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          striped
        />
        <div v-if="tokens.length === 0" style="text-align: center; padding: 40px; color: #999;">
          No tokens with balance found on Base network
        </div>
      </n-card>

      <!-- Network Info Card -->
      <n-card title="ℹ️ Base Network Information">
        <div class="info-grid">
          <div class="info-item">
            <strong>Network:</strong> Base (Coinbase Layer 2)
          </div>
          <div class="info-item">
            <strong>Chain ID:</strong> 8453
          </div>
          <div class="info-item">
            <strong>RPC Endpoint:</strong> https://mainnet.base.org
          </div>
          <div class="info-item">
            <strong>Block Explorer:</strong> <a href="https://basescan.org" target="_blank">Basescan</a>
          </div>
          <div class="info-item">
            <strong>Native Token:</strong> ETH
          </div>
          <div class="info-item">
            <strong>Scanning:</strong> ERC-20 tokens only (NFTs not included)
          </div>
        </div>
      </n-card>
    </div>

    <!-- No Address Selected -->
    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🔵</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Wallet Selected</div>
      <div style="color: #666;">Please select a Hyperliquid account to scan on Base network</div>
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
const baseBalance = ref('0.000000');
const tokens = ref([]);
const tokenCount = computed(() => tokens.value.length);
const usdValue = computed(() => {
  const ethPrice = 2500; // Approximate ETH price
  const ethBal = parseFloat(baseBalance.value);
  const tokensUsd = tokens.value.reduce((sum, token) => sum + parseFloat(token.valueUsd || 0), 0);
  return ((ethBal * ethPrice) + tokensUsd).toFixed(2);
});

// Popular Base network tokens
const BASE_TOKENS = [
  { name: 'USD Coin', symbol: 'USDC', contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  { name: 'Wrapped Ether', symbol: 'WETH', contract: '0x4200000000000000000000000000000000000006', decimals: 18 },
  { name: 'Dai Stablecoin', symbol: 'DAI', contract: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18 },
  { name: 'Coinbase Wrapped BTC', symbol: 'cbBTC', contract: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', decimals: 8 },
  { name: 'Aerodrome Finance', symbol: 'AERO', contract: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18 },
  { name: 'Seamless Protocol', symbol: 'SEAM', contract: '0x1C7a460413dD4e964f96D8dFC56E7223cE88CD85', decimals: 18 },
  { name: 'Brett', symbol: 'BRETT', contract: '0x532f27101965dd16442E59d40670FaF5eBB142E4', decimals: 18 },
  { name: 'Morpho', symbol: 'MORPHO', contract: '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842', decimals: 18 },
  { name: 'Renzo Restaked ETH', symbol: 'ezETH', contract: '0x2416092f143378750bb29b79eD961ab195CcEea5', decimals: 18 },
  { name: 'Wrapped liquid staked Ether', symbol: 'wstETH', contract: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', decimals: 18 },
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
          href: `https://basescan.org/token/${row.contract}?a=${props.walletAddress}`,
          target: '_blank',
          style: 'color: #0052FF; text-decoration: none;'
        },
        'View on Basescan →'
      );
    }
  }
];

// Fetch wallet data from Base network
async function fetchWalletData() {
  if (!props.walletAddress) return;

  console.log(`🔍 Scanning Base network address: ${props.walletAddress.substring(0, 6)}...${props.walletAddress.substring(props.walletAddress.length - 4)}`);
  loading.value = true;

  try {
    // Connect to Base network
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');

    // Get ETH balance on Base
    const balance = await provider.getBalance(props.walletAddress);
    baseBalance.value = parseFloat(ethers.formatEther(balance)).toFixed(6);
    console.log(`💰 ETH Balance on Base: ${baseBalance.value} ETH`);

    // Scan for tokens on Base network
    const foundTokens = [];
    let scannedCount = 0;

    for (const tokenInfo of BASE_TOKENS) {
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
    console.log(`✅ Scanned ${scannedCount} tokens, found ${foundTokens.length} with balance > 0 on Base`);

  } catch (error) {
    console.error('❌ Error fetching Base wallet data:', error);
  } finally {
    loading.value = false;
  }
}

// Calculate approximate USD value
function calculateUsdValue(symbol, balance) {
  const prices = {
    'USDC': 1,
    'DAI': 1,
    'WETH': 2500,
    'cbBTC': 65000,
    'AERO': 0.85,
    'SEAM': 1.2,
    'BRETT': 0.15,
    'MORPHO': 2.5,
    'ezETH': 2500,
    'wstETH': 2900
  };

  const price = prices[symbol] || 0;
  return (balance * price).toFixed(2);
}

// Open Basescan
function openBasescan() {
  if (props.walletAddress) {
    window.open(`https://basescan.org/address/${props.walletAddress}`, '_blank');
  }
}

// Add BASE Network to MetaMask
async function addToMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed! Please install MetaMask extension.');
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x2105', // 8453 in hex
        chainName: 'Base',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org']
      }]
    });
    console.log('✅ BASE Network added to MetaMask successfully!');
  } catch (error) {
    console.error('❌ Error adding BASE Network to MetaMask:', error);
    if (error.code === 4001) {
      alert('You rejected the request to add BASE Network.');
    } else {
      alert('Failed to add BASE Network to MetaMask. Please try again.');
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
.base-scanner {
  max-width: 1200px;
  margin: 0 auto;
}

.address-card {
  background: linear-gradient(135deg, #0052FF 0%, #0041CC 100%);
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
  color: #0052FF;
  margin-right: 8px;
}

.info-item a {
  color: #0052FF;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}
</style>
