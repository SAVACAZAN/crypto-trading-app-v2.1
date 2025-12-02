<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #8a2be2;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">🔬</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #8a2be2; font-weight: 700;">BOT BACKTEST</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">{{ backtestStatus }} • {{ selectedBot }}</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <n-button size="small" @click="showConfigModal = true" style="background: rgba(138,43,226,0.1); border: 1px solid rgba(138,43,226,0.3); color: #8a2be2;">
            New Backtest
          </n-button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(16,235,4,0.1); border: 1px solid rgba(16,235,4,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">TOTAL PROFIT</div>
        <div :style="`color: ${results.totalProfit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 18px; font-weight: 700;`">
          {{ results.totalProfit >= 0 ? '+' : '' }}${{ results.totalProfit.toLocaleString() }}
        </div>
      </div>
      <div style="background: rgba(138,43,226,0.1); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">WIN RATE</div>
        <div style="color: #8a2be2; font-size: 18px; font-weight: 700;">{{ results.winRate }}%</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SHARPE RATIO</div>
        <div style="color: #00d4ff; font-size: 18px; font-weight: 700;">{{ results.sharpeRatio }}</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">MAX DRAWDOWN</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ results.maxDrawdown }}%</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">TOTAL TRADES</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">{{ results.totalTrades }}</div>
      </div>
      <div style="background: rgba(138,43,226,0.1); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">PROFIT FACTOR</div>
        <div style="color: #8a2be2; font-size: 18px; font-weight: 700;">{{ results.profitFactor }}</div>
      </div>
    </div>

    <!-- Backtest Configuration & Results -->
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 15px;">

      <!-- Configuration Panel -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>⚙️</span>
          <span>CONFIGURATION</span>
        </div>

        <!-- Bot Type -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Bot Type</div>
          <n-select v-model:value="config.botType" :options="botTypeOptions" size="small" />
        </div>

        <!-- Symbol -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Symbol</div>
          <n-select v-model:value="config.symbol" :options="symbolOptions" size="small" />
        </div>

        <!-- Timeframe -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Timeframe</div>
          <n-select v-model:value="config.timeframe" :options="timeframeOptions" size="small" />
        </div>

        <!-- Date Range -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Start Date</div>
          <n-input v-model:value="config.startDate" type="date" size="small" />
        </div>

        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">End Date</div>
          <n-input v-model:value="config.endDate" type="date" size="small" />
        </div>

        <!-- Initial Capital -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Initial Capital ($)</div>
          <n-input-number v-model:value="config.initialCapital" :min="100" :step="1000" size="small" style="width: 100%;" />
        </div>

        <!-- Commission -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Commission (%)</div>
          <n-input-number v-model:value="config.commission" :min="0" :max="1" :step="0.01" :precision="2" size="small" style="width: 100%;" />
        </div>

        <!-- Run Backtest Button -->
        <n-button @click="runBacktest" :loading="isRunning" type="primary" size="medium" block
          style="background: #8a2be2; border: none; font-weight: 700; margin-top: 20px;">
          {{ isRunning ? 'Running...' : '🚀 Run Backtest' }}
        </n-button>

        <!-- Saved Backtests -->
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(138,43,226,0.3);">
          <div style="color: #8a2be2; font-size: 12px; font-weight: 700; margin-bottom: 10px;">SAVED BACKTESTS</div>
          <div v-if="savedBacktests.length === 0" style="color: #666; font-size: 10px; text-align: center; padding: 10px;">
            No saved backtests
          </div>
          <div v-else style="max-height: 200px; overflow-y: auto;">
            <div v-for="bt in savedBacktests" :key="bt.id"
              style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: all 0.3s;"
              :style="selectedBacktest === bt.id ? 'border: 1px solid #8a2be2;' : 'border: 1px solid transparent;'"
              @click="loadBacktest(bt)">
              <div style="color: #fff; font-size: 11px; font-weight: 700; margin-bottom: 4px;">{{ bt.name }}</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #888; font-size: 9px;">{{ bt.symbol }} • {{ bt.timeframe }}</div>
                <div :style="`color: ${bt.profit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 10px; font-weight: 700;`">
                  {{ bt.profit >= 0 ? '+' : '' }}{{ bt.profit }}%
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Equity Curve Chart -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📈</span>
          <span>EQUITY CURVE</span>
        </div>

        <div style="height: 350px; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 15px; position: relative;">
          <svg viewBox="0 0 800 300" style="width: 100%; height: 100%;">
            <!-- Grid Lines -->
            <line v-for="i in 6" :key="`grid-y-${i}`" :y1="i * 50" :y2="i * 50" x1="0" x2="800" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line v-for="i in 8" :key="`grid-x-${i}`" :x1="i * 100" :x2="i * 100" y1="0" y2="300" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

            <!-- Equity Line -->
            <polyline :points="equityPoints" fill="none" stroke="#8a2be2" stroke-width="2"/>

            <!-- Buy/Sell Markers -->
            <g v-for="(trade, index) in trades" :key="`trade-${index}`">
              <circle v-if="trade.type === 'BUY'"
                :cx="(trade.index / (equityData.length - 1)) * 800"
                :cy="300 - ((trade.equity - minEquity) / (maxEquity - minEquity)) * 300"
                r="5" fill="#10eb04" stroke="#000" stroke-width="1"/>
              <circle v-if="trade.type === 'SELL'"
                :cx="(trade.index / (equityData.length - 1)) * 800"
                :cy="300 - ((trade.equity - minEquity) / (maxEquity - minEquity)) * 300"
                r="5" fill="#f52a09" stroke="#000" stroke-width="1"/>
            </g>
          </svg>

          <!-- Y-axis Labels -->
          <div style="position: absolute; left: 10px; top: 15px; display: flex; flex-direction: column; justify-content: space-between; height: calc(100% - 30px);">
            <div v-for="i in 6" :key="`label-y-${i}`" style="color: #888; font-size: 9px;">
              ${{ Math.round(maxEquity - (i * (maxEquity - minEquity) / 5)).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 12px; height: 12px; background: #10eb04; border-radius: 50%;"></div>
            <div style="color: #888; font-size: 10px;">Buy Signal</div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 12px; height: 12px; background: #f52a09; border-radius: 50%;"></div>
            <div style="color: #888; font-size: 10px;">Sell Signal</div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 20px; height: 3px; background: #8a2be2;"></div>
            <div style="color: #888; font-size: 10px;">Equity</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Detailed Metrics -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">

      <!-- Performance Metrics -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📊</span>
          <span>PERFORMANCE METRICS</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Return %</div>
            <div :style="`color: ${results.returnPercent >= 0 ? '#10eb04' : '#f52a09'}; font-size: 14px; font-weight: 700;`">
              {{ results.returnPercent >= 0 ? '+' : '' }}{{ results.returnPercent }}%
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Avg Win</div>
            <div style="color: #10eb04; font-size: 14px; font-weight: 700;">+${{ results.avgWin }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Avg Loss</div>
            <div style="color: #f52a09; font-size: 14px; font-weight: 700;">-${{ results.avgLoss }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Largest Win</div>
            <div style="color: #10eb04; font-size: 14px; font-weight: 700;">+${{ results.largestWin }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Largest Loss</div>
            <div style="color: #f52a09; font-size: 14px; font-weight: 700;">-${{ results.largestLoss }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Avg Trade Duration</div>
            <div style="color: #00d4ff; font-size: 14px; font-weight: 700;">{{ results.avgDuration }}</div>
          </div>
        </div>
      </div>

      <!-- Trade Statistics -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📉</span>
          <span>TRADE STATISTICS</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Winning Trades</div>
            <div style="color: #10eb04; font-size: 14px; font-weight: 700;">{{ results.winningTrades }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Losing Trades</div>
            <div style="color: #f52a09; font-size: 14px; font-weight: 700;">{{ results.losingTrades }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Consecutive Wins</div>
            <div style="color: #10eb04; font-size: 14px; font-weight: 700;">{{ results.consecutiveWins }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Consecutive Losses</div>
            <div style="color: #f52a09; font-size: 14px; font-weight: 700;">{{ results.consecutiveLosses }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Expectancy</div>
            <div style="color: #8a2be2; font-size: 14px; font-weight: 700;">${{ results.expectancy }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Recovery Factor</div>
            <div style="color: #00d4ff; font-size: 14px; font-weight: 700;">{{ results.recoveryFactor }}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Trade Log -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>📝</span>
          <span>TRADE LOG</span>
        </div>
        <div style="color: #888; font-size: 11px;">{{ tradeLog.length }} trades</div>
      </div>

      <div style="max-height: 300px; overflow-y: auto;">
        <div v-if="tradeLog.length === 0" style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 36px; margin-bottom: 10px;">📝</div>
          <div style="font-size: 12px;">No trades yet. Run a backtest to see results.</div>
        </div>

        <div v-else style="display: grid; gap: 8px;">
          <div v-for="(trade, index) in tradeLog" :key="index"
            :style="`background: ${trade.profit >= 0 ? 'rgba(16,235,4,0.05)' : 'rgba(245,42,9,0.05)'}; border-left: 3px solid ${trade.profit >= 0 ? '#10eb04' : '#f52a09'}; padding: 10px; border-radius: 4px;`">
            <div style="display: grid; grid-template-columns: 80px 120px 120px 120px 100px 1fr; gap: 10px; align-items: center;">
              <div>
                <div :style="`background: ${trade.type === 'BUY' ? 'rgba(16,235,4,0.2)' : 'rgba(245,42,9,0.2)'}; color: ${trade.type === 'BUY' ? '#10eb04' : '#f52a09'}; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-align: center;`">
                  {{ trade.type }}
                </div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Entry</div>
                <div style="color: #fff; font-size: 11px; font-weight: 700;">${{ trade.entryPrice }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Exit</div>
                <div style="color: #fff; font-size: 11px; font-weight: 700;">${{ trade.exitPrice }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Size</div>
                <div style="color: #00d4ff; font-size: 11px; font-weight: 700;">{{ trade.size }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">P&L</div>
                <div :style="`color: ${trade.profit >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px; font-weight: 700;`">
                  {{ trade.profit >= 0 ? '+' : '' }}${{ trade.profit }}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="color: #888; font-size: 9px;">{{ trade.date }}</div>
                <div style="color: #666; font-size: 9px;">{{ trade.duration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Config Modal -->
    <n-modal v-model:show="showConfigModal" :mask-closable="false">
      <div style="background: #0a0a0a; border: 2px solid #8a2be2; border-radius: 8px; padding: 20px; width: 500px; max-width: 90vw;">
        <div style="color: #8a2be2; font-size: 16px; font-weight: 700; margin-bottom: 15px;">🔬 New Backtest</div>

        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Backtest Name</div>
          <n-input v-model:value="newBacktestName" placeholder="e.g., Grid Bot - BTC 1H" size="small" />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <n-button @click="createBacktest" type="primary" size="small" style="flex: 1; background: #8a2be2; border: none;">
            Create
          </n-button>
          <n-button @click="showConfigModal = false" size="small" style="flex: 1;">
            Cancel
          </n-button>
        </div>
      </div>
    </n-modal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

// State
const isRunning = ref(false);
const showConfigModal = ref(false);
const newBacktestName = ref('');
const selectedBacktest = ref(null);
const backtestStatus = ref('Ready');
const selectedBot = ref('Grid Bot');

// Configuration
const config = ref({
  botType: 'Grid Bot',
  symbol: 'BTC/USDT',
  timeframe: '1h',
  startDate: '2024-01-01',
  endDate: '2024-11-14',
  initialCapital: 10000,
  commission: 0.1
});

// Options
const botTypeOptions = [
  { label: 'Grid Bot', value: 'Grid Bot' },
  { label: 'DCA Bot', value: 'DCA Bot' },
  { label: 'Scalping Bot', value: 'Scalping Bot' },
  { label: 'Arbitrage Bot', value: 'Arbitrage Bot' }
];

const symbolOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'BNB/USDT', value: 'BNB/USDT' },
  { label: 'SOL/USDT', value: 'SOL/USDT' }
];

const timeframeOptions = [
  { label: '1 Minute', value: '1m' },
  { label: '5 Minutes', value: '5m' },
  { label: '15 Minutes', value: '15m' },
  { label: '1 Hour', value: '1h' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Day', value: '1d' }
];

// Results
const results = ref({
  totalProfit: 2450.50,
  winRate: 68.5,
  sharpeRatio: 2.34,
  maxDrawdown: 12.5,
  totalTrades: 142,
  profitFactor: 2.15,
  returnPercent: 24.5,
  avgWin: 85.20,
  avgLoss: 42.10,
  largestWin: 345.80,
  largestLoss: 156.40,
  avgDuration: '2.5h',
  winningTrades: 97,
  losingTrades: 45,
  consecutiveWins: 12,
  consecutiveLosses: 5,
  expectancy: 17.25,
  recoveryFactor: 1.96
});

// Equity Data
const equityData = ref([]);
const trades = ref([]);
const tradeLog = ref([]);
const savedBacktests = ref([]);

// Generate sample equity data
const generateEquityData = () => {
  const data = [];
  let equity = config.value.initialCapital;

  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.45) * 200;
    equity += change;
    data.push(equity);

    // Add trade markers
    if (i % 10 === 0 && i > 0) {
      trades.value.push({
        index: i,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        equity: equity
      });
    }
  }

  equityData.value = data;
};

// Generate sample trade log
const generateTradeLog = () => {
  const log = [];
  const types = ['BUY', 'SELL'];

  for (let i = 0; i < 20; i++) {
    const profit = (Math.random() - 0.3) * 200;
    log.push({
      type: types[Math.floor(Math.random() * types.length)],
      entryPrice: (45000 + Math.random() * 5000).toFixed(2),
      exitPrice: (45000 + Math.random() * 5000).toFixed(2),
      size: (Math.random() * 0.5).toFixed(4),
      profit: profit.toFixed(2),
      date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
      duration: `${Math.floor(Math.random() * 48)}h ${Math.floor(Math.random() * 60)}m`
    });
  }

  tradeLog.value = log.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Computed
const minEquity = computed(() => Math.min(...equityData.value));
const maxEquity = computed(() => Math.max(...equityData.value));

const equityPoints = computed(() => {
  return equityData.value
    .map((equity, index) => {
      const x = (index / (equityData.value.length - 1)) * 800;
      const y = 300 - ((equity - minEquity.value) / (maxEquity.value - minEquity.value)) * 300;
      return `${x},${y}`;
    })
    .join(' ');
});

// Methods
const runBacktest = async () => {
  isRunning.value = true;
  backtestStatus.value = 'Running...';

  // Simulate backtest
  setTimeout(() => {
    generateEquityData();
    generateTradeLog();
    isRunning.value = false;
    backtestStatus.value = 'Completed';
  }, 2000);
};

const createBacktest = () => {
  if (!newBacktestName.value) return;

  savedBacktests.value.push({
    id: Date.now(),
    name: newBacktestName.value,
    symbol: config.value.symbol,
    timeframe: config.value.timeframe,
    profit: results.value.returnPercent
  });

  localStorage.setItem('palantir_backtests', JSON.stringify(savedBacktests.value));
  showConfigModal.value = false;
  newBacktestName.value = '';
};

const loadBacktest = (bt) => {
  selectedBacktest.value = bt.id;
  // Load backtest data
};

// Lifecycle
onMounted(() => {
  generateEquityData();
  generateTradeLog();

  // Load saved backtests
  const saved = localStorage.getItem('palantir_backtests');
  if (saved) {
    savedBacktests.value = JSON.parse(saved);
  }
});
</script>
