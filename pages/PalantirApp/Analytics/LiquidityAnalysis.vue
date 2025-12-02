<template>
  <div style="padding: 20px; background: #000; min-height: 100vh; color: #fff; font-family: 'Courier New', monospace;">

    <!-- Header -->
    <div style="margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #00d4ff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 28px; color: #00d4ff; font-weight: 700;">LIQUIDITY ANALYSIS</h1>
          <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">Market Depth & Liquidity Metrics</p>
        </div>
        <div style="display: flex; gap: 15px; align-items: center;">
          <select v-model="selectedSymbol" style="background: #111; color: #00d4ff; border: 1px solid #00d4ff; padding: 8px 15px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px;">
            <option v-for="sym in symbols" :key="sym" :value="sym">{{ sym }}</option>
          </select>
          <div style="background: rgba(0,212,255,0.1); padding: 10px 20px; border-radius: 6px; border: 1px solid #00d4ff; text-align: center;">
            <div style="font-size: 10px; color: #888;">LAST UPDATE</div>
            <div style="font-size: 14px; color: #00d4ff; font-weight: 700;">{{ lastUpdate }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Row -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 25px;">
      <!-- Bid Liquidity -->
      <div style="background: linear-gradient(135deg, #0a2e0a 0%, #000 100%); padding: 15px; border-radius: 8px; border: 1px solid #10eb04;">
        <div style="font-size: 10px; color: #888; margin-bottom: 5px;">BID LIQUIDITY</div>
        <div style="font-size: 22px; color: #10eb04; font-weight: 700; margin-bottom: 3px;">{{ formatLiquidity(metrics.bidLiquidity) }}</div>
        <div style="font-size: 9px; color: #10eb04;">{{ metrics.bidOrders }} orders</div>
      </div>

      <!-- Ask Liquidity -->
      <div style="background: linear-gradient(135deg, #2e0a0a 0%, #000 100%); padding: 15px; border-radius: 8px; border: 1px solid #f52a09;">
        <div style="font-size: 10px; color: #888; margin-bottom: 5px;">ASK LIQUIDITY</div>
        <div style="font-size: 22px; color: #f52a09; font-weight: 700; margin-bottom: 3px;">{{ formatLiquidity(metrics.askLiquidity) }}</div>
        <div style="font-size: 9px; color: #f52a09;">{{ metrics.askOrders }} orders</div>
      </div>

      <!-- Spread -->
      <div style="background: linear-gradient(135deg, #0a1e2e 0%, #000 100%); padding: 15px; border-radius: 8px; border: 1px solid #00d4ff;">
        <div style="font-size: 10px; color: #888; margin-bottom: 5px;">BID-ASK SPREAD</div>
        <div style="font-size: 22px; color: #00d4ff; font-weight: 700; margin-bottom: 3px;">{{ metrics.spread }}%</div>
        <div style="font-size: 9px; color: #888;">{{ spreadStatus }}</div>
      </div>

      <!-- Market Depth -->
      <div style="background: linear-gradient(135deg, #2e1e0a 0%, #000 100%); padding: 15px; border-radius: 8px; border: 1px solid #ffa500;">
        <div style="font-size: 10px; color: #888; margin-bottom: 5px;">MARKET DEPTH</div>
        <div style="font-size: 22px; color: #ffa500; font-weight: 700; margin-bottom: 3px;">{{ formatLiquidity(metrics.totalDepth) }}</div>
        <div style="font-size: 9px; color: #ffa500;">{{ depthQuality }}</div>
      </div>

      <!-- Liquidity Score -->
      <div style="background: linear-gradient(135deg, #1e0a2e 0%, #000 100%); padding: 15px; border-radius: 8px; border: 1px solid #b967ff;">
        <div style="font-size: 10px; color: #888; margin-bottom: 5px;">LIQUIDITY SCORE</div>
        <div style="font-size: 22px; color: #b967ff; font-weight: 700; margin-bottom: 3px;">{{ metrics.liquidityScore }}/100</div>
        <div style="font-size: 9px;" :style="{ color: scoreColor }">{{ scoreRating }}</div>
      </div>
    </div>

    <!-- Order Book Depth Chart & Distribution -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px;">

      <!-- Order Book Depth Chart -->
      <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; font-size: 14px; color: #00d4ff; font-weight: 700;">ORDER BOOK DEPTH</h3>
          <div style="font-size: 10px; color: #888;">Top 50 levels</div>
        </div>

        <!-- Depth Chart -->
        <div style="height: 250px; position: relative;">
          <svg viewBox="0 0 100 250" preserveAspectRatio="none" width="100%" height="250" style="background: #000; border-radius: 4px;">
            <!-- Grid lines -->
            <line v-for="i in 5" :key="'grid-'+i"
              x1="0" :y1="i * 50" x2="100" :y2="i * 50"
              stroke="#1a1a1a" stroke-width="0.2"/>

            <!-- Bid side (green) -->
            <path :d="bidPath" fill="url(#bidGradient)" stroke="#10eb04" stroke-width="0.5" vector-effect="non-scaling-stroke"/>

            <!-- Ask side (red) -->
            <path :d="askPath" fill="url(#askGradient)" stroke="#f52a09" stroke-width="0.5" vector-effect="non-scaling-stroke"/>

            <!-- Center price line -->
            <line x1="50" y1="0" x2="50" y2="250" stroke="#00d4ff" stroke-width="0.5" stroke-dasharray="2,2" vector-effect="non-scaling-stroke"/>

            <!-- Price labels -->
            <text x="45" y="20" fill="#10eb04" font-size="4" font-family="monospace">BID</text>
            <text x="55" y="20" fill="#f52a09" font-size="4" font-family="monospace">ASK</text>

            <!-- Gradients -->
            <defs>
              <linearGradient id="bidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10eb04;stop-opacity:0.4"/>
                <stop offset="100%" style="stop-color:#10eb04;stop-opacity:0"/>
              </linearGradient>
              <linearGradient id="askGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#f52a09;stop-opacity:0.4"/>
                <stop offset="100%" style="stop-color:#f52a09;stop-opacity:0"/>
              </linearGradient>
            </defs>
          </svg>

          <!-- Legend -->
          <div style="position: absolute; bottom: 10px; left: 10px; display: flex; gap: 20px; font-size: 10px;">
            <div style="display: flex; align-items: center; gap: 5px;">
              <div style="width: 12px; height: 12px; background: #10eb04; border-radius: 2px;"></div>
              <span style="color: #10eb04;">Bid Depth</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <div style="width: 12px; height: 12px; background: #f52a09; border-radius: 2px;"></div>
              <span style="color: #f52a09;">Ask Depth</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Liquidity Distribution -->
      <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #00d4ff; font-weight: 700;">LIQUIDITY DISTRIBUTION</h3>

        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 10px;">
            <span style="color: #888;">0-1% FROM MID</span>
            <span style="color: #10eb04;">{{ distribution.tier1 }}%</span>
          </div>
          <div style="background: #1a1a1a; height: 8px; border-radius: 4px; overflow: hidden;">
            <div :style="{ width: distribution.tier1 + '%', background: 'linear-gradient(90deg, #10eb04, #0a7002)', height: '100%' }"></div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 10px;">
            <span style="color: #888;">1-2% FROM MID</span>
            <span style="color: #00d4ff;">{{ distribution.tier2 }}%</span>
          </div>
          <div style="background: #1a1a1a; height: 8px; border-radius: 4px; overflow: hidden;">
            <div :style="{ width: distribution.tier2 + '%', background: 'linear-gradient(90deg, #00d4ff, #0080aa)', height: '100%' }"></div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 10px;">
            <span style="color: #888;">2-5% FROM MID</span>
            <span style="color: #ffa500;">{{ distribution.tier3 }}%</span>
          </div>
          <div style="background: #1a1a1a; height: 8px; border-radius: 4px; overflow: hidden;">
            <div :style="{ width: distribution.tier3 + '%', background: 'linear-gradient(90deg, #ffa500, #aa6f00)', height: '100%' }"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 10px;">
            <span style="color: #888;">5%+ FROM MID</span>
            <span style="color: #f52a09;">{{ distribution.tier4 }}%</span>
          </div>
          <div style="background: #1a1a1a; height: 8px; border-radius: 4px; overflow: hidden;">
            <div :style="{ width: distribution.tier4 + '%', background: 'linear-gradient(90deg, #f52a09, #aa1c06)', height: '100%' }"></div>
          </div>
        </div>

        <div style="margin-top: 20px; padding: 12px; background: rgba(0,212,255,0.05); border: 1px solid #00d4ff; border-radius: 6px;">
          <div style="font-size: 9px; color: #888; margin-bottom: 3px;">CONCENTRATION RATIO</div>
          <div style="font-size: 16px; color: #00d4ff; font-weight: 700;">{{ metrics.concentrationRatio }}%</div>
          <div style="font-size: 8px; color: #888;">in top 1%</div>
        </div>
      </div>
    </div>

    <!-- Liquidity Heatmap & Large Orders -->
    <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 20px; margin-bottom: 25px;">

      <!-- Liquidity Heatmap -->
      <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #00d4ff; font-weight: 700;">LIQUIDITY HEATMAP (24H)</h3>

        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px;">
          <div v-for="(hour, idx) in heatmapData" :key="idx"
            :style="{
              background: getHeatColor(hour.intensity),
              height: '120px',
              borderRadius: '4px',
              position: 'relative',
              border: hour.intensity > 0.7 ? '1px solid #10eb04' : hour.intensity < 0.3 ? '1px solid #f52a09' : '1px solid #333'
            }"
            :title="`${hour.time}: ${hour.liquidity}M`">
            <div style="position: absolute; bottom: 2px; left: 0; right: 0; text-align: center; font-size: 8px; color: #888;">
              {{ hour.time }}
            </div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 9px; color: #fff; font-weight: 700;">
              {{ hour.liquidityShort }}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 10px; padding: 10px; background: #000; border-radius: 4px;">
          <div style="font-size: 9px; color: #888;">Scale:</div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 20px; height: 10px; background: #f52a09; border-radius: 2px;"></div>
            <span style="font-size: 8px; color: #888;">Low</span>
            <div style="width: 20px; height: 10px; background: #ffa500; border-radius: 2px;"></div>
            <span style="font-size: 8px; color: #888;">Med</span>
            <div style="width: 20px; height: 10px; background: #10eb04; border-radius: 2px;"></div>
            <span style="font-size: 8px; color: #888;">High</span>
          </div>
        </div>
      </div>

      <!-- Large Orders Watch -->
      <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; font-size: 14px; color: #00d4ff; font-weight: 700;">LARGE ORDERS WATCH</h3>
          <div style="font-size: 10px; color: #888;">Whale alerts</div>
        </div>

        <div style="max-height: 240px; overflow-y: auto;">
          <div v-for="order in largeOrders" :key="order.id"
            style="padding: 10px; margin-bottom: 8px; background: #000; border-radius: 6px; border: 1px solid #222;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div :style="{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: order.side === 'BID' ? '#10eb04' : '#f52a09'
                }"></div>
                <span :style="{ color: order.side === 'BID' ? '#10eb04' : '#f52a09', fontSize: '11px', fontWeight: '700' }">
                  {{ order.side }}
                </span>
              </div>
              <span style="font-size: 10px; color: #888;">{{ order.time }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px;">
              <span style="color: #00d4ff;">{{ order.amount }}</span>
              <span style="color: #888;">@ {{ order.price }}</span>
            </div>
            <div style="font-size: 9px; color: #ffa500; margin-top: 3px;">
              ~${{ order.usdValue }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slippage Analysis & Market Impact -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">

      <!-- Slippage Analysis -->
      <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #00d4ff; font-weight: 700;">SLIPPAGE ANALYSIS</h3>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 10px;">Expected slippage for order sizes:</div>

          <div v-for="size in slippageData" :key="size.amount"
            style="margin-bottom: 12px; padding: 12px; background: #000; border-radius: 6px; border: 1px solid #222;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 12px; color: #00d4ff; font-weight: 700;">${{ size.amount }}</span>
              <span style="font-size: 10px; color: #888;">{{ size.percentage }}% of liquidity</span>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 15px;">
              <div style="flex: 1;">
                <div style="font-size: 9px; color: #888; margin-bottom: 3px;">BUY SLIPPAGE</div>
                <div :style="{ fontSize: '13px', color: size.buySlippage > 2 ? '#f52a09' : size.buySlippage > 0.5 ? '#ffa500' : '#10eb04', fontWeight: '700' }">
                  {{ size.buySlippage }}%
                </div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 9px; color: #888; margin-bottom: 3px;">SELL SLIPPAGE</div>
                <div :style="{ fontSize: '13px', color: size.sellSlippage > 2 ? '#f52a09' : size.sellSlippage > 0.5 ? '#ffa500' : '#10eb04', fontWeight: '700' }">
                  {{ size.sellSlippage }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Market Impact Score -->
      <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #00d4ff; font-weight: 700;">MARKET IMPACT ANALYSIS</h3>

        <!-- Impact Gauge -->
        <div style="position: relative; width: 200px; height: 200px; margin: 20px auto;">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <!-- Background arc -->
            <path d="M 30 170 A 80 80 0 0 1 170 170"
              fill="none" stroke="#1a1a1a" stroke-width="20" stroke-linecap="round"/>

            <!-- Impact level arc -->
            <path :d="impactArcPath"
              fill="none" :stroke="impactColor" stroke-width="20" stroke-linecap="round"/>

            <!-- Center text -->
            <text x="100" y="95" text-anchor="middle" fill="#888" font-size="11" font-family="monospace">IMPACT</text>
            <text x="100" y="115" text-anchor="middle" :fill="impactColor" font-size="24" font-weight="700" font-family="monospace">{{ metrics.marketImpact }}</text>
            <text x="100" y="135" text-anchor="middle" fill="#888" font-size="10" font-family="monospace">{{ impactLevel }}</text>
          </svg>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
          <div style="padding: 10px; background: #000; border-radius: 6px; border: 1px solid #10eb04;">
            <div style="font-size: 9px; color: #888; margin-bottom: 3px;">BUY IMPACT</div>
            <div style="font-size: 16px; color: #10eb04; font-weight: 700;">{{ metrics.buyImpact }}%</div>
            <div style="font-size: 8px; color: #888;">per $100K</div>
          </div>

          <div style="padding: 10px; background: #000; border-radius: 6px; border: 1px solid #f52a09;">
            <div style="font-size: 9px; color: #888; margin-bottom: 3px;">SELL IMPACT</div>
            <div style="font-size: 16px; color: #f52a09; font-weight: 700;">{{ metrics.sellImpact }}%</div>
            <div style="font-size: 8px; color: #888;">per $100K</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liquidity Trends -->
    <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #222;">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #00d4ff; font-weight: 700;">LIQUIDITY TRENDS (7 DAYS)</h3>

      <div style="height: 180px;">
        <svg viewBox="0 0 100 180" preserveAspectRatio="none" width="100%" height="180" style="background: #000; border-radius: 4px;">
          <!-- Grid -->
          <line v-for="i in 7" :key="'day-'+i"
            :x1="(i-1) * (100/6)" y1="0" :x2="(i-1) * (100/6)" y2="180"
            stroke="#1a1a1a" stroke-width="0.2"/>
          <line v-for="i in 4" :key="'level-'+i"
            x1="0" :y1="i * 45" x2="100" :y2="i * 45"
            stroke="#1a1a1a" stroke-width="0.2"/>

          <!-- Trend line -->
          <polyline :points="liquidityTrendPoints"
            fill="none" stroke="#00d4ff" stroke-width="0.5" vector-effect="non-scaling-stroke"/>

          <!-- Data points -->
          <circle v-for="(point, idx) in liquidityTrend" :key="'point-'+idx"
            :cx="idx * (100/6)" :cy="180 - (point.value / maxLiquidity * 160)"
            r="1" :fill="point.value > prevValue(idx) ? '#10eb04' : '#f52a09'" stroke="#000" stroke-width="0.5"/>

          <!-- Day labels -->
          <text v-for="(point, idx) in liquidityTrend" :key="'label-'+idx"
            :x="idx * (100/6)" y="175"
            fill="#888" font-size="3" text-anchor="middle" font-family="monospace">
            {{ point.day }}
          </text>
        </svg>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 15px;">
        <div style="padding: 12px; background: #000; border-radius: 6px; border: 1px solid #222; text-align: center;">
          <div style="font-size: 9px; color: #888; margin-bottom: 3px;">AVG LIQUIDITY</div>
          <div style="font-size: 14px; color: #00d4ff; font-weight: 700;">{{ formatLiquidity(trendStats.avg) }}</div>
        </div>
        <div style="padding: 12px; background: #000; border-radius: 6px; border: 1px solid #222; text-align: center;">
          <div style="font-size: 9px; color: #888; margin-bottom: 3px;">PEAK LIQUIDITY</div>
          <div style="font-size: 14px; color: #10eb04; font-weight: 700;">{{ formatLiquidity(trendStats.peak) }}</div>
        </div>
        <div style="padding: 12px; background: #000; border-radius: 6px; border: 1px solid #222; text-align: center;">
          <div style="font-size: 9px; color: #888; margin-bottom: 3px;">LOW LIQUIDITY</div>
          <div style="font-size: 14px; color: #f52a09; font-weight: 700;">{{ formatLiquidity(trendStats.low) }}</div>
        </div>
        <div style="padding: 12px; background: #000; border-radius: 6px; border: 1px solid #222; text-align: center;">
          <div style="font-size: 9px; color: #888; margin-bottom: 3px;">7D CHANGE</div>
          <div :style="{ fontSize: '14px', color: trendStats.change >= 0 ? '#10eb04' : '#f52a09', fontWeight: '700' }">
            {{ trendStats.change >= 0 ? '+' : '' }}{{ trendStats.change }}%
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const selectedSymbol = ref('LCX/USDC');
const symbols = ref(['LCX/USDC', 'BTC/USDC', 'ETH/USDC', 'LCX/USDT', 'BTC/USDT', 'ETH/USDT']);
const lastUpdate = ref('12:34:56');

// Mock metrics - replace with real API data
const metrics = ref({
  bidLiquidity: 2450000,
  askLiquidity: 1890000,
  bidOrders: 342,
  askOrders: 287,
  spread: 0.12,
  totalDepth: 4340000,
  liquidityScore: 78,
  concentrationRatio: 35.7,
  marketImpact: 2.3,
  buyImpact: 1.8,
  sellImpact: 2.7
});

const distribution = ref({
  tier1: 45,
  tier2: 30,
  tier3: 18,
  tier4: 7
});

const heatmapData = ref([
  { time: '00:00', liquidity: 3.2, liquidityShort: '3.2M', intensity: 0.6 },
  { time: '02:00', liquidity: 2.8, liquidityShort: '2.8M', intensity: 0.5 },
  { time: '04:00', liquidity: 2.1, liquidityShort: '2.1M', intensity: 0.3 },
  { time: '06:00', liquidity: 1.9, liquidityShort: '1.9M', intensity: 0.2 },
  { time: '08:00', liquidity: 3.5, liquidityShort: '3.5M', intensity: 0.7 },
  { time: '10:00', liquidity: 4.8, liquidityShort: '4.8M', intensity: 0.9 },
  { time: '12:00', liquidity: 5.2, liquidityShort: '5.2M', intensity: 1.0 },
  { time: '14:00', liquidity: 4.9, liquidityShort: '4.9M', intensity: 0.95 },
  { time: '16:00', liquidity: 4.3, liquidityShort: '4.3M', intensity: 0.8 },
  { time: '18:00', liquidity: 3.7, liquidityShort: '3.7M', intensity: 0.7 },
  { time: '20:00', liquidity: 4.1, liquidityShort: '4.1M', intensity: 0.75 },
  { time: '22:00', liquidity: 3.6, liquidityShort: '3.6M', intensity: 0.65 }
]);

const largeOrders = ref([
  { id: 1, side: 'BID', amount: '84,500 LCX', price: '$0.1245', usdValue: '10,520', time: '2m ago' },
  { id: 2, side: 'ASK', amount: '127,300 LCX', price: '$0.1248', usdValue: '15,887', time: '5m ago' },
  { id: 3, side: 'BID', amount: '215,000 LCX', price: '$0.1243', usdValue: '26,725', time: '8m ago' },
  { id: 4, side: 'ASK', amount: '98,400 LCX', price: '$0.1250', usdValue: '12,300', time: '12m ago' },
  { id: 5, side: 'BID', amount: '156,700 LCX', price: '$0.1244', usdValue: '19,493', time: '15m ago' }
]);

const slippageData = ref([
  { amount: '10K', percentage: 0.23, buySlippage: 0.08, sellSlippage: 0.12 },
  { amount: '50K', percentage: 1.15, buySlippage: 0.34, sellSlippage: 0.47 },
  { amount: '100K', percentage: 2.30, buySlippage: 0.78, sellSlippage: 0.92 },
  { amount: '500K', percentage: 11.52, buySlippage: 3.45, sellSlippage: 4.12 }
]);

const liquidityTrend = ref([
  { day: 'Mon', value: 3800000 },
  { day: 'Tue', value: 4200000 },
  { day: 'Wed', value: 3900000 },
  { day: 'Thu', value: 4500000 },
  { day: 'Fri', value: 4800000 },
  { day: 'Sat', value: 4100000 },
  { day: 'Sun', value: 4340000 }
]);

const spreadStatus = computed(() => {
  const spread = metrics.value.spread;
  if (spread < 0.1) return 'Tight';
  if (spread < 0.5) return 'Normal';
  return 'Wide';
});

const depthQuality = computed(() => {
  const depth = metrics.value.totalDepth;
  if (depth > 5000000) return 'Excellent';
  if (depth > 2000000) return 'Good';
  return 'Fair';
});

const scoreColor = computed(() => {
  const score = metrics.value.liquidityScore;
  if (score >= 70) return '#10eb04';
  if (score >= 40) return '#ffa500';
  return '#f52a09';
});

const scoreRating = computed(() => {
  const score = metrics.value.liquidityScore;
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
});

const impactColor = computed(() => {
  const impact = metrics.value.marketImpact;
  if (impact < 1.5) return '#10eb04';
  if (impact < 3.0) return '#ffa500';
  return '#f52a09';
});

const impactLevel = computed(() => {
  const impact = metrics.value.marketImpact;
  if (impact < 1.5) return 'LOW';
  if (impact < 3.0) return 'MODERATE';
  return 'HIGH';
});

const impactArcPath = computed(() => {
  const impact = metrics.value.marketImpact;
  const maxImpact = 5.0;
  const percentage = Math.min(impact / maxImpact, 1);
  const angle = percentage * 140 - 70;
  const radians = (angle * Math.PI) / 180;
  const x = 100 + 80 * Math.cos(radians + Math.PI);
  const y = 170 + 80 * Math.sin(radians + Math.PI);
  const largeArc = percentage > 0.5 ? 1 : 0;
  return `M 30 170 A 80 80 0 ${largeArc} 1 ${x} ${y}`;
});

const bidPath = computed(() => {
  // Generate cumulative bid depth path - using viewBox coordinates
  let path = 'M 0 250';
  for (let i = 0; i <= 25; i++) {
    const x = (25 - i) / 25 * 50;
    const depth = Math.pow(i / 25, 0.7) * 200;
    path += ` L ${x} ${250 - depth}`;
  }
  path += ' L 50 250 Z';
  return path;
});

const askPath = computed(() => {
  // Generate cumulative ask depth path - using viewBox coordinates
  let path = 'M 50 250';
  for (let i = 0; i <= 25; i++) {
    const x = 50 + (i / 25) * 50;
    const depth = Math.pow(i / 25, 0.7) * 200;
    path += ` L ${x} ${250 - depth}`;
  }
  path += ' L 100 250 Z';
  return path;
});

const maxLiquidity = computed(() => {
  return Math.max(...liquidityTrend.value.map(d => d.value));
});

const liquidityTrendPoints = computed(() => {
  return liquidityTrend.value
    .map((point, idx) => {
      const x = (idx * (100 / 6));
      const y = 180 - (point.value / maxLiquidity.value * 160);
      return `${x},${y}`;
    })
    .join(' ');
});

const trendStats = computed(() => {
  const values = liquidityTrend.value.map(d => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const peak = Math.max(...values);
  const low = Math.min(...values);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / firstValue * 100).toFixed(1);

  return { avg, peak, low, change: parseFloat(change) };
});

const prevValue = (idx) => {
  return idx > 0 ? liquidityTrend.value[idx - 1].value : 0;
};

const formatLiquidity = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toFixed(0);
};

const getHeatColor = (intensity) => {
  if (intensity >= 0.8) return '#10eb04';
  if (intensity >= 0.6) return '#7eb904';
  if (intensity >= 0.4) return '#ffa500';
  if (intensity >= 0.2) return '#ff6600';
  return '#f52a09';
};

const updateTime = () => {
  const now = new Date();
  lastUpdate.value = now.toTimeString().split(' ')[0];
};

let updateInterval;

onMounted(() => {
  updateTime();
  updateInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval);
});
</script>
