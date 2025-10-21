<template>
  <div>
    <!-- Orders Table Section -->
    <n-card style="background: #0f0f0f; margin-bottom: 16px;">
      <n-text strong style="color: #e90a15; font-size: 13px; display: block; margin-bottom: 12px;">
        📈 CLOSED ORDERS BY API KEY
      </n-text>

      <!-- Tables Layout (2 tables side by side) -->
      <div style="display: flex; gap: 12px;">

        <!-- TABLE 1: DETAILED BY API KEY - expandable rows -->
        <div style="flex: 2; background: #1a1a1a; padding: 8px; border-radius: 6px; border: 1px solid #333;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #0f0f0f;">
                <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Type</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Orders</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Avg Price</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Qty</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Coin</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="apiKey in uniqueApiKeys" :key="apiKey">
                <!-- API KEY Header Row -->
                <tr style="background: #2a2a2a; border-bottom: 1px solid #444;">
                  <td colspan="6" style="padding: 6px; font-weight: 700;">
                    <span :style="`color: ${apiKeyColors[apiKey]}; font-size: 10px;`">
                      {{ apiKey }}
                    </span>
                    <span style="color: #888; font-size: 8px; margin-left: 8px;">
                      ({{ getOrdersByApi(apiKey).length }} orders)
                    </span>
                  </td>
                </tr>

                <!-- BUY Row for this API (Clickable) -->
                <tr @click="toggleApiKeyDetails(apiKey, 'buy')" style="background: #0a2e01; border-bottom: 1px solid #333; cursor: pointer;"
                    @mouseover="(e) => e.currentTarget.style.background = '#0c3a02'"
                    @mouseleave="(e) => e.currentTarget.style.background = '#0a2e01'">
                  <td style="padding: 4px 6px; color: #10eb04; font-weight: 700; font-size: 9px;">
                    <span style="margin-right: 4px;">{{ isApiKeyExpanded(apiKey, 'buy') ? '▼' : '▶' }}</span>
                    BUY
                  </td>
                  <td style="padding: 4px 6px; text-align: center; color: #46f012; font-weight: 700; font-size: 9px;">{{ getOrdersByApiAndSide(apiKey, 'buy').length }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(getOrdersByApiAndSide(apiKey, 'buy')), 'AveragePrice') }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(getOrdersByApiAndSide(apiKey, 'buy')).toFixed(2)) }}</td>
                  <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ base }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(getOrdersByApiAndSide(apiKey, 'buy'))) }}</td>
                </tr>

                <!-- BUY Orders Details (Expanded) -->
                <tr v-if="isApiKeyExpanded(apiKey, 'buy')">
                  <td colspan="7" style="padding: 0; background: #0a1a05;">
                    <div style="max-height: 300px; overflow-y: auto; padding: 8px;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
                        <thead style="position: sticky; top: 0; background: #0f0f0f;">
                          <tr>
                            <th style="padding: 3px 4px; text-align: left; color: #888; border-bottom: 1px solid #333;">Order ID</th>
                            <th style="padding: 3px 4px; text-align: left; color: #888; border-bottom: 1px solid #333;">Date</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Price</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Amount</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Filled</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="order in getOrdersByApiAndSide(apiKey, 'buy')" :key="order.id" style="border-bottom: 1px solid #1a1a1a;">
                            <td style="padding: 3px 4px; color: #10eb04; font-family: monospace;">{{ order.id ? order.id.substring(0, 12) + '...' : 'N/A' }}</td>
                            <td style="padding: 3px 4px; color: #888;">{{ order.datetime ? new Date(order.datetime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A' }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #10eb04; font-weight: 600;">{{ formatNumber(order.price, 'Price') }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #10eb04;">{{ formatNumber(order.amount?.toFixed(2)) }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #46f012;">{{ formatNumber(order.filled?.toFixed(2)) }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #10eb04; font-weight: 700;">{{ formatNumber(order.cost?.toFixed(2)) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- SELL Row for this API (Clickable) -->
                <tr @click="toggleApiKeyDetails(apiKey, 'sell')" style="background: #420202; border-bottom: 1px solid #333; cursor: pointer;"
                    @mouseover="(e) => e.currentTarget.style.background = '#5a0505'"
                    @mouseleave="(e) => e.currentTarget.style.background = '#420202'">
                  <td style="padding: 4px 6px; color: #e90a15; font-weight: 700; font-size: 9px;">
                    <span style="margin-right: 4px;">{{ isApiKeyExpanded(apiKey, 'sell') ? '▼' : '▶' }}</span>
                    SELL
                  </td>
                  <td style="padding: 4px 6px; text-align: center; color: #e90a15; font-weight: 700; font-size: 9px;">{{ getOrdersByApiAndSide(apiKey, 'sell').length }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(getOrdersByApiAndSide(apiKey, 'sell')), 'AveragePrice') }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(getOrdersByApiAndSide(apiKey, 'sell')).toFixed(2)) }}</td>
                  <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ quote }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(getOrdersByApiAndSide(apiKey, 'sell'))) }}</td>
                </tr>

                <!-- SELL Orders Details (Expanded) -->
                <tr v-if="isApiKeyExpanded(apiKey, 'sell')">
                  <td colspan="7" style="padding: 0; background: #1a0505;">
                    <div style="max-height: 300px; overflow-y: auto; padding: 8px;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
                        <thead style="position: sticky; top: 0; background: #0f0f0f;">
                          <tr>
                            <th style="padding: 3px 4px; text-align: left; color: #888; border-bottom: 1px solid #333;">Order ID</th>
                            <th style="padding: 3px 4px; text-align: left; color: #888; border-bottom: 1px solid #333;">Date</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Price</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Amount</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Filled</th>
                            <th style="padding: 3px 4px; text-align: right; color: #888; border-bottom: 1px solid #333;">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="order in getOrdersByApiAndSide(apiKey, 'sell')" :key="order.id" style="border-bottom: 1px solid #1a1a1a;">
                            <td style="padding: 3px 4px; color: #f5a623; font-family: monospace;">{{ order.id ? order.id.substring(0, 12) + '...' : 'N/A' }}</td>
                            <td style="padding: 3px 4px; color: #888;">{{ order.datetime ? new Date(order.datetime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A' }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #f5a623; font-weight: 600;">{{ formatNumber(order.price, 'Price') }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #f5a623;">{{ formatNumber(order.amount?.toFixed(2)) }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #e90a15;">{{ formatNumber(order.filled?.toFixed(2)) }}</td>
                            <td style="padding: 3px 4px; text-align: right; color: #f5a623; font-weight: 700;">{{ formatNumber(order.cost?.toFixed(2)) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- TABLE 2: GRAND TOTAL - 2 ROWS TOTAL (ALL APIs combined) -->
        <div style="flex: 1; background: #1a1a1a; padding: 8px; border-radius: 6px; border: 2px solid #f39c12;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #0f0f0f;">
                <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Type</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Orders</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Avg Price</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Qty</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Coin</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <!-- BUY Row - ALL APIs -->
              <tr style="background: #0a2e01;">
                <td style="padding: 4px 6px; color: #46f012; font-weight: 700; font-size: 9px;">BUY</td>
                <td style="padding: 4px 6px; text-align: center; color: #46f012; font-weight: 700; font-size: 9px;">{{ buyOrders.length }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(buyOrders), 'AveragePrice') }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(buyOrders).toFixed(2)) }}</td>
                <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ base }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(buyOrders)) }}</td>
              </tr>
              <!-- SELL Row - ALL APIs -->
              <tr style="background: #420202;">
                <td style="padding: 4px 6px; color: #e90a15; font-weight: 700; font-size: 9px;">SELL</td>
                <td style="padding: 4px 6px; text-align: center; color: #e90a15; font-weight: 700; font-size: 9px;">{{ sellOrders.length }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(sellOrders), 'AveragePrice') }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(sellOrders).toFixed(2)) }}</td>
                <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ quote }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(sellOrders)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    required: true
  },
  selectedApiKeys: {
    type: Array,
    required: true
  },
  apiKeyColors: {
    type: Object,
    required: true
  },
  base: {
    type: String,
    required: true
  },
  quote: {
    type: String,
    required: true
  }
});

// Expanded state for API keys
const expandedApiKeys = ref({});

// Computed properties for filtered orders
const buyOrders = computed(() => {
  if (props.selectedApiKeys.length === 0) return [];
  return props.allOrders.filter(order =>
    props.selectedApiKeys.includes(order.apiKeyName) && order.side === 'buy'
  );
});

const sellOrders = computed(() => {
  if (props.selectedApiKeys.length === 0) return [];
  return props.allOrders.filter(order =>
    props.selectedApiKeys.includes(order.apiKeyName) && order.side === 'sell'
  );
});

const uniqueApiKeys = computed(() => {
  return props.selectedApiKeys;
});

// Helper functions
function getOrdersByApi(apiKey) {
  return props.allOrders.filter(order => order.apiKeyName === apiKey);
}

function getOrdersByApiAndSide(apiKey, side) {
  return props.allOrders.filter(order =>
    order.apiKeyName === apiKey && order.side === side
  );
}

function toggleApiKeyDetails(apiKey, side) {
  const key = `${apiKey}-${side}`;
  expandedApiKeys.value[key] = !expandedApiKeys.value[key];
}

function isApiKeyExpanded(apiKey, side) {
  const key = `${apiKey}-${side}`;
  return expandedApiKeys.value[key] || false;
}

function calculateAveragePrice(orders) {
  if (!orders || orders.length === 0) return 0;
  const totalValue = orders.reduce((sum, order) => sum + (order.cost || 0), 0);
  const totalQuantity = orders.reduce((sum, order) => sum + (order.filled || order.amount || 0), 0);
  return totalQuantity > 0 ? totalValue / totalQuantity : 0;
}

function calculateTotalQuantity(orders) {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((sum, order) => sum + (order.filled || order.amount || 0), 0);
}

function calculateTotalCost(orders) {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((sum, order) => sum + (order.cost || 0), 0);
}

function formatNumber(value, type = 'default') {
  if (value === null || value === undefined || isNaN(value)) return '0';

  const num = parseFloat(value);

  if (type === 'Price' || type === 'AveragePrice') {
    if (num >= 1000) return num.toFixed(2);
    if (num >= 1) return num.toFixed(4);
    if (num >= 0.01) return num.toFixed(6);
    return num.toFixed(8);
  }

  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(6);
}
</script>