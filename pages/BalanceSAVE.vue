<template>
  <div class="balance-save-page">
    <!-- Header with Actions -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">💰 Balance Tracker</h1>
          <p class="page-subtitle">Monitor and save your portfolio balances across all exchanges</p>
        </div>
        <div class="header-actions">
          <div class="lcx-price-display">
            <span class="price-label">🔴 LIVE</span>
            <span class="price-value">LCX $ {{ lcxPrice }}</span>
          </div>
          <n-button type="primary" size="large" :loading="loading" @click="loadAllExchangesApis()">
            🔄 Refresh All
          </n-button>
          <n-button type="success" size="large" @click="saveBalances">
            💾 Save Snapshot
          </n-button>
          <n-button type="error" size="large" @click="clearAllBalances">
            🗑️ Clear All
          </n-button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Section: Current Balances -->
      <div class="left-section">
        <!-- Exchange Load Buttons Card -->
        <n-card class="exchange-buttons-card" title="🔄 Load Exchange Data">
          <div class="exchange-buttons">
            <n-button
              type="info"
              size="large"
              :loading="loading"
              @click="loadAllApiBalances('coinbaseadvanced')"
              class="exchange-btn coinbase-btn"
            >
              <template #icon>
                <img :src="getExchangeLogo('coinbaseadvanced')" class="btn-logo" />
              </template>
              Coinbase
            </n-button>
            <n-button
              type="info"
              size="large"
              :loading="loading"
              @click="loadAllApiBalances('kraken')"
              class="exchange-btn kraken-btn"
            >
              <template #icon>
                <img :src="getExchangeLogo('kraken')" class="btn-logo" />
              </template>
              Kraken
            </n-button>
            <n-button
              type="info"
              size="large"
              :loading="loading"
              @click="loadAllApiBalances('bitrue')"
              class="exchange-btn bitrue-btn"
            >
              <template #icon>
                <img :src="getExchangeLogo('bitrue')" class="btn-logo" />
              </template>
              Bitrue
            </n-button>
            <n-button
              type="info"
              size="large"
              :loading="loading"
              @click="loadAllApiBalances('lcx')"
              class="exchange-btn lcx-btn"
            >
              <template #icon>
                <img :src="getExchangeLogo('lcx')" class="btn-logo" />
              </template>
              LCX
            </n-button>
          </div>
        </n-card>

        <!-- Current API Balances Card -->
        <n-card v-if="apiBalances.length > 0" class="current-balances-card" title="📊 Current Balances">
          <template #header-extra>
            <n-button type="error" size="small" @click="clearApiBalances()">Clear</n-button>
          </template>

          <!-- API Balances List -->
          <div class="api-balances-list">
            <div v-for="(apiBalance, index) in apiBalances" :key="index" class="api-balance-item">
              <div class="api-balance-header" @click="toggleApiBalanceItem(index)" style="cursor: pointer;">
                <span class="expand-icon-api">{{ isApiBalanceExpanded(index) ? '▼' : '▶' }}</span>
                <div class="exchange-info">
                  <img :src="getExchangeLogo(apiBalance.exchange)" class="exchange-icon" />
                  <div class="exchange-details">
                    <span class="exchange-name">{{ apiBalance.exchange }}</span>
                    <span class="api-key-name">{{ apiBalance.apiKeyName }}</span>
                  </div>
                </div>
              </div>

              <div v-if="isApiBalanceExpanded(index)" class="balance-grid">
                <!-- LCX Column -->
                <div class="balance-column lcx-column">
                  <div class="column-header">LCX</div>
                  <div class="balance-row">
                    <span class="label">Free:</span>
                    <span class="value lcx-value">{{ formatNumber(apiBalance.lcxFree || 0) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="label">Used:</span>
                    <span class="value lcx-value-used">{{ formatNumber(apiBalance.lcxUsed || 0) }}</span>
                  </div>
                  <div class="balance-row total-row">
                    <span class="label">Total:</span>
                    <span class="value lcx-value-total">{{ formatNumber(apiBalance.lcxTotal || 0) }}</span>
                  </div>
                </div>

                <!-- USDC Column -->
                <div class="balance-column usdc-column">
                  <div class="column-header">USDC/USD/USDT</div>
                  <div class="balance-row">
                    <span class="label">Free:</span>
                    <span class="value usdc-value">$ {{ formatNumber(apiBalance.usdcFree || 0) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="label">Used:</span>
                    <span class="value usdc-value-used">$ {{ formatNumber(apiBalance.usdcUsed || 0) }}</span>
                  </div>
                  <div class="balance-row total-row">
                    <span class="label">Total:</span>
                    <span class="value usdc-value-total">$ {{ formatNumber(apiBalance.usdcTotal || 0) }}</span>
                  </div>
                </div>

                <!-- EUR Column -->
                <div class="balance-column eur-column">
                  <div class="column-header">EUR</div>
                  <div class="balance-row">
                    <span class="label">Free:</span>
                    <span class="value eur-value">€ {{ formatNumber(apiBalance.eurFree || 0) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="label">Used:</span>
                    <span class="value eur-value-used">€ {{ formatNumber(apiBalance.eurUsed || 0) }}</span>
                  </div>
                  <div class="balance-row total-row">
                    <span class="label">Total:</span>
                    <span class="value eur-value-total">€ {{ formatNumber(apiBalance.eurTotal || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Totals Summary Card -->
          <div class="totals-summary">
            <div class="totals-header">🌐 GLOBAL TOTALS</div>
            <div class="totals-grid">
              <div class="total-card lcx-total-card">
                <div class="total-label">LCX</div>
                <div class="total-values">
                  <div class="total-item">
                    <span class="label">Free:</span>
                    <span class="value">{{ formatNumber(totalApiLCXFree) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="label">Used:</span>
                    <span class="value">{{ formatNumber(totalApiLCXUsed) }}</span>
                  </div>
                  <div class="total-item main-total">
                    <span class="label">Total:</span>
                    <span class="value">{{ formatNumber(totalApiLCXTotal) }}</span>
                  </div>
                  <div class="total-item usd-value-item">
                    <span class="label">Value USD:</span>
                    <span class="value usd-highlight">$ {{ formatUSD(totalApiLCXTotal * (parseFloat(lcxPrice) || 0.17)) }}</span>
                  </div>
                </div>
              </div>

              <div class="total-card usdc-total-card">
                <div class="total-label">USDC/USD/USDT</div>
                <div class="total-values">
                  <div class="total-item">
                    <span class="label">Free:</span>
                    <span class="value">$ {{ formatNumber(totalApiUSDCFree) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="label">Used:</span>
                    <span class="value">$ {{ formatNumber(totalApiUSDCUsed) }}</span>
                  </div>
                  <div class="total-item main-total">
                    <span class="label">Total:</span>
                    <span class="value">$ {{ formatNumber(totalApiUSDCTotal) }}</span>
                  </div>
                </div>
              </div>

              <div class="total-card eur-total-card">
                <div class="total-label">EUR</div>
                <div class="total-values">
                  <div class="total-item">
                    <span class="label">Free:</span>
                    <span class="value">€ {{ formatNumber(totalApiEURFree) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="label">Used:</span>
                    <span class="value">€ {{ formatNumber(totalApiEURUsed) }}</span>
                  </div>
                  <div class="total-item main-total">
                    <span class="label">Total:</span>
                    <span class="value">€ {{ formatNumber(totalApiEURTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Empty State -->
        <n-card v-else class="empty-state-card">
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No Balances Loaded</h3>
            <p>Click on an exchange button above to load balances</p>
          </div>
        </n-card>
      </div>

      <!-- Right Section: History -->
      <div class="right-section">
        <n-card class="history-card" title="📜 Balance History">
          <template #header-extra>
            <span class="history-count">{{ savedBalances.length }} snapshots</span>
          </template>

          <!-- History List -->
          <div v-if="savedBalances.length > 0" class="history-list">
            <div v-for="(balance, displayIndex) in savedBalances.slice().reverse()" :key="balance.timestamp" class="history-item">
              <div class="history-item-header" @click="toggleHistoryItem(savedBalances.length - 1 - displayIndex)" style="cursor: pointer;">
                <div class="timestamp-section">
                  <span class="expand-icon">{{ isExpanded(savedBalances.length - 1 - displayIndex) ? '▼' : '▶' }}</span>
                  <span class="snapshot-number">#{{ displayIndex + 1 }}</span>
                  <div class="timestamp-info">
                    <span class="timestamp">{{ balance.timestamp }}</span>
                    <span v-if="balance.lcxPriceAtSave" class="saved-price">
                      LCX: ${{ balance.lcxPriceAtSave.toFixed(4) }}
                    </span>
                  </div>
                </div>
                <!-- Differences Summary (inline) - NU la cel mai vechi (index 0) -->
                <div v-if="savedBalances.length - 1 - displayIndex > 0" class="header-differences" @click.stop>
                  <div class="header-diff-item">
                    <span class="header-diff-label">Δ LCX:</span>
                    <span class="header-diff-value" :class="calculateDifferenceLCX(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                      {{ calculateDifferenceLCX(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}{{ calculateDifferenceLCX(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                    </span>
                  </div>
                  <div class="header-diff-item">
                    <span class="header-diff-label">Δ USDC:</span>
                    <span class="header-diff-value" :class="calculateDifferenceUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                      {{ calculateDifferenceUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}$ {{ calculateDifferenceUSDC(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                    </span>
                  </div>
                  <div class="header-diff-item">
                    <span class="header-diff-label">Δ Total USD:</span>
                    <span class="header-diff-value" :class="calculateDifferenceTotalUSDValue(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                      {{ calculateDifferenceTotalUSDValue(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}$ {{ formatUSD(calculateDifferenceTotalUSDValue(savedBalances.length - 1 - displayIndex)) }}
                    </span>
                  </div>
                </div>
                <div class="history-actions" @click.stop>
                  <n-button size="tiny" type="primary" @click="copyBalanceToInputs(balance)">
                    📋 Copy
                  </n-button>
                  <n-button size="tiny" type="error" @click="deleteBalance(savedBalances.length - 1 - displayIndex)">
                    ✕
                  </n-button>
                </div>
              </div>

              <div v-if="isExpanded(savedBalances.length - 1 - displayIndex)" class="history-item-body">
                <!-- Exchange Balances Row -->
                <div class="exchange-balances-row">
                  <div class="mini-balance-card coinbase-card">
                    <span class="mini-exchange">C</span>
                    <div class="mini-values">
                      <span class="mini-lcx">{{ (balance.coinbase || 0).toLocaleString('en-US') }}</span>
                      <span class="mini-usd-value" v-if="balance.lcxPriceAtSave">
                        ≈ ${{ formatUSD((balance.coinbase || 0) * balance.lcxPriceAtSave) }}
                      </span>
                      <span class="mini-usdc">$ {{ (balance.coinbaseUSDC || 0).toLocaleString('en-US') }}</span>
                    </div>
                    <!-- API Details -->
                    <div v-if="balance.apiDetails && balance.apiDetails.coinbase && balance.apiDetails.coinbase.length > 0" class="api-details">
                      <div v-for="api in balance.apiDetails.coinbase" :key="api.name" class="api-detail-item">
                        <span class="api-name">{{ api.name }}</span>
                        <div class="api-values">
                          <span class="api-lcx">{{ api.lcx.toFixed(2) }} LCX</span>
                          <span class="api-usd-value" v-if="balance.lcxPriceAtSave">
                            ≈ ${{ formatUSD(api.lcx * balance.lcxPriceAtSave) }}
                          </span>
                          <span class="api-usdc">${{ api.usdc.toFixed(2) }} USDC</span>
                        </div>
                        <!-- API Differences -->
                        <div v-if="savedBalances.length - 1 - displayIndex > 0" class="api-diff">
                          <span class="api-diff-item" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'coinbase', api).toFixed(2) }} LCX
                          </span>
                          <span class="api-diff-item" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'coinbase', api).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mini-balance-card kraken-card">
                    <span class="mini-exchange">K</span>
                    <div class="mini-values">
                      <span class="mini-lcx">{{ (balance.kraken || 0).toLocaleString('en-US') }}</span>
                      <span class="mini-usd-value" v-if="balance.lcxPriceAtSave">
                        ≈ ${{ formatUSD((balance.kraken || 0) * balance.lcxPriceAtSave) }}
                      </span>
                      <span class="mini-usdc">$ {{ (balance.krakenUSDC || 0).toLocaleString('en-US') }}</span>
                    </div>
                    <!-- API Details -->
                    <div v-if="balance.apiDetails && balance.apiDetails.kraken && balance.apiDetails.kraken.length > 0" class="api-details">
                      <div v-for="api in balance.apiDetails.kraken" :key="api.name" class="api-detail-item">
                        <span class="api-name">{{ api.name }}</span>
                        <div class="api-values">
                          <span class="api-lcx">{{ api.lcx.toFixed(2) }} LCX</span>
                          <span class="api-usd-value" v-if="balance.lcxPriceAtSave">
                            ≈ ${{ formatUSD(api.lcx * balance.lcxPriceAtSave) }}
                          </span>
                          <span class="api-usdc">${{ api.usdc.toFixed(2) }} USDC</span>
                        </div>
                        <!-- API Differences -->
                        <div v-if="savedBalances.length - 1 - displayIndex > 0" class="api-diff">
                          <span class="api-diff-item" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'kraken', api).toFixed(2) }} LCX
                          </span>
                          <span class="api-diff-item" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'kraken', api).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mini-balance-card bitrue-card">
                    <span class="mini-exchange">B</span>
                    <div class="mini-values">
                      <span class="mini-lcx">{{ (balance.bitrue || 0).toLocaleString('en-US') }}</span>
                      <span class="mini-usd-value" v-if="balance.lcxPriceAtSave">
                        ≈ ${{ formatUSD((balance.bitrue || 0) * balance.lcxPriceAtSave) }}
                      </span>
                      <span class="mini-usdc">$ {{ (balance.bitrueUSDC || 0).toLocaleString('en-US') }}</span>
                    </div>
                    <!-- API Details -->
                    <div v-if="balance.apiDetails && balance.apiDetails.bitrue && balance.apiDetails.bitrue.length > 0" class="api-details">
                      <div v-for="api in balance.apiDetails.bitrue" :key="api.name" class="api-detail-item">
                        <span class="api-name">{{ api.name }}</span>
                        <div class="api-values">
                          <span class="api-lcx">{{ api.lcx.toFixed(2) }} LCX</span>
                          <span class="api-usd-value" v-if="balance.lcxPriceAtSave">
                            ≈ ${{ formatUSD(api.lcx * balance.lcxPriceAtSave) }}
                          </span>
                          <span class="api-usdc">${{ api.usdc.toFixed(2) }} USDC</span>
                        </div>
                        <!-- API Differences -->
                        <div v-if="savedBalances.length - 1 - displayIndex > 0" class="api-diff">
                          <span class="api-diff-item" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'bitrue', api).toFixed(2) }} LCX
                          </span>
                          <span class="api-diff-item" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'bitrue', api).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mini-balance-card lcx-card">
                    <span class="mini-exchange">L</span>
                    <div class="mini-values">
                      <span class="mini-lcx">{{ (balance.lcx || 0).toLocaleString('en-US') }}</span>
                      <span class="mini-usd-value" v-if="balance.lcxPriceAtSave">
                        ≈ ${{ formatUSD((balance.lcx || 0) * balance.lcxPriceAtSave) }}
                      </span>
                      <span class="mini-usdc">$ {{ (balance.lcxUSDC || 0).toLocaleString('en-US') }}</span>
                    </div>
                    <!-- API Details -->
                    <div v-if="balance.apiDetails && balance.apiDetails.lcx && balance.apiDetails.lcx.length > 0" class="api-details">
                      <div v-for="api in balance.apiDetails.lcx" :key="api.name" class="api-detail-item">
                        <span class="api-name">{{ api.name }}</span>
                        <div class="api-values">
                          <span class="api-lcx">{{ api.lcx.toFixed(2) }} LCX</span>
                          <span class="api-usd-value" v-if="balance.lcxPriceAtSave">
                            ≈ ${{ formatUSD(api.lcx * balance.lcxPriceAtSave) }}
                          </span>
                          <span class="api-usdc">${{ api.usdc.toFixed(2) }} USDC</span>
                        </div>
                        <!-- API Differences -->
                        <div v-if="savedBalances.length - 1 - displayIndex > 0" class="api-diff">
                          <span class="api-diff-item" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'lcx', api).toFixed(2) }} LCX
                          </span>
                          <span class="api-diff-item" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? 'positive' : 'negative'">
                            Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'lcx', api).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Calculated Values -->
                <div class="calculated-section">
                  <div class="calc-row">
                    <div class="calc-item highlight-cyan">
                      <span class="calc-label">Total LCX:</span>
                      <span class="calc-value">{{ calculateTotalLCX(balance).toLocaleString('en-US') }}</span>
                    </div>
                    <div class="calc-item highlight-blue">
                      <span class="calc-label">Total USDC:</span>
                      <span class="calc-value">$ {{ calculateTotalUSDC(balance).toLocaleString('en-US') }}</span>
                    </div>
                  </div>

                  <div class="calc-row">
                    <div class="calc-item highlight-red">
                      <span class="calc-label">Value LCX→USD:</span>
                      <span class="calc-value">$ {{ calculatePosibleUSDC(balance).toLocaleString('en-US') }}</span>
                    </div>
                    <div class="calc-item highlight-green">
                      <span class="calc-label">Possible LCX:</span>
                      <span class="calc-value">{{ calculatePosibleLCX(balance).toLocaleString('en-US') }}</span>
                    </div>
                  </div>

                  <div class="calc-row">
                    <div class="calc-item highlight-purple">
                      <span class="calc-label">T2 LCX:</span>
                      <span class="calc-value">{{ calculateT2LCX(balance).toLocaleString('en-US') }}</span>
                    </div>
                    <div class="calc-item highlight-orange">
                      <span class="calc-label">Total LCX v2:</span>
                      <span class="calc-value">{{ calculateLCXv2(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Differences (if not first item - cel mai vechi la index 0) -->
                <div v-if="savedBalances.length - 1 - displayIndex > 0" class="differences-section">
                  <div class="diff-header">📊 Differences from Previous</div>
                  <div class="diff-grid">
                    <div class="diff-item">
                      <span class="diff-label">Δ LCX:</span>
                      <span class="diff-value" :class="calculateDifferenceLCX(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                        {{ calculateDifferenceLCX(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}{{ calculateDifferenceLCX(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                      </span>
                    </div>
                    <div class="diff-item">
                      <span class="diff-label">Δ USDC:</span>
                      <span class="diff-value" :class="calculateDifferenceUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                        {{ calculateDifferenceUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}$ {{ calculateDifferenceUSDC(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                      </span>
                    </div>
                    <div class="diff-item">
                      <span class="diff-label">Δ P LCX:</span>
                      <span class="diff-value" :class="calculateDifferencePosibleLCX(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                        {{ calculateDifferencePosibleLCX(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}{{ calculateDifferencePosibleLCX(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                      </span>
                    </div>
                    <div class="diff-item">
                      <span class="diff-label">Δ P USDC:</span>
                      <span class="diff-value" :class="calculateDifferencePosibleUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                        {{ calculateDifferencePosibleUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}$ {{ calculateDifferencePosibleUSDC(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                      </span>
                    </div>
                    <div class="diff-item">
                      <span class="diff-label">Δ Posible LCX+USDC:</span>
                      <span class="diff-value" :class="calculateDifferencePosibleLCXUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? 'positive' : 'negative'">
                        {{ calculateDifferencePosibleLCXUSDC(savedBalances.length - 1 - displayIndex) >= 0 ? '+' : '' }}{{ calculateDifferencePosibleLCXUSDC(savedBalances.length - 1 - displayIndex).toLocaleString('en-US') }}
                      </span>
                    </div>
                  </div>

                  <!-- API-level differences breakdown -->
                  <div class="api-diff-breakdown">
                    <div class="api-diff-breakdown-header">🔑 Per API:</div>
                    <div class="api-diff-breakdown-list">
                      <!-- Coinbase APIs -->
                      <template v-if="savedBalances[savedBalances.length - 1 - displayIndex].apiDetails && savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.coinbase">
                        <div v-for="api in savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.coinbase" :key="'cb-' + api.name" class="api-diff-breakdown-item">
                          <span class="api-diff-breakdown-name">{{ api.name }} (C)</span>
                          <div class="api-diff-breakdown-values">
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'coinbase', api).toFixed(2) }} LCX
                            </span>
                            <span class="api-diff-breakdown-separator">|</span>
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'coinbase', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'coinbase', api).toFixed(2) }}
                            </span>
                          </div>
                        </div>
                      </template>
                      <!-- Kraken APIs -->
                      <template v-if="savedBalances[savedBalances.length - 1 - displayIndex].apiDetails && savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.kraken">
                        <div v-for="api in savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.kraken" :key="'kr-' + api.name" class="api-diff-breakdown-item">
                          <span class="api-diff-breakdown-name">{{ api.name }} (K)</span>
                          <div class="api-diff-breakdown-values">
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'kraken', api).toFixed(2) }} LCX
                            </span>
                            <span class="api-diff-breakdown-separator">|</span>
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'kraken', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'kraken', api).toFixed(2) }}
                            </span>
                          </div>
                        </div>
                      </template>
                      <!-- Bitrue APIs -->
                      <template v-if="savedBalances[savedBalances.length - 1 - displayIndex].apiDetails && savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.bitrue">
                        <div v-for="api in savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.bitrue" :key="'br-' + api.name" class="api-diff-breakdown-item">
                          <span class="api-diff-breakdown-name">{{ api.name }} (B)</span>
                          <div class="api-diff-breakdown-values">
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'bitrue', api).toFixed(2) }} LCX
                            </span>
                            <span class="api-diff-breakdown-separator">|</span>
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'bitrue', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'bitrue', api).toFixed(2) }}
                            </span>
                          </div>
                        </div>
                      </template>
                      <!-- LCX APIs -->
                      <template v-if="savedBalances[savedBalances.length - 1 - displayIndex].apiDetails && savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.lcx">
                        <div v-for="api in savedBalances[savedBalances.length - 1 - displayIndex].apiDetails.lcx" :key="'lcx-' + api.name" class="api-diff-breakdown-item">
                          <span class="api-diff-breakdown-name">{{ api.name }} (L)</span>
                          <div class="api-diff-breakdown-values">
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? '+' : '' }}{{ calculateApiDifferenceLCX(savedBalances.length - 1 - displayIndex, 'lcx', api).toFixed(2) }} LCX
                            </span>
                            <span class="api-diff-breakdown-separator">|</span>
                            <span class="api-diff-breakdown-value" :class="calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? 'positive' : 'negative'">
                              Δ {{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'lcx', api) >= 0 ? '+' : '' }}${{ calculateApiDifferenceUSDC(savedBalances.length - 1 - displayIndex, 'lcx', api).toFixed(2) }}
                            </span>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty History State -->
          <div v-else class="empty-history">
            <div class="empty-history-icon">📝</div>
            <h3>No Saved Snapshots</h3>
            <p>Click "Save Snapshot" to create your first balance record</p>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useAppStore } from '~/stores/app.store';

definePageMeta({
  middleware: 'auth'
});

const { getExchangeLogo } = useExchangeLogos();
const appStore = useAppStore();

let userID = useCookie('userID');
let loading = ref(false);

// API Balances list (all API keys with their balances)
let apiBalances = ref([]);

// Initialize balances for LCX and USDC across multiple exchanges
let coinbaseBalance = ref("");
let krakenBalance = ref("");
let bitrueBalance = ref("");
let lcxBalance = ref("");

let coinbaseUSDC = ref("");
let krakenUSDC = ref("");
let bitrueUSDC = ref("");
let lcxUSDC = ref("");

// LCX Price - Get from ticker-bar store (live price)
let lcxPrice = computed({
  get: () => {
    const storePrice = appStore.getCurrentPrice;
    return storePrice ? storePrice.toFixed(4) : "0.1700";
  },
  set: (value) => {
    // Allow manual override if needed
    appStore.setCurrentPrice(parseFloat(value) || 0.17);
  }
});

// Store saved balances
let savedBalances = ref([]);

// Track expanded state for each history item
let expandedItems = ref([]);

// Track expanded state for API balance items
let expandedApiBalances = ref([]);

// Computed totals for API balances - LCX
const totalApiLCXFree = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.lcxFree || 0), 0);
});

const totalApiLCXUsed = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.lcxUsed || 0), 0);
});

const totalApiLCXTotal = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.lcxTotal || 0), 0);
});

// Computed totals for API balances - USDC/USD/USDT
const totalApiUSDCFree = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.usdcFree || 0), 0);
});

const totalApiUSDCUsed = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.usdcUsed || 0), 0);
});

const totalApiUSDCTotal = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.usdcTotal || 0), 0);
});

// Computed totals for API balances - EUR
const totalApiEURFree = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.eurFree || 0), 0);
});

const totalApiEURUsed = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.eurUsed || 0), 0);
});

const totalApiEURTotal = computed(() => {
  return apiBalances.value.reduce((sum, balance) => sum + Number(balance.eurTotal || 0), 0);
});

// Format number with 2 decimals and comma as decimal separator
function formatNumber(value) {
  const num = Number(value || 0);
  return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format USD value with comma as decimal separator
function formatUSD(value) {
  const num = Number(value || 0);
  return num.toFixed(2).replace('.', ',');
}

// Toggle expand/collapse for history item
function toggleHistoryItem(index) {
  const itemIndex = expandedItems.value.indexOf(index);
  if (itemIndex > -1) {
    expandedItems.value.splice(itemIndex, 1);
  } else {
    expandedItems.value.push(index);
  }
}

// Check if history item is expanded
function isExpanded(index) {
  return expandedItems.value.includes(index);
}

// Toggle expand/collapse for API balance item
function toggleApiBalanceItem(index) {
  const itemIndex = expandedApiBalances.value.indexOf(index);
  if (itemIndex > -1) {
    expandedApiBalances.value.splice(itemIndex, 1);
  } else {
    expandedApiBalances.value.push(index);
  }
}

// Check if API balance item is expanded
function isApiBalanceExpanded(index) {
  return expandedApiBalances.value.includes(index);
}

// Clear API balances table
function clearApiBalances() {
  apiBalances.value = [];
}

// Load saved balances from localStorage when component is mounted
onMounted(async () => {
  if (typeof window !== 'undefined' && localStorage.getItem('savedBalances')) {
    savedBalances.value = JSON.parse(localStorage.getItem('savedBalances'));
  }

  // Auto-load all API balances on page load
  await loadAllExchangesApis();
});

// Load all API balances for a specific exchange
async function loadAllApiBalances(exchange) {
  loading.value = true;
  console.log(`[${exchange.toUpperCase()}] Starting to load API balances...`);

  try {
    // Fetch all API keys for the exchange
    const apiKeysResponse = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: exchange
      }
    });

    console.log(`[${exchange.toUpperCase()}] API Keys Response:`, apiKeysResponse);

    if (apiKeysResponse.success && apiKeysResponse.data && apiKeysResponse.data.length > 0) {
      // Clear previous balances for this exchange
      const beforeCount = apiBalances.value.length;
      apiBalances.value = apiBalances.value.filter(b => b.exchange !== exchange);

      console.log(`[${exchange.toUpperCase()}] Found ${apiKeysResponse.data.length} API key(s)`);

      // Fetch balance for each API key separately
      for (const apiKey of apiKeysResponse.data) {
        try {
          console.log(`[${exchange.toUpperCase()}] Fetching balance for API key: ${apiKey.name}`);

          const balanceResponse = await $fetch('/api/v1/fetchBalance', {
            query: {
              userID: userID.value,
              exchange: exchange,
              apiKeyName: apiKey.name
            }
          });

          console.log(`[${exchange.toUpperCase()}] Balance Response for ${apiKey.name}:`, balanceResponse);

          if (balanceResponse.data) {
            const free = balanceResponse.data.free || {};
            const used = balanceResponse.data.used || {};
            const total = balanceResponse.data.total || {};

            console.log(`[${exchange.toUpperCase()}] Balance Data for ${apiKey.name}:`, { free, used, total });

            // Helper function to calculate used = total - free if used is not available
            const calculateUsed = (freeVal, totalVal, usedVal) => {
              const f = Number(freeVal || 0);
              const t = Number(totalVal || 0);
              const u = Number(usedVal || 0);

              // If used is not provided or is 0, calculate it from total - free
              if (u === 0 && t > 0) {
                return Math.max(0, t - f);
              }
              return u;
            };

            // Calculate LCX balances
            const lcxFree = Number(free.LCX || 0);
            const lcxTotal = Number(total.LCX || 0);
            const lcxUsed = calculateUsed(lcxFree, lcxTotal, used.LCX);

            // Calculate stablecoins for each type (free, used, total)
            const usdcFree = Number(free.USDC || 0) + Number(free.USD || 0) + Number(free.USDT || 0);
            const usdcTotal = Number(total.USDC || 0) + Number(total.USD || 0) + Number(total.USDT || 0);
            const usdcUsed = calculateUsed(usdcFree, usdcTotal,
              Number(used.USDC || 0) + Number(used.USD || 0) + Number(used.USDT || 0));

            // Calculate EUR balances
            const eurFree = Number(free.EUR || 0);
            const eurTotal = Number(total.EUR || 0);
            const eurUsed = calculateUsed(eurFree, eurTotal, used.EUR);

            const newIndex = apiBalances.value.length;
            apiBalances.value.push({
              exchange: exchange,
              apiKeyName: apiKey.name,
              // LCX balances
              lcxFree: lcxFree,
              lcxUsed: lcxUsed,
              lcxTotal: lcxTotal,
              // USDC/USD/USDT balances
              usdcFree: usdcFree,
              usdcUsed: usdcUsed,
              usdcTotal: usdcTotal,
              // EUR balances
              eurFree: eurFree,
              eurUsed: eurUsed,
              eurTotal: eurTotal
            });

            // Auto-expand newly added items
            if (!expandedApiBalances.value.includes(newIndex)) {
              expandedApiBalances.value.push(newIndex);
            }

            console.log(`[${exchange.toUpperCase()}] Added balance for ${apiKey.name}:`, {
              LCX: { free: free.LCX, used: used.LCX, total: total.LCX },
              USDC: { free: usdcFree, used: usdcUsed, total: usdcTotal },
              EUR: { free: free.EUR, used: used.EUR, total: total.EUR }
            });
          } else {
            console.warn(`[${exchange.toUpperCase()}] No balance data returned for ${apiKey.name}`);
          }
        } catch (error) {
          console.error(`[${exchange.toUpperCase()}] ERROR fetching balance for ${apiKey.name}:`, {
            error: error,
            message: error.message,
            statusCode: error.statusCode,
            data: error.data
          });
        }
      }
    } else {
      console.warn(`[${exchange.toUpperCase()}] No API keys found or request failed`);
    }
  } catch (error) {
    console.error(`[${exchange.toUpperCase()}] ERROR loading API keys:`, {
      error: error,
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    });
  } finally {
    loading.value = false;
    console.log(`[${exchange.toUpperCase()}] Finished loading API balances`);
  }
}

// Load all exchanges APIs
async function loadAllExchangesApis() {
  await loadAllApiBalances('coinbaseadvanced');
  await loadAllApiBalances('kraken');
  await loadAllApiBalances('bitrue');
  await loadAllApiBalances('lcx');
}

// Function to save balances
function saveBalances() {
  // Calculate totals per exchange from API balances
  const exchangeTotals = {
    coinbase: { lcx: 0, usdc: 0, apis: [] },
    kraken: { lcx: 0, usdc: 0, apis: [] },
    bitrue: { lcx: 0, usdc: 0, apis: [] },
    lcx: { lcx: 0, usdc: 0, apis: [] }
  };

  // Sum up all API keys per exchange and collect API details
  apiBalances.value.forEach(balance => {
    if (balance.exchange === 'coinbaseadvanced') {
      exchangeTotals.coinbase.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.coinbase.usdc += Number(balance.usdcTotal || 0);
      exchangeTotals.coinbase.apis.push({
        name: balance.apiKeyName,
        lcx: Number(balance.lcxTotal || 0),
        usdc: Number(balance.usdcTotal || 0)
      });
    } else if (balance.exchange === 'kraken') {
      exchangeTotals.kraken.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.kraken.usdc += Number(balance.usdcTotal || 0);
      exchangeTotals.kraken.apis.push({
        name: balance.apiKeyName,
        lcx: Number(balance.lcxTotal || 0),
        usdc: Number(balance.usdcTotal || 0)
      });
    } else if (balance.exchange === 'bitrue') {
      exchangeTotals.bitrue.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.bitrue.usdc += Number(balance.usdcTotal || 0);
      exchangeTotals.bitrue.apis.push({
        name: balance.apiKeyName,
        lcx: Number(balance.lcxTotal || 0),
        usdc: Number(balance.usdcTotal || 0)
      });
    } else if (balance.exchange === 'lcx') {
      exchangeTotals.lcx.lcx += Number(balance.lcxTotal || 0);
      exchangeTotals.lcx.usdc += Number(balance.usdcTotal || 0);
      exchangeTotals.lcx.apis.push({
        name: balance.apiKeyName,
        lcx: Number(balance.lcxTotal || 0),
        usdc: Number(balance.usdcTotal || 0)
      });
    }
  });

  // Get current LCX price
  const currentLcxPrice = parseFloat(lcxPrice.value) || 0.17;

  let currentBalances = {
    timestamp: new Date().toLocaleString(),
    lcxPriceAtSave: currentLcxPrice, // Save the price at this moment
    coinbase: exchangeTotals.coinbase.lcx,
    kraken: exchangeTotals.kraken.lcx,
    bitrue: exchangeTotals.bitrue.lcx,
    lcx: exchangeTotals.lcx.lcx,
    coinbaseUSDC: exchangeTotals.coinbase.usdc,
    krakenUSDC: exchangeTotals.kraken.usdc,
    bitrueUSDC: exchangeTotals.bitrue.usdc,
    lcxUSDC: exchangeTotals.lcx.usdc,
    // Store API details
    apiDetails: {
      coinbase: exchangeTotals.coinbase.apis,
      kraken: exchangeTotals.kraken.apis,
      bitrue: exchangeTotals.bitrue.apis,
      lcx: exchangeTotals.lcx.apis
    }
  };

  savedBalances.value.push(currentBalances);
  if (typeof window !== 'undefined') {
    localStorage.setItem('savedBalances', JSON.stringify(savedBalances.value));
  }

  console.log('✅ Saved balances:', currentBalances);
}

// Function to clear all balances
function clearAllBalances() {
  savedBalances.value = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem('savedBalances');
  }
  resetBalances();
}

// Function to reset balances to zero
function resetBalances() {
  coinbaseBalance.value = "";
  krakenBalance.value = "";
  bitrueBalance.value = "";
  lcxBalance.value = "";

  coinbaseUSDC.value = "";
  krakenUSDC.value = "";
  bitrueUSDC.value = "";
  lcxUSDC.value = "";
}

// Function to delete a specific saved balance
function deleteBalance(index) {
  savedBalances.value.splice(index, 1);
  if (typeof window !== 'undefined') {
    localStorage.setItem('savedBalances', JSON.stringify(savedBalances.value));
  }
}

// Function to copy a saved balance to input fields for editing
function copyBalanceToInputs(balance) {
  coinbaseBalance.value = balance.coinbase || "";
  krakenBalance.value = balance.kraken || "";
  bitrueBalance.value = balance.bitrue || "";
  lcxBalance.value = balance.lcx || "";

  coinbaseUSDC.value = balance.coinbaseUSDC || "";
  krakenUSDC.value = balance.krakenUSDC || "";
  bitrueUSDC.value = balance.bitrueUSDC || "";
  lcxUSDC.value = balance.lcxUSDC || "";
}

// Calculate the total LCX and USDC balances for the current input
let totalLCXBalance = ref(0);
let totalUSDCBalance = ref(0);

watch(
  [coinbaseBalance, krakenBalance, bitrueBalance, lcxBalance, coinbaseUSDC, krakenUSDC, bitrueUSDC, lcxUSDC],
  () => {
    totalLCXBalance.value =
      parseFloat(coinbaseBalance.value) +
      parseFloat(krakenBalance.value) +
      parseFloat(bitrueBalance.value) +
      parseFloat(lcxBalance.value);

    totalUSDCBalance.value =
      parseFloat(coinbaseUSDC.value) +
      parseFloat(krakenUSDC.value) +
      parseFloat(bitrueUSDC.value) +
      parseFloat(lcxUSDC.value);
  }
);

// Calculate totals for each saved balance
function calculateTotalLCX(balance) {
  return (
    (balance.coinbase || 0) +
    (balance.kraken || 0) +
    (balance.bitrue || 0) +
    (balance.lcx || 0)
  );
}

function calculateTotalUSDC(balance) {
  return (
    (balance.coinbaseUSDC || 0) +
    (balance.krakenUSDC || 0) +
    (balance.bitrueUSDC || 0) +
    (balance.lcxUSDC || 0)
  );
}

// Calculate the possible LCX and USDC based on LCX price
function calculatePosibleLCX(balance) {
  const price = parseFloat(lcxPrice.value) || 0.17;
  return calculateTotalUSDC(balance) / price;
}

function calculatePosibleUSDC(balance) {
  const price = parseFloat(lcxPrice.value) || 0.17;
  return calculateTotalLCX(balance) * price;
}

// Calculate the difference between current and previous (în ordine cronologică)
function calculateDifferenceLCX(index) {
  // Primul element (cel mai vechi) nu are diferență
  if (index === 0) return 0;
  const currentTotal = calculateTotalLCX(savedBalances.value[index]);
  const previousTotal = calculateTotalLCX(savedBalances.value[index - 1]);
  return currentTotal - previousTotal;
}

function calculateDifferenceUSDC(index) {
  // Primul element (cel mai vechi) nu are diferență
  if (index === 0) return 0;
  const currentTotal = calculateTotalUSDC(savedBalances.value[index]);
  const previousTotal = calculateTotalUSDC(savedBalances.value[index - 1]);
  return currentTotal - previousTotal;
}

// Calculate the difference for possible LCX and USDC based on priceLCX
function calculateDifferencePosibleLCX(index) {
  if (index === 0 || !lcxPrice.value) return 0;
  const price = parseFloat(lcxPrice.value) || 0.17;
  const differenceUSDC = calculateDifferenceUSDC(index);

  return parseFloat(differenceUSDC) / price;
}

function calculateDifferencePosibleUSDC(index) {
  if (index === 0 || !lcxPrice.value) return 0;
  const price = parseFloat(lcxPrice.value) || 0.17;
  const differenceLCX = calculateDifferenceLCX(index);

  return parseFloat(differenceLCX) * price;
}


// Calculate the combined difference of possible LCX and actual LCX/USDC
function calculateDifferencePosibleLCXUSDC(index) {
  return calculateDifferencePosibleLCX(index) + calculateDifferenceLCX(index);
}
// Calculate the combined LCXv2 for a specific index
function calculateLCXv2(index) {
  return calculateDifferencePosibleLCX(index) + calculateTotalLCX(savedBalances.value[index]);
}

function calculateT2LCX(balance) {
  return calculatePosibleLCX(balance) + calculateTotalLCX(balance);
}

// Calculate total USD value (LCX converted to USD + USDC)
function calculateTotalUSDValue(balance) {
  const lcxValue = calculateTotalLCX(balance) * (balance.lcxPriceAtSave || parseFloat(lcxPrice.value) || 0.17);
  const usdcValue = calculateTotalUSDC(balance);
  return lcxValue + usdcValue;
}

// Calculate difference in total USD value
function calculateDifferenceTotalUSDValue(index) {
  // Primul element (cel mai vechi) nu are diferență
  if (index === 0) return 0;
  const currentValue = calculateTotalUSDValue(savedBalances.value[index]);
  const previousValue = calculateTotalUSDValue(savedBalances.value[index - 1]);
  return currentValue - previousValue;
}

// Get API balance from previous save by name and exchange
function getPreviousApiBalance(index, exchange, apiName) {
  // Primul element (cel mai vechi) nu are cu cine să compare
  if (index === 0) return null;

  const previousBalance = savedBalances.value[index - 1];
  if (!previousBalance.apiDetails || !previousBalance.apiDetails[exchange]) return null;

  const apiData = previousBalance.apiDetails[exchange].find(api => api.name === apiName);
  return apiData || null;
}

// Calculate difference for individual API LCX (current - previous)
function calculateApiDifferenceLCX(index, exchange, currentApi) {
  console.log(`🔍 calculateApiDifferenceLCX called:`, {
    index,
    exchange,
    apiName: currentApi.name,
    currentLCX: currentApi.lcx,
    currentFullApi: currentApi
  });
  const previousApi = getPreviousApiBalance(index, exchange, currentApi.name);
  console.log(`🔍 previousApi found:`, {
    previousLCX: previousApi?.lcx,
    previousFullApi: previousApi
  });
  if (!previousApi) return 0;
  const diff = currentApi.lcx - previousApi.lcx;
  console.log(`🔍 DIFF: ${currentApi.name} - current: ${currentApi.lcx}, previous: ${previousApi.lcx}, diff: ${diff}`);
  return diff;
}

// Calculate difference for individual API USDC (current - previous)
function calculateApiDifferenceUSDC(index, exchange, currentApi) {
  const previousApi = getPreviousApiBalance(index, exchange, currentApi.name);
  if (!previousApi) return 0;
  return currentApi.usdc - previousApi.usdc;
}

</script>

<style scoped>
.balance-save-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  padding: 20px;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.08), rgba(5, 245, 237, 0.08));
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 24px;
  border: 1px solid rgba(16, 235, 4, 0.2);
  box-shadow: 0 4px 15px rgba(16, 235, 4, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(16, 235, 4, 0.3);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.lcx-price-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(16, 235, 4, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  min-width: 140px;
  transition: all 0.3s ease;
}

.lcx-price-display:hover {
  border-color: rgba(16, 235, 4, 0.6);
  box-shadow: 0 0 15px rgba(16, 235, 4, 0.3);
}

.price-label {
  font-size: 10px;
  font-weight: 800;
  color: #ff0000;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.price-value {
  font-size: 16px;
  font-weight: 800;
  color: #10eb04;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(16, 235, 4, 0.5);
}

/* ===== CONTENT GRID ===== */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* ===== LEFT SECTION ===== */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.exchange-buttons-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(16, 235, 4, 0.2);
}

.exchange-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.exchange-btn {
  height: 60px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.exchange-btn .btn-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 50%;
  background: white;
  padding: 2px;
}

.coinbase-btn {
  background: linear-gradient(135deg, #0052FF, #003DD1);
}

.kraken-btn {
  background: linear-gradient(135deg, #5741D9, #3E2E9E);
}

.bitrue-btn {
  background: linear-gradient(135deg, #FF6B35, #D94A1C);
}

.lcx-btn {
  background: linear-gradient(135deg, #10eb04, #05f5ed);
}

.exchange-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 235, 4, 0.3);
}

/* ===== CURRENT BALANCES ===== */
.current-balances-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(16, 235, 4, 0.2);
}

.api-balances-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.api-balance-item {
  background: rgba(3, 57, 8, 0.3);
  border: 1px solid rgba(16, 235, 4, 0.15);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
}

.api-balance-item:hover {
  border-color: rgba(16, 235, 4, 0.4);
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(16, 235, 4, 0.15);
}

.api-balance-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon-api {
  font-size: 12px;
  color: #10eb04;
  transition: transform 0.2s ease;
  user-select: none;
  flex-shrink: 0;
}

.exchange-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.exchange-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
  background: white;
  padding: 4px;
}

.exchange-details {
  display: flex;
  flex-direction: column;
}

.exchange-name {
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
}

.api-key-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.balance-column {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.column-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.lcx-column .column-header {
  color: #f0e21b;
}

.usdc-column .column-header {
  color: #60a7da;
}

.eur-column .column-header {
  color: #50e3c2;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 11px;
}

.balance-row .label {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.balance-row .value {
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.lcx-value {
  color: #f0e21b;
}

.lcx-value-used {
  color: rgba(240, 226, 27, 0.6);
}

.lcx-value-total {
  color: #f0e21b;
  font-size: 12px;
}

.usdc-value {
  color: #60a7da;
}

.usdc-value-used {
  color: rgba(96, 167, 218, 0.6);
}

.usdc-value-total {
  color: #60a7da;
  font-size: 12px;
}

.eur-value {
  color: #50e3c2;
}

.eur-value-used {
  color: rgba(80, 227, 194, 0.6);
}

.eur-value-total {
  color: #50e3c2;
  font-size: 12px;
}

.total-row {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  margin-top: 4px;
}

/* ===== TOTALS SUMMARY ===== */
.totals-summary {
  margin-top: 20px;
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.05), rgba(5, 245, 237, 0.05));
  border-radius: 10px;
  padding: 16px;
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.totals-header {
  font-size: 16px;
  font-weight: 800;
  color: #10eb04;
  margin-bottom: 12px;
  text-align: center;
  text-shadow: 0 0 10px rgba(16, 235, 4, 0.5);
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.total-card {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 12px;
  border: 2px solid;
}

.lcx-total-card {
  border-color: #f0e21b;
}

.usdc-total-card {
  border-color: #60a7da;
}

.eur-total-card {
  border-color: #50e3c2;
}

.total-label {
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.lcx-total-card .total-label {
  color: #f0e21b;
}

.usdc-total-card .total-label {
  color: #60a7da;
}

.eur-total-card .total-label {
  color: #50e3c2;
}

.total-values {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.total-item .label {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.total-item .value {
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #fff;
}

.total-item.main-total {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 6px;
  margin-top: 4px;
}

.total-item.main-total .value {
  font-size: 13px;
  color: #10eb04;
  text-shadow: 0 0 5px rgba(16, 235, 4, 0.5);
}

.total-item.usd-value-item {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 6px;
  margin-top: 4px;
}

.usd-highlight {
  color: #10eb04 !important;
  font-size: 12px !important;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.6);
  font-weight: 800 !important;
}

/* ===== EMPTY STATES ===== */
.empty-state-card {
  background: rgba(13, 1, 77, 0.4);
  border: 1px dashed rgba(16, 235, 4, 0.3);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 10px;
}

.empty-state p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* ===== RIGHT SECTION - HISTORY ===== */
.right-section {
  display: flex;
  flex-direction: column;
}

.history-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(5, 245, 237, 0.2);
  height: 100%;
}

.history-count {
  font-size: 12px;
  color: #05f5ed;
  background: rgba(5, 245, 237, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 8px;
}

.history-item {
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.05), rgba(16, 235, 4, 0.05));
  border: 1px solid rgba(5, 245, 237, 0.2);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: rgba(5, 245, 237, 0.5);
  box-shadow: 0 6px 20px rgba(5, 245, 237, 0.15);
  transform: translateY(-2px);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.timestamp-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  font-size: 12px;
  color: #05f5ed;
  transition: transform 0.2s ease;
  user-select: none;
}

.snapshot-number {
  font-size: 18px;
  font-weight: 800;
  color: #05f5ed;
  background: rgba(5, 245, 237, 0.15);
  padding: 4px 12px;
  border-radius: 6px;
}

.timestamp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timestamp {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
}

.saved-price {
  font-size: 11px;
  color: #10eb04;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.history-actions {
  display: flex;
  gap: 6px;
}

/* ===== HEADER DIFFERENCES ===== */
.header-differences {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-diff-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-diff-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.header-diff-value {
  font-size: 12px;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.header-diff-value.positive {
  color: #10eb04;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.5);
}

.header-diff-value.negative {
  color: #ff4d4d;
  text-shadow: 0 0 8px rgba(255, 77, 77, 0.5);
}

/* ===== EXCHANGE BALANCES ROW ===== */
.exchange-balances-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.mini-balance-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  border: 1px solid;
}

.coinbase-card {
  border-color: rgba(0, 82, 255, 0.5);
  background: linear-gradient(135deg, rgba(0, 82, 255, 0.1), transparent);
}

.kraken-card {
  border-color: rgba(87, 65, 217, 0.5);
  background: linear-gradient(135deg, rgba(87, 65, 217, 0.1), transparent);
}

.bitrue-card {
  border-color: rgba(255, 107, 53, 0.5);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), transparent);
}

.lcx-card {
  border-color: rgba(16, 235, 4, 0.5);
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), transparent);
}

.mini-exchange {
  font-size: 14px;
  font-weight: 800;
  color: #05f5ed;
  display: block;
  margin-bottom: 6px;
}

.mini-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-lcx {
  font-size: 11px;
  color: #f0e21b;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.mini-usd-value {
  font-size: 10px;
  color: #10eb04;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.mini-usdc {
  font-size: 11px;
  color: #60a7da;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* ===== API DETAILS ===== */
.api-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.api-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.api-detail-item:hover {
  background: rgba(0, 0, 0, 0.4);
}

.api-name {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.api-values {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.api-lcx {
  font-size: 9px;
  color: #f0e21b;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.api-usd-value {
  font-size: 9px;
  color: #10eb04;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.api-usdc {
  font-size: 9px;
  color: #60a7da;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.api-diff {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.api-diff-item {
  font-size: 8px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.api-diff-item.positive {
  color: #10eb04;
}

.api-diff-item.negative {
  color: #ff4d4d;
}

/* ===== CALCULATED SECTION ===== */
.calculated-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.calc-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 8px;
}

.calc-row:last-child {
  margin-bottom: 0;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid;
}

.highlight-cyan {
  border-color: rgba(5, 237, 218, 0.5);
  background: rgba(5, 237, 218, 0.05);
}

.highlight-blue {
  border-color: rgba(96, 167, 218, 0.5);
  background: rgba(96, 167, 218, 0.05);
}

.highlight-red {
  border-color: rgba(230, 5, 5, 0.5);
  background: rgba(230, 5, 5, 0.05);
}

.highlight-green {
  border-color: rgba(108, 238, 9, 0.5);
  background: rgba(108, 238, 9, 0.05);
}

.highlight-purple {
  border-color: rgba(4, 232, 244, 0.5);
  background: rgba(4, 232, 244, 0.05);
}

.highlight-orange {
  border-color: rgba(245, 166, 35, 0.5);
  background: rgba(245, 166, 35, 0.05);
}

.calc-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.calc-value {
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #fff;
}

.highlight-cyan .calc-value {
  color: #05edd9;
}

.highlight-blue .calc-value {
  color: #60a7da;
}

.highlight-red .calc-value {
  color: #e60505;
}

.highlight-green .calc-value {
  color: #6cee09;
}

.highlight-purple .calc-value {
  color: #04e8f4;
}

.highlight-orange .calc-value {
  color: #f5a623;
}

/* ===== DIFFERENCES SECTION ===== */
.differences-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.diff-header {
  font-size: 12px;
  font-weight: 700;
  color: #05f5ed;
  margin-bottom: 10px;
  text-align: center;
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.diff-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.diff-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.diff-value {
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.diff-value.positive {
  color: #10eb04;
}

.diff-value.negative {
  color: #ff4d4d;
}

/* ===== API DIFF BREAKDOWN ===== */
.api-diff-breakdown {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.api-diff-breakdown-header {
  font-size: 11px;
  font-weight: 700;
  color: #05f5ed;
  margin-bottom: 8px;
  text-align: center;
}

.api-diff-breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.api-diff-breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.api-diff-breakdown-item:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(16, 235, 4, 0.2);
}

.api-diff-breakdown-name {
  font-size: 10px;
  font-weight: 700;
  color: #f5a623;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.api-diff-breakdown-values {
  display: flex;
  align-items: center;
  gap: 6px;
}

.api-diff-breakdown-value {
  font-size: 9px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.api-diff-breakdown-value.positive {
  color: #10eb04;
}

.api-diff-breakdown-value.negative {
  color: #ff4d4d;
}

.api-diff-breakdown-separator {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
}

/* ===== EMPTY HISTORY ===== */
.empty-history {
  text-align: center;
  padding: 80px 20px;
}

.empty-history-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.4;
}

.empty-history h3 {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 10px;
}

.empty-history p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* ===== SCROLLBAR STYLING ===== */
.api-balances-list::-webkit-scrollbar,
.history-list::-webkit-scrollbar {
  width: 6px;
}

.api-balances-list::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.api-balances-list::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb {
  background: rgba(16, 235, 4, 0.3);
  border-radius: 3px;
}

.api-balances-list::-webkit-scrollbar-thumb:hover,
.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 235, 4, 0.5);
}
</style>
