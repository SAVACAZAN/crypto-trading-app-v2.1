<template>
  <div class="optimism-scanner">
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Optimism Network Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button type="error" @click="openOptimisticEtherscan" :disabled="!props.walletAddress">
            View on Optimistic Etherscan →
          </n-button>
          <n-button type="success" @click="addToMetaMask" ghost>
            🦊 Add Optimism to MetaMask
          </n-button>
        </div>
      </div>
    </n-card>

    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Optimism network...</div>
    </div>

    <div v-else-if="props.walletAddress">
      <n-card title="💰 Optimism Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="ETH Balance (on Optimism)" :value="optimismBalance">
              <template #suffix><span style="color: #FF0420;">ETH</span></template>
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

      <n-card title="🪙 Tokens on Optimism" style="margin-bottom: 20px;">
        <n-data-table :columns="tokenColumns" :data="tokens" :pagination="{ pageSize: 10 }" striped />
        <div v-if="tokens.length === 0" style="text-align: center; padding: 40px; color: #999;">
          No tokens found
        </div>
      </n-card>

      <n-card title="ℹ️ Optimism Network Info">
        <div class="info-grid">
          <div class="info-item"><strong>Network:</strong> Optimism (Layer 2)</div>
          <div class="info-item"><strong>Chain ID:</strong> 10</div>
          <div class="info-item"><strong>RPC:</strong> https://mainnet.optimism.io</div>
          <div class="info-item"><strong>Explorer:</strong> <a href="https://optimistic.etherscan.io" target="_blank">Optimistic Etherscan</a></div>
          <div class="info-item"><strong>Native Token:</strong> ETH</div>
          <div class="info-item"><strong>Scanning:</strong> ERC-20 tokens only</div>
        </div>
      </n-card>
    </div>

    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🔴</div>
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
const optimismBalance = ref('0.000000');
const tokens = ref([]);
const tokenCount = computed(() => tokens.value.length);
const usdValue = computed(() => {
  const ethPrice = 2500;
  return ((parseFloat(optimismBalance.value) * ethPrice) + tokens.value.reduce((sum, t) => sum + parseFloat(t.valueUsd || 0), 0)).toFixed(2);
});

const OPTIMISM_TOKENS = [
  { name: 'USD Coin', symbol: 'USDC', contract: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6 },
  { name: 'Tether USD', symbol: 'USDT', contract: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
  { name: 'Optimism', symbol: 'OP', contract: '0x4200000000000000000000000000000000000042', decimals: 18 },
  { name: 'Wrapped Ether', symbol: 'WETH', contract: '0x4200000000000000000000000000000000000006', decimals: 18 },
  { name: 'Dai', symbol: 'DAI', contract: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 },
  { name: 'Wrapped BTC', symbol: 'WBTC', contract: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', decimals: 8 },
  { name: 'Synthetix', symbol: 'SNX', contract: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4', decimals: 18 },
  { name: 'Velodrome', symbol: 'VELO', contract: '0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db', decimals: 18 },
];

const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function symbol() view returns (string)', 'function name() view returns (string)'];

const tokenColumns = [
  { title: 'Token', key: 'name', render: (row) => `${row.name} (${row.symbol})` },
  { title: 'Balance', key: 'balance', align: 'right' },
  { title: 'Value (USD)', key: 'valueUsd', align: 'right', render: (row) => `$${row.valueUsd}` },
  { title: 'Contract', key: 'contract', render: (row) => `${row.contract.substring(0, 6)}...${row.contract.substring(row.contract.length - 4)}` },
  { title: 'Actions', key: 'actions', render: (row) => h('a', { href: `https://optimistic.etherscan.io/token/${row.contract}?a=${props.walletAddress}`, target: '_blank', style: 'color: #FF0420;' }, 'View →') }
];

async function fetchWalletData() {
  if (!props.walletAddress) return;
  loading.value = true;
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.optimism.io');
    const balance = await provider.getBalance(props.walletAddress);
    optimismBalance.value = parseFloat(ethers.formatEther(balance)).toFixed(6);

    const foundTokens = [];
    for (const tokenInfo of OPTIMISM_TOKENS) {
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
    console.error('Error fetching Optimism data:', error);
  } finally {
    loading.value = false;
  }
}

function calculateUsdValue(symbol, balance) {
  const prices = { 'USDC': 1, 'USDT': 1, 'OP': 2.5, 'WETH': 2500, 'DAI': 1, 'WBTC': 65000, 'SNX': 3.5, 'VELO': 0.15 };
  return ((balance * (prices[symbol] || 0))).toFixed(2);
}

function openOptimisticEtherscan() {
  if (props.walletAddress) window.open(`https://optimistic.etherscan.io/address/${props.walletAddress}`, '_blank');
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
        chainId: '0xa', // 10 in hex
        chainName: 'Optimism',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io']
      }]
    });
    console.log('✅ Optimism Network added to MetaMask!');
  } catch (error) {
    console.error('❌ Error adding Optimism to MetaMask:', error);
    if (error.code === 4001) {
      alert('You rejected the request to add Optimism Network.');
    } else {
      alert('Failed to add Optimism Network. Please try again.');
    }
  }
}

watch(() => props.walletAddress, (addr) => { if (addr) fetchWalletData(); });
onMounted(() => { if (props.walletAddress) fetchWalletData(); });
</script>

<style scoped>
.optimism-scanner { max-width: 1200px; margin: 0 auto; }
.address-card { background: linear-gradient(135deg, #FF0420 0%, #cc0319 100%); border: none; }
.address-display { color: white; }
.address-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
.address-value { font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; word-break: break-all; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.info-item { padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 14px; }
.info-item strong { color: #FF0420; margin-right: 8px; }
.info-item a { color: #FF0420; text-decoration: none; }
</style>
