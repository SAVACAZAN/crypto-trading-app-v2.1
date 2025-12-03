<template>
  <div class="botstechniques-main">
    <!-- Header -->
    <div class="header-section">
      <h1>🤖 Bot Chain Builder - Link Your Trading Bots</h1>
      <p>Create intelligent bot chains where one bot triggers another</p>
    </div>

    <!-- Step 1: Select Technique -->
    <n-card class="step-card" title="Step 1: Select Technique">
      <div class="techniques-grid">
        <div
          v-for="tech in techniques"
          :key="tech.name"
          class="technique-item"
          :class="{ selected: selectedTechnique?.name === tech.name }"
          @click="selectTechnique(tech)"
        >
          <div class="tech-emoji">{{ tech.emoji }}</div>
          <div class="tech-name">{{ tech.name }}</div>
          <div class="tech-count">{{ tech.botCount }} bots</div>
        </div>
      </div>
    </n-card>

    <!-- Step 2: Configure Chain (if technique selected) -->
    <n-card v-if="selectedTechnique" class="step-card" title="Step 2: Configure Bot Chain">
      <div class="chain-config">
        <!-- Show each bot in the chain -->
        <div v-for="(bot, idx) in selectedTechnique.bots" :key="idx" class="bot-config-section">
          <div class="bot-header">
            <span class="bot-label">{{ getBotLabel(idx) }}</span>
            <span class="bot-type">{{ bot.type }}</span>
          </div>

          <!-- Bot Parameters -->
          <n-grid :cols="2" x-gap="12" y-gap="12">
            <n-gi>
              <div class="input-group">
                <label>Lower Price</label>
                <n-input-number
                  v-model:value="chainConfig[idx].lowerPrice"
                  placeholder="e.g., 0.050"
                  :precision="8"
                />
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label>Upper Price</label>
                <n-input-number
                  v-model:value="chainConfig[idx].upperPrice"
                  placeholder="e.g., 0.100"
                  :precision="8"
                />
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label>Number of Grids</label>
                <n-input-number
                  v-model:value="chainConfig[idx].grids"
                  :min="1"
                  :max="100"
                />
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label>Amount per Grid</label>
                <n-input-number
                  v-model:value="chainConfig[idx].amount"
                  placeholder="100"
                  :precision="2"
                />
              </div>
            </n-gi>
          </n-grid>

          <!-- Trigger Condition (if not last bot) -->
          <div v-if="idx < selectedTechnique.bots.length - 1" class="trigger-config">
            <div class="trigger-arrow">↓ THEN ↓</div>
            <div class="trigger-select">
              <label>When {{ selectedTechnique.bots[idx].type }} reaches:</label>
              <n-select
                v-model:value="chainConfig[idx].trigger"
                :options="triggerOptions"
                placeholder="Select trigger"
              />
            </div>
          </div>
        </div>
      </div>
    </n-card>

    <!-- Step 3: Deploy Chain (if configured) -->
    <n-card v-if="selectedTechnique && isChainConfigured" class="step-card" title="Step 3: Deploy Chain">
      <div class="deploy-section">
        <p>Ready to deploy <strong>{{ selectedTechnique.emoji }} {{ selectedTechnique.name }}</strong> chain?</p>

        <n-button
          type="success"
          size="large"
          @click="deployChain"
          :loading="isDeploying"
          class="deploy-btn"
        >
          🚀 Deploy Bot Chain
        </n-button>
      </div>
    </n-card>

    <!-- Active Chains Monitor -->
    <n-card class="step-card" title="📊 Active Bot Chains">
      <div v-if="activeChains.length === 0" class="empty-state">
        <p>No active bot chains yet. Deploy your first chain above!</p>
      </div>
      <div v-else class="chains-list">
        <div v-for="chain in activeChains" :key="chain.id" class="chain-item">
          <div class="chain-header">
            <h4>{{ chain.name }}</h4>
            <span class="chain-status" :class="chain.enabled ? 'active' : 'inactive'">
              {{ chain.enabled ? '🟢 Running' : '⚫ Stopped' }}
            </span>
          </div>
          <div class="chain-details">
            <span>{{ chain.nodeCount }} bots</span>
            <span>Created: {{ formatDate(chain.createdAt) }}</span>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'

definePageMeta({
  middleware: 'auth'
})

const message = useMessage()
const userID = useCookie('userID')

// 12 GridBot+ Techniques with their bot configurations
const techniques = ref([
  {
    emoji: '🖱️',
    name: 'OneClick',
    description: 'Quick single bot',
    botCount: 1,
    bots: [
      { type: 'Grid Bot', emoji: '📊' }
    ]
  },
  {
    emoji: '🏃',
    name: 'FrontRun',
    description: 'Aggressive entry',
    botCount: 3,
    bots: [
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Smart DCA', emoji: '🎯' }
    ]
  },
  {
    emoji: '✈️',
    name: 'Co-Pilot',
    description: 'AI guidance',
    botCount: 3,
    bots: [
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Smart DCA', emoji: '🎯' }
    ]
  },
  {
    emoji: '📊',
    name: 'DCA + Grid',
    description: 'Best of both',
    botCount: 3,
    bots: [
      { type: 'DCA Bot', emoji: '💰' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' }
    ]
  },
  {
    emoji: '🎯',
    name: 'Smart DCA',
    description: 'Technical timing',
    botCount: 2,
    bots: [
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Smart DCA', emoji: '🎯' }
    ]
  },
  {
    emoji: '📊',
    name: 'GridBot',
    description: 'Range trading',
    botCount: 3,
    bots: [
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' }
    ]
  },
  {
    emoji: '🎯',
    name: 'Scalping',
    description: 'High frequency',
    botCount: 5,
    bots: [
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' }
    ]
  },
  {
    emoji: '📈',
    name: 'FibBot',
    description: 'Level-based',
    botCount: 2,
    bots: [
      { type: 'Fibonacci', emoji: '📈' },
      { type: 'Fibonacci', emoji: '📈' }
    ]
  },
  {
    emoji: '🧠',
    name: 'AI Bot',
    description: 'Machine learning',
    botCount: 4,
    bots: [
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Fibonacci', emoji: '📈' }
    ]
  },
  {
    emoji: '⚙️',
    name: 'Grinder',
    description: 'Steady gains',
    botCount: 4,
    bots: [
      { type: 'DCA Bot', emoji: '💰' },
      { type: 'DCA Bot', emoji: '💰' },
      { type: 'DCA Bot', emoji: '💰' },
      { type: 'Grid Bot', emoji: '📊' }
    ]
  },
  {
    emoji: '📖',
    name: 'OrderBook3pm',
    description: 'Time-based',
    botCount: 2,
    bots: [
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Grid Bot', emoji: '📊' }
    ]
  },
  {
    emoji: '🌟',
    name: 'AI Grid V1',
    description: 'Latest version',
    botCount: 6,
    bots: [
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Grid Bot', emoji: '📊' },
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Smart DCA', emoji: '🎯' },
      { type: 'Fibonacci', emoji: '📈' }
    ]
  }
])

const selectedTechnique = ref(null)
const chainConfig = ref({})
const activeChains = ref([])
const isDeploying = ref(false)

const triggerOptions = [
  { label: 'Profit > 5%', value: 'profit_5' },
  { label: 'Profit > 10%', value: 'profit_10' },
  { label: 'Loss < -3%', value: 'loss_3' },
  { label: 'Trades > 10', value: 'trades_10' },
  { label: 'After 1 hour', value: 'time_1h' },
  { label: 'After 6 hours', value: 'time_6h' }
]

function selectTechnique(tech) {
  selectedTechnique.value = tech
  // Initialize config for each bot
  chainConfig.value = {}
  tech.bots.forEach((bot, idx) => {
    chainConfig.value[idx] = {
      lowerPrice: null,
      upperPrice: null,
      grids: 10,
      amount: 100,
      trigger: 'profit_5'
    }
  })
  message.info(`✨ Selected ${tech.emoji} ${tech.name}`)
}

function getBotLabel(idx) {
  const labels = ['Bot A', 'Bot B', 'Bot C', 'Bot D', 'Bot E', 'Bot F']
  return labels[idx] || `Bot ${idx + 1}`
}

const isChainConfigured = computed(() => {
  if (!selectedTechnique.value) return false
  return selectedTechnique.value.bots.every((_, idx) => {
    const cfg = chainConfig.value[idx]
    return cfg && cfg.lowerPrice && cfg.upperPrice && cfg.amount
  })
})

async function deployChain() {
  if (!isChainConfigured.value) {
    message.error('Please configure all bot parameters')
    return
  }

  isDeploying.value = true
  try {
    // Build nodes array
    const nodes = selectedTechnique.value.bots.map((bot, idx) => ({
      type: bot.type,
      config: chainConfig.value[idx],
      trigger: idx < selectedTechnique.value.bots.length - 1 ? chainConfig.value[idx].trigger : null
    }))

    const response = await $fetch('/api/v1/createBotChain', {
      method: 'POST',
      body: {
        userId: userID.value,
        name: selectedTechnique.value.name,
        nodes: nodes
      }
    })

    if (response.success) {
      message.success(`🚀 ${selectedTechnique.value.name} chain deployed!`)
      await fetchActiveChains()
      selectedTechnique.value = null
    } else {
      message.error('Failed to deploy chain')
    }
  } catch (error) {
    console.error('Deploy error:', error)
    message.error(`Error: ${error.message}`)
  } finally {
    isDeploying.value = false
  }
}

async function fetchActiveChains() {
  try {
    const response = await $fetch('/api/v1/fetchBotChains', {
      query: { userId: userID.value }
    })

    if (response.success && response.data) {
      activeChains.value = response.data.map(chain => ({
        id: chain._id || chain.chainId,
        name: chain.name,
        enabled: chain.enabled,
        nodeCount: chain.nodes?.length || 0,
        createdAt: chain.createdAt
      }))
    }
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  fetchActiveChains()
  setInterval(fetchActiveChains, 10000) // Refresh every 10 seconds
})
</script>

<style scoped>
.botstechniques-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #0f1419;
  min-height: 100vh;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 235, 4, 0.08));
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.header-section h1 {
  font-size: 28px;
  font-weight: 800;
  color: #10eb04;
  margin: 0 0 10px 0;
  text-shadow: 0 0 10px rgba(16, 235, 4, 0.3);
}

.header-section p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.step-card {
  margin-bottom: 20px;
  background: rgba(20, 25, 30, 0.8) !important;
  border: 2px solid rgba(59, 130, 246, 0.3) !important;
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin: 15px 0;
}

.technique-item {
  padding: 16px 12px;
  background: rgba(26, 31, 46, 0.6);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.technique-item:hover {
  background: rgba(26, 31, 46, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
}

.technique-item.selected {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 235, 4, 0.1));
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.tech-emoji {
  font-size: 32px;
  line-height: 1;
}

.tech-name {
  font-size: 11px;
  font-weight: 700;
  color: #e0e0e0;
  text-transform: uppercase;
}

.tech-count {
  font-size: 9px;
  color: #888;
}

.chain-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bot-config-section {
  padding: 16px;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
}

.bot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.bot-label {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
}

.bot-type {
  font-size: 11px;
  color: #10eb04;
  font-weight: 600;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
}

.trigger-config {
  margin-top: 12px;
  padding: 12px;
  background: rgba(16, 235, 4, 0.05);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 4px;
}

.trigger-arrow {
  text-align: center;
  color: #10eb04;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 12px;
}

.trigger-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trigger-select label {
  font-size: 11px;
  font-weight: 700;
  color: #10eb04;
}

.deploy-section {
  text-align: center;
  padding: 20px;
}

.deploy-section p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.deploy-btn {
  min-width: 200px;
  height: 44px;
  font-size: 14px;
  font-weight: 700;
}

.chains-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chain-item {
  padding: 12px;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 6px;
}

.chain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chain-header h4 {
  margin: 0;
  color: #10eb04;
  font-size: 13px;
}

.chain-status {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(16, 235, 4, 0.1);
}

.chain-status.active {
  color: #10eb04;
}

.chain-status.inactive {
  color: #888;
}

.chain-details {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #888;
}

@media (max-width: 768px) {
  .botstechniques-main {
    padding: 12px;
  }

  .techniques-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }

  .header-section h1 {
    font-size: 20px;
  }
}
</style>
