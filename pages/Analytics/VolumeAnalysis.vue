<template>
  <div style="padding: 20px;">
    <h2 style="color: #60a5fa; margin-bottom: 20px;">📊 Volume Analysis</h2>

    <!-- Exchange & Symbol Selector -->
    <n-card size="small" style="margin-bottom: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
      <n-grid :cols="4" x-gap="12">
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Exchange</div>
          <n-select
            v-model:value="selectedExchange"
            :options="exchangeOptions"
            size="small"
            placeholder="Select Exchange"
          />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
          <n-select
            v-model:value="selectedSymbol"
            :options="symbolOptions"
            size="small"
            placeholder="Select Symbol"
            filterable
          />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Timeframe</div>
          <n-select
            v-model:value="selectedTimeframe"
            :options="timeframeOptions"
            size="small"
          />
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button
            type="primary"
            size="small"
            @click="fetchVolumeData"
            :loading="isLoading"
            style="width: 100%;"
          >
            {{ isLoading ? 'Loading...' : '🔄 Analyze Volume' }}
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Filters & Export Controls -->
    <n-card size="small" style="margin-bottom: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
      <n-grid :cols="6" x-gap="12">
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Min Volume</div>
          <n-input-number
            v-model:value="minVolumeFilter"
            size="small"
            placeholder="Min Volume"
            :min="0"
            style="width: 100%;"
          />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Spikes Only</div>
          <n-checkbox v-model:checked="showSpikesOnly" style="margin-top: 4px;">
            <span style="font-size: 11px; color: #888;">Show Spikes Only</span>
          </n-checkbox>
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Auto-Refresh</div>
          <n-checkbox v-model:checked="autoRefreshEnabled" style="margin-top: 4px;">
            <span style="font-size: 11px; color: #888;">Auto-Refresh (30s)</span>
          </n-checkbox>
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button
            type="success"
            size="small"
            @click="exportToCSV"
            :disabled="volumeData.length === 0"
            style="width: 100%;"
          >
            📥 Export CSV
          </n-button>
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button
            type="info"
            size="small"
            @click="exportToJSON"
            :disabled="volumeData.length === 0"
            style="width: 100%;"
          >
            📥 Export JSON
          </n-button>
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button
            type="warning"
            size="small"
            @click="clearFilters"
            style="width: 100%;"
          >
            🔄 Clear Filters
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Volume Analysis Tabs -->
    <n-tabs v-model:value="activeTab" type="card" animated>
      <!-- Tab 1: Volume Basics -->
      <n-tab-pane name="basics" tab="📈 Volume Basics">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <div>No volume data available. Click "🔄 Analyze Volume" to load data.</div>
            <div v-if="errorMessage" style="margin-top: 12px; color: #f87171; font-size: 12px;">
              {{ errorMessage }}
            </div>
          </div>

          <div v-else>
            <!-- Volume Statistics Summary -->
            <n-grid :cols="5" x-gap="12" style="margin-bottom: 20px;">
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(16, 235, 4, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">AVG VOLUME</div>
                  <div style="font-size: 16px; color: #10eb04; font-weight: 700;">{{ volumeStats.avgVolume }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">MAX VOLUME</div>
                  <div style="font-size: 16px; color: #fbbf24; font-weight: 700;">{{ volumeStats.maxVolume }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(96, 165, 250, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">MIN VOLUME</div>
                  <div style="font-size: 16px; color: #60a5fa; font-weight: 700;">{{ volumeStats.minVolume }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">TOTAL VOLUME</div>
                  <div style="font-size: 16px; color: #f59e0b; font-weight: 700;">{{ volumeStats.totalVolume }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">TOTAL USD VALUE</div>
                  <div style="font-size: 16px; color: #8b5cf6; font-weight: 700;">${{ volumeStats.totalUSDValue }}</div>
                </div>
              </n-gi>
            </n-grid>

            <!-- Volume Data Table -->
            <div style="max-height: 600px; overflow-y: auto;">
              <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                  <tr style="border-bottom: 2px solid #60a5fa;">
                    <th style="padding: 3px; text-align: center; color: #60a5fa; font-size: 8px; width: 25px; max-width: 25px;">#</th>
                    <th style="padding: 6px; text-align: left; color: #60a5fa;">Time</th>
                    <th style="padding: 6px; text-align: center; color: #fbbf24;">Type</th>
                    <th style="padding: 6px; text-align: right; color: #f52a09;">High</th>
                    <th style="padding: 6px; text-align: right; color: #10eb04;">Low</th>
                    <th style="padding: 6px; text-align: right; color: #60a5fa;">Volume</th>
                    <th style="padding: 6px; text-align: right; color: #10eb04;">Buy Vol</th>
                    <th style="padding: 6px; text-align: right; color: #f52a09;">Sell Vol</th>
                    <th style="padding: 6px; text-align: right; color: #888;">Avg Vol</th>
                    <th style="padding: 6px; text-align: right; color: #f59e0b;">Vol %</th>
                    <th style="padding: 6px; text-align: center; color: #8b5cf6;">Rank</th>
                    <th style="padding: 6px; text-align: right; color: #4ade80;">USD Value</th>
                    <th style="padding: 6px; text-align: center; color: #f472b6;">Trend</th>
                    <th style="padding: 6px; text-align: left; color: #ef4444; width: 35px; max-width: 35px;">Spike Details</th>
                    <th style="padding: 6px; text-align: center; color: #a78bfa;">Vol Z-Score</th>
                    <th style="padding: 6px; text-align: right; color: #10eb04;">Buy %</th>
                    <th style="padding: 6px; text-align: right; color: #f52a09;">Sell %</th>
                    <th style="padding: 6px; text-align: right; color: #fbbf24;">Price Δ%</th>
                    <th style="padding: 6px; text-align: right; color: #60a5fa;">Force</th>
                    <th style="padding: 6px; text-align: center; color: #4ade80;">Liquidity</th>
                    <th style="padding: 6px; text-align: center; color: #ef4444;">Alert</th>
                    <th style="padding: 6px; text-align: right; color: #8b5cf6;">CMF</th>
                    <th style="padding: 6px; text-align: right; color: #f59e0b;">ATR</th>
                    <th style="padding: 6px; text-align: center; color: #10eb04;">Success %</th>
                    <th style="padding: 6px; text-align: center; color: #fbbf24;">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                      @click="openSpikeModal(candle)"
                      :style="{
                        background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: candle.spike ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }"
                      :class="{ 'spike-row': candle.spike }"
                      @mouseenter="$event.currentTarget.style.background = candle.spike ? (candle.isGreen ? 'rgba(16, 235, 4, 0.15)' : 'rgba(245, 42, 9, 0.15)') : (candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)')"
                      @mouseleave="$event.currentTarget.style.background = candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)'"
                      >
                    <td style="padding: 3px; color: #888; font-size: 8px; text-align: center;">{{ index + 1 }}</td>
                    <td style="padding: 6px; color: #888; font-size: 9px;">
                      {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                    </td>
                    <td style="padding: 6px; text-align: center;">
                      <span :style="{ fontSize: '12px' }">{{ candle.isGreen ? '🟢' : '🔴' }}</span>
                    </td>
                    <td style="padding: 6px; text-align: right; color: #f52a09; font-weight: 600;">{{ Number(candle.high).toFixed(4) }}</td>
                    <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">{{ Number(candle.low).toFixed(4) }}</td>
                    <td style="padding: 6px; text-align: right; font-weight: 600;" :style="{ color: candle.isGreen ? '#10eb04' : '#f52a09' }">{{ candle.volume }}</td>
                    <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">{{ candle.buyVolume }}</td>
                    <td style="padding: 6px; text-align: right; color: #f52a09; font-weight: 600;">{{ candle.sellVolume }}</td>
                    <td style="padding: 6px; text-align: right; color: #888;">{{ candle.avgVolume }}</td>
                    <td style="padding: 6px; text-align: right; font-weight: 600;"
                        :style="{ color: candle.volumePercent > 0 ? '#10eb04' : '#f52a09' }">
                      {{ candle.volumePercent > 0 ? '+' : '' }}{{ candle.volumePercent }}%
                    </td>
                    <td style="padding: 6px; text-align: center; font-weight: 600;"
                        :style="{ color: candle.volumeRank >= 8 ? '#4ade80' : candle.volumeRank >= 5 ? '#fbbf24' : '#888' }">
                      {{ candle.volumeRank }}/10
                    </td>
                    <td style="padding: 6px; text-align: right; color: #4ade80; font-weight: 600;">${{ candle.usdValue }}</td>
                    <td style="padding: 6px; text-align: center; font-size: 14px;"
                        :style="{ color: candle.volumeTrend === '↑' ? '#10eb04' : candle.volumeTrend === '↓' ? '#f52a09' : '#888' }">
                      {{ candle.volumeTrend }}
                    </td>
                    <td style="padding: 6px; text-align: center; font-size: 14px;">
                      <span v-if="candle.spike">{{ candle.spike }}</span>
                      <span v-else style="color: #444;">-</span>
                    </td>
                    <!-- New Columns -->
                    <td style="padding: 6px; text-align: center; font-weight: 600;"
                        :style="{ color: Math.abs(parseFloat(candle.volumeZScore)) > 2 ? '#ef4444' : Math.abs(parseFloat(candle.volumeZScore)) > 1 ? '#fbbf24' : '#a78bfa' }">
                      {{ candle.volumeZScore }}
                    </td>
                    <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">{{ candle.buyPressurePercent }}%</td>
                    <td style="padding: 6px; text-align: right; color: #f52a09; font-weight: 600;">{{ candle.sellPressurePercent }}%</td>
                    <td style="padding: 6px; text-align: right; font-weight: 600;"
                        :style="{ color: parseFloat(candle.priceChangePercent) > 0 ? '#10eb04' : parseFloat(candle.priceChangePercent) < 0 ? '#f52a09' : '#888' }">
                      {{ candle.priceChangePercent > 0 ? '+' : '' }}{{ candle.priceChangePercent }}%
                    </td>
                    <td style="padding: 6px; text-align: right; font-weight: 600;"
                        :style="{ color: parseFloat(candle.forceIndex) > 0 ? '#10eb04' : parseFloat(candle.forceIndex) < 0 ? '#f52a09' : '#888' }">
                      {{ candle.forceIndex }}
                    </td>
                    <td style="padding: 6px; text-align: center; font-weight: 600;"
                        :style="{ color: candle.liquidityScore >= 8 ? '#10eb04' : candle.liquidityScore >= 6 ? '#fbbf24' : candle.liquidityScore <= 3 ? '#f52a09' : '#888' }">
                      {{ candle.liquidityScore }}/10
                    </td>
                    <td style="padding: 6px; text-align: center; font-weight: 600; font-size: 9px;"
                        :style="{ color: candle.alertColor }">
                      {{ candle.alertLevel }}
                    </td>
                    <td style="padding: 6px; text-align: right; font-weight: 600;"
                        :style="{ color: parseFloat(candle.cmf) > 0 ? '#10eb04' : parseFloat(candle.cmf) < 0 ? '#f52a09' : '#888' }">
                      {{ candle.cmf }}
                    </td>
                    <td style="padding: 6px; text-align: right; color: #f59e0b;">{{ candle.atr }}</td>
                    <td style="padding: 6px; text-align: center; font-weight: 600;"
                        :style="{ color: candle.patternSuccessRate >= 65 ? '#10eb04' : candle.patternSuccessRate >= 55 ? '#fbbf24' : '#f52a09' }">
                      {{ candle.patternSuccessRate }}%
                    </td>
                    <td style="padding: 6px; text-align: center; font-weight: 600; font-size: 11px;"
                        :style="{ color: candle.opportunityScore >= 8 ? '#10eb04' : candle.opportunityScore >= 6 ? '#fbbf24' : candle.opportunityScore <= 3 ? '#f52a09' : '#888' }">
                      {{ candle.opportunityScore }}/10
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 2: Price-Volume Relationship -->
      <n-tab-pane name="priceVolume" tab="💹 Price-Volume">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">💹</div>
            <div>No data available. Click "🔄 Analyze Volume" to load data.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #a78bfa;">
                  <th style="padding: 6px; text-align: left; color: #a78bfa;">#</th>
                  <th style="padding: 6px; text-align: left; color: #a78bfa;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">Open</th>
                  <th style="padding: 6px; text-align: right; color: #05f5ed;">Close</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">Volume</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">Buy Vol</th>
                  <th style="padding: 6px; text-align: right; color: #f52a09;">Sell Vol</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">VWAP</th>
                  <th style="padding: 6px; text-align: right; color: #f59e0b;">Dist VWAP</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">OBV</th>
                  <th style="padding: 6px; text-align: right; color: #8b5cf6;">MFI</th>
                  <th style="padding: 6px; text-align: center; color: #ef4444;">Divergence</th>
                  <th style="padding: 6px; text-align: center; color: #4ade80;">Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #60a5fa; font-weight: 600;">{{ Number(candle.open).toFixed(4) }}</td>
                  <td style="padding: 6px; text-align: right; color: #05f5ed; font-weight: 600;">{{ Number(candle.close).toFixed(4) }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04;">{{ candle.volume }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">{{ candle.buyVolume }}</td>
                  <td style="padding: 6px; text-align: right; color: #f52a09; font-weight: 600;">{{ candle.sellVolume }}</td>
                  <td style="padding: 6px; text-align: right; color: #fbbf24; font-weight: 600;">{{ candle.vwap }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.distVWAP > 0 ? '#10eb04' : '#f52a09' }">
                    {{ candle.distVWAP > 0 ? '+' : '' }}{{ candle.distVWAP }}%
                  </td>
                  <td style="padding: 6px; text-align: right; color: #60a5fa;">{{ candle.obv }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.mfi > 70 ? '#ef4444' : candle.mfi < 30 ? '#4ade80' : '#fbbf24' }">
                    {{ candle.mfi }}
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.divergence }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.signal }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 3: Buy/Sell Pressure -->
      <n-tab-pane name="buySell" tab="⚖️ Buy/Sell Pressure">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⚖️</div>
            <div>No data available. Click "🔄 Analyze Volume" to load data.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #10eb04;">
                  <th style="padding: 6px; text-align: left; color: #10eb04;">#</th>
                  <th style="padding: 6px; text-align: left; color: #10eb04;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #4ade80;">Buy Vol</th>
                  <th style="padding: 6px; text-align: right; color: #f52a09;">Sell Vol</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">B/S Ratio</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">Delta</th>
                  <th style="padding: 6px; text-align: center; color: #8b5cf6;">Pressure</th>
                  <th style="padding: 6px; text-align: center; color: #f59e0b;">Smart $</th>
                  <th style="padding: 6px; text-align: center; color: #ef4444;">Absorption</th>
                  <th style="padding: 6px; text-align: center; color: #4ade80;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #4ade80; font-weight: 600;">{{ candle.buyVolume }}</td>
                  <td style="padding: 6px; text-align: right; color: #f52a09; font-weight: 600;">{{ candle.sellVolume }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.buySellRatio > 1 ? '#4ade80' : '#f52a09' }">
                    {{ candle.buySellRatio }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.delta > 0 ? '#4ade80' : '#f52a09' }">
                    {{ candle.delta > 0 ? '+' : '' }}{{ candle.delta }}
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.pressure }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.smartMoney }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.absorption }}</td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.action === 'BUY' ? '#4ade80' : candle.action === 'SELL' ? '#f52a09' : '#888' }">
                    {{ candle.action }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 4: Advanced Patterns -->
      <n-tab-pane name="patterns" tab="🎯 Patterns">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">🎯</div>
            <div>No data available. Click "🔄 Analyze Volume" to load data.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #f472b6;">
                  <th style="padding: 6px; text-align: left; color: #f472b6;">#</th>
                  <th style="padding: 6px; text-align: left; color: #f472b6;">Time</th>
                  <th style="padding: 6px; text-align: center; color: #ef4444;">Breakout</th>
                  <th style="padding: 6px; text-align: center; color: #fbbf24;">Climax</th>
                  <th style="padding: 6px; text-align: center; color: #60a5fa;">Dry-Up</th>
                  <th style="padding: 6px; text-align: center; color: #4ade80;">Accumulation</th>
                  <th style="padding: 6px; text-align: center; color: #f52a09;">Distribution</th>
                  <th style="padding: 6px; text-align: center; color: #8b5cf6;">POC</th>
                  <th style="padding: 6px; text-align: center; color: #10eb04;">Cluster</th>
                  <th style="padding: 6px; text-align: center; color: #f59e0b;">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.breakout }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.climax }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.dryUp }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.accumulation }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.distribution }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.poc }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.cluster }}</td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.patternScore >= 7 ? '#4ade80' : candle.patternScore >= 4 ? '#fbbf24' : '#888' }">
                    {{ candle.patternScore }}/10
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 5: Volatility & Risk -->
      <n-tab-pane name="volatility" tab="📉 Volatility & Risk">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📉</div>
            <div>No data available. Click "🔄 Analyze Volume" to load data.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #f59e0b;">
                  <th style="padding: 6px; text-align: left; color: #f59e0b;">#</th>
                  <th style="padding: 6px; text-align: left; color: #f59e0b;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">ATR</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">ATR %</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">BB Width</th>
                  <th style="padding: 6px; text-align: right; color: #a78bfa;">Std Dev</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">Range %</th>
                  <th style="padding: 6px; text-align: center; color: #f472b6;">Vol Rank</th>
                  <th style="padding: 6px; text-align: center; color: #ef4444;">Risk</th>
                  <th style="padding: 6px; text-align: center; color: #4ade80;">Stability</th>
                  <th style="padding: 6px; text-align: center; color: #fbbf24;">Trend</th>
                  <th style="padding: 6px; text-align: center; color: #8b5cf6;">Breakout %</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #ef4444;">{{ candle.atr }}</td>
                  <td style="padding: 6px; text-align: right; color: #fbbf24;">{{ candle.atrPercent }}%</td>
                  <td style="padding: 6px; text-align: right; color: #60a5fa;">{{ candle.bbWidth }}</td>
                  <td style="padding: 6px; text-align: right; color: #a78bfa;">{{ candle.stdDev }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04;">{{ candle.rangePercent }}%</td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.volatilityRank >= 8 ? '#ef4444' : candle.volatilityRank >= 5 ? '#fbbf24' : '#4ade80' }">
                    {{ candle.volatilityRank }}/10
                  </td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.riskColor }">
                    {{ candle.riskScore }}/10
                  </td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.stabilityIndex >= 7 ? '#4ade80' : candle.stabilityIndex >= 4 ? '#fbbf24' : '#ef4444' }">
                    {{ candle.stabilityIndex }}/10
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 14px;"
                      :style="{ color: candle.volatilityTrend === '↑' ? '#ef4444' : candle.volatilityTrend === '↓' ? '#4ade80' : '#888' }">
                    {{ candle.volatilityTrend }}
                  </td>
                  <td style="padding: 6px; text-align: center; color: #8b5cf6;">{{ candle.breakoutProb }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 6: Statistical Indicators -->
      <n-tab-pane name="statistical" tab="📊 Statistical">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <div>No data available. Click "🔄 Analyze Volume" to load data.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #8b5cf6;">
                  <th style="padding: 6px; text-align: left; color: #8b5cf6;">#</th>
                  <th style="padding: 6px; text-align: left; color: #8b5cf6;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">Mean Rev</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">Kurtosis</th>
                  <th style="padding: 6px; text-align: right; color: #f472b6;">Skewness</th>
                  <th style="padding: 6px; text-align: center; color: #10eb04;">Percentile</th>
                  <th style="padding: 6px; text-align: center; color: #ef4444;">Outlier</th>
                  <th style="padding: 6px; text-align: center; color: #a78bfa;">Distribution</th>
                  <th style="padding: 6px; text-align: right; color: #4ade80;">Confidence</th>
                  <th style="padding: 6px; text-align: right; color: #f59e0b;">Regression</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.meanReversionScore >= 7 ? '#4ade80' : candle.meanReversionScore >= 4 ? '#fbbf24' : '#ef4444' }">
                    {{ candle.meanReversionScore }}/10
                  </td>
                  <td style="padding: 6px; text-align: right; color: #fbbf24;">{{ candle.kurtosis }}</td>
                  <td style="padding: 6px; text-align: right; color: #f472b6;">{{ candle.skewness }}</td>
                  <td style="padding: 6px; text-align: center; color: #10eb04;">{{ candle.percentileRank }}%</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.outlierDetection }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px; color: #a78bfa;">{{ candle.distributionType }}</td>
                  <td style="padding: 6px; text-align: right; color: #4ade80;">{{ candle.confidenceInterval }}%</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: parseFloat(candle.regressionTrend) > 0 ? '#4ade80' : '#ef4444' }">
                    {{ candle.regressionTrend }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 7: Momentum & Trend -->
      <n-tab-pane name="momentum" tab="🚀 Momentum">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading volume data...</div>
          </div>

          <div v-else-if="volumeData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">🚀</div>
            <div>No data available. Click "🔄 Analyze Volume" to load data.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #10eb04;">
                  <th style="padding: 6px; text-align: left; color: #10eb04;">#</th>
                  <th style="padding: 6px; text-align: left; color: #10eb04;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">RSI</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">MACD</th>
                  <th style="padding: 6px; text-align: right; color: #a78bfa;">Signal</th>
                  <th style="padding: 6px; text-align: right; color: #f472b6;">Histogram</th>
                  <th style="padding: 6px; text-align: right; color: #4ade80;">Stoch %K</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">Stoch %D</th>
                  <th style="padding: 6px; text-align: right; color: #f59e0b;">ADX</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">+DI</th>
                  <th style="padding: 6px; text-align: right; color: #f52a09;">-DI</th>
                  <th style="padding: 6px; text-align: center; color: #8b5cf6;">Momentum</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in filteredVolumeData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.rsi > 70 ? '#ef4444' : candle.rsi < 30 ? '#4ade80' : '#fbbf24' }">
                    {{ candle.rsi }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: parseFloat(candle.macd) > 0 ? '#4ade80' : '#ef4444' }">
                    {{ candle.macd }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #a78bfa;">{{ candle.macdSignal }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: parseFloat(candle.macdHistogram) > 0 ? '#4ade80' : '#ef4444' }">
                    {{ candle.macdHistogram }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #4ade80;">{{ candle.stochK }}</td>
                  <td style="padding: 6px; text-align: right; color: #ef4444;">{{ candle.stochD }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.adx > 25 ? '#4ade80' : candle.adx > 15 ? '#fbbf24' : '#888' }">
                    {{ candle.adx }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #10eb04;">{{ candle.plusDI }}</td>
                  <td style="padding: 6px; text-align: right; color: #f52a09;">{{ candle.minusDI }}</td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.momentumScore >= 7 ? '#4ade80' : candle.momentumScore >= 4 ? '#fbbf24' : '#ef4444' }">
                    {{ candle.momentumScore }}/10
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- Spike Details Modal -->
    <n-modal
      v-model:show="showSpikeModal"
      preset="card"
      title="🔥 Volume Spike Analysis"
      size="large"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
      style="width: 800px; max-width: 90vw;"
    >
      <div v-if="selectedSpike" style="font-family: monospace;">
        <!-- Header with timestamp and spike level -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px;">
          <div>
            <div style="font-size: 14px; color: #fca5a5; margin-bottom: 4px;">Spike Detected</div>
            <div style="font-size: 24px; color: white; font-weight: 700;">{{ selectedSpike.spike }}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #fca5a5; margin-bottom: 4px;">Timestamp</div>
            <div style="font-size: 14px; color: white; font-weight: 600;">
              {{ new Date(selectedSpike.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }) }}
            </div>
          </div>
        </div>

        <!-- Volume Metrics Grid -->
        <n-grid :cols="2" x-gap="16" y-gap="16" style="margin-bottom: 20px;">
          <n-gi>
            <div style="padding: 16px; background: rgba(16, 235, 4, 0.1); border-radius: 8px; border: 1px solid rgba(16, 235, 4, 0.3);">
              <div style="font-size: 11px; color: #888; margin-bottom: 8px;">SPIKE MULTIPLIER</div>
              <div style="font-size: 32px; color: #10eb04; font-weight: 700;">{{ selectedSpike.spikeMultiplier }}x</div>
              <div style="font-size: 10px; color: #888; margin-top: 4px;">vs Average Volume</div>
            </div>
          </n-gi>
          <n-gi>
            <div style="padding: 16px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
              <div style="font-size: 11px; color: #888; margin-bottom: 8px;">PERCENTAGE INCREASE</div>
              <div style="font-size: 32px; color: #fbbf24; font-weight: 700;">+{{ selectedSpike.volumePercent }}%</div>
              <div style="font-size: 10px; color: #888; margin-top: 4px;">Above Average</div>
            </div>
          </n-gi>
          <n-gi>
            <div style="padding: 16px; background: rgba(96, 165, 250, 0.1); border-radius: 8px; border: 1px solid rgba(96, 165, 250, 0.3);">
              <div style="font-size: 11px; color: #888; margin-bottom: 8px;">CURRENT VOLUME</div>
              <div style="font-size: 24px; color: #60a5fa; font-weight: 700;">{{ selectedSpike.volume }}</div>
              <div style="font-size: 10px; color: #888; margin-top: 4px;">{{ selectedSpike.isGreen ? '🟢 Green Candle' : '🔴 Red Candle' }}</div>
            </div>
          </n-gi>
          <n-gi>
            <div style="padding: 16px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
              <div style="font-size: 11px; color: #888; margin-bottom: 8px;">AVERAGE VOLUME</div>
              <div style="font-size: 24px; color: #8b5cf6; font-weight: 700;">{{ selectedSpike.avgVolume }}</div>
              <div style="font-size: 10px; color: #888; margin-top: 4px;">Rolling Average</div>
            </div>
          </n-gi>
        </n-grid>

        <!-- Price Information -->
        <div style="padding: 16px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #60a5fa; font-weight: 600; margin-bottom: 12px;">💹 PRICE ACTION</div>
          <n-grid :cols="4" x-gap="12">
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">OPEN</div>
              <div style="font-size: 16px; color: #60a5fa; font-weight: 600;">${{ selectedSpike.open }}</div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">HIGH</div>
              <div style="font-size: 16px; color: #10eb04; font-weight: 600;">${{ selectedSpike.high }}</div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">LOW</div>
              <div style="font-size: 16px; color: #f52a09; font-weight: 600;">${{ selectedSpike.low }}</div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">CLOSE</div>
              <div style="font-size: 16px; font-weight: 600;" :style="{ color: selectedSpike.isGreen ? '#10eb04' : '#f52a09' }">
                ${{ selectedSpike.close }}
              </div>
            </n-gi>
          </n-grid>
        </div>

        <!-- Trading Value -->
        <div style="padding: 16px; background: rgba(74, 222, 128, 0.1); border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(74, 222, 128, 0.3);">
          <div style="font-size: 12px; color: #4ade80; font-weight: 600; margin-bottom: 8px;">💰 TOTAL USD VALUE</div>
          <div style="font-size: 36px; color: #4ade80; font-weight: 700;">${{ selectedSpike.usdValue }}</div>
          <div style="font-size: 11px; color: #888; margin-top: 4px;">
            Volume × Close Price = {{ selectedSpike.volume }} × ${{ selectedSpike.close }}
          </div>
        </div>

        <!-- Volume Indicators -->
        <div style="padding: 16px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #60a5fa; font-weight: 600; margin-bottom: 12px;">📊 VOLUME INDICATORS</div>
          <n-grid :cols="3" x-gap="12">
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">VOLUME RANK</div>
              <div style="font-size: 20px; font-weight: 600;"
                   :style="{ color: selectedSpike.volumeRank >= 8 ? '#4ade80' : selectedSpike.volumeRank >= 5 ? '#fbbf24' : '#888' }">
                {{ selectedSpike.volumeRank }}/10
              </div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">TREND</div>
              <div style="font-size: 20px; font-weight: 600;"
                   :style="{ color: selectedSpike.volumeTrend === '↑' ? '#10eb04' : selectedSpike.volumeTrend === '↓' ? '#f52a09' : '#888' }">
                {{ selectedSpike.volumeTrend }}
              </div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">VWAP</div>
              <div style="font-size: 16px; color: #a78bfa; font-weight: 600;">${{ selectedSpike.vwap }}</div>
              <div style="font-size: 9px; margin-top: 2px;"
                   :style="{ color: parseFloat(selectedSpike.distVWAP) > 0 ? '#10eb04' : '#f52a09' }">
                {{ selectedSpike.distVWAP > 0 ? '+' : '' }}{{ selectedSpike.distVWAP }}%
              </div>
            </n-gi>
          </n-grid>
        </div>

        <!-- Buy/Sell Pressure -->
        <div style="padding: 16px; background: rgba(30, 41, 59, 0.5); border-radius: 8px;">
          <div style="font-size: 12px; color: #60a5fa; font-weight: 600; margin-bottom: 12px;">⚖️ BUY/SELL PRESSURE</div>
          <n-grid :cols="3" x-gap="12">
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">BUY VOLUME</div>
              <div style="font-size: 16px; color: #10eb04; font-weight: 600;">{{ selectedSpike.buyVolume }}</div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">SELL VOLUME</div>
              <div style="font-size: 16px; color: #f52a09; font-weight: 600;">{{ selectedSpike.sellVolume }}</div>
            </n-gi>
            <n-gi>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">RATIO</div>
              <div style="font-size: 16px; font-weight: 600;"
                   :style="{ color: parseFloat(selectedSpike.buySellRatio) > 1 ? '#10eb04' : '#f52a09' }">
                {{ selectedSpike.buySellRatio }}
              </div>
            </n-gi>
          </n-grid>
          <div style="margin-top: 12px; padding: 12px; background: rgba(0, 0, 0, 0.3); border-radius: 6px;">
            <div style="font-size: 10px; color: #888; margin-bottom: 4px;">MARKET PRESSURE</div>
            <div style="font-size: 14px; font-weight: 600;"
                 :style="{ color: selectedSpike.pressure === 'STRONG BUY' || selectedSpike.pressure === 'BUY' ? '#10eb04' : selectedSpike.pressure === 'STRONG SELL' || selectedSpike.pressure === 'SELL' ? '#f52a09' : '#888' }">
              {{ selectedSpike.pressure }}
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div style="margin-top: 20px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 4px;">
          <div style="font-size: 11px; color: #fbbf24; font-weight: 600;">📌 SPIKE SUMMARY</div>
          <div style="font-size: 10px; color: #ccc; margin-top: 6px;">
            {{ selectedSpike.spikeDetails }}
          </div>
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end;">
          <n-button @click="showSpikeModal = false" type="primary">Close</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
const userID = useCookie('userID');

// State
const selectedExchange = ref('');
const selectedSymbol = ref('');
const selectedTimeframe = ref('');
const activeTab = ref('basics');
const isLoading = ref(false);
const volumeData = ref([]);
const errorMessage = ref('');
const availableCombinations = ref([]);

// Modal state for spike details
const showSpikeModal = ref(false);
const selectedSpike = ref(null);

// Filter state
const minVolumeFilter = ref(0);
const showSpikesOnly = ref(false);

// Auto-refresh state
const autoRefreshEnabled = ref(false);
let autoRefreshInterval = null;

// Dynamic Options (will be populated from DB)
const exchangeOptions = ref([]);
const symbolOptions = ref([]);
const timeframeOptions = ref([]);

// Filtered Volume Data
const filteredVolumeData = computed(() => {
  let filtered = volumeData.value;

  // Filter by minimum volume
  if (minVolumeFilter.value > 0) {
    filtered = filtered.filter(c => c.volumeRaw >= minVolumeFilter.value);
  }

  // Filter spikes only
  if (showSpikesOnly.value) {
    filtered = filtered.filter(c => c.spike);
  }

  return filtered;
});

// Volume Statistics
const volumeStats = computed(() => {
  if (volumeData.value.length === 0) {
    return {
      avgVolume: 'N/A',
      maxVolume: 'N/A',
      minVolume: 'N/A',
      totalVolume: 'N/A',
      totalUSDValue: 'N/A'
    };
  }

  const volumes = volumeData.value.map(c => parseFloat(c.volumeRaw));
  const usdValues = volumeData.value.map(c => parseFloat(c.usdValueRaw));

  const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const maxVol = Math.max(...volumes);
  const minVol = Math.min(...volumes);
  const totalVol = volumes.reduce((a, b) => a + b, 0);
  const totalUSD = usdValues.reduce((a, b) => a + b, 0);

  return {
    avgVolume: avgVol.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    maxVolume: maxVol.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    minVolume: minVol.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    totalVolume: totalVol.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    totalUSDValue: totalUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })
  };
});

// Fetch Volume Data
async function fetchVolumeData() {
  isLoading.value = true;
  try {
    console.log('🔍 Fetching volume data:', { exchange: selectedExchange.value, symbol: selectedSymbol.value, timeframe: selectedTimeframe.value });

    // Fetch candles directly from MongoDB (no exchange API call)
    const response = await $fetch(`/api/v1/getVolumeData`, {
      method: 'GET',
      params: {
        exchange: selectedExchange.value,
        symbol: selectedSymbol.value,
        timeframe: selectedTimeframe.value
      }
    });

    console.log('📦 API Response:', response);

    if (response && response.success && response.candles && response.candles.length > 0) {
      // response.candles is in CCXT format: [timestamp, open, high, low, close, volume]
      processVolumeData(response.candles);
      console.log('✅ Volume data processed:', volumeData.value.length, 'candles');
      errorMessage.value = '';
    } else {
      console.warn('⚠️ No candles returned from API:', response.error || 'Unknown error');
      errorMessage.value = response.error || 'No data available';
      volumeData.value = [];
    }
  } catch (error) {
    console.error('❌ Error fetching volume data:', error);
    volumeData.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Process Volume Data with all metrics
function processVolumeData(candles) {
  // IMPORTANT: Reverse candles array for calculation (oldest to newest)
  // This ensures each candle has proper historical context
  const reversedCandles = [...candles].reverse();

  // Calculate moving average volume (20 period)
  const calculateAvgVolume = (index) => {
    const lookback = 20;
    const startIndex = Math.max(0, index - lookback);
    const subset = reversedCandles.slice(startIndex, index + 1);
    const sum = subset.reduce((acc, c) => acc + (c[5] || 0), 0);
    return sum / subset.length;
  };

  // Calculate VWAP (Volume Weighted Average Price)
  let cumulativeTPV = 0; // Typical Price × Volume
  let cumulativeVolume = 0;

  // Calculate OBV (On-Balance Volume)
  let obv = 0;

  const calculated = reversedCandles.map((candle, index) => {
    const timestamp = candle[0];
    const open = candle[1];
    const high = candle[2];
    const low = candle[3];
    const close = candle[4];
    const volume = candle[5] || 0;

    const isGreen = close >= open;
    const avgVolume = calculateAvgVolume(index);
    const volumePercent = avgVolume > 0 ? (((volume - avgVolume) / avgVolume) * 100).toFixed(1) : '0.0';

    // Volume Rank (1-10 based on percentile)
    const allVolumes = candles.map(c => c[5] || 0).sort((a, b) => a - b);
    const percentile = allVolumes.indexOf(volume) / allVolumes.length;
    const volumeRank = Math.ceil(percentile * 10);

    // USD Value
    const usdValueRaw = volume * close;
    const usdValue = usdValueRaw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Volume Trend
    let volumeTrend = '→';
    if (index > 0) {
      const prevVolume = candles[index - 1][5] || 0;
      if (volume > prevVolume * 1.1) volumeTrend = '↑';
      else if (volume < prevVolume * 0.9) volumeTrend = '↓';
    }

    // Spike Detection with detailed info
    let spike = '';
    let spikeMultiplier = 0;
    let spikeDetails = '';

    if (avgVolume > 0) {
      spikeMultiplier = (volume / avgVolume).toFixed(2);
      const volumeDiff = volume - avgVolume;
      const volumeDiffPercent = ((volumeDiff / avgVolume) * 100).toFixed(0);

      if (volume > avgVolume * 3) {
        spike = '3🔥';
        spikeDetails = `3🔥 EXTREME: ${spikeMultiplier}x | +${volumeDiffPercent}%`;
      } else if (volume > avgVolume * 2) {
        spike = '2🔥';
        spikeDetails = `2🔥 HIGH: ${spikeMultiplier}x | +${volumeDiffPercent}%`;
      } else if (volume > avgVolume * 1.5) {
        spike = '1🔥';
        spikeDetails = `1🔥 SPIKE: ${spikeMultiplier}x | +${volumeDiffPercent}%`;
      }
    }

    // === PRICE-VOLUME METRICS ===

    // VWAP calculation
    const typicalPrice = (high + low + close) / 3;
    cumulativeTPV += typicalPrice * volume;
    cumulativeVolume += volume;
    const vwap = cumulativeVolume > 0 ? (cumulativeTPV / cumulativeVolume).toFixed(6) : close.toFixed(6);
    const distVWAP = ((close - parseFloat(vwap)) / parseFloat(vwap) * 100).toFixed(2);

    // OBV calculation
    if (index > 0) {
      const prevClose = reversedCandles[index - 1][4];
      if (close > prevClose) obv += volume;
      else if (close < prevClose) obv -= volume;
    }

    // MFI (Money Flow Index) - simplified 14-period
    const mfi = calculateMFI(reversedCandles, index);

    // Divergence detection
    let divergence = '';
    if (index >= 5) {
      const priceUp = close > reversedCandles[index - 5][4];
      const volumeDown = volume < reversedCandles[index - 5][5];
      const priceDown = close < reversedCandles[index - 5][4];
      const volumeUp = volume > reversedCandles[index - 5][5];

      if (priceUp && volumeDown) divergence = '⚠️ Bear';
      else if (priceDown && volumeUp) divergence = '✅ Bull';
    }

    // VWAP Signal
    let vwapSignal = '';
    if (parseFloat(distVWAP) > 2) vwapSignal = '🔴 Over';
    else if (parseFloat(distVWAP) < -2) vwapSignal = '🟢 Under';

    // === BUY/SELL PRESSURE ===

    // Estimate Buy/Sell Volume based on candle body
    const bodySize = Math.abs(close - open);
    const rangeSize = high - low;
    const buyPressure = isGreen ? (bodySize / rangeSize) : (1 - bodySize / rangeSize);
    const buyVolume = (volume * buyPressure).toFixed(0);
    const sellVolume = (volume * (1 - buyPressure)).toFixed(0);
    const buySellRatio = (parseFloat(buyVolume) / parseFloat(sellVolume)).toFixed(2);
    const delta = (parseFloat(buyVolume) - parseFloat(sellVolume)).toFixed(0);

    // Pressure indicator
    let pressure = '';
    if (parseFloat(buySellRatio) > 2) pressure = '🟢🟢 Buy';
    else if (parseFloat(buySellRatio) > 1.2) pressure = '🟢 Buy';
    else if (parseFloat(buySellRatio) < 0.5) pressure = '🔴🔴 Sell';
    else if (parseFloat(buySellRatio) < 0.8) pressure = '🔴 Sell';
    else pressure = '⚖️ Neutral';

    // Smart Money detection (large volume at key levels)
    const isKeyLevel = volumeRank >= 8;
    const smartMoney = isKeyLevel && volume > avgVolume * 2 ? '💰' : '';

    // Absorption (high volume, small price change)
    const priceChange = Math.abs((close - open) / open * 100);
    const absorption = volume > avgVolume * 1.5 && priceChange < 0.5 ? '🛡️' : '';

    // Action recommendation
    let action = 'HOLD';
    if (pressure.includes('Buy') && parseFloat(distVWAP) < 0) action = 'BUY';
    else if (pressure.includes('Sell') && parseFloat(distVWAP) > 0) action = 'SELL';

    // === ADVANCED PATTERNS ===

    // Volume Breakout
    const breakout = volume > avgVolume * 2.5 && Math.abs(priceChange) > 2 ? '🚀' : '';

    // Volume Climax
    const climax = volume > avgVolume * 3 && isGreen !== (index > 0 && candles[index - 1][4] >= candles[index - 1][1]) ? '💥' : '';

    // Volume Dry-Up
    const dryUp = volume < avgVolume * 0.3 ? '🌵' : '';

    // Wyckoff Accumulation (simplified: increasing volume + tight range)
    const accumulation = volume > avgVolume && priceChange < 1 && !isGreen ? '📥' : '';

    // Wyckoff Distribution (simplified: increasing volume + tight range + green)
    const distribution = volume > avgVolume && priceChange < 1 && isGreen ? '📤' : '';

    // Point of Control (simplified: highest volume level)
    const poc = volumeRank === 10 ? '🎯' : '';

    // Volume Cluster
    const cluster = volumeRank >= 8 ? '🔗' : '';

    // Pattern Score
    let patternScore = 0;
    if (breakout) patternScore += 3;
    if (climax) patternScore += 2;
    if (accumulation || distribution) patternScore += 2;
    if (poc) patternScore += 1;
    if (cluster) patternScore += 1;
    if (smartMoney) patternScore += 1;

    // === NEW METRICS ===

    // 1. Volume Z-Score (how abnormal is volume)
    const allVols = candles.map(c => c[5] || 0);
    const mean = allVols.reduce((a, b) => a + b, 0) / allVols.length;
    const variance = allVols.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allVols.length;
    const stdDev = Math.sqrt(variance);
    const volumeZScore = stdDev > 0 ? ((volume - mean) / stdDev).toFixed(2) : '0.00';

    // 2. Buy/Sell Pressure % (exact percentages)
    const buyPressurePercent = (buyPressure * 100).toFixed(1);
    const sellPressurePercent = ((1 - buyPressure) * 100).toFixed(1);

    // 3. Price Change % (percentage price movement)
    const priceChangePercent = ((close - open) / open * 100).toFixed(2);

    // 4. Force Index (price movement × volume)
    const prevClose = index > 0 ? candles[index - 1][4] : open;
    const forceIndex = ((close - prevClose) * volume).toFixed(0);

    // 5. Liquidity Score (1-10 based on volume and spread)
    const spread = ((high - low) / close * 100);
    let liquidityScore = 5;
    if (volume > avgVolume * 2 && spread < 0.5) liquidityScore = 10;
    else if (volume > avgVolume * 1.5 && spread < 1) liquidityScore = 8;
    else if (volume > avgVolume && spread < 1.5) liquidityScore = 7;
    else if (volume < avgVolume * 0.5 || spread > 3) liquidityScore = 3;
    else if (volume < avgVolume * 0.3 || spread > 5) liquidityScore = 1;

    // 6. Alert Level (None/Low/Medium/High/Critical)
    let alertLevel = 'None';
    let alertColor = '#444';
    if (parseFloat(volumeZScore) > 3 || volume > avgVolume * 3) {
      alertLevel = '🔴 Critical';
      alertColor = '#ef4444';
    } else if (parseFloat(volumeZScore) > 2 || volume > avgVolume * 2) {
      alertLevel = '🟠 High';
      alertColor = '#f59e0b';
    } else if (parseFloat(volumeZScore) > 1 || volume > avgVolume * 1.5) {
      alertLevel = '🟡 Medium';
      alertColor = '#fbbf24';
    } else if (divergence) {
      alertLevel = '🟢 Low';
      alertColor = '#10eb04';
    }

    // 7. CMF (Chaikin Money Flow) - simplified 20-period
    const cmf = calculateCMF(reversedCandles, index);

    // 8. ATR (Average True Range) - volatility
    const atr = calculateATR(reversedCandles, index);

    // 9. Pattern Success Rate (based on historical patterns)
    let patternSuccessRate = 50; // Default 50%
    if (breakout) patternSuccessRate = 65;
    if (accumulation) patternSuccessRate = 70;
    if (distribution) patternSuccessRate = 60;
    if (climax) patternSuccessRate = 55;
    if (dryUp) patternSuccessRate = 45;
    if (divergence) patternSuccessRate += 10;

    // 10. Trading Opportunity Score (1-10)
    let opportunityScore = 5;
    if (action === 'BUY' && liquidityScore >= 7 && patternSuccessRate >= 60) opportunityScore = 9;
    else if (action === 'SELL' && liquidityScore >= 7 && patternSuccessRate >= 60) opportunityScore = 8;
    else if (action === 'BUY' && liquidityScore >= 5) opportunityScore = 7;
    else if (action === 'SELL' && liquidityScore >= 5) opportunityScore = 6;
    else if (liquidityScore < 3 || parseFloat(volumeZScore) > 3) opportunityScore = 2;
    else if (action === 'HOLD' && liquidityScore >= 7) opportunityScore = 6;

    // Calculate MACD (for TAB 7: Momentum)
    const macdData = calculateMACD(reversedCandles, index);
    const macd = macdData.macd;
    const macdSignal = macdData.signal;
    const histogram = macdData.histogram;

    // Calculate Stochastic
    const stochData = calculateStochastic(reversedCandles, index);
    const stochK = stochData.k;
    const stochD = stochData.d;

    // Calculate ADX
    const adx = calculateADX(reversedCandles, index);

    return {
      timestamp,
      isGreen,
      open: open.toFixed(6),
      high: high.toFixed(6),
      low: low.toFixed(6),
      close: close.toFixed(6),
      volume: volume.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      volumeRaw: volume,
      avgVolume: avgVolume.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      volumePercent,
      volumeRank,
      usdValue,
      usdValueRaw,
      volumeTrend,
      spike,
      spikeDetails,
      spikeMultiplier,
      // Price-Volume
      vwap,
      distVWAP,
      obv: obv.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      mfi: mfi.toFixed(0),
      divergence,
      signal: vwapSignal,
      // Buy/Sell
      buyVolume,
      sellVolume,
      buySellRatio,
      delta,
      pressure,
      smartMoney,
      absorption,
      action,
      // Patterns
      breakout,
      climax,
      dryUp,
      accumulation,
      distribution,
      poc,
      cluster,
      patternScore,
      // New Metrics
      volumeZScore,
      buyPressurePercent,
      sellPressurePercent,
      priceChangePercent,
      forceIndex,
      liquidityScore,
      alertLevel,
      alertColor,
      cmf,
      atr,
      patternSuccessRate,
      opportunityScore,
      // TAB 5: Volatility & Risk
      atrPercent: ((parseFloat(atr) / close) * 100).toFixed(2),
      bbWidth: '0.00',  // Calculated separately
      stdDev: stdDev.toFixed(6),
      rangePercent: (((high - low) / close) * 100).toFixed(2),
      volatilityRank: Math.min(10, Math.ceil(parseFloat(atr) / close * 100)),
      riskScore: liquidityScore <= 3 ? 8 : liquidityScore >= 8 ? 3 : 5,
      riskColor: liquidityScore <= 3 ? '#ef4444' : liquidityScore >= 8 ? '#4ade80' : '#fbbf24',
      stabilityIndex: 10 - Math.min(10, Math.ceil(parseFloat(atr) / close * 100)),
      volatilityTrend: index > 0 && parseFloat(atr) > parseFloat(calculateATR(reversedCandles, index - 1)) ? '↑' : index > 0 && parseFloat(atr) < parseFloat(calculateATR(reversedCandles, index - 1)) ? '↓' : '→',
      breakoutProb: volume > avgVolume * 2 && Math.abs(close - open) / open > 0.02 ? 75 : volume > avgVolume * 1.5 ? 50 : 25,
      // TAB 6: Statistical
      meanReversionScore: Math.abs(parseFloat(distVWAP)) > 2 ? 8 : Math.abs(parseFloat(distVWAP)) > 1 ? 5 : 3,
      kurtosis: '0.00',  // Simplified
      skewness: (close > (high + low) / 2 ? '+' : '-') + '0.5',
      percentileRank: volumeRank * 10,
      outlierDetection: Math.abs(parseFloat(volumeZScore)) > 3 ? '🔴 Extreme' : Math.abs(parseFloat(volumeZScore)) > 2 ? '🟠 High' : '-',
      distributionType: Math.abs(parseFloat(volumeZScore)) < 1 ? 'Normal' : 'Skewed',
      confidenceInterval: Math.min(95, 50 + (volumeRank * 5)),
      regressionTrend: ((close - open) / open * 100).toFixed(2),
      // TAB 7: Momentum (RSI, MACD, Stochastic, ADX calculated)
      rsi: calculateRSI(reversedCandles, index),
      macd,
      macdSignal,
      macdHistogram: histogram,
      stochK,
      stochD,
      adx,
      plusDI: buyPressurePercent,
      minusDI: sellPressurePercent,
      momentumScore: action === 'BUY' ? 7 : action === 'SELL' ? 3 : 5
    };
  });

  // Reverse back to show newest first (for display)
  volumeData.value = calculated.reverse();
}

// Calculate CMF (Chaikin Money Flow) - 20-period
function calculateCMF(candles, currentIndex) {
  const period = 20;
  if (currentIndex < period) return '0.00';

  let mfvSum = 0;
  let volumeSum = 0;

  for (let i = currentIndex - period + 1; i <= currentIndex; i++) {
    const [, open, high, low, close, volume] = candles[i];
    const mfm = ((close - low) - (high - close)) / (high - low);
    const mfv = mfm * volume;
    mfvSum += mfv;
    volumeSum += volume;
  }

  const cmf = volumeSum > 0 ? (mfvSum / volumeSum) : 0;
  return cmf.toFixed(2);
}

// Calculate ATR (Average True Range) - 14-period
function calculateATR(candles, currentIndex) {
  const period = 14;
  if (currentIndex < period) return '0.0000';

  let trSum = 0;
  for (let i = currentIndex - period + 1; i <= currentIndex; i++) {
    const [, , high, low, close] = candles[i];
    const prevClose = i > 0 ? candles[i - 1][4] : close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trSum += tr;
  }

  const atr = trSum / period;
  return atr.toFixed(4);
}

// Calculate MFI (Money Flow Index) - simplified
function calculateMFI(candles, currentIndex) {
  const period = 14;
  if (currentIndex < period) return 50; // Default neutral

  let positiveFlow = 0;
  let negativeFlow = 0;

  for (let i = currentIndex - period + 1; i <= currentIndex; i++) {
    const typicalPrice = (candles[i][2] + candles[i][3] + candles[i][4]) / 3;
    const moneyFlow = typicalPrice * candles[i][5];

    if (i > currentIndex - period + 1) {
      const prevTypicalPrice = (candles[i - 1][2] + candles[i - 1][3] + candles[i - 1][4]) / 3;
      if (typicalPrice > prevTypicalPrice) {
        positiveFlow += moneyFlow;
      } else {
        negativeFlow += moneyFlow;
      }
    }
  }

  if (negativeFlow === 0) return 100;
  const moneyRatio = positiveFlow / negativeFlow;
  const mfi = 100 - (100 / (1 + moneyRatio));
  return mfi;
}

// Load available data combinations from DB
async function loadAvailableCombinations() {
  try {
    console.log('📊 Loading available data combinations from DB...');
    const response = await $fetch('/api/v1/getAvailableVolumeData');

    if (response && response.success && response.combinations) {
      availableCombinations.value = response.combinations;
      console.log(`✅ Found ${response.combinations.length} available combinations`);

      // Extract unique exchanges
      const exchanges = [...new Set(response.combinations.map(c => c.exchange))];
      exchangeOptions.value = exchanges.map(ex => ({
        label: ex.toUpperCase(),
        value: ex
      }));

      // Extract unique symbols
      const symbols = [...new Set(response.combinations.map(c => c.symbol))];
      symbolOptions.value = symbols.map(sym => ({
        label: sym,
        value: sym
      }));

      // Extract unique timeframes
      const timeframes = [...new Set(response.combinations.map(c => c.timeframe))];
      const timeframeLabels = {
        '1m': '1 Minute',
        '5m': '5 Minutes',
        '15m': '15 Minutes',
        '1h': '1 Hour',
        '4h': '4 Hours',
        '1d': '1 Day',
        '1w': '1 Week'
      };
      timeframeOptions.value = timeframes.map(tf => ({
        label: timeframeLabels[tf] || tf,
        value: tf
      }));

      // Set default values to first available combination
      if (response.combinations.length > 0) {
        const firstCombo = response.combinations[0];
        selectedExchange.value = firstCombo.exchange;
        selectedSymbol.value = firstCombo.symbol;
        selectedTimeframe.value = firstCombo.timeframe;
        console.log('✅ Default selection:', firstCombo);
      }

      return true;
    } else {
      console.error('❌ No combinations found in DB');
      return false;
    }
  } catch (error) {
    console.error('❌ Error loading combinations:', error);
    return false;
  }
}

// Open spike details modal
function openSpikeModal(candle) {
  if (candle.spike) {
    selectedSpike.value = candle;
    showSpikeModal.value = true;
  }
}

// Calculate RSI
function calculateRSI(candles, currentIndex, period = 14) {
  // Need at least 2 candles for price change
  if (currentIndex < 1) return 50.0;

  // Use available data if less than period
  const actualPeriod = Math.min(period, currentIndex);
  if (actualPeriod < 2) return 50.0;

  let gains = 0;
  let losses = 0;
  let count = 0;

  for (let i = currentIndex - actualPeriod + 1; i <= currentIndex; i++) {
    if (i > 0) {
      const change = candles[i][4] - candles[i - 1][4];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
      count++;
    }
  }

  if (count === 0) return 50.0;

  const avgGain = gains / count;
  const avgLoss = losses / count;

  if (avgLoss === 0) return avgGain > 0 ? 100.0 : 50.0;
  const rs = avgGain / avgLoss;
  return (100 - (100 / (1 + rs))).toFixed(1);
}

// Calculate MACD (Moving Average Convergence Divergence)
function calculateMACD(candles, currentIndex, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  // Need at least some data
  if (currentIndex < 1) {
    return {
      macd: '0.0000',
      signal: '0.0000',
      histogram: '0.0000'
    };
  }

  // Use available data if less than slow period
  const actualSlowPeriod = Math.min(slowPeriod, currentIndex + 1);
  const actualFastPeriod = Math.min(fastPeriod, currentIndex + 1);
  const actualSignalPeriod = Math.min(signalPeriod, Math.floor(actualSlowPeriod / 3));

  // Calculate Simple EMA
  const calculateEMA = (data, period, currentIdx) => {
    if (currentIdx < 0) return 0;

    const actualPeriod = Math.min(period, currentIdx + 1);
    const multiplier = 2 / (actualPeriod + 1);

    // Calculate SMA for initial EMA
    let sum = 0;
    const startIdx = Math.max(0, currentIdx - actualPeriod + 1);
    for (let i = startIdx; i <= currentIdx; i++) {
      sum += data[i][4]; // close price
    }
    let ema = sum / actualPeriod;

    // Apply EMA formula for smoothing
    for (let i = startIdx; i <= currentIdx; i++) {
      ema = (data[i][4] - ema) * multiplier + ema;
    }

    return ema;
  };

  const fastEMA = calculateEMA(candles, actualFastPeriod, currentIndex);
  const slowEMA = calculateEMA(candles, actualSlowPeriod, currentIndex);
  const macdValue = fastEMA - slowEMA;

  // Calculate signal line (SMA of recent MACD values for simplicity)
  let signalValue = 0;
  if (actualSignalPeriod > 0 && currentIndex >= actualSignalPeriod - 1) {
    let macdSum = 0;
    let count = 0;
    for (let i = 0; i < actualSignalPeriod && currentIndex - i >= 0; i++) {
      const idx = currentIndex - i;
      const fEMA = calculateEMA(candles, actualFastPeriod, idx);
      const sEMA = calculateEMA(candles, actualSlowPeriod, idx);
      macdSum += (fEMA - sEMA);
      count++;
    }
    signalValue = count > 0 ? macdSum / count : macdValue;
  } else {
    signalValue = macdValue;
  }

  const histogramValue = macdValue - signalValue;

  return {
    macd: macdValue.toFixed(4),
    signal: signalValue.toFixed(4),
    histogram: histogramValue.toFixed(4)
  };
}

// Calculate Stochastic Oscillator (%K and %D)
function calculateStochastic(candles, currentIndex, kPeriod = 14, dPeriod = 3) {
  if (currentIndex < 1) {
    return { k: '50.0', d: '50.0' };
  }

  const actualKPeriod = Math.min(kPeriod, currentIndex + 1);

  // Calculate %K for current index
  const calculateK = (idx) => {
    const period = Math.min(kPeriod, idx + 1);
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    const startIdx = Math.max(0, idx - period + 1);

    for (let i = startIdx; i <= idx; i++) {
      const high = candles[i][2];
      const low = candles[i][3];
      if (high > highestHigh) highestHigh = high;
      if (low < lowestLow) lowestLow = low;
    }

    const close = candles[idx][4];
    const range = highestHigh - lowestLow;

    if (range > 0) {
      return ((close - lowestLow) / range) * 100;
    }
    return 50;
  };

  const kValue = calculateK(currentIndex);

  // Calculate %D (SMA of %K over dPeriod)
  let dValue = kValue;
  const actualDPeriod = Math.min(dPeriod, currentIndex + 1);

  if (actualDPeriod > 0) {
    let kSum = 0;
    let count = 0;
    for (let i = 0; i < actualDPeriod && currentIndex - i >= 0; i++) {
      const idx = currentIndex - i;
      kSum += calculateK(idx);
      count++;
    }
    dValue = count > 0 ? kSum / count : kValue;
  }

  return {
    k: kValue.toFixed(1),
    d: dValue.toFixed(1)
  };
}

// Calculate ADX (Average Directional Index) - Simplified
function calculateADX(candles, currentIndex, period = 14) {
  if (currentIndex < 1) return '25.0';

  const actualPeriod = Math.min(period, currentIndex);
  if (actualPeriod < 2) return '25.0';

  let sumDX = 0;
  let count = 0;

  for (let i = Math.max(1, currentIndex - actualPeriod + 1); i <= currentIndex; i++) {
    const high = candles[i][2];
    const low = candles[i][3];
    const prevHigh = candles[i - 1][2];
    const prevLow = candles[i - 1][3];
    const prevClose = candles[i - 1][4];

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    const plusDM = Math.max(high - prevHigh, 0);
    const minusDM = Math.max(prevLow - low, 0);

    if (tr > 0) {
      const plusDI = (plusDM / tr) * 100;
      const minusDI = (minusDM / tr) * 100;
      const diSum = plusDI + minusDI;

      if (diSum > 0) {
        const dx = (Math.abs(plusDI - minusDI) / diSum) * 100;
        sumDX += dx;
        count++;
      }
    }
  }

  const adx = count > 0 ? sumDX / count : 25;
  return adx.toFixed(1);
}

// Export to CSV
function exportToCSV() {
  if (filteredVolumeData.value.length === 0) return;

  const headers = ['#', 'Time', 'Open', 'High', 'Low', 'Close', 'Volume', 'Avg Vol', 'Vol %', 'Rank', 'USD Value', 'Trend', 'Spike', 'Z-Score', 'Buy %', 'Sell %', 'Price Change %', 'Force', 'Liquidity', 'Alert', 'CMF', 'ATR', 'Success %', 'Opportunity'];
  const rows = filteredVolumeData.value.map((c, i) => [
    i + 1,
    new Date(c.timestamp).toLocaleString('en-US'),
    c.open,
    c.high,
    c.low,
    c.close,
    c.volume,
    c.avgVolume,
    c.volumePercent + '%',
    c.volumeRank + '/10',
    '$' + c.usdValue,
    c.volumeTrend,
    c.spike || '-',
    c.volumeZScore,
    c.buyPressurePercent + '%',
    c.sellPressurePercent + '%',
    c.priceChangePercent + '%',
    c.forceIndex,
    c.liquidityScore + '/10',
    c.alertLevel,
    c.cmf,
    c.atr,
    c.patternSuccessRate + '%',
    c.opportunityScore + '/10'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `volume-analysis-${selectedExchange.value}-${selectedSymbol.value}-${selectedTimeframe.value}-${Date.now()}.csv`;
  link.click();
}

// Export to JSON
function exportToJSON() {
  if (filteredVolumeData.value.length === 0) return;

  const jsonContent = JSON.stringify({
    exchange: selectedExchange.value,
    symbol: selectedSymbol.value,
    timeframe: selectedTimeframe.value,
    exportDate: new Date().toISOString(),
    dataCount: filteredVolumeData.value.length,
    data: filteredVolumeData.value
  }, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `volume-analysis-${selectedExchange.value}-${selectedSymbol.value}-${selectedTimeframe.value}-${Date.now()}.json`;
  link.click();
}

// Clear filters
function clearFilters() {
  minVolumeFilter.value = 0;
  showSpikesOnly.value = false;
}

// Watch auto-refresh
watch(autoRefreshEnabled, (enabled) => {
  if (enabled) {
    console.log('🔄 Auto-refresh enabled (30 seconds)');
    autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      fetchVolumeData();
    }, 30000); // 30 seconds
  } else {
    console.log('🛑 Auto-refresh disabled');
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});

// Load data on mount
onMounted(async () => {
  console.log('📊 Volume Analysis page mounted');

  // Load available combinations from DB first
  const hasData = await loadAvailableCombinations();

  if (!hasData) {
    console.error('❌ No data available in MongoDB');
    errorMessage.value = 'No candle data found in database. Please run data collection first.';
    return;
  }

  // Auto-load volume data with first available combination
  if (selectedExchange.value && selectedSymbol.value && selectedTimeframe.value) {
    console.log('🚀 Auto-loading volume data for:', selectedExchange.value, selectedSymbol.value, selectedTimeframe.value);
    await fetchVolumeData();
  }
});
</script>
