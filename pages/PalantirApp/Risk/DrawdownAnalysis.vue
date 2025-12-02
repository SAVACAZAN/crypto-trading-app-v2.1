<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f52a09;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">📉</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #f52a09; font-weight: 700;">DRAWDOWN ANALYSIS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Current: {{ currentDrawdown.toFixed(2) }}% • Max: {{ maxDrawdown.toFixed(2) }}%</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <n-button size="small" @click="refreshData" style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); color: #f52a09;">
            Refresh
          </n-button>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">MAX DRAWDOWN</div>
        <div style="color: #f52a09; font-size: 20px; font-weight: 700;">{{ maxDrawdown.toFixed(2) }}%</div>
        <div style="color: #888; font-size: 9px; margin-top: 4px;">{{ maxDrawdownDate }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">CURRENT DRAWDOWN</div>
        <div style="color: #f5a623; font-size: 20px; font-weight: 700;">{{ currentDrawdown.toFixed(2) }}%</div>
        <div style="color: #888; font-size: 9px; margin-top: 4px;">{{ drawdownStatus }}</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">AVG DRAWDOWN</div>
        <div style="color: #00d4ff; font-size: 20px; font-weight: 700;">{{ avgDrawdown.toFixed(2) }}%</div>
      </div>
      <div style="background: rgba(138,43,226,0.1); border: 1px solid rgba(138,43,226,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">RECOVERY TIME</div>
        <div style="color: #8a2be2; font-size: 20px; font-weight: 700;">{{ avgRecoveryTime }}</div>
      </div>
      <div style="background: rgba(16,235,4,0.1); border: 1px solid rgba(16,235,4,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">RECOVERY FACTOR</div>
        <div style="color: #10eb04; font-size: 20px; font-weight: 700;">{{ recoveryFactor }}</div>
      </div>
    </div>

    <!-- Drawdown Chart -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>📊</span>
        <span>DRAWDOWN OVER TIME</span>
      </div>

      <div style="height: 300px; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 15px; position: relative;">
        <svg viewBox="0 0 800 250" style="width: 100%; height: 100%;">
          <!-- Grid Lines -->
          <line v-for="i in 6" :key="`grid-y-${i}`" :y1="i * 41.67" :y2="i * 41.67" x1="0" x2="800" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

          <!-- Zero Line -->
          <line y1="0" y2="0" x1="0" x2="800" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>

          <!-- Drawdown Area -->
          <path :d="drawdownAreaPath" :fill="'url(#drawdownGradient)'" opacity="0.6"/>

          <!-- Drawdown Line -->
          <polyline :points="drawdownPoints" fill="none" stroke="#f52a09" stroke-width="2"/>

          <!-- Max Drawdown Marker -->
          <circle v-if="maxDrawdownIndex >= 0"
            :cx="(maxDrawdownIndex / (drawdownData.length - 1)) * 800"
            :cy="(maxDrawdown / 50) * 250"
            r="6" fill="#f52a09" stroke="#fff" stroke-width="2"/>

          <!-- Gradient Definition -->
          <defs>
            <linearGradient id="drawdownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#f52a09;stop-opacity:0" />
              <stop offset="100%" style="stop-color:#f52a09;stop-opacity:0.4" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Y-axis Labels -->
        <div style="position: absolute; left: 10px; top: 15px; display: flex; flex-direction: column; justify-content: space-between; height: calc(100% - 30px);">
          <div style="color: #888; font-size: 9px;">0%</div>
          <div style="color: #888; font-size: 9px;">-10%</div>
          <div style="color: #888; font-size: 9px;">-20%</div>
          <div style="color: #888; font-size: 9px;">-30%</div>
          <div style="color: #888; font-size: 9px;">-40%</div>
          <div style="color: #f52a09; font-size: 9px;">-50%</div>
        </div>
      </div>
    </div>

    <!-- Underwater Equity Curve -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>🌊</span>
        <span>UNDERWATER EQUITY CURVE</span>
      </div>

      <div style="height: 200px; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 15px; position: relative;">
        <svg viewBox="0 0 800 150" style="width: 100%; height: 100%;">
          <!-- Grid -->
          <line v-for="i in 4" :key="`underwater-${i}`" :y1="i * 37.5" :y2="i * 37.5" x1="0" x2="800" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

          <!-- Underwater Area -->
          <path :d="underwaterAreaPath" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" stroke-width="1"/>
        </svg>

        <div style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); color: #888; font-size: 10px;">
          Time underwater: {{ timeUnderwater }} days
        </div>
      </div>
    </div>

    <!-- Drawdown Periods -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">

      <!-- Historical Drawdowns -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>📜</span>
            <span>HISTORICAL DRAWDOWNS</span>
          </div>
          <div style="color: #888; font-size: 11px;">{{ drawdownPeriods.length }} periods</div>
        </div>

        <div style="max-height: 400px; overflow-y: auto;">
          <div v-for="(period, index) in drawdownPeriods" :key="index"
            style="background: rgba(0,0,0,0.3); border-left: 3px solid; padding: 12px; border-radius: 4px; margin-bottom: 10px;"
            :style="`border-left-color: ${getDrawdownColor(period.depth)};`">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div>
                <div style="color: #fff; font-size: 12px; font-weight: 700;">Drawdown {{ index + 1 }}</div>
                <div style="color: #888; font-size: 9px;">{{ period.startDate }} - {{ period.endDate }}</div>
              </div>
              <div :style="`color: ${getDrawdownColor(period.depth)}; font-size: 14px; font-weight: 700;`">
                {{ period.depth.toFixed(2) }}%
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <div>
                <div style="color: #888; font-size: 9px;">Duration</div>
                <div style="color: #fff; font-size: 11px;">{{ period.duration }} days</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Recovery</div>
                <div style="color: #10eb04; font-size: 11px;">{{ period.recovery }} days</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Total</div>
                <div style="color: #8a2be2; font-size: 11px;">{{ period.duration + period.recovery }} days</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden; margin-top: 8px;">
              <div :style="`width: ${period.recovered ? 100 : (period.recovery / (period.duration + period.recovery)) * 100}%; height: 100%; background: ${period.recovered ? '#10eb04' : '#f5a623'};`"></div>
            </div>
            <div style="color: #888; font-size: 9px; margin-top: 4px;">
              {{ period.recovered ? '✅ Recovered' : '⏳ Recovering...' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Drawdown Statistics -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📊</span>
          <span>DRAWDOWN STATISTICS</span>
        </div>

        <div style="display: grid; gap: 12px;">
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 6px;">Drawdown Distribution</div>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 10px;">
              <div v-for="range in drawdownDistribution" :key="range.label" style="text-align: center;">
                <div style="height: 60px; display: flex; align-items: flex-end;">
                  <div :style="`width: 100%; height: ${range.percentage}%; background: ${range.color}; border-radius: 4px 4px 0 0;`"></div>
                </div>
                <div style="color: #888; font-size: 8px; margin-top: 4px;">{{ range.label }}</div>
                <div :style="`color: ${range.color}; font-size: 10px; font-weight: 700;`">{{ range.count }}</div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
              <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Longest Drawdown</div>
              <div style="color: #f52a09; font-size: 14px; font-weight: 700;">{{ longestDrawdown }} days</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
              <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Shortest Drawdown</div>
              <div style="color: #10eb04; font-size: 14px; font-weight: 700;">{{ shortestDrawdown }} days</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
              <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Deepest Drawdown</div>
              <div style="color: #f52a09; font-size: 14px; font-weight: 700;">{{ deepestDrawdown.toFixed(2) }}%</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
              <div style="color: #888; font-size: 9px; margin-bottom: 4px;">Shallowest Drawdown</div>
              <div style="color: #10eb04; font-size: 14px; font-weight: 700;">{{ shallowestDrawdown.toFixed(2) }}%</div>
            </div>
          </div>

          <!-- Risk Metrics -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
            <div style="color: #888; font-size: 10px; margin-bottom: 10px;">Risk-Adjusted Metrics</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              <div>
                <div style="color: #888; font-size: 9px;">Calmar Ratio</div>
                <div style="color: #00d4ff; font-size: 13px; font-weight: 700;">{{ calmarRatio }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">MAR Ratio</div>
                <div style="color: #8a2be2; font-size: 13px; font-weight: 700;">{{ marRatio }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Ulcer Index</div>
                <div style="color: #f52a09; font-size: 13px; font-weight: 700;">{{ ulcerIndex }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Pain Index</div>
                <div style="color: #f5a623; font-size: 13px; font-weight: 700;">{{ painIndex }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Recovery Analysis -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>🔄</span>
        <span>RECOVERY ANALYSIS</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 6px;">Fast Recoveries (&lt;30d)</div>
          <div style="color: #10eb04; font-size: 16px; font-weight: 700;">{{ recoveryStats.fast }}</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 6px;">Medium (30-90d)</div>
          <div style="color: #f5a623; font-size: 16px; font-weight: 700;">{{ recoveryStats.medium }}</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 6px;">Slow (&gt;90d)</div>
          <div style="color: #f52a09; font-size: 16px; font-weight: 700;">{{ recoveryStats.slow }}</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 6px;">Avg Recovery Time</div>
          <div style="color: #8a2be2; font-size: 16px; font-weight: 700;">{{ avgRecoveryTime }}</div>
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
const currentDrawdown = ref(8.5);
const maxDrawdown = ref(18.7);
const maxDrawdownDate = ref('Oct 15, 2024');
const avgDrawdown = ref(6.2);
const avgRecoveryTime = ref('12d');
const recoveryFactor = ref(2.34);
const drawdownStatus = ref('Recovering');
const timeUnderwater = ref(45);

// Data
const drawdownData = ref([]);
const drawdownPeriods = ref([
  {
    startDate: 'Oct 1, 2024',
    endDate: 'Oct 15, 2024',
    depth: 18.7,
    duration: 14,
    recovery: 8,
    recovered: false
  },
  {
    startDate: 'Sep 10, 2024',
    endDate: 'Sep 20, 2024',
    depth: 12.3,
    duration: 10,
    recovery: 15,
    recovered: true
  },
  {
    startDate: 'Aug 5, 2024',
    endDate: 'Aug 12, 2024',
    depth: 8.5,
    duration: 7,
    recovery: 12,
    recovered: true
  },
  {
    startDate: 'Jul 20, 2024',
    endDate: 'Jul 28, 2024',
    depth: 15.2,
    duration: 8,
    recovery: 18,
    recovered: true
  },
  {
    startDate: 'Jun 15, 2024',
    endDate: 'Jun 25, 2024',
    depth: 10.8,
    duration: 10,
    recovery: 14,
    recovered: true
  }
]);

const drawdownDistribution = ref([
  { label: '0-5%', count: 12, percentage: 60, color: '#10eb04' },
  { label: '5-10%', count: 8, percentage: 40, color: '#f5a623' },
  { label: '10-15%', count: 5, percentage: 25, color: '#ff6b35' },
  { label: '15-20%', count: 2, percentage: 10, color: '#f52a09' },
  { label: '>20%', count: 0, percentage: 0, color: '#8B0000' }
]);

const recoveryStats = ref({
  fast: 8,
  medium: 4,
  slow: 3
});

// Generate drawdown data
const generateDrawdownData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    const dd = -Math.abs(Math.sin(i / 10) * 20 + (Math.random() - 0.5) * 5);
    data.push(dd);
  }
  drawdownData.value = data;
};

// Computed
const maxDrawdownIndex = computed(() => {
  return drawdownData.value.indexOf(Math.min(...drawdownData.value));
});

const drawdownPoints = computed(() => {
  return drawdownData.value
    .map((dd, index) => {
      const x = (index / (drawdownData.value.length - 1)) * 800;
      const y = (Math.abs(dd) / 50) * 250;
      return `${x},${y}`;
    })
    .join(' ');
});

const drawdownAreaPath = computed(() => {
  const points = drawdownData.value
    .map((dd, index) => {
      const x = (index / (drawdownData.value.length - 1)) * 800;
      const y = (Math.abs(dd) / 50) * 250;
      return `${x},${y}`;
    });

  return `M 0,0 L ${points.join(' L ')} L 800,0 Z`;
});

const underwaterAreaPath = computed(() => {
  const points = drawdownData.value
    .map((dd, index) => {
      const x = (index / (drawdownData.value.length - 1)) * 800;
      const y = 150 - (Math.abs(dd) / 50) * 150;
      return `${x},${y}`;
    });

  return `M 0,150 L ${points.join(' L ')} L 800,150 Z`;
});

const longestDrawdown = computed(() => {
  return Math.max(...drawdownPeriods.value.map(p => p.duration + p.recovery));
});

const shortestDrawdown = computed(() => {
  return Math.min(...drawdownPeriods.value.map(p => p.duration + p.recovery));
});

const deepestDrawdown = computed(() => {
  return Math.max(...drawdownPeriods.value.map(p => p.depth));
});

const shallowestDrawdown = computed(() => {
  return Math.min(...drawdownPeriods.value.map(p => p.depth));
});

const calmarRatio = ref(2.15);
const marRatio = ref(1.89);
const ulcerIndex = ref(4.32);
const painIndex = ref(3.67);

// Methods
const getDrawdownColor = (depth) => {
  if (depth >= 20) return '#8B0000';
  if (depth >= 15) return '#f52a09';
  if (depth >= 10) return '#ff6b35';
  if (depth >= 5) return '#f5a623';
  return '#10eb04';
};

const refreshData = () => {
  generateDrawdownData();
  currentDrawdown.value = 5 + Math.random() * 10;
};

// Lifecycle
onMounted(() => {
  generateDrawdownData();
});
</script>
