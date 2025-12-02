<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { ethers } from 'ethers';

const route = useRoute();
const userID = useCookie('userID');

// DApps data (same as MonadTest.vue)
const dapps = [
  {
    id: 'bean-exchange',
    name: 'Bean Exchange',
    description: 'Gamified decentralized spot & perpetual exchange natively built on Monad',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/7maVchwQ5jX6DuCepjvX0H/1bdf32d0662b39adf46a0cbeda04efc6/bean_logo.jpg',
    url: 'https://bean.exchange/',
    tags: ['DEX', 'Perpetuals']
  },
  {
    id: 'bebop',
    name: 'Bebop',
    description: 'Web3 trading app and API that finds the best route for all trades',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/5IHca4DgJaNMeKgIGopgN/28d005da9228fe412989e75b4c24117a/bebop.jpg',
    url: 'https://bebop.xyz',
    tags: ['Trading', 'Aggregator']
  },
  {
    id: 'crystal',
    name: 'Crystal',
    description: 'CEX-level performance powered by the ultimate decentralized trading platform',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/1Ub8Y7vjuZNe6YydHHXym2/12ec3339a63cb2b8280b8b5e99b23dd0/Crystal_logo.webp',
    url: 'https://app.crystal.exchange/',
    tags: ['DEX', 'CLOB']
  },
  {
    id: 'drake',
    name: 'Drake',
    description: 'Hybrid CLOB unlocking CEX speed, DEX transparency, and frictionless yields',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/2S2twKY9jA0rrgo02A1JmO/2c52c77992be9b09844728f3109f2148/drake_logo.webp',
    url: 'https://drake.exchange/trade',
    tags: ['Perpetuals', 'CLOB']
  },
  {
    id: 'kuru',
    name: 'Kuru',
    description: 'Find and trade all your favorite Monad tokens on an onchain CLOB',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/Ira1U05HInL8TagPZOei6/17f731a89650361ac429a5d898007ca8/KuruLogo.jpg',
    url: 'https://kuru.io/',
    tags: ['DEX', 'CLOB']
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Leading decentralized exchange protocol',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/2TMvn2z6ifgOeKxqv3a07r/6fa1b6685e83059a44ea541c6f0642fe/UniswapLogo.jpg',
    url: 'http://app.uniswap.org/',
    tags: ['DEX', 'AMM']
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    description: 'Multi-chain DEX with yield farming and staking',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/1PDree4be32zH8IwUupM9b/fe4835ad092614137b959eb13741678d/icon_square_512.png',
    url: 'https://pancakeswap.finance/?chain=monadTestnet',
    tags: ['DEX', 'Farming']
  },
  {
    id: 'ammalgam',
    name: 'Ammalgam',
    description: 'DEX and swap platform for Monad',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/41Vjj0z6MRhVwuF8rF99ZE/7c07da116421d771090d260b9524a917/ammal.jpg',
    url: 'https://beta.ammalgam.xyz/',
    tags: ['DEX', 'Swap']
  },
  {
    id: 'octoswap',
    name: 'Octoswap',
    description: 'Fast and efficient decentralized exchange',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/23CObSX7u999VgVdEzRB7X/cfc7b88cd9bff8bb2edd37a190cdd986/octoswap_logo.webp',
    url: 'https://octo.exchange/swap',
    tags: ['DEX', 'Swap']
  },
  {
    id: 'monorail',
    name: 'Monorail',
    description: 'Aggregator combining onchain orderbooks and AMMs within Monad ecosystem',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/2MReeBHCFC6wxuec7rPt8O/b4433fa1f9da7497a7e905314cbd35a5/monorail_pfp_400x400.png',
    url: 'https://monorail.xyz/',
    tags: ['Aggregator', 'DEX']
  },
  {
    id: 'izumi',
    name: 'iZUMi',
    description: 'Liquidity as a Service protocol with concentrated liquidity',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/64m75hPxWmxtFu3CVRfrPB/1aedf35dd283b53e9a646c674e60a157/izumi_Finance_profile.jpg',
    url: 'https://alpha.izumi.finance/trade/swap',
    tags: ['DEX', 'Liquidity']
  },
  {
    id: 'clober',
    name: 'Clober',
    description: 'On-chain order book decentralized exchange',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/6rIrcFXXb5LMPOjyK5flOA/73519a4bce61b81d9c2931365c43f466/clober.webp',
    url: 'https://alpha.clober.io/trade?chain=10143',
    tags: ['DEX', 'Order Book']
  },
  {
    id: 'covenant',
    name: 'Covenant',
    description: 'Lever up your favorite token through liquid, tradeable debt markets',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/afzhC66e8rnGoDOfPBwlU/269764a61b6ac5daa34b63ef76df4dba/covenant.jpg',
    url: 'https://fluidtest.covenant.finance/',
    tags: ['Lending', 'DeFi']
  },
  {
    id: 'curvance',
    name: 'Curvance',
    description: 'Multichain liquidity protocol that maximizes capital efficiency',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/5RVuawPxhHFilhpzILzmBl/d0019e4909d562fdb8fd2fd11537c5c2/CurvanceLogo.png',
    url: 'https://monad.curvance.com/monad',
    tags: ['Lending', 'Liquidity']
  },
  {
    id: 'folks-finance',
    name: 'Folks Finance',
    description: 'Cross-chain lending and borrowing protocol',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/1uIWQ0B4zk6jciVjkWXFHl/4685bc60674d1a902a629b92096de533/folks_finance.jpg',
    url: 'https://testnet.xapp.folks.finance/',
    tags: ['Lending', 'Cross-chain']
  },
  {
    id: 'nostra',
    name: 'Nostra',
    description: 'Lending and borrowing protocol for Monad',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/76lO5Pkj7ONYu7DXyKNHkY/842e0b288a36aff49e777e6bdf764f5e/nostra.jpg',
    url: 'https://monad.nostra.finance/lend-borrow',
    tags: ['Lending', 'Borrowing']
  },
  {
    id: 'primex-finance',
    name: 'Primex Finance',
    description: 'Advanced DeFi lending and trading platform',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/2gdjiuTp50VHTMridmRzGB/0b6538a3be5892c7f275a8adda0beb1d/primex_logo_.webp',
    url: 'https://testnet-defi.primex.finance/',
    tags: ['Lending', 'Trading']
  },
  {
    id: 'apriori',
    name: 'aPriori',
    description: 'Staking platform for Monad ecosystem',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/4XbstG75DzBRHJO7saGos7/5bb03868b3828d653e96546da2d403bb/Apriori_logo.webp',
    url: 'https://stake.apr.io/',
    tags: ['Staking', 'Yield']
  },
  {
    id: 'magma',
    name: 'Magma',
    description: 'Liquid staking solution for Monad',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/aY6ZeCRKCylJbC1Cl4BQa/52ab4d6ca9faf967619a705f15dcedfb/Magma_logo.webp',
    url: 'https://www.magmastaking.xyz/',
    tags: ['Staking', 'Liquid Staking']
  },
  {
    id: 'kintsu',
    name: 'Kintsu',
    description: 'Staking rewards optimization platform',
    category: 'defi',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/7yO73TVjMSqtCVPqeTmmTr/ddb707037b5e552e4077429595db804c/Kintsu_logo.webp',
    url: 'https://kintsu.xyz/staking',
    tags: ['Staking', 'Rewards']
  },
  {
    id: 'lumiterra',
    name: 'Lumiterra',
    description: 'First agentic interactive multiplayer sandbox game',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/4knscEc04Kidh6FZL5muOp/f5693c1aaa0ca9507fc2217f964793b3/logo_lumiterra.webp',
    url: 'https://gmonad.lumiterra.net/lumonad',
    tags: ['Gaming', 'Metaverse']
  },
  {
    id: 'legends-of-elysium',
    name: 'Legends of Elysium',
    description: 'Trading card game with epic battles',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/2BajAvAhqcviS0LxNKYyyv/2c5cd5258915a445391bcd2ef6410e00/legends_of_el.webp',
    url: 'https://legendsofelysium.io/',
    tags: ['Gaming', 'Cards']
  },
  {
    id: 'dau-cards',
    name: 'DAU Cards',
    description: 'Collectible gaming cards on Monad',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/6EKCc7iN0fPgjAkwauSmUh/2629dd75b80f00f4e9d9ff1b4d1e22d5/DAUCards_profile.jpg',
    url: 'https://gmonad.daucards.com/',
    tags: ['Gaming', 'NFT']
  },
  {
    id: 'lfj',
    name: 'LFJ',
    description: 'Gaming platform on Monad',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/6gWaRnDHFgbRmdShtdZXne/299869308422be2c1715c0b690dbdbe4/lfj.jpg',
    url: 'https://pandaria.lfj.gg/',
    tags: ['Gaming', 'Platform']
  }
];

// Find current DApp
const currentDApp = computed(() => {
  return dapps.find(d => d.id === route.params.slug);
});

// Monad Network Config
const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 in decimal
  chainIdDecimal: 10143,
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://testnet.monad.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz']
};

// State
const wallets = ref([]);
const loadingWallets = ref(false);
const selectedWallet = ref(null);
const walletType = ref('metamask'); // 'metamask' or 'saved'
const showIframe = ref(false); // Control iframe loading
const iframeRef = ref(null); // Reference to iframe element
const emulatorActive = ref(false); // Track if emulator is active
const showWalletInstructions = ref(false); // Show import instructions modal

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
        network: 'Monad'
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
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (accounts.length > 0) {
      connectedAddress.value = accounts[0];
      web3Connected.value = true;
      walletType.value = 'metamask';

      provider.value = new ethers.BrowserProvider(window.ethereum);

      // Check chain
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      currentChainId.value = parseInt(chainId, 16);
      isCorrectNetwork.value = currentChainId.value === MONAD_TESTNET.chainIdDecimal;

      // Get balance
      await updateBalance();

      window.$message?.success('MetaMask connected!');

      // Try to switch to Monad if not on correct network
      if (!isCorrectNetwork.value) {
        await switchToMonadNetwork();
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
    // Fetch full wallet details including privateKey
    const response = await $fetch('/api/v1/TestNets/getWalletDetails', {
      method: 'GET',
      params: {
        walletId: wallet._id,
        userID: userID.value
      }
    });

    if (response.success && response.data) {
      const fullWallet = response.data;

      // Verify privateKey exists
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
  selectedWallet.value = null;
  provider.value = null;

  window.$message?.info('Wallet disconnected');
}

// Update balance for MetaMask
async function updateBalance() {
  if (!web3Connected.value || !connectedAddress.value || walletType.value !== 'metamask') return;

  try {
    const rpcProvider = new ethers.JsonRpcProvider(MONAD_TESTNET.rpcUrls[0]);
    const balance = await rpcProvider.getBalance(connectedAddress.value);
    connectedBalance.value = ethers.formatEther(balance);
  } catch (error) {
    console.error('[DApp] Error updating balance:', error);
    connectedBalance.value = '0';
  }
}

// Switch to Monad Network
async function switchToMonadNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_TESTNET.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: MONAD_TESTNET.chainId,
              chainName: MONAD_TESTNET.chainName,
              nativeCurrency: MONAD_TESTNET.nativeCurrency,
              rpcUrls: MONAD_TESTNET.rpcUrls,
              blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
            },
          ],
        });
      } catch (addError) {
        console.error('[DApp] Error adding network:', addError);
      }
    }
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

// Export wallet as JSON file for MetaMask import
function exportWalletAsJSON() {
  if (!selectedWallet.value || !selectedWallet.value.privateKey) {
    window.$message?.error('No wallet selected');
    return;
  }

  try {
    // Create wallet data for export
    const walletData = {
      name: selectedWallet.value.walletName || 'Imported Wallet',
      address: selectedWallet.value.address,
      privateKey: selectedWallet.value.privateKey,
      network: 'Monad Testnet',
      chainId: MONAD_TESTNET.chainIdDecimal,
      exported: new Date().toISOString()
    };

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monad-wallet-${selectedWallet.value.address.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.$message?.success('Wallet exported! Now import the file in MetaMask.', {
      duration: 5000
    });
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
    // Copy private key to clipboard
    await navigator.clipboard.writeText(selectedWallet.value.privateKey);

    // Show success message with instructions
    window.$message?.success('✅ Private key copied to clipboard!', {
      duration: 3000
    });

    // Wait a moment for clipboard
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to open MetaMask extension (works in Chrome/Edge/Brave)
    // Note: This opens the extension page, user needs to navigate to import
    if (window.ethereum) {
      // Request accounts to ensure MetaMask is active
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Show step-by-step instructions
      window.$message?.info('📋 Key copied! Next: MetaMask → Import Account → Paste (Ctrl+V)', {
        duration: 8000
      });
    } else {
      window.$message?.warning('MetaMask not detected. Install it first!');
      window.open('https://metamask.io/download/', '_blank');
    }
  } catch (error) {
    console.error('[Quick Import] Error:', error);
    window.$message?.error('Failed to copy key. Try manual copy.');
  }
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

// Open external URL
function openUrl(url) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

// SAVACAZANwalletemulator - Custom Web3 Provider for saved wallets
function createSAVACAZANwalletemulator() {
  if (!selectedWallet.value || !selectedWallet.value.privateKey) {
    console.error('[SAVACAZANwalletemulator] No wallet selected');
    return null;
  }

  const wallet = new ethers.Wallet(selectedWallet.value.privateKey);
  const rpcProvider = new ethers.JsonRpcProvider(MONAD_TESTNET.rpcUrls[0]);
  const connectedWallet = wallet.connect(rpcProvider);

  console.log('[SAVACAZANwalletemulator] Initializing for:', wallet.address);

  // EIP-1193 Provider Implementation
  const provider = {
    isMetaMask: true, // Pretend to be MetaMask
    isSAVACAZAN: true, // Custom flag
    chainId: MONAD_TESTNET.chainId,
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
          return MONAD_TESTNET.chainId;

        case 'net_version':
          return MONAD_TESTNET.chainIdDecimal.toString();

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

    // OVERRIDE MetaMask - Make our provider the primary one
    console.log('[SAVACAZANwalletemulator] Injecting provider...');

    // Method 1: Direct injection
    iframeWindow.ethereum = provider;

    // Method 2: Override window.ethereum getter
    Object.defineProperty(iframeWindow, 'ethereum', {
      value: provider,
      writable: false,
      configurable: true
    });

    // Method 3: Also inject as web3
    iframeWindow.web3 = {
      currentProvider: provider,
      eth: {
        defaultAccount: provider.selectedAddress
      }
    };

    // Method 4: Announce provider is ready
    setTimeout(() => {
      const event = new CustomEvent('ethereum#initialized', { detail: provider });
      iframeWindow.dispatchEvent(event);
    }, 100);

    emulatorActive.value = true;

    console.log('[SAVACAZANwalletemulator] ✅ Successfully injected!');
    console.log('[SAVACAZANwalletemulator] Address:', provider.selectedAddress);
    console.log('[SAVACAZANwalletemulator] Chain ID:', provider.chainId);

    window.$message?.success('🚀 SAVACAZANwalletemulator Active! Wallet ready in DApp.', {
      duration: 5000
    });
  } catch (error) {
    console.error('[SAVACAZANwalletemulator] Injection error:', error);
    window.$message?.error('Failed to activate emulator');
  }
}

// Quick launch with wallet info
function launchDAppWithWallet() {
  if (!web3Connected.value) {
    window.$message?.error('Please connect a wallet first!');
    return;
  }

  if (walletType.value === 'saved' && selectedWallet.value) {
    // Show instructions modal
    showWalletInstructions.value = true;
  } else {
    // Just open the DApp
    openUrl(currentDApp.value.url);
  }
}

// Load with emulator (iframe - limited due to CORS)
async function loadDAppWithEmulator() {
  // Validate wallet before loading
  if (!web3Connected.value) {
    window.$message?.error('Please connect a wallet first!');
    return;
  }

  if (walletType.value === 'saved') {
    // Show warning about CORS limitations
    window.$message?.warning('Iframe mode has limitations due to browser security. For best experience, use "🚀 Open DApp" button.', {
      duration: 5000
    });
  }

  showIframe.value = true;
  await nextTick();

  // Note: Cannot inject into cross-origin iframe due to CORS
  // Emulator only works if DApp is same-origin
}

// Lifecycle
onMounted(() => {
  if (userID.value) {
    fetchWallets();
  }

  // Listen for account changes
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
      <n-button text @click="navigateTo('/MonadTest')">
        ← Back to Monad Test
      </n-button>
    </div>

    <!-- DApp Not Found -->
    <div v-if="!currentDApp" class="empty-state">
      <n-result status="404" title="DApp Not Found" description="The requested DApp does not exist.">
        <template #footer>
          <n-button @click="navigateTo('/MonadTest')">
            Go Back
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- DApp Page Content -->
    <div v-else class="dapp-content">
      <!-- Header -->
      <n-card class="dapp-header-card" style="margin-bottom: 24px;">
        <div class="dapp-header-content">
          <div class="dapp-info">
            <div class="dapp-logo">
              <img v-if="currentDApp.logo.startsWith('http')" :src="currentDApp.logo" :alt="currentDApp.name" />
              <span v-else>{{ currentDApp.logo }}</span>
            </div>
            <div>
              <h1 style="margin: 0 0 8px 0;">{{ currentDApp.name }}</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7);">{{ currentDApp.description }}</p>
              <div style="display: flex; gap: 6px; margin-top: 8px;">
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
              :style="walletType === 'saved' && web3Connected ? { background: 'linear-gradient(135deg, #f6921e 0%, #ff6b35 100%)' } : {}"
            >
              {{ walletType === 'saved' && web3Connected ? '🔥 Open with Wallet Guide' : '🚀 Open DApp' }}
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Wallet Connection Section -->
      <n-card title="🦊 Wallet Connection" style="margin-bottom: 24px;">
        <!-- Connection Status -->
        <n-alert v-if="web3Connected" type="success" style="margin-bottom: 16px;">
          <template #icon>
            <span style="font-size: 24px;">✅</span>
          </template>
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <strong>Connected {{ walletType === 'metamask' ? 'with MetaMask' : 'with Saved Wallet' }}</strong><br>
              <span style="font-family: monospace; font-size: 13px;">{{ formatAddress(connectedAddress) }}</span>
              <n-button text size="tiny" @click="copyToClipboard(connectedAddress, 'Address')" style="margin-left: 8px;">
                📋
              </n-button>
              <br>
              <span style="color: rgba(255, 255, 255, 0.8);">Balance: {{ parseFloat(connectedBalance).toFixed(4) }} MON</span>
            </div>
            <n-button type="error" @click="disconnectWallet" size="small">
              🔌 Disconnect
            </n-button>
          </div>
        </n-alert>

        <!-- Import to MetaMask Instructions (for saved wallets) -->
        <n-alert v-if="web3Connected && walletType === 'saved' && selectedWallet" type="info" style="margin-bottom: 16px;">
          <template #icon>
            <span style="font-size: 20px;">🔑</span>
          </template>
          <div>
            <strong>Import Wallet to MetaMask</strong>
            <p style="margin: 8px 0; font-size: 13px;">
              To use this wallet with {{ currentDApp.name }}, import it to MetaMask:
            </p>

            <!-- Quick Import Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <n-button
                type="primary"
                size="large"
                @click="quickImportToMetaMask"
                :style="{ background: 'linear-gradient(135deg, #f6921e 0%, #ff6b35 100%)' }"
              >
                🦊 Quick Copy Key
              </n-button>
              <n-button
                type="success"
                size="large"
                @click="exportWalletAsJSON"
              >
                💾 Export JSON
              </n-button>
            </div>

            <n-alert type="success" size="small" style="margin-bottom: 16px;">
              <template #icon>
                <span style="font-size: 16px;">⚡</span>
              </template>
              <strong>Fast Method:</strong> Click "💾 Export JSON" → Download file → MetaMask → Import JSON file (only 2 steps!)
            </n-alert>

            <n-divider style="margin: 16px 0;">
              <span style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">OR VIEW PRIVATE KEY</span>
            </n-divider>

            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; margin: 8px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Private Key:</span>
                <n-button
                  size="tiny"
                  @click="copyToClipboard(selectedWallet.privateKey, 'Private Key')"
                  type="success"
                >
                  📋 Copy Key
                </n-button>
              </div>
              <code style="font-family: monospace; font-size: 11px; color: #ffc107; word-break: break-all;">
                {{ selectedWallet.privateKey }}
              </code>
            </div>

            <n-collapse style="margin-top: 12px;">
              <n-collapse-item title="📖 Manual Import Steps" name="manual-steps">
                <ol style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.8;">
                  <li>Click the MetaMask extension icon</li>
                  <li>Click on your account icon (top right)</li>
                  <li>Select <strong>"Import Account"</strong></li>
                  <li>Select type: <strong>"Private Key"</strong></li>
                  <li>Paste the private key from above</li>
                  <li>Click <strong>"Import"</strong></li>
                  <li>Use "🚀 Open DApp" button to launch {{ currentDApp.name }}</li>
                  <li>Connect with MetaMask in the DApp</li>
                </ol>
              </n-collapse-item>
            </n-collapse>
          </div>
        </n-alert>

        <!-- Connection Options -->
        <div v-if="!web3Connected" class="connection-options">
          <!-- MetaMask Connection -->
          <n-card size="small" hoverable class="connection-card" @click="connectMetaMask" style="cursor: pointer;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🦊</div>
              <h3 style="margin: 0 0 8px 0;">Connect MetaMask</h3>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px;">
                Connect your MetaMask wallet
              </p>
            </div>
          </n-card>

          <!-- Saved Wallets -->
          <n-card size="small" title="💾 Use Saved Wallet" v-if="wallets.length > 0">
            <div v-if="loadingWallets" style="text-align: center; padding: 20px;">
              <n-spin size="medium" />
            </div>
            <div v-else style="display: flex; flex-direction: column; gap: 8px;">
              <n-button
                v-for="wallet in wallets"
                :key="wallet._id"
                @click="connectSavedWallet(wallet)"
                block
                secondary
              >
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                  <span>{{ wallet.walletName || 'Unnamed Wallet' }}</span>
                  <span style="font-family: monospace; font-size: 11px; color: rgba(255, 255, 255, 0.6);">
                    {{ formatAddress(wallet.address) }}
                  </span>
                </div>
              </n-button>
            </div>
          </n-card>

          <!-- No Saved Wallets -->
          <n-alert v-else-if="!loadingWallets" type="info" style="margin-top: 16px;">
            No saved wallets found. Generate wallets in the <n-button text @click="navigateTo('/MonadTest')">Monad Test page</n-button>.
          </n-alert>
        </div>
      </n-card>

      <!-- DApp Iframe -->
      <n-card title="📱 DApp Interface" style="margin-bottom: 24px;">
        <!-- Current Wallet Info -->
        <n-alert v-if="web3Connected" :type="walletType === 'saved' ? 'info' : 'success'" style="margin-bottom: 16px;">
          <template #icon>
            <span style="font-size: 20px;">{{ walletType === 'saved' ? '🚀' : '✅' }}</span>
          </template>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div>
              <strong v-if="walletType === 'saved'">Using Saved Wallet - Will auto-inject with SAVACAZANwalletemulator!</strong>
              <strong v-else>Using MetaMask</strong>
              <br>
              <code style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">{{ formatAddress(connectedAddress) }}</code>
            </div>
            <n-button
              v-if="walletType === 'saved'"
              size="small"
              type="primary"
              @click="exportWalletAsJSON"
            >
              💾 Export
            </n-button>
          </div>
        </n-alert>

        <n-alert v-else type="info" style="margin-bottom: 16px;">
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
            {{ web3Connected ? `Ready to load ${currentDApp.name}` : 'Connect a wallet first, then load the DApp' }}
          </p>
          <n-button
            type="primary"
            size="large"
            @click="loadDAppWithEmulator"
            :style="{ background: '#18a058' }"
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
            <span style="font-size: 12px;">Your saved wallet is now available in the DApp. You can connect directly without MetaMask!</span>
          </n-alert>

          <div class="dapp-iframe-container">
            <iframe
              ref="iframeRef"
              :src="currentDApp.url"
              frameborder="0"
              allowfullscreen
              class="dapp-iframe"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              @load="onIframeLoad"
            ></iframe>
          </div>

          <!-- Info about CORS -->
          <n-alert v-if="walletType === 'saved'" type="warning" style="margin-top: 12px;" size="small">
            <template #icon>
              <span>⚠️</span>
            </template>
            <strong>Note:</strong> Due to browser security (CORS), the emulator might not work with all DApps in iframe. If it doesn't work, use the "🚀 Open DApp" button instead and import your wallet manually.
          </n-alert>
        </div>
      </n-card>

      <!-- Network Info -->
      <n-card title="🌐 Network Information">
        <n-descriptions :column="1" size="small">
          <n-descriptions-item label="Network">
            Monad Testnet
          </n-descriptions-item>
          <n-descriptions-item label="Chain ID">
            {{ MONAD_TESTNET.chainIdDecimal }} ({{ MONAD_TESTNET.chainId }})
          </n-descriptions-item>
          <n-descriptions-item label="RPC URL">
            {{ MONAD_TESTNET.rpcUrls[0] }}
          </n-descriptions-item>
          <n-descriptions-item label="Explorer">
            <a :href="MONAD_TESTNET.blockExplorerUrls[0]" target="_blank" style="color: #18a058;">
              {{ MONAD_TESTNET.blockExplorerUrls[0] }}
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
                :style="{ background: 'linear-gradient(135deg, #f6921e 0%, #ff6b35 100%)' }"
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
              Choose your preferred method to import the wallet to MetaMask
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
              This will open the DApp in a new tab
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
              <li>Click "Connect Wallet" or similar button</li>
              <li>Select "MetaMask"</li>
              <li>Confirm the connection</li>
              <li>You're ready to use the DApp! 🎉</li>
            </ol>
          </n-card>

          <!-- Wallet Info -->
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
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
}

.dapp-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.dapp-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.dapp-logo {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  overflow: hidden;
  flex-shrink: 0;
}

.dapp-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dapp-logo span {
  font-size: 48px;
}

.connection-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.connection-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.connection-card:hover {
  border-color: #18a058;
  transform: translateY(-4px);
}

.dapp-iframe-container {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.dapp-iframe {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
