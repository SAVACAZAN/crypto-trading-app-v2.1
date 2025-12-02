<template>
  <div class="noble-scanner">
    <n-card class="address-card" style="margin-bottom: 20px;">
      <div class="address-display">
        <div class="address-label">Scanning Noble Network Address:</div>
        <div class="address-value">{{ props.walletAddress || 'No address selected' }}</div>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <n-button type="info" @click="openMintscan" :disabled="!props.walletAddress">
            View on Mintscan →
          </n-button>
          <n-button type="warning" @click="openKeplrWallet" ghost>
            👑 Open Keplr Wallet
          </n-button>
        </div>
      </div>
    </n-card>

    <n-alert type="info" style="margin-bottom: 20px;">
      <strong>Note:</strong> Noble is a Cosmos-based chain that uses native USDC. Address format is different from EVM chains (starts with "noble1...").
    </n-alert>

    <div v-if="loading" style="text-align: center; padding: 40px;">
      <n-spin size="large" />
      <div style="margin-top: 16px; color: #666;">Scanning Noble network...</div>
    </div>

    <div v-else-if="props.walletAddress">
      <n-card title="💰 Noble Wallet Balance" style="margin-bottom: 20px;">
        <n-grid cols="1 s:2 m:3" :x-gap="12" :y-gap="12">
          <n-gi>
            <n-statistic label="USDC Balance (Native)" :value="usdcBalance">
              <template #suffix><span style="color: #6366f1;">USDC</span></template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="USD Value" :value="usdcBalance">
              <template #prefix>$</template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="Other Tokens" :value="tokenCount">
              <template #prefix>🪙</template>
            </n-statistic>
          </n-gi>
        </n-grid>
      </n-card>

      <n-card title="ℹ️ About Noble" style="margin-bottom: 20px;">
        <p style="line-height: 1.8; color: #666;">
          Noble is a Cosmos appchain purpose-built for native asset issuance. It's the first blockchain
          to offer native USDC issuance outside of Ethereum, making it a key infrastructure layer for
          the Cosmos ecosystem.
        </p>
        <n-divider />
        <div class="info-grid">
          <div class="info-item"><strong>Network:</strong> Noble (Cosmos SDK)</div>
          <div class="info-item"><strong>Chain ID:</strong> noble-1</div>
          <div class="info-item"><strong>Consensus:</strong> Tendermint</div>
          <div class="info-item"><strong>Explorer:</strong> <a href="https://mintscan.io/noble" target="_blank">Mintscan</a></div>
          <div class="info-item"><strong>Key Asset:</strong> Native USDC</div>
          <div class="info-item"><strong>IBC Enabled:</strong> Yes (Cross-chain transfers)</div>
        </div>
      </n-card>

      <n-card title="🌐 Noble Features">
        <ul style="line-height: 2; color: #666;">
          <li>🏦 <strong>Native USDC:</strong> First Cosmos chain with native USDC issuance</li>
          <li>🔄 <strong>IBC Compatible:</strong> Seamless transfers across Cosmos ecosystem</li>
          <li>⚡ <strong>Fast Finality:</strong> ~6 second block times</li>
          <li>🔐 <strong>Secure:</strong> Cosmos SDK security model</li>
          <li>🌉 <strong>Bridge Hub:</strong> Connect USDC across multiple chains</li>
        </ul>
      </n-card>
    </div>

    <n-card v-else style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">👑</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Wallet Selected</div>
      <div style="color: #666;">Select a Hyperliquid account (Note: Noble uses Cosmos address format)</div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({ walletAddress: { type: String, default: '' } });

const loading = ref(false);
const usdcBalance = ref('0.00');
const tokens = ref([]);
const tokenCount = computed(() => tokens.value.length);

async function fetchWalletData() {
  if (!props.walletAddress) return;

  loading.value = true;

  try {
    console.log(`🔍 Scanning Noble network - Note: Requires Cosmos address conversion for EVM address: ${props.walletAddress}`);

    // Noble uses Cosmos SDK and requires a different address format (noble1...)
    // This is a placeholder - would need proper Cosmos SDK integration

    usdcBalance.value = '0.00';
    tokens.value = [];

    console.log('⚠️ Noble scanning requires Cosmos SDK integration and address conversion');

  } catch (error) {
    console.error('❌ Error fetching Noble data:', error);
  } finally {
    loading.value = false;
  }
}

function openMintscan() {
  if (props.walletAddress) {
    window.open(`https://mintscan.io/noble/address/${props.walletAddress}`, '_blank');
  }
}

function openKeplrWallet() {
  // Open Keplr Wallet website
  window.open('https://www.keplr.app/', '_blank');

  // Show info to user
  alert(`Noble is a Cosmos-based chain and uses Keplr Wallet.

To use Noble:
1. Install Keplr Wallet (browser extension)
2. Create a Cosmos wallet
3. Add Noble chain to Keplr
4. Your Noble address will start with "noble1..."

Keplr Wallet: https://www.keplr.app/
Noble Docs: https://nobleassets.xyz/`);
}

watch(() => props.walletAddress, (addr) => { if (addr) fetchWalletData(); });
onMounted(() => { if (props.walletAddress) fetchWalletData(); });
</script>

<style scoped>
.noble-scanner { max-width: 1200px; margin: 0 auto; }
.address-card { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border: none; }
.address-display { color: white; }
.address-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; }
.address-value { font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; word-break: break-all; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.info-item { padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 14px; }
.info-item strong { color: #6366f1; margin-right: 8px; }
.info-item a { color: #6366f1; text-decoration: none; }
</style>
