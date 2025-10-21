<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = computed({
  get: () => app.getSelectedApiKey,
  set: (value) => app.setSelectedApiKey(value)
});
let loadingApiKeys = ref(false);


let sellPrice = ref('');
let sellSize = ref('');
let sellTotalPercent = ref(0);
let sellTotal = ref('');

let buyPrice = ref('');
let buySize = ref('');
let buyTotalPercent = ref(0);
let buyTotal = ref('');


let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let baseBalance = ref('Loading...');
let quoteBalance = ref('Loading...');

let userBalanceInterval = null;

onMounted(async () => {
  await loadApiKeys();
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(userBalanceInterval);
});

// Load available API keys for the current exchange
async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data.length > 0) {
      availableApiKeys.value = response.data.map(apiKey => ({
        label: `${apiKey.name} (${apiKey.preview})`,
        value: apiKey.name
      }));

      // Select first API key by default
      selectedApiKey.value = availableApiKeys.value[0].value;
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

async function fetchUserBalancePooling() {
  if (!selectedApiKey.value) return;

  let response = await $fetch('/api/v1/fetchBalance', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      apiKeyName: selectedApiKey.value,
    }
  });

  if (response.data) {
    if(response.data[base]) {
      quoteBalance.value = `${ response.data[base].free }`;
    } else {
      quoteBalance.value = `${ response.data[quote].free }`;
    }
  } else {
    quoteBalance.value = 'N/A';
  }


  if (response.data) {
    if (response.data[quote]) {
      baseBalance.value = `${ response.data[quote].free }`;
    }
  } else {
    baseBalance.value =  'N/A';
  }
}

function formatTooltip(value) {
  return `${value}%`;
}

async function createOrder(side, type){
  if (!selectedApiKey.value) {
    notification['error']({
      content: "No API Key selected",
      meta: "Please select an API key to create orders",
      duration: 2500,
    });
    return;
  }

  let data = {
    userID:userID.value,
    exchange: currentExchange.value,
    symbol:currentSymbol.value,
    type:type,
    side:side,
    amount:(side === 'BUY') ? buySize.value : sellSize.value,
    price:(side === 'BUY') ? buyPrice.value : sellPrice.value,
    apiKeyName: selectedApiKey.value,
  }

  let response = await $fetch( '/api/v1/createOrder', {
    method: 'POST',
    body: data
  } );

  if (response.success) {
    notification['info']({
      content: "Order created!",
      meta: `Submitted ${data.exchange} limit ${data.side} order for ${data.amount} ${base} by using ${quote} at price ${data.price}`,
      duration: 2500,
    });
  } else {
    notification['error']({
      content: "Erorr creating order!",
      meta: response.log,
      duration: 2500,
    });
  }

}

function updateBuyPrice(val) {
  // console.log('changing updateBuyPrice ', val);
}

function updateBuySize(val) {
  // console.log('changing updateBuySize ', val);
  if (buyPrice.value) {
    buyTotal.value = buySize.value * buyPrice.value;
  }
}

watch(buyTotalPercent, (newVal, oldVal) => {
  if (baseBalance.value !== 'Loading...' || baseBalance.value !== 'N/A') {
    buyTotal.value = (baseBalance.value / 100) * newVal;
  } else {
    buyTotal.value = '';
  }

  if (buyPrice.value) {
    buySize.value = ((baseBalance.value / 100) * newVal) / buyPrice.value;
  }
});

function updateBuyTotal(val) {
  // console.log('changing updateBuyTotal ', val);
  if (buyPrice.value) {
    buySize.value = buyTotal.value / buyPrice.value;
  }

  setTimeout(function(){
    buyTotalPercent.value = ((val / baseBalance.value) * 100).toFixed(0);
  }, 100);
}



function updateSellPrice(val) {
  // console.log('changing updateSellPrice ', val);
}

function updateSellSize(val) {
  // console.log('changing updateSellSize ', val);
  if (sellPrice.value) {
    sellTotal.value = sellSize.value * sellPrice.value;
  }
}

watch(sellTotalPercent, (newVal, oldVal) => {
  if ((quoteBalance.value !== 'Loading...' || quoteBalance.value !== 'N/A') && sellPrice.value) {
    sellTotal.value = (quoteBalance.value / 100) * newVal * sellPrice.value;
  } else {
    sellTotal.value = '';
  }

  if (sellPrice.value) {
    sellSize.value = (quoteBalance.value / 100) * newVal;
  }
});

function updateSellTotal(val) {
  // console.log('changing updateBuyTotal ', val);
  if (sellPrice.value) {
    sellSize.value = sellTotal.value / sellPrice.value;
  }

  setTimeout(function(){
    sellTotalPercent.value = ((val / quoteBalance.value) * 100).toFixed(0);
  }, 100);
}

</script>

<template>
  <n-card class="exchange-form-card" size="small">
    <template #header>
      <div class="card-header">
        <span class="header-title">Trading Panel</span>
      </div>
    </template>

    <!-- API Key Selector -->
    <div class="api-key-section">
      <n-space vertical size="small">
        <div class="section-label">
          <span class="label-icon">🔑</span>
          <n-text strong style="font-size: 12px;">API Key</n-text>
        </div>
        <n-select
          v-model:value="selectedApiKey"
          :options="availableApiKeys"
          :loading="loadingApiKeys"
          placeholder="Select API Key"
          :disabled="availableApiKeys.length === 0"
          size="small"
        />
        <n-alert v-if="availableApiKeys.length === 0 && !loadingApiKeys" type="warning" size="small">
          No API keys found. Please add API keys in your profile.
        </n-alert>
      </n-space>
    </div>

    <!-- Trading Tabs -->
    <n-tabs type="segment" animated size="small" class="trading-tabs">
      <n-tab-pane name="Limit Orders" tab="Limit">
        <div class="orders-container">
          <!-- BUY Section -->
          <div class="order-section buy-section">
            <div class="balance-header">
              <span class="balance-label">Available</span>
              <span class="balance-value">{{ baseBalance }} {{ quote }}</span>
            </div>

            <n-space vertical size="small" class="form-inputs">
              <div class="input-wrapper">
                <label class="input-label">Price</label>
                <n-input
                  v-model:value="buyPrice"
                  type="text"
                  placeholder="0.00"
                  @input="updateBuyPrice"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ quote }}</span>
                  </template>
                </n-input>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Amount</label>
                <n-input
                  v-model:value="buySize"
                  type="text"
                  placeholder="0.00"
                  @input="updateBuySize"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ base }}</span>
                  </template>
                </n-input>
              </div>

              <div class="slider-wrapper">
                <n-slider
                  v-model:value="buyTotalPercent"
                  :step="1"
                  :format-tooltip="formatTooltip"
                  :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
                />
              </div>

              <div class="input-wrapper">
                <label class="input-label">Total</label>
                <n-input
                  v-model:value="buyTotal"
                  type="text"
                  placeholder="0.00"
                  @input="updateBuyTotal"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ quote }}</span>
                  </template>
                </n-input>
              </div>

              <n-button
                type="success"
                @click="createOrder('BUY', 'limit')"
                block
                strong
                class="buy-button"
              >
                BUY / LONG
              </n-button>
            </n-space>
          </div>

          <!-- SELL Section -->
          <div class="order-section sell-section">
            <div class="balance-header">
              <span class="balance-label">Available</span>
              <span class="balance-value">{{ quoteBalance }} {{ base }}</span>
            </div>

            <n-space vertical size="small" class="form-inputs">
              <div class="input-wrapper">
                <label class="input-label">Price</label>
                <n-input
                  v-model:value="sellPrice"
                  type="text"
                  placeholder="0.00"
                  @input="updateSellPrice"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ quote }}</span>
                  </template>
                </n-input>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Amount</label>
                <n-input
                  v-model:value="sellSize"
                  type="text"
                  placeholder="0.00"
                  @input="updateSellSize"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ base }}</span>
                  </template>
                </n-input>
              </div>

              <div class="slider-wrapper">
                <n-slider
                  v-model:value="sellTotalPercent"
                  :step="1"
                  :format-tooltip="formatTooltip"
                  :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
                />
              </div>

              <div class="input-wrapper">
                <label class="input-label">Total</label>
                <n-input
                  v-model:value="sellTotal"
                  type="text"
                  placeholder="0.00"
                  @input="updateSellTotal"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ quote }}</span>
                  </template>
                </n-input>
              </div>

              <n-button
                type="error"
                @click="createOrder('SELL', 'limit')"
                block
                strong
                class="sell-button"
              >
                SELL / SHORT
              </n-button>
            </n-space>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="Market Orders" tab="Market">
        <div class="orders-container">
          <!-- BUY Section -->
          <div class="order-section buy-section">
            <div class="balance-header">
              <span class="balance-label">Available</span>
              <span class="balance-value">{{ baseBalance }} {{ quote }}</span>
            </div>

            <n-space vertical size="small" class="form-inputs">
              <div class="input-wrapper">
                <label class="input-label">Amount</label>
                <n-input
                  v-model:value="buySize"
                  type="text"
                  placeholder="0.00"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ base }}</span>
                  </template>
                </n-input>
              </div>

              <div class="slider-wrapper">
                <n-slider
                  v-model:value="buyTotalPercent"
                  :step="1"
                  :format-tooltip="formatTooltip"
                  :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
                />
              </div>

              <div class="input-wrapper">
                <label class="input-label">Total</label>
                <n-input
                  v-model:value="buyTotal"
                  type="text"
                  placeholder="0.00"
                  @input="updateBuyTotal"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ quote }}</span>
                  </template>
                </n-input>
              </div>

              <n-button
                type="success"
                @click="createOrder('BUY', 'market')"
                block
                strong
                class="buy-button"
              >
                BUY / LONG
              </n-button>
            </n-space>
          </div>

          <!-- SELL Section -->
          <div class="order-section sell-section">
            <div class="balance-header">
              <span class="balance-label">Available</span>
              <span class="balance-value">{{ quoteBalance }} {{ base }}</span>
            </div>

            <n-space vertical size="small" class="form-inputs">
              <div class="input-wrapper">
                <label class="input-label">Amount</label>
                <n-input
                  v-model:value="sellSize"
                  type="text"
                  placeholder="0.00"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ base }}</span>
                  </template>
                </n-input>
              </div>

              <div class="slider-wrapper">
                <n-slider
                  v-model:value="sellTotalPercent"
                  :step="1"
                  :format-tooltip="formatTooltip"
                  :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
                />
              </div>

              <div class="input-wrapper">
                <label class="input-label">Total</label>
                <n-input
                  v-model:value="sellTotal"
                  type="text"
                  placeholder="0.00"
                  @input="updateSellTotal"
                  size="small"
                >
                  <template #suffix>
                    <span class="input-suffix">{{ quote }}</span>
                  </template>
                </n-input>
              </div>

              <n-button
                type="error"
                @click="createOrder('SELL', 'market')"
                block
                strong
                class="sell-button"
              >
                SELL / SHORT
              </n-button>
            </n-space>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>
/* Card Styling - Ultra Compact */
.exchange-form-card {
  width: 100%;
  height: auto;
}

:deep(.n-card__content) {
  padding: 6px !important;
}

:deep(.n-card-header) {
  padding: 8px 12px !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* API Key Section */
.api-key-section {
  margin-bottom: 6px;
  padding: 6px;
  background: rgba(128, 128, 128, 0.05);
  border-radius: 3px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 3px;
}

.label-icon {
  font-size: 10px;
}

/* Trading Tabs */
.trading-tabs {
  margin-top: 4px;
}

:deep(.n-tabs-tab) {
  padding: 6px 12px !important;
  font-size: 10px !important;
}

/* Orders Container */
.orders-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 6px;
}

/* Order Section */
.order-section {
  padding: 6px;
  border-radius: 3px;
  border: 1px solid rgba(128, 128, 128, 0.15);
  transition: all 0.2s ease;
}

.buy-section {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(16, 185, 129, 0.01) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

.buy-section:hover {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.sell-section {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, rgba(239, 68, 68, 0.01) 100%);
  border-color: rgba(239, 68, 68, 0.2);
}

.sell-section:hover {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

/* Balance Header */
.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 4px 6px;
  background: rgba(128, 128, 128, 0.08);
  border-radius: 3px;
}

.balance-label {
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
  letter-spacing: 0.3px;
}

.balance-value {
  font-size: 9px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* Form Inputs */
.form-inputs {
  width: 100%;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.input-label {
  font-size: 8px;
  font-weight: 600;
  opacity: 0.8;
  margin-left: 1px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.input-suffix {
  font-size: 9px;
  font-weight: 600;
  opacity: 0.6;
}

/* Slider Wrapper */
.slider-wrapper {
  padding: 4px 2px;
  margin: 2px 0;
}

:deep(.n-slider) {
  margin: 0 !important;
}

/* Buttons */
.buy-button,
.sell-button {
  margin-top: 4px;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.3px;
  height: 28px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.buy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.sell-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .orders-container {
    grid-template-columns: 1fr;
  }

  .header-title {
    font-size: 12px;
  }

  .order-section {
    padding: 12px;
  }
}
</style>
