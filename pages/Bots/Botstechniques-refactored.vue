<template>
  <div class="botstechniques-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">🤖 GridBot+ Techniques - Smart Chain Builder</h1>
      <p class="page-subtitle">Select a technique and configure bot chains automatically</p>
    </div>

    <!-- Technique Selector -->
    <n-card class="technique-selector-card">
      <div class="selector-header">
        <span class="selector-title">🔧 12 GridBot+ Techniques</span>
        <span class="selector-count">{{ gridBotTechniques.length }} Strategies Available</span>
      </div>
      <div class="techniques-grid">
        <div
          v-for="(technique, index) in gridBotTechniques"
          :key="index"
          class="technique-tile"
          :class="{ active: selectedTechnique?.name === technique.name }"
          @click="selectTechnique(technique)"
        >
          <span class="tile-emoji">{{ technique.emoji }}</span>
          <span class="tile-name">{{ technique.name }}</span>
        </div>
      </div>
    </n-card>

    <!-- Selected Technique Details & Bot Chains -->
    <div v-if="selectedTechnique" class="bot-chains-section">
      <BotChainVisualizerCard
        :technique="selectedTechnique"
        :bot-chain="getBotChainForTechnique(selectedTechnique)"
        @deploy="handleDeployChain"
        @condition-change="updateTrigger1"
        @condition-change-2="updateTrigger2"
      />
    </div>

    <!-- Active Bots Monitor -->
    <n-card class="active-bots-card" v-if="activeBots.length > 0">
      <div class="active-header">
        <span class="active-title">📊 Active Bot Chains</span>
        <span class="active-count">{{ activeBots.length }} Running</span>
      </div>
      <div class="active-bots-list">
        <div
          v-for="bot in activeBots"
          :key="bot._id || bot.chainId"
          class="active-bot-item"
        >
          <span class="bot-name">{{ bot.name }}</span>
          <span class="bot-status" :class="bot.enabled ? 'running' : 'stopped'">{{ bot.enabled ? 'Running' : 'Stopped' }}</span>
          <span class="bot-profit">⚙️ {{ bot.nodes?.length || 0 }} Nodes</span>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import BotChainVisualizerCard from '~/components/Bots/BotChainVisualizerCard.vue'

const message = useMessage()
const userID = useCookie('userID')

definePageMeta({
  middleware: 'auth'
})

// 🔧 12 GridBot+ Techniques with their Bot Chains
const gridBotTechniques = ref([
  {
    emoji: '🖱️',
    name: 'OneClick',
    description: 'One-click bot deployment - Quick single bot',
    chain: [
      { emoji: '📊', type: 'Grid Bot', count: 1 }
    ]
  },
  {
    emoji: '🏃',
    name: 'FrontRun',
    description: 'Front-running strategy - Aggressive entry',
    chain: [
      { emoji: '📊', type: 'Grid Bot', count: 2 },
      { emoji: '🎯', type: 'Smart DCA', count: 1 }
    ]
  },
  {
    emoji: '✈️',
    name: 'Co-Pilot',
    description: 'AI co-pilot assistance - Smart guidance',
    chain: [
      { emoji: '🎯', type: 'Smart DCA', count: 3 }
    ]
  },
  {
    emoji: '📊',
    name: 'DCA + Grid',
    description: 'DCA combined with grid - Best of both',
    chain: [
      { emoji: '💰', type: 'DCA Bot', count: 1 },
      { emoji: '📊', type: 'Grid Bot', count: 2 }
    ]
  },
  {
    emoji: '🎯',
    name: 'Smart DCA',
    description: 'Intelligent DCA strategy - Technical timing',
    chain: [
      { emoji: '🎯', type: 'Smart DCA', count: 2 }
    ]
  },
  {
    emoji: '📊',
    name: 'GridBot',
    description: 'Classic grid trading - Range exploitation',
    chain: [
      { emoji: '📊', type: 'Grid Bot', count: 3 }
    ]
  },
  {
    emoji: '🎯',
    name: 'Scalping',
    description: 'Fast scalping strategy - Quick profits',
    chain: [
      { emoji: '📊', type: 'Grid Bot', count: 5 }
    ]
  },
  {
    emoji: '📈',
    name: 'FibBot',
    description: 'Fibonacci-based trading - Level-based entry',
    chain: [
      { emoji: '📈', type: 'Fibonacci', count: 2 }
    ]
  },
  {
    emoji: '🧠',
    name: 'AI Bot',
    description: 'AI-powered trading - Machine learning',
    chain: [
      { emoji: '🎯', type: 'Smart DCA', count: 3 },
      { emoji: '📈', type: 'Fibonacci', count: 1 }
    ]
  },
  {
    emoji: '⚙️',
    name: 'Grinder',
    description: 'Continuous grinding bot - Steady gains',
    chain: [
      { emoji: '💰', type: 'DCA Bot', count: 3 },
      { emoji: '📊', type: 'Grid Bot', count: 1 }
    ]
  },
  {
    emoji: '📖',
    name: 'OrderBook3pm',
    description: 'Order book analysis at 3pm - Time-based',
    chain: [
      { emoji: '🎯', type: 'Smart DCA', count: 1 },
      { emoji: '📊', type: 'Grid Bot', count: 1 }
    ]
  },
  {
    emoji: '🌟',
    name: 'AI Grid V1',
    description: 'AI Grid Bots V1 (Glassmorphism) - Latest version',
    chain: [
      { emoji: '📊', type: 'Grid Bot', count: 3 },
      { emoji: '🎯', type: 'Smart DCA', count: 2 },
      { emoji: '📈', type: 'Fibonacci', count: 1 }
    ]
  }
])

const selectedTechnique = ref(null)
const activeBots = ref([])
const triggers = ref({})

function selectTechnique(technique) {
  selectedTechnique.value = technique
  message.info(`✨ ${technique.emoji} ${technique.name} selected!`)
}

function getBotChainForTechnique(technique) {
  return technique.chain
}

function updateTrigger1(condition) {
  if (!triggers.value[selectedTechnique.value.name]) {
    triggers.value[selectedTechnique.value.name] = {}
  }
  triggers.value[selectedTechnique.value.name].trigger1 = condition
}

function updateTrigger2(condition) {
  if (!triggers.value[selectedTechnique.value.name]) {
    triggers.value[selectedTechnique.value.name] = {}
  }
  triggers.value[selectedTechnique.value.name].trigger2 = condition
}

async function handleDeployChain(deployData) {
  try {
    // Build nodes array from bot chain
    const nodes = deployData.chain.map((bot, index) => ({
      type: bot.type,
      config: {
        emoji: bot.emoji,
        count: bot.count,
        lowerPrice: deployData.config.lowerPrice,
        upperPrice: deployData.config.upperPrice,
        grids: deployData.config.grids,
        amount: deployData.config.amount
      },
      trigger: index === deployData.chain.length - 1 ? null : (deployData.triggers[index] || 'profit')
    }))

    // API call to create bot chain
    const response = await $fetch('/api/v1/createBotChain', {
      method: 'POST',
      body: {
        userId: userID.value,
        name: deployData.technique.name,
        nodes: nodes
      }
    })

    if (response.success) {
      message.success(`🚀 ${deployData.technique.name} chain deployed successfully!`)
      // Fetch active bots
      await fetchActiveBots()
    } else {
      message.error('Failed to deploy bot chain')
    }
  } catch (error) {
    console.error('Deployment error:', error)
    message.error(`Error: ${error.message}`)
  }
}

async function fetchActiveBots() {
  try {
    const response = await $fetch('/api/v1/fetchBotChains', {
      query: { userId: userID.value }
    })

    if (response.success && response.data) {
      activeBots.value = response.data
    }
  } catch (error) {
    console.error('Error fetching active bots:', error)
  }
}

onMounted(() => {
  fetchActiveBots()
  // Refresh every 5 seconds
  setInterval(fetchActiveBots, 5000)
})
</script>

<style scoped>
.botstechniques-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
  background: #0f1419;
  min-height: 100vh;
  font-size: 12px;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 235, 4, 0.08));
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #10eb04;
  margin: 0 0 8px 0;
  text-shadow: 0 0 10px rgba(16, 235, 4, 0.3);
}

.page-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Technique Selector */
.technique-selector-card {
  background: rgba(20, 25, 30, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 24px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.selector-title {
  font-size: 16px;
  font-weight: 800;
  color: #3b82f6;
}

.selector-count {
  font-size: 11px;
  color: #888;
  font-weight: 600;
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.technique-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(26, 31, 46, 0.6);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.technique-tile:hover {
  background: rgba(26, 31, 46, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
}

.technique-tile.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 235, 4, 0.1));
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.tile-emoji {
  font-size: 32px;
  line-height: 1;
}

.tile-name {
  font-size: 10px;
  font-weight: 700;
  color: #e0e0e0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Bot Chains Section */
.bot-chains-section {
  margin-bottom: 24px;
}

/* Active Bots */
.active-bots-card {
  background: rgba(20, 25, 30, 0.8);
  border: 2px solid rgba(16, 235, 4, 0.3);
  margin-top: 24px;
}

.active-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(16, 235, 4, 0.2);
}

.active-title {
  font-size: 14px;
  font-weight: 800;
  color: #10eb04;
}

.active-count {
  font-size: 11px;
  color: #10eb04;
  font-weight: 700;
  background: rgba(16, 235, 4, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.active-bots-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.active-bot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 6px;
}

.bot-name {
  font-size: 11px;
  font-weight: 700;
  color: #e0e0e0;
}

.bot-status {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.bot-status.running {
  color: #10eb04;
  background: rgba(16, 235, 4, 0.2);
}

.bot-status.stopped {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.2);
}

.bot-profit {
  font-size: 11px;
  font-weight: 700;
  color: #10eb04;
}

/* Responsive */
@media (max-width: 768px) {
  .botstechniques-page {
    padding: 8px;
  }

  .page-title {
    font-size: 20px;
  }

  .techniques-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }

  .technique-tile {
    padding: 12px 8px;
  }

  .tile-emoji {
    font-size: 24px;
  }

  .tile-name {
    font-size: 8px;
  }
}
</style>
