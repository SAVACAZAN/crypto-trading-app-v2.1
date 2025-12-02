<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #10eb04;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none; transition: color 0.3s;">
            ←
          </NuxtLink>
          <div style="font-size: 24px;">🔍</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #10eb04; font-weight: 700;">FAZA 2: PATTERN RECOGNITION</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">AI-Powered Market Analysis Engine</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div :style="`width: 10px; height: 10px; border-radius: 50%; background: ${scanningActive ? '#10eb04' : '#666'}; box-shadow: ${scanningActive ? '0 0 10px rgba(16,235,4,0.5)' : 'none'}; animation: ${scanningActive ? 'pulse 2s infinite' : 'none'};`"></div>
          <span :style="`color: ${scanningActive ? '#10eb04' : '#666'}; font-size: 12px; font-weight: 600;`">
            {{ scanningActive ? 'SCANNING ACTIVE' : 'SCANNING PAUSED' }}
          </span>
          <n-button size="small" @click="toggleScanning" :style="`background: ${scanningActive ? '#f52a09' : '#10eb04'}; border: none; font-size: 11px;`">
            {{ scanningActive ? 'PAUSE' : 'START' }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- Live Pattern Alerts -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="color: #10eb04; font-size: 14px; font-weight: 600;">🚨 LIVE PATTERN ALERTS</div>
        <div style="color: #888; font-size: 10px;">Last scan: {{ lastScanTime }}</div>
      </div>

      <div v-if="liveAlerts.length > 0" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
        <div v-for="alert in liveAlerts" :key="alert.id"
             :style="`background: ${getAlertBackground(alert.type)}; border-left: 4px solid ${getAlertColor(alert.type)}; padding: 12px; border-radius: 6px; animation: slideIn 0.3s ease;`">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 20px;">{{ getPatternIcon(alert.type) }}</div>
              <div>
                <div :style="`color: ${getAlertColor(alert.type)}; font-size: 13px; font-weight: 700;`">
                  {{ alert.patternName }}
                </div>
                <div style="color: #aaa; font-size: 10px;">{{ alert.symbol }} • {{ alert.timeframe }}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="color: #fff; font-size: 16px; font-weight: 700;">{{ alert.confidence }}%</div>
              <div style="color: #888; font-size: 9px;">confidence</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px;">
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">PRICE CHANGE</div>
              <div :style="`font-size: 11px; font-weight: 600; color: ${alert.metrics.priceChange >= 0 ? '#10eb04' : '#f52a09'};`">
                {{ alert.metrics.priceChange >= 0 ? '+' : '' }}{{ alert.metrics.priceChange }}%
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">VOLUME</div>
              <div style="font-size: 11px; color: #00d4ff; font-weight: 600;">+{{ alert.metrics.volumeChange }}%</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">RSI</div>
              <div :style="`font-size: 11px; font-weight: 600; color: ${getRsiColor(alert.metrics.rsi)};`">
                {{ alert.metrics.rsi }}
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">SIGNAL</div>
              <div :style="`font-size: 11px; font-weight: 700; color: ${alert.signal === 'BUY' ? '#10eb04' : '#f52a09'};`">
                {{ alert.signal }}
              </div>
            </div>
          </div>

          <div v-if="alert.actionTaken" style="background: rgba(0,212,255,0.1); padding: 6px 10px; border-radius: 4px; font-size: 10px; color: #00d4ff;">
            ✓ {{ alert.actionTaken }}
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 30px; color: #666;">
        <div style="font-size: 36px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 12px;">No patterns detected in the last 5 minutes</div>
      </div>
    </div>

    <!-- Pattern Detectors Grid -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
      <!-- Pump Detection -->
      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; border-radius: 8px; padding: 15px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">🚀</div>
            <div>
              <div style="color: #f52a09; font-size: 14px; font-weight: 700;">PUMP DETECTION</div>
              <div style="color: #888; font-size: 10px;">Rapid price spike + volume surge</div>
            </div>
          </div>
          <n-switch v-model:value="detectors.pump.enabled" :rail-style="() => ({ background: detectors.pump.enabled ? '#10eb04' : '#666' })" />
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-size: 10px; color: #888; margin-bottom: 8px;">DETECTION CRITERIA:</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 10px; color: #ccc;">
            <div>• Price change 5m: > {{ detectors.pump.criteria.priceChange5m }}%</div>
            <div>• Volume surge: > {{ detectors.pump.criteria.volumeSurge }}%</div>
            <div>• RSI threshold: > {{ detectors.pump.criteria.rsiThreshold }}</div>
            <div>• Min confidence: {{ detectors.pump.criteria.minConfidence }}%</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">DETECTED TODAY</div>
            <div style="font-size: 16px; color: #f52a09; font-weight: 700;">{{ detectors.pump.stats.detectedToday }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">AVG CONFIDENCE</div>
            <div style="font-size: 16px; color: #f5a623; font-weight: 700;">{{ detectors.pump.stats.avgConfidence }}%</div>
          </div>
        </div>
      </div>

      <!-- Dump Detection -->
      <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; border-radius: 8px; padding: 15px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">📉</div>
            <div>
              <div style="color: #f5a623; font-size: 14px; font-weight: 700;">DUMP DETECTION</div>
              <div style="color: #888; font-size: 10px;">Rapid price drop + sell pressure</div>
            </div>
          </div>
          <n-switch v-model:value="detectors.dump.enabled" :rail-style="() => ({ background: detectors.dump.enabled ? '#10eb04' : '#666' })" />
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-size: 10px; color: #888; margin-bottom: 8px;">DETECTION CRITERIA:</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 10px; color: #ccc;">
            <div>• Price drop 5m: < -{{ detectors.dump.criteria.priceDrop5m }}%</div>
            <div>• Volume surge: > {{ detectors.dump.criteria.volumeSurge }}%</div>
            <div>• RSI threshold: < {{ detectors.dump.criteria.rsiThreshold }}</div>
            <div>• Min confidence: {{ detectors.dump.criteria.minConfidence }}%</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">DETECTED TODAY</div>
            <div style="font-size: 16px; color: #f5a623; font-weight: 700;">{{ detectors.dump.stats.detectedToday }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">AVG CONFIDENCE</div>
            <div style="font-size: 16px; color: #f52a09; font-weight: 700;">{{ detectors.dump.stats.avgConfidence }}%</div>
          </div>
        </div>
      </div>

      <!-- Breakout Detection -->
      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; border-radius: 8px; padding: 15px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">📈</div>
            <div>
              <div style="color: #10eb04; font-size: 14px; font-weight: 700;">BREAKOUT DETECTION</div>
              <div style="color: #888; font-size: 10px;">Price breaks resistance with volume</div>
            </div>
          </div>
          <n-switch v-model:value="detectors.breakout.enabled" :rail-style="() => ({ background: detectors.breakout.enabled ? '#10eb04' : '#666' })" />
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-size: 10px; color: #888; margin-bottom: 8px;">DETECTION CRITERIA:</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 10px; color: #ccc;">
            <div>• Resistance break: > {{ detectors.breakout.criteria.resistanceBreak }}%</div>
            <div>• Volume confirmation: > {{ detectors.breakout.criteria.volumeConfirm }}%</div>
            <div>• MACD cross: Bullish</div>
            <div>• Min confidence: {{ detectors.breakout.criteria.minConfidence }}%</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">DETECTED TODAY</div>
            <div style="font-size: 16px; color: #10eb04; font-weight: 700;">{{ detectors.breakout.stats.detectedToday }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">AVG CONFIDENCE</div>
            <div style="font-size: 16px; color: #00d4ff; font-weight: 700;">{{ detectors.breakout.stats.avgConfidence }}%</div>
          </div>
        </div>
      </div>

      <!-- Accumulation Detection -->
      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 15px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">📊</div>
            <div>
              <div style="color: #00d4ff; font-size: 14px; font-weight: 700;">ACCUMULATION ZONE</div>
              <div style="color: #888; font-size: 10px;">Price consolidation + volume increase</div>
            </div>
          </div>
          <n-switch v-model:value="detectors.accumulation.enabled" :rail-style="() => ({ background: detectors.accumulation.enabled ? '#10eb04' : '#666' })" />
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-size: 10px; color: #888; margin-bottom: 8px;">DETECTION CRITERIA:</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 10px; color: #ccc;">
            <div>• Price volatility: < {{ detectors.accumulation.criteria.maxVolatility }}%</div>
            <div>• Volume trend: Increasing {{ detectors.accumulation.criteria.volumeTrend }}%</div>
            <div>• Consolidation period: > {{ detectors.accumulation.criteria.consolidationPeriod }}h</div>
            <div>• Min confidence: {{ detectors.accumulation.criteria.minConfidence }}%</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">DETECTED TODAY</div>
            <div style="font-size: 16px; color: #00d4ff; font-weight: 700;">{{ detectors.accumulation.stats.detectedToday }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; text-align: center;">
            <div style="font-size: 9px; color: #888;">AVG CONFIDENCE</div>
            <div style="font-size: 16px; color: #10eb04; font-weight: 700;">{{ detectors.accumulation.stats.avgConfidence }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scan Settings -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
      <div style="color: #00d4ff; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⚙️ SCAN SETTINGS</div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div>
          <div style="font-size: 10px; color: #888; margin-bottom: 6px;">Scan Interval</div>
          <n-select v-model:value="scanSettings.interval" :options="intervalOptions" size="small" />
        </div>
        <div>
          <div style="font-size: 10px; color: #888; margin-bottom: 6px;">Monitored Symbols</div>
          <n-select v-model:value="scanSettings.symbols" :options="symbolOptions" size="small" multiple />
        </div>
        <div>
          <div style="font-size: 10px; color: #888; margin-bottom: 6px;">Auto-Action on Detection</div>
          <n-select v-model:value="scanSettings.autoAction" :options="autoActionOptions" size="small" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const scanningActive = ref(true);
const lastScanTime = ref('');
let scanInterval = null;

const liveAlerts = ref([
  {
    id: 1,
    type: 'pump',
    patternName: 'PUMP DETECTED',
    symbol: 'LCX/USDC',
    timeframe: '5m',
    confidence: 87,
    metrics: {
      priceChange: 5.2,
      volumeChange: 320,
      rsi: 78
    },
    signal: 'BUY',
    actionTaken: 'Auto-started Scalping Chain #3',
    timestamp: new Date()
  }
]);

const detectors = ref({
  pump: {
    enabled: true,
    criteria: {
      priceChange5m: 3,
      volumeSurge: 200,
      rsiThreshold: 70,
      minConfidence: 75
    },
    stats: {
      detectedToday: 24,
      avgConfidence: 82
    }
  },
  dump: {
    enabled: true,
    criteria: {
      priceDrop5m: 3,
      volumeSurge: 200,
      rsiThreshold: 30,
      minConfidence: 75
    },
    stats: {
      detectedToday: 18,
      avgConfidence: 79
    }
  },
  breakout: {
    enabled: true,
    criteria: {
      resistanceBreak: 2,
      volumeConfirm: 150,
      minConfidence: 70
    },
    stats: {
      detectedToday: 31,
      avgConfidence: 85
    }
  },
  accumulation: {
    enabled: true,
    criteria: {
      maxVolatility: 2,
      volumeTrend: 50,
      consolidationPeriod: 4,
      minConfidence: 65
    },
    stats: {
      detectedToday: 12,
      avgConfidence: 71
    }
  }
});

const scanSettings = ref({
  interval: 5,
  symbols: ['LCX/USDC', 'BTC/USDC'],
  autoAction: 'notify'
});

const intervalOptions = [
  { label: '5 seconds', value: 5 },
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 }
];

const symbolOptions = [
  { label: 'LCX/USDC', value: 'LCX/USDC' },
  { label: 'BTC/USDC', value: 'BTC/USDC' },
  { label: 'ETH/USDC', value: 'ETH/USDC' },
  { label: 'SOL/USDC', value: 'SOL/USDC' }
];

const autoActionOptions = [
  { label: 'Notify Only', value: 'notify' },
  { label: 'Start Bot Chain', value: 'start_chain' },
  { label: 'Auto Trade', value: 'auto_trade' }
];

const getAlertBackground = (type) => {
  switch(type) {
    case 'pump': return 'rgba(245,42,9,0.15)';
    case 'dump': return 'rgba(245,166,35,0.15)';
    case 'breakout': return 'rgba(16,235,4,0.15)';
    case 'accumulation': return 'rgba(0,212,255,0.15)';
    default: return 'rgba(0,0,0,0.3)';
  }
};

const getAlertColor = (type) => {
  switch(type) {
    case 'pump': return '#f52a09';
    case 'dump': return '#f5a623';
    case 'breakout': return '#10eb04';
    case 'accumulation': return '#00d4ff';
    default: return '#666';
  }
};

const getPatternIcon = (type) => {
  switch(type) {
    case 'pump': return '🚀';
    case 'dump': return '📉';
    case 'breakout': return '📈';
    case 'accumulation': return '📊';
    default: return '🔍';
  }
};

const getRsiColor = (rsi) => {
  if (rsi > 70) return '#f52a09';
  if (rsi < 30) return '#10eb04';
  return '#f5a623';
};

const toggleScanning = () => {
  scanningActive.value = !scanningActive.value;
  if (scanningActive.value) {
    startScanning();
  } else {
    stopScanning();
  }
};

const updateScanTime = () => {
  const now = new Date();
  lastScanTime.value = now.toLocaleTimeString();
};

const startScanning = () => {
  scanInterval = setInterval(() => {
    updateScanTime();
    // TODO: Implement real scanning logic
  }, scanSettings.value.interval * 1000);
};

const stopScanning = () => {
  if (scanInterval) {
    clearInterval(scanInterval);
  }
};

onMounted(() => {
  updateScanTime();
  if (scanningActive.value) {
    startScanning();
  }
});

onUnmounted(() => {
  stopScanning();
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
