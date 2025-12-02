<template>
  <div class="test-page">
    <!-- Top Tab Bar (same as ping page) -->
    <div class="tab-bar">
      <div class="tab-bar-container">
        <div class="tab-bar-header">
          <h2>🏓 Ping Portal</h2>
        </div>

        <div class="tab-bar-tabs">
          <nuxt-link to="/ping" class="tab-item">
            <span class="tab-icon">🏓</span>
            <span class="tab-text">Ping Status</span>
          </nuxt-link>

          <nuxt-link to="/ping/test" class="tab-item active">
            <span class="tab-icon">🧪</span>
            <span class="tab-text">Test</span>
          </nuxt-link>

          <!-- SECRET - Only visible after easter egg -->
          <nuxt-link
            v-if="secretUnlocked"
            to="/secret"
            class="tab-item secret-tab"
          >
            <span class="tab-icon">🔓</span>
            <span class="tab-text">Secret</span>
            <span class="secret-badge">NEW!</span>
          </nuxt-link>

          <!-- Locked indicator -->
          <div v-if="!secretUnlocked" class="tab-item locked-tab">
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
    <n-card title="🧪 Test Page" style="max-width: 800px; margin: 40px auto;">
      <template #header-extra>
        <n-tag type="info" size="small">Testing Area</n-tag>
      </template>

      <n-space vertical size="large">
        <!-- Info Alert -->
        <n-alert type="info">
          <template #icon>
            <span style="font-size: 20px;">🧪</span>
          </template>
          <strong>Welcome to the Test Page!</strong>
          <br>
          <span style="font-size: 13px;">
            This is a simple test page accessible from the Ping Portal sidebar.
          </span>
        </n-alert>

        <!-- Test Sections -->
        <n-card size="small" title="📊 Test Stats">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="text-align: center; padding: 16px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
              <div style="font-size: 32px;">✅</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">Status</div>
              <div style="font-size: 18px; font-weight: bold; margin-top: 4px;">Active</div>
            </div>

            <div style="text-align: center; padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
              <div style="font-size: 32px;">🎯</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">Tests Passed</div>
              <div style="font-size: 18px; font-weight: bold; margin-top: 4px;">{{ testsPassed }}</div>
            </div>

            <div style="text-align: center; padding: 16px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
              <div style="font-size: 32px;">⚡</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">Performance</div>
              <div style="font-size: 18px; font-weight: bold; margin-top: 4px;">Excellent</div>
            </div>
          </div>
        </n-card>

        <!-- Interactive Test -->
        <n-card size="small" title="🎮 Interactive Test">
          <n-space vertical>
            <div>Click the button to run a test:</div>
            <n-button type="primary" @click="runTest" :loading="testRunning" size="large">
              🚀 Run Test
            </n-button>

            <n-alert v-if="testResult" :type="testResult.type" style="margin-top: 12px;">
              <template #icon>
                <span style="font-size: 20px;">{{ testResult.icon }}</span>
              </template>
              <strong>{{ testResult.title }}</strong>
              <br>
              <span style="font-size: 13px;">{{ testResult.message }}</span>
            </n-alert>
          </n-space>
        </n-card>

        <!-- Console Test -->
        <n-card size="small" title="💻 Console Test">
          <n-space vertical>
            <div>Open the browser console to see test output:</div>
            <n-button @click="logToConsole" size="medium">
              📝 Log to Console
            </n-button>
          </n-space>
        </n-card>

        <!-- Back Button -->
        <n-button @click="goBack" text>
          ← Back to Ping Status
        </n-button>
      </n-space>
    </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Check if secret is unlocked
const secretUnlocked = ref(false);

const testsPassed = ref(42);
const testRunning = ref(false);
const testResult = ref(null);

async function runTest() {
  testRunning.value = true;
  testResult.value = null;

  // Simulate test running
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Random test result
  const success = Math.random() > 0.3;

  testResult.value = success
    ? {
        type: 'success',
        icon: '✅',
        title: 'Test Passed!',
        message: 'All systems are operational and working as expected.'
      }
    : {
        type: 'warning',
        icon: '⚠️',
        title: 'Test Warning',
        message: 'Test completed with minor warnings. Please review the logs.'
      };

  testsPassed.value++;
  testRunning.value = false;
  window.$message?.success('Test completed!');

  console.log('[Test] Test completed:', testResult.value);
}

function logToConsole() {
  console.log('%c🧪 TEST PAGE LOG', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;');
  console.log('Test Status: Active');
  console.log('Tests Passed:', testsPassed.value);
  console.log('Timestamp:', new Date().toLocaleString());
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;');

  window.$message?.success('Logged to console!');
}

function goBack() {
  navigateTo('/ping');
}

// Lifecycle
onMounted(() => {
  // Check if secret was unlocked
  if (process.client) {
    const hasToken = sessionStorage.getItem('secret_access_token');
    secretUnlocked.value = !!hasToken;

    // Block right-click and DevTools shortcuts
    const preventContextMenu = (event) => {
      event.preventDefault();
    };

    const preventDevTools = (event) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.shiftKey && event.key === "J") ||
        (event.ctrlKey && event.key === "U")
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventDevTools);

    // Cleanup on unmount
    onBeforeUnmount(() => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventDevTools);
    });
  }
});
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-top: 80px;
}

/* Tab Bar (same as ping page) */
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

.test-page :deep(.n-card) {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
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
