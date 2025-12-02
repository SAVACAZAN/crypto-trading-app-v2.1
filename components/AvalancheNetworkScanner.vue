<template>
  <div class="avalanche-scanner">
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Avalanche C-Chain Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button type="error" @click="openSnowTrace" :disabled="!props.walletAddress">
            View on SnowTrace →
          </n-button>
          <n-button type="success" @click="addToMetaMask" ghost>
            🦊 Add Avalanche to MetaMask
          </n-button>
        </div>
      </div>
    </n-card>

    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Avalanche network...</div>
    </div>

    <div v-else-if="props.walletAddress">
      <n-card title="💰 Avalanche Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="AVAX Balance" :value="avaxBalance">
              <template #suffix><span style="color: #E84142;">AVAX</span></template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="USD Value" :value="usdValue">
              <template #prefix>$</template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="Token Count" :value="tokenCount">
              <template #prefix>🪙</template>
            </n-statistic>
          </n-gi>
        </n-grid>
      </n-card>

      <n-card title="🪙 Tokens on Avalanche C-Chain" style="margin-bottom: 20px;">
        <n-data-table :columns="tokenColumns" :data="tokens" :pagination="{ pageSize: 10 }" striped />
        <div v-if="tokens.length === 0" style="text-align: center; padding: 40px; color: #999;">
          No tokens found
        </div>
      </n-card>

      <n-card title="ℹ️ Avalanche Network Info">
        <div class="info-grid">
          <div class="info-item"><strong>Network:</strong> Avalanche C-Chain</div>
          <div class="info-item"><strong>Chain ID:</strong> 43114</div>
          <div class="info-item"><strong>RPC:</strong> https://api.avax.network/ext/bc/C/rpc</div>
          <div class="info-item"><strong>Explorer:</strong> <a href="https://snowtrace.io" target="_blank">SnowTrace</a></div>
          <div class="info-item"><strong>Native Token:</strong> AVAX</div>
          <div class="info-item"><strong>Scanning:</strong> ERC-20 tokens only</div>
        </div>
      </n-card>
    </div>

    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🔺</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Wallet Selected</div>
      <div style="color: #666;">Select a Hyperliquid account to scan</div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
// import { ethers } from 'ethers';

const props = defineProps({ walletAddress: { type: String, default: '' } });

const loading = ref(false);
const avaxBalance = ref('0.000000');
const tokens = ref([]);
const tokenCount = computed(() => tokens.value.length);
const usdValue = computed(() => {
  const avaxPrice = 35;
  return ((parseFloat(avaxBalance.value) * avaxPrice) + tokens.value.reduce((sum, t) => sum + parseFloat(t.valueUsd || 0), 0)).toFixed(2);
});

const AVALANCHE_TOKENS = [
  { name: 'USD Coin', symbol: 'USDC', contract: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 },
  { name: 'Tether USD', symbol: 'USDT', contract: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6 },
  { name: 'Wrapped AVAX', symbol: 'WAVAX', contract: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18 },
  { name: 'Wrapped Ether', symbol: 'WETH.e', contract: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', decimals: 18 },
  { name: 'Dai', symbol: 'DAI.e', contract: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', decimals: 18 },
  { name: 'Wrapped BTC', symbol: 'WBTC.e', contract: '0x50b7545627a5162F82A992c33b87aDc75187B218', decimals: 8 },
  { name: 'Trader Joe', symbol: 'JOE', contract: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', decimals: 18 },
  { name: 'Benqi', symbol: 'QI', contract: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5', decimals: 18 },
];

const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function symbol() view returns (string)', 'function name() view returns (string)'];

const tokenColumns = [
  { title: 'Token', key: 'name', render: (row) => `${row.name} (${row.symbol})` },
  { title: 'Balance', key: 'balance', align: 'right' },
  { title: 'Value (USD)', key: 'valueUsd', align: 'right', render: (row) => `$${row.valueUsd}` },
  { title: 'Contract', key: 'contract', render: (row) => `${row.contract.substring(0, 6)}...${row.contract.substring(row.contract.length - 4)}` },
  { title: 'Actions', key: 'actions', render: (row) => h('a', { href: `https://snowtrace.io/token/${row.contract}?a=${props.walletAddress}`, target: '_blank', style: 'color: #E84142;' }, 'View →') }
];

async function fetchWalletData() {
  if (!props.walletAddress) return;
  loading.value = true;
  try {
    const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const balance = await provider.getBalance(props.walletAddress);
    avaxBalance.value = parseFloat(ethers.formatEther(balance)).toFixed(6);

    const foundTokens = [];
    for (const tokenInfo of AVALANCHE_TOKENS) {
      try {
        const contract = new ethers.Contract(tokenInfo.contract, ERC20_ABI, provider);
        const bal = await contract.balanceOf(props.walletAddress);
        const formatted = parseFloat(ethers.formatUnits(bal, tokenInfo.decimals));
        if (formatted > 0) {
          foundTokens.push({
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            balance: formatted.toFixed(4),
            valueUsd: calculateUsdValue(tokenInfo.symbol, formatted),
            contract: tokenInfo.contract
          });
        }
      } catch (e) { console.error(`Error ${tokenInfo.symbol}:`, e.message); }
    }
    tokens.value = foundTokens;
  } catch (error) {
    console.error('Error fetching Avalanche data:', error);
  } finally {
    loading.value = false;
  }
}

function calculateUsdValue(symbol, balance) {
  const prices = { 'USDC': 1, 'USDT': 1, 'WAVAX': 35, 'WETH.e': 2500, 'DAI.e': 1, 'WBTC.e': 65000, 'JOE': 0.45, 'QI': 0.02 };
  return ((balance * (prices[symbol] || 0))).toFixed(2);
}

function openSnowTrace() {
  if (props.walletAddress) window.open(`https://snowtrace.io/address/${props.walletAddress}`, '_blank');
}

async function addToMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed! Please install MetaMask extension.');
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xa86a', // 43114 in hex
        chainName: 'Avalanche C-Chain',
        nativeCurrency: {
          name: 'Avalanche',
          symbol: 'AVAX',
          decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io']
      }]
    });
    console.log('✅ Avalanche Network added to MetaMask!');
  } catch (error) {
    console.error('❌ Error adding Avalanche to MetaMask:', error);
    if (error.code === 4001) {
      alert('You rejected the request to add Avalanche Network.');
    } else {
      alert('Failed to add Avalanche Network. Please try again.');
    }
  }
}

watch(() => props.walletAddress, (addr) => { if (addr) fetchWalletData(); });
onMounted(() => { if (props.walletAddress) fetchWalletData(); });
</script>

<style scoped>
.avalanche-scanner { max-width: 1200px; margin: 0 auto; }
.address-card { background: linear-gradient(135deg, #E84142 0%, #c23334 100%); border: none; }
.address-display { color: white; }
.address-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
.address-value { font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; word-break: break-all; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.info-item { padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 14px; }
.info-item strong { color: #E84142; margin-right: 8px; }
.info-item a { color: #E84142; text-decoration: none; }
</style>
