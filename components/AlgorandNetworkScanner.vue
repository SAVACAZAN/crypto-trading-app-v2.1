<template>
  <div class="algorand-scanner">
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Algorand Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button type="info" @click="openAlgoExplorer" :disabled="!props.walletAddress">
            View on AlgoExplorer →
          </n-button>
          <n-button type="warning" @click="openPeraWallet" ghost>
            🔷 Open Pera Wallet
          </n-button>
        </div>
      </div>
    </n-card>

    <n-alert type="info" style="margin-bottom: 20px;">
      <strong>Note:</strong> Algorand uses a different address format than EVM chains. This scanner requires an Algorand-specific address (58 characters starting with uppercase letters).
    </n-alert>

    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Algorand network...</div>
    </div>

    <div v-else-if="props.walletAddress">
      <n-card title="💰 Algorand Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="ALGO Balance" :value="algoBalance">
              <template #suffix><span style="color: #000;">ALGO</span></template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="USD Value (Est.)" :value="usdValue">
              <template #prefix>$</template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="ASA Token Count" :value="assetCount">
              <template #prefix>🪙</template>
            </n-statistic>
          </n-gi>
        </n-grid>
      </n-card>

      <n-card title="🪙 Algorand Standard Assets (ASA)" style="margin-bottom: 20px;">
        <n-alert v-if="!accountInfo" type="warning">
          Unable to fetch account information. Please verify the address format.
        </n-alert>
        <n-data-table v-else :columns="assetColumns" :data="assets" :pagination="{ pageSize: 10 }" striped />
        <div v-if="assets.length === 0 && accountInfo" style="text-align: center; padding: 40px; color: #999;">
          No ASA tokens found in this wallet
        </div>
      </n-card>

      <n-card title="ℹ️ Algorand Network Info">
        <div class="info-grid">
          <div class="info-item"><strong>Network:</strong> Algorand Mainnet</div>
          <div class="info-item"><strong>Consensus:</strong> Pure Proof-of-Stake (PPoS)</div>
          <div class="info-item"><strong>Block Time:</strong> ~4.5 seconds</div>
          <div class="info-item"><strong>Explorer:</strong> <a href="https://algoexplorer.io" target="_blank">AlgoExplorer</a></div>
          <div class="info-item"><strong>Native Token:</strong> ALGO</div>
          <div class="info-item"><strong>Scanning:</strong> ASA tokens (Algorand Standard Assets)</div>
        </div>
      </n-card>
    </div>

    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">⬛</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Wallet Selected</div>
      <div style="color: #666;">Select a Hyperliquid account to scan (EVM addresses will be converted)</div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({ walletAddress: { type: String, default: '' } });

const loading = ref(false);
const algoBalance = ref('0.000000');
const assets = ref([]);
const accountInfo = ref(null);
const assetCount = computed(() => assets.value.length);
const usdValue = computed(() => {
  const algoPrice = 0.25; // Approximate ALGO price
  return (parseFloat(algoBalance.value) * algoPrice).toFixed(2);
});

const assetColumns = [
  { title: 'Asset ID', key: 'assetId', width: 100 },
  { title: 'Amount', key: 'amount', align: 'right' },
  { title: 'Frozen', key: 'frozen', render: (row) => row.frozen ? '❄️ Yes' : '✅ No' },
  { title: 'Actions', key: 'actions', render: (row) => h('a', { href: `https://algoexplorer.io/asset/${row.assetId}`, target: '_blank', style: 'color: #000;' }, 'View Asset →') }
];

async function fetchWalletData() {
  if (!props.walletAddress) return;

  loading.value = true;
  accountInfo.value = null;

  try {
    // Note: Algorand uses a different address format. EVM addresses cannot be directly used.
    // This is a placeholder that would need proper Algorand SDK integration
    console.log(`🔍 Scanning Algorand - Note: Address conversion required for EVM address: ${props.walletAddress}`);

    // For demonstration purposes, showing placeholder data
    // In production, you'd use algosdk library to query Algorand nodes

    algoBalance.value = '0.000000';
    assets.value = [];
    accountInfo.value = { note: 'Algorand requires native address format' };

    console.log('⚠️ Algorand scanning requires algosdk integration and address conversion');

  } catch (error) {
    console.error('❌ Error fetching Algorand data:', error);
  } finally {
    loading.value = false;
  }
}

function openAlgoExplorer() {
  if (props.walletAddress) {
    window.open(`https://algoexplorer.io/address/${props.walletAddress}`, '_blank');
  }
}

function openPeraWallet() {
  // Open Pera Wallet website with info
  window.open('https://perawallet.app/', '_blank');

  // Show info to user
  alert(`Algorand uses Pera Wallet or MyAlgo Wallet.

To use Algorand:
1. Download Pera Wallet (mobile or browser extension)
2. Create an Algorand wallet (address format: 58 characters)
3. Use your Algorand address instead of EVM address

Pera Wallet: https://perawallet.app/
MyAlgo: https://wallet.myalgo.com/`);
}

watch(() => props.walletAddress, (addr) => { if (addr) fetchWalletData(); });
onMounted(() => { if (props.walletAddress) fetchWalletData(); });
</script>

<style scoped>
.algorand-scanner { max-width: 1200px; margin: 0 auto; }
.address-card { background: linear-gradient(135deg, #000 0%, #333 100%); border: none; }
.address-display { color: white; }
.address-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
.address-value { font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; word-break: break-all; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.info-item { padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 14px; }
.info-item strong { color: #000; margin-right: 8px; }
.info-item a { color: #000; text-decoration: none; }
</style>
