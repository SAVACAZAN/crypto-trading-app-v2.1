<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #00d4ff;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">📈</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #00d4ff; font-weight: 700;">BOT PERFORMANCE ANALYTICS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Real-time Performance Tracking & Analysis</p>
          </div>
        </div>
        <n-select v-model:value="selectedTimeframe" :options="timeframeOptions" size="small" style="width: 150px;" />
      </div>
    </div>

    <!-- Overall Performance Stats -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">TOTAL PROFIT</div>
        <div style="color: #10eb04; font-size: 24px; font-weight: 700;">+${{ totalProfit.toLocaleString() }}</div>
        <div style="color: #10eb04; font-size: 10px; margin-top: 5px;">+{{ totalProfitPercent }}%</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">ACTIVE BOTS</div>
        <div style="color: #00d4ff; font-size: 24px; font-weight: 700;">{{ activeBots }}</div>
        <div style="color: #888; font-size: 10px; margin-top: 5px;">{{ totalBots }} Total</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">WIN RATE</div>
        <div style="color: #10eb04; font-size: 24px; font-weight: 700;">{{ winRate }}%</div>
        <div style="color: #888; font-size: 10px; margin-top: 5px;">{{ totalTrades }} Trades</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">AVG PROFIT/TRADE</div>
        <div style="color: #ffa500; font-size: 24px; font-weight: 700;">${{ avgProfitPerTrade }}</div>
        <div style="color: #888; font-size: 10px; margin-top: 5px;">Per Executed Trade</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">BEST PERFORMER</div>
        <div style="color: #ff6b35; font-size: 18px; font-weight: 700;">{{ bestPerformer.name }}</div>
        <div style="color: #10eb04; font-size: 10px; margin-top: 5px;">+{{ bestPerformer.profit }}%</div>
      </div>
    </div>

    <!-- Performance by Bot Type -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Bot Performance List -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #00d4ff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">🤖 BOT PERFORMANCE BREAKDOWN</div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div
            v-for="bot in botsPerformance"
            :key="bot.id"
            style="background: rgba(0,0,0,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 6px;"
          >
            <!-- Bot Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 24px;">{{ bot.icon }}</div>
                <div>
                  <div style="color: #fff; font-size: 13px; font-weight: 700;">{{ bot.name }}</div>
                  <div style="color: #888; font-size: 10px;">{{ bot.type }} • {{ bot.symbol }}</div>
                </div>
                <div :style="`width: 8px; height: 8px; border-radius: 50%; background: ${bot.status === 'active' ? '#10eb04' : '#666'};`"></div>
              </div>
              <div style="text-align: right;">
                <div :style="`color: ${bot.profit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 16px; font-weight: 700;`">
                  {{ bot.profit >= 0 ? '+' : '' }}${{ bot.profit.toLocaleString() }}
                </div>
                <div :style="`color: ${bot.profitPercent >= 0 ? '#10eb04' : '#f52a09'}; font-size: 10px;`">
                  {{ bot.profitPercent >= 0 ? '+' : '' }}{{ bot.profitPercent }}%
                </div>
              </div>
            </div>

            <!-- Bot Metrics -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px;">
              <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 8px;">TRADES</div>
                <div style="color: #00d4ff; font-size: 12px; font-weight: 700;">{{ bot.trades }}</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 8px;">WIN RATE</div>
                <div style="color: #10eb04; font-size: 12px; font-weight: 700;">{{ bot.winRate }}%</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 8px;">AVG PROFIT</div>
                <div style="color: #ffa500; font-size: 12px; font-weight: 700;">${{ bot.avgProfit }}</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 8px;">UPTIME</div>
                <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ bot.uptime }}h</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 8px;">ROI</div>
                <div :style="`color: ${bot.roi >= 0 ? '#10eb04' : '#f52a09'}; font-size: 12px; font-weight: 700;`">
                  {{ bot.roi }}%
                </div>
              </div>
            </div>

            <!-- Performance Bar -->
            <div style="width: 100%; height: 6px; background: rgba(15,52,96,0.5); border-radius: 3px; overflow: hidden;">
              <div :style="`width: ${Math.min(Math.abs(bot.profitPercent) * 2, 100)}%; height: 100%; background: ${bot.profit >= 0 ? '#10eb04' : '#f52a09'}; border-radius: 3px;`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance by Strategy Type -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #00d4ff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">📊 BY STRATEGY TYPE</div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div
            v-for="strategy in strategyPerformance"
            :key="strategy.type"
            style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;"
          >
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ strategy.type }}</div>
                <div style="color: #888; font-size: 9px;">{{ strategy.count }} bots</div>
              </div>
              <div style="text-align: right;">
                <div :style="`color: ${strategy.profit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 14px; font-weight: 700;`">
                  {{ strategy.profit >= 0 ? '+' : '' }}${{ strategy.profit }}
                </div>
                <div :style="`color: ${strategy.profitPercent >= 0 ? '#10eb04' : '#f52a09'}; font-size: 9px;`">
                  {{ strategy.profitPercent >= 0 ? '+' : '' }}{{ strategy.profitPercent }}%
                </div>
              </div>
            </div>
            <div style="width: 100%; height: 4px; background: rgba(15,52,96,0.5); border-radius: 2px; overflow: hidden;">
              <div :style="`width: ${Math.min(Math.abs(strategy.profitPercent) * 3, 100)}%; height: 100%; background: ${strategy.profit >= 0 ? '#10eb04' : '#f52a09'}; border-radius: 2px;`"></div>
            </div>
          </div>
        </div>

        <!-- Top Markets -->
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #0f3460;">
          <div style="color: #00d4ff; font-size: 12px; font-weight: 700; margin-bottom: 10px;">🏆 TOP MARKETS</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div
              v-for="market in topMarkets"
              :key="market.symbol"
              style="display: flex; justify-content: space-between; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;"
            >
              <div style="color: #fff; font-size: 11px; font-weight: 600;">{{ market.symbol }}</div>
              <div :style="`color: ${market.profit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px; font-weight: 700;`">
                {{ market.profit >= 0 ? '+' : '' }}${{ market.profit }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade History & Analytics -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Recent Trades -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #00d4ff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">💹 RECENT TRADES</div>

        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto;">
          <div
            v-for="trade in recentTrades"
            :key="trade.id"
            :style="`background: ${trade.profit >= 0 ? 'rgba(16,235,4,0.05)' : 'rgba(245,42,9,0.05)'}; border-left: 3px solid ${trade.profit >= 0 ? '#10eb04' : '#f52a09'}; padding: 10px; border-radius: 4px;`"
          >
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>
                <div style="color: #fff; font-size: 11px; font-weight: 700;">{{ trade.symbol }} • {{ trade.type }}</div>
                <div style="color: #888; font-size: 9px;">{{ trade.botName }} • {{ formatTime(trade.timestamp) }}</div>
              </div>
              <div style="text-align: right;">
                <div :style="`color: ${trade.profit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 12px; font-weight: 700;`">
                  {{ trade.profit >= 0 ? '+' : '' }}${{ trade.profit }}
                </div>
                <div style="color: #888; font-size: 9px;">${{ trade.amount }}</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #888;">
              <span>Entry: ${{ trade.entryPrice }}</span>
              <span>Exit: ${{ trade.exitPrice }}</span>
              <span>{{ trade.profitPercent >= 0 ? '+' : '' }}{{ trade.profitPercent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #00d4ff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">📊 PERFORMANCE METRICS</div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Profit Factor -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #888; font-size: 11px;">Profit Factor</span>
              <span style="color: #10eb04; font-size: 14px; font-weight: 700;">{{ profitFactor }}</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(15,52,96,0.5); border-radius: 3px; overflow: hidden;">
              <div :style="`width: ${Math.min(profitFactor * 33.33, 100)}%; height: 100%; background: #10eb04; border-radius: 3px;`"></div>
            </div>
          </div>

          <!-- Max Drawdown -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #888; font-size: 11px;">Max Drawdown</span>
              <span style="color: #f52a09; font-size: 14px; font-weight: 700;">-{{ maxDrawdown }}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(15,52,96,0.5); border-radius: 3px; overflow: hidden;">
              <div :style="`width: ${maxDrawdown}%; height: 100%; background: #f52a09; border-radius: 3px;`"></div>
            </div>
          </div>

          <!-- Sharpe Ratio -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #888; font-size: 11px;">Sharpe Ratio</span>
              <span style="color: #ffa500; font-size: 14px; font-weight: 700;">{{ sharpeRatio }}</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(15,52,96,0.5); border-radius: 3px; overflow: hidden;">
              <div :style="`width: ${Math.min(sharpeRatio * 33.33, 100)}%; height: 100%; background: #ffa500; border-radius: 3px;`"></div>
            </div>
          </div>

          <!-- Avg Holding Time -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888; font-size: 11px;">Avg Holding Time</span>
              <span style="color: #00d4ff; font-size: 14px; font-weight: 700;">{{ avgHoldingTime }}h</span>
            </div>
          </div>

          <!-- Total Volume -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888; font-size: 11px;">Total Volume</span>
              <span style="color: #00d4ff; font-size: 14px; font-weight: 700;">${{ totalVolume.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Best Trade -->
          <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #10eb04; font-size: 11px; font-weight: 700;">Best Trade</span>
              <span style="color: #10eb04; font-size: 14px; font-weight: 700;">+${{ bestTrade }}</span>
            </div>
          </div>

          <!-- Worst Trade -->
          <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; padding: 12px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #f52a09; font-size: 11px; font-weight: 700;">Worst Trade</span>
              <span style="color: #f52a09; font-size: 14px; font-weight: 700;">-${{ worstTrade }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Actions -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
      <div style="color: #00d4ff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">⚡ QUICK ACTIONS</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <n-button @click="exportPerformanceReport" style="background: #10eb04; border: none; color: #000; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-size: 24px;">📄</div>
          <div style="font-size: 11px; font-weight: 700;">Export Report</div>
        </n-button>
        <n-button @click="optimizeBots" style="background: #00d4ff; border: none; color: #000; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-size: 24px;">⚙️</div>
          <div style="font-size: 11px; font-weight: 700;">Optimize Bots</div>
        </n-button>
        <n-button @click="pauseUnderperformers" style="background: #ffa500; border: none; color: #000; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-size: 24px;">⏸️</div>
          <div style="font-size: 11px; font-weight: 700;">Pause Underperformers</div>
        </n-button>
        <n-button @click="viewDetailedAnalysis" style="background: #8a2be2; border: none; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-size: 24px;">📊</div>
          <div style="font-size: 11px; font-weight: 700;">Detailed Analysis</div>
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const message = useMessage();

// State
const selectedTimeframe = ref('24h');
const totalProfit = ref(8547);
const totalProfitPercent = ref(18.4);
const activeBots = ref(12);
const totalBots = ref(15);
const winRate = ref(68.5);
const totalTrades = ref(342);
const avgProfitPerTrade = ref(25);

// Best Performer
const bestPerformer = ref({
  name: 'Grid Bot #3',
  profit: 24.8
});

// Performance Metrics
const profitFactor = ref(2.4);
const maxDrawdown = ref(12.3);
const sharpeRatio = ref(1.85);
const avgHoldingTime = ref(4.2);
const totalVolume = ref(125430);
const bestTrade = ref(342);
const worstTrade = ref(87);

// Timeframe Options
const timeframeOptions = ref([
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'All Time', value: 'all' }
]);

// Bots Performance
const botsPerformance = ref([
  {
    id: 1,
    name: 'Grid Bot #3',
    type: 'Grid Trading',
    symbol: 'BTC/USDT',
    icon: '🎯',
    status: 'active',
    profit: 2340,
    profitPercent: 24.8,
    trades: 87,
    winRate: 72,
    avgProfit: 27,
    uptime: 156,
    roi: 24.8
  },
  {
    id: 2,
    name: 'DCA Bot #1',
    type: 'DCA',
    symbol: 'ETH/USDT',
    icon: '📊',
    status: 'active',
    profit: 1890,
    profitPercent: 19.2,
    trades: 124,
    winRate: 68,
    avgProfit: 15,
    uptime: 312,
    roi: 19.2
  },
  {
    id: 3,
    name: 'Scalper #2',
    type: 'Scalping',
    symbol: 'LCX/USDT',
    icon: '⚡',
    status: 'active',
    profit: 1540,
    profitPercent: 15.7,
    trades: 456,
    winRate: 65,
    avgProfit: 3.4,
    uptime: 89,
    roi: 15.7
  },
  {
    id: 4,
    name: 'Trend Bot #1',
    type: 'Trend Following',
    symbol: 'BTC/USDT',
    icon: '📈',
    status: 'active',
    profit: 1240,
    profitPercent: 12.8,
    trades: 45,
    winRate: 71,
    avgProfit: 28,
    uptime: 201,
    roi: 12.8
  },
  {
    id: 5,
    name: 'Arbitrage Bot #1',
    type: 'Arbitrage',
    symbol: 'USDT/USDC',
    icon: '💱',
    status: 'active',
    profit: 890,
    profitPercent: 8.9,
    trades: 234,
    winRate: 92,
    avgProfit: 3.8,
    uptime: 423,
    roi: 8.9
  },
  {
    id: 6,
    name: 'Grid Bot #1',
    type: 'Grid Trading',
    symbol: 'SOL/USDT',
    icon: '🎯',
    status: 'paused',
    profit: -120,
    profitPercent: -2.4,
    trades: 34,
    winRate: 52,
    avgProfit: -3.5,
    uptime: 67,
    roi: -2.4
  }
]);

// Strategy Performance
const strategyPerformance = ref([
  { type: 'Grid Trading', count: 5, profit: 3420, profitPercent: 18.2 },
  { type: 'DCA', count: 3, profit: 2340, profitPercent: 15.6 },
  { type: 'Scalping', count: 2, profit: 1890, profitPercent: 12.4 },
  { type: 'Trend Following', count: 2, profit: 1540, profitPercent: 10.8 },
  { type: 'Arbitrage', count: 1, profit: 890, profitPercent: 8.9 },
  { type: 'Market Making', count: 2, profit: -543, profitPercent: -5.2 }
]);

// Top Markets
const topMarkets = ref([
  { symbol: 'BTC/USDT', profit: 3580 },
  { symbol: 'ETH/USDT', profit: 2340 },
  { symbol: 'LCX/USDT', profit: 1540 },
  { symbol: 'SOL/USDT', profit: 890 },
  { symbol: 'BNB/USDT', profit: 197 }
]);

// Recent Trades
const recentTrades = ref([
  {
    id: 1,
    symbol: 'BTC/USDT',
    type: 'LONG',
    botName: 'Grid Bot #3',
    profit: 45,
    profitPercent: 2.4,
    amount: 1870,
    entryPrice: 42340,
    exitPrice: 43356,
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 2,
    symbol: 'ETH/USDT',
    type: 'LONG',
    botName: 'DCA Bot #1',
    profit: 28,
    profitPercent: 1.8,
    amount: 1550,
    entryPrice: 2340,
    exitPrice: 2382,
    timestamp: new Date(Date.now() - 900000)
  },
  {
    id: 3,
    symbol: 'LCX/USDT',
    type: 'SHORT',
    botName: 'Scalper #2',
    profit: 12,
    profitPercent: 3.2,
    amount: 375,
    entryPrice: 0.0932,
    exitPrice: 0.0902,
    timestamp: new Date(Date.now() - 1200000)
  },
  {
    id: 4,
    symbol: 'BTC/USDT',
    type: 'LONG',
    botName: 'Trend Bot #1',
    profit: -15,
    profitPercent: -0.9,
    amount: 1670,
    entryPrice: 42890,
    exitPrice: 42504,
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 5,
    symbol: 'SOL/USDT',
    type: 'LONG',
    botName: 'Grid Bot #1',
    profit: 34,
    profitPercent: 2.1,
    amount: 1620,
    entryPrice: 98.50,
    exitPrice: 100.57,
    timestamp: new Date(Date.now() - 2400000)
  }
]);

// Methods
const exportPerformanceReport = () => {
  message.success('Exporting performance report...');
};

const optimizeBots = () => {
  message.info('Analyzing bot parameters for optimization...');
};

const pauseUnderperformers = () => {
  message.warning('Pausing underperforming bots...');
};

const viewDetailedAnalysis = () => {
  message.info('Opening detailed analytics dashboard...');
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

onMounted(() => {
  console.log('📈 Bot Performance Analytics loaded');
  console.log(`💰 Total Profit: $${totalProfit.value}`);
});
</script>
