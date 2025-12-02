<template>
  <div class="cronos-network-page">
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
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
              💠
            </div>
            <div>
              <h2 style="margin: 0; font-size: 24px;">Cronos</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">EVM Chain - Crypto.com blockchain</p>
            </div>
          </div>
          <n-button type="primary" size="large" @click="generateWallet" :loading="generating">
            ➕ Generate New Wallet
          </n-button>
        </div>
      </template>

      <n-grid cols="2 s:3 m:4" responsive="screen" :x-gap="16" :y-gap="16">
        <n-gi>
          <n-statistic label="Chain ID" value="25">
            <template #prefix>#</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="Network Type" value="EVM Chain">
            <template #prefix>🌐</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="Native Token" value="CRO">
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
            <h3 style="margin: 0 0 8px 0;">No Cronos Wallets Yet</h3>
            <p style="color: #666; margin-bottom: 24px;">Generate your first Cronos wallet to get started</p>
            <n-button type="primary" size="large" @click="generateWallet">
              ➕ Generate Cronos Wallet
            </n-button>
          </div>

          <div v-else>
            <n-list bordered>
              <n-list-item v-for="wallet in wallets" :key="wallet._id" style="padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      <n-tag type="info" size="small">{{ wallet.walletName }}</n-tag>
                    </div>
                    <div style="font-family: monospace; font-size: 13px; color: #666; display: flex; align-items: center; gap: 8px;">
                      <span>{{ wallet.address }}</span>
                      <n-button text size="tiny" @click="copyAddress(wallet.address)">
                        📋 Copy
                      </n-button>
                    </div>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <n-button size="small" @click="viewPrivateKey(wallet)">
                      🔑 Private Key
                    </n-button>
                  </div>
                </div>
              </n-list-item>
            </n-list>
          </div>
        </n-tab-pane>

        <!-- Network Info Tab -->
        <n-tab-pane name="info" tab="ℹ️ Network Info">
          <div style="padding: 20px;">
            <h3 style="margin-top: 0;">Network Details</h3>
            <n-descriptions bordered :column="2">
              <n-descriptions-item label="Network Name">Cronos</n-descriptions-item>
              <n-descriptions-item label="Chain ID">25</n-descriptions-item>
              <n-descriptions-item label="Native Currency">CRO</n-descriptions-item>
              <n-descriptions-item label="Network Type">EVM Chain</n-descriptions-item>
            </n-descriptions>

            <h3 style="margin-top: 32px;">Features</h3>
            <ul style="line-height: 1.8;">
              <li>Full EVM compatibility</li>
              <li>Fast transaction speeds</li>
              <li>Low gas fees</li>
              <li>Secure smart contracts</li>
            </ul>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Private Key Modal -->
    <n-modal v-model:show="showPrivateKeyModal" preset="dialog" title="🔑 Private Key">
      <div style="padding: 20px;">
        <n-alert type="warning" title="Security Warning" style="margin-bottom: 16px;">
          Never share your private key with anyone! Anyone with access to your private key can control your funds.
        </n-alert>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-family: monospace; word-break: break-all; margin-bottom: 16px;">
          {{ selectedPrivateKey }}
        </div>
        <n-button type="primary" block @click="copyPrivateKey">
          📋 Copy Private Key
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userID = useCookie('userID');

// State
const wallets = ref([]);
const loading = ref(false);
const generating = ref(false);
const showPrivateKeyModal = ref(false);
const selectedPrivateKey = ref('');

// Load wallets
async function loadWallets() {
  if (!userID.value) return;

  loading.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Cronos'
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[Cronos] Load error:', error);
    window.$message?.error('Failed to load wallets');
  } finally {
    loading.value = false;
  }
}

// Generate wallet
async function generateWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  generating.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Cronos',
        walletName: `Cronos Wallet ${wallets.value.length + 1}`
      }
    });

    if (response.success) {
      window.$message?.success('Cronos wallet generated successfully!');
      await loadWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Cronos] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generating.value = false;
  }
}

// Copy address
function copyAddress(address) {
  navigator.clipboard.writeText(address);
  window.$message?.success('Address copied to clipboard!');
}

// View private key
function viewPrivateKey(wallet) {
  selectedPrivateKey.value = wallet.privateKey || 'Not available';
  showPrivateKeyModal.value = true;
}

// Copy private key
function copyPrivateKey() {
  navigator.clipboard.writeText(selectedPrivateKey.value);
  window.$message?.success('Private key copied to clipboard!');
}

onMounted(() => {
  loadWallets();
});
</script>

<style scoped>
.cronos-network-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
