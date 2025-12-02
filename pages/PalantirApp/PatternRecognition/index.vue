<template>
    <div class="palantir-page">
      <div class="page-header">
        <div class="header-icon">🔍</div>
        <div class="header-content">
          <h1 class="page-title">Pattern Recognition</h1>
          <p class="page-subtitle">AI-Powered Market Pattern Detection & Analysis</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="scanPatterns">
            🔎 Scan Now
          </button>
          <button class="action-btn">⚙️ Configure</button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon" style="color: #00d4ff;">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ patternsDetected }}</div>
            <div class="stat-label">Patterns Detected</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: #10eb04;">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ successfulTrades }}</div>
            <div class="stat-label">Successful Trades</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: #f5a623;">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ avgConfidence }}%</div>
            <div class="stat-label">Avg Confidence</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: #8a2be2;">⚡</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeScans }}</div>
            <div class="stat-label">Active Scans</div>
          </div>
        </div>
      </div>

      <!-- Pattern Types Grid -->
      <div class="section-title">
        <h2>Pattern Types</h2>
        <p>Supported market patterns and recognition algorithms</p>
      </div>

      <div class="pattern-types-grid">
        <div v-for="pattern in patternTypes" :key="pattern.type" class="pattern-card">
          <div class="pattern-header">
            <span class="pattern-icon">{{ pattern.icon }}</span>
            <span class="pattern-name">{{ pattern.name }}</span>
          </div>
          <div class="pattern-description">{{ pattern.description }}</div>
          <div class="pattern-stats">
            <span class="stat">Detected: {{ pattern.detected }}</span>
            <span class="stat" :style="{ color: pattern.accuracy > 70 ? '#10eb04' : '#f5a623' }">
              Accuracy: {{ pattern.accuracy }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Detections -->
      <div class="section-title" style="margin-top: 30px;">
        <h2>Recent Detections</h2>
        <p>Latest patterns identified by the AI engine</p>
      </div>

      <div class="detections-list">
        <div v-for="detection in recentDetections" :key="detection.id" class="detection-item">
          <div class="detection-icon">{{ detection.icon }}</div>
          <div class="detection-info">
            <div class="detection-title">{{ detection.pattern }} on {{ detection.symbol }}</div>
            <div class="detection-meta">
              {{ detection.timeframe }} • Confidence: {{ detection.confidence }}% • {{ detection.signal }}
            </div>
          </div>
          <div class="detection-time">{{ detection.time }}</div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

const patternsDetected = ref(247);
const successfulTrades = ref(189);
const avgConfidence = ref(68.4);
const activeScans = ref(5);

const patternTypes = ref([
  { type: 'breakout', name: 'Breakout', icon: '📈', description: 'Price breaks above resistance with volume', detected: 45, accuracy: 72 },
  { type: 'breakdown', name: 'Breakdown', icon: '📉', description: 'Price breaks below support with volume', detected: 38, accuracy: 69 },
  { type: 'pump', name: 'Pump', icon: '🚀', description: 'Rapid price increase with high volume', detected: 23, accuracy: 65 },
  { type: 'dump', name: 'Dump', icon: '💥', description: 'Rapid price decrease with high volume', detected: 19, accuracy: 67 },
  { type: 'accumulation', name: 'Accumulation', icon: '📦', description: 'Sideways consolidation with buying pressure', detected: 56, accuracy: 74 },
  { type: 'distribution', name: 'Distribution', icon: '📤', description: 'Sideways consolidation with selling pressure', detected: 42, accuracy: 71 },
  { type: 'consolidation', name: 'Consolidation', icon: '⏸️', description: 'Tight range trading, low volatility', detected: 89, accuracy: 78 },
  { type: 'reversal', name: 'Reversal', icon: '🔄', description: 'Trend reversal signals detected', detected: 34, accuracy: 63 },
]);

const recentDetections = ref([
  { id: 1, icon: '📈', pattern: 'Breakout', symbol: 'BTC/USDT', timeframe: '1h', confidence: 72.5, signal: 'BUY', time: '2 min ago' },
  { id: 2, icon: '📦', pattern: 'Accumulation', symbol: 'ETH/USDT', timeframe: '4h', confidence: 68.3, signal: 'HOLD', time: '5 min ago' },
  { id: 3, icon: '🚀', pattern: 'Pump', symbol: 'LCX/USDC', timeframe: '15m', confidence: 81.2, signal: 'BUY', time: '8 min ago' },
  { id: 4, icon: '🔄', pattern: 'Reversal', symbol: 'BTC/USDT', timeframe: '1d', confidence: 65.7, signal: 'SELL', time: '12 min ago' },
  { id: 5, icon: '⏸️', pattern: 'Consolidation', symbol: 'ETH/USDT', timeframe: '30m', confidence: 75.4, signal: 'NEUTRAL', time: '15 min ago' },
]);

const scanPatterns = () => {
  console.log('🔍 Scanning for patterns...');
};
</script>

<style scoped>
.palantir-page {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #0f3460;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 48px;
  filter: drop-shadow(0 0 10px rgba(0,212,255,0.5));
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 32px;
  color: #00d4ff;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0,212,255,0.5);
}

.page-subtitle {
  margin: 8px 0 0 0;
  color: #888;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid #333;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0,212,255,0.2);
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0,212,255,0.3);
}

.action-btn.primary {
  background: linear-gradient(135deg, #00d4ff, #0080aa);
  border: none;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(15,52,96,0.2);
  border: 1px solid #0f3460;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.section-title h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #00d4ff;
  font-weight: 700;
}

.section-title p {
  margin: 0;
  font-size: 13px;
  color: #888;
}

.pattern-types-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.pattern-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid #222;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.pattern-card:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0,212,255,0.2);
  transform: translateY(-2px);
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.pattern-icon {
  font-size: 24px;
}

.pattern-name {
  font-size: 16px;
  color: #00d4ff;
  font-weight: 600;
}

.pattern-description {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
  margin-bottom: 15px;
}

.pattern-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.detections-list {
  display: grid;
  gap: 10px;
  margin-top: 15px;
}

.detection-item {
  background: rgba(0,0,0,0.3);
  border: 1px solid #222;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.detection-item:hover {
  background: rgba(0,212,255,0.05);
  border-color: #00d4ff;
}

.detection-icon {
  font-size: 28px;
  min-width: 40px;
}

.detection-info {
  flex: 1;
}

.detection-title {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 5px;
}

.detection-meta {
  font-size: 12px;
  color: #888;
}

.detection-time {
  font-size: 12px;
  color: #666;
}
</style>
