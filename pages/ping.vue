<template>
  <div class="ping-page">
    <!-- Top Tab Bar -->
    <div class="tab-bar">
      <div class="tab-bar-container">
        <div class="tab-bar-header">
          <h2>🏓 Ping Portal</h2>
        </div>

        <div class="tab-bar-tabs">
          <nuxt-link to="/ping" class="tab-item" :class="{ active: currentPage === 'ping' }">
            <span class="tab-icon">🏓</span>
            <span class="tab-text">Ping Status</span>
          </nuxt-link>

          <nuxt-link to="/ping/test" class="tab-item" :class="{ active: currentPage === 'test' }">
            <span class="tab-icon">🧪</span>
            <span class="tab-text">Test</span>
          </nuxt-link>

          <!-- SECRET - Only visible after easter egg -->
          <transition name="slide-fade">
            <nuxt-link
              v-if="easterEggTriggered"
              to="/secret"
              class="tab-item secret-tab"
              :class="{ active: currentPage === 'secret' }"
            >
              <span class="tab-icon">🔓</span>
              <span class="tab-text">Secret</span>
              <span class="secret-badge">NEW!</span>
            </nuxt-link>
          </transition>

          <!-- Locked indicator -->
          <div v-if="!easterEggTriggered" class="tab-item locked-tab">
            <span class="tab-icon">🔒</span>
            <span class="tab-text">???</span>
            <span class="locked-badge">Locked</span>
          </div>
        </div>

        <!-- Hint -->
        <div class="tab-bar-hint">
          <span style="font-size: 12px; color: rgba(255,255,255,0.5);">
            💡 Console (F12) → Type magic word...
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <n-card title="🏓 Server Ping Status" style="max-width: 800px; margin: 40px auto;">
      <template #header-extra>
        <n-tag :type="pingStatus.isAlive ? 'success' : 'error'" size="small">
          {{ pingStatus.isAlive ? 'Online' : 'Offline' }}
        </n-tag>
      </template>

      <n-space vertical size="large">
        <!-- Ping Info -->
        <n-alert type="info">
          <template #icon>
            <span style="font-size: 20px;">📡</span>
          </template>
          <strong>Server Status Monitor</strong>
          <br>
          Check if the backend server is responsive
        </n-alert>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Status</div>
              <div style="font-size: 24px;">{{ pingStatus.isAlive ? '✅' : '❌' }}</div>
              <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">
                {{ pingStatus.isAlive ? 'Alive' : 'Down' }}
              </div>
            </div>
          </n-card>

          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Response Time</div>
              <div style="font-size: 24px;">⚡</div>
              <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">
                {{ pingStatus.responseTime ? pingStatus.responseTime + 'ms' : '-' }}
              </div>
            </div>
          </n-card>

          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Last Check</div>
              <div style="font-size: 24px;">🕐</div>
              <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">
                {{ pingStatus.lastCheck ? formatTime(pingStatus.lastCheck) : '-' }}
              </div>
            </div>
          </n-card>

          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Total Pings</div>
              <div style="font-size: 24px;">📊</div>
              <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">
                {{ totalPings }}
              </div>
            </div>
          </n-card>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 12px;">
          <n-button type="primary" @click="doPing" :loading="pinging" size="large">
            🏓 Ping Server
          </n-button>
          <n-button @click="startAutoPing" :disabled="autoPingEnabled" size="large">
            🔄 Auto Ping (5s)
          </n-button>
          <n-button @click="stopAutoPing" :disabled="!autoPingEnabled" size="large">
            ⏹️ Stop Auto
          </n-button>
        </div>

        <!-- Ping History -->
        <n-card size="small" title="📜 Recent Ping History">
          <div style="max-height: 300px; overflow-y: auto;">
            <div
              v-for="(entry, idx) in pingHistory"
              :key="idx"
              style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;"
            >
              <div>
                <span style="font-family: monospace; font-size: 12px;">
                  {{ formatFullTime(entry.timestamp) }}
                </span>
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <n-tag :type="entry.success ? 'success' : 'error'" size="small">
                  {{ entry.success ? 'Success' : 'Failed' }}
                </n-tag>
                <span style="font-weight: bold; color: #10b981;">{{ entry.responseTime }}ms</span>
              </div>
            </div>
            <div v-if="pingHistory.length === 0" style="text-align: center; padding: 20px; color: rgba(255,255,255,0.4);">
              No ping history yet
            </div>
          </div>
        </n-card>

        <!-- Easter Egg Hint -->
        <n-alert type="default" size="small" closable>
          <template #icon>
            <span style="font-size: 14px;">💡</span>
          </template>
          <span style="font-size: 11px; color: rgba(255,255,255,0.5);">
            Hint: Open the browser console (F12) and try typing a special word...
          </span>
        </n-alert>
      </n-space>
    </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Current page detection
const currentPage = computed(() => {
  const path = route.path;
  if (path === '/ping') return 'ping';
  if (path === '/ping/test') return 'test';
  if (path === '/secret') return 'secret';
  return 'ping';
});

// State
const pingStatus = ref({
  isAlive: false,
  responseTime: null,
  lastCheck: null
});

const pinging = ref(false);
const totalPings = ref(0);
const autoPingEnabled = ref(false);
const autoPingInterval = ref(null);
const pingHistory = ref([]);

// Easter Egg State
const easterEggTriggered = ref(false);

// Methods
async function doPing() {
  pinging.value = true;
  const startTime = Date.now();

  try {
    const response = await fetch('/api/ping');
    const data = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    pingStatus.value = {
      isAlive: data.pong === true,
      responseTime: responseTime,
      lastCheck: Date.now()
    };

    totalPings.value++;

    // Add to history
    pingHistory.value.unshift({
      timestamp: Date.now(),
      success: true,
      responseTime: responseTime
    });

    // Keep only last 20 entries
    if (pingHistory.value.length > 20) {
      pingHistory.value = pingHistory.value.slice(0, 20);
    }

    window.$message?.success(`Pong! (${responseTime}ms)`);
  } catch (error) {
    pingStatus.value = {
      isAlive: false,
      responseTime: null,
      lastCheck: Date.now()
    };

    pingHistory.value.unshift({
      timestamp: Date.now(),
      success: false,
      responseTime: '-'
    });

    window.$message?.error('Ping failed: ' + error.message);
  } finally {
    pinging.value = false;
  }
}

function startAutoPing() {
  if (autoPingEnabled.value) return;

  autoPingEnabled.value = true;
  doPing(); // First ping immediately

  autoPingInterval.value = setInterval(() => {
    doPing();
  }, 5000);

  window.$message?.info('Auto-ping enabled (every 5 seconds)');
}

function stopAutoPing() {
  if (!autoPingEnabled.value) return;

  autoPingEnabled.value = false;
  if (autoPingInterval.value) {
    clearInterval(autoPingInterval.value);
    autoPingInterval.value = null;
  }

  window.$message?.info('Auto-ping disabled');
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function formatFullTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Easter Egg: Console Trigger
function triggerEasterEgg() {
  if (easterEggTriggered.value) {
    console.log('%c🎉 Already unlocked!', 'color: #fbbf24; font-size: 16px;');
    return 'Secret already unlocked! Check the tab bar above.';
  }

  easterEggTriggered.value = true;

  console.log('%c🔓 SECRET UNLOCKED! 🔓', 'color: #10b981; font-size: 20px; font-weight: bold;');
  console.log('%cThe SECRET tab is now visible in the tab bar!', 'color: #3b82f6; font-size: 14px;');
  console.log('%cClick on it to access the secret portal...', 'color: #8b5cf6; font-size: 12px;');

  // Generate unique access token
  const accessToken = `SECRET_ACCESS_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Save token in sessionStorage - REQUIRED for /secret page access
  if (process.client) {
    sessionStorage.setItem('secret_access_token', accessToken);
    sessionStorage.setItem('secret_unlocked_at', Date.now().toString());
  }

  // Show success message
  window.$message?.success('🎉 Secret tab unlocked! Check the tab bar at the top!');

  return '🎉 Secret unlocked! Look at the tab bar - a new SECRET tab appeared!';
}

// Lifecycle
onMounted(() => {
  // Initial ping
  doPing();

  // Set up console easter egg
  if (process.client) {
    // Check if secret was already unlocked in this session
    const hasToken = sessionStorage.getItem('secret_access_token');
    if (hasToken) {
      easterEggTriggered.value = true;
    }

    // Define SAVACAZAN as a global getter that triggers the easter egg
    Object.defineProperty(window, 'SAVACAZAN', {
      get() {
        return triggerEasterEgg();
      },
      configurable: true
    });

    // Console hints
    console.clear();
    console.log('%c🏓 PING STATUS PAGE', 'color: #3b82f6; font-size: 24px; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1;');
    console.log('%c💡 Hint: There\'s a secret hidden here...', 'color: #fbbf24; font-size: 14px;');
    console.log('%c💡 Try typing a special word in this console...', 'color: #fbbf24; font-size: 12px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1;');
  }
});

onBeforeUnmount(() => {
  // Cleanup
  stopAutoPing();

  if (process.client) {
    // Remove the global property
    delete window.SAVACAZAN;
  }
});
</script>

<style scoped>
.ping-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-top: 80px;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tab-bar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.tab-bar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

.tab-bar-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
}

.tab-item.active {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-icon {
  font-size: 18px;
}

.tab-text {
  font-weight: 600;
}

/* Secret Tab Animation */
.secret-tab {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  animation: pulse-glow 2s infinite;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}

.secret-tab:hover {
  transform: translateY(-2px) scale(1.05);
}

.secret-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: bold;
  animation: blink 1s infinite;
  text-transform: uppercase;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.6);
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Locked Tab */
.locked-tab {
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.locked-tab:hover {
  transform: none;
  background: rgba(0, 0, 0, 0.3);
}

.locked-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.tab-bar-hint {
  white-space: nowrap;
  padding: 8px 16px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

/* Main Content */
.main-content {
  padding: 20px;
}

.ping-page :deep(.n-card) {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

/* Transition for secret tab */
.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .tab-bar-hint {
    display: none;
  }
}

@media (max-width: 768px) {
  .tab-bar-container {
    flex-wrap: wrap;
    gap: 12px;
  }

  .tab-bar-header h2 {
    font-size: 16px;
  }

  .tab-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .tab-icon {
    font-size: 16px;
  }
}
</style>
