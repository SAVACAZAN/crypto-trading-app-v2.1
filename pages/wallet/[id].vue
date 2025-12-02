<script setup>
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const walletId = route.params.id;
const userID = useCookie('userID');

// State
const wallet = ref(null);
const loading = ref(false);
const transactions = ref([]);
const loadingTxs = ref(false);

// Send form
const sendForm = ref({
  to: '',
  amount: '',
  sending: false
});

// MetaMask
const metamaskConnected = ref(false);
const metamaskAddress = ref('');

// Tabs
const activeTab = ref('overview');

// Computed
const walletBalance = computed(() => {
  return wallet.value?.balance || '0';
});

const walletBalanceUSD = computed(() => {
  // Mock USD conversion (în producție, fetch de la un API)
  const balance = parseFloat(wallet.value?.balance || 0);
  const usdPrice = 1.5; // Mock price
  return (balance * usdPrice).toFixed(2);
});

// Fetch wallet details
async function fetchWallet() {
  if (!walletId || !userID.value) {
    window.$message?.error('Invalid wallet ID or user not logged in');
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch('/api/v1/TestNets/fetchTestNetWallets', {
      method: 'GET',
      params: {
        userID: userID.value
      }
    });

    if (response.success) {
      const foundWallet = response.data.find(w => w._id === walletId);
      if (foundWallet) {
        wallet.value = foundWallet;
        console.log('[Wallet Details] Loaded wallet:', foundWallet);
      } else {
        window.$message?.error('Wallet not found');
      }
    }
  } catch (error) {
    console.error('[Wallet Details] Error:', error);
    window.$message?.error('Failed to load wallet');
  } finally {
    loading.value = false;
  }
}

// Fetch transactions (mock pentru acum)
async function fetchTransactions() {
  loadingTxs.value = true;

  try {
    // Mock transactions
    // În producție, fetch de la blockchain explorer API
    await new Promise(resolve => setTimeout(resolve, 1000));

    transactions.value = [
      {
        hash: '0x1234...5678',
        from: '0xabcd...efgh',
        to: wallet.value?.address,
        value: '0.5',
        timestamp: new Date(Date.now() - 3600000),
        status: 'success',
        type: 'receive'
      },
      {
        hash: '0x5678...9012',
        from: wallet.value?.address,
        to: '0xijkl...mnop',
        value: '0.2',
        timestamp: new Date(Date.now() - 7200000),
        status: 'success',
        type: 'send'
      }
    ];
  } catch (error) {
    console.error('[Wallet Details] Error fetching transactions:', error);
  } finally {
    loadingTxs.value = false;
  }
}

// Send tokens
async function handleSend() {
  if (!sendForm.value.to || !sendForm.value.amount) {
    window.$message?.error('Please fill all fields');
    return;
  }

  if (!metamaskConnected.value) {
    window.$message?.error('Please connect MetaMask first');
    return;
  }

  sendForm.value.sending = true;

  try {
    // Send transaction via MetaMask
    const params = [{
      from: metamaskAddress.value,
      to: sendForm.value.to,
      value: (parseFloat(sendForm.value.amount) * 1e18).toString(16), // Convert to wei in hex
      gas: '0x5208', // 21000 gas
    }];

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: params,
    });

    window.$message?.success(`Transaction sent! Hash: ${txHash}`);

    // Reset form
    sendForm.value.to = '';
    sendForm.value.amount = '';

    // Refresh transactions
    await fetchTransactions();
  } catch (error) {
    console.error('[Send] Error:', error);
    if (error.code === 4001) {
      window.$message?.warning('User rejected the transaction');
    } else {
      window.$message?.error('Failed to send transaction');
    }
  } finally {
    sendForm.value.sending = false;
  }
}

// Connect MetaMask
async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    window.$message?.error('MetaMask is not installed!');
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length > 0) {
      metamaskAddress.value = accounts[0];
      metamaskConnected.value = true;
      window.$message?.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    }
  } catch (error) {
    console.error('[MetaMask] Error:', error);
    window.$message?.error('Failed to connect MetaMask');
  }
}

// Copy to clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    window.$message?.success(`${label} copied!`);
  }).catch(() => {
    window.$message?.error('Failed to copy');
  });
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  fetchWallet();
  fetchTransactions();

  // Listen to MetaMask events
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        metamaskAddress.value = accounts[0];
        metamaskConnected.value = true;
      } else {
        metamaskConnected.value = false;
        metamaskAddress.value = '';
      }
    });
  }
});
</script>

<template>
  <div class="wallet-details-page">
    <!-- Back Button -->
    <div style="margin-bottom: 24px;">
      <n-button @click="$router.back()" text>
        ← Back to Wallets
      </n-button>
    </div>

    <div v-if="loading" style="text-align: center; padding: 60px;">
      <n-spin size="large" />
      <p style="margin-top: 16px; color: rgba(255,255,255,0.6);">Loading wallet...</p>
    </div>

    <div v-else-if="!wallet" style="text-align: center; padding: 60px;">
      <span style="font-size: 48px;">❌</span>
      <h3 style="margin-top: 16px;">Wallet Not Found</h3>
      <n-button type="primary" @click="$router.push('/MegaETHTest')" style="margin-top: 16px;">
        Go Back
      </n-button>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="wallet-header">
        <div class="wallet-title-section">
          <span class="wallet-icon">{{ wallet.networkSymbol === 'METH' ? '🚀' : '💼' }}</span>
          <div>
            <h1>{{ wallet.walletName }}</h1>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <n-tag type="success" size="small">{{ wallet.networkSymbol }}</n-tag>
              <n-tag type="info" size="small">{{ wallet.network }}</n-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Card -->
      <n-card style="margin-bottom: 24px;" class="balance-card">
        <div class="balance-content">
          <div class="balance-main">
            <span class="balance-label">Total Balance</span>
            <div class="balance-amount">
              <span class="balance-value">{{ walletBalance }}</span>
              <span class="balance-symbol">{{ wallet.networkSymbol }}</span>
            </div>
            <span class="balance-usd">≈ ${{ walletBalanceUSD }} USD</span>
          </div>
          <div class="balance-actions">
            <n-button type="primary" size="large" @click="activeTab = 'send'" strong>
              📤 Send
            </n-button>
            <n-button size="large" @click="fetchTransactions">
              🔄 Refresh
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Tabs -->
      <n-card>
        <n-tabs v-model:value="activeTab" type="line" animated>
          <!-- Overview Tab -->
          <n-tab-pane name="overview" tab="📊 Overview">
            <div class="overview-section">
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="Address">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code style="word-break: break-all;">{{ wallet.address }}</code>
                    <n-button size="tiny" @click="copyToClipboard(wallet.address, 'Address')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>
                <n-descriptions-item label="Network">
                  {{ wallet.network }}
                </n-descriptions-item>
                <n-descriptions-item label="Chain ID">
                  {{ wallet.chainId }}
                </n-descriptions-item>
                <n-descriptions-item label="Balance">
                  {{ walletBalance }} {{ wallet.networkSymbol }}
                </n-descriptions-item>
                <n-descriptions-item label="Created">
                  {{ formatDate(wallet.createdAt) }}
                </n-descriptions-item>
              </n-descriptions>

              <n-divider />

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <n-button block @click="window.open(wallet.explorerUrl + '/address/' + wallet.address, '_blank')">
                  🔍 View on Explorer
                </n-button>
                <n-button block @click="window.open(wallet.faucetUrl, '_blank')">
                  💧 Get Test Tokens
                </n-button>
                <n-button block @click="copyToClipboard(wallet.address, 'Address')">
                  📋 Copy Address
                </n-button>
              </div>
            </div>
          </n-tab-pane>

          <!-- Transactions Tab -->
          <n-tab-pane name="transactions" tab="📜 Transactions">
            <div class="transactions-section">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0;">Transaction History</h3>
                <n-button @click="fetchTransactions" :loading="loadingTxs" size="small">
                  🔄 Refresh
                </n-button>
              </div>

              <div v-if="loadingTxs" style="text-align: center; padding: 40px;">
                <n-spin size="medium" />
                <p style="margin-top: 12px; color: rgba(255,255,255,0.6);">Loading transactions...</p>
              </div>

              <div v-else-if="transactions.length === 0" style="text-align: center; padding: 40px;">
                <span style="font-size: 48px;">📭</span>
                <h3 style="margin-top: 16px;">No Transactions Yet</h3>
                <p style="color: rgba(255,255,255,0.6);">Your transactions will appear here</p>
              </div>

              <div v-else class="transactions-list">
                <n-card
                  v-for="tx in transactions"
                  :key="tx.hash"
                  class="transaction-card"
                  size="small"
                >
                  <div class="tx-content">
                    <div class="tx-icon">
                      <span v-if="tx.type === 'receive'">📥</span>
                      <span v-else>📤</span>
                    </div>
                    <div class="tx-details">
                      <div class="tx-type">
                        <strong>{{ tx.type === 'receive' ? 'Received' : 'Sent' }}</strong>
                        <n-tag :type="tx.status === 'success' ? 'success' : 'warning'" size="small">
                          {{ tx.status }}
                        </n-tag>
                      </div>
                      <div class="tx-addresses">
                        <span style="font-size: 12px; color: rgba(255,255,255,0.6);">
                          {{ tx.type === 'receive' ? 'From' : 'To' }}: {{ formatAddress(tx.type === 'receive' ? tx.from : tx.to) }}
                        </span>
                      </div>
                      <div class="tx-time">
                        {{ formatDate(tx.timestamp) }}
                      </div>
                    </div>
                    <div class="tx-amount">
                      <span :style="{ color: tx.type === 'receive' ? '#10b981' : '#ef4444' }">
                        {{ tx.type === 'receive' ? '+' : '-' }}{{ tx.value }} {{ wallet.networkSymbol }}
                      </span>
                      <n-button size="tiny" text @click="window.open(wallet.explorerUrl + '/tx/' + tx.hash, '_blank')">
                        🔍 View
                      </n-button>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-tab-pane>

          <!-- Send Tab -->
          <n-tab-pane name="send" tab="📤 Send">
            <div class="send-section">
              <n-alert v-if="!metamaskConnected" type="warning" style="margin-bottom: 16px;">
                <template #icon>
                  <span>🦊</span>
                </template>
                <strong>MetaMask Required</strong><br>
                Connect your MetaMask wallet to send tokens
                <div style="margin-top: 12px;">
                  <n-button type="primary" @click="connectMetaMask" size="small">
                    🦊 Connect MetaMask
                  </n-button>
                </div>
              </n-alert>

              <n-alert v-else type="success" style="margin-bottom: 16px;" :bordered="false">
                <template #icon>
                  <span>✅</span>
                </template>
                <strong>MetaMask Connected</strong><br>
                <code>{{ metamaskAddress }}</code>
              </n-alert>

              <n-form>
                <n-form-item label="Recipient Address">
                  <n-input
                    v-model:value="sendForm.to"
                    placeholder="0x..."
                    size="large"
                    :disabled="!metamaskConnected"
                  />
                </n-form-item>

                <n-form-item label="Amount">
                  <n-input-number
                    v-model:value="sendForm.amount"
                    :placeholder="`Amount in ${wallet.networkSymbol}`"
                    size="large"
                    style="width: 100%;"
                    :min="0"
                    :step="0.001"
                    :disabled="!metamaskConnected"
                  >
                    <template #suffix>
                      {{ wallet.networkSymbol }}
                    </template>
                  </n-input-number>
                </n-form-item>

                <n-form-item>
                  <div style="width: 100%; display: flex; gap: 12px;">
                    <n-button
                      type="primary"
                      size="large"
                      @click="handleSend"
                      :loading="sendForm.sending"
                      :disabled="!metamaskConnected || !sendForm.to || !sendForm.amount"
                      block
                    >
                      📤 Send {{ wallet.networkSymbol }}
                    </n-button>
                  </div>
                </n-form-item>
              </n-form>

              <n-alert type="info" style="margin-top: 16px;">
                <template #icon>
                  <span>ℹ️</span>
                </template>
                <strong>Gas Fees</strong><br>
                Network fees will be calculated by MetaMask when you send the transaction.
              </n-alert>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.wallet-details-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.wallet-header {
  margin-bottom: 32px;
}

.wallet-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.wallet-icon {
  font-size: 48px;
  line-height: 1;
}

.wallet-title-section h1 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.balance-card {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.balance-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.balance-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.balance-value {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
}

.balance-symbol {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
}

.balance-usd {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.balance-actions {
  display: flex;
  gap: 12px;
}

.overview-section {
  padding: 16px 0;
}

.transactions-section {
  padding: 16px 0;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.transaction-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.tx-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tx-icon {
  font-size: 32px;
  line-height: 1;
}

.tx-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tx-addresses {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.tx-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.tx-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
}

.send-section {
  padding: 16px 0;
  max-width: 600px;
  margin: 0 auto;
}
</style>
