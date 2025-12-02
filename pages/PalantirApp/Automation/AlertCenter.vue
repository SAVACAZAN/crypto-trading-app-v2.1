<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f52a09;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none; transition: color 0.3s;">
            ←
          </NuxtLink>
          <div style="font-size: 24px;">🚨</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #f52a09; font-weight: 700;">ALERT CENTER</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Real-time Pattern Detection Alerts</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div :style="`width: 10px; height: 10px; border-radius: 50%; background: ${alertsEnabled ? '#10eb04' : '#666'}; box-shadow: ${alertsEnabled ? '0 0 10px rgba(16,235,4,0.5)' : 'none'};`"></div>
          <span :style="`color: ${alertsEnabled ? '#10eb04' : '#666'}; font-size: 12px; font-weight: 600;`">
            {{ alertsEnabled ? 'ALERTS ACTIVE' : 'ALERTS PAUSED' }}
          </span>
          <n-button size="small" @click="toggleAlerts" :style="`background: ${alertsEnabled ? '#f52a09' : '#10eb04'}; border: none; font-size: 11px;`">
            {{ alertsEnabled ? 'PAUSE' : 'START' }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- Alert Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 15px;">
      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">TOTAL ALERTS</div>
        <div style="font-size: 20px; color: #f52a09; font-weight: 700;">{{ totalAlerts }}</div>
      </div>
      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">ACTIVE NOW</div>
        <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ activeAlerts.length }}</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">HIGH PRIORITY</div>
        <div style="font-size: 20px; color: #00d4ff; font-weight: 700;">{{ highPriorityCount }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">AVG CONFIDENCE</div>
        <div style="font-size: 20px; color: #f5a623; font-weight: 700;">{{ averageConfidence }}%</div>
      </div>
      <div style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">AUTO ACTIONS</div>
        <div style="font-size: 20px; color: #8a2be2; font-weight: 700;">{{ autoActionsCount }}</div>
      </div>
    </div>

    <!-- Live Pattern Alerts -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 600;">🚨 LIVE PATTERN ALERTS</div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <n-select v-model:value="filterPatternType" :options="patternTypeOptions" size="small" placeholder="All Patterns" style="width: 180px;" />
          <n-select v-model:value="filterConfidence" :options="confidenceOptions" size="small" placeholder="All Confidence" style="width: 150px;" />
          <n-button size="small" @click="clearAlerts" style="background: #666; border: none; font-size: 10px;">
            CLEAR ALL
          </n-button>
        </div>
      </div>

      <div v-if="filteredAlerts.length > 0" style="display: flex; flex-direction: column; gap: 10px; max-height: 500px; overflow-y: auto;">
        <div v-for="alert in filteredAlerts" :key="alert.patternId"
             :style="`background: ${getAlertBackground(alert.patternType)}; border-left: 4px solid ${getAlertColor(alert.patternType)}; padding: 12px; border-radius: 6px; transition: all 0.3s;`"
             class="alert-card">
          <!-- Alert Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 24px;">{{ getPatternIcon(alert.patternType) }}</div>
              <div>
                <div :style="`color: ${getAlertColor(alert.patternType)}; font-size: 14px; font-weight: 700;`">
                  {{ alert.patternName }}
                </div>
                <div style="color: #aaa; font-size: 10px;">{{ alert.symbol }} • {{ alert.timeframe }} • {{ formatTime(alert.detectedAt) }}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <!-- Confidence Badge -->
              <div style="text-align: right;">
                <div :style="`color: ${getConfidenceColor(alert.confidence)}; font-size: 18px; font-weight: 700;`">
                  {{ alert.confidence }}%
                </div>
                <div style="font-size: 8px; color: #888;">CONFIDENCE</div>
              </div>
              <!-- Dismiss Button -->
              <n-button size="tiny" @click="dismissAlert(alert.patternId)" style="background: #666; border: none; font-size: 9px;">
                ✕
              </n-button>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px;">
            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">PRICE</div>
              <div style="font-size: 12px; color: #00d4ff; font-weight: 600;">
                ${{ alert.price?.toFixed(4) || '0.0000' }}
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">PRICE CHANGE</div>
              <div :style="`font-size: 12px; font-weight: 600; color: ${alert.metrics?.priceChange >= 0 ? '#10eb04' : '#f52a09'};`">
                {{ alert.metrics?.priceChange >= 0 ? '+' : '' }}{{ alert.metrics?.priceChange?.toFixed(2) || '0.00' }}%
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">VOLUME</div>
              <div style="font-size: 12px; color: #f5a623; font-weight: 600;">
                {{ formatVolume(alert.volume) }}
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">RSI</div>
              <div :style="`font-size: 12px; font-weight: 600; color: ${getRsiColor(alert.metrics?.rsi)};`">
                {{ alert.metrics?.rsi?.toFixed(1) || 'N/A' }}
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
              <div style="font-size: 8px; color: #888;">SIGNAL</div>
              <div :style="`font-size: 12px; font-weight: 700; color: ${getSignalColor(alert.signal)};`">
                {{ alert.signal || 'NEUTRAL' }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <n-button size="tiny" @click="viewDetails(alert)" style="background: #00d4ff; border: none; font-size: 10px; font-weight: 600;">
              📊 VIEW DETAILS
            </n-button>
            <n-button size="tiny" @click="createRuleFromAlert(alert)" style="background: #8a2be2; border: none; font-size: 10px; font-weight: 600;">
              ⚙️ CREATE RULE
            </n-button>
            <n-button size="tiny" @click="startBotFromAlert(alert)" style="background: #10eb04; border: none; font-size: 10px; font-weight: 600;">
              🤖 START BOT
            </n-button>
            <div v-if="alert.actionTaken" style="background: rgba(0,212,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 10px; color: #00d4ff; border: 1px solid #00d4ff;">
              ✓ {{ alert.actionTaken }}
            </div>
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 14px; margin-bottom: 6px;">No active alerts</div>
        <div style="font-size: 11px; color: #888;">Pattern detection alerts will appear here in real-time</div>
      </div>
    </div>

    <!-- Alert Configuration -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⚙️ ALERT CONFIGURATION</div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <!-- Minimum Confidence -->
        <div>
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Minimum Confidence Threshold</div>
          <n-slider v-model:value="minConfidenceThreshold" :min="50" :max="100" :step="5" :marks="{ 50: '50%', 75: '75%', 100: '100%' }" />
          <div style="text-align: center; color: #00d4ff; font-size: 12px; font-weight: 600; margin-top: 6px;">
            {{ minConfidenceThreshold }}%
          </div>
        </div>

        <!-- Pattern Types -->
        <div>
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Enabled Pattern Types</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            <div v-for="type in allPatternTypes" :key="type"
                 @click="togglePatternType(type)"
                 :style="`background: ${enabledPatternTypes.includes(type) ? getAlertColor(type) : 'rgba(255,255,255,0.1)'}; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: 600; transition: all 0.3s; border: 1px solid ${enabledPatternTypes.includes(type) ? getAlertColor(type) : '#666'};`"
                 class="pattern-toggle">
              {{ type.toUpperCase() }}
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div>
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Notification Preferences</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <n-checkbox v-model:checked="notificationSettings.browser" size="small">
              Browser Notifications
            </n-checkbox>
            <n-checkbox v-model:checked="notificationSettings.sound" size="small">
              Sound Alerts
            </n-checkbox>
            <n-checkbox v-model:checked="notificationSettings.autoAction" size="small">
              Auto-Execute Rules
            </n-checkbox>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; text-align: right;">
        <n-button @click="saveAlertConfiguration" size="small" style="background: #f52a09; border: none; font-weight: 600;">
          SAVE CONFIGURATION
        </n-button>
      </div>
    </div>

    <!-- Alert Details Modal -->
    <n-modal v-model:show="showDetailsModal" preset="card" style="width: 700px; background: #1a1a2e; border: 1px solid #f52a09;">
      <template #header>
        <div style="color: #f52a09; font-size: 16px; font-weight: 700;">📊 PATTERN DETAILS</div>
      </template>

      <div v-if="selectedAlert" style="padding: 15px;">
        <!-- Pattern Info -->
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #0f3460;">
          <div style="font-size: 48px;">{{ getPatternIcon(selectedAlert.patternType) }}</div>
          <div>
            <div :style="`color: ${getAlertColor(selectedAlert.patternType)}; font-size: 18px; font-weight: 700; margin-bottom: 4px;`">
              {{ selectedAlert.patternName }}
            </div>
            <div style="color: #888; font-size: 12px;">
              {{ selectedAlert.symbol }} • {{ selectedAlert.timeframe }} • Detected {{ formatTime(selectedAlert.detectedAt) }}
            </div>
            <div style="margin-top: 6px;">
              <span :style="`background: ${getConfidenceColor(selectedAlert.confidence)}; color: #000; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700;`">
                {{ selectedAlert.confidence }}% CONFIDENCE
              </span>
            </div>
          </div>
        </div>

        <!-- Detailed Metrics -->
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #00d4ff; font-size: 13px; font-weight: 600; margin-bottom: 10px;">TECHNICAL INDICATORS</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div v-for="(value, key) in selectedAlert.metrics" :key="key" style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
              <div style="font-size: 9px; color: #888; margin-bottom: 4px;">{{ formatMetricName(key) }}</div>
              <div style="font-size: 13px; color: #fff; font-weight: 600;">{{ formatMetricValue(value) }}</div>
            </div>
          </div>
        </div>

        <!-- Trading Signal -->
        <div :style="`background: ${getSignalColor(selectedAlert.signal)}20; border: 1px solid ${getSignalColor(selectedAlert.signal)}; padding: 12px; border-radius: 8px;`">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">TRADING SIGNAL</div>
              <div :style="`font-size: 20px; font-weight: 700; color: ${getSignalColor(selectedAlert.signal)};`">
                {{ selectedAlert.signal || 'NEUTRAL' }}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">SIGNAL STRENGTH</div>
              <div style="font-size: 20px; font-weight: 700; color: #f5a623;">
                {{ selectedAlert.signalStrength || 'MODERATE' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <n-button @click="showDetailsModal = false" size="small" style="background: #666; border: none;">
            Close
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const message = useMessage();

// State
const alertsEnabled = ref(true);
const activeAlerts = ref([]);
const totalAlerts = ref(0);
const filterPatternType = ref(null);
const filterConfidence = ref(null);
const minConfidenceThreshold = ref(70);
const enabledPatternTypes = ref(['pump', 'dump', 'breakout', 'reversal', 'accumulation']);
const notificationSettings = ref({
  browser: true,
  sound: true,
  autoAction: false
});
const showDetailsModal = ref(false);
const selectedAlert = ref(null);
let pollingInterval = null;

// Pattern Types
const allPatternTypes = ref(['pump', 'dump', 'breakout', 'reversal', 'accumulation', 'distribution', 'whale_wall', 'spoofing']);

// Options
const patternTypeOptions = ref([
  { label: 'All Patterns', value: null },
  { label: '🚀 Pump', value: 'pump' },
  { label: '📉 Dump', value: 'dump' },
  { label: '💥 Breakout', value: 'breakout' },
  { label: '🔄 Reversal', value: 'reversal' },
  { label: '📊 Accumulation', value: 'accumulation' },
  { label: '📤 Distribution', value: 'distribution' },
  { label: '🐋 Whale Wall', value: 'whale_wall' },
  { label: '👻 Spoofing', value: 'spoofing' }
]);

const confidenceOptions = ref([
  { label: 'All Confidence', value: null },
  { label: '90%+', value: 90 },
  { label: '80%+', value: 80 },
  { label: '70%+', value: 70 },
  { label: '60%+', value: 60 }
]);

// Computed
const filteredAlerts = computed(() => {
  let filtered = activeAlerts.value;

  if (filterPatternType.value) {
    filtered = filtered.filter(a => a.patternType === filterPatternType.value);
  }

  if (filterConfidence.value) {
    filtered = filtered.filter(a => a.confidence >= filterConfidence.value);
  }

  return filtered;
});

const highPriorityCount = computed(() => {
  return activeAlerts.value.filter(a => a.confidence >= 80).length;
});

const averageConfidence = computed(() => {
  if (activeAlerts.value.length === 0) return 0;
  const sum = activeAlerts.value.reduce((acc, a) => acc + a.confidence, 0);
  return (sum / activeAlerts.value.length).toFixed(1);
});

const autoActionsCount = computed(() => {
  return activeAlerts.value.filter(a => a.actionTaken).length;
});

// Methods
const fetchAlerts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await $fetch('/api/v1/palantir/patterns/list', {
      method: 'GET',
      params: {
        userId: user._id || 'demo-user',
        limit: 50,
        minConfidence: minConfidenceThreshold.value
      }
    });

    if (response.success) {
      // Filter by enabled pattern types
      const filtered = response.data.filter(p => enabledPatternTypes.value.includes(p.patternType));

      // Check for new alerts
      const newAlerts = filtered.filter(alert =>
        !activeAlerts.value.some(existing => existing.patternId === alert.patternId)
      );

      if (newAlerts.length > 0 && notificationSettings.value.browser) {
        showNotification(newAlerts[0]);
      }

      if (newAlerts.length > 0 && notificationSettings.value.sound) {
        playAlertSound();
      }

      activeAlerts.value = filtered;
      totalAlerts.value = response.data.length;
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
};

const toggleAlerts = () => {
  alertsEnabled.value = !alertsEnabled.value;
  if (alertsEnabled.value) {
    startPolling();
    message.success('Alerts enabled');
  } else {
    stopPolling();
    message.warning('Alerts paused');
  }
};

const clearAlerts = async () => {
  activeAlerts.value = [];
  message.info('All alerts cleared');
};

const dismissAlert = (patternId) => {
  activeAlerts.value = activeAlerts.value.filter(a => a.patternId !== patternId);
  message.info('Alert dismissed');
};

const viewDetails = (alert) => {
  selectedAlert.value = alert;
  showDetailsModal.value = true;
};

const createRuleFromAlert = (alert) => {
  // Navigate to RulesEngine with pre-filled data
  const ruleData = {
    name: `Auto-action on ${alert.patternType} for ${alert.symbol}`,
    trigger: {
      event: 'PATTERN_DETECTED',
      conditions: [
        { field: 'patternType', operator: '=', value: alert.patternType },
        { field: 'symbol', operator: '=', value: alert.symbol },
        { field: 'confidence', operator: '>=', value: alert.confidence }
      ]
    }
  };

  localStorage.setItem('newRuleTemplate', JSON.stringify(ruleData));
  navigateTo('/PalantirApp/Automation/RulesEngine');
};

const startBotFromAlert = (alert) => {
  message.info(`Starting bot for ${alert.symbol} based on ${alert.patternType} pattern...`);
  // Implementation would connect to bot creation API
};

const togglePatternType = (type) => {
  const index = enabledPatternTypes.value.indexOf(type);
  if (index > -1) {
    enabledPatternTypes.value.splice(index, 1);
  } else {
    enabledPatternTypes.value.push(type);
  }
};

const saveAlertConfiguration = () => {
  localStorage.setItem('alertConfig', JSON.stringify({
    minConfidenceThreshold: minConfidenceThreshold.value,
    enabledPatternTypes: enabledPatternTypes.value,
    notificationSettings: notificationSettings.value
  }));
  message.success('Alert configuration saved');
};

const loadAlertConfiguration = () => {
  const config = localStorage.getItem('alertConfig');
  if (config) {
    const parsed = JSON.parse(config);
    minConfidenceThreshold.value = parsed.minConfidenceThreshold || 70;
    enabledPatternTypes.value = parsed.enabledPatternTypes || ['pump', 'dump', 'breakout', 'reversal', 'accumulation'];
    notificationSettings.value = parsed.notificationSettings || { browser: true, sound: true, autoAction: false };
  }
};

const showNotification = (alert) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`🚨 ${alert.patternName}`, {
      body: `${alert.symbol} • ${alert.confidence}% confidence • ${alert.signal} signal`,
      icon: '/icon.png'
    });
  }
};

const playAlertSound = () => {
  // Simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Could not play alert sound:', error);
  }
};

const startPolling = () => {
  fetchAlerts();
  pollingInterval = setInterval(fetchAlerts, 5000); // Poll every 5 seconds
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Utility Functions
const getPatternIcon = (type) => {
  const icons = {
    pump: '🚀',
    dump: '📉',
    breakout: '💥',
    reversal: '🔄',
    accumulation: '📊',
    distribution: '📤',
    whale_wall: '🐋',
    spoofing: '👻'
  };
  return icons[type] || '🔍';
};

const getAlertColor = (type) => {
  const colors = {
    pump: '#f52a09',
    dump: '#10eb04',
    breakout: '#00d4ff',
    reversal: '#f5a623',
    accumulation: '#8a2be2',
    distribution: '#ff69b4',
    whale_wall: '#00ff00',
    spoofing: '#ff0000'
  };
  return colors[type] || '#888';
};

const getAlertBackground = (type) => {
  return `rgba(${type === 'pump' ? '245,42,9' : type === 'dump' ? '16,235,4' : '0,212,255'},0.1)`;
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return '#10eb04';
  if (confidence >= 80) return '#00d4ff';
  if (confidence >= 70) return '#f5a623';
  return '#888';
};

const getSignalColor = (signal) => {
  if (signal === 'BUY') return '#10eb04';
  if (signal === 'SELL') return '#f52a09';
  return '#888';
};

const getRsiColor = (rsi) => {
  if (!rsi) return '#888';
  if (rsi > 70) return '#f52a09';
  if (rsi < 30) return '#10eb04';
  return '#00d4ff';
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const formatVolume = (volume) => {
  if (!volume) return 'N/A';
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toFixed(2);
};

const formatMetricName = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const formatMetricValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') return value.toFixed(2);
  return value.toString();
};

// Lifecycle
onMounted(() => {
  loadAlertConfiguration();

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (alertsEnabled.value) {
    startPolling();
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
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

.alert-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.pattern-toggle:hover {
  opacity: 0.8;
  transform: scale(1.05);
}
</style>

