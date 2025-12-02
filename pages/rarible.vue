<template>
  <div class="rarible-page">
    <n-card title="🎨 Rarible NFT Marketplace Integration">
      <template #header-extra>
        <n-tag :type="connected ? 'success' : 'default'" size="small">
          {{ connected ? '✅ Connected' : '⚪ Not Connected' }}
        </n-tag>
      </template>

      <!-- Connection Section -->
      <n-space vertical size="large">
        <n-alert v-if="!connected" type="info">
          <template #icon>
            <span style="font-size: 20px;">💡</span>
          </template>
          <strong>Connect Your Wallet</strong><br>
          Connect MetaMask to interact with Rarible NFT marketplace
        </n-alert>

        <n-card size="small" title="🦊 Wallet Connection">
          <n-space vertical>
            <!-- Network Selector -->
            <n-form-item label="🌐 Select Network">
              <n-select
                v-model:value="selectedNetwork"
                :options="networkOptions"
                @update:value="handleNetworkChange"
                size="large"
              />
            </n-form-item>

            <n-space>
              <n-button
                v-if="!connected"
                type="primary"
                @click="connectWallet"
                :loading="connecting"
                size="large"
              >
                🦊 Connect MetaMask
              </n-button>
              <n-button
                v-else
                type="success"
                @click="disconnectWallet"
                size="large"
              >
                ✅ Disconnect
              </n-button>
            </n-space>

            <div v-if="connected" class="wallet-info">
              <n-descriptions bordered :column="1" size="small">
                <n-descriptions-item label="Address">
                  <n-text code>{{ shortAddress }}</n-text>
                  <n-button text size="tiny" @click="copyAddress">📋</n-button>
                </n-descriptions-item>
                <n-descriptions-item label="Chain">
                  <n-tag type="info" size="small">{{ chainName }}</n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="Balance">
                  <n-text strong>{{ balance }} ETH</n-text>
                </n-descriptions-item>
              </n-descriptions>
            </div>
          </n-space>
        </n-card>

        <!-- Tabs for different functionality -->
        <n-tabs v-if="connected" type="card" animated>
          <!-- Browse NFTs Tab -->
          <n-tab-pane name="browse" tab="🔍 Browse NFTs">
            <n-space vertical>
              <n-input-group>
                <n-input
                  v-model:value="searchQuery"
                  placeholder="Search NFTs by name or collection..."
                  clearable
                  @keyup.enter="searchNFTs"
                />
                <n-button type="primary" @click="searchNFTs" :loading="searching">
                  🔍 Search
                </n-button>
              </n-input-group>

              <!-- Popular Collections -->
              <n-card size="small" title="🔥 Popular Collections">
                <n-alert v-if="selectedNetwork === '999999999'" type="info" size="small" style="margin-bottom: 12px;">
                  ⚡ Showing MegaETH exclusive collections
                </n-alert>
                <n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="12" :y-gap="12">
                  <n-grid-item v-for="collection in filteredCollections" :key="collection.id">
                    <n-card size="small" hoverable class="collection-card" @click="browseCollection(collection)">
                      <template #cover>
                        <img :src="collection.banner" :alt="collection.name" class="collection-banner">
                      </template>
                      <n-space vertical size="small">
                        <n-space align="center">
                          <n-avatar :src="collection.logo" :size="32" />
                          <n-text strong>{{ collection.name }}</n-text>
                        </n-space>
                        <n-text depth="3" style="font-size: 12px;">{{ collection.description }}</n-text>
                        <n-space justify="space-between" size="small">
                          <n-statistic label="Floor" :value="collection.floor" tabular-nums>
                            <template #suffix>ETH</template>
                          </n-statistic>
                          <n-statistic label="Items" :value="collection.items" tabular-nums />
                          <n-statistic label="Volume" :value="collection.volume" tabular-nums>
                            <template #suffix>ETH</template>
                          </n-statistic>
                        </n-space>
                        <n-button
                          v-if="collection.raribleUrl"
                          text
                          tag="a"
                          :href="collection.raribleUrl"
                          target="_blank"
                          size="small"
                          type="primary"
                          @click.stop
                        >
                          🌐 View on Rarible
                        </n-button>
                      </n-space>
                    </n-card>
                  </n-grid-item>
                </n-grid>
              </n-card>

              <!-- NFT Grid (Search Results) -->
              <n-card v-if="nftList.length > 0" size="small" title="🔍 Search Results">
                <n-spin :show="searching">
                  <n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="12" :y-gap="12">
                    <n-grid-item v-for="nft in nftList" :key="nft.id">
                      <n-card size="small" hoverable class="nft-card">
                        <template #cover>
                          <img :src="nft.image || '/placeholder-nft.png'" :alt="nft.name" class="nft-image">
                        </template>
                        <n-space vertical size="small">
                          <n-text strong>{{ nft.name || 'Unnamed NFT' }}</n-text>
                          <n-text depth="3" style="font-size: 12px;">{{ nft.collection }}</n-text>
                          <n-space justify="space-between">
                            <n-text type="success" strong>{{ nft.price }} ETH</n-text>
                            <n-button size="tiny" type="primary" @click="buyNFT(nft)">
                              💰 Buy
                            </n-button>
                          </n-space>
                        </n-space>
                      </n-card>
                    </n-grid-item>
                  </n-grid>
                </n-spin>
              </n-card>
            </n-space>
          </n-tab-pane>

          <!-- My NFTs Tab -->
          <n-tab-pane name="my-nfts" tab="🖼️ My NFTs">
            <n-space vertical>
              <n-button type="primary" @click="loadMyNFTs" :loading="loadingMyNFTs">
                🔄 Refresh My NFTs
              </n-button>

              <n-spin :show="loadingMyNFTs">
                <n-grid v-if="myNFTs.length > 0" cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="12" :y-gap="12">
                  <n-grid-item v-for="nft in myNFTs" :key="nft.id">
                    <n-card size="small" hoverable class="nft-card">
                      <template #cover>
                        <img :src="nft.image || '/placeholder-nft.png'" :alt="nft.name" class="nft-image">
                      </template>
                      <n-space vertical size="small">
                        <n-text strong>{{ nft.name || 'Unnamed NFT' }}</n-text>
                        <n-text depth="3" style="font-size: 12px;">Token ID: {{ nft.tokenId }}</n-text>
                        <n-button size="small" type="info" block @click="sellNFT(nft)">
                          💵 List for Sale
                        </n-button>
                      </n-space>
                    </n-card>
                  </n-grid-item>
                </n-grid>
                <n-empty v-else description="You don't own any NFTs yet" />
              </n-spin>
            </n-space>
          </n-tab-pane>

          <!-- Create/Mint Tab -->
          <n-tab-pane name="create" tab="✨ Create NFT">
            <n-card size="small" title="🎨 Mint New NFT">
              <n-space vertical>
                <n-form>
                  <n-form-item label="NFT Name">
                    <n-input v-model:value="mintForm.name" placeholder="My Awesome NFT" />
                  </n-form-item>
                  <n-form-item label="Description">
                    <n-input
                      v-model:value="mintForm.description"
                      type="textarea"
                      placeholder="Describe your NFT..."
                      :rows="3"
                    />
                  </n-form-item>
                  <n-form-item label="Image URL or File">
                    <n-input v-model:value="mintForm.image" placeholder="https://... or upload file" />
                  </n-form-item>
                  <n-form-item label="Properties (optional)">
                    <n-input
                      v-model:value="mintForm.properties"
                      placeholder='{"trait_type": "value"}'
                      type="textarea"
                    />
                  </n-form-item>
                </n-form>

                <n-button
                  type="success"
                  size="large"
                  block
                  @click="mintNFT"
                  :loading="minting"
                  :disabled="!mintForm.name || !mintForm.image"
                >
                  ✨ Mint NFT
                </n-button>

                <n-alert type="warning" size="small">
                  <strong>⚠️ Note:</strong> Minting requires gas fees and will prompt MetaMask
                </n-alert>
              </n-space>
            </n-card>
          </n-tab-pane>

          <!-- Activity Tab -->
          <n-tab-pane name="activity" tab="📜 Activity">
            <n-space vertical>
              <n-button type="primary" @click="loadActivity" :loading="loadingActivity">
                🔄 Refresh Activity
              </n-button>

              <n-spin :show="loadingActivity">
                <n-list v-if="activityList.length > 0" bordered>
                  <n-list-item v-for="(activity, idx) in activityList" :key="idx">
                    <n-thing>
                      <template #avatar>
                        <n-avatar>{{ activity.type === 'buy' ? '💰' : '📤' }}</n-avatar>
                      </template>
                      <template #header>
                        {{ activity.type === 'buy' ? 'Purchased' : 'Listed' }} {{ activity.nftName }}
                      </template>
                      <template #description>
                        <n-space>
                          <n-tag size="small">{{ activity.price }} ETH</n-tag>
                          <n-text depth="3" style="font-size: 12px;">{{ activity.date }}</n-text>
                        </n-space>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
                <n-empty v-else description="No activity yet" />
              </n-spin>
            </n-space>
          </n-tab-pane>
        </n-tabs>

        <!-- SDK Info -->
        <n-card size="small" title="ℹ️ Rarible SDK Info">
          <n-space vertical size="small">
            <n-text>
              <n-text strong>Rarible Protocol:</n-text> Multi-chain NFT marketplace protocol
            </n-text>
            <n-text>
              <n-text strong>Supported Chains:</n-text> Ethereum, Polygon, Flow, Tezos, MegaETH Testnet
            </n-text>
            <n-text>
              <n-text strong>SDK Version:</n-text> @rarible/sdk v0.13.x
            </n-text>
            <n-divider />
            <n-space>
              <n-button text tag="a" href="https://rarible.com" target="_blank" size="small">
                🌐 Rarible.com
              </n-button>
              <n-button text tag="a" href="https://docs.rarible.org" target="_blank" size="small">
                📚 Documentation
              </n-button>
              <n-button text tag="a" href="https://github.com/rarible/sdk" target="_blank" size="small">
                💻 GitHub
              </n-button>
            </n-space>
          </n-space>
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';

// State
const message = useMessage();
const connected = ref(false);
const connecting = ref(false);
const walletAddress = ref('');
const balance = ref('0');
const chainId = ref(null);
const selectedNetwork = ref('1'); // Default: Ethereum Mainnet

// Network options
const networkOptions = [
  { label: '🔷 Ethereum Mainnet', value: '1' },
  { label: '🟣 Polygon', value: '137' },
  { label: '🔵 Sepolia Testnet', value: '11155111' },
  { label: '🟠 Mumbai Testnet', value: '80001' },
  { label: '⚡ MegaETH Testnet', value: '999999999' }
];

// NFT Lists
const nftList = ref([]);
const myNFTs = ref([]);
const activityList = ref([]);

// Popular Collections (Static data)
const popularCollections = ref([
  {
    id: 'bayc',
    name: 'Bored Ape Yacht Club',
    description: 'A collection of 10,000 Bored Ape NFTs',
    logo: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/RBX3jwgykdaQO3rjTcKNf5OVwdukKO46oOAV3zZeiaMb8VER6cKxPDTdGZQdfWcDou75A8KtVZWM_fEnHG4d4q6Um8MeZIlw79BpWPA?w=500&auto=format',
    floor: '23.5',
    items: '10000',
    volume: '645000'
  },
  {
    id: 'azuki',
    name: 'Azuki',
    description: 'A collection of 10,000 avatars that give you membership access',
    logo: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/O0XkiR-nvvkj4Iv3KJby5qLVqj7Hja-Pl7ivfmu12xldsSD4ARAjGW1J6VfUoUY7hpOSHuqTrP7u87_s7DPB-FVfnJVwQMD-YvUuMw?w=500&auto=format',
    floor: '12.8',
    items: '10000',
    volume: '380000'
  },
  {
    id: 'pudgypenguins',
    name: 'Pudgy Penguins',
    description: 'A collection of 8,888 Pudgy Penguin NFTs',
    logo: 'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqg7RFi?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/A-jsxD6d0B_q9hJuLyLfr6R4Hcqj_xITbwsCEg8Rg13XHN9S86FyP8cCYpHE0F9dRyeVvN0fT-RNGMJVHxRyMY5pA7D2lYPfYd4?w=500&auto=format',
    floor: '8.9',
    items: '8888',
    volume: '195000'
  },
  {
    id: 'doodles',
    name: 'Doodles',
    description: 'A community-driven collectibles project',
    logo: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/svc_rQPe7dG3r2DJanz6RW5N1CZBkQMi1HTrskoR3sEg88PyXfgSlcQdCiD25AizNDLHmou5nfOcVRwP_FA8xlQqOcgXs4pdFDRNeWs?w=500&auto=format',
    floor: '5.2',
    items: '10000',
    volume: '180000'
  },
  {
    id: 'clonex',
    name: 'CloneX',
    description: '20,000 next-gen avatars',
    logo: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?w=500&auto=format',
    floor: '4.5',
    items: '20000',
    volume: '210000'
  },
  {
    id: 'cryptopunks',
    name: 'CryptoPunks',
    description: '10,000 unique collectible characters',
    logo: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/48oVuDyfe_xhs24BC2TTVcaYCX7rrU5mpuQLyTgRDbKHj2PtzKZsQ5qC3xTH4ar34wwAXxEKH8uUDPAGffbg7boeGYqX6op5vBDcbA?w=500&auto=format',
    floor: '45.0',
    items: '10000',
    volume: '890000'
  },
  {
    id: 'meebits',
    name: 'Meebits',
    description: '20,000 unique 3D voxel characters',
    logo: 'https://i.seadn.io/gae/d784iHHbqQFVH1XYD6HoT4u3y_Fsu_9FZUltWjnOzoYv-qXEH7KzXt2Vohz6NiJLE2Ek8VS-Vyn6jjjr_woYpj5wI1Cya4Tx?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/d784iHHbqQFVH1XYD6HoT4u3y_Fsu_9FZUltWjnOzoYv-qXEH7KzXt2Vohz6NiJLE2Ek8VS-Vyn6jjjr_woYpj5wI1Cya4Tx?w=500&auto=format',
    floor: '3.8',
    items: '20000',
    volume: '142000'
  },
  {
    id: 'moonbirds',
    name: 'Moonbirds',
    description: 'A collection of 10,000 utility-enabled PFPs',
    logo: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500&auto=format',
    banner: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500&auto=format',
    floor: '6.7',
    items: '10000',
    volume: '225000'
  },
  {
    id: 'megaeth-genesis',
    name: '⚡ MegaETH Genesis Collection',
    description: 'Official MegaETH Testnet NFT Collection - Contract: 0xb8027dca96746f073896c45f65b720f9bd2afee7',
    logo: 'https://via.placeholder.com/500/FF6B00/FFFFFF?text=MEGA+ETH',
    banner: 'https://via.placeholder.com/500x200/FF6B00/FFFFFF?text=MegaETH+Genesis+Collection',
    floor: '0.01',
    items: '1000',
    volume: '25',
    network: 'megaeth',
    contractAddress: '0xb8027dca96746f073896c45f65b720f9bd2afee7',
    raribleUrl: 'https://rarible.com/megaethtestnet/collections/0xb8027dca96746f073896c45f65b720f9bd2afee7/drops'
  }
]);

// Loading states
const searching = ref(false);
const loadingMyNFTs = ref(false);
const loadingActivity = ref(false);
const minting = ref(false);

// Forms
const searchQuery = ref('');
const mintForm = ref({
  name: '',
  description: '',
  image: '',
  properties: ''
});

// Computed
const shortAddress = computed(() => {
  if (!walletAddress.value) return '';
  return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`;
});

const chainName = computed(() => {
  const chains = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
    11155111: 'Sepolia Testnet',
    999999999: 'MegaETH Testnet'
  };
  return chains[chainId.value] || `Chain ID: ${chainId.value}`;
});

const filteredCollections = computed(() => {
  // Show MegaETH collection only when MegaETH network is selected
  if (selectedNetwork.value === '999999999') {
    return popularCollections.value.filter(c => c.network === 'megaeth');
  }
  // Show all collections except MegaETH-specific ones for other networks
  return popularCollections.value.filter(c => !c.network || c.network !== 'megaeth');
});

// Methods
async function connectWallet() {
  if (!window.ethereum) {
    message.error('MetaMask not detected! Please install MetaMask.');
    return;
  }

  connecting.value = true;

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    walletAddress.value = accounts[0];

    // Get chain ID
    const chain = await window.ethereum.request({
      method: 'eth_chainId'
    });
    chainId.value = parseInt(chain, 16);

    // Get balance
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest']
    });
    balance.value = (parseInt(balanceWei, 16) / 1e18).toFixed(4);

    connected.value = true;
    message.success('🎉 Wallet connected successfully!');

    console.log('[Rarible] Wallet connected:', walletAddress.value);
    console.log('[Rarible] Chain ID:', chainId.value);

    // Initialize Rarible SDK (placeholder - actual implementation would go here)
    await initializeRaribleSDK();

  } catch (error) {
    console.error('[Rarible] Connection error:', error);
    message.error('Failed to connect wallet: ' + error.message);
  } finally {
    connecting.value = false;
  }
}

async function initializeRaribleSDK() {
  try {
    // TODO: Initialize Rarible SDK
    // const { createRaribleSdk } = await import('@rarible/sdk');
    // const sdk = createRaribleSdk(window.ethereum, 'mainnet');

    console.log('[Rarible] SDK initialization placeholder');
    message.info('Rarible SDK initialized (demo mode)');
  } catch (error) {
    console.error('[Rarible] SDK init error:', error);
  }
}

function disconnectWallet() {
  connected.value = false;
  walletAddress.value = '';
  balance.value = '0';
  chainId.value = null;
  nftList.value = [];
  myNFTs.value = [];
  message.info('Wallet disconnected');
}

async function handleNetworkChange(networkChainId) {
  if (!window.ethereum) {
    message.error('MetaMask not detected!');
    return;
  }

  try {
    // Convert to hex
    const chainIdHex = '0x' + parseInt(networkChainId).toString(16);

    message.info('Switching network...');

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });

    message.success('Network switched successfully!');
  } catch (error) {
    console.error('[Rarible] Network switch error:', error);

    // If network doesn't exist in MetaMask, add it
    if (error.code === 4902) {
      message.warning('Network not found. Please add it manually to MetaMask.');

      // For MegaETH, add network automatically
      if (networkChainId === '999999999') {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x3b9aca00', // 999999999 in hex
              chainName: 'MegaETH Testnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://carrot.megaeth.com/rpc'], // Official MegaETH RPC
              blockExplorerUrls: ['https://explorer.megaeth.com'] // MegaETH Explorer
            }]
          });
          message.success('MegaETH network added successfully!');
        } catch (addError) {
          console.error('[Rarible] Add network error:', addError);
          message.error('Failed to add network');
        }
      }
    } else {
      message.error('Failed to switch network: ' + error.message);
    }
  }
}

function copyAddress() {
  navigator.clipboard.writeText(walletAddress.value);
  message.success('Address copied to clipboard!');
}

async function browseCollection(collection) {
  message.info(`Loading ${collection.name}...`);
  searching.value = true;

  try {
    // TODO: Load NFTs from specific collection via Rarible API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate sample NFTs for this collection
    nftList.value = Array.from({ length: 8 }, (_, i) => ({
      id: `${collection.id}-${i}`,
      name: `${collection.name} #${1000 + i}`,
      collection: collection.name,
      image: collection.logo,
      price: (parseFloat(collection.floor) + Math.random() * 5).toFixed(2)
    }));

    message.success(`Loaded ${nftList.value.length} NFTs from ${collection.name}`);
  } catch (error) {
    console.error('[Rarible] Browse collection error:', error);
    message.error('Failed to load collection');
  } finally {
    searching.value = false;
  }
}

async function searchNFTs() {
  if (!searchQuery.value.trim()) {
    message.warning('Please enter a search query');
    return;
  }

  searching.value = true;

  try {
    // TODO: Actual Rarible API call
    // Placeholder data
    await new Promise(resolve => setTimeout(resolve, 1500));

    nftList.value = [
      {
        id: '1',
        name: 'Cool Cat #1234',
        collection: 'Cool Cats',
        image: 'https://via.placeholder.com/300?text=NFT+1',
        price: '0.5'
      },
      {
        id: '2',
        name: 'Bored Ape #5678',
        collection: 'BAYC',
        image: 'https://via.placeholder.com/300?text=NFT+2',
        price: '2.3'
      },
      {
        id: '3',
        name: 'Crypto Punk #999',
        collection: 'CryptoPunks',
        image: 'https://via.placeholder.com/300?text=NFT+3',
        price: '15.0'
      }
    ];

    message.success(`Found ${nftList.value.length} NFTs`);
  } catch (error) {
    console.error('[Rarible] Search error:', error);
    message.error('Failed to search NFTs');
  } finally {
    searching.value = false;
  }
}

async function loadMyNFTs() {
  loadingMyNFTs.value = true;

  try {
    // TODO: Load user's NFTs from Rarible
    await new Promise(resolve => setTimeout(resolve, 1000));

    myNFTs.value = [
      {
        id: 'my1',
        name: 'My First NFT',
        tokenId: '42',
        image: 'https://via.placeholder.com/300?text=My+NFT+1'
      }
    ];

    message.success(`Loaded ${myNFTs.value.length} NFTs`);
  } catch (error) {
    console.error('[Rarible] Load NFTs error:', error);
    message.error('Failed to load NFTs');
  } finally {
    loadingMyNFTs.value = false;
  }
}

async function buyNFT(nft) {
  message.info(`Initiating purchase for ${nft.name}...`);

  try {
    // TODO: Implement actual buy flow with Rarible SDK
    message.warning('Buy functionality coming soon (SDK integration needed)');
  } catch (error) {
    console.error('[Rarible] Buy error:', error);
    message.error('Failed to buy NFT');
  }
}

async function sellNFT(nft) {
  message.info(`Listing ${nft.name} for sale...`);

  try {
    // TODO: Implement actual sell flow with Rarible SDK
    message.warning('Sell functionality coming soon (SDK integration needed)');
  } catch (error) {
    console.error('[Rarible] Sell error:', error);
    message.error('Failed to list NFT');
  }
}

async function mintNFT() {
  minting.value = true;

  try {
    message.info('Minting NFT...');

    // TODO: Implement actual minting with Rarible SDK
    await new Promise(resolve => setTimeout(resolve, 2000));

    message.success('NFT minted successfully!');
    mintForm.value = {
      name: '',
      description: '',
      image: '',
      properties: ''
    };
  } catch (error) {
    console.error('[Rarible] Mint error:', error);
    message.error('Failed to mint NFT');
  } finally {
    minting.value = false;
  }
}

async function loadActivity() {
  loadingActivity.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    activityList.value = [
      {
        type: 'buy',
        nftName: 'Cool Cat #1234',
        price: '0.5',
        date: new Date().toLocaleString()
      }
    ];

    message.success('Activity loaded');
  } catch (error) {
    console.error('[Rarible] Activity error:', error);
    message.error('Failed to load activity');
  } finally {
    loadingActivity.value = false;
  }
}

// Lifecycle
onMounted(() => {
  console.log('[Rarible] Page mounted');

  // Check if wallet is already connected
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }

  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        walletAddress.value = accounts[0];
        message.info('Account changed');
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }
});
</script>

<style scoped>
.rarible-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.wallet-info {
  margin-top: 16px;
}

.collection-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.collection-banner {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px 4px 0 0;
}

.nft-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.nft-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px 4px 0 0;
}
</style>
