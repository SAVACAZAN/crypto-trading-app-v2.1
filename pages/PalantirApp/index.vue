<template>
  <div style="background: #0a0a0a; min-height: 100%; padding: 0; overflow-y: auto;">
    <!-- Main Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0f3460; position: relative; overflow: hidden;">
      <!-- Animated background effect -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background: radial-gradient(circle at 20% 50%, #00d4ff 0%, transparent 50%), radial-gradient(circle at 80% 50%, #10eb04 0%, transparent 50%);"></div>

      <div style="position: relative; z-index: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 36px;">🎯</div>
            <div>
              <h1 style="margin: 0; font-size: 28px; color: #00d4ff; font-weight: 700; text-shadow: 0 0 10px rgba(0,212,255,0.5);">
                PALANTIR TRADING INTELLIGENCE
              </h1>
              <p style="margin: 5px 0 0 0; color: #888; font-size: 13px;">
                Real-Time Ecosystem Dashboard • All Systems Integrated
              </p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div :style="`width: 12px; height: 12px; background: ${systemStatus.color}; border-radius: 50%; box-shadow: 0 0 10px ${systemStatus.color};`"></div>
            <span :style="`color: ${systemStatus.color}; font-size: 12px; font-weight: 600;`">{{ systemStatus.text }}</span>
          </div>
        </div>

        <!-- Real-Time Stats Bar -->
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
          <nuxt-link to="/PalantirApp/Settings/ApiKeys" style="text-decoration: none; display: block;">
            <div style="background: rgba(0,212,255,0.1); padding: 10px; border-radius: 6px; border: 1px solid #00d4ff; cursor: pointer; transition: all 0.3s ease;">
              <div style="font-size: 10px; color: #888; margin-bottom: 3px;">API KEYS</div>
              <div style="font-size: 20px; color: #00d4ff; font-weight: 700;">{{ liveStats.totalApiKeys }}</div>
              <div style="font-size: 8px; color: #666;">{{ liveStats.activeExchanges }} exchanges</div>
            </div>
          </nuxt-link>
          <div style="background: rgba(16,235,4,0.1); padding: 10px; border-radius: 6px; border: 1px solid #10eb04;">
            <div style="font-size: 10px; color: #888; margin-bottom: 3px;">ACTIVE BOTS</div>
            <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ liveStats.activeBots }}</div>
            <div style="font-size: 8px; color: #666;">Running now</div>
          </div>
          <div style="background: rgba(245,166,35,0.1); padding: 10px; border-radius: 6px; border: 1px solid #f5a623;">
            <div style="font-size: 10px; color: #888; margin-bottom: 3px;">OPEN ORDERS</div>
            <div style="font-size: 20px; color: #f5a623; font-weight: 700;">{{ liveStats.openOrders }}</div>
            <div style="font-size: 8px; color: #666;">Across all bots</div>
          </div>
          <nuxt-link to="/PalantirApp/Risk/PortfolioRisk" style="text-decoration: none; display: block;">
            <div style="background: rgba(138,43,226,0.1); padding: 10px; border-radius: 6px; border: 1px solid #8a2be2; cursor: pointer; transition: all 0.3s ease; hover: {transform: scale(1.02);}">
              <div style="font-size: 10px; color: #888; margin-bottom: 3px;">TOTAL BALANCE</div>
              <div style="font-size: 20px; color: #8a2be2; font-weight: 700;">${{ formatBalance(liveStats.totalBalance) }}</div>
              <div style="font-size: 8px; color: #666;">USD value</div>
            </div>
          </nuxt-link>
          <div style="background: rgba(255,105,180,0.1); padding: 10px; border-radius: 6px; border: 1px solid #ff69b4;">
            <div style="font-size: 10px; color: #888; margin-bottom: 3px;">TOTAL P&L</div>
            <div :style="`font-size: 20px; font-weight: 700; color: ${liveStats.totalPnL >= 0 ? '#10eb04' : '#f52a09'};`">
              {{ liveStats.totalPnL >= 0 ? '+$' : '-$' }}{{ Math.abs(liveStats.totalPnL).toFixed(2) }}
            </div>
            <div style="font-size: 8px; color: #666;">All bots combined</div>
          </div>
          <div style="background: rgba(245,42,9,0.1); padding: 10px; border-radius: 6px; border: 1px solid #f52a09;">
            <div style="font-size: 10px; color: #888; margin-bottom: 3px;">SUCCESS RATE</div>
            <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ liveStats.successRate }}%</div>
            <div style="font-size: 8px; color: #666;">Win rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Activity Feed & Quick Actions -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 20px;">
      <!-- Live Activity Feed -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="color: #00d4ff; font-size: 14px; font-weight: 600;">🔴 LIVE ACTIVITY FEED</div>
            <div style="width: 8px; height: 8px; background: #f52a09; border-radius: 50%; animation: pulse 1s infinite;"></div>
          </div>
          <n-button size="tiny" @click="refreshActivity" style="background: #00d4ff; border: none; font-size: 9px;">
            🔄 REFRESH
          </n-button>
        </div>
        <div style="max-height: 200px; overflow-y: auto;">
          <div v-for="(activity, index) in liveActivity" :key="index"
               :style="`background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; margin-bottom: 6px; border-left: 3px solid ${activity.color};`">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="font-size: 14px;">{{ activity.icon }}</div>
                <div :style="`color: ${activity.color}; font-size: 11px; font-weight: 600;`">{{ activity.type }}</div>
              </div>
              <div style="color: #666; font-size: 9px;">{{ activity.time }}</div>
            </div>
            <div style="color: #ccc; font-size: 10px;">{{ activity.message }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #10eb04; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⚡ QUICK ACTIONS</div>
        <div style="display: grid; gap: 8px;">
          <n-button block size="small" @click="openCreateBot" style="background: #00d4ff; border: none; justify-content: flex-start;">
            <template #icon>
              <span style="font-size: 16px;">🤖</span>
            </template>
            Create New Bot
          </n-button>
          <n-button block size="small" @click="openPatternScanner" style="background: #10eb04; border: none; justify-content: flex-start;">
            <template #icon>
              <span style="font-size: 16px;">🔍</span>
            </template>
            Scan Patterns
          </n-button>
          <n-button block size="small" @click="openBotChainBuilder" style="background: #f5a623; border: none; justify-content: flex-start;">
            <template #icon>
              <span style="font-size: 16px;">⛓️</span>
            </template>
            Build Chain
          </n-button>
          <n-button block size="small" @click="pauseAllBots" style="background: #f52a09; border: none; justify-content: flex-start;">
            <template #icon>
              <span style="font-size: 16px;">⏸</span>
            </template>
            Pause All Bots
          </n-button>
        </div>
      </div>
    </div>

    <!-- Running Bots Overview -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="color: #00d4ff; font-size: 14px; font-weight: 600;">🤖 ACTIVE BOTS ({{ runningBots.length }})</div>
        <NuxtLink to="/PalantirApp/Bots/ActiveBots" style="text-decoration: none;">
          <n-button size="tiny" style="background: #00d4ff; border: none; font-size: 9px;">
            VIEW ALL
          </n-button>
        </NuxtLink>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div v-for="bot in runningBots.slice(0, 4)" :key="bot.id"
             style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 2px solid #10eb04;">
          <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
              <div style="font-size: 16px;">{{ bot.icon }}</div>
              <div style="color: #00d4ff; font-size: 11px; font-weight: 600;">{{ bot.name }}</div>
            </div>
            <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 9px;">
            <div>
              <div style="color: #888;">P&L</div>
              <div :style="`color: ${bot.pnl >= 0 ? '#10eb04' : '#f52a09'}; font-weight: 600;`">
                {{ bot.pnl >= 0 ? '+' : '' }}{{ bot.pnl }}%
              </div>
            </div>
            <div>
              <div style="color: #888;">Orders</div>
              <div style="color: #f5a623; font-weight: 600;">{{ bot.orders }}/{{ bot.totalOrders }}</div>
            </div>
          </div>
          <div style="color: #666; font-size: 8px; margin-top: 6px;">Runtime: {{ bot.runtime }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Patterns & Market Signals -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <!-- Recent Patterns -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="color: #10eb04; font-size: 14px; font-weight: 600;">🔍 RECENT PATTERNS</div>
          <NuxtLink to="/PalantirApp/PatternRecognition" style="text-decoration: none;">
            <n-button size="tiny" style="background: #10eb04; border: none; font-size: 9px;">
              VIEW ALL
            </n-button>
          </NuxtLink>
        </div>
        <div style="max-height: 180px; overflow-y: auto;">
          <div v-for="pattern in recentPatterns" :key="pattern.id"
               style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #10eb04;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 14px;">{{ pattern.icon }}</div>
                <div style="color: #10eb04; font-size: 11px; font-weight: 600;">{{ pattern.type }}</div>
                <div :style="`background: ${getSignalColor(pattern.signal)}; padding: 2px 6px; border-radius: 3px; font-size: 8px; color: #000; font-weight: 600;`">
                  {{ pattern.signal }}
                </div>
              </div>
              <div style="color: #666; font-size: 9px;">{{ pattern.time }}</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="color: #00d4ff; font-size: 10px; font-weight: 600;">{{ pattern.symbol }}</div>
              <div style="color: #f5a623; font-size: 10px;">{{ pattern.timeframe }} • {{ pattern.confidence }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Bot Chains -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="color: #8a2be2; font-size: 14px; font-weight: 600;">⛓️ ACTIVE CHAINS</div>
          <NuxtLink to="/PalantirApp/BotChains" style="text-decoration: none;">
            <n-button size="tiny" style="background: #8a2be2; border: none; font-size: 9px;">
              MANAGE
            </n-button>
          </NuxtLink>
        </div>
        <div style="max-height: 180px; overflow-y: auto;">
          <div v-for="chain in activeChains" :key="chain.id"
               style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #8a2be2;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 14px;">⛓️</div>
                <div style="color: #8a2be2; font-size: 11px; font-weight: 600;">{{ chain.name }}</div>
              </div>
              <div style="width: 6px; height: 6px; background: #10eb04; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="color: #888; font-size: 9px;">{{ chain.steps }} steps • {{ chain.triggers }} triggers</div>
              <div style="color: #10eb04; font-size: 9px; font-weight: 600;">{{ chain.executions }} executions</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Categories -->
    <div style="margin-bottom: 20px;">
      <div style="color: #00d4ff; font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 5px;">🌟 CORE FEATURES</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <NuxtLink v-for="page in corePages" :key="page.path" :to="page.path" style="text-decoration: none;">
          <div class="feature-card" :style="`background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); border: 2px solid ${page.color}; cursor: pointer; transition: all 0.3s; height: 100%; padding: 20px; border-radius: 8px;`">
            <div style="font-size: 36px; margin-bottom: 10px;">{{ page.icon }}</div>
            <h2 :style="`color: ${page.color}; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;`">
              {{ page.title }}
            </h2>
            <p style="color: #aaa; font-size: 11px; line-height: 1.5; margin: 0;">
              {{ page.desc }}
            </p>
            <div v-if="page.liveCount" style="margin-top: 10px; padding: 6px; background: rgba(0,212,255,0.1); border-radius: 4px;">
              <div style="font-size: 9px; color: #888;">ACTIVE NOW</div>
              <div style="color: #00d4ff; font-size: 16px; font-weight: 700;">{{ page.liveCount }}</div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Bot Management -->
    <div style="margin-bottom: 20px;">
      <div style="color: #10eb04; font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 5px;">🤖 BOT MANAGEMENT</div>
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;">
        <NuxtLink v-for="page in botPages" :key="page.path" :to="page.path" style="text-decoration: none;">
          <div class="mini-card" :style="`background: rgba(15,52,96,0.3); border: 1px solid ${page.color}; cursor: pointer; transition: all 0.3s; padding: 12px; border-radius: 6px; text-align: center;`">
            <div style="font-size: 24px; margin-bottom: 6px;">{{ page.icon }}</div>
            <div :style="`color: ${page.color}; font-size: 11px; font-weight: 600; margin-bottom: 3px;`">{{ page.title }}</div>
            <div style="color: #666; font-size: 9px;">{{ page.desc }}</div>
            <div v-if="page.badge" :style="`margin-top: 6px; background: ${page.color}20; color: ${page.color}; font-size: 9px; padding: 3px 6px; border-radius: 3px; font-weight: 600;`">
              {{ page.badge }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Analytics -->
    <div style="margin-bottom: 20px;">
      <div style="color: #f5a623; font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 5px;">📊 ANALYTICS</div>
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;">
        <NuxtLink v-for="page in analyticsPages" :key="page.path" :to="page.path" style="text-decoration: none;">
          <div class="mini-card" :style="`background: rgba(15,52,96,0.3); border: 1px solid ${page.color}; cursor: pointer; transition: all 0.3s; padding: 12px; border-radius: 6px; text-align: center;`">
            <div style="font-size: 24px; margin-bottom: 6px;">{{ page.icon }}</div>
            <div :style="`color: ${page.color}; font-size: 11px; font-weight: 600; margin-bottom: 3px;`">{{ page.title }}</div>
            <div style="color: #666; font-size: 9px;">{{ page.desc }}</div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Risk Management -->
    <div style="margin-bottom: 20px;">
      <div style="color: #f52a09; font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 5px;">⚠️ RISK MANAGEMENT</div>
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
        <NuxtLink v-for="page in riskPages" :key="page.path" :to="page.path" style="text-decoration: none;">
          <div class="mini-card" :style="`background: rgba(15,52,96,0.3); border: 1px solid ${page.color}; cursor: pointer; transition: all 0.3s; padding: 12px; border-radius: 6px; text-align: center;`">
            <div style="font-size: 24px; margin-bottom: 6px;">{{ page.icon }}</div>
            <div :style="`color: ${page.color}; font-size: 11px; font-weight: 600; margin-bottom: 3px;`">{{ page.title }}</div>
            <div style="color: #666; font-size: 9px;">{{ page.desc }}</div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Automation & Reports -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <!-- Automation -->
      <div>
        <div style="color: #00d4ff; font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 5px;">⚙️ AUTOMATION</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <NuxtLink v-for="page in automationPages" :key="page.path" :to="page.path" style="text-decoration: none;">
            <div class="mini-card" :style="`background: rgba(15,52,96,0.3); border: 1px solid ${page.color}; cursor: pointer; transition: all 0.3s; padding: 12px; border-radius: 6px; text-align: center;`">
              <div style="font-size: 24px; margin-bottom: 6px;">{{ page.icon }}</div>
              <div :style="`color: ${page.color}; font-size: 11px; font-weight: 600; margin-bottom: 3px;`">{{ page.title }}</div>
              <div style="color: #666; font-size: 9px;">{{ page.desc }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Reports -->
      <div>
        <div style="color: #8a2be2; font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 5px;">📈 INSIGHTS</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <NuxtLink v-for="page in reportsPages" :key="page.path" :to="page.path" style="text-decoration: none;">
            <div class="mini-card" :style="`background: rgba(15,52,96,0.3); border: 1px solid ${page.color}; cursor: pointer; transition: all 0.3s; padding: 12px; border-radius: 6px; text-align: center;`">
              <div style="font-size: 24px; margin-bottom: 6px;">{{ page.icon }}</div>
              <div :style="`color: ${page.color}; font-size: 11px; font-weight: 600; margin-bottom: 3px;`">{{ page.title }}</div>
              <div style="color: #666; font-size: 9px;">{{ page.desc }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- System Status Footer -->
    <div style="background: rgba(15,52,96,0.3); padding: 15px; border-radius: 8px; border: 1px solid #0f3460;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="width: 12px; height: 12px; background: #10eb04; border-radius: 50%; box-shadow: 0 0 10px rgba(16,235,4,0.5); animation: pulse 2s infinite;"></div>
          <span style="color: #10eb04; font-size: 13px; font-weight: 600;">PALANTIR ENGINE ONLINE</span>
          <span style="color: #666; font-size: 11px;">|</span>
          <span style="color: #888; font-size: 11px;">{{ liveStats.activeBots }} Bots • {{ liveStats.patternsDetected }} Patterns • {{ liveStats.activeChains }} Chains</span>
          <span style="color: #666; font-size: 11px;">|</span>
          <span style="color: #888; font-size: 11px;">MongoDB Connected • Pattern Engine Active</span>
        </div>
        <div style="color: #666; font-size: 11px;">
          v2.0.0 • {{ currentTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

const palantir = usePalantirStore();

// System Status
const systemStatus = computed(() => {
  if (liveStats.value.activeBots > 0 && liveStats.value.patternsDetected > 0) {
    return { color: '#10eb04', text: 'ALL SYSTEMS ACTIVE' };
  } else if (liveStats.value.activeBots > 0 || liveStats.value.patternsDetected > 0) {
    return { color: '#f5a623', text: 'PARTIAL OPERATION' };
  }
  return { color: '#666', text: 'STANDBY MODE' };
});

// Live Stats - REAL DATA from MongoDB
const liveStats = ref({
  activeBots: 0,
  patternsDetected: 0,
  openOrders: 0,
  activeChains: 0,
  totalPnL: 0,
  successRate: 0,
  totalApiKeys: 0,
  activeExchanges: 0,
  totalBalance: 0
});

// Live Activity Feed - REAL DATA
const liveActivity = ref([]);

// Running Bots - REAL DATA
const runningBots = ref([]);

// Recent Patterns - REAL DATA
const recentPatterns = ref([]);

// Active Chains - REAL DATA
const activeChains = ref([]);

const currentTime = ref('');

// API Keys & Exchange Sync
const app = useAppStore();
const userID = useCookie('userID');
const availableExchanges = ref([]);
const availableMarkets = ref([]);
const availableApiKeys = ref([]);
const selectedExchange = ref('coinbaseadvanced');
const selectedMarket = ref('LCX/USDC');
const selectedApiKeys = ref([]);
const showApiKeyDropdown = ref(false);

// Live prices from ticker-bar (synced via store)
const livePrice = computed(() => app.getCurrentPrice);
const btcPrice = computed(() => app.getBtcPrice);
const ethPrice = computed(() => app.getEthPrice);

// API Key Synchronization Functions
async function refreshApiKeys() {
  try {
    // Fetch user exchanges and API keys from MongoDB
    const response = await $fetch('/api/v1/fetchUserExchanges', {
      query: { userID: userID.value }
    });

    if (response && response.data) {
      // Populate availableExchanges
      availableExchanges.value = response.data.map(ex => ({
        value: ex.exchange,
        label: ex.exchange.toUpperCase()
      }));

      // Find current exchange data
      const currentExchange = response.data.find(ex => ex.exchange === selectedExchange.value);

      if (currentExchange) {
        // Populate availableMarkets for selected exchange
        if (currentExchange.selectedMarket) {
          availableMarkets.value = [
            {
              value: `${currentExchange.selectedMarket.base}/${currentExchange.selectedMarket.quote}`,
              label: `${currentExchange.selectedMarket.base}/${currentExchange.selectedMarket.quote}`
            }
          ];
        }

        // Populate availableApiKeys
        if (currentExchange.apiKeys && currentExchange.apiKeys.length > 0) {
          availableApiKeys.value = currentExchange.apiKeys.map(apiKey => ({
            name: apiKey.name,
            keys: apiKey.keys
          }));
        }
      }

      // Sync with store initial selections
      selectedExchange.value = app.getUserSelectedExchange || 'coinbaseadvanced';
      selectedMarket.value = app.getUserSelectedMarket || 'LCX/USDC';
      selectedApiKeys.value = app.getSelectedApiKeys || [];
    }
  } catch (error) {
    console.error('❌ Error refreshing API keys:', error);
  }
}

async function onExchangeChange() {
  try {
    // Update store with new exchange selection
    app.updateUserSelectedExchange(selectedExchange.value);

    // Refresh to get markets and API keys for new exchange
    await refreshApiKeys();
  } catch (error) {
    console.error('❌ Error changing exchange:', error);
  }
}

async function onMarketChange() {
  try {
    // Update store with new market selection
    app.updateUserSelectedMarket(selectedMarket.value);
  } catch (error) {
    console.error('❌ Error changing market:', error);
  }
}

function toggleApiKey(apiKeyName) {
  const index = selectedApiKeys.value.indexOf(apiKeyName);
  if (index > -1) {
    // Remove if already selected
    selectedApiKeys.value.splice(index, 1);
  } else {
    // Add if not selected
    selectedApiKeys.value.push(apiKeyName);
  }

  // Update store with new selection
  app.state.selectedApiKeys = [...selectedApiKeys.value];
}

// Pages Configuration
const corePages = computed(() => [
  {
    path: '/PalantirApp/BotChains',
    icon: '⛓️',
    title: 'BOT CHAINS',
    desc: 'Event-Driven Automation & Multi-Step Strategies',
    color: '#00d4ff',
    liveCount: liveStats.value.activeChains
  },
  {
    path: '/PalantirApp/PatternRecognition',
    icon: '🔍',
    title: 'PATTERN RECOGNITION',
    desc: 'AI-Powered Market Pattern Detection',
    color: '#10eb04',
    liveCount: liveStats.value.patternsDetected
  },
  {
    path: '/PalantirApp/Analytics',
    icon: '📊',
    title: 'REAL-TIME ANALYTICS',
    desc: 'Live Market Intelligence Dashboard',
    color: '#f5a623',
    liveCount: liveStats.value.activeBots
  }
]);

const botPages = computed(() => [
  { path: '/PalantirApp/Bots/ActiveBots', icon: '🤖', title: 'Active Bots', desc: 'Running', color: '#00d4ff', badge: liveStats.value.activeBots },
  { path: '/PalantirApp/Bots/BotTemplates', icon: '📋', title: 'Templates', desc: 'Library', color: '#10eb04' },
  { path: '/PalantirApp/Bots/BotPerformance', icon: '📈', title: 'Performance', desc: 'Analytics', color: '#f5a623' },
  { path: '/PalantirApp/Bots/BotScheduler', icon: '⏰', title: 'Scheduler', desc: 'Timing', color: '#8a2be2' },
  { path: '/PalantirApp/Bots/BotBacktest', icon: '🔬', title: 'Backtest', desc: 'Testing', color: '#f52a09' },
  { path: '/PalantirApp/Bots/BotLogs', icon: '📝', title: 'Logs', desc: 'History', color: '#666' }
]);

const analyticsPages = [
  { path: '/PalantirApp/Analytics', icon: '📊', title: 'Dashboard', desc: 'Overview', color: '#f5a623' },
  { path: '/PalantirApp/Analytics/MarketHeatmap', icon: '🗺️', title: 'Heatmap', desc: 'Visual', color: '#f52a09' },
  { path: '/PalantirApp/Analytics/CorrelationMatrix', icon: '🔗', title: 'Correlation', desc: 'Matrix', color: '#00d4ff' },
  { path: '/PalantirApp/Analytics/SentimentAnalysis', icon: '💭', title: 'Sentiment', desc: 'Analysis', color: '#10eb04' },
  { path: '/PalantirApp/Analytics/VolumeProfile', icon: '📊', title: 'Volume', desc: 'Profile', color: '#f5a623' },
  { path: '/PalantirApp/Analytics/OnChainMetrics', icon: '⛓️', title: 'On-Chain', desc: 'Data', color: '#8a2be2' }
];

const riskPages = [
  { path: '/PalantirApp/Risk/PortfolioRisk', icon: '⚠️', title: 'Portfolio Risk', desc: 'Monitor', color: '#f52a09' },
  { path: '/PalantirApp/Risk/StopLossManager', icon: '🛑', title: 'Stop-Loss', desc: 'Manager', color: '#f52a09' },
  { path: '/PalantirApp/Risk/PositionSizing', icon: '💰', title: 'Position', desc: 'Sizing', color: '#10eb04' },
  { path: '/PalantirApp/Risk/DrawdownAnalysis', icon: '📉', title: 'Drawdown', desc: 'Analysis', color: '#f5a623' },
  { path: '/PalantirApp/Risk/RiskAlerts', icon: '🚨', title: 'Risk Alerts', desc: 'Monitor', color: '#f52a09' }
];

const automationPages = [
  { path: '/PalantirApp/Automation/RulesEngine', icon: '⚙️', title: 'Rules Engine', desc: 'Builder', color: '#00d4ff' },
  { path: '/PalantirApp/Automation/Webhooks', icon: '🔔', title: 'Webhooks', desc: 'Integration', color: '#10eb04' },
  { path: '/PalantirApp/Automation/AlertCenter', icon: '🚨', title: 'Alerts', desc: 'Center', color: '#f52a09' }
];

const reportsPages = [
  { path: '/PalantirApp/Reports/DailyReport', icon: '📋', title: 'Daily Report', desc: 'Summary', color: '#00d4ff' },
  { path: '/PalantirApp/Reports/TaxReport', icon: '💼', title: 'Tax Report', desc: 'Export', color: '#f5a623' },
  { path: '/PalantirApp/Insights/AIInsights', icon: '🤖', title: 'AI Insights', desc: 'Smart', color: '#8a2be2' }
];

const getSignalColor = (signal) => {
  const colors = {
    'BUY': '#10eb04',
    'STRONG BUY': '#00d4ff',
    'SELL': '#f52a09',
    'HOLD': '#f5a623',
    'NEUTRAL': '#666'
  };
  return colors[signal] || '#666';
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString();
};

const refreshActivity = async () => {
  try {
    // Fetch real-time activity from API
    const response = await $fetch('/api/v1/palantir/analytics/eventLog', {
      params: { userId: userID.value, limit: 5 }
    });

    if (response.events) {
      liveActivity.value = response.events.map(event => ({
        icon: getEventIcon(event.type),
        type: event.type,
        message: event.message,
        time: formatTime(event.timestamp),
        color: getEventColor(event.type)
      }));
    }
  } catch (error) {
    console.log('Using simulated activity data');
  }
};

const loadLiveStats = async () => {
  try {
    // Fetch REAL data from database
    const response = await $fetch('/api/v1/realtime/dashboard', {
      params: { userId: userID.value }
    });

    if (response.success && response.stats) {
      // Update live stats with REAL data
      liveStats.value = {
        activeBots: response.stats.activeBots || 0,
        patternsDetected: response.stats.patternsDetected || 0,
        openOrders: response.stats.openOrders || 0,
        activeChains: response.stats.activeChains || 0,
        totalPnL: response.stats.totalPnL || 0,
        successRate: response.stats.successRate || 0,
        totalApiKeys: response.stats.totalApiKeys || 0,
        activeExchanges: response.stats.activeExchanges || 0,
        totalBalance: response.stats.totalBalance || 0
      };

      // Update running bots with REAL data
      if (response.runningBots) {
        runningBots.value = response.runningBots;
      }

      // Update recent activity with REAL data
      if (response.recentActivity) {
        liveActivity.value = response.recentActivity;
      }
    }

    // Fetch patterns (Palantir engine)
    const recentPatternsResponse = await $fetch('/api/v1/palantir/patterns/list', {
      params: { userId: userID.value, limit: 4 }
    });
    if (recentPatternsResponse && recentPatternsResponse.patterns) {
      recentPatterns.value = recentPatternsResponse.patterns.map(p => ({
        id: p._id,
        icon: getPatternIcon(p.patternType),
        type: p.patternType,
        symbol: p.symbol,
        timeframe: p.timeframe,
        confidence: p.confidence.toFixed(1),
        signal: p.signal,
        time: formatTime(p.detectedAt)
      }));
    }

    // Fetch active chains (Palantir engine)
    const activeChainsResponse = await $fetch('/api/v1/palantir/chains/list', {
      params: { userId: userID.value, status: 'active' }
    });
    if (activeChainsResponse && activeChainsResponse.chains) {
      activeChains.value = activeChainsResponse.chains.map(c => ({
        id: c._id,
        name: c.name,
        steps: c.steps.length,
        triggers: c.triggers || 0,
        executions: c.executionCount || 0
      }));
    }

    console.log('✅ Real-time data loaded:', liveStats.value);
  } catch (error) {
    console.error('❌ Error loading real-time data:', error);
  }
};

const getEventIcon = (type) => {
  const icons = {
    'BOT_STARTED': '🤖',
    'PATTERN_DETECTED': '🔍',
    'ORDER_FILLED': '📊',
    'CHAIN_TRIGGERED': '⛓️',
    'STOP_LOSS': '⚠️'
  };
  return icons[type] || '📌';
};

const getEventColor = (type) => {
  const colors = {
    'BOT_STARTED': '#00d4ff',
    'PATTERN_DETECTED': '#10eb04',
    'ORDER_FILLED': '#f5a623',
    'CHAIN_TRIGGERED': '#8a2be2',
    'STOP_LOSS': '#f52a09'
  };
  return colors[type] || '#666';
};

const getPatternIcon = (type) => {
  const icons = {
    'breakout': '📈',
    'pump': '💥',
    'dump': '📉',
    'accumulation': '🔄',
    'distribution': '📤',
    'reversal': '↩️',
    'consolidation': '➡️',
    'volatility': '⚡'
  };
  return icons[type] || '🔍';
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

const formatBalance = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
};

const openCreateBot = () => {
  navigateTo('/PalantirApp/Bots/BotTemplates');
};

const openPatternScanner = () => {
  navigateTo('/PalantirApp/PatternRecognition');
};

const openBotChainBuilder = () => {
  navigateTo('/PalantirApp/BotChains');
};

const pauseAllBots = async () => {
  // Implement pause all bots functionality
  console.log('Pausing all bots...');
};

let timeInterval = null;
let statsInterval = null;

onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);

  // Load API keys and exchange data
  await refreshApiKeys();

  // Load initial data
  await loadLiveStats();
  await refreshActivity();

  // Auto-refresh every 10 seconds
  statsInterval = setInterval(async () => {
    await loadLiveStats();
    await refreshActivity();
  }, 10000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
  if (statsInterval) clearInterval(statsInterval);
});
</script>

<style scoped>
.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,212,255,0.3);
}

.mini-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,212,255,0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
