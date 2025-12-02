<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f5a623;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">📊</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #f5a623; font-weight: 700;">VOLUME PROFILE</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">{{ selectedPair }} • {{ selectedTimeframe }} • POC: ${{ pointOfControl.toLocaleString() }}</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <n-button size="small" @click="refreshData" style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); color: #f5a623;">
            Refresh
          </n-button>
          <n-button size="small" @click="exportData" style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); color: #f5a623;">
            Export CSV
          </n-button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">POINT OF CONTROL</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">${{ pointOfControl.toLocaleString() }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">VALUE AREA HIGH</div>
        <div style="color: #10eb04; font-size: 18px; font-weight: 700;">${{ valueAreaHigh.toLocaleString() }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">VALUE AREA LOW</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">${{ valueAreaLow.toLocaleString() }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">TOTAL VOLUME</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">{{ formatVolume(totalVolume) }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">VALUE AREA %</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">70%</div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Trading Pair</div>
        <n-select v-model:value="selectedPair" :options="pairOptions" size="small" @update:value="refreshData" />
      </div>
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Timeframe</div>
        <n-select v-model:value="selectedTimeframe" :options="timeframeOptions" size="small" @update:value="refreshData" />
      </div>
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Profile Type</div>
        <n-select v-model:value="profileType" :options="profileTypeOptions" size="small" />
      </div>
    </div>

    <!-- Volume Profile Chart & Analysis -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">

      <!-- Volume Profile Visualization -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #f5a623; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📊</span>
          <span>VOLUME PROFILE CHART</span>
        </div>

        <!-- Volume Profile Bars -->
        <div style="position: relative; height: 500px; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 10px;">

          <!-- Price Levels (Y-axis) -->
          <div style="position: absolute; left: 10px; top: 10px; bottom: 10px; width: 80px; display: flex; flex-direction: column; justify-content: space-between;">
            <div v-for="level in priceLevels" :key="level.price" style="color: #888; font-size: 10px; text-align: right;">
              ${{ level.price.toLocaleString() }}
            </div>
          </div>

          <!-- Volume Bars -->
          <div style="position: absolute; left: 100px; right: 10px; top: 10px; bottom: 10px; display: flex; flex-direction: column-reverse; justify-content: space-between;">
            <div v-for="level in priceLevels" :key="level.price"
              style="display: flex; align-items: center; height: 19px; position: relative;">

              <!-- Volume Bar -->
              <div :style="`
                width: ${level.volumePercent}%;
                height: 100%;
                background: ${getVolumeBarColor(level)};
                border-radius: 3px;
                transition: all 0.3s;
                cursor: pointer;
              `"
              :title="`Price: $${level.price} | Volume: ${formatVolume(level.volume)}`"
              @mouseenter="hoveredLevel = level.price"
              @mouseleave="hoveredLevel = null"
              ></div>

              <!-- POC Marker -->
              <div v-if="level.price === pointOfControl"
                style="position: absolute; left: -10px; width: calc(100% + 20px); height: 100%; border: 2px solid #f5a623; border-radius: 3px; pointer-events: none;">
              </div>

              <!-- Value Area Markers -->
              <div v-if="level.price >= valueAreaLow && level.price <= valueAreaHigh"
                style="position: absolute; left: -5px; width: calc(100% + 10px); height: 100%; border: 1px dashed rgba(245,166,35,0.3); border-radius: 3px; pointer-events: none;">
              </div>

              <!-- Volume Label -->
              <div v-if="hoveredLevel === level.price"
                style="position: absolute; right: -80px; color: #fff; font-size: 10px; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px; white-space: nowrap;">
                {{ formatVolume(level.volume) }}
              </div>

            </div>
          </div>

          <!-- Legend -->
          <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 6px; border: 1px solid rgba(245,166,35,0.3);">
            <div style="color: #f5a623; font-size: 10px; font-weight: 700; margin-bottom: 6px;">LEGEND</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <div style="width: 20px; height: 12px; background: #f5a623; border-radius: 2px;"></div>
              <div style="color: #888; font-size: 9px;">POC</div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <div style="width: 20px; height: 12px; background: rgba(245,166,35,0.4); border: 1px dashed rgba(245,166,35,0.6); border-radius: 2px;"></div>
              <div style="color: #888; font-size: 9px;">Value Area</div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <div style="width: 20px; height: 12px; background: #10eb04; border-radius: 2px;"></div>
              <div style="color: #888; font-size: 9px;">Buy Volume</div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 20px; height: 12px; background: #f52a09; border-radius: 2px;"></div>
              <div style="color: #888; font-size: 9px;">Sell Volume</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Key Levels Analysis -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #f5a623; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>🎯</span>
          <span>KEY LEVELS</span>
        </div>

        <!-- Point of Control -->
        <div style="background: rgba(245,166,35,0.2); border: 1px solid rgba(245,166,35,0.5); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #f5a623; font-size: 11px; font-weight: 700; margin-bottom: 6px;">POINT OF CONTROL</div>
          <div style="color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 4px;">${{ pointOfControl.toLocaleString() }}</div>
          <div style="color: #888; font-size: 9px;">Highest volume price level</div>
        </div>

        <!-- Value Area High -->
        <div style="background: rgba(16,235,4,0.1); border: 1px solid rgba(16,235,4,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #10eb04; font-size: 11px; font-weight: 700; margin-bottom: 6px;">VALUE AREA HIGH</div>
          <div style="color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 4px;">${{ valueAreaHigh.toLocaleString() }}</div>
          <div style="color: #888; font-size: 9px;">70% volume upper bound</div>
        </div>

        <!-- Value Area Low -->
        <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 6px;">VALUE AREA LOW</div>
          <div style="color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 4px;">${{ valueAreaLow.toLocaleString() }}</div>
          <div style="color: #888; font-size: 9px;">70% volume lower bound</div>
        </div>

        <!-- Value Area Range -->
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #888; font-size: 11px; font-weight: 700; margin-bottom: 6px;">VALUE AREA RANGE</div>
          <div style="color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 4px;">${{ valueAreaRange.toLocaleString() }}</div>
          <div style="color: #888; font-size: 9px;">{{ valueAreaRangePercent.toFixed(2) }}% of POC</div>
        </div>

        <!-- Trading Strategy -->
        <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f5a623; font-size: 11px; font-weight: 700; margin-bottom: 8px;">TRADING SIGNALS</div>
          <div v-for="signal in tradingSignals" :key="signal.type"
            style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div :style="`color: ${signal.color}; font-size: 10px;`">{{ signal.icon }}</div>
            <div style="color: #888; font-size: 9px; line-height: 1.3;">{{ signal.text }}</div>
          </div>
        </div>

      </div>

    </div>

    <!-- Volume Distribution -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f5a623; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>📈</span>
        <span>VOLUME DISTRIBUTION ANALYSIS</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">

        <div style="background: rgba(16,235,4,0.1); border: 1px solid rgba(16,235,4,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">BUY VOLUME</div>
          <div style="color: #10eb04; font-size: 16px; font-weight: 700; margin-bottom: 4px;">{{ formatVolume(buyVolume) }}</div>
          <div style="color: #888; font-size: 9px;">{{ buyVolumePercent.toFixed(1) }}% of total</div>
        </div>

        <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SELL VOLUME</div>
          <div style="color: #f52a09; font-size: 16px; font-weight: 700; margin-bottom: 4px;">{{ formatVolume(sellVolume) }}</div>
          <div style="color: #888; font-size: 9px;">{{ sellVolumePercent.toFixed(1) }}% of total</div>
        </div>

        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">VOLUME DELTA</div>
          <div :style="`color: ${volumeDelta > 0 ? '#10eb04' : '#f52a09'}; font-size: 16px; font-weight: 700; margin-bottom: 4px;`">
            {{ volumeDelta > 0 ? '+' : '' }}{{ formatVolume(volumeDelta) }}
          </div>
          <div style="color: #888; font-size: 9px;">Buy - Sell pressure</div>
        </div>

        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">MARKET SENTIMENT</div>
          <div :style="`color: ${marketSentiment === 'Bullish' ? '#10eb04' : marketSentiment === 'Bearish' ? '#f52a09' : '#f5a623'}; font-size: 16px; font-weight: 700; margin-bottom: 4px;`">
            {{ marketSentiment }}
          </div>
          <div style="color: #888; font-size: 9px;">Based on volume delta</div>
        </div>

      </div>
    </div>

    <!-- Volume Nodes (High Volume Levels) -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f5a623; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>🔥</span>
          <span>HIGH VOLUME NODES (SUPPORT/RESISTANCE)</span>
        </div>
        <div style="color: #888; font-size: 11px;">{{ volumeNodes.length }} nodes</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
        <div v-for="node in volumeNodes" :key="node.price"
          style="background: rgba(0,0,0,0.3); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div>
              <div style="color: #f5a623; font-size: 13px; font-weight: 700;">${{ node.price.toLocaleString() }}</div>
              <div style="color: #888; font-size: 9px;">{{ node.type }}</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #fff; font-size: 11px; font-weight: 700;">{{ formatVolume(node.volume) }}</div>
              <div style="color: #888; font-size: 9px;">{{ node.volumePercent }}%</div>
            </div>
          </div>
          <div style="height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden;">
            <div :style="`width: ${node.volumePercent}%; height: 100%; background: ${node.color};`"></div>
          </div>
          <div style="color: #888; font-size: 9px; margin-top: 6px;">{{ node.description }}</div>
        </div>
      </div>
    </div>

    <!-- Volume Profile Tips -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,166,35,0.3); padding: 15px; border-radius: 8px;">
      <div style="color: #f5a623; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>💡</span>
        <span>VOLUME PROFILE TRADING TIPS</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f5a623; font-size: 11px; font-weight: 700; margin-bottom: 6px;">POC as Support/Resistance</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">The Point of Control acts as a strong magnet for price. Expect price to revisit POC frequently.</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f5a623; font-size: 11px; font-weight: 700; margin-bottom: 6px;">Value Area Trading</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Price tends to stay within the Value Area (70% of volume). Breakouts can be significant.</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f5a623; font-size: 11px; font-weight: 700; margin-bottom: 6px;">High Volume Nodes</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Areas with high volume act as strong support/resistance. Use for entry/exit points.</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f5a623; font-size: 11px; font-weight: 700; margin-bottom: 6px;">Low Volume Nodes</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Price moves quickly through low volume areas. Good for stop-loss placement.</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

// State
const selectedPair = ref('BTC/USDT');
const selectedTimeframe = ref('1D');
const profileType = ref('Session');
const hoveredLevel = ref(null);

// Options
const pairOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'BNB/USDT', value: 'BNB/USDT' },
  { label: 'SOL/USDT', value: 'SOL/USDT' },
  { label: 'ADA/USDT', value: 'ADA/USDT' }
];

const timeframeOptions = [
  { label: '1 Hour', value: '1H' },
  { label: '4 Hours', value: '4H' },
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' }
];

const profileTypeOptions = [
  { label: 'Session Profile', value: 'Session' },
  { label: 'Fixed Range', value: 'Fixed' },
  { label: 'Composite Profile', value: 'Composite' }
];

// Generate volume profile data
const generateVolumeProfile = () => {
  const levels = [];
  const basePrice = 45000;
  const priceStep = 200;
  const numLevels = 26;

  for (let i = 0; i < numLevels; i++) {
    const price = basePrice + (i - 13) * priceStep;

    // Create bell curve distribution for volume
    const distanceFromCenter = Math.abs(i - 13);
    const volumeMultiplier = Math.exp(-Math.pow(distanceFromCenter, 2) / 30);

    // Add some randomness
    const randomFactor = 0.7 + Math.random() * 0.6;
    const volume = 1000000 * volumeMultiplier * randomFactor;

    // Buy/Sell ratio
    const buyRatio = 0.45 + Math.random() * 0.1;

    levels.push({
      price: price,
      volume: volume,
      buyVolume: volume * buyRatio,
      sellVolume: volume * (1 - buyRatio)
    });
  }

  return levels;
};

const priceLevels = ref(generateVolumeProfile());

// Calculations
const totalVolume = computed(() => {
  return priceLevels.value.reduce((sum, level) => sum + level.volume, 0);
});

const maxVolume = computed(() => {
  return Math.max(...priceLevels.value.map(l => l.volume));
});

const pointOfControl = computed(() => {
  const pocLevel = priceLevels.value.reduce((max, level) =>
    level.volume > max.volume ? level : max
  , priceLevels.value[0]);
  return pocLevel.price;
});

const valueAreaHigh = computed(() => {
  return pointOfControl.value + 1200;
});

const valueAreaLow = computed(() => {
  return pointOfControl.value - 1000;
});

const valueAreaRange = computed(() => {
  return valueAreaHigh.value - valueAreaLow.value;
});

const valueAreaRangePercent = computed(() => {
  return (valueAreaRange.value / pointOfControl.value) * 100;
});

const buyVolume = computed(() => {
  return priceLevels.value.reduce((sum, level) => sum + level.buyVolume, 0);
});

const sellVolume = computed(() => {
  return priceLevels.value.reduce((sum, level) => sum + level.sellVolume, 0);
});

const buyVolumePercent = computed(() => {
  return (buyVolume.value / totalVolume.value) * 100;
});

const sellVolumePercent = computed(() => {
  return (sellVolume.value / totalVolume.value) * 100;
});

const volumeDelta = computed(() => {
  return buyVolume.value - sellVolume.value;
});

const marketSentiment = computed(() => {
  const delta = volumeDelta.value;
  if (delta > totalVolume.value * 0.05) return 'Bullish';
  if (delta < -totalVolume.value * 0.05) return 'Bearish';
  return 'Neutral';
});

// Add volume percent to each level
priceLevels.value.forEach(level => {
  level.volumePercent = (level.volume / maxVolume.value) * 100;
});

// Volume bar color based on buy/sell ratio
const getVolumeBarColor = (level) => {
  const buyRatio = level.buyVolume / level.volume;

  if (level.price === pointOfControl.value) {
    return '#f5a623';
  }

  if (buyRatio > 0.55) {
    return `rgba(16,235,4,${0.3 + buyRatio * 0.5})`;
  } else if (buyRatio < 0.45) {
    return `rgba(245,42,9,${0.3 + (1 - buyRatio) * 0.5})`;
  }

  return 'rgba(245,166,35,0.4)';
};

// High Volume Nodes
const volumeNodes = computed(() => {
  const threshold = maxVolume.value * 0.7;
  const nodes = priceLevels.value
    .filter(level => level.volume >= threshold)
    .map(level => {
      const isAbovePOC = level.price > pointOfControl.value;
      return {
        price: level.price,
        volume: level.volume,
        volumePercent: ((level.volume / maxVolume.value) * 100).toFixed(1),
        type: level.price === pointOfControl.value ? 'POC' : isAbovePOC ? 'Resistance' : 'Support',
        color: level.price === pointOfControl.value ? '#f5a623' : isAbovePOC ? '#f52a09' : '#10eb04',
        description: level.price === pointOfControl.value
          ? 'Highest volume - strong magnet for price'
          : `High volume ${isAbovePOC ? 'resistance' : 'support'} zone`
      };
    });

  return nodes;
});

// Trading Signals
const tradingSignals = computed(() => {
  const currentPrice = pointOfControl.value + 300; // Simulate current price
  const signals = [];

  if (currentPrice < valueAreaLow.value) {
    signals.push({
      icon: '🟢',
      color: '#10eb04',
      text: 'Price below Value Area - potential BUY opportunity',
      type: 'buy'
    });
  } else if (currentPrice > valueAreaHigh.value) {
    signals.push({
      icon: '🔴',
      color: '#f52a09',
      text: 'Price above Value Area - potential SELL opportunity',
      type: 'sell'
    });
  } else {
    signals.push({
      icon: '🟡',
      color: '#f5a623',
      text: 'Price within Value Area - wait for breakout',
      type: 'neutral'
    });
  }

  if (marketSentiment.value === 'Bullish') {
    signals.push({
      icon: '📈',
      color: '#10eb04',
      text: 'Bullish volume delta - buyers in control',
      type: 'bullish'
    });
  } else if (marketSentiment.value === 'Bearish') {
    signals.push({
      icon: '📉',
      color: '#f52a09',
      text: 'Bearish volume delta - sellers in control',
      type: 'bearish'
    });
  }

  return signals;
});

// Helper functions
const formatVolume = (volume) => {
  if (volume >= 1000000000) {
    return (volume / 1000000000).toFixed(2) + 'B';
  } else if (volume >= 1000000) {
    return (volume / 1000000).toFixed(2) + 'M';
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(2) + 'K';
  }
  return volume.toFixed(2);
};

const refreshData = () => {
  priceLevels.value = generateVolumeProfile();
  priceLevels.value.forEach(level => {
    level.volumePercent = (level.volume / maxVolume.value) * 100;
  });
};

const exportData = () => {
  const csv = priceLevels.value.map(level =>
    `${level.price},${level.volume},${level.buyVolume},${level.sellVolume}`
  ).join('\n');

  const blob = new Blob([`Price,Volume,Buy Volume,Sell Volume\n${csv}`], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `volume_profile_${selectedPair.value}_${Date.now()}.csv`;
  a.click();
};

// Auto-refresh
let refreshInterval = null;

onMounted(() => {
  refreshInterval = setInterval(() => {
    refreshData();
  }, 30000); // Refresh every 30 seconds
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
