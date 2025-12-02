<template>
  <div class="gridbotsplus-page">
    <!-- FORM DEASUPRA -->
    <ClientOnly>
      <div class="form-top">
        <GridBotsFormPlus ref="gridFormRef"/>
      </div>

      <!-- ACTIVE BOTS JOS -->
      <div class="bots-below">
        <GridBotsList ref="gridListRef"/>
      </div>

      <!-- Voice Commands -->
      <VoiceCommands @command="handleVoiceCommand" @transcript="handleTranscript"/>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

definePageMeta({
  middleware: 'auth'
})

import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);

const message = useMessage()
const gridFormRef = ref(null)
const gridListRef = ref(null)

// Handle voice commands
const handleVoiceCommand = async (command) => {
  console.log('Voice command received:', command)

  try {
    switch (command.action) {
      case 'start-strategy':
        // Direct bot creation with predefined strategy
        message.info(`🚀 Launching ${command.strategy} strategy...`)

        try {
          const createResult = await $fetch('/api/v1/createGridBot', {
            method: 'POST',
            body: {
              userID: userID.value,
              name: `${command.strategy}_${Date.now()}`,
              exchange: 'coinbaseadvanced',
              symbol: command.symbol,
              lowerPrice: command.lowerPrice.toString(),
              upperPrice: command.upperPrice.toString(),
              amount: command.amount || '100',
              amountType: command.amountType || 'quote',
              nrOfGrids: command.grids.toString(),
              ordersSide: command.ordersSide || 'sell',
              apiKeyNames: app.selectedApiKeys || []
            }
          })

          if (createResult.success) {
            message.success(`✅ ${command.strategy} bot created and started!`, { duration: 5000 })
            // Refresh bots list
            if (gridListRef.value && gridListRef.value.refresh) {
              await gridListRef.value.refresh()
            }
          } else {
            message.error(`Failed to create ${command.strategy} bot: ${createResult.message}`)
          }
        } catch (error) {
          message.error(`Error creating ${command.strategy} bot: ${error.message}`)
        }
        break

      case 'start-bot':
        if (command.symbol) {
          message.info(`Starting grid bot on ${command.symbol} for Coinbase Advanced`)
          // Trigger form to open with this symbol pre-selected
          if (gridFormRef.value && gridFormRef.value.setSymbol) {
            gridFormRef.value.setSymbol(command.symbol)
          }
        }
        break

      case 'stop-all-bots':
        message.warning('Stopping all active bots...')
        // Trigger stop all bots action
        if (gridListRef.value && gridListRef.value.stopAllBots) {
          await gridListRef.value.stopAllBots()
        }
        break

      case 'show-bots':
        message.info('Displaying all your grid bots')
        // Scroll to bots list or refresh
        if (gridListRef.value && gridListRef.value.refresh) {
          await gridListRef.value.refresh()
        }
        break

      case 'create-bot':
        message.info('Opening bot creation form')
        // Focus on form
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break

      case 'show-profit-today':
        message.info('Calculating today\'s profit...')
        // Trigger profit calculation for today
        if (gridListRef.value && gridListRef.value.showProfitToday) {
          gridListRef.value.showProfitToday()
        } else {
          // Calculate manually
          const bots = await $fetch('/api/v1/fetchGridBots', {
            method: 'POST',
            body: { userID: userID.value }
          })

          if (bots.success && bots.data) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            let totalProfitToday = 0
            bots.data.forEach(bot => {
              const filledToday = bot.filledOrders?.filter(order => {
                const orderDate = new Date(order.timestamp || order.datetime)
                return orderDate >= today
              }) || []

              const profitToday = filledToday.reduce((sum, order) => {
                const profit = parseFloat(order.profit || 0)
                return sum + profit
              }, 0)

              totalProfitToday += profitToday
            })

            message.success(`Today's profit: $${totalProfitToday.toFixed(2)}`, { duration: 5000 })
          }
        }
        break

      case 'show-total-profit':
        message.info('Calculating total profit...')
        // Trigger total profit calculation
        const bots = await $fetch('/api/v1/fetchGridBots', {
          method: 'POST',
          body: { userID: userID.value }
        })

        if (bots.success && bots.data) {
          let totalProfit = 0
          bots.data.forEach(bot => {
            const profit = parseFloat(bot.BalanceBot?.BalanceBotProfit || 0)
            totalProfit += profit
          })

          message.success(`Total profit across all bots: $${totalProfit.toFixed(2)}`, { duration: 5000 })
        }
        break

      case 'show-balance':
        message.info('Fetching your balance on Coinbase Advanced...')
        // Fetch and show balance
        const balance = await $fetch('/api/v1/fetchCombinedBalance', {
          method: 'POST',
          body: {
            userID: userID.value,
            exchange: 'coinbaseadvanced'
          }
        })

        if (balance.success && balance.data) {
          const totalUSD = Object.values(balance.data).reduce((sum, val) => sum + parseFloat(val.totalUSD || 0), 0)
          message.success(`Total balance: $${totalUSD.toFixed(2)}`, { duration: 5000 })
        }
        break

      case 'show-portfolio':
        message.info('Calculating portfolio value...')
        // Calculate portfolio
        const portfolioBalance = await $fetch('/api/v1/fetchCombinedBalance', {
          method: 'POST',
          body: {
            userID: userID.value,
            exchange: 'coinbaseadvanced'
          }
        })

        if (portfolioBalance.success && portfolioBalance.data) {
          const totalValue = Object.values(portfolioBalance.data).reduce((sum, val) => sum + parseFloat(val.totalUSD || 0), 0)

          // Also get bots profit
          const botsProfitRes = await $fetch('/api/v1/fetchGridBots', {
            method: 'POST',
            body: { userID: userID.value }
          })

          let botsProfit = 0
          if (botsProfitRes.success && botsProfitRes.data) {
            botsProfit = botsProfitRes.data.reduce((sum, bot) => {
              return sum + parseFloat(bot.BalanceBot?.BalanceBotProfit || 0)
            }, 0)
          }

          message.success(`Portfolio value: $${totalValue.toFixed(2)} | Bots profit: $${botsProfit.toFixed(2)}`, { duration: 7000 })
        }
        break

      case 'show-orders':
        message.info('Opening orders view...')
        // Trigger orders modal or view
        if (gridListRef.value && gridListRef.value.showOrders) {
          gridListRef.value.showOrders()
        }
        break

      default:
        message.warning('Command not recognized')
    }
  } catch (error) {
    console.error('Error handling voice command:', error)
    message.error('Error executing command: ' + error.message)
  }
}

// Handle transcript updates
const handleTranscript = (transcript) => {
  console.log('Transcript:', transcript)
}
</script>

<style scoped>
.gridbotsplus-page {
  padding: 8px;
  width: 100%;
  min-height: 100vh;
  background: #0f1419;
  font-size: 12px;
}

/* Content Wrapper - Vertical Stack */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: calc(100vh - 16px);
}

/* Main Area (Active Bots - Top) */
.main-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Form Below (Bottom, Full Width) */
.form-below {
  flex-shrink: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

/* Scrollbar Styling */
.main-area::-webkit-scrollbar,
.form-below::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.main-area::-webkit-scrollbar-thumb,
.form-below::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

.main-area::-webkit-scrollbar-track,
.form-below::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Responsive Design */
@media (max-width: 768px) {
  .gridbotsplus-page {
    padding: 4px;
  }

  .content-wrapper {
    gap: 6px;
  }
}
</style>
