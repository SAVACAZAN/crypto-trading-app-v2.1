# Phase 2 - EVM Networks Implementation Template

This document contains all the code needed to add 10 Phase 2 EVM networks to CryptoWallet.vue

## Networks to Add:
1. zkSync Era - Chain ID: 324
2. Fantom (FTM) - Chain ID: 250
3. Linea - Chain ID: 59144
4. Scroll - Chain ID: 534352
5. Blast - Chain ID: 81457
6. Mantle - Chain ID: 5000
7. Cronos - Chain ID: 25
8. Harmony - Chain ID: 1666600000
9. Moonbeam - Chain ID: 1284
10. Gnosis Chain - Chain ID: 100

---

## STEP 1: Add Network Cards to Template Section

**Location:** After the LCX Card (around line 2505), before `</div>` and `<!-- Bitcoin Wallet Modal -->`

```vue
      <!-- zkSync Era Card -->
      <div class="crypto-card zksync-card" @click="navigateTo('/zkSyncNetwork')">
        <div class="card-header">
          <div class="crypto-icon zksync">⚡</div>
          <div class="crypto-info">
            <h3>zkSync Era</h3>
            <span class="crypto-symbol">ETH • zkSync</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalZkSyncWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">324</span>
          </div>
        </div>

        <div v-if="zkSyncWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in zkSyncWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="zkSyncWallets.length > 2" class="more-indicator">
            +{{ zkSyncWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateZkSyncWallet" :loading="generatingZkSync" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Fantom Card -->
      <div class="crypto-card fantom-card" @click="navigateTo('/FantomNetwork')">
        <div class="card-header">
          <div class="crypto-icon fantom">👻</div>
          <div class="crypto-info">
            <h3>Fantom</h3>
            <span class="crypto-symbol">FTM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalFantomWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">250</span>
          </div>
        </div>

        <div v-if="fantomWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in fantomWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="fantomWallets.length > 2" class="more-indicator">
            +{{ fantomWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateFantomWallet" :loading="generatingFantom" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Linea Card -->
      <div class="crypto-card linea-card" @click="navigateTo('/LineaNetwork')">
        <div class="card-header">
          <div class="crypto-icon linea">📐</div>
          <div class="crypto-info">
            <h3>Linea</h3>
            <span class="crypto-symbol">ETH • Linea</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalLineaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">59144</span>
          </div>
        </div>

        <div v-if="lineaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in lineaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="lineaWallets.length > 2" class="more-indicator">
            +{{ lineaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateLineaWallet" :loading="generatingLinea" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Scroll Card -->
      <div class="crypto-card scroll-card" @click="navigateTo('/ScrollNetwork')">
        <div class="card-header">
          <div class="crypto-icon scroll">📜</div>
          <div class="crypto-info">
            <h3>Scroll</h3>
            <span class="crypto-symbol">ETH • Scroll</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalScrollWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">534352</span>
          </div>
        </div>

        <div v-if="scrollWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in scrollWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="scrollWallets.length > 2" class="more-indicator">
            +{{ scrollWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateScrollWallet" :loading="generatingScroll" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Blast Card -->
      <div class="crypto-card blast-card" @click="navigateTo('/BlastNetwork')">
        <div class="card-header">
          <div class="crypto-icon blast">💥</div>
          <div class="crypto-info">
            <h3>Blast</h3>
            <span class="crypto-symbol">ETH • Blast</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBlastWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">81457</span>
          </div>
        </div>

        <div v-if="blastWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in blastWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="blastWallets.length > 2" class="more-indicator">
            +{{ blastWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBlastWallet" :loading="generatingBlast" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Mantle Card -->
      <div class="crypto-card mantle-card" @click="navigateTo('/MantleNetwork')">
        <div class="card-header">
          <div class="crypto-icon mantle">🪨</div>
          <div class="crypto-info">
            <h3>Mantle</h3>
            <span class="crypto-symbol">MNT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMantleWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">5000</span>
          </div>
        </div>

        <div v-if="mantleWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in mantleWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="mantleWallets.length > 2" class="more-indicator">
            +{{ mantleWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMantleWallet" :loading="generatingMantle" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Cronos Card -->
      <div class="crypto-card cronos-card" @click="navigateTo('/CronosNetwork')">
        <div class="card-header">
          <div class="crypto-icon cronos">⏱️</div>
          <div class="crypto-info">
            <h3>Cronos</h3>
            <span class="crypto-symbol">CRO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalCronosWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">25</span>
          </div>
        </div>

        <div v-if="cronosWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in cronosWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="cronosWallets.length > 2" class="more-indicator">
            +{{ cronosWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCronosWallet" :loading="generatingCronos" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Harmony Card -->
      <div class="crypto-card harmony-card" @click="navigateTo('/HarmonyNetwork')">
        <div class="card-header">
          <div class="crypto-icon harmony">🎵</div>
          <div class="crypto-info">
            <h3>Harmony</h3>
            <span class="crypto-symbol">ONE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalHarmonyWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">1666600000</span>
          </div>
        </div>

        <div v-if="harmonyWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in harmonyWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="harmonyWallets.length > 2" class="more-indicator">
            +{{ harmonyWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateHarmonyWallet" :loading="generatingHarmony" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Moonbeam Card -->
      <div class="crypto-card moonbeam-card" @click="navigateTo('/MoonbeamNetwork')">
        <div class="card-header">
          <div class="crypto-icon moonbeam">🌙</div>
          <div class="crypto-info">
            <h3>Moonbeam</h3>
            <span class="crypto-symbol">GLMR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMoonbeamWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">1284</span>
          </div>
        </div>

        <div v-if="moonbeamWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in moonbeamWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="moonbeamWallets.length > 2" class="more-indicator">
            +{{ moonbeamWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMoonbeamWallet" :loading="generatingMoonbeam" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Gnosis Chain Card -->
      <div class="crypto-card gnosis-card" @click="navigateTo('/GnosisNetwork')">
        <div class="card-header">
          <div class="crypto-icon gnosis">🦉</div>
          <div class="crypto-info">
            <h3>Gnosis Chain</h3>
            <span class="crypto-symbol">xDAI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalGnosisWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chain ID</span>
            <span class="stat-value">100</span>
          </div>
        </div>

        <div v-if="gnosisWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in gnosisWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="gnosisWallets.length > 2" class="more-indicator">
            +{{ gnosisWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateGnosisWallet" :loading="generatingGnosis" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>
```

---

## STEP 2: Add Reactive References

**Location:** In the `<script setup>` section, after existing wallet refs (around line 2785)

```javascript
// Phase 2 - EVM Network Wallets
const zkSyncWallets = ref([]);
const fantomWallets = ref([]);
const lineaWallets = ref([]);
const scrollWallets = ref([]);
const blastWallets = ref([]);
const mantleWallets = ref([]);
const cronosWallets = ref([]);
const harmonyWallets = ref([]);
const moonbeamWallets = ref([]);
const gnosisWallets = ref([]);
```

---

## STEP 3: Add Computed Properties

**Location:** After existing computed properties (around line 3107)

```javascript
// Phase 2 - EVM Networks Computed
const totalZkSyncWallets = computed(() => zkSyncWallets.value.length);
const totalFantomWallets = computed(() => fantomWallets.value.length);
const totalLineaWallets = computed(() => lineaWallets.value.length);
const totalScrollWallets = computed(() => scrollWallets.value.length);
const totalBlastWallets = computed(() => blastWallets.value.length);
const totalMantleWallets = computed(() => mantleWallets.value.length);
const totalCronosWallets = computed(() => cronosWallets.value.length);
const totalHarmonyWallets = computed(() => harmonyWallets.value.length);
const totalMoonbeamWallets = computed(() => moonbeamWallets.value.length);
const totalGnosisWallets = computed(() => gnosisWallets.value.length);
```

---

## STEP 4: Add Loading State References

**Location:** After existing generating refs (around line 4584)

```javascript
// Phase 2 - EVM Networks Loading States
const generatingZkSync = ref(false);
const generatingFantom = ref(false);
const generatingLinea = ref(false);
const generatingScroll = ref(false);
const generatingBlast = ref(false);
const generatingMantle = ref(false);
const generatingCronos = ref(false);
const generatingHarmony = ref(false);
const generatingMoonbeam = ref(false);
const generatingGnosis = ref(false);
```

---

## STEP 5: Add Generate Wallet Functions

**Location:** After existing generate functions (around line 5135)

```javascript
// Generate zkSync Era Wallet
async function generateZkSyncWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingZkSync.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'zkSync Era',
        walletName: `zkSync Wallet ${zkSyncWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('zkSync Era wallet generated!');
      await loadZkSyncWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[zkSync] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingZkSync.value = false;
  }
}

// Generate Fantom Wallet
async function generateFantomWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingFantom.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Fantom',
        walletName: `Fantom Wallet ${fantomWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Fantom wallet generated!');
      await loadFantomWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Fantom] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingFantom.value = false;
  }
}

// Generate Linea Wallet
async function generateLineaWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingLinea.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Linea',
        walletName: `Linea Wallet ${lineaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Linea wallet generated!');
      await loadLineaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Linea] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingLinea.value = false;
  }
}

// Generate Scroll Wallet
async function generateScrollWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingScroll.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Scroll',
        walletName: `Scroll Wallet ${scrollWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Scroll wallet generated!');
      await loadScrollWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Scroll] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingScroll.value = false;
  }
}

// Generate Blast Wallet
async function generateBlastWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingBlast.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Blast',
        walletName: `Blast Wallet ${blastWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Blast wallet generated!');
      await loadBlastWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Blast] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingBlast.value = false;
  }
}

// Generate Mantle Wallet
async function generateMantleWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingMantle.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Mantle',
        walletName: `Mantle Wallet ${mantleWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Mantle wallet generated!');
      await loadMantleWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Mantle] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingMantle.value = false;
  }
}

// Generate Cronos Wallet
async function generateCronosWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingCronos.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Cronos',
        walletName: `Cronos Wallet ${cronosWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Cronos wallet generated!');
      await loadCronosWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Cronos] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingCronos.value = false;
  }
}

// Generate Harmony Wallet
async function generateHarmonyWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingHarmony.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Harmony',
        walletName: `Harmony Wallet ${harmonyWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Harmony wallet generated!');
      await loadHarmonyWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Harmony] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingHarmony.value = false;
  }
}

// Generate Moonbeam Wallet
async function generateMoonbeamWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingMoonbeam.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Moonbeam',
        walletName: `Moonbeam Wallet ${moonbeamWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Moonbeam wallet generated!');
      await loadMoonbeamWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Moonbeam] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingMoonbeam.value = false;
  }
}

// Generate Gnosis Chain Wallet
async function generateGnosisWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingGnosis.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Gnosis Chain',
        walletName: `Gnosis Wallet ${gnosisWallets.value.length + 1}`
      }
    });
    if (response.success) {
      message.success('Gnosis Chain wallet generated!');
      await loadGnosisWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Gnosis] Error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingGnosis.value = false;
  }
}
```

---

## STEP 6: Add Load Wallet Functions

**Location:** After existing load functions (around line 5657)

```javascript
// Load zkSync Era wallets
async function loadZkSyncWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'zkSync Era'
      }
    });
    if (response.success) {
      zkSyncWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading zkSync Era wallets:', error);
  }
}

// Load Fantom wallets
async function loadFantomWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Fantom'
      }
    });
    if (response.success) {
      fantomWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Fantom wallets:', error);
  }
}

// Load Linea wallets
async function loadLineaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Linea'
      }
    });
    if (response.success) {
      lineaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Linea wallets:', error);
  }
}

// Load Scroll wallets
async function loadScrollWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Scroll'
      }
    });
    if (response.success) {
      scrollWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Scroll wallets:', error);
  }
}

// Load Blast wallets
async function loadBlastWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Blast'
      }
    });
    if (response.success) {
      blastWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Blast wallets:', error);
  }
}

// Load Mantle wallets
async function loadMantleWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Mantle'
      }
    });
    if (response.success) {
      mantleWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Mantle wallets:', error);
  }
}

// Load Cronos wallets
async function loadCronosWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Cronos'
      }
    });
    if (response.success) {
      cronosWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Cronos wallets:', error);
  }
}

// Load Harmony wallets
async function loadHarmonyWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Harmony'
      }
    });
    if (response.success) {
      harmonyWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Harmony wallets:', error);
  }
}

// Load Moonbeam wallets
async function loadMoonbeamWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Moonbeam'
      }
    });
    if (response.success) {
      moonbeamWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Moonbeam wallets:', error);
  }
}

// Load Gnosis Chain wallets
async function loadGnosisWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Gnosis Chain'
      }
    });
    if (response.success) {
      gnosisWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Gnosis Chain wallets:', error);
  }
}
```

---

## STEP 7: Add to onMounted Hook

**Location:** Inside the `onMounted` function (around line 5670), add these function calls:

```javascript
  // Phase 2 - EVM Networks
  loadZkSyncWallets();
  loadFantomWallets();
  loadLineaWallets();
  loadScrollWallets();
  loadBlastWallets();
  loadMantleWallets();
  loadCronosWallets();
  loadHarmonyWallets();
  loadMoonbeamWallets();
  loadGnosisWallets();
```

---

## STEP 8: Add CSS Styles (Optional)

**Location:** In the `<style>` section at the bottom of the file

```css
/* Phase 2 - EVM Networks Card Styles */
.zksync-card {
  background: linear-gradient(135deg, rgba(141, 141, 241, 0.1), rgba(100, 100, 220, 0.05));
  border: 1px solid rgba(141, 141, 241, 0.2);
}

.zksync-card:hover {
  border-color: rgba(141, 141, 241, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.zksync {
  background: linear-gradient(90deg, #8D8DF1, #6464DC);
}

.fantom-card {
  background: linear-gradient(135deg, rgba(19, 181, 236, 0.1), rgba(13, 152, 186, 0.05));
  border: 1px solid rgba(19, 181, 236, 0.2);
}

.fantom-card:hover {
  border-color: rgba(19, 181, 236, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.fantom {
  background: linear-gradient(90deg, #13B5EC, #0D98BA);
}

.linea-card {
  background: linear-gradient(135deg, rgba(84, 150, 255, 0.1), rgba(70, 120, 200, 0.05));
  border: 1px solid rgba(84, 150, 255, 0.2);
}

.linea-card:hover {
  border-color: rgba(84, 150, 255, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.linea {
  background: linear-gradient(90deg, #5496FF, #4678C8);
}

.scroll-card {
  background: linear-gradient(135deg, rgba(255, 220, 170, 0.1), rgba(220, 180, 140, 0.05));
  border: 1px solid rgba(255, 220, 170, 0.2);
}

.scroll-card:hover {
  border-color: rgba(255, 220, 170, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.scroll {
  background: linear-gradient(90deg, #FFDCAA, #DCB48C);
}

.blast-card {
  background: linear-gradient(135deg, rgba(252, 252, 3, 0.1), rgba(200, 200, 0, 0.05));
  border: 1px solid rgba(252, 252, 3, 0.2);
}

.blast-card:hover {
  border-color: rgba(252, 252, 3, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.blast {
  background: linear-gradient(90deg, #FCFC03, #C8C800);
}

.mantle-card {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(50, 50, 50, 0.1));
  border: 1px solid rgba(100, 100, 100, 0.3);
}

.mantle-card:hover {
  border-color: rgba(150, 150, 150, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.mantle {
  background: linear-gradient(90deg, #333333, #555555);
}

.cronos-card {
  background: linear-gradient(135deg, rgba(0, 46, 108, 0.2), rgba(0, 30, 70, 0.1));
  border: 1px solid rgba(0, 82, 194, 0.3);
}

.cronos-card:hover {
  border-color: rgba(0, 82, 194, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.cronos {
  background: linear-gradient(90deg, #002E6C, #0052C2);
}

.harmony-card {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 180, 200, 0.05));
  border: 1px solid rgba(0, 229, 255, 0.2);
}

.harmony-card:hover {
  border-color: rgba(0, 229, 255, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.harmony {
  background: linear-gradient(90deg, #00E5FF, #00B4C8);
}

.moonbeam-card {
  background: linear-gradient(135deg, rgba(226, 52, 161, 0.1), rgba(180, 40, 130, 0.05));
  border: 1px solid rgba(226, 52, 161, 0.2);
}

.moonbeam-card:hover {
  border-color: rgba(226, 52, 161, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.moonbeam {
  background: linear-gradient(90deg, #E234A1, #B42882);
}

.gnosis-card {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.1), rgba(0, 100, 100, 0.05));
  border: 1px solid rgba(0, 128, 128, 0.2);
}

.gnosis-card:hover {
  border-color: rgba(0, 128, 128, 0.5);
  transform: translateY(-2px);
}

.crypto-icon.gnosis {
  background: linear-gradient(90deg, #008080, #006464);
}
```

---

## Summary

All 10 Phase 2 networks have been prepared with:
- ⚡ zkSync Era (324)
- 👻 Fantom (250)
- 📐 Linea (59144)
- 📜 Scroll (534352)
- 💥 Blast (81457)
- 🪨 Mantle (5000)
- ⏱️ Cronos (25)
- 🎵 Harmony (1666600000)
- 🌙 Moonbeam (1284)
- 🦉 Gnosis Chain (100)

Each network uses the generic `generateEVMWallet` API endpoint, which should already exist in your backend at `/api/v1/Wallets/generateEVMWallet.post.js`.

Make sure to also update the [NETWORKS_INVENTORY.md](NETWORKS_INVENTORY.md) file to mark these as ✅ installed once you've added them to CryptoWallet.vue.
