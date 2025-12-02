<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ethers } from 'ethers';

const userID = useCookie('userID');

// MegaETH DApps from BlockScout
const dapps = [
  // DeFi - Swaps & DEXs
  {
    id: 'bronto',
    name: 'Bronto',
    description: 'First Real-Time MetaDEX on MegaETH, powered by concentrated liquidity pools with ve(3,3) model',
    category: 'defi',
    logo: '🦕',
    url: 'https://bronto.xyz',
    tags: ['MetaDEX', 'Liquidity', 'Real-time']
  },
  {
    id: 'gte',
    name: 'GTE',
    description: 'Unlock the best possible onchain prices. Scans all trading venues on MegaETH for best deals',
    category: 'defi',
    logo: '💎',
    url: 'https://gte.finance',
    tags: ['Aggregator', 'Best Price']
  },
  {
    id: 'curve',
    name: 'Curve',
    description: 'Decentralized exchange liquidity pool designed for extremely efficient stablecoin trading',
    category: 'defi',
    logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
    url: 'https://curve.fi/',
    tags: ['DEX', 'Stablecoins']
  },
  {
    id: 'euclid',
    name: 'Euclid',
    description: 'Decentralized unified cross-chain liquidity infrastructure for unified source of liquidity',
    category: 'defi',
    logo: '🌐',
    url: 'https://euclid.xyz',
    tags: ['Cross-chain', 'Liquidity']
  },
  {
    id: 'rubic',
    name: 'Rubic',
    description: 'Cross-Chain Tech Aggregator for users + tools for dApps',
    category: 'defi',
    logo: '🔷',
    url: 'https://app.rubic.exchange',
    tags: ['Bridge', 'Swaps', 'Cross-chain']
  },
  {
    id: 'cap',
    name: 'Cap',
    description: 'Stablecoin protocol with dollar-denominated cUSD and yield-bearing stcUSD',
    category: 'defi',
    logo: '🎩',
    url: 'https://cap.xyz',
    tags: ['Stablecoin', 'Yield']
  },
  {
    id: 'world-capital',
    name: 'World Capital Markets',
    description: 'Spot, perps, and lending CLOBs with perfect capital efficiency across all 3 markets',
    category: 'defi',
    logo: '🌍',
    url: 'https://worldcapital.market',
    tags: ['Trading', 'Lending', 'Perps']
  },
  // DeFi - Lending & Yield
  {
    id: 'gearbox',
    name: 'Gearbox Protocol',
    description: 'Composable leverage - margin trade on Uniswap, leverage farm on Curve, use 10X more capital',
    category: 'defi',
    logo: '⚙️',
    url: 'https://gearbox.fi',
    tags: ['Leverage', 'Lending', 'Yield']
  },
  {
    id: 'mynt',
    name: 'Mynt',
    description: 'Reinventing money with verifiable yield, built for high-throughput chains',
    category: 'defi',
    logo: '💰',
    url: 'https://mynt.xyz',
    tags: ['Yield', 'Aggregator']
  },
  {
    id: 'avon',
    name: 'Avon',
    description: 'Real-time credit market! Unlock the best rates for onchain loans',
    category: 'defi',
    logo: '🏦',
    url: 'https://avon.finance',
    tags: ['Lending', 'Credit']
  },
  {
    id: 'relend',
    name: 'Relend Network',
    description: 'Lend. Relend. Repeat. Stablecoin Credit Infrastructure for Every Chain',
    category: 'defi',
    logo: '🔄',
    url: 'https://relend.network',
    tags: ['Lending', 'Stablecoin']
  },
  // Gaming
  {
    id: 'app98',
    name: 'App98',
    description: 'All-in-one hub for MegaETH - play games, swap, bridge assets, and chat from one interface',
    category: 'gaming',
    logo: '🎮',
    url: 'https://app98.xyz',
    tags: ['Gaming', 'Social', 'Hub']
  },
  {
    id: 'block-battles',
    name: 'Block Battles: Gas Wars',
    description: 'Match blocks, earn points, and compete in the ultimate blockchain gaming arena!',
    category: 'gaming',
    logo: '⚔️',
    url: 'https://blockbattles.io',
    tags: ['Gaming', 'Competition']
  },
  {
    id: 'megaracer',
    name: 'MegaRacer',
    description: 'Exciting typing game for web3 - race through levels, earn rewards, climb the leaderboard!',
    category: 'gaming',
    logo: '🏎️',
    url: 'https://megaracer.xyz',
    tags: ['Gaming', 'Typing', 'Rewards']
  },
  {
    id: 'megapunks',
    name: 'MegaPunks',
    description: 'On-chain gaming - Dice, Coinflip, Slots, Plinko with fair odds and instant payouts',
    category: 'gaming',
    logo: '🎲',
    url: 'https://megapunks.xyz',
    tags: ['Gaming', 'Casino', 'Provably Fair']
  },
  {
    id: 'casino',
    name: 'CASINO',
    description: 'Decentralized gaming with provably fair randomness, instant payouts, and blockchain technology',
    category: 'gaming',
    logo: '🎰',
    url: 'https://casino.megaeth.xyz',
    tags: ['Casino', 'Gaming', 'Fair']
  },
  {
    id: 'awe',
    name: 'Autonomous World Engine',
    description: 'The engine to power the 3D internet—open, awe provoking, for everyone',
    category: 'gaming',
    logo: '🌌',
    url: 'https://awe.xyz',
    tags: ['Games', 'Metaverse', '3D']
  },
  // NFTs
  {
    id: 'rarible',
    name: 'Rarible',
    description: 'First community-owned NFT marketplace. Create, sell, or collect blockchain-secured items',
    category: 'nft',
    logo: 'https://cryptologos.cc/logos/rarible-rari-logo.png',
    url: 'https://rarible.com/',
    tags: ['NFT', 'Marketplace']
  },
  {
    id: 'sirio',
    name: 'Sirio',
    description: 'Global NFT experience hub, unifying the Web3 ecosystem',
    category: 'nft',
    logo: '🌟',
    url: 'https://sirio.xyz',
    tags: ['NFT', 'Hub']
  },
  {
    id: 'hashpin',
    name: 'HashPin',
    description: 'Pin cryptographic hashes to blockchain and claim as NFTs - on-chain proof of existence',
    category: 'nft',
    logo: '📌',
    url: 'https://hashpin.xyz',
    tags: ['NFT', 'Proof']
  },
  {
    id: 'kingdomly',
    name: 'Kingdomly',
    description: 'All-in-one platform for NFT creators. Go from mint to market in one seamless flow',
    category: 'nft',
    logo: '👑',
    url: 'https://kingdomly.xyz',
    tags: ['NFT', 'Creator', 'Launchpad']
  },
  {
    id: 'omnihub',
    name: 'OmniHub',
    description: 'Multichain NFT launchpad. Create, buy and sell NFTs today',
    category: 'nft',
    logo: '🔮',
    url: 'https://omnihub.xyz',
    tags: ['NFT', 'Launchpad', 'Multichain']
  },
  // Social & Community
  {
    id: 'noise',
    name: 'Noise',
    description: 'Discover and trade trends with social analytics',
    category: 'social',
    logo: '📢',
    url: 'https://noise.xyz',
    tags: ['Social', 'Analytics', 'Trends']
  },
  {
    id: 'allmint',
    name: 'AllMint',
    description: 'Web4 Social Network with content ownership and direct monetization in blockchain',
    category: 'social',
    logo: '🌐',
    url: 'https://allmint.xyz',
    tags: ['Social', 'Web4', 'Monetization']
  },
  // Developer Tools
  {
    id: 'tokenops',
    name: 'TokenOps',
    description: 'Manage token vesting, unlocks, airdrops and staking',
    category: 'tools',
    logo: '🔧',
    url: 'https://tokenops.xyz',
    tags: ['Dev Tools', 'Vesting', 'Airdrops']
  },
  {
    id: 'pimlico',
    name: 'Pimlico',
    description: 'Most advanced smart account infrastructure - ERC-4337 bundlers, paymasters, and more',
    category: 'tools',
    logo: '🛠️',
    url: 'https://pimlico.io',
    tags: ['Infrastructure', 'Smart Accounts']
  },
  {
    id: 'zerodev',
    name: 'ZeroDev',
    description: 'Powerful toolkit for smart accounts - smart EOAs (EIP-7702) and smart contract accounts',
    category: 'tools',
    logo: '⚡',
    url: 'https://zerodev.app',
    tags: ['Dev Tools', 'Smart Accounts']
  },
  {
    id: 'gelato',
    name: 'Gelato',
    description: 'All-in-one Ethereum Rollup as a Service. Deploy production-grade L2 rollups',
    category: 'tools',
    logo: '🍦',
    url: 'https://gelato.network',
    tags: ['Infrastructure', 'Rollups']
  },
  {
    id: 'envio',
    name: 'Envio',
    description: 'Modern multi-chain EVM blockchain indexer for real-time and historical data',
    category: 'tools',
    logo: '📊',
    url: 'https://envio.dev',
    tags: ['Indexer', 'Analytics']
  },
  {
    id: 'rainmakr',
    name: 'RainMakr',
    description: 'AI Launchpad with proprietary AI agents and doxxed fair-launch system',
    category: 'tools',
    logo: '🌧️',
    url: 'https://rainmakr.xyz',
    tags: ['AI', 'Launchpad']
  },
  // Analytics & Data
  {
    id: 'layerhub',
    name: 'LayerHub',
    description: 'Explore user activity and unlock insights for informed crypto decisions',
    category: 'analytics',
    logo: '📈',
    url: 'https://layerhub.xyz',
    tags: ['Analytics', 'Explorer']
  },
  {
    id: 'mtrkr',
    name: 'MTRKR',
    description: 'Visualize your MegaETH wallet in real time - tokens, NFTs & DeFi positions',
    category: 'analytics',
    logo: '👁️',
    url: 'https://mtrkr.xyz',
    tags: ['Portfolio', 'Tracker']
  },
  {
    id: 'predictmarket',
    name: 'PredictMarket',
    description: 'Decentralized prediction markets - make informed bets on crypto prices and events',
    category: 'analytics',
    logo: '🔮',
    url: 'https://predictmarket.xyz',
    tags: ['Predictions', 'Betting']
  },
  // Bridges & Payments
  {
    id: 'firefly',
    name: 'Firefly Bridge',
    description: 'Fast, low-cost, secure cross-chain services for Ethereum, Arbitrum, Optimism and more',
    category: 'bridge',
    logo: '🦋',
    url: 'https://firefly.xyz',
    tags: ['Bridge', 'Cross-chain']
  },
  {
    id: 'chainbills',
    name: 'Chainbills',
    description: 'Simplified on-chain payments for everyone - no wallet addresses, just one link',
    category: 'bridge',
    logo: '💳',
    url: 'https://chainbills.xyz',
    tags: ['Payments', 'Gateway']
  },
  // Explorer & Faucet
  {
    id: 'blockscout',
    name: 'BlockScout Explorer',
    description: 'Official MegaETH testnet blockchain explorer',
    category: 'tools',
    logo: '🔍',
    url: 'https://megaeth-testnet.blockscout.com/',
    tags: ['Explorer', 'Analytics']
  },
  {
    id: 'faucet',
    name: 'MegaETH Faucet',
    description: 'Get test METH tokens for development',
    category: 'tools',
    logo: '💧',
    url: 'https://faucet.megaeth.com/',
    tags: ['Faucet', 'Testnet']
  }
];

// Categories
const categories = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'defi', label: 'DeFi', icon: '💰' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'nft', label: 'NFT', icon: '🖼️' },
  { value: 'social', label: 'Social', icon: '💬' },
  { value: 'tools', label: 'Dev Tools', icon: '🔧' },
  { value: 'analytics', label: 'Analytics', icon: '📊' },
  { value: 'bridge', label: 'Bridge', icon: '🌉' }
];

// State for DApps
const searchQuery = ref('');
const selectedCategory = ref('all');

// Filtered apps
const filteredApps = computed(() => {
  let apps = dapps;

  // Filter by category
  if (selectedCategory.value !== 'all') {
    apps = apps.filter(app => app.category === selectedCategory.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    apps = apps.filter(app =>
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return apps;
});

// MegaETH Carrot Testnet Configuration
const MEGAETH_TESTNET = {
  chainId: '0x18C6', // 6342 in decimal
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
  blockExplorerUrls: ['https://megaeth-testnet.blockscout.com'],
  apiEndpoint: '/api/v1/TestNets/generateMegaETHWallet'
};

// Tab state
const activeTab = ref('wallets');

// Computed current network config
const currentNetwork = computed(() => {
  return MEGAETH_TESTNET;
});

// State
const wallets = ref([]);
const loading = ref(false);
const generatingWallet = ref(false);
const selectedWallet = ref(null);
const showWalletModal = ref(false);

// Web3 State
const web3Connected = ref(false);
const connectedAddress = ref('');
const connectedBalance = ref('0');
const currentChainId = ref(null);
const isCorrectNetwork = ref(false);
const switchingNetwork = ref(false);
const connectingWallet = ref(false);
const provider = ref(null);
const signer = ref(null);
const scanningBalance = ref({});
const scanningAll = ref(false);

// Stats
const totalWallets = computed(() => wallets.value.length);
const totalAddresses = computed(() => wallets.value.length);

// SAVACAZANwalletemulator state
const emulatedWallet = ref(null);
const emulatorActive = ref(false);

// Check if MetaMask is installed
const isMetaMaskInstalled = computed(() => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
});

// Network status
const networkStatus = computed(() => {
  if (!web3Connected.value) return 'Not Connected';
  if (isCorrectNetwork.value) return `${currentNetwork.value.chainName} ✓`;
  return 'Wrong Network';
});

// Watch tab changes to reload wallets
watch(activeTab, () => {
  if (activeTab.value === 'wallets') {
    fetchWallets();
  }
  // Check if connected to correct network
  if (web3Connected.value) {
    isCorrectNetwork.value = currentChainId.value === currentNetwork.value.chainIdDecimal;
  }
});

// Connect to MetaMask
async function connectWallet() {
  if (!isMetaMaskInstalled.value) {
    window.$message?.error('Please install MetaMask to continue!');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  connectingWallet.value = true;

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length > 0) {
      connectedAddress.value = accounts[0];
      web3Connected.value = true;

      // Initialize provider and signer
      provider.value = new ethers.BrowserProvider(window.ethereum);
      signer.value = await provider.value.getSigner();

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      currentChainId.value = parseInt(chainId, 16);
      isCorrectNetwork.value = currentChainId.value === currentNetwork.value.chainIdDecimal;

      // Get balance
      await updateBalance();

      window.$message?.success('Wallet connected successfully!');

      // If not on correct network, prompt to switch
      if (!isCorrectNetwork.value) {
        setTimeout(() => {
          window.$message?.warning(`Please switch to ${currentNetwork.value.chainName}`);
        }, 1000);
      }
    }
  } catch (error) {
    console.error('[Connect Wallet] Error:', error);
    window.$message?.error('Failed to connect wallet: ' + error.message);
  } finally {
    connectingWallet.value = false;
  }
}

// Disconnect wallet
function disconnectWallet() {
  web3Connected.value = false;
  connectedAddress.value = '';
  connectedBalance.value = '0';
  currentChainId.value = null;
  isCorrectNetwork.value = false;
  provider.value = null;
  signer.value = null;
  window.$message?.success('Wallet disconnected');
}

// Switch to MegaETH Testnet
async function switchToMegaETHTestnet() {
  if (!isMetaMaskInstalled.value) {
    window.$message?.error('Please install MetaMask first!');
    return;
  }

  if (!web3Connected.value) {
    window.$message?.error('Please connect your wallet first!');
    return;
  }

  switchingNetwork.value = true;

  try {
    // Try to switch to MegaETH Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: currentNetwork.value.chainId }],
    });

    window.$message?.success('Switched to MegaETH Carrot successfully!');
    isCorrectNetwork.value = true;
    await updateBalance();
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add MegaETH Testnet to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: currentNetwork.value.chainId,
            chainName: currentNetwork.value.chainName,
            nativeCurrency: currentNetwork.value.nativeCurrency,
            rpcUrls: currentNetwork.value.rpcUrls,
            blockExplorerUrls: currentNetwork.value.blockExplorerUrls,
          }],
        });

        window.$message?.success('MegaETH Carrot added and switched successfully!');
        isCorrectNetwork.value = true;
        await updateBalance();
      } catch (addError) {
        console.error('[Add Network] Error:', addError);
        window.$message?.error('Failed to add MegaETH Testnet: ' + addError.message);
      }
    } else {
      console.error('[Switch Network] Error:', switchError);
      window.$message?.error('Failed to switch network: ' + switchError.message);
    }
  } finally {
    switchingNetwork.value = false;
  }
}

// Update balance with retry logic
async function updateBalance() {
  if (!web3Connected.value || !connectedAddress.value) return;

  console.log('[Update Balance] Fetching balance for:', connectedAddress.value);

  // Try multiple RPC endpoints
  for (let i = 0; i < currentNetwork.value.rpcUrls.length; i++) {
    const rpcUrl = currentNetwork.value.rpcUrls[i];

    try {
      console.log(`[Update Balance] Trying RPC ${i + 1}:`, rpcUrl);

      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);

      // Set timeout for getBalance call
      const balancePromise = rpcProvider.getBalance(connectedAddress.value);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const balance = await Promise.race([balancePromise, timeoutPromise]);
      const balanceInMETH = ethers.formatEther(balance);

      connectedBalance.value = balanceInMETH;

      console.log(`[Update Balance] ✅ Success with RPC ${i + 1}`);
      console.log(`[Update Balance] Balance: ${balanceInMETH} ${currentNetwork.value.nativeCurrency.symbol}`);

      if (parseFloat(balanceInMETH) > 0) {
        window.$message?.success(`Balance: ${parseFloat(balanceInMETH).toFixed(6)} METH`);
      }

      return; // Success, exit function
    } catch (error) {
      console.warn(`[Update Balance] RPC ${i + 1} failed:`, error.message);

      if (i === currentNetwork.value.rpcUrls.length - 1) {
        console.error('[Update Balance] All RPCs failed');
        connectedBalance.value = '0';
        window.$message?.error('Failed to fetch balance from all RPC endpoints');
      }
    }
  }
}

// Scan balance from blockchain for a specific address
async function scanWalletBalance(wallet) {
  if (!wallet || !wallet.address) return;

  scanningBalance.value[wallet._id] = true;

  console.log(`[Scan Balance] Starting scan for wallet: ${wallet.walletName}`);

  let balanceInMETH = '0';
  let success = false;

  for (let i = 0; i < currentNetwork.value.rpcUrls.length; i++) {
    const rpcUrl = currentNetwork.value.rpcUrls[i];

    try {
      const megaethProvider = new ethers.JsonRpcProvider(rpcUrl);

      const balancePromise = megaethProvider.getBalance(wallet.address);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const balance = await Promise.race([balancePromise, timeoutPromise]);
      balanceInMETH = ethers.formatEther(balance);

      console.log(`[Scan Balance] ✅ Success with RPC ${i + 1}`);
      console.log(`[Scan Balance] Balance: ${balanceInMETH} METH`);

      success = true;
      break;
    } catch (error) {
      console.warn(`[Scan Balance] RPC ${i + 1} failed:`, error.message);
    }
  }

  if (success) {
    try {
      const walletIndex = wallets.value.findIndex(w => w._id === wallet._id);
      if (walletIndex !== -1) {
        wallets.value[walletIndex].balance = balanceInMETH;
      }

      await $fetch('/api/v1/TestNets/updateWalletBalance', {
        method: 'POST',
        body: {
          walletId: wallet._id,
          balance: balanceInMETH
        }
      });

      window.$message?.success(`Balance updated: ${parseFloat(balanceInMETH).toFixed(6)} METH`);
    } catch (error) {
      console.error('[Scan Balance] Error updating database:', error);
      window.$message?.error('Failed to update balance in database');
    }
  } else {
    console.error('[Scan Balance] All RPCs failed');
    window.$message?.error('Failed to scan balance from all RPC endpoints');
  }

  scanningBalance.value[wallet._id] = false;
}

// Scan all wallets balances
async function scanAllWallets() {
  if (wallets.value.length === 0) {
    window.$message?.warning('No wallets to scan');
    return;
  }

  scanningAll.value = true;

  let successCount = 0;
  let errorCount = 0;

  for (const wallet of wallets.value) {
    let balanceInMETH = '0';
    let success = false;

    for (let i = 0; i < currentNetwork.value.rpcUrls.length; i++) {
      const rpcUrl = currentNetwork.value.rpcUrls[i];

      try {
        const megaethProvider = new ethers.JsonRpcProvider(rpcUrl);

        const balancePromise = megaethProvider.getBalance(wallet.address);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const balance = await Promise.race([balancePromise, timeoutPromise]);
        balanceInMETH = ethers.formatEther(balance);

        success = true;
        break;
      } catch (error) {
        console.warn(`[Scan All] RPC ${i + 1} failed for ${wallet.walletName}`);
      }
    }

    if (success) {
      try {
        const walletIndex = wallets.value.findIndex(w => w._id === wallet._id);
        if (walletIndex !== -1) {
          wallets.value[walletIndex].balance = balanceInMETH;
        }

        await $fetch('/api/v1/TestNets/updateWalletBalance', {
          method: 'POST',
          body: {
            walletId: wallet._id,
            balance: balanceInMETH
          }
        });

        successCount++;
      } catch (error) {
        errorCount++;
      }
    } else {
      errorCount++;
    }
  }

  if (successCount > 0) {
    window.$message?.success(`✅ Scanned ${successCount} wallet${successCount !== 1 ? 's' : ''} successfully!`);
  }
  if (errorCount > 0) {
    window.$message?.warning(`⚠️ Failed to scan ${errorCount} wallet${errorCount !== 1 ? 's' : ''}`);
  }

  scanningAll.value = false;
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (accounts[0] !== connectedAddress.value) {
    connectedAddress.value = accounts[0];
    updateBalance();
    window.$message?.info('Account changed');
  }
}

// Handle chain changes
function handleChainChanged(chainId) {
  const chainIdDecimal = parseInt(chainId, 16);
  currentChainId.value = chainIdDecimal;
  isCorrectNetwork.value = chainIdDecimal === currentNetwork.value.chainIdDecimal;

  if (isCorrectNetwork.value) {
    window.$message?.success(`Connected to ${currentNetwork.value.chainName}`);
    updateBalance();
  } else {
    window.$message?.warning(`Please switch to ${currentNetwork.value.chainName}`);
  }
}

// Fetch wallets from database
async function fetchWallets() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch('/api/v1/TestNets/fetchTestNetWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: currentNetwork.value.network
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
      console.log(`[${currentNetwork.value.chainName}] Loaded ${wallets.value.length} wallets`);
    } else {
      window.$message?.error(response.message || 'Failed to fetch wallets');
    }
  } catch (error) {
    console.error('[MegaETH Test] Error fetching wallets:', error);
    window.$message?.error('Error loading wallets');
  } finally {
    loading.value = false;
  }
}

// Generate wallet
async function handleGenerateWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  generatingWallet.value = true;

  try {
    const response = await $fetch(currentNetwork.value.apiEndpoint, {
      method: 'POST',
      body: {
        userID: userID.value,
        walletName: `${currentNetwork.value.chainName} ${Date.now()}`
      }
    });

    if (response.success) {
      window.$message?.success(`${currentNetwork.value.chainName} wallet generated successfully!`);
      await fetchWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error(`[${currentNetwork.value.chainName}] Error generating wallet:`, error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingWallet.value = false;
  }
}

// SAVACAZANwalletemulator - Create custom MetaMask provider for saved wallet
async function createSAVACAZANwalletemulator(wallet) {
  if (!wallet || !wallet.privateKey) {
    console.error('[SAVACAZANwalletemulator] No wallet or private key provided');
    return null;
  }

  try {
    // Fetch full wallet details including private key
    const response = await $fetch('/api/v1/TestNets/getWalletDetails', {
      method: 'GET',
      params: {
        walletId: wallet._id,
        userID: userID.value
      }
    });

    if (!response.success || !response.data.privateKey) {
      window.$message?.error('Failed to retrieve wallet private key');
      return null;
    }

    const walletData = response.data;
    const ethWallet = new ethers.Wallet(walletData.privateKey);
    const rpcProvider = new ethers.JsonRpcProvider(MEGAETH_TESTNET.rpcUrls[0]);
    const connectedWallet = ethWallet.connect(rpcProvider);

    console.log('[SAVACAZANwalletemulator] Creating provider for:', ethWallet.address);

    // EIP-1193 Provider Implementation
    const provider = {
      isMetaMask: true,
      isSAVACAZAN: true,
      chainId: MEGAETH_TESTNET.chainId,
      selectedAddress: ethWallet.address,
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
            return [ethWallet.address];

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
            const signature = await ethWallet.signMessage(params[0]);
            return signature;

          case 'eth_sign':
            const signData = await ethWallet.signMessage(params[1]);
            return signData;

          default:
            return await rpcProvider.send(method, params || []);
        }
      }
    };

    return provider;
  } catch (error) {
    console.error('[SAVACAZANwalletemulator] Error creating provider:', error);
    window.$message?.error('Failed to create emulator: ' + error.message);
    return null;
  }
}

// Activate MetaMask Emulator for a saved wallet
async function activateMetaMaskEmulator(wallet) {
  try {
    console.log('[SAVACAZANwalletemulator] Activating emulator for:', wallet.walletName);

    const provider = await createSAVACAZANwalletemulator(wallet);
    if (!provider) {
      return;
    }

    // Store original ethereum provider if exists
    if (window.ethereum && !window.ethereum.isSAVACAZAN) {
      window._originalEthereum = window.ethereum;
    }

    // Inject SAVACAZAN provider
    window.ethereum = provider;

    Object.defineProperty(window, 'ethereum', {
      value: provider,
      writable: true,
      configurable: true
    });

    window.web3 = {
      currentProvider: provider,
      eth: {
        defaultAccount: provider.selectedAddress
      }
    };

    // Dispatch ethereum initialized event
    setTimeout(() => {
      const event = new CustomEvent('ethereum#initialized', { detail: provider });
      window.dispatchEvent(event);
    }, 100);

    // Update UI state
    emulatedWallet.value = wallet;
    emulatorActive.value = true;
    web3Connected.value = true;
    connectedAddress.value = provider.selectedAddress;
    currentChainId.value = MEGAETH_TESTNET.chainIdDecimal;
    isCorrectNetwork.value = true;

    // Update balance
    await updateBalance();

    window.$message?.success(`🦊 SAVACAZANwalletemulator Active!\nWallet: ${wallet.walletName}`, {
      duration: 5000
    });

    console.log('[SAVACAZANwalletemulator] ✅ Emulator activated successfully');
  } catch (error) {
    console.error('[SAVACAZANwalletemulator] Activation error:', error);
    window.$message?.error('Failed to activate emulator: ' + error.message);
  }
}

// Deactivate MetaMask Emulator
function deactivateMetaMaskEmulator() {
  if (!emulatorActive.value) {
    window.$message?.warning('No emulator is currently active');
    return;
  }

  try {
    // Restore original ethereum provider if it exists
    if (window._originalEthereum) {
      window.ethereum = window._originalEthereum;
      delete window._originalEthereum;
    } else {
      delete window.ethereum;
    }

    // Clear state
    emulatedWallet.value = null;
    emulatorActive.value = false;
    web3Connected.value = false;
    connectedAddress.value = '';
    connectedBalance.value = '0';
    currentChainId.value = null;
    isCorrectNetwork.value = false;

    window.$message?.success('🔌 SAVACAZANwalletemulator Deactivated');
    console.log('[SAVACAZANwalletemulator] Emulator deactivated');
  } catch (error) {
    console.error('[SAVACAZANwalletemulator] Deactivation error:', error);
    window.$message?.error('Failed to deactivate emulator');
  }
}

// Copy to clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    window.$message?.success(`${label} copied to clipboard!`);
  }).catch(() => {
    window.$message?.error('Failed to copy to clipboard');
  });
}

// View wallet details
function viewWalletDetails(wallet) {
  selectedWallet.value = wallet;
  showWalletModal.value = true;
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

// Format date
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Open URL helper
function openUrl(url) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

// Navigate to DApp page
function navigateToDApp(dapp) {
  navigateTo(`/megaethtest/dapps/${dapp.id}`);
}

// Lifecycle hooks
onMounted(() => {
  fetchWallets();

  // Setup event listeners for MetaMask
  if (isMetaMaskInstalled.value) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts.length > 0) {
        connectWallet();
      }
    });
  }
});

onUnmounted(() => {
  // Remove event listeners
  if (isMetaMaskInstalled.value && window.ethereum) {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  }
});
</script>

<template>
  <div class="megaeth-test-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <span class="network-icon">{{ currentNetwork.icon }}</span>
          <div>
            <h1>{{ currentNetwork.chainName }} Testnet</h1>
            <p class="subtitle">Ultra-fast EVM-compatible L2 with real-time performance</p>
          </div>
        </div>
        <div class="header-actions">
          <n-button
            v-if="!web3Connected"
            type="primary"
            @click="connectWallet"
            :loading="connectingWallet"
            size="large"
          >
            🦊 Connect MetaMask
          </n-button>
          <div v-else style="display: flex; gap: 8px;">
            <n-button
              v-if="emulatorActive"
              type="warning"
              @click="deactivateMetaMaskEmulator"
              size="large"
            >
              🔌 Stop Emulator
            </n-button>
            <n-button
              v-else
              type="error"
              @click="disconnectWallet"
              size="large"
            >
              🔌 Disconnect
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="line" size="large" animated style="margin-bottom: 24px;">
      <n-tab-pane name="wallets" tab="👛 Wallets">
      </n-tab-pane>
      <n-tab-pane name="batch-transfer" tab="🚀 Batch Transfer">
      </n-tab-pane>
      <n-tab-pane name="dapps" tab="🌐 DApps">
      </n-tab-pane>
    </n-tabs>

    <!-- Batch Transfer Tab Content -->
    <div v-if="activeTab === 'batch-transfer'" class="batch-transfer-section">
      <BatchTransfer
        :provider="provider"
        :signer="signer"
        :connected-address="connectedAddress"
        :explorer-url="currentNetwork.blockExplorerUrls[0]"
      />
    </div>

    <!-- DApps Tab Content -->
    <div v-if="activeTab === 'dapps'" class="dapps-section">
      <!-- Search and Filters -->
      <div class="filters-section" style="margin-bottom: 24px;">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search MegaETH dApps..."
          size="large"
          clearable
          style="max-width: 400px;"
        >
          <template #prefix>
            🔍
          </template>
        </n-input>

        <div class="category-filters" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
          <n-button
            v-for="cat in categories"
            :key="cat.value"
            :type="selectedCategory === cat.value ? 'primary' : 'default'"
            @click="selectedCategory = cat.value"
            size="medium"
          >
            {{ cat.icon }} {{ cat.label }}
          </n-button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
        <n-tag type="info" size="large">
          {{ filteredApps.length }} DApp{{ filteredApps.length !== 1 ? 's' : '' }} Available
        </n-tag>
        <n-button text @click="openUrl('https://megaeth-testnet.blockscout.com/apps')">
          View on BlockScout →
        </n-button>
      </div>

      <!-- Apps Grid -->
      <div v-if="filteredApps.length === 0" class="empty-state" style="text-align: center; padding: 80px 20px;">
        <span style="font-size: 64px;">🔍</span>
        <h3>No DApps found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <div v-else class="apps-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        <n-card
          v-for="app in filteredApps"
          :key="app.id"
          class="app-card"
          hoverable
          @click="navigateToDApp(app)"
        >
          <div class="app-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div class="app-logo" style="width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(255, 107, 107, 0.1); overflow: hidden;">
              <img v-if="app.logo.startsWith('http')" :src="app.logo" :alt="app.name" style="width: 100%; height: 100%; object-fit: cover;" />
              <span v-else style="font-size: 28px;">{{ app.logo }}</span>
            </div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #fff;">{{ app.name }}</h3>
          </div>

          <p style="margin: 0 0 16px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.5; min-height: 60px;">
            {{ app.description }}
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
            <n-tag v-for="tag in app.tags" :key="tag" size="small" type="info">
              {{ tag }}
            </n-tag>
          </div>

          <n-button type="primary" size="small" block>
            Open DApp →
          </n-button>
        </n-card>
      </div>
    </div>

    <!-- Wallet Management Content -->
    <div v-if="activeTab === 'wallets'">
      <!-- Connection Status Banner -->
      <n-alert
        v-if="web3Connected"
        :type="isCorrectNetwork ? 'success' : 'warning'"
        style="margin-bottom: 24px;"
      >
        <template #icon>
          <span style="font-size: 24px;">{{ isCorrectNetwork ? '✅' : '⚠️' }}</span>
        </template>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <strong>{{ isCorrectNetwork ? `Connected to ${currentNetwork.chainName}` : 'Wrong Network Detected' }}</strong><br>
            <span style="font-size: 13px; word-break: break-all;">
              Address: <code>{{ formatAddress(connectedAddress) }}</code><br>
              Balance: <strong>{{ parseFloat(connectedBalance).toFixed(4) }} {{ currentNetwork.nativeCurrency.symbol }}</strong> |
              Network: <strong>{{ networkStatus }}</strong>
            </span>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <n-button
              v-if="isCorrectNetwork"
              type="success"
              size="small"
              @click="updateBalance"
            >
              🔄 Refresh Balance
            </n-button>
            <n-button
              v-if="!isCorrectNetwork"
              type="warning"
              @click="switchToMegaETHTestnet"
              :loading="switchingNetwork"
            >
              🔄 Switch to {{ currentNetwork.chainName }}
            </n-button>
          </div>
        </div>
      </n-alert>

      <!-- SAVACAZANwalletemulator Active Banner -->
      <n-alert
        v-if="emulatorActive && emulatedWallet"
        type="success"
        style="margin-bottom: 24px;"
      >
        <template #icon>
          <span style="font-size: 24px;">🦊</span>
        </template>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <strong>🚀 SAVACAZANwalletemulator Active!</strong><br>
            <span style="font-size: 13px;">
              <strong>Emulated Wallet:</strong> {{ emulatedWallet.walletName }}<br>
              <strong>Address:</strong> <code>{{ formatAddress(connectedAddress) }}</code><br>
              <strong>Balance:</strong> {{ parseFloat(connectedBalance).toFixed(4) }} {{ currentNetwork.nativeCurrency.symbol }}<br>
              <span style="color: #10b981;">✅ DApps will detect this as MetaMask</span>
            </span>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <n-button
              type="warning"
              size="small"
              @click="deactivateMetaMaskEmulator"
            >
              🔌 Stop Emulator
            </n-button>
            <n-button
              type="success"
              size="small"
              @click="updateBalance"
            >
              🔄 Refresh Balance
            </n-button>
          </div>
        </div>
      </n-alert>

      <!-- Network Info Card -->
      <n-card
        v-if="!web3Connected || !isCorrectNetwork"
        title="🌐 Connect to MegaETH Carrot Testnet"
        style="margin-bottom: 24px;"
      >
        <div style="text-align: center; padding: 20px;">
          <span style="font-size: 64px; display: block; margin-bottom: 16px;">🥕</span>
          <h3 style="margin-bottom: 12px;">{{ !web3Connected ? 'Connect Your Wallet' : 'Switch to MegaETH Carrot' }}</h3>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            {{ !web3Connected
              ? 'Connect your MetaMask wallet to interact with MegaETH Carrot Testnet'
              : 'You are connected to the wrong network. Please switch to MegaETH Carrot.'
            }}
          </p>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <n-button
              v-if="!web3Connected"
              type="primary"
              size="large"
              @click="connectWallet"
              :loading="connectingWallet"
            >
              🦊 Connect MetaMask
            </n-button>
            <n-button
              v-else
              type="warning"
              size="large"
              @click="switchToMegaETHTestnet"
              :loading="switchingNetwork"
            >
              🔄 Switch to MegaETH
            </n-button>

            <n-button
              size="large"
              @click="openUrl('https://faucet.megaeth.com/')"
            >
              💧 Get Test METH
            </n-button>
          </div>

          <!-- Network Details -->
          <n-divider style="margin: 24px 0;" />
          <div style="text-align: left; max-width: 600px; margin: 0 auto;">
            <h4 style="margin-bottom: 12px;">📋 Network Details:</h4>
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px;">
              <div style="margin-bottom: 8px;"><strong>Network Name:</strong> {{ currentNetwork.chainName }}</div>
              <div style="margin-bottom: 8px;"><strong>Chain ID:</strong> {{ currentNetwork.chainIdDecimal }} ({{ currentNetwork.chainId }})</div>
              <div style="margin-bottom: 8px;"><strong>RPC URL:</strong> {{ currentNetwork.rpcUrls[0] }}</div>
              <div style="margin-bottom: 8px;"><strong>Symbol:</strong> {{ currentNetwork.nativeCurrency.symbol }}</div>
              <div><strong>Explorer:</strong> {{ currentNetwork.blockExplorerUrls[0] }}</div>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Info Banner -->
      <n-alert type="info" style="margin-bottom: 24px;">
        <template #icon>
          <span style="font-size: 24px;">🥕</span>
        </template>
        <strong>MegaETH Carrot Testnet</strong><br>
        Ultra-fast EVM-compatible L2 with real-time block generation. Test your dApps with CEX-level performance!
        <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
          <n-button size="small" type="primary" @click="openUrl('https://faucet.megaeth.com/')">
            💧 Faucet
          </n-button>
          <n-button size="small" @click="openUrl('https://megaeth-testnet.blockscout.com/')">
            🔍 BlockScout Explorer
          </n-button>
          <n-button size="small" @click="openUrl('https://docs.megaeth.com/')">
            📚 Documentation
          </n-button>
          <n-button size="small" @click="openUrl('https://www.megaeth.com/')">
            🌐 Official Website
          </n-button>
        </div>
      </n-alert>

      <!-- SAVACAZANwalletemulator Info -->
      <n-alert type="success" style="margin-bottom: 24px;">
        <template #icon>
          <span style="font-size: 24px;">🦊</span>
        </template>
        <strong>✨ SAVACAZANwalletemulator - MetaMask Emulation</strong><br>
        Click "🦊 Emulate MetaMask" on any saved wallet to inject it as MetaMask in your browser. DApps will detect it as a real MetaMask wallet!
        <div style="margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.8);">
          <strong>How it works:</strong> Creates an EIP-1193 compliant provider that emulates MetaMask's API, allowing DApps to connect to your saved wallet automatically.
        </div>
      </n-alert>

      <!-- Network Info & Stats Cards -->
      <div class="stats-grid">
        <!-- Chain ID Card -->
        <n-card class="stat-card">
          <div class="stat-content">
            <span class="stat-icon">🔗</span>
            <div class="stat-info">
              <span class="stat-label">Chain ID</span>
              <span class="stat-value">{{ currentNetwork.chainIdDecimal }}</span>
            </div>
          </div>
        </n-card>

        <!-- RPC URL Card -->
        <n-card class="stat-card">
          <div class="stat-content">
            <span class="stat-icon">🌐</span>
            <div class="stat-info">
              <span class="stat-label">RPC</span>
              <span class="stat-value" style="font-size: 14px;">{{ currentNetwork.rpcUrls[0].replace('https://', '') }}</span>
            </div>
          </div>
        </n-card>

        <!-- Symbol Card -->
        <n-card class="stat-card">
          <div class="stat-content">
            <span class="stat-icon">{{ currentNetwork.icon }}</span>
            <div class="stat-info">
              <span class="stat-label">Symbol</span>
              <span class="stat-value">{{ currentNetwork.nativeCurrency.symbol }}</span>
            </div>
          </div>
        </n-card>

        <!-- Wallet Status Card -->
        <n-card class="stat-card">
          <div class="stat-content">
            <span class="stat-icon">🦊</span>
            <div class="stat-info">
              <span class="stat-label">Wallet Status</span>
              <span class="stat-value" :style="{ color: web3Connected ? '#10b981' : '#6b7280' }">
                {{ web3Connected ? 'Connected' : 'Not Connected' }}
              </span>
            </div>
          </div>
        </n-card>

        <!-- Balance Card -->
        <n-card class="stat-card" v-if="web3Connected">
          <div class="stat-content">
            <span class="stat-icon">💰</span>
            <div class="stat-info">
              <span class="stat-label">Balance</span>
              <span class="stat-value">{{ parseFloat(connectedBalance).toFixed(4) }} {{ currentNetwork.nativeCurrency.symbol }}</span>
            </div>
          </div>
        </n-card>

        <!-- Saved Wallets Card -->
        <n-card class="stat-card">
          <div class="stat-content">
            <span class="stat-icon">👛</span>
            <div class="stat-info">
              <span class="stat-label">Saved Wallets</span>
              <span class="stat-value">{{ totalWallets }}</span>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Generate Wallet Section -->
      <n-card title="💼 Generate & Save Wallet" style="margin-bottom: 24px;">
        <p style="margin-bottom: 16px; color: rgba(255,255,255,0.7);">
          Generate a new {{ currentNetwork.chainName }} wallet and save it to your account for future reference.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <n-button
            type="primary"
            @click="handleGenerateWallet"
            :loading="generatingWallet"
            size="large"
          >
            ➕ Generate New Wallet
          </n-button>
          <n-button
            @click="fetchWallets"
            :loading="loading"
            size="large"
          >
            🔄 Refresh Saved Wallets
          </n-button>
          <n-button
            v-if="wallets.length > 0"
            type="success"
            @click="scanAllWallets"
            :loading="scanningAll"
            size="large"
          >
            🔍 Scan All Balances
          </n-button>
        </div>
      </n-card>

      <!-- Saved Wallets List -->
      <n-card :title="`📂 Your ${currentNetwork.chainName} Wallets`">
        <template #header-extra>
          <n-tag type="info">{{ totalWallets }} wallet{{ totalWallets !== 1 ? 's' : '' }}</n-tag>
        </template>

        <div v-if="loading" style="text-align: center; padding: 40px;">
          <n-spin size="large" />
          <p style="margin-top: 16px; color: rgba(255,255,255,0.6);">Loading wallets...</p>
        </div>

        <div v-else-if="wallets.length === 0" style="text-align: center; padding: 40px;">
          <span style="font-size: 48px;">{{ currentNetwork.icon }}</span>
          <h3 style="margin-top: 16px;">No Saved Wallets Yet</h3>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            Generate your first {{ currentNetwork.chainName }} wallet to get started
          </p>
          <n-button type="primary" @click="handleGenerateWallet" :loading="generatingWallet">
            ➕ Generate Wallet
          </n-button>
        </div>

        <div v-else class="wallets-grid">
          <n-card
            v-for="wallet in wallets"
            :key="wallet._id"
            class="wallet-card"
            hoverable
          >
            <div class="wallet-header">
              <div class="wallet-title">
                <span class="wallet-emoji">🥕</span>
                <div>
                  <h3>{{ wallet.walletName }}</h3>
                  <n-tag size="small" type="success">{{ wallet.networkSymbol }}</n-tag>
                </div>
              </div>
              <n-button-group size="small">
                <n-button @click="viewWalletDetails(wallet)">
                  👁️ View
                </n-button>
                <n-button @click="copyToClipboard(wallet.address, 'Address')">
                  📋 Copy
                </n-button>
              </n-button-group>
            </div>

            <n-divider style="margin: 12px 0;" />

            <div class="wallet-info">
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value address" @click="copyToClipboard(wallet.address, 'Address')">
                  {{ formatAddress(wallet.address) }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Balance:</span>
                <span class="info-value">{{ wallet.balance || '0' }} METH</span>
              </div>

              <div class="info-row">
                <span class="info-label">Created:</span>
                <span class="info-value">{{ formatDate(wallet.createdAt) }}</span>
              </div>
            </div>

            <n-divider style="margin: 12px 0;" />

            <div class="wallet-actions">
              <n-button
                size="small"
                type="success"
                @click.stop="scanWalletBalance(wallet)"
                :loading="scanningBalance[wallet._id]"
              >
                🔍 Scan Balance
              </n-button>
              <n-button
                size="small"
                :type="emulatorActive && emulatedWallet?._id === wallet._id ? 'warning' : 'primary'"
                @click.stop="emulatorActive && emulatedWallet?._id === wallet._id ? deactivateMetaMaskEmulator() : activateMetaMaskEmulator(wallet)"
              >
                {{ emulatorActive && emulatedWallet?._id === wallet._id ? '🔌 Stop Emulator' : '🦊 Emulate MetaMask' }}
              </n-button>
              <n-button size="small" type="primary" ghost @click="openUrl(currentNetwork.blockExplorerUrls[0] + '/address/' + wallet.address)">
                📊 Explorer
              </n-button>
              <n-button size="small" type="warning" ghost @click="openUrl('https://faucet.megaeth.com/')">
                💧 Faucet
              </n-button>
            </div>
          </n-card>
        </div>
      </n-card>

      <!-- Wallet Details Modal -->
      <n-modal
        v-model:show="showWalletModal"
        preset="card"
        :title="`${currentNetwork.icon} Wallet Details`"
        style="width: 600px; max-width: 95vw;"
      >
        <div v-if="selectedWallet" class="wallet-details">
          <n-descriptions :column="1" bordered size="small">
            <n-descriptions-item label="Wallet Name">
              {{ selectedWallet.walletName }}
            </n-descriptions-item>
            <n-descriptions-item label="Network">
              {{ currentNetwork.chainName }} ({{ selectedWallet.networkSymbol }})
            </n-descriptions-item>
            <n-descriptions-item label="Address">
              <div style="display: flex; align-items: center; gap: 8px;">
                <code style="font-size: 12px; word-break: break-all;">{{ selectedWallet.address }}</code>
                <n-button size="tiny" @click="copyToClipboard(selectedWallet.address, 'Address')">
                  📋
                </n-button>
              </div>
            </n-descriptions-item>
            <n-descriptions-item label="Balance">
              {{ selectedWallet.balance || '0' }} {{ currentNetwork.nativeCurrency.symbol }}
            </n-descriptions-item>
            <n-descriptions-item label="Created">
              {{ formatDate(selectedWallet.createdAt) }}
            </n-descriptions-item>
          </n-descriptions>

          <n-divider />

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <n-button type="primary" block @click="openUrl('https://faucet.megaeth.com/')">
              💧 Get Test METH from Faucet
            </n-button>
            <n-button block @click="openUrl(currentNetwork.blockExplorerUrls[0] + '/address/' + selectedWallet.address)">
              🔍 View on BlockScout
            </n-button>
            <n-button block @click="openUrl('https://docs.megaeth.com/')">
              📚 Read Documentation
            </n-button>
          </div>

          <n-alert type="warning" style="margin-top: 16px;">
            <template #icon>
              <span>⚠️</span>
            </template>
            This is a testnet wallet. Never send real funds to this address.
          </n-alert>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<style scoped>
.megaeth-test-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.network-icon {
  font-size: 48px;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.title-section h1 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 99, 71, 0.1) 100%);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  line-height: 1;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.wallets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.wallet-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.wallet-card:hover {
  border-color: rgba(255, 107, 107, 0.5);
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.wallet-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-emoji {
  font-size: 32px;
  line-height: 1;
}

.wallet-title h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #fff;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.info-value.address {
  cursor: pointer;
  color: #ff6b6b;
}

.info-value.address:hover {
  text-decoration: underline;
}

.wallet-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.wallet-details {
  padding: 8px 0;
}

/* DApps Section Styles */
.app-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.app-card:hover {
  border-color: rgba(255, 107, 107, 0.5);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.2);
  transform: translateY(-4px);
}
</style>
