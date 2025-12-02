<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #8a2be2;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none; transition: color 0.3s;">
            ←
          </NuxtLink>
          <div style="font-size: 24px;">⚙️</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #8a2be2; font-weight: 700;">RULES ENGINE</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Event-Driven Automation Builder</p>
          </div>
        </div>
        <n-button type="primary" size="small" @click="showCreateRuleModal = true" style="background: #8a2be2; border: none; font-size: 11px; font-weight: 600;">
          + CREATE NEW RULE
        </n-button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px;">
      <div style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">TOTAL RULES</div>
        <div style="font-size: 20px; color: #8a2be2; font-weight: 700;">{{ stats.total || 0 }}</div>
      </div>
      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">ENABLED</div>
        <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ stats.enabled || 0 }}</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">DISABLED</div>
        <div style="font-size: 20px; color: #f52a09; font-weight: 700;">{{ stats.disabled || 0 }}</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 12px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 4px;">TOTAL EXECUTIONS</div>
        <div style="font-size: 20px; color: #00d4ff; font-weight: 700;">{{ stats.totalExecutions || 0 }}</div>
      </div>
    </div>

    <!-- Rules by Event Type -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
      <div v-for="(data, event) in byEvent" :key="event" style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="font-size: 11px; color: #8a2be2; font-weight: 600;">{{ formatEventName(event) }}</div>
          <div :style="`background: ${data.enabled > 0 ? '#10eb04' : '#666'}; width: 8px; height: 8px; border-radius: 50%;`"></div>
        </div>
        <div style="font-size: 9px; color: #888;">
          {{ data.count }} rule{{ data.count !== 1 ? 's' : '' }} ({{ data.enabled }} enabled)
        </div>
      </div>
    </div>

    <!-- Active Rules List -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 600; margin-bottom: 12px;">📋 AUTOMATION RULES</div>

      <div v-if="rules.length === 0" style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 10px;">⚙️</div>
        <div style="color: #666; font-size: 14px; margin-bottom: 10px;">No automation rules created yet</div>
        <n-button type="primary" @click="showCreateRuleModal = true" style="background: #8a2be2; border: none;">
          Create Your First Rule
        </n-button>
      </div>

      <div v-for="rule in rules" :key="rule.ruleId" style="background: rgba(0,0,0,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <!-- Rule Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div :style="`width: 10px; height: 10px; border-radius: 50%; background: ${rule.enabled ? '#10eb04' : '#666'}; box-shadow: ${rule.enabled ? '0 0 10px rgba(16,235,4,0.5)' : 'none'};`"></div>
            <span style="color: #8a2be2; font-size: 14px; font-weight: 600;">{{ rule.name }}</span>
            <span style="background: rgba(138,43,226,0.2); color: #8a2be2; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 600;">
              P{{ rule.priority || 5 }}
            </span>
          </div>
          <div style="display: flex; gap: 6px;">
            <n-button size="tiny" @click="toggleRule(rule.ruleId)" :style="`background: ${rule.enabled ? '#f52a09' : '#10eb04'}; border: none;`">
              {{ rule.enabled ? 'DISABLE' : 'ENABLE' }}
            </n-button>
            <n-button size="tiny" @click="deleteRule(rule.ruleId)" style="background: #f52a09; border: none;">
              DELETE
            </n-button>
          </div>
        </div>

        <!-- Description -->
        <div v-if="rule.description" style="color: #888; font-size: 11px; margin-bottom: 10px;">
          {{ rule.description }}
        </div>

        <!-- Rule Flow Visualization -->
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Trigger -->
            <div style="background: rgba(138,43,226,0.2); border: 1px solid #8a2be2; padding: 8px 12px; border-radius: 6px;">
              <div style="font-size: 8px; color: #888; margin-bottom: 2px;">TRIGGER</div>
              <div style="font-size: 11px; color: #8a2be2; font-weight: 600;">{{ formatEventName(rule.trigger.event) }}</div>
              <div style="font-size: 9px; color: #ccc; margin-top: 2px;">
                {{ rule.trigger.conditions.length }} condition{{ rule.trigger.conditions.length !== 1 ? 's' : '' }}
              </div>
            </div>

            <!-- Arrow -->
            <div style="color: #8a2be2; font-size: 20px;">→</div>

            <!-- Actions -->
            <div v-for="(action, index) in rule.actions" :key="index" style="display: flex; align-items: center; gap: 10px;">
              <div style="background: rgba(0,212,255,0.2); border: 1px solid #00d4ff; padding: 8px 12px; border-radius: 6px;">
                <div style="font-size: 8px; color: #888; margin-bottom: 2px;">ACTION {{ index + 1 }}</div>
                <div style="font-size: 11px; color: #00d4ff; font-weight: 600;">{{ formatActionType(action.type) }}</div>
                <div v-if="action.delay > 0" style="font-size: 8px; color: #f5a623; margin-top: 2px;">
                  Delay: {{ action.delay }}ms
                </div>
              </div>
              <div v-if="index < rule.actions.length - 1" style="color: #00d4ff; font-size: 16px;">→</div>
            </div>
          </div>
        </div>

        <!-- Conditions Details -->
        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-size: 9px; color: #888; margin-bottom: 6px;">CONDITIONS:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            <div v-for="(condition, index) in rule.trigger.conditions" :key="index"
                 style="background: rgba(138,43,226,0.1); border: 1px solid rgba(138,43,226,0.3); padding: 4px 8px; border-radius: 4px;">
              <span style="color: #8a2be2; font-size: 10px; font-weight: 600;">{{ condition.field }}</span>
              <span style="color: #888; font-size: 10px; margin: 0 4px;">{{ condition.operator }}</span>
              <span style="color: #00d4ff; font-size: 10px; font-weight: 600;">{{ formatConditionValue(condition.value) }}</span>
            </div>
          </div>
        </div>

        <!-- Rule Stats -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">EXECUTIONS</div>
            <div style="font-size: 12px; color: #00d4ff; font-weight: 600;">{{ rule.statistics?.totalExecutions || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">SUCCESS</div>
            <div style="font-size: 12px; color: #10eb04; font-weight: 600;">{{ rule.statistics?.successfulExecutions || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">FAILED</div>
            <div style="font-size: 12px; color: #f52a09; font-weight: 600;">{{ rule.statistics?.failedExecutions || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 8px; color: #888;">SUCCESS RATE</div>
            <div style="font-size: 12px; color: #f5a623; font-weight: 600;">
              {{ calculateSuccessRate(rule.statistics) }}%
            </div>
          </div>
        </div>

        <!-- Last Execution -->
        <div v-if="rule.statistics?.lastExecutedAt" style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; font-size: 9px; margin-top: 8px;">
          <span style="color: #888;">Last executed:</span>
          <span style="color: #ccc; margin-left: 6px;">{{ formatDate(rule.statistics.lastExecutedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Create Rule Modal -->
    <n-modal v-model:show="showCreateRuleModal" preset="card" style="width: 900px; background: #1a1a2e; border: 1px solid #8a2be2;">
      <template #header>
        <div style="color: #8a2be2; font-size: 16px; font-weight: 700;">⚙️ CREATE AUTOMATION RULE</div>
      </template>

      <div style="padding: 15px;">
        <!-- Rule Name & Description -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 15px;">
          <div>
            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Rule Name *</div>
            <n-input v-model:value="newRule.name" placeholder="e.g., Auto-sell when pattern detected" size="small" />
          </div>
          <div>
            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Priority (1-10)</div>
            <n-input-number v-model:value="newRule.priority" :min="1" :max="10" size="small" style="width: 100%;" />
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Description</div>
          <n-input v-model:value="newRule.description" type="textarea" placeholder="Describe what this rule does..." :rows="2" size="small" />
        </div>

        <!-- Trigger Section -->
        <div style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
          <div style="color: #8a2be2; font-size: 12px; font-weight: 600; margin-bottom: 10px;">🎯 TRIGGER EVENT</div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Event Type *</div>
            <n-select v-model:value="newRule.trigger.event" :options="eventOptions" size="small" placeholder="Select event..." />
          </div>

          <!-- Conditions Builder -->
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Conditions *</div>
          <div v-for="(condition, index) in newRule.trigger.conditions" :key="index"
               style="display: grid; grid-template-columns: 2fr 1fr 2fr auto; gap: 8px; margin-bottom: 8px;">
            <n-select v-model:value="condition.field" :options="conditionFieldOptions" size="small" placeholder="Field" />
            <n-select v-model:value="condition.operator" :options="operatorOptions" size="small" placeholder="Operator" />
            <n-input v-model:value="condition.value" placeholder="Value" size="small" />
            <n-button size="small" @click="removeCondition(index)" style="background: #f52a09; border: none;">
              ✕
            </n-button>
          </div>
          <n-button size="small" @click="addCondition" style="background: #8a2be2; border: none; font-size: 10px;">
            + Add Condition
          </n-button>
        </div>

        <!-- Actions Section -->
        <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
          <div style="color: #00d4ff; font-size: 12px; font-weight: 600; margin-bottom: 10px;">⚡ ACTIONS</div>

          <div v-for="(action, index) in newRule.actions" :key="index"
               style="background: rgba(0,0,0,0.3); border: 1px solid #0f3460; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="color: #00d4ff; font-size: 11px; font-weight: 600;">Action {{ index + 1 }}</div>
              <n-button size="tiny" @click="removeAction(index)" style="background: #f52a09; border: none; font-size: 9px;">
                REMOVE
              </n-button>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 4px;">Action Type *</div>
                <n-select v-model:value="action.type" :options="actionTypeOptions" size="small" placeholder="Select action..." />
              </div>
              <div>
                <div style="font-size: 10px; color: #888; margin-bottom: 4px;">Delay (ms)</div>
                <n-input-number v-model:value="action.delay" :min="0" size="small" style="width: 100%;" />
              </div>
            </div>

            <!-- Action Config (dynamic based on action type) -->
            <div v-if="action.type" style="margin-top: 10px;">
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">Configuration</div>

              <!-- Bot Actions -->
              <div v-if="['START_BOT', 'STOP_BOT'].includes(action.type)">
                <n-input v-model:value="action.config.botId" placeholder="Bot ID (or 'auto' for trigger bot)" size="small" />
              </div>

              <!-- Chain Actions -->
              <div v-if="['START_BOT_CHAIN', 'STOP_BOT_CHAIN'].includes(action.type)">
                <n-input v-model:value="action.config.chainId" placeholder="Chain ID (or 'auto' for trigger chain)" size="small" />
              </div>

              <!-- Notification -->
              <div v-if="action.type === 'SEND_NOTIFICATION'">
                <n-input v-model:value="action.config.message" type="textarea" placeholder="Notification message..." :rows="2" size="small" />
              </div>

              <!-- Webhook -->
              <div v-if="action.type === 'SEND_WEBHOOK'" style="display: grid; gap: 8px;">
                <n-input v-model:value="action.config.url" placeholder="Webhook URL" size="small" />
                <n-input v-model:value="action.config.method" placeholder="Method (POST, GET)" size="small" />
              </div>

              <!-- Create Order -->
              <div v-if="action.type === 'CREATE_ORDER'" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                <n-input v-model:value="action.config.symbol" placeholder="Symbol (e.g., BTC/USDC)" size="small" />
                <n-select v-model:value="action.config.side" :options="[{label: 'BUY', value: 'buy'}, {label: 'SELL', value: 'sell'}]" size="small" placeholder="Side" />
                <n-input v-model:value="action.config.amount" placeholder="Amount" size="small" />
                <n-input v-model:value="action.config.price" placeholder="Price (or 'market')" size="small" />
              </div>
            </div>
          </div>

          <n-button size="small" @click="addAction" style="background: #00d4ff; border: none; font-size: 10px;">
            + Add Action
          </n-button>
        </div>

        <!-- Advanced Settings -->
        <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; border-radius: 8px; padding: 12px;">
          <div style="color: #f5a623; font-size: 12px; font-weight: 600; margin-bottom: 10px;">⚙️ ADVANCED SETTINGS</div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <!-- Cooldown -->
            <div>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">
                <n-checkbox v-model:checked="newRule.cooldown.enabled" size="small">
                  Enable Cooldown
                </n-checkbox>
              </div>
              <n-input-number v-model:value="newRule.cooldown.duration" :disabled="!newRule.cooldown.enabled"
                              :min="0" size="small" style="width: 100%;" placeholder="Duration (ms)" />
            </div>

            <!-- Limits -->
            <div>
              <div style="font-size: 10px; color: #888; margin-bottom: 4px;">Max Executions/Day</div>
              <n-input-number v-model:value="newRule.limits.maxExecutionsPerDay" :min="1" size="small" style="width: 100%;" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <n-button @click="showCreateRuleModal = false" size="small" style="background: #666; border: none;">
            Cancel
          </n-button>
          <n-button @click="createRule" size="small" style="background: #8a2be2; border: none;">
            Create Rule
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const message = useMessage();

// State
const rules = ref([]);
const stats = ref({
  total: 0,
  enabled: 0,
  disabled: 0,
  totalExecutions: 0,
  averagePriority: 0
});
const byEvent = ref({});
const showCreateRuleModal = ref(false);

// New Rule Form
const newRule = ref({
  name: '',
  description: '',
  priority: 5,
  trigger: {
    event: null,
    conditions: [
      { field: 'confidence', operator: '>=', value: 70 }
    ]
  },
  actions: [
    { type: null, config: {}, delay: 0 }
  ],
  cooldown: {
    enabled: false,
    duration: 60000
  },
  limits: {
    maxExecutionsPerDay: 100
  }
});

// Options
const eventOptions = ref([
  { label: '🤖 Bot Started', value: 'BOT_STARTED', group: 'Bot Events' },
  { label: '🤖 Bot Stopped', value: 'BOT_STOPPED', group: 'Bot Events' },
  { label: '💰 Bot Profit Reached', value: 'BOT_PROFIT_REACHED', group: 'Bot Events' },
  { label: '📉 Bot Loss Limit', value: 'BOT_LOSS_LIMIT', group: 'Bot Events' },
  { label: '✅ Order Filled', value: 'ORDER_FILLED', group: 'Bot Events' },
  { label: '❌ Order Cancelled', value: 'ORDER_CANCELLED', group: 'Bot Events' },
  { label: '📈 Price Spike', value: 'PRICE_SPIKE', group: 'Market Events' },
  { label: '📉 Price Drop', value: 'PRICE_DROP', group: 'Market Events' },
  { label: '📊 Volume Surge', value: 'VOLUME_SURGE', group: 'Market Events' },
  { label: '🔍 Pattern Detected', value: 'PATTERN_DETECTED', group: 'Market Events' },
  { label: '🐋 Whale Wall', value: 'WHALE_WALL', group: 'Market Events' },
  { label: '🚀 Breakout', value: 'BREAKOUT', group: 'Market Events' },
  { label: '🔄 Reversal', value: 'REVERSAL', group: 'Market Events' },
  { label: '⛓️ Chain Node Completed', value: 'CHAIN_NODE_COMPLETED', group: 'Chain Events' },
  { label: '⛓️ Chain Completed', value: 'CHAIN_COMPLETED', group: 'Chain Events' },
  { label: '⛓️ Chain Failed', value: 'CHAIN_FAILED', group: 'Chain Events' }
]);

const conditionFieldOptions = ref([
  { label: 'Confidence', value: 'confidence' },
  { label: 'Price', value: 'price' },
  { label: 'Volume', value: 'volume' },
  { label: 'Symbol', value: 'symbol' },
  { label: 'Pattern Type', value: 'patternType' },
  { label: 'Signal', value: 'signal' },
  { label: 'RSI', value: 'metrics.rsi' },
  { label: 'MACD', value: 'metrics.macd' },
  { label: 'Price Change', value: 'metrics.priceChange' },
  { label: 'Volume Change', value: 'metrics.volumeChange' }
]);

const operatorOptions = ref([
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: 'contains', value: 'contains' },
  { label: 'in', value: 'in' }
]);

const actionTypeOptions = ref([
  { label: '🤖 Start Bot', value: 'START_BOT', group: 'Bot Actions' },
  { label: '🤖 Stop Bot', value: 'STOP_BOT', group: 'Bot Actions' },
  { label: '⛓️ Start Bot Chain', value: 'START_BOT_CHAIN', group: 'Chain Actions' },
  { label: '⛓️ Stop Bot Chain', value: 'STOP_BOT_CHAIN', group: 'Chain Actions' },
  { label: '❌ Cancel Orders', value: 'CANCEL_ORDERS', group: 'Order Actions' },
  { label: '❌ Cancel All Orders', value: 'CANCEL_ALL_ORDERS', group: 'Order Actions' },
  { label: '📝 Create Order', value: 'CREATE_ORDER', group: 'Order Actions' },
  { label: '🔔 Send Notification', value: 'SEND_NOTIFICATION', group: 'Notification Actions' },
  { label: '📧 Send Email', value: 'SEND_EMAIL', group: 'Notification Actions' },
  { label: '🌐 Send Webhook', value: 'SEND_WEBHOOK', group: 'Notification Actions' },
  { label: '⏸️ Pause All Bots', value: 'PAUSE_ALL_BOTS', group: 'System Actions' },
  { label: '▶️ Resume All Bots', value: 'RESUME_ALL_BOTS', group: 'System Actions' }
]);

// Methods
const fetchRules = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await $fetch('/api/v1/palantir/rules/list', {
      method: 'GET',
      params: { userId: user._id || 'demo-user' }
    });

    if (response.success) {
      rules.value = response.data;
      stats.value = response.stats;
      byEvent.value = response.byEvent;
    }
  } catch (error) {
    console.error('Error fetching rules:', error);
    message.error('Failed to load automation rules');
  }
};

const createRule = async () => {
  try {
    // Validate
    if (!newRule.value.name || !newRule.value.trigger.event || newRule.value.trigger.conditions.length === 0) {
      message.warning('Please fill in all required fields');
      return;
    }

    if (newRule.value.actions.length === 0 || !newRule.value.actions[0].type) {
      message.warning('Please add at least one action');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const response = await $fetch('/api/v1/palantir/rules/create', {
      method: 'POST',
      body: {
        userId: user._id || 'demo-user',
        name: newRule.value.name,
        description: newRule.value.description,
        priority: newRule.value.priority,
        trigger: newRule.value.trigger,
        actions: newRule.value.actions.filter(a => a.type),
        cooldown: newRule.value.cooldown,
        limits: newRule.value.limits
      }
    });

    if (response.success) {
      message.success('Automation rule created successfully!');
      showCreateRuleModal.value = false;
      resetForm();
      await fetchRules();
    }
  } catch (error) {
    console.error('Error creating rule:', error);
    message.error(error.data?.message || 'Failed to create automation rule');
  }
};

const toggleRule = async (ruleId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await $fetch('/api/v1/palantir/rules/toggle', {
      method: 'POST',
      body: {
        userId: user._id || 'demo-user',
        ruleId
      }
    });

    if (response.success) {
      message.success(response.message);
      await fetchRules();
    }
  } catch (error) {
    console.error('Error toggling rule:', error);
    message.error('Failed to toggle rule');
  }
};

const deleteRule = async (ruleId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await $fetch('/api/v1/palantir/rules/delete', {
      method: 'POST',
      body: {
        userId: user._id || 'demo-user',
        ruleId
      }
    });

    if (response.success) {
      message.success('Rule deleted successfully');
      await fetchRules();
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    message.error('Failed to delete rule');
  }
};

const addCondition = () => {
  newRule.value.trigger.conditions.push({
    field: 'confidence',
    operator: '>=',
    value: 70
  });
};

const removeCondition = (index) => {
  newRule.value.trigger.conditions.splice(index, 1);
};

const addAction = () => {
  newRule.value.actions.push({
    type: null,
    config: {},
    delay: 0
  });
};

const removeAction = (index) => {
  newRule.value.actions.splice(index, 1);
};

const resetForm = () => {
  newRule.value = {
    name: '',
    description: '',
    priority: 5,
    trigger: {
      event: null,
      conditions: [
        { field: 'confidence', operator: '>=', value: 70 }
      ]
    },
    actions: [
      { type: null, config: {}, delay: 0 }
    ],
    cooldown: {
      enabled: false,
      duration: 60000
    },
    limits: {
      maxExecutionsPerDay: 100
    }
  };
};

const formatEventName = (event) => {
  return event.replace(/_/g, ' ');
};

const formatActionType = (type) => {
  return type.replace(/_/g, ' ');
};

const formatConditionValue = (value) => {
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

const calculateSuccessRate = (statistics) => {
  if (!statistics || statistics.totalExecutions === 0) return 0;
  return ((statistics.successfulExecutions / statistics.totalExecutions) * 100).toFixed(1);
};

const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleString();
};

// Lifecycle
onMounted(() => {
  fetchRules();
});
</script>

<style scoped>
.template-card:hover {
  background: rgba(0,0,0,0.5) !important;
  border-color: #8a2be2 !important;
  transform: translateY(-2px);
}
</style>
