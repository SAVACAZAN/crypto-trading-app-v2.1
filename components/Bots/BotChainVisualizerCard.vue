<template>
  <div class="bot-chain-visualizer">
    <!-- Technique Header -->
    <div class="technique-header">
      <span class="technique-emoji">{{ technique.emoji }}</span>
      <div class="technique-info">
        <h3 class="technique-name">{{ technique.name }}</h3>
        <p class="technique-description">{{ technique.description }}</p>
      </div>
      <n-button
        v-if="!isExpanded"
        type="primary"
        size="small"
        @click="isExpanded = true"
        ghost
      >
        Configure
      </n-button>
      <n-button
        v-else
        type="info"
        size="small"
        @click="isExpanded = false"
        ghost
      >
        Hide
      </n-button>
    </div>

    <!-- Bot Chain Flow -->
    <div class="chain-flow" v-if="isExpanded">
      <div class="chain-container">
        <!-- Bot A -->
        <div class="bot-node">
          <div class="bot-label">Bot A</div>
          <div class="bot-config">
            <div class="bot-type" :style="{ backgroundColor: getBotColor(botChain[0].type) }">
              {{ botChain[0].emoji }} {{ botChain[0].type }}
            </div>
            <div class="bot-count">x{{ botChain[0].count }}</div>
          </div>
        </div>

        <!-- Arrow A -> B -->
        <div class="chain-arrow" v-if="botChain.length > 1">
          <div class="arrow-line">→</div>
          <div class="trigger-condition">
            <span class="condition-label">When</span>
            <n-select
              v-model:value="triggerCondition"
              :options="triggerOptions"
              size="small"
              style="width: 100px"
              @update:value="$emit('condition-change', triggerCondition)"
            />
          </div>
        </div>

        <!-- Bot B -->
        <div class="bot-node" v-if="botChain.length > 1">
          <div class="bot-label">Bot B</div>
          <div class="bot-config">
            <div class="bot-type" :style="{ backgroundColor: getBotColor(botChain[1].type) }">
              {{ botChain[1].emoji }} {{ botChain[1].type }}
            </div>
            <div class="bot-count">x{{ botChain[1].count }}</div>
          </div>
        </div>

        <!-- Arrow B -> C -->
        <div class="chain-arrow" v-if="botChain.length > 2">
          <div class="arrow-line">→</div>
          <div class="trigger-condition">
            <span class="condition-label">When</span>
            <n-select
              v-model:value="triggerCondition2"
              :options="triggerOptions"
              size="small"
              style="width: 100px"
              @update:value="$emit('condition-change-2', triggerCondition2)"
            />
          </div>
        </div>

        <!-- Bot C -->
        <div class="bot-node" v-if="botChain.length > 2">
          <div class="bot-label">Bot C</div>
          <div class="bot-config">
            <div class="bot-type" :style="{ backgroundColor: getBotColor(botChain[2].type) }">
              {{ botChain[2].emoji }} {{ botChain[2].type }}
            </div>
            <div class="bot-count">x{{ botChain[2].count }}</div>
          </div>
        </div>
      </div>

      <!-- Configuration Panel -->
      <div class="config-panel">
        <n-divider />
        <div class="config-title">⚙️ Configuration</div>

        <!-- Settings for each bot -->
        <div class="bot-settings">
          <div class="setting-group">
            <label>Lower Price</label>
            <n-input-number
              v-model:value="botConfig.lowerPrice"
              placeholder="e.g., 0.050"
              size="small"
              style="width: 100%"
            />
          </div>
          <div class="setting-group">
            <label>Upper Price</label>
            <n-input-number
              v-model:value="botConfig.upperPrice"
              placeholder="e.g., 0.100"
              size="small"
              style="width: 100%"
            />
          </div>
          <div class="setting-group">
            <label>Number of Grids</label>
            <n-input-number
              v-model:value="botConfig.grids"
              :min="5"
              :max="50"
              size="small"
              style="width: 100%"
            />
          </div>
          <div class="setting-group">
            <label>Amount per Grid</label>
            <n-input-number
              v-model:value="botConfig.amount"
              placeholder="100"
              size="small"
              style="width: 100%"
            />
          </div>
        </div>

        <!-- Deploy Button -->
        <n-button
          type="success"
          size="medium"
          style="width: 100%; margin-top: 12px"
          @click="deployBotChain"
          :loading="isDeploying"
        >
          🚀 Deploy {{ technique.name }} Chain
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

const props = defineProps({
  technique: {
    type: Object,
    required: true
  },
  botChain: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['deploy', 'condition-change', 'condition-change-2'])

const isExpanded = ref(false)
const isDeploying = ref(false)
const triggerCondition = ref('profit')
const triggerCondition2 = ref('profit')

const triggerOptions = [
  { label: 'Profit % > 5', value: 'profit' },
  { label: 'Loss % < -3', value: 'loss' },
  { label: 'Total Trades > 10', value: 'trades' },
  { label: 'Time > 1 hour', value: 'time' }
]

const botConfig = ref({
  lowerPrice: null,
  upperPrice: null,
  grids: 10,
  amount: 100
})

function getBotColor(type) {
  const colors = {
    'Grid Bot': '#10eb04',
    'Smart DCA': '#3b82f6',
    'DCA Bot': '#fbbf24',
    'Fibonacci': '#f87171'
  }
  return colors[type] || '#666'
}

async function deployBotChain() {
  isDeploying.value = true
  try {
    emit('deploy', {
      technique: props.technique,
      chain: props.botChain,
      config: botConfig.value,
      triggers: [triggerCondition.value, triggerCondition2.value]
    })
    message.success(`✅ ${props.technique.name} chain deployed!`)
  } catch (error) {
    message.error('Failed to deploy chain')
  } finally {
    isDeploying.value = false
  }
}
</script>

<style scoped>
.bot-chain-visualizer {
  background: linear-gradient(135deg, rgba(20, 25, 30, 0.8) 0%, rgba(30, 35, 40, 0.6) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.bot-chain-visualizer:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

/* Technique Header */
.technique-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.technique-header:hover {
  border-bottom-color: rgba(59, 130, 246, 0.4);
}

.technique-emoji {
  font-size: 40px;
  line-height: 1;
}

.technique-info {
  flex: 1;
}

.technique-name {
  font-size: 16px;
  font-weight: 700;
  color: #10eb04;
  margin: 0 0 4px 0;
}

.technique-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Chain Flow */
.chain-flow {
  margin-top: 16px;
}

.chain-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding: 8px;
}

.bot-node {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(26, 31, 46, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  min-width: 140px;
  text-align: center;
}

.bot-label {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
}

.bot-config {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bot-type {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 8px;
  border-radius: 4px;
  color: #000;
  background: #10eb04;
}

.bot-count {
  font-size: 10px;
  color: #888;
  font-weight: 600;
}

/* Arrow & Trigger */
.chain-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.arrow-line {
  font-size: 24px;
  color: #10eb04;
  font-weight: 700;
}

.trigger-condition {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: rgba(16, 235, 4, 0.1);
  border: 1px solid rgba(16, 235, 4, 0.3);
  border-radius: 4px;
  font-size: 8px;
}

.condition-label {
  color: #10eb04;
  font-weight: 700;
}

/* Configuration */
.config-panel {
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  padding: 12px;
}

.config-title {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.bot-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-group label {
  font-size: 10px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
}

/* Responsive */
@media (max-width: 768px) {
  .technique-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chain-container {
    flex-direction: column;
    gap: 8px;
  }

  .chain-arrow {
    min-width: auto;
    width: 100%;
  }

  .arrow-line {
    transform: rotate(90deg);
  }
}
</style>
