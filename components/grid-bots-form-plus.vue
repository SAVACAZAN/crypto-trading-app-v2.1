<script setup>
import { useAppStore } from '~/stores/app.store';
import { useStrategyGridBot } from '~/composables/useStrategyGridBot';
import StrategiesGridBot from '~/components/StrategiesGridBot.vue';
import {ref, watch, computed, onMounted, onUnmounted} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
import { useMessage } from 'naive-ui';

const app = useAppStore()
const message = useMessage()
const {
  amountTypeOptions,
  ordersSideOptions
} = useStrategyGridBot();

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

// RSI values at bot creation (multi-timeframe)
const rsiValues = ref({
  '1m': null,
  '5m': null,
  '15m': null,
  '30m': null,
  '1h': null,
  '2h': null,
  '6h': null,
  '1d': null
});
const currentPrice = ref(null);

// Collapsed sections state
let showBasicConfig = ref(true);
let showAdvancedConfig = ref(false);
let showPriceActions = ref(true);
let showStrategies = ref(false);
let showRSIInfo = ref(true); // Show RSI section by default

// Starea pentru a ține evidența dacă devierea inițială a fost aplicată sau nu
let initialDeviationApplied = false;

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

      // Update current price from order book
      if (bestBid.value && bestAsk.value) {
        currentPrice.value = (bestBid.value + bestAsk.value) / 2;
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

// Fetch RSI values for all timeframes
async function fetchRSIValues() {
  try {
    const exchange = currentExchange.value || 'coinbaseadvanced';
    const market = currentSymbol.value || 'LCX/USDC';
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d'];

    console.log('📊 Fetching RSI values for bot creation:', { exchange, market });

    // Fetch all timeframes in parallel
    const promises = timeframes.map(async (tf) => {
      try {
        const response = await $fetch('/api/v1/calculateIndicators', {
          method: 'POST',
          body: {
            exchange: exchange,
            symbol: market,
            timeframe: tf
          },
          timeout: 60000
        });

        if (response.success && response.data && response.data.currentRSI) {
          rsiValues.value[tf] = response.data.currentRSI;
        }
      } catch (err) {
        console.error(`Error fetching RSI for ${tf}:`, err.message || err);
      }
    });

    await Promise.all(promises);
    console.log('✅ RSI values fetched:', rsiValues.value);
  } catch (error) {
    console.error('Error fetching RSI values:', error);
  }
}



// Helper to get RSI class for styling
function getRSIClass(rsi) {
  if (rsi === null || rsi === undefined) return '';
  if (rsi >= 70) return 'overbought';
  if (rsi <= 30) return 'oversold';
  if (rsi >= 50) return 'bullish';
  return 'bearish';
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
    const exchange = currentExchange.value || 'coinbaseadvanced';
    const symbol = currentSymbol.value || 'LCX/USDC';

    const response = await $fetch('/api/v1/fetchBalance', {
      query: {
        userID: userID.value,
        exchange: exchange,
        symbol: symbol
      }
    });

    if (response.data) {
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
    name.value = appliedData.name;
    lowerPrice.value = appliedData.lowerPrice.toString();
    upperPrice.value = appliedData.upperPrice.toString();
    amount.value = appliedData.amount.toString();
    nrOfGrids.value = appliedData.nrOfGrids.toString();
    ordersSide.value = appliedData.ordersSide;
    amountType.value = appliedData.amountType;
    incrementalPercentAmountBuy.value = appliedData.incBuy.toString();
    incrementalPercentAmountSell.value = appliedData.incSell.toString();
    deviationPriceBuy.value = appliedData.devPriceBuy.toString();
    deviationPriceSell.value = appliedData.devPriceSell.toString();
    deviationAmountBuy.value = appliedData.devAmtBuy.toString();
    deviationAmountSell.value = appliedData.devAmtSell.toString();
    bestBid.value = appliedData.bestBid;
    bestAsk.value = appliedData.bestAsk;

    console.log('✅ Strategy applied and form updated!');
  }
}

async function createGridBot(){
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

  // Fetch RSI values and balance when component mounts
  await fetchRSIValues();
  await fetchBalanceForSymbol();

  // Strategies are loaded in StrategiesGridBot component
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
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
      <div class="field-cell">
        <n-input v-model:value="lowerPrice" size="tiny" placeholder="LOWER PRICE" style="--n-color: rgba(16, 235, 4, 0.1); --n-color-focus: rgba(16, 235, 4, 0.15); --n-text-color: #10eb04; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;">
          <template #suffix>{{ quote }}</template>
        </n-input>
      </div>
      <div class="field-cell">
        <n-input v-model:value="upperPrice" size="tiny" placeholder="UPPER PRICE" style="--n-color: rgba(235, 4, 4, 0.1); --n-color-focus: rgba(235, 4, 4, 0.15); --n-text-color: #eb0404; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;">
          <template #suffix>{{ quote }}</template>
        </n-input>
      </div>
   <div class="field-cell" @mouseenter="showTooltip('GRIDS: Number of grid orders')">
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

<div class="field-cell" @mouseenter="showTooltip('AMOUNT: Order amount')">
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


      <div class="field-cell">
        <n-select v-model:value="amountType" :options="amountTypeOptions" size="tiny" placeholder="AMOUNT TYPE" />
      </div>
      <div class="field-cell">
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



    <table class="config-table compact">
      <tbody>
        <!-- Row 1: GRIDS, AMOUNT, INC % BUY, INC % SELL, DEV PRICE B, DEV PRICE S, DEV AMT B, DEV AMT S, PRICE GRP B, PRICE GRP S, USE PRICE GROUP -->
        <tr class="config-row">
        <!-- Price Group Inputs - Stacked Vertically on Top Left -->
        <td style="padding: 2px; vertical-align: top; text-align: left;">
          <div v-if="usePriceGroup" style="display: flex; flex-direction: row; gap: 2px;">
            <n-input v-model:value="priceGroupBuy" size="small" placeholder="PGrp B" class="price-group-input-buy" style="width: 123px;">
              <template #suffix>{{ quote }}</template>
            </n-input>
            <n-input v-model:value="priceGroupSell" size="small" placeholder="PGrp S" class="price-group-input-sell" style="width: 123px;">
              <template #suffix>{{ quote }}</template>
            </n-input>
          </div>
        </td>

        <!-- BUY/SELL Table -->
        <td colspan="8" style="text-align: right; padding: 0px;">
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
        </td>

        </tr>
      </tbody>
    </table>



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
        :exchange="currentExchange.value"
        :symbol="currentSymbol.value"
        :bestBid="bestBid.value"
        :bestAsk="bestAsk.value"
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
          priceGroupSell
        }"
        @apply-strategy="handleStrategyApplied"
      />
    </ClientOnly>

    <!-- RSI Information -->
    <div class="config-section">
      <div class="section-header" @click="showRSIInfo = !showRSIInfo">
        <span>📊 RSI at Creation</span>
        <span class="collapse-icon">{{ showRSIInfo ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showRSIInfo" class="section-content rsi-section">
        <div class="rsi-grid">
          <div
            v-for="(value, timeframe) in rsiValues"
            :key="timeframe"
            class="rsi-item"
            :class="getRSIClass(value)"
          >
            <span class="rsi-timeframe">{{ timeframe }}</span>
            <span class="rsi-value">{{ value !== null ? value.toFixed(2) : '-' }}</span>
          </div>
        </div>
      </div>
    </div>

   
  </div>
</template>

<style scoped>
/* Configuration Table */
.config-section {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.section-header {
  padding: 6px 8px;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  font-size: 10px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-content {
  padding: 8px;
}

/* Main Config Table */
.config-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.config-row {
  border-bottom: 1px solid rgba(42, 52, 65, 0.3);
  height: 38px;
}

.config-row:last-child {
  border-bottom: none;
}

.field-cell {
  padding: 6px 2px;
  vertical-align: middle;
  max-width: 50px;
  width: 50px;
}

.field-cell[style*="width: 123px"] {
  max-width: 123px !important;
  width: 123px !important;
}

.price-group-cell {
  max-width: 95px;
  width: 95px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-height: auto;
}

/* Colored Inputs - Row 1 */

.checkbox-cell-center {
  padding: 6px 4px;
  vertical-align: middle;
  text-align: center;
}

.compact-checkbox-inline {
  margin-top: 12px;
}

.compact-checkbox-inline :deep(.n-checkbox__label) {
  display: none;
}

.checkbox-cell-center:hover .compact-checkbox-inline :deep(.n-checkbox__label) {
  display: inline;
}

/* Inline Input Groups */
.inline-group {
  display: flex;
  gap: 4px;
}

.inline-input {
  flex: 1;
}

/* Advanced Compact */
.advanced-compact {
  background: rgba(26, 31, 46, 0.5);
  border-radius: 3px;
  padding: 6px;
  border: 1px solid rgba(42, 52, 65, 0.5);
}

.compact-table {
  width: 100%;
  border-collapse: collapse;
}

.compact-table td {
  padding: 2px;
  vertical-align: middle;
}

.checkbox-cell {
  padding-left: 12px !important;
}

.compact-checkbox {
  margin-top: 10px;
}

/* Ultra Compact Input Styling */
:deep(.n-input--tiny) {
  font-size: 11px !important;
  height: 20px !important;
  min-height: 20px !important;
}

:deep(.n-input__input-el) {
  font-size: 10px !important;
  padding: 2px 2px !important;
  height: 18px !important;
  line-height: 18px !important;
}

:deep(.n-input__suffix) {
  font-size: 6px !important;
  padding: 0 2px !important;
  color: #888 !important;
}

/* Placeholder styling - default */
:deep(.n-input__placeholder) {
  font-size: 10px !important;
  text-transform: uppercase !important;
  font-weight: 600 !important;
}

/* Row 1 Placeholder Colors (GRIDS, AMOUNT, INC % BUY, INC % SELL, DEV PRICE B, DEV PRICE S, DEV AMT B, DEV AMT S, PRICE GRP B, PRICE GRP S) */
.config-row:nth-child(1) .field-cell:nth-child(1) :deep(.n-input__placeholder) {
  color: rgba(251, 191, 36, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(2) :deep(.n-input__placeholder) {
  color: rgba(52, 211, 153, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(3) :deep(.n-input__placeholder) {
  color: rgba(251, 146, 60, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(4) :deep(.n-input__placeholder) {
  color: rgba(249, 115, 22, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(5) :deep(.n-input__placeholder) {
  color: rgba(6, 182, 212, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(6) :deep(.n-input__placeholder) {
  color: rgba(14, 165, 233, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(7) :deep(.n-input__placeholder) {
  color: rgba(139, 92, 246, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(8) :deep(.n-input__placeholder) {
  color: rgba(217, 70, 239, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(9) :deep(.n-input__placeholder) {
  color: rgba(236, 72, 153, 0.8) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(10) :deep(.n-input__placeholder) {
  color: rgba(244, 63, 94, 0.8) !important;
}

/* Row 3 Placeholder Colors */
.config-row:nth-child(3) .field-cell:nth-child(1) :deep(.n-input__placeholder) {
  color: rgba(217, 70, 239, 0.8) !important;
}

.config-row:nth-child(3) .field-cell:nth-child(2) :deep(.n-input__placeholder) {
  color: rgba(236, 72, 153, 0.8) !important;
}

.config-row:nth-child(3) .field-cell:nth-child(3) :deep(.n-input__placeholder) {
  color: rgba(244, 63, 94, 0.8) !important;
}

/* Row 1 Colored Inputs (GRIDS, AMOUNT, INC % BUY, INC % SELL, DEV PRICE B, DEV PRICE S, DEV AMT B, DEV AMT S, PRICE GRP B, PRICE GRP S) */
.config-row:nth-child(1) .field-cell:nth-child(1) :deep(.n-input) {
  background: rgba(251, 191, 36, 0.25) !important;
  border-color: rgba(251, 191, 36, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(1) :deep(.n-input__input-el) {
  background: rgba(251, 191, 36, 0.25) !important;
  color: rgba(251, 191, 36, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(2) :deep(.n-input) {
  background: rgba(52, 211, 153, 0.25) !important;
  border-color: rgba(52, 211, 153, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(2) :deep(.n-input__input-el) {
  background: rgba(52, 211, 153, 0.25) !important;
  color: rgba(52, 211, 153, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(3) :deep(.n-input) {
  background: rgba(251, 146, 60, 0.25) !important;
  border-color: rgba(251, 146, 60, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(3) :deep(.n-input__input-el) {
  background: rgba(251, 146, 60, 0.25) !important;
  color: rgba(251, 146, 60, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(4) :deep(.n-input) {
  background: rgba(249, 115, 22, 0.25) !important;
  border-color: rgba(249, 115, 22, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(4) :deep(.n-input__input-el) {
  background: rgba(249, 115, 22, 0.25) !important;
  color: rgba(249, 115, 22, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(5) :deep(.n-input) {
  background: rgba(6, 182, 212, 0.25) !important;
  border-color: rgba(6, 182, 212, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(5) :deep(.n-input__input-el) {
  background: rgba(6, 182, 212, 0.25) !important;
  color: rgba(6, 182, 212, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(6) :deep(.n-input) {
  background: rgba(14, 165, 233, 0.25) !important;
  border-color: rgba(14, 165, 233, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(6) :deep(.n-input__input-el) {
  background: rgba(14, 165, 233, 0.25) !important;
  color: rgba(14, 165, 233, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(7) :deep(.n-input) {
  background: rgba(139, 92, 246, 0.25) !important;
  border-color: rgba(139, 92, 246, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(7) :deep(.n-input__input-el) {
  background: rgba(139, 92, 246, 0.25) !important;
  color: rgba(139, 92, 246, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(8) :deep(.n-input) {
  background: rgba(217, 70, 239, 0.25) !important;
  border-color: rgba(217, 70, 239, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(8) :deep(.n-input__input-el) {
  background: rgba(217, 70, 239, 0.25) !important;
  color: rgba(217, 70, 239, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(9) :deep(.n-input) {
  background: rgba(236, 72, 153, 0.25) !important;
  border-color: rgba(236, 72, 153, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(9) :deep(.n-input__input-el) {
  background: rgba(236, 72, 153, 0.25) !important;
  color: rgba(236, 72, 153, 0.9) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(10) :deep(.n-input) {
  background: rgba(244, 63, 94, 0.25) !important;
  border-color: rgba(244, 63, 94, 0.6) !important;
}

.config-row:nth-child(1) .field-cell:nth-child(10) :deep(.n-input__input-el) {
  background: rgba(244, 63, 94, 0.25) !important;
  color: rgba(244, 63, 94, 0.9) !important;
}


:deep(.n-select--tiny) {
  font-size: 14px !important;
}

:deep(.n-base-selection) {
  font-size: 14px !important;
  height: 24px !important;
  min-height: 24px !important;
}

:deep(.n-base-selection-label) {
  font-size: 14px !important;
  line-height: 22px !important;
}

:deep(.n-checkbox__label) {
  font-size: 8px !important;
  color: #888 !important;
}

:deep(.n-checkbox__box) {
  width: 12px !important;
  height: 12px !important;
}

/* Responsive */
@media (max-width: 768px) {
  .config-table td,
  .compact-table td {
    display: block;
    width: 100% !important;
  }
  
  .inline-group {
    flex-direction: column;
    gap: 2px;
  }
}
.gridbot-form-container {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 11px;
}

/* Header */
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 8px;
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  border-radius: 3px;
  border: 1px solid #2a3441;
}

.header-icon {
  font-size: 14px;
}

.header-title {
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
  flex: 1;
}

/* Header Prices */
.header-prices {
  display: flex;
  gap: 8px;
}

.price-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 6px;
  border-radius: 3px;
  border: 1px solid;
  background: rgba(0, 0, 0, 0.3);
  min-width: 50px;
}

.price-label {
  font-size: 7px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 1px;
}

.price-value {
  font-size: 9px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.price-badge.bid {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.price-badge.bid .price-value {
  color: #10b981;
}

.price-badge.ask {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.price-badge.ask .price-value {
  color: #ef4444;
}

/* Header Field Cells - LOWER PRICE and UPPER PRICE */
.form-header .field-cell {
  max-width: 130px;
  width: 130px;
  flex-shrink: 0;
}

/* Header Field Cells - General */
.form-header .field-cell :deep(.n-input__placeholder) {
  font-size: 13px !important;
  text-transform: uppercase !important;
  font-weight: 600 !important;
}

.form-header .field-cell :deep(.n-input__input-el) {
  font-size: 14px !important;
  padding: 6px 8px !important;
  height: 28px !important;
}

.form-header .field-cell :deep(.n-input__suffix) {
  font-size: 11px !important;
  padding: 0 2px !important;
}

/* Header GRIDS input - 4th field-cell (nrOfGrids) - compact */
.form-header .field-cell:nth-of-type(3) {
  max-width: 60px !important;
  width: 40px !important;
  padding: 0 !important;
}

.form-header .field-cell:nth-of-type(3) :deep(.n-input) {
  width: 60px !important;
}

.form-header .field-cell:nth-of-type(3) :deep(.n-input__input-el) {
  font-size: 11px !important;
  padding: 2px 3px !important;
  height: 20px !important;
  line-height: 20px !important;
}

.form-header .field-cell:nth-of-type(3) :deep(.n-input__placeholder) {
  font-size: 9px !important;
}

/* Header AMOUNT input - 5th field-cell (amount) - larger */
.form-header .field-cell:nth-of-type(4) {
  max-width: 100px !important;
  width: 100px !important;
  padding: 0 !important;
}

.form-header .field-cell:nth-of-type(4) :deep(.n-input) {
  width: 150px !important;
}

.form-header .field-cell:nth-of-type(4) :deep(.n-input__input-el) {
  font-size: 11px !important;
  padding: 4px 6px !important;
  height: 24px !important;
  line-height: 24px !important;
}

.form-header .field-cell:nth-of-type(4) :deep(.n-input__placeholder) {
  font-size: 10px !important;
}

.form-header .field-cell:nth-of-type(4) :deep(.n-input__suffix) {
  font-size: 10px !important;
}

/* Buy/Sell Table - 2 columns, 4 rows */
.buy-sell-table {
  width: auto;
  display: inline-table;
  border-collapse: collapse;
  margin-top: 2px;
  table-layout: auto;
}

.buy-sell-table td {
  padding: 1px 2px;
  vertical-align: middle;
}

.buy-cell {
  background: rgba(16, 235, 4, 0.08);
  border: 1px solid rgba(16, 235, 4, 0.3);
  border-radius: 2px;
  text-align: right;
  font-size: 9px;
  color: #10eb04;
  padding: 2px 3px;
}

.sell-cell {
  background: rgba(235, 4, 4, 0.08);
  border: 1px solid rgba(235, 4, 4, 0.3);
  border-radius: 2px;
  text-align: right;
  font-size: 9px;
  color: #eb0404;
  padding: 2px 3px;
}

.buy-cell.header-row {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 3px;
}

.sell-cell.header-row {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 3px;
}

/* BUY Inputs - Green */
.buy-input {
  width: 100%;
  max-width: 55px;
}

.buy-input :deep(.n-input) {
  background: rgba(16, 235, 4, 0.4) !important;
  border-color: rgba(16, 235, 4, 0.6) !important;
}

.buy-input :deep(.n-input__input-el) {
  background: rgba(16, 235, 4, 0.4) !important;
  color: #10eb04 !important;
  font-size: 10px !important;
  padding: 2px 2px !important;
  height: 16px !important;
  line-height: 16px !important;
}

.buy-input :deep(.n-input__placeholder) {
  color: #10eb04 !important;
  font-size: 8px !important;
}

.buy-input :deep(.n-input__suffix) {
  color: #10eb04 !important;
  font-size: 7px !important;
}

/* SELL Inputs - Red */
.sell-input {
  width: 100%;
  max-width: 55px;
}

.sell-input :deep(.n-input) {
  background: rgba(235, 4, 4, 0.4) !important;
  border-color: rgba(235, 4, 4, 0.6) !important;
}

.sell-input :deep(.n-input__input-el) {
  background: rgba(235, 4, 4, 0.4) !important;
  color: #eb0404 !important;
  font-size: 10px !important;
  padding: 2px 2px !important;
  height: 16px !important;
  line-height: 16px !important;
}

.sell-input :deep(.n-input__placeholder) {
  color: #eb0404 !important;
  font-size: 8px !important;
}

.sell-input :deep(.n-input__suffix) {
  color: #eb0404 !important;
  font-size: 7px !important;
}

/* Price Group Inputs - BUY (Green) */
.price-group-input-buy {
  width: 100%;
}

.price-group-input-buy :deep(.n-input) {
  background: rgba(16, 235, 4, 0.35) !important;
  border-color: rgba(16, 235, 4, 0.6) !important;
  width: 100% !important;
}

.price-group-input-buy :deep(.n-input__input-el) {
  background: rgba(16, 235, 4, 0.35) !important;
  color: #10eb04 !important;
  font-size: 13px !important;
  padding: 6px 6px !important;
  height: 32px !important;
  line-height: 32px !important;
}

.price-group-input-buy :deep(.n-input__placeholder) {
  color: #10eb04 !important;
  font-size: 11px !important;
}

.price-group-input-buy :deep(.n-input__suffix) {
  color: #10eb04 !important;
  font-size: 10px !important;
}

/* Price Group Inputs - SELL (Red) */
.price-group-input-sell {
  width: 100%;
}

.price-group-input-sell :deep(.n-input) {
  background: rgba(235, 4, 4, 0.35) !important;
  border-color: rgba(235, 4, 4, 0.6) !important;
  width: 100% !important;
}

.price-group-input-sell :deep(.n-input__input-el) {
  background: rgba(235, 4, 4, 0.35) !important;
  color: #eb0404 !important;
  font-size: 13px !important;
  padding: 6px 6px !important;
  height: 32px !important;
  line-height: 32px !important;
}

.price-group-input-sell :deep(.n-input__placeholder) {
  color: #eb0404 !important;
  font-size: 11px !important;
}

.price-group-input-sell :deep(.n-input__suffix) {
  color: #eb0404 !important;
  font-size: 10px !important;
}

/* Config Sections */
.config-section {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  overflow: hidden;
}

.section-header {
  padding: 6px 8px;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  transition: background 0.2s;
}

.section-header:hover {
  background: #242936;
}

.collapse-icon {
  font-size: 9px;
  color: #666;
}

.section-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Form Rows */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-row label {
  font-size: 9px;
  color: #888;
  font-weight: 600;
}

.checkbox-row {
  padding-top: 4px;
}

/* Price Actions */
.price-actions-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-row-label {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-shadow: 0 0 8px rgba(136, 136, 136, 0.5);
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-row-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

/* Price Row Button Colors - Using Naive UI button types */
/* Lower buttons use type="success" (green) - handled by Naive UI */
/* Upper buttons use type="error" (red) - handled by Naive UI */

/* Quick Actions Row - Grids and Amount on single row */
.quick-actions-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 8px;
}

.quick-actions-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.quick-actions-label {
  font-size: 10px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.quick-buttons-inline {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.quick-buttons-inline :deep(.n-button) {
  flex: 1;
  min-width: 35px;
}

.create-button-section {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.create-button-section :deep(.n-button) {
  min-width: 100px;
}

/* Strategy Buttons */
.strategy-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

/* Create Button */
.create-button-wrapper {
  margin-top: 4px;
}

/* Deep Overrides for Naive UI */
:deep(.n-input) {
  font-size: 10px;
}

:deep(.n-input__input-el) {
  font-size: 10px;
  padding: 4px 6px;
}

:deep(.n-input__suffix) {
  font-size: 9px;
  color: #888;
}

:deep(.n-select) {
  font-size: 10px;
}

:deep(.n-base-selection) {
  font-size: 10px;
}

:deep(.n-base-selection-label) {
  font-size: 10px;
}

:deep(.n-button) {
  font-size: 11px;
  padding: 3px 6px;
  height: auto;
  min-height: 22px;
  max-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.n-button--tiny-type) {
  font-size: 11px;
  padding: 3px 6px;
  min-height: 22px;
  max-width: 48px;
}

/* Button Type Colors */
:deep(.n-button--success-type) {
  background-color: rgba(16, 185, 129, 0.7) !important;
  border-color: rgba(16, 185, 129, 0.8) !important;
  color: #fff !important;
}

:deep(.n-button--success-type:hover) {
  background-color: rgba(16, 185, 129, 0.85) !important;
}

:deep(.n-button--error-type) {
  background-color: rgba(239, 68, 68, 0.7) !important;
  border-color: rgba(239, 68, 68, 0.8) !important;
  color: #fff !important;
}

:deep(.n-button--error-type:hover) {
  background-color: rgba(239, 68, 68, 0.85) !important;
}

:deep(.n-button__content) {
  white-space: nowrap;
}

:deep(.n-checkbox) {
  font-size: 10px;
}

:deep(.n-checkbox__label) {
  font-size: 10px;
}

/* Scrollbar */
.gridbot-form-container::-webkit-scrollbar {
  width: 6px;
}

.gridbot-form-container::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

.gridbot-form-container::-webkit-scrollbar-track {
  background-color: transparent;
}

/* RSI Section Styles */
.rsi-section {
  padding: 6px !important;
}

.rsi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.rsi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.rsi-item:hover {
  transform: scale(1.05);
  border-color: rgba(0, 255, 255, 0.3);
}

.rsi-timeframe {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}

.rsi-value {
  font-size: 11px;
  font-weight: 800;
}

/* RSI Color Classes */
.rsi-item.bullish {
  border-color: rgba(16, 235, 4, 0.6);
  background: rgba(16, 235, 4, 0.15);
}

.rsi-item.bullish .rsi-value {
  color: #10eb04;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.6);
}

.rsi-item.bearish {
  border-color: rgba(233, 10, 21, 0.6);
  background: rgba(233, 10, 21, 0.15);
}

.rsi-item.bearish .rsi-value {
  color: #e90a15;
  text-shadow: 0 0 8px rgba(233, 10, 21, 0.6);
}

.rsi-item.overbought {
  border-color: rgba(255, 107, 0, 0.6);
  background: rgba(255, 107, 0, 0.15);
}

.rsi-item.overbought .rsi-value {
  color: #ff6b00;
  text-shadow: 0 0 8px rgba(255, 107, 0, 0.6);
}

.rsi-item.oversold {
  border-color: rgba(0, 149, 255, 0.6);
  background: rgba(0, 149, 255, 0.15);
}

.rsi-item.oversold .rsi-value {
  color: #0095ff;
  text-shadow: 0 0 8px rgba(0, 149, 255, 0.6);
}

/* Current Price Item */
.price-item.current {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.price-item.current .price-value {
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}
</style>
