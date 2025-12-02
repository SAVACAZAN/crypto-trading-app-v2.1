<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    title="📊 Automation Rules"
    style="width: 90vw; max-width: 1200px; max-height: 90vh;"
  >
    <div v-if="order">
      <!-- Order Info Header -->
      <n-card size="small" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 18px; font-weight: bold; color: #10eb04;">
              {{ order.symbol }}
              <n-tag :type="order.side === 'buy' ? 'success' : 'error'" size="small" style="margin-left: 8px;">
                {{ order.side?.toUpperCase() }}
              </n-tag>
            </div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">
              Amount: <strong style="color: #fff;">{{ order.amount }}</strong> |
              Price: <strong style="color: #fff;">${{ order.price }}</strong> |
              Total: <strong style="color: #ffd93d;">${{ (order.amount * order.price).toFixed(2) }}</strong>
            </div>
          </div>
          <n-button size="small" type="primary" @click="$emit('add-rule', order)">
            ➕ Add Rule
          </n-button>
        </div>
      </n-card>

      <!-- Rules List -->
      <n-spin :show="loading">
        <!-- Empty State -->
        <div v-if="rules.length === 0" style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
          <div style="font-size: 16px; color: #888;">No automation rules for this order</div>
          <n-button type="primary" style="margin-top: 16px;" @click="$emit('add-rule', order)">
            Create First Rule
          </n-button>
        </div>

        <!-- Rules Cards -->
        <div v-else style="display: flex; flex-direction: column; gap: 12px;">
          <n-card
            v-for="rule in rules"
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
                  <n-tag type="info" size="small">#{{ rule.ruleNumber || 'N/A' }}</n-tag>
                  <span style="font-weight: bold; font-size: 14px;">{{ rule.ruleName }}</span>
                </div>
                <div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
                  <n-tag size="tiny" :bordered="false" style="background: #2d2d2d;">
                    📍 {{ formatTrigger(rule.triggerCondition) }}
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
                  @click="$emit('toggle-rule', rule.id)"
                >
                  {{ rule.isActive ? '⏸️' : '▶️' }}
                </n-button>
                <n-button size="tiny" type="error" @click="$emit('delete-rule', rule.id)">
                  🗑️
                </n-button>
              </n-space>
            </div>

            <!-- Bot Config Details -->
            <div v-if="rule.actionConfig?.botType" style="margin-top: 12px; padding: 12px; background: #1a1a1a; border-radius: 4px;">
              <div style="font-size: 11px; font-weight: bold; color: #10eb04; margin-bottom: 8px;">
                🤖 Bot Configuration
              </div>

              <!-- OneClick Strategy with Preview Button -->
              <div v-if="rule.actionConfig.botType === 'oneclick' && rule.actionConfig.oneClickStrategy">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                  <n-tag size="small" type="info">
                    Strategy: {{ getStrategyName(rule.actionConfig.oneClickStrategy) || 'Custom' }}
                  </n-tag>
                  <n-button size="tiny" type="primary" @click="openGridPreview(rule)">
                    📊 View Grid Orders
                  </n-button>
                </div>

                <!-- Strategy Details Card (for saved strategies) -->
                <div v-if="getStrategyDetails(rule.actionConfig.oneClickStrategy)" style="margin-top: 8px; background: #16181d; padding: 10px; border-radius: 4px; border: 1px solid #2a3441;">
                  <div style="font-size: 10px; font-weight: bold; color: #6366f1; margin-bottom: 6px;">
                    📋 Strategy Configuration
                  </div>

                  <!-- Summary Stats -->
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px;">
                    <div style="background: #1a1f2e; padding: 6px; border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">Pairs</div>
                      <div style="font-size: 12px; font-weight: 700; color: #10eb04;">
                        {{ getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.length || 0 }}
                      </div>
                    </div>
                    <div style="background: #1a1f2e; padding: 6px; border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">Grids</div>
                      <div style="font-size: 12px; font-weight: 700; color: #a78bfa;">
                        {{ getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.[0]?.grids || 10 }}
                      </div>
                    </div>
                    <div style="background: #1a1f2e; padding: 6px; border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">Total Orders</div>
                      <div style="font-size: 12px; font-weight: 700; color: #ffd93d;">
                        {{ (getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.length || 0) * (getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.[0]?.grids || 10) }}
                      </div>
                    </div>
                    <div style="background: #1a1f2e; padding: 6px; border-radius: 3px; text-align: center;">
                      <div style="font-size: 9px; color: #888;">Amount</div>
                      <div style="font-size: 12px; font-weight: 700; color: #eb0404;">
                        {{ getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.[0]?.amount || 1 }}
                      </div>
                    </div>
                  </div>

                  <!-- First 5 Pairs Preview -->
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Trading Pairs (first 5):</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    <n-tag v-for="(pair, idx) in getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.slice(0, 5)"
                      :key="idx"
                      size="tiny"
                      type="success"
                      style="font-size: 9px;"
                    >
                      {{ pair.symbol }}
                    </n-tag>
                    <n-tag v-if="getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs?.length > 5"
                      size="tiny"
                      type="info"
                      style="font-size: 9px;"
                    >
                      +{{ getStrategyDetails(rule.actionConfig.oneClickStrategy).pairs.length - 5 }} more
                    </n-tag>
                  </div>
                </div>

                <!-- Custom Config Quick Stats -->
                <div v-else-if="rule.actionConfig.oneClickStrategy === 'custom'" style="margin-top: 8px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 10px;">
                  <div>
                    <span style="color: #888;">Lower %:</span>
                    <span style="color: #10eb04; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.lowerPricePercent || -20 }}%</span>
                  </div>
                  <div>
                    <span style="color: #888;">Upper %:</span>
                    <span style="color: #eb0404; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.upperPricePercent || 1 }}%</span>
                  </div>
                  <div>
                    <span style="color: #888;">Grids:</span>
                    <span style="color: #ffd93d; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.nrOfGrids || 10 }}</span>
                  </div>
                </div>
              </div>

              <!-- Grid Config -->
              <div v-if="['grid', 'dcagrid'].includes(rule.actionConfig.botType) && rule.actionConfig.botConfig">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11px;">
                  <div v-if="rule.actionConfig.botConfig.lowerPrice">
                    <span style="color: #888;">Lower:</span>
                    <span style="color: #10eb04; font-weight: bold; margin-left: 4px;">${{ parseFloat(rule.actionConfig.botConfig.lowerPrice).toFixed(6) }}</span>
                  </div>
                  <div v-if="rule.actionConfig.botConfig.upperPrice">
                    <span style="color: #888;">Upper:</span>
                    <span style="color: #eb0404; font-weight: bold; margin-left: 4px;">${{ parseFloat(rule.actionConfig.botConfig.upperPrice).toFixed(6) }}</span>
                  </div>
                  <div v-if="rule.actionConfig.botConfig.nrOfGrids">
                    <span style="color: #888;">Grids:</span>
                    <span style="color: #ffd93d; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.botConfig.nrOfGrids }}</span>
                  </div>
                  <div v-if="rule.actionConfig.botConfig.amount">
                    <span style="color: #888;">Amount:</span>
                    <span style="color: #fff; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.botConfig.amount }}</span>
                  </div>
                  <div v-if="rule.actionConfig.botConfig.ordersSide">
                    <span style="color: #888;">Side:</span>
                    <span style="color: #a78bfa; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.botConfig.ordersSide }}</span>
                  </div>
                </div>
              </div>

              <!-- Custom OneClick Config -->
              <div v-if="rule.actionConfig.botType === 'oneclick' && rule.actionConfig.lowerPricePercent !== undefined">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; margin-top: 8px;">
                  <div>
                    <span style="color: #888;">Lower %:</span>
                    <span style="color: #10eb04; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.lowerPricePercent }}%</span>
                  </div>
                  <div>
                    <span style="color: #888;">Upper %:</span>
                    <span style="color: #eb0404; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.upperPricePercent }}%</span>
                  </div>
                  <div>
                    <span style="color: #888;">Grids:</span>
                    <span style="color: #ffd93d; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.nrOfGrids }}</span>
                  </div>
                  <div>
                    <span style="color: #888;">Amount:</span>
                    <span style="color: #fff; font-weight: bold; margin-left: 4px;">{{ rule.actionConfig.amount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Execution Stats (if available) -->
            <div v-if="rule.executionCount" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #2d2d2d;">
              <div style="display: flex; gap: 16px; font-size: 11px;">
                <div>
                  <span style="color: #888;">Executions:</span>
                  <span style="color: #10eb04; font-weight: bold; margin-left: 4px;">{{ rule.executionCount }}</span>
                </div>
                <div v-if="rule.lastExecuted">
                  <span style="color: #888;">Last Executed:</span>
                  <span style="color: #ffd93d; font-weight: bold; margin-left: 4px;">{{ formatDate(rule.lastExecuted) }}</span>
                </div>
              </div>
            </div>
          </n-card>
        </div>
      </n-spin>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="$emit('update:show', false)">Close</n-button>
      </n-space>
    </template>
  </n-modal>

  <!-- Investment Preview Modal (for OneClick strategies with multiple pairs) -->
  <n-modal
    v-model:show="showInvestmentPreview"
    preset="card"
    :style="{ width: '90%', maxWidth: '1400px', maxHeight: '90vh' }"
    title="💰 Investment Preview"
    :bordered="false"
    size="huge"
  >
    <template #header>
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <span style="font-size: 18px; font-weight: 700;">💰 Investment Preview</span>
        <n-tag v-if="strategyPreview.strategyName" type="primary" size="small">
          {{ strategyPreview.strategyName }}
        </n-tag>
        <n-tag v-if="strategyPreview.totalPairs" type="success" size="small">
          {{ strategyPreview.totalPairs }} bots
        </n-tag>
        <n-tag v-if="strategyPreview.totalOrders" type="info" size="small">
          {{ strategyPreview.totalOrders }} orders
        </n-tag>
        <n-tag type="warning" size="small">
          ${{ strategyPreview.totalInvestment?.toFixed(2) || '0.00' }} total
        </n-tag>
      </div>
    </template>

    <div style="padding: 12px;">
      <n-tabs type="line" animated size="small">
        <!-- TAB 1: PER BOT VIEW -->
        <n-tab-pane name="perBot" :tab="`🤖 Per Bot (${strategyPreview.totalPairs})`">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
            <div
              v-for="(pairPreview, index) in strategyPreview.pairs"
              :key="index"
              @click="openSinglePairModal(pairPreview)"
              style="background: #1a1f2e; padding: 10px; border-radius: 4px; border: 1px solid #2a3441; cursor: pointer; transition: all 0.2s;"
              class="pair-card"
            >
              <!-- Pair Symbol -->
              <div style="font-size: 13px; font-weight: 700; color: #6366f1; margin-bottom: 6px;">
                {{ pairPreview.symbol }}
              </div>

              <!-- Orders Count -->
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">
                {{ pairPreview.totalOrders }} orders
                <span v-if="pairPreview.buyOrders > 0" style="color: #10eb04;">({{ pairPreview.buyOrders }} buy)</span>
                <span v-if="pairPreview.sellOrders > 0" style="color: #eb0404;">({{ pairPreview.sellOrders }} sell)</span>
              </div>

              <!-- Investment Amount -->
              <div style="font-size: 11px; color: #ffd93d; font-weight: 600;">
                ${{ pairPreview.totalInvestment?.toFixed(2) || '0.00' }}
              </div>

              <!-- Price Range -->
              <div style="font-size: 9px; color: #666; margin-top: 4px;">
                Range: ${{ pairPreview.lowerPrice?.toFixed(6) }} - ${{ pairPreview.upperPrice?.toFixed(6) }}
              </div>

              <!-- Current Price -->
              <div style="font-size: 9px; color: #ffd93d; margin-top: 2px;">
                Current: ${{ pairPreview.currentPrice?.toFixed(6) }}
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TAB 2: TOTAL STRATEGY -->
        <n-tab-pane name="total" tab="📊 Total Strategie">
          <!-- Total Strategy Value Header -->
          <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%); padding: 16px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3); margin-bottom: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 16px; color: #6366f1; font-weight: 700;">🎯 VALOARE TOTALĂ STRATEGIE</div>
              <div style="font-size: 24px; color: #ffd93d; font-weight: 900;">${{ strategyPreview.totalInvestment?.toFixed(2) }}</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; font-size: 12px; color: #888; margin-top: 12px;">
              <div>📦 <span style="color: #a78bfa; font-weight: 600;">{{ strategyPreview.totalPairs }}</span> bots</div>
              <div>📋 <span style="color: #10eb04; font-weight: 600;">{{ strategyPreview.totalOrders }}</span> orders</div>
              <div>💵 <span style="color: #ffd93d; font-weight: 600;">${{ strategyPreview.totalInvestment?.toFixed(2) }}</span> total investment</div>
            </div>
          </div>

          <!-- Buy/Sell Breakdown Across All Bots -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <!-- BUY TOTALS -->
            <div style="background: rgba(16, 235, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3);">
              <div style="font-size: 13px; color: #10eb04; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(16, 235, 4, 0.2); padding-bottom: 6px;">
                📈 TOTAL BUY ORDERS (toate boturile)
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Număr ordine:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ strategyPreview.totalBuyOrders }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Investiție (USDC):</span>
                  <span style="color: #10eb04; font-weight: 700;">${{ strategyPreview.totalBuyInvestment?.toFixed(2) }}</span>
                </div>
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(16, 235, 4, 0.2); font-size: 10px; color: #888; font-style: italic;">
                  💡 Capital necesar pentru toate ordinele de cumpărare
                </div>
              </div>
            </div>

            <!-- SELL TOTALS -->
            <div style="background: rgba(235, 4, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(235, 4, 4, 0.3);">
              <div style="font-size: 13px; color: #eb0404; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(235, 4, 4, 0.2); padding-bottom: 6px;">
                📉 TOTAL SELL ORDERS (toate boturile)
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Număr ordine:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ strategyPreview.totalSellOrders }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Primești (USDC):</span>
                  <span style="color: #eb0404; font-weight: 700;">${{ strategyPreview.totalSellValue?.toFixed(2) }}</span>
                </div>
                <div v-if="strategyPreview.totalBaseAmounts && Object.keys(strategyPreview.totalBaseAmounts).length > 0" style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(235, 4, 4, 0.2);">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px; font-weight: 600;">Necesită:</div>
                  <div style="max-height: 120px; overflow-y: auto;">
                    <div
                      v-for="(amount, currency) in strategyPreview.totalBaseAmounts"
                      :key="currency"
                      style="font-size: 9px; color: #ddd; margin-bottom: 2px;"
                    >
                      • <span style="color: #eb0404; font-weight: 600;">{{ amount.toFixed(4) }} {{ currency }}</span>
                    </div>
                  </div>
                  <div style="margin-top: 4px; font-size: 9px; color: #888; font-style: italic;">
                    💰 Câți coins trebuie să deții pentru sell orders
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Profit Panel -->
          <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); padding: 14px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3);">
            <div style="font-size: 13px; color: #a855f7; margin-bottom: 10px; font-weight: 700;">
              💰 Profit Estimat (dacă toate ordinele se execută)
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Investit (Buy):</div>
                <div style="font-size: 13px; color: #10eb04; font-weight: 700;">
                  ${{ strategyPreview.totalBuyInvestment?.toFixed(2) }}
                </div>
              </div>
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Primit (Sell):</div>
                <div style="font-size: 13px; color: #eb0404; font-weight: 700;">
                  ${{ strategyPreview.totalSellValue?.toFixed(2) }}
                </div>
              </div>
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Profit Brut:</div>
                <div style="font-size: 13px; font-weight: 700;"
                  :style="{
                    color: (strategyPreview.totalSellValue - strategyPreview.totalBuyInvestment) > 0
                           ? '#10eb04' : '#eb0404'
                  }"
                >
                  ${{ (strategyPreview.totalSellValue - strategyPreview.totalBuyInvestment)?.toFixed(2) }}
                  <span style="font-size: 11px;">
                    ({{ (((strategyPreview.totalSellValue - strategyPreview.totalBuyInvestment) / strategyPreview.totalBuyInvestment) * 100).toFixed(2) }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="showInvestmentPreview = false">Close</n-button>
      </n-space>
    </template>
  </n-modal>

  <!-- Single Pair Grid Orders Modal -->
  <n-modal
    v-model:show="showGridPreview"
    preset="card"
    :style="{ width: '90%', maxWidth: '1200px', maxHeight: '90vh' }"
    title="Grid Orders Preview"
    :bordered="false"
    size="huge"
  >
    <template #header>
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <span style="font-size: 18px; font-weight: 700;">📊 Grid Orders Preview</span>
        <n-tag v-if="selectedPairForPreview" type="success" size="small">
          {{ selectedPairForPreview.symbol }}
        </n-tag>
        <n-tag v-if="previewOrders.length" type="info" size="small">
          {{ previewOrders.length }} orders
        </n-tag>
      </div>
    </template>

    <div v-if="selectedPairForPreview" style="padding: 12px;">
      <!-- Tabs -->
      <n-tabs type="line" animated size="small">
        <!-- TAB 1: STATISTICS -->
        <n-tab-pane name="stats" tab="📊 Statistici">
          <!-- Summary Stats -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
              <div style="font-size: 16px; font-weight: 700; color: #6366f1;">{{ selectedPairForPreview?.symbol }}</div>
            </div>
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Price Range</div>
              <div style="font-size: 14px; font-weight: 600; color: #10eb04;">
                ${{ selectedPairForPreview?.lowerPrice?.toFixed(6) }} - ${{ selectedPairForPreview?.upperPrice?.toFixed(6) }}
              </div>
            </div>
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Current Price</div>
              <div style="font-size: 14px; font-weight: 600; color: #ffd93d;">${{ selectedPairForPreview?.currentPrice?.toFixed(6) || '0.000000' }}</div>
            </div>
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Total Orders</div>
              <div style="font-size: 14px; font-weight: 600; color: #a78bfa;">{{ previewOrders.length }} orders</div>
            </div>
          </div>

          <!-- Buy/Sell Detailed Stats -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <!-- BUY PANEL -->
            <div style="background: rgba(16, 235, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3);">
              <div style="font-size: 13px; color: #10eb04; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(16, 235, 4, 0.2); padding-bottom: 6px;">
                📈 BUY ORDERS (Cumpără)
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Număr ordine:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ previewOrders.filter(o => o.side === 'buy').length }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Investesc (USDC):</span>
                  <span style="color: #10eb04; font-weight: 700;">${{ previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Primesc {{ selectedPairForPreview?.baseCurrency }}:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Preț mediu:</span>
                  <span style="color: #10eb04; font-weight: 700;">
                    ${{ (previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0) /
                         previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.amount, 0)).toFixed(6) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- SELL PANEL -->
            <div style="background: rgba(235, 4, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(235, 4, 4, 0.3);">
              <div style="font-size: 13px; color: #eb0404; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(235, 4, 4, 0.2); padding-bottom: 6px;">
                📉 SELL ORDERS (Vinde)
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Număr ordine:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ previewOrders.filter(o => o.side === 'sell').length }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Vând {{ selectedPairForPreview?.baseCurrency }}:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Primesc (USDC):</span>
                  <span style="color: #eb0404; font-weight: 700;">${{ previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Preț mediu:</span>
                  <span style="color: #eb0404; font-weight: 700;">
                    ${{ (previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) /
                         previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0)).toFixed(6) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- PROFIT PANEL -->
          <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); padding: 14px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3);">
            <div style="font-size: 13px; color: #a855f7; margin-bottom: 10px; font-weight: 700;">
              💰 PROFIT ESTIMAT (când toate ordinele se execută)
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Total Investit (Buy):</div>
                <div style="font-size: 13px; color: #10eb04; font-weight: 700;">
                  ${{ previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                </div>
              </div>
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Total Primit (Sell):</div>
                <div style="font-size: 13px; color: #eb0404; font-weight: 700;">
                  ${{ previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                </div>
              </div>
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Profit Brut:</div>
                <div style="font-size: 13px; font-weight: 700;"
                  :style="{
                    color: (previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) -
                           previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)) > 0
                           ? '#10eb04' : '#eb0404'
                  }"
                >
                  ${{ (previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) -
                       previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)).toFixed(2) }}
                  <span style="font-size: 11px;">
                    ({{ (((previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) -
                           previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)) /
                          previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)) * 100).toFixed(2) }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TAB 2: REQUIREMENTS -->
        <n-tab-pane name="requirements" tab="💼 Necesare">
          <div style="background: #1a1f2e; padding: 16px; border-radius: 6px; border: 1px solid #2a3441;">
            <div style="font-size: 14px; color: #6366f1; margin-bottom: 12px; font-weight: 700;">
              🎯 De ce ai nevoie pentru a porni acest bot:
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- CAPITAL NECESAR -->
              <div style="background: rgba(99, 102, 241, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #6366f1;">
                <div style="font-size: 12px; color: #6366f1; font-weight: 700; margin-bottom: 8px;">💰 Capital Necesar</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="font-size: 11px; color: #ddd;">
                    💵 <strong style="color: #10eb04;">${{ previewOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }} {{ selectedPairForPreview?.quoteCurrency || 'USDC' }}</strong> pentru ordinele BUY
                  </div>
                  <div style="font-size: 11px; color: #ddd;">
                    🪙 <strong style="color: #eb0404;">{{ previewOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }} {{ selectedPairForPreview?.baseCurrency }}</strong> pentru ordinele SELL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TAB 3: ORDERS TABLE -->
        <n-tab-pane name="orders" :tab="`📋 Ordine (${previewOrders.length})`">
          <div style="max-height: 500px; overflow-y: auto; border: 1px solid #2a3441; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead style="position: sticky; top: 0; background: #1a1f2e; z-index: 1;">
                <tr>
                  <th style="padding: 10px; text-align: left; color: #888; border-bottom: 2px solid #444;">#</th>
                  <th style="padding: 10px; text-align: left; color: #888; border-bottom: 2px solid #444;">Symbol</th>
                  <th style="padding: 10px; text-align: center; color: #888; border-bottom: 2px solid #444;">Side</th>
                  <th style="padding: 10px; text-align: right; color: #6366f1; border-bottom: 2px solid #444;">Price</th>
                  <th style="padding: 10px; text-align: right; color: #a78bfa; border-bottom: 2px solid #444;">Amount</th>
                  <th style="padding: 10px; text-align: right; color: #ffd93d; border-bottom: 2px solid #444;">Total (USDC)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, idx) in previewOrders" :key="idx"
                  :style="{ background: idx % 2 === 0 ? '#16181d' : '#1a1f2e' }"
                >
                  <td style="padding: 8px; color: #666;">{{ idx + 1 }}</td>
                  <td style="padding: 8px; color: #6366f1; font-weight: 600;">{{ order.symbol || 'N/A' }}</td>
                  <td style="padding: 8px; text-align: center;">
                    <span :style="{
                      color: order.side === 'buy' ? '#10eb04' : '#eb0404',
                      fontWeight: 700,
                      fontSize: '11px'
                    }">
                      {{ order.side.toUpperCase() }}
                    </span>
                  </td>
                  <td style="padding: 8px; text-align: right; color: #6366f1; font-weight: 600;">
                    ${{ order.price.toFixed(6) }}
                  </td>
                  <td style="padding: 8px; text-align: right; color: #a78bfa;">
                    {{ order.amount.toFixed(4) }}
                  </td>
                  <td style="padding: 8px; text-align: right; color: #ffd93d; font-weight: 600;">
                    ${{ order.total.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="showGridPreview = false">Close</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCoPilotRules } from '~/composables/useCoPilotRules';

const userID = useCookie('userID');

// Import bot calculations composable
const {
  calculateGridOrders,
  calculateTotalInvestment,
  getBaseCurrency,
  getQuoteCurrency
} = useBotCalculations();

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  order: {
    type: Object,
    default: null
  },
  rules: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  oneClickStrategies: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:show', 'add-rule', 'delete-rule', 'toggle-rule']);

const { formatTriggerCondition, formatRuleType: formatRuleTypeUtil } = useCoPilotRules();

function formatTrigger(condition) {
  return formatTriggerCondition(condition);
}

function formatRuleType(type) {
  return formatRuleTypeUtil(type);
}

function getStrategyName(strategyId) {
  console.log('🔍 [ViewRulesModal] Getting strategy name for ID:', strategyId);
  console.log('📋 [ViewRulesModal] Available strategies:', props.oneClickStrategies);

  if (!strategyId || strategyId === 'custom') {
    console.log('⚙️ [ViewRulesModal] Using custom strategy');
    return 'Custom';
  }

  const strategy = props.oneClickStrategies?.find(s => s._id === strategyId);
  console.log('✅ [ViewRulesModal] Found strategy:', strategy);

  if (strategy) {
    return `${strategy.name} (${strategy.pairs?.length || 0} pairs)`;
  }

  console.warn('⚠️ [ViewRulesModal] Strategy not found, showing ID:', strategyId);
  return strategyId;
}

function getStrategyDetails(strategyId) {
  console.log('📊 [ViewRulesModal] Getting strategy details for ID:', strategyId);

  if (!strategyId || strategyId === 'custom') {
    console.log('⚠️ [ViewRulesModal] Custom strategy, no details');
    return null;
  }

  const strategy = props.oneClickStrategies?.find(s => s._id === strategyId);
  console.log('✅ [ViewRulesModal] Strategy details:', strategy);

  return strategy || null;
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

// Investment Preview Modal (for strategies with multiple pairs)
const showInvestmentPreview = ref(false);
const strategyPreview = ref({
  strategyName: '',
  totalPairs: 0,
  totalOrders: 0,
  totalInvestment: 0,
  totalBuyOrders: 0,
  totalSellOrders: 0,
  totalBuyInvestment: 0,
  totalSellValue: 0,
  pairs: []
});

// Single Pair Grid Preview Modal
const showGridPreview = ref(false);
const selectedPairForPreview = ref(null);
const previewOrders = ref([]);
const previewBotConfig = ref({});

// Calculate preview for entire strategy (all pairs)
async function calculateStrategyPreview(strategy) {
  console.log(`🔄 Fetching real prices for ${strategy.pairs.length} pairs...`);

  const pairPreviews = [];
  let totalOrders = 0;
  let totalBuyOrders = 0;
  let totalSellOrders = 0;
  let totalBuyInvestment = 0;
  let totalSellValue = 0;
  const totalBaseAmounts = {}; // Track total base currency amounts needed for SELL orders

  for (const pair of strategy.pairs) {
    // Fetch real current price for this pair
    let currentPrice = 0.078; // Fallback
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        const tickerResponse = await $fetch('/api/v1/fetchTicker', {
          method: 'GET',
          params: {
            userID: userID.value,
            symbol: pair.symbol,
            exchange: pair.exchange || 'coinbaseadvanced'
          }
        });

        // API returns { data: { last, bid, ask, ... } }
        if (tickerResponse.data && tickerResponse.data.last) {
          currentPrice = parseFloat(tickerResponse.data.last);
          console.log(`✅ ${pair.symbol}: $${currentPrice}`);
          break; // Success - exit retry loop
        } else {
          console.warn(`⚠️ ${pair.symbol}: Using fallback price - Response:`, tickerResponse);
          break; // No retry needed for missing data
        }
      } catch (error) {
        // Check if it's a rate limit error (429)
        if (error.statusCode === 429 || error.message?.includes('429') || error.message?.includes('API limit')) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const delaySeconds = retryCount * 30; // 30s, 60s, 90s
            console.warn(`⏳ ${pair.symbol}: Rate limited (429). Retry ${retryCount}/${maxRetries} after ${delaySeconds}s...`);
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          } else {
            console.error(`❌ ${pair.symbol}: Rate limit exceeded after ${maxRetries} retries. Using fallback price.`);
          }
        } else {
          console.error(`❌ ${pair.symbol}:`, error.message);
          break; // Non-rate-limit error - don't retry
        }
      }
    }

    // Calculate grid parameters
    const lowerPricePercent = pair.lowerPricePercent || -20;
    const upperPricePercent = pair.upperPricePercent || 1;
    const lowerPrice = currentPrice * (1 + lowerPricePercent / 100);
    const upperPrice = currentPrice * (1 + upperPricePercent / 100);

    // Use composable to calculate orders
    const orders = calculateGridOrders({
      symbol: pair.symbol,
      lowerPrice,
      upperPrice,
      amount: pair.amount || 1,
      grids: pair.grids || 10,
      ordersSide: pair.ordersSide || 'buyOrSell',
      currentPrice,
      amountType: 'quantityPerGrid'
    });

    // Calculate statistics from orders
    const buyOrders = orders.filter(o => o.side === 'buy');
    const sellOrders = orders.filter(o => o.side === 'sell');
    const buyInvestment = buyOrders.reduce((sum, o) => sum + o.total, 0);
    const sellValue = sellOrders.reduce((sum, o) => sum + o.total, 0);

    // Calculate total base currency needed for SELL orders
    const baseCurrency = pair.symbol.split('/')[0];
    const sellAmount = sellOrders.reduce((sum, o) => sum + o.amount, 0);

    if (sellAmount > 0) {
      if (!totalBaseAmounts[baseCurrency]) {
        totalBaseAmounts[baseCurrency] = 0;
      }
      totalBaseAmounts[baseCurrency] += sellAmount;
    }

    // Store pair preview
    pairPreviews.push({
      symbol: pair.symbol,
      exchange: pair.exchange || 'coinbaseadvanced',
      currentPrice,
      lowerPrice,
      upperPrice,
      lowerPricePercent,
      upperPricePercent,
      nrOfGrids: pair.grids || 10,
      investmentPerOrder: pair.amount || 1,
      ordersSide: pair.ordersSide || 'buyOrSell',
      totalOrders: orders.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      buyInvestment,
      sellValue,
      totalInvestment: buyInvestment,
      baseCurrency,
      quoteCurrency: pair.symbol.split('/')[1] || 'USDC'
    });

    // Accumulate totals
    totalOrders += orders.length;
    totalBuyOrders += buyOrders.length;
    totalSellOrders += sellOrders.length;
    totalBuyInvestment += buyInvestment;
    totalSellValue += sellValue;
  }

  // Store strategy preview
  strategyPreview.value = {
    strategyName: strategy.name,
    totalPairs: strategy.pairs.length,
    totalOrders,
    totalBuyOrders,
    totalSellOrders,
    totalBuyInvestment,
    totalSellValue,
    totalInvestment: totalBuyInvestment,
    totalBaseAmounts, // Add this for displaying required coins for SELL orders
    pairs: pairPreviews
  };

  console.log(`✅ Strategy preview calculated:`, strategyPreview.value);
}

// Open single pair modal with orders for that specific pair
function openSinglePairModal(pairPreview) {
  console.log(`📊 Opening modal for ${pairPreview.symbol}`);

  // Use composable to calculate orders
  const orders = calculateGridOrders({
    symbol: pairPreview.symbol,
    lowerPrice: pairPreview.lowerPrice,
    upperPrice: pairPreview.upperPrice,
    amount: pairPreview.investmentPerOrder,
    grids: pairPreview.nrOfGrids,
    ordersSide: pairPreview.ordersSide || 'buyOrSell',
    currentPrice: pairPreview.currentPrice,
    amountType: 'quantityPerGrid'
  });

  selectedPairForPreview.value = pairPreview;
  previewOrders.value = orders;
  previewBotConfig.value = {
    lowerPrice: pairPreview.lowerPrice,
    upperPrice: pairPreview.upperPrice,
    nrOfGrids: pairPreview.nrOfGrids,
    investmentPerOrder: pairPreview.investmentPerOrder,
    ordersSide: pairPreview.ordersSide,
    currentPrice: pairPreview.currentPrice
  };

  showGridPreview.value = true;
}

async function openGridPreview(rule) {
  const config = rule.actionConfig;
  const strategyId = config.oneClickStrategy;

  // If it's a saved strategy (not custom), calculate strategy preview
  if (strategyId && strategyId !== 'custom') {
    const strategy = props.oneClickStrategies?.find(s => s._id === strategyId);

    if (strategy && strategy.pairs && strategy.pairs.length > 0) {
      console.log(`📊 Calculating preview for "${strategy.name}" with ${strategy.pairs.length} pairs`);

      // Calculate preview for all pairs
      await calculateStrategyPreview(strategy);

      // Open Investment Preview Modal
      showInvestmentPreview.value = true;
      return;
    }
  }

  // Custom config or fallback - single pair
  const currentPrice = parseFloat(props.order?.price) || 0;
  const lowerPricePercent = config.lowerPricePercent || -20;
  const upperPricePercent = config.upperPricePercent || 1;
  const nrOfGrids = config.nrOfGrids || 10;
  const amount = config.amount || 1;

  const lowerPrice = currentPrice * (1 + lowerPricePercent / 100);
  const upperPrice = currentPrice * (1 + upperPricePercent / 100);

  previewBotConfig.value = {
    lowerPrice,
    upperPrice,
    nrOfGrids,
    amount,
    ordersSide: 'buyOrSell'
  };

  // Generate orders for single pair
  const orders = [];
  const priceStep = (upperPrice - lowerPrice) / (nrOfGrids - 1);

  for (let i = 0; i < nrOfGrids; i++) {
    const price = lowerPrice + (i * priceStep);
    const side = price < currentPrice ? 'buy' : 'sell';

    orders.push({
      symbol: props.order?.symbol,
      side,
      price,
      amount,
      total: price * amount
    });
  }

  previewOrders.value = orders;
  showGridPreview.value = true;
}
</script>

<style scoped>
/* Pair card hover effect */
.pair-card:hover {
  border-color: #6366f1 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
</style>
