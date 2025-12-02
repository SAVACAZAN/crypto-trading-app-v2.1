<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #00d4ff;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">📊</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #00d4ff; font-weight: 700;">ORDER FLOW ANALYSIS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Real-Time Market Microstructure</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <n-select v-model:value="selectedSymbol" :options="symbolOptions" size="small" style="width: 150px;" />
          <n-select v-model:value="selectedTimeframe" :options="timeframeOptions" size="small" style="width: 120px;" />
          <n-button size="small" @click="refreshData" style="background: #00d4ff; border: none;">🔄 REFRESH</n-button>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 15px;">
      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; padding: 12px; border-radius: 6px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">BUY VOLUME</div>
        <div style="font-size: 18px; color: #10eb04; font-weight: 700;">{{ formatVolume(metrics.buyVolume) }}</div>
        <div style="font-size: 8px; color: #666;">{{ metrics.buyPercent }}%</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; padding: 12px; border-radius: 6px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">SELL VOLUME</div>
        <div style="font-size: 18px; color: #f52a09; font-weight: 700;">{{ formatVolume(metrics.sellVolume) }}</div>
        <div style="font-size: 8px; color: #666;">{{ metrics.sellPercent }}%</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; padding: 12px; border-radius: 6px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">BUY/SELL RATIO</div>
        <div :style="`font-size: 18px; font-weight: 700; color: ${metrics.ratio > 1 ? '#10eb04' : '#f52a09'};`">
          {{ metrics.ratio.toFixed(2) }}
        </div>
        <div :style="`font-size: 8px; color: ${metrics.ratio > 1 ? '#10eb04' : '#f52a09'};`">
          {{ metrics.ratio > 1 ? 'BULLISH' : 'BEARISH' }}
        </div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; padding: 12px; border-radius: 6px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">LARGE ORDERS</div>
        <div style="font-size: 18px; color: #f5a623; font-weight: 700;">{{ metrics.largeOrders }}</div>
        <div style="font-size: 8px; color: #666;">> $100K</div>
      </div>
      <div style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2; padding: 12px; border-radius: 6px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">AVG ORDER SIZE</div>
        <div style="font-size: 18px; color: #8a2be2; font-weight: 700;">${{ formatNumber(metrics.avgOrderSize) }}</div>
        <div style="font-size: 8px; color: #666;">Per order</div>
      </div>
      <div style="background: rgba(255,105,180,0.1); border: 1px solid #ff69b4; padding: 12px; border-radius: 6px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">MARKET PRESSURE</div>
        <div :style="`font-size: 18px; font-weight: 700; color: ${marketPressure.color};`">
          {{ marketPressure.value }}
        </div>
        <div :style="`font-size: 8px; color: ${marketPressure.color};`">{{ marketPressure.label }}</div>
      </div>
    </div>

    <!-- Order Flow Imbalance & Delta Volume -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Order Flow Imbalance -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #00d4ff; font-size: 14px; font-weight: 600;">Order Flow Imbalance</div>
          <div style="color: #666; font-size: 9px;">Buy vs Sell pressure over time</div>
        </div>
        <svg viewBox="0 0 800 250" style="width: 100%; height: 250px;">
          <!-- Zero line -->
          <line x1="0" y1="125" x2="800" y2="125" stroke="#666" stroke-width="1" stroke-dasharray="4,4" />

          <!-- Grid lines -->
          <line x1="0" y1="50" x2="800" y2="50" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />

          <!-- Imbalance bars -->
          <g v-for="(imb, index) in orderImbalance" :key="index">
            <rect
              :x="index * 20 + 5"
              :y="imb > 0 ? 125 - (imb * 1.5) : 125"
              width="15"
              :height="Math.abs(imb * 1.5)"
              :fill="imb > 0 ? '#10eb04' : '#f52a09'"
              opacity="0.8"
            />
          </g>

          <!-- Labels -->
          <text x="5" y="45" fill="#10eb04" font-size="10">+50% BUY</text>
          <text x="5" y="130" fill="#666" font-size="10">0%</text>
          <text x="5" y="215" fill="#f52a09" font-size="10">-50% SELL</text>
        </svg>
      </div>

      <!-- Delta Volume -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #10eb04; font-size: 14px; font-weight: 600;">Cumulative Delta Volume</div>
          <div style="color: #666; font-size: 9px;">Net buying/selling pressure</div>
        </div>
        <svg viewBox="0 0 800 250" style="width: 100%; height: 250px;">
          <!-- Grid -->
          <line x1="0" y1="50" x2="800" y2="50" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="125" x2="800" y2="125" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />

          <!-- Delta area -->
          <defs>
            <linearGradient id="deltaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#10eb04;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#10eb04;stop-opacity:0.05" />
            </linearGradient>
          </defs>

          <path
            :d="deltaVolumePath"
            fill="url(#deltaGradient)"
            stroke="#10eb04"
            stroke-width="2"
          />

          <!-- Data points -->
          <circle
            v-for="(delta, index) in deltaVolume"
            :key="index"
            :cx="index * 20"
            :cy="250 - (delta / maxDelta * 200)"
            r="3"
            :fill="delta > 0 ? '#10eb04' : '#f52a09'"
          />
        </svg>
      </div>
    </div>

    <!-- Order Book Heatmap & Large Orders -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Order Book Heatmap -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #f5a623; font-size: 14px; font-weight: 600;">Order Book Heatmap</div>
          <div style="color: #666; font-size: 9px;">Bid/Ask liquidity distribution</div>
        </div>

        <!-- Current Price -->
        <div style="text-align: center; margin-bottom: 10px; padding: 8px; background: rgba(0,212,255,0.1); border-radius: 6px;">
          <div style="font-size: 9px; color: #888;">CURRENT PRICE</div>
          <div style="font-size: 20px; color: #00d4ff; font-weight: 700;">${{ currentPrice.toLocaleString() }}</div>
        </div>

        <!-- Asks (Sell Orders) -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 10px; color: #f52a09; margin-bottom: 6px; font-weight: 600;">ASKS (SELL)</div>
          <div v-for="ask in orderBook.asks.slice(0, 8)" :key="ask.price"
               style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="color: #f52a09; font-size: 10px; width: 80px;">${{ ask.price.toLocaleString() }}</div>
            <div style="flex: 1; height: 16px; background: rgba(245,42,9,0.1); border-radius: 3px; position: relative; overflow: hidden;">
              <div :style="`width: ${(ask.size / maxOrderSize * 100)}%; height: 100%; background: linear-gradient(90deg, rgba(245,42,9,0.3), #f52a09);`"></div>
            </div>
            <div style="color: #888; font-size: 9px; width: 60px; text-align: right;">{{ formatVolume(ask.size) }}</div>
          </div>
        </div>

        <!-- Bids (Buy Orders) -->
        <div>
          <div style="font-size: 10px; color: #10eb04; margin-bottom: 6px; font-weight: 600;">BIDS (BUY)</div>
          <div v-for="bid in orderBook.bids.slice(0, 8)" :key="bid.price"
               style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="color: #10eb04; font-size: 10px; width: 80px;">${{ bid.price.toLocaleString() }}</div>
            <div style="flex: 1; height: 16px; background: rgba(16,235,4,0.1); border-radius: 3px; position: relative; overflow: hidden;">
              <div :style="`width: ${(bid.size / maxOrderSize * 100)}%; height: 100%; background: linear-gradient(90deg, rgba(16,235,4,0.3), #10eb04);`"></div>
            </div>
            <div style="color: #888; font-size: 9px; width: 60px; text-align: right;">{{ formatVolume(bid.size) }}</div>
          </div>
        </div>
      </div>

      <!-- Large Orders Feed -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #f5a623; font-size: 14px; font-weight: 600;">Large Orders Feed</div>
          <div style="color: #666; font-size: 9px;">Significant market orders (> $100K)</div>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
          <div v-for="order in largeOrders" :key="order.id"
               :style="`background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid ${order.side === 'BUY' ? '#10eb04' : '#f52a09'};`">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div :style="`background: ${order.side === 'BUY' ? 'rgba(16,235,4,0.2)' : 'rgba(245,42,9,0.2)'}; padding: 3px 8px; border-radius: 4px; font-size: 9px; color: ${order.side === 'BUY' ? '#10eb04' : '#f52a09'}; font-weight: 600;`">
                  {{ order.side }}
                </div>
                <div style="color: #00d4ff; font-size: 12px; font-weight: 600;">${{ order.value.toLocaleString() }}</div>
              </div>
              <div style="color: #666; font-size: 9px;">{{ order.time }}</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="color: #888; font-size: 10px;">{{ order.size }} @ ${{ order.price.toLocaleString() }}</div>
              <div :style="`font-size: 9px; color: ${order.impact >= 0.5 ? '#f52a09' : '#f5a623'}; font-weight: 600;`">
                {{ order.impact }}% IMPACT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Size Distribution & Trade Aggressiveness -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <!-- Order Size Distribution -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #8a2be2; font-size: 14px; font-weight: 600;">Order Size Distribution</div>
          <div style="color: #666; font-size: 9px;">Volume by order size category</div>
        </div>
        <div style="display: grid; gap: 10px;">
          <div v-for="dist in orderDistribution" :key="dist.label"
               style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div :style="`width: 12px; height: 12px; background: ${dist.color}; border-radius: 3px;`"></div>
                <div style="color: #ccc; font-size: 11px; font-weight: 600;">{{ dist.label }}</div>
              </div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ dist.percentage }}%</div>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
              <div :style="`height: 100%; width: ${dist.percentage}%; background: ${dist.color}; transition: width 0.3s ease;`"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
              <div style="color: #666; font-size: 9px;">{{ dist.range }}</div>
              <div style="color: #888; font-size: 9px;">{{ dist.orders }} orders</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trade Aggressiveness -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #ff69b4; font-size: 14px; font-weight: 600;">Trade Aggressiveness</div>
          <div style="color: #666; font-size: 9px;">Market vs Limit order analysis</div>
        </div>

        <!-- Aggressiveness Gauge -->
        <div style="text-align: center; margin-bottom: 20px;">
          <svg viewBox="0 0 200 120" style="width: 100%; max-width: 300px; margin: 0 auto;">
            <!-- Background arc -->
            <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#333" stroke-width="12" />

            <!-- Colored sections -->
            <path d="M 30 100 A 70 70 0 0 1 100 30" fill="none" stroke="#10eb04" stroke-width="12" opacity="0.3" />
            <path d="M 100 30 A 70 70 0 0 1 170 100" fill="none" stroke="#f52a09" stroke-width="12" opacity="0.3" />

            <!-- Current level arc -->
            <path :d="aggressivenessArc" fill="none" :stroke="aggressivenessColor" stroke-width="12" stroke-linecap="round" />

            <!-- Needle -->
            <line :x1="100" :y1="100" :x2="needleX" :y2="needleY" stroke="#00d4ff" stroke-width="3" />
            <circle cx="100" cy="100" r="8" fill="#00d4ff" />
          </svg>

          <div style="margin-top: 15px;">
            <div style="font-size: 10px; color: #888; margin-bottom: 4px;">AGGRESSIVENESS LEVEL</div>
            <div :style="`font-size: 24px; font-weight: 700; color: ${aggressivenessColor};`">
              {{ aggressivenessScore }}%
            </div>
            <div :style="`font-size: 11px; color: ${aggressivenessColor}; margin-top: 4px;`">
              {{ aggressivenessLabel }}
            </div>
          </div>
        </div>

        <!-- Order Type Breakdown -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 9px; color: #888; margin-bottom: 4px;">MARKET ORDERS</div>
            <div style="font-size: 18px; color: #f52a09; font-weight: 700;">{{ orderTypes.market }}%</div>
            <div style="font-size: 8px; color: #666;">Aggressive</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 9px; color: #888; margin-bottom: 4px;">LIMIT ORDERS</div>
            <div style="font-size: 18px; color: #10eb04; font-weight: 700;">{{ orderTypes.limit }}%</div>
            <div style="font-size: 8px; color: #666;">Passive</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const userID = useCookie('userID');
const selectedSymbol = ref('BTC/USDC');
const selectedTimeframe = ref('1h');
const loadingData = ref(false);

const symbolOptions = [
  { label: 'BTC/USDC', value: 'BTC/USDC' },
  { label: 'ETH/USDC', value: 'ETH/USDC' },
  { label: 'LCX/USDC', value: 'LCX/USDC' }
];

const timeframeOptions = [
  { label: '1 Hour', value: '1h' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Day', value: '1d' }
];

const metrics = ref({
  buyVolume: 12450000,
  sellVolume: 8920000,
  buyPercent: 58.3,
  sellPercent: 41.7,
  ratio: 1.40,
  largeOrders: 127,
  avgOrderSize: 8450
});

const currentPrice = ref(95420);

const orderImbalance = ref([
  25, 30, 15, -10, -20, -15, 10, 35, 40, 20, -5, -25, -30, -10, 15, 25, 30, 20, -15, -20,
  10, 35, 25, -10, -25, -15, 20, 30, 15, -5, -20, -30, 25, 40, 20, 10, -15, -25, 15, 30
]);

const deltaVolume = ref([
  5000, 8000, 12000, 10000, 7000, 5000, 8000, 15000, 20000, 18000,
  15000, 12000, 10000, 8000, 10000, 15000, 18000, 22000, 25000, 23000,
  20000, 18000, 15000, 12000, 15000, 20000, 25000, 28000, 30000, 28000,
  25000, 22000, 20000, 18000, 20000, 25000, 30000, 35000, 38000, 40000
]);

const orderBook = ref({
  asks: [
    { price: 95430, size: 2.5 },
    { price: 95435, size: 1.8 },
    { price: 95440, size: 3.2 },
    { price: 95445, size: 1.5 },
    { price: 95450, size: 4.1 },
    { price: 95455, size: 2.3 },
    { price: 95460, size: 3.8 },
    { price: 95465, size: 1.9 }
  ],
  bids: [
    { price: 95415, size: 3.1 },
    { price: 95410, size: 2.7 },
    { price: 95405, size: 1.6 },
    { price: 95400, size: 4.5 },
    { price: 95395, size: 2.2 },
    { price: 95390, size: 3.4 },
    { price: 95385, size: 1.8 },
    { price: 95380, size: 2.9 }
  ]
});

const largeOrders = ref([
  { id: 1, side: 'BUY', size: 15.5, price: 95420, value: 1479010, impact: 0.8, time: '2s ago' },
  { id: 2, side: 'SELL', size: 22.3, price: 95425, value: 2127998, impact: 1.2, time: '8s ago' },
  { id: 3, side: 'BUY', size: 18.7, price: 95415, value: 1784261, impact: 0.9, time: '15s ago' },
  { id: 4, side: 'BUY', size: 12.4, price: 95422, value: 1183233, impact: 0.6, time: '22s ago' },
  { id: 5, side: 'SELL', size: 25.8, price: 95430, value: 2462094, impact: 1.4, time: '35s ago' },
  { id: 6, side: 'BUY', size: 14.2, price: 95418, value: 1354936, impact: 0.7, time: '42s ago' }
]);

const orderDistribution = ref([
  { label: 'Micro (<$1K)', percentage: 15.3, range: '$0 - $1K', orders: 2845, color: '#666' },
  { label: 'Small ($1K-$10K)', percentage: 28.7, range: '$1K - $10K', orders: 1524, color: '#00d4ff' },
  { label: 'Medium ($10K-$50K)', percentage: 32.5, range: '$10K - $50K', orders: 682, color: '#10eb04' },
  { label: 'Large ($50K-$100K)', percentage: 16.2, range: '$50K - $100K', orders: 145, color: '#f5a623' },
  { label: 'Whale (>$100K)', percentage: 7.3, range: '> $100K', orders: 48, color: '#f52a09' }
]);

const orderTypes = ref({
  market: 35,
  limit: 65
});

const aggressivenessScore = ref(62);

const marketPressure = computed(() => {
  const ratio = metrics.value.ratio;
  if (ratio > 1.5) return { value: 'HIGH', label: 'Strong Buy', color: '#10eb04' };
  if (ratio > 1.2) return { value: 'MODERATE', label: 'Buy Pressure', color: '#00d4ff' };
  if (ratio > 0.8) return { value: 'NEUTRAL', label: 'Balanced', color: '#f5a623' };
  if (ratio > 0.5) return { value: 'MODERATE', label: 'Sell Pressure', color: '#f52a09' };
  return { value: 'HIGH', label: 'Strong Sell', color: '#f52a09' };
});

const maxOrderSize = computed(() => {
  const allSizes = [...orderBook.value.asks, ...orderBook.value.bids].map(o => o.size);
  return Math.max(...allSizes);
});

const maxDelta = computed(() => Math.max(...deltaVolume.value));

const deltaVolumePath = computed(() => {
  const points = deltaVolume.value.map((delta, index) => {
    const x = index * 20;
    const y = 250 - (delta / maxDelta.value * 200);
    return `${x},${y}`;
  });
  return `M 0,250 L ${points.join(' L ')} L 800,250 Z`;
});

const aggressivenessColor = computed(() => {
  const score = aggressivenessScore.value;
  if (score > 70) return '#f52a09';
  if (score > 50) return '#f5a623';
  if (score > 30) return '#00d4ff';
  return '#10eb04';
});

const aggressivenessLabel = computed(() => {
  const score = aggressivenessScore.value;
  if (score > 70) return 'Very Aggressive';
  if (score > 50) return 'Aggressive';
  if (score > 30) return 'Moderate';
  return 'Passive';
});

const aggressivenessArc = computed(() => {
  const score = aggressivenessScore.value;
  const angle = 30 + (score / 100) * 120; // 30° to 150°
  const endX = 100 + 70 * Math.cos((angle * Math.PI) / 180);
  const endY = 100 - 70 * Math.sin((angle * Math.PI) / 180);
  const largeArc = angle - 30 > 60 ? 1 : 0;
  return `M 30 100 A 70 70 0 ${largeArc} 1 ${endX} ${endY}`;
});

const needleX = computed(() => {
  const angle = 30 + (aggressivenessScore.value / 100) * 120;
  return 100 + 60 * Math.cos((angle * Math.PI) / 180);
});

const needleY = computed(() => {
  const angle = 30 + (aggressivenessScore.value / 100) * 120;
  return 100 - 60 * Math.sin((angle * Math.PI) / 180);
});

const formatVolume = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(2);
};

const formatNumber = (num) => {
  return num.toLocaleString();
};

// Load real order book data
const loadRealOrderBook = async () => {
  try {
    loadingData.value = true;
    console.log(`📊 Loading real order book for ${selectedSymbol.value}...`);

    // Get user's selected exchange and API key
    const app = useAppStore();
    const exchange = app.getUserSelectedExchange || 'coinbaseadvanced';
    const apiKeyName = app.getSelectedApiKeys?.[0] || null;

    if (!apiKeyName) {
      console.log('⚠️ No API key selected, using mock data');
      return;
    }

    // Fetch real order book
    const orderBookResponse = await $fetch('/api/v1/fetchOrderBook', {
      query: {
        userID: userID.value,
        exchange: exchange,
        apiKeyName: apiKeyName,
        symbol: selectedSymbol.value,
        limit: 20
      }
    });

    if (orderBookResponse && orderBookResponse.data) {
      console.log('✅ Loaded real order book data');

      // Update order book with real data
      if (orderBookResponse.data.asks && orderBookResponse.data.bids) {
        orderBook.value.asks = orderBookResponse.data.asks.slice(0, 8).map(ask => ({
          price: ask[0],
          size: ask[1]
        }));

        orderBook.value.bids = orderBookResponse.data.bids.slice(0, 8).map(bid => ({
          price: bid[0],
          size: bid[1]
        }));

        // Update current price (midpoint)
        if (orderBook.value.asks.length > 0 && orderBook.value.bids.length > 0) {
          currentPrice.value = (orderBook.value.asks[0].price + orderBook.value.bids[0].price) / 2;
        }

        console.log(`💰 Current Price: $${currentPrice.value.toLocaleString()}`);
      }
    }
  } catch (error) {
    console.error('❌ Error loading order book:', error);
  } finally {
    loadingData.value = false;
  }
};

const refreshData = async () => {
  console.log('Refreshing order flow data...');
  await loadRealOrderBook();

  // Simulate metrics refresh (TODO: calculate from real orders)
  metrics.value.ratio = (Math.random() * 2 + 0.5).toFixed(2);
  aggressivenessScore.value = Math.floor(Math.random() * 40 + 30);
};

onMounted(async () => {
  console.log('📊 OrderFlow loaded - connecting to real data');

  // Load initial real data
  await loadRealOrderBook();

  // Auto-refresh every 5 seconds
  setInterval(refreshData, 5000);
});
</script>
