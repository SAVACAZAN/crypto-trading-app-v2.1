<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ethers } from 'ethers';

const route = useRoute();
const walletId = route.params.id;
const userID = useCookie('userID');

// Network configuration
const NETWORKS = {
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    icon: '🥕',
    chainId: 6342,
    rpcUrl: 'https://carrot.megaeth.com/rpc',
    explorerUrl: 'https://megaeth-testnet.blockscout.com',
    faucetUrl: 'https://testnet.megaeth.com/#2',
    color: '#10b981'
  },
  timothy: {
    id: 'timothy',
    name: 'Timothy',
    icon: '⚡',
    chainId: 6343,
    rpcUrl: 'https://timothy.megaeth.com/rpc',
    explorerUrl: 'https://megaeth-testnet.blockscout.com',
    faucetUrl: 'https://faucet.timothy.megaeth.com/claim',
    color: '#f59e0b'
  }
};

// State
const wallet = ref(null);
const loading = ref(false);
const selectedNetwork = ref('carrot'); // Default to Carrot
const loadingTxs = ref(false);

// Balances for both networks
const balances = ref({
  carrot: '0',
  timothy: '0'
});

// Transactions for both networks
const transactionsByNetwork = ref({
  carrot: [],
  timothy: []
});

// Send form
const sendForm = ref({
  to: '',
  amount: '',
  network: 'carrot', // Which network to send on
  sending: false
});

// MetaMask (only for imported wallets)
const metamaskConnected = ref(false);
const metamaskAddress = ref('');

// Tabs
const activeTab = ref('overview');

// Active wallet address - for MetaMask wallets use MetaMask address if connected, otherwise wallet address
const activeWalletAddress = computed(() => {
  // For MetaMask wallets, use MetaMask address if connected
  if (wallet.value?.walletType === 'metamask' && metamaskConnected.value) {
    return metamaskAddress.value;
  }
  // For generated wallets, always use wallet address
  return wallet.value?.address;
});

// Current network config
const currentNetwork = computed(() => NETWORKS[selectedNetwork.value]);

// Current balance
const currentBalance = computed(() => balances.value[selectedNetwork.value] || '0');

// Current transactions - filtered by selected network
const currentTransactions = computed(() => verifiedTransactions.value[selectedNetwork.value] || []);

// Total balance (sum of both networks)
const totalBalance = computed(() => {
  const carrot = parseFloat(balances.value.carrot || 0);
  const timothy = parseFloat(balances.value.timothy === 'N/A' ? 0 : balances.value.timothy || 0);
  return (carrot + timothy).toFixed(6);
});

const walletBalanceUSD = computed(() => {
  // Mock USD conversion (în producție, fetch de la un API)
  const balance = parseFloat(totalBalance.value || 0);
  const usdPrice = 1.5; // Mock price
  return (balance * usdPrice).toFixed(2);
});

// Watch network change - no need to refetch since transactions are shared
watch(selectedNetwork, (newNetwork) => {
  console.log('[Network Change] Switched to:', newNetwork);
  // Transactions are shared between networks, no need to refetch
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

        // Fetch REAL balance from blockchain
        await fetchRealBalance();
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

// Fetch REAL balances from BOTH networks
async function fetchRealBalance() {
  const addressToFetch = activeWalletAddress.value;
  if (!addressToFetch) return;

  console.log('[Fetch Balance] Fetching balances for:', addressToFetch);

  // Fetch from Carrot
  try {
    const carrotProvider = new ethers.JsonRpcProvider(NETWORKS.carrot.rpcUrl);
    const carrotBalanceWei = await carrotProvider.getBalance(addressToFetch);
    const carrotBalance = ethers.formatEther(carrotBalanceWei);
    balances.value.carrot = carrotBalance;
    console.log(`[Fetch Balance] 🥕 Carrot: ${carrotBalance} METH`);
  } catch (error) {
    console.error('[Fetch Balance] Carrot error:', error);
    balances.value.carrot = '0';
  }

  // Fetch from Timothy
  try {
    const timothyProvider = new ethers.JsonRpcProvider(NETWORKS.timothy.rpcUrl);
    const timothyBalanceWei = await timothyProvider.getBalance(addressToFetch);
    const timothyBalance = ethers.formatEther(timothyBalanceWei);
    balances.value.timothy = timothyBalance;
    console.log(`[Fetch Balance] ⚡ Timothy: ${timothyBalance} METH`);
  } catch (error) {
    console.warn('[Fetch Balance] Timothy error:', error.message);
    balances.value.timothy = 'N/A';
  }

  // Update wallet balance for compatibility
  if (wallet.value) {
    wallet.value.balance = balances.value.carrot;
  }
}

// Fetch transactions for a specific network
async function fetchTransactionsForNetwork(networkId) {
  const addressToFetch = activeWalletAddress.value;
  if (!addressToFetch) return;

  loadingTxs.value = true;

  try {
    // NOTE: MegaETH Carrot and Timothy share the same Blockscout explorer
    // We cannot definitively determine which network a transaction belongs to
    // Transactions shown may be from EITHER network
    const apiUrl = `https://megaeth-testnet.blockscout.com/api?module=account&action=txlist&address=${addressToFetch}&sort=desc`;

    console.log(`[Fetch Transactions] Fetching transactions for ${NETWORKS[networkId].icon} ${NETWORKS[networkId].name}:`, addressToFetch);
    console.warn('[Fetch Transactions] WARNING: Blockscout is shared between Carrot and Timothy - transactions may be from either network');

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      // Parse transactions
      const parsedTxs = data.result.map(tx => {
        const isReceive = tx.to?.toLowerCase() === addressToFetch.toLowerCase();
        const valueEth = ethers.formatEther(tx.value);

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: valueEth,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          status: tx.isError === '0' ? 'success' : 'failed',
          type: isReceive ? 'receive' : 'send',
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          network: 'unknown' // Cannot determine from Blockscout API
        };
      });

      transactionsByNetwork.value[networkId] = parsedTxs;
      console.log(`[Fetch Transactions] ${NETWORKS[networkId].icon} Found ${parsedTxs.length} transactions (may include both networks)`);
    } else {
      console.log(`[Fetch Transactions] ${NETWORKS[networkId].icon} No transactions found`);
      transactionsByNetwork.value[networkId] = [];
    }
  } catch (error) {
    console.error(`[Fetch Transactions] ${NETWORKS[networkId].icon} Error:`, error);
    transactionsByNetwork.value[networkId] = [];
  } finally {
    loadingTxs.value = false;
  }
}

// Fetch and verify transactions for each network
const verifiedTransactions = ref({
  carrot: [],
  timothy: []
});
const transactionsFetched = ref(false);

async function fetchAndVerifyTransactions() {
  const addressToFetch = activeWalletAddress.value;
  if (!addressToFetch) return;

  loadingTxs.value = true;

  try {
    // Step 1: Fetch all transactions from Blockscout
    const apiUrl = `https://megaeth-testnet.blockscout.com/api?module=account&action=txlist&address=${addressToFetch}&sort=desc`;

    console.log('[Fetch Transactions] Fetching all transactions from Blockscout for:', addressToFetch);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      const allTxs = data.result.map(tx => {
        const isReceive = tx.to?.toLowerCase() === addressToFetch.toLowerCase();
        const valueEth = ethers.formatEther(tx.value);

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: valueEth,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          status: tx.isError === '0' ? 'success' : 'failed',
          type: isReceive ? 'receive' : 'send',
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice
        };
      });

      console.log(`[Fetch Transactions] Found ${allTxs.length} total transactions from Blockscout`);

      // Step 2: Verify each transaction on both networks
      await verifyTransactionsOnNetworks(allTxs);

      transactionsFetched.value = true;
    } else {
      verifiedTransactions.value.carrot = [];
      verifiedTransactions.value.timothy = [];
    }
  } catch (error) {
    console.error('[Fetch Transactions] Error:', error);
    verifiedTransactions.value.carrot = [];
    verifiedTransactions.value.timothy = [];
  } finally {
    loadingTxs.value = false;
  }
}

// Verify transactions on each network's RPC
async function verifyTransactionsOnNetworks(transactions) {
  const carrotProvider = new ethers.JsonRpcProvider(NETWORKS.carrot.rpcUrl);
  const timothyProvider = new ethers.JsonRpcProvider(NETWORKS.timothy.rpcUrl);

  const carrotTxs = [];
  const timothyTxs = [];

  console.log('[Verify Transactions] Verifying transactions on both networks...');

  // Check each transaction on both RPCs
  for (const tx of transactions) {
    // Check on Carrot
    try {
      const carrotTxReceipt = await carrotProvider.getTransactionReceipt(tx.hash);
      if (carrotTxReceipt) {
        carrotTxs.push({ ...tx, network: 'carrot' });
        console.log(`[Verify] ✅ TX ${tx.hash.slice(0, 10)}... found on Carrot`);
      }
    } catch (error) {
      // Transaction not on Carrot
    }

    // Check on Timothy
    try {
      const timothyTxReceipt = await timothyProvider.getTransactionReceipt(tx.hash);
      if (timothyTxReceipt) {
        timothyTxs.push({ ...tx, network: 'timothy' });
        console.log(`[Verify] ✅ TX ${tx.hash.slice(0, 10)}... found on Timothy`);
      }
    } catch (error) {
      // Transaction not on Timothy
    }
  }

  verifiedTransactions.value.carrot = carrotTxs;
  verifiedTransactions.value.timothy = timothyTxs;

  console.log(`[Verify] 🥕 Carrot: ${carrotTxs.length} transactions`);
  console.log(`[Verify] ⚡ Timothy: ${timothyTxs.length} transactions`);
}

// Fetch transactions for ALL networks
async function fetchAllTransactions() {
  await Promise.all([
    fetchTransactionsForNetwork('carrot'),
    fetchTransactionsForNetwork('timothy')
  ]);
}

// Send tokens - DUAL MODE
async function handleSend() {
  if (!sendForm.value.to || !sendForm.value.amount) {
    window.$message?.error('Please fill all fields');
    return;
  }

  // Check if this is a MetaMask wallet (ONLY check walletType)
  const isMetaMaskWallet = wallet.value?.walletType === 'metamask';

  console.log('[Send] Wallet Type:', wallet.value?.walletType);
  console.log('[Send] Has Private Key:', !!wallet.value?.privateKey && wallet.value?.privateKey !== '');
  console.log('[Send] Is MetaMask Wallet:', isMetaMaskWallet);
  console.log('[Send] Use MetaMask Toggle:', useMetaMask.value);
  console.log('[Send] MetaMask Connected:', metamaskConnected.value);

  // For MetaMask wallets, MUST use MetaMask
  if (isMetaMaskWallet && !metamaskConnected.value) {
    window.$message?.error('This is a MetaMask wallet. Please connect MetaMask first!');
    return;
  }

  sendForm.value.sending = true;

  try {
    if (isMetaMaskWallet) {
      // MODE 1: Send via MetaMask (for imported wallets)
      console.log('[Send] Using MetaMask mode (imported wallet)');
      await sendViaMetaMask();
    } else {
      // MODE 2: Send via Private Key (for generated wallets)
      console.log('[Send] Using Private Key mode (generated wallet)');
      await sendViaPrivateKey();
    }

    window.$message?.success('Transaction sent successfully!');

    // Reset form
    sendForm.value.to = '';
    sendForm.value.amount = '';

    // Refresh balance and transactions
    await fetchRealBalance();
    transactionsFetched.value = false; // Reset to allow refetch
    await fetchAndVerifyTransactions();
  } catch (error) {
    console.error('[Send] Error:', error);
    if (error.code === 4001) {
      window.$message?.warning('User rejected the transaction');
    } else {
      window.$message?.error(`Failed to send: ${error.message}`);
    }
  } finally {
    sendForm.value.sending = false;
  }
}

// Send via MetaMask
async function sendViaMetaMask() {
  if (!metamaskConnected.value) {
    throw new Error('MetaMask not connected');
  }

  // Get the selected network's chain ID
  const networkConfig = NETWORKS[sendForm.value.network];
  const requiredChainId = `0x${networkConfig.chainId.toString(16)}`;

  console.log(`[Send MetaMask] Sending on ${networkConfig.icon} ${networkConfig.name} network`);
  console.log(`[Send MetaMask] Required Chain ID: ${requiredChainId}`);

  // Check if MetaMask is on the correct network
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: requiredChainId }],
    });
  } catch (switchError) {
    // Network not added, try to add it
    if (switchError.code === 4902) {
      window.$message?.error(`Please add ${networkConfig.name} network to MetaMask first`);
      throw switchError;
    }
  }

  const params = [{
    from: metamaskAddress.value,
    to: sendForm.value.to,
    value: `0x${ethers.parseEther(sendForm.value.amount.toString()).toString(16)}`,
    gas: '0x5208', // 21000 gas
  }];

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: params,
  });

  console.log(`[Send MetaMask] ${networkConfig.icon} TX Hash:`, txHash);
}

// Send via Private Key (wallet generat)
async function sendViaPrivateKey() {
  if (!wallet.value?.privateKey) {
    throw new Error('Private key not available');
  }

  // Get the selected network's RPC
  const networkConfig = NETWORKS[sendForm.value.network];
  const rpcUrl = networkConfig.rpcUrl;

  console.log(`[Send Private Key] Sending on ${networkConfig.icon} ${networkConfig.name} network`);
  console.log(`[Send Private Key] RPC: ${rpcUrl}`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Create signer from private key
  const signer = new ethers.Wallet(wallet.value.privateKey, provider);

  // Create transaction
  const tx = {
    to: sendForm.value.to,
    value: ethers.parseEther(sendForm.value.amount.toString()),
    gasLimit: 21000,
  };

  // Send transaction
  const txResponse = await signer.sendTransaction(tx);
  console.log(`[Send Private Key] ${networkConfig.icon} TX Hash:`, txResponse.hash);

  // Wait for confirmation
  await txResponse.wait();
  console.log(`[Send Private Key] ${networkConfig.icon} TX Confirmed`);
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

      // Refresh balance and transactions for MetaMask wallet
      if (wallet.value?.walletType === 'metamask') {
        await fetchRealBalance();
        transactionsFetched.value = false;
        await fetchAndVerifyTransactions();
      }
    }
  } catch (error) {
    console.error('[MetaMask] Error:', error);
    window.$message?.error('Failed to connect MetaMask');
  }
}

// Handle refresh button
async function handleRefresh() {
  await fetchRealBalance();
  transactionsFetched.value = false; // Reset to allow refetch
  await fetchAndVerifyTransactions();
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

onMounted(async () => {
  await fetchWallet();

  // Wait a bit for wallet to load, then fetch and verify transactions
  if (wallet.value) {
    await fetchAndVerifyTransactions();
  }

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
      <n-button @click="navigateTo('/MegaETHTest')" text>
        ← Back to MegaETH Wallets
      </n-button>
    </div>

    <div v-if="loading" style="text-align: center; padding: 60px;">
      <n-spin size="large" />
      <p style="margin-top: 16px; color: rgba(255,255,255,0.6);">Loading wallet...</p>
    </div>

    <div v-else-if="!wallet" style="text-align: center; padding: 60px;">
      <span style="font-size: 48px;">❌</span>
      <h3 style="margin-top: 16px;">Wallet Not Found</h3>
      <n-button type="primary" @click="navigateTo('/MegaETHTest')" style="margin-top: 16px;">
        Go Back
      </n-button>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="wallet-header">
        <div class="wallet-title-section">
          <span class="wallet-icon">🚀</span>
          <div>
            <h1>{{ wallet.walletName }}</h1>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <n-tag type="success" size="small">{{ wallet.networkSymbol }}</n-tag>
              <n-tag type="info" size="small">{{ wallet.network }}</n-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Wallet Mode Selector -->
      <n-card style="margin-bottom: 16px;">
        <!-- For MetaMask wallets: Show wallet type and connection status -->
        <div v-if="wallet.walletType === 'metamask'">
          <n-alert type="warning" :bordered="false">
            <template #icon>
              <span>🦊</span>
            </template>
            <strong>🦊 Imported from MetaMask</strong><br>
            <span style="font-size: 12px;">
              This wallet was imported from MetaMask. You must use MetaMask to sign transactions.
            </span>
          </n-alert>

          <div v-if="!metamaskConnected" style="margin-top: 12px;">
            <n-button type="primary" @click="connectMetaMask" block>
              🦊 Connect MetaMask to Sign Transactions
            </n-button>
          </div>

          <div v-else style="margin-top: 12px;">
            <n-alert type="success" size="small" :bordered="false">
              <template #icon>
                <span>✅</span>
              </template>
              MetaMask Connected: <code>{{ formatAddress(metamaskAddress) }}</code>
            </n-alert>
          </div>
        </div>

        <!-- For Generated wallets: Show that it uses private key signing -->
        <div v-else>
          <n-alert type="success" :bordered="false">
            <template #icon>
              <span>🔑</span>
            </template>
            <strong>🔑 Generated Wallet - Direct Signing</strong><br>
            <span style="font-size: 12px;">
              This wallet uses private key signing. Transactions are sent directly without MetaMask popups.
            </span>
          </n-alert>
        </div>
      </n-card>

      <!-- Network Selector -->
      <n-card style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <strong style="margin-right: 12px;">Select Network:</strong>
            <n-button-group>
              <n-button
                :type="selectedNetwork === 'carrot' ? 'success' : 'default'"
                @click="selectedNetwork = 'carrot'"
              >
                🥕 Carrot Testnet
              </n-button>
              <n-button
                :type="selectedNetwork === 'timothy' ? 'warning' : 'default'"
                @click="selectedNetwork = 'timothy'"
              >
                ⚡ Timothy Testnet
              </n-button>
            </n-button-group>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <n-tag :type="selectedNetwork === 'carrot' ? 'success' : 'warning'" size="small">
              {{ currentNetwork.icon }} {{ currentNetwork.name }}
            </n-tag>
            <n-tag type="info" size="small">
              Chain ID: {{ currentNetwork.chainId }}
            </n-tag>
          </div>
        </div>
      </n-card>

      <!-- Balance Card - ONLY for selected network -->
      <n-card
        style="margin-bottom: 24px;"
        class="balance-card"
        :style="{ background: `linear-gradient(135deg, ${currentNetwork.color}22 0%, rgba(139, 92, 246, 0.1) 100%)`, border: `1px solid ${currentNetwork.color}44` }"
      >
        <div class="balance-content">
          <div class="balance-main">
            <span class="balance-label">
              {{ currentNetwork.icon }} {{ currentNetwork.name }} Balance
            </span>
            <div class="balance-amount">
              <span class="balance-value">{{ parseFloat(currentBalance || 0).toFixed(6) }}</span>
              <span class="balance-symbol">{{ wallet.networkSymbol }}</span>
            </div>
            <span class="balance-usd">
              ≈ ${{ (parseFloat(currentBalance || 0) * 1.5).toFixed(2) }} USD
            </span>

            <div style="margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.6);">
              Chain ID: {{ currentNetwork.chainId }}
            </div>

            <span class="balance-address" style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">
              {{ formatAddress(activeWalletAddress) }}
            </span>
          </div>
          <div class="balance-actions">
            <n-button type="primary" size="large" @click="activeTab = 'send'" strong>
              📤 Send
            </n-button>
            <n-button size="large" @click="handleRefresh">
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
                <n-descriptions-item label="Active Network">
                  {{ currentNetwork.icon }} {{ currentNetwork.name }} Testnet
                </n-descriptions-item>
                <n-descriptions-item label="Chain ID">
                  {{ currentNetwork.chainId }}
                </n-descriptions-item>
                <n-descriptions-item label="RPC URL">
                  {{ currentNetwork.rpcUrl }}
                </n-descriptions-item>
                <n-descriptions-item label="Balance">
                  {{ parseFloat(currentBalance || 0).toFixed(6) }} {{ wallet.networkSymbol }}
                </n-descriptions-item>
                <n-descriptions-item label="Created">
                  {{ formatDate(wallet.createdAt) }}
                </n-descriptions-item>
              </n-descriptions>

              <n-divider />

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <n-button block @click="window.open(currentNetwork.explorerUrl + '/address/' + wallet.address, '_blank')">
                  🔍 View on {{ currentNetwork.name }} Explorer
                </n-button>
                <n-button block @click="window.open(currentNetwork.faucetUrl, '_blank')">
                  💧 Get Test {{ wallet.networkSymbol }} from {{ currentNetwork.name }} Faucet
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
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <h3 style="margin: 0;">Transaction History</h3>
                  <n-tag :type="selectedNetwork === 'carrot' ? 'success' : 'warning'" size="small">
                    {{ currentNetwork.icon }} {{ currentNetwork.name }}
                  </n-tag>
                </div>
                <n-button @click="fetchAndVerifyTransactions" :loading="loadingTxs" size="small">
                  🔄 Refresh
                </n-button>
              </div>

              <!-- Info about verification -->
              <n-alert type="info" style="margin-bottom: 16px;" size="small" :bordered="false">
                <template #icon>
                  <span>✅</span>
                </template>
                Showing transactions verified on <strong>{{ currentNetwork.icon }} {{ currentNetwork.name }}</strong> network only.
              </n-alert>

              <div v-if="loadingTxs" style="text-align: center; padding: 40px;">
                <n-spin size="medium" />
                <p style="margin-top: 12px; color: rgba(255,255,255,0.6);">Loading transactions...</p>
              </div>

              <div v-else-if="currentTransactions.length === 0" style="text-align: center; padding: 40px;">
                <span style="font-size: 48px;">📭</span>
                <h3 style="margin-top: 16px;">No Transactions on {{ currentNetwork.name }}</h3>
                <p style="color: rgba(255,255,255,0.6);">
                  No transactions found on {{ currentNetwork.icon }} {{ currentNetwork.name }} network for this address
                </p>
              </div>

              <div v-else class="transactions-list">
                <n-card
                  v-for="tx in currentTransactions"
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
                        {{ tx.type === 'receive' ? '+' : '-' }}{{ parseFloat(tx.value).toFixed(6) }} {{ wallet.networkSymbol }}
                      </span>
                      <n-button size="tiny" text @click="window.open(`${currentNetwork.explorerUrl}/tx/${tx.hash}`, '_blank')">
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
              <!-- Network Selector for Sending -->
              <n-card style="margin-bottom: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <strong style="margin-right: 12px;">Send on Network:</strong>
                  </div>
                  <n-button-group>
                    <n-button
                      :type="sendForm.network === 'carrot' ? 'success' : 'default'"
                      @click="sendForm.network = 'carrot'"
                    >
                      🥕 Carrot
                    </n-button>
                    <n-button
                      :type="sendForm.network === 'timothy' ? 'warning' : 'default'"
                      @click="sendForm.network = 'timothy'"
                    >
                      ⚡ Timothy
                    </n-button>
                  </n-button-group>
                </div>
                <div style="margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.7);">
                  <strong>Selected:</strong> {{ NETWORKS[sendForm.network].icon }} {{ NETWORKS[sendForm.network].name }}
                  (Chain ID: {{ NETWORKS[sendForm.network].chainId }})
                  <br>
                  <strong>Available Balance:</strong> {{ parseFloat(balances[sendForm.network] || 0).toFixed(6) }} METH
                </div>
              </n-card>

              <!-- Send Mode Info -->
              <n-alert
                :type="wallet.walletType === 'metamask' ? 'warning' : 'success'"
                style="margin-bottom: 16px;"
              >
                <template #icon>
                  <span>{{ wallet.walletType === 'metamask' ? '🦊' : '🔑' }}</span>
                </template>
                <strong v-if="wallet.walletType === 'metamask'">
                  Send Mode: MetaMask (Required - Imported Wallet)
                </strong>
                <strong v-else>
                  Send Mode: Private Key Signing (Direct & Fast)
                </strong>
                <br>
                <span v-if="wallet.walletType === 'metamask'">
                  This wallet was imported from MetaMask and requires MetaMask for all transactions
                </span>
                <span v-else>
                  Transactions are signed automatically using your wallet's private key - no MetaMask popups needed!
                </span>
              </n-alert>

              <n-form>
                <n-form-item label="From (Your Wallet)">
                  <n-input
                    :value="formatAddress(activeWalletAddress)"
                    disabled
                    size="large"
                  />
                </n-form-item>

                <n-form-item label="Recipient Address">
                  <n-input
                    v-model:value="sendForm.to"
                    placeholder="0x..."
                    size="large"
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
                      :disabled="!sendForm.to || !sendForm.amount || (wallet.walletType === 'metamask' && !metamaskConnected)"
                      block
                    >
                      {{ wallet.walletType === 'metamask' ? '🦊' : '🔑' }} Send {{ wallet.networkSymbol }}
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
