<template>
  <div class="sui-scanner">
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Sui Network Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button type="info" @click="openSuiExplorer" :disabled="!props.walletAddress">
            View on Sui Explorer →
          </n-button>
          <n-button type="warning" @click="openSuiWallet" ghost>
            🌊 Open Sui Wallet
          </n-button>
        </div>
      </div>
    </n-card>

    <n-alert type="info" style="margin-bottom: 20px;">
      <strong>Note:</strong> Sui uses a unique address format (starts with "0x" and is 64 characters). EVM addresses need conversion.
    </n-alert>

    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Sui network...</div>
    </div>

    <div v-else-if="props.walletAddress">
      <n-card title="💰 Sui Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="SUI Balance" :value="suiBalance">
              <template #suffix><span style="color: #4da2ff;">SUI</span></template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="USD Value (Est.)" :value="usdValue">
              <template #prefix>$</template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="Coin Types" :value="coinCount">
              <template #prefix>🪙</template>
            </n-statistic>
          </n-gi>
        </n-grid>
      </n-card>

      <n-card title="🪙 Sui Coins" style="margin-bottom: 20px;">
        <n-alert v-if="!accountInfo" type="warning">
          Unable to fetch account information. Sui requires native address format.
        </n-alert>
        <n-data-table v-else :columns="coinColumns" :data="coins" :pagination="{ pageSize: 10 }" striped />
        <div v-if="coins.length === 0 && accountInfo" style="text-align: center; padding: 40px; color: #999;">
          No additional coins found in this wallet
        </div>
      </n-card>

      <n-card title="ℹ️ Sui Network Info">
        <div class="info-grid">
          <div class="info-item"><strong>Network:</strong> Sui Mainnet</div>
          <div class="info-item"><strong>Consensus:</strong> Narwhal & Bullshark</div>
          <div class="info-item"><strong>Language:</strong> Move</div>
          <div class="info-item"><strong>Explorer:</strong> <a href="https://suiexplorer.com" target="_blank">Sui Explorer</a></div>
          <div class="info-item"><strong>Native Token:</strong> SUI</div>
          <div class="info-item"><strong>TPS:</strong> ~297,000 (theoretical)</div>
        </div>

        <n-divider />

        <h4 style="margin-bottom: 12px;">About Sui</h4>
        <p style="line-height: 1.8; color: #666;">
          Sui is a layer-1 blockchain built by Mysten Labs (ex-Meta engineers). It uses the Move programming
          language and features parallel transaction execution for exceptional performance. Sui's object-centric
          data model enables horizontal scaling and sub-second finality.
        </p>

        <div style="margin-top: 20px;">
          <h4 style="margin-bottom: 12px;">Key Features:</h4>
          <ul style="line-height: 2; color: #666;">
            <li>🚀 <strong>Parallel Execution:</strong> Process thousands of transactions simultaneously</li>
            <li>🔧 <strong>Move Language:</strong> Secure smart contract development</li>
            <li>⚡ <strong>Sub-Second Finality:</strong> Near-instant transaction confirmation</li>
            <li>🎮 <strong>Gaming Optimized:</strong> Low latency for real-time applications</li>
            <li>🌊 <strong>Object Model:</strong> Unique asset representation system</li>
            <li>💎 <strong>zkLogin:</strong> Web2 login for Web3 apps</li>
          </ul>
        </div>
      </n-card>
    </div>

    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🌊</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Wallet Selected</div>
      <div style="color: #666;">Select a Hyperliquid account (Note: Sui uses different address format)</div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({ walletAddress: { type: String, default: '' } });

const loading = ref(false);
const suiBalance = ref('0.000000');
const coins = ref([]);
const accountInfo = ref(null);
const coinCount = computed(() => coins.value.length);
const usdValue = computed(() => {
  const suiPrice = 2.0; // Approximate SUI price
  return (parseFloat(suiBalance.value) * suiPrice).toFixed(2);
});

const coinColumns = [
  { title: 'Coin Type', key: 'coinType', ellipsis: { tooltip: true } },
  { title: 'Balance', key: 'balance', align: 'right' },
  { title: 'Actions', key: 'actions', render: (row) => h('a', { href: `https://suiexplorer.com/object/${row.objectId}`, target: '_blank', style: 'color: #4da2ff;' }, 'View Object →') }
];

async function fetchWalletData() {
  if (!props.walletAddress) return;

  loading.value = true;
  accountInfo.value = null;

  try {
    console.log(`🔍 Scanning Sui network - Note: Address conversion required for EVM address: ${props.walletAddress}`);

    // Sui uses a completely different architecture and address format
    // Would require @mysten/sui.js SDK for proper integration

    suiBalance.value = '0.000000';
    coins.value = [];
    accountInfo.value = { note: 'Sui requires native address format (0x... 64 chars)' };

    console.log('⚠️ Sui scanning requires @mysten/sui.js SDK integration');

  } catch (error) {
    console.error('❌ Error fetching Sui data:', error);
  } finally {
    loading.value = false;
  }
}

function openSuiExplorer() {
  if (props.walletAddress) {
    window.open(`https://suiexplorer.com/address/${props.walletAddress}`, '_blank');
  }
}

function openSuiWallet() {
  // Open Sui Wallet website
  window.open('https://suiwallet.com/', '_blank');

  // Show info to user
  alert(`Sui Network uses Sui Wallet (official) or Ethos Wallet.

To use Sui:
1. Install Sui Wallet (browser extension or mobile)
2. Create a Sui wallet
3. Your Sui address will be 64 characters starting with "0x"
4. Use zkLogin for web2-style authentication

Sui Wallet: https://suiwallet.com/
Ethos Wallet: https://ethoswallet.xyz/
Sui Docs: https://docs.sui.io/`);
}

watch(() => props.walletAddress, (addr) => { if (addr) fetchWalletData(); });
onMounted(() => { if (props.walletAddress) fetchWalletData(); });
</script>

<style scoped>
.sui-scanner { max-width: 1200px; margin: 0 auto; }
.address-card { background: linear-gradient(135deg, #4da2ff 0%, #3b82f6 100%); border: none; }
.address-display { color: white; }
.address-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
.address-value { font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; word-break: break-all; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.info-item { padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 14px; }
.info-item strong { color: #4da2ff; margin-right: 8px; }
.info-item a { color: #4da2ff; text-decoration: none; }
</style>
