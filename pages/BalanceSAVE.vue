<template>
<n-card>
   <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="12 2200:8">

          <!-- Display saved balances history -->
            <div class="table-container">
              <n-table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>C </th>
                    <th>K </th>
                    <th>B </th>
                    <th>L </th>
                    <th>C </th>
                    <th>K </th>
                    <th>B </th>
                    <th>L </th>
                    <th>Total LCX</th>
                    <th>Value </th>
                    <th>Total </th>
                    <th>Posible LCX</th>
                    <th>T2LCX</th>
                    <th></th>
                    <th>Dif LCX</th>
                    <th>Dif USDC</th>
                    <th>Dif P LCX</th>
                    <th>Dif P USDC</th>
                    <th>Dif Posible LCXUSDC</th>
                    <th>TotalLCXv2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(balance, index) in savedBalances" :key="balance.timestamp">
                    <td>{{ balance.timestamp }}</td>
                    <td class="second-text">{{ (balance.coinbase || 0).toLocaleString('en-US') }}</td>
                    <td class="second-text">{{ (balance.kraken || 0).toLocaleString('en-US') }}</td>
                    <td class="second-text">{{ (balance.bitrue || 0).toLocaleString('en-US') }}</td>
                    <td class="second-text">{{ (balance.lcx || 0).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ (balance.coinbaseUSDC || 0).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ (balance.krakenUSDC || 0).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ (balance.bitrueUSDC || 0).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ (balance.lcxUSDC || 0).toLocaleString('en-US') }}</td>
                    <td class="se-text">{{ calculateTotalLCX(balance).toLocaleString('en-US') }}</td>
                    <td class="cn-text">$ {{ calculatePosibleUSDC(balance).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ calculateTotalUSDC(balance).toLocaleString('en-US') }}</td>
                    <td class="thr-text">{{ calculatePosibleLCX(balance).toLocaleString('en-US') }}</td>
                    <td class="qrt-text">{{ calculateT2LCX(balance).toLocaleString('en-US') }}</td>
                    <td>
                      <n-button type="error" @click="deleteBalance(index)">X</n-button>
                      <n-button type="primary" @click="copyBalanceToInputs(balance)">Copy</n-button>
                    </td>
                    <td class="second-text">{{ calculateDifferenceLCX(index).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ calculateDifferenceUSDC(index).toLocaleString('en-US') }}</td>
                    <td class="second-text">{{ calculateDifferencePosibleLCX(index).toLocaleString('en-US') }}</td>
                    <td class="blue-text">$ {{ calculateDifferencePosibleUSDC(index).toLocaleString('en-US') }}</td>
                    <td class="second-text">{{ calculateDifferencePosibleLCXUSDC(index).toLocaleString('en-US') }}</td>
                    <td class="qrt-text">{{ calculateLCXv2(index).toLocaleString('en-US') }}</td>
                  </tr>
                </tbody>
              </n-table>
            </div>
      </n-gi>




      <n-gi span="12 3800:18">
 <!-- Input form for LCX and USDC balances -->

            <!-- Auto-populate buttons -->
            <n-space style="margin-bottom: 16px;">
              <n-button type="warning" @click="loadAllExchangesApis()" :loading="loading" style="font-weight: bold;">
                🔄 Refresh All Balances
              </n-button>
              <n-button type="success" @click="loadAllApiBalances('coinbaseadvanced')" :loading="loading">Load Coinbase</n-button>
              <n-button type="success" @click="loadAllApiBalances('kraken')" :loading="loading">Load Kraken</n-button>
              <n-button type="success" @click="loadAllApiBalances('bitrue')" :loading="loading">Load Bitrue</n-button>
              <n-button type="success" @click="loadAllApiBalances('lcx')" :loading="loading">Load LCX</n-button>
              <n-button v-if="apiBalances.length > 0" type="error" @click="clearApiBalances()">Clear Table</n-button>
            </n-space>

            <!-- Display all API balances -->
            <div v-if="apiBalances.length > 0" class="table-container" style="margin-bottom: 20px; overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th rowspan="2" style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Exchange</th>
                    <th rowspan="2" style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">API Key Name</th>
                    <th colspan="3" style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b; text-align: center;">LCX</th>
                    <th colspan="3" style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b; text-align: center;">USDC/USD/USDT</th>
                    <th colspan="3" style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b; text-align: center;">EUR</th>
                  </tr>
                  <tr>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Free</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Used</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Total</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Free</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Used</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Total</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Free</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Used</th>
                    <th style="border: 1px solid #6836f1; padding: 8px; background-color: #6836f1; color: #f0e21b;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(apiBalance, index) in apiBalances" :key="index">
                    <td style="border: 1px solid #ccc; padding: 8px; background-color: #033908; color: #fff;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <img
                          :src="getExchangeLogo(apiBalance.exchange)"
                          :alt="apiBalance.exchange"
                          style="width: 24px; height: 24px; object-fit: contain; border-radius: 4px; background: white; padding: 2px;"
                          @error="(e) => e.target.style.display = 'none'"
                        />
                        <span>{{ apiBalance.exchange }}</span>
                      </div>
                    </td>
                    <td style="border: 1px solid #ccc; padding: 8px; background-color: #033908; color: #fff;">{{ apiBalance.apiKeyName }}</td>
                    <td class="second-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.lcxFree || 0) }}</td>
                    <td class="second-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.lcxUsed || 0) }}</td>
                    <td class="second-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.lcxTotal || 0) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.usdcFree || 0) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.usdcUsed || 0) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.usdcTotal || 0) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.eurFree || 0) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.eurUsed || 0) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; background-color: #033908;">{{ formatNumber(apiBalance.eurTotal || 0) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="border-top: 2px solid #f0e21b;">
                    <td colspan="2" style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #f0e21b; background-color: #033908;">TOTAL:</td>
                    <td class="second-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiLCXFree) }}</td>
                    <td class="second-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiLCXUsed) }}</td>
                    <td class="second-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiLCXTotal) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiUSDCFree) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiUSDCUsed) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiUSDCTotal) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiEURFree) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiEURUsed) }}</td>
                    <td class="blue-text" style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background-color: #033908;">{{ formatNumber(totalApiEURTotal) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Buttons for saving and clearing balances -->
            <n-button type="primary" @click="saveBalances">Save Balances</n-button>
            <n-button type="error" @click="clearAllBalances">Clear All Balances</n-button>

            <!-- Input for LCX Price -->
            <div>
              <n-input v-model:value="lcxPrice" placeholder="Enter LCX Price" />
            </div>


      </n-gi>
</n-grid>

</n-card>

</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

definePageMeta({
  middleware: 'auth'
});

const { getExchangeLogo } = useExchangeLogos();

let userID = useCookie('userID');
let loading = ref(false);

// API Balances list (all API keys with their balances)
let apiBalances = ref([]);

// Initialize balances for LCX and USDC across multiple exchanges
let coinbaseBalance = ref("");
let krakenBalance = ref("");
let bitrueBalance = ref("");
let lcxBalance = ref("");

let coinbaseUSDC = ref("");
let krakenUSDC = ref("");
let bitrueUSDC = ref("");
let lcxUSDC = ref("");

// LCX Price input
let lcxPrice = ref("0.17");  // Default value as string

// Store saved balances
let savedBalances = ref([]);

// Computed totals for API balances - LCX
const totalApiLCXFree = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.lcxFree || 0), 0);
});

const totalApiLCXUsed = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.lcxUsed || 0), 0);
});

const totalApiLCXTotal = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.lcxTotal || 0), 0);
});

// Computed totals for API balances - USDC/USD/USDT
const totalApiUSDCFree = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.usdcFree || 0), 0);
});

const totalApiUSDCUsed = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.usdcUsed || 0), 0);
});

const totalApiUSDCTotal = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.usdcTotal || 0), 0);
});

// Computed totals for API balances - EUR
const totalApiEURFree = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.eurFree || 0), 0);
});

const totalApiEURUsed = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.eurUsed || 0), 0);
});

const totalApiEURTotal = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.eurTotal || 0), 0);
});

// Format number with 2 decimals and comma as decimal separator
function formatNumber(value) {
  const num = Number(value || 0);
  return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Clear API balances table
function clearApiBalances() {
  apiBalances.value = [];
}

// Load saved balances from localStorage when component is mounted
onMounted(async () => {
  if (typeof window !== 'undefined' && localStorage.getItem('savedBalances')) {
    savedBalances.value = JSON.parse(localStorage.getItem('savedBalances'));
  }

  // Auto-load all API balances on page load
  await loadAllExchangesApis();
});

// Load all API balances for a specific exchange
async function loadAllApiBalances(exchange) {
  loading.value = true;
  console.log(`[${exchange.toUpperCase()}] Starting to load API balances...`);

  try {
    // Fetch all API keys for the exchange
    const apiKeysResponse = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: exchange
      }
    });

    console.log(`[${exchange.toUpperCase()}] API Keys Response:`, apiKeysResponse);

    if (apiKeysResponse.success && apiKeysResponse.data && apiKeysResponse.data.length > 0) {
      // Clear previous balances for this exchange
      apiBalances.value = apiBalances.value.filter(b => b.exchange !== exchange);

      console.log(`[${exchange.toUpperCase()}] Found ${apiKeysResponse.data.length} API key(s)`);

      // Fetch balance for each API key separately
      for (const apiKey of apiKeysResponse.data) {
        try {
          console.log(`[${exchange.toUpperCase()}] Fetching balance for API key: ${apiKey.name}`);

          const balanceResponse = await $fetch('/api/v1/fetchBalance', {
            query: {
              userID: userID.value,
              exchange: exchange,
              apiKeyName: apiKey.name
            }
          });

          console.log(`[${exchange.toUpperCase()}] Balance Response for ${apiKey.name}:`, balanceResponse);

          if (balanceResponse.data) {
            const free = balanceResponse.data.free || {};
            const used = balanceResponse.data.used || {};
            const total = balanceResponse.data.total || {};

            console.log(`[${exchange.toUpperCase()}] Balance Data for ${apiKey.name}:`, { free, used, total });

            // Helper function to calculate used = total - free if used is not available
            const calculateUsed = (freeVal, totalVal, usedVal) => {
              const f = Number(freeVal || 0);
              const t = Number(totalVal || 0);
              const u = Number(usedVal || 0);

              // If used is not provided or is 0, calculate it from total - free
              if (u === 0 && t > 0) {
                return Math.max(0, t - f);
              }
              return u;
            };

            // Calculate LCX balances
            const lcxFree = Number(free.LCX || 0);
            const lcxTotal = Number(total.LCX || 0);
            const lcxUsed = calculateUsed(lcxFree, lcxTotal, used.LCX);

            // Calculate stablecoins for each type (free, used, total)
            const usdcFree = Number(free.USDC || 0) + Number(free.USD || 0) + Number(free.USDT || 0);
            const usdcTotal = Number(total.USDC || 0) + Number(total.USD || 0) + Number(total.USDT || 0);
            const usdcUsed = calculateUsed(usdcFree, usdcTotal,
              Number(used.USDC || 0) + Number(used.USD || 0) + Number(used.USDT || 0));

            // Calculate EUR balances
            const eurFree = Number(free.EUR || 0);
            const eurTotal = Number(total.EUR || 0);
            const eurUsed = calculateUsed(eurFree, eurTotal, used.EUR);

            apiBalances.value.push({
              exchange: exchange,
              apiKeyName: apiKey.name,
              // LCX balances
              lcxFree: lcxFree,
              lcxUsed: lcxUsed,
              lcxTotal: lcxTotal,
              // USDC/USD/USDT balances
              usdcFree: usdcFree,
              usdcUsed: usdcUsed,
              usdcTotal: usdcTotal,
              // EUR balances
              eurFree: eurFree,
              eurUsed: eurUsed,
              eurTotal: eurTotal
            });

            console.log(`[${exchange.toUpperCase()}] Added balance for ${apiKey.name}:`, {
              LCX: { free: free.LCX, used: used.LCX, total: total.LCX },
              USDC: { free: usdcFree, used: usdcUsed, total: usdcTotal },
              EUR: { free: free.EUR, used: used.EUR, total: total.EUR }
            });
          } else {
            console.warn(`[${exchange.toUpperCase()}] No balance data returned for ${apiKey.name}`);
          }
        } catch (error) {
          console.error(`[${exchange.toUpperCase()}] ERROR fetching balance for ${apiKey.name}:`, {
            error: error,
            message: error.message,
            statusCode: error.statusCode,
            data: error.data
          });
        }
      }
    } else {
      console.warn(`[${exchange.toUpperCase()}] No API keys found or request failed`);
    }
  } catch (error) {
    console.error(`[${exchange.toUpperCase()}] ERROR loading API keys:`, {
      error: error,
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    });
  } finally {
    loading.value = false;
    console.log(`[${exchange.toUpperCase()}] Finished loading API balances`);
  }
}

// Load all exchanges APIs
async function loadAllExchangesApis() {
  await loadAllApiBalances('coinbaseadvanced');
  await loadAllApiBalances('kraken');
  await loadAllApiBalances('bitrue');
  await loadAllApiBalances('lcx');
}

// Function to save balances
function saveBalances() {
  // Calculate totals per exchange from API balances
  const exchangeTotals = {
    coinbase: { lcx: 0, usdc: 0 },
    kraken: { lcx: 0, usdc: 0 },
    bitrue: { lcx: 0, usdc: 0 },
    lcx: { lcx: 0, usdc: 0 }
  };

  // Sum up all API keys per exchange
  apiBalances.value.forEach(balance => {
    if (balance.exchange === 'coinbaseadvanced') {
      exchangeTotals.coinbase.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.coinbase.usdc += Number(balance.usdcTotal || 0);
    } else if (balance.exchange === 'kraken') {
      exchangeTotals.kraken.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.kraken.usdc += Number(balance.usdcTotal || 0);
    } else if (balance.exchange === 'bitrue') {
      exchangeTotals.bitrue.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.bitrue.usdc += Number(balance.usdcTotal || 0);
    } else if (balance.exchange === 'lcx') {
      exchangeTotals.lcx.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.lcx.usdc += Number(balance.usdcTotal || 0);
    }
  });

  let currentBalances = {
    timestamp: new Date().toLocaleString(),
    coinbase: exchangeTotals.coinbase.lcx,
    kraken: exchangeTotals.kraken.lcx,
    bitrue: exchangeTotals.bitrue.lcx,
    lcx: exchangeTotals.lcx.lcx,
    coinbaseUSDC: exchangeTotals.coinbase.usdc,
    krakenUSDC: exchangeTotals.kraken.usdc,
    bitrueUSDC: exchangeTotals.bitrue.usdc,
    lcxUSDC: exchangeTotals.lcx.usdc
  };

  savedBalances.value.push(currentBalances);
  if (typeof window !== 'undefined') {
    localStorage.setItem('savedBalances', JSON.stringify(savedBalances.value));
  }

  console.log('✅ Saved balances:', currentBalances);
}

// Function to clear all balances
function clearAllBalances() {
  savedBalances.value = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem('savedBalances');
  }
  resetBalances();
}

// Function to reset balances to zero
function resetBalances() {
  coinbaseBalance.value = "";
  krakenBalance.value = "";
  bitrueBalance.value = "";
  lcxBalance.value = "";

  coinbaseUSDC.value = "";
  krakenUSDC.value = "";
  bitrueUSDC.value = "";
  lcxUSDC.value = "";
}

// Function to delete a specific saved balance
function deleteBalance(index) {
  savedBalances.value.splice(index, 1);
  if (typeof window !== 'undefined') {
    localStorage.setItem('savedBalances', JSON.stringify(savedBalances.value));
  }
}

// Function to copy a saved balance to input fields for editing
function copyBalanceToInputs(balance) {
  coinbaseBalance.value = balance.coinbase || "";
  krakenBalance.value = balance.kraken || "";
  bitrueBalance.value = balance.bitrue || "";
  lcxBalance.value = balance.lcx || "";

  coinbaseUSDC.value = balance.coinbaseUSDC || "";
  krakenUSDC.value = balance.krakenUSDC || "";
  bitrueUSDC.value = balance.bitrueUSDC || "";
  lcxUSDC.value = balance.lcxUSDC || "";
}

// Calculate the total LCX and USDC balances for the current input
let totalLCXBalance = ref(0);
let totalUSDCBalance = ref(0);

watch(
  [coinbaseBalance, krakenBalance, bitrueBalance, lcxBalance, coinbaseUSDC, krakenUSDC, bitrueUSDC, lcxUSDC],
  () => {
    totalLCXBalance.value =
      parseFloat(coinbaseBalance.value) +
      parseFloat(krakenBalance.value) +
      parseFloat(bitrueBalance.value) +
      parseFloat(lcxBalance.value);

    totalUSDCBalance.value =
      parseFloat(coinbaseUSDC.value) +
      parseFloat(krakenUSDC.value) +
      parseFloat(bitrueUSDC.value) +
      parseFloat(lcxUSDC.value);
  }
);

// Calculate totals for each saved balance
function calculateTotalLCX(balance) {
  return (
    (balance.coinbase || 0) +
    (balance.kraken || 0) +
    (balance.bitrue || 0) +
    (balance.lcx || 0)
  );
}

function calculateTotalUSDC(balance) {
  return (
    (balance.coinbaseUSDC || 0) +
    (balance.krakenUSDC || 0) +
    (balance.bitrueUSDC || 0) +
    (balance.lcxUSDC || 0)
  );
}

// Calculate the possible LCX and USDC based on LCX price
function calculatePosibleLCX(balance) {
  return calculateTotalUSDC(balance) / parseFloat(lcxPrice.value);
}

function calculatePosibleUSDC(balance) {
  return calculateTotalLCX(balance) * parseFloat(lcxPrice.value);
}

// Calculate the difference between the current total and the previous total
function calculateDifferenceLCX(index) {
  if (index === 0) return 0;
  const previousTotal = calculateTotalLCX(savedBalances.value[index - 1]);
  const currentTotal = calculateTotalLCX(savedBalances.value[index]);
  return currentTotal - previousTotal;
}

function calculateDifferenceUSDC(index) {
  if (index === 0) return 0;
  const previousTotal = calculateTotalUSDC(savedBalances.value[index - 1]);
  const currentTotal = calculateTotalUSDC(savedBalances.value[index]);
  return currentTotal - previousTotal;
}

// Calculate the difference for possible LCX and USDC based on priceLCX
function calculateDifferencePosibleLCX(index) {
  if (index === 0 || !lcxPrice.value) return 0;
  const differenceUSDC = calculateDifferenceUSDC(index);

  return parseFloat(differenceUSDC) / parseFloat(lcxPrice.value);
}

function calculateDifferencePosibleUSDC(index) {
  if (index === 0 || !lcxPrice.value) return 0;
  const differenceLCX = calculateDifferenceLCX(index);

  return parseFloat(differenceLCX) * parseFloat(lcxPrice.value);
}


// Calculate the combined difference of possible LCX and actual LCX/USDC
function calculateDifferencePosibleLCXUSDC(index) {
  return calculateDifferencePosibleLCX(index) + calculateDifferenceLCX(index);
}
// Calculate the combined LCXv2 for a specific index
function calculateLCXv2(index) {
  return calculateDifferencePosibleLCX(index) + calculateTotalLCX(savedBalances.value[index]);
}

function calculateT2LCX(balance) {
  return calculatePosibleLCX(balance) + calculateTotalLCX(balance);
}

</script>

<style scoped>/* Stiluri pentru n-card și n-input */
.n-card {
  background-color: #0d014d;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(224, 210, 83, 0.1);
}

/* Stiluri pentru inputuri */
.n-input {
  margin-bottom: 15px;
  padding: 8px;
  border-radius: 5px;
  font-size: 14px;
  border: 1px solid #0aebf3;
  width: 100%;
  max-width: 200px;
}

.n-input::placeholder {
  color: #cfef31;
}

.n-button {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.n-button[type="error"] {
  background-color: #ff4d4d;
}

.n-button[type="primary"]:hover {
  background-color: #0056b3;
}

/* Stiluri pentru tabel */
table {
  width: 30%;
  border-collapse: collapse;
  margin-top: 5px;
}

table th,
table td {
  padding: 3px;
  text-align: left;  /* Centrează textul în tabel */
  border-bottom: 1px solid #ccc;
  font-size: 12px;  /* Font mai mic pentru o citire mai ușoară */
}

table th {
  background-color: #6836f1;
  color: #f0e21b;
  font-weight: bold;
}

table td {
  background-color: #033908;
  color: #fff;
}

/* Asigură celule egale */
table th, table td {
  width: 100px; /* Poți ajusta dimensiunea celulelor aici */
  max-width: 150px;
  white-space: nowrap; /* Împiedică textul să sară pe mai multe rânduri */
}

/* Stiluri personalizate pentru text în funcție de semnificație */
.blue-text {
  color: rgb(96, 167, 218);
}

.second-text {
  color: rgb(218, 216, 96);

}

.se-text {
  color: rgb(5, 237, 218);
  font-weight: bold; /* Textul va fi afișat cu bold */
}


.thr-text {
  color: rgb(108, 238, 9);
  font-weight: bold; /* Textul va fi afișat cu bold */

}

.qrt-text {
  color: rgb(4, 232, 244);
  font-weight: bold; /* Textul va fi afișat cu bold */

}
.cn-text {
  color: rgb(230, 5, 5);
  font-weight: bold; /* Textul va fi afișat cu bold */
}


/* Asigură că tabelul se încadrează frumos pe orice ecran */
.table-container {
  overflow-x: auto;
  padding: 10px;
  margin-bottom: 20px;
}

.total-balance {
  margin-top: 15px;
  font-size: 16px; /* Font mai mic */
  font-weight: bold;
  color: #fff;
}

</style>
