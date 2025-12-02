<template>
  <div class="toolz-botz-bar">
    <!-- Header Section -->
    <div class="bar-header">
      <div class="header-content">
        <div class="header-icon">🤖</div>
        <div class="header-text">
          <h2>TRADING BOTS TOOLZ</h2>
          <p>Professional Trading Bot Arsenal - {{ bots.length }} Active Strategies</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">Active Bots</span>
          <span class="stat-value">{{ totalDeployed }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Profit</span>
          <span class="stat-value profit">+{{ totalProfit }}%</span>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="category in categories"
        :key="category"
        :class="['tab-btn', { active: selectedCategory === category }]"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <!-- Bots Grid -->
    <div class="bots-grid">
      <div
        v-for="bot in filteredBots"
        :key="bot.id"
        :class="['bot-card', `risk-${bot.riskLevel.toLowerCase()}`]"
        @click="openBot(bot)"
      >
        <!-- Bot Header -->
        <div class="bot-header">
          <div class="bot-icon">{{ bot.icon }}</div>
          <div class="bot-info">
            <h3 class="bot-name">{{ bot.name }}</h3>
            <span class="bot-category">{{ bot.category }}</span>
          </div>
          <div :class="['risk-badge', `risk-${bot.riskLevel.toLowerCase()}`]">
            {{ bot.riskLevel }}
          </div>
        </div>

        <!-- Bot Description -->
        <p class="bot-description">{{ bot.description }}</p>

        <!-- Bot Metrics -->
        <div class="bot-metrics">
          <div class="metric">
            <span class="metric-label">Success</span>
            <span class="metric-value success">{{ bot.successRate }}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Return</span>
            <span class="metric-value profit">+{{ bot.avgReturn }}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Drawdown</span>
            <span class="metric-value danger">-{{ bot.maxDrawdown }}%</span>
          </div>
        </div>

        <!-- Bot Stats -->
        <div class="bot-stats">
          <div class="stat">
            <span class="stat-icon">💰</span>
            <span class="stat-text">Min: ${{ bot.minInvestment }}</span>
          </div>
          <div class="stat">
            <span class="stat-icon">⏱️</span>
            <span class="stat-text">{{ bot.timeframe }}</span>
          </div>
          <div class="stat">
            <span class="stat-icon">📊</span>
            <span class="stat-text">{{ bot.deployedCount }} active</span>
          </div>
        </div>

        <!-- Recommended Markets -->
        <div class="markets">
          <span
            v-for="market in bot.recommendedMarkets.slice(0, 3)"
            :key="market"
            class="market-tag"
          >
            {{ market }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="bot-actions">
          <button class="btn-deploy" @click.stop="openDeployModal(bot)">
            🚀 Deploy
          </button>
          <button class="btn-details" @click.stop="viewDetails(bot)">
            📊 Details
          </button>
        </div>

        <!-- Hover Overlay -->
        <div class="hover-overlay">
          <div class="overlay-content">
            <h4>Key Features</h4>
            <ul>
              <li v-for="(feature, idx) in bot.features.slice(0, 3)" :key="idx">
                ✓ {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Footer -->
    <div class="bar-footer">
      <div class="footer-stat">
        <span class="footer-icon">⚡</span>
        <span class="footer-text">{{ filteredBots.length }} Strategies Available</span>
      </div>
      <div class="footer-stat">
        <span class="footer-icon">🎯</span>
        <span class="footer-text">{{ avgSuccessRate }}% Avg Success Rate</span>
      </div>
      <div class="footer-stat">
        <span class="footer-icon">💎</span>
        <span class="footer-text">All Risk Levels Covered</span>
      </div>
    </div>

    <!-- Deploy Modal -->
    <n-modal
      v-model:show="showDeployModal"
      :mask-closable="false"
      preset="dialog"
      :title="`Deploy ${selectedBot?.name || 'Bot'}`"
      style="width: 600px; background: #0a0e27; color: #fff;"
    >
      <div v-if="selectedBot" style="padding: 20px;">
        <!-- Bot Info Header -->
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 48px;">{{ selectedBot.icon }}</div>
            <div style="flex: 1;">
              <h3 style="margin: 0; color: #ff6b35; font-size: 18px;">{{ selectedBot.name }}</h3>
              <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">{{ selectedBot.description }}</p>
            </div>
            <div :class="['risk-badge', `risk-${selectedBot.riskLevel.toLowerCase()}`]">
              {{ selectedBot.riskLevel }} Risk
            </div>
          </div>
        </div>

        <!-- Deploy Configuration Form -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <!-- Bot Name -->
          <div>
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px; font-weight: 600;">BOT NAME</label>
            <n-input
              v-model:value="deployConfig.botName"
              placeholder="Enter bot name"
              size="large"
            />
          </div>

          <!-- Exchange Selection -->
          <div>
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px; font-weight: 600;">EXCHANGE</label>
            <n-select
              v-model:value="deployConfig.exchange"
              :options="exchangeOptions"
              placeholder="Select exchange"
              size="large"
            />
          </div>

          <!-- Market/Symbol Selection -->
          <div>
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px; font-weight: 600;">TRADING PAIR</label>
            <n-select
              v-model:value="deployConfig.symbol"
              :options="symbolOptions"
              placeholder="Select trading pair"
              size="large"
              filterable
            />
          </div>

          <!-- Investment Amount -->
          <div>
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px; font-weight: 600;">INVESTMENT AMOUNT (USDT)</label>
            <n-input-number
              v-model:value="deployConfig.totalInvestment"
              :min="selectedBot.minInvestment"
              :step="50"
              style="width: 100%;"
              size="large"
            >
              <template #prefix>$</template>
            </n-input-number>
            <div style="color: #888; font-size: 10px; margin-top: 5px;">
              Minimum: ${{ selectedBot.minInvestment }}
            </div>
          </div>

          <!-- Bot-Specific Settings -->
          <div v-if="selectedBot.category === 'Grid Trading'" style="display: flex; flex-direction: column; gap: 10px;">

            <!-- BASIC CONFIG Section -->
            <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; overflow: hidden;">
              <div
                @click="showBasicConfig = !showBasicConfig"
                style="padding: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(15,52,96,0.4);"
              >
                <span style="color: #ff6b35; font-size: 12px; font-weight: 700;">📊 BASIC CONFIG</span>
                <span style="color: #888;">{{ showBasicConfig ? '▼' : '▶' }}</span>
              </div>
              <div v-show="showBasicConfig" style="padding: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Lower Price</label>
                    <n-input-number v-model:value="deployConfig.lowerPrice" :min="0" :step="0.000001" :precision="6" style="width: 100%;" size="small" />
                  </div>
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Upper Price</label>
                    <n-input-number v-model:value="deployConfig.upperPrice" :min="0" :step="0.000001" :precision="6" style="width: 100%;" size="small" />
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Nr of Grids</label>
                    <n-input-number v-model:value="deployConfig.nrOfGrids" :min="5" :max="100" style="width: 100%;" size="small" />
                  </div>
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Amount</label>
                    <n-input-number v-model:value="deployConfig.amount" :min="0" :step="1" style="width: 100%;" size="small" />
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Amount Type</label>
                    <n-select v-model:value="deployConfig.amountType" :options="amountTypeOptions" size="small" />
                  </div>
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Orders Side</label>
                    <n-select v-model:value="deployConfig.ordersSide" :options="ordersSideOptions" size="small" />
                  </div>
                </div>
              </div>
            </div>

            <!-- ADVANCED CONFIG Section -->
            <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; overflow: hidden;">
              <div
                @click="showAdvancedConfig = !showAdvancedConfig"
                style="padding: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(15,52,96,0.4);"
              >
                <span style="color: #ff6b35; font-size: 12px; font-weight: 700;">⚙️ ADVANCED CONFIG</span>
                <span style="color: #888;">{{ showAdvancedConfig ? '▼' : '▶' }}</span>
              </div>
              <div v-show="showAdvancedConfig" style="padding: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Incremental % Buy</label>
                    <n-input-number v-model:value="deployConfig.incrementalPercentAmountBuy" :min="0" :max="100" :step="0.1" style="width: 100%;" size="small" />
                  </div>
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Incremental % Sell</label>
                    <n-input-number v-model:value="deployConfig.incrementalPercentAmountSell" :min="0" :max="100" :step="0.1" style="width: 100%;" size="small" />
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Deviation Price Buy</label>
                    <n-input-number v-model:value="deployConfig.deviationPriceBuy" :min="0" :step="0.1" style="width: 100%;" size="small" />
                  </div>
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Deviation Price Sell</label>
                    <n-input-number v-model:value="deployConfig.deviationPriceSell" :min="0" :step="0.1" style="width: 100%;" size="small" />
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Deviation Amount Buy</label>
                    <n-input-number v-model:value="deployConfig.deviationAmountBuy" :min="0" :step="0.1" style="width: 100%;" size="small" />
                  </div>
                  <div>
                    <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Deviation Amount Sell</label>
                    <n-input-number v-model:value="deployConfig.deviationAmountSell" :min="0" :step="0.1" style="width: 100%;" size="small" />
                  </div>
                </div>
                <div style="margin-top: 10px;">
                  <n-checkbox v-model:checked="deployConfig.usePriceGroup">
                    <span style="color: #aaa; font-size: 11px;">Use Price Grouping</span>
                  </n-checkbox>
                  <div v-if="deployConfig.usePriceGroup" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
                    <div>
                      <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Price Group Buy</label>
                      <n-input-number v-model:value="deployConfig.priceGroupBuy" :min="0" :step="1" style="width: 100%;" size="small" />
                    </div>
                    <div>
                      <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Price Group Sell</label>
                      <n-input-number v-model:value="deployConfig.priceGroupSell" :min="0" :step="1" style="width: 100%;" size="small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- QUICK PRICE Actions Section -->
            <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; overflow: hidden;">
              <div
                @click="showPriceActions = !showPriceActions"
                style="padding: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(15,52,96,0.4);"
              >
                <span style="color: #ff6b35; font-size: 12px; font-weight: 700;">⚡ QUICK PRICE</span>
                <span style="color: #888;">{{ showPriceActions ? '▼' : '▶' }}</span>
              </div>
              <div v-show="showPriceActions" style="padding: 12px;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                  <button @click="updatePrices(0.01)" style="padding: 8px; background: rgba(16,235,4,0.2); border: 1px solid #10eb04; border-radius: 6px; color: #10eb04; font-size: 11px; cursor: pointer;">±1%</button>
                  <button @click="updatePrices(0.02)" style="padding: 8px; background: rgba(16,235,4,0.2); border: 1px solid #10eb04; border-radius: 6px; color: #10eb04; font-size: 11px; cursor: pointer;">±2%</button>
                  <button @click="updatePrices(0.05)" style="padding: 8px; background: rgba(16,235,4,0.2); border: 1px solid #10eb04; border-radius: 6px; color: #10eb04; font-size: 11px; cursor: pointer;">±5%</button>
                  <button @click="updatePrices(0.10)" style="padding: 8px; background: rgba(16,235,4,0.2); border: 1px solid #10eb04; border-radius: 6px; color: #10eb04; font-size: 11px; cursor: pointer;">±10%</button>
                </div>
              </div>
            </div>

            <!-- STRATEGIES Section -->
            <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; overflow: hidden;">
              <div
                @click="showStrategies = !showStrategies"
                style="padding: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(15,52,96,0.4);"
              >
                <span style="color: #ff6b35; font-size: 12px; font-weight: 700;">💡 STRATEGIES</span>
                <span style="color: #888;">{{ showStrategies ? '▼' : '▶' }}</span>
              </div>
              <div v-show="showStrategies" style="padding: 12px;">
                <div style="margin-bottom: 10px;">
                  <label style="color: #888; font-size: 10px; display: block; margin-bottom: 5px;">Saved Strategies</label>
                  <n-select v-model:value="selectedStrategy" :options="strategyOptions" size="small" placeholder="Select strategy" />
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                  <button @click="saveStrategy" style="padding: 8px; background: rgba(16,235,4,0.2); border: 1px solid #10eb04; border-radius: 6px; color: #10eb04; font-size: 10px; cursor: pointer;">💾 Save</button>
                  <button @click="loadStrategy" style="padding: 8px; background: rgba(99,102,241,0.2); border: 1px solid #6366f1; border-radius: 6px; color: #6366f1; font-size: 10px; cursor: pointer;">📂 Load</button>
                  <button @click="deleteStrategy" style="padding: 8px; background: rgba(245,42,9,0.2); border: 1px solid #f52a09; border-radius: 6px; color: #f52a09; font-size: 10px; cursor: pointer;">🗑️ Delete</button>
                </div>
              </div>
            </div>

            <!-- Auto-Start -->
            <div style="background: rgba(15,52,96,0.2); padding: 12px; border-radius: 8px; border: 1px solid #0f3460;">
              <n-checkbox v-model:checked="deployConfig.autoStart">
                <span style="color: #aaa; font-size: 12px;">Start bot immediately after deployment</span>
              </n-checkbox>
            </div>
          </div>

          <!-- Summary -->
          <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; padding: 15px; border-radius: 8px;">
            <div style="color: #10eb04; font-size: 11px; font-weight: 700; margin-bottom: 10px;">DEPLOYMENT SUMMARY</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; color: #aaa; font-size: 11px;">
                <span>Bot Type:</span>
                <span style="color: #fff; font-weight: 600;">{{ selectedBot.name }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #aaa; font-size: 11px;">
                <span>Expected Success Rate:</span>
                <span style="color: #10eb04; font-weight: 600;">{{ selectedBot.successRate }}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #aaa; font-size: 11px;">
                <span>Est. Monthly Return:</span>
                <span style="color: #10eb04; font-weight: 600;">+{{ selectedBot.avgReturn }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <n-button @click="showDeployModal = false" size="large">Cancel</n-button>
          <n-button
            type="primary"
            @click="confirmDeploy"
            :loading="isDeploying"
            size="large"
            style="background: #ff6b35; border: none;"
          >
            🚀 Deploy Bot
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Details Modal -->
    <n-modal
      v-model:show="showDetailsModal"
      :mask-closable="true"
      preset="dialog"
      :title="`${selectedBot?.name || 'Bot'} Details`"
      style="width: 700px; background: #0a0e27; color: #fff;"
    >
      <div v-if="selectedBot" style="padding: 20px;">
        <!-- Performance Metrics -->
        <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #ff6b35; font-size: 13px; font-weight: 700; margin-bottom: 15px;">PERFORMANCE METRICS</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="text-align: center;">
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">Success Rate</div>
              <div style="color: #10eb04; font-size: 24px; font-weight: 700;">{{ selectedBot.successRate }}%</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">Avg Return</div>
              <div style="color: #10eb04; font-size: 24px; font-weight: 700;">+{{ selectedBot.avgReturn }}%</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">Max Drawdown</div>
              <div style="color: #f52a09; font-size: 24px; font-weight: 700;">-{{ selectedBot.maxDrawdown }}%</div>
            </div>
          </div>
        </div>

        <!-- Key Features -->
        <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #ff6b35; font-size: 13px; font-weight: 700; margin-bottom: 12px;">KEY FEATURES</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div v-for="(feature, idx) in selectedBot.features" :key="idx" style="display: flex; align-items: start; gap: 10px;">
              <span style="color: #10eb04; font-size: 14px;">✓</span>
              <span style="color: #aaa; font-size: 12px; line-height: 1.6;">{{ feature }}</span>
            </div>
          </div>
        </div>

        <!-- Recommended Markets -->
        <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
          <div style="color: #ff6b35; font-size: 13px; font-weight: 700; margin-bottom: 12px;">RECOMMENDED MARKETS</div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <span
              v-for="market in selectedBot.recommendedMarkets"
              :key="market"
              style="padding: 8px 12px; background: rgba(16,235,4,0.2); color: #10eb04; border-radius: 6px; font-size: 11px; font-weight: 600;"
            >
              {{ market }}
            </span>
          </div>
        </div>
      </div>

      <template #action>
        <n-button type="primary" @click="showDetailsModal = false; openDeployModal(selectedBot);" size="large" style="background: #ff6b35; border: none;">
          🚀 Deploy This Bot
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();

// Emit events
const emit = defineEmits(['bot-deployed', 'view-details']);

// State
const selectedCategory = ref('All');
const showDeployModal = ref(false);
const showDetailsModal = ref(false);
const selectedBot = ref(null);
const isDeploying = ref(false);

// Categories
const categories = ['All', 'Grid Trading', 'Arbitrage', 'Scalping', 'Trend Following', 'DCA', 'Market Making'];

// Collapsed sections state
const showBasicConfig = ref(true);
const showAdvancedConfig = ref(false);
const showPriceActions = ref(false);
const showStrategies = ref(false);

// Deploy Configuration
const deployConfig = ref({
  botName: '',
  exchange: 'LCX',
  symbol: 'LCX/USDT',
  totalInvestment: 500,
  autoStart: true,
  // Grid Bot fields
  lowerPrice: 0,
  upperPrice: 0,
  amountType: 'incrementalPercent',
  amount: 0,
  nrOfGrids: 20,
  ordersSide: 'buyOrSell',
  incrementalPercentAmountBuy: 0,
  incrementalPercentAmountSell: 0,
  deviationPriceBuy: 0,
  deviationPriceSell: 0,
  deviationAmountBuy: 0,
  deviationAmountSell: 0,
  usePriceGroup: false,
  priceGroupBuy: 0,
  priceGroupSell: 0
});

// Amount Type Options
const amountTypeOptions = [
  { value: 'quantityPerGrid', label: 'Qty Per Grid' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'incrementalPercent', label: 'Incremental Amount' }
];

// Orders Side Options
const ordersSideOptions = [
  { value: 'buyOrSell', label: 'Buy & Sell' },
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' }
];

// Strategy management
const selectedStrategy = ref('');
const strategyOptions = ref([]);

// Exchange Options
const exchangeOptions = [
  { label: 'LCX Exchange', value: 'LCX' },
  { label: 'Coinbase Advanced', value: 'coinbase' },
  { label: 'Binance', value: 'binance' },
  { label: 'Kraken', value: 'kraken' }
];

// Symbol Options (will be populated based on exchange)
const symbolOptions = computed(() => {
  return [
    { label: 'LCX/USDT', value: 'LCX/USDT' },
    { label: 'BTC/USDT', value: 'BTC/USDT' },
    { label: 'ETH/USDT', value: 'ETH/USDT' },
    { label: 'BNB/USDT', value: 'BNB/USDT' },
    { label: 'SOL/USDT', value: 'SOL/USDT' },
    { label: 'ADA/USDT', value: 'ADA/USDT' }
  ];
});

// Bots Data
const bots = ref([
  {
    id: 'gridbot-plus',
    name: 'GridBot Plus',
    icon: '⚡',
    category: 'Grid Trading',
    riskLevel: 'Medium',
    description: 'Advanced grid trading bot with AI-powered optimization and dynamic spacing.',
    successRate: 89,
    avgReturn: 16.7,
    maxDrawdown: 7.5,
    minInvestment: 500,
    timeframe: 'Daily',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'LCX/USDT'],
    features: [
      'AI-powered grid optimization',
      'Dynamic price range adjustment',
      'Multi-timeframe analysis',
      'Advanced risk management',
      'Real-time performance tracking'
    ],
    deployedCount: 178,
    totalProfit: 2456,
    route: '/grid-bots-plus'
  },
  {
    id: 'standard-gridbot',
    name: 'Standard GridBot',
    icon: '📊',
    category: 'Grid Trading',
    riskLevel: 'Low',
    description: 'Classic grid trading strategy perfect for beginners and sideways markets.',
    successRate: 85,
    avgReturn: 13.2,
    maxDrawdown: 6.8,
    minInvestment: 300,
    timeframe: 'Daily',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
    features: [
      'Simple setup and configuration',
      'Consistent profits in ranging markets',
      'Automated grid management',
      'Stop-loss protection'
    ],
    deployedCount: 245,
    totalProfit: 1987,
    route: '/grid-bots-plus'
  },
  {
    id: 'frontrun-bot',
    name: 'FrontRun Bot',
    icon: '🏃',
    category: 'Arbitrage',
    riskLevel: 'High',
    description: 'High-speed frontrunning bot that detects and capitalizes on large orders.',
    successRate: 71,
    avgReturn: 28.5,
    maxDrawdown: 19.3,
    minInvestment: 2000,
    timeframe: 'Real-time',
    recommendedMarkets: ['ETH/USDT', 'BTC/USDT', 'BNB/USDT'],
    features: [
      'Ultra-fast order detection',
      'Mempool monitoring',
      'Gas optimization strategies',
      'Smart contract integration',
      'Risk-adjusted position sizing'
    ],
    deployedCount: 67,
    totalProfit: 3876,
    route: '/Bots/FrontRun'
  },
  {
    id: 'scalping-bot',
    name: 'Scalp1ng Bot',
    icon: '🎯',
    category: 'Scalping',
    riskLevel: 'High',
    description: 'Professional scalping bot for high-frequency trading with technical indicators.',
    successRate: 73,
    avgReturn: 26.8,
    maxDrawdown: 14.2,
    minInvestment: 1000,
    timeframe: 'Intraday',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'LCX/USDT'],
    features: [
      'Sub-second execution speed',
      'Multiple technical indicators',
      'Order book depth analysis',
      'Volume-based entry signals',
      'Tight stop-loss management'
    ],
    deployedCount: 134,
    totalProfit: 3245,
    route: '/Bots/Scalp1ng'
  },
  {
    id: 'oneclick-bot',
    name: 'OneClick Bot',
    icon: '🖱️',
    category: 'Scalping',
    riskLevel: 'Medium',
    description: 'One-click trading bot for quick market entries with predefined strategies.',
    successRate: 78,
    avgReturn: 19.4,
    maxDrawdown: 10.6,
    minInvestment: 500,
    timeframe: 'Intraday',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    features: [
      'Instant strategy deployment',
      'Pre-configured risk settings',
      'Quick entry/exit execution',
      'Customizable templates',
      'Real-time P&L tracking'
    ],
    deployedCount: 156,
    totalProfit: 2134,
    route: '/Bots/OneClick'
  },
  {
    id: 'fib-bot',
    name: 'Fibonacci Bot',
    icon: '📈',
    category: 'Trend Following',
    riskLevel: 'Medium',
    description: 'Advanced bot using Fibonacci retracement levels for precise entries.',
    successRate: 82,
    avgReturn: 21.3,
    maxDrawdown: 11.4,
    minInvestment: 800,
    timeframe: 'Daily',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'LCX/USDT'],
    features: [
      'Automatic Fibonacci level detection',
      'Golden ratio trading signals',
      'Multi-timeframe confirmation',
      'Support/resistance identification',
      'Trend strength analysis'
    ],
    deployedCount: 189,
    totalProfit: 2789,
    route: '/Bots/FibBots'
  },
  {
    id: 'ai-bot',
    name: 'AI Trading Bot',
    icon: '🧠',
    category: 'Trend Following',
    riskLevel: 'Medium',
    description: 'Machine learning powered bot that adapts to market conditions.',
    successRate: 84,
    avgReturn: 23.7,
    maxDrawdown: 12.8,
    minInvestment: 1500,
    timeframe: 'Daily',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
    features: [
      'Neural network price prediction',
      'Adaptive learning algorithms',
      'Pattern recognition',
      'Sentiment analysis integration',
      'Continuous model improvement'
    ],
    deployedCount: 145,
    totalProfit: 3567,
    route: '/Bots/AIBOT'
  },
  {
    id: 'copilot-bot',
    name: 'Co-Pilot Bot',
    icon: '✈️',
    category: 'Trend Following',
    riskLevel: 'Medium',
    description: 'Intelligent assistant bot providing trading suggestions and execution.',
    successRate: 80,
    avgReturn: 17.9,
    maxDrawdown: 9.2,
    minInvestment: 600,
    timeframe: 'Daily',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'],
    features: [
      'Smart trade suggestions',
      'Risk assessment tools',
      'Semi-automated execution',
      'Market analysis dashboard',
      'Educational insights'
    ],
    deployedCount: 167,
    totalProfit: 2234,
    route: '/Bots/Co-Pilot'
  },
  {
    id: 'dca-grid-bot',
    name: 'DCA + Grid Bot',
    icon: '📊',
    category: 'DCA',
    riskLevel: 'Low',
    description: 'Hybrid strategy combining DCA with grid trading for maximum efficiency.',
    successRate: 91,
    avgReturn: 18.5,
    maxDrawdown: 6.4,
    minInvestment: 400,
    timeframe: 'Weekly',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    features: [
      'DCA accumulation strategy',
      'Grid profit-taking system',
      'Volatility adaptation',
      'Automated rebalancing',
      'Long-term wealth building'
    ],
    deployedCount: 223,
    totalProfit: 2678,
    route: '/dca-integration'
  },
  {
    id: 'smart-dca-bot',
    name: 'Smart DCA Bot',
    icon: '🎯',
    category: 'DCA',
    riskLevel: 'Low',
    description: 'Intelligent DCA bot that adjusts based on market conditions.',
    successRate: 93,
    avgReturn: 19.8,
    maxDrawdown: 5.1,
    minInvestment: 300,
    timeframe: 'Weekly',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
    features: [
      'Market condition analysis',
      'Dynamic buy amount adjustment',
      'RSI-based entry optimization',
      'Dip detection and acceleration',
      'Portfolio balancing'
    ],
    deployedCount: 267,
    totalProfit: 2945,
    route: '/smart-dca'
  },
  {
    id: 'grinder-bot',
    name: 'Grinder Bot',
    icon: '⚙️',
    category: 'Scalping',
    riskLevel: 'Medium',
    description: 'Continuous grinding bot making small consistent profits.',
    successRate: 76,
    avgReturn: 15.6,
    maxDrawdown: 8.9,
    minInvestment: 700,
    timeframe: 'Intraday',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'LCX/USDT'],
    features: [
      'Micro-profit accumulation',
      'High trade frequency',
      'Tight spread targeting',
      'Volume spike detection',
      'Compound profit reinvestment'
    ],
    deployedCount: 198,
    totalProfit: 2456,
    route: '/Bots/Grinder'
  },
  {
    id: 'orderbook-bot',
    name: 'OrderBook Bot',
    icon: '📖',
    category: 'Market Making',
    riskLevel: 'Medium',
    description: 'Advanced order book analysis bot profiting from liquidity imbalances.',
    successRate: 83,
    avgReturn: 14.3,
    maxDrawdown: 7.6,
    minInvestment: 1200,
    timeframe: 'Continuous',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'LCX/USDT'],
    features: [
      'Real-time order book scanning',
      'Liquidity gap detection',
      'Bid-ask spread optimization',
      'Large order anticipation',
      'Market depth analysis'
    ],
    deployedCount: 145,
    totalProfit: 2123,
    route: '/Bots/OrderBookBot'
  }
]);

// Computed Properties
const filteredBots = computed(() => {
  if (selectedCategory.value === 'All') {
    return bots.value;
  }
  return bots.value.filter(bot => bot.category === selectedCategory.value);
});

const totalDeployed = computed(() => {
  return bots.value.reduce((sum, bot) => sum + bot.deployedCount, 0);
});

const totalProfit = computed(() => {
  return bots.value.reduce((sum, bot) => sum + bot.totalProfit, 0);
});

const avgSuccessRate = computed(() => {
  const total = bots.value.reduce((sum, bot) => sum + bot.successRate, 0);
  return Math.round(total / bots.value.length);
});

// Methods
const openDeployModal = (bot) => {
  selectedBot.value = bot;
  deployConfig.value.botName = `${bot.name} - ${new Date().toISOString().split('T')[0]}`;
  deployConfig.value.totalInvestment = bot.minInvestment;
  showDeployModal.value = true;
};

const viewDetails = (bot) => {
  selectedBot.value = bot;
  showDetailsModal.value = true;
};

// Quick Price update function
const updatePrices = (deviationPercent) => {
  // Get current market price (you can fetch this from orderbook or ticker)
  const currentPrice = 0.10; // Placeholder - should be fetched from market

  deployConfig.value.lowerPrice = parseFloat((currentPrice * (1 - deviationPercent)).toFixed(6));
  deployConfig.value.upperPrice = parseFloat((currentPrice * (1 + deviationPercent)).toFixed(6));

  message.info(`Prices updated: ±${(deviationPercent * 100).toFixed(0)}%`);
};

// Strategy management functions
const saveStrategy = () => {
  const strategyName = prompt('Enter strategy name:');
  if (!strategyName) return;

  const strategies = JSON.parse(localStorage.getItem('botStrategies') || '[]');

  const newStrategy = {
    name: strategyName,
    config: { ...deployConfig.value }
  };

  strategies.push(newStrategy);
  localStorage.setItem('botStrategies', JSON.stringify(strategies));

  strategyOptions.value.push({ label: strategyName, value: strategyName });
  selectedStrategy.value = strategyName;

  message.success(`Strategy "${strategyName}" saved!`);
};

const loadStrategy = () => {
  if (!selectedStrategy.value) {
    message.warning('Please select a strategy first');
    return;
  }

  const strategies = JSON.parse(localStorage.getItem('botStrategies') || '[]');
  const strategy = strategies.find(s => s.name === selectedStrategy.value);

  if (strategy) {
    Object.assign(deployConfig.value, strategy.config);
    message.success(`Strategy "${selectedStrategy.value}" loaded!`);
  }
};

const deleteStrategy = () => {
  if (!selectedStrategy.value) {
    message.warning('Please select a strategy first');
    return;
  }

  const strategies = JSON.parse(localStorage.getItem('botStrategies') || '[]');
  const filtered = strategies.filter(s => s.name !== selectedStrategy.value);

  localStorage.setItem('botStrategies', JSON.stringify(filtered));
  strategyOptions.value = strategyOptions.value.filter(opt => opt.value !== selectedStrategy.value);

  message.success(`Strategy "${selectedStrategy.value}" deleted!`);
  selectedStrategy.value = '';
};

const confirmDeploy = async () => {
  if (!deployConfig.value.botName || !deployConfig.value.symbol) {
    message.warning('Please fill in all required fields');
    return;
  }

  isDeploying.value = true;

  try {
    // Build payload exactly like grid-bots-form-plus.vue
    const userID = useCookie('userID');

    const payload = {
      userID: userID.value,
      name: deployConfig.value.botName,
      exchange: deployConfig.value.exchange,
      symbol: deployConfig.value.symbol,
      lowerPrice: deployConfig.value.lowerPrice.toString(),
      upperPrice: deployConfig.value.upperPrice.toString(),
      amountType: deployConfig.value.amountType,
      amount: deployConfig.value.amount.toString(),
      nrOfGrids: deployConfig.value.nrOfGrids.toString(),
      ordersSide: deployConfig.value.ordersSide,
      incrementalPercentAmountBuy: deployConfig.value.incrementalPercentAmountBuy.toString(),
      incrementalPercentAmountSell: deployConfig.value.incrementalPercentAmountSell.toString(),
      apiKeyNames: [], // Will be populated from store
      config: {
        deviationPriceBuy: deployConfig.value.deviationPriceBuy,
        deviationPriceSell: deployConfig.value.deviationPriceSell,
        deviationAmountBuy: deployConfig.value.deviationAmountBuy,
        deviationAmountSell: deployConfig.value.deviationAmountSell,
        usePriceGroup: deployConfig.value.usePriceGroup,
        priceGroupBuy: deployConfig.value.priceGroupBuy,
        priceGroupSell: deployConfig.value.priceGroupSell
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
        BotX4: ''
      }
    };

    // Call API to create bot
    const response = await $fetch('/api/v1/createGridBot', {
      method: 'POST',
      body: payload
    });

    message.success(`Bot "${deployConfig.value.botName}" deployed successfully! 🚀`);

    // Emit event to parent
    emit('bot-deployed', { bot: selectedBot.value, config: deployConfig.value, response });

    // Close modal and reset
    showDeployModal.value = false;
    deployConfig.value = {
      botName: '',
      exchange: 'LCX',
      symbol: 'LCX/USDT',
      totalInvestment: 500,
      autoStart: true,
      lowerPrice: 0,
      upperPrice: 0,
      amountType: 'incrementalPercent',
      amount: 0,
      nrOfGrids: 20,
      ordersSide: 'buyOrSell',
      incrementalPercentAmountBuy: 0,
      incrementalPercentAmountSell: 0,
      deviationPriceBuy: 0,
      deviationPriceSell: 0,
      deviationAmountBuy: 0,
      deviationAmountSell: 0,
      usePriceGroup: false,
      priceGroupBuy: 0,
      priceGroupSell: 0
    };

  } catch (error) {
    console.error('Deploy error:', error);
    message.error(error.message || 'Failed to deploy bot. Please try again.');
  } finally {
    isDeploying.value = false;
  }
};
</script>

<style scoped>
.toolz-botz-bar {
  background: linear-gradient(180deg, #0a0e27 0%, #1a1a2e 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #0f3460;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Header */
.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #0f3460;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  font-size: 48px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.header-text h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, #ff6b35 0%, #f7931a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  margin: 5px 0 0 0;
  color: #888;
  font-size: 12px;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  color: #888;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin-top: 5px;
}

.stat-value.profit {
  color: #10eb04;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 15px;
  background: rgba(15, 52, 96, 0.2);
  border-radius: 8px;
}

.tab-btn {
  padding: 8px 16px;
  background: rgba(15, 52, 96, 0.4);
  border: 1px solid #0f3460;
  border-radius: 6px;
  color: #aaa;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 107, 53, 0.2);
  border-color: #ff6b35;
  color: #ff6b35;
}

.tab-btn.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

/* Bots Grid */
.bots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.bot-card {
  position: relative;
  background: rgba(15, 52, 96, 0.3);
  border: 1px solid #0f3460;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.bot-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  border-color: #ff6b35;
}

.bot-card:hover .hover-overlay {
  opacity: 1;
  pointer-events: all;
}

.bot-card.risk-low:hover {
  border-color: #10eb04;
}

.bot-card.risk-medium:hover {
  border-color: #f7931a;
}

.bot-card.risk-high:hover {
  border-color: #f52a09;
}

/* Bot Header */
.bot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bot-icon {
  font-size: 36px;
}

.bot-info {
  flex: 1;
}

.bot-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #ff6b35;
}

.bot-category {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Risk Badge */
.risk-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.risk-badge.risk-low {
  background: rgba(16, 235, 4, 0.2);
  color: #10eb04;
  border: 1px solid #10eb04;
}

.risk-badge.risk-medium {
  background: rgba(247, 147, 26, 0.2);
  color: #f7931a;
  border: 1px solid #f7931a;
}

.risk-badge.risk-high {
  background: rgba(245, 42, 9, 0.2);
  color: #f52a09;
  border: 1px solid #f52a09;
}

/* Bot Description */
.bot-description {
  color: #aaa;
  font-size: 11px;
  line-height: 1.5;
  margin-bottom: 15px;
  min-height: 40px;
}

/* Bot Metrics */
.bot-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  color: #888;
  font-size: 9px;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.metric-value {
  font-size: 14px;
  font-weight: 700;
}

.metric-value.success {
  color: #10eb04;
}

.metric-value.profit {
  color: #10eb04;
}

.metric-value.danger {
  color: #f52a09;
}

/* Bot Stats */
.bot-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 12px;
}

.stat-text {
  color: #aaa;
  font-size: 10px;
}

/* Markets */
.markets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.market-tag {
  padding: 4px 8px;
  background: rgba(16, 235, 4, 0.2);
  color: #10eb04;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
}

/* Action Buttons */
.bot-actions {
  display: flex;
  gap: 10px;
}

.btn-deploy,
.btn-details {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-deploy {
  background: #ff6b35;
  color: #fff;
}

.btn-deploy:hover {
  background: #ff8555;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.btn-details {
  background: rgba(15, 52, 96, 0.5);
  color: #aaa;
  border: 1px solid #0f3460;
}

.btn-details:hover {
  background: rgba(15, 52, 96, 0.8);
  color: #fff;
  border-color: #ff6b35;
}

/* Hover Overlay */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  border-radius: 12px;
  padding: 20px;
}

.overlay-content h4 {
  margin: 0 0 15px 0;
  color: #ff6b35;
  font-size: 14px;
  text-align: center;
}

.overlay-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.overlay-content li {
  color: #aaa;
  font-size: 11px;
  line-height: 1.8;
  padding: 5px 0;
  border-bottom: 1px solid rgba(15, 52, 96, 0.5);
}

.overlay-content li:last-child {
  border-bottom: none;
}

/* Footer */
.bar-footer {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: rgba(15, 52, 96, 0.2);
  border-radius: 8px;
  border: 1px solid #0f3460;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon {
  font-size: 18px;
}

.footer-text {
  color: #aaa;
  font-size: 11px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1200px) {
  .bots-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .bar-header {
    flex-direction: column;
    gap: 15px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .bots-grid {
    grid-template-columns: 1fr;
  }

  .bar-footer {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
