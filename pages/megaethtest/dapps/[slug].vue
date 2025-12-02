<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { ethers } from 'ethers';

const route = useRoute();
const userID = useCookie('userID');

// MegaETH Carrot Testnet Configuration
const MEGAETH_TESTNET = {
  chainId: '0x18C6',
  chainIdDecimal: 6342,
  chainName: 'MegaETH Carrot',
  network: 'MegaETH',
  icon: '🥕',
  nativeCurrency: {
    name: 'MegaETH',
    symbol: 'METH',
    decimals: 18
  },
  rpcUrls: [
    'https://carrot.megaeth.com/rpc',
    'https://rpc.megaeth.com'
  ],
  blockExplorerUrls: ['https://megaeth-testnet.blockscout.com']
};

// All MegaETH DApps (condensed for brevity)
const dapps = [
  { id: 'bronto', name: 'Bronto', description: 'First Real-Time MetaDEX on MegaETH', category: 'defi', logo: '🦕', url: 'https://bronto.xyz', tags: ['MetaDEX', 'Liquidity'] },
  { id: 'gte', name: 'GTE', description: 'Best possible onchain prices', category: 'defi', logo: '💎', url: 'https://gte.finance', tags: ['Aggregator'] },
  { id: 'curve', name: 'Curve', description: 'Efficient stablecoin trading', category: 'defi', logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png', url: 'https://curve.fi/', tags: ['DEX'] },
  { id: 'euclid', name: 'Euclid', description: 'Cross-chain liquidity infrastructure', category: 'defi', logo: '🌐', url: 'https://euclid.xyz', tags: ['Cross-chain'] },
  { id: 'rubic', name: 'Rubic', description: 'Cross-Chain Tech Aggregator', category: 'defi', logo: '🔷', url: 'https://app.rubic.exchange', tags: ['Bridge', 'Swaps'] },
  { id: 'cap', name: 'Cap', description: 'Stablecoin protocol cUSD and stcUSD', category: 'defi', logo: '🎩', url: 'https://cap.xyz', tags: ['Stablecoin'] },
  { id: 'world-capital', name: 'World Capital Markets', description: 'Spot, perps, and lending CLOBs', category: 'defi', logo: '🌍', url: 'https://worldcapital.market', tags: ['Trading'] },
  { id: 'gearbox', name: 'Gearbox Protocol', description: 'Composable leverage trading', category: 'defi', logo: '⚙️', url: 'https://gearbox.fi', tags: ['Leverage'] },
  { id: 'mynt', name: 'Mynt', description: 'Verifiable yield protocol', category: 'defi', logo: '💰', url: 'https://mynt.xyz', tags: ['Yield'] },
  { id: 'avon', name: 'Avon', description: 'Real-time credit market', category: 'defi', logo: '🏦', url: 'https://avon.finance', tags: ['Lending'] },
  { id: 'relend', name: 'Relend Network', description: 'Stablecoin Credit Infrastructure', category: 'defi', logo: '🔄', url: 'https://relend.network', tags: ['Lending'] },
  { id: 'app98', name: 'App98', description: 'All-in-one MegaETH hub', category: 'gaming', logo: '🎮', url: 'https://app98.xyz', tags: ['Gaming', 'Hub'] },
  { id: 'block-battles', name: 'Block Battles: Gas Wars', description: 'Blockchain gaming arena', category: 'gaming', logo: '⚔️', url: 'https://blockbattles.io', tags: ['Gaming'] },
  { id: 'megaracer', name: 'MegaRacer', description: 'Typing game for web3', category: 'gaming', logo: '🏎️', url: 'https://megaracer.xyz', tags: ['Gaming'] },
  { id: 'megapunks', name: 'MegaPunks', description: 'On-chain casino gaming', category: 'gaming', logo: '🎲', url: 'https://megapunks.xyz', tags: ['Casino'] },
  { id: 'casino', name: 'CASINO', description: 'Decentralized gaming platform', category: 'gaming', logo: '🎰', url: 'https://casino.megaeth.xyz', tags: ['Casino'] },
  { id: 'awe', name: 'Autonomous World Engine', description: '3D internet engine', category: 'gaming', logo: '🌌', url: 'https://awe.xyz', tags: ['Metaverse'] },
  { id: 'rarible', name: 'Rarible', description: 'Community-owned NFT marketplace', category: 'nft', logo: 'https://cryptologos.cc/logos/rarible-rari-logo.png', url: 'https://rarible.com/', tags: ['NFT'] },
  { id: 'sirio', name: 'Sirio', description: 'Global NFT experience hub', category: 'nft', logo: '🌟', url: 'https://sirio.xyz', tags: ['NFT'] },
  { id: 'hashpin', name: 'HashPin', description: 'Pin hashes as NFTs', category: 'nft', logo: '📌', url: 'https://hashpin.xyz', tags: ['NFT'] },
  { id: 'kingdomly', name: 'Kingdomly', description: 'NFT creator platform', category: 'nft', logo: '👑', url: 'https://kingdomly.xyz', tags: ['NFT'] },
  { id: 'omnihub', name: 'OmniHub', description: 'Multichain NFT launchpad', category: 'nft', logo: '🔮', url: 'https://omnihub.xyz', tags: ['NFT'] },
  { id: 'noise', name: 'Noise', description: 'Discover and trade trends', category: 'social', logo: '📢', url: 'https://noise.xyz', tags: ['Social'] },
  { id: 'allmint', name: 'AllMint', description: 'Web4 Social Network', category: 'social', logo: '🌐', url: 'https://allmint.xyz', tags: ['Social'] },
  { id: 'tokenops', name: 'TokenOps', description: 'Token vesting and airdrops', category: 'tools', logo: '🔧', url: 'https://tokenops.xyz', tags: ['Dev Tools'] },
  { id: 'pimlico', name: 'Pimlico', description: 'Smart account infrastructure', category: 'tools', logo: '🛠️', url: 'https://pimlico.io', tags: ['Infrastructure'] },
  { id: 'zerodev', name: 'ZeroDev', description: 'Smart accounts toolkit', category: 'tools', logo: '⚡', url: 'https://zerodev.app', tags: ['Dev Tools'] },
  { id: 'gelato', name: 'Gelato', description: 'Rollup as a Service', category: 'tools', logo: '🍦', url: 'https://gelato.network', tags: ['Infrastructure'] },
  { id: 'envio', name: 'Envio', description: 'Blockchain indexer', category: 'tools', logo: '📊', url: 'https://envio.dev', tags: ['Indexer'] },
  { id: 'rainmakr', name: 'RainMakr', description: 'AI Launchpad', category: 'tools', logo: '🌧️', url: 'https://rainmakr.xyz', tags: ['AI'] },
  { id: 'layerhub', name: 'LayerHub', description: 'Explore user activity', category: 'analytics', logo: '📈', url: 'https://layerhub.xyz', tags: ['Analytics'] },
  { id: 'mtrkr', name: 'MTRKR', description: 'Visualize wallet in real time', category: 'analytics', logo: '👁️', url: 'https://mtrkr.xyz', tags: ['Tracker'] },
  { id: 'predictmarket', name: 'PredictMarket', description: 'Prediction markets', category: 'analytics', logo: '🔮', url: 'https://predictmarket.xyz', tags: ['Predictions'] },
  { id: 'firefly', name: 'Firefly Bridge', description: 'Cross-chain bridge', category: 'bridge', logo: '🦋', url: 'https://firefly.xyz', tags: ['Bridge'] },
  { id: 'chainbills', name: 'Chainbills', description: 'On-chain payments gateway', category: 'bridge', logo: '💳', url: 'https://chainbills.xyz', tags: ['Payments'] }
];

// Find current DApp
const currentDApp = computed(() => {
  return dapps.find(d => d.id === route.params.slug);
});

// State
const wallets = ref([]);
const loadingWallets = ref(false);
const selectedWallet = ref(null);
const walletType = ref('metamask'); // 'metamask' or 'saved'
const showIframe = ref(false);
const iframeRef = ref(null);
const emulatorActive = ref(false);
const showWalletInstructions = ref(false);

// Web3 State
const web3Connected = ref(false);
const connectedAddress = ref('');
const connectedBalance = ref('0');
const currentChainId = ref(null);
const isCorrectNetwork = ref(false);
const connectingWallet = ref(false);
const provider = ref(null);

// Check if MetaMask is installed
const isMetaMaskInstalled = computed(() => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
});

// Fetch saved wallets
async function fetchWallets() {
  if (!userID.value) return;

  loadingWallets.value = true;
  try {
    const response = await $fetch('/api/v1/TestNets/fetchTestNetWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'MegaETH'
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[DApp] Error fetching wallets:', error);
  } finally {
    loadingWallets.value = false;
  }
}

// Connect MetaMask
async function connectMetaMask() {
  if (!isMetaMaskInstalled.value) {
    window.$message?.error('Please install MetaMask!');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  connectingWallet.value = true;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (accounts.length > 0) {
      connectedAddress.value = accounts[0];
      web3Connected.value = true;
      walletType.value = 'metamask';

      provider.value = new ethers.BrowserProvider(window.ethereum);

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      currentChainId.value = parseInt(chainId, 16);
      isCorrectNetwork.value = currentChainId.value === MEGAETH_TESTNET.chainIdDecimal;

      await updateBalance();

      window.$message?.success('MetaMask connected!');

      if (!isCorrectNetwork.value) {
        await switchToMegaETHNetwork();
      }
    }
  } catch (error) {
    console.error('[DApp] Error connecting MetaMask:', error);
    window.$message?.error('Failed to connect MetaMask');
  } finally {
    connectingWallet.value = false;
  }
}

// Connect with saved wallet
async function connectSavedWallet(wallet) {
  try {
    const response = await $fetch('/api/v1/TestNets/getWalletDetails', {
      method: 'GET',
      params: {
        walletId: wallet._id,
        userID: userID.value
      }
    });

    if (response.success && response.data) {
      const fullWallet = response.data;

      if (!fullWallet.privateKey) {
        window.$message?.error('Wallet private key not available');
        return;
      }

      selectedWallet.value = fullWallet;
      connectedAddress.value = fullWallet.address;
      connectedBalance.value = fullWallet.balance || '0';
      web3Connected.value = true;
      walletType.value = 'saved';
      isCorrectNetwork.value = true;

      console.log('[Connect Saved Wallet] ✅ Loaded with privateKey');
      window.$message?.success(`Connected: ${fullWallet.walletName || 'Saved Wallet'} - Ready for SAVACAZANwalletemulator!`);
    } else {
      throw new Error(response.message || 'Failed to fetch wallet details');
    }
  } catch (error) {
    console.error('[Connect Saved Wallet] Error:', error);
    window.$message?.error('Failed to connect wallet');
  }
}

// Disconnect wallet
function disconnectWallet() {
  web3Connected.value = false;
  connectedAddress.value = '';
  connectedBalance.value = '0';
  walletType.value = '';
  selectedWallet.value = null;
  provider.value = null;
  showIframe.value = false;
  emulatorActive.value = false;
  window.$message?.success('Wallet disconnected');
}

// Update balance
async function updateBalance() {
  if (!web3Connected.value || !connectedAddress.value) return;

  try {
    const rpcProvider = new ethers.JsonRpcProvider(MEGAETH_TESTNET.rpcUrls[0]);
    const balance = await rpcProvider.getBalance(connectedAddress.value);
    connectedBalance.value = ethers.formatEther(balance);
  } catch (error) {
    console.error('[Update Balance] Error:', error);
    connectedBalance.value = '0';
  }
}

// Switch to MegaETH network
async function switchToMegaETHNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MEGAETH_TESTNET.chainId }],
    });
    window.$message?.success('Switched to MegaETH Carrot!');
    isCorrectNetwork.value = true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: MEGAETH_TESTNET.chainId,
            chainName: MEGAETH_TESTNET.chainName,
            nativeCurrency: MEGAETH_TESTNET.nativeCurrency,
            rpcUrls: MEGAETH_TESTNET.rpcUrls,
            blockExplorerUrls: MEGAETH_TESTNET.blockExplorerUrls,
          }],
        });
        window.$message?.success('MegaETH Carrot added and switched!');
        isCorrectNetwork.value = true;
      } catch (addError) {
        console.error('[Add Network] Error:', addError);
        window.$message?.error('Failed to add MegaETH network');
      }
    }
  }
}

// SAVACAZANwalletemulator - Custom Web3 Provider for saved wallets
function createSAVACAZANwalletemulator() {
  if (!selectedWallet.value || !selectedWallet.value.privateKey) {
    console.error('[SAVACAZANwalletemulator] No wallet selected');
    return null;
  }

  const wallet = new ethers.Wallet(selectedWallet.value.privateKey);
  const rpcProvider = new ethers.JsonRpcProvider(MEGAETH_TESTNET.rpcUrls[0]);
  const connectedWallet = wallet.connect(rpcProvider);

  console.log('[SAVACAZANwalletemulator] Initializing for:', wallet.address);

  // EIP-1193 Provider Implementation
  const provider = {
    isMetaMask: true,
    isSAVACAZAN: true,
    chainId: MEGAETH_TESTNET.chainId,
    selectedAddress: wallet.address,
    _listeners: {},

    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
    },

    removeListener(event, callback) {
      if (this._listeners[event]) {
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
      }
    },

    emit(event, data) {
      if (this._listeners[event]) {
        this._listeners[event].forEach(callback => callback(data));
      }
    },

    async request({ method, params }) {
      console.log('[SAVACAZANwalletemulator]', method);

      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [wallet.address];

        case 'eth_chainId':
          return MEGAETH_TESTNET.chainId;

        case 'net_version':
          return MEGAETH_TESTNET.chainIdDecimal.toString();

        case 'eth_sendTransaction':
          const tx = params[0];
          const transaction = await connectedWallet.sendTransaction({
            to: tx.to,
            value: tx.value ? ethers.toBigInt(tx.value) : 0,
            data: tx.data || '0x',
          });
          return transaction.hash;

        case 'personal_sign':
          const signature = await wallet.signMessage(params[0]);
          return signature;

        default:
          return await rpcProvider.send(method, params || []);
      }
    }
  };

  return provider;
}

// Inject into iframe
async function injectSAVACAZAN() {
  if (walletType.value !== 'saved' || !selectedWallet.value || !iframeRef.value) return;

  try {
    console.log('[SAVACAZANwalletemulator] Waiting for iframe to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const iframeWindow = iframeRef.value.contentWindow;
    if (!iframeWindow) {
      console.error('[SAVACAZANwalletemulator] Cannot access iframe window');
      return;
    }

    const provider = createSAVACAZANwalletemulator();
    if (!provider) {
      console.error('[SAVACAZANwalletemulator] Provider creation failed');
      return;
    }

    console.log('[SAVACAZANwalletemulator] Injecting provider...');

    iframeWindow.ethereum = provider;

    Object.defineProperty(iframeWindow, 'ethereum', {
      value: provider,
      writable: false,
      configurable: true
    });

    iframeWindow.web3 = {
      currentProvider: provider,
      eth: {
        defaultAccount: provider.selectedAddress
      }
    };

    setTimeout(() => {
      const event = new CustomEvent('ethereum#initialized', { detail: provider });
      iframeWindow.dispatchEvent(event);
    }, 100);

    emulatorActive.value = true;

    console.log('[SAVACAZANwalletemulator] ✅ Successfully injected!');
    window.$message?.success('🚀 SAVACAZANwalletemulator Active!', { duration: 5000 });
  } catch (error) {
    console.error('[SAVACAZANwalletemulator] Injection error:', error);
    window.$message?.error('Failed to activate emulator');
  }
}

// Load DApp with emulator
async function loadDAppWithEmulator() {
  if (!web3Connected.value) {
    window.$message?.error('Please connect a wallet first!');
    return;
  }

  if (walletType.value === 'saved') {
    window.$message?.warning('Iframe mode has limitations due to browser security. For best experience, use "🚀 Open DApp" button.', {
      duration: 5000
    });
  }

  showIframe.value = true;
  await nextTick();
}

// Quick launch with wallet info
function launchDAppWithWallet() {
  if (!web3Connected.value) {
    window.$message?.error('Please connect a wallet first!');
    return;
  }

  if (walletType.value === 'saved' && selectedWallet.value) {
    showWalletInstructions.value = true;
  } else {
    openUrl(currentDApp.value.url);
  }
}

// Export wallet as JSON
function exportWalletAsJSON() {
  if (!selectedWallet.value || !selectedWallet.value.privateKey) {
    window.$message?.error('No wallet selected');
    return;
  }

  try {
    const walletData = {
      name: selectedWallet.value.walletName || 'Imported Wallet',
      address: selectedWallet.value.address,
      privateKey: selectedWallet.value.privateKey,
      network: 'MegaETH Carrot',
      chainId: MEGAETH_TESTNET.chainIdDecimal,
      exported: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megaeth-wallet-${selectedWallet.value.address.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.$message?.success('Wallet exported! Import in MetaMask.', { duration: 5000 });
  } catch (error) {
    console.error('[Export] Error:', error);
    window.$message?.error('Failed to export wallet');
  }
}

// Quick import to MetaMask
async function quickImportToMetaMask() {
  if (!selectedWallet.value || !selectedWallet.value.privateKey) {
    window.$message?.error('No wallet selected');
    return;
  }

  try {
    await navigator.clipboard.writeText(selectedWallet.value.privateKey);
    window.$message?.success('✅ Private key copied!', { duration: 3000 });

    await new Promise(resolve => setTimeout(resolve, 500));

    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.$message?.info('📋 Key copied! Next: MetaMask → Import Account → Paste', { duration: 8000 });
    } else {
      window.$message?.warning('MetaMask not detected!');
      window.open('https://metamask.io/download/', '_blank');
    }
  } catch (error) {
    console.error('[Quick Import] Error:', error);
    window.$message?.error('Failed to copy key');
  }
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

// Open URL
function openUrl(url) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

// Lifecycle
onMounted(async () => {
  if (!currentDApp.value) {
    navigateTo('/MegaETHTest');
    return;
  }

  if (userID.value) {
    fetchWallets();
  }

  // Check if SAVACAZANwalletemulator is already active
  if (window.ethereum && window.ethereum.isSAVACAZAN) {
    console.log('[DApp] SAVACAZANwalletemulator detected in window.ethereum');

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        connectedAddress.value = accounts[0];
        web3Connected.value = true;
        walletType.value = 'metamask'; // We keep it as 'metamask' so it works with DApps

        provider.value = new ethers.BrowserProvider(window.ethereum);

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId.value = parseInt(chainId, 16);
        isCorrectNetwork.value = currentChainId.value === MEGAETH_TESTNET.chainIdDecimal;

        await updateBalance();

        window.$message?.success('🦊 SAVACAZANwalletemulator is active!', { duration: 3000 });
      }
    } catch (error) {
      console.error('[DApp] Error auto-connecting SAVACAZANwalletemulator:', error);
    }
  } else if (isMetaMaskInstalled.value && window.ethereum) {
    // Check if real MetaMask is connected
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        console.log('[DApp] Real MetaMask detected and connected');
        connectedAddress.value = accounts[0];
        web3Connected.value = true;
        walletType.value = 'metamask';

        provider.value = new ethers.BrowserProvider(window.ethereum);

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId.value = parseInt(chainId, 16);
        isCorrectNetwork.value = currentChainId.value === MEGAETH_TESTNET.chainIdDecimal;

        await updateBalance();
      }
    } catch (error) {
      console.error('[DApp] Error checking MetaMask:', error);
    }
  }

  if (isMetaMaskInstalled.value && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (walletType.value === 'metamask') {
        connectedAddress.value = accounts[0];
        updateBalance();
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }
});
</script>

<template>
  <div class="dapp-page">
    <!-- Back Button -->
    <div style="margin-bottom: 24px;">
      <n-button text @click="navigateTo('/MegaETHTest')">
        ← Back to MegaETH DApps
      </n-button>
    </div>

    <!-- DApp Not Found -->
    <div v-if="!currentDApp" class="empty-state">
      <n-result status="404" title="DApp Not Found" description="The requested DApp does not exist.">
        <template #footer>
          <n-button @click="navigateTo('/MegaETHTest')">
            Go Back
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- DApp Content -->
    <div v-else>
      <!-- DApp Header Card -->
      <n-card class="dapp-header-card" style="margin-bottom: 24px;">
        <div class="dapp-header-content">
          <div class="dapp-logo-section">
            <div class="dapp-logo-large">
              <img v-if="currentDApp.logo.startsWith('http')" :src="currentDApp.logo" :alt="currentDApp.name" />
              <span v-else>{{ currentDApp.logo }}</span>
            </div>
            <div>
              <h1>{{ currentDApp.name }}</h1>
              <p class="dapp-description">{{ currentDApp.description }}</p>
              <div class="dapp-tags">
                <n-tag v-for="tag in currentDApp.tags" :key="tag" size="small" type="info">
                  {{ tag }}
                </n-tag>
              </div>
            </div>
          </div>
          <div class="dapp-actions">
            <n-button
              type="primary"
              size="large"
              @click="launchDAppWithWallet"
              :style="walletType === 'saved' && web3Connected ? { background: 'linear-gradient(135deg, #ff6b35 0%, #f6921e 100%)' } : {}"
            >
              {{ walletType === 'saved' && web3Connected ? '🔥 Open with Wallet Guide' : '🚀 Open DApp' }}
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Wallet Connection -->
      <n-card title="👛 Wallet Connection" style="margin-bottom: 24px;">
        <div v-if="!web3Connected" class="wallet-connect-section">
          <n-alert type="info" style="margin-bottom: 16px;">
            Connect your wallet to interact with {{ currentDApp.name }}
          </n-alert>

          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <n-card class="connect-option" hoverable @click="connectMetaMask">
              <div style="text-align: center;">
                <span style="font-size: 48px;">🦊</span>
                <h3 style="margin: 12px 0 8px 0;">MetaMask</h3>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px;">Connect with MetaMask</p>
              </div>
            </n-card>

            <n-card v-for="wallet in wallets.slice(0, 3)" :key="wallet._id" class="connect-option" hoverable @click="connectSavedWallet(wallet)">
              <div style="text-align: center;">
                <span style="font-size: 48px;">🥕</span>
                <h3 style="margin: 12px 0 8px 0;">{{ wallet.walletName }}</h3>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px;">{{ formatAddress(wallet.address) }}</p>
              </div>
            </n-card>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <n-alert :type="isCorrectNetwork ? 'success' : 'warning'" style="margin-bottom: 16px;">
            <template #icon>
              <span style="font-size: 24px;">{{ isCorrectNetwork ? '✅' : '⚠️' }}</span>
            </template>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <strong>
                  {{
                    (typeof window !== 'undefined' && window.ethereum && window.ethereum.isSAVACAZAN)
                      ? '🦊 Connected with SAVACAZANwalletemulator'
                      : walletType === 'saved'
                        ? '✅ Connected with Saved Wallet'
                        : '🦊 Connected with MetaMask'
                  }}
                </strong><br>
                <span style="font-size: 13px;">
                  {{ formatAddress(connectedAddress) }}<br>
                  Balance: <strong>{{ parseFloat(connectedBalance).toFixed(4) }} METH</strong>
                  <span v-if="typeof window !== 'undefined' && window.ethereum && window.ethereum.isSAVACAZAN" style="display: block; color: #10b981; margin-top: 4px;">
                    ✨ Emulated from MegaETH main page
                  </span>
                </span>
              </div>
              <div style="display: flex; gap: 8px;">
                <n-button v-if="!isCorrectNetwork" type="warning" size="small" @click="switchToMegaETHNetwork">
                  🔄 Switch Network
                </n-button>
                <n-button type="error" size="small" @click="disconnectWallet">
                  🔌 Disconnect
                </n-button>
              </div>
            </div>
          </n-alert>
        </div>
      </n-card>

      <!-- DApp Interface -->
      <n-card title="📱 DApp Interface">
        <n-alert type="info" style="margin-bottom: 16px;">
          <template #icon>
            <span>💡</span>
          </template>
          <strong>Connect Wallet First:</strong> Select a wallet above before using the DApp. For best experience, use "🚀 Open DApp" button.
        </n-alert>

        <!-- Load Iframe Button -->
        <div v-if="!showIframe" style="text-align: center; padding: 40px 20px;">
          <span style="font-size: 48px; display: block; margin-bottom: 16px;">🌐</span>
          <h3 style="margin: 0 0 12px 0;">DApp Not Loaded</h3>
          <p style="margin: 0 0 16px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
            {{ web3Connected ? `Ready to load ${currentDApp.name}` : 'Connect a wallet first' }}
          </p>
          <n-button
            type="primary"
            size="large"
            @click="loadDAppWithEmulator"
            :style="{ background: '#ff6b35' }"
            :disabled="!web3Connected"
          >
            {{ walletType === 'saved' ? '🚀 Load with SAVACAZANwalletemulator' : '📱 Load DApp in Frame' }}
          </n-button>
        </div>

        <!-- Iframe Container -->
        <div v-else>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <n-tag type="success" size="medium">
                🟢 DApp Loaded
              </n-tag>
              <n-tag v-if="emulatorActive" type="warning" size="medium">
                🚀 SAVACAZANwalletemulator Active
              </n-tag>
            </div>
            <n-button
              size="small"
              @click="showIframe = false; emulatorActive = false"
              secondary
            >
              ✕ Close Frame
            </n-button>
          </div>

          <!-- Emulator Status -->
          <n-alert v-if="emulatorActive" type="success" style="margin-bottom: 12px;">
            <template #icon>
              <span style="font-size: 20px;">✅</span>
            </template>
            <strong>SAVACAZANwalletemulator is Active!</strong><br>
            <span style="font-size: 12px;">Your saved wallet is available in the DApp!</span>
          </n-alert>

          <div class="dapp-iframe-container">
            <iframe
              ref="iframeRef"
              :src="currentDApp.url"
              frameborder="0"
              allowfullscreen
              class="dapp-iframe"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              @load="injectSAVACAZAN"
            ></iframe>
          </div>

          <n-alert v-if="walletType === 'saved'" type="warning" style="margin-top: 12px;" size="small">
            <template #icon>
              <span>⚠️</span>
            </template>
            <strong>Note:</strong> Due to browser security (CORS), the emulator might not work with all DApps. If it doesn't work, use "🚀 Open DApp" button.
          </n-alert>
        </div>
      </n-card>

      <!-- Network Info -->
      <n-card title="🌐 Network Information" style="margin-top: 24px;">
        <n-descriptions :column="1" size="small">
          <n-descriptions-item label="Network">
            {{ MEGAETH_TESTNET.chainName }}
          </n-descriptions-item>
          <n-descriptions-item label="Chain ID">
            {{ MEGAETH_TESTNET.chainIdDecimal }} ({{ MEGAETH_TESTNET.chainId }})
          </n-descriptions-item>
          <n-descriptions-item label="RPC URL">
            {{ MEGAETH_TESTNET.rpcUrls[0] }}
          </n-descriptions-item>
          <n-descriptions-item label="Explorer">
            <a :href="MEGAETH_TESTNET.blockExplorerUrls[0]" target="_blank" style="color: #ff6b35;">
              {{ MEGAETH_TESTNET.blockExplorerUrls[0] }}
            </a>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- Wallet Import Instructions Modal -->
      <n-modal
        v-model:show="showWalletInstructions"
        preset="card"
        title="🔥 Open DApp with Your Wallet"
        style="width: 700px; max-width: 95vw;"
      >
        <div v-if="selectedWallet">
          <n-alert type="info" style="margin-bottom: 16px;">
            <template #icon>
              <span style="font-size: 24px;">🚀</span>
            </template>
            <strong>Quick Start Guide</strong><br>
            Follow these steps to use your wallet in {{ currentDApp.name }}
          </n-alert>

          <!-- Step 1: Export Options -->
          <n-card size="small" style="margin-bottom: 16px;">
            <template #header>
              <strong>Step 1: Import Wallet to MetaMask</strong>
            </template>
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
              <n-button
                type="primary"
                @click="quickImportToMetaMask"
                block
                :style="{ background: 'linear-gradient(135deg, #ff6b35 0%, #f6921e 100%)' }"
              >
                🦊 Copy Private Key
              </n-button>
              <n-button
                type="success"
                @click="exportWalletAsJSON"
                block
              >
                💾 Export JSON
              </n-button>
            </div>
            <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
              Choose your preferred method to import
            </p>
          </n-card>

          <!-- Step 2: Open DApp -->
          <n-card size="small" style="margin-bottom: 16px;">
            <template #header>
              <strong>Step 2: Open the DApp</strong>
            </template>
            <n-button
              type="primary"
              size="large"
              @click="openUrl(currentDApp.url); showWalletInstructions = false"
              block
            >
              🌐 Open {{ currentDApp.name }}
            </n-button>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
              Opens in a new tab
            </p>
          </n-card>

          <!-- Step 3: Connect -->
          <n-card size="small">
            <template #header>
              <strong>Step 3: Connect in DApp</strong>
            </template>
            <p style="margin: 0; font-size: 13px; line-height: 1.6;">
              Once {{ currentDApp.name }} opens:
            </p>
            <ol style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
              <li>Click "Connect Wallet"</li>
              <li>Select "MetaMask"</li>
              <li>Confirm the connection</li>
              <li>You're ready! 🎉</li>
            </ol>
          </n-card>

          <n-alert type="success" style="margin-top: 16px;">
            <template #icon>
              <span style="font-size: 20px;">✅</span>
            </template>
            <strong>Your Wallet</strong><br>
            <code style="font-family: monospace; font-size: 11px;">{{ selectedWallet.address }}</code>
          </n-alert>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<style scoped>
.dapp-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.dapp-header-card {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 99, 71, 0.1));
}

.dapp-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.dapp-logo-section {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
}

.dapp-logo-large {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  overflow: hidden;
}

.dapp-logo-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dapp-header-content h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #fff;
}

.dapp-description {
  margin: 0 0 12px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.6;
}

.dapp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.connect-option {
  flex: 1;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.connect-option:hover {
  border-color: rgba(255, 107, 107, 0.5);
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
  transform: translateY(-2px);
}

.connect-option h3 {
  font-size: 16px;
  color: #fff;
}

.dapp-iframe-container {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 107, 107, 0.2);
}

.dapp-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
