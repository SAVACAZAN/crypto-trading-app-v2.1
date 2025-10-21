<template>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">

    <!-- WEEKLY TRADES SECTION -->
    <div style="background: #1a1a1a; padding: 12px; border-radius: 8px; border: 1px solid #3498db;">
      <div style="color: #3498db; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>📅 WEEKLY TRADES</span>
        <span style="font-size: 8px; color: #888;">{{ weeklyTrades.length }} weeks</span>
      </div>

      <div style="max-height: 700px; overflow-y: auto; padding-right: 4px;">
        <div v-for="(week, i) in weeklyTrades" :key="i" style="margin-bottom: 8px;">
          <!-- Week Header - Clickable -->
          <div
            @click="toggleWeek(i)"
            style="padding: 8px; background: #0f0f0f; border-radius: 6px; border-left: 3px solid #3498db; cursor: pointer; user-select: none;"
            :style="{ background: expandedWeeks[i] ? '#1a2332' : '#0f0f0f' }"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1;">
                <div style="color: #3498db; font-size: 9px; font-weight: 600;">
                  {{ expandedWeeks[i] ? '▼' : '▶' }} Week {{ week.weekNumber }} - {{ week.year }}
                </div>
                <div style="color: #888; font-size: 7px;">{{ week.dateRange }}</div>
              </div>
              <div style="text-align: right;">
                <div style="color: #fff; font-size: 10px; font-weight: 600;">{{ week.global.totalOrders }} orders</div>
                <div style="color: #ffd700; font-size: 8px;">${{ formatNumber(week.global.totalCost.toFixed(2)) }}</div>
              </div>
            </div>
          </div>

          <!-- Week Details - Expandable -->
          <div v-if="expandedWeeks[i]" style="margin-top: 4px; padding: 10px; background: #0a0a0a; border-radius: 6px; border: 1px solid #2a2a2a;">

            <!-- PER API KEY STATS -->
            <div v-for="(apiStats, apiKey) in week.perApi" :key="apiKey" style="margin-bottom: 12px; padding: 8px; background: #1a1a1a; border-radius: 6px; border-left: 3px solid;">
              <div :style="`border-left-color: ${apiKeyColors[apiKey]};`">
                <div :style="`color: ${apiKeyColors[apiKey]}; font-size: 9px; font-weight: 700; margin-bottom: 6px;`">
                  🔑 {{ apiKey }}
                </div>

                <!-- BUY/SELL Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px;">
                  <!-- BUY -->
                  <div style="background: #0f0f0f; padding: 5px; border-radius: 4px; border-left: 2px solid #20b2aa;">
                    <div style="color: #20b2aa; font-size: 7px; font-weight: 600; margin-bottom: 3px;">🟢 BUY</div>
                    <div style="font-size: 8px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #20b2aa; font-weight: 600;">{{ apiStats.buyOrders }}</span></div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Vol: {{ formatNumber(apiStats.buyVolume.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Cost: ${{ formatNumber(apiStats.buyCost.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #ffd700;">Avg: ${{ apiStats.avgBuyPrice.toFixed(4) }}</div>
                  </div>

                  <!-- SELL -->
                  <div style="background: #0f0f0f; padding: 5px; border-radius: 4px; border-left: 2px solid #cd5c5c;">
                    <div style="color: #cd5c5c; font-size: 7px; font-weight: 600; margin-bottom: 3px;">🔴 SELL</div>
                    <div style="font-size: 8px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #cd5c5c; font-weight: 600;">{{ apiStats.sellOrders }}</span></div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Vol: {{ formatNumber(apiStats.sellVolume.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Cost: ${{ formatNumber(apiStats.sellCost.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #ffd700;">Avg: ${{ apiStats.avgSellPrice.toFixed(4) }}</div>
                  </div>
                </div>

                <!-- Overall for this API -->
                <div style="background: #0f0f0f; padding: 5px; border-radius: 4px; margin-bottom: 6px;">
                  <div style="color: #888; font-size: 7px; font-weight: 600; margin-bottom: 3px;">📊 TOTALS</div>
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 6px;">
                    <div><span style="color: #666;">Orders:</span> <span style="color: #fff; font-weight: 600;">{{ apiStats.totalOrders }}</span></div>
                    <div><span style="color: #666;">Volume:</span> <span style="color: #fff; font-weight: 600;">{{ formatNumber(apiStats.totalVolume.toFixed(2)) }}</span></div>
                    <div><span style="color: #666;">Cost:</span> <span style="color: #ffd700; font-weight: 600;">${{ formatNumber(apiStats.totalCost.toFixed(2)) }}</span></div>
                    <div><span style="color: #666;">Avg Price:</span> <span style="color: #ffd700; font-weight: 600;">${{ apiStats.avgPrice.toFixed(4) }}</span></div>
                  </div>
                </div>

                <!-- Biggest Orders for this API -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                  <div style="background: #0f0f0f; padding: 4px; border-radius: 4px;">
                    <div style="color: #20b2aa; font-size: 6px; font-weight: 600; margin-bottom: 2px;">💎 Biggest BUY</div>
                    <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(apiStats.biggestBuy.amount.toFixed(2)) }} @ ${{ apiStats.biggestBuy.price.toFixed(4) }}</div>
                    <div style="font-size: 7px; color: #20b2aa; font-weight: 600;">${{ formatNumber(apiStats.biggestBuy.cost.toFixed(2)) }}</div>
                  </div>
                  <div style="background: #0f0f0f; padding: 4px; border-radius: 4px;">
                    <div style="color: #cd5c5c; font-size: 6px; font-weight: 600; margin-bottom: 2px;">💎 Biggest SELL</div>
                    <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(apiStats.biggestSell.amount.toFixed(2)) }} @ ${{ apiStats.biggestSell.price.toFixed(4) }}</div>
                    <div style="font-size: 7px; color: #cd5c5c; font-weight: 600;">${{ formatNumber(apiStats.biggestSell.cost.toFixed(2)) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- GLOBAL TOTAL FOR WEEK -->
            <div style="padding: 10px; background: #1a1a1a; border-radius: 6px; border: 2px solid #3498db;">
              <div style="color: #3498db; font-size: 10px; font-weight: 700; margin-bottom: 8px; text-align: center;">🌍 GLOBAL TOTAL</div>

              <!-- BUY/SELL Stats Grid -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
                <!-- BUY -->
                <div style="background: #0f0f0f; padding: 6px; border-radius: 4px; border-left: 2px solid #20b2aa;">
                  <div style="color: #20b2aa; font-size: 8px; font-weight: 600; margin-bottom: 4px;">🟢 TOTAL BUY</div>
                  <div style="font-size: 9px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #20b2aa; font-weight: 600;">{{ week.global.buyOrders }}</span></div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Vol: {{ formatNumber(week.global.buyVolume.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Cost: ${{ formatNumber(week.global.buyCost.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #ffd700;">Avg: ${{ week.global.avgBuyPrice.toFixed(4) }}</div>
                </div>

                <!-- SELL -->
                <div style="background: #0f0f0f; padding: 6px; border-radius: 4px; border-left: 2px solid #cd5c5c;">
                  <div style="color: #cd5c5c; font-size: 8px; font-weight: 600; margin-bottom: 4px;">🔴 TOTAL SELL</div>
                  <div style="font-size: 9px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #cd5c5c; font-weight: 600;">{{ week.global.sellOrders }}</span></div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Vol: {{ formatNumber(week.global.sellVolume.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Cost: ${{ formatNumber(week.global.sellCost.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #ffd700;">Avg: ${{ week.global.avgSellPrice.toFixed(4) }}</div>
                </div>
              </div>

              <!-- Overall Global Stats -->
              <div style="background: #0f0f0f; padding: 6px; border-radius: 4px; margin-bottom: 8px;">
                <div style="color: #3498db; font-size: 8px; font-weight: 600; margin-bottom: 4px;">📊 OVERALL</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 7px;">
                  <div><span style="color: #888;">Total Orders:</span> <span style="color: #fff; font-weight: 600;">{{ week.global.totalOrders }}</span></div>
                  <div><span style="color: #888;">Total Volume:</span> <span style="color: #fff; font-weight: 600;">{{ formatNumber(week.global.totalVolume.toFixed(2)) }}</span></div>
                  <div><span style="color: #888;">Total Cost:</span> <span style="color: #ffd700; font-weight: 600;">${{ formatNumber(week.global.totalCost.toFixed(2)) }}</span></div>
                  <div><span style="color: #888;">Avg Price:</span> <span style="color: #ffd700; font-weight: 600;">${{ week.global.avgPrice.toFixed(4) }}</span></div>
                </div>
              </div>

              <!-- Biggest Orders Global -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <div style="background: #0f0f0f; padding: 5px; border-radius: 4px;">
                  <div style="color: #20b2aa; font-size: 7px; font-weight: 600; margin-bottom: 2px;">💎 Biggest BUY</div>
                  <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(week.global.biggestBuy.amount.toFixed(2)) }} @ ${{ week.global.biggestBuy.price.toFixed(4) }}</div>
                  <div style="font-size: 7px; color: #20b2aa; font-weight: 600;">${{ formatNumber(week.global.biggestBuy.cost.toFixed(2)) }}</div>
                </div>
                <div style="background: #0f0f0f; padding: 5px; border-radius: 4px;">
                  <div style="color: #cd5c5c; font-size: 7px; font-weight: 600; margin-bottom: 2px;">💎 Biggest SELL</div>
                  <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(week.global.biggestSell.amount.toFixed(2)) }} @ ${{ week.global.biggestSell.price.toFixed(4) }}</div>
                  <div style="font-size: 7px; color: #cd5c5c; font-weight: 600;">${{ formatNumber(week.global.biggestSell.cost.toFixed(2)) }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- MONTHLY TRADES SECTION -->
    <div style="background: #1a1a1a; padding: 12px; border-radius: 8px; border: 1px solid #e74c3c;">
      <div style="color: #e74c3c; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>📆 MONTHLY TRADES</span>
        <span style="font-size: 8px; color: #888;">{{ monthlyTrades.length }} months</span>
      </div>

      <div style="max-height: 700px; overflow-y: auto; padding-right: 4px;">
        <div v-for="(month, i) in monthlyTrades" :key="i" style="margin-bottom: 8px;">
          <!-- Month Header - Clickable -->
          <div
            @click="toggleMonth(i)"
            style="padding: 8px; background: #0f0f0f; border-radius: 6px; border-left: 3px solid #e74c3c; cursor: pointer; user-select: none;"
            :style="{ background: expandedMonths[i] ? '#331a1a' : '#0f0f0f' }"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1;">
                <div style="color: #e74c3c; font-size: 9px; font-weight: 600;">
                  {{ expandedMonths[i] ? '▼' : '▶' }} {{ month.monthName }} {{ month.year }}
                </div>
                <div style="color: #888; font-size: 7px;">{{ month.global.daysWithActivity }} active days</div>
              </div>
              <div style="text-align: right;">
                <div style="color: #fff; font-size: 10px; font-weight: 600;">{{ month.global.totalOrders }} orders</div>
                <div style="color: #ffd700; font-size: 8px;">${{ formatNumber(month.global.totalCost.toFixed(2)) }}</div>
              </div>
            </div>
          </div>

          <!-- Month Details - Expandable -->
          <div v-if="expandedMonths[i]" style="margin-top: 4px; padding: 10px; background: #0a0a0a; border-radius: 6px; border: 1px solid #2a2a2a;">

            <!-- PER API KEY STATS -->
            <div v-for="(apiStats, apiKey) in month.perApi" :key="apiKey" style="margin-bottom: 12px; padding: 8px; background: #1a1a1a; border-radius: 6px; border-left: 3px solid;">
              <div :style="`border-left-color: ${apiKeyColors[apiKey]};`">
                <div :style="`color: ${apiKeyColors[apiKey]}; font-size: 9px; font-weight: 700; margin-bottom: 6px;`">
                  🔑 {{ apiKey }}
                </div>

                <!-- BUY/SELL Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px;">
                  <!-- BUY -->
                  <div style="background: #0f0f0f; padding: 5px; border-radius: 4px; border-left: 2px solid #20b2aa;">
                    <div style="color: #20b2aa; font-size: 7px; font-weight: 600; margin-bottom: 3px;">🟢 BUY</div>
                    <div style="font-size: 8px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #20b2aa; font-weight: 600;">{{ apiStats.buyOrders }}</span></div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Vol: {{ formatNumber(apiStats.buyVolume.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Cost: ${{ formatNumber(apiStats.buyCost.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #ffd700;">Avg: ${{ apiStats.avgBuyPrice.toFixed(4) }}</div>
                  </div>

                  <!-- SELL -->
                  <div style="background: #0f0f0f; padding: 5px; border-radius: 4px; border-left: 2px solid #cd5c5c;">
                    <div style="color: #cd5c5c; font-size: 7px; font-weight: 600; margin-bottom: 3px;">🔴 SELL</div>
                    <div style="font-size: 8px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #cd5c5c; font-weight: 600;">{{ apiStats.sellOrders }}</span></div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Vol: {{ formatNumber(apiStats.sellVolume.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #888; margin-bottom: 1px;">Cost: ${{ formatNumber(apiStats.sellCost.toFixed(2)) }}</div>
                    <div style="font-size: 7px; color: #ffd700;">Avg: ${{ apiStats.avgSellPrice.toFixed(4) }}</div>
                  </div>
                </div>

                <!-- Overall for this API -->
                <div style="background: #0f0f0f; padding: 5px; border-radius: 4px; margin-bottom: 6px;">
                  <div style="color: #888; font-size: 7px; font-weight: 600; margin-bottom: 3px;">📊 TOTALS</div>
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 6px;">
                    <div><span style="color: #666;">Orders:</span> <span style="color: #fff; font-weight: 600;">{{ apiStats.totalOrders }}</span></div>
                    <div><span style="color: #666;">Volume:</span> <span style="color: #fff; font-weight: 600;">{{ formatNumber(apiStats.totalVolume.toFixed(2)) }}</span></div>
                    <div><span style="color: #666;">Cost:</span> <span style="color: #ffd700; font-weight: 600;">${{ formatNumber(apiStats.totalCost.toFixed(2)) }}</span></div>
                    <div><span style="color: #666;">Avg Price:</span> <span style="color: #ffd700; font-weight: 600;">${{ apiStats.avgPrice.toFixed(4) }}</span></div>
                  </div>
                </div>

                <!-- Biggest Orders for this API -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                  <div style="background: #0f0f0f; padding: 4px; border-radius: 4px;">
                    <div style="color: #20b2aa; font-size: 6px; font-weight: 600; margin-bottom: 2px;">💎 Biggest BUY</div>
                    <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(apiStats.biggestBuy.amount.toFixed(2)) }} @ ${{ apiStats.biggestBuy.price.toFixed(4) }}</div>
                    <div style="font-size: 7px; color: #20b2aa; font-weight: 600;">${{ formatNumber(apiStats.biggestBuy.cost.toFixed(2)) }}</div>
                  </div>
                  <div style="background: #0f0f0f; padding: 4px; border-radius: 4px;">
                    <div style="color: #cd5c5c; font-size: 6px; font-weight: 600; margin-bottom: 2px;">💎 Biggest SELL</div>
                    <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(apiStats.biggestSell.amount.toFixed(2)) }} @ ${{ apiStats.biggestSell.price.toFixed(4) }}</div>
                    <div style="font-size: 7px; color: #cd5c5c; font-weight: 600;">${{ formatNumber(apiStats.biggestSell.cost.toFixed(2)) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- GLOBAL TOTAL FOR MONTH -->
            <div style="padding: 10px; background: #1a1a1a; border-radius: 6px; border: 2px solid #e74c3c;">
              <div style="color: #e74c3c; font-size: 10px; font-weight: 700; margin-bottom: 8px; text-align: center;">🌍 GLOBAL TOTAL</div>

              <!-- BUY/SELL Stats Grid -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
                <!-- BUY -->
                <div style="background: #0f0f0f; padding: 6px; border-radius: 4px; border-left: 2px solid #20b2aa;">
                  <div style="color: #20b2aa; font-size: 8px; font-weight: 600; margin-bottom: 4px;">🟢 TOTAL BUY</div>
                  <div style="font-size: 9px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #20b2aa; font-weight: 600;">{{ month.global.buyOrders }}</span></div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Vol: {{ formatNumber(month.global.buyVolume.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Cost: ${{ formatNumber(month.global.buyCost.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #ffd700;">Avg: ${{ month.global.avgBuyPrice.toFixed(4) }}</div>
                </div>

                <!-- SELL -->
                <div style="background: #0f0f0f; padding: 6px; border-radius: 4px; border-left: 2px solid #cd5c5c;">
                  <div style="color: #cd5c5c; font-size: 8px; font-weight: 600; margin-bottom: 4px;">🔴 TOTAL SELL</div>
                  <div style="font-size: 9px; color: #fff; margin-bottom: 2px;">Count: <span style="color: #cd5c5c; font-weight: 600;">{{ month.global.sellOrders }}</span></div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Vol: {{ formatNumber(month.global.sellVolume.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">Cost: ${{ formatNumber(month.global.sellCost.toFixed(2)) }}</div>
                  <div style="font-size: 8px; color: #ffd700;">Avg: ${{ month.global.avgSellPrice.toFixed(4) }}</div>
                </div>
              </div>

              <!-- Overall Global Stats -->
              <div style="background: #0f0f0f; padding: 6px; border-radius: 4px; margin-bottom: 8px;">
                <div style="color: #e74c3c; font-size: 8px; font-weight: 600; margin-bottom: 4px;">📊 OVERALL</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 7px;">
                  <div><span style="color: #888;">Total Orders:</span> <span style="color: #fff; font-weight: 600;">{{ month.global.totalOrders }}</span></div>
                  <div><span style="color: #888;">Total Volume:</span> <span style="color: #fff; font-weight: 600;">{{ formatNumber(month.global.totalVolume.toFixed(2)) }}</span></div>
                  <div><span style="color: #888;">Total Cost:</span> <span style="color: #ffd700; font-weight: 600;">${{ formatNumber(month.global.totalCost.toFixed(2)) }}</span></div>
                  <div><span style="color: #888;">Avg Price:</span> <span style="color: #ffd700; font-weight: 600;">${{ month.global.avgPrice.toFixed(4) }}</span></div>
                </div>
              </div>

              <!-- Biggest Orders Global -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <div style="background: #0f0f0f; padding: 5px; border-radius: 4px;">
                  <div style="color: #20b2aa; font-size: 7px; font-weight: 600; margin-bottom: 2px;">💎 Biggest BUY</div>
                  <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(month.global.biggestBuy.amount.toFixed(2)) }} @ ${{ month.global.biggestBuy.price.toFixed(4) }}</div>
                  <div style="font-size: 7px; color: #20b2aa; font-weight: 600;">${{ formatNumber(month.global.biggestBuy.cost.toFixed(2)) }}</div>
                </div>
                <div style="background: #0f0f0f; padding: 5px; border-radius: 4px;">
                  <div style="color: #cd5c5c; font-size: 7px; font-weight: 600; margin-bottom: 2px;">💎 Biggest SELL</div>
                  <div style="font-size: 6px; color: #888; margin-bottom: 1px;">{{ formatNumber(month.global.biggestSell.amount.toFixed(2)) }} @ ${{ month.global.biggestSell.price.toFixed(4) }}</div>
                  <div style="font-size: 7px; color: #cd5c5c; font-weight: 600;">${{ formatNumber(month.global.biggestSell.cost.toFixed(2)) }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedApiKeys: {
    type: Array,
    required: true,
    default: () => []
  },
  apiKeyColors: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Expanded state
const expandedWeeks = ref({});
const expandedMonths = ref({});

// Toggle functions
function toggleWeek(index) {
  expandedWeeks.value[index] = !expandedWeeks.value[index];
}

function toggleMonth(index) {
  expandedMonths.value[index] = !expandedMonths.value[index];
}

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper function to get start and end of week
function getWeekDates(year, weekNum) {
  const jan1 = new Date(year, 0, 1);
  const daysToMonday = (jan1.getDay() === 0 ? 6 : jan1.getDay() - 1);
  const firstMonday = new Date(year, 0, 1 + (7 - daysToMonday));
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { start: weekStart, end: weekEnd };
}

// Helper to calculate stats for a set of orders
function calculateStats(orders) {
  const buyOrders = orders.filter(o => o.side === 'buy');
  const sellOrders = orders.filter(o => o.side === 'sell');

  const buyVolume = buyOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const sellVolume = sellOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const buyCost = buyOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
  const sellCost = sellOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
  const buyPriceSum = buyOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const sellPriceSum = sellOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const allPriceSum = orders.reduce((sum, o) => sum + (o.price || 0), 0);

  const biggestBuy = buyOrders.length > 0
    ? buyOrders.reduce((max, o) => (o.cost > max.cost ? o : max), buyOrders[0])
    : { amount: 0, price: 0, cost: 0 };
  const biggestSell = sellOrders.length > 0
    ? sellOrders.reduce((max, o) => (o.cost > max.cost ? o : max), sellOrders[0])
    : { amount: 0, price: 0, cost: 0 };

  return {
    totalOrders: orders.length,
    buyOrders: buyOrders.length,
    sellOrders: sellOrders.length,
    buyVolume,
    sellVolume,
    totalVolume: buyVolume + sellVolume,
    buyCost,
    sellCost,
    totalCost: buyCost + sellCost,
    avgBuyPrice: buyOrders.length > 0 ? buyPriceSum / buyOrders.length : 0,
    avgSellPrice: sellOrders.length > 0 ? sellPriceSum / sellOrders.length : 0,
    avgPrice: orders.length > 0 ? allPriceSum / orders.length : 0,
    biggestBuy,
    biggestSell
  };
}

// Weekly Trades Computed
const weeklyTrades = computed(() => {
  const weekStats = {};

  // Group orders by week
  props.allOrders.forEach(order => {
    const date = new Date(order.datetime);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    const key = `${year}-W${weekNum}`;

    if (!weekStats[key]) {
      const dates = getWeekDates(year, weekNum);
      weekStats[key] = {
        year,
        weekNumber: weekNum,
        dateRange: `${dates.start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${dates.end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
        orders: [],
        perApi: {}
      };
    }

    weekStats[key].orders.push(order);

    // Group by API
    const apiKey = order.apiKeyName;
    if (!weekStats[key].perApi[apiKey]) {
      weekStats[key].perApi[apiKey] = [];
    }
    weekStats[key].perApi[apiKey].push(order);
  });

  // Calculate stats for each week
  return Object.values(weekStats)
    .map(week => {
      // Calculate per-API stats
      const perApiStats = {};
      for (const apiKey in week.perApi) {
        perApiStats[apiKey] = calculateStats(week.perApi[apiKey]);
      }

      // Calculate global stats
      const globalStats = calculateStats(week.orders);

      return {
        year: week.year,
        weekNumber: week.weekNumber,
        dateRange: week.dateRange,
        perApi: perApiStats,
        global: globalStats
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.weekNumber - a.weekNumber;
    });
});

// Monthly Trades Computed
const monthlyTrades = computed(() => {
  const monthStats = {};
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Group orders by month
  props.allOrders.forEach(order => {
    const date = new Date(order.datetime);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;

    if (!monthStats[key]) {
      monthStats[key] = {
        year,
        month,
        monthName: monthNames[month],
        orders: [],
        perApi: {},
        dailyStats: {}
      };
    }

    monthStats[key].orders.push(order);

    // Group by API
    const apiKey = order.apiKeyName;
    if (!monthStats[key].perApi[apiKey]) {
      monthStats[key].perApi[apiKey] = [];
    }
    monthStats[key].perApi[apiKey].push(order);

    // Track daily activity
    const dayKey = date.toDateString();
    if (!monthStats[key].dailyStats[dayKey]) {
      monthStats[key].dailyStats[dayKey] = 0;
    }
    monthStats[key].dailyStats[dayKey]++;
  });

  // Calculate stats for each month
  return Object.values(monthStats)
    .map(month => {
      // Calculate per-API stats
      const perApiStats = {};
      for (const apiKey in month.perApi) {
        perApiStats[apiKey] = calculateStats(month.perApi[apiKey]);
      }

      // Calculate global stats
      const globalStats = calculateStats(month.orders);
      globalStats.daysWithActivity = Object.keys(month.dailyStats).length;

      return {
        year: month.year,
        month: month.month,
        monthName: month.monthName,
        perApi: perApiStats,
        global: globalStats
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
});

// Utility function
function formatNumber(num) {
  if (!num) return '0';
  const numStr = num.toString();
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
</script>
