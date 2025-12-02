<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ethers } from 'ethers';

const userID = useCookie('userID');

// Active tab state
const activeTab = ref('monad');

// DApps data for the third tab
const searchQuery = ref('');
const selectedCategory = ref('all');

// Categories for dApps
const categories = [
  { value: 'all', label: 'All Apps', icon: '🌐' },
  { value: 'defi', label: 'DeFi', icon: '💰' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'nft', label: 'NFT', icon: '🖼️' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'wallet', label: 'Wallets', icon: '👛' }
];

// Monad Testnet App Hub Applications
const dapps = [
  // DeFi - Trading & Swaps
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
  // DeFi - Lending & Borrowing
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
  // DeFi - Staking & Yield
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
  // Gaming
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
  },
  {
    name: 'Redbrick',
    description: 'User-generated gaming metaverse',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/4xIbYmfwvhzCcKPq0H0oSz/9e4c02da052f88d4f9429972e9f810ca/redbrick_logo.jpg',
    url: 'https://redbrick.land/monad',
    tags: ['Gaming', 'Metaverse']
  },
  {
    name: 'Mahjong123',
    description: 'Classic Mahjong game on blockchain',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/lUQmHljwYwz2HBk2ZQhB8/87fc2c34b36fe34d3101b4f475fe54fb/mahjong.png',
    url: 'https://monad.mahjong123.io/',
    tags: ['Gaming', 'Casual']
  },
  {
    name: 'Slogain',
    description: 'Competitive gaming platform',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/4ZF619ASIvusLsGIJDItLc/7fe59df8669dfd86563b8610e4092389/Slogain_logo.webp',
    url: 'https://monad.slogain.gg/',
    tags: ['Gaming', 'Esports']
  },
  {
    name: 'Rug Rumble',
    description: 'Fast-paced competitive gaming',
    category: 'gaming',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/4MaCu6KCyCq1oSXzTbE4yE/75dc89cc874980dc7a3cac35e0dd7081/rug_rumble.png',
    url: 'https://www.rugrumble.xyz/',
    tags: ['Gaming', 'Competitive']
  },
  // NFT & Marketplace
  {
    name: 'Magic Eden',
    description: 'Leading NFT marketplace for Monad',
    category: 'nft',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/5II24jVxWw8oXA8wtiQt2k/2bddd5a52fd139946c1e53862cca7fa4/2ME_Profile_B_2x.png',
    url: 'https://magiceden.us/monad-testnet',
    tags: ['NFT', 'Marketplace']
  },
  {
    name: 'NFTs2me',
    description: 'Create and mint NFTs easily',
    category: 'nft',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/7MBkBseWCkzaLgmWABlG4z/ebc9557be3e00db1d18cef2bb15680e2/nfts2me.png',
    url: 'http://nfts2me.com/app/monad-testnet/',
    tags: ['NFT', 'Creation']
  },
  // Social & Community
  {
    name: 'Flap',
    description: 'Decentralized bulletin board platform',
    category: 'social',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/7eCmyOQoQSrMExHhAEU2Eo/a9cd8dd68d46d909fee9c9c76b6fd127/Flap_logo.webp',
    url: 'https://monad.flap.sh/board',
    tags: ['Social', 'Community']
  },
  {
    name: 'Townsquare',
    description: 'Community engagement and discussion platform',
    category: 'social',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/22eJ94VJDgjoDQW5R8X0l6/5c67e779c62cb57cfef571310a95914c/TS_Symbol.png',
    url: 'https://app.townsq.xyz/',
    tags: ['Social', 'DAO']
  },
  {
    name: 'Rabble',
    description: 'Social platform for Web3 communities',
    category: 'social',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/56AXqJqOVti0VRn2a6CjDE/bc1601ffd0158b93ecb4d462785f2193/rabble.jpg',
    url: 'https://app.rabble.pro/?utm=MONAD',
    tags: ['Social', 'Community']
  },
  {
    name: 'Plato',
    description: 'SocialFi for dining, making eating fun, engaging, and social',
    category: 'social',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/OErFqsxrjGIXoaAtoKy96/e5fbc8c37c3d2ca95264c641bf47d5e3/Plato1.png',
    url: 'https://m.getplato.app/monad',
    tags: ['Social', 'Lifestyle']
  },
  // Wallets
  {
    name: 'HaHa Wallet',
    description: 'Simple and secure wallet solution',
    category: 'wallet',
    logo: 'https://images.ctfassets.net/8j113iuhx8yu/1hgwvJJnAlHOOcvxrO166K/ebfb952014e073df3e6860c8653d6b39/haha_jpg.webp',
    url: 'https://www.haha.me/',
    tags: ['Wallet', 'Security']
  }
];

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

// Monad Testnet Network Configuration (CORRECT VALUES)
const MONAD_TESTNET = {
  chainId: '0x279f', // 10143 in decimal
  chainIdDecimal: 10143,
  chainName: 'Monad Testnet',
  network: 'Monad',
  icon: '⚡',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
  apiEndpoint: '/api/v1/TestNets/generateMonadWallet'
};

// Pharos Testnet Network Configuration
const PHAROS_TESTNET = {
  chainId: '0xA81F0', // 688688 in decimal
  chainIdDecimal: 688688,
  chainName: 'Pharos Testnet',
  network: 'Pharos',
  icon: '🔷',
  nativeCurrency: {
    name: 'Pharos',
    symbol: 'PHRS',
    decimals: 18
  },
  rpcUrls: ['https://testnet.dplabs-internal.com'],
  blockExplorerUrls: ['https://testnet.pharosscan.xyz'],
  apiEndpoint: '/api/v1/TestNets/generatePharosWallet'
};

// Computed current network config
const currentNetwork = computed(() => {
  return activeTab.value === 'monad' ? MONAD_TESTNET : PHAROS_TESTNET;
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

// Check if MetaMask is installed
const isMetaMaskInstalled = computed(() => {
  return typeof window.ethereum !== 'undefined';
});

// Network status
const networkStatus = computed(() => {
  if (!web3Connected.value) return 'Not Connected';
  if (isCorrectNetwork.value) return `${currentNetwork.value.chainName} ✓`;
  return 'Wrong Network';
});

// Watch tab changes to reload wallets
watch(activeTab, () => {
  fetchWallets();
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
          window.$message?.warning('Please switch to Monad Testnet');
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

// Switch to Monad Testnet
async function switchToMonadTestnet() {
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
    // Try to switch to Monad Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: currentNetwork.value.chainId }],
    });

    window.$message?.success('Switched to Monad Testnet successfully!');
    isCorrectNetwork.value = true;
    await updateBalance();
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add Monad Testnet to MetaMask
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

        window.$message?.success('Monad Testnet added and switched successfully!');
        isCorrectNetwork.value = true;
        await updateBalance();
      } catch (addError) {
        console.error('[Add Network] Error:', addError);
        window.$message?.error('Failed to add Monad Testnet: ' + addError.message);
      }
    } else {
      console.error('[Switch Network] Error:', switchError);
      window.$message?.error('Failed to switch network: ' + switchError.message);
    }
  } finally {
    switchingNetwork.value = false;
  }
}

// Update balance
async function updateBalance() {
  if (!web3Connected.value || !connectedAddress.value) return;

  try {
    // Use direct RPC provider for accurate balance
    const rpcProvider = new ethers.JsonRpcProvider(currentNetwork.value.rpcUrls[0]);
    const balance = await rpcProvider.getBalance(connectedAddress.value);
    connectedBalance.value = ethers.formatEther(balance);

    console.log(`[Update Balance] Address: ${connectedAddress.value}, Balance: ${connectedBalance.value} ${currentNetwork.value.nativeCurrency.symbol}`);
  } catch (error) {
    console.error('[Update Balance] Error:', error);
    connectedBalance.value = '0';
  }
}

// Scan balance from blockchain for a specific address
async function scanWalletBalance(wallet) {
  if (!wallet || !wallet.address) return;

  scanningBalance.value[wallet._id] = true;

  try {
    // Create a provider directly connected to Monad Testnet RPC
    const monadProvider = new ethers.JsonRpcProvider(currentNetwork.value.rpcUrls[0]);

    // Get balance from blockchain
    const balance = await monadProvider.getBalance(wallet.address);
    const balanceInMON = ethers.formatEther(balance);

    console.log(`[Scan Balance] Address: ${wallet.address}, Balance: ${balanceInMON} MON`);

    // Update wallet in local array
    const walletIndex = wallets.value.findIndex(w => w._id === wallet._id);
    if (walletIndex !== -1) {
      wallets.value[walletIndex].balance = balanceInMON;
    }

    // Update balance in database
    await $fetch('/api/v1/TestNets/updateWalletBalance', {
      method: 'POST',
      body: {
        walletId: wallet._id,
        balance: balanceInMON
      }
    });

    window.$message?.success(`Balance updated: ${parseFloat(balanceInMON).toFixed(4)} MON`);
  } catch (error) {
    console.error('[Scan Balance] Error:', error);
    window.$message?.error('Failed to scan balance: ' + error.message);
  } finally {
    scanningBalance.value[wallet._id] = false;
  }
}

// Scan all wallets balances
async function scanAllWallets() {
  if (wallets.value.length === 0) {
    window.$message?.warning('No wallets to scan');
    return;
  }

  scanningAll.value = true;

  try {
    const monadProvider = new ethers.JsonRpcProvider(currentNetwork.value.rpcUrls[0]);

    let successCount = 0;
    let errorCount = 0;

    for (const wallet of wallets.value) {
      try {
        const balance = await monadProvider.getBalance(wallet.address);
        const balanceInMON = ethers.formatEther(balance);

        // Update wallet in local array
        const walletIndex = wallets.value.findIndex(w => w._id === wallet._id);
        if (walletIndex !== -1) {
          wallets.value[walletIndex].balance = balanceInMON;
        }

        // Update balance in database
        await $fetch('/api/v1/TestNets/updateWalletBalance', {
          method: 'POST',
          body: {
            walletId: wallet._id,
            balance: balanceInMON
          }
        });

        successCount++;
        console.log(`[Scan All] ${wallet.walletName}: ${balanceInMON} MON`);
      } catch (error) {
        console.error(`[Scan All] Error scanning ${wallet.walletName}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      window.$message?.success(`Scanned ${successCount} wallet${successCount !== 1 ? 's' : ''} successfully!`);
    }
    if (errorCount > 0) {
      window.$message?.warning(`Failed to scan ${errorCount} wallet${errorCount !== 1 ? 's' : ''}`);
    }
  } catch (error) {
    console.error('[Scan All] Error:', error);
    window.$message?.error('Failed to scan wallets: ' + error.message);
  } finally {
    scanningAll.value = false;
  }
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
    window.$message?.success('Connected to Monad Testnet');
    updateBalance();
  } else {
    window.$message?.warning('Please switch to Monad Testnet');
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
    console.error('[Monad Test] Error fetching wallets:', error);
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

// Open URL helper (for template usage)
function openUrl(url) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
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
  <div class="monad-test-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <span class="network-icon">{{ currentNetwork.icon }}</span>
          <div>
            <h1>TestNet Wallets</h1>
            <p class="subtitle">Manage your EVM-compatible testnet wallets</p>
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

    <!-- Tabs for Networks -->
    <n-tabs v-model:value="activeTab" type="line" size="large" animated style="margin-bottom: 24px;">
      <n-tab-pane name="monad" tab="⚡ Monad Testnet">
      </n-tab-pane>
      <n-tab-pane name="pharos" tab="🔷 Pharos Testnet">
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
          placeholder="Search apps..."
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
          {{ filteredApps.length }} App{{ filteredApps.length !== 1 ? 's' : '' }} Found
        </n-tag>
        <n-button text @click="openUrl('https://www.monad.xyz/ecosystem')">
          View Full Ecosystem →
        </n-button>
      </div>

      <!-- Apps Grid -->
      <div v-if="filteredApps.length === 0" class="empty-state" style="text-align: center; padding: 80px 20px;">
        <span style="font-size: 64px;">🔍</span>
        <h3>No apps found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <div v-else class="apps-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        <n-card
          v-for="app in filteredApps"
          :key="app.name"
          class="app-card"
          hoverable
          @click="app.id ? navigateTo(`/monadtest/dapps/${app.id}`) : openUrl(app.url)"
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
            Launch App →
          </n-button>
        </n-card>
      </div>
    </div>

    <!-- Wallet Management Content (Monad & Pharos tabs) -->
    <div v-if="activeTab !== 'dapps'">
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
            @click="switchToMonadTestnet"
            :loading="switchingNetwork"
          >
            🔄 Switch to {{ currentNetwork.chainName }}
          </n-button>
        </div>
      </div>
    </n-alert>

    <!-- Network Switch Card (when not connected or wrong network) -->
    <n-card
      v-if="!web3Connected || !isCorrectNetwork"
      title="🌐 Connect to Monad Testnet"
      style="margin-bottom: 24px;"
    >
      <div style="text-align: center; padding: 20px;">
        <span style="font-size: 64px; display: block; margin-bottom: 16px;">⚡</span>
        <h3 style="margin-bottom: 12px;">{{ !web3Connected ? 'Connect Your Wallet' : 'Switch to Monad Testnet' }}</h3>
        <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
          {{ !web3Connected
            ? 'Connect your MetaMask wallet to interact with Monad Testnet'
            : 'You are connected to the wrong network. Please switch to Monad Testnet.'
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
            @click="switchToMonadTestnet"
            :loading="switchingNetwork"
          >
            🔄 Switch to Monad Testnet
          </n-button>

          <n-button
            size="large"
            @click="openUrl('https://monad.xyz/claim')"
          >
            🚀 Open Claim Portal
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
        <span style="font-size: 24px;">⚡</span>
      </template>
      <strong>Monad Network</strong><br>
      L1 EVM-compatible blockchain. Visit the claim portal to participate in testnet activities and qualify for potential airdrops. Mainnet coming soon!
      <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
        <n-button size="small" type="primary" @click="openUrl('https://monad.xyz/claim')">
          🚀 Claim Portal
        </n-button>
        <n-button size="small" @click="openUrl('https://faucet.monad.xyz')">
          💧 Testnet Faucet
        </n-button>
        <n-button size="small" @click="openUrl('https://monad.xyz')">
          🌐 Website
        </n-button>
        <n-button size="small" @click="openUrl(currentNetwork.blockExplorerUrls[0])">
          🔍 Explorer Testnet
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
              <span class="wallet-emoji">⚡</span>
              <div>
                <h3>{{ wallet.walletName }}</h3>
                <n-tag size="small" type="success">{{ wallet.networkSymbol }}</n-tag>
                <n-tag size="small" type="info" style="margin-left: 4px;">{{ wallet.networkType }}</n-tag>
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
              <span class="info-value">{{ wallet.balance || '0' }} MON</span>
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
            <n-button size="small" type="primary" ghost @click="openUrl(wallet.explorerUrl + '/address/' + wallet.address)">
              📊 Explorer
            </n-button>
            <n-button size="small" type="warning" ghost @click="openUrl(wallet.portalUrl)">
              🚀 Portal
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
          <n-descriptions-item label="Type">
            <n-tag type="info">{{ selectedWallet.networkType }}</n-tag>
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
          <n-button type="primary" block @click="openUrl(selectedWallet.portalUrl)">
            🚀 Open Claim Portal
          </n-button>
          <n-button block @click="openUrl(selectedWallet.faucetUrl)">
            💧 Get Test Tokens
          </n-button>
          <n-button block @click="openUrl(selectedWallet.explorerUrl)">
            🔍 View on Explorer
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
    <!-- End Wallet Management Content -->
  </div>
</template>

<style scoped>
.monad-test-page {
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
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
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
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
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
  color: #8b5cf6;
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
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.2);
  transform: translateY(-4px);
}
</style>
