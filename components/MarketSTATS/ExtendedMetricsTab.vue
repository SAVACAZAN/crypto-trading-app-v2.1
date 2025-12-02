<template>
  <div class="metrics-tab">
    <n-space vertical :size="20">
      <!-- Extended Metrics Cards ---->
      <n-grid :cols="3" :x-gap="16" :y-gap="16">
        <!-- 46: Tick Count & Last Update -->
        <n-gi>
          <n-card size="small" :bordered="false" class="metrics-card">
            <div class="card-header">📊 Data Collection</div>
            <div class="card-value">{{ tickCount.toLocaleString() }}</div>
            <div class="card-label">
              Ticks collected
              <br>
              <span style="font-size: 10px; color: #666;">Last: {{ lastUpdate }}</span>
            </div>
          </n-card>
        </n-gi>

        <!-- 47: Average Δ% (10min) -->
        <n-gi>
          <n-card size="small" :bordered="false" class="metrics-card">
            <div class="card-header">📈 10min Avg Change</div>
            <div class="avg-changes">
              <div class="avg-item">
                <span class="avg-label">LCX:</span>
                <span class="avg-value" :style="{ color: avgChanges.lcx >= 0 ? '#4ade80' : '#ef4444' }">
                  {{ avgChanges.lcx >= 0 ? '+' : '' }}{{ avgChanges.lcx.toFixed(2) }}%
                </span>
              </div>
              <div class="avg-item">
                <span class="avg-label">BTC:</span>
                <span class="avg-value" :style="{ color: avgChanges.btc >= 0 ? '#4ade80' : '#ef4444' }">
                  {{ avgChanges.btc >= 0 ? '+' : '' }}{{ avgChanges.btc.toFixed(2) }}%
                </span>
              </div>
              <div class="avg-item">
                <span class="avg-label">ETH:</span>
                <span class="avg-value" :style="{ color: avgChanges.eth >= 0 ? '#4ade80' : '#ef4444' }">
                  {{ avgChanges.eth >= 0 ? '+' : '' }}{{ avgChanges.eth.toFixed(2) }}%
                </span>
              </div>
            </div>
          </n-card>
        </n-gi>

        <!-- 48: API Update Rate -->
        <n-gi>
          <n-card size="small" :bordered="false" class="metrics-card">
            <div class="card-header">⚡ API Performance</div>
            <div class="card-value" :style="{ color: getLatencyColor(apiLatency) }">
              {{ apiLatency.toFixed(0) }}ms
            </div>
            <div class="card-label">
              Update rate: {{ updateRate.toFixed(1) }} req/s
              <br>
              <span :style="{ color: getLatencyColor(apiLatency), fontSize: '10px' }">
                {{ getLatencyLabel(apiLatency) }}
              </span>
            </div>
          </n-card>
        </n-gi>

        <!-- 49: Market Health Index -->
        <n-gi :span="2">
          <n-card size="small" :bordered="false" class="metrics-card">
            <div class="card-header">💚 Combined Market Health Index</div>
            <div class="health-container">
              <div class="health-bar">
                <div class="health-fill" :style="{
                  width: `${marketHealth}%`,
                  background: getHealthGradient(marketHealth)
                }">
                  <span class="health-percentage">{{ marketHealth.toFixed(0) }}%</span>
                </div>
              </div>
              <div class="health-breakdown">
                <div class="health-item">
                  <span class="health-icon">₿</span>
                  <span class="health-bar-mini" :style="{ width: `${healthComponents.btc}%`, background: '#f7931a' }"></span>
                  <span class="health-value">{{ healthComponents.btc.toFixed(0) }}%</span>
                </div>
                <div class="health-item">
                  <span class="health-icon">Ξ</span>
                  <span class="health-bar-mini" :style="{ width: `${healthComponents.eth}%`, background: '#627eea' }"></span>
                  <span class="health-value">{{ healthComponents.eth.toFixed(0) }}%</span>
                </div>
                <div class="health-item">
                  <span class="health-icon">L</span>
                  <span class="health-bar-mini" :style="{ width: `${healthComponents.lcx}%`, background: '#8b5cf6' }"></span>
                  <span class="health-value">{{ healthComponents.lcx.toFixed(0) }}%</span>
                </div>
              </div>
            </div>
            <div class="card-label" style="margin-top: 12px;">
              {{ getHealthDescription(marketHealth) }}
            </div>
          </n-card>
        </n-gi>

        <!-- 50: Export Data -->
        <n-gi>
          <n-card size="small" :bordered="false" class="metrics-card">
            <div class="card-header">💾 Export Data</div>
            <n-space vertical :size="8">
              <n-button size="small" type="success" block @click="exportCSV">
                📄 Download CSV
              </n-button>
              <n-button size="small" type="info" block @click="exportJSON">
                📋 Download JSON
              </n-button>
              <div class="card-label">
                Export all collected market data
              </div>
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- Real-time Status Dashboard -->
      <n-card title="🔴 Live System Status" size="small" :bordered="false">
        <n-grid :cols="4" :x-gap="12">
          <n-gi>
            <div class="status-item">
              <div class="status-label">Connection</div>
              <div class="status-value" :style="{ color: isConnected ? '#4ade80' : '#ef4444' }">
                {{ isConnected ? '🟢 LIVE' : '🔴 OFFLINE' }}
              </div>
            </div>
          </n-gi>
          <n-gi>
            <div class="status-item">
              <div class="status-label">Data Streams</div>
              <div class="status-value">{{ activeStreams }}/3</div>
            </div>
          </n-gi>
          <n-gi>
            <div class="status-item">
              <div class="status-label">Uptime</div>
              <div class="status-value">{{ uptime }}</div>
            </div>
          </n-gi>
          <n-gi>
            <div class="status-item">
              <div class="status-label">Error Rate</div>
              <div class="status-value" :style="{ color: errorRate > 5 ? '#ef4444' : '#4ade80' }">
                {{ errorRate.toFixed(1) }}%
              </div>
            </div>
          </n-gi>
        </n-grid>
      </n-card>

      <!-- Historical Performance Chart -->
      <n-card title="📊 Performance Timeline (Last Hour)" size="small" :bordered="false">
        <div class="performance-timeline">
          <div class="timeline-grid">
            <div v-for="(point, idx) in performanceHistory" :key="idx" class="timeline-point">
              <div class="timeline-bar" :style="{
                height: `${point.value}%`,
                background: getPerformanceColor(point.value)
              }">
                <div class="timeline-tooltip">
                  <div>{{ point.time }}</div>
                  <div>{{ point.value.toFixed(0) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Data Summary Table -->
      <n-card title="📋 Current Market Summary" size="small" :bordered="false">
        <n-data-table
          :columns="summaryColumns"
          :data="summaryData"
          :bordered="false"
          size="small"
        />
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  symbol: String,
  exchange: String,
  coin: String
});

// State
const tickCount = ref(0);
const lastUpdate = ref('--:--:--');
const avgChanges = ref({ lcx: 0, btc: 0, eth: 0 });
const apiLatency = ref(0);
const updateRate = ref(0);
const marketHealth = ref(0);
const healthComponents = ref({ btc: 0, eth: 0, lcx: 0 });
const isConnected = ref(true);
const activeStreams = ref(3);
const uptime = ref('00:00:00');
const errorRate = ref(0);
const performanceHistory = ref([]);

let refreshInterval = null;
let startTime = Date.now();

// Summary table columns
const summaryColumns = [
  { title: 'Asset', key: 'asset', width: 100 },
  { title: 'Current Price', key: 'price', width: 120 },
  { title: '10min Avg Δ%', key: 'avgChange', width: 120 },
  { title: 'Volatility σ', key: 'volatility', width: 100 },
  { title: 'Trend', key: 'trend', width: 80 },
  { title: 'Status', key: 'status', width: 100 }
];

const summaryData = computed(() => [
  {
    asset: '₿ BTC',
    price: '$109,450.00',
    avgChange: avgChanges.value.btc >= 0 ? `+${avgChanges.value.btc.toFixed(2)}%` : `${avgChanges.value.btc.toFixed(2)}%`,
    volatility: '2.3%',
    trend: avgChanges.value.btc >= 0 ? '↑' : '↓',
    status: '🟢 Active'
  },
  {
    asset: 'Ξ ETH',
    price: '$3,840.00',
    avgChange: avgChanges.value.eth >= 0 ? `+${avgChanges.value.eth.toFixed(2)}%` : `${avgChanges.value.eth.toFixed(2)}%`,
    volatility: '3.1%',
    trend: avgChanges.value.eth >= 0 ? '↑' : '↓',
    status: '🟢 Active'
  },
  {
    asset: 'L LCX',
    price: '$0.110000',
    avgChange: avgChanges.value.lcx >= 0 ? `+${avgChanges.value.lcx.toFixed(2)}%` : `${avgChanges.value.lcx.toFixed(2)}%`,
    volatility: '4.7%',
    trend: avgChanges.value.lcx >= 0 ? '↑' : '↓',
    status: '🟢 Active'
  }
]);

// Helper functions
const getLatencyColor = (latency) => {
  if (latency < 100) return '#4ade80';
  if (latency < 300) return '#fbbf24';
  return '#ef4444';
};

const getLatencyLabel = (latency) => {
  if (latency < 100) return '⚡ Excellent';
  if (latency < 300) return '✓ Good';
  return '⚠️ Slow';
};

const getHealthGradient = (health) => {
  if (health > 70) return 'linear-gradient(90deg, #4ade80, #22c55e)';
  if (health > 40) return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
  return 'linear-gradient(90deg, #ef4444, #dc2626)';
};

const getHealthDescription = (health) => {
  if (health > 80) return '🚀 Excellent market conditions - Strong bullish momentum';
  if (health > 60) return '✅ Good market health - Positive trend';
  if (health > 40) return '⚠️ Moderate conditions - Mixed signals';
  if (health > 20) return '⚠️ Weak market - Bearish pressure';
  return '🔴 Poor conditions - High volatility and uncertainty';
};

const getPerformanceColor = (value) => {
  if (value > 70) return '#4ade80';
  if (value > 40) return '#fbbf24';
  return '#ef4444';
};

// Export functions
const exportCSV = () => {
  try {
    const csvData = [
      ['Timestamp', 'Asset', 'Price', 'Change %', 'Volume', 'Volatility'],
      [new Date().toISOString(), 'BTC', '109450', avgChanges.value.btc.toFixed(2), '1234567', '2.3'],
      [new Date().toISOString(), 'ETH', '3840', avgChanges.value.eth.toFixed(2), '234567', '3.1'],
      [new Date().toISOString(), 'LCX', '0.11', avgChanges.value.lcx.toFixed(2), '12345', '4.7']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `market_data_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV export successful');
  } catch (error) {
    console.error('❌ CSV export failed:', error);
  }
};

const exportJSON = () => {
  try {
    const jsonData = {
      timestamp: new Date().toISOString(),
      tickCount: tickCount.value,
      marketHealth: marketHealth.value,
      avgChanges: avgChanges.value,
      apiLatency: apiLatency.value,
      updateRate: updateRate.value,
      assets: [
        { symbol: 'BTC', price: 109450, change: avgChanges.value.btc, volatility: 2.3 },
        { symbol: 'ETH', price: 3840, change: avgChanges.value.eth, volatility: 3.1 },
        { symbol: 'LCX', price: 0.11, change: avgChanges.value.lcx, volatility: 4.7 }
      ],
      performanceHistory: performanceHistory.value
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `market_data_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ JSON export successful');
  } catch (error) {
    console.error('❌ JSON export failed:', error);
  }
};

// Update uptime
const updateUptime = () => {
  const elapsed = Date.now() - startTime;
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  uptime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Fetch metrics
const fetchMetrics = async () => {
  try {
    const start = Date.now();

    // Simulated data - replace with real API
    tickCount.value += Math.floor(5 + Math.random() * 15);
    lastUpdate.value = new Date().toLocaleTimeString();

    avgChanges.value = {
      lcx: -2 + Math.random() * 4,
      btc: -1 + Math.random() * 2,
      eth: -1.5 + Math.random() * 3
    };

    apiLatency.value = 50 + Math.random() * 200;
    updateRate.value = 2 + Math.random() * 3;

    // Calculate market health (0-100)
    const btcHealth = 50 + (avgChanges.value.btc * 10);
    const ethHealth = 50 + (avgChanges.value.eth * 10);
    const lcxHealth = 50 + (avgChanges.value.lcx * 10);

    healthComponents.value = {
      btc: Math.max(0, Math.min(100, btcHealth)),
      eth: Math.max(0, Math.min(100, ethHealth)),
      lcx: Math.max(0, Math.min(100, lcxHealth))
    };

    marketHealth.value = (healthComponents.value.btc + healthComponents.value.eth + healthComponents.value.lcx) / 3;

    isConnected.value = Math.random() > 0.05;
    activeStreams.value = Math.random() > 0.1 ? 3 : Math.floor(Math.random() * 3);
    errorRate.value = Math.random() * 3;

    // Update performance history
    if (performanceHistory.value.length >= 60) {
      performanceHistory.value.shift();
    }
    performanceHistory.value.push({
      time: new Date().toLocaleTimeString(),
      value: marketHealth.value
    });

    updateUptime();

  } catch (error) {
    console.error('Error fetching metrics:', error);
  }
};

onMounted(() => {
  fetchMetrics();
  refreshInterval = setInterval(fetchMetrics, 3000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.metrics-tab {
  padding: 20px;
}

.metrics-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.metrics-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
}

.card-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  font-weight: 600;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #8b5cf6;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.card-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.avg-changes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.avg-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.avg-label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
}

.avg-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.health-container {
  width: 100%;
  padding: 12px 0;
}

.health-bar {
  width: 100%;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
}

.health-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease;
}

.health-percentage {
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.health-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-icon {
  font-size: 14px;
  font-weight: 700;
  width: 20px;
}

.health-bar-mini {
  height: 16px;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.health-value {
  font-size: 11px;
  color: #888;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  min-width: 40px;
}

.status-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.status-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

.status-value {
  font-size: 16px;
  font-weight: 700;
  color: #8b5cf6;
}

.performance-timeline {
  min-height: 200px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.timeline-grid {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 160px;
}

.timeline-point {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.timeline-bar {
  width: 100%;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.timeline-bar:hover {
  opacity: 0.8;
}

.timeline-bar:hover .timeline-tooltip {
  display: block;
}

.timeline-tooltip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 10px;
  color: #fff;
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 4px;
}
</style>
