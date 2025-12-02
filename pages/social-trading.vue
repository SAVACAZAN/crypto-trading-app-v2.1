<template>
  <div class="social-trading-page">
    <!-- Header -->
    <div class="page-header">
      <h1>🌐 Social Trading - Community Bots</h1>
      <p>Browse and copy successful trading bots from the community</p>
    </div>

    <!-- Bots Table -->
    <div class="bots-table-container">
      <table class="bots-table">
        <thead>
          <tr>
            <th>Bot Name</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Price Range</th>
            <th>Grids</th>
            <th>Price@Start</th>
            <th>Profit ($)</th>
            <th>Profit %</th>
            <th>Profit/Grid</th>
            <th>Owner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bot in paginatedBots"
            :key="bot._id"
            :class="{ 'my-bot-row': isMyBot(bot) }"
          >
            <td>
              <div class="bot-name-cell">
                {{ bot.name }}
                <n-tag v-if="isMyBot(bot)" type="info" size="small">
                  👤 My Bot
                </n-tag>
              </div>
            </td>
            <td>{{ bot.symbol }}</td>
            <td>
              <n-tag :type="bot.ordersSide === 'buy' ? 'success' : 'warning'" size="small">
                {{ bot.ordersSide }}
              </n-tag>
            </td>
            <td>${{ bot.lowerPrice }} - ${{ bot.upperPrice }}</td>
            <td>{{ bot.nrOfGrids }}</td>
            <td>{{ bot.priceAtCreation ? '$' + bot.priceAtCreation.toFixed(4) : '-' }}</td>
            <td v-if="getProfitValue(bot) !== null" :class="getProfitValue(bot) >= 0 ? 'positive' : 'negative'">
              ${{ getProfitValue(bot).toFixed(2) }}
            </td>
            <td v-else>-</td>
            <td v-if="calculateProfitPercent(bot) !== null" :class="calculateProfitPercent(bot) >= 0 ? 'positive' : 'negative'">
              {{ calculateProfitPercent(bot).toFixed(2) }}%
            </td>
            <td v-else>-</td>
            <td v-if="calculateProfitPerGrid(bot) !== null" :class="calculateProfitPerGrid(bot) >= 0 ? 'positive' : 'negative'">
              ${{ calculateProfitPerGrid(bot).toFixed(4) }}
            </td>
            <td v-else>-</td>
            <td>{{ bot.username || 'Anonymous' }}</td>
            <td>
              <n-button
                type="primary"
                size="small"
                @click="copyBot(bot)"
              >
                📋 Copy
              </n-button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="communityBots.length === 0" class="empty-state">
        <p>No community bots available</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="communityBots.length > pageSize" class="pagination-container">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[25, 50, 100]"
        @update:page-size="handlePageSizeChange"
      >
        <template #prefix="{ itemCount }">
          Total: {{ itemCount }} bots
        </template>
      </n-pagination>
    </div>

    <!-- Copy Configuration Modal -->
    <n-modal
      v-model:show="showCopyModal"
      preset="card"
      title="📋 Copy Bot Configuration"
      :style="{ width: '500px' }"
    >
      <div v-if="botToCopy" class="copy-modal">
        <div class="bot-config">
          <h4>Bot Configuration</h4>
          <n-descriptions bordered :column="2" size="medium">
            <n-descriptions-item label="Symbol">{{ botToCopy.symbol }}</n-descriptions-item>
            <n-descriptions-item label="Side">
              <n-tag :type="botToCopy.ordersSide === 'buy' ? 'success' : 'warning'" size="small">
                {{ botToCopy.ordersSide }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="Lower Price">${{ botToCopy.lowerPrice }}</n-descriptions-item>
            <n-descriptions-item label="Upper Price">${{ botToCopy.upperPrice }}</n-descriptions-item>
            <n-descriptions-item label="Grids">{{ botToCopy.nrOfGrids }}</n-descriptions-item>
            <n-descriptions-item label="Amount">${{ botToCopy.amount }}</n-descriptions-item>
          </n-descriptions>

          <div class="summary">
            <n-alert type="info" :bordered="false">
              <strong>Total Investment:</strong> ${{ (parseFloat(botToCopy.amount) * parseInt(botToCopy.nrOfGrids)).toFixed(2) }}
            </n-alert>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="showCopyModal = false">Cancel</n-button>
          <n-button type="primary" @click="createBot">
            ✅ Create Same Bot
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessage, NButton, NTag, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NDescriptions, NDescriptionsItem, NDivider, NAlert, NPagination } from 'naive-ui'
import { useAppStore } from '~/stores/app.store'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const app = useAppStore()
const message = useMessage()
let userID = useCookie('userID')

const communityBots = ref([])
const showCopyModal = ref(false)
const botToCopy = ref(null)

// Pagination
const currentPage = ref(1)
const pageSize = ref(50)

// Computed values for pagination
const totalPages = computed(() => Math.ceil(communityBots.value.length / pageSize.value))

const paginatedBots = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return communityBots.value.slice(start, end)
})

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1 // Reset to first page
}

// Load all community bots
const loadCommunityBots = async () => {
  try {
    // Fetch all grid bots from all users
    const response = await $fetch('/api/v1/fetchAllGridBots', {
      method: 'POST',
      body: {}
    })

    if (response.success && response.data) {
      // Fetch current prices for each unique symbol
      const symbols = [...new Set(response.data.map(bot => bot.symbol))]
      const pricesMap = {}

      for (const symbol of symbols) {
        try {
          const tickerRes = await $fetch('/api/v1/fetchTicker', {
            query: {
              userID: userID.value,
              exchange: 'coinbaseadvanced',
              symbol: symbol
            }
          })
          pricesMap[symbol] = tickerRes.data?.last || 0
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error)
          pricesMap[symbol] = 0
        }
      }

      // Attach current price to each bot
      response.data.forEach(bot => {
        bot.currentPrice = pricesMap[bot.symbol] || 0
      })

      communityBots.value = response.data
      console.log('Community bots loaded:', response.data.length)
    }
  } catch (error) {
    console.error('Error loading bots:', error)
    message.error('Failed to load community bots')
  }
}

const copyBot = (bot) => {
  botToCopy.value = bot
  showCopyModal.value = true
}

// Check if bot belongs to current user
const isMyBot = (bot) => {
  return bot.userID === userID.value
}

// Get profit value from bot - show for ALL bots (public transparency)
// Uses the SAME calculation as grid-bots-list.vue for consistency
const getProfitValue = (bot) => {
  if (!bot.BalanceBot) return null

  const balanceBot = bot.BalanceBot
  const priceAtCreation = bot.priceAtCreation || 0
  const currentPrice = bot.currentPrice || 0

  // Check if we have the required data
  if (priceAtCreation === 0 || currentPrice === 0) return null

  // Check if bot has balance data (is active)
  const hasBalanceData =
    (balanceBot.BalanceBase && parseFloat(balanceBot.BalanceBase) !== 0) ||
    (balanceBot.BalanceQuote && parseFloat(balanceBot.BalanceQuote) !== 0)

  if (!hasBalanceData) return null

  // Base (LCX) currently locked in bot orders
  const baseInBot = parseFloat(balanceBot.BalanceBase || 0)
  // Quote (USDC) currently locked in bot orders
  const quoteInBot = parseFloat(balanceBot.BalanceQuote || 0)

  // Initial value when bot was created (in USD)
  // For SELL bots: all value is in base tokens at creation price
  // For BUY bots: all value is in quote (USDC)
  let initialBotValueUSD = 0
  if (bot.ordersSide === 'sellOnly') {
    // SELL bot: started with base tokens
    initialBotValueUSD = baseInBot * priceAtCreation
  } else if (bot.ordersSide === 'buyOnly') {
    // BUY bot: started with quote (USDC)
    initialBotValueUSD = quoteInBot
  } else {
    // BOTH: combination
    initialBotValueUSD = (baseInBot * priceAtCreation) + quoteInBot
  }

  // Current value of tokens in bot (in USD)
  const currentBotValueUSD = (baseInBot * currentPrice) + quoteInBot

  // Calculate profit (difference between current and initial value)
  const profitUSD = currentBotValueUSD - initialBotValueUSD

  return profitUSD
}

// Calculate profit percentage - show for ALL bots
const calculateProfitPercent = (bot) => {
  const profit = getProfitValue(bot)
  if (profit === null) return null

  const balanceBot = bot.BalanceBot
  const priceAtCreation = bot.priceAtCreation || 0

  if (!balanceBot || priceAtCreation === 0) return null

  const baseInBot = parseFloat(balanceBot.BalanceBase || 0)
  const quoteInBot = parseFloat(balanceBot.BalanceQuote || 0)

  // Calculate initial value the same way as in getProfitValue
  let initialBotValueUSD = 0
  if (bot.ordersSide === 'sellOnly') {
    initialBotValueUSD = baseInBot * priceAtCreation
  } else if (bot.ordersSide === 'buyOnly') {
    initialBotValueUSD = quoteInBot
  } else {
    initialBotValueUSD = (baseInBot * priceAtCreation) + quoteInBot
  }

  if (initialBotValueUSD === 0) return 0

  return (profit / initialBotValueUSD) * 100
}

// Calculate profit per grid - show for ALL bots
const calculateProfitPerGrid = (bot) => {
  const profit = getProfitValue(bot)
  if (profit === null) return null

  const grids = parseInt(bot.nrOfGrids || 1)

  if (grids === 0) return 0
  return profit / grids
}

const createBot = async () => {
  try {
    message.loading('Creating bot...', { duration: 0 })

    const botName = `COPY_${botToCopy.value.name}_${Date.now()}`

    const result = await $fetch('/api/v1/createGridBot', {
      method: 'POST',
      body: {
        userID: userID.value,
        name: botName,
        exchange: botToCopy.value.exchange || 'coinbaseadvanced',
        symbol: botToCopy.value.symbol,
        lowerPrice: botToCopy.value.lowerPrice.toString(),
        upperPrice: botToCopy.value.upperPrice.toString(),
        amount: botToCopy.value.amount.toString(),
        amountType: botToCopy.value.amountType || 'quote',
        nrOfGrids: botToCopy.value.nrOfGrids.toString(),
        ordersSide: botToCopy.value.ordersSide,
        apiKeyNames: app.selectedApiKeys || [],
        copiedFrom: botToCopy.value._id
      }
    })

    message.destroyAll()

    if (result.success) {
      message.success('✅ Bot created successfully!')
      showCopyModal.value = false
      // Reload bots to show the new one
      await loadCommunityBots()
    } else {
      message.error(`Failed: ${result.message}`)
    }
  } catch (error) {
    message.destroyAll()
    message.error('Error: ' + error.message)
  }
}

onMounted(async () => {
  await app.loadUserExchangeData(userID.value)
  await loadCommunityBots()
})
</script>

<style scoped>
.social-trading-page {
  padding: 24px;
  min-height: 100vh;
  background: #0f1419;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* Table Styles */
.bots-table-container {
  width: 100%;
  overflow-x: auto;
}

.bots-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(20, 25, 30, 0.95);
  border-radius: 12px;
  overflow: hidden;
}

.bots-table thead {
  background: rgba(102, 126, 234, 0.1);
}

.bots-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  white-space: nowrap;
}

.bots-table tbody tr {
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  transition: background 0.2s;
}

.bots-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.bots-table tbody tr.my-bot-row {
  background: rgba(24, 160, 88, 0.05);
  border-left: 3px solid rgba(24, 160, 88, 0.5);
}

.bots-table tbody tr.my-bot-row:hover {
  background: rgba(24, 160, 88, 0.1);
}

.bots-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #fff;
}

.bot-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bots-table td.positive {
  color: #18a058;
  font-weight: 600;
}

.bots-table td.negative {
  color: #d03050;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #666;
}

/* Pagination */
.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* Modal */
.copy-modal {
  padding: 8px 0;
}

.bot-config {
  margin-bottom: 16px;
}

.bot-config h4 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
}

.summary {
  margin-top: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .social-trading-page {
    padding: 12px;
  }

  .bots-grid {
    grid-template-columns: 1fr;
  }
}
</style>
