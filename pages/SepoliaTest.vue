<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ethers } from 'ethers';

const userID = useCookie('userID');

// Sepolia DApps - Real Sepolia testnet dApps
const dapps = [
  // DeFi & DEXs
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Leading decentralized exchange - Sepolia testnet version',
    category: 'defi',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    url: 'https://app.uniswap.org/',
    tags: ['DEX', 'AMM', 'Swap']
  },
  {
    id: 'aave',
    name: 'Aave V3',
    description: 'Decentralized lending and borrowing protocol on Sepolia',
    category: 'defi',
    logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
    url: 'https://app.aave.com/',
    tags: ['Lending', 'Borrowing', 'DeFi']
  },
  {
    id: 'compound',
    name: 'Compound',
    description: 'Autonomous interest rate protocol',
    category: 'defi',
    logo: 'https://cryptologos.cc/logos/compound-comp-logo.png',
    url: 'https://app.compound.finance/',
    tags: ['Lending', 'DeFi']
  },
  {
    id: 'balancer',
    name: 'Balancer',
    description: 'Automated portfolio manager and trading platform',
    category: 'defi',
    logo: 'https://cryptologos.cc/logos/balancer-bal-logo.png',
    url: 'https://app.balancer.fi/',
    tags: ['DEX', 'Liquidity', 'AMM']
  },
  {
    id: 'curve',
    name: 'Curve Finance',
    description: 'Stablecoin-focused decentralized exchange',
    category: 'defi',
    logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
    url: 'https://curve.fi/',
    tags: ['DEX', 'Stablecoins']
  },
  // NFT Marketplaces
  {
    id: 'opensea',
    name: 'OpenSea',
    description: 'Largest NFT marketplace - Sepolia testnet',
    category: 'nft',
    logo: 'https://storage.googleapis.com/opensea-static/Logomark/OpenSea-Full-Logo%20(dark).png',
    url: 'https://testnets.opensea.io/',
    tags: ['NFT', 'Marketplace']
  },
  {
    id: 'rarible',
    name: 'Rarible',
    description: 'Create, sell and collect NFTs',
    category: 'nft',
    logo: 'https://cryptologos.cc/logos/rarible-rari-logo.png',
    url: 'https://rarible.com/',
    tags: ['NFT', 'Marketplace', 'Creator']
  },
  // Developer Tools
  {
    id: 'remix',
    name: 'Remix IDE',
    description: 'Powerful tool for smart contract development',
    category: 'developer',
    logo: '🔧',
    url: 'https://remix.ethereum.org/',
    tags: ['IDE', 'Smart Contracts', 'Developer']
  },
  {
    id: 'etherscan',
    name: 'Sepolia Etherscan',
    description: 'Blockchain explorer for Sepolia testnet',
    category: 'developer',
    logo: '🔍',
    url: 'https://sepolia.etherscan.io/',
    tags: ['Explorer', 'Analytics']
  },
  // Faucets
  {
    id: 'alchemy-faucet',
    name: 'Alchemy Faucet',
    description: 'Get free Sepolia ETH from Alchemy',
    category: 'faucet',
    logo: '💧',
    url: 'https://www.alchemy.com/faucets/ethereum-sepolia',
    tags: ['Faucet', 'Testnet']
  },
  {
    id: 'quicknode-faucet',
    name: 'QuickNode Faucet',
    description: 'Free Sepolia ETH for testing',
    category: 'faucet',
    logo: '💧',
    url: 'https://faucet.quicknode.com/ethereum/sepolia',
    tags: ['Faucet', 'Testnet']
  },
  {
    id: 'sepolia-faucet',
    name: 'Sepolia Faucet',
    description: 'Official Sepolia testnet faucet',
    category: 'faucet',
    logo: '💧',
    url: 'https://sepoliafaucet.com/',
    tags: ['Faucet', 'Testnet']
  },
  // Wallet Tools
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Popular Ethereum wallet and gateway to blockchain apps',
    category: 'wallet',
    logo: '🦊',
    url: 'https://metamask.io/',
    tags: ['Wallet', 'Browser Extension']
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect your wallet to dApps',
    category: 'wallet',
    logo: '🔗',
    url: 'https://walletconnect.com/',
    tags: ['Wallet', 'Connection']
  },
  // Tools
  {
    id: 'disperse',
    name: 'Disperse.app',
    description: 'Send ETH and tokens to multiple addresses in one transaction - Save on gas fees!',
    category: 'tools',
    logo: '🚀',
    url: 'https://disperse.app/',
    tags: ['Batch Transfer', 'Gas Savings', 'Multi-Send']
  }
];

// Categories
const categories = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'defi', label: 'DeFi', icon: '💰' },
  { value: 'nft', label: 'NFT', icon: '🖼️' },
  { value: 'tools', label: 'Tools', icon: '🛠️' },
  { value: 'developer', label: 'Developer', icon: '🔧' },
  { value: 'faucet', label: 'Faucets', icon: '💧' },
  { value: 'wallet', label: 'Wallets', icon: '👛' }
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

// Sepolia Testnet Network Configuration
const SEPOLIA_TESTNET = {
  chainId: '0xaa36a7', // 11155111 in decimal
  chainIdDecimal: 11155111,
  chainName: 'Sepolia',
  network: 'Sepolia',
  icon: '🔷',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc.sepolia.org',
    'https://rpc2.sepolia.org',
    'https://eth-sepolia.public.blastapi.io',
    'https://sepolia.gateway.tenderly.co'
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  apiEndpoint: '/api/v1/TestNets/generateSepoliaWallet'
};

// Tab state
const activeTab = ref('wallets');

// Computed current network config
const currentNetwork = computed(() => {
  return SEPOLIA_TESTNET;
});

// State
const wallets = ref([]);
const loading = ref(false);
const generatingWallet = ref(false);
const importingWallets = ref(false);
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

// Portfolio state
const portfolioBalances = ref([]);
const portfolioTotalBalance = ref('0');
const loadingPortfolio = ref(false);
const scanningPortfolio = ref(false);

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
  } else if (activeTab.value === 'portfolio') {
    fetchPortfolio();
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

// Switch to Sepolia Testnet
async function switchToSepoliaTestnet() {
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
    // Try to switch to Sepolia Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: currentNetwork.value.chainId }],
    });

    window.$message?.success('Switched to Sepolia Testnet successfully!');
    isCorrectNetwork.value = true;
    await updateBalance();
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add Sepolia Testnet to MetaMask
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

        window.$message?.success('Sepolia Testnet added and switched successfully!');
        isCorrectNetwork.value = true;
        await updateBalance();
      } catch (addError) {
        console.error('[Add Network] Error:', addError);
        window.$message?.error('Failed to add Sepolia Testnet: ' + addError.message);
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
      const balanceInETH = ethers.formatEther(balance);

      connectedBalance.value = balanceInETH;

      console.log(`[Update Balance] ✅ Success with RPC ${i + 1}`);
      console.log(`[Update Balance] Address: ${connectedAddress.value}`);
      console.log(`[Update Balance] Balance: ${balanceInETH} ${currentNetwork.value.nativeCurrency.symbol}`);

      // Show success notification with actual balance
      if (parseFloat(balanceInETH) > 0) {
        window.$message?.success(`Balance: ${parseFloat(balanceInETH).toFixed(6)} ETH`);
      }

      return; // Success, exit function
    } catch (error) {
      console.warn(`[Update Balance] RPC ${i + 1} failed:`, error.message);

      // If this was the last RPC, set balance to 0 and show error
      if (i === currentNetwork.value.rpcUrls.length - 1) {
        console.error('[Update Balance] All RPCs failed');
        connectedBalance.value = '0';
        window.$message?.error('Failed to fetch balance from all RPC endpoints');
      }
      // Otherwise, continue to next RPC
    }
  }
}

// Scan balance from blockchain for a specific address with retry logic
async function scanWalletBalance(wallet) {
  if (!wallet || !wallet.address) return;

  scanningBalance.value[wallet._id] = true;

  console.log(`[Scan Balance] Starting scan for wallet: ${wallet.walletName}`);

  // Try multiple RPC endpoints
  let balanceInETH = '0';
  let success = false;

  for (let i = 0; i < currentNetwork.value.rpcUrls.length; i++) {
    const rpcUrl = currentNetwork.value.rpcUrls[i];

    try {
      console.log(`[Scan Balance] Trying RPC ${i + 1}:`, rpcUrl);

      const sepoliaProvider = new ethers.JsonRpcProvider(rpcUrl);

      // Set timeout for getBalance call
      const balancePromise = sepoliaProvider.getBalance(wallet.address);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const balance = await Promise.race([balancePromise, timeoutPromise]);
      balanceInETH = ethers.formatEther(balance);

      console.log(`[Scan Balance] ✅ Success with RPC ${i + 1}`);
      console.log(`[Scan Balance] Address: ${wallet.address}, Balance: ${balanceInETH} ETH`);

      success = true;
      break; // Success, exit loop
    } catch (error) {
      console.warn(`[Scan Balance] RPC ${i + 1} failed:`, error.message);
      // Continue to next RPC
    }
  }

  if (success) {
    try {
      // Update wallet in local array
      const walletIndex = wallets.value.findIndex(w => w._id === wallet._id);
      if (walletIndex !== -1) {
        wallets.value[walletIndex].balance = balanceInETH;
      }

      // Update balance in testNetworks database
      await $fetch('/api/v1/TestNets/updateWalletBalance', {
        method: 'POST',
        body: {
          walletId: wallet._id,
          balance: balanceInETH
        }
      });

      // Also update in Sepolia portfolio database
      await $fetch('/api/v1/TestNets/updateSepoliaBalance', {
        method: 'POST',
        body: {
          userID: userID.value,
          address: wallet.address,
          balance: balanceInETH,
          walletName: wallet.walletName || '',
          walletSource: 'testNetworks'
        }
      });

      window.$message?.success(`Balance updated: ${parseFloat(balanceInETH).toFixed(6)} ETH`);
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

// Scan all wallets balances with retry logic
async function scanAllWallets() {
  if (wallets.value.length === 0) {
    window.$message?.warning('No wallets to scan');
    return;
  }

  scanningAll.value = true;

  console.log(`[Scan All] Starting scan for ${wallets.value.length} wallets`);

  let successCount = 0;
  let errorCount = 0;

  for (const wallet of wallets.value) {
    let balanceInETH = '0';
    let success = false;

    // Try multiple RPC endpoints for each wallet
    for (let i = 0; i < currentNetwork.value.rpcUrls.length; i++) {
      const rpcUrl = currentNetwork.value.rpcUrls[i];

      try {
        const sepoliaProvider = new ethers.JsonRpcProvider(rpcUrl);

        // Set timeout for getBalance call
        const balancePromise = sepoliaProvider.getBalance(wallet.address);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const balance = await Promise.race([balancePromise, timeoutPromise]);
        balanceInETH = ethers.formatEther(balance);

        console.log(`[Scan All] ${wallet.walletName}: ${balanceInETH} ETH (RPC ${i + 1})`);

        success = true;
        break; // Success, exit RPC loop for this wallet
      } catch (error) {
        console.warn(`[Scan All] RPC ${i + 1} failed for ${wallet.walletName}:`, error.message);
        // Continue to next RPC
      }
    }

    if (success) {
      try {
        // Update wallet in local array
        const walletIndex = wallets.value.findIndex(w => w._id === wallet._id);
        if (walletIndex !== -1) {
          wallets.value[walletIndex].balance = balanceInETH;
        }

        // Update balance in testNetworks database
        await $fetch('/api/v1/TestNets/updateWalletBalance', {
          method: 'POST',
          body: {
            walletId: wallet._id,
            balance: balanceInETH
          }
        });

        // Also update in Sepolia portfolio database
        await $fetch('/api/v1/TestNets/updateSepoliaBalance', {
          method: 'POST',
          body: {
            userID: userID.value,
            address: wallet.address,
            balance: balanceInETH,
            walletName: wallet.walletName || '',
            walletSource: 'testNetworks'
          }
        });

        successCount++;
      } catch (error) {
        console.error(`[Scan All] Error updating database for ${wallet.walletName}:`, error);
        errorCount++;
      }
    } else {
      console.error(`[Scan All] All RPCs failed for ${wallet.walletName}`);
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
    console.error('[Sepolia Test] Error fetching wallets:', error);
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

// Import compatible wallets from Ethereum mainnet, generated Ethereum wallets, Monad & MegaETH testnets
async function importCompatibleWallets() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  importingWallets.value = true;

  try {
    window.$message?.info('Searching for compatible wallets...', { duration: 3000 });

    const response = await $fetch('/api/v1/TestNets/importSepoliaWallets', {
      method: 'POST',
      body: {
        userID: userID.value
      }
    });

    if (response.success) {
      window.$message?.success(response.message);

      if (response.data.imported > 0) {
        await fetchWallets();
      }

      console.log(`[Import] ${response.data.imported} imported, ${response.data.skipped} skipped, ${response.data.total} total`);
    } else {
      throw new Error(response.message || 'Failed to import wallets');
    }
  } catch (error) {
    console.error('[Sepolia] Error importing wallets:', error);
    window.$message?.error(error.message || 'Failed to import wallets');
  } finally {
    importingWallets.value = false;
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

// Fetch portfolio from database
async function fetchPortfolio() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  loadingPortfolio.value = true;

  try {
    const response = await $fetch('/api/v1/TestNets/fetchSepoliaPortfolio', {
      method: 'GET',
      params: {
        userID: userID.value
      }
    });

    if (response.success) {
      portfolioBalances.value = response.data.balances || [];
      portfolioTotalBalance.value = response.data.totalBalance || '0';
      console.log(`[Portfolio] Loaded ${response.data.totalAddresses} addresses, Total: ${response.data.totalBalance} ETH`);
    } else {
      window.$message?.error(response.message || 'Failed to fetch portfolio');
    }
  } catch (error) {
    console.error('[Portfolio] Error fetching:', error);
    window.$message?.error('Error loading portfolio');
  } finally {
    loadingPortfolio.value = false;
  }
}

// Scan all Sepolia-compatible addresses and update portfolio
async function scanAllSepoliaAddresses() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  scanningPortfolio.value = true;
  let successCount = 0;
  let errorCount = 0;

  try {
    // Fetch all Sepolia wallet addresses from testNetworks collection
    const walletsResponse = await $fetch('/api/v1/TestNets/fetchTestNetWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Sepolia'
      }
    });

    if (!walletsResponse.success || !walletsResponse.data || walletsResponse.data.length === 0) {
      window.$message?.warning('No Sepolia wallets found to scan');
      scanningPortfolio.value = false;
      return;
    }

    const sepoliaWallets = walletsResponse.data;
    console.log(`[Portfolio Scan] Found ${sepoliaWallets.length} Sepolia wallets to scan`);

    window.$message?.info(`Scanning ${sepoliaWallets.length} Sepolia addresses...`, { duration: 3000 });

    // Scan each wallet's balance
    for (const wallet of sepoliaWallets) {
      let balanceInETH = '0';
      let success = false;

      // Try multiple RPC endpoints
      for (let i = 0; i < currentNetwork.value.rpcUrls.length; i++) {
        const rpcUrl = currentNetwork.value.rpcUrls[i];

        try {
          const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);

          const balancePromise = rpcProvider.getBalance(wallet.address);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );

          const balance = await Promise.race([balancePromise, timeoutPromise]);
          balanceInETH = ethers.formatEther(balance);

          success = true;
          console.log(`[Portfolio Scan] ${wallet.address}: ${balanceInETH} ETH`);
          break;
        } catch (error) {
          console.warn(`[Portfolio Scan] RPC ${i + 1} failed for ${wallet.address}`);
        }
      }

      // Save to database
      if (success) {
        try {
          await $fetch('/api/v1/TestNets/updateSepoliaBalance', {
            method: 'POST',
            body: {
              userID: userID.value,
              address: wallet.address,
              balance: balanceInETH,
              walletName: wallet.walletName || '',
              walletSource: 'testNetworks'
            }
          });

          successCount++;
        } catch (error) {
          console.error(`[Portfolio Scan] Error saving ${wallet.address}:`, error);
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    // Refresh portfolio after scanning
    await fetchPortfolio();

    if (successCount > 0) {
      window.$message?.success(`✅ Scanned ${successCount} address${successCount !== 1 ? 'es' : ''} successfully!`);
    }
    if (errorCount > 0) {
      window.$message?.warning(`⚠️ Failed to scan ${errorCount} address${errorCount !== 1 ? 'es' : ''}`);
    }

  } catch (error) {
    console.error('[Portfolio Scan] Error:', error);
    window.$message?.error('Error scanning addresses');
  } finally {
    scanningPortfolio.value = false;
  }
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
  navigateTo(`/sepoliatest/dapps/${dapp.id}`);
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
  <div class="sepolia-test-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <span class="network-icon">{{ currentNetwork.icon }}</span>
          <!-- <div>
            <h1>{{ currentNetwork.chainName }} Testnet</h1>
            <p class="subtitle">Official Ethereum testnet for developers and dApp testing</p>
          </div> -->
        </div>
        <div class="header-actions">
          <n-button
            v-if="!web3Connected"
            type="primary"
            @click="connectWallet"
            :loading="connectingWallet"
            size="large"
          >
            🦊 Connect Wallet
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

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="line" size="large" animated style="margin-bottom: 24px;">
      <n-tab-pane name="wallets" tab="👛 Wallets">
      </n-tab-pane>
      <n-tab-pane name="portfolio" tab="💰 Portfolio">
      </n-tab-pane>
      <n-tab-pane name="batch-transfer" tab="🚀 Batch Transfer">
      </n-tab-pane>
      <n-tab-pane name="dapps" tab="🌐 DApps">
      </n-tab-pane>
      <n-tab-pane name="faucets" tab="💧 Faucets">
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
          placeholder="Search Sepolia dApps..."
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
        <n-button text @click="openUrl('https://ethereum.org/en/developers/docs/networks/')">
          Learn About Testnets →
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
            <div class="app-logo" style="width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(139, 92, 246, 0.1); overflow: hidden;">
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

    <!-- Portfolio Tab Content -->
    <div v-if="activeTab === 'portfolio'" class="portfolio-section">
      <!-- Portfolio Header Card -->
      <n-card style="margin-bottom: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="text-align: center; padding: 20px;">
          <span style="font-size: 64px; display: block; margin-bottom: 16px;">💰</span>
          <h2 style="margin: 0 0 8px 0; font-size: 32px; color: #fff;">Sepolia Portfolio</h2>
          <p style="margin: 0 0 24px 0; color: rgba(255, 255, 255, 0.8); font-size: 16px;">
            Track all your Sepolia testnet addresses and total balance
          </p>
          <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 8px;">Total Portfolio Balance</div>
            <div style="font-size: 48px; font-weight: bold; color: #fff;">
              {{ parseFloat(portfolioTotalBalance).toFixed(6) }} <span style="font-size: 24px;">ETH</span>
            </div>
            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
              {{ portfolioBalances.length }} Address{{ portfolioBalances.length !== 1 ? 'es' : '' }}
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <n-button
              type="success"
              size="large"
              @click="scanAllSepoliaAddresses"
              :loading="scanningPortfolio"
            >
              🔍 Scan All Addresses
            </n-button>
            <n-button
              size="large"
              @click="fetchPortfolio"
              :loading="loadingPortfolio"
            >
              🔄 Refresh Portfolio
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Info Alert -->
      <n-alert type="info" style="margin-bottom: 24px;">
        <template #icon>
          <span style="font-size: 24px;">💡</span>
        </template>
        <strong>Portfolio Overview</strong><br>
        This shows all your Sepolia-compatible wallet addresses and their balances. Click "Scan All Addresses" to update all balances from the blockchain.
        Balances are cached in the database to reduce RPC requests.
      </n-alert>

      <!-- Loading State -->
      <div v-if="loadingPortfolio" style="text-align: center; padding: 60px;">
        <n-spin size="large" />
        <p style="margin-top: 20px; color: rgba(255, 255, 255, 0.6);">Loading portfolio...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="portfolioBalances.length === 0" style="text-align: center; padding: 60px;">
        <span style="font-size: 64px; display: block; margin-bottom: 16px;">📊</span>
        <h3 style="margin: 0 0 12px 0;">No Addresses in Portfolio</h3>
        <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 24px;">
          Go to the Wallets tab to create Sepolia wallets, then come back here to see your portfolio
        </p>
        <n-button type="primary" @click="activeTab = 'wallets'">
          👛 Go to Wallets
        </n-button>
      </div>

      <!-- Portfolio Addresses List -->
      <div v-else>
        <n-card title="📋 All Sepolia Addresses">
          <template #header-extra>
            <n-tag type="info">{{ portfolioBalances.length }} address{{ portfolioBalances.length !== 1 ? 'es' : '' }}</n-tag>
          </template>

          <div class="portfolio-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px;">
            <n-card
              v-for="item in portfolioBalances"
              :key="item._id"
              class="portfolio-item-card"
              hoverable
            >
              <div style="margin-bottom: 12px;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
                  <h4 style="margin: 0; color: #fff;">
                    {{ item.walletName || 'Wallet' }}
                  </h4>
                  <n-tag size="small" type="info">
                    {{ item.walletSource || 'testNetworks' }}
                  </n-tag>
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); word-break: break-all; font-family: monospace; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                  {{ item.address }}
                </div>
              </div>

              <n-divider style="margin: 12px 0;" />

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px;">Balance:</span>
                <span style="font-size: 18px; font-weight: bold; color: #10b981;">
                  {{ parseFloat(item.balance || '0').toFixed(6) }} ETH
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
                <span>Last Scanned:</span>
                <span>{{ formatDate(item.lastScanned) }}</span>
              </div>

              <n-divider style="margin: 16px 0;" />

              <div style="display: grid; gap: 10px;">
                <n-button
                  size="medium"
                  type="info"
                  @click="copyToClipboard(item.address, 'Address')"
                  style="width: 100%;"
                >
                  📋 Copy Address
                </n-button>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <n-button
                    size="medium"
                    type="primary"
                    @click="openUrl(`https://sepolia.etherscan.io/address/${item.address}`)"
                  >
                    🔍 Explorer
                  </n-button>
                  <n-button
                    size="medium"
                    type="success"
                    @click="openUrl(`https://www.alchemy.com/faucets/ethereum-sepolia?address=${item.address}`)"
                  >
                    💧 Faucet
                  </n-button>
                </div>
              </div>
            </n-card>
          </div>
        </n-card>
      </div>
    </div>

    <!-- Faucets Tab Content -->
    <div v-if="activeTab === 'faucets'" class="faucets-section">
      <n-alert type="info" style="margin-bottom: 24px;">
        <template #icon>
          <span style="font-size: 24px;">💧</span>
        </template>
        <strong>Sepolia Faucets</strong><br>
        Get free Sepolia ETH from these trusted faucets to test your dApps. Each faucet has different requirements and limits.
      </n-alert>

      <div class="faucets-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
        <n-card
          v-for="faucet in dapps.filter(d => d.category === 'faucet')"
          :key="faucet.id"
          class="faucet-card"
          hoverable
        >
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <span style="font-size: 48px;">{{ faucet.logo }}</span>
            <div>
              <h3 style="margin: 0 0 4px 0;">{{ faucet.name }}</h3>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">{{ faucet.description }}</p>
            </div>
          </div>

          <n-button type="primary" size="large" block @click="openUrl(faucet.url)">
            🚀 Get Test ETH
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
              @click="switchToSepoliaTestnet"
              :loading="switchingNetwork"
            >
              🔄 Switch to {{ currentNetwork.chainName }}
            </n-button>
          </div>
        </div>
      </n-alert>

      <!-- Network Info Card -->
      <n-card
        v-if="!web3Connected || !isCorrectNetwork"
        title="🌐 Connect to Sepolia Testnet"
        style="margin-bottom: 24px;"
      >
        <div style="text-align: center; padding: 20px;">
          <span style="font-size: 64px; display: block; margin-bottom: 16px;">🔷</span>
          <h3 style="margin-bottom: 12px;">{{ !web3Connected ? 'Connect Your Wallet' : 'Switch to Sepolia Testnet' }}</h3>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            {{ !web3Connected
              ? 'Connect your MetaMask wallet to interact with Sepolia Testnet'
              : 'You are connected to the wrong network. Please switch to Sepolia Testnet.'
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
              @click="switchToSepoliaTestnet"
              :loading="switchingNetwork"
            >
              🔄 Switch to Sepolia
            </n-button>

            <n-button
              size="large"
              @click="openUrl('https://sepoliafaucet.com')"
            >
              💧 Get Test ETH
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
          <span style="font-size: 24px;">🔷</span>
        </template>
        <strong>Sepolia Testnet</strong><br>
        Official Ethereum testnet for developers. Use faucets to get free test ETH and deploy your smart contracts risk-free!
        <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
          <n-button size="small" type="primary" @click="openUrl('https://sepoliafaucet.com')">
            💧 Faucet
          </n-button>
          <n-button size="small" @click="openUrl('https://www.alchemy.com/faucets/ethereum-sepolia')">
            💧 Alchemy Faucet
          </n-button>
          <n-button size="small" @click="openUrl('https://sepolia.etherscan.io')">
            🔍 Explorer
          </n-button>
          <n-button size="small" @click="openUrl('https://ethereum.org')">
            🌐 Ethereum.org
          </n-button>
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

      <!-- Import & Manage Wallets Section -->
      <n-card title="📥 Import & Manage Wallets" style="margin-bottom: 24px;">
        <p style="margin-bottom: 16px; color: rgba(255,255,255,0.7);">
          Import all your compatible EVM wallets (Ethereum mainnet, generated Ethereum wallets, Monad & MegaETH testnets) to use them on {{ currentNetwork.chainName }} testnet.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <n-button
            type="primary"
            @click="importCompatibleWallets"
            :loading="importingWallets"
            size="large"
          >
            📥 Import Compatible Wallets
          </n-button>
          <n-button
            @click="fetchWallets"
            :loading="loading"
            size="large"
          >
            🔄 Refresh Wallets
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
        <n-alert type="info" style="margin-top: 16px;" size="small">
          <template #icon>
            <span style="font-size: 16px;">💡</span>
          </template>
          <span style="font-size: 13px;">
            This will import wallets from: <strong>Ethereum</strong>, <strong>Monad</strong>, and <strong>MegaETH</strong> networks.
            All EVM-compatible wallets work on Sepolia testnet!
          </span>
        </n-alert>
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
            Import your compatible EVM wallets to get started
          </p>
          <n-button type="primary" @click="importCompatibleWallets" :loading="importingWallets">
            📥 Import Compatible Wallets
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
                <span class="wallet-emoji">🔷</span>
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
                <span class="info-value">{{ wallet.balance || '0' }} ETH</span>
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
              <n-button size="small" type="primary" ghost @click="openUrl(currentNetwork.blockExplorerUrls[0] + '/address/' + wallet.address)">
                📊 Explorer
              </n-button>
              <n-button size="small" type="warning" ghost @click="openUrl('https://sepoliafaucet.com')">
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
            <n-button type="primary" block @click="openUrl('https://sepoliafaucet.com')">
              💧 Get Test ETH from Faucet
            </n-button>
            <n-button block @click="openUrl(currentNetwork.blockExplorerUrls[0] + '/address/' + selectedWallet.address)">
              🔍 View on Explorer
            </n-button>
            <n-button block @click="openUrl('https://remix.ethereum.org')">
              🔧 Open Remix IDE
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
.sepolia-test-page {
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
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
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
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
  color: #3b82f6;
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
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
}

.faucet-card {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.faucet-card:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
}
</style>
