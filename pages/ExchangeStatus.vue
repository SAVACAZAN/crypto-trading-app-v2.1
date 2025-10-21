<template>
  <div style="padding: 20px; background: #0a0a0a; min-height: 100vh;">
    <h1 style="color: #f5a623; margin-bottom: 20px;">🚦 Exchange Status Monitor</h1>

    <!-- Auto-refresh toggle -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 20px;">
      <n-switch v-model:value="autoRefresh" size="medium">
        <template #checked>Auto-refresh ON (30s)</template>
        <template #unchecked>Auto-refresh OFF</template>
      </n-switch>

      <n-button @click="checkAllStatuses" :loading="loading" type="primary" size="medium">
        🔄 Check Now
      </n-button>

      <span v-if="lastChecked" style="color: #888; font-size: 12px;">
        Last checked: {{ lastChecked }}
      </span>
    </div>

    <!-- Critical Alert for Coinbase -->
    <n-alert v-if="criticalAlert" type="error" closable style="margin-bottom: 20px;">
      <template #header>
        🚨 CRITICAL SYSTEM ALERT
      </template>
      {{ criticalAlert }}
      <br><br>
      <strong>All automatic sync operations have been suspended to prevent errors.</strong>
    </n-alert>

    <!-- Overall Status -->
    <n-card style="margin-bottom: 20px; background: #1a1a1a;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h2 style="color: #f5a623; margin: 0;">System Status</h2>
        <div :style="`font-size: 24px; font-weight: bold; color: ${overallStatusColor}`">
          {{ overallStatus }}
        </div>
      </div>
    </n-card>

    <!-- Exchange Status Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">

      <!-- Coinbase Card -->
      <n-card v-if="statuses.coinbase"
              :style="`background: #1a1a1a; border: 2px solid ${statuses.coinbase.operational ? '#10eb04' : '#e90a15'}`">
        <template #header>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: bold;">Coinbase Advanced</span>
            <div :style="`width: 12px; height: 12px; border-radius: 50%; background: ${statuses.coinbase.operational ? '#10eb04' : '#e90a15'}; animation: ${statuses.coinbase.operational ? '' : 'pulse 2s infinite'}`"></div>
          </div>
        </template>

        <div style="display: grid; gap: 12px;">
          <!-- Status Message -->
          <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">STATUS</div>
            <div :style="`color: ${statuses.coinbase.operational ? '#10eb04' : '#e90a15'}; font-size: 14px; font-weight: bold;`">
              {{ statuses.coinbase.message }}
            </div>
          </div>

          <!-- API Status -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
              <div style="color: #888; font-size: 10px; margin-bottom: 4px;">API</div>
              <div :style="`color: ${statuses.coinbase.apiWorking ? '#10eb04' : '#e90a15'}; font-size: 12px;`">
                {{ statuses.coinbase.apiWorking ? '✅ Working' : '❌ Down' }}
              </div>
            </div>
            <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
              <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SYNC</div>
              <div :style="`color: ${statuses.coinbase.shouldDisableSync ? '#e90a15' : '#10eb04'}; font-size: 12px;`">
                {{ statuses.coinbase.shouldDisableSync ? '⛔ Disabled' : '✅ Enabled' }}
              </div>
            </div>
          </div>

          <!-- Active Incidents -->
          <div v-if="statuses.coinbase.incidents && statuses.coinbase.incidents.length > 0"
               style="padding: 10px; background: #2a0a0a; border-radius: 6px; border: 1px solid #e90a15;">
            <div style="color: #e90a15; font-size: 11px; font-weight: bold; margin-bottom: 8px;">
              ⚠️ ACTIVE INCIDENTS ({{ statuses.coinbase.incidents.length }})
            </div>
            <div v-for="incident in statuses.coinbase.incidents" :key="incident.name" style="margin-bottom: 12px;">
              <div style="color: #f5a623; font-size: 11px; font-weight: bold;">{{ incident.name }}</div>
              <div style="color: #888; font-size: 10px; margin-top: 2px;">Status: {{ incident.status }} | Impact: {{ incident.impact }}</div>
              <div v-for="update in incident.updates" :key="update.created" style="margin-top: 6px; padding-left: 10px; border-left: 2px solid #444;">
                <div style="color: #aaa; font-size: 9px;">{{ update.body }}</div>
                <div style="color: #666; font-size: 8px; margin-top: 2px;">{{ new Date(update.created).toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <!-- Components Status -->
          <div v-if="statuses.coinbase.components && statuses.coinbase.components.length > 0"
               style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 6px;">COMPONENTS</div>
            <div v-for="component in statuses.coinbase.components" :key="component.name"
                 style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
              <span style="color: #aaa;">{{ component.name }}</span>
              <span :style="`color: ${component.status === 'operational' ? '#10eb04' : '#e90a15'}`">
                {{ component.status }}
              </span>
            </div>
          </div>

          <!-- Status Page Link -->
          <a v-if="statuses.coinbase.statusPageUrl"
             :href="statuses.coinbase.statusPageUrl"
             target="_blank"
             style="display: inline-block; padding: 8px 12px; background: #2a2a2a; border-radius: 4px; color: #13e6f5; text-decoration: none; text-align: center; font-size: 11px;">
            🔗 View Official Status Page
          </a>
        </div>
      </n-card>

      <!-- LCX Card -->
      <n-card v-if="statuses.lcx"
              :style="`background: #1a1a1a; border: 2px solid ${statuses.lcx.operational ? '#10eb04' : '#e90a15'}`">
        <template #header>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: bold;">LCX Exchange</span>
            <div :style="`width: 12px; height: 12px; border-radius: 50%; background: ${statuses.lcx.operational ? '#10eb04' : '#e90a15'}; animation: ${statuses.lcx.operational ? '' : 'pulse 2s infinite'}`"></div>
          </div>
        </template>

        <div style="display: grid; gap: 12px;">
          <!-- Status Message -->
          <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">STATUS</div>
            <div :style="`color: ${statuses.lcx.operational ? '#10eb04' : '#e90a15'}; font-size: 14px; font-weight: bold;`">
              {{ statuses.lcx.message }}
            </div>
          </div>

          <!-- API Status -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
              <div style="color: #888; font-size: 10px; margin-bottom: 4px;">API</div>
              <div :style="`color: ${statuses.lcx.apiWorking ? '#10eb04' : '#e90a15'}; font-size: 12px;`">
                {{ statuses.lcx.apiWorking ? '✅ Working' : '❌ Down' }}
              </div>
            </div>
            <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
              <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SYNC</div>
              <div :style="`color: ${statuses.lcx.shouldDisableSync ? '#e90a15' : '#10eb04'}; font-size: 12px;`">
                {{ statuses.lcx.shouldDisableSync ? '⛔ Disabled' : '✅ Enabled' }}
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Kraken Card -->
      <n-card v-if="statuses.kraken"
              :style="`background: #1a1a1a; border: 2px solid ${statuses.kraken.operational ? '#10eb04' : '#e90a15'}`">
        <template #header>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: bold;">Kraken</span>
            <div :style="`width: 12px; height: 12px; border-radius: 50%; background: ${statuses.kraken.operational ? '#10eb04' : '#e90a15'}; animation: ${statuses.kraken.operational ? '' : 'pulse 2s infinite'}`"></div>
          </div>
        </template>

        <div style="display: grid; gap: 12px;">
          <!-- Status Message -->
          <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">STATUS</div>
            <div :style="`color: ${statuses.kraken.operational ? '#10eb04' : '#e90a15'}; font-size: 14px; font-weight: bold;`">
              {{ statuses.kraken.message }}
            </div>
          </div>

          <!-- API Status -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
              <div style="color: #888; font-size: 10px; margin-bottom: 4px;">API</div>
              <div :style="`color: ${statuses.kraken.apiWorking ? '#10eb04' : '#e90a15'}; font-size: 12px;`">
                {{ statuses.kraken.apiWorking ? '✅ Working' : '❌ Down' }}
              </div>
            </div>
            <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
              <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SYNC</div>
              <div :style="`color: ${statuses.kraken.shouldDisableSync ? '#e90a15' : '#10eb04'}; font-size: 12px;`">
                {{ statuses.kraken.shouldDisableSync ? '⛔ Disabled' : '✅ Enabled' }}
              </div>
            </div>
          </div>

          <!-- Status Page Link -->
          <a v-if="statuses.kraken.statusPageUrl"
             :href="statuses.kraken.statusPageUrl"
             target="_blank"
             style="display: inline-block; padding: 8px 12px; background: #2a2a2a; border-radius: 4px; color: #13e6f5; text-decoration: none; text-align: center; font-size: 11px;">
            🔗 View Official Status Page
          </a>
        </div>
      </n-card>
    </div>

    <!-- Circuit Breaker Status -->
    <n-card style="margin-top: 20px; background: #1a1a1a;">
      <template #header>
        <span style="color: #f5a623;">⚡ Circuit Breaker Status</span>
      </template>

      <div style="display: grid; gap: 10px;">
        <div style="padding: 10px; background: #0a0a0a; border-radius: 6px;">
          <div style="color: #888; font-size: 11px;">
            The circuit breaker automatically disables sync operations when exchanges are down to prevent flooding and errors.
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <div v-for="(status, exchange) in statuses" :key="exchange"
               style="padding: 10px; background: #0a0a0a; border-radius: 6px; text-align: center;">
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">{{ exchange.toUpperCase() }}</div>
            <div :style="`color: ${status.shouldDisableSync ? '#e90a15' : '#10eb04'}; font-size: 14px; font-weight: bold;`">
              {{ status.shouldDisableSync ? 'SYNC DISABLED' : 'SYNC ENABLED' }}
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Data
const loading = ref(false);
const autoRefresh = ref(true);
const lastChecked = ref(null);
const statuses = ref({});
const refreshInterval = ref(null);

// Computed
const overallStatus = computed(() => {
  const allStatuses = Object.values(statuses.value);
  if (allStatuses.length === 0) return 'CHECKING...';

  const allOperational = allStatuses.every(s => s.operational);
  const someDown = allStatuses.some(s => !s.operational);
  const coinbaseDown = statuses.value.coinbase?.shouldDisableSync;

  if (coinbaseDown) return '🚨 CRITICAL';
  if (allOperational) return '✅ ALL OPERATIONAL';
  if (someDown) return '⚠️ PARTIAL OUTAGE';
  return 'UNKNOWN';
});

const overallStatusColor = computed(() => {
  const status = overallStatus.value;
  if (status.includes('CRITICAL')) return '#e90a15';
  if (status.includes('OPERATIONAL')) return '#10eb04';
  if (status.includes('PARTIAL')) return '#f5a623';
  return '#888';
});

const criticalAlert = computed(() => {
  if (statuses.value.coinbase?.shouldDisableSync) {
    const incidents = statuses.value.coinbase.incidents || [];
    const latestIncident = incidents[0];
    if (latestIncident) {
      return `Coinbase is experiencing a major outage: "${latestIncident.name}". ${latestIncident.updates?.[0]?.body || ''}`;
    }
    return 'Coinbase API is not responding. This may be due to AWS outage or Coinbase maintenance.';
  }
  return null;
});

// Methods
const checkAllStatuses = async () => {
  loading.value = true;

  try {
    const response = await $fetch('/api/v1/checkExchangeStatus');

    if (response.success) {
      statuses.value = response.exchanges || {};
      lastChecked.value = new Date().toLocaleTimeString();

      // Log critical issues
      if (response.criticalDown) {
        console.error('🚨 CRITICAL: Exchange down, sync disabled', response.message);
      }
    }
  } catch (error) {
    console.error('Failed to check exchange status:', error);
  } finally {
    loading.value = false;
  }
};

// Auto-refresh logic
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }

  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      checkAllStatuses();
    }, 30000); // 30 seconds
  }
};

// Watch auto-refresh toggle
watch(autoRefresh, (newVal) => {
  if (newVal) {
    startAutoRefresh();
  } else if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
});

// Lifecycle
onMounted(() => {
  checkAllStatuses();
  startAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<style>
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>