<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #10eb04;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none; transition: color 0.3s;">
            ←
          </NuxtLink>
          <div style="font-size: 24px;">🔔</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #10eb04; font-weight: 700;">WEBHOOKS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Webhook Integration & Event Streaming</p>
          </div>
        </div>
        <n-button type="primary" size="small" @click="showCreateModal = true" style="background: #10eb04; border: none; font-size: 11px; font-weight: 600; color: #000;">
          + CREATE WEBHOOK
        </n-button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px;">
      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">TOTAL WEBHOOKS</div>
        <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ webhooks.length }}</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">ACTIVE</div>
        <div style="font-size: 20px; color: #00d4ff; font-weight: 700;">{{ activeWebhooks }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">EVENTS SENT (24H)</div>
        <div style="font-size: 20px; color: #f5a623; font-weight: 700;">{{ totalEventsSent }}</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">FAILURES (24H)</div>
        <div style="font-size: 20px; color: #f52a09; font-weight: 700;">{{ totalFailures }}</div>
      </div>
    </div>

    <!-- Webhooks List -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <div style="color: #10eb04; font-size: 14px; font-weight: 600; margin-bottom: 12px;">📡 CONFIGURED WEBHOOKS</div>

      <div v-if="webhooks.length === 0" style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔔</div>
        <div style="color: #666; font-size: 14px; margin-bottom: 10px;">No webhooks configured</div>
        <n-button type="primary" @click="showCreateModal = true" style="background: #10eb04; border: none; color: #000;">
          Create Your First Webhook
        </n-button>
      </div>

      <div v-for="webhook in webhooks" :key="webhook.id" style="background: rgba(0,0,0,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <!-- Webhook Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div :style="`width: 10px; height: 10px; border-radius: 50%; background: ${webhook.enabled ? '#10eb04' : '#666'}; box-shadow: ${webhook.enabled ? '0 0 10px rgba(16,235,4,0.5)' : 'none'};`"></div>
            <div>
              <div style="color: #10eb04; font-size: 14px; font-weight: 600;">{{ webhook.name }}</div>
              <div style="color: #888; font-size: 10px;">{{ webhook.url }}</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <n-button size="tiny" @click="testWebhook(webhook)" style="background: #00d4ff; border: none; font-size: 9px; font-weight: 600;">
              TEST
            </n-button>
            <n-button size="tiny" @click="toggleWebhook(webhook)" :style="`background: ${webhook.enabled ? '#f52a09' : '#10eb04'}; border: none; font-size: 9px; font-weight: 600; color: ${webhook.enabled ? '#fff' : '#000'};`">
              {{ webhook.enabled ? 'DISABLE' : 'ENABLE' }}
            </n-button>
            <n-button size="tiny" @click="editWebhook(webhook)" style="background: #8a2be2; border: none; font-size: 9px; font-weight: 600;">
              EDIT
            </n-button>
            <n-button size="tiny" @click="deleteWebhook(webhook.id)" style="background: #f52a09; border: none; font-size: 9px; font-weight: 600;">
              DELETE
            </n-button>
          </div>
        </div>

        <!-- Webhook Details -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px;">
          <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
            <div style="font-size: 9px; color: #888; margin-bottom: 4px;">METHOD</div>
            <div style="font-size: 12px; color: #00d4ff; font-weight: 600;">{{ webhook.method || 'POST' }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
            <div style="font-size: 9px; color: #888; margin-bottom: 4px;">EVENTS SUBSCRIBED</div>
            <div style="font-size: 12px; color: #f5a623; font-weight: 600;">{{ webhook.events?.length || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
            <div style="font-size: 9px; color: #888; margin-bottom: 4px;">SUCCESS RATE</div>
            <div :style="`font-size: 12px; font-weight: 600; color: ${getSuccessRateColor(webhook.stats?.successRate)};`">
              {{ webhook.stats?.successRate || 0 }}%
            </div>
          </div>
        </div>

        <!-- Event Types -->
        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-size: 9px; color: #888; margin-bottom: 6px;">SUBSCRIBED EVENTS:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            <div v-for="event in webhook.events" :key="event"
                 style="background: rgba(16,235,4,0.2); border: 1px solid #10eb04; padding: 4px 10px; border-radius: 4px; font-size: 10px; color: #10eb04; font-weight: 600;">
              {{ event }}
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">SENT (24H)</div>
            <div style="font-size: 12px; color: #10eb04; font-weight: 600;">{{ webhook.stats?.sent24h || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">SUCCESSFUL</div>
            <div style="font-size: 12px; color: #00d4ff; font-weight: 600;">{{ webhook.stats?.successful || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">FAILED</div>
            <div style="font-size: 12px; color: #f52a09; font-weight: 600;">{{ webhook.stats?.failed || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">LAST SENT</div>
            <div style="font-size: 11px; color: #888; font-weight: 600;">{{ formatTime(webhook.stats?.lastSent) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Log -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
      <div style="color: #10eb04; font-size: 14px; font-weight: 600; margin-bottom: 12px;">📜 RECENT WEBHOOK ACTIVITY</div>

      <div v-if="recentActivity.length > 0" style="max-height: 300px; overflow-y: auto;">
        <div v-for="(activity, index) in recentActivity" :key="index"
             :style="`background: ${activity.success ? 'rgba(16,235,4,0.05)' : 'rgba(245,42,9,0.05)'}; border-left: 3px solid ${activity.success ? '#10eb04' : '#f52a09'}; padding: 10px; margin-bottom: 8px; border-radius: 4px;`">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; color: #fff; font-weight: 600; margin-bottom: 4px;">
                {{ activity.webhookName }} • {{ activity.event }}
              </div>
              <div style="font-size: 9px; color: #888;">
                {{ activity.url }} • {{ formatTime(activity.timestamp) }}
              </div>
            </div>
            <div :style="`font-size: 10px; font-weight: 700; color: ${activity.success ? '#10eb04' : '#f52a09'};`">
              {{ activity.success ? '✓ SUCCESS' : '✗ FAILED' }}
              <span v-if="!activity.success" style="font-size: 9px; font-weight: 400; margin-left: 6px;">
                ({{ activity.statusCode }})
              </span>
            </div>
          </div>
          <div v-if="activity.error" style="font-size: 9px; color: #f52a09; margin-top: 4px;">
            Error: {{ activity.error }}
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 30px; color: #666;">
        <div style="font-size: 36px; margin-bottom: 10px;">📜</div>
        <div style="font-size: 12px;">No webhook activity yet</div>
      </div>
    </div>

    <!-- Create/Edit Webhook Modal -->
    <n-modal v-model:show="showCreateModal" preset="card" style="width: 700px; background: #1a1a2e; border: 1px solid #10eb04;">
      <template #header>
        <div style="color: #10eb04; font-size: 16px; font-weight: 700;">
          {{ editingWebhook ? '✏️ EDIT WEBHOOK' : '🔔 CREATE WEBHOOK' }}
        </div>
      </template>

      <div style="padding: 15px;">
        <!-- Webhook Name -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Webhook Name *</div>
          <n-input v-model:value="formData.name" placeholder="e.g., Telegram Alerts" size="small" />
        </div>

        <!-- Webhook URL -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Webhook URL *</div>
          <n-input v-model:value="formData.url" placeholder="https://your-webhook-endpoint.com" size="small" />
        </div>

        <!-- Method & Secret -->
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-bottom: 15px;">
          <div>
            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Method</div>
            <n-select v-model:value="formData.method" :options="methodOptions" size="small" />
          </div>
          <div>
            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Secret Key (Optional)</div>
            <n-input v-model:value="formData.secret" placeholder="For signature verification" type="password" size="small" />
          </div>
        </div>

        <!-- Event Subscriptions -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Subscribe to Events *</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <n-checkbox v-for="event in availableEvents" :key="event.value"
                        :checked="formData.events.includes(event.value)"
                        @update:checked="(checked) => toggleEvent(event.value, checked)"
                        size="small">
              {{ event.label }}
            </n-checkbox>
          </div>
        </div>

        <!-- Headers -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Custom Headers (JSON)</div>
          <n-input v-model:value="formData.headers" type="textarea" :rows="3" placeholder='{"Authorization": "Bearer token"}' size="small" />
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <n-button @click="cancelEdit" size="small" style="background: #666; border: none;">
            Cancel
          </n-button>
          <n-button @click="saveWebhook" size="small" style="background: #10eb04; border: none; color: #000; font-weight: 600;">
            {{ editingWebhook ? 'Update' : 'Create' }} Webhook
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const message = useMessage();

// State
const webhooks = ref([]);
const recentActivity = ref([]);
const showCreateModal = ref(false);
const editingWebhook = ref(null);
const formData = ref({
  name: '',
  url: '',
  method: 'POST',
  secret: '',
  events: [],
  headers: ''
});

// Options
const methodOptions = ref([
  { label: 'POST', value: 'POST' },
  { label: 'GET', value: 'GET' },
  { label: 'PUT', value: 'PUT' }
]);

const availableEvents = ref([
  { label: '🔍 Pattern Detected', value: 'PATTERN_DETECTED' },
  { label: '🤖 Bot Started', value: 'BOT_STARTED' },
  { label: '🤖 Bot Stopped', value: 'BOT_STOPPED' },
  { label: '💰 Bot Profit Reached', value: 'BOT_PROFIT_REACHED' },
  { label: '📉 Bot Loss Limit', value: 'BOT_LOSS_LIMIT' },
  { label: '✅ Order Filled', value: 'ORDER_FILLED' },
  { label: '❌ Order Cancelled', value: 'ORDER_CANCELLED' },
  { label: '⛓️ Chain Completed', value: 'CHAIN_COMPLETED' },
  { label: '⛓️ Chain Failed', value: 'CHAIN_FAILED' },
  { label: '📈 Price Spike', value: 'PRICE_SPIKE' },
  { label: '📉 Price Drop', value: 'PRICE_DROP' },
  { label: '📊 Volume Surge', value: 'VOLUME_SURGE' }
]);

// Computed
const activeWebhooks = computed(() => {
  return webhooks.value.filter(w => w.enabled).length;
});

const totalEventsSent = computed(() => {
  return webhooks.value.reduce((sum, w) => sum + (w.stats?.sent24h || 0), 0);
});

const totalFailures = computed(() => {
  return webhooks.value.reduce((sum, w) => sum + (w.stats?.failed || 0), 0);
});

// Methods
const loadWebhooks = () => {
  // Load from localStorage (in real app, fetch from API)
  const stored = localStorage.getItem('palantir_webhooks');
  if (stored) {
    webhooks.value = JSON.parse(stored);
  } else {
    // Demo data
    webhooks.value = [
      {
        id: '1',
        name: 'Telegram Bot Alerts',
        url: 'https://api.telegram.org/bot123/sendMessage',
        method: 'POST',
        enabled: true,
        events: ['PATTERN_DETECTED', 'BOT_PROFIT_REACHED'],
        stats: {
          sent24h: 42,
          successful: 40,
          failed: 2,
          successRate: 95.2,
          lastSent: new Date(Date.now() - 300000)
        }
      }
    ];
  }

  // Load activity
  const storedActivity = localStorage.getItem('palantir_webhook_activity');
  if (storedActivity) {
    recentActivity.value = JSON.parse(storedActivity);
  }
};

const saveWebhook = () => {
  if (!formData.value.name || !formData.value.url || formData.value.events.length === 0) {
    message.warning('Please fill in all required fields');
    return;
  }

  if (editingWebhook.value) {
    // Update existing
    const index = webhooks.value.findIndex(w => w.id === editingWebhook.value.id);
    webhooks.value[index] = {
      ...webhooks.value[index],
      ...formData.value,
      headers: formData.value.headers ? JSON.parse(formData.value.headers) : {}
    };
    message.success('Webhook updated successfully');
  } else {
    // Create new
    webhooks.value.push({
      id: Date.now().toString(),
      ...formData.value,
      enabled: true,
      headers: formData.value.headers ? JSON.parse(formData.value.headers) : {},
      stats: {
        sent24h: 0,
        successful: 0,
        failed: 0,
        successRate: 0
      }
    });
    message.success('Webhook created successfully');
  }

  localStorage.setItem('palantir_webhooks', JSON.stringify(webhooks.value));
  cancelEdit();
};

const editWebhook = (webhook) => {
  editingWebhook.value = webhook;
  formData.value = {
    name: webhook.name,
    url: webhook.url,
    method: webhook.method,
    secret: webhook.secret || '',
    events: [...webhook.events],
    headers: webhook.headers ? JSON.stringify(webhook.headers, null, 2) : ''
  };
  showCreateModal.value = true;
};

const deleteWebhook = (id) => {
  webhooks.value = webhooks.value.filter(w => w.id !== id);
  localStorage.setItem('palantir_webhooks', JSON.stringify(webhooks.value));
  message.success('Webhook deleted');
};

const toggleWebhook = (webhook) => {
  webhook.enabled = !webhook.enabled;
  localStorage.setItem('palantir_webhooks', JSON.stringify(webhooks.value));
  message.success(`Webhook ${webhook.enabled ? 'enabled' : 'disabled'}`);
};

const testWebhook = async (webhook) => {
  message.loading('Testing webhook...');

  // Simulate webhook test
  setTimeout(() => {
    const success = Math.random() > 0.2;

    recentActivity.value.unshift({
      webhookName: webhook.name,
      url: webhook.url,
      event: 'TEST_EVENT',
      success,
      statusCode: success ? 200 : 500,
      error: success ? null : 'Connection timeout',
      timestamp: new Date()
    });

    localStorage.setItem('palantir_webhook_activity', JSON.stringify(recentActivity.value.slice(0, 50)));

    if (success) {
      message.success('Webhook test successful!');
    } else {
      message.error('Webhook test failed');
    }
  }, 1500);
};

const toggleEvent = (eventValue, checked) => {
  if (checked) {
    formData.value.events.push(eventValue);
  } else {
    formData.value.events = formData.value.events.filter(e => e !== eventValue);
  }
};

const cancelEdit = () => {
  showCreateModal.value = false;
  editingWebhook.value = null;
  formData.value = {
    name: '',
    url: '',
    method: 'POST',
    secret: '',
    events: [],
    headers: ''
  };
};

const getSuccessRateColor = (rate) => {
  if (!rate) return '#888';
  if (rate >= 95) return '#10eb04';
  if (rate >= 80) return '#f5a623';
  return '#f52a09';
};

const formatTime = (date) => {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadWebhooks();
});
</script>

<style scoped>
</style>

