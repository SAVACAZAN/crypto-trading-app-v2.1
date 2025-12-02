<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import { NButton, NModal, NDescriptions, NDescriptionsItem, NDivider, NTabs, NTabPane } from "naive-ui";
import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

// API Key selector - MULTIPLE SELECTION
let availableApiKeys = ref([]);
// Watch store for selected API keys from navbar
const selectedApiKeys = computed(() => app.getSelectedApiKeys);
let loadingApiKeys = ref(false);
let apiKeyBalances = ref({});
let apiKeyColors = ref({});  // Colors for each API key
let loadingBalances = ref(false);

// Bot details modal
const showBotDetails = ref(false);
const selectedBot = ref(null);
const isDeletingBot = ref(false);
const isUpdatingStats = ref(false);

function openBotDetails(row) {
  selectedBot.value = row;
  showBotDetails.value = true;
}

// Update grid statistics for selected bot
async function updateBotGridStats() {
  if (!selectedBot.value || !selectedBot.value.rawData) {
    notification.error({
      content: 'No bot selected',
      duration: 3000
    });
    return;
  }

  isUpdatingStats.value = true;

  try {
    const response = await $fetch('/api/v1/updateGridStats', {
      method: 'POST',
      body: {
        botId: selectedBot.value.rawData._id,
        userID: userID.value
      }
    });

    if (response.success) {
      notification.success({
        content: 'Grid statistics updated!',
        meta: `Found ${response.data.totalGridLevels} grid levels with ${response.data.totalFills} total fills`,
        duration: 3000
      });

      // Update the selectedBot with new stats
      selectedBot.value.rawData.gridStats = response.data.gridStats;

      // Refresh the grid bots list
      await fetchOrdersPooling();
    } else {
      notification.error({
        content: 'Failed to update grid stats',
        meta: response.message,
        duration: 3000
      });
    }
  } catch (error) {
    console.error('Error updating grid stats:', error);
    notification.error({
      content: 'Error updating grid stats',
      meta: error.message,
      duration: 3000
    });
  } finally {
    isUpdatingStats.value = false;
  }
}

// Delete bot function
async function deleteBotWithOrders() {
  if (!selectedBot.value || !selectedBot.value.rawData) {
    notification.error({
      content: 'No bot selected',
      duration: 3000
    });
    return;
  }

  const botData = selectedBot.value.rawData;
  const confirmMessage = `Are you sure you want to delete "${selectedBot.value.name}"?\n\nThis will cancel all ${botData.activeOrders?.length || 0} active orders and permanently delete the bot.\n\nThis action cannot be undone.`;

  if (!confirm(confirmMessage)) {
    return;
  }

  isDeletingBot.value = true;

  try {
    // Step 1: Cancel all active orders if any exist
    if (botData.activeOrders && botData.activeOrders.length > 0) {
      notification.info({
        content: `Canceling ${botData.activeOrders.length} active orders...`,
        duration: 3000
      });

      const orderIds = botData.activeOrders.map(order => order.id);

      // Determine which API key to use for cancellation
      let apiKeyName = null;
      if (botData.apiKeyNames && Array.isArray(botData.apiKeyNames) && botData.apiKeyNames.length > 0) {
        apiKeyName = botData.apiKeyNames[0]; // Use first API key
      } else if (botData.apiKeyName) {
        apiKeyName = botData.apiKeyName;
      }

      const cancelResponse = await $fetch('/api/v1/cancelAllOrdersBySymbol', {
        method: 'POST',
        body: {
          userID: userID.value,
          exchange: botData.exchange,
          symbol: botData.symbol,
          apiKeyName: apiKeyName,
          orderIds: orderIds
        }
      });

      console.log('[Delete Bot] Cancel orders response:', cancelResponse);

      if (cancelResponse.successCount > 0) {
        notification.success({
          content: `Canceled ${cancelResponse.successCount} orders`,
          duration: 3000
        });
      }

      if (cancelResponse.failedCount > 0) {
        notification.warning({
          content: `Failed to cancel ${cancelResponse.failedCount} orders`,
          duration: 3000
        });
      }
    }

    // Step 2: Delete the bot from database
    notification.info({
      content: 'Deleting bot from database...',
      duration: 2000
    });

    const deleteResponse = await $fetch('/api/v1/deleteGridBot', {
      method: 'POST',
      body: {
        botId: botData._id,
        userID: userID.value
      }
    });

    console.log('[Delete Bot] Delete response:', deleteResponse);

    if (deleteResponse.success) {
      notification.success({
        content: 'Bot deleted successfully!',
        duration: 3000
      });

      // Close modal
      showBotDetails.value = false;
      selectedBot.value = null;

      // Refresh the grid bots list
      await fetchOrdersPooling();
    } else {
      notification.error({
        content: deleteResponse.message || 'Failed to delete bot',
        duration: 5000
      });
    }
  } catch (error) {
    console.error('[Delete Bot] Error:', error);
    notification.error({
      content: 'Error deleting bot: ' + error.message,
      duration: 5000
    });
  } finally {
    isDeletingBot.value = false;
  }
}

// Columns for active orders in modal
const activeOrdersColumns = [
  { title: "ID", key: "id", width: 200, ellipsis: { tooltip: true } },
  { title: "Side", key: "side", width: 70 },
  { title: "Price", key: "price", width: 100 },
  { title: "Amount", key: "amount", width: 100 },
];

// Columns for filled orders in modal
const filledOrdersColumns = [
  { title: "ID", key: "id", width: 200, ellipsis: { tooltip: true } },
  { title: "Side", key: "side", width: 70 },
  { title: "Price", key: "price", width: 100 },
  { title: "Amount", key: "amount", width: 100 },
];

const gridBotsTablePagination = false;
const gridBotsTableColumns = [
  {
    title: "Name",
    key: "name"
  },
  {
    title: "Symbol",
    key: "symbol",
    render(row) {
      // Generate color based on symbol hash for consistency
      const symbolColors = {
        'LCX/USDC': '#667eea',
        'BTC/USDC': '#f7931a',
        'ETH/USDC': '#627eea',
        'SOL/USDC': '#14f195',
        'AVAX/USDC': '#e84142',
        'MATIC/USDC': '#8247e5',
        'DOT/USDC': '#e6007a',
        'LINK/USDC': '#2a5ada',
        'UNI/USDC': '#ff007a',
        'AAVE/USDC': '#b6509e'
      };

      const color = symbolColors[row.symbol] || '#18a058';

      return h('span', {
        style: `color: ${color}; font-weight: 600; font-size: 12px;`
      }, row.symbol);
    }
  },
  {
    title: "API Keys",
    key: "apiKeys",
    render(row) {
      if (!row.apiKeys || row.apiKeys.length === 0) {
        return h('span', { style: 'color: #888; font-style: italic;' }, '-');
      }

      // Display API keys with colored dots
      return h('div', { style: 'display: flex; flex-direction: column; gap: 2px;' },
        row.apiKeys.map(apiKey => {
          const color = apiKeyColors.value[apiKey] || '#ffffff';
          return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
            h('span', {
              style: `display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};`
            }),
            h('span', { style: `color: ${color}; font-size: 11px; font-weight: 500;` }, apiKey)
          ]);
        })
      );
    }
  },
  {
    title: "Lower Price",
    key: "lowerPrice"
  },
  {
    title: "Upper Price",
    key: "upperPrice"
  },

  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "nr Of Grids",
    key: "nrOfGrids"
  },

  {
    title: "BalanceBot",
    key: "BalanceBot",
    render(row) {
      if (!row.BalanceBot || row.BalanceBot === '-') {
        return h('span', { style: 'color: #888;' }, '-');
      }

      // Parse the BalanceBot string: "Base: 1123.69 ($116.86) | Quote: 0.00 ($0.00)"
      const parts = row.BalanceBot.split('|');
      if (parts.length !== 2) {
        return h('span', { style: 'color: #ddd; font-size: 11px;' }, row.BalanceBot);
      }

      const basePart = parts[0].trim(); // "Base: 1123.69 ($116.86)"
      const quotePart = parts[1].trim(); // "Quote: 0.00 ($0.00)"

      return h('div', { style: 'display: flex; flex-direction: column; gap: 2px; font-size: 11px;' }, [
        h('span', {}, [
          h('span', { style: 'color: #667eea; font-weight: 600;' }, 'Base: '),
          h('span', { style: 'color: #667eea;' }, basePart.replace('Base:', '').trim())
        ]),
        h('span', {}, [
          h('span', { style: 'color: #18a058; font-weight: 600;' }, 'Quote: '),
          h('span', { style: 'color: #18a058;' }, quotePart.replace('Quote:', '').trim())
        ])
      ]);
    }
  },
  {
    title: "Price@Start",
    key: "priceAtCreation",
    width: 100
  },
  {
    title: "Profit ($)",
    key: "Profit",
    render(row) {
      if (!row.Profit || row.Profit === '-') {
        return h('span', { style: 'color: #888;' }, '-');
      }

      const isPositive = row.Profit.startsWith('+');
      const color = isPositive ? '#18a058' : '#d03050';

      return h('span', {
        style: `color: ${color}; font-weight: 600;`
      }, row.Profit);
    }
  },
  {
    title: "Profit %",
    key: "ProfitPercent",
    render(row) {
      if (!row.ProfitPercent || row.ProfitPercent === '-') {
        return h('span', { style: 'color: #888;' }, '-');
      }

      const isPositive = row.ProfitPercent.startsWith('+');
      const color = isPositive ? '#18a058' : '#d03050';

      return h('span', {
        style: `color: ${color}; font-weight: 600;`
      }, row.ProfitPercent);
    }
  },
  {
    title: "Profit/Grid",
    key: "ProfitPerGrid",
    render(row) {
      if (!row.ProfitPerGrid || row.ProfitPerGrid === '-') {
        return h('span', { style: 'color: #888;' }, '-');
      }

      const isPositive = row.ProfitPerGrid.startsWith('+');
      const color = isPositive ? '#18a058' : '#d03050';

      return h('span', {
        style: `color: ${color}; font-weight: 600; font-size: 11px;`
      }, row.ProfitPerGrid);
    }
  },

];
const gridBotsTableData = ref([]);


const openOrdersTablePagination = false;
const openOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "API Key",
    key: "apiKey",
    render(row) {
      if (!row.apiKey) {
        return h('span', { style: 'color: #888; font-style: italic;' }, '-');
      }

      const color = apiKeyColors.value[row.apiKey] || '#ffffff';
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', {
          style: `display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};`
        }),
        h('span', { style: `color: ${color}; font-size: 11px; font-weight: 500;` }, row.apiKey)
      ]);
    }
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side",
    render(row) {
      return h(
        'span',
        {
          style: {
            color: row.side === 'buy' ? '#18a058' : '#d03050',
            fontWeight: 'bold'
          }
        },
        row.side.toUpperCase()
      );
    }
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "Filled",
    key: "filled"
  },
  {
    title: "Remaining",
    key: "remaining"
  },
  {
    title: function(row){
      return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => cancelAllOrders(row)
          },
          { default: () => "Cancel all" }
      );
    },
    key: "actions",
    render(row) {
      return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => cancelOrder(row)
          },
          { default: () => "Cancel Order" }
      );
    }
  },
];
const openOrdersTableData = ref([]);


const closedOrdersTablePagination = false;
const closedOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "API Key",
    key: "apiKey",
    render(row) {
      if (!row.apiKey) {
        return h('span', { style: 'color: #888; font-style: italic;' }, '-');
      }

      const color = apiKeyColors.value[row.apiKey] || '#ffffff';
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', {
          style: `display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};`
        }),
        h('span', { style: `color: ${color}; font-size: 11px; font-weight: 500;` }, row.apiKey)
      ]);
    }
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side",
    render(row) {
      return h(
        'span',
        {
          style: {
            color: row.side === 'buy' ? '#18a058' : '#d03050',
            fontWeight: 'bold'
          }
        },
        row.side.toUpperCase()
      );
    }
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "Filled",
    key: "filled"
  },
  {
    title: "Remaining",
    key: "remaining"
  },
];
const closedOrdersTableData = ref([]);

let orderListInterval = null;

// Watch for changes in selectedApiKeys from store (navbar)
watch(selectedApiKeys, async (newKeys) => {
  if (newKeys && newKeys.length > 0) {
    await fetchBalancesForApiKeys();
    await fetchOrdersPooling();
  }
}, { immediate: true });

onMounted(async () => {
  await loadApiKeys();
  await fetchBalancesForApiKeys();
  orderListInterval = setIntervalAsync(fetchOrdersPooling, 500);
});

onUnmounted(() => {
  if (orderListInterval) {
    try {
      clearIntervalAsync(orderListInterval);
    } catch (error) {
      console.warn('Error clearing interval:', error);
    }
  }
});

async function cancelOrder(row) {
  let data = {
    userID:userID.value,
    exchange: currentExchange.value,
    id:row.id,
    symbol:currentSymbol.value,
  }

  let response = await $fetch( '/api/v1/cancelOrder', {
    method: 'POST',
    body: data
  } );

  let base = row.symbol.split('/')[0];
  let quote = row.symbol.split('/')[1];

  notification['info']({
    content: "Order Cancelled!",
    meta: `Cancelled ${data.exchange} limit ${row.side} order for ${row.amount} ${base} by using ${quote} at price ${row.price}`,
    duration: 2500,
  });
}

async function cancelAllOrders(row) {
  let orders = openOrdersTableData.value;

  for (const order of orders) {
    await cancelOrder(order);
  }
}

// API Keys Loading
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
      // Color palette for API keys
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];

      // Store colors for each API key
      apiKeyColors.value = {};

      availableApiKeys.value = response.data.map((apiKey, index) => {
        const color = colors[index % colors.length];
        apiKeyColors.value[apiKey.name] = color;

        return {
          label: apiKey.name,  // Just the name, no preview
          value: apiKey.name
        };
      });
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

// Custom render function for API key options with colored icons
function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px; flex-shrink: 0;`
    }),
    h('span', { style: `color: ${color}; font-weight: 500;` }, option.label)
  ]);
}

// Fetch balances for all selected API keys
async function fetchBalancesForApiKeys() {
  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) return;

  loadingBalances.value = true;
  const newBalances = {};

  for (const apiKeyName of selectedApiKeys.value) {
    try {
      const response = await $fetch('/api/v1/fetchBalance', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          apiKeyName: apiKeyName
        }
      });

      if (response.success && response.data) {
        newBalances[apiKeyName] = {
          baseFree: response.data.free?.[base] || 0,
          baseUsed: response.data.used?.[base] || 0,
          baseTotal: response.data.total?.[base] || 0,
          quoteFree: response.data.free?.[quote] || 0,
          quoteUsed: response.data.used?.[quote] || 0,
          quoteTotal: response.data.total?.[quote] || 0
        };
      }
    } catch (error) {
      console.error(`Error fetching balance for ${apiKeyName}:`, error);
      newBalances[apiKeyName] = {
        baseFree: 0,
        baseUsed: 0,
        baseTotal: 0,
        quoteFree: 0,
        quoteUsed: 0,
        quoteTotal: 0
      };
    }
  }

  apiKeyBalances.value = newBalances;
  loadingBalances.value = false;
}

// Called when API keys selection changes
async function onApiKeysChange() {
  await fetchBalancesForApiKeys();
  // Reload orders for the newly selected API keys
  await fetchOrdersPooling();
}

// Format number with thousand separators
function formatNumber(value, decimals = 2) {
  const num = Number(value);
  if (isNaN(num)) return '0.00';

  // Format with fixed decimals first
  const fixed = num.toFixed(decimals);

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = fixed.split('.');

  // Add thousand separators to integer part
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine back
  return decimalPart ? `${withSeparators}.${decimalPart}` : withSeparators;
}

async function fetchOrdersPooling() {
  let gridBotsData = [];
  let openOrdersData = [];
  let closedOrdersData = [];

  // Fetch current ticker price for profit calculations
  let currentPrice = 0;
  try {
    const tickerRes = await $fetch('/api/v1/fetchTicker', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
      }
    });
    currentPrice = tickerRes.data?.last || 0;
  } catch (error) {
    console.error('[fetchOrdersPooling] Error fetching ticker:', error);
  }

  //grid bots data
  let gridBotsRes = await $fetch('/api/v1/fetchGridBots', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });

  if (gridBotsRes.data) {
    // Auto-update grid statistics for all bots in background
    for (const bot of gridBotsRes.data) {
      if (bot._id && bot.filledOrders && bot.filledOrders.length > 0) {
        // Update grid stats silently in background
        $fetch('/api/v1/updateGridStats', {
          method: 'POST',
          body: {
            botId: bot._id,
            userID: userID.value
          }
        }).catch(err => {
          console.error('[Auto Grid Stats] Error for bot', bot._id, ':', err);
        });
      }
    }

    for (let i = 0; i < gridBotsRes.data.length; i++) {
      // Extract API keys - prefer apiKeyNames (array), fallback to apiKeyName (single)
      let apiKeys = [];
      if (gridBotsRes.data[i].apiKeyNames && Array.isArray(gridBotsRes.data[i].apiKeyNames)) {
        apiKeys = gridBotsRes.data[i].apiKeyNames;
      } else if (gridBotsRes.data[i].apiKeyName) {
        apiKeys = [gridBotsRes.data[i].apiKeyName];
      }

      // Calculate BalanceBot display string
      const balanceBot = gridBotsRes.data[i].BalanceBot;
      let balanceBotDisplay = '-';
      if (balanceBot) {
        const baseInOrders = parseFloat(balanceBot.BalanceBase || 0).toFixed(2);
        const quoteInOrders = parseFloat(balanceBot.BalanceQuote || 0).toFixed(2);
        const baseInUSD = parseFloat(balanceBot.BalanceBaseInUSD || 0).toFixed(2);
        const quoteInUSD = parseFloat(balanceBot.BalanceQuoteInUSD || 0).toFixed(2);
        balanceBotDisplay = `Base: ${baseInOrders} ($${baseInUSD}) | Quote: ${quoteInOrders} ($${quoteInUSD})`;
      }

      // Calculate Profit based on price change
      // Profit = (Current value in USD) - (Initial value in USD)
      let profitDisplay = '-';
      let profitPercentDisplay = '-';
      let profitPerGridDisplay = '-';

      const botData = gridBotsRes.data[i];
      const priceAtCreation = botData.priceAtCreation || 0;
      const nrOfGrids = botData.nrOfGrids || 1;

      if (balanceBot && priceAtCreation > 0 && currentPrice > 0) {
        // ======= PROFIT CALCULATION - Only for tokens IN BOT =======
        // Base (LCX) currently locked in bot orders
        const baseInBot = parseFloat(balanceBot.BalanceBase || 0);
        // Quote (USDC) currently locked in bot orders
        const quoteInBot = parseFloat(balanceBot.BalanceQuote || 0);

        // Initial value when bot was created (in USD)
        // For SELL bots: all value is in base tokens at creation price
        // For BUY bots: all value is in quote (USDC)
        let initialBotValueUSD = 0;
        if (botData.ordersSide === 'sellOnly') {
          // SELL bot: started with base tokens
          initialBotValueUSD = baseInBot * priceAtCreation;
        } else if (botData.ordersSide === 'buyOnly') {
          // BUY bot: started with quote (USDC)
          initialBotValueUSD = quoteInBot;
        } else {
          // BOTH: combination
          initialBotValueUSD = (baseInBot * priceAtCreation) + quoteInBot;
        }

        // Current value of tokens in bot (in USD)
        const currentBotValueUSD = (baseInBot * currentPrice) + quoteInBot;

        // Calculate profit (difference between current and initial value)
        const profitUSD = currentBotValueUSD - initialBotValueUSD;
        const profitPercent = initialBotValueUSD > 0 ? (profitUSD / initialBotValueUSD) * 100 : 0;

        // Format displays
        const profitSign = profitUSD >= 0 ? '+' : '';
        profitDisplay = `${profitSign}$${profitUSD.toFixed(2)}`;
        profitPercentDisplay = `${profitSign}${profitPercent.toFixed(2)}%`;

        // ======= PROFIT PER GRID =======
        const profitPerGrid = profitUSD / nrOfGrids;
        const profitPerGridSign = profitPerGrid >= 0 ? '+' : '';
        profitPerGridDisplay = `${profitPerGridSign}$${profitPerGrid.toFixed(2)}`;
      }

      gridBotsData.push({
        id: gridBotsRes.data[i].id,
        name: gridBotsRes.data[i].name,
        symbol: gridBotsRes.data[i].symbol,
        exchange: gridBotsRes.data[i].exchange,
        apiKeys: apiKeys,  // Add API keys array
        lowerPrice: gridBotsRes.data[i].lowerPrice,
        upperPrice: gridBotsRes.data[i].upperPrice,
        amountType: gridBotsRes.data[i].amountType,
        amount: gridBotsRes.data[i].amount,
        nrOfGrids: gridBotsRes.data[i].nrOfGrids,
        ordersSide: gridBotsRes.data[i].ordersSide,
        incrementalPercentAmountBuy: gridBotsRes.data[i].incrementalPercentAmountBuy,
        incrementalPercentAmountSell: gridBotsRes.data[i].incrementalPercentAmountSell,
        deviationPriceBuy: gridBotsRes.data[i].deviationPriceBuy,
        deviationPriceSell: gridBotsRes.data[i].deviationPriceSell,
        deviationAmountBuy: gridBotsRes.data[i].deviationPriceBuy,
        deviationAmountSell: gridBotsRes.data[i].deviationAmountSell,
        usePriceGroup: gridBotsRes.data[i].usePriceGroup,
        BalanceBot: balanceBotDisplay,
        priceAtCreation: priceAtCreation ? priceAtCreation.toFixed(4) : '-',
        Profit: profitDisplay,
        ProfitPercent: profitPercentDisplay,
        ProfitPerGrid: profitPerGridDisplay,
        rawData: gridBotsRes.data[i]  // Store complete raw data for modal
      })
    }

    console.log(gridBotsData);

    gridBotsTableData.value = gridBotsData;
  }

  // ❌ REMOVED: Open Orders and Closed Orders fetching to avoid LCX rate limits
  // Users can view orders in the dedicated Open Orders / Closed Orders tabs in cryptoapp page
  console.log('📊 Grid Bots List: Skipping Open/Closed Orders fetch to avoid rate limits');
}

</script>

<template>
  <!-- Grid Bots Table Only -->
  <div class="gridbots-list-container">
    <n-tabs type="segment" animated size="small" class="gridbots-tabs">
      <n-tab-pane name="Grid Bots" tab="Active Bots">
        <!-- Balance Display - DISABLED (balance shown in global navbar) -->
        <!-- <div class="balance-header" v-if="selectedApiKeys.length > 0">
          <div class="balance-cards">
            <div
              v-for="apiKeyName in selectedApiKeys"
              :key="apiKeyName"
              class="balance-card"
              :style="{ borderLeftColor: apiKeyColors[apiKeyName] || '#666' }"
            >
              <div class="balance-card-header">
                <span
                  class="api-indicator"
                  :style="{ background: apiKeyColors[apiKeyName] || '#666' }"
                ></span>
                <span class="api-name">{{ apiKeyName }}</span>
              </div>
              <div class="balance-row">
                <div class="balance-item">
                  <span class="balance-label">{{ base }}</span>
                  <div class="balance-grid">
                    <div class="balance-line">
                      <span class="balance-type">Free:</span>
                      <span class="balance-free">{{ formatNumber(apiKeyBalances[apiKeyName]?.baseFree || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Used:</span>
                      <span class="balance-used">{{ formatNumber(apiKeyBalances[apiKeyName]?.baseUsed || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Total:</span>
                      <span class="balance-total">{{ formatNumber(apiKeyBalances[apiKeyName]?.baseTotal || 0, 2) }}</span>
                    </div>
                  </div>
                </div>
                <div class="balance-item">
                  <span class="balance-label">{{ quote }}</span>
                  <div class="balance-grid">
                    <div class="balance-line">
                      <span class="balance-type">Free:</span>
                      <span class="balance-free">{{ formatNumber(apiKeyBalances[apiKeyName]?.quoteFree || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Used:</span>
                      <span class="balance-used">{{ formatNumber(apiKeyBalances[apiKeyName]?.quoteUsed || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Total:</span>
                      <span class="balance-total">{{ formatNumber(apiKeyBalances[apiKeyName]?.quoteTotal || 0, 2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> -->

        <div class="table-wrapper">
          <n-data-table
            :columns="gridBotsTableColumns"
            :data="gridBotsTableData"
            :pagination="gridBotsTablePagination"
            :max-height="500"
            size="small"
            :bordered="false"
            striped
            :row-props="(row) => ({
              style: 'cursor: pointer;',
              onClick: () => openBotDetails(row)
            })"
          />
        </div>

        <!-- Bot Details Modal - Compact & Colorful -->
        <n-modal
          v-model:show="showBotDetails"
          preset="card"
          title="Bot Details"
          :style="{ width: '900px', maxWidth: '95vw' }"
          :segmented="{ content: 'soft', footer: 'soft' }"
        >
          <div v-if="selectedBot" class="bot-details-compact">
            <!-- Header with Bot Name and Profit -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px;">
              <div>
                <div style="font-size: 18px; font-weight: 600; color: #18a058;">{{ selectedBot.name }}</div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">{{ selectedBot.symbol }} · {{ selectedBot.exchange || 'coinbaseadvanced' }}</div>
              </div>
              <div v-if="selectedBot.Profit && selectedBot.Profit !== '-'" style="text-align: right;">
                <div :style="{ fontSize: '24px', fontWeight: '700', color: selectedBot.Profit.startsWith('+') ? '#18a058' : '#d03050' }">
                  {{ selectedBot.Profit }}
                </div>
                <div :style="{ fontSize: '14px', fontWeight: '600', color: selectedBot.ProfitPercent.startsWith('+') ? '#18a058' : '#d03050' }">
                  {{ selectedBot.ProfitPercent }}
                </div>
              </div>
            </div>

            <!-- Profit Details Section -->
            <div v-if="selectedBot.Profit && selectedBot.Profit !== '-'" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <!-- Total Profit -->
              <div style="padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; text-align: center;">
                <div style="font-size: 10px; color: #888; margin-bottom: 6px;">TOTAL PROFIT</div>
                <div :style="{ fontSize: '18px', fontWeight: '700', color: selectedBot.Profit.startsWith('+') ? '#18a058' : '#d03050' }">
                  {{ selectedBot.Profit }}
                </div>
              </div>

              <!-- Profit % -->
              <div style="padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; text-align: center;">
                <div style="font-size: 10px; color: #888; margin-bottom: 6px;">PROFIT %</div>
                <div :style="{ fontSize: '18px', fontWeight: '700', color: selectedBot.ProfitPercent.startsWith('+') ? '#18a058' : '#d03050' }">
                  {{ selectedBot.ProfitPercent }}
                </div>
              </div>

              <!-- Profit Per Grid -->
              <div style="padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; text-align: center;">
                <div style="font-size: 10px; color: #888; margin-bottom: 6px;">PROFIT PER GRID</div>
                <div :style="{ fontSize: '18px', fontWeight: '700', color: selectedBot.ProfitPerGrid.startsWith('+') ? '#18a058' : '#d03050' }">
                  {{ selectedBot.ProfitPerGrid }}
                </div>
              </div>
            </div>

            <!-- Grid Container for Compact Layout -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <!-- Grid Config -->
              <div style="padding: 10px; background: rgba(24, 160, 88, 0.1); border-left: 3px solid #18a058; border-radius: 4px;">
                <div style="font-size: 11px; color: #18a058; font-weight: 600; margin-bottom: 6px;">GRID CONFIG</div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;"><span style="color: #888;">Lower:</span> {{ selectedBot.lowerPrice }}</div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;"><span style="color: #888;">Upper:</span> {{ selectedBot.upperPrice }}</div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;"><span style="color: #888;">Grids:</span> {{ selectedBot.nrOfGrids }}</div>
                <div style="font-size: 11px; color: #ddd;"><span style="color: #888;">Side:</span> {{ selectedBot.ordersSide || 'buyOrSell' }}</div>
              </div>

              <!-- Balance Info -->
              <div style="padding: 10px; background: rgba(240, 163, 35, 0.1); border-left: 3px solid #f0a323; border-radius: 4px;">
                <div style="font-size: 11px; color: #f0a323; font-weight: 600; margin-bottom: 6px;">BALANCE IN BOT</div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;">
                  <span style="color: #888;">Base:</span> {{ selectedBot.rawData?.BalanceBot?.BalanceBase || '0' }} LCX
                </div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;">
                  <span style="color: #888;">Quote:</span> {{ selectedBot.rawData?.BalanceBot?.BalanceQuote || '0' }} USDC
                </div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;">
                  <span style="color: #888;">Base USD:</span> ${{ selectedBot.rawData?.BalanceBot?.BalanceBaseInUSD || '0' }}
                </div>
                <div style="font-size: 11px; color: #ddd;">
                  <span style="color: #888;">Quote USD:</span> ${{ selectedBot.rawData?.BalanceBot?.BalanceQuoteInUSD || '0' }}
                </div>
              </div>

              <!-- Price & API Keys -->
              <div style="padding: 10px; background: rgba(94, 138, 242, 0.1); border-left: 3px solid #5e8af2; border-radius: 4px;">
                <div style="font-size: 11px; color: #5e8af2; font-weight: 600; margin-bottom: 6px;">CREATION INFO</div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 3px;">
                  <span style="color: #888;">Price:</span> {{ selectedBot.rawData?.priceAtCreation?.toFixed(4) || '-' }}
                </div>
                <div style="font-size: 11px; color: #ddd; margin-bottom: 6px;">
                  <span style="color: #888;">RSI 1h:</span> {{ selectedBot.rawData?.rsiAtCreation?.['1h']?.toFixed(2) || '-' }}
                </div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">API Keys:</div>
                <div v-for="apiKey in selectedBot.apiKeys" :key="apiKey"
                     :style="{ color: apiKeyColors[apiKey] || '#ffffff', fontSize: '10px', fontWeight: '500' }">
                  {{ apiKey }}
                </div>
              </div>
            </div>

            <!-- Tabs for Profit Analysis -->
            <n-tabs type="line" animated size="small" style="margin-bottom: 12px;">
              <!-- Tab 1: Possible Profit -->
              <n-tab-pane name="possible-profit" tab="💰 Possible Profit">
                <div style="padding: 10px; background: rgba(10, 235, 4, 0.1); border-left: 3px solid #10eb04; border-radius: 4px;">
                  <div v-if="selectedBot.lowerPrice && selectedBot.upperPrice && selectedBot.rawData?.BalanceBot">
                    <!-- SELL ONLY Display -->
                    <div v-if="(selectedBot.ordersSide || 'buyOrSell') === 'sellOnly'">
                      <div style="font-size: 11px; color: #10eb04; font-weight: 600; margin-bottom: 8px;">
                        📊 SELL-ONLY BOT: Selling {{ parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0).toFixed(2) }} tokens
                      </div>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Tokens to Sell:</div>
                          <div style="font-size: 14px; color: #ddd; font-weight: 600;">
                            {{ parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0).toFixed(2) }} LCX
                          </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Average Sell Price:</div>
                          <div style="font-size: 14px; color: #10eb04; font-weight: 700;">
                            ${{ ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2).toFixed(4) }}
                          </div>
                        </div>

                        <div style="background: rgba(16, 235, 4, 0.2); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Total USD Received (if all grids fill):</div>
                          <div style="font-size: 18px; color: #10eb04; font-weight: 900;">
                            ${{ (parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0) * ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2)).toFixed(2) }}
                          </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Current Value:</div>
                          <div style="font-size: 14px; color: #ddd; font-weight: 600;">
                            ${{ parseFloat(selectedBot.rawData.BalanceBot.BalanceBaseInUSD || 0).toFixed(2) }}
                          </div>
                        </div>
                      </div>

                      <div style="background: rgba(16, 235, 4, 0.15); padding: 10px; border-radius: 4px; margin-top: 10px;">
                        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Estimated Profit (vs current price):</div>
                        <div style="font-size: 20px; color: #10eb04; font-weight: 900;">
                          +${{ ((parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0) * ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2)) - parseFloat(selectedBot.rawData.BalanceBot.BalanceBaseInUSD || 0)).toFixed(2) }}
                        </div>
                        <div style="font-size: 12px; color: #10eb04; font-weight: 600;">
                          +{{ (((parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0) * ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2)) - parseFloat(selectedBot.rawData.BalanceBot.BalanceBaseInUSD || 0)) / parseFloat(selectedBot.rawData.BalanceBot.BalanceBaseInUSD || 1) * 100).toFixed(2) }}%
                        </div>
                      </div>
                    </div>

                    <!-- BUY ONLY Display -->
                    <div v-else-if="(selectedBot.ordersSide || 'buyOrSell') === 'buyOnly'">
                      <div style="font-size: 11px; color: #10eb04; font-weight: 600; margin-bottom: 8px;">
                        📊 BUY-ONLY BOT: Buying with ${{ parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0).toFixed(2) }}
                      </div>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">USD to Invest:</div>
                          <div style="font-size: 14px; color: #ddd; font-weight: 600;">
                            ${{ parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0).toFixed(2) }}
                          </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Average Buy Price:</div>
                          <div style="font-size: 14px; color: #10eb04; font-weight: 700;">
                            ${{ ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2).toFixed(4) }}
                          </div>
                        </div>

                        <div style="background: rgba(16, 235, 4, 0.2); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Tokens Acquired (if all grids fill):</div>
                          <div style="font-size: 18px; color: #10eb04; font-weight: 900;">
                            {{ (parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0) / ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2)).toFixed(2) }} LCX
                          </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Value at Upper Price (${{ parseFloat(selectedBot.upperPrice).toFixed(4) }}):</div>
                          <div style="font-size: 14px; color: #ddd; font-weight: 600;">
                            ${{ ((parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0) / ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2)) * parseFloat(selectedBot.upperPrice)).toFixed(2) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- BUY & SELL Display -->
                    <div v-else>
                      <div style="font-size: 11px; color: #10eb04; font-weight: 600; margin-bottom: 8px;">
                        📊 NEUTRAL GRID: Buy low, sell high (full cycle profit)
                      </div>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <!-- Total tokens in grid -->
                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Total Tokens in Grid:</div>
                          <div style="font-size: 14px; color: #ddd; font-weight: 600;">
                            {{ (parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0) + (parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0) / ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2))).toFixed(2) }} LCX
                          </div>
                        </div>

                        <!-- Grid spread -->
                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Grid Spread:</div>
                          <div style="font-size: 14px; color: #10eb04; font-weight: 700;">
                            ${{ ((parseFloat(selectedBot.upperPrice) - parseFloat(selectedBot.lowerPrice)) / parseInt(selectedBot.nrOfGrids)).toFixed(4) }}
                            ({{ (((parseFloat(selectedBot.upperPrice) - parseFloat(selectedBot.lowerPrice)) / parseInt(selectedBot.nrOfGrids)) / parseFloat(selectedBot.lowerPrice) * 100).toFixed(2) }}%)
                          </div>
                        </div>

                        <!-- Profit per cycle if price moves from lower to upper and back -->
                        <div style="background: rgba(16, 235, 4, 0.2); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Profit per Full Cycle (lower→upper→lower):</div>
                          <div style="font-size: 18px; color: #10eb04; font-weight: 900;">
                            {{
                              (() => {
                                const lower = parseFloat(selectedBot.lowerPrice);
                                const upper = parseFloat(selectedBot.upperPrice);
                                const grids = parseInt(selectedBot.nrOfGrids);
                                const baseTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                const quoteBalance = parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0);

                                // Total tokens = base + quote converted at avg price
                                const avgPrice = (lower + upper) / 2;
                                const totalTokens = baseTokens + (quoteBalance / avgPrice);

                                // Profit = total tokens * (upper - lower) / 2 (average profit per cycle)
                                // Simplified: each token gains spread on average
                                const gridSpread = (upper - lower) / grids;
                                const profitPerToken = gridSpread * grids / 2; // Half cycle profit
                                const totalProfit = totalTokens * profitPerToken;

                                return `$${totalProfit.toFixed(2)}`;
                              })()
                            }}
                          </div>
                        </div>

                        <!-- Current total value -->
                        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                          <div style="font-size: 9px; color: #888;">Current Total Value:</div>
                          <div style="font-size: 14px; color: #ddd; font-weight: 600;">
                            ${{ (parseFloat(selectedBot.rawData.BalanceBot.BalanceBaseInUSD || 0) + parseFloat(selectedBot.rawData.BalanceBot.BalanceQuoteInUSD || 0)).toFixed(2) }}
                          </div>
                        </div>
                      </div>

                      <div style="background: rgba(16, 235, 4, 0.15); padding: 10px; border-radius: 4px; margin-top: 10px;">
                        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">ROI per Full Cycle:</div>
                        <div style="font-size: 20px; color: #10eb04; font-weight: 900;">
                          {{
                            (() => {
                              const lower = parseFloat(selectedBot.lowerPrice);
                              const upper = parseFloat(selectedBot.upperPrice);
                              const grids = parseInt(selectedBot.nrOfGrids);
                              const baseTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                              const quoteBalance = parseFloat(selectedBot.rawData.BalanceBot.BalanceQuote || 0);
                              const totalValue = parseFloat(selectedBot.rawData.BalanceBot.BalanceBaseInUSD || 0) + parseFloat(selectedBot.rawData.BalanceBot.BalanceQuoteInUSD || 0);

                              const avgPrice = (lower + upper) / 2;
                              const totalTokens = baseTokens + (quoteBalance / avgPrice);
                              const gridSpread = (upper - lower) / grids;
                              const profitPerToken = gridSpread * grids / 2;
                              const totalProfit = totalTokens * profitPerToken;
                              const roi = (totalProfit / totalValue) * 100;

                              return `+${roi.toFixed(2)}%`;
                            })()
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </n-tab-pane>

              <!-- Tab 2: Profit with Deviation -->
              <n-tab-pane
                v-if="selectedBot.rawData?.config && (selectedBot.rawData.config.deviationPriceBuy || selectedBot.rawData.config.deviationPriceSell || selectedBot.rawData.config.deviationAmountBuy || selectedBot.rawData.config.deviationAmountSell)"
                name="profit-deviation"
                tab="💹 Profit + Deviation"
              >
                <div style="padding: 10px; background: rgba(255, 165, 0, 0.1); border-left: 3px solid #ffa500; border-radius: 4px;">
                  <div v-if="selectedBot.lowerPrice && selectedBot.upperPrice && selectedBot.rawData?.BalanceBot">
                    <div style="font-size: 11px; color: #ffa500; font-weight: 600; margin-bottom: 8px;">
                      📈 PROFIT SIMULATION WITH DEVIATION (all grids executed)
                    </div>

                    <!-- Show deviation settings -->
                    <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                      <div style="font-size: 10px; color: #888; margin-bottom: 6px;">DEVIATION SETTINGS:</div>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
                        <div v-if="selectedBot.rawData.config.deviationPriceBuy">
                          <span style="color: #888;">Price Dev (BUY):</span>
                          <span style="color: #18a058; font-weight: 600; margin-left: 4px;">{{ selectedBot.rawData.config.deviationPriceBuy }}%</span>
                        </div>
                        <div v-if="selectedBot.rawData.config.deviationPriceSell">
                          <span style="color: #888;">Price Dev (SELL):</span>
                          <span style="color: #d03050; font-weight: 600; margin-left: 4px;">{{ selectedBot.rawData.config.deviationPriceSell }}%</span>
                        </div>
                        <div v-if="selectedBot.rawData.config.deviationAmountBuy">
                          <span style="color: #888;">Amount Dev (BUY):</span>
                          <span style="color: #18a058; font-weight: 600; margin-left: 4px;">{{ selectedBot.rawData.config.deviationAmountBuy }}%</span>
                        </div>
                        <div v-if="selectedBot.rawData.config.deviationAmountSell">
                          <span style="color: #888;">Amount Dev (SELL):</span>
                          <span style="color: #d03050; font-weight: 600; margin-left: 4px;">{{ selectedBot.rawData.config.deviationAmountSell }}%</span>
                        </div>
                      </div>
                    </div>

                    <!-- Full cycle simulation -->
                    <div style="font-size: 10px; color: #ffa500; font-weight: 600; margin-bottom: 8px;">
                      🔄 FULL CYCLE: SELL → BUY → SELL (with deviation)
                    </div>

                    <!-- Cycle steps -->
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;">
                      <!-- Step 1 -->
                      <div style="padding: 6px; background: rgba(208, 48, 80, 0.1); border-left: 2px solid #d03050; border-radius: 3px;">
                        <div style="font-size: 9px; color: #d03050; font-weight: 600;">STEP 1: SELL initial tokens</div>
                        <div style="font-size: 9px; color: #ddd;">
                          {{ parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0).toFixed(2) }} LCX × ${{ ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2).toFixed(4) }}
                          = ${{ (parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0) * ((parseFloat(selectedBot.lowerPrice) + parseFloat(selectedBot.upperPrice)) / 2)).toFixed(2) }}
                        </div>
                      </div>

                      <!-- Step 2 -->
                      <div style="padding: 6px; background: rgba(24, 160, 88, 0.1); border-left: 2px solid #18a058; border-radius: 3px;">
                        <div style="font-size: 9px; color: #18a058; font-weight: 600;">
                          STEP 2: BUY back ({{ selectedBot.rawData.config?.deviationPriceBuy || 0 }}% lower, +{{ selectedBot.rawData.config?.deviationAmountBuy || 0 }}% more)
                        </div>
                        <div style="font-size: 9px; color: #ddd;">
                          {{
                            (() => {
                              const lower = parseFloat(selectedBot.lowerPrice);
                              const upper = parseFloat(selectedBot.upperPrice);
                              const baseTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                              const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                              const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);

                              const avgPrice = (lower + upper) / 2;
                              const usd = baseTokens * avgPrice;
                              const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                              const tokensAfterBuy = (usd / buyPrice) * (1 + devAmountBuy / 100);

                              return `$${usd.toFixed(2)} ÷ $${buyPrice.toFixed(4)} × ${(1 + devAmountBuy/100).toFixed(3)} = ${tokensAfterBuy.toFixed(2)} LCX (+${(tokensAfterBuy - baseTokens).toFixed(2)})`;
                            })()
                          }}
                        </div>
                      </div>

                      <!-- Step 3 -->
                      <div style="padding: 6px; background: rgba(255, 165, 0, 0.1); border-left: 2px solid #ffa500; border-radius: 3px;">
                        <div style="font-size: 9px; color: #ffa500; font-weight: 600;">
                          STEP 3: SELL again (+{{ selectedBot.rawData.config?.deviationPriceSell || 0 }}% higher, +{{ selectedBot.rawData.config?.deviationAmountSell || 0 }}% more)
                        </div>
                        <div style="font-size: 9px; color: #ddd;">
                          {{
                            (() => {
                              const lower = parseFloat(selectedBot.lowerPrice);
                              const upper = parseFloat(selectedBot.upperPrice);
                              const baseTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                              const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                              const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                              const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                              const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                              const avgPrice = (lower + upper) / 2;
                              const usd = baseTokens * avgPrice;
                              const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                              const tokensAfterBuy = (usd / buyPrice) * (1 + devAmountBuy / 100);

                              const sellPrice = avgPrice * (1 + devPriceSell / 100);
                              const tokensToSell = tokensAfterBuy * (1 + devAmountSell / 100);
                              const usdFromSell = tokensToSell * sellPrice;

                              return `${tokensToSell.toFixed(2)} LCX × $${sellPrice.toFixed(4)} = $${usdFromSell.toFixed(2)}`;
                            })()
                          }}
                        </div>
                      </div>
                    </div>

                    <!-- Final profit -->
                    <div style="background: rgba(16, 235, 4, 0.15); padding: 10px; border-radius: 4px;">
                      <div style="font-size: 9px; color: #888; margin-bottom: 4px;">NET PROFIT AFTER 1 FULL CYCLE:</div>
                      <div style="font-size: 20px; color: #10eb04; font-weight: 900;">
                        {{
                          (() => {
                            const lower = parseFloat(selectedBot.lowerPrice);
                            const upper = parseFloat(selectedBot.upperPrice);
                            const baseTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                            const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                            const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                            const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                            const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                            const avgPrice = (lower + upper) / 2;
                            const initialUSD = baseTokens * avgPrice;

                            const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                            const tokensAfterBuy = (initialUSD / buyPrice) * (1 + devAmountBuy / 100);

                            const sellPrice = avgPrice * (1 + devPriceSell / 100);
                            const tokensToSell = tokensAfterBuy * (1 + devAmountSell / 100);
                            const finalUSD = tokensToSell * sellPrice;

                            const profit = finalUSD - initialUSD;
                            const profitPercent = (profit / initialUSD) * 100;

                            return `+$${profit.toFixed(2)} (+${profitPercent.toFixed(2)}%)`;
                          })()
                        }}
                      </div>
                      <div style="font-size: 10px; color: #10eb04; margin-top: 4px;">
                        {{
                          (() => {
                            const lower = parseFloat(selectedBot.lowerPrice);
                            const upper = parseFloat(selectedBot.upperPrice);
                            const baseTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                            const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                            const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);

                            const avgPrice = (lower + upper) / 2;
                            const initialUSD = baseTokens * avgPrice;
                            const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                            const tokensAfterBuy = (initialUSD / buyPrice) * (1 + devAmountBuy / 100);

                            return `Token increase: +${(tokensAfterBuy - baseTokens).toFixed(2)} LCX (+${((tokensAfterBuy - baseTokens) / baseTokens * 100).toFixed(2)}%)`;
                          })()
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </n-tab-pane>

              <!-- Tab 3: Multi-Cycle Profit Projection -->
              <n-tab-pane
                v-if="selectedBot.rawData?.config && (selectedBot.rawData.config.deviationPriceBuy || selectedBot.rawData.config.deviationPriceSell)"
                name="multi-cycle"
                tab="📈 Multi-Cycle Profit"
              >
                <div style="padding: 10px; background: rgba(94, 138, 242, 0.1); border-left: 3px solid #5e8af2; border-radius: 4px;">
                  <div style="font-size: 11px; color: #5e8af2; font-weight: 600; margin-bottom: 8px;">
                    🔁 PROFIT PROJECTION FOR MULTIPLE CYCLES
                  </div>

                  <div v-if="selectedBot.lowerPrice && selectedBot.upperPrice && selectedBot.rawData?.BalanceBot">
                    <!-- Projection table -->
                    <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                      <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                        <thead>
                          <tr style="border-bottom: 1px solid #444;">
                            <th style="padding: 6px; text-align: left; color: #888;">Cycles</th>
                            <th style="padding: 6px; text-align: right; color: #888;">Tokens</th>
                            <th style="padding: 6px; text-align: right; color: #888;">USD Value</th>
                            <th style="padding: 6px; text-align: right; color: #888;">Total Profit</th>
                            <th style="padding: 6px; text-align: right; color: #888;">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {{
                            (() => {
                              const lower = parseFloat(selectedBot.lowerPrice);
                              const upper = parseFloat(selectedBot.upperPrice);
                              const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                              const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                              const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                              const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                              const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                              const avgPrice = (lower + upper) / 2;
                              const initialUSD = initialTokens * avgPrice;

                              // Calculate multipliers per cycle
                              const buyPriceMultiplier = 1 - devPriceBuy / 100;
                              const sellPriceMultiplier = 1 + devPriceSell / 100;
                              const buyAmountMultiplier = 1 + devAmountBuy / 100;
                              const sellAmountMultiplier = 1 + devAmountSell / 100;

                              // Per cycle: tokens grow by this factor
                              const tokenGrowthPerCycle = (buyAmountMultiplier * sellAmountMultiplier) / buyPriceMultiplier;

                              // Per cycle: USD grows by this factor
                              const usdGrowthPerCycle = sellPriceMultiplier * buyAmountMultiplier * sellAmountMultiplier;

                              return ''; // Will render rows below
                            })()
                          }}

                          <!-- 1 Cycle -->
                          <tr style="background: rgba(255,255,255,0.02);">
                            <td style="padding: 6px; color: #ddd; font-weight: 600;">1</td>
                            <td style="padding: 6px; text-align: right; color: #ddd;">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                                  const tokensAfter1 = (initialUSD / buyPrice) * (1 + devAmountBuy / 100) * (1 + devAmountSell / 100);

                                  return tokensAfter1.toFixed(2);
                                })()
                              }}
                            </td>
                            <td style="padding: 6px; text-align: right; color: #ddd;">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                                  const tokensAfterBuy = (initialUSD / buyPrice) * (1 + devAmountBuy / 100);
                                  const sellPrice = avgPrice * (1 + devPriceSell / 100);
                                  const tokensToSell = tokensAfterBuy * (1 + devAmountSell / 100);
                                  const finalUSD = tokensToSell * sellPrice;

                                  return `$${finalUSD.toFixed(2)}`;
                                })()
                              }}
                            </td>
                            <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                                  const tokensAfterBuy = (initialUSD / buyPrice) * (1 + devAmountBuy / 100);
                                  const sellPrice = avgPrice * (1 + devPriceSell / 100);
                                  const tokensToSell = tokensAfterBuy * (1 + devAmountSell / 100);
                                  const finalUSD = tokensToSell * sellPrice;
                                  const profit = finalUSD - initialUSD;

                                  return `+$${profit.toFixed(2)}`;
                                })()
                              }}
                            </td>
                            <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const buyPrice = avgPrice * (1 - devPriceBuy / 100);
                                  const tokensAfterBuy = (initialUSD / buyPrice) * (1 + devAmountBuy / 100);
                                  const sellPrice = avgPrice * (1 + devPriceSell / 100);
                                  const tokensToSell = tokensAfterBuy * (1 + devAmountSell / 100);
                                  const finalUSD = tokensToSell * sellPrice;
                                  const roi = ((finalUSD - initialUSD) / initialUSD) * 100;

                                  return `+${roi.toFixed(2)}%`;
                                })()
                              }}
                            </td>
                          </tr>

                          <!-- 10, 50, 100, 365 cycles using compound growth -->
                          <tr v-for="cycles in [10, 50, 100, 365]" :key="cycles" :style="{ background: cycles === 365 ? 'rgba(16, 235, 4, 0.1)' : 'rgba(255,255,255,0.02)' }">
                            <td style="padding: 6px; color: #ddd; font-weight: 600;">{{ cycles }}</td>
                            <td style="padding: 6px; text-align: right; color: #ddd;">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const buyPrice = avgPrice * (1 - devPriceBuy / 100);

                                  // Token growth per cycle
                                  const tokenGrowth = ((1 + devAmountBuy / 100) * (1 + devAmountSell / 100)) / (1 - devPriceBuy / 100);
                                  const finalTokens = (initialUSD / buyPrice) * Math.pow(tokenGrowth, cycles);

                                  return finalTokens.toFixed(2);
                                })()
                              }}
                            </td>
                            <td style="padding: 6px; text-align: right; color: #ddd;">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;

                                  // USD growth per cycle
                                  const usdGrowth = (1 + devPriceSell / 100) * (1 + devAmountBuy / 100) * (1 + devAmountSell / 100);
                                  const finalUSD = initialUSD * Math.pow(usdGrowth, cycles);

                                  return `$${finalUSD.toFixed(2)}`;
                                })()
                              }}
                            </td>
                            <td :style="{ padding: '6px', textAlign: 'right', color: cycles === 365 ? '#10eb04' : '#18a058', fontWeight: cycles === 365 ? '700' : '600' }">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const usdGrowth = (1 + devPriceSell / 100) * (1 + devAmountBuy / 100) * (1 + devAmountSell / 100);
                                  const finalUSD = initialUSD * Math.pow(usdGrowth, cycles);
                                  const profit = finalUSD - initialUSD;

                                  return `+$${profit.toFixed(2)}`;
                                })()
                              }}
                            </td>
                            <td :style="{ padding: '6px', textAlign: 'right', color: cycles === 365 ? '#10eb04' : '#18a058', fontWeight: cycles === 365 ? '700' : '600' }">
                              {{
                                (() => {
                                  const lower = parseFloat(selectedBot.lowerPrice);
                                  const upper = parseFloat(selectedBot.upperPrice);
                                  const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                  const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                  const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                  const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                  const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                  const avgPrice = (lower + upper) / 2;
                                  const initialUSD = initialTokens * avgPrice;
                                  const usdGrowth = (1 + devPriceSell / 100) * (1 + devAmountBuy / 100) * (1 + devAmountSell / 100);
                                  const finalUSD = initialUSD * Math.pow(usdGrowth, cycles);
                                  const roi = ((finalUSD - initialUSD) / initialUSD) * 100;

                                  return `+${roi.toFixed(2)}%`;
                                })()
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Summary -->
                    <div style="background: rgba(16, 235, 4, 0.1); padding: 10px; border-radius: 4px;">
                      <div style="font-size: 9px; color: #888; margin-bottom: 6px;">💡 AFTER 1 YEAR (365 cycles):</div>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                          <div style="font-size: 10px; color: #888;">Total Profit:</div>
                          <div style="font-size: 18px; color: #10eb04; font-weight: 900;">
                            {{
                              (() => {
                                const lower = parseFloat(selectedBot.lowerPrice);
                                const upper = parseFloat(selectedBot.upperPrice);
                                const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                const avgPrice = (lower + upper) / 2;
                                const initialUSD = initialTokens * avgPrice;
                                const usdGrowth = (1 + devPriceSell / 100) * (1 + devAmountBuy / 100) * (1 + devAmountSell / 100);
                                const finalUSD = initialUSD * Math.pow(usdGrowth, 365);
                                const profit = finalUSD - initialUSD;

                                return `+$${profit.toFixed(2)}`;
                              })()
                            }}
                          </div>
                        </div>
                        <div>
                          <div style="font-size: 10px; color: #888;">ROI:</div>
                          <div style="font-size: 18px; color: #10eb04; font-weight: 900;">
                            {{
                              (() => {
                                const lower = parseFloat(selectedBot.lowerPrice);
                                const upper = parseFloat(selectedBot.upperPrice);
                                const initialTokens = parseFloat(selectedBot.rawData.BalanceBot.BalanceBase || 0);
                                const devPriceBuy = parseFloat(selectedBot.rawData.config?.deviationPriceBuy || 0);
                                const devPriceSell = parseFloat(selectedBot.rawData.config?.deviationPriceSell || 0);
                                const devAmountBuy = parseFloat(selectedBot.rawData.config?.deviationAmountBuy || 0);
                                const devAmountSell = parseFloat(selectedBot.rawData.config?.deviationAmountSell || 0);

                                const avgPrice = (lower + upper) / 2;
                                const initialUSD = initialTokens * avgPrice;
                                const usdGrowth = (1 + devPriceSell / 100) * (1 + devAmountBuy / 100) * (1 + devAmountSell / 100);
                                const finalUSD = initialUSD * Math.pow(usdGrowth, 365);
                                const roi = ((finalUSD - initialUSD) / initialUSD) * 100;

                                return `+${roi.toFixed(0)}%`;
                              })()
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </n-tab-pane>

              <!-- Tab 4: Grid Statistics (if available) -->
              <n-tab-pane
                v-if="selectedBot.rawData?.gridStats && selectedBot.rawData.gridStats.length > 0"
                name="grid-stats"
                tab="📊 Grid Stats"
              >
                <div style="padding: 8px; background: rgba(247, 44, 9, 0.1); border-left: 3px solid #f72c09; border-radius: 4px;">
                  <div style="font-size: 11px; color: #f72c09; font-weight: 600; margin-bottom: 8px;">
                    GRID STATISTICS - TOP 10 MOST ACTIVE
                  </div>

                  <!-- Summary Stats -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div style="padding: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">TOTAL GRIDS</div>
                      <div style="font-size: 14px; color: #f72c09; font-weight: 700;">{{ selectedBot.rawData.gridStats.length }}</div>
                    </div>
                    <div style="padding: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">TOTAL FILLS</div>
                      <div style="font-size: 14px; color: #f72c09; font-weight: 700;">
                        {{ selectedBot.rawData.gridStats.reduce((sum, g) => sum + g.fillCount, 0) }}
                      </div>
                    </div>
                    <div style="padding: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">AVG FILLS/GRID</div>
                      <div style="font-size: 14px; color: #f72c09; font-weight: 700;">
                        {{ (selectedBot.rawData.gridStats.reduce((sum, g) => sum + g.fillCount, 0) / selectedBot.rawData.gridStats.length).toFixed(1) }}
                      </div>
                    </div>
                  </div>

                  <!-- Top 10 Grids Table -->
                  <div style="max-height: 200px; overflow-y: auto;">
                    <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                      <thead style="position: sticky; top: 0; background: rgba(0,0,0,0.8);">
                        <tr>
                          <th style="padding: 4px; text-align: left; color: #888; border-bottom: 1px solid #333;">#</th>
                          <th style="padding: 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Price</th>
                          <th style="padding: 4px; text-align: center; color: #888; border-bottom: 1px solid #333;">Side</th>
                          <th style="padding: 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Fills</th>
                          <th style="padding: 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Volume</th>
                          <th style="padding: 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(grid, index) in selectedBot.rawData.gridStats.slice(0, 10)" :key="index"
                            :style="{ background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }">
                          <td style="padding: 4px; color: #666;">{{ index + 1 }}</td>
                          <td style="padding: 4px; text-align: right; color: #ddd; font-weight: 600;">{{ grid.price.toFixed(4) }}</td>
                          <td style="padding: 4px; text-align: center;">
                            <span :style="{ color: grid.side === 'buy' ? '#18a058' : '#d03050', fontWeight: '600', fontSize: '9px' }">
                              {{ grid.side.toUpperCase() }}
                            </span>
                          </td>
                          <td style="padding: 4px; text-align: right; color: #f72c09; font-weight: 700;">{{ grid.fillCount }}</td>
                          <td style="padding: 4px; text-align: right; color: #ddd;">{{ grid.totalVolume.toFixed(2) }}</td>
                          <td style="padding: 4px; text-align: right;">
                            <div :style="{
                              width: '100%',
                              height: '12px',
                              background: selectedBot.rawData.gridStats && selectedBot.rawData.gridStats[0]
                                ? `linear-gradient(to right, #f72c09 ${(grid.fillCount / selectedBot.rawData.gridStats[0].fillCount * 100)}%, transparent ${(grid.fillCount / selectedBot.rawData.gridStats[0].fillCount * 100)}%)`
                                : '#f72c09',
                              borderRadius: '2px'
                            }"></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </n-tab-pane>

              <!-- Tab: Grid Performance Heatmap -->
              <n-tab-pane name="grid-heatmap" tab="🔥 Grid Heatmap">
                <div style="padding: 10px; background: rgba(235, 6, 235, 0.1); border-left: 3px solid #eb06eb; border-radius: 4px;">
                  <div v-if="selectedBot.rawData?.gridStats && selectedBot.rawData.gridStats.length > 0">
                    <div style="font-size: 11px; color: #eb06eb; font-weight: 600; margin-bottom: 12px;">
                      📊 GRID PERFORMANCE HEATMAP - Profit per Price Level
                    </div>

                    <!-- Heatmap Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;">
                      <div
                        v-for="grid in selectedBot.rawData.gridStats"
                        :key="`${grid.price}_${grid.side}`"
                        :style="{
                          background: grid.totalProfit >= 0
                            ? `rgba(24, 160, 88, ${Math.min(1, Math.abs(grid.totalProfit) / 10)})`
                            : `rgba(208, 48, 80, ${Math.min(1, Math.abs(grid.totalProfit) / 10)})`,
                          padding: '10px',
                          borderRadius: '6px',
                          border: `2px solid ${grid.totalProfit >= 0 ? '#18a058' : '#d03050'}`,
                          transition: 'transform 0.2s',
                          cursor: 'pointer'
                        }"
                        @mouseenter="$event.target.style.transform = 'scale(1.05)'"
                        @mouseleave="$event.target.style.transform = 'scale(1)'"
                      >
                        <!-- Price -->
                        <div style="font-size: 10px; color: #888; margin-bottom: 2px;">
                          {{ grid.side === 'buy' ? '🟢' : '🔴' }} {{ grid.side.toUpperCase() }}
                        </div>
                        <div style="font-size: 14px; color: #fff; font-weight: 700; margin-bottom: 4px;">
                          ${{ grid.price.toFixed(4) }}
                        </div>

                        <!-- Fill Count -->
                        <div style="font-size: 9px; color: #ddd; margin-bottom: 2px;">
                          Fills: {{ grid.fillCount }}
                        </div>

                        <!-- Total Profit -->
                        <div :style="{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: grid.totalProfit >= 0 ? '#18a058' : '#d03050'
                        }">
                          {{ grid.totalProfit >= 0 ? '+' : '' }}${{ grid.totalProfit.toFixed(2) }}
                        </div>

                        <!-- Average Amount -->
                        <div style="font-size: 8px; color: #888; margin-top: 2px;">
                          Avg: {{ grid.averageAmount?.toFixed(2) || '0' }}
                        </div>
                      </div>
                    </div>

                    <!-- Legend -->
                    <div style="margin-top: 16px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                      <div style="font-size: 10px; color: #888; font-weight: 600; margin-bottom: 6px;">LEGEND:</div>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div style="font-size: 9px; color: #ddd;">
                          🟢 <span style="color: #18a058; font-weight: 600;">Green</span> = Profitable grids
                        </div>
                        <div style="font-size: 9px; color: #ddd;">
                          🔴 <span style="color: #d03050; font-weight: 600;">Red</span> = Loss grids
                        </div>
                        <div style="font-size: 9px; color: #ddd;">
                          💡 <span style="font-weight: 600;">Opacity</span> = Profit magnitude
                        </div>
                        <div style="font-size: 9px; color: #ddd;">
                          📊 <span style="font-weight: 600;">Border</span> = BUY (green) / SELL (red)
                        </div>
                      </div>
                    </div>

                    <!-- Summary Stats -->
                    <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                      <div style="background: rgba(24, 160, 88, 0.1); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 9px; color: #888;">Total Grids</div>
                        <div style="font-size: 16px; color: #18a058; font-weight: 700;">
                          {{ selectedBot.rawData.gridStats.length }}
                        </div>
                      </div>
                      <div style="background: rgba(24, 160, 88, 0.1); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 9px; color: #888;">Total Fills</div>
                        <div style="font-size: 16px; color: #18a058; font-weight: 700;">
                          {{ selectedBot.rawData.gridStats.reduce((sum, g) => sum + g.fillCount, 0) }}
                        </div>
                      </div>
                      <div style="background: rgba(24, 160, 88, 0.1); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 9px; color: #888;">Est. Profit</div>
                        <div style="font-size: 16px; color: #18a058; font-weight: 700;">
                          +${{ selectedBot.rawData.gridStats.reduce((sum, g) => sum + (g.totalProfit || 0), 0).toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- No Data State -->
                  <div v-else style="text-align: center; padding: 40px; color: #888;">
                    <div style="font-size: 40px; margin-bottom: 12px;">📊</div>
                    <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">No Grid Statistics Available</div>
                    <div style="font-size: 11px;">Grid statistics will appear here once orders start filling.</div>
                    <n-button
                      type="primary"
                      size="small"
                      style="margin-top: 12px;"
                      @click="updateBotGridStats"
                      :loading="isUpdatingStats"
                    >
                      🔄 Update Grid Stats
                    </n-button>
                  </div>
                </div>
              </n-tab-pane>
            </n-tabs>

            <!-- RSI Compact Grid -->
            <template v-if="selectedBot.rawData?.rsiAtCreation">
              <div style="padding: 8px; background: rgba(235, 6, 235, 0.1); border-left: 3px solid #eb06eb; border-radius: 4px; margin-bottom: 12px;">
                <div style="font-size: 11px; color: #eb06eb; font-weight: 600; margin-bottom: 6px;">RSI AT CREATION</div>
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px;">
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">1m</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['1m']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">5m</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['5m']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">15m</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['15m']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">30m</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['30m']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">1h</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['1h']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">2h</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['2h']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">6h</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['6h']?.toFixed(0) || '-' }}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 9px; color: #888;">1d</div>
                    <div style="font-size: 11px; color: #ddd; font-weight: 600;">{{ selectedBot.rawData?.rsiAtCreation?.['1d']?.toFixed(0) || '-' }}</div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Active Orders - Compact -->
            <div style="padding: 8px; background: rgba(5, 245, 237, 0.1); border-left: 3px solid #05f5ed; border-radius: 4px; margin-bottom: 12px;">
              <div style="font-size: 11px; color: #05f5ed; font-weight: 600; margin-bottom: 6px;">
                ACTIVE ORDERS ({{ selectedBot.rawData?.activeOrders?.length || 0 }})
              </div>
              <div v-if="selectedBot.rawData?.activeOrders && selectedBot.rawData.activeOrders.length > 0" style="max-height: 200px; overflow-y: auto;">
                <n-data-table
                  :columns="activeOrdersColumns"
                  :data="selectedBot.rawData.activeOrders"
                  :pagination="false"
                  size="small"
                  :max-height="180"
                  striped
                />
              </div>
              <div v-else style="padding: 12px; text-align: center; color: #666; font-size: 11px;">
                No active orders
              </div>
            </div>

            <!-- Filled Orders - Compact -->
            <div style="padding: 8px; background: rgba(80, 227, 194, 0.1); border-left: 3px solid #50e3c2; border-radius: 4px;">
              <div style="font-size: 11px; color: #50e3c2; font-weight: 600; margin-bottom: 6px;">
                FILLED ORDERS ({{ selectedBot.rawData?.filledOrders?.length || 0 }})
              </div>
              <div v-if="selectedBot.rawData?.filledOrders && selectedBot.rawData.filledOrders.length > 0" style="max-height: 150px; overflow-y: auto;">
                <n-data-table
                  :columns="filledOrdersColumns"
                  :data="selectedBot.rawData.filledOrders"
                  :pagination="false"
                  size="small"
                  :max-height="130"
                  striped
                />
              </div>
              <div v-else style="padding: 12px; text-align: center; color: #666; font-size: 11px;">
                No filled orders yet
              </div>
            </div>

          </div>

          <template #footer>
            <div style="display: flex; justify-content: space-between; width: 100%;">
              <n-button
                type="error"
                @click="deleteBotWithOrders"
                :loading="isDeletingBot"
                :disabled="isDeletingBot"
              >
                Delete Bot & Cancel Orders
              </n-button>
              <n-button @click="showBotDetails = false" :disabled="isDeletingBot">
                Close
              </n-button>
            </div>
          </template>
        </n-modal>
      </n-tab-pane>
      <!-- ❌ REMOVED: "Open Orders" and "Closed Orders" tabs to avoid LCX rate limits -->
      <!-- Users can access these in the main cryptoapp page under dedicated tabs -->
    </n-tabs>
  </div>
</template>


<style scoped>
.gridbots-list-container {
  width: 100%;
  height: 100%;
}

.gridbots-tabs {
  height: 100%;
}

:deep(.n-tabs-nav) {
  padding: 0 8px;
}

:deep(.n-tabs-tab) {
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Balance Header */
.balance-header {
  margin-bottom: 12px;
  padding: 10px;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
}

/* Balance Cards */
.balance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.balance-card {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-left-width: 3px;
  border-radius: 3px;
  padding: 8px 10px;
}

.balance-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a3441;
}

.api-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.api-name {
  font-size: 10px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.balance-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.balance-label {
  font-size: 9px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.balance-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', monospace;
}

.balance-type {
  font-size: 9px;
  color: #666;
  font-weight: 500;
  min-width: 40px;
}

.balance-free {
  font-size: 10px;
  font-weight: 600;
  color: #4ade80;
}

.balance-used {
  font-size: 10px;
  font-weight: 600;
  color: #fbbf24;
}

.balance-total {
  font-size: 10px;
  font-weight: 600;
  color: #6366f1;
}

.table-wrapper {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.15);
}

/* Table Styling */
:deep(.n-data-table) {
  background: transparent;
}

:deep(.n-data-table-th) {
  background: rgba(128, 128, 128, 0.08) !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 8px 10px !important;
  border-bottom: 2px solid rgba(128, 128, 128, 0.2) !important;
}

:deep(.n-data-table-td) {
  font-size: 11px !important;
  padding: 6px 10px !important;
  font-family: 'Courier New', monospace !important;
}

:deep(.n-data-table-tr:hover) {
  background: rgba(128, 128, 128, 0.05) !important;
}

/* Scrollbar */
:deep(.n-data-table-base-table-body)::-webkit-scrollbar {
  width: 6px;
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.05);
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}
</style>
