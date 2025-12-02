<script setup>
import { useAppStore } from '~/stores/app.store';
import { useStrategyGridBot } from '~/composables/useStrategyGridBot';
import { useRSIValues } from '~/composables/useRSIValues';
import StrategiesGridBot from '~/components/StrategiesGridBot.vue';
import RSIDisplay from '~/components/RSIDisplay.vue';
import '~/components/styles/grid-bots-form-plus.css';
import {ref, watch, computed, onMounted, onUnmounted} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
import { useMessage } from 'naive-ui';

const app = useAppStore()
const message = useMessage()
const {
  amountTypeOptions,
  ordersSideOptions
} = useStrategyGridBot();

// RSI Values from composable
const {
  rsiValues,
  fetchRSIValues
} = useRSIValues();

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange || 'coinbaseadvanced');
let currentSymbol = ref(app.getUserSelectedMarket || 'BTC/USD');

// API Keys - READ FROM STORE (set in grid-bots-list.vue)
const selectedApiKeys = computed(() => app.getSelectedApiKeys);

let base = currentSymbol.value ? currentSymbol.value.split('/')[0] : 'BTC';
let quote = currentSymbol.value ? currentSymbol.value.split('/')[1] : 'USD';
const bestBid = ref(null);
const bestAsk = ref(null);
const manualLowerPrice = ref('');
const manualUpperPrice = ref('');

let name = ref(`gridBot_${generateRandomString(5)}`);
let lowerPrice = ref('');
let upperPrice = ref('');
let amountType = ref('incrementalPercent');
let amount = ref('');
let nrOfGrids = ref('');
let ordersSide = ref('buyOrSell');
let incrementalPercentAmountBuy = ref('');
let incrementalPercentAmountSell = ref('');
let deviationPriceBuy = ref('');
let deviationPriceSell = ref('');
let deviationAmountBuy = ref('');
let deviationAmountSell = ref('');
let usePriceGroup = ref(false);
let priceGroupBuy = ref('');
let priceGroupSell = ref('');

let BalanceBase = ref(0);
let BalanceQuote = ref(0);
let BalanceBaseInUSD = ref(0);
let BalanceQuoteInUSD = ref(0);
let BalanceBaseProfit = ref(0);
let BalanceQuoteProfit = ref(0);
let BalanceBotProfit = ref(0);
let BalanceBotValInitiala = ref(0);
let TakeProfitBotSTR1 = ref('');
let TakeProfitBotSTR2 = ref('');

let BotReset = ref('');
let BotCancelOrders = ref('');
let BotX1 = ref('');
let BotX2 = ref('');
let BotX3 = ref('');
let BotX4 = ref('');

let orderBookInterval = null;

// Current price from order book
const currentPrice = ref(null);

// Collapsed sections state
let showBasicConfig = ref(true);
let showAdvancedConfig = ref(false);
let showPriceActions = ref(true);
let showStrategies = ref(false);

// Starea pentru a ține evidența dacă devierea inițială a fost aplicată sau nu
let initialDeviationApplied = false;

async function fetchOrderBookPooling() {
  try {
    // Guard: skip if missing required values
    if (!userID?.value || !currentExchange?.value || !currentSymbol?.value) {
      return;
    }

    const orderBook = await $fetch('/api/v1/fetchOrderBook', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
      },
    });

    if (orderBook?.data) {
      bestBid.value = orderBook.data.bids?.length > 0 ? orderBook.data.bids[0][0] : null;
      bestAsk.value = orderBook.data.asks?.length > 0 ? orderBook.data.asks[0][0] : null;

      // Update current price from order book
      if (bestBid.value && bestAsk.value) {
        currentPrice.value = (bestBid.value + bestAsk.value) / 2;
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}


// Funcția pentru actualizarea prețului minim
function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(6).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
  }
}

// Funcția pentru actualizarea prețului maxim
function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(6).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
  }
}

// Funcția pentru aplicarea devierii inițiale la încărcarea paginii
function applyInitialDeviation() {
  if (!initialDeviationApplied) {
    updateLowerPrice();
    updateUpperPrice();
    initialDeviationApplied = true;
  }
}

function showTooltip(text) {
  message.info(text, { duration: 2 })
}

function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

// Fetch balance for the selected symbol
async function fetchBalanceForSymbol() {
  try {
    // Guard: skip if userID is not available
    if (!userID?.value) {
      console.warn('⚠️ Cannot fetch balance: userID not available');
      return;
    }

    const exchange = currentExchange.value || 'coinbaseadvanced';
    const symbol = currentSymbol.value || 'LCX/USDC';

    const response = await $fetch('/api/v1/fetchBalance', {
      query: {
        userID: userID.value,
        exchange: exchange,
        symbol: symbol
      }
    });

    if (response?.data) {
      BalanceBase.value = response.data.base || 0;
      BalanceQuote.value = response.data.quote || 0;
      BalanceBaseInUSD.value = response.data.baseInUSD || 0;
      BalanceQuoteInUSD.value = response.data.quoteInUSD || 0;
      BalanceBaseProfit.value = response.data.baseProfit || 0;
      BalanceQuoteProfit.value = response.data.quoteProfit || 0;
      BalanceBotProfit.value = response.data.botProfit || 0;
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

// Strategy methods are now in useStrategyGridBot composable
// Local wrappers to pass form data to composable methods

// Handle strategy apply from StrategiesGridBot component
function handleStrategyApplied(appliedData) {
  if (appliedData) {
    try {
      name.value = appliedData.name || '';
      lowerPrice.value = (appliedData.lowerPrice ?? 0).toString();
      upperPrice.value = (appliedData.upperPrice ?? 0).toString();
      amount.value = (appliedData.amount ?? 0).toString();
      nrOfGrids.value = (appliedData.nrOfGrids ?? 10).toString();
      ordersSide.value = appliedData.ordersSide || 'buyOrSell';
      amountType.value = appliedData.amountType || 'incrementalPercent';
      incrementalPercentAmountBuy.value = (appliedData.incBuy ?? 1).toString();
      incrementalPercentAmountSell.value = (appliedData.incSell ?? 1).toString();
      deviationPriceBuy.value = (appliedData.devPriceBuy ?? 1).toString();
      deviationPriceSell.value = (appliedData.devPriceSell ?? 1).toString();
      deviationAmountBuy.value = (appliedData.devAmtBuy ?? 0.9).toString();
      deviationAmountSell.value = (appliedData.devAmtSell ?? 0.9).toString();
      bestBid.value = appliedData.bestBid ?? 0;
      bestAsk.value = appliedData.bestAsk ?? 0;
    } catch (error) {
      console.error('Error applying strategy data:', error, appliedData);
    }

    console.log('✅ Strategy applied and form updated!');
  }
}

async function createGridBot(){
  // Guard: verify userID is available
  if (!userID?.value) {
    console.error('❌ Cannot create bot: userID not available');
    return;
  }

  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
    console.error('No API Keys selected');
    return;
  }

  console.log('🔑 Creating GridBot with API Keys:', selectedApiKeys.value);

  // Calculate initial bot balance value (total balance in quote currency)
  const initialBotValue = currentPrice.value
    ? (parseFloat(BalanceQuote.value || 0) + (parseFloat(BalanceBase.value || 0) * currentPrice.value)).toString()
    : '0';

  console.log('💰 Initial Bot Balance:', {
    base: BalanceBase.value,
    quote: BalanceQuote.value,
    currentPrice: currentPrice.value,
    totalValue: initialBotValue
  });

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
    incrementalPercentAmountBuy:incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell:incrementalPercentAmountSell.value,
    apiKeyNames: selectedApiKeys.value,
    // RSI values at bot creation
    rsiAtCreation: rsiValues.value,
    priceAtCreation: currentPrice.value,
    // Initial balance snapshot
    BalanceBotStart: initialBotValue,
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
      BalanceBase: BalanceBase.value?.toString() || '0',
      BalanceQuote: BalanceQuote.value?.toString() || '0',
      BalanceBaseInUSD: BalanceBaseInUSD.value?.toString() || '0',
      BalanceQuoteInUSD: BalanceQuoteInUSD.value?.toString() || '0',
      BalanceBaseProfit: '0',
      BalanceQuoteProfit: '0',
      BalanceBotProfit: '0',
      BalanceBotValInitiala: initialBotValue
    },
    TakeProfitBot: {
      TakeProfitBotSTR1: TakeProfitBotSTR1.value,
      TakeProfitBotSTR2: TakeProfitBotSTR2.value
    },
    BotAction: {
      BotReset: BotReset.value,
      BotCancelOrders: BotCancelOrders.value,
      BotX1: BotX1.value,
      BotX2: BotX2.value,
      BotX3: BotX3.value,
      BotX4: BotX4.value,
    },

  };

  let response = await $fetch( '/api/v1/createGridBot', {
    method: 'POST',
    body: data
  } );

  BotX1.value = 'ComandaX1';
  BotX2.value = 'ComandaX2';
}

onMounted(async () => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
  applyInitialDeviation();

  // Strategies are loaded in StrategiesGridBot component
  console.log('✅ Grid Bot Form mounted');
});

onUnmounted(() => {
  if (orderBookInterval) {
    try {
      clearIntervalAsync(orderBookInterval);
    } catch (error) {
      console.warn('Error clearing orderBook interval:', error);
    }
  }
});

</script>

<template>
  <div class="gridbot-form-container">
    <!-- Compact Header with Prices -->
    <div class="form-header">

       <div class="create-button-section">
            <n-button type="primary" size="small" @click="createGridBot">⚙️CREATE BOT</n-button>
          </div>

      <div class="field-group">
        <n-input v-model:value="name" size="tiny" placeholder="Bot name" />
      </div>
      <div class="field-cell lower-price-cell">
        <n-input v-model:value="lowerPrice" size="tiny" placeholder="LOWER PRICE" style="--n-color: rgba(16, 235, 4, 0.2); --n-color-focus: rgba(16, 235, 4, 0.25); --n-text-color: #ffffff; --n-border: 1px solid rgba(16, 235, 4, 0.6); --n-border-hover: 1px solid rgba(16, 235, 4, 0.8); --n-border-focus: 1px solid #10eb04;">
          <template #suffix>{{ quote }}</template>
        </n-input>
      </div>
      <div class="field-cell upper-price-cell">
        <n-input v-model:value="upperPrice" size="tiny" placeholder="UPPER PRICE" style="--n-color: rgba(235, 4, 4, 0.2); --n-color-focus: rgba(235, 4, 4, 0.25); --n-text-color: #ffffff; --n-border: 1px solid rgba(235, 4, 4, 0.6); --n-border-hover: 1px solid rgba(235, 4, 4, 0.8); --n-border-focus: 1px solid #eb0404;">
          <template #suffix>{{ quote }}</template>
        </n-input>
      </div>
      <div class="field-cell grids-cell" @mouseenter="showTooltip('GRIDS: Number of grid orders')">
        <n-input
          v-model:value="nrOfGrids"
          size="tiny"
          placeholder="GRIDS"
          style="
            --n-color: rgba(250, 204, 21, 0.1);
            --n-color-focus: rgba(250, 204, 21, 0.15);
            --n-text-color: #facc15;
            --n-border: 1px solid rgba(250, 204, 21, 0.3);
            --n-border-hover: 1px solid rgba(250, 204, 21, 0.5);
            --n-border-focus: 1px solid #facc15;
          "
        />
      </div>

      <div class="field-cell amount-cell" @mouseenter="showTooltip('AMOUNT: Order amount')">
        <n-input
          v-model:value="amount"
          size="tiny"
          placeholder="AMOUNT"
          style="
            --n-color: rgba(96, 165, 250, 0.1);
            --n-color-focus: rgba(96, 165, 250, 0.15);
            --n-text-color: #60a5fa;
            --n-border: 1px solid rgba(96, 165, 250, 0.3);
            --n-border-hover: 1px solid rgba(96, 165, 250, 0.5);
            --n-border-focus: 1px solid #60a5fa;
          "
        >
          <template #suffix>{{ quote }}</template>
        </n-input>
      </div>


      <div class="field-cell amount-type-cell">
        <n-select v-model:value="amountType" :options="amountTypeOptions" size="tiny" placeholder="AMOUNT TYPE" />
      </div>
      <div class="field-cell order-type-cell">
        <n-select v-model:value="ordersSide" :options="ordersSideOptions" size="tiny" placeholder="ORDER TYPE" />
      </div>

        <div class="checkbox-cell-center">
          <n-checkbox v-model:checked="usePriceGroup" size="small" class="compact-checkbox-inline">

          </n-checkbox>
        </div> 

      
      <div class="header-prices">
        <div class="price-badge bid">
          <span class="price-label">BID</span>
          <span class="price-value">{{ bestBid?.toFixed(4) || '-' }}</span>
        </div>
        <div class="price-badge ask">
          <span class="price-label">ASK</span>
          <span class="price-value">{{ bestAsk?.toFixed(4) || '-' }}</span>
        </div>
      </div>
    </div>

  <!-- Configuration Table -->



    <div class="config-table-wrapper">
      <!-- Price Group Inputs - Left Side (Only when enabled) -->
      <div class="config-left-section">
        <div v-if="usePriceGroup" class="price-group-container">
          <n-input v-model:value="priceGroupBuy" size="small" placeholder="PGrp B" class="price-group-input-buy" style="--n-color: rgba(16, 235, 4, 0.35); --n-color-focus: rgba(16, 235, 4, 0.4); --n-text-color: #10eb04; --n-border: 1px solid rgba(16, 235, 4, 0.6); --n-border-hover: 1px solid rgba(16, 235, 4, 0.8); --n-border-focus: 1px solid #10eb04; width: 123px;">
            <template #suffix>{{ quote }}</template>
          </n-input>
          <n-input v-model:value="priceGroupSell" size="small" placeholder="PGrp S" class="price-group-input-sell" style="--n-color: rgba(235, 4, 4, 0.35); --n-color-focus: rgba(235, 4, 4, 0.4); --n-text-color: #eb0404; --n-border: 1px solid rgba(235, 4, 4, 0.6); --n-border-hover: 1px solid rgba(235, 4, 4, 0.8); --n-border-focus: 1px solid #eb0404; width: 123px;">
            <template #suffix>{{ quote }}</template>
          </n-input>
        </div>
      </div>

      <!-- BUY/SELL Configuration Table - Right Side -->
      <div class="config-right-section">
          <table class="buy-sell-table">
            <tbody>
              <tr>
                <td class="buy-cell header-row"><strong style="color: #10eb04;">📈 BUY</strong></td>
                <td class="sell-cell header-row"><strong style="color: #eb0404;">📉 SELL</strong></td>
              </tr>
              <tr>
                <td class="buy-cell">INC %</td>
                <td class="sell-cell">INC %</td>
              </tr>
              <tr>
                <td class="buy-cell">
                  <n-input v-model:value="incrementalPercentAmountBuy" size="tiny" placeholder="%" class="buy-input">
                    <template #suffix>%</template>
                  </n-input>
                </td>
                <td class="sell-cell">
                  <n-input v-model:value="incrementalPercentAmountSell" size="tiny" placeholder="%" class="sell-input">
                    <template #suffix>%</template>
                  </n-input>
                </td>
              </tr>
              <tr>
                <td class="buy-cell">DEV PRICE</td>
                <td class="sell-cell">DEV PRICE</td>
              </tr>
              <tr>
                <td class="buy-cell">
                  <n-input v-model:value="deviationPriceBuy" size="tiny" placeholder="%" class="buy-input">
                    <template #suffix>%</template>
                  </n-input>
                </td>
                <td class="sell-cell">
                  <n-input v-model:value="deviationPriceSell" size="tiny" placeholder="%" class="sell-input">
                    <template #suffix>%</template>
                  </n-input>
                </td>
              </tr>
              <tr>
                <td class="buy-cell">DEV AMOUNT</td>
                <td class="sell-cell">DEV AMOUNT</td>
              </tr>
              <tr>
                <td class="buy-cell">
                  <n-input v-model:value="deviationAmountBuy" size="tiny" placeholder="%" class="buy-input">
                    <template #suffix>%</template>
                  </n-input>
                </td>
                <td class="sell-cell">
                  <n-input v-model:value="deviationAmountSell" size="tiny" placeholder="%" class="sell-input">
                    <template #suffix>%</template>
                  </n-input>
                </td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>



    <!-- Quick Actions - Price Actions -->
    <div class="config-section">
      <div class="section-header" @click="showPriceActions = !showPriceActions">
        <span>💰 Quick Actions</span>
        <span class="collapse-icon">{{ showPriceActions ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showPriceActions" class="section-content">
        <!-- PRICE ACTIONS TABLE -->
        <div class="price-actions-table">
          <div class="price-row">
            <span class="price-row-label">Lower</span>
            <div class="price-row-buttons">
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.0001)">-</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.005)">0.5%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.01)">1%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.02)">2%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.03)">3%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.05)">5%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.07)">7%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.09)">9%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.10)">10%</n-button>
                 <n-button size="tiny" type="success" @click="updateLowerPrice(0.15)">15%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.20)">20%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.30)">30%</n-button>
                    <n-button size="tiny" type="success" @click="updateLowerPrice(0.40)">40%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.50)">50%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.60)">60%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.70)">70%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.80)">80%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.90)">90%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.91)">91%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.92)">92%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.93)">93%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.94)">94%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.95)">95%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.96)">96%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.97)">97%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.98)">98%</n-button>
              <n-button size="tiny" type="success" @click="updateLowerPrice(0.99)">99%</n-button>



            </div>
          </div>
          <div class="price-row">
            <span class="price-row-label">Upper</span>
            <div class="price-row-buttons">
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.001)">+</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.005)">0.5%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.01)">1%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.02)">2%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.03)">3%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.05)">5%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.07)">7%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.09)">9%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.10)">10%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.15)">15%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.20)">20%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.30)">30%</n-button>
                  <n-button size="tiny" type="error" @click="updateUpperPrice(0.40)">40%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.50)">50%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.60)">60%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.70)">70%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.80)">80%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.90)">90%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(1.00)">100%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(2.00)">x2</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(3.00)">x3</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(4.00)">x4</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(5.00)">x5</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(6.00)">x6</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(7.00)">x7</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(8.00)">x8</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(9.00)">x9</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(10.00)">x10</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(20.00)">x20</n-button>
        

            </div>
          </div>

         
        </div>







        <!-- GRIDS AND AMOUNT QUICK ACTIONS -->
        <div class="quick-actions-row">
          <div class="quick-actions-group">
            <span class="quick-actions-label">Grids</span>
            <div class="quick-buttons-inline">
              <n-button size="tiny" type="warning" @click="nrOfGrids = '10'">10</n-button>
              <n-button size="tiny" type="warning" @click="nrOfGrids = '20'">20</n-button>
              <n-button size="tiny" type="warning" @click="nrOfGrids = '30'">30</n-button>
              <n-button size="tiny" type="warning" @click="nrOfGrids = '50'">50</n-button>
              <n-button size="tiny" type="warning" @click="nrOfGrids = '100'">100</n-button>
            </div>
          </div>

          <div class="quick-actions-group">
            <span class="quick-actions-label">Amount</span>
            <div class="quick-buttons-inline">
              <n-button size="tiny" type="info" @click="amount = '1.1'">1.1</n-button>
              <n-button size="tiny" type="info" @click="amount = '5'">5</n-button>
              <n-button size="tiny" type="info" @click="amount = '10.1'">10.1</n-button>
              <n-button size="tiny" type="info" @click="amount = '50'">50</n-button>
              <n-button size="tiny" type="info" @click="amount = '100'">100</n-button>
            </div>
          </div>

         
        </div>
      </div>
    </div>

    <!-- Strategies Management Component -->
    <ClientOnly>
      <StrategiesGridBot
        :userID="userID?.value"
        :exchange="currentExchange?.value"
        :symbol="currentSymbol?.value"
        :bestBid="bestBid?.value"
        :bestAsk="bestAsk?.value"
        :formData="{
          name,
          lowerPrice,
          upperPrice,
          amountType,
          amount,
          nrOfGrids,
          ordersSide,
          incrementalPercentAmountBuy,
          incrementalPercentAmountSell,
          deviationPriceBuy,
          deviationPriceSell,
          deviationAmountBuy,
          deviationAmountSell,
          usePriceGroup,
          priceGroupBuy,
          priceGroupSell,
          symbol: currentSymbol,
          exchange: currentExchange
        }"
        @apply-strategy="handleStrategyApplied"
      />
    </ClientOnly>

    <!-- RSI Display Component -->
    <RSIDisplay
      :exchange="currentExchange?.value || 'coinbaseadvanced'"
      :symbol="currentSymbol?.value || 'LCX/USDC'"
      :auto-fetch="true"
    />

  </div>
</template>

<style scoped>
/* All styles imported from grid-bots-form-plus.css */
</style>
