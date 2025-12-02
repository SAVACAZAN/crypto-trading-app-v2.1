<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #8a2be2;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">💭</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #8a2be2; font-weight: 700;">SENTIMENT ANALYSIS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">{{ selectedAsset }} • Overall: {{ overallSentiment }}</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <n-button size="small" @click="refreshData" style="background: rgba(138,43,226,0.1); border: 1px solid rgba(138,43,226,0.3); color: #8a2be2;">
            Refresh
          </n-button>
        </div>
      </div>
    </div>

    <!-- Overall Sentiment Score -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 20px; border-radius: 8px; margin-bottom: 15px; text-align: center;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px;">OVERALL MARKET SENTIMENT</div>

      <div style="display: flex; justify-content: center; align-items: center; gap: 30px;">
        <!-- Sentiment Gauge -->
        <div style="position: relative; width: 200px; height: 200px;">
          <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
            <!-- Background Arc -->
            <path d="M 30 170 A 85 85 0 0 1 170 170" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="20" stroke-linecap="round"/>
            <!-- Colored Arc -->
            <path :d="getSentimentArc()" fill="none" :stroke="getSentimentColor(sentimentScore)" stroke-width="20" stroke-linecap="round"/>
            <!-- Center Circle -->
            <circle cx="100" cy="100" r="60" :fill="getSentimentColor(sentimentScore)" opacity="0.2"/>
          </svg>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
            <div :style="`font-size: 36px; font-weight: 700; color: ${getSentimentColor(sentimentScore)};`">
              {{ sentimentScore }}
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 5px;">Sentiment Score</div>
          </div>
        </div>

        <!-- Sentiment Details -->
        <div style="text-align: left;">
          <div style="margin-bottom: 12px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SENTIMENT LEVEL</div>
            <div :style="`font-size: 18px; font-weight: 700; color: ${getSentimentColor(sentimentScore)};`">
              {{ overallSentiment }}
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">TREND</div>
            <div :style="`font-size: 14px; font-weight: 700; color: ${sentimentTrend > 0 ? '#10eb04' : '#f52a09'};`">
              {{ sentimentTrend > 0 ? '↑' : '↓' }} {{ Math.abs(sentimentTrend) }}% (24h)
            </div>
          </div>
          <div>
            <div style="color: #888; font-size: 10px; margin-bottom: 4px;">SOURCES ANALYZED</div>
            <div style="font-size: 14px; color: #8a2be2; font-weight: 700;">{{ totalSources.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Selector -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Asset</div>
        <n-select v-model:value="selectedAsset" :options="assetOptions" size="small" @update:value="refreshData" />
      </div>
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 6px;">Timeframe</div>
        <n-select v-model:value="timeframe" :options="timeframeOptions" size="small" @update:value="refreshData" />
      </div>
    </div>

    <!-- Sentiment Breakdown -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">

      <!-- Social Media Sentiment -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📱</span>
          <span>SOCIAL MEDIA</span>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 15px;">
          <div style="position: relative; width: 120px; height: 120px;">
            <svg viewBox="0 0 120 120" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="15"/>
              <circle cx="60" cy="60" r="50" fill="none" :stroke="getSentimentColor(socialSentiment.score)" stroke-width="15"
                :stroke-dasharray="`${(socialSentiment.score / 100) * 314} 314`" stroke-linecap="round"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div :style="`font-size: 24px; font-weight: 700; color: ${getSentimentColor(socialSentiment.score)};`">
                {{ socialSentiment.score }}
              </div>
            </div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
            <div>
              <div style="color: #10eb04; font-size: 16px; font-weight: 700;">{{ socialSentiment.positive }}%</div>
              <div style="color: #888; font-size: 9px;">Positive</div>
            </div>
            <div>
              <div style="color: #f5a623; font-size: 16px; font-weight: 700;">{{ socialSentiment.neutral }}%</div>
              <div style="color: #888; font-size: 9px;">Neutral</div>
            </div>
            <div>
              <div style="color: #f52a09; font-size: 16px; font-weight: 700;">{{ socialSentiment.negative }}%</div>
              <div style="color: #888; font-size: 9px;">Negative</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="color: #888; font-size: 9px;">Posts (24h)</div>
            <div style="color: #00d4ff; font-size: 13px; font-weight: 700;">{{ socialSentiment.posts.toLocaleString() }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="color: #888; font-size: 9px;">Engagement</div>
            <div style="color: #8a2be2; font-size: 13px; font-weight: 700;">{{ socialSentiment.engagement }}</div>
          </div>
        </div>
      </div>

      <!-- News Sentiment -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📰</span>
          <span>NEWS MEDIA</span>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 15px;">
          <div style="position: relative; width: 120px; height: 120px;">
            <svg viewBox="0 0 120 120" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="15"/>
              <circle cx="60" cy="60" r="50" fill="none" :stroke="getSentimentColor(newsSentiment.score)" stroke-width="15"
                :stroke-dasharray="`${(newsSentiment.score / 100) * 314} 314`" stroke-linecap="round"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div :style="`font-size: 24px; font-weight: 700; color: ${getSentimentColor(newsSentiment.score)};`">
                {{ newsSentiment.score }}
              </div>
            </div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
            <div>
              <div style="color: #10eb04; font-size: 16px; font-weight: 700;">{{ newsSentiment.positive }}%</div>
              <div style="color: #888; font-size: 9px;">Positive</div>
            </div>
            <div>
              <div style="color: #f5a623; font-size: 16px; font-weight: 700;">{{ newsSentiment.neutral }}%</div>
              <div style="color: #888; font-size: 9px;">Neutral</div>
            </div>
            <div>
              <div style="color: #f52a09; font-size: 16px; font-weight: 700;">{{ newsSentiment.negative }}%</div>
              <div style="color: #888; font-size: 9px;">Negative</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="color: #888; font-size: 9px;">Articles (24h)</div>
            <div style="color: #00d4ff; font-size: 13px; font-weight: 700;">{{ newsSentiment.articles.toLocaleString() }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="color: #888; font-size: 9px;">Sources</div>
            <div style="color: #8a2be2; font-size: 13px; font-weight: 700;">{{ newsSentiment.sources }}</div>
          </div>
        </div>
      </div>

      <!-- Fear & Greed Index -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>😱</span>
          <span>FEAR & GREED</span>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 15px;">
          <div style="position: relative; width: 120px; height: 120px;">
            <svg viewBox="0 0 120 120" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="15"/>
              <circle cx="60" cy="60" r="50" fill="none" :stroke="getFearGreedColor(fearGreedIndex.value)" stroke-width="15"
                :stroke-dasharray="`${(fearGreedIndex.value / 100) * 314} 314`" stroke-linecap="round"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div :style="`font-size: 24px; font-weight: 700; color: ${getFearGreedColor(fearGreedIndex.value)};`">
                {{ fearGreedIndex.value }}
              </div>
            </div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 10px; text-align: center;">
          <div :style="`font-size: 16px; font-weight: 700; color: ${getFearGreedColor(fearGreedIndex.value)};`">
            {{ fearGreedIndex.label }}
          </div>
          <div style="color: #888; font-size: 9px; margin-top: 4px;">
            {{ fearGreedIndex.change > 0 ? '↑' : '↓' }} {{ Math.abs(fearGreedIndex.change) }} from yesterday
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="color: #888; font-size: 9px;">Classification</div>
            <div style="color: #fff; font-size: 11px; font-weight: 700;">{{ fearGreedIndex.classification }}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Trending Topics & Keywords -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>🔥</span>
        <span>TRENDING TOPICS & KEYWORDS</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
        <div v-for="topic in trendingTopics" :key="topic.keyword"
          style="background: rgba(0,0,0,0.3); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px; cursor: pointer; transition: all 0.3s;"
          :style="hoveredTopic === topic.keyword ? 'border-color: #8a2be2; background: rgba(138,43,226,0.1);' : ''"
          @mouseenter="hoveredTopic = topic.keyword"
          @mouseleave="hoveredTopic = null">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div style="color: #fff; font-size: 13px; font-weight: 700;">{{ topic.keyword }}</div>
            <div :style="`font-size: 11px; font-weight: 700; color: ${getSentimentColor(topic.sentiment)};`">
              {{ topic.sentiment > 50 ? '↑' : '↓' }} {{ topic.sentiment }}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #888; font-size: 10px;">{{ topic.mentions.toLocaleString() }} mentions</div>
            <div :style="`font-size: 10px; font-weight: 700; color: ${topic.trending ? '#10eb04' : '#666'};`">
              {{ topic.trending ? '🔥 Trending' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sentiment History Chart -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>📈</span>
        <span>SENTIMENT HISTORY (7 DAYS)</span>
      </div>

      <div style="height: 200px; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 15px; position: relative;">
        <svg viewBox="0 0 800 150" style="width: 100%; height: 100%;">
          <!-- Grid Lines -->
          <line v-for="i in 5" :key="`grid-${i}`" :y1="i * 30" :y2="i * 30" x1="0" x2="800" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

          <!-- Sentiment Line -->
          <polyline :points="sentimentHistoryPoints" fill="none" stroke="#8a2be2" stroke-width="2"/>

          <!-- Data Points -->
          <circle v-for="(point, index) in sentimentHistory" :key="`point-${index}`"
            :cx="(index / (sentimentHistory.length - 1)) * 800"
            :cy="150 - (point.value / 100) * 150"
            r="4" :fill="getSentimentColor(point.value)"/>
        </svg>

        <!-- X-axis Labels -->
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <div v-for="(point, index) in sentimentHistory" :key="`label-${index}`" style="color: #888; font-size: 9px;">
            {{ point.date }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sentiment Sources -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(138,43,226,0.3); padding: 15px; border-radius: 8px;">
      <div style="color: #8a2be2; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>📊</span>
          <span>SENTIMENT SOURCES</span>
        </div>
        <div style="color: #888; font-size: 11px;">{{ sentimentSources.length }} sources</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div v-for="source in sentimentSources" :key="source.name"
          style="background: rgba(0,0,0,0.3); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px;">
          <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
            <div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ source.name }}</div>
              <div style="color: #888; font-size: 9px;">{{ source.type }}</div>
            </div>
          </div>
          <div style="height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div :style="`width: ${source.score}%; height: 100%; background: ${getSentimentColor(source.score)};`"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #888; font-size: 9px;">Score: {{ source.score }}</div>
            <div style="color: #888; font-size: 9px;">{{ source.samples.toLocaleString() }} samples</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

// State
const selectedAsset = ref('BTC');
const timeframe = ref('24h');
const hoveredTopic = ref(null);

// Options
const assetOptions = [
  { label: 'Bitcoin (BTC)', value: 'BTC' },
  { label: 'Ethereum (ETH)', value: 'ETH' },
  { label: 'BNB', value: 'BNB' },
  { label: 'Solana (SOL)', value: 'SOL' },
  { label: 'Cardano (ADA)', value: 'ADA' }
];

const timeframeOptions = [
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' }
];

// Data
const sentimentScore = ref(72);
const sentimentTrend = ref(8.5);

const socialSentiment = ref({
  score: 68,
  positive: 45,
  neutral: 35,
  negative: 20,
  posts: 125847,
  engagement: 'High'
});

const newsSentiment = ref({
  score: 75,
  positive: 52,
  neutral: 31,
  negative: 17,
  articles: 342,
  sources: 89
});

const fearGreedIndex = ref({
  value: 64,
  label: 'Greed',
  classification: 'Moderate Greed',
  change: 5
});

const trendingTopics = ref([
  { keyword: '#Bitcoin', mentions: 45821, sentiment: 72, trending: true },
  { keyword: 'Halving', mentions: 32145, sentiment: 78, trending: true },
  { keyword: 'ETF', mentions: 28934, sentiment: 65, trending: true },
  { keyword: 'Bullish', mentions: 24567, sentiment: 82, trending: false },
  { keyword: 'HODL', mentions: 19823, sentiment: 70, trending: false },
  { keyword: 'Altseason', mentions: 15234, sentiment: 58, trending: false }
]);

const sentimentHistory = ref([
  { date: 'Mon', value: 58 },
  { date: 'Tue', value: 62 },
  { date: 'Wed', value: 65 },
  { date: 'Thu', value: 68 },
  { date: 'Fri', value: 71 },
  { date: 'Sat', value: 69 },
  { date: 'Sun', value: 72 }
]);

const sentimentSources = ref([
  { name: 'Twitter/X', type: 'Social Media', score: 68, samples: 89234 },
  { name: 'Reddit', type: 'Social Media', score: 71, samples: 45821 },
  { name: 'CoinTelegraph', type: 'News', score: 76, samples: 342 },
  { name: 'CoinDesk', type: 'News', score: 74, samples: 287 },
  { name: 'Telegram', type: 'Social Media', score: 65, samples: 34562 },
  { name: 'Discord', type: 'Social Media', score: 69, samples: 23145 }
]);

// Computed
const overallSentiment = computed(() => {
  const score = sentimentScore.value;
  if (score >= 80) return 'Extreme Greed';
  if (score >= 65) return 'Greed';
  if (score >= 45) return 'Neutral';
  if (score >= 25) return 'Fear';
  return 'Extreme Fear';
});

const totalSources = computed(() => {
  return sentimentSources.value.reduce((sum, s) => sum + s.samples, 0);
});

const sentimentHistoryPoints = computed(() => {
  return sentimentHistory.value
    .map((point, index) => {
      const x = (index / (sentimentHistory.value.length - 1)) * 800;
      const y = 150 - (point.value / 100) * 150;
      return `${x},${y}`;
    })
    .join(' ');
});

// Methods
const getSentimentColor = (score) => {
  if (score >= 80) return '#10eb04';
  if (score >= 65) return '#00d4ff';
  if (score >= 45) return '#f5a623';
  if (score >= 25) return '#ff6b35';
  return '#f52a09';
};

const getFearGreedColor = (value) => {
  if (value >= 75) return '#10eb04';
  if (value >= 55) return '#00d4ff';
  if (value >= 45) return '#f5a623';
  if (value >= 25) return '#ff6b35';
  return '#f52a09';
};

const getSentimentArc = () => {
  const score = sentimentScore.value;
  const angle = (score / 100) * 140; // 140 degrees for the arc
  const startAngle = 200; // Start from bottom left
  const endAngle = startAngle + angle;

  const startX = 100 + 85 * Math.cos((startAngle * Math.PI) / 180);
  const startY = 100 + 85 * Math.sin((startAngle * Math.PI) / 180);
  const endX = 100 + 85 * Math.cos((endAngle * Math.PI) / 180);
  const endY = 100 + 85 * Math.sin((endAngle * Math.PI) / 180);

  return `M ${startX} ${startY} A 85 85 0 ${angle > 70 ? 1 : 0} 1 ${endX} ${endY}`;
};

const refreshData = () => {
  // Simulate data refresh
  sentimentScore.value = 60 + Math.floor(Math.random() * 30);
  sentimentTrend.value = -10 + Math.random() * 20;

  socialSentiment.value.score = 55 + Math.floor(Math.random() * 30);
  newsSentiment.value.score = 60 + Math.floor(Math.random() * 30);
  fearGreedIndex.value.value = 50 + Math.floor(Math.random() * 40);
};

onMounted(() => {
  // Initial data load
});
</script>
