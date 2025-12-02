<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0f3460;">
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
        <div style="font-size: 32px;">🎯</div>
        <div>
          <h1 style="margin: 0; font-size: 28px; color: #00d4ff; font-weight: 700; text-shadow: 0 0 10px rgba(0,212,255,0.5);">
            PALANTIR TRADING INTELLIGENCE
          </h1>
          <p style="margin: 5px 0 0 0; color: #888; font-size: 13px;">
            Event-Driven Automation • Pattern Recognition • Real-Time Analytics
          </p>
        </div>
      </div>

      <!-- Quick Stats Bar -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px;">
        <div style="background: rgba(0,212,255,0.1); padding: 10px; border-radius: 6px; border: 1px solid #00d4ff;">
          <div style="font-size: 10px; color: #888; margin-bottom: 3px;">ACTIVE CHAINS</div>
          <div style="font-size: 20px; color: #00d4ff; font-weight: 700;">{{ stats.activeChains }}</div>
        </div>
        <div style="background: rgba(16,235,4,0.1); padding: 10px; border-radius: 6px; border: 1px solid #10eb04;">
          <div style="font-size: 10px; color: #888; margin-bottom: 3px;">PATTERNS DETECTED</div>
          <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ stats.patternsDetected }}</div>
        </div>
        <div style="background: rgba(245,166,35,0.1); padding: 10px; border-radius: 6px; border: 1px solid #f5a623;">
          <div style="font-size: 10px; color: #888; margin-bottom: 3px;">AUTO TRIGGERS</div>
          <div style="font-size: 20px; color: #f5a623; font-weight: 700;">{{ stats.autoTriggers }}</div>
        </div>
        <div style="background: rgba(138,43,226,0.1); padding: 10px; border-radius: 6px; border: 1px solid #8a2be2;">
          <div style="font-size: 10px; color: #888; margin-bottom: 3px;">SUCCESS RATE</div>
          <div style="font-size: 20px; color: #8a2be2; font-weight: 700;">{{ stats.successRate }}%</div>
        </div>
      </div>
    </div>

    <!-- Navigation Cards -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
      <!-- FAZA 1: Bot Chains -->
      <NuxtLink to="/PalantirApp/BotChains" style="text-decoration: none;">
        <div class="feature-card" style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); border: 2px solid #00d4ff; cursor: pointer; transition: all 0.3s; height: 100%;">
          <div style="font-size: 48px; margin-bottom: 15px;">⛓️</div>
          <h2 style="color: #00d4ff; font-size: 20px; margin: 0 0 10px 0; font-weight: 700;">
            FAZA 1: BOT CHAINS
          </h2>
          <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin-bottom: 15px;">
            Event-Driven Automation System
          </p>

          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-size: 11px; color: #888; margin-bottom: 8px;">FEATURES:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Link bots with conditional triggers</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Auto-start on profit/loss thresholds</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Visual chain builder & monitoring</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Cascade strategies (BUY→SELL→DCA)</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; color: #00d4ff; font-size: 13px; font-weight: 600;">
            OPEN BOT CHAINS →
          </div>
        </div>
      </NuxtLink>

      <!-- FAZA 2: Pattern Recognition -->
      <NuxtLink to="/PalantirApp/PatternRecognition" style="text-decoration: none;">
        <div class="feature-card" style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); border: 2px solid #10eb04; cursor: pointer; transition: all 0.3s; height: 100%;">
          <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
          <h2 style="color: #10eb04; font-size: 20px; margin: 0 0 10px 0; font-weight: 700;">
            FAZA 2: PATTERN RECOGNITION
          </h2>
          <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin-bottom: 15px;">
            AI-Powered Market Analysis Engine
          </p>

          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-size: 11px; color: #888; margin-bottom: 8px;">PATTERNS:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #f52a09; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Pump & Dump detection</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #f5a623; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Breakout & Reversal signals</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #00d4ff; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Accumulation zones</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #8a2be2; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Whale wall & spoofing alerts</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; color: #10eb04; font-size: 13px; font-weight: 600;">
            OPEN PATTERN SCANNER →
          </div>
        </div>
      </NuxtLink>

      <!-- FAZA 3: Analytics Dashboard -->
      <NuxtLink to="/PalantirApp/Analytics" style="text-decoration: none;">
        <div class="feature-card" style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); border: 2px solid #f5a623; cursor: pointer; transition: all 0.3s; height: 100%;">
          <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
          <h2 style="color: #f5a623; font-size: 20px; margin: 0 0 10px 0; font-weight: 700;">
            FAZA 3: REAL-TIME ANALYTICS
          </h2>
          <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin-bottom: 15px;">
            Multi-Timeframe Intelligence Dashboard
          </p>

          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-size: 11px; color: #888; margin-bottom: 8px;">ANALYTICS:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Multi-timeframe correlation</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Live pattern alerts feed</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Bot chain visualization graph</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%;"></div>
                <span style="color: #ccc; font-size: 11px;">Event log & execution history</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; color: #f5a623; font-size: 13px; font-weight: 600;">
            OPEN DASHBOARD →
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- System Status -->
    <div style="background: rgba(15,52,96,0.3); padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #0f3460;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="width: 12px; height: 12px; background: #10eb04; border-radius: 50%; box-shadow: 0 0 10px rgba(16,235,4,0.5); animation: pulse 2s infinite;"></div>
          <span style="color: #10eb04; font-size: 13px; font-weight: 600;">PALANTIR ENGINE ACTIVE</span>
          <span style="color: #666; font-size: 11px;">|</span>
          <span style="color: #888; font-size: 11px;">Real-time scanning enabled</span>
          <span style="color: #666; font-size: 11px;">|</span>
          <span style="color: #888; font-size: 11px;">Auto-execution: ON</span>
        </div>
        <div style="color: #666; font-size: 11px;">
          Last update: {{ currentTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const stats = ref({
  activeChains: 0,
  patternsDetected: 0,
  autoTriggers: 0,
  successRate: 0
});

const currentTime = ref('');
let timeInterval = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString();
};

const loadStats = async () => {
  try {
    // TODO: Implement API call to fetch real stats
    stats.value = {
      activeChains: 3,
      patternsDetected: 127,
      autoTriggers: 45,
      successRate: 78.5
    };
  } catch (error) {
    console.error('Error loading Palantir stats:', error);
  }
};

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  loadStats();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.feature-card {
  padding: 25px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,212,255,0.3);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
