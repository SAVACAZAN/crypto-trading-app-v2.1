<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f5a623;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none; transition: color 0.3s;">
            ←
          </NuxtLink>
          <div style="font-size: 24px;">📊</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #f5a623; font-weight: 700;">FAZA 3: REAL-TIME ANALYTICS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Multi-Timeframe Intelligence Dashboard</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #10eb04; box-shadow: 0 0 10px rgba(16,235,4,0.5); animation: pulse 2s infinite;"></div>
          <span style="color: #10eb04; font-size: 12px; font-weight: 600;">LIVE UPDATES</span>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Multi-Timeframe Analysis -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="color: #f5a623; font-size: 14px; font-weight: 600;">📈 MULTI-TIMEFRAME CORRELATION</div>
          <n-select v-model:value="selectedSymbol" :options="symbolOptions" size="small" style="width: 150px;" />
        </div>

        <!-- Timeframe Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          <div v-for="tf in timeframes" :key="tf.name"
               :style="`background: ${getTfBackground(tf.signal)}; border: 1px solid ${getTfBorderColor(tf.signal)}; padding: 12px; border-radius: 6px;`">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="color: #ccc; font-size: 11px; font-weight: 600;">{{ tf.name }}</div>
              <div :style="`font-size: 18px;`">{{ getTfIcon(tf.signal) }}</div>
            </div>

            <!-- RSI -->
            <div style="margin-bottom: 6px;">
              <div style="font-size: 8px; color: #888; margin-bottom: 3px;">RSI</div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div :style="`flex: 1; height: 6px; background: #222; border-radius: 3px; overflow: hidden;`">
                  <div :style="`width: ${tf.rsi}%; height: 100%; background: ${getRsiBarColor(tf.rsi)}; transition: all 0.3s;`"></div>
                </div>
                <span :style="`font-size: 10px; font-weight: 700; color: ${getRsiColor(tf.rsi)}; min-width: 28px;`">{{ tf.rsi }}</span>
              </div>
            </div>

            <!-- MACD -->
            <div style="margin-bottom: 6px;">
              <div style="font-size: 8px; color: #888; margin-bottom: 3px;">MACD</div>
              <div :style="`font-size: 10px; font-weight: 600; color: ${tf.macd > 0 ? '#10eb04' : '#f52a09'};`">
                {{ tf.macd > 0 ? '▲' : '▼' }} {{ tf.macd > 0 ? 'BULLISH' : 'BEARISH' }}
              </div>
            </div>

            <!-- Volume -->
            <div>
              <div style="font-size: 8px; color: #888; margin-bottom: 3px;">VOLUME</div>
              <div :style="`font-size: 10px; font-weight: 600; color: ${tf.volume > 0 ? '#00d4ff' : '#666'};`">
                {{ tf.volume > 0 ? '+' : '' }}{{ tf.volume }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Signal -->
        <div :style="`background: ${getOverallSignalBg()}; border: 2px solid ${getOverallSignalColor()}; padding: 15px; border-radius: 8px; margin-top: 12px; text-align: center;`">
          <div style="font-size: 10px; color: #888; margin-bottom: 6px;">OVERALL SIGNAL</div>
          <div :style="`font-size: 24px; font-weight: 700; color: ${getOverallSignalColor()}; margin-bottom: 6px;`">
            {{ overallSignal }}
          </div>
          <div style="font-size: 11px; color: #ccc;">
            {{ alignedTimeframes }}/{{ timeframes.length }} timeframes aligned
          </div>
        </div>
      </div>

      <!-- Live Signals Feed -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
        <div style="color: #10eb04; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⚡ LIVE SIGNALS</div>

        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
          <div v-for="signal in liveSignals" :key="signal.id"
               :style="`background: ${signal.type === 'BUY' ? 'rgba(16,235,4,0.1)' : 'rgba(245,42,9,0.1)'}; border-left: 3px solid ${signal.type === 'BUY' ? '#10eb04' : '#f52a09'}; padding: 10px; border-radius: 4px;`">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <div :style="`color: ${signal.type === 'BUY' ? '#10eb04' : '#f52a09'}; font-size: 12px; font-weight: 700;`">
                {{ signal.type }} SIGNAL
              </div>
              <div style="color: #888; font-size: 9px;">{{ formatTime(signal.timestamp) }}</div>
            </div>
            <div style="color: #ccc; font-size: 10px; margin-bottom: 4px;">{{ signal.symbol }} • {{ signal.timeframe }}</div>
            <div style="color: #888; font-size: 9px;">{{ signal.reason }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bot Chain Visualization -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <div style="color: #00d4ff; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⛓️ ACTIVE BOT CHAINS</div>

      <div v-if="activeChains.length > 0" style="display: flex; flex-direction: column; gap: 12px;">
        <div v-for="chain in activeChains" :key="chain.id"
             style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; border: 1px solid #0f3460;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="color: #00d4ff; font-size: 13px; font-weight: 600;">{{ chain.name }}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div :style="`padding: 4px 8px; background: ${chain.status === 'active' ? 'rgba(16,235,4,0.2)' : 'rgba(102,102,102,0.2)'}; border-radius: 4px; font-size: 9px; color: ${chain.status === 'active' ? '#10eb04' : '#666'}; font-weight: 600;`">
                {{ chain.status.toUpperCase() }}
              </div>
            </div>
          </div>

          <!-- Chain Flow Visualization -->
          <div style="display: flex; align-items: center; gap: 10px; overflow-x: auto; padding: 10px 0;">
            <div v-for="(node, index) in chain.nodes" :key="index" style="display: flex; align-items: center; gap: 10px;">
              <!-- Node Box -->
              <div :style="`min-width: 120px; background: ${getNodeBg(node.status)}; border: 2px solid ${getNodeBorder(node.status)}; padding: 10px; border-radius: 6px;`">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <div style="color: #aaa; font-size: 9px; font-weight: 600;">{{ node.type }}</div>
                  <div style="font-size: 14px;">{{ getNodeStatusIcon(node.status) }}</div>
                </div>
                <div style="color: #fff; font-size: 11px; font-weight: 600; margin-bottom: 4px;">{{ node.strategy }}</div>
                <div v-if="node.profit" :style="`font-size: 10px; font-weight: 700; color: ${node.profit >= 0 ? '#10eb04' : '#f52a09'};`">
                  {{ node.profit >= 0 ? '+' : '' }}{{ node.profit }}%
                </div>
              </div>

              <!-- Arrow -->
              <div v-if="index < chain.nodes.length - 1" style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <div style="color: #00d4ff; font-size: 20px;">→</div>
                <div style="font-size: 8px; color: #666; white-space: nowrap;">{{ node.triggerCondition }}</div>
              </div>
            </div>
          </div>

          <!-- Chain Stats -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px;">
            <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
              <div style="font-size: 8px; color: #888;">PROGRESS</div>
              <div style="font-size: 12px; color: #00d4ff; font-weight: 700;">{{ chain.progress }}%</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
              <div style="font-size: 8px; color: #888;">CURRENT NODE</div>
              <div style="font-size: 12px; color: #f5a623; font-weight: 700;">{{ chain.currentNode }}</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
              <div style="font-size: 8px; color: #888;">TOTAL PROFIT</div>
              <div :style="`font-size: 12px; font-weight: 700; color: ${chain.totalProfit >= 0 ? '#10eb04' : '#f52a09'};`">
                {{ chain.totalProfit >= 0 ? '+' : '' }}{{ chain.totalProfit }}%
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
              <div style="font-size: 8px; color: #888;">RUNTIME</div>
              <div style="font-size: 12px; color: #ccc; font-weight: 700;">{{ chain.runtime }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 30px; color: #666;">
        <div style="font-size: 36px; margin-bottom: 10px;">⛓️</div>
        <div style="font-size: 12px;">No active bot chains</div>
      </div>
    </div>

    <!-- Event Log -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 600; margin-bottom: 12px;">📝 EVENT LOG</div>

      <div style="max-height: 300px; overflow-y: auto;">
        <div v-for="event in eventLog" :key="event.id"
             style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-bottom: 1px solid #0f3460;">
          <div style="color: #888; font-size: 10px; min-width: 70px;">{{ formatTime(event.timestamp) }}</div>
          <div :style="`width: 8px; height: 8px; border-radius: 50%; background: ${getEventColor(event.type)}; margin-top: 4px;`"></div>
          <div style="flex: 1;">
            <div :style="`color: ${getEventColor(event.type)}; font-size: 11px; font-weight: 600; margin-bottom: 2px;`">
              {{ event.title }}
            </div>
            <div style="color: #aaa; font-size: 10px;">{{ event.description }}</div>
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

const symbolOptions = [
  { label: 'LCX/USDC', value: 'LCX/USDC' },
  { label: 'BTC/USDC', value: 'BTC/USDC' },
  { label: 'ETH/USDC', value: 'ETH/USDC' }
];

const timeframes = ref([
  { name: '1m', signal: 'bearish', rsi: 28, macd: -0.3, volume: -15 },
  { name: '5m', signal: 'neutral', rsi: 45, macd: 0.1, volume: 5 },
  { name: '15m', signal: 'bullish', rsi: 65, macd: 0.8, volume: 32 },
  { name: '1h', signal: 'bullish', rsi: 72, macd: 1.2, volume: 85 },
  { name: '4h', signal: 'bullish', rsi: 68, macd: 0.9, volume: 45 },
  { name: '1d', signal: 'bullish', rsi: 71, macd: 1.5, volume: 120 },
  { name: '1w', signal: 'neutral', rsi: 52, macd: 0.2, volume: 10 },
  { name: '1M', signal: 'bullish', rsi: 64, macd: 0.6, volume: 28 }
]);

const liveSignals = ref([
  {
    id: 1,
    type: 'BUY',
    symbol: 'LCX/USDC',
    timeframe: '1h',
    reason: 'RSI oversold + MACD bullish cross + Volume surge',
    timestamp: new Date()
  },
  {
    id: 2,
    type: 'SELL',
    symbol: 'BTC/USDC',
    timeframe: '15m',
    reason: 'RSI overbought + Resistance hit',
    timestamp: new Date(Date.now() - 120000)
  }
]);

const activeChains = ref([
  {
    id: 1,
    name: 'BTC Buy-Sell Cascade',
    status: 'active',
    nodes: [
      { type: 'Grid Bot', strategy: 'BUY', status: 'completed', profit: 8.5, triggerCondition: 'Profit ≥ 8%' },
      { type: 'Grid Bot', strategy: 'SELL', status: 'active', profit: 3.2, triggerCondition: 'Filled ≥ 50%' },
      { type: 'DCA Bot', strategy: 'BUY', status: 'waiting', profit: null, triggerCondition: null }
    ],
    progress: 60,
    currentNode: '2/3',
    totalProfit: 11.7,
    runtime: '2h 34m'
  }
]);

const eventLog = ref([
  { id: 1, type: 'success', title: 'Chain Execution', description: 'BTC Buy-Sell Cascade: Node 2 activated', timestamp: new Date() },
  { id: 2, type: 'pattern', title: 'Pattern Detected', description: 'Pump pattern on LCX/USDC (87% confidence)', timestamp: new Date(Date.now() - 60000) },
  { id: 3, type: 'warning', title: 'Trigger Condition Met', description: 'Grid Bot profit reached 8.5%', timestamp: new Date(Date.now() - 120000) },
  { id: 4, type: 'info', title: 'Bot Started', description: 'Grid Bot SELL started on BTC/USDC', timestamp: new Date(Date.now() - 180000) }
]);

const alignedTimeframes = computed(() => {
  const bullishCount = timeframes.value.filter(tf => tf.signal === 'bullish').length;
  return bullishCount;
});

const overallSignal = computed(() => {
  const bullishCount = timeframes.value.filter(tf => tf.signal === 'bullish').length;
  const totalTf = timeframes.value.length;
  const percentage = (bullishCount / totalTf) * 100;

  if (percentage >= 60) return 'STRONG BUY';
  if (percentage >= 40) return 'BUY';
  if (percentage >= 30) return 'NEUTRAL';
  return 'SELL';
});

const getTfBackground = (signal) => {
  switch(signal) {
    case 'bullish': return 'rgba(16,235,4,0.15)';
    case 'bearish': return 'rgba(245,42,9,0.15)';
    default: return 'rgba(102,102,102,0.1)';
  }
};

const getTfBorderColor = (signal) => {
  switch(signal) {
    case 'bullish': return '#10eb04';
    case 'bearish': return '#f52a09';
    default: return '#666';
  }
};

const getTfIcon = (signal) => {
  switch(signal) {
    case 'bullish': return '🟢';
    case 'bearish': return '🔴';
    default: return '🟡';
  }
};

const getRsiColor = (rsi) => {
  if (rsi > 70) return '#f52a09';
  if (rsi < 30) return '#10eb04';
  return '#f5a623';
};

const getRsiBarColor = (rsi) => {
  if (rsi > 70) return '#f52a09';
  if (rsi < 30) return '#10eb04';
  return '#f5a623';
};

const getOverallSignalBg = () => {
  const signal = overallSignal.value;
  if (signal.includes('BUY')) return 'rgba(16,235,4,0.1)';
  if (signal.includes('SELL')) return 'rgba(245,42,9,0.1)';
  return 'rgba(102,102,102,0.1)';
};

const getOverallSignalColor = () => {
  const signal = overallSignal.value;
  if (signal.includes('BUY')) return '#10eb04';
  if (signal.includes('SELL')) return '#f52a09';
  return '#666';
};

const getNodeBg = (status) => {
  switch(status) {
    case 'active': return 'rgba(16,235,4,0.15)';
    case 'completed': return 'rgba(0,212,255,0.15)';
    default: return 'rgba(0,0,0,0.3)';
  }
};

const getNodeBorder = (status) => {
  switch(status) {
    case 'active': return '#10eb04';
    case 'completed': return '#00d4ff';
    default: return '#666';
  }
};

const getNodeStatusIcon = (status) => {
  switch(status) {
    case 'active': return '⏳';
    case 'completed': return '✅';
    default: return '⏸️';
  }
};

const getEventColor = (type) => {
  switch(type) {
    case 'success': return '#10eb04';
    case 'warning': return '#f5a623';
    case 'error': return '#f52a09';
    case 'pattern': return '#8a2be2';
    default: return '#00d4ff';
  }
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString();
};

onMounted(() => {
  // TODO: Load real-time data
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
