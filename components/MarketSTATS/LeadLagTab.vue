<template>
  <div class="leadlag-tab">
    <n-space vertical :size="20">
      <!-- Lead/Lag Summary Cards -->
      <n-grid :cols="3" :x-gap="16" :y-gap="16">
        <!-- 16: Lead/Lag Detection -->
        <n-gi>
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">⏱️ LCX Lag Behind BTC</div>
            <div class="card-value" :style="{ color: lag.lcxBtc > 0 ? '#fbbf24' : '#4ade80' }">
              {{ Math.abs(lag.lcxBtc).toFixed(1) }}s
            </div>
            <div class="card-label">{{ lag.lcxBtc > 0 ? 'Lagging' : 'Leading' }}</div>
          </n-card>
        </n-gi>

        <!-- 18: ETH Lag -->
        <n-gi>
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">⏱️ LCX Lag Behind ETH</div>
            <div class="card-value" :style="{ color: lag.lcxEth > 0 ? '#fbbf24' : '#4ade80' }">
              {{ Math.abs(lag.lcxEth).toFixed(1) }}s
            </div>
            <div class="card-label">Rhythm difference</div>
          </n-card>
        </n-gi>

        <!-- 19: Cross-correlation -->
        <n-gi>
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">📊 Cross-Correlation</div>
            <div class="card-value">{{ crossCorrelation.toFixed(4) }}</div>
            <div class="card-label">Peak at {{ crossCorrelation > 0 ? '+' : '' }}{{ peakLag.toFixed(1) }}s</div>
          </n-card>
        </n-gi>

        <!-- 21: Decoupling Detection -->
        <n-gi>
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">🔓 Decoupling Status</div>
            <div class="card-value" :style="{ fontSize: '24px', color: isDecoupled ? '#ef4444' : '#4ade80' }">
              {{ isDecoupled ? '⚠️ YES' : '✅ NO' }}
            </div>
            <div class="card-label">{{ isDecoupled ? 'Independent move' : 'Following market' }}</div>
          </n-card>
        </n-gi>

        <!-- 23: Following BTC % -->
        <n-gi>
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">📈 Following BTC (24h)</div>
            <div class="card-value">{{ followingPercent.toFixed(1) }}%</div>
            <div class="card-label">{{ followingPercent > 70 ? 'High correlation' : 'Low correlation' }}</div>
          </n-card>
        </n-gi>

        <!-- 24: Fast Reaction -->
        <n-gi>
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">⚡ Fast Reactions</div>
            <div class="card-value">{{ fastReactions }}</div>
            <div class="card-label">Times LCX led BTC today</div>
          </n-card>
        </n-gi>

        <!-- 25: High Precision Lag -->
        <n-gi :span="3">
          <n-card size="small" :bordered="false" class="leadlag-card">
            <div class="card-header">🎯 High-Precision Lead/Lag (Milliseconds)</div>
            <div class="card-value">{{ precisionLag.toFixed(0) }}ms</div>
            <div class="card-label">
              {{ precisionLag > 0 ? `LCX lagging by ${precisionLag.toFixed(0)}ms` : `LCX leading by ${Math.abs(precisionLag).toFixed(0)}ms` }}
            </div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- Visual Timeline -->
      <n-card title="📊 Lead/Lag Timeline" size="small" :bordered="false">
        <div class="timeline-chart">
          <div class="timeline-item" v-for="(item, idx) in timeline" :key="idx">
            <div class="timeline-marker" :style="{ background: item.type === 'lead' ? '#4ade80' : '#fbbf24' }"></div>
            <div class="timeline-content">
              <div class="timeline-time">{{ item.time }}</div>
              <div class="timeline-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Notification Center -->
      <n-card size="small" :bordered="false">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            🔔 Real-time Notifications
          </div>
        </template>
        <n-space vertical>
          <n-alert v-if="notifications.lagging" type="warning" closable>
            ⚠️ LCX lagging behind BTC trend by {{ lag.lcxBtc.toFixed(1) }}s
          </n-alert>
          <n-alert v-if="notifications.decoupled" type="error" closable>
            🔓 LCX completely decoupled from market - independent movement detected!
          </n-alert>
          <n-alert v-if="notifications.leading" type="success" closable>
            ⚡ LCX leading market movement - potential breakout!
          </n-alert>
        </n-space>
      </n-card>

      <!-- Chart: BTC leads LCX visualization -->
      <n-card title="📈 Lead/Lag Visualization" size="small" :bordered="false">
        <div class="lead-chart">
          <div class="chart-placeholder">
            <p style="text-align: center; color: #888; padding: 40px;">
              📊 Graph showing BTC leads LCX by {{ Math.abs(lag.lcxBtc).toFixed(1) }}s
              <br><br>
              <span style="font-size: 12px;">Interactive chart with delay visualization will be rendered here</span>
            </p>
          </div>
        </div>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  symbol: String,
  exchange: String,
  coin: String
});

// State
const lag = ref({ lcxBtc: 0, lcxEth: 0 });
const crossCorrelation = ref(0);
const peakLag = ref(0);
const isDecoupled = ref(false);
const followingPercent = ref(0);
const fastReactions = ref(0);
const precisionLag = ref(0);
const timeline = ref([]);
const notifications = ref({
  lagging: false,
  decoupled: false,
  leading: false
});

let refreshInterval = null;

// Fetch lead/lag data
const fetchLeadLagData = async () => {
  try {
    // Simulated data - replace with real API
    lag.value = {
      lcxBtc: -30 + Math.random() * 120, // -30s to +90s
      lcxEth: -20 + Math.random() * 90
    };

    crossCorrelation.value = 0.6 + Math.random() * 0.35;
    peakLag.value = -10 + Math.random() * 40;
    isDecoupled.value = Math.random() > 0.85;
    followingPercent.value = 60 + Math.random() * 35;
    fastReactions.value = Math.floor(Math.random() * 15);
    precisionLag.value = -500 + Math.random() * 2000; // -500ms to +1500ms

    // Update notifications
    notifications.value = {
      lagging: lag.value.lcxBtc > 60,
      decoupled: isDecoupled.value,
      leading: lag.value.lcxBtc < -10
    };

    // Generate timeline
    const now = new Date();
    timeline.value = Array.from({ length: 5 }, (_, i) => {
      const time = new Date(now.getTime() - i * 60000);
      const isLead = Math.random() > 0.6;
      return {
        time: time.toLocaleTimeString(),
        type: isLead ? 'lead' : 'lag',
        description: isLead
          ? `LCX led BTC by ${(Math.random() * 20).toFixed(1)}s`
          : `LCX lagged BTC by ${(Math.random() * 60).toFixed(1)}s`
      };
    });

  } catch (error) {
    console.error('Error fetching lead/lag data:', error);
  }
};

onMounted(() => {
  fetchLeadLagData();
  refreshInterval = setInterval(fetchLeadLagData, 5000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.leadlag-tab {
  padding: 20px;
}

.leadlag-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.leadlag-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(251, 191, 36, 0.3);
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
  color: #fbbf24;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.card-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.timeline-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-time {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 14px;
  color: #fff;
}

.lead-chart {
  min-height: 300px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
