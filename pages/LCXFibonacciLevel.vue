<template>
  <div class="fibonacci-page">
    <!-- Header -->
    <!-- <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">📊 LCX Fibonacci Levels & BTC Conversion</h1>
          <p class="page-subtitle">Technical analysis with Fibonacci retracement and BTC/LCX conversion calculator</p>
        </div>
        <div class="header-actions">
          <div class="current-price-display">
            <span class="price-label">🔴 LIVE LCX PRICE</span>
            <span class="price-value">${{ currentPrice }}</span>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Tabs -->
    <n-tabs type="segment" animated class="main-tabs">
      <n-tab-pane name="btc-conversion" tab="₿ BTC vs LCX">
        <div class="tab-content">
          <div class="btc-tabs-grid">
            <!-- Left Table: LCX to BTC Conversion -->
            <n-card class="btc-table-card" title="💰 LCX → BTC Value">
              <template #header-extra>
                <div class="btc-price-display">
                  <span class="live-indicator">🔴 LIVE</span>
                  <span class="input-label">BTC:</span>
                  <div class="btc-price-value-box">
                    <span class="btc-currency-symbol">$</span>
                    <span class="btc-price-value">{{ parseFloat(btcPrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</span>
                  </div>
                </div>
              </template>

              <div class="info-display">
                <div class="info-box">
                  <span class="info-label">1 BTC =</span>
                  <span class="info-value">{{ lcxPerBtc.toLocaleString('en-US', {maximumFractionDigits: 0}) }} LCX</span>
                </div>
                <div class="info-box">
                  <span class="info-label">1 LCX =</span>
                  <span class="info-value">₿ {{ (1 / lcxPerBtc).toFixed(8) }}</span>
                </div>
                <div class="info-box">
                  <span class="info-label">LCX Price:</span>
                  <span class="info-value">${{ currentPrice }}</span>
                </div>
              </div>

              <div class="table-wrapper">
                <table class="btc-table">
                  <thead>
                    <tr>
                      <th>LCX Amount</th>
                      <th>USD Value</th>
                      <th>BTC Value</th>
                      <th>% of 1 BTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in lcxToBtcRows" :key="row.lcx" :class="row.highlight ? 'highlight-row' : ''">
                      <td class="lcx-col">{{ row.lcx.toLocaleString('en-US') }}</td>
                      <td class="usd-col">${{ row.usd.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                      <td class="btc-col">₿ {{ row.btc.toFixed(8) }}</td>
                      <td class="pct-col">{{ row.percent.toFixed(2) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </n-card>

            <!-- Right Table: LCX Price Scenarios in BTC -->
            <n-card class="btc-table-card" title="₿ LCX Price Scenarios">
              <template #header-extra>
                <div class="info-badge">
                  <span>BTC @ ${{ parseFloat(btcPrice).toLocaleString('en-US') }}</span>
                </div>
              </template>

              <div class="info-display">
                <div class="info-box">
                  <span class="info-label">Current 1 LCX =</span>
                  <span class="info-value">₿ {{ (1 / lcxPerBtc).toFixed(8) }}</span>
                </div>
                <div class="info-box">
                  <span class="info-label">Current USD:</span>
                  <span class="info-value">${{ currentPrice }}</span>
                </div>
                <div class="info-box current-level-box" :class="currentLevelInfo.class">
                  <span class="info-label">Current Level:</span>
                  <div class="current-level-badge">
                    <span class="level-emoji">{{ currentLevelInfo.info.emoji }}</span>
                    <span class="level-name">{{ currentLevelInfo.info.name }}</span>
                    <span class="level-desc">{{ currentLevelInfo.info.desc }}</span>
                  </div>
                </div>
              </div>

              <!-- Legend -->
              <div class="btc-range-legend">
                <div class="legend-title">📊 Price Ranges (click to scroll):</div>

                <!-- BUY Levels -->
                <div class="legend-section">
                  <div class="legend-section-title">🟢 BUY ZONES</div>
                  <div class="legend-items">
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-atl')">
                      <div class="legend-color btc-range-atl"></div>
                      <span class="legend-label">ATL</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level1-buy')">
                      <div class="legend-color btc-range-level1-buy"></div>
                      <span class="legend-label">L1</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level2-buy')">
                      <div class="legend-color btc-range-level2-buy"></div>
                      <span class="legend-label">L2</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level3-buy')">
                      <div class="legend-color btc-range-level3-buy"></div>
                      <span class="legend-label">L3</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level4-buy')">
                      <div class="legend-color btc-range-level4-buy"></div>
                      <span class="legend-label">L4</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level5-buy')">
                      <div class="legend-color btc-range-level5-buy"></div>
                      <span class="legend-label">L5</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level6-buy')">
                      <div class="legend-color btc-range-level6-buy"></div>
                      <span class="legend-label">L6</span>
                    </div>
                  </div>
                </div>

                <!-- NEUTRAL Levels -->
                <div class="legend-section">
                  <div class="legend-section-title">🟡 NEUTRAL ZONES</div>
                  <div class="legend-items">
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level7-neutral')">
                      <div class="legend-color btc-range-level7-neutral"></div>
                      <span class="legend-label">L7</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level8-neutral')">
                      <div class="legend-color btc-range-level8-neutral"></div>
                      <span class="legend-label">L8</span>
                    </div>
                  </div>
                </div>

                <!-- SELL Levels -->
                <div class="legend-section">
                  <div class="legend-section-title">🔴 SELL ZONES</div>
                  <div class="legend-items">
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level9-sell-start')">
                      <div class="legend-color btc-range-level9-sell-start"></div>
                      <span class="legend-label">L9</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level10-sell')">
                      <div class="legend-color btc-range-level10-sell"></div>
                      <span class="legend-label">L10</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level11-sell')">
                      <div class="legend-color btc-range-level11-sell"></div>
                      <span class="legend-label">L11</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level12-sell')">
                      <div class="legend-color btc-range-level12-sell"></div>
                      <span class="legend-label">L12</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level13-sell-medium')">
                      <div class="legend-color btc-range-level13-sell-medium"></div>
                      <span class="legend-label">L13</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level14-sell-medium')">
                      <div class="legend-color btc-range-level14-sell-medium"></div>
                      <span class="legend-label">L14</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level15-sell-medium')">
                      <div class="legend-color btc-range-level15-sell-medium"></div>
                      <span class="legend-label">L15</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level16-sell-strong')">
                      <div class="legend-color btc-range-level16-sell-strong"></div>
                      <span class="legend-label">L16</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level17-sell-strong')">
                      <div class="legend-color btc-range-level17-sell-strong"></div>
                      <span class="legend-label">L17</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level18-sell-vstrong')">
                      <div class="legend-color btc-range-level18-sell-vstrong"></div>
                      <span class="legend-label">L18</span>
                    </div>
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-level19-pre-ath')">
                      <div class="legend-color btc-range-level19-pre-ath"></div>
                      <span class="legend-label">L19</span>
                    </div>
                  </div>
                </div>

                <!-- ATH -->
                <div class="legend-section">
                  <div class="legend-section-title">🔥 ATH ZONE</div>
                  <div class="legend-items">
                    <div class="legend-item clickable" @click="scrollToRange('btc-range-ath')">
                      <div class="legend-color btc-range-ath"></div>
                      <span class="legend-label">ATH</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Visual Range Chart -->
              <div class="range-chart">
                <div class="range-chart-title">📊 Visual Price Range Spectrum</div>
                <div class="range-chart-bar">
                  <div class="range-segment btc-range-atl" @click="scrollToRange('btc-range-atl')" title="ATL">
                    <span class="range-segment-label">ATL</span>
                  </div>
                  <div class="range-segment btc-range-level1-buy" @click="scrollToRange('btc-range-level1-buy')" title="L1">
                    <span class="range-segment-label">L1</span>
                  </div>
                  <div class="range-segment btc-range-level2-buy" @click="scrollToRange('btc-range-level2-buy')" title="L2">
                    <span class="range-segment-label">L2</span>
                  </div>
                  <div class="range-segment btc-range-level3-buy" @click="scrollToRange('btc-range-level3-buy')" title="L3">
                    <span class="range-segment-label">L3</span>
                  </div>
                  <div class="range-segment btc-range-level4-buy" @click="scrollToRange('btc-range-level4-buy')" title="L4">
                    <span class="range-segment-label">L4</span>
                  </div>
                  <div class="range-segment btc-range-level5-buy" @click="scrollToRange('btc-range-level5-buy')" title="L5">
                    <span class="range-segment-label">L5</span>
                  </div>
                  <div class="range-segment btc-range-level6-buy" @click="scrollToRange('btc-range-level6-buy')" title="L6">
                    <span class="range-segment-label">L6</span>
                  </div>
                  <div class="range-segment btc-range-level7-neutral" @click="scrollToRange('btc-range-level7-neutral')" title="L7">
                    <span class="range-segment-label">L7</span>
                  </div>
                  <div class="range-segment btc-range-level8-neutral" @click="scrollToRange('btc-range-level8-neutral')" title="L8">
                    <span class="range-segment-label">L8</span>
                  </div>
                  <div class="range-segment btc-range-level9-sell-start" @click="scrollToRange('btc-range-level9-sell-start')" title="L9">
                    <span class="range-segment-label">L9</span>
                  </div>
                  <div class="range-segment btc-range-level10-sell" @click="scrollToRange('btc-range-level10-sell')" title="L10">
                    <span class="range-segment-label">L10</span>
                  </div>
                  <div class="range-segment btc-range-level11-sell" @click="scrollToRange('btc-range-level11-sell')" title="L11">
                    <span class="range-segment-label">L11</span>
                  </div>
                  <div class="range-segment btc-range-level12-sell" @click="scrollToRange('btc-range-level12-sell')" title="L12">
                    <span class="range-segment-label">L12</span>
                  </div>
                  <div class="range-segment btc-range-level13-sell-medium" @click="scrollToRange('btc-range-level13-sell-medium')" title="L13">
                    <span class="range-segment-label">L13</span>
                  </div>
                  <div class="range-segment btc-range-level14-sell-medium" @click="scrollToRange('btc-range-level14-sell-medium')" title="L14">
                    <span class="range-segment-label">L14</span>
                  </div>
                  <div class="range-segment btc-range-level15-sell-medium" @click="scrollToRange('btc-range-level15-sell-medium')" title="L15">
                    <span class="range-segment-label">L15</span>
                  </div>
                  <div class="range-segment btc-range-level16-sell-strong" @click="scrollToRange('btc-range-level16-sell-strong')" title="L16">
                    <span class="range-segment-label">L16</span>
                  </div>
                  <div class="range-segment btc-range-level17-sell-strong" @click="scrollToRange('btc-range-level17-sell-strong')" title="L17">
                    <span class="range-segment-label">L17</span>
                  </div>
                  <div class="range-segment btc-range-level18-sell-vstrong" @click="scrollToRange('btc-range-level18-sell-vstrong')" title="L18">
                    <span class="range-segment-label">L18</span>
                  </div>
                  <div class="range-segment btc-range-level19-pre-ath" @click="scrollToRange('btc-range-level19-pre-ath')" title="L19">
                    <span class="range-segment-label">L19</span>
                  </div>
                  <div class="range-segment btc-range-ath" @click="scrollToRange('btc-range-ath')" title="ATH">
                    <span class="range-segment-label">ATH</span>
                  </div>
                </div>
              </div>

              <div class="table-wrapper">
                <table class="btc-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>BTC</th>
                      <th>USD</th>
                      <th>LCX</th>
                      <th>Multiplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in enrichedBtcLevels" :key="row.index" :class="getBtcPriceRangeClass(row.btcRaw)">
                      <td class="index-col">{{ row.index }}</td>
                      <td class="btc-col">₿ {{ parseFloat(row.btc).toFixed(10) }}</td>
                      <td class="usd-col">${{ row.usd }}</td>
                      <td class="lcx-col">{{ parseFloat(row.lcx).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                      <td class="multiplier-col">{{ row.multiplier }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </n-card>
          </div>

          <!-- Pyramid Section -->
          <div style="margin-top: 30px; width: 100%;">
            <LCXToBTCPyramid
              :btc-price="btcPrice"
              :current-price="currentPrice"
            />
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="visual-charts" tab="📊 Visual Charts">
        <VisualChartsSpectrum
          :current-price="currentPrice"
          :btc-price="btcPrice"
          :current-level-class="currentLevelInfo.class"
          :current-level-emoji="currentLevelInfo.info.emoji"
          :current-level-name="currentLevelInfo.info.name"
        />
      </n-tab-pane>

      <n-tab-pane name="pyramid" tab="🔺 LCX to BTC Pyramid">
        <LCXToBTCPyramid
          :btc-price="btcPrice"
          :current-price="currentPrice"
        />
      </n-tab-pane>

      <n-tab-pane name="fibonacci" tab="📈 Fibonacci Levels">
        <div class="tab-content">

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Section: ATH Fibonacci -->
      <div class="fib-section">
        <n-card class="fib-card ath-card" title="🚀 Fibonacci: 0.01 → ATH ($0.7654)">
          <template #header-extra>
            <span class="range-label">Uptrend Analysis</span>
          </template>

          <div class="fib-info">
            <div class="info-row">
              <span class="info-label">Start (0%):</span>
              <span class="info-value">$0.0100</span>
            </div>
            <div class="info-row">
              <span class="info-label">ATH (100%):</span>
              <span class="info-value">$0.7654</span>
            </div>
            <div class="info-row">
              <span class="info-label">Range:</span>
              <span class="info-value">${{ (athHigh - athLow).toFixed(4) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Position:</span>
              <span class="info-value position-highlight">{{ currentPositionATH.toFixed(2) }}%</span>
            </div>
          </div>

          <!-- Fibonacci Levels ATH -->
          <div class="fib-levels">
            <div
              v-for="level in fibLevelsATH"
              :key="level.ratio"
              class="fib-level-item"
              :class="[level.zone, { 'current-level': isCurrentLevel(level.price) }]"
            >
              <div class="level-header">
                <span class="level-ratio">{{ level.label }}</span>
                <span class="level-price">${{ level.price.toFixed(4) }}</span>
              </div>
              <div class="level-bar">
                <div class="level-fill" :style="{ width: level.ratio + '%' }"></div>
                <div v-if="isCurrentLevel(level.price)" class="current-marker">📍</div>
              </div>
              <div class="level-zone-label">{{ level.zoneLabel }}</div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Right Section: Target $1-2 Fibonacci -->
      <div class="fib-section">
        <n-card class="fib-card target-card" title="🎯 Fibonacci: 0.01 → Target ($1-2)">
          <template #header-extra>
            <div class="target-selector">
              <n-button
                size="small"
                :type="targetPrice === 1 ? 'success' : 'default'"
                @click="targetPrice = 1"
              >
                $1.00
              </n-button>
              <n-button
                size="small"
                :type="targetPrice === 1.5 ? 'success' : 'default'"
                @click="targetPrice = 1.5"
              >
                $1.50
              </n-button>
              <n-button
                size="small"
                :type="targetPrice === 2 ? 'success' : 'default'"
                @click="targetPrice = 2"
              >
                $2.00
              </n-button>
            </div>
          </template>

          <div class="fib-info">
            <div class="info-row">
              <span class="info-label">Start (0%):</span>
              <span class="info-value">$0.0100</span>
            </div>
            <div class="info-row">
              <span class="info-label">Target (100%):</span>
              <span class="info-value target-highlight">${{ targetPrice.toFixed(2) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Range:</span>
              <span class="info-value">${{ (targetPrice - targetLow).toFixed(4) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Position:</span>
              <span class="info-value position-highlight">{{ currentPositionTarget.toFixed(2) }}%</span>
            </div>
          </div>

          <!-- Fibonacci Levels Target -->
          <div class="fib-levels">
            <div
              v-for="level in fibLevelsTarget"
              :key="level.ratio"
              class="fib-level-item"
              :class="[level.zone, { 'current-level': isCurrentLevel(level.price) }]"
            >
              <div class="level-header">
                <span class="level-ratio">{{ level.label }}</span>
                <span class="level-price">${{ level.price.toFixed(4) }}</span>
              </div>
              <div class="level-bar">
                <div class="level-fill" :style="{ width: level.ratio + '%' }"></div>
                <div v-if="isCurrentLevel(level.price)" class="current-marker">📍</div>
              </div>
              <div class="level-zone-label">{{ level.zoneLabel }}</div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- Bottom Section: Extended Fibonacci Levels -->
    <div class="extended-section">
      <n-card class="extended-card" title="🌟 Extended Fibonacci Levels (Beyond 100%)">
        <div class="extended-grid">
          <div v-for="level in extendedLevels" :key="level.ratio" class="extended-item">
            <div class="extended-header">
              <span class="extended-label">{{ level.label }}</span>
              <span class="extended-ratio">{{ level.ratio }}%</span>
            </div>
            <div class="extended-prices">
              <div class="extended-price-item">
                <span class="extended-price-label">From ATH:</span>
                <span class="extended-price-value">${{ level.priceATH.toFixed(4) }}</span>
              </div>
              <div class="extended-price-item">
                <span class="extended-price-label">From Target (${{ targetPrice }}):</span>
                <span class="extended-price-value target-color">${{ level.priceTarget.toFixed(4) }}</span>
              </div>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Golden Ratio Analysis -->
    <div class="golden-section">
      <n-card class="golden-card" title="✨ Golden Ratio Analysis">
        <div class="golden-grid">
          <div class="golden-item buy-zone">
            <div class="golden-icon">💚</div>
            <h3>Strong BUY Zones</h3>
            <div class="golden-levels">
              <div class="golden-level">38.2% - 50.0%: Ideal accumulation</div>
              <div class="golden-level">23.6% - 38.2%: Deep value zone</div>
              <div class="golden-level">0% - 23.6%: Maximum opportunity</div>
            </div>
          </div>
          <div class="golden-item neutral-zone">
            <div class="golden-icon">💛</div>
            <h3>Golden Pocket (HOLD)</h3>
            <div class="golden-levels">
              <div class="golden-level golden-highlight">61.8%: Golden Ratio</div>
              <div class="golden-level">50.0% - 61.8%: Neutral zone</div>
            </div>
          </div>
          <div class="golden-item sell-zone">
            <div class="golden-icon">❤️</div>
            <h3>SELL/Take Profit Zones</h3>
            <div class="golden-levels">
              <div class="golden-level">78.6% - 100%: Profit taking</div>
              <div class="golden-level">100% - 161.8%: Extended targets</div>
              <div class="golden-level">161.8%+: Moon targets</div>
            </div>
          </div>
        </div>
      </n-card>
    </div>

        </div>
      </n-tab-pane>

      <n-tab-pane name="about" tab="ℹ️ About">
        <div class="tab-content about-content">
          <h2>About LCX Fibonacci Levels & BTC Conversion Tool</h2>
          <p>This tool provides a comprehensive analysis of LCX price levels using Fibonacci retracement techniques, along with a detailed BTC to LCX conversion calculator. It is designed to help traders and investors make informed decisions based on historical price movements and potential future scenarios.</p>
          <h3>Features:</h3>
          <ul>
            <li>Live LCX and BTC price tracking</li>
            <li>Detailed LCX to BTC conversion tables</li>
            <li>Fibonacci retracement levels from ATL to ATH and target prices</li>
            <li>Visual charts for better understanding of price ranges</li>
            <li>Extended Fibonacci levels for advanced analysis</li>
          </ul>
          <h3>How to Use:</h3>
          <p>Select the desired tab to explore different aspects of the analysis. Use the BTC conversion tab to see how various amounts of LCX translate into BTC at current prices. The Fibonacci tab provides insights into key price levels based on historical data.</p>
          <p>This tool is intended for educational purposes and should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
        </div>
      </n-tab-pane>
      

    <n-tab-pane name="PriceRanceSpectrum" tab="📉 Price Range Spectrum">
      <VisualChartsSpectrum
        :current-price="currentPrice"
        :btc-price="btcPrice"
        :current-level-class="currentLevelInfo.class"
        :current-level-emoji="currentLevelInfo.info.emoji"
        :current-level-name="currentLevelInfo.info.name"
      />
        
    </n-tab-pane>

<n-tab-pane name="LCXtoBTCPyramid" tab="🔺 LCX to BTC Pyramid">
      <div class="tab-content">
        <n-card class="pyramid-card" title="🔺 LCX to BTC Pyramid Calculator">
          <template #header-extra>
            <div class="btc-price-display">
              <span class="live-indicator">🔴 LIVE</span>
              <span class="input-label">BTC:</span>
              <div class="btc-price-value-box">
                <span class="btc-currency-symbol">$</span>
                <span class="btc-price-value">{{ parseFloat(btcPrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</span>
              </div>
            </div>
          </template>

          <!-- Pyramid Content Here -->
          <div class="pyramid-content">
            <!-- Add pyramid visualization and calculations here -->
            <p>This section will contain the LCX to BTC pyramid visualization and related calculations.</p>
          </div>
        </n-card>
      </div>
      
    </n-tab-pane>

    <n-tab-pane name="OneBTC4LCX" tab="₿1 = ? LCX Price">
      <div class="tab-content">
        <OneBTC4LCX
          :btc-price="btcPrice"
          :eth-price="ethPrice"
          :current-price="currentPrice"
        />
      </div>
    </n-tab-pane>

    <n-tab-pane name="Settings" tab="⚙️ Settings">
      <div class="tab-content">
        <n-card class="settings-card" title="⚙️ User Settings">
          <template #header-extra>
            <span class="settings-info">Customize your experience</span>
          </template>

          <!-- Settings Content Here -->
          <div class="settings-content">
            <!-- Add user settings options here -->
            <p>This section will contain various user settings and preferences.</p>
          </div>
        </n-card>
      </div>

      
    </n-tab-pane>
    </n-tabs>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '~/stores/app.store';
import VisualChartsSpectrum from '~/components/VisualChartsSpectrum.vue';
import LCXToBTCPyramid from '~/components/LCXToBTCPyramid.vue';
import OneBTC4LCX from '~/components/OneBTC4LCX.vue';

definePageMeta({
  middleware: 'auth'
});

const appStore = useAppStore();

// Price constants
const athLow = 0.01;
const athHigh = 0.7654; // ATH historical high
const targetLow = 0.01;
let targetPrice = ref(1.5); // Default target $1.50

// BTC Price Levels Configuration (for enriched table)
const start = 0.00000001;
const end = 0.0001;
const steps = 10000;

// Raport constant între valori (constant ratio between values)
const factor = Math.pow(end / start, 1 / (steps - 1));

const btcLevels = Array.from({ length: steps }, (_, i) => {
  const btcPrice = start * Math.pow(factor, i);
  return {
    btcPrice: parseFloat(btcPrice.toFixed(10)),
    label: btcPrice.toFixed(10),
  };
});

// BTC price (live from ticker-bar store - updated every 3 seconds)
const btcPrice = computed(() => {
  const storePrice = appStore.getBtcPrice;
  return storePrice ? storePrice.toFixed(2) : "94000";
});

// Current price from store
const currentPrice = computed(() => {
  const storePrice = appStore.getCurrentPrice;
  return storePrice ? storePrice.toFixed(4) : "0.1120";
});

// ETH price (live from ticker-bar store - updated every 3 seconds)
const ethPrice = computed(() => {
  const storePrice = appStore.getEthPrice;
  return storePrice ? storePrice.toFixed(2) : "3500";
});

// Calculate how many LCX equals 1 BTC at current prices
const lcxPerBtc = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  return btcPriceUsd / lcxPriceUsd;
});

// Get current level info
const currentLevelInfo = computed(() => {
  return getCurrentLevelInfo();
});

// LCX amounts for tables
const lcxAmounts = [
  1100000, 1000000, 900000, 800000, 700000, 600000, 500000,
  400000, 300000, 250000, 200000, 150000, 100000,
  90000, 80000, 70000, 60000, 50000
];

// Table 1: LCX to BTC conversion (cat BTC reprezinta X LCX)
const lcxToBtcRows = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  const lcxPriceInBtc = lcxPriceUsd / btcPriceUsd; // 1 LCX = ? BTC

  return lcxAmounts.map(lcxAmount => {
    const usdValue = lcxAmount * lcxPriceUsd;
    const btcValue = usdValue / btcPriceUsd;
    const percentage = (btcValue * 100);

    return {
      lcx: lcxAmount,
      lcxPriceInBtc: lcxPriceInBtc, // Added: 1 LCX price in BTC
      usd: usdValue,
      btc: btcValue,
      percent: percentage,
      highlight: lcxAmount === 1000000 || lcxAmount === 500000 || lcxAmount === 100000
    };
  });
});

// Table 2: LCX Price Scenarios in BTC (exponential levels)
const btcPriceScenarios = computed(() => {
  const btcPriceUsd = parseFloat(btcPrice.value);
  const currentLcxPriceInBtc = parseFloat(currentPrice.value) / btcPriceUsd;

  // Exponential BTC price levels for 1 LCX
  const scenarios = [
    { btcPrice: 0.00000001, label: '0.00000001' },
    { btcPrice: 0.0000001, label: '0.0000001' },
    { btcPrice: 0.000001, label: '0.000001' },
    { btcPrice: 0.00001, label: '0.00001' },
    { btcPrice: 0.0001, label: '0.0001' },
    { btcPrice: 0.001, label: '0.001' },
    { btcPrice: 0.01, label: '0.01' },
    { btcPrice: 0.1, label: '0.1' },
  ];

  return scenarios.map(scenario => {
    const lcxPriceInUsd = scenario.btcPrice * btcPriceUsd;
    const multiplier = (scenario.btcPrice / currentLcxPriceInBtc).toFixed(2);
    const isCurrent = Math.abs(scenario.btcPrice - currentLcxPriceInBtc) < 0.0000001;

    return {
      scenario: `₿ ${scenario.label}`,
      lcxPriceInBtc: scenario.btcPrice,
      lcxPriceInUsd: lcxPriceInUsd,
      multiplier: multiplier + 'x',
      isCurrent: isCurrent
    };
  });
});

// Enriched BTC Levels: BTC → USD → LCX + multiplicator
const enrichedBtcLevels = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);

  return btcLevels.map((lvl, idx) => {
    const usdValue = lvl.btcPrice * btcPriceUsd;
    const lcxEquivalent = usdValue / lcxPriceUsd;
    return {
      index: idx + 1,
      btcRaw: lvl.btcPrice, // Keep raw numeric value for color class
      btc: lvl.btcPrice.toFixed(10),
      usd: usdValue.toFixed(6),
      lcx: lcxEquivalent.toFixed(2),
      multiplier: (lcxEquivalent / 1).toFixed(2) + "x",
    };
  });
});

// Fibonacci ratios (more comprehensive)
const fibRatios = [
  { ratio: 0, label: '0.0%', zone: 'extreme-buy' },
  { ratio: 14.6, label: '14.6%', zone: 'strong-buy' },
  { ratio: 23.6, label: '23.6%', zone: 'buy' },
  { ratio: 38.2, label: '38.2%', zone: 'buy' },
  { ratio: 50.0, label: '50.0%', zone: 'neutral' },
  { ratio: 61.8, label: '61.8% 🌟', zone: 'golden' },
  { ratio: 70.7, label: '70.7%', zone: 'sell' },
  { ratio: 78.6, label: '78.6%', zone: 'sell' },
  { ratio: 88.6, label: '88.6%', zone: 'strong-sell' },
  { ratio: 100, label: '100.0%', zone: 'target' },
];

// Extended levels (beyond 100%)
const extendedRatios = [
  { ratio: 127.2, label: 'Fib Extension 1.272' },
  { ratio: 161.8, label: 'Fib Extension 1.618 🌟' },
  { ratio: 200.0, label: 'Fib Extension 2.0' },
  { ratio: 261.8, label: 'Fib Extension 2.618' },
];

// Calculate Fibonacci levels for ATH
const fibLevelsATH = computed(() => {
  const range = athHigh - athLow;
  return fibRatios.map(fib => {
    const price = athLow + (range * fib.ratio / 100);
    return {
      ...fib,
      price,
      zoneLabel: getZoneLabel(fib.zone)
    };
  });
});

// Calculate Fibonacci levels for Target
const fibLevelsTarget = computed(() => {
  const range = targetPrice.value - targetLow;
  return fibRatios.map(fib => {
    const price = targetLow + (range * fib.ratio / 100);
    return {
      ...fib,
      price,
      zoneLabel: getZoneLabel(fib.zone)
    };
  });
});

// Extended levels calculation
const extendedLevels = computed(() => {
  const rangeATH = athHigh - athLow;
  const rangeTarget = targetPrice.value - targetLow;

  return extendedRatios.map(ext => ({
    ...ext,
    priceATH: athLow + (rangeATH * ext.ratio / 100),
    priceTarget: targetLow + (rangeTarget * ext.ratio / 100)
  }));
});

// Calculate current position in ATH range
const currentPositionATH = computed(() => {
  const current = parseFloat(currentPrice.value);
  const range = athHigh - athLow;
  return ((current - athLow) / range) * 100;
});

// Calculate current position in Target range
const currentPositionTarget = computed(() => {
  const current = parseFloat(currentPrice.value);
  const range = targetPrice.value - targetLow;
  return ((current - targetLow) / range) * 100;
});

// Check if price is at current level (within 2% tolerance)
function isCurrentLevel(levelPrice) {
  const current = parseFloat(currentPrice.value);
  const tolerance = 0.02; // 2%
  const diff = Math.abs(current - levelPrice);
  const percentDiff = (diff / levelPrice) * 100;
  return percentDiff <= tolerance;
}

// Get zone label
function getZoneLabel(zone) {
  const labels = {
    'extreme-buy': '🟢 EXTREME BUY',
    'strong-buy': '🟢 STRONG BUY',
    'buy': '🟢 BUY ZONE',
    'neutral': '🟡 NEUTRAL',
    'golden': '🌟 GOLDEN POCKET',
    'sell': '🔴 SELL ZONE',
    'strong-sell': '🔴 STRONG SELL',
    'target': '🎯 TARGET'
  };
  return labels[zone] || '';
}

// Get current level info with name and color
function getCurrentLevelInfo() {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  const lcxPriceInBtc = lcxPriceUsd / btcPriceUsd;

  const rangeClass = getBtcPriceRangeClass(lcxPriceInBtc);

  const levelNames = {
    'btc-range-atl': { name: 'ATL', emoji: '🟢', desc: 'All-Time Low' },
    'btc-range-level1-buy': { name: 'L1 Buy', emoji: '🟢', desc: 'Strong Buy' },
    'btc-range-level2-buy': { name: 'L2 Buy', emoji: '🟢', desc: 'Buy' },
    'btc-range-level3-buy': { name: 'L3 Buy', emoji: '🟢', desc: 'Buy' },
    'btc-range-level4-buy': { name: 'L4 Buy', emoji: '🟢', desc: 'Moderate Buy' },
    'btc-range-level5-buy': { name: 'L5 Buy', emoji: '🟢', desc: 'Light Buy' },
    'btc-range-level6-buy': { name: 'L6 Buy', emoji: '🟢', desc: 'Weak Buy' },
    'btc-range-level7-neutral': { name: 'L7 Neutral', emoji: '🟡', desc: 'Neutral' },
    'btc-range-level8-neutral': { name: 'L8 Neutral', emoji: '🟡', desc: 'Neutral' },
    'btc-range-level9-sell-start': { name: 'L9 Sell', emoji: '🔴', desc: 'Start Sell' },
    'btc-range-level10-sell': { name: 'L10 Sell', emoji: '🔴', desc: 'Sell' },
    'btc-range-level11-sell': { name: 'L11 Sell', emoji: '🔴', desc: 'Sell' },
    'btc-range-level12-sell': { name: 'L12 Sell', emoji: '🔴', desc: 'Sell' },
    'btc-range-level13-sell-medium': { name: 'L13 Sell', emoji: '🔴', desc: 'Medium Sell' },
    'btc-range-level14-sell-medium': { name: 'L14 Sell', emoji: '🔴', desc: 'Medium Sell' },
    'btc-range-level15-sell-medium': { name: 'L15 Sell', emoji: '🔴', desc: 'Medium Sell' },
    'btc-range-level16-sell-strong': { name: 'L16 Sell', emoji: '🔴', desc: 'Strong Sell' },
    'btc-range-level17-sell-strong': { name: 'L17 Sell', emoji: '🔴', desc: 'Strong Sell' },
    'btc-range-level18-sell-vstrong': { name: 'L18 Sell', emoji: '🔴', desc: 'Very Strong Sell' },
    'btc-range-level19-pre-ath': { name: 'L19 Pre-ATH', emoji: '🔴', desc: 'Pre-ATH' },
    'btc-range-ath': { name: 'ATH', emoji: '🔥', desc: 'All-Time High' },
  };

  return {
    class: rangeClass,
    info: levelNames[rangeClass] || { name: 'Unknown', emoji: '⚪', desc: 'Unknown Level' }
  };
}

// Get BTC price range class for color coding
function getBtcPriceRangeClass(btcPrice) {
  const price = parseFloat(btcPrice);

  // ATL Range: 0.00000001 - 0.0000001 (Dark Green)
  if (price >= 0.00000001 && price < 0.0000001) {
    return 'btc-range-atl';
  }
  // Level 1 Buy: 0.0000001 - 0.0000002
  else if (price >= 0.0000001 && price < 0.0000002) {
    return 'btc-range-level1-buy';
  }
  // Level 2 Buy: 0.0000002 - 0.0000003
  else if (price >= 0.0000002 && price < 0.0000003) {
    return 'btc-range-level2-buy';
  }
  // Level 3 Buy: 0.0000003 - 0.0000004
  else if (price >= 0.0000003 && price < 0.0000004) {
    return 'btc-range-level3-buy';
  }
  // Level 4 Buy: 0.0000004 - 0.0000005
  else if (price >= 0.0000004 && price < 0.0000005) {
    return 'btc-range-level4-buy';
  }
  // Level 5 Buy: 0.0000005 - 0.0000006
  else if (price >= 0.0000005 && price < 0.0000006) {
    return 'btc-range-level5-buy';
  }
  // Level 6 Buy: 0.0000006 - 0.0000007
  else if (price >= 0.0000006 && price < 0.0000007) {
    return 'btc-range-level6-buy';
  }
  // Level 7 Neutral: 0.0000007 - 0.0000008
  else if (price >= 0.0000007 && price < 0.0000008) {
    return 'btc-range-level7-neutral';
  }
  // Level 8 Neutral: 0.0000008 - 0.000001
  else if (price >= 0.0000008 && price < 0.000001) {
    return 'btc-range-level8-neutral';
  }
  // Level 9 Sell Start: 0.000001 - 0.0000012
  else if (price >= 0.000001 && price < 0.0000012) {
    return 'btc-range-level9-sell-start';
  }
  // Level 10 Sell: 0.0000012 - 0.0000014
  else if (price >= 0.0000012 && price < 0.0000014) {
    return 'btc-range-level10-sell';
  }
  // Level 11 Sell: 0.0000014 - 0.0000016
  else if (price >= 0.0000014 && price < 0.0000016) {
    return 'btc-range-level11-sell';
  }
  // Level 12 Sell: 0.0000016 - 0.0000018
  else if (price >= 0.0000016 && price < 0.0000018) {
    return 'btc-range-level12-sell';
  }
  // Level 13 Sell Medium: 0.0000018 - 0.000002
  else if (price >= 0.0000018 && price < 0.000002) {
    return 'btc-range-level13-sell-medium';
  }
  // Level 14 Sell Medium: 0.000002 - 0.0000025
  else if (price >= 0.000002 && price < 0.0000025) {
    return 'btc-range-level14-sell-medium';
  }
  // Level 15 Sell Medium: 0.0000025 - 0.000003
  else if (price >= 0.0000025 && price < 0.000003) {
    return 'btc-range-level15-sell-medium';
  }
  // Level 16 Sell Strong: 0.000003 - 0.000004
  else if (price >= 0.000003 && price < 0.000004) {
    return 'btc-range-level16-sell-strong';
  }
  // Level 17 Sell Strong: 0.000004 - 0.000005
  else if (price >= 0.000004 && price < 0.000005) {
    return 'btc-range-level17-sell-strong';
  }
  // Level 18 Sell Very Strong: 0.000005 - 0.000006
  else if (price >= 0.000005 && price < 0.000006) {
    return 'btc-range-level18-sell-vstrong';
  }
  // Level 19 Pre-ATH: 0.000006 - 0.000008
  else if (price >= 0.000006 && price < 0.000008) {
    return 'btc-range-level19-pre-ath';
  }
  // ATH Range: 0.000008 - 0.00001 (Orange)
  else if (price >= 0.000008 && price <= 0.00001) {
    return 'btc-range-ath';
  }
  // Default
  return '';
}

// Scroll to specific BTC price range in the table
function scrollToRange(rangeClass) {
  const tableWrapper = document.querySelector('.btc-table-card .table-wrapper');
  const firstRow = document.querySelector(`.btc-table tbody tr.${rangeClass}`);

  if (tableWrapper && firstRow) {
    const rowOffset = firstRow.offsetTop - tableWrapper.offsetTop - 60;
    tableWrapper.scrollTo({
      top: rowOffset,
      behavior: 'smooth'
    });
  }
}

// No need for fetchBTCPrice() - using live prices from ticker-bar store!
// BTC, ETH, and LCX prices are automatically updated every 3 seconds via ticker-bar component

</script>

<style scoped>
.fibonacci-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  padding: 20px;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.08), rgba(16, 235, 4, 0.08));
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 24px;
  border: 1px solid rgba(245, 166, 35, 0.3);
  box-shadow: 0 4px 15px rgba(245, 166, 35, 0.15);
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
  background: linear-gradient(135deg, #f5a623, #10eb04);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(245, 166, 35, 0.3);
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

.current-price-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(16, 235, 4, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  min-width: 140px;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.price-value {
  font-size: 18px;
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
  margin-bottom: 24px;
}

.fib-section {
  display: flex;
  flex-direction: column;
}

.fib-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(245, 166, 35, 0.3);
  height: 100%;
}

.ath-card {
  border-color: rgba(16, 235, 4, 0.3);
}

.target-card {
  border-color: rgba(5, 245, 237, 0.3);
}

.range-label {
  font-size: 12px;
  color: #10eb04;
  background: rgba(16, 235, 4, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.target-selector {
  display: flex;
  gap: 6px;
}

/* ===== FIB INFO ===== */
.fib-info {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.info-value {
  font-size: 13px;
  color: #fff;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.position-highlight {
  color: #f5a623 !important;
  font-size: 14px !important;
  text-shadow: 0 0 8px rgba(245, 166, 35, 0.5);
}

.target-highlight {
  color: #05f5ed !important;
  font-size: 14px !important;
  text-shadow: 0 0 8px rgba(5, 245, 237, 0.5);
}

/* ===== FIBONACCI LEVELS ===== */
.fib-levels {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fib-level-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.fib-level-item.extreme-buy {
  border-left-color: #00ff00;
  background: linear-gradient(90deg, rgba(0, 255, 0, 0.1), transparent);
}

.fib-level-item.strong-buy {
  border-left-color: #10eb04;
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.08), transparent);
}

.fib-level-item.buy {
  border-left-color: #6cee09;
  background: linear-gradient(90deg, rgba(108, 238, 9, 0.06), transparent);
}

.fib-level-item.neutral {
  border-left-color: #f5a623;
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.06), transparent);
}

.fib-level-item.golden {
  border-left-color: #ffd700;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.fib-level-item.sell {
  border-left-color: #ff6b35;
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.06), transparent);
}

.fib-level-item.strong-sell {
  border-left-color: #ff4d4d;
  background: linear-gradient(90deg, rgba(255, 77, 77, 0.08), transparent);
}

.fib-level-item.target {
  border-left-color: #05f5ed;
  background: linear-gradient(90deg, rgba(5, 245, 237, 0.1), transparent);
}

.fib-level-item.current-level {
  border: 2px solid #f5a623;
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.2), transparent);
  box-shadow: 0 0 25px rgba(245, 166, 35, 0.4);
  transform: scale(1.02);
}

.fib-level-item:hover {
  transform: translateX(4px);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.level-ratio {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
}

.level-price {
  font-size: 14px;
  font-weight: 800;
  color: #10eb04;
  font-family: 'Courier New', monospace;
}

.level-bar {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #10eb04, #05f5ed);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.current-marker {
  position: absolute;
  right: -10px;
  top: -2px;
  font-size: 12px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.level-zone-label {
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== EXTENDED SECTION ===== */
.extended-section {
  margin-bottom: 24px;
}

.extended-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(5, 245, 237, 0.3);
}

.extended-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.extended-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(5, 245, 237, 0.2);
  transition: all 0.3s ease;
}

.extended-item:hover {
  border-color: rgba(5, 245, 237, 0.5);
  box-shadow: 0 4px 15px rgba(5, 245, 237, 0.2);
  transform: translateY(-2px);
}

.extended-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.extended-label {
  font-size: 13px;
  font-weight: 700;
  color: #05f5ed;
}

.extended-ratio {
  font-size: 12px;
  font-weight: 800;
  color: #f5a623;
}

.extended-prices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extended-price-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.extended-price-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.extended-price-value {
  font-size: 13px;
  color: #10eb04;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.target-color {
  color: #05f5ed !important;
}

/* ===== GOLDEN SECTION ===== */
.golden-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.golden-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.golden-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 2px solid;
  transition: all 0.3s ease;
}

.golden-item.buy-zone {
  border-color: rgba(16, 235, 4, 0.5);
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.05), transparent);
}

.golden-item.neutral-zone {
  border-color: rgba(255, 215, 0, 0.5);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent);
}

.golden-item.sell-zone {
  border-color: rgba(255, 77, 77, 0.5);
  background: linear-gradient(135deg, rgba(255, 77, 77, 0.05), transparent);
}

.golden-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.golden-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.golden-item h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 16px;
  color: #fff;
}

.golden-levels {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.golden-level {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-weight: 600;
}

.golden-highlight {
  color: #ffd700 !important;
  font-weight: 800 !important;
  background: rgba(255, 215, 0, 0.15) !important;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

/* ===== TABS ===== */
.main-tabs {
  margin-bottom: 24px;
}

.tab-content {
  padding: 20px 0;
}

/* ===== BTC TABS GRID ===== */
.btc-tabs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.btc-table-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(247, 147, 26, 0.3);
  height: 100%;
}

.btc-price-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btc-price-value-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(247, 147, 26, 0.4);
  border-radius: 6px;
  padding: 6px 12px;
  gap: 4px;
}

.btc-currency-symbol {
  font-size: 13px;
  color: rgba(247, 147, 26, 0.8);
  font-weight: 700;
}

.btc-price-value {
  font-size: 13px;
  color: #f7931a;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(247, 147, 26, 0.4);
  letter-spacing: 0.5px;
}

.live-indicator {
  font-size: 9px;
  font-weight: 800;
  color: #ff0000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

.input-label {
  font-size: 12px;
  color: #f7931a;
  font-weight: 700;
}

.info-badge {
  background: rgba(247, 147, 26, 0.15);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(247, 147, 26, 0.3);
}

.info-badge span {
  font-size: 12px;
  color: #f7931a;
  font-weight: 700;
}

.info-display {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-size: 13px;
  color: #f7931a;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(247, 147, 26, 0.4);
}

/* Current Level Badge */
.current-level-box {
  border: 2px solid rgba(247, 147, 26, 0.4);
  padding: 8px 12px !important;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
}

.current-level-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.level-emoji {
  font-size: 16px;
}

.level-name {
  font-size: 13px;
  font-weight: 800;
  color: #f7931a;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(247, 147, 26, 0.4);
}

.level-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Current Level Box Colors Based on Range */
.current-level-box.btc-range-atl,
.current-level-box.btc-range-level1-buy,
.current-level-box.btc-range-level2-buy,
.current-level-box.btc-range-level3-buy,
.current-level-box.btc-range-level4-buy,
.current-level-box.btc-range-level5-buy,
.current-level-box.btc-range-level6-buy {
  border-color: rgba(16, 235, 4, 0.6);
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.15), transparent);
}

.current-level-box.btc-range-atl .level-name,
.current-level-box.btc-range-level1-buy .level-name,
.current-level-box.btc-range-level2-buy .level-name,
.current-level-box.btc-range-level3-buy .level-name,
.current-level-box.btc-range-level4-buy .level-name,
.current-level-box.btc-range-level5-buy .level-name,
.current-level-box.btc-range-level6-buy .level-name {
  color: #10eb04;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.4);
}

.current-level-box.btc-range-level7-neutral,
.current-level-box.btc-range-level8-neutral {
  border-color: rgba(245, 166, 35, 0.6);
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.15), transparent);
}

.current-level-box.btc-range-level7-neutral .level-name,
.current-level-box.btc-range-level8-neutral .level-name {
  color: #f5a623;
  text-shadow: 0 0 8px rgba(245, 166, 35, 0.4);
}

.current-level-box.btc-range-level9-sell-start,
.current-level-box.btc-range-level10-sell,
.current-level-box.btc-range-level11-sell,
.current-level-box.btc-range-level12-sell,
.current-level-box.btc-range-level13-sell-medium,
.current-level-box.btc-range-level14-sell-medium,
.current-level-box.btc-range-level15-sell-medium,
.current-level-box.btc-range-level16-sell-strong,
.current-level-box.btc-range-level17-sell-strong,
.current-level-box.btc-range-level18-sell-vstrong,
.current-level-box.btc-range-level19-pre-ath {
  border-color: rgba(255, 77, 77, 0.6);
  background: linear-gradient(135deg, rgba(255, 77, 77, 0.15), transparent);
}

.current-level-box.btc-range-level9-sell-start .level-name,
.current-level-box.btc-range-level10-sell .level-name,
.current-level-box.btc-range-level11-sell .level-name,
.current-level-box.btc-range-level12-sell .level-name,
.current-level-box.btc-range-level13-sell-medium .level-name,
.current-level-box.btc-range-level14-sell-medium .level-name,
.current-level-box.btc-range-level15-sell-medium .level-name,
.current-level-box.btc-range-level16-sell-strong .level-name,
.current-level-box.btc-range-level17-sell-strong .level-name,
.current-level-box.btc-range-level18-sell-vstrong .level-name,
.current-level-box.btc-range-level19-pre-ath .level-name {
  color: #ff4d4d;
  text-shadow: 0 0 8px rgba(255, 77, 77, 0.4);
}

.current-level-box.btc-range-ath {
  border-color: rgba(255, 153, 0, 0.6);
  background: linear-gradient(135deg, rgba(255, 153, 0, 0.15), transparent);
}

.current-level-box.btc-range-ath .level-name {
  color: #ff9900;
  text-shadow: 0 0 8px rgba(255, 153, 0, 0.4);
}

/* BTC Range Legend */
.btc-range-legend {
  margin: 16px 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.legend-title {
  font-size: 12px;
  font-weight: 800;
  color: #f7931a;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-section {
  margin-bottom: 10px;
}

.legend-section:last-child {
  margin-bottom: 0;
}

.legend-section-title {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-item.clickable {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.legend-item.clickable:hover {
  background: rgba(247, 147, 26, 0.15);
  transform: translateY(-1px);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* BUY Levels */
.legend-color.btc-range-atl {
  background-color: #006400;
  border-color: #004d00;
}
.legend-color.btc-range-level1-buy {
  background-color: #008000;
  border-color: #006400;
}
.legend-color.btc-range-level2-buy {
  background-color: #00a000;
  border-color: #008000;
}
.legend-color.btc-range-level3-buy {
  background-color: #00c000;
  border-color: #00a000;
}
.legend-color.btc-range-level4-buy {
  background-color: #00e000;
  border-color: #00c000;
}
.legend-color.btc-range-level5-buy {
  background-color: #40ff40;
  border-color: #00e000;
}
.legend-color.btc-range-level6-buy {
  background-color: #80ff80;
  border-color: #40ff40;
}

/* NEUTRAL Levels */
.legend-color.btc-range-level7-neutral {
  background-color: #f0e68c;
  border-color: #daa520;
}
.legend-color.btc-range-level8-neutral {
  background-color: #fafad2;
  border-color: #f0e68c;
}

/* SELL Levels */
.legend-color.btc-range-level9-sell-start {
  background-color: #ffcccc;
  border-color: #ff9999;
}
.legend-color.btc-range-level10-sell {
  background-color: #ffb3b3;
  border-color: #ff9999;
}
.legend-color.btc-range-level11-sell {
  background-color: #ff9999;
  border-color: #ff8080;
}
.legend-color.btc-range-level12-sell {
  background-color: #ff8080;
  border-color: #ff6666;
}
.legend-color.btc-range-level13-sell-medium {
  background-color: #ff6666;
  border-color: #ff4d4d;
}
.legend-color.btc-range-level14-sell-medium {
  background-color: #ff4d4d;
  border-color: #ff3333;
}
.legend-color.btc-range-level15-sell-medium {
  background-color: #ff3333;
  border-color: #ff1a1a;
}
.legend-color.btc-range-level16-sell-strong {
  background-color: #dd0000;
  border-color: #cc0000;
}
.legend-color.btc-range-level17-sell-strong {
  background-color: #bb0000;
  border-color: #aa0000;
}
.legend-color.btc-range-level18-sell-vstrong {
  background-color: #990000;
  border-color: #880000;
}
.legend-color.btc-range-level19-pre-ath {
  background-color: #770000;
  border-color: #660000;
}

/* ATH Range */
.legend-color.btc-range-ath {
  background-color: #ff9900;
  border-color: #ff8800;
}

.legend-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* Visual Range Chart */
.range-chart {
  margin: 16px 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.range-chart-title {
  font-size: 11px;
  font-weight: 800;
  color: #f7931a;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.range-chart-bar {
  display: flex;
  width: 100%;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.range-segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-right: 1px solid rgba(0, 0, 0, 0.3);
}

.range-segment:last-child {
  border-right: none;
}

.range-segment:hover {
  transform: scaleY(1.15);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.range-segment-label {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Apply same colors as table rows */
.range-segment.btc-range-atl {
  background-color: #006400;
  color: #fff;
}
.range-segment.btc-range-level1-buy {
  background-color: #008000;
  color: #fff;
}
.range-segment.btc-range-level2-buy {
  background-color: #00a000;
  color: #fff;
}
.range-segment.btc-range-level3-buy {
  background-color: #00c000;
  color: #fff;
}
.range-segment.btc-range-level4-buy {
  background-color: #00e000;
  color: #000;
}
.range-segment.btc-range-level5-buy {
  background-color: #40ff40;
  color: #000;
}
.range-segment.btc-range-level6-buy {
  background-color: #80ff80;
  color: #000;
}
.range-segment.btc-range-level7-neutral {
  background-color: #f0e68c;
  color: #000;
}
.range-segment.btc-range-level8-neutral {
  background-color: #fafad2;
  color: #000;
}
.range-segment.btc-range-level9-sell-start {
  background-color: #ffcccc;
  color: #000;
}
.range-segment.btc-range-level10-sell {
  background-color: #ffb3b3;
  color: #000;
}
.range-segment.btc-range-level11-sell {
  background-color: #ff9999;
  color: #000;
}
.range-segment.btc-range-level12-sell {
  background-color: #ff8080;
  color: #000;
}
.range-segment.btc-range-level13-sell-medium {
  background-color: #ff6666;
  color: #fff;
}
.range-segment.btc-range-level14-sell-medium {
  background-color: #ff4d4d;
  color: #fff;
}
.range-segment.btc-range-level15-sell-medium {
  background-color: #ff3333;
  color: #fff;
}
.range-segment.btc-range-level16-sell-strong {
  background-color: #dd0000;
  color: #fff;
}
.range-segment.btc-range-level17-sell-strong {
  background-color: #bb0000;
  color: #fff;
}
.range-segment.btc-range-level18-sell-vstrong {
  background-color: #990000;
  color: #fff;
}
.range-segment.btc-range-level19-pre-ath {
  background-color: #770000;
  color: #fff;
}
.range-segment.btc-range-ath {
  background-color: #ff9900;
  color: #000;
}

.table-wrapper {
  max-height: 650px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btc-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', monospace;
}

.btc-table thead {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.btc-table th {
  padding: 12px 10px;
  text-align: left;
  font-size: 11px;
  font-weight: 800;
  color: #f7931a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(247, 147, 26, 0.4);
}

.btc-table tbody tr {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.btc-table tbody tr:hover {
  background: rgba(247, 147, 26, 0.12);
  transform: translateX(3px);
  box-shadow: -3px 0 0 rgba(247, 147, 26, 0.5);
}

.btc-table tbody tr.highlight-row {
  background: rgba(247, 147, 26, 0.18);
  border-left: 3px solid #f7931a;
  border-right: 3px solid #f7931a;
}

/* BTC Price Range Row Colors */

/* BUY Levels */
.btc-table tbody tr.btc-range-atl {
  background-color: #006400 !important;
  color: #fff !important;
  border-left: 3px solid #004d00;
}
.btc-table tbody tr.btc-range-atl:hover {
  background-color: #007a00 !important;
}
.btc-table tbody tr.btc-range-atl td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level1-buy {
  background-color: #008000 !important;
  color: #fff !important;
  border-left: 3px solid #006400;
}
.btc-table tbody tr.btc-range-level1-buy:hover {
  background-color: #009900 !important;
}
.btc-table tbody tr.btc-range-level1-buy td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level2-buy {
  background-color: #00a000 !important;
  color: #fff !important;
  border-left: 3px solid #008000;
}
.btc-table tbody tr.btc-range-level2-buy:hover {
  background-color: #00b300 !important;
}
.btc-table tbody tr.btc-range-level2-buy td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level3-buy {
  background-color: #00c000 !important;
  color: #fff !important;
  border-left: 3px solid #00a000;
}
.btc-table tbody tr.btc-range-level3-buy:hover {
  background-color: #00d300 !important;
}
.btc-table tbody tr.btc-range-level3-buy td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level4-buy {
  background-color: #00e000 !important;
  color: #000 !important;
  border-left: 3px solid #00c000;
}
.btc-table tbody tr.btc-range-level4-buy:hover {
  background-color: #00f300 !important;
}
.btc-table tbody tr.btc-range-level4-buy td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level5-buy {
  background-color: #40ff40 !important;
  color: #000 !important;
  border-left: 3px solid #00e000;
}
.btc-table tbody tr.btc-range-level5-buy:hover {
  background-color: #60ff60 !important;
}
.btc-table tbody tr.btc-range-level5-buy td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level6-buy {
  background-color: #80ff80 !important;
  color: #000 !important;
  border-left: 3px solid #40ff40;
}
.btc-table tbody tr.btc-range-level6-buy:hover {
  background-color: #a0ffa0 !important;
}
.btc-table tbody tr.btc-range-level6-buy td {
  color: #000 !important;
}

/* NEUTRAL Levels */
.btc-table tbody tr.btc-range-level7-neutral {
  background-color: #f0e68c !important;
  color: #000 !important;
  border-left: 3px solid #daa520;
}
.btc-table tbody tr.btc-range-level7-neutral:hover {
  background-color: #f5eda0 !important;
}
.btc-table tbody tr.btc-range-level7-neutral td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level8-neutral {
  background-color: #fafad2 !important;
  color: #000 !important;
  border-left: 3px solid #f0e68c;
}
.btc-table tbody tr.btc-range-level8-neutral:hover {
  background-color: #ffffe0 !important;
}
.btc-table tbody tr.btc-range-level8-neutral td {
  color: #000 !important;
}

/* SELL Levels */
.btc-table tbody tr.btc-range-level9-sell-start {
  background-color: #ffcccc !important;
  color: #000 !important;
  border-left: 3px solid #ff9999;
}
.btc-table tbody tr.btc-range-level9-sell-start:hover {
  background-color: #ffdddd !important;
}
.btc-table tbody tr.btc-range-level9-sell-start td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level10-sell-medium {
  background-color: #ff6666 !important;
  color: #fff !important;
  border-left: 3px solid #ff3333;
}
.btc-table tbody tr.btc-range-level10-sell-medium:hover {
  background-color: #ff7777 !important;
}
.btc-table tbody tr.btc-range-level10-sell-medium td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level10-sell {
  background-color: #ffb3b3 !important;
  color: #000 !important;
  border-left: 3px solid #ff9999;
}
.btc-table tbody tr.btc-range-level10-sell:hover {
  background-color: #ffc2c2 !important;
}
.btc-table tbody tr.btc-range-level10-sell td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level11-sell {
  background-color: #ff9999 !important;
  color: #000 !important;
  border-left: 3px solid #ff8080;
}
.btc-table tbody tr.btc-range-level11-sell:hover {
  background-color: #ffa8a8 !important;
}
.btc-table tbody tr.btc-range-level11-sell td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level12-sell {
  background-color: #ff8080 !important;
  color: #000 !important;
  border-left: 3px solid #ff6666;
}
.btc-table tbody tr.btc-range-level12-sell:hover {
  background-color: #ff9090 !important;
}
.btc-table tbody tr.btc-range-level12-sell td {
  color: #000 !important;
}

.btc-table tbody tr.btc-range-level13-sell-medium {
  background-color: #ff6666 !important;
  color: #fff !important;
  border-left: 3px solid #ff4d4d;
}
.btc-table tbody tr.btc-range-level13-sell-medium:hover {
  background-color: #ff7777 !important;
}
.btc-table tbody tr.btc-range-level13-sell-medium td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level14-sell-medium {
  background-color: #ff4d4d !important;
  color: #fff !important;
  border-left: 3px solid #ff3333;
}
.btc-table tbody tr.btc-range-level14-sell-medium:hover {
  background-color: #ff5e5e !important;
}
.btc-table tbody tr.btc-range-level14-sell-medium td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level15-sell-medium {
  background-color: #ff3333 !important;
  color: #fff !important;
  border-left: 3px solid #ff1a1a;
}
.btc-table tbody tr.btc-range-level15-sell-medium:hover {
  background-color: #ff4444 !important;
}
.btc-table tbody tr.btc-range-level15-sell-medium td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level16-sell-strong {
  background-color: #dd0000 !important;
  color: #fff !important;
  border-left: 3px solid #cc0000;
}
.btc-table tbody tr.btc-range-level16-sell-strong:hover {
  background-color: #ee0000 !important;
}
.btc-table tbody tr.btc-range-level16-sell-strong td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level17-sell-strong {
  background-color: #bb0000 !important;
  color: #fff !important;
  border-left: 3px solid #aa0000;
}
.btc-table tbody tr.btc-range-level17-sell-strong:hover {
  background-color: #cc0000 !important;
}
.btc-table tbody tr.btc-range-level17-sell-strong td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level18-sell-vstrong {
  background-color: #990000 !important;
  color: #fff !important;
  border-left: 3px solid #880000;
}
.btc-table tbody tr.btc-range-level18-sell-vstrong:hover {
  background-color: #aa0000 !important;
}
.btc-table tbody tr.btc-range-level18-sell-vstrong td {
  color: #fff !important;
}

.btc-table tbody tr.btc-range-level19-pre-ath {
  background-color: #770000 !important;
  color: #fff !important;
  border-left: 3px solid #660000;
}
.btc-table tbody tr.btc-range-level19-pre-ath:hover {
  background-color: #880000 !important;
}
.btc-table tbody tr.btc-range-level19-pre-ath td {
  color: #fff !important;
}

/* ATH Range */
.btc-table tbody tr.btc-range-ath {
  background-color: #ff9900 !important;
  color: #000 !important;
  border-left: 3px solid #ff8800;
  border-right: 3px solid #ff8800;
}
.btc-table tbody tr.btc-range-ath:hover {
  background-color: #ffaa00 !important;
}
.btc-table tbody tr.btc-range-ath td {
  color: #000 !important;
}

.btc-table td {
  padding: 10px;
  font-size: 11px;
}

.lcx-col {
  color: #10eb04;
  font-weight: 800;
  font-size: 12px;
}

.lcx-btc-price-col {
  color: #ffd700;
  font-weight: 800;
  font-size: 11px;
  background: rgba(255, 215, 0, 0.08);
}

.usd-col {
  color: #05f5ed;
  font-weight: 700;
}

.btc-col {
  color: #f7931a;
  font-weight: 800;
  font-size: 12px;
}

.pct-col {
  color: #f5a623;
  font-weight: 700;
}

.remaining-col {
  color: #6cee09;
  font-weight: 700;
  font-size: 11px;
}

.scenario-col {
  color: #ffd700;
  font-weight: 800;
  font-size: 12px;
}

.index-col {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  font-size: 11px;
}

.multiplier-col {
  color: #00ff88;
  font-weight: 800;
  font-size: 12px;
}

/* Scrollbar for tables */
.table-wrapper::-webkit-scrollbar {
  width: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(247, 147, 26, 0.4);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(247, 147, 26, 0.6);
}

/* ===== BTC CONVERSION SECTION (OLD - KEPT FOR FIBONACCI TAB) ===== */
.btc-conversion-section {
  margin-bottom: 24px;
}

.btc-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(247, 147, 26, 0.3);
}

.btc-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btc-label {
  font-size: 12px;
  color: #f7931a;
  font-weight: 700;
}

.conversion-info-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.conversion-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-item-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.info-item-value {
  font-size: 14px;
  color: #f7931a;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(247, 147, 26, 0.4);
}

.conversion-table-container {
  max-height: 600px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.conversion-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', monospace;
}

.conversion-table thead {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10;
}

.conversion-table th {
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 800;
  color: #f7931a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(247, 147, 26, 0.3);
}

.conversion-table tbody tr {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.conversion-table tbody tr:hover {
  background: rgba(247, 147, 26, 0.1);
  transform: translateX(2px);
}

.conversion-table tbody tr.highlight-row {
  background: rgba(247, 147, 26, 0.15);
  border: 1px solid rgba(247, 147, 26, 0.3);
}

.conversion-table td {
  padding: 10px 12px;
  font-size: 12px;
}

.lcx-amount {
  color: #10eb04;
  font-weight: 800;
  font-size: 13px;
}

.usd-value {
  color: #05f5ed;
  font-weight: 700;
}

.btc-value {
  color: #f7931a;
  font-weight: 800;
  font-size: 13px;
}

.percentage {
  color: #f5a623;
  font-weight: 700;
}

/* Scrollbar for conversion table */
.conversion-table-container::-webkit-scrollbar {
  width: 6px;
}

.conversion-table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.conversion-table-container::-webkit-scrollbar-thumb {
  background: rgba(247, 147, 26, 0.3);
  border-radius: 3px;
}

.conversion-table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(247, 147, 26, 0.5);
}

/* ===== VISUAL CHARTS TAB ===== */
.visual-charts-content {
  padding: 20px 0;
}

.visual-chart-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(247, 147, 26, 0.3);
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.chart-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-info-row {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

.chart-info-row strong {
  color: #f7931a;
  margin-right: 8px;
}

.level-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(247, 147, 26, 0.4);
}

.chart-mode-toggle {
  display: flex;
  align-items: center;
}

.visual-chart-placeholder {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(13, 1, 77, 0.4), rgba(0, 0, 0, 0.4));
  border-radius: 12px;
  border: 2px dashed rgba(247, 147, 26, 0.3);
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.placeholder-text {
  font-size: 24px;
  font-weight: 800;
  color: #f7931a;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.placeholder-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .extended-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .golden-grid {
    grid-template-columns: 1fr;
  }

  .btc-tabs-grid {
    grid-template-columns: 1fr;
  }

  .chart-controls {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
