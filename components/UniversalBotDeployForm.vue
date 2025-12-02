<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, watch, computed, onMounted } from 'vue';

const app = useAppStore();
const userID = useCookie('userID');

const props = defineProps({
  botName: String,
  botConfig: Object,
  botCategory: String
});

let currentExchange = ref(app.getUserSelectedExchange || 'coinbaseadvanced');
let currentSymbol = ref(app.getUserSelectedMarket || 'LCX/USDT');

// API Keys - READ FROM STORE
const selectedApiKeys = computed(() => app.getSelectedApiKeys);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];
const bestBid = ref(null);
const bestAsk = ref(null);

let name = ref(`${props.botName}_${generateRandomString(5)}`);
let lowerPrice = ref('');
let upperPrice = ref('');
let amountType = ref('incrementalPercent');
let amountTypeOptions = [
  { value: 'quantityPerGrid', label: 'Qty Per Grid' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'incrementalPercent', label: 'Incremental Amount' }
];
let amount = ref('');
let nrOfGrids = ref('20');
let ordersSide = ref('buyOrSell');
let ordersSideOptions = [
  { value: 'buyOrSell', label: 'Buy & Sell' },
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' },
];
let incrementalPercentAmountBuy = ref('');
let incrementalPercentAmountSell = ref('');
let deviationPriceBuy = ref('');
let deviationPriceSell = ref('');
let deviationAmountBuy = ref('');
let deviationAmountSell = ref('');
let usePriceGroup = ref(false);
let priceGroupBuy = ref('');
let priceGroupSell = ref('');

// Collapsed sections state
let showBasicConfig = ref(true);
let showAdvancedConfig = ref(false);
let showPriceActions = ref(true);
let showStrategies = ref(false);

function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}

async function fetchOrderBookPooling() {
  try {
    const orderBook = await $fetch('/api/v1/fetchOrderBook', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
      },
    });

    if (orderBook.data) {
      bestBid.value = orderBook.data.bids.length > 0 ? orderBook.data.bids[0][0] : null;
      bestAsk.value = orderBook.data.asks.length > 0 ? orderBook.data.asks[0][0] : null;
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(6).toString();
    lowerPrice.value = newValue;
  }
}

function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(6).toString();
    upperPrice.value = newValue;
  }
}

async function createGridBot() {
  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
    console.error('No API Keys selected');
    return;
  }

  let data = {
    userID: userID.value,
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,
    incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell: incrementalPercentAmountSell.value,
    apiKeyNames: selectedApiKeys.value,
    config: {
      deviationPriceBuy: deviationPriceBuy.value,
      deviationPriceSell: deviationPriceSell.value,
      deviationAmountBuy: deviationAmountBuy.value,
      deviationAmountSell: deviationAmountSell.value,
      usePriceGroup: usePriceGroup.value,
      priceGroupBuy: priceGroupBuy.value,
      priceGroupSell: priceGroupSell.value
    },
    BalanceBot: {
      BalanceBase: '0',
      BalanceQuote: '0',
      BalanceBaseInUSD: '0',
      BalanceQuoteInUSD: '0',
      BalanceBaseProfit: '0',
      BalanceQuoteProfit: '0',
      BalanceBotProfit: '0',
      BalanceBotValInitiala: '0'
    },
    TakeProfitBot: {
      TakeProfitBotSTR1: '',
      TakeProfitBotSTR2: ''
    },
    BotAction: {
      BotReset: '',
      BotCancelOrders: '',
      BotX1: '',
      BotX2: '',
      BotX3: '',
      BotX4: '',
    },
  };

  let response = await $fetch('/api/v1/createGridBot', {
    method: 'POST',
    body: data
  });

  console.log('Bot created:', response);
}

onMounted(async () => {
  await fetchOrderBookPooling();
  updateLowerPrice();
  updateUpperPrice();
});
</script>

<template>
  <div class="universal-bot-form">
    <!-- BASIC CONFIG -->
    <n-collapse-item name="basic" title="📊 BASIC CONFIG">
      <template #header>
        <div class="section-header">
          <span class="section-icon">📊</span>
          <span class="section-title">BASIC CONFIG</span>
        </div>
      </template>

      <div class="form-grid">
        <div class="form-field">
          <label>Bot Name</label>
          <n-input v-model:value="name" placeholder="Bot name" size="small" />
        </div>

        <div class="form-field">
          <label>Lower Price</label>
          <n-input-number v-model:value="lowerPrice" :min="0" :step="0.000001" :precision="6" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Upper Price</label>
          <n-input-number v-model:value="upperPrice" :min="0" :step="0.000001" :precision="6" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Nr of Grids</label>
          <n-input-number v-model:value="nrOfGrids" :min="5" :max="100" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Amount</label>
          <n-input-number v-model:value="amount" :min="0" :step="1" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Amount Type</label>
          <n-select v-model:value="amountType" :options="amountTypeOptions" size="small" />
        </div>

        <div class="form-field">
          <label>Orders Side</label>
          <n-select v-model:value="ordersSide" :options="ordersSideOptions" size="small" />
        </div>
      </div>
    </n-collapse-item>

    <!-- ADVANCED CONFIG -->
    <n-collapse-item name="advanced" title="⚙️ ADVANCED CONFIG">
      <template #header>
        <div class="section-header">
          <span class="section-icon">⚙️</span>
          <span class="section-title">ADVANCED CONFIG</span>
        </div>
      </template>

      <div class="form-grid">
        <div class="form-field">
          <label>Incremental % Buy</label>
          <n-input-number v-model:value="incrementalPercentAmountBuy" :min="0" :max="100" :step="0.1" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Incremental % Sell</label>
          <n-input-number v-model:value="incrementalPercentAmountSell" :min="0" :max="100" :step="0.1" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Deviation Price Buy</label>
          <n-input-number v-model:value="deviationPriceBuy" :min="0" :step="0.1" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Deviation Price Sell</label>
          <n-input-number v-model:value="deviationPriceSell" :min="0" :step="0.1" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Deviation Amount Buy</label>
          <n-input-number v-model:value="deviationAmountBuy" :min="0" :step="0.1" style="width: 100%;" size="small" />
        </div>

        <div class="form-field">
          <label>Deviation Amount Sell</label>
          <n-input-number v-model:value="deviationAmountSell" :min="0" :step="0.1" style="width: 100%;" size="small" />
        </div>
      </div>

      <div style="margin-top: 12px;">
        <n-checkbox v-model:checked="usePriceGroup">
          <span style="color: #aaa; font-size: 11px;">Use Price Grouping</span>
        </n-checkbox>

        <div v-if="usePriceGroup" class="form-grid" style="margin-top: 8px;">
          <div class="form-field">
            <label>Price Group Buy</label>
            <n-input-number v-model:value="priceGroupBuy" :min="0" :step="1" style="width: 100%;" size="small" />
          </div>
          <div class="form-field">
            <label>Price Group Sell</label>
            <n-input-number v-model:value="priceGroupSell" :min="0" :step="1" style="width: 100%;" size="small" />
          </div>
        </div>
      </div>
    </n-collapse-item>

    <!-- QUICK PRICE -->
    <n-collapse-item name="quickprice" title="⚡ QUICK PRICE">
      <template #header>
        <div class="section-header">
          <span class="section-icon">⚡</span>
          <span class="section-title">QUICK PRICE</span>
        </div>
      </template>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        <button @click="updateLowerPrice(0.01); updateUpperPrice(0.01);" class="quick-price-btn">±1%</button>
        <button @click="updateLowerPrice(0.02); updateUpperPrice(0.02);" class="quick-price-btn">±2%</button>
        <button @click="updateLowerPrice(0.05); updateUpperPrice(0.05);" class="quick-price-btn">±5%</button>
        <button @click="updateLowerPrice(0.10); updateUpperPrice(0.10);" class="quick-price-btn">±10%</button>
      </div>
    </n-collapse-item>

    <!-- CREATE BOT BUTTON -->
    <button @click="createGridBot" class="btn-create-bot">
      🚀 Create Grid Bot
    </button>
  </div>
</template>

<style scoped>
.universal-bot-form {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  color: #ff6b35;
  font-size: 12px;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.form-field label {
  display: block;
  color: #888;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.quick-price-btn {
  padding: 8px;
  background: rgba(16, 235, 4, 0.2);
  border: 1px solid #10eb04;
  border-radius: 6px;
  color: #10eb04;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-price-btn:hover {
  background: rgba(16, 235, 4, 0.3);
  transform: translateY(-2px);
}

.btn-create-bot {
  padding: 12px;
  background: linear-gradient(135deg, #ff6b35 0%, #f5521f 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
}

.btn-create-bot:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}
</style>
