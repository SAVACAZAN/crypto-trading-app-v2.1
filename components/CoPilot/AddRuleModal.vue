<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    title="➕ Add Automation Rule to Order"
    style="width: 700px; max-height: 90vh; overflow-y: auto;"
  >
    <n-space vertical :size="16" v-if="order">
      <!-- Order Info -->
      <n-card size="small" title="📊 Order Information">
        <n-descriptions bordered :column="2" size="small">
          <n-descriptions-item label="Symbol">{{ order.symbol }}</n-descriptions-item>
          <n-descriptions-item label="Side">
            <n-tag :type="order.side === 'buy' ? 'success' : 'error'" size="small">
              {{ order.side?.toUpperCase() }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Amount">{{ order.amount }}</n-descriptions-item>
          <n-descriptions-item label="Price">${{ order.price }}</n-descriptions-item>
          <n-descriptions-item label="Total Value">${{ (order.amount * order.price).toFixed(2) }}</n-descriptions-item>
          <n-descriptions-item label="API Key">{{ order.apiKeyName }}</n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- Rule Configuration -->
      <n-card size="small" title="⚙️ Rule Configuration">
        <n-form-item label="Rule Name" required>
          <n-input v-model:value="ruleForm.ruleName" placeholder="Enter rule name" />
        </n-form-item>

        <n-form-item label="Rule Type">
          <n-select v-model:value="ruleForm.ruleType" :options="ruleTypes" />
        </n-form-item>

        <n-form-item label="Trigger Condition">
          <n-select v-model:value="ruleForm.triggerCondition" :options="triggerConditions" />
        </n-form-item>

        <!-- Create Bot Config -->
        <div v-if="ruleForm.ruleType === 'create_bot'">
          <n-divider>Bot Creation Settings</n-divider>
          <n-form-item label="Bot Type">
            <n-select
              v-model:value="ruleForm.actionConfig.botType"
              :options="botTypeOptions"
              @update:value="onBotTypeChange"
            />
          </n-form-item>

          <!-- OneClick Strategy Selector -->
          <div v-if="ruleForm.actionConfig.botType === 'oneclick'">
            <n-form-item label="Strategy Configuration">
              <n-select
                v-model:value="ruleForm.actionConfig.oneClickStrategy"
                :options="oneClickStrategyOptions"
                :loading="loadingStrategies"
                placeholder="Select strategy or custom"
              />
            </n-form-item>

            <!-- Strategy Details Preview (for saved strategies) -->
            <div v-if="selectedStrategyDetails && ruleForm.actionConfig.oneClickStrategy !== 'custom'" style="margin-top: 12px;">
              <n-card size="small" style="background: #1a1f2e; border: 1px solid #2a3441;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <div style="font-size: 13px; font-weight: bold; color: #10eb04;">
                    📊 Strategy Details
                  </div>
                  <n-tag type="success" size="small">
                    {{ selectedStrategyDetails.pairs?.length || 0 }} pairs
                  </n-tag>
                </div>

                <!-- Summary Stats -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
                  <div style="background: #16181d; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #888;">Total Orders</div>
                    <div style="font-size: 14px; font-weight: 700; color: #6366f1;">
                      {{ (selectedStrategyDetails.pairs?.length || 0) * (selectedStrategyDetails.pairs?.[0]?.grids || 10) }}
                    </div>
                  </div>
                  <div style="background: #16181d; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #888;">Grids/Pair</div>
                    <div style="font-size: 14px; font-weight: 700; color: #a78bfa;">
                      {{ selectedStrategyDetails.pairs?.[0]?.grids || 10 }}
                    </div>
                  </div>
                  <div style="background: #16181d; padding: 8px; border-radius: 4px;">
                    <div style="font-size: 10px; color: #888;">Amount</div>
                    <div style="font-size: 14px; font-weight: 700; color: #ffd93d;">
                      {{ selectedStrategyDetails.pairs?.[0]?.amount || 1 }}
                    </div>
                  </div>
                </div>

                <!-- Pairs List (Collapsible) -->
                <n-collapse arrow-placement="right">
                  <n-collapse-item title="📋 View All Pairs" name="pairs">
                    <div style="max-height: 200px; overflow-y: auto;">
                      <div v-for="(pair, idx) in selectedStrategyDetails.pairs" :key="idx"
                        style="display: flex; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #2a3441; font-size: 11px;"
                      >
                        <span style="color: #6366f1; font-weight: 600;">{{ pair.symbol }}</span>
                        <div style="display: flex; gap: 12px; color: #888;">
                          <span>📉 {{ pair.lowerPricePercent }}%</span>
                          <span>📈 {{ pair.upperPricePercent }}%</span>
                          <span>🔢 {{ pair.grids }}</span>
                          <span>💰 {{ pair.amount }}</span>
                        </div>
                      </div>
                    </div>
                  </n-collapse-item>
                </n-collapse>
              </n-card>
            </div>

            <!-- Custom Configuration Form -->
            <div v-if="ruleForm.actionConfig.oneClickStrategy === 'custom'" style="margin-top: 12px;">
              <n-alert type="warning" :bordered="false" style="margin-bottom: 12px;">
                <template #icon><span>⚙️</span></template>
                Configure custom OneClick settings below
              </n-alert>

              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-gi>
                  <n-form-item label="Lower Price %" size="small">
                    <n-input-number v-model:value="ruleForm.actionConfig.lowerPricePercent" :min="-50" :max="0" :step="1" placeholder="-20" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Upper Price %" size="small">
                    <n-input-number v-model:value="ruleForm.actionConfig.upperPricePercent" :min="0" :max="50" :step="1" placeholder="1" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Amount" size="small">
                    <n-input-number v-model:value="ruleForm.actionConfig.amount" :min="0.001" :step="0.1" placeholder="1.1" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="Nr of Grids" size="small">
                    <n-input-number v-model:value="ruleForm.actionConfig.nrOfGrids" :min="1" :max="100" :step="1" placeholder="10" style="width: 100%;" />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>
          </div>

          <!-- Grid Bot Configuration -->
          <div v-if="ruleForm.actionConfig.botType === 'grid'">
            <n-divider>📊 Grid Bot Configuration</n-divider>
            <n-grid :cols="2" :x-gap="12" :y-gap="8">
              <n-gi>
                <n-form-item label="Lower Price" size="small">
                  <n-input-number v-model:value="ruleForm.actionConfig.botConfig.lowerPrice" :precision="6" placeholder="Support level" style="width: 100%;" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Upper Price" size="small">
                  <n-input-number v-model:value="ruleForm.actionConfig.botConfig.upperPrice" :precision="6" placeholder="Resistance level" style="width: 100%;" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Nr of Grids" size="small">
                  <n-input-number v-model:value="ruleForm.actionConfig.botConfig.nrOfGrids" :min="2" :max="100" :step="1" placeholder="10" style="width: 100%;" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Amount per Grid" size="small">
                  <n-input-number v-model:value="ruleForm.actionConfig.botConfig.amount" :min="0.001" :precision="4" placeholder="Amount" style="width: 100%;" />
                </n-form-item>
              </n-gi>
              <n-gi :span="2">
                <n-form-item label="Orders Side" size="small">
                  <n-select v-model:value="ruleForm.actionConfig.botConfig.ordersSide" :options="[
                    { label: 'Buy & Sell', value: 'buyOrSell' },
                    { label: 'Buy Only', value: 'buyOnly' },
                    { label: 'Sell Only', value: 'sellOnly' }
                  ]" placeholder="Select side" style="width: 100%;" />
                </n-form-item>
              </n-gi>
            </n-grid>
          </div>
        </div>
      </n-card>
    </n-space>

    <template #footer>
      <n-space justify="end">
        <n-button @click="$emit('update:show', false)">Cancel</n-button>
        <n-button type="primary" @click="handleSave">
          <template #icon><span>💾</span></template>
          Save Rule
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useCoPilotRules } from '~/composables/useCoPilotRules';
import { BOT_TYPES } from '~/constants/botTypes';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  order: {
    type: Object,
    default: null
  },
  selectedBotType: {
    type: String,
    default: null
  },
  oneClickStrategies: {
    type: Array,
    default: () => []
  },
  loadingStrategies: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'save']);

const { getDefaultBotConfigForType } = useCoPilotRules();

const ruleForm = ref({
  ruleName: '',
  ruleType: 'create_bot',
  triggerCondition: 'on_fill',
  actionConfig: {
    botType: null,
    botConfig: {},
    oneClickStrategy: 'custom',
    lowerPricePercent: -20,
    upperPricePercent: 1,
    amount: 1.1,
    nrOfGrids: 10
  }
});

const ruleTypes = [
  { label: '📋 Copy Order', value: 'copy_order' },
  { label: '🔄 Reverse Order', value: 'reverse_order' },
  { label: '🤖 Create Bot', value: 'create_bot' },
  { label: '❌ Cancel Order', value: 'cancel_order' }
];

const triggerConditions = [
  { label: '✅ On Fill', value: 'on_fill' },
  { label: '🔵 On Partial Fill', value: 'on_partial_fill' },
  { label: '❌ On Cancel', value: 'on_cancel' }
];

const botTypeOptions = computed(() => {
  return Object.values(BOT_TYPES).map(bot => ({
    label: `${bot.icon} ${bot.name}`,
    value: bot.id
  }));
});

const oneClickStrategyOptions = computed(() => {
  return [
    { label: '⚙️ Custom (Manual Setup)', value: 'custom' },
    ...props.oneClickStrategies.map(s => ({
      label: `${s.name} (${s.pairs?.length || 0} pairs)`,
      value: s._id
    }))
  ];
});

// Selected strategy details for preview
const selectedStrategyDetails = computed(() => {
  const strategyId = ruleForm.value.actionConfig.oneClickStrategy;
  if (!strategyId || strategyId === 'custom') return null;

  const strategy = props.oneClickStrategies?.find(s => s._id === strategyId);
  return strategy || null;
});

watch(() => props.show, (newVal) => {
  if (newVal && props.order) {
    initializeForm();
  }
});

function initializeForm() {
  const botType = props.selectedBotType || 'grid';
  const orderPrice = parseFloat(props.order.price);
  const suggestedLower = parseFloat((orderPrice * 0.9).toFixed(6));
  const suggestedUpper = parseFloat((orderPrice * 1.1).toFixed(6));

  ruleForm.value = {
    ruleName: `${botType.toUpperCase()} Rule for ${props.order.symbol}`,
    ruleType: 'create_bot',
    triggerCondition: 'on_fill',
    actionConfig: {
      botType: botType,
      botConfig: {
        ...getDefaultBotConfigForType(botType),
        symbol: props.order.symbol,
        lowerPrice: suggestedLower,
        upperPrice: suggestedUpper,
        amount: props.order.amount
      },
      oneClickStrategy: botType === 'oneclick' ? 'custom' : undefined,
      lowerPricePercent: -20,
      upperPricePercent: 1,
      amount: props.order.amount,
      nrOfGrids: 10
    }
  };
}

function onBotTypeChange(value) {
  const defaultConfig = getDefaultBotConfigForType(value);
  ruleForm.value.actionConfig.botConfig = {
    ...defaultConfig,
    symbol: props.order?.symbol,
    lowerPrice: parseFloat((parseFloat(props.order?.price) * 0.9).toFixed(6)),
    upperPrice: parseFloat((parseFloat(props.order?.price) * 1.1).toFixed(6)),
    amount: props.order?.amount
  };
  ruleForm.value.ruleName = `${value.toUpperCase()} Rule for ${props.order?.symbol}`;
}

function handleSave() {
  emit('save', ruleForm.value);
}
</script>
