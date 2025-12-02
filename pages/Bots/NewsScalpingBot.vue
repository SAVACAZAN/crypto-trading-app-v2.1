<template>
  <div class="news-scalping-page">
    <!-- NEWS BOTS NAVIGATION -->
    <div class="news-bots-nav">
      <div class="nav-tabs-container">
        <button
          v-for="bot in newsBots"
          :key="bot.id"
          :class="['news-tab-btn', { active: currentBotId === bot.id }]"
          @click="navigateToNewsBot(bot.id)"
          :title="bot.name"
        >
          <span class="tab-icon">{{ bot.icon }}</span>
          <span class="tab-name">{{ bot.name }}</span>
          <span v-if="bot.status === 'active'" class="status-badge active">LIVE</span>
          <span v-else-if="bot.status === 'coming'" class="status-badge coming">SOON</span>
        </button>
      </div>
    </div>

    <!-- MAIN GRID LAYOUT -->
    <div class="news-grid-layout">
      <!-- LEFT COLUMN: News Feed & Sentiment Analysis -->
      <div class="left-column">
        <!-- Live News Feed -->
        <n-card title="📰 Live News Feed" size="small" class="news-feed-card">
          <template #header-extra>
            <n-tag :type="newsStreamStatus === 'connected' ? 'success' : 'error'" size="small" :bordered="false">
              {{ newsStreamStatus === 'connected' ? '🟢 LIVE' : '🔴 OFFLINE' }}
            </n-tag>
          </template>

          <!-- News Filters -->
          <div class="news-filters">
            <n-select
              v-model:value="selectedNewsSource"
              :options="newsSourceOptions"
              size="small"
              placeholder="News Source"
              style="width: 150px"
            />
            <n-select
              v-model:value="selectedSentiment"
              :options="sentimentFilterOptions"
              size="small"
              placeholder="Sentiment"
              style="width: 120px"
            />
            <n-input-number
              v-model:value="minImpactScore"
              :min="0"
              :max="100"
              size="small"
              placeholder="Min Impact"
              style="width: 110px"
            >
              <template #suffix>%</template>
            </n-input-number>
          </div>

          <!-- News Items List -->
          <div class="news-items-list">
            <div v-if="newsItems.length === 0" class="no-news">
              <span class="no-news-icon">📡</span>
              <p>Waiting for live news...</p>
            </div>

            <div
              v-for="item in filteredNewsItems"
              :key="item.id"
              :class="['news-item', `sentiment-${item.sentiment}`]"
              @click="selectNews(item)"
            >
              <!-- News Header -->
              <div class="news-header">
                <div class="news-source">
                  <span class="source-icon">{{ getSourceIcon(item.source) }}</span>
                  <span class="source-name">{{ item.source }}</span>
                </div>
                <div class="news-time">{{ formatTimeAgo(item.timestamp) }}</div>
              </div>

              <!-- News Title -->
              <div class="news-title">{{ item.title }}</div>

              <!-- News Metrics -->
              <div class="news-metrics">
                <div class="metric">
                  <span class="metric-label">Sentiment:</span>
                  <n-tag :type="getSentimentType(item.sentiment)" size="tiny" :bordered="false">
                    {{ item.sentiment }}
                  </n-tag>
                </div>
                <div class="metric">
                  <span class="metric-label">Impact:</span>
                  <n-tag :type="getImpactType(item.impactScore)" size="tiny" :bordered="false">
                    {{ item.impactScore }}%
                  </n-tag>
                </div>
                <div class="metric">
                  <span class="metric-label">Coins:</span>
                  <div class="mentioned-coins">
                    <n-tag
                      v-for="coin in item.mentionedCoins.slice(0, 3)"
                      :key="coin"
                      size="tiny"
                      type="info"
                      :bordered="false"
                    >
                      {{ coin }}
                    </n-tag>
                  </div>
                </div>
              </div>

              <!-- Trading Signal (if auto-generated) -->
              <div v-if="item.signal" class="news-signal">
                <span class="signal-icon">{{ item.signal.action === 'BUY' ? '🟢' : '🔴' }}</span>
                <span class="signal-action">{{ item.signal.action }}</span>
                <span class="signal-confidence">{{ item.signal.confidence }}% confidence</span>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Sentiment Overview -->
        <n-card title="📊 Market Sentiment Overview" size="small" class="sentiment-card">
          <div class="sentiment-overview">
            <div class="sentiment-gauge">
              <n-progress
                type="circle"
                :percentage="overallSentiment"
                :color="getSentimentColor(overallSentiment)"
                :stroke-width="12"
              >
                <div class="gauge-content">
                  <span class="gauge-emoji">{{ getSentimentEmoji(overallSentiment) }}</span>
                  <span class="gauge-label">{{ getSentimentLabel(overallSentiment) }}</span>
                </div>
              </n-progress>
            </div>

            <div class="sentiment-breakdown">
              <div class="breakdown-item bullish">
                <span class="breakdown-label">🟢 Bullish</span>
                <span class="breakdown-value">{{ sentimentStats.bullish }}%</span>
              </div>
              <div class="breakdown-item neutral">
                <span class="breakdown-label">⚪ Neutral</span>
                <span class="breakdown-value">{{ sentimentStats.neutral }}%</span>
              </div>
              <div class="breakdown-item bearish">
                <span class="breakdown-label">🔴 Bearish</span>
                <span class="breakdown-value">{{ sentimentStats.bearish }}%</span>
              </div>
            </div>
          </div>

          <!-- Top Trending Coins -->
          <div class="trending-coins">
            <h4>🔥 Trending in News</h4>
            <div class="trending-list">
              <div v-for="coin in trendingCoins" :key="coin.symbol" class="trending-item">
                <span class="coin-symbol">{{ coin.symbol }}</span>
                <span class="coin-mentions">{{ coin.mentions }} mentions</span>
                <span :class="['coin-sentiment', coin.avgSentiment > 0 ? 'positive' : 'negative']">
                  {{ coin.avgSentiment > 0 ? '+' : '' }}{{ coin.avgSentiment }}%
                </span>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- CENTER COLUMN: Bot Configuration -->
      <div class="center-column">
        <n-card title="⚡ News Scalping Bot Configuration" size="small" class="config-card">
          <n-tabs type="line" size="small" animated>
            <!-- Basic Configuration -->
            <n-tab-pane name="basic" tab="⚙️ Basic Config">
              <div class="config-section">
                <n-grid x-gap="12" y-gap="12" :cols="2">
                  <!-- Bot Name -->
                  <n-gi span="2">
                    <div class="form-group">
                      <label class="form-label">Bot Name</label>
                      <n-input v-model:value="botName" placeholder="NewsScalp_Bot_1" size="small">
                        <template #prefix>🏷️</template>
                      </n-input>
                    </div>
                  </n-gi>

                  <!-- Trading Pair -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Trading Pair</label>
                      <n-select
                        v-model:value="tradingPair"
                        :options="tradingPairOptions"
                        size="small"
                        filterable
                        placeholder="Select pair"
                      />
                    </div>
                  </n-gi>

                  <!-- Strategy Mode -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Strategy Mode</label>
                      <n-select
                        v-model:value="strategyMode"
                        :options="strategyModeOptions"
                        size="small"
                      />
                    </div>
                  </n-gi>

                  <!-- Trade Size -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Trade Size (USDT)</label>
                      <n-input-number
                        v-model:value="tradeSize"
                        :min="10"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>USDT</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Max Concurrent Trades -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Max Concurrent Trades</label>
                      <n-input-number
                        v-model:value="maxConcurrentTrades"
                        :min="1"
                        :max="10"
                        size="small"
                        style="width: 100%"
                      />
                    </div>
                  </n-gi>
                </n-grid>
              </div>
            </n-tab-pane>

            <!-- News Triggers -->
            <n-tab-pane name="triggers" tab="🎯 News Triggers">
              <div class="config-section">
                <n-space vertical size="large">
                  <!-- Sentiment Threshold -->
                  <div class="form-group">
                    <label class="form-label">Sentiment Threshold</label>
                    <div class="slider-container">
                      <n-slider
                        v-model:value="sentimentThreshold"
                        :min="-100"
                        :max="100"
                        :marks="sentimentMarks"
                        :format-tooltip="(value) => `${value}%`"
                      />
                      <div class="slider-value">{{ sentimentThreshold }}%</div>
                    </div>
                  </div>

                  <!-- Impact Score Threshold -->
                  <div class="form-group">
                    <label class="form-label">Minimum Impact Score</label>
                    <div class="slider-container">
                      <n-slider
                        v-model:value="impactThreshold"
                        :min="0"
                        :max="100"
                        :step="5"
                        :format-tooltip="(value) => `${value}%`"
                      />
                      <div class="slider-value">{{ impactThreshold }}%</div>
                    </div>
                  </div>

                  <!-- News Sources -->
                  <div class="form-group">
                    <label class="form-label">Trusted News Sources</label>
                    <n-select
                      v-model:value="selectedSources"
                      :options="allNewsSourceOptions"
                      multiple
                      size="small"
                      placeholder="Select sources"
                    />
                  </div>

                  <!-- Keywords -->
                  <div class="form-group">
                    <label class="form-label">Watch Keywords (comma-separated)</label>
                    <n-input
                      v-model:value="watchKeywords"
                      type="textarea"
                      placeholder="e.g., partnership, adoption, regulation, hack, upgrade"
                      :rows="3"
                      size="small"
                    />
                  </div>

                  <!-- Auto-Trade Options -->
                  <div class="form-group">
                    <label class="form-label">Auto-Trading Options</label>
                    <n-space vertical>
                      <n-checkbox v-model:checked="autoTrade">Enable Auto-Trade on News</n-checkbox>
                      <n-checkbox v-model:checked="requireManualConfirm">Require Manual Confirmation</n-checkbox>
                      <n-checkbox v-model:checked="onlyHighImpact">Trade Only High Impact News (80%+)</n-checkbox>
                    </n-space>
                  </div>
                </n-space>
              </div>
            </n-tab-pane>

            <!-- Risk Management -->
            <n-tab-pane name="risk" tab="🛡️ Risk Management">
              <div class="config-section">
                <n-grid x-gap="12" y-gap="12" :cols="2">
                  <!-- Stop Loss -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Stop Loss (%)</label>
                      <n-input-number
                        v-model:value="stopLossPercent"
                        :min="0.1"
                        :max="50"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Take Profit -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Take Profit (%)</label>
                      <n-input-number
                        v-model:value="takeProfitPercent"
                        :min="0.1"
                        :max="100"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Max Loss Per Day -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Max Loss Per Day (USDT)</label>
                      <n-input-number
                        v-model:value="maxDailyLoss"
                        :min="0"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>USDT</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Trade Timeout -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Trade Timeout (minutes)</label>
                      <n-input-number
                        v-model:value="tradeTimeout"
                        :min="1"
                        :max="60"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>min</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Trailing Stop -->
                  <n-gi span="2">
                    <div class="form-group">
                      <n-checkbox v-model:checked="useTrailingStop">
                        Use Trailing Stop Loss
                      </n-checkbox>
                      <n-input-number
                        v-if="useTrailingStop"
                        v-model:value="trailingStopPercent"
                        :min="0.1"
                        :max="10"
                        :precision="2"
                        size="small"
                        style="width: 150px; margin-left: 12px"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>
                  </n-gi>
                </n-grid>
              </div>
            </n-tab-pane>

            <!-- AI Settings -->
            <n-tab-pane name="ai" tab="🧠 AI Settings">
              <div class="config-section">
                <n-space vertical size="large">
                  <!-- AI Model Selection -->
                  <div class="form-group">
                    <label class="form-label">AI News Analyzer</label>
                    <n-select
                      v-model:value="aiModel"
                      :options="aiModelOptions"
                      size="small"
                    />
                  </div>

                  <!-- Confidence Threshold -->
                  <div class="form-group">
                    <label class="form-label">AI Confidence Threshold</label>
                    <div class="slider-container">
                      <n-slider
                        v-model:value="aiConfidenceThreshold"
                        :min="0"
                        :max="100"
                        :step="5"
                        :format-tooltip="(value) => `${value}%`"
                      />
                      <div class="slider-value">{{ aiConfidenceThreshold }}%</div>
                    </div>
                  </div>

                  <!-- AI Features -->
                  <div class="form-group">
                    <label class="form-label">AI Analysis Features</label>
                    <n-space vertical>
                      <n-checkbox v-model:checked="aiFeatures.sentimentAnalysis">
                        Sentiment Analysis (NLP)
                      </n-checkbox>
                      <n-checkbox v-model:checked="aiFeatures.entityRecognition">
                        Named Entity Recognition
                      </n-checkbox>
                      <n-checkbox v-model:checked="aiFeatures.trendPrediction">
                        Price Trend Prediction
                      </n-checkbox>
                      <n-checkbox v-model:checked="aiFeatures.fakeNewsDetection">
                        Fake News Detection
                      </n-checkbox>
                      <n-checkbox v-model:checked="aiFeatures.correlationAnalysis">
                        Historical Correlation Analysis
                      </n-checkbox>
                    </n-space>
                  </div>
                </n-space>
              </div>
            </n-tab-pane>
          </n-tabs>

          <!-- Action Buttons -->
          <template #footer>
            <n-space justify="space-between">
              <n-space>
                <n-tag :bordered="false" type="info">
                  {{ currentExchange }} - {{ tradingPair }}
                </n-tag>
                <n-tag :bordered="false" type="success" v-if="tradeSize">
                  {{ tradeSize }} USDT per trade
                </n-tag>
              </n-space>
              <n-button-group>
                <n-button type="primary" size="medium" @click="createBot" :loading="creating">
                  <template #icon><span>🚀</span></template>
                  Deploy News Bot
                </n-button>
                <n-button size="medium" @click="savePreset">
                  <template #icon><span>💾</span></template>
                  Save Preset
                </n-button>
              </n-button-group>
            </n-space>
          </template>
        </n-card>
      </div>

      <!-- RIGHT COLUMN: Live Signals & Stats -->
      <div class="right-column">
        <!-- Active Signals -->
        <n-card title="🎯 Active Trading Signals" size="small" class="signals-card">
          <div class="signals-list">
            <div v-if="activeSignals.length === 0" class="no-signals">
              <span class="no-signals-icon">📡</span>
              <p>No active signals</p>
            </div>

            <div
              v-for="signal in activeSignals"
              :key="signal.id"
              :class="['signal-item', signal.action.toLowerCase()]"
            >
              <div class="signal-header">
                <span class="signal-icon">{{ signal.action === 'BUY' ? '🟢' : '🔴' }}</span>
                <span class="signal-action">{{ signal.action }}</span>
                <n-tag :type="signal.confidence > 80 ? 'success' : 'warning'" size="tiny" :bordered="false">
                  {{ signal.confidence }}%
                </n-tag>
              </div>

              <div class="signal-pair">{{ signal.pair }}</div>
              <div class="signal-reason">{{ signal.reason }}</div>

              <div class="signal-metrics">
                <div class="signal-metric">
                  <span>Entry:</span>
                  <strong>{{ signal.entryPrice }}</strong>
                </div>
                <div class="signal-metric">
                  <span>Target:</span>
                  <strong class="target">{{ signal.targetPrice }}</strong>
                </div>
                <div class="signal-metric">
                  <span>Stop:</span>
                  <strong class="stop">{{ signal.stopLoss }}</strong>
                </div>
              </div>

              <div class="signal-time">{{ formatTimeAgo(signal.timestamp) }}</div>

              <n-button
                v-if="!signal.executed"
                size="small"
                :type="signal.action === 'BUY' ? 'success' : 'error'"
                block
                @click="executeSignal(signal)"
              >
                Execute {{ signal.action }}
              </n-button>
            </div>
          </div>
        </n-card>

        <!-- Performance Stats -->
        <n-card title="📈 Bot Performance" size="small" class="stats-card">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Trades</div>
              <div class="stat-value">{{ botStats.totalTrades }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Win Rate</div>
              <div class="stat-value success">{{ botStats.winRate }}%</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total P&L</div>
              <div :class="['stat-value', botStats.totalPnl >= 0 ? 'success' : 'error']">
                {{ botStats.totalPnl >= 0 ? '+' : '' }}${{ botStats.totalPnl }}
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Avg. Trade</div>
              <div :class="['stat-value', botStats.avgTrade >= 0 ? 'success' : 'error']">
                {{ botStats.avgTrade >= 0 ? '+' : '' }}${{ botStats.avgTrade }}
              </div>
            </div>
          </div>

          <!-- Recent Trades -->
          <div class="recent-trades">
            <h4>Recent News Trades</h4>
            <div class="trades-list">
              <div v-if="recentTrades.length === 0" class="no-trades">
                No trades yet
              </div>
              <div v-for="trade in recentTrades" :key="trade.id" class="trade-item">
                <div class="trade-header">
                  <span :class="['trade-type', trade.type.toLowerCase()]">{{ trade.type }}</span>
                  <span class="trade-pair">{{ trade.pair }}</span>
                  <span :class="['trade-pnl', trade.pnl >= 0 ? 'profit' : 'loss']">
                    {{ trade.pnl >= 0 ? '+' : '' }}{{ trade.pnl }}%
                  </span>
                </div>
                <div class="trade-news">📰 {{ trade.newsTitle }}</div>
                <div class="trade-time">{{ formatTimeAgo(trade.timestamp) }}</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { useMessage } from 'naive-ui';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
const message = useMessage();
const userID = useCookie('userID');
const route = useRoute();

// Current bot ID
const currentBotId = ref('scalp-news');

// TOP 10 NEWS-RELATED BOTS
const newsBots = ref([
  {
    id: 'scalp-news',
    name: 'News Scalping',
    icon: '📰',
    description: 'Real-time news trading with AI sentiment analysis',
    status: 'active'
  },
  {
    id: 'news-sentiment',
    name: 'Sentiment Trader',
    icon: '😊',
    description: 'Trade based on social media sentiment',
    status: 'coming'
  },
  {
    id: 'news-pump',
    name: 'Pump Detector',
    icon: '🚀',
    description: 'Detect and trade news-driven pumps',
    status: 'coming'
  },
  {
    id: 'news-regulation',
    name: 'Regulation Watch',
    icon: '⚖️',
    description: 'Monitor regulatory news and trade accordingly',
    status: 'coming'
  },
  {
    id: 'news-whale',
    name: 'Whale Alert',
    icon: '🐋',
    description: 'Track whale movements and news correlation',
    status: 'active'
  },
  {
    id: 'news-partnership',
    name: 'Partnership Hunter',
    icon: '🤝',
    description: 'Trade on partnership announcements',
    status: 'coming'
  },
  {
    id: 'news-hack',
    name: 'Security Monitor',
    icon: '🛡️',
    description: 'React to hack/security breach news',
    status: 'coming'
  },
  {
    id: 'news-adoption',
    name: 'Adoption Tracker',
    icon: '📈',
    description: 'Monitor institutional adoption news',
    status: 'coming'
  },
  {
    id: 'news-fud',
    name: 'FUD Fighter',
    icon: '💪',
    description: 'Counter-trade FUD news with AI analysis',
    status: 'coming'
  },
  {
    id: 'news-catalyst',
    name: 'Catalyst Scanner',
    icon: '⚡',
    description: 'Identify and trade major market catalysts',
    status: 'coming'
  }
]);

// Navigate to different news bot
const navigateToNewsBot = (botId) => {
  if (botId === 'scalp-news') {
    // Already on this page, just update UI
    currentBotId.value = botId;
  } else if (botId === 'news-whale') {
    // Navigate to Whale Alert Bot
    navigateTo('/PalantirApp/Bots/DeployBot?botId=news-whale');
  } else {
    // Navigate to other news bot page (when implemented)
    message.info(`${botId} - Coming Soon!`);
  }
};

// News Stream
const newsStreamStatus = ref('connected');
const newsItems = ref([]);
const selectedNews = ref(null);

// Filters
const selectedNewsSource = ref('all');
const selectedSentiment = ref('all');
const minImpactScore = ref(50);

// Bot Configuration
const botName = ref(`NewsScalp_${generateRandomString(6)}`);
const tradingPair = ref('BTC/USDT');
const strategyMode = ref('aggressive');
const tradeSize = ref(100);
const maxConcurrentTrades = ref(3);

// News Triggers
const sentimentThreshold = ref(70);
const impactThreshold = ref(60);
const selectedSources = ref(['CoinDesk', 'Cointelegraph', 'Twitter']);
const watchKeywords = ref('partnership, adoption, regulation, hack, upgrade');
const autoTrade = ref(false);
const requireManualConfirm = ref(true);
const onlyHighImpact = ref(true);

// Risk Management
const stopLossPercent = ref(2);
const takeProfitPercent = ref(5);
const maxDailyLoss = ref(500);
const tradeTimeout = ref(15);
const useTrailingStop = ref(false);
const trailingStopPercent = ref(1);

// AI Settings
const aiModel = ref('groq-llama-3.3-70b');
const aiConfidenceThreshold = ref(75);
const aiFeatures = ref({
  sentimentAnalysis: true,
  entityRecognition: true,
  trendPrediction: true,
  fakeNewsDetection: true,
  correlationAnalysis: false
});

// Other
const creating = ref(false);
const currentExchange = ref(app.getUserSelectedExchange || 'LCX');

// Signals & Stats
const activeSignals = ref([]);
const botStats = ref({
  totalTrades: 0,
  winRate: 0,
  totalPnl: 0,
  avgTrade: 0
});
const recentTrades = ref([]);

// Sentiment Stats
const overallSentiment = ref(65);
const sentimentStats = ref({
  bullish: 45,
  neutral: 35,
  bearish: 20
});
const trendingCoins = ref([]);

// Options
const newsSourceOptions = [
  { label: 'All Sources', value: 'all' },
  { label: 'CoinDesk', value: 'coindesk' },
  { label: 'Cointelegraph', value: 'cointelegraph' },
  { label: 'Twitter/X', value: 'twitter' },
  { label: 'Reddit', value: 'reddit' },
  { label: 'Bloomberg', value: 'bloomberg' }
];

const sentimentFilterOptions = [
  { label: 'All Sentiments', value: 'all' },
  { label: 'Bullish', value: 'bullish' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Bearish', value: 'bearish' }
];

const tradingPairOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'LCX/USDT', value: 'LCX/USDT' },
  { label: 'SOL/USDT', value: 'SOL/USDT' },
  { label: 'XRP/USDT', value: 'XRP/USDT' }
];

const strategyModeOptions = [
  { label: 'Aggressive (Fast Entry/Exit)', value: 'aggressive' },
  { label: 'Moderate (Balanced)', value: 'moderate' },
  { label: 'Conservative (High Confidence Only)', value: 'conservative' }
];

const allNewsSourceOptions = [
  { label: 'CoinDesk', value: 'CoinDesk' },
  { label: 'Cointelegraph', value: 'Cointelegraph' },
  { label: 'Twitter/X', value: 'Twitter' },
  { label: 'Reddit', value: 'Reddit' },
  { label: 'Bloomberg Crypto', value: 'Bloomberg' },
  { label: 'CryptoSlate', value: 'CryptoSlate' },
  { label: 'The Block', value: 'TheBlock' }
];

const aiModelOptions = [
  { label: 'Groq Llama 3.3 70B (Fast & Free)', value: 'groq-llama-3.3-70b' },
  { label: 'GPT-4 (Premium)', value: 'gpt-4' },
  { label: 'Claude Sonnet (Balanced)', value: 'claude-sonnet' }
];

const sentimentMarks = {
  '-100': 'Very Bearish',
  '-50': 'Bearish',
  '0': 'Neutral',
  '50': 'Bullish',
  '100': 'Very Bullish'
};

// Computed
const filteredNewsItems = computed(() => {
  let items = newsItems.value;

  if (selectedNewsSource.value !== 'all') {
    items = items.filter(item => item.source.toLowerCase() === selectedNewsSource.value);
  }

  if (selectedSentiment.value !== 'all') {
    items = items.filter(item => item.sentiment.toLowerCase() === selectedSentiment.value);
  }

  items = items.filter(item => item.impactScore >= minImpactScore.value);

  return items.slice(0, 20); // Limit to 20 items
});

// Methods
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function getSourceIcon(source) {
  const icons = {
    'CoinDesk': '📰',
    'Cointelegraph': '📡',
    'Twitter': '🐦',
    'Reddit': '🔴',
    'Bloomberg': '💼',
    'CryptoSlate': '📊',
    'TheBlock': '🧱'
  };
  return icons[source] || '📰';
}

function getSentimentType(sentiment) {
  if (sentiment === 'bullish') return 'success';
  if (sentiment === 'bearish') return 'error';
  return 'warning';
}

function getImpactType(score) {
  if (score >= 80) return 'error'; // High impact
  if (score >= 60) return 'warning';
  return 'info';
}

function getSentimentColor(value) {
  if (value >= 70) return '#10eb04';
  if (value >= 40) return '#ffa500';
  return '#ff3b30';
}

function getSentimentEmoji(value) {
  if (value >= 70) return '🚀';
  if (value >= 40) return '😐';
  return '📉';
}

function getSentimentLabel(value) {
  if (value >= 70) return 'Bullish';
  if (value >= 40) return 'Neutral';
  return 'Bearish';
}

function selectNews(item) {
  selectedNews.value = item;
}

async function createBot() {
  creating.value = true;

  try {
    const data = {
      userID: userID.value,
      name: botName.value,
      exchange: currentExchange.value,
      tradingPair: tradingPair.value,
      strategyMode: strategyMode.value,
      tradeSize: tradeSize.value,
      maxConcurrentTrades: maxConcurrentTrades.value,
      sentimentThreshold: sentimentThreshold.value,
      impactThreshold: impactThreshold.value,
      selectedSources: selectedSources.value,
      watchKeywords: watchKeywords.value,
      autoTrade: autoTrade.value,
      stopLossPercent: stopLossPercent.value,
      takeProfitPercent: takeProfitPercent.value,
      aiModel: aiModel.value,
      aiConfidenceThreshold: aiConfidenceThreshold.value,
      aiFeatures: aiFeatures.value
    };

    // TODO: Create API endpoint for news bot
    message.success(`News Scalping Bot created: ${botName.value}`);
    console.log('News Bot Config:', data);

    // Generate new bot name
    botName.value = `NewsScalp_${generateRandomString(6)}`;
  } catch (error) {
    message.error('Failed to create bot: ' + error.message);
    console.error('Error creating bot:', error);
  } finally {
    creating.value = false;
  }
}

function savePreset() {
  message.success('Configuration saved as preset!');
}

function executeSignal(signal) {
  message.info(`Executing ${signal.action} signal for ${signal.pair}...`);
}

// Simulate live news feed
function simulateNewsFeed() {
  const mockNews = [
    {
      id: Date.now(),
      source: 'CoinDesk',
      title: 'Bitcoin ETF approval expected next week, analysts predict',
      sentiment: 'bullish',
      impactScore: 85,
      mentionedCoins: ['BTC', 'ETH'],
      timestamp: Date.now(),
      signal: {
        action: 'BUY',
        confidence: 87
      }
    },
    {
      id: Date.now() + 1,
      source: 'Twitter',
      title: 'Major exchange announces XRP listing after regulatory clarity',
      sentiment: 'bullish',
      impactScore: 75,
      mentionedCoins: ['XRP'],
      timestamp: Date.now() - 120000,
      signal: {
        action: 'BUY',
        confidence: 72
      }
    },
    {
      id: Date.now() + 2,
      source: 'Bloomberg',
      title: 'SEC increases scrutiny on DeFi protocols, new regulations proposed',
      sentiment: 'bearish',
      impactScore: 65,
      mentionedCoins: ['ETH', 'UNI', 'AAVE'],
      timestamp: Date.now() - 300000,
      signal: {
        action: 'SELL',
        confidence: 68
      }
    }
  ];

  newsItems.value = mockNews;

  // Update trending coins
  trendingCoins.value = [
    { symbol: 'BTC', mentions: 45, avgSentiment: 75 },
    { symbol: 'ETH', mentions: 32, avgSentiment: -15 },
    { symbol: 'XRP', mentions: 28, avgSentiment: 82 },
    { symbol: 'SOL', mentions: 18, avgSentiment: 45 },
    { symbol: 'ADA', mentions: 12, avgSentiment: -8 }
  ];

  // Update active signals
  activeSignals.value = [
    {
      id: 1,
      action: 'BUY',
      pair: 'BTC/USDT',
      reason: 'Strong bullish news: ETF approval imminent',
      entryPrice: '$67,250',
      targetPrice: '$70,500',
      stopLoss: '$66,000',
      confidence: 87,
      timestamp: Date.now() - 60000,
      executed: false
    },
    {
      id: 2,
      action: 'BUY',
      pair: 'XRP/USDT',
      reason: 'Major exchange listing + regulatory clarity',
      entryPrice: '$0.58',
      targetPrice: '$0.62',
      stopLoss: '$0.56',
      confidence: 72,
      timestamp: Date.now() - 180000,
      executed: false
    }
  ];
}

onMounted(async () => {
  await app.loadUserExchangeData(userID.value);

  // Simulate news feed
  simulateNewsFeed();

  // Update news every 30 seconds (in production, use WebSocket)
  const newsInterval = setInterval(simulateNewsFeed, 30000);

  onUnmounted(() => {
    clearInterval(newsInterval);
  });
});
</script>

<style scoped>
.news-scalping-page {
  padding: 0;
  background: #0f1419;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* NEWS BOTS NAVIGATION */
.news-bots-nav {
  background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);
  border-bottom: 2px solid #f55036;
  padding: 8px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(245, 80, 54, 0.3);
}

.nav-tabs-container {
  display: flex;
  gap: 6px;
  min-width: fit-content;
}

.news-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  position: relative;
}

.news-tab-btn:hover {
  background: rgba(245, 80, 54, 0.2);
  border-color: rgba(245, 80, 54, 0.5);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 80, 54, 0.3);
}

.news-tab-btn.active {
  background: linear-gradient(135deg, #f55036 0%, #ff6b52 100%);
  border-color: #f55036;
  color: #fff;
  box-shadow: 0 4px 16px rgba(245, 80, 54, 0.5);
  transform: translateY(-2px);
}

.news-tab-btn .tab-icon {
  font-size: 14px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
}

.news-tab-btn .tab-name {
  letter-spacing: 0.3px;
}

.status-badge {
  font-size: 8px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #10eb04;
  color: #000;
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-badge.coming {
  background: rgba(255, 165, 0, 0.3);
  color: #ffa500;
  border: 1px solid #ffa500;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(16, 235, 4, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(16, 235, 4, 0.8);
  }
}

/* Scrollbar for news tabs */
.news-bots-nav::-webkit-scrollbar {
  height: 6px;
}

.news-bots-nav::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.news-bots-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #f55036 0%, #ff6b52 100%);
  border-radius: 10px;
}

.news-bots-nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #ff6b52 0%, #f55036 100%);
}

/* MAIN GRID LAYOUT */
.news-grid-layout {
  display: grid;
  grid-template-columns: 350px 1fr 320px;
  gap: 12px;
  padding: 12px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 1400px) {
  .news-grid-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
}

/* COLUMNS */
.left-column,
.center-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

/* CARDS */
.news-feed-card,
.sentiment-card,
.config-card,
.signals-card,
.stats-card {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* NEWS FILTERS */
.news-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

/* NEWS ITEMS LIST */
.news-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.no-news {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-news-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.news-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid;
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-item:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: translateX(4px);
}

.news-item.sentiment-bullish {
  border-color: #10eb04;
}

.news-item.sentiment-neutral {
  border-color: #ffa500;
}

.news-item.sentiment-bearish {
  border-color: #ff3b30;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.news-source {
  display: flex;
  align-items: center;
  gap: 6px;
}

.source-icon {
  font-size: 14px;
}

.source-name {
  font-size: 10px;
  color: #888;
  font-weight: 600;
}

.news-time {
  font-size: 9px;
  color: #666;
}

.news-title {
  font-size: 12px;
  color: #e0e0e0;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
}

.news-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-label {
  font-size: 10px;
  color: #888;
  min-width: 70px;
}

.mentioned-coins {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.news-signal {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  margin-top: 8px;
}

.signal-icon {
  font-size: 16px;
}

.signal-action {
  font-size: 11px;
  font-weight: 700;
  color: #667eea;
}

.signal-confidence {
  font-size: 10px;
  color: #888;
}

/* SENTIMENT OVERVIEW */
.sentiment-overview {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.sentiment-gauge {
  flex-shrink: 0;
}

.gauge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.gauge-emoji {
  font-size: 24px;
}

.gauge-label {
  font-size: 11px;
  font-weight: 600;
  color: #e0e0e0;
}

.sentiment-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.breakdown-label {
  font-size: 11px;
  color: #888;
}

.breakdown-value {
  font-size: 13px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.breakdown-item.bullish .breakdown-value {
  color: #10eb04;
}

.breakdown-item.neutral .breakdown-value {
  color: #ffa500;
}

.breakdown-item.bearish .breakdown-value {
  color: #ff3b30;
}

/* TRENDING COINS */
.trending-coins h4 {
  font-size: 12px;
  color: #e0e0e0;
  margin-bottom: 10px;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.coin-symbol {
  font-size: 11px;
  font-weight: 700;
  color: #667eea;
}

.coin-mentions {
  font-size: 10px;
  color: #888;
}

.coin-sentiment {
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.coin-sentiment.positive {
  color: #10eb04;
}

.coin-sentiment.negative {
  color: #ff3b30;
}

/* CONFIG SECTION */
.config-section {
  padding: 16px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-value {
  font-size: 12px;
  font-weight: 700;
  color: #667eea;
  min-width: 50px;
  text-align: right;
}

/* SIGNALS */
.signals-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-signals {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-signals-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.signal-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid;
}

.signal-item.buy {
  border-color: #10eb04;
}

.signal-item.sell {
  border-color: #ff3b30;
}

.signal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.signal-item .signal-icon {
  font-size: 18px;
}

.signal-item .signal-action {
  flex: 1;
  font-size: 12px;
  font-weight: 700;
  color: #e0e0e0;
}

.signal-pair {
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 6px;
}

.signal-reason {
  font-size: 11px;
  color: #888;
  margin-bottom: 10px;
  line-height: 1.4;
}

.signal-metrics {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  margin-bottom: 8px;
}

.signal-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
}

.signal-metric span {
  color: #666;
}

.signal-metric strong {
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: #e0e0e0;
}

.signal-metric .target {
  color: #10eb04;
}

.signal-metric .stop {
  color: #ff3b30;
}

.signal-time {
  font-size: 9px;
  color: #666;
  margin-bottom: 8px;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #e0e0e0;
}

.stat-value.success {
  color: #10eb04;
}

.stat-value.error {
  color: #ff3b30;
}

/* RECENT TRADES */
.recent-trades h4 {
  font-size: 12px;
  color: #e0e0e0;
  margin-bottom: 10px;
}

.trades-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-trades {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 11px;
}

.trade-item {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.trade-type {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.trade-type.buy {
  background: rgba(16, 235, 4, 0.2);
  color: #10eb04;
}

.trade-type.sell {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.trade-pair {
  font-size: 11px;
  color: #888;
}

.trade-pnl {
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.trade-pnl.profit {
  color: #10eb04;
}

.trade-pnl.loss {
  color: #ff3b30;
}

.trade-news {
  font-size: 10px;
  color: #888;
  margin-bottom: 4px;
}

.trade-time {
  font-size: 9px;
  color: #666;
}

/* SCROLLBARS */
.news-items-list::-webkit-scrollbar,
.left-column::-webkit-scrollbar,
.center-column::-webkit-scrollbar,
.right-column::-webkit-scrollbar {
  width: 6px;
}

.news-items-list::-webkit-scrollbar-track,
.left-column::-webkit-scrollbar-track,
.center-column::-webkit-scrollbar-track,
.right-column::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.news-items-list::-webkit-scrollbar-thumb,
.left-column::-webkit-scrollbar-thumb,
.center-column::-webkit-scrollbar-thumb,
.right-column::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}
</style>
