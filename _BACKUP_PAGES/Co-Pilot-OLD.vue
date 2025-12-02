<template>
  <div class="copilot-advanced">
    <!-- Header -->
    <div class="copilot-header">
      <h1 class="page-title">✈️ Co-Pilot - Advanced Order Management</h1>
      <p class="page-subtitle">Monitor, automate and create bots from your orders</p>
    </div>

    <!-- Filter Controls -->
    <n-card class="filter-card" size="small">
      <div class="filter-header">
        <span class="filter-title">🔍 Order Filters</span>
        <n-button size="small" @click="refreshOrders" :loading="loadingOrders">
          <template #icon><span>🔄</span></template>
          Refresh
        </n-button>
      </div>

      <n-space :size="12">
        <!-- Size Filter -->
        <n-button-group>
          <n-button
            size="small"
            :type="sizeFilter === 100 ? 'primary' : 'default'"
            @click="sizeFilter = 100"
          >
            $100+
          </n-button>
          <n-button
            size="small"
            :type="sizeFilter === 1000 ? 'primary' : 'default'"
            @click="sizeFilter = 1000"
          >
            $1K+
          </n-button>
          <n-button
            size="small"
            :type="sizeFilter === 5000 ? 'primary' : 'default'"
            @click="sizeFilter = 5000"
          >
            $5K+
          </n-button>
          <n-button
            size="small"
            :type="sizeFilter === 10000 ? 'primary' : 'default'"
            @click="sizeFilter = 10000"
          >
            $10K+
          </n-button>
          <n-button
            size="small"
            :type="sizeFilter === 'custom' ? 'primary' : 'default'"
            @click="sizeFilter = 'custom'"
          >
            Custom
          </n-button>
        </n-button-group>

        <!-- Custom Amount Input -->
        <n-input-number
          v-if="sizeFilter === 'custom'"
          v-model:value="customSize"
          placeholder="Custom amount"
          size="small"
          style="width: 150px"
          :min="1"
        >
          <template #prefix>$</template>
        </n-input-number>

        <!-- Status Filter -->
        <n-select
          v-model:value="statusFilter"
          :options="statusOptions"
          placeholder="Status"
          size="small"
          style="width: 150px"
        />
      </n-space>
    </n-card>

    <!-- Orders Table -->
    <n-card class="orders-card" size="small">
      <div class="orders-header">
        <span class="orders-title">📊 Orders ({{ filteredOrders.length }})</span>
        <n-space :size="8">
          <n-tag :type="autoMonitor ? 'success' : 'default'" size="small">
            {{ autoMonitor ? '🟢 Auto Monitor' : '⚪ Manual' }}
          </n-tag>
          <n-switch v-model:value="autoMonitor" size="small">
            <template #checked>ON</template>
            <template #unchecked>OFF</template>
          </n-switch>
        </n-space>
      </div>

      <n-data-table
        :columns="orderColumns"
        :data="filteredOrders"
        :pagination="pagination"
        :loading="loadingOrders"
        size="small"
        :max-height="500"
        :scroll-x="1400"
        striped
      />
    </n-card>

    <!-- NEW: Dashboard Cards Grid -->
    <div class="dashboard-grid">
      <!-- Card 1: Automation Bots - 12 Bot Types (Linked to Rules) -->
      <n-card class="dashboard-card" size="small">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">🤖</span>
            <span>Automation Bots</span>
            <n-tag size="tiny" type="info">12 Types</n-tag>
          </div>
        </template>
        <p style="font-size: 10px; color: #888; margin-bottom: 8px;">
          Select bot type, then click "Rules" on an order to create automation
        </p>
        <div class="bot-types-grid">
          <div
            v-for="bot in botTypesConfig"
            :key="bot.value"
            class="bot-type-item"
            :class="{ active: selectedBotType === bot.value }"
            @click="selectBotType(bot.value)"
          >
            <span class="bot-icon">{{ bot.icon }}</span>
            <span class="bot-name">{{ bot.shortName }}</span>
            <n-tag v-if="getRulesCountByBotType(bot.value) > 0" size="tiny" type="success" round>
              {{ getRulesCountByBotType(bot.value) }}
            </n-tag>
          </div>
        </div>
        <div v-if="selectedBotType" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #333;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #10eb04; font-weight: bold;">{{ getSelectedBotConfig?.label }}</span>
            <n-button size="tiny" @click="showBotInfoModal = true">
              ℹ️ Details
            </n-button>
          </div>
          <p style="font-size: 11px; color: #888; margin-top: 4px;">{{ getSelectedBotConfig?.description }}</p>
          <div style="margin-top: 8px; padding: 8px; background: #1a1a1a; border-radius: 4px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 4px;">Required Parameters:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              <n-tag v-for="param in getSelectedBotConfig?.requiredParams" :key="param" size="tiny" :bordered="false">
                {{ param }}
              </n-tag>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Card 2: Chain Monitor -->
      <n-card class="dashboard-card" size="small">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">⛓️</span>
            <span>Chain Monitor</span>
            <n-tag size="tiny" :type="chainMonitorActive ? 'success' : 'default'">
              {{ chainMonitorActive ? 'Active' : 'Inactive' }}
            </n-tag>
          </div>
        </template>
        <div class="chain-monitor-content">
          <div class="monitor-stat">
            <span class="stat-label">Active Chains</span>
            <span class="stat-value">{{ activeChains.length }}</span>
          </div>
          <div class="monitor-stat">
            <span class="stat-label">Pending Actions</span>
            <span class="stat-value" style="color: #ffd93d;">{{ pendingActions }}</span>
          </div>
          <div class="monitor-stat">
            <span class="stat-label">Executed Today</span>
            <span class="stat-value" style="color: #51cf66;">{{ executedToday }}</span>
          </div>
        </div>
        <n-divider style="margin: 8px 0;" />
        <div style="display: flex; gap: 8px;">
          <n-button size="tiny" :type="chainMonitorActive ? 'warning' : 'success'" @click="toggleChainMonitor" style="flex: 1;">
            {{ chainMonitorActive ? '⏸️ Pause' : '▶️ Start' }}
          </n-button>
          <n-button size="tiny" @click="showChainModal = true" style="flex: 1;">
            ⚙️ Configure
          </n-button>
        </div>
      </n-card>

      <!-- Card 3: Active Bots Status -->
      <n-card class="dashboard-card" size="small">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📊</span>
            <span>Active Bots Status</span>
            <n-tag size="tiny" type="success">{{ totalActiveBots }} Running</n-tag>
          </div>
        </template>
        <div class="active-bots-list">
          <div v-if="runningBots.length === 0" style="text-align: center; padding: 20px; color: #666;">
            No bots running
          </div>
          <div v-else v-for="bot in runningBots.slice(0, 4)" :key="bot.id" class="running-bot-item">
            <div class="bot-info">
              <span class="bot-type-icon">{{ getBotIcon(bot.type) }}</span>
              <div>
                <div style="font-weight: bold; font-size: 12px;">{{ bot.name || bot.symbol }}</div>
                <div style="font-size: 10px; color: #888;">{{ bot.type }} | {{ bot.exchange }}</div>
              </div>
            </div>
            <div class="bot-status">
              <n-tag size="tiny" :type="bot.status === 'running' ? 'success' : 'warning'">
                {{ bot.status }}
              </n-tag>
            </div>
          </div>
          <n-button v-if="runningBots.length > 4" size="tiny" text style="width: 100%; margin-top: 8px;">
            View All ({{ runningBots.length }})
          </n-button>
        </div>
      </n-card>

      <!-- Card 4: Quick Actions -->
      <n-card class="dashboard-card" size="small">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">⚡</span>
            <span>Quick Actions</span>
          </div>
        </template>
        <div class="quick-actions-grid">
          <n-button size="small" @click="quickAction('cancel-all')" style="width: 100%;">
            ❌ Cancel All Orders
          </n-button>
          <n-button size="small" @click="quickAction('pause-all')" style="width: 100%;">
            ⏸️ Pause All Bots
          </n-button>
          <n-button size="small" @click="quickAction('resume-all')" style="width: 100%;">
            ▶️ Resume All Bots
          </n-button>
          <n-button size="small" @click="quickAction('sync-orders')" style="width: 100%;">
            🔄 Sync Orders
          </n-button>
        </div>
      </n-card>

      <!-- Card 5: Bot Configuration Presets -->
      <n-card class="dashboard-card" size="small">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">⚙️</span>
            <span>Configuration Presets</span>
            <n-tag size="tiny" type="info">{{ savedPresets.length }} Saved</n-tag>
          </div>
        </template>
        <div class="presets-list">
          <div v-if="savedPresets.length === 0" style="text-align: center; padding: 20px; color: #666;">
            No presets saved
          </div>
          <div v-else v-for="preset in savedPresets.slice(0, 3)" :key="preset.id" class="preset-item">
            <div>
              <div style="font-weight: bold; font-size: 12px;">{{ preset.name }}</div>
              <div style="font-size: 10px; color: #888;">{{ preset.botType }} | {{ preset.pairs?.length || 0 }} pairs</div>
            </div>
            <n-button size="tiny" type="primary" @click="applyPreset(preset)">
              Apply
            </n-button>
          </div>
        </div>
        <n-divider style="margin: 8px 0;" />
        <n-button size="tiny" block @click="showPresetModal = true">
          ➕ Create Preset
        </n-button>
      </n-card>

      <!-- Card 6: Performance Stats -->
      <n-card class="dashboard-card" size="small">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📈</span>
            <span>Performance Stats</span>
            <n-tag size="tiny" :type="totalPnL >= 0 ? 'success' : 'error'">
              {{ totalPnL >= 0 ? '+' : '' }}{{ totalPnL.toFixed(2) }}%
            </n-tag>
          </div>
        </template>
        <div class="performance-stats">
          <div class="perf-stat">
            <span class="perf-label">Total Orders</span>
            <span class="perf-value">{{ performanceStats.totalOrders }}</span>
          </div>
          <div class="perf-stat">
            <span class="perf-label">Filled Orders</span>
            <span class="perf-value" style="color: #51cf66;">{{ performanceStats.filledOrders }}</span>
          </div>
          <div class="perf-stat">
            <span class="perf-label">Success Rate</span>
            <span class="perf-value" style="color: #ffd93d;">{{ performanceStats.successRate }}%</span>
          </div>
          <div class="perf-stat">
            <span class="perf-label">Avg Profit</span>
            <span class="perf-value" :style="{ color: performanceStats.avgProfit >= 0 ? '#51cf66' : '#ff6b6b' }">
              {{ performanceStats.avgProfit >= 0 ? '+' : '' }}{{ performanceStats.avgProfit.toFixed(2) }}%
            </span>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Rule Creation Modal -->
    <n-modal
      v-model:show="showRuleModal"
      preset="card"
      title="⚡ Create Automation Rule"
      style="width: 700px"
      :segmented="{ content: true }"
    >
      <n-space vertical :size="16">
        <!-- Trigger Condition -->
        <n-card size="small" title="🎯 Trigger Condition">
          <n-grid :cols="2" x-gap="12">
            <n-gi>
              <n-select
                v-model:value="newRule.triggerType"
                :options="triggerTypes"
                placeholder="Trigger Type"
                size="small"
              />
            </n-gi>
            <n-gi>
              <n-input-number
                v-model:value="newRule.triggerValue"
                placeholder="Value"
                size="small"
                style="width: 100%"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-gi>
          </n-grid>
          <div class="rule-example">
            💡 Example: When order is 50% filled
          </div>
        </n-card>

        <!-- Action to Execute -->
        <n-card size="small" title="🤖 Action to Execute">
          <n-select
            v-model:value="newRule.actionType"
            :options="actionTypes"
            placeholder="Action Type"
            size="small"
            style="margin-bottom: 12px"
          />

          <!-- Bot Creation Config (if action is create bot) -->
          <div v-if="newRule.actionType === 'create-bot'">
            <n-select
              v-model:value="newRule.botType"
              :options="botTypes"
              placeholder="Bot Type"
              size="small"
              style="margin-bottom: 12px"
            />

            <!-- Bot Specific Config -->
            <n-card size="small" v-if="newRule.botType">
              <n-space vertical :size="8">
                <n-input
                  v-model:value="newRule.botConfig.amount"
                  placeholder="Amount"
                  size="small"
                />
                <n-input
                  v-model:value="newRule.botConfig.param1"
                  :placeholder="getBotParam1Label()"
                  size="small"
                />
                <n-input
                  v-model:value="newRule.botConfig.param2"
                  :placeholder="getBotParam2Label()"
                  size="small"
                />
              </n-space>
            </n-card>
          </div>

          <!-- Multi-Phase Config (if action is multi-phase) -->
          <div v-if="newRule.actionType === 'multi-phase'">
            <n-input-number
              v-model:value="newRule.phaseCount"
              placeholder="Number of Phases"
              size="small"
              :min="2"
              :max="10"
              style="width: 100%; margin-bottom: 12px"
            />

            <n-select
              v-model:value="newRule.phaseBotType"
              :options="botTypes"
              placeholder="Bot Type for Each Phase"
              size="small"
            />
          </div>
        </n-card>

        <!-- Remainder Management -->
        <n-card size="small" title="♻️ Remainder Management">
          <n-checkbox v-model:checked="newRule.manageRemainder">
            Manage remaining amount
          </n-checkbox>

          <div v-if="newRule.manageRemainder" style="margin-top: 12px">
            <n-select
              v-model:value="newRule.remainderAction"
              :options="remainderActions"
              placeholder="What to do with remainder"
              size="small"
            />
          </div>
        </n-card>
      </n-space>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showRuleModal = false">Cancel</n-button>
          <n-button type="primary" @click="saveRule">
            <template #icon><span>💾</span></template>
            Save Rule
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Add Order Rule Modal -->
    <n-modal
      v-model:show="showOrderRuleModal"
      preset="card"
      title="➕ Add Automation Rule to Order"
      style="width: 600px"
    >
      <n-space vertical :size="16" v-if="selectedOrder">
        <!-- Order Info -->
        <n-card size="small" title="📊 Order Information">
          <n-descriptions bordered :column="2" size="small">
            <n-descriptions-item label="Symbol">{{ selectedOrder.symbol }}</n-descriptions-item>
            <n-descriptions-item label="Side">
              <n-tag :type="selectedOrder.side === 'buy' ? 'success' : 'error'" size="small">
                {{ selectedOrder.side?.toUpperCase() }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="Amount">{{ selectedOrder.amount }}</n-descriptions-item>
            <n-descriptions-item label="Price">${{ selectedOrder.price }}</n-descriptions-item>
            <n-descriptions-item label="Total Value">${{ (selectedOrder.amount * selectedOrder.price).toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="API Key">{{ selectedOrder.apiKeyName }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- Rule Configuration -->
        <n-card size="small" title="⚙️ Rule Configuration">
          <n-form-item label="Rule Name" required>
            <n-input v-model:value="newOrderRule.ruleName" placeholder="Enter rule name" />
          </n-form-item>

          <n-form-item label="Rule Type">
            <n-select v-model:value="newOrderRule.ruleType" :options="ruleTypes" />
          </n-form-item>

          <n-form-item label="Trigger Condition">
            <n-select v-model:value="newOrderRule.triggerCondition" :options="triggerConditions" />
          </n-form-item>

          <!-- Copy Order Config -->
          <div v-if="newOrderRule.ruleType === 'copy_order'">
            <n-divider>Copy Settings</n-divider>
            <n-form-item label="Copy Multiplier">
              <n-input-number
                v-model:value="newOrderRule.actionConfig.copyMultiplier"
                :min="0.1"
                :max="10"
                :step="0.1"
                placeholder="1.0 = same size"
              />
            </n-form-item>
            <n-form-item label="Price Offset %">
              <n-input-number
                v-model:value="newOrderRule.actionConfig.priceOffset"
                :min="-50"
                :max="50"
                :step="0.1"
                placeholder="0 = same price"
              />
            </n-form-item>
          </div>

          <!-- Reverse Order Config -->
          <div v-if="newOrderRule.ruleType === 'reverse_order'">
            <n-divider>Reverse Settings</n-divider>
            <n-form-item label="Reverse Ratio %">
              <n-input-number
                v-model:value="newOrderRule.actionConfig.reverseRatio"
                :min="1"
                :max="100"
                :step="1"
                placeholder="100 = full reverse"
              />
            </n-form-item>
          </div>

          <!-- Create Bot Config -->
          <div v-if="newOrderRule.ruleType === 'create_bot'">
            <n-divider>Bot Creation Settings</n-divider>
            <n-form-item label="Bot Type">
              <n-select
                v-model:value="newOrderRule.actionConfig.botType"
                :options="botTypes"
                @update:value="onBotTypeChange"
              />
            </n-form-item>

            <!-- OneClick Strategy Selector -->
            <div v-if="newOrderRule.actionConfig.botType === 'oneclick'">
              <n-form-item label="Strategy Configuration">
                <n-select
                  v-model:value="newOrderRule.actionConfig.oneClickStrategy"
                  :options="[
                    { label: '⚙️ Custom (Manual Setup)', value: 'custom' },
                    ...oneClickStrategies.map(s => ({
                      label: `${s.name} (${s.pairs?.length || 0} pairs)`,
                      value: s._id
                    }))
                  ]"
                  :loading="loadingStrategies"
                  placeholder="Select strategy or custom"
                  @update:value="(value) => console.log('🎯 [CO-PILOT] Strategy Selected:', value)"
                />
              </n-form-item>

              <!-- Strategy Info (for saved strategies) -->
              <n-alert
                v-if="newOrderRule.actionConfig.oneClickStrategy && newOrderRule.actionConfig.oneClickStrategy !== 'custom'"
                type="info"
                :bordered="false"
                style="margin-bottom: 12px;"
              >
                <template #header>
                  Strategy Details
                </template>
                {{
                  (() => {
                    const strategy = oneClickStrategies.find(s => s._id === newOrderRule.actionConfig.oneClickStrategy);
                    if (strategy) {
                      const pairsInfo = strategy.pairs?.map(p => `${p.symbol} (${p.lowerPricePercent}% / ${p.upperPricePercent}%)`).join(', ');
                      return `📊 ${strategy.pairs?.length || 0} pairs: ${pairsInfo}`;
                    }
                    return 'Select a strategy to view details';
                  })()
                }}
              </n-alert>

              <!-- Custom Configuration Form -->
              <div v-if="newOrderRule.actionConfig.oneClickStrategy === 'custom'" style="margin-top: 12px;">
                <n-alert type="warning" :bordered="false" style="margin-bottom: 12px;">
                  <template #icon><span>⚙️</span></template>
                  Configure custom OneClick settings below
                </n-alert>

                <n-grid :cols="2" :x-gap="12" :y-gap="8">
                  <n-gi>
                    <n-form-item label="Inc Buy %" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.incBuy" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Inc Sell %" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.incSell" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Dev Price Buy" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.devPriceBuy" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Dev Price Sell" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.devPriceSell" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Dev Amt Buy" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.devAmtBuy" :min="0.1" :max="10" :step="0.1" :precision="2" placeholder="0.9" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Dev Amt Sell" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.devAmtSell" :min="0.1" :max="10" :step="0.1" :precision="2" placeholder="0.9" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi :span="2">
                    <n-form-item label="Nr of Grids" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.nrOfGrids" :min="1" :max="100" :step="1" placeholder="10" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                </n-grid>

                <!-- Custom Pair Configuration -->
                <n-divider style="margin: 12px 0;">Trading Pair Settings</n-divider>
                <n-grid :cols="2" :x-gap="12" :y-gap="8">
                  <n-gi>
                    <n-form-item label="Lower Price %" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.lowerPricePercent" :min="-50" :max="0" :step="1" :precision="1" placeholder="-20" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Upper Price %" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.upperPricePercent" :min="0" :max="50" :step="1" :precision="1" placeholder="1" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="Amount" size="small">
                      <n-input-number v-model:value="newOrderRule.actionConfig.amount" :min="0.001" :step="0.1" :precision="4" placeholder="1.1" style="width: 100%;" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
              </div>
            </div>

            <!-- Grid Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'grid'">
              <n-divider>📊 Grid Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Lower Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Support level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.upperPrice" :precision="6" placeholder="Resistance level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Nr of Grids" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.nrOfGrids" :min="2" :max="100" :step="1" placeholder="10" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Amount per Grid" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.amount" :min="0.001" :precision="4" placeholder="Amount" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi :span="2">
                  <n-form-item label="Orders Side" size="small">
                    <n-select v-model:value="newOrderRule.actionConfig.botConfig.ordersSide" :options="[
                      { label: 'Buy & Sell', value: 'buyOrSell' },
                      { label: 'Buy Only', value: 'buyOnly' },
                      { label: 'Sell Only', value: 'sellOnly' }
                    ]" placeholder="Select side" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- DCA Grid Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'dcagrid'">
              <n-divider>⚡ DCA Grid Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Lower Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Support level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.upperPrice" :precision="6" placeholder="Resistance level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Nr of Grids" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.nrOfGrids" :min="2" :max="100" :step="1" placeholder="10" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Inc Buy %" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.incBuy" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Inc Sell %" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.incSell" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Dev Price Buy" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.devPriceBuy" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Dev Price Sell" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.devPriceSell" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="1" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- DCA Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'dca'">
              <n-divider>💰 DCA Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Base Order Amount" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.baseOrderAmount" :min="0.001" :precision="4" placeholder="Initial amount" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Safety Order %" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.safetyOrderPercent" :min="0.1" :max="50" :step="0.1" :precision="2" placeholder="3" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Take Profit %" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.takeProfitPercent" :min="0.1" :max="100" :step="0.1" :precision="2" placeholder="2" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Max Safety Orders" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.maxSafetyOrders" :min="1" :max="20" :step="1" placeholder="5" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- Smart DCA Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'smartdca'">
              <n-divider>🧠 Smart DCA Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Base Order Amount" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.baseOrderAmount" :min="0.001" :precision="4" placeholder="Initial amount" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="RSI Oversold" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.rsiOversold" :min="10" :max="50" :step="1" placeholder="30" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="RSI Overbought" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.rsiOverbought" :min="50" :max="90" :step="1" placeholder="70" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="SMA Fast" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.smaFast" :min="5" :max="50" :step="1" placeholder="10" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="SMA Slow" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.smaSlow" :min="10" :max="200" :step="1" placeholder="20" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- Fibonacci Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'fib'">
              <n-divider>🌀 Fibonacci Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Lower Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Low point" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.upperPrice" :precision="6" placeholder="High point" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Nr of Grids (Fib Levels)" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.nrOfGrids" :min="3" :max="13" :step="1" placeholder="7" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Price Start" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.PriceStart" :precision="6" placeholder="Starting price" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Amount" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.amount" :min="0.001" :precision="4" placeholder="Amount" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- FrontRun Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'frontrun'">
              <n-divider>🏃 FrontRun Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Lower Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Support level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.upperPrice" :precision="6" placeholder="Resistance level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Nr of Grids" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.nrOfGrids" :min="2" :max="20" :step="1" placeholder="5" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Price Start" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.PriceStart" :precision="6" placeholder="Starting price" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Amount" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.amount" :min="0.001" :precision="4" placeholder="Amount per grid" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- Scalping Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'scalping'">
              <n-divider>⚡ Scalping Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Lower Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Support level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.upperPrice" :precision="6" placeholder="Resistance level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Nr of Grids" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.nrOfGrids" :min="1" :max="10" :step="1" placeholder="3" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Balance Bot Start" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.BalanceBotStart" :min="0.001" :precision="4" placeholder="Starting balance" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi :span="2">
                  <n-form-item label="Auto Cancel (seconds)" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.autoCancelSeconds" :min="5" :max="300" :step="5" placeholder="25" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- Grinder Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'grinder'">
              <n-divider>⚙️ Grinder Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Balance Bot Start" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.BalanceBotStart" :min="0.001" :precision="4" placeholder="Starting balance" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Orders Side" size="small">
                    <n-select v-model:value="newOrderRule.actionConfig.botConfig.ordersSide" :options="[
                      { label: 'Buy Only', value: 'buyOnly' },
                      { label: 'Sell Only', value: 'sellOnly' }
                    ]" placeholder="Select side" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Lower Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Support level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.upperPrice" :precision="6" placeholder="Resistance level" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- OrderBook Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'orderbook'">
              <n-divider>📈 OrderBook Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Bid Depth (levels)" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.bidDepth" :min="1" :max="50" :step="1" placeholder="5" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Ask Depth (levels)" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.askDepth" :min="1" :max="50" :step="1" placeholder="5" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Imbalance Threshold" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.imbalanceThreshold" :min="1" :max="10" :step="0.1" :precision="1" placeholder="1.5" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Trade Amount" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.amount" :min="0.001" :precision="4" placeholder="Amount per trade" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- AI Bot Configuration -->
            <div v-if="newOrderRule.actionConfig.botType === 'aibot'">
              <n-divider>🤖 AI Bot Configuration</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi :span="2">
                  <n-form-item label="Indicators" size="small">
                    <n-select v-model:value="newOrderRule.actionConfig.botConfig.indicators" multiple :options="[
                      { label: 'RSI', value: 'RSI' },
                      { label: 'MACD', value: 'MACD' },
                      { label: 'Bollinger Bands', value: 'BB' },
                      { label: 'Moving Average', value: 'MA' },
                      { label: 'Volume', value: 'VOL' },
                      { label: 'Stochastic', value: 'STOCH' }
                    ]" placeholder="Select indicators" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Confidence Threshold" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.confidenceThreshold" :min="0.1" :max="1" :step="0.05" :precision="2" placeholder="0.7" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Trade Amount" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.amount" :min="0.001" :precision="4" placeholder="Amount per trade" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>

            <!-- CoPilot Bot Configuration (Chain Rules) -->
            <div v-if="newOrderRule.actionConfig.botType === 'copilot'">
              <n-divider>✈️ CoPilot Bot Configuration</n-divider>
              <n-alert type="info" :bordered="false" style="margin-bottom: 12px;">
                <template #icon><span>💡</span></template>
                CoPilot bot chains automation rules together for complex workflows
              </n-alert>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Chain to Rule ID" size="small">
                    <n-input v-model:value="newOrderRule.actionConfig.botConfig.chainToRule" placeholder="Next rule ID" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Delay (seconds)" size="small">
                    <n-input-number v-model:value="newOrderRule.actionConfig.botConfig.delaySeconds" :min="0" :max="3600" :step="1" placeholder="0" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>
          </div>

          <!-- Chain Action Config -->
          <div v-if="newOrderRule.ruleType === 'chain_action'">
            <n-divider>Chain Settings</n-divider>
            <n-form-item label="Delay (seconds)">
              <n-input-number
                v-model:value="newOrderRule.actionConfig.delaySeconds"
                :min="0"
                :max="3600"
                :step="1"
                placeholder="Delay before next action"
              />
            </n-form-item>
          </div>
        </n-card>
      </n-space>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showOrderRuleModal = false">Cancel</n-button>
          <n-button type="primary" @click="saveOrderRule">
            <template #icon><span>💾</span></template>
            Save Rule
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- View Order Rules Modal - Dashboard Layout -->
    <n-modal
      v-model:show="showOrderRulesView"
      preset="card"
      title="📊 Automation Rules Dashboard"
      style="width: 95vw; max-width: 1600px; max-height: 90vh;"
    >
      <div v-if="selectedOrder">
        <!-- Financial Dashboard Header -->
        <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 16px; margin-bottom: 16px;">
          <!-- Order Info Card -->
          <n-card size="small" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; font-weight: bold; color: #10eb04;">
                  {{ selectedOrder.symbol }}
                  <n-tag :type="selectedOrder.side === 'buy' ? 'success' : 'error'" size="small" style="margin-left: 8px;">
                    {{ selectedOrder.side?.toUpperCase() }}
                  </n-tag>
                </div>
                <n-button size="small" type="primary" @click="openAddRuleModal(selectedOrder)">
                  ➕ Add Rule
                </n-button>
              </div>
              <div style="font-size: 12px; color: #888;">
                Amount: <strong style="color: #fff;">{{ selectedOrder.amount }}</strong> |
                Price: <strong style="color: #fff;">${{ selectedOrder.price }}</strong> |
                API: <strong style="color: #fff;">{{ selectedOrder.apiKeyName }}</strong>
              </div>
              <n-divider style="margin: 8px 0;" />
              <div style="font-size: 13px; font-weight: bold; color: #ffd93d;">
                💰 Total Order Value: ${{ selectedOrder.totalValue || (selectedOrder.amount * selectedOrder.price).toFixed(2) }}
              </div>
            </div>
          </n-card>

          <!-- Financial Stats Dashboard -->
          <n-card size="small" style="background: linear-gradient(135deg, #1e3a1e 0%, #0d2d0d 100%);">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <!-- Total Bots Investment -->
              <div style="text-align: center;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">🤖 Total Bots Investment</div>
                <div style="font-size: 20px; font-weight: bold; color: #ff6b6b;">
                  ${{ calculateTotalBotsInvestment().toFixed(2) }}
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  {{ calculateTotalBots() }} bots
                </div>
              </div>

              <!-- Remaining Capital -->
              <div style="text-align: center;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">💵 Remaining Capital</div>
                <div style="font-size: 20px; font-weight: bold;" :style="{ color: calculateRemainingCapital() >= 0 ? '#51cf66' : '#ff6b6b' }">
                  ${{ calculateRemainingCapital().toFixed(2) }}
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  {{ ((calculateRemainingCapital() / (selectedOrder.totalValue || (selectedOrder.amount * selectedOrder.price))) * 100).toFixed(1) }}% available
                </div>
              </div>

              <!-- Total Base Currency -->
              <div style="text-align: center;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">📦 Total {{ getBaseCurrency(selectedOrder.symbol) }}</div>
                <div style="font-size: 20px; font-weight: bold; color: #a78bfa;">
                  {{ calculateTotalBaseCurrency().toFixed(4) }}
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  across all bots
                </div>
              </div>

              <!-- Total Quote Currency -->
              <div style="text-align: center;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">💰 Total {{ getQuoteCurrency(selectedOrder.symbol) }}</div>
                <div style="font-size: 20px; font-weight: bold; color: #ffd93d;">
                  ${{ calculateTotalQuoteCurrency().toFixed(2) }}
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  investment needed
                </div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- Per-Bot Investment Breakdown -->
        <n-card size="small" style="margin-bottom: 16px; background: #1a1a1a;">
          <div style="font-weight: bold; font-size: 14px; color: #10eb04; margin-bottom: 12px;">
            🤖 Per-Bot Investment Breakdown ({{ calculateTotalBots() }} bots total)
          </div>
          <div style="max-height: 300px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead style="position: sticky; top: 0; background: #2d2d2d; z-index: 1;">
                <tr>
                  <th style="padding: 8px; text-align: left; color: #888; border-bottom: 2px solid #444;">#</th>
                  <th style="padding: 8px; text-align: left; color: #888; border-bottom: 2px solid #444;">Bot Type</th>
                  <th style="padding: 8px; text-align: left; color: #888; border-bottom: 2px solid #444;">Symbol</th>
                  <th style="padding: 8px; text-align: center; color: #888; border-bottom: 2px solid #444;">Rule</th>
                  <th style="padding: 8px; text-align: right; color: #a78bfa; border-bottom: 2px solid #444;">Base Amount</th>
                  <th style="padding: 8px; text-align: right; color: #ffd93d; border-bottom: 2px solid #444;">Quote Investment</th>
                  <th style="padding: 8px; text-align: center; color: #888; border-bottom: 2px solid #444;">Orders</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(botDetail, idx) in calculatePerBotBreakdown()" :key="idx">
                  <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 8px; color: #666;">{{ idx + 1 }}</td>
                    <td style="padding: 8px;">
                      <n-tag size="tiny" :type="getBotTypeColor(botDetail.botType)">
                        {{ botDetail.botType.toUpperCase() }}
                      </n-tag>
                    </td>
                    <td style="padding: 8px; font-weight: bold; color: #fff;">{{ botDetail.symbol }}</td>
                    <td style="padding: 8px; text-align: center; color: #666;">#{{ botDetail.ruleNumber }}</td>
                    <td style="padding: 8px; text-align: right; color: #a78bfa; font-family: monospace;">
                      {{ botDetail.baseAmount.toFixed(4) }} {{ botDetail.baseCurrency }}
                    </td>
                    <td style="padding: 8px; text-align: right; color: #ffd93d; font-family: monospace; font-weight: bold;">
                      ${{ botDetail.quoteInvestment.toFixed(2) }}
                    </td>
                    <td style="padding: 8px; text-align: center; color: #10eb04;">
                      {{ botDetail.ordersCount }}
                    </td>
                  </tr>
                </template>
              </tbody>
              <tfoot style="position: sticky; bottom: 0; background: #1e3a1e;">
                <!-- Multi-Currency Totals -->
                <template v-for="(total, currency) in calculateBaseCurrencyTotals()" :key="currency">
                  <tr v-if="total > 0" style="border-top: 1px solid #444;">
                    <td colspan="4" style="padding: 8px 12px; text-align: right; font-weight: bold; color: #888;">
                      Total {{ currency }}:
                    </td>
                    <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #a78bfa; font-family: monospace;">
                      {{ total.toFixed(4) }} {{ currency }}
                    </td>
                    <td colspan="2"></td>
                  </tr>
                </template>
                <!-- Grand Total Row -->
                <tr style="border-top: 2px solid #444;">
                  <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold; color: #10eb04; font-size: 14px;">
                    GRAND TOTAL:
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; color: #a78bfa; font-family: monospace;">
                    {{ Object.keys(calculateBaseCurrencyTotals()).length }} currencies
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; color: #ffd93d; font-family: monospace; font-size: 14px;">
                    ${{ calculateTotalBotsInvestment().toFixed(2) }}
                  </td>
                  <td style="padding: 12px; text-align: center; font-weight: bold; color: #10eb04;">
                    {{ calculatePerBotBreakdown().reduce((sum, bot) => sum + bot.ordersCount, 0) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </n-card>

        <!-- Rules List -->
        <n-spin :show="loadingRules">
          <!-- Empty State -->
          <div v-if="orderRules.length === 0" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
            <div style="font-size: 16px; color: #888;">No automation rules for this order</div>
            <n-button type="primary" style="margin-top: 16px;" @click="openAddRuleModal(selectedOrder)">
              Create First Rule
            </n-button>
          </div>

          <!-- Rules Cards -->
          <div v-else style="display: flex; flex-direction: column; gap: 12px;">
            <n-card
              v-for="rule in orderRules"
              :key="rule.id"
              size="small"
              style="background: #1e1e1e; border: 1px solid #333;"
            >
              <!-- Rule Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <n-tag :type="rule.isActive ? 'success' : 'default'" size="small">
                      {{ rule.isActive ? '🟢 Active' : '⚪ Inactive' }}
                    </n-tag>
                    <n-tag type="info" size="small">#{{ rule.ruleNumber }}</n-tag>
                    <span style="font-weight: bold; font-size: 14px;">{{ rule.ruleName }}</span>
                  </div>
                  <div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <n-tag size="tiny" :bordered="false" style="background: #2d2d2d;">
                      📍 {{ formatTriggerCondition(rule.triggerCondition) }}
                    </n-tag>
                    <n-tag size="tiny" :bordered="false" style="background: #2d2d2d;">
                      🎯 {{ formatRuleType(rule.ruleType) }}
                    </n-tag>
                    <n-tag v-if="rule.actionConfig?.botType" size="tiny" type="primary">
                      🤖 {{ rule.actionConfig.botType.toUpperCase() }}
                    </n-tag>
                  </div>
                </div>
                <n-space :size="4">
                  <n-button
                    size="tiny"
                    :type="rule.isActive ? 'warning' : 'success'"
                    @click="toggleOrderRule(rule.id)"
                  >
                    {{ rule.isActive ? 'Disable' : 'Enable' }}
                  </n-button>
                  <n-button size="tiny" type="error" @click="deleteOrderRule(rule.id)">
                    🗑️
                  </n-button>
                </n-space>
              </div>

              <!-- Rule Stats -->
              <div style="display: flex; gap: 16px; padding: 8px 12px; background: #252525; border-radius: 4px; margin-bottom: 12px; font-size: 12px;">
                <div>
                  <span style="color: #666;">Executions:</span>
                  <strong style="color: #10eb04; margin-left: 4px;">{{ rule.executionCount || 0 }}</strong>
                </div>
                <div v-if="rule.lastExecuted">
                  <span style="color: #666;">Last Run:</span>
                  <span style="color: #888; margin-left: 4px;">{{ new Date(rule.lastExecuted).toLocaleString() }}</span>
                </div>
                <div v-if="rule.createdAt">
                  <span style="color: #666;">Created:</span>
                  <span style="color: #888; margin-left: 4px;">{{ new Date(rule.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>

              <!-- OneClick Bot Configuration Section -->
              <div v-if="rule.actionConfig?.botType === 'oneclick'">
                <!-- Check if this is a complete rule or legacy -->
                <template v-if="isCompleteOneClickRule(rule.actionConfig)">
                  <!-- Strategy Name Banner -->
                  <div v-if="rule.actionConfig.strategyName" style="background: linear-gradient(135deg, #1a4d1a 0%, #0d3d0d 100%); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 20px;">🎯</span>
                      <div>
                        <div style="font-weight: bold; font-size: 14px; color: #10eb04;">{{ rule.actionConfig.strategyName }}</div>
                        <div v-if="rule.actionConfig.strategyDescription" style="font-size: 11px; color: #888; margin-top: 2px;">
                          {{ rule.actionConfig.strategyDescription }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Config Grid -->
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
                    <div v-if="rule.actionConfig.incBuy !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Inc Buy %</div>
                      <div style="font-size: 14px; font-weight: bold; color: #51cf66;">{{ rule.actionConfig.incBuy }}%</div>
                    </div>
                    <div v-if="rule.actionConfig.incSell !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Inc Sell %</div>
                      <div style="font-size: 14px; font-weight: bold; color: #ff6b6b;">{{ rule.actionConfig.incSell }}%</div>
                    </div>
                    <div v-if="rule.actionConfig.devPriceBuy !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Dev Price Buy</div>
                      <div style="font-size: 14px; font-weight: bold; color: #fff;">{{ rule.actionConfig.devPriceBuy }}</div>
                    </div>
                    <div v-if="rule.actionConfig.devPriceSell !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Dev Price Sell</div>
                      <div style="font-size: 14px; font-weight: bold; color: #fff;">{{ rule.actionConfig.devPriceSell }}</div>
                    </div>
                    <div v-if="rule.actionConfig.devAmtBuy !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Dev Amt Buy</div>
                      <div style="font-size: 14px; font-weight: bold; color: #fff;">{{ rule.actionConfig.devAmtBuy }}</div>
                    </div>
                    <div v-if="rule.actionConfig.devAmtSell !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Dev Amt Sell</div>
                      <div style="font-size: 14px; font-weight: bold; color: #fff;">{{ rule.actionConfig.devAmtSell }}</div>
                    </div>
                    <div v-if="rule.actionConfig.nrOfGrids !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Nr of Grids</div>
                      <div style="font-size: 14px; font-weight: bold; color: #ffd93d;">{{ rule.actionConfig.nrOfGrids }}</div>
                    </div>
                    <div v-if="rule.actionConfig.amount !== undefined" style="background: #252525; padding: 8px; border-radius: 4px; text-align: center;">
                      <div style="font-size: 10px; color: #666;">Amount</div>
                      <div style="font-size: 14px; font-weight: bold; color: #fff;">{{ rule.actionConfig.amount }}</div>
                    </div>
                  </div>

                  <!-- Trading Pairs Table - Expandable -->
                  <div v-if="rule.actionConfig.pairs && rule.actionConfig.pairs.length > 0">
                    <div style="font-weight: bold; color: #10eb04; margin-bottom: 8px; font-size: 12px;">
                      📊 Trading Pairs ({{ rule.actionConfig.pairs.length }}) - Click to see planned orders
                    </div>
                    <div style="background: #1a1a1a; border-radius: 4px; overflow: hidden;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                          <tr style="background: #2d2d2d;">
                            <th style="padding: 8px; text-align: left; color: #888; width: 30px;"></th>
                            <th style="padding: 8px; text-align: left; color: #888;">#</th>
                            <th style="padding: 8px; text-align: left; color: #888;">Symbol</th>
                            <th style="padding: 8px; text-align: center; color: #ff6b6b;">Lower %</th>
                            <th style="padding: 8px; text-align: center; color: #51cf66;">Upper %</th>
                            <th style="padding: 8px; text-align: center; color: #888;">Amount</th>
                            <th style="padding: 8px; text-align: center; color: #888;">Grids</th>
                            <th style="padding: 8px; text-align: center; color: #888;">Total Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="(pair, idx) in rule.actionConfig.pairs" :key="idx">
                            <!-- Main Row - Clickable -->
                            <tr
                              style="border-top: 1px solid #333; cursor: pointer; transition: background 0.2s;"
                              @click="togglePairExpansion(rule.id, idx)"
                              :style="{ background: isPairExpanded(rule.id, idx) ? '#2a2a2a' : 'transparent' }"
                              @mouseenter="$event.currentTarget.style.background = '#2a2a2a'"
                              @mouseleave="$event.currentTarget.style.background = isPairExpanded(rule.id, idx) ? '#2a2a2a' : 'transparent'"
                            >
                              <td style="padding: 8px; text-align: center;">
                                <span style="font-size: 12px;">{{ isPairExpanded(rule.id, idx) ? '▼' : '▶' }}</span>
                              </td>
                              <td style="padding: 8px; color: #666;">{{ idx + 1 }}</td>
                              <td style="padding: 8px; font-weight: bold; color: #fff;">{{ pair.symbol }}</td>
                              <td style="padding: 8px; text-align: center; color: #ff6b6b;">{{ pair.lowerPricePercent }}%</td>
                              <td style="padding: 8px; text-align: center; color: #51cf66;">{{ pair.upperPricePercent }}%</td>
                              <td style="padding: 8px; text-align: center; color: #fff;">{{ pair.amount }}</td>
                              <td style="padding: 8px; text-align: center; color: #ffd93d;">{{ pair.grids }}</td>
                              <td style="padding: 8px; text-align: center; color: #10eb04;">{{ pair.grids }} buy orders</td>
                            </tr>

                            <!-- Expanded Details Row -->
                            <tr v-if="isPairExpanded(rule.id, idx)" style="border-top: 1px solid #333;">
                              <td colspan="8" style="padding: 0; background: #252525;">
                                <div style="padding: 16px;">
                                  <div style="margin-bottom: 12px;">
                                    <div style="font-weight: bold; color: #10eb04; font-size: 12px; margin-bottom: 8px;">
                                      📋 Planned Grid Orders ({{ pair.grids }} BUY orders)
                                    </div>
                                    <div style="font-size: 11px; color: #888; margin-bottom: 8px;">
                                      This GridBot will place <strong style="color: #fff;">{{ pair.grids }}</strong> BUY orders
                                      between <strong style="color: #ff6b6b;">${{ calculatePairPrice(pair, 'lower') }}</strong>
                                      and <strong style="color: #51cf66;">${{ calculatePairPrice(pair, 'upper') }}</strong>
                                    </div>
                                  </div>

                                  <!-- Orders Preview Table -->
                                  <div style="max-height: 300px; overflow-y: auto; background: #1a1a1a; border-radius: 4px; border: 1px solid #333;">
                                    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                                      <thead style="position: sticky; top: 0; background: #2d2d2d; z-index: 1;">
                                        <tr>
                                          <th style="padding: 6px 8px; text-align: left; color: #888;">Order #</th>
                                          <th style="padding: 6px 8px; text-align: center; color: #888;">Side</th>
                                          <th style="padding: 6px 8px; text-align: right; color: #888;">Price ($)</th>
                                          <th style="padding: 6px 8px; text-align: right; color: #888;">Amount</th>
                                          <th style="padding: 6px 8px; text-align: right; color: #888;">Total ($)</th>
                                          <th style="padding: 6px 8px; text-align: center; color: #888;">Distance</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr
                                          v-for="order in calculateGridOrders(pair)"
                                          :key="order.index"
                                          style="border-top: 1px solid #2a2a2a;"
                                        >
                                          <td style="padding: 6px 8px; color: #666;">{{ order.index }}</td>
                                          <td style="padding: 6px 8px; text-align: center;">
                                            <span style="color: #51cf66; font-weight: bold;">BUY</span>
                                          </td>
                                          <td style="padding: 6px 8px; text-align: right; color: #fff; font-family: monospace;">
                                            ${{ order.price.toFixed(6) }}
                                          </td>
                                          <td style="padding: 6px 8px; text-align: right; color: #fff; font-family: monospace;">
                                            {{ order.amount.toFixed(4) }}
                                          </td>
                                          <td style="padding: 6px 8px; text-align: right; color: #ffd93d; font-family: monospace;">
                                            ${{ order.total.toFixed(2) }}
                                          </td>
                                          <td style="padding: 6px 8px; text-align: center; color: #888; font-size: 9px;">
                                            {{ order.distance }}%
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  <!-- Summary Stats -->
                                  <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                    <!-- Row 1 -->
                                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; text-align: center;">
                                      <div style="font-size: 9px; color: #666;">Total Orders</div>
                                      <div style="font-size: 14px; font-weight: bold; color: #10eb04;">{{ pair.grids }}</div>
                                    </div>
                                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; text-align: center;">
                                      <div style="font-size: 9px; color: #666;">Average Price</div>
                                      <div style="font-size: 14px; font-weight: bold; color: #4fc3f7;">
                                        ${{ calculateAveragePrice(pair).toFixed(6) }}
                                      </div>
                                    </div>
                                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; text-align: center;">
                                      <div style="font-size: 9px; color: #666;">Price Range</div>
                                      <div style="font-size: 11px; font-weight: bold; color: #fff;">
                                        ${{ calculatePairPrice(pair, 'lower') }} - ${{ calculatePairPrice(pair, 'upper') }}
                                      </div>
                                    </div>

                                    <!-- Row 2 -->
                                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; text-align: center;">
                                      <div style="font-size: 9px; color: #666;">Amount per Order</div>
                                      <div style="font-size: 14px; font-weight: bold; color: #fff;">{{ pair.amount }}</div>
                                    </div>
                                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; text-align: center;">
                                      <div style="font-size: 9px; color: #666;">Total Base ({{ getBaseCurrency(pair.symbol) }})</div>
                                      <div style="font-size: 14px; font-weight: bold; color: #9c27b0;">
                                        {{ calculateTotalBaseAmount(pair).toFixed(4) }}
                                      </div>
                                    </div>
                                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; text-align: center;">
                                      <div style="font-size: 9px; color: #666;">Total Quote ({{ getQuoteCurrency(pair.symbol) }})</div>
                                      <div style="font-size: 14px; font-weight: bold; color: #ffd93d;">
                                        ${{ calculateTotalInvestment(pair).toFixed(2) }}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </template>

                <!-- Legacy Rule Warning -->
                <template v-else>
                  <n-alert type="warning" style="margin-bottom: 0;">
                    <template #header>⚠️ Legacy Rule - Missing Configuration Data</template>
                    <div style="font-size: 12px;">
                      This rule was created before the full strategy data was saved.
                      Please <strong>delete this rule</strong> and <strong>recreate it</strong> to have complete configuration data displayed.
                    </div>
                    <div style="margin-top: 8px;">
                      <n-button size="tiny" type="error" @click="deleteOrderRule(rule.id)">
                        🗑️ Delete & Recreate
                      </n-button>
                    </div>
                  </n-alert>
                </template>
              </div>

              <!-- Non-OneClick Bot Types -->
              <div v-else-if="rule.actionConfig?.botType">
                <div style="font-weight: bold; color: #10eb04; margin-bottom: 8px; font-size: 12px;">
                  ⚙️ {{ rule.actionConfig.botType.toUpperCase() }} Bot Configuration
                </div>
                <n-code :code="JSON.stringify(rule.actionConfig, null, 2)" language="json" style="font-size: 11px;" />
              </div>

              <!-- Generic Action Config -->
              <div v-else-if="rule.actionConfig && Object.keys(rule.actionConfig).length > 0">
                <div style="font-weight: bold; color: #888; margin-bottom: 8px; font-size: 12px;">
                  ⚙️ Action Configuration
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                  <div v-if="rule.actionConfig.copyMultiplier" style="background: #252525; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #666;">Copy Multiplier</div>
                    <div style="font-size: 14px; font-weight: bold;">{{ rule.actionConfig.copyMultiplier }}x</div>
                  </div>
                  <div v-if="rule.actionConfig.priceOffset" style="background: #252525; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #666;">Price Offset</div>
                    <div style="font-size: 14px; font-weight: bold;">{{ rule.actionConfig.priceOffset }}%</div>
                  </div>
                  <div v-if="rule.actionConfig.reverseRatio" style="background: #252525; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #666;">Reverse Ratio</div>
                    <div style="font-size: 14px; font-weight: bold;">{{ rule.actionConfig.reverseRatio }}%</div>
                  </div>
                  <div v-if="rule.actionConfig.delaySeconds" style="background: #252525; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #666;">Delay</div>
                    <div style="font-size: 14px; font-weight: bold;">{{ rule.actionConfig.delaySeconds }}s</div>
                  </div>
                </div>
              </div>
            </n-card>
          </div>
        </n-spin>
      </div>

      <template #footer>
        <n-space justify="space-between" style="width: 100%;">
          <n-button @click="loadRulesCounts(); fetchOrderRules(selectedOrder?.id)">
            🔄 Refresh
          </n-button>
          <n-button @click="showOrderRulesView = false">Close</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Bot Info Modal - Detailed Documentation -->
    <n-modal
      v-model:show="showBotInfoModal"
      preset="card"
      :title="`${getSelectedBotConfig?.icon || '🤖'} ${getSelectedBotConfig?.label || 'Bot'} - Documentation`"
      style="width: 700px; max-height: 90vh;"
    >
      <div v-if="getSelectedBotConfig">
        <!-- Bot Overview -->
        <n-card size="small" style="margin-bottom: 16px; background: linear-gradient(135deg, #1a2a1a 0%, #0d2d0d 100%);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="font-size: 48px;">{{ getSelectedBotConfig.icon }}</span>
            <div>
              <div style="font-size: 20px; font-weight: bold; color: #10eb04;">{{ getSelectedBotConfig.label }}</div>
              <div style="font-size: 13px; color: #888; margin-top: 4px;">{{ getSelectedBotConfig.description }}</div>
            </div>
          </div>
        </n-card>

        <!-- Required Parameters -->
        <n-card size="small" style="margin-bottom: 16px;">
          <template #header>
            <span style="color: #ffd93d;">📋 Required Parameters</span>
          </template>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <n-tag
              v-for="param in getSelectedBotConfig.requiredParams"
              :key="param"
              type="warning"
              size="medium"
            >
              {{ param }}
            </n-tag>
          </div>
        </n-card>

        <!-- Default Configuration -->
        <n-card size="small" style="margin-bottom: 16px;">
          <template #header>
            <span style="color: #51cf66;">⚙️ Default Configuration</span>
          </template>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div
              v-for="(value, key) in getSelectedBotConfig.defaultConfig"
              :key="key"
              style="background: #1a1a1a; padding: 10px; border-radius: 6px;"
            >
              <div style="font-size: 11px; color: #666; text-transform: uppercase;">{{ key }}</div>
              <div style="font-size: 16px; font-weight: bold; color: #fff; margin-top: 4px;">
                {{ typeof value === 'object' ? JSON.stringify(value) : value }}
              </div>
            </div>
          </div>
        </n-card>

        <!-- Usage Guide -->
        <n-card size="small" style="margin-bottom: 16px;">
          <template #header>
            <span style="color: #74c0fc;">📖 Usage Guide</span>
          </template>
          <div style="font-size: 13px; color: #ccc; line-height: 1.6;">
            <div v-if="getSelectedBotConfig.value === 'grid'">
              <p><strong>Grid Bot</strong> places multiple buy and sell orders at preset price intervals.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Set <code style="background: #333; padding: 2px 6px; border-radius: 3px;">lowerPrice</code> as your support level</li>
                <li>Set <code style="background: #333; padding: 2px 6px; border-radius: 3px;">upperPrice</code> as your resistance level</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">nrOfGrids</code> determines the number of orders between prices</li>
                <li>Best for: Sideways/ranging markets with predictable support/resistance</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'dcagrid'">
              <p><strong>GridBot Plus (DCA)</strong> combines grid trading with dollar cost averaging.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">incBuy/incSell</code> - percentage increment for buy/sell orders</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">devPriceBuy/devPriceSell</code> - price deviation multipliers</li>
                <li>Automatically averages down when price moves against position</li>
                <li>Best for: Volatile markets where you want to accumulate at lower prices</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'dca'">
              <p><strong>DCA Bot</strong> buys fixed amounts at regular intervals or price drops.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">baseOrderAmount</code> - initial investment amount</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">safetyOrderPercent</code> - % drop to trigger safety orders</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">takeProfitPercent</code> - % profit target to close position</li>
                <li>Best for: Long-term accumulation and reducing average entry price</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'smartdca'">
              <p><strong>Smart DCA</strong> uses technical indicators to optimize entry points.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">rsiOversold</code> - RSI level to trigger buys (default 30)</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">rsiOverbought</code> - RSI level to trigger sells (default 70)</li>
                <li>Uses SMA crossovers for trend confirmation</li>
                <li>Best for: Trending markets with clear momentum signals</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'fib'">
              <p><strong>Fibonacci Bot</strong> trades at key Fibonacci retracement levels.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Places orders at 23.6%, 38.2%, 50%, 61.8%, 78.6% levels</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">PriceStart</code> - starting price for Fib calculation</li>
                <li>Best for: Traders who follow Fibonacci analysis</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'frontrun'">
              <p><strong>FrontRun Bot</strong> executes quick trades based on price momentum.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Designed for fast profit taking on quick price movements</li>
                <li>Uses tight grids with incremental percentage adjustments</li>
                <li>Best for: Quick scalps and momentum trading</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'scalping'">
              <p><strong>Scalping Bot</strong> makes high-frequency small profit trades.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">autoCancelSeconds</code> - cancel unfilled orders after X seconds</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">BalanceBotStart</code> - starting balance for the bot</li>
                <li>Best for: High liquidity pairs with tight spreads</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'oneclick'">
              <p><strong>OneClick Bot</strong> deploys pre-configured strategies instantly.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Select a saved strategy or configure custom settings</li>
                <li>Supports multiple trading pairs simultaneously</li>
                <li>Best for: Quick deployment of proven strategies</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'copilot'">
              <p><strong>CoPilot Bot</strong> chains automation rules together.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Trigger actions when orders fill (copy, reverse, create bot)</li>
                <li>Chain multiple rules for complex workflows</li>
                <li>Best for: Multi-step automated trading strategies</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'grinder'">
              <p><strong>Grinder Bot</strong> persistently trades to grind profits over time.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">BalanceBotStart</code> - starting balance</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">ordersSide</code> - buyOnly or sellOnly</li>
                <li>Best for: Long-term consistent profit grinding</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'orderbook'">
              <p><strong>OrderBook Bot</strong> analyzes order book depth for trading signals.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">bidDepth/askDepth</code> - levels to analyze</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">imbalanceThreshold</code> - ratio to trigger trades</li>
                <li>Best for: Detecting large orders and market maker activity</li>
              </ul>
            </div>
            <div v-else-if="getSelectedBotConfig.value === 'aibot'">
              <p><strong>AI Bot</strong> uses machine learning for trading decisions.</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">indicators</code> - technical indicators to analyze</li>
                <li><code style="background: #333; padding: 2px 6px; border-radius: 3px;">confidenceThreshold</code> - minimum confidence to trade</li>
                <li>Best for: Advanced traders wanting AI assistance</li>
              </ul>
            </div>
            <div v-else>
              <p>Select a bot type from the Automation Bots card to see detailed documentation.</p>
            </div>
          </div>
        </n-card>

        <!-- How to Create Rule -->
        <n-alert type="info" :bordered="false">
          <template #header>🎯 How to Create a Rule with this Bot</template>
          <ol style="margin: 8px 0; padding-left: 20px; font-size: 12px;">
            <li>Select this bot type in the "Automation Bots" card</li>
            <li>Find an order in the Orders table</li>
            <li>Click the "📋 Rules" button on the order</li>
            <li>Click "➕ Add Rule" in the modal</li>
            <li>Configure the bot parameters and save</li>
            <li>The bot will be created when the order fills!</li>
          </ol>
        </n-alert>
      </div>

      <div v-else style="text-align: center; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🤖</div>
        <p style="color: #888;">Select a bot type from the Automation Bots card to view documentation</p>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showBotInfoModal = false">Close</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Active Automations -->
    <n-card class="active-automations" size="small" v-if="activeAutomations.length > 0">
      <div class="automations-header">
        <span class="automations-title">🔥 Active Automations ({{ activeAutomations.length }})</span>
      </div>

      <div class="automations-list">
        <n-card
          v-for="(auto, index) in activeAutomations"
          :key="index"
          size="small"
          class="automation-item"
        >
          <div class="automation-content">
            <div class="automation-info">
              <n-tag type="success" size="small">🟢 Running</n-tag>
              <span class="automation-order">Order: {{ auto.orderId }}</span>
              <span class="automation-progress">Progress: {{ auto.progress }}%</span>
              <span class="automation-action">{{ auto.actionDescription }}</span>
            </div>
            <n-button size="tiny" type="error" @click="stopAutomation(index)">
              Stop
            </n-button>
          </div>
          <n-progress :percentage="auto.progress" :color="getProgressColor(auto.progress)" />
        </n-card>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { h } from 'vue';
import { NButton, NTag, NProgress, NSpace, useMessage } from 'naive-ui';

// Import bot calculations composable
const {
  getBaseCurrency,
  getQuoteCurrency,
  calculateGridOrders: calculateGridOrdersBase,
  calculateTotalInvestment: calculateTotalInvestmentBase,
  calculateAveragePrice: calculateAveragePriceBase,
  calculateTotalBaseAmount: calculateTotalBaseAmountBase,
  calculateDcaInvestment,
  calculateFibInvestment,
  calculateFrontRunInvestment,
  calculateScalpingInvestment
} = useBotCalculations();

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
const userID = useCookie('userID');
const message = useMessage();

await app.loadUserExchangeData(userID.value);

// State
const loadingOrders = ref(false);
const orders = ref([]);
const sizeFilter = ref(100);
const customSize = ref(1000);
const statusFilter = ref('all');
const autoMonitor = ref(false);
const automationRules = ref([]);
const activeAutomations = ref([]);
const showRuleModal = ref(false);
const monitorInterval = ref(null);
const autoRefreshInterval = ref(null);
const autoRefreshEnabled = ref(true); // Auto-refresh orders every 30s

// OneClick Strategies
const oneClickStrategies = ref([]);
const loadingStrategies = ref(false);
const selectedStrategy = ref(null);

// Dashboard Cards State
const selectedBotType = ref(null);
const chainMonitorActive = ref(false);
const activeChains = ref([]);
const pendingActions = ref(0);
const executedToday = ref(0);
const runningBots = ref([]);
const savedPresets = ref([]);
const totalPnL = ref(0);
const showChainModal = ref(false);
const showPresetModal = ref(false);

// Performance Stats
const performanceStats = ref({
  totalOrders: 0,
  filledOrders: 0,
  successRate: 0,
  avgProfit: 0
});

// Bot Types Configuration (12 types) with required parameters
const botTypesConfig = [
  {
    value: 'grid', label: 'Grid Bot', shortName: 'Grid', icon: '📊',
    description: 'Automated grid trading with buy/sell orders at preset intervals',
    requiredParams: ['lowerPrice', 'upperPrice', 'nrOfGrids', 'amount'],
    defaultConfig: { nrOfGrids: 10, amountType: 'fixed', ordersSide: 'buyOrSell' }
  },
  {
    value: 'dcagrid', label: 'GridBot Plus (DCA)', shortName: 'DCA Grid', icon: '⚡',
    description: 'Advanced grid with DCA strategy for averaging down positions',
    requiredParams: ['lowerPrice', 'upperPrice', 'nrOfGrids', 'incBuy', 'incSell'],
    defaultConfig: { nrOfGrids: 10, incBuy: 1, incSell: 1, devPriceBuy: 1, devPriceSell: 1 }
  },
  {
    value: 'dca', label: 'DCA Bot', shortName: 'DCA', icon: '💰',
    description: 'Dollar Cost Averaging - buy fixed amounts at regular intervals',
    requiredParams: ['baseOrderAmount', 'safetyOrderPercent', 'takeProfitPercent'],
    defaultConfig: { safetyOrderPercent: 3, takeProfitPercent: 2, maxSafetyOrders: 5 }
  },
  {
    value: 'smartdca', label: 'Smart DCA', shortName: 'Smart', icon: '🧠',
    description: 'AI-powered DCA with RSI and market analysis',
    requiredParams: ['baseOrderAmount', 'rsiOversold', 'rsiOverbought'],
    defaultConfig: { rsiOversold: 30, rsiOverbought: 70, smaFast: 10, smaSlow: 20 }
  },
  {
    value: 'fib', label: 'Fibonacci Bot', shortName: 'Fib', icon: '🌀',
    description: 'Trade based on Fibonacci retracement levels',
    requiredParams: ['lowerPrice', 'upperPrice', 'nrOfGrids', 'PriceStart'],
    defaultConfig: { nrOfGrids: 7, amountType: 'fixed' }
  },
  {
    value: 'frontrun', label: 'FrontRun Bot', shortName: 'FrontRun', icon: '🏃',
    description: 'Front-running strategy for quick profits',
    requiredParams: ['lowerPrice', 'upperPrice', 'nrOfGrids', 'PriceStart'],
    defaultConfig: { nrOfGrids: 5, amountType: 'quantityPerGrid' }
  },
  {
    value: 'scalping', label: 'Scalping Bot', shortName: 'Scalp', icon: '⚡',
    description: 'High-frequency trading for small, quick profits',
    requiredParams: ['lowerPrice', 'upperPrice', 'nrOfGrids', 'BalanceBotStart'],
    defaultConfig: { nrOfGrids: 3, autoCancelSeconds: 25 }
  },
  {
    value: 'oneclick', label: 'OneClick Bot', shortName: 'OneClick', icon: '🎯',
    description: 'One-click deployment with saved strategy configurations',
    requiredParams: ['strategyId OR custom config'],
    defaultConfig: { useStrategy: true }
  },
  {
    value: 'copilot', label: 'CoPilot Bot', shortName: 'CoPilot', icon: '✈️',
    description: 'Chain automation rules together',
    requiredParams: ['chainToRule', 'delaySeconds'],
    defaultConfig: { delaySeconds: 0 }
  },
  {
    value: 'grinder', label: 'Grinder Bot', shortName: 'Grinder', icon: '⚙️',
    description: 'Persistent trading to grind profits over time',
    requiredParams: ['BalanceBotStart', 'ordersSide'],
    defaultConfig: { ordersSide: 'buyOnly' }
  },
  {
    value: 'orderbook', label: 'OrderBook Bot', shortName: 'OB', icon: '📈',
    description: 'Trade based on order book analysis and depth',
    requiredParams: ['bidDepth', 'askDepth', 'imbalanceThreshold'],
    defaultConfig: { bidDepth: 5, askDepth: 5, imbalanceThreshold: 1.5 }
  },
  {
    value: 'aibot', label: 'AI Bot', shortName: 'AI', icon: '🤖',
    description: 'Machine learning powered trading decisions',
    requiredParams: ['indicators', 'confidenceThreshold'],
    defaultConfig: { indicators: ['RSI', 'MACD'], confidenceThreshold: 0.7 }
  }
];

// Bot Info Modal
const showBotInfoModal = ref(false);

// Computed
const totalActiveBots = computed(() => runningBots.value.length);

const getSelectedBotConfig = computed(() => {
  return botTypesConfig.find(b => b.value === selectedBotType.value);
});

// Dashboard Functions
function selectBotType(type) {
  selectedBotType.value = selectedBotType.value === type ? null : type;
}

function getActiveBotCount(botType) {
  return runningBots.value.filter(b => b.type === botType).length;
}

// Count rules by bot type
function getRulesCountByBotType(botType) {
  // Count from all order rules that use this bot type
  let count = 0;
  for (const order of orders.value) {
    if (order.rules) {
      count += order.rules.filter(r => r.actionConfig?.botType === botType).length;
    }
  }
  return count;
}

function getBotIcon(botType) {
  const bot = botTypesConfig.find(b => b.value === botType);
  return bot ? bot.icon : '🤖';
}

// Get default config for selected bot type
function getDefaultBotConfig(botType) {
  const bot = botTypesConfig.find(b => b.value === botType);
  return bot?.defaultConfig || {};
}

function toggleChainMonitor() {
  chainMonitorActive.value = !chainMonitorActive.value;
  message.info(chainMonitorActive.value ? '⛓️ Chain Monitor Started' : '⏸️ Chain Monitor Paused');
}

async function quickAction(action) {
  switch (action) {
    case 'cancel-all':
      if (!confirm('Cancel all open orders?')) return;
      message.warning('⏳ Cancelling all orders...');
      // TODO: Implement cancel all
      break;
    case 'pause-all':
      message.info('⏸️ Pausing all bots...');
      // TODO: Implement pause all
      break;
    case 'resume-all':
      message.info('▶️ Resuming all bots...');
      // TODO: Implement resume all
      break;
    case 'sync-orders':
      message.info('🔄 Syncing orders...');
      await refreshOrders();
      break;
  }
}

function applyPreset(preset) {
  message.success(`Applied preset: ${preset.name}`);
  // TODO: Navigate to appropriate bot creation with preset data
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load active bots - this is a placeholder, implement actual API calls
    // const botsResponse = await $fetch('/api/v1/fetchAllActiveBots', { ... });

    // For now, set some placeholder data
    performanceStats.value = {
      totalOrders: filteredOrders.value.length,
      filledOrders: filteredOrders.value.filter(o => o.status === 'filled').length,
      successRate: filteredOrders.value.length > 0
        ? Math.round((filteredOrders.value.filter(o => o.status === 'filled').length / filteredOrders.value.length) * 100)
        : 0,
      avgProfit: 0
    };

    // Load saved presets (OneClick strategies)
    savedPresets.value = oneClickStrategies.value.map(s => ({
      id: s._id,
      name: s.name,
      botType: 'oneclick',
      pairs: s.pairs
    }));

  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// New Rule
const newRule = ref({
  triggerType: null,
  triggerValue: 50,
  actionType: null,
  botType: null,
  botConfig: {
    amount: '',
    param1: '',
    param2: ''
  },
  phaseCount: 5,
  phaseBotType: null,
  manageRemainder: false,
  remainderAction: null,
  enabled: true
});

// Options
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Partial', value: 'partial' },
  { label: 'Filled', value: 'filled' },
  { label: 'Canceled', value: 'canceled' }
];

const triggerTypes = [
  { label: 'Partial Fill %', value: 'partial-fill' },
  { label: 'Fully Filled', value: 'fully-filled' },
  { label: 'Amount Filled > $', value: 'amount-filled' },
  { label: 'Time Elapsed', value: 'time-elapsed' }
];

const actionTypes = [
  { label: 'Create Bot', value: 'create-bot' },
  { label: 'Multi-Phase Execution', value: 'multi-phase' },
  { label: 'Cancel Order', value: 'cancel' },
  { label: 'Notify Only', value: 'notify' }
];

const botTypes = [
  { label: '📊 Grid Bot', value: 'grid' },
  { label: '⚡ GridBot Plus (DCA Grid)', value: 'dcagrid' },
  { label: '💰 DCA Bot', value: 'dca' },
  { label: '🧠 Smart DCA Bot', value: 'smartdca' },
  { label: '🌀 Fibonacci Bot', value: 'fib' },
  { label: '🏃 FrontRun Bot', value: 'frontrun' },
  { label: '⚡ Scalping Bot', value: 'scalping' },
  { label: '🎯 OneClick Bot', value: 'oneclick' },
  { label: '✈️ CoPilot Bot', value: 'copilot' },
  { label: '⚙️ Grinder Bot', value: 'grinder' },
  { label: '📈 OrderBook Bot', value: 'orderbook' },
  { label: '🤖 AI Bot', value: 'aibot' }
];

const remainderActions = [
  { label: 'Create Another Bot', value: 'create-bot' },
  { label: 'Split into Phases', value: 'split-phases' },
  { label: 'Cancel', value: 'cancel' },
  { label: 'Keep Open', value: 'keep-open' }
];

// Table Columns
const orderColumns = [
  {
    title: 'Order ID',
    key: 'id',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { style: 'font-family: monospace; font-size: 10px' }, row.id.slice(0, 8))
  },
  {
    title: 'API Key',
    key: 'apiKeyName',
    width: 100,
    render: (row) => h(NTag, { type: 'info', size: 'tiny' }, { default: () => row.apiKeyName || 'N/A' })
  },
  {
    title: 'Symbol',
    key: 'symbol',
    width: 100,
    render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => row.symbol })
  },
  {
    title: 'Side',
    key: 'side',
    width: 80,
    render: (row) => h(NTag, { type: row.side === 'buy' ? 'success' : 'error', size: 'small' }, { default: () => row.side.toUpperCase() })
  },
  {
    title: 'Type',
    key: 'type',
    width: 90
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 120,
    render: (row) => `${row.amount.toFixed(4)} ${row.symbol.split('/')[0]}`
  },
  {
    title: 'Filled',
    key: 'filled',
    width: 120,
    render: (row) => {
      const percent = (row.filled / row.amount * 100).toFixed(1);
      return h(NSpace, { size: 4, align: 'center' }, {
        default: () => [
          h('span', `${row.filled.toFixed(4)}`),
          h(NTag, { type: percent > 0 ? 'warning' : 'default', size: 'tiny' }, { default: () => `${percent}%` })
        ]
      });
    }
  },
  {
    title: 'Price',
    key: 'price',
    width: 110,
    render: (row) => `$${row.price.toFixed(4)}`
  },
  {
    title: 'Total Value',
    key: 'totalValue',
    width: 120,
    render: (row) => {
      const value = row.amount * row.price;
      return h(NTag, { type: 'success', size: 'small' }, { default: () => `$${value.toFixed(2)}` });
    }
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) => {
      const typeMap = {
        open: 'default',
        partial: 'warning',
        filled: 'success',
        canceled: 'error'
      };
      return h(NTag, { type: typeMap[row.status], size: 'small' }, { default: () => row.status });
    }
  },
  {
    title: 'Active Rules',
    key: 'activeRules',
    width: 180,
    render: (row) => {
      if (!row.rulesCount || row.rulesCount === 0) {
        return h(NTag, { type: 'default', size: 'small' }, { default: () => 'No rules' });
      }

      return h(NSpace, { size: 4, vertical: true }, {
        default: () => [
          h(NSpace, { size: 4, align: 'center' }, {
            default: () => [
              h(NTag, {
                type: row.hasActiveRules ? 'success' : 'default',
                size: 'small'
              }, {
                default: () => row.hasActiveRules ? '🟢 Active' : '⚪ Inactive'
              }),
              h(NTag, {
                type: 'info',
                size: 'tiny'
              }, {
                default: () => `${row.rulesCount} rule${row.rulesCount > 1 ? 's' : ''}`
              })
            ]
          }),
          row.fillPercent > 0 && row.fillPercent < 100 ? h(NProgress, {
            type: 'line',
            percentage: parseFloat(row.fillPercent),
            height: 4,
            color: '#67c23a',
            railColor: '#e6e6e6'
          }) : null
        ].filter(Boolean)
      });
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 280,
    fixed: 'right',
    render: (row) => {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, {
            size: 'tiny',
            type: 'primary',
            onClick: () => openAddRuleModal(row)
          }, { default: () => '➕ Add Rule' }),
          h(NButton, {
            size: 'tiny',
            type: 'info',
            onClick: () => viewOrderRules(row)
          }, { default: () => `📋 Rules (${row.rulesCount || 0})` }),
          h(NButton, {
            size: 'tiny',
            type: 'success',
            disabled: !selectedBotType.value,
            onClick: () => createBotFromOrder(row)
          }, { default: () => selectedBotType.value ? `🤖 ${selectedBotType.value.toUpperCase()}` : '🤖 Select Bot' })
        ]
      });
    }
  }
];

// Pagination
const pagination = ref({
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true
});

// Computed
const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Size filter
  const minSize = sizeFilter.value === 'custom' ? customSize.value : sizeFilter.value;
  filtered = filtered.filter(order => {
    const value = order.amount * order.price;
    return value >= minSize;
  });

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }

  return filtered;
});

// Methods
async function refreshOrders(silent = false) {
  loadingOrders.value = true;

  try {
    console.log('🔄 [CO-PILOT] Fetching orders from new endpoint...');

    // Get selected exchange and API keys from store
    const selectedExchange = app.getUserSelectedExchange;
    const selectedApiKeys = app.getSelectedApiKeys || [];

    console.log(`🎯 [CO-PILOT] Selected exchange: ${selectedExchange}`);
    console.log(`🔑 [CO-PILOT] Selected API keys:`, selectedApiKeys);

    // Build query parameters
    const queryParams = {
      userID: userID.value
    };

    // Add exchange filter if selected
    if (selectedExchange) {
      queryParams.exchange = selectedExchange;
    }

    // If only ONE API key is selected, filter by it
    // If multiple or none selected, fetch from all
    if (selectedApiKeys.length === 1) {
      queryParams.apiKeyName = selectedApiKeys[0];
      console.log(`🎯 [CO-PILOT] Filtering by single API key: ${selectedApiKeys[0]}`);
    } else if (selectedApiKeys.length > 1) {
      console.log(`📦 [CO-PILOT] Multiple API keys selected (${selectedApiKeys.length}), fetching from all`);
    }

    // Use new unified endpoint
    const response = await $fetch('/api/v1/Bots/fetchCoPilotOrders', {
      query: queryParams
    });

    console.log('📊 [CO-PILOT] Response:', response);

    if (response.success && response.data) {
      // Wait for next tick before updating DOM-bound reactive state
      await nextTick();

      // Orders already enriched with rules, fillPercent, totalValue, etc.
      orders.value = response.data.map(order => ({
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        amount: order.amount,
        filled: order.filled || 0,
        price: order.price,
        status: order.status || determineStatus(order),
        timestamp: order.timestamp,
        apiKeyName: order.apiKeyName,
        exchange: order.exchange,

        // New enriched fields from backend
        rulesCount: order.rulesCount || 0,
        hasActiveRules: order.hasActiveRules || false,
        fillPercent: order.fillPercent || 0,
        totalValue: order.totalValue || (order.amount * order.price).toFixed(2),
        filledValue: order.filledValue || (order.filled * order.price).toFixed(2),
        rules: order.rules || []
      }));

      // Display stats if available (skip during silent refresh)
      if (!silent) {
        if (response.stats) {
          console.log('📊 [CO-PILOT] Stats:', response.stats);
          message.success(
            `✅ Loaded ${response.stats.totalOrders} orders with ${response.stats.totalRules} rules (${response.stats.apiKeysScanned} API keys scanned)`
          );
        } else {
          message.success(`✅ Loaded ${orders.value.length} orders`);
        }

        // Show warnings if any API keys failed
        if (response.errors && response.errors.length > 0) {
          console.warn('⚠️ [CO-PILOT] Some API keys failed:', response.errors);
          response.errors.forEach(err => {
            console.error(`❌ [CO-PILOT] Failed: ${err.exchange} (${err.apiKeyName}) - ${err.error}`);
          });
          message.warning(`⚠️ ${response.errors.length} API key(s) failed to fetch (check console for details)`);
        }
      } else {
        // Silent mode - only log stats
        if (response.stats) {
          console.log('📊 [CO-PILOT] Stats (silent):', response.stats);
        }
        if (response.errors && response.errors.length > 0) {
          console.warn('⚠️ [CO-PILOT] Some API keys failed (silent mode):', response.errors);
        }
      }
    } else {
      await nextTick();
      orders.value = [];
      if (!silent) {
        message.info(response.message || 'No orders found');
      }
    }
  } catch (error) {
    console.error('❌ [CO-PILOT] Error fetching orders:', error);
    await nextTick();
    orders.value = [];
    if (!silent) {
      message.error('Failed to load orders');
    }
  } finally {
    loadingOrders.value = false;
  }
}

function determineStatus(order) {
  if (order.status === 'canceled') return 'canceled';
  if (order.filled === 0) return 'open';
  if (order.filled >= order.amount) return 'filled';
  return 'partial';
}

// loadRulesCounts() removed - no longer needed!
// New fetchCoPilotOrders endpoint already enriches orders with rules

// Get strategy name by ID
function getStrategyName(strategyId) {
  if (!strategyId || strategyId === 'custom') return null;

  const strategy = oneClickStrategies.value.find(s => s._id === strategyId);
  return strategy ? strategy.name : null;
}

// Check if OneClick config has meaningful data (not a legacy rule)
function hasOneClickConfigData(actionConfig) {
  if (!actionConfig) return false;

  console.log('🔍 [CO-PILOT] Checking actionConfig for data:', JSON.stringify(actionConfig, null, 2));

  // Check if any of the OneClick specific fields exist (using !== undefined to catch 0 values)
  const hasData = (
    actionConfig.incBuy !== undefined ||
    actionConfig.incSell !== undefined ||
    actionConfig.devPriceBuy !== undefined ||
    actionConfig.devPriceSell !== undefined ||
    actionConfig.devAmtBuy !== undefined ||
    actionConfig.devAmtSell !== undefined ||
    actionConfig.nrOfGrids !== undefined ||
    (actionConfig.pairs && actionConfig.pairs.length > 0) ||
    actionConfig.lowerPricePercent !== undefined ||
    actionConfig.upperPricePercent !== undefined ||
    actionConfig.amount !== undefined ||
    actionConfig.strategyName !== undefined ||
    actionConfig.configName !== undefined
  );

  console.log('🔍 [CO-PILOT] hasOneClickConfigData result:', hasData);
  return hasData;
}

// Check if OneClick rule has complete data (not legacy)
function isCompleteOneClickRule(actionConfig) {
  if (!actionConfig) return false;

  // A complete OneClick rule should have at least one of these key fields
  return (
    actionConfig.strategyName !== undefined ||
    actionConfig.incBuy !== undefined ||
    actionConfig.incSell !== undefined ||
    (actionConfig.pairs && actionConfig.pairs.length > 0) ||
    actionConfig.configName !== undefined
  );
}

// Format trigger condition for display
function formatTriggerCondition(triggerCondition) {
  const triggers = {
    'on_fill': 'On Fill',
    'on_partial_fill': 'Partial Fill',
    'on_cancel': 'On Cancel',
    'on_price_change': 'Price Change',
    'on_time': 'Time Based',
    'manual': 'Manual'
  };
  return triggers[triggerCondition] || triggerCondition || 'Unknown';
}

// Format rule type for display
function formatRuleType(ruleType) {
  const types = {
    'copy_order': 'Copy Order',
    'reverse_order': 'Reverse Order',
    'create_bot': 'Create Bot',
    'cancel_order': 'Cancel Order',
    'modify_order': 'Modify Order',
    'chain_action': 'Chain Action'
  };
  return types[ruleType] || ruleType || 'Unknown';
}

function formatRuleCondition(rule) {
  // Handle both old format (triggerType) and new format (triggerCondition)
  const triggerType = rule.triggerType || rule.triggerCondition;
  const actionType = rule.actionType || rule.ruleType;
  const botType = rule.botType || rule.actionConfig?.botType;

  const triggers = {
    'partial-fill': `When ${rule.triggerValue || 50}% filled`,
    'on_partial_fill': `When ${rule.triggerValue || 50}% filled`,
    'fully-filled': 'When fully filled',
    'on_fill': 'When fully filled',
    'amount-filled': `When $${rule.triggerValue || 100}+ filled`,
    'time-elapsed': `After ${rule.triggerValue || 5} minutes`,
    'on_time': `After ${rule.triggerValue || 5} minutes`,
    'on_cancel': 'When canceled',
    'on_price_change': 'On price change',
    'manual': 'Manual trigger'
  };

  const actions = {
    'create-bot': `Create ${botType || 'bot'}`,
    'create_bot': `Create ${botType || 'bot'}`,
    'copy_order': 'Copy order',
    'reverse_order': 'Reverse order',
    'cancel_order': 'Cancel order',
    'modify_order': 'Modify order',
    'chain_action': 'Chain action',
    'multi-phase': `Split into ${rule.phaseCount || 5} phases`,
    'cancel': 'Cancel order',
    'notify': 'Send notification'
  };

  return `${triggers[triggerType] || 'Unknown trigger'} → ${actions[actionType] || 'Unknown action'}`;
}

function getBotParam1Label() {
  const labels = {
    grid: 'Lower Price',
    dca: 'Base Order Amount',
    smartdca: 'RSI Oversold',
    fib: 'Lower Price'
  };
  return labels[newRule.value.botType] || 'Parameter 1';
}

function getBotParam2Label() {
  const labels = {
    grid: 'Upper Price',
    dca: 'Take Profit %',
    smartdca: 'RSI Overbought',
    fib: 'Upper Price'
  };
  return labels[newRule.value.botType] || 'Parameter 2';
}

async function saveRule() {
  try {
    // Map old structure to new template structure
    const ruleType = newRule.value.actionType === 'create-bot' ? 'create_bot' :
                     newRule.value.actionType === 'cancel' ? 'cancel_order' :
                     newRule.value.actionType === 'notify' ? 'copy_order' : 'create_bot';

    const triggerCondition = newRule.value.triggerType === 'fully-filled' ? 'on_fill' :
                             newRule.value.triggerType === 'partial-fill' ? 'on_partial_fill' :
                             newRule.value.triggerType === 'time-elapsed' ? 'on_time' : 'on_fill';

    const actionConfig = {};
    if (newRule.value.actionType === 'create-bot' && newRule.value.botType) {
      actionConfig.botType = newRule.value.botType;
      actionConfig.botConfig = newRule.value.botConfig || {};
    }

    // Generate template name
    const templateName = `${newRule.value.triggerType || 'Rule'} → ${newRule.value.actionType || 'Action'}`;

    const response = await $fetch('/api/v1/Bots/addCoPilotRuleTemplate', {
      method: 'POST',
      body: {
        userID: userID.value,
        templateName,
        description: '',
        ruleType,
        triggerCondition,
        actionConfig,
        isGlobal: false
      }
    });

    if (response.success) {
      // Add to local array for immediate display
      automationRules.value.push({
        ...newRule.value,
        id: response.template.id,
        templateNumber: response.template.templateNumber
      });

      message.success(`✅ ${response.message}`);
      showRuleModal.value = false;
      resetNewRule();

      // Reload templates
      await loadRuleTemplates();
    }
  } catch (error) {
    console.error('Error saving rule template:', error);
    message.error('Failed to save rule template');
  }
}

function resetNewRule() {
  newRule.value = {
    triggerType: null,
    triggerValue: 50,
    actionType: null,
    botType: null,
    botConfig: {
      amount: '',
      param1: '',
      param2: ''
    },
    phaseCount: 5,
    phaseBotType: null,
    manageRemainder: false,
    remainderAction: null,
    enabled: true
  };
}

function toggleRule(index) {
  automationRules.value[index].enabled = !automationRules.value[index].enabled;
  message.info(automationRules.value[index].enabled ? '🟢 Rule enabled' : '⚪ Rule disabled');
}

function editRule(index) {
  newRule.value = { ...automationRules.value[index] };
  showRuleModal.value = true;
  automationRules.value.splice(index, 1);
}

async function deleteRule(index) {
  const rule = automationRules.value[index];
  if (!rule || !rule.id) {
    automationRules.value.splice(index, 1);
    message.warning('🗑️ Rule template deleted');
    return;
  }

  if (!confirm(`Delete template "${formatRuleCondition(rule)}"?`)) return;

  try {
    const response = await $fetch('/api/v1/Bots/deleteCoPilotRuleTemplate', {
      method: 'POST',
      body: {
        userID: userID.value,
        templateId: rule.id
      }
    });

    if (response.success) {
      automationRules.value.splice(index, 1);
      message.success(`✅ ${response.message}`);
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    message.error('Failed to delete template');
  }
}

async function createBotFromOrder(order) {
  // Get selected bot type from dashboard card
  const botType = selectedBotType.value || 'grid';
  const botConfig = getDefaultBotConfig(botType);

  // Calculate suggested prices based on order price
  const orderPrice = parseFloat(order.price);
  const suggestedLower = parseFloat((orderPrice * 0.9).toFixed(6));  // -10%
  const suggestedUpper = parseFloat((orderPrice * 1.1).toFixed(6));  // +10%

  // Check if user has selected a bot type
  if (!selectedBotType.value) {
    message.warning('⚠️ Please select a bot type from the Automation Bots card first!');
    return;
  }

  // Confirm creation
  const confirmed = confirm(`Create ${botType.toUpperCase()} Bot for ${order.symbol}?\n\nBot will use:\n- Lower Price: $${suggestedLower}\n- Upper Price: $${suggestedUpper}\n- Amount: ${order.amount}`);
  if (!confirmed) return;

  message.loading(`🤖 Creating ${botType.toUpperCase()} Bot...`);

  try {
    // Prepare bot data based on bot type
    const botData = {
      userID: userID.value,
      name: `${botType.toUpperCase()} - ${order.symbol} - ${new Date().toLocaleDateString()}`,
      exchange: app.getUserSelectedExchange,
      symbol: order.symbol,
      apiKeyName: order.apiKeyName,
      ...botConfig,
      lowerPrice: suggestedLower,
      upperPrice: suggestedUpper,
      PriceStart: order.price.toString(),
      amount: order.amount.toString(),
      amountPriceStart: order.amount.toString()
    };

    // Determine which API endpoint to use based on bot type
    // Note: Grid/DCA bots are at /api/v1/, specialized bots at /api/v1/Bots/
    let endpoint = '';
    switch (botType) {
      case 'grid':
        endpoint = '/api/v1/createGridBot';
        botData.nrOfGrids = botConfig.nrOfGrids || 10;
        botData.amountType = botConfig.amountType || 'fixed';
        botData.ordersSide = botConfig.ordersSide || 'buyOrSell';
        break;
      case 'dcagrid':
        endpoint = '/api/v1/createDcaGridBot';
        botData.nrOfGrids = botConfig.nrOfGrids || 10;
        botData.incBuy = botConfig.incBuy || 1;
        botData.incSell = botConfig.incSell || 1;
        botData.devPriceBuy = botConfig.devPriceBuy || 1;
        botData.devPriceSell = botConfig.devPriceSell || 1;
        break;
      case 'fib':
        endpoint = '/api/v1/Bots/createFibBot';
        botData.nrOfGrids = botConfig.nrOfGrids || 7;
        break;
      case 'frontrun':
        // FrontRun uses Grid endpoint with specific settings
        endpoint = '/api/v1/createGridBot';
        botData.nrOfGrids = botConfig.nrOfGrids || 5;
        botData.botType = 'frontrun';
        break;
      case 'scalping':
        endpoint = '/api/v1/Bots/createScalp1ngBot';
        botData.nrOfGrids = botConfig.nrOfGrids || 3;
        botData.BalanceBotStart = order.amount.toString();
        botData.autoCancelSeconds = botConfig.autoCancelSeconds || 25;
        break;
      case 'oneclick':
        // OneClick uses Grid endpoint with strategy
        endpoint = '/api/v1/createGridBot';
        botData.botType = 'oneclick';
        break;
      case 'copilot':
        endpoint = '/api/v1/Bots/createCoPilotBot';
        break;
      case 'grinder':
        endpoint = '/api/v1/Bots/createGrinderBot';
        botData.BalanceBotStart = order.amount.toString();
        botData.ordersSide = botConfig.ordersSide || 'buyOnly';
        break;
      default:
        endpoint = '/api/v1/createGridBot';
    }

    console.log('🤖 [CO-PILOT] Creating bot:', { botType, endpoint, botData });

    const response = await $fetch(endpoint, {
      method: 'POST',
      body: botData
    });

    console.log('📋 [CO-PILOT] Bot creation response:', response);

    // Different endpoints return different response formats
    // Some return { success: true }, others return { data: 'OK' }
    if (response.success || response.data === 'OK' || response.data) {
      message.success(`✅ ${botType.toUpperCase()} Bot created successfully!`);
      console.log('✅ [CO-PILOT] Bot created:', response);
    } else if (response.error) {
      message.error(`❌ Failed to create bot: ${response.error}`);
    } else {
      message.warning(`⚠️ Bot creation response: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    console.error('❌ [CO-PILOT] Error creating bot:', error);
    message.error(`❌ Error: ${error.message || error.statusMessage || 'Failed to create bot'}`);
  }
}

function setupPhases(order) {
  // Implementation for multi-phase setup
  message.info(`Setting up phases for order ${order.id}`);
}

// ========== NEW: Order Rules Management ==========
const showOrderRuleModal = ref(false);
const showOrderRulesView = ref(false);
const selectedOrder = ref(null);
const orderRules = ref([]);
const loadingRules = ref(false);

// Track expanded pairs (ruleId -> Set of expanded pair indexes)
const expandedPairs = ref(new Map());

const newOrderRule = ref({
  ruleName: '',
  ruleType: 'copy_order',
  triggerCondition: 'on_fill',
  actionConfig: {
    targetApiKeys: [],
    copyMultiplier: 1,
    priceOffset: 0,
    reverseRatio: 100,
    botType: 'grid',
    botConfig: {},
    oneClickStrategy: 'custom', // Default to custom for OneClick bots
    nextRuleId: null,
    delaySeconds: 0
  }
});

const ruleTypes = [
  { label: '📋 Copy Order', value: 'copy_order' },
  { label: '🔄 Reverse Order', value: 'reverse_order' },
  { label: '🤖 Create Bot', value: 'create_bot' },
  { label: '❌ Cancel Order', value: 'cancel_order' },
  { label: '✏️ Modify Order', value: 'modify_order' },
  { label: '⛓️ Chain Action', value: 'chain_action' }
];

const triggerConditions = [
  { label: '✅ On Fill', value: 'on_fill' },
  { label: '🔵 On Partial Fill', value: 'on_partial_fill' },
  { label: '❌ On Cancel', value: 'on_cancel' },
  { label: '📈 On Price Change', value: 'on_price_change' },
  { label: '⏰ On Time', value: 'on_time' },
  { label: '🖱️ Manual', value: 'manual' }
];

// Handle bot type change - populate default config
function onBotTypeChange(value) {
  console.log('🤖 [CO-PILOT] Bot Type Changed:', value);

  // Load OneClick strategies if needed
  if (value === 'oneclick') {
    loadOneClickStrategies();
    newOrderRule.value.actionConfig.oneClickStrategy = 'custom';
  }

  // Get default config for the selected bot type
  const defaultConfig = getDefaultBotConfig(value);

  // Preserve existing order-specific values
  const existingSymbol = newOrderRule.value.actionConfig.botConfig?.symbol;
  const existingLowerPrice = newOrderRule.value.actionConfig.botConfig?.lowerPrice;
  const existingUpperPrice = newOrderRule.value.actionConfig.botConfig?.upperPrice;
  const existingAmount = newOrderRule.value.actionConfig.botConfig?.amount;
  const existingPriceStart = newOrderRule.value.actionConfig.botConfig?.PriceStart;

  // Merge default config with preserved values
  newOrderRule.value.actionConfig.botConfig = {
    ...defaultConfig,
    symbol: existingSymbol,
    lowerPrice: existingLowerPrice,
    upperPrice: existingUpperPrice,
    amount: existingAmount || defaultConfig.amount,
    PriceStart: existingPriceStart,
    BalanceBotStart: existingAmount || defaultConfig.BalanceBotStart,
    baseOrderAmount: existingAmount || defaultConfig.baseOrderAmount
  };

  // Update rule name to reflect bot type
  if (selectedOrder.value) {
    newOrderRule.value.ruleName = `${value.toUpperCase()} Rule for ${selectedOrder.value.symbol}`;
  }

  console.log('📋 [CO-PILOT] Updated botConfig:', newOrderRule.value.actionConfig.botConfig);
}

// Open Add Rule Modal for specific order
function openAddRuleModal(order) {
  selectedOrder.value = order;

  // Use selected bot type from dashboard card if available
  const botType = selectedBotType.value || 'grid';
  const botConfig = getDefaultBotConfig(botType);

  // Calculate suggested prices based on order price
  const orderPrice = parseFloat(order.price);
  const suggestedLower = parseFloat((orderPrice * 0.9).toFixed(6));  // -10%
  const suggestedUpper = parseFloat((orderPrice * 1.1).toFixed(6));  // +10%

  newOrderRule.value = {
    ruleName: `${botType.toUpperCase()} Rule for ${order.symbol}`,
    ruleType: 'create_bot',  // Default to create_bot since we have bot selected
    triggerCondition: 'on_fill',
    actionConfig: {
      targetApiKeys: [],
      copyMultiplier: 1,
      priceOffset: 0,
      reverseRatio: 100,
      botType: botType,
      botConfig: {
        ...botConfig,
        symbol: order.symbol,
        lowerPrice: suggestedLower,
        upperPrice: suggestedUpper,
        amount: order.amount,
        PriceStart: order.price
      },
      oneClickStrategy: botType === 'oneclick' ? 'custom' : undefined,
      nextRuleId: null,
      delaySeconds: 0
    }
  };
  showOrderRuleModal.value = true;
}

// View all rules for an order
async function viewOrderRules(order) {
  selectedOrder.value = order;
  await fetchOrderRules(order.id);
  showOrderRulesView.value = true;
}

// Fetch rules for specific order
async function fetchOrderRules(orderId) {
  loadingRules.value = true;
  console.log('📋 [CO-PILOT] Fetching order rules:', {
    orderId,
    currentBotId: currentBotId.value,
    userID: userID.value
  });

  try {
    const queryParams = {
      userID: userID.value,
      orderId: orderId
    };

    // Include botId only if available
    if (currentBotId.value) {
      queryParams.botId = currentBotId.value;
    }

    const response = await $fetch('/api/v1/Bots/getCoPilotRules', {
      query: queryParams
    });

    console.log('✅ [CO-PILOT] Fetched order rules:', response);

    if (response.success) {
      orderRules.value = response.rules;
      console.log(`📊 [CO-PILOT] Loaded ${response.rules.length} rules for order ${orderId}`);
      console.log('📊 [CO-PILOT] orderRules.value is now:', orderRules.value);
      console.log('📊 [CO-PILOT] First rule:', orderRules.value[0]);

      // Update rulesCount in the orders list
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].rulesCount = response.rules.length;
        console.log(`📊 [CO-PILOT] Updated rulesCount for order ${orderId} to ${response.rules.length}`);
      }

      message.success(`Loaded ${response.rules.length} rule(s)`);
    }
  } catch (error) {
    console.error('❌ [CO-PILOT] Error fetching order rules:', error);
    message.error('Failed to load rules');
  } finally {
    loadingRules.value = false;
  }
}

// Save new rule
// Apply template to order
async function applyTemplateToOrder(templateId) {
  if (!templateId) return;

  // Validate we have a selected order
  if (!selectedOrder.value || !selectedOrder.value.id) {
    message.error('No order selected. Please try again.');
    console.error('selectedOrder missing or has no id:', selectedOrder.value);
    return;
  }

  console.log('📝 Applying template to order:', {
    templateId,
    orderId: selectedOrder.value.id,
    orderSymbol: selectedOrder.value.symbol,
    currentBotId: currentBotId.value
  });

  // Check if we have a bot ID, if not create a virtual Co-Pilot bot
  if (!currentBotId.value) {
    try {
      // Create a virtual Co-Pilot bot for this session
      const botResponse = await $fetch('/api/v1/Bots/createCoPilotBot', {
        method: 'POST',
        body: {
          userID: userID.value,
          name: `Co-Pilot Bot - ${new Date().toLocaleDateString()}`,
          exchange: app.getUserSelectedExchange,
          symbol: selectedOrder.value.symbol,
          PriceStart: selectedOrder.value.price.toString(),
          amountPriceStart: selectedOrder.value.amount.toString(),
          lowerPrice: (parseFloat(selectedOrder.value.price) * 0.9).toString(),
          upperPrice: (parseFloat(selectedOrder.value.price) * 1.1).toString(),
          amountType: 'fixed',
          amount: selectedOrder.value.amount.toString(),
          nrOfGrids: '10',
          ordersSide: 'both',
          incrementalPercentAmountBuy: '2',
          incrementalPercentAmountSell: '2',
          activeOrders: [],
          filledOrders: [],
          apiKeyNames: [selectedOrder.value.apiKeyName]
        }
      });

      if (botResponse.success) {
        currentBotId.value = botResponse.bot._id;
        console.log('✅ Co-Pilot bot created:', currentBotId.value);
        message.info('✅ Co-Pilot bot created for automation rules');
      }
    } catch (error) {
      console.error('Error creating Co-Pilot bot:', error);
      message.error('Failed to create Co-Pilot bot for automation');
      return;
    }
  }

  try {
    console.log('📤 Sending applyRuleTemplate request:', {
      userID: userID.value,
      botId: currentBotId.value,
      orderId: selectedOrder.value.id,
      templateId: templateId
    });

    const response = await $fetch('/api/v1/Bots/applyRuleTemplate', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: currentBotId.value,
        orderId: selectedOrder.value.id,
        templateId: templateId
      }
    });

    if (response.success) {
      message.success(`✅ ${response.message}`);
      showOrderRuleModal.value = false;

      // Update rules count in order
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (orderIndex !== -1) {
        orders.value[orderIndex].rulesCount = (orders.value[orderIndex].rulesCount || 0) + 1;
      }

      await refreshOrders();
    }
  } catch (error) {
    console.error('Error applying template:', error);
    message.error('Failed to apply template');
  }
}

async function saveOrderRule() {
  if (!newOrderRule.value.ruleName) {
    message.error('Please enter a rule name');
    return;
  }

  // Validate we have a selected order
  if (!selectedOrder.value || !selectedOrder.value.id) {
    message.error('No order selected. Please try again.');
    console.error('selectedOrder missing or has no id:', selectedOrder.value);
    return;
  }

  console.log('📝 [CO-PILOT] Saving order rule:', {
    orderId: selectedOrder.value.id,
    ruleName: newOrderRule.value.ruleName,
    ruleType: newOrderRule.value.ruleType,
    triggerCondition: newOrderRule.value.triggerCondition,
    actionConfig: newOrderRule.value.actionConfig,
    currentBotId: currentBotId.value
  });

  // Special logging for OneClick bot with strategy
  if (newOrderRule.value.actionConfig?.botType === 'oneclick') {
    console.log('🎯 [CO-PILOT] OneClick Bot Configuration:', {
      botType: 'oneclick',
      strategyId: newOrderRule.value.actionConfig.oneClickStrategy,
      isCustom: newOrderRule.value.actionConfig.oneClickStrategy === 'custom',
      strategyDetails: newOrderRule.value.actionConfig.oneClickStrategy !== 'custom'
        ? oneClickStrategies.value.find(s => s._id === newOrderRule.value.actionConfig.oneClickStrategy)
        : null
    });
  }

  // Check if we have a bot ID, if not create a virtual Co-Pilot bot
  if (!currentBotId.value) {
    try {
      // Create a virtual Co-Pilot bot for this session
      const botResponse = await $fetch('/api/v1/Bots/createCoPilotBot', {
        method: 'POST',
        body: {
          userID: userID.value,
          name: `Co-Pilot Bot - ${new Date().toLocaleDateString()}`,
          exchange: app.getUserSelectedExchange,
          symbol: selectedOrder.value.symbol,
          PriceStart: selectedOrder.value.price.toString(),
          amountPriceStart: selectedOrder.value.amount.toString(),
          lowerPrice: (parseFloat(selectedOrder.value.price) * 0.9).toString(),
          upperPrice: (parseFloat(selectedOrder.value.price) * 1.1).toString(),
          amountType: 'fixed',
          amount: selectedOrder.value.amount.toString(),
          nrOfGrids: '10',
          ordersSide: 'both',
          incrementalPercentAmountBuy: '2',
          incrementalPercentAmountSell: '2',
          activeOrders: [],
          filledOrders: [],
          apiKeyNames: [selectedOrder.value.apiKeyName]
        }
      });

      if (botResponse.success) {
        currentBotId.value = botResponse.bot._id;
        console.log('✅ Co-Pilot bot created:', currentBotId.value);
        message.info('✅ Co-Pilot bot created for automation rules');
      }
    } catch (error) {
      console.error('Error creating Co-Pilot bot:', error);
      message.error('Failed to create Co-Pilot bot for automation');
      return;
    }
  }

  try {
    // Prepare actionConfig - if using OneClick strategy, expand it with full data
    let actionConfigToSave = { ...newOrderRule.value.actionConfig };

    if (actionConfigToSave.botType === 'oneclick') {
      if (actionConfigToSave.oneClickStrategy && actionConfigToSave.oneClickStrategy !== 'custom') {
        // Saved strategy selected - expand with full strategy data
        const strategy = oneClickStrategies.value.find(s => s._id === actionConfigToSave.oneClickStrategy);

        if (strategy) {
          console.log('🎯 [CO-PILOT] Expanding strategy data for save:', strategy);

          // Include full strategy data in actionConfig
          actionConfigToSave = {
            ...actionConfigToSave,
            strategyName: strategy.name,
            strategyDescription: strategy.description,
            configName: strategy.configName,
            incBuy: strategy.incBuy,
            incSell: strategy.incSell,
            devPriceBuy: strategy.devPriceBuy,
            devPriceSell: strategy.devPriceSell,
            devAmtBuy: strategy.devAmtBuy,
            devAmtSell: strategy.devAmtSell,
            nrOfGrids: strategy.nrOfGrids,
            pairs: strategy.pairs // Include all pairs with their settings
          };

          console.log('✅ [CO-PILOT] Expanded actionConfig:', actionConfigToSave);
        }
      } else {
        // Custom configuration - ensure all custom fields are included
        console.log('🎯 [CO-PILOT] Using custom OneClick configuration');
        actionConfigToSave.strategyName = 'Custom Configuration';
        actionConfigToSave.strategyDescription = 'User-defined custom settings';

        // Create a single pair from custom settings if no pairs exist
        if (!actionConfigToSave.pairs || actionConfigToSave.pairs.length === 0) {
          if (actionConfigToSave.lowerPricePercent !== undefined || actionConfigToSave.upperPricePercent !== undefined) {
            actionConfigToSave.pairs = [{
              symbol: selectedOrder.value?.symbol || 'UNKNOWN',
              lowerPricePercent: actionConfigToSave.lowerPricePercent || -20,
              upperPricePercent: actionConfigToSave.upperPricePercent || 1,
              amount: actionConfigToSave.amount || 1,
              grids: actionConfigToSave.nrOfGrids || 10
            }];
          }
        }

        console.log('✅ [CO-PILOT] Custom actionConfig:', actionConfigToSave);
      }
    }

    const requestBody = {
      userID: userID.value,
      botId: currentBotId.value,
      orderId: selectedOrder.value.id,
      ruleName: newOrderRule.value.ruleName,
      ruleType: newOrderRule.value.ruleType,
      triggerCondition: newOrderRule.value.triggerCondition,
      actionConfig: actionConfigToSave
    };

    console.log('📤 [CO-PILOT] Sending addCoPilotRule request:', requestBody);

    const response = await $fetch('/api/v1/Bots/addCoPilotRule', {
      method: 'POST',
      body: requestBody
    });

    console.log('📥 [CO-PILOT] addCoPilotRule response:', response);

    if (response.success) {
      message.success(`✅ ${response.message}`);
      showOrderRuleModal.value = false;

      // Update rules count in order
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (orderIndex !== -1) {
        orders.value[orderIndex].rulesCount = (orders.value[orderIndex].rulesCount || 0) + 1;
      }

      await refreshOrders();
    }
  } catch (error) {
    console.error('Error saving rule:', error);
    message.error('Failed to save rule');
  }
}

// Delete rule
async function deleteOrderRule(ruleId) {
  if (!confirm('Are you sure you want to delete this rule?')) return;

  console.log('🗑️ [CO-PILOT] Deleting rule:', ruleId);

  try {
    // Find the rule to get its botId
    const rule = orderRules.value.find(r => r.id === ruleId);
    if (!rule) {
      console.error('❌ [CO-PILOT] Rule not found in orderRules');
      message.error('Rule not found');
      return;
    }

    console.log('🗑️ [CO-PILOT] Rule details:', {
      ruleId: rule.id,
      botId: rule.botId,
      ruleName: rule.ruleName
    });

    const response = await $fetch('/api/v1/Bots/deleteCoPilotRule', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: rule.botId,
        ruleId: ruleId
      }
    });

    if (response.success) {
      console.log('✅ [CO-PILOT] Rule deleted successfully');
      message.success(response.message);
      await fetchOrderRules(selectedOrder.value.id);

      // Update rules count
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (orderIndex !== -1 && orders.value[orderIndex].rulesCount > 0) {
        orders.value[orderIndex].rulesCount--;
      }
    }
  } catch (error) {
    console.error('❌ [CO-PILOT] Error deleting rule:', error);
    message.error('Failed to delete rule');
  }
}

// Toggle rule active status
async function toggleOrderRule(ruleId) {
  console.log('🔄 [CO-PILOT] Toggling rule:', ruleId);

  try {
    // Find the rule to get its botId
    const rule = orderRules.value.find(r => r.id === ruleId);
    if (!rule) {
      console.error('❌ [CO-PILOT] Rule not found in orderRules');
      message.error('Rule not found');
      return;
    }

    console.log('🔄 [CO-PILOT] Toggling rule:', {
      ruleId: rule.id,
      botId: rule.botId,
      currentState: rule.isActive
    });

    const response = await $fetch('/api/v1/Bots/toggleCoPilotRule', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: rule.botId,
        ruleId: ruleId
      }
    });

    if (response.success) {
      console.log('✅ [CO-PILOT] Rule toggled successfully');
      message.success(response.message);
      await fetchOrderRules(selectedOrder.value.id);
    }
  } catch (error) {
    console.error('❌ [CO-PILOT] Error toggling rule:', error);
    message.error('Failed to toggle rule');
  }
}

// ========== Pair Expansion & Grid Calculation Functions ==========

// Toggle pair expansion
function togglePairExpansion(ruleId, pairIndex) {
  if (!expandedPairs.value.has(ruleId)) {
    expandedPairs.value.set(ruleId, new Set());
  }

  const pairSet = expandedPairs.value.get(ruleId);
  if (pairSet.has(pairIndex)) {
    pairSet.delete(pairIndex);
  } else {
    pairSet.add(pairIndex);
  }

  // Force reactivity
  expandedPairs.value = new Map(expandedPairs.value);
}

// Check if pair is expanded
function isPairExpanded(ruleId, pairIndex) {
  return expandedPairs.value.has(ruleId) && expandedPairs.value.get(ruleId).has(pairIndex);
}

// Calculate pair price based on percentage
function calculatePairPrice(pair, type) {
  // Assume we have a base price from the order
  // For now, let's calculate from the percentage
  // This should be improved to use actual current market price
  const basePrice = selectedOrder.value?.price || 1;

  if (type === 'lower') {
    const percentage = parseFloat(pair.lowerPricePercent) || 0;
    return (basePrice * (1 + percentage / 100)).toFixed(6);
  } else {
    const percentage = parseFloat(pair.upperPricePercent) || 0;
    return (basePrice * (1 + percentage / 100)).toFixed(6);
  }
}

// Wrapper functions that adapt Co-Pilot's pair format to composable functions
// Co-Pilot uses percentage-based pricing (lowerPricePercent, upperPricePercent)
// Composable uses absolute prices (lowerPrice, upperPrice)

/**
 * Calculate all grid orders for a pair
 * Adapts Co-Pilot's percentage format to composable's absolute price format
 */
function calculateGridOrders(pair) {
  // Convert percentage-based prices to absolute prices
  const lowerPrice = parseFloat(calculatePairPrice(pair, 'lower'));
  const upperPrice = parseFloat(calculatePairPrice(pair, 'upper'));
  const basePrice = selectedOrder.value?.price || 1;

  // Create adapted pair object for composable
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)
  };

  // Use composable function
  const orders = calculateGridOrdersBase(adaptedPair);

  // Add distance percentage for UI display
  return orders.map((order, i) => ({
    ...order,
    index: i + 1,
    distance: (((order.price - basePrice) / basePrice) * 100).toFixed(2)
  }));
}

/**
 * Calculate total investment (quote currency) for a pair
 */
function calculateTotalInvestment(pair) {
  const lowerPrice = parseFloat(calculatePairPrice(pair, 'lower'));
  const upperPrice = parseFloat(calculatePairPrice(pair, 'upper'));

  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)
  };

  return calculateTotalInvestmentBase(adaptedPair);
}

/**
 * Calculate average price for all orders
 */
function calculateAveragePrice(pair) {
  const lowerPrice = parseFloat(calculatePairPrice(pair, 'lower'));
  const upperPrice = parseFloat(calculatePairPrice(pair, 'upper'));

  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)
  };

  return calculateAveragePriceBase(adaptedPair);
}

/**
 * Calculate total base amount
 */
function calculateTotalBaseAmount(pair) {
  const lowerPrice = parseFloat(calculatePairPrice(pair, 'lower'));
  const upperPrice = parseFloat(calculatePairPrice(pair, 'upper'));

  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)
  };

  return calculateTotalBaseAmountBase(adaptedPair);
}

// ============================================
// DASHBOARD FINANCIAL CALCULATIONS
// ============================================

/**
 * Calculate total investment across ALL bots in ALL rules
 * Sums up the investment needed for every bot that will be created
 */
function calculateTotalBotsInvestment() {
  let totalInvestment = 0;

  // Iterate through all order rules
  for (const rule of orderRules.value) {
    if (!rule.isActive || !rule.actionConfig) continue;

    const botType = rule.actionConfig.botType;

    // OneClick Bot - has multiple pairs, each creates a GridBot
    if (botType === 'oneclick' && rule.actionConfig.pairs) {
      for (const pair of rule.actionConfig.pairs) {
        totalInvestment += calculateTotalInvestment(pair);
      }
    }
    // Grid Bot - single pair
    else if (botType === 'grid' && rule.actionConfig.pairs && rule.actionConfig.pairs[0]) {
      totalInvestment += calculateTotalInvestment(rule.actionConfig.pairs[0]);
    }
    // FrontRun Bot - use composable calculation
    else if (botType === 'frontrun') {
      const price = selectedOrder.value?.price || 0.1;
      totalInvestment += calculateFrontRunInvestment(rule.actionConfig, price);
    }
    // DCA/Smart DCA - use composable calculation
    else if (botType === 'dca' || botType === 'smartdca') {
      totalInvestment += calculateDcaInvestment(rule.actionConfig.botConfig || {});
    }
    // Fibonacci Bot - use composable calculation
    else if (botType === 'fib') {
      const botConfig = rule.actionConfig.botConfig || {};
      // Set defaults if not provided
      if (!botConfig.lowerPrice) botConfig.lowerPrice = selectedOrder.value?.price * 0.5;
      if (!botConfig.upperPrice) botConfig.upperPrice = selectedOrder.value?.price * 1.5;
      totalInvestment += calculateFibInvestment(botConfig);
    }
    // Scalping Bot - use composable calculation
    else if (botType === 'scalping') {
      const price = selectedOrder.value?.price || 0.1;
      totalInvestment += calculateScalpingInvestment(rule.actionConfig, price);
    }
  }

  return totalInvestment;
}

/**
 * Calculate total number of bots that will be created
 */
function calculateTotalBots() {
  let totalBots = 0;

  for (const rule of orderRules.value) {
    if (!rule.isActive || !rule.actionConfig) continue;

    const botType = rule.actionConfig.botType;

    // OneClick creates multiple bots (one per pair)
    if (botType === 'oneclick' && rule.actionConfig.pairs) {
      totalBots += rule.actionConfig.pairs.length;
    }
    // All other bot types create 1 bot
    else if (botType) {
      totalBots += 1;
    }
  }

  return totalBots;
}

/**
 * Calculate remaining capital after all bots are funded
 * = Total Order Value - Total Bots Investment
 */
function calculateRemainingCapital() {
  const totalOrderValue = parseFloat(selectedOrder.value?.totalValue) ||
                         (selectedOrder.value?.amount * selectedOrder.value?.price) || 0;
  const totalInvestment = calculateTotalBotsInvestment();

  return totalOrderValue - totalInvestment;
}

/**
 * Calculate total base currency that will be bought across all bots
 * Example: Total LCX to be purchased
 */
function calculateTotalBaseCurrency() {
  let totalBase = 0;

  for (const rule of orderRules.value) {
    if (!rule.isActive || !rule.actionConfig) continue;

    const botType = rule.actionConfig.botType;

    // OneClick Bot - sum across all pairs
    if (botType === 'oneclick' && rule.actionConfig.pairs) {
      for (const pair of rule.actionConfig.pairs) {
        totalBase += calculateTotalBaseAmount(pair);
      }
    }
    // Grid Bot
    else if (botType === 'grid' && rule.actionConfig.pairs && rule.actionConfig.pairs[0]) {
      totalBase += calculateTotalBaseAmount(rule.actionConfig.pairs[0]);
    }
    // FrontRun Bot
    else if (botType === 'frontrun') {
      const amount = parseFloat(rule.actionConfig.amount) || 1;
      const grids = parseInt(rule.actionConfig.nrOfGrids) || 10;
      totalBase += (amount * grids);
    }
    // Fibonacci Bot
    else if (botType === 'fib') {
      const amount = parseFloat(rule.actionConfig.botConfig?.amount) || 1;
      const grids = parseInt(rule.actionConfig.botConfig?.nrOfGrids) || 7;
      totalBase += (amount * grids);
    }
    // DCA/Smart DCA - just base order amount
    else if (botType === 'dca' || botType === 'smartdca') {
      const baseOrder = parseFloat(rule.actionConfig.botConfig?.baseOrderAmount) || 0;
      totalBase += baseOrder;
    }
    // Scalping Bot
    else if (botType === 'scalping') {
      const amount = parseFloat(rule.actionConfig.amount) || 1;
      totalBase += amount;
    }
  }

  return totalBase;
}

/**
 * Calculate total quote currency needed across all bots
 * Example: Total USDC investment
 * (This is essentially the same as calculateTotalBotsInvestment, but kept separate for clarity)
 */
function calculateTotalQuoteCurrency() {
  return calculateTotalBotsInvestment();
}

/**
 * Calculate detailed breakdown for EACH individual bot
 * Returns array of bot details with investment info
 */
function calculatePerBotBreakdown() {
  const botsList = [];
  let botIndex = 1;

  for (const rule of orderRules.value) {
    if (!rule.isActive || !rule.actionConfig) continue;

    const botType = rule.actionConfig.botType;
    const ruleNumber = rule.ruleNumber || botIndex;

    // OneClick Bot - creates multiple bots (one per pair)
    if (botType === 'oneclick' && rule.actionConfig.pairs) {
      for (const pair of rule.actionConfig.pairs) {
        const baseAmount = calculateTotalBaseAmount(pair);
        const quoteInvestment = calculateTotalInvestment(pair);
        const ordersCount = parseInt(pair.grids) || 10;

        botsList.push({
          botType: 'GridBot',
          symbol: pair.symbol || selectedOrder.value?.symbol || 'N/A',
          baseCurrency: getBaseCurrency(pair.symbol || selectedOrder.value?.symbol || 'N/A'),
          ruleNumber,
          baseAmount,
          quoteInvestment,
          ordersCount,
          source: `OneClick Rule #${ruleNumber}`
        });
      }
    }
    // Grid Bot - single bot
    else if (botType === 'grid' && rule.actionConfig.pairs && rule.actionConfig.pairs[0]) {
      const pair = rule.actionConfig.pairs[0];
      const baseAmount = calculateTotalBaseAmount(pair);
      const quoteInvestment = calculateTotalInvestment(pair);
      const ordersCount = parseInt(pair.grids) || 10;

      botsList.push({
        botType: 'Grid',
        symbol: pair.symbol || selectedOrder.value?.symbol || 'N/A',
        baseCurrency: getBaseCurrency(pair.symbol || selectedOrder.value?.symbol || 'N/A'),
        ruleNumber,
        baseAmount,
        quoteInvestment,
        ordersCount,
        source: `Grid Rule #${ruleNumber}`
      });
    }
    // FrontRun Bot - use composable
    else if (botType === 'frontrun') {
      const amount = parseFloat(rule.actionConfig.amount) || 1;
      const grids = parseInt(rule.actionConfig.nrOfGrids) || 10;
      const price = selectedOrder.value?.price || 0.1;
      const symbol = selectedOrder.value?.symbol || 'N/A';

      botsList.push({
        botType: 'FrontRun',
        symbol,
        baseCurrency: getBaseCurrency(symbol),
        ruleNumber,
        baseAmount: amount * grids,
        quoteInvestment: calculateFrontRunInvestment(rule.actionConfig, price),
        ordersCount: grids,
        source: `FrontRun Rule #${ruleNumber}`
      });
    }
    // DCA Bot - use composable
    else if (botType === 'dca') {
      const botConfig = rule.actionConfig.botConfig || {};
      const baseOrder = parseFloat(botConfig.baseOrderAmount) || 0;
      const maxSafetyOrders = parseInt(botConfig.maxSafetyOrders) || 5;
      const symbol = selectedOrder.value?.symbol || 'N/A';

      botsList.push({
        botType: 'DCA',
        symbol,
        baseCurrency: getBaseCurrency(symbol),
        ruleNumber,
        baseAmount: baseOrder,
        quoteInvestment: calculateDcaInvestment(botConfig),
        ordersCount: maxSafetyOrders + 1,
        source: `DCA Rule #${ruleNumber}`
      });
    }
    // Smart DCA Bot - use composable
    else if (botType === 'smartdca') {
      const botConfig = rule.actionConfig.botConfig || {};
      const baseOrder = parseFloat(botConfig.baseOrderAmount) || 0;
      const maxSafetyOrders = parseInt(botConfig.maxSafetyOrders) || 5;
      const symbol = selectedOrder.value?.symbol || 'N/A';

      botsList.push({
        botType: 'SmartDCA',
        symbol,
        baseCurrency: getBaseCurrency(symbol),
        ruleNumber,
        baseAmount: baseOrder,
        quoteInvestment: calculateDcaInvestment(botConfig),
        ordersCount: maxSafetyOrders + 1,
        source: `Smart DCA Rule #${ruleNumber}`
      });
    }
    // Fibonacci Bot - use composable
    else if (botType === 'fib') {
      const botConfig = rule.actionConfig.botConfig || {};
      const amount = parseFloat(botConfig.amount) || 1;
      const grids = parseInt(botConfig.nrOfGrids) || 7;
      const symbol = selectedOrder.value?.symbol || 'N/A';

      // Set defaults if not provided
      if (!botConfig.lowerPrice) botConfig.lowerPrice = selectedOrder.value?.price * 0.5;
      if (!botConfig.upperPrice) botConfig.upperPrice = selectedOrder.value?.price * 1.5;

      botsList.push({
        botType: 'Fibonacci',
        symbol,
        baseCurrency: getBaseCurrency(symbol),
        ruleNumber,
        baseAmount: amount * grids,
        quoteInvestment: calculateFibInvestment(botConfig),
        ordersCount: grids,
        source: `Fib Rule #${ruleNumber}`
      });
    }
    // Scalping Bot - use composable
    else if (botType === 'scalping') {
      const amount = parseFloat(rule.actionConfig.amount) || 1;
      const price = selectedOrder.value?.price || 0.1;
      const symbol = selectedOrder.value?.symbol || 'N/A';

      botsList.push({
        botType: 'Scalping',
        symbol,
        baseCurrency: getBaseCurrency(symbol),
        ruleNumber,
        baseAmount: amount,
        quoteInvestment: calculateScalpingInvestment(rule.actionConfig, price),
        ordersCount: 1,
        source: `Scalping Rule #${ruleNumber}`
      });
    }
  }

  return botsList;
}

/**
 * Get color for bot type tag
 */
function getBotTypeColor(botType) {
  const colorMap = {
    'GridBot': 'success',
    'Grid': 'success',
    'FrontRun': 'warning',
    'DCA': 'info',
    'SmartDCA': 'info',
    'Fibonacci': 'error',
    'Scalping': 'default'
  };
  return colorMap[botType] || 'default';
}

/**
 * Calculate totals per base currency
 * Returns: { LCX: 330, BTC: 220, ETH: 220, SOL: 100, ... }
 */
function calculateBaseCurrencyTotals() {
  const totals = {};
  const bots = calculatePerBotBreakdown();

  for (const bot of bots) {
    const currency = bot.baseCurrency;
    if (!totals[currency]) {
      totals[currency] = 0;
    }
    totals[currency] += bot.baseAmount;
  }

  return totals;
}

// Track current bot ID (will be set when bot is selected/created)
const currentBotId = ref(null);

function stopAutomation(index) {
  activeAutomations.value.splice(index, 1);
  message.warning('⏹️ Automation stopped');
}

function getProgressColor(progress) {
  if (progress < 33) return '#f56c6c';
  if (progress < 66) return '#e6a23c';
  return '#67c23a';
}

// Auto Monitor
function startMonitoring() {
  if (monitorInterval.value) return;

  monitorInterval.value = setInterval(async () => {
    await checkOrdersAndTriggerRules();
  }, 10000); // Check every 10 seconds

  message.success('🟢 Auto monitoring started');
}

function stopMonitoring() {
  if (monitorInterval.value) {
    clearInterval(monitorInterval.value);
    monitorInterval.value = null;
    message.warning('⚪ Auto monitoring stopped');
  }
}

// Auto Refresh Orders
const isMounted = ref(false);

function startAutoRefresh() {
  if (autoRefreshInterval.value) return;

  autoRefreshInterval.value = setInterval(async () => {
    // Skip if component unmounted or any modal is open
    if (!isMounted.value || showOrderRuleModal.value || showOrderRulesView.value) {
      console.log('⏸️ [CO-PILOT] Auto-refresh paused (modal open or unmounted)');
      return;
    }

    console.log('🔄 [CO-PILOT] Auto-refreshing orders (silent mode)...');
    try {
      // Use silent mode to avoid message notifications during auto-refresh
      await refreshOrders(true);
    } catch (error) {
      console.error('❌ [CO-PILOT] Auto-refresh error:', error);
    }
  }, 30000); // Refresh every 30 seconds

  console.log('✅ [CO-PILOT] Auto-refresh enabled (30s interval, silent mode)');
}

function stopAutoRefresh() {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
    autoRefreshInterval.value = null;
    console.log('⏹️ [CO-PILOT] Auto-refresh disabled');
  }
}

async function checkOrdersAndTriggerRules() {
  // Check each order against automation rules
  for (const order of orders.value) {
    for (const rule of automationRules.value.filter(r => r.enabled)) {
      if (shouldTriggerRule(order, rule)) {
        await executeRule(order, rule);
      }
    }
  }
}

function shouldTriggerRule(order, rule) {
  const fillPercent = (order.filled / order.amount) * 100;

  switch (rule.triggerType) {
    case 'partial-fill':
      return fillPercent >= rule.triggerValue && fillPercent < 100;
    case 'fully-filled':
      return fillPercent === 100;
    case 'amount-filled':
      return (order.filled * order.price) >= rule.triggerValue;
    default:
      return false;
  }
}

async function executeRule(order, rule) {
  message.info(`⚡ Executing rule for order ${order.id}`);

  // Add to active automations
  activeAutomations.value.push({
    orderId: order.id,
    progress: 0,
    actionDescription: formatRuleCondition(rule)
  });

  // Execute action based on rule type
  // Implementation here...
}

// Lifecycle
async function loadRuleTemplates() {
  try {
    const response = await $fetch('/api/v1/Bots/getCoPilotRuleTemplates', {
      query: {
        userID: userID.value,
        includeGlobal: 'true'
      }
    });

    if (response.success) {
      // Map templates - keep original database format for proper display
      automationRules.value = response.templates.map(template => ({
        id: template.id,
        templateNumber: template.templateNumber,
        templateName: template.templateName,
        // Keep both old and new format for compatibility
        triggerCondition: template.triggerCondition,
        triggerType: template.triggerCondition === 'on_fill' ? 'fully-filled' :
                     template.triggerCondition === 'on_partial_fill' ? 'partial-fill' :
                     template.triggerCondition === 'on_time' ? 'time-elapsed' : 'fully-filled',
        ruleType: template.ruleType,
        actionType: template.ruleType === 'create_bot' ? 'create-bot' :
                    template.ruleType === 'cancel_order' ? 'cancel' : 'create-bot',
        actionConfig: template.actionConfig,
        botType: template.actionConfig?.botType || null,
        enabled: true,
        usageCount: template.usageCount
      }));
    }
  } catch (error) {
    console.error('Error loading rule templates:', error);
  }
}

async function loadExistingCoPilotBot() {
  try {
    const response = await $fetch('/api/v1/fetchCoPilotBots', {
      query: {
        userID: userID.value,
        exchange: app.getUserSelectedExchange
      }
    });

    if (response && response.length > 0) {
      // Use the first Co-Pilot bot found
      currentBotId.value = response[0]._id;
      console.log('Loaded existing Co-Pilot bot:', currentBotId.value);
    }
  } catch (error) {
    console.error('Error loading Co-Pilot bots:', error);
    // Not critical - bot will be created when needed
  }
}

// Load OneClick Strategies
async function loadOneClickStrategies() {
  console.log('🎯 [CO-PILOT] Loading OneClick Strategies...');
  loadingStrategies.value = true;
  try {
    const response = await $fetch('/api/v1/getOneClickStrategies', {
      method: 'GET',
      query: {
        userID: userID.value
      }
    });

    console.log('📥 [CO-PILOT] Strategies Response:', response);

    if (response.success) {
      oneClickStrategies.value = response.strategies || [];
      console.log(`✅ [CO-PILOT] Loaded ${oneClickStrategies.value.length} OneClick strategies`);
    } else {
      console.warn('⚠️ [CO-PILOT] Failed to load strategies:', response.message);
    }
  } catch (error) {
    console.error('❌ [CO-PILOT] Error loading OneClick strategies:', error);
  } finally {
    loadingStrategies.value = false;
  }
}

onMounted(async () => {
  isMounted.value = true;

  await loadRuleTemplates();
  await loadExistingCoPilotBot();
  await loadOneClickStrategies();
  await refreshOrders();
  await loadDashboardData();

  // Start auto-refresh if enabled
  if (autoRefreshEnabled.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  isMounted.value = false;
  stopMonitoring();
  stopAutoRefresh();
});

// Watch auto monitor
watch(() => autoMonitor.value, (newVal) => {
  if (newVal) {
    startMonitoring();
  } else {
    stopMonitoring();
  }
});
</script>

<style scoped>
.copilot-advanced {
  width: 100%;
  padding: 12px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.copilot-header {
  text-align: center;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #6366f1;
  margin: 0 0 6px 0;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Filter Card */
.filter-card {
  background: rgba(30, 35, 40, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 700;
  color: #6366f1;
}

/* Orders Card */
.orders-card {
  background: rgba(20, 25, 30, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 16px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.orders-title {
  font-size: 14px;
  font-weight: 700;
  color: #6366f1;
}

/* Rules Card */
.rules-card {
  background: rgba(30, 35, 40, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 16px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rules-title {
  font-size: 14px;
  font-weight: 700;
  color: #6366f1;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  background: rgba(40, 45, 50, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.rule-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.rule-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-condition {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

/* Modal */
.rule-example {
  margin-top: 8px;
  padding: 8px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Active Automations */
.active-automations {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), rgba(5, 245, 237, 0.1));
  border: 2px solid rgba(16, 235, 4, 0.4);
}

.automations-header {
  margin-bottom: 12px;
}

.automations-title {
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
}

.automations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.automation-item {
  background: rgba(30, 35, 40, 0.6);
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.automation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.automation-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.automation-order,
.automation-progress,
.automation-action {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-card {
  background: rgba(30, 35, 40, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

/* Bot Types Grid */
.bot-types-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.bot-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: rgba(40, 45, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.bot-type-item:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.bot-type-item.active {
  background: rgba(99, 102, 241, 0.3);
  border-color: #6366f1;
}

.bot-icon {
  font-size: 18px;
  margin-bottom: 2px;
}

.bot-name {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

/* Chain Monitor */
.chain-monitor-content {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.monitor-stat {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: rgba(40, 45, 50, 0.4);
  border-radius: 4px;
}

.stat-label {
  font-size: 10px;
  color: #666;
  display: block;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

/* Active Bots List */
.active-bots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.running-bot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(40, 45, 50, 0.4);
  border-radius: 4px;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bot-type-icon {
  font-size: 18px;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* Presets List */
.presets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(40, 45, 50, 0.4);
  border-radius: 4px;
}

/* Performance Stats */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.perf-stat {
  padding: 12px;
  background: rgba(40, 45, 50, 0.4);
  border-radius: 4px;
  text-align: center;
}

.perf-label {
  font-size: 10px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.perf-value {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .copilot-advanced {
    padding: 8px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .bot-types-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .rule-content,
  .automation-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .rule-right {
    width: 100%;
  }
}
</style>
