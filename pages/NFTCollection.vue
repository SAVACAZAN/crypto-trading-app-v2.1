<template>
  <div class="nft-collection-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <div>
          <h1>TIAMONDS NFT Collection</h1>
          <p class="subtitle">Complete collection of 316 unique Tiamonds on Ethereum</p>
          <a href="https://etherscan.io/token/0x853459e9b0aaadd95c80afc49ff26643aa1a2c7b#inventory" target="_blank" class="etherscan-link">
            View on Etherscan →
          </a>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Total NFTs</div>
        <div class="stat-value">{{ allNFTs.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Unique Owners</div>
        <div class="stat-value">{{ uniqueOwners }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Filtered Results</div>
        <div class="stat-value">{{ filteredNFTs.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Contract Address</div>
        <div class="stat-value-small">0x8534...2c7B</div>
      </div>
    </div>

    <!-- Filters Section -->
    <n-card class="filters-card">
      <div class="filters-grid">
        <!-- Search Input -->
        <div class="filter-item">
          <label>Search by Name or Token ID</label>
          <n-input
            v-model:value="searchQuery"
            placeholder="e.g., Tiamond #001 or 279"
            size="large"
            clearable
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </template>
          </n-input>
        </div>

        <!-- Owner Filter -->
        <div class="filter-item">
          <label>Filter by Owner Address</label>
          <n-input
            v-model:value="ownerFilter"
            placeholder="0x..."
            size="large"
            clearable
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </template>
          </n-input>
        </div>

        <!-- Sort Options -->
        <div class="filter-item">
          <label>Sort By</label>
          <n-select
            v-model:value="sortBy"
            :options="sortOptions"
            size="large"
          />
        </div>

        <!-- View Mode -->
        <div class="filter-item">
          <label>Grid Size</label>
          <n-select
            v-model:value="gridSize"
            :options="gridSizeOptions"
            size="large"
          />
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats" v-if="searchQuery || ownerFilter">
        <n-tag type="info" size="large">
          Showing {{ filteredNFTs.length }} of {{ allNFTs.length }} NFTs
        </n-tag>
        <n-button text type="primary" @click="clearFilters">Clear Filters</n-button>
      </div>
    </n-card>

    <!-- NFT Grid -->
    <div class="nft-grid-container">
      <div class="nft-grid" :class="`grid-${gridSize}`">
        <div
          v-for="nft in paginatedNFTs"
          :key="nft.tokenId"
          class="nft-card"
          @click="openNFTDetails(nft)"
        >
          <div class="nft-image-wrapper">
            <img
              v-if="nft.image"
              :src="nft.image"
              :alt="nft.name"
              class="nft-image"
              @error="handleImageError"
            />
            <div class="nft-image-fallback" v-else>
              <span>#{{ nft.tokenId }}</span>
            </div>
            <div class="nft-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          </div>
          <div class="nft-info">
            <h3 class="nft-name">{{ nft.name }}</h3>
            <p class="nft-token-id">Token ID: {{ nft.tokenId }}</p>
            <div class="nft-owner">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ maskAddress(nft.owner) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="allNFTs.length === 0" class="loading-state">
        <n-spin size="large" />
        <p>Loading TIAMONDS collection...</p>
      </div>

      <!-- Empty State -->
      <n-empty
        v-if="allNFTs.length > 0 && filteredNFTs.length === 0"
        description="No NFTs match your filters"
        style="padding: 60px 20px;"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </template>
      </n-empty>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper" v-if="filteredNFTs.length > itemsPerPage">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="itemsPerPage"
        show-size-picker
        :page-sizes="[12, 24, 48, 96]"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- NFT Details Modal -->
    <n-modal v-model:show="showDetailsModal" preset="card" style="max-width: 600px;">
      <template #header>
        <div v-if="selectedNFT">{{ selectedNFT.name }}</div>
      </template>
      <div v-if="selectedNFT" class="nft-details">
        <img :src="selectedNFT.image" :alt="selectedNFT.name" class="detail-image" />
        <div class="detail-info">
          <div class="detail-row">
            <span class="detail-label">Token ID:</span>
            <span class="detail-value">{{ selectedNFT.tokenId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Owner:</span>
            <a :href="`https://etherscan.io/address/${selectedNFT.owner}`" target="_blank" class="detail-link">
              {{ selectedNFT.owner }}
            </a>
          </div>
          <div class="detail-row">
            <span class="detail-label">Contract:</span>
            <a href="https://etherscan.io/token/0x853459e9b0aaadd95c80afc49ff26643aa1a2c7b" target="_blank" class="detail-link">
              0x853459E9b0AAadD95c80AfC49FF26643aA1A2c7B
            </a>
          </div>
        </div>
        <div class="detail-actions">
          <n-button type="primary" size="large" @click="openEtherscan(selectedNFT.tokenId)">
            View on Etherscan
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// State - will load from tiamonds-all-nfts.js once script completes
const allNFTs = ref([]);
const searchQuery = ref('');
const ownerFilter = ref('');
const sortBy = ref('tokenId-asc');
const gridSize = ref('medium');
const currentPage = ref(1);
const itemsPerPage = ref(24);
const showDetailsModal = ref(false);
const selectedNFT = ref(null);

// Options
const sortOptions = [
  { label: 'Token ID: Low to High', value: 'tokenId-asc' },
  { label: 'Token ID: High to Low', value: 'tokenId-desc' },
  { label: 'Name: A to Z', value: 'name-asc' },
  { label: 'Name: Z to A', value: 'name-desc' }
];

const gridSizeOptions = [
  { label: 'Small (6 per row)', value: 'small' },
  { label: 'Medium (4 per row)', value: 'medium' },
  { label: 'Large (3 per row)', value: 'large' },
  { label: 'Extra Large (2 per row)', value: 'xlarge' }
];

// Computed
const uniqueOwners = computed(() => {
  return new Set(allNFTs.value.map(nft => nft.owner.toLowerCase())).size;
});

const filteredNFTs = computed(() => {
  let result = [...allNFTs.value];

  // Search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    result = result.filter(nft =>
      nft.name?.toLowerCase().includes(search) ||
      nft.tokenId?.toString().includes(search)
    );
  }

  // Owner filter
  if (ownerFilter.value) {
    const owner = ownerFilter.value.toLowerCase();
    result = result.filter(nft => nft.owner?.toLowerCase().includes(owner));
  }

  // Sort
  if (sortBy.value === 'tokenId-asc') {
    result.sort((a, b) => a.tokenId - b.tokenId);
  } else if (sortBy.value === 'tokenId-desc') {
    result.sort((a, b) => b.tokenId - a.tokenId);
  } else if (sortBy.value === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'name-desc') {
    result.sort((a, b) => b.name.localeCompare(a.name));
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredNFTs.value.length / itemsPerPage.value);
});

const paginatedNFTs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredNFTs.value.slice(start, end);
});

// Methods
function maskAddress(address) {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function clearFilters() {
  searchQuery.value = '';
  ownerFilter.value = '';
  sortBy.value = 'tokenId-asc';
}

function handlePageSizeChange(pageSize) {
  itemsPerPage.value = pageSize;
  currentPage.value = 1;
}

function handleImageError(e) {
  e.target.style.display = 'none';
  e.target.nextElementSibling.style.display = 'flex';
}

function openNFTDetails(nft) {
  console.log('🖱️ NFT clicked:', nft.name, 'Token ID:', nft.tokenId);
  selectedNFT.value = nft;
  showDetailsModal.value = true;
  console.log('✅ Modal should open now');
}

function openEtherscan(tokenId) {
  window.open(`https://etherscan.io/nft/0x853459e9b0aaadd95c80afc49ff26643aa1a2c7b/${tokenId}`, '_blank');
}

// Load data on mount
onMounted(async () => {
  // Try to load full collection first (315 NFTs)
  try {
    const { TIAMONDS_ALL_NFTS } = await import('~/data/tiamonds-all-nfts.js');
    allNFTs.value = TIAMONDS_ALL_NFTS;
    console.log(`✅ Loaded complete collection: ${allNFTs.value.length} TIAMONDS NFTs`);
    console.log(`✅ All images ready to display!`);
  } catch (fullError) {
    // Fallback to partial collection if full not available
    console.log('⚠️ Full collection not found, loading partial...');
    try {
      const { TIAMONDS_NFTS } = await import('~/data/tiamonds-nfts.js');
      allNFTs.value = TIAMONDS_NFTS;
      console.log(`📦 Loaded partial collection: ${allNFTs.value.length} NFTs`);
    } catch (error) {
      console.error('❌ No NFT data available. Run: node scripts/fetchAllTiamondsNFTs.js');
    }
  }
});
</script>

<style scoped>
.nft-collection-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  padding: 20px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 8px 0;
  font-size: 16px;
  color: #888;
}

.etherscan-link {
  display: inline-block;
  margin-top: 8px;
  color: #ec4899;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.etherscan-link:hover {
  color: #8b5cf6;
  transform: translateX(4px);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: #888;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value-small {
  font-size: 14px;
  font-weight: 600;
  color: #ec4899;
  font-family: 'Courier New', monospace;
}

/* Filters */
.filters-card {
  margin-bottom: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.filter-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
}

.quick-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(236, 72, 153, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* NFT Grid */
.nft-grid-container {
  min-height: 400px;
}

.nft-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.nft-grid.grid-small {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.nft-grid.grid-medium {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.nft-grid.grid-large {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.nft-grid.grid-xlarge {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.nft-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nft-card:hover {
  transform: translateY(-4px);
  border-color: rgba(236, 72, 153, 0.5);
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
}

.nft-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.nft-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.nft-card:hover .nft-image {
  transform: scale(1.05);
}

.nft-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #ec4899;
}

.nft-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(236, 72, 153, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nft-card:hover .nft-overlay {
  opacity: 1;
}

.nft-info {
  padding: 16px;
}

.nft-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.nft-token-id {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #888;
}

.nft-owner {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: #ec4899;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.loading-state p {
  color: #888;
  font-size: 14px;
}

/* Modal */
.nft-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-image {
  width: 100%;
  border-radius: 12px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #ec4899;
}

.detail-link {
  font-size: 12px;
  color: #ec4899;
  text-decoration: none;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.detail-link:hover {
  color: #8b5cf6;
}

.detail-actions {
  display: flex;
  gap: 12px;
}
</style>
