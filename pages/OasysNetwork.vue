<template>
  <div class="oasys-network-page">
    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

    <!-- Header Card -->
    <n-card class="header-card" style="margin-bottom: 24px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 16px; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00D4AA, #00B894); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
              🏝️
            </div>
            <div>
              <h2 style="margin: 0; font-size: 24px;">Oasys Network</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">Gaming-Optimized Blockchain</p>
            </div>
          </div>
          <n-button type="primary" size="large" @click="generateWallet" :loading="generating">
            ➕ Generate New Wallet
          </n-button>
        </div>
      </template>

      <n-grid cols="2 s:3 m:4" responsive="screen" :x-gap="16" :y-gap="16">
        <n-gi>
          <n-statistic label="Chain ID" value="248">
            <template #prefix>#</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="Network Type" value="Gaming / L1">
            <template #prefix>🎮</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="Native Token" value="OAS">
            <template #prefix>💎</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="My Wallets" :value="wallets.length">
            <template #prefix>👛</template>
          </n-statistic>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Tabs -->
    <n-card>
      <n-tabs type="line" animated>
        <!-- Wallets Tab -->
        <n-tab-pane name="wallets" tab="👛 My Wallets">
          <div v-if="loading" style="text-align: center; padding: 40px;">
            <n-spin size="large" />
            <p style="margin-top: 16px; color: #666;">Loading your wallets...</p>
          </div>

          <div v-else-if="wallets.length === 0" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">💼</div>
            <h3 style="margin: 0 0 8px 0;">No Oasys Wallets Yet</h3>
            <p style="color: #666; margin-bottom: 24px;">Generate your first Oasys wallet for Web3 gaming</p>
            <n-button type="primary" size="large" @click="generateWallet">
              ➕ Generate Wallet
            </n-button>
          </div>

          <n-space v-else vertical :size="16">
            <n-card v-for="(wallet, index) in wallets" :key="wallet._id" :title="`${wallet.walletName || 'Oasys Wallet ' + (index + 1)}`" hoverable>
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="Address">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code style="font-size: 12px; word-break: break-all;">{{ wallet.address }}</code>
                    <n-button text type="primary" size="tiny" @click="copyToClipboard(wallet.address, 'Address')">
                      📋 Copy
                    </n-button>
                    <n-button text type="info" size="tiny" @click="openExplorer(wallet.address)">
                      🔍 Explorer
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Public Key">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code style="font-size: 11px; word-break: break-all;">{{ wallet.publicKey || 'N/A' }}</code>
                    <n-button v-if="wallet.publicKey" text type="primary" size="tiny" @click="copyToClipboard(wallet.publicKey, 'Public Key')">
                      📋 Copy
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Private Key">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code v-if="showPrivateKey[wallet._id]" style="font-size: 11px; word-break: break-all; color: #ff4d4f;">{{ wallet.privateKey }}</code>
                    <code v-else style="color: #999;">••••••••••••••••••••••••••••••••</code>
                    <n-button text type="warning" size="tiny" @click="togglePrivateKey(wallet._id)">
                      {{ showPrivateKey[wallet._id] ? '🙈 Hide' : '👁️ Show' }}
                    </n-button>
                    <n-button v-if="showPrivateKey[wallet._id]" text type="primary" size="tiny" @click="copyToClipboard(wallet.privateKey, 'Private Key')">
                      📋 Copy
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Mnemonic">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code v-if="showMnemonic[wallet._id]" style="font-size: 11px; word-break: break-all; color: #ff4d4f;">{{ wallet.mnemonic || 'N/A' }}</code>
                    <code v-else style="color: #999;">•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••</code>
                    <n-button v-if="wallet.mnemonic" text type="warning" size="tiny" @click="toggleMnemonic(wallet._id)">
                      {{ showMnemonic[wallet._id] ? '🙈 Hide' : '👁️ Show' }}
                    </n-button>
                    <n-button v-if="showMnemonic[wallet._id] && wallet.mnemonic" text type="primary" size="tiny" @click="copyToClipboard(wallet.mnemonic, 'Mnemonic')">
                      📋 Copy
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Balance">
                  <div>
                    <div>{{ wallet.balance || '0' }} OAS</div>
                    <div v-if="wallet.balanceUSD" style="color: #666; font-size: 12px;">≈ ${{ wallet.balanceUSD }}</div>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Created">
                  {{ formatDate(wallet.createdAt) }}
                </n-descriptions-item>

                <n-descriptions-item label="Last Used">
                  {{ formatDate(wallet.lastUsed) }}
                </n-descriptions-item>
              </n-descriptions>

              <template #footer>
                <n-space>
                  <n-button type="info" size="small" @click="openExplorer(wallet.address)">
                    🔍 View on Explorer
                  </n-button>
                  <n-button type="primary" size="small" @click="copyToClipboard(wallet.address, 'Address')">
                    📋 Copy Address
                  </n-button>
                </n-space>
              </template>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Network Info Tab -->
        <n-tab-pane name="info" tab="ℹ️ Network Info">
          <n-space vertical :size="16">
            <n-card title="🏝️ About Oasys">
              <p style="line-height: 1.8; color: #666;">
                Oasys is a gaming-optimized blockchain developed with the vision of creating the ultimate blockchain
                for games. It features a multi-layered architecture with a highly scalable Layer 1 hub and game-specific
                Layer 2 solutions (Verses) that offer zero gas fees for players and eco-friendly proof-of-stake consensus.
              </p>
            </n-card>

            <n-card title="🔗 Network Details">
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="Network Name">
                  Oasys Mainnet
                </n-descriptions-item>
                <n-descriptions-item label="Chain ID">
                  248
                </n-descriptions-item>
                <n-descriptions-item label="Currency Symbol">
                  OAS
                </n-descriptions-item>
                <n-descriptions-item label="RPC URL">
                  <a href="https://rpc.mainnet.oasys.games" target="_blank">https://rpc.mainnet.oasys.games</a>
                </n-descriptions-item>
                <n-descriptions-item label="Block Explorer">
                  <a href="https://explorer.oasys.games" target="_blank">https://explorer.oasys.games</a>
                </n-descriptions-item>
              </n-descriptions>
            </n-card>

            <n-card title="✨ Key Features">
              <ul style="line-height: 2; color: #666;">
                <li>🎮 <strong>Gaming First:</strong> Purpose-built for blockchain gaming</li>
                <li>💰 <strong>Zero Gas for Players:</strong> Players enjoy gasless transactions</li>
                <li>⚡ <strong>High Performance:</strong> Fast transaction finality</li>
                <li>🔐 <strong>PoS Consensus:</strong> Eco-friendly and secure</li>
                <li>🛠️ <strong>EVM Compatible:</strong> Easy game integration</li>
                <li>🌍 <strong>Multi-Layer:</strong> Hub + Verse architecture</li>
                <li>💎 <strong>AAA Games:</strong> Support from major gaming companies</li>
              </ul>
            </n-card>

            <n-card title="🔗 Useful Links">
              <n-space vertical :size="12">
                <n-button type="primary" @click="openUrl('https://www.oasys.games')" block>
                  🌐 Official Website
                </n-button>
                <n-button type="info" @click="openUrl('https://explorer.oasys.games')" block>
                  🔍 Oasys Explorer
                </n-button>
                <n-button type="success" @click="openUrl('https://docs.oasys.games')" block>
                  📚 Documentation
                </n-button>
                <n-button type="warning" @click="openUrl('https://bridge.oasys.games')" block>
                  🌉 Oasys Bridge
                </n-button>
              </n-space>
            </n-card>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();

// State
const wallets = ref([]);
const loading = ref(false);
const generating = ref(false);
const showPrivateKey = reactive({});
const showMnemonic = reactive({});

// Get userID from localStorage
const userID = ref(null);
onMounted(() => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    userID.value = userData.userID || userData._id;
  }
  if (userID.value) {
    loadWallets();
  }
});

// Load wallets
async function loadWallets() {
  loading.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Oasys'
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
    } else {
      message.error(response.message || 'Failed to load wallets');
    }
  } catch (error) {
    console.error('[Oasys] Load error:', error);
    message.error('Failed to load Oasys wallets');
  } finally {
    loading.value = false;
  }
}

// Generate new wallet
async function generateWallet() {
  if (!userID.value) {
    message.error('Please login first!');
    return;
  }

  generating.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Oasys',
        walletName: `Oasys Wallet ${wallets.value.length + 1}`
      }
    });

    if (response.success) {
      message.success('Oasys wallet generated successfully!');
      await loadWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Oasys] Generate error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generating.value = false;
  }
}

// Toggle private key visibility
function togglePrivateKey(walletId) {
  showPrivateKey[walletId] = !showPrivateKey[walletId];
}

// Toggle mnemonic visibility
function toggleMnemonic(walletId) {
  showMnemonic[walletId] = !showMnemonic[walletId];
}

// Copy to clipboard
async function copyToClipboard(text, label = 'Text') {
  try {
    await navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  } catch (error) {
    console.error('Copy failed:', error);
    message.error('Failed to copy to clipboard');
  }
}

// Open explorer
function openExplorer(address) {
  window.open(`https://explorer.oasys.games/address/${address}`, '_blank');
}

// Open URL
function openUrl(url) {
  window.open(url, '_blank');
}

// Format date
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
}
</script>

<style scoped>
.oasys-network-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.05), rgba(0, 184, 148, 0.05));
}

code {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style>
