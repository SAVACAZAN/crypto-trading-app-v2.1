<template>
  <div class="copilot-advanced">
    <!-- Header -->
    <div class="copilot-header">
      <h1 class="page-title">✈️ Co-Pilot - Advanced Order Management</h1>
      <p class="page-subtitle">Monitor, automate and create bots from your orders</p>
    </div>

    <!-- Filter Controls -->
    <FilterControls
      v-model="filters"
      :loading="loadingOrders"
      @refresh="refreshOrders"
    />

    <!-- Dashboard Stats -->
    <DashboardStats
      :selected-bot-type="selectedBotType"
      @update:selected-bot-type="selectedBotType = $event"
      :chain-monitor-active="chainMonitorActive"
      :stats="dashboardStats"
      :rules-count-by-type="rulesCountByType"
      @toggle-chain-monitor="toggleChainMonitor"
      @configure-chain="showChainModal = true"
      @quick-action="handleQuickAction"
      @show-bot-info="showBotInfoModal = true"
    />

    <!-- Orders Table -->
    <OrdersTable
      :orders="filteredOrders"
      :loading="loadingOrders"
      v-model:auto-monitor="autoMonitor"
      :selected-bot-type="selectedBotType"
      @add-rule="openAddRuleModal"
      @view-rules="viewOrderRules"
      @create-bot="createBotFromOrder"
    />

    <!-- Add Rule Modal -->
    <AddRuleModal
      v-model:show="showOrderRuleModal"
      :order="selectedOrder"
      :selected-bot-type="selectedBotType"
      :one-click-strategies="oneClickStrategies"
      :loading-strategies="loadingStrategies"
      @save="saveOrderRule"
    />

    <!-- View Rules Modal - OneClick Bot -->
    <ViewRulesModalOneClick
      v-model:show="showOrderRulesView"
      :order="selectedOrder"
      :rules="orderRules"
      :loading="loadingRules"
      :one-click-strategies="oneClickStrategies"
      @add-rule="openAddRuleModal"
      @delete-rule="deleteOrderRule"
      @toggle-rule="toggleOrderRule"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { useMessage } from 'naive-ui';
import { useCoPilotOrders } from '~/composables/useCoPilotOrders';
import { useCoPilotRules } from '~/composables/useCoPilotRules';
import { useCoPilotCalculations } from '~/composables/useCoPilotCalculations';

// Components
import FilterControls from '~/components/CoPilot/FilterControls.vue';
import OrdersTable from '~/components/CoPilot/OrdersTable.vue';
import DashboardStats from '~/components/CoPilot/DashboardStats.vue';
import AddRuleModal from '~/components/CoPilot/AddRuleModal.vue';
import ViewRulesModalOneClick from '~/components/CoPilot/ViewRulesModalOneClick.vue';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
const userID = useCookie('userID');
const message = useMessage();

await app.loadUserExchangeData(userID.value);

// Composables
const {
  applyFilters,
  enrichOrder,
  calculateOrderStats,
  determineStatus
} = useCoPilotOrders();

const {
  validateOrderRule,
  formatRuleCondition,
  getDefaultBotConfigForType
} = useCoPilotRules();

const {
  calculateGridInvestment
} = useCoPilotCalculations();

// State
const loadingOrders = ref(false);
const orders = ref([]);
const autoMonitor = ref(false);
const selectedBotType = ref(null);
const chainMonitorActive = ref(false);
const showChainModal = ref(false);
const showBotInfoModal = ref(false);

// Filters
const filters = ref({
  sizeFilter: 100,
  customSize: 1000,
  statusFilter: 'all'
});

// Order Rules
const showOrderRuleModal = ref(false);
const showOrderRulesView = ref(false);
const selectedOrder = ref(null);
const orderRules = ref([]);
const loadingRules = ref(false);
const currentBotId = ref(null); // Store botId from rules fetch

// OneClick Strategies
const oneClickStrategies = ref([]);
const loadingStrategies = ref(false);

// Computed
const filteredOrders = computed(() => {
  const filterConfig = {
    minSize: filters.value.sizeFilter === 'custom'
      ? filters.value.customSize
      : filters.value.sizeFilter,
    status: filters.value.statusFilter
  };

  return applyFilters(orders.value, filterConfig);
});

const rulesCountByType = computed(() => {
  const counts = {};
  orders.value.forEach(order => {
    if (order.rules && order.rules.length > 0) {
      order.rules.forEach(rule => {
        const botType = rule.actionConfig?.botType;
        if (botType) {
          counts[botType] = (counts[botType] || 0) + 1;
        }
      });
    }
  });
  return counts;
});

const dashboardStats = computed(() => {
  const stats = calculateOrderStats(orders.value);

  return {
    activeChains: 0,
    pendingActions: 0,
    executedToday: 0,
    totalActiveBots: stats.totalOrders,
    runningBots: [],
    totalPnL: 0,
    performance: {
      totalOrders: stats.totalOrders,
      filledOrders: stats.filledOrders,
      successRate: stats.fillRate,
      avgProfit: 0
    }
  };
});

// Methods
async function refreshOrders(silent = false) {
  loadingOrders.value = true;

  try {
    const selectedExchange = app.getUserSelectedExchange;
    const selectedApiKeys = app.getSelectedApiKeys || [];

    const queryParams = {
      userID: userID.value
    };

    if (selectedExchange) {
      queryParams.exchange = selectedExchange;
    }

    if (selectedApiKeys.length === 1) {
      queryParams.apiKeyName = selectedApiKeys[0];
    }

    const response = await $fetch('/api/v1/Bots/fetchCoPilotOrders', {
      query: queryParams
    });

    if (response.success && response.data) {
      orders.value = response.data.map(order => enrichOrder(order, order.rules || []));

      if (!silent) {
        if (response.stats) {
          message.success(
            `✅ Loaded ${response.stats.totalOrders} orders with ${response.stats.totalRules} rules`
          );
        } else {
          message.success(`✅ Loaded ${orders.value.length} orders`);
        }
      }
    } else {
      orders.value = [];
      if (!silent) {
        message.info(response.message || 'No orders found');
      }
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    orders.value = [];
    if (!silent) {
      message.error('Failed to load orders');
    }
  } finally {
    loadingOrders.value = false;
  }
}

function toggleChainMonitor() {
  chainMonitorActive.value = !chainMonitorActive.value;
  message.info(chainMonitorActive.value ? '⛓️ Chain Monitor Started' : '⏸️ Chain Monitor Paused');
}

async function handleQuickAction(action) {
  switch (action) {
    case 'cancel-all':
      if (!confirm('Cancel all open orders?')) return;
      message.warning('⏳ Cancelling all orders...');
      break;
    case 'pause-all':
      message.info('⏸️ Pausing all bots...');
      break;
    case 'resume-all':
      message.info('▶️ Resuming all bots...');
      break;
    case 'sync-orders':
      message.info('🔄 Syncing orders...');
      await refreshOrders();
      break;
  }
}

function openAddRuleModal(order) {
  selectedOrder.value = order;
  showOrderRuleModal.value = true;
}

async function viewOrderRules(order) {
  selectedOrder.value = order;
  await fetchOrderRules(order.id);
  showOrderRulesView.value = true;
}

async function fetchOrderRules(orderId) {
  loadingRules.value = true;

  try {
    const response = await $fetch('/api/v1/Bots/getCoPilotRules', {
      query: {
        userID: userID.value,
        orderId: orderId
      }
    });

    if (response.success) {
      orderRules.value = response.rules;

      // Store botId if available
      if (response.botId) {
        currentBotId.value = response.botId;
      }

      // Update rulesCount in orders list
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].rulesCount = response.rules.length;
      }

      message.success(`Loaded ${response.rules.length} rule(s)`);
    }
  } catch (error) {
    console.error('❌ Error fetching order rules:', error);
    message.error('Failed to load rules');
  } finally {
    loadingRules.value = false;
  }
}

async function saveOrderRule(ruleData) {
  if (!ruleData.ruleName) {
    message.error('Please enter a rule name');
    return;
  }

  if (!selectedOrder.value || !selectedOrder.value.id) {
    message.error('No order selected');
    return;
  }

  // Validate rule
  const validation = validateOrderRule(ruleData, selectedOrder.value);
  if (!validation.valid) {
    message.error(validation.errors.join(', '));
    return;
  }

  try {
    const response = await $fetch('/api/v1/Bots/addCoPilotRule', {
      method: 'POST',
      body: {
        userID: userID.value,
        orderId: selectedOrder.value.id,
        ruleName: ruleData.ruleName,
        ruleType: ruleData.ruleType,
        triggerCondition: ruleData.triggerCondition,
        actionConfig: ruleData.actionConfig,
        isActive: true
      }
    });

    if (response.success) {
      message.success(`✅ ${response.message}`);
      showOrderRuleModal.value = false;

      // Update rulesCount in order
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (orderIndex !== -1) {
        orders.value[orderIndex].rulesCount = (orders.value[orderIndex].rulesCount || 0) + 1;
      }

      await refreshOrders(true);
    }
  } catch (error) {
    console.error('Error saving rule:', error);
    message.error('Failed to save rule');
  }
}

async function deleteOrderRule(ruleId) {
  if (!confirm('Delete this rule?')) return;

  // Get botId from the rule (optional - rules can be independent)
  const rule = orderRules.value.find(r => r.id === ruleId);
  const botId = rule?.coPilotBotId || rule?.botId || currentBotId.value;

  try {
    const requestBody = {
      userID: userID.value,
      ruleId: ruleId
    };

    // Include botId only if available
    if (botId) {
      requestBody.botId = botId;
    }

    const response = await $fetch('/api/v1/Bots/deleteCoPilotRule', {
      method: 'POST',
      body: requestBody
    });

    if (response.success) {
      message.success(`✅ ${response.message}`);

      // Remove from local array
      const index = orderRules.value.findIndex(r => r.id === ruleId);
      if (index !== -1) {
        orderRules.value.splice(index, 1);
      }

      // Update rulesCount in order
      if (selectedOrder.value) {
        const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
        if (orderIndex !== -1) {
          orders.value[orderIndex].rulesCount = orderRules.value.length;
        }
      }
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    message.error('Failed to delete rule');
  }
}

async function toggleOrderRule(ruleId) {
  // Get botId from the rule (optional - rules can be independent)
  const rule = orderRules.value.find(r => r.id === ruleId);
  const botId = rule?.coPilotBotId || rule?.botId || currentBotId.value;

  try {
    const requestBody = {
      userID: userID.value,
      ruleId: ruleId
    };

    // Include botId only if available
    if (botId) {
      requestBody.botId = botId;
    }

    const response = await $fetch('/api/v1/Bots/toggleCoPilotRule', {
      method: 'POST',
      body: requestBody
    });

    if (response.success) {
      if (rule) {
        rule.isActive = !rule.isActive;
        message.info(rule.isActive ? '🟢 Rule enabled' : '⚪ Rule disabled');
      }
    }
  } catch (error) {
    console.error('Error toggling rule:', error);
    message.error('Failed to toggle rule');
  }
}

async function createBotFromOrder(order) {
  const botType = selectedBotType.value || 'grid';
  const botConfig = getDefaultBotConfigForType(botType);

  const orderPrice = parseFloat(order.price);
  const suggestedLower = parseFloat((orderPrice * 0.9).toFixed(6));
  const suggestedUpper = parseFloat((orderPrice * 1.1).toFixed(6));

  if (!selectedBotType.value) {
    message.warning('⚠️ Please select a bot type from the Automation Bots card first!');
    return;
  }

  const confirmed = confirm(`Create ${botType.toUpperCase()} Bot for ${order.symbol}?\n\nBot will use:\n- Lower Price: $${suggestedLower}\n- Upper Price: $${suggestedUpper}\n- Amount: ${order.amount}`);
  if (!confirmed) return;

  message.loading(`🤖 Creating ${botType.toUpperCase()} Bot...`);

  try {
    const botData = {
      userID: userID.value,
      name: `${botType.toUpperCase()} - ${order.symbol} - ${new Date().toLocaleDateString()}`,
      exchange: app.getUserSelectedExchange,
      symbol: order.symbol,
      apiKeyName: order.apiKeyName,
      lowerPrice: suggestedLower.toString(),
      upperPrice: suggestedUpper.toString(),
      amount: order.amount.toString()
    };

    let endpoint = '/api/v1/createGridBot';

    if (botType === 'grid') {
      botData.nrOfGrids = '10';
      botData.ordersSide = 'buyOrSell';
    } else if (botType === 'dcagrid') {
      endpoint = '/api/v1/createDcaGridBot';
      botData.nrOfGrids = '10';
      botData.incBuy = '1';
      botData.incSell = '1';
    } else if (botType === 'fib') {
      endpoint = '/api/v1/Bots/createFibBot';
      botData.nrOfGrids = '7';
      botData.PriceStart = order.price.toString();
    }

    const response = await $fetch(endpoint, {
      method: 'POST',
      body: botData
    });

    if (response.success || response.data === 'OK' || response.data) {
      message.success(`✅ ${botType.toUpperCase()} Bot created successfully!`);
    } else {
      message.error(`❌ Failed to create bot`);
    }
  } catch (error) {
    console.error('❌ Error creating bot:', error);
    message.error(`❌ Error: ${error.message || 'Failed to create bot'}`);
  }
}

async function loadOneClickStrategies() {
  if (loadingStrategies.value || oneClickStrategies.value.length > 0) return;

  loadingStrategies.value = true;
  try {
    const response = await $fetch('/api/v1/getOneClickStrategies', {
      query: { userID: userID.value }
    });

    if (response.success && response.strategies) {
      oneClickStrategies.value = response.strategies;
    }
  } catch (error) {
    console.error('Error loading OneClick strategies:', error);
  } finally {
    loadingStrategies.value = false;
  }
}

// Auto-refresh interval
let refreshInterval = null;

// Lifecycle
onMounted(async () => {
  await refreshOrders();
  await loadOneClickStrategies();

  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(() => {
    if (!showOrderRuleModal.value && !showOrderRulesView.value) {
      refreshOrders(true);
    }
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.copilot-advanced {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.copilot-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #10eb04;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}
</style>
