<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #8a2be2;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">⛓️</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #8a2be2; font-weight: 700;">ON-CHAIN METRICS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Blockchain Data Analysis</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <n-select v-model:value="selectedChain" :options="chainOptions" size="small" style="width: 150px;" />
          <n-select v-model:value="selectedTimeframe" :options="timeframeOptions" size="small" style="width: 120px;" />
          <n-button size="small" @click="refreshData" style="background: #8a2be2; border: none;">🔄 REFRESH</n-button>
        </div>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 15px;">
      <div style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2; padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 9px; color: #888;">TX VOLUME (24H)</div>
          <div :style="`font-size: 10px; color: ${metrics.txVolumeChange >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ metrics.txVolumeChange >= 0 ? '+' : '' }}{{ metrics.txVolumeChange }}%
          </div>
        </div>
        <div style="font-size: 18px; color: #8a2be2; font-weight: 700;">{{ formatNumber(metrics.txVolume) }}</div>
        <div style="font-size: 8px; color: #666; margin-top: 3px;">${{ formatNumber(metrics.txVolumeUSD) }}</div>
      </div>

      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 9px; color: #888;">ACTIVE ADDRESSES</div>
          <div :style="`font-size: 10px; color: ${metrics.activeAddressesChange >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ metrics.activeAddressesChange >= 0 ? '+' : '' }}{{ metrics.activeAddressesChange }}%
          </div>
        </div>
        <div style="font-size: 18px; color: #00d4ff; font-weight: 700;">{{ formatNumber(metrics.activeAddresses) }}</div>
        <div style="font-size: 8px; color: #666; margin-top: 3px;">Last 24h</div>
      </div>

      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 9px; color: #888;">HASH RATE</div>
          <div :style="`font-size: 10px; color: ${metrics.hashRateChange >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ metrics.hashRateChange >= 0 ? '+' : '' }}{{ metrics.hashRateChange }}%
          </div>
        </div>
        <div style="font-size: 18px; color: #10eb04; font-weight: 700;">{{ metrics.hashRate }} EH/s</div>
        <div style="font-size: 8px; color: #666; margin-top: 3px;">Network Security</div>
      </div>

      <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 9px; color: #888;">WHALE TRANSACTIONS</div>
          <div :style="`font-size: 10px; color: ${metrics.whaleChange >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ metrics.whaleChange >= 0 ? '+' : '' }}{{ metrics.whaleChange }}%
          </div>
        </div>
        <div style="font-size: 18px; color: #f5a623; font-weight: 700;">{{ metrics.whaleCount }}</div>
        <div style="font-size: 8px; color: #666; margin-top: 3px;">> $1M transfers</div>
      </div>

      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 9px; color: #888;">EXCHANGE INFLOW</div>
          <div :style="`font-size: 10px; color: ${metrics.inflowChange >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ metrics.inflowChange >= 0 ? '+' : '' }}{{ metrics.inflowChange }}%
          </div>
        </div>
        <div style="font-size: 18px; color: #f52a09; font-weight: 700;">{{ formatNumber(metrics.exchangeInflow) }}</div>
        <div style="font-size: 8px; color: #666; margin-top: 3px;">${{ formatNumber(metrics.exchangeInflowUSD) }}M</div>
      </div>

      <div style="background: rgba(255,105,180,0.1); border: 1px solid #ff69b4; padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 9px; color: #888;">EXCHANGE OUTFLOW</div>
          <div :style="`font-size: 10px; color: ${metrics.outflowChange >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ metrics.outflowChange >= 0 ? '+' : '' }}{{ metrics.outflowChange }}%
          </div>
        </div>
        <div style="font-size: 18px; color: #ff69b4; font-weight: 700;">{{ formatNumber(metrics.exchangeOutflow) }}</div>
        <div style="font-size: 8px; color: #666; margin-top: 3px;">${{ formatNumber(metrics.exchangeOutflowUSD) }}M</div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Transaction Volume Chart -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <div style="color: #8a2be2; font-size: 14px; font-weight: 600;">Transaction Volume (7D)</div>
            <div style="color: #666; font-size: 9px;">On-chain transaction activity</div>
          </div>
          <div style="background: rgba(138,43,226,0.2); padding: 4px 8px; border-radius: 4px; font-size: 9px; color: #8a2be2;">
            AVG: {{ formatNumber(avgTxVolume) }} BTC
          </div>
        </div>
        <svg viewBox="0 0 600 200" style="width: 100%; height: 180px;">
          <!-- Grid lines -->
          <line x1="0" y1="40" x2="600" y2="40" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="160" x2="600" y2="160" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />

          <!-- Bars -->
          <g v-for="(vol, index) in txVolumeHistory" :key="index">
            <rect
              :x="index * 85 + 10"
              :y="200 - (vol / maxTxVolume * 160)"
              width="70"
              :height="vol / maxTxVolume * 160"
              :fill="vol > avgTxVolume ? '#8a2be2' : '#0f3460'"
              opacity="0.8"
            />
            <text
              :x="index * 85 + 45"
              :y="195"
              text-anchor="middle"
              fill="#666"
              font-size="9"
            >
              D{{ index + 1 }}
            </text>
          </g>

          <!-- Volume labels -->
          <text x="5" y="45" fill="#666" font-size="8">{{ formatNumber(maxTxVolume * 0.75) }}</text>
          <text x="5" y="105" fill="#666" font-size="8">{{ formatNumber(maxTxVolume * 0.5) }}</text>
          <text x="5" y="165" fill="#666" font-size="8">{{ formatNumber(maxTxVolume * 0.25) }}</text>
        </svg>
      </div>

      <!-- Active Addresses Chart -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <div style="color: #00d4ff; font-size: 14px; font-weight: 600;">Active Addresses (7D)</div>
            <div style="color: #666; font-size: 9px;">Unique addresses with activity</div>
          </div>
          <div style="background: rgba(0,212,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 9px; color: #00d4ff;">
            TREND: {{ addressTrend }}
          </div>
        </div>
        <svg viewBox="0 0 600 200" style="width: 100%; height: 180px;">
          <!-- Grid lines -->
          <line x1="0" y1="40" x2="600" y2="40" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="160" x2="600" y2="160" stroke="#333" stroke-width="1" stroke-dasharray="2,2" />

          <!-- Area chart -->
          <defs>
            <linearGradient id="addressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.4" />
              <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:0.05" />
            </linearGradient>
          </defs>

          <path
            :d="activeAddressesPath"
            fill="url(#addressGradient)"
            stroke="#00d4ff"
            stroke-width="2"
          />

          <!-- Data points -->
          <circle
            v-for="(addr, index) in activeAddressHistory"
            :key="index"
            :cx="index * 100"
            :cy="200 - (addr / maxActiveAddresses * 160)"
            r="4"
            fill="#00d4ff"
          />
        </svg>
      </div>
    </div>

    <!-- Whale Activity & Network Health -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Whale Activity -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <div style="color: #f5a623; font-size: 14px; font-weight: 600;">Whale Activity (24H)</div>
            <div style="color: #666; font-size: 9px;">Large transactions > $1M</div>
          </div>
          <n-button size="tiny" @click="showWhaleModal = true" style="background: #f5a623; border: none; font-size: 9px;">
            VIEW ALL
          </n-button>
        </div>
        <div style="max-height: 220px; overflow-y: auto;">
          <div v-for="whale in whaleTransactions" :key="whale.hash"
               style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #f5a623;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div :style="`background: ${whale.type === 'IN' ? 'rgba(245,42,9,0.2)' : 'rgba(16,235,4,0.2)'}; padding: 3px 6px; border-radius: 3px; font-size: 8px; color: ${whale.type === 'IN' ? '#f52a09' : '#10eb04'}; font-weight: 600;`">
                  {{ whale.type }}
                </div>
                <div style="color: #00d4ff; font-size: 11px; font-weight: 600;">{{ whale.amount.toLocaleString() }} BTC</div>
              </div>
              <div style="color: #666; font-size: 9px;">{{ whale.time }}</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="color: #888; font-size: 9px;">{{ whale.from }}</div>
              <div style="color: #666; font-size: 9px;">→</div>
              <div style="color: #888; font-size: 9px;">{{ whale.to }}</div>
            </div>
            <div style="color: #666; font-size: 8px; margin-top: 4px;">${{ whale.valueUSD.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Network Health -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #10eb04; font-size: 14px; font-weight: 600;">Network Health</div>
          <div style="color: #666; font-size: 9px;">Real-time blockchain metrics</div>
        </div>

        <div style="display: grid; gap: 12px;">
          <!-- Block Height -->
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="color: #888; font-size: 10px;">Block Height</div>
              <div style="color: #10eb04; font-size: 13px; font-weight: 600;">{{ networkHealth.blockHeight.toLocaleString() }}</div>
            </div>
            <div style="height: 4px; background: rgba(16,235,4,0.2); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: 100%; background: #10eb04;"></div>
            </div>
          </div>

          <!-- Difficulty -->
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="color: #888; font-size: 10px;">Network Difficulty</div>
              <div style="color: #00d4ff; font-size: 13px; font-weight: 600;">{{ networkHealth.difficulty }} T</div>
            </div>
            <div style="height: 4px; background: rgba(0,212,255,0.2); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: 85%; background: #00d4ff;"></div>
            </div>
          </div>

          <!-- Mempool Size -->
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="color: #888; font-size: 10px;">Mempool Size</div>
              <div style="color: #f5a623; font-size: 13px; font-weight: 600;">{{ networkHealth.mempoolSize.toLocaleString() }} TX</div>
            </div>
            <div style="height: 4px; background: rgba(245,166,35,0.2); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: 60%; background: #f5a623;"></div>
            </div>
          </div>

          <!-- Average Fee -->
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="color: #888; font-size: 10px;">Average Fee</div>
              <div style="color: #8a2be2; font-size: 13px; font-weight: 600;">{{ networkHealth.avgFee }} sat/vB</div>
            </div>
            <div style="height: 4px; background: rgba(138,43,226,0.2); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: 45%; background: #8a2be2;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exchange Flow & HODL Waves -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <!-- Exchange Flow -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #ff69b4; font-size: 14px; font-weight: 600;">Exchange Flow (7D)</div>
          <div style="color: #666; font-size: 9px;">Net flow in/out of exchanges</div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; padding: 12px; border-radius: 6px; flex: 1; margin-right: 10px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">INFLOW</div>
            <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ formatNumber(weeklyInflow) }} BTC</div>
            <div style="color: #666; font-size: 8px; margin-top: 2px;">${{ formatNumber(weeklyInflowUSD) }}M</div>
          </div>
          <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; padding: 12px; border-radius: 6px; flex: 1;">
            <div style="color: #888; font-size: 9px; margin-bottom: 4px;">OUTFLOW</div>
            <div style="color: #10eb04; font-size: 18px; font-weight: 700;">{{ formatNumber(weeklyOutflow) }} BTC</div>
            <div style="color: #666; font-size: 8px; margin-top: 2px;">${{ formatNumber(weeklyOutflowUSD) }}M</div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; text-align: center;">
          <div style="color: #888; font-size: 9px; margin-bottom: 6px;">NET FLOW</div>
          <div :style="`font-size: 24px; font-weight: 700; color: ${netFlow >= 0 ? '#10eb04' : '#f52a09'};`">
            {{ netFlow >= 0 ? '+' : '' }}{{ formatNumber(Math.abs(netFlow)) }} BTC
          </div>
          <div style="color: #666; font-size: 10px; margin-top: 4px;">
            {{ netFlow >= 0 ? '⬆ Bullish (Outflow > Inflow)' : '⬇ Bearish (Inflow > Outflow)' }}
          </div>
        </div>

        <svg viewBox="0 0 600 120" style="width: 100%; height: 120px; margin-top: 15px;">
          <!-- Flow bars -->
          <g v-for="(flow, index) in flowHistory" :key="index">
            <rect
              :x="index * 85 + 10"
              :y="flow > 0 ? 60 - (flow / maxFlow * 50) : 60"
              width="70"
              :height="Math.abs(flow) / maxFlow * 50"
              :fill="flow > 0 ? '#10eb04' : '#f52a09'"
              opacity="0.8"
            />
          </g>
          <line x1="0" y1="60" x2="600" y2="60" stroke="#666" stroke-width="1" />
        </svg>
      </div>

      <!-- HODL Waves -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 12px;">
          <div style="color: #8a2be2; font-size: 14px; font-weight: 600;">HODL Waves</div>
          <div style="color: #666; font-size: 9px;">Distribution by holding period</div>
        </div>

        <div style="display: grid; gap: 10px;">
          <div v-for="wave in hodlWaves" :key="wave.label"
               style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div :style="`width: 12px; height: 12px; background: ${wave.color}; border-radius: 3px;`"></div>
                <div style="color: #ccc; font-size: 11px; font-weight: 600;">{{ wave.label }}</div>
              </div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ wave.percentage }}%</div>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div :style="`height: 100%; width: ${wave.percentage}%; background: ${wave.color}; transition: width 0.3s ease;`"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
              <div style="color: #666; font-size: 9px;">{{ formatNumber(wave.coins) }} BTC</div>
              <div :style="`font-size: 9px; color: ${wave.change >= 0 ? '#10eb04' : '#f52a09'};`">
                {{ wave.change >= 0 ? '+' : '' }}{{ wave.change }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Whale Transactions Modal -->
    <n-modal v-model:show="showWhaleModal" preset="card" title="Whale Transactions (24H)" style="width: 800px; background: #1a1a2e;">
      <div style="max-height: 500px; overflow-y: auto;">
        <div v-for="whale in allWhaleTransactions" :key="whale.hash"
             style="background: rgba(15,52,96,0.2); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #f5a623;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div :style="`background: ${whale.type === 'IN' ? 'rgba(245,42,9,0.2)' : 'rgba(16,235,4,0.2)'}; padding: 4px 8px; border-radius: 4px; font-size: 10px; color: ${whale.type === 'IN' ? '#f52a09' : '#10eb04'}; font-weight: 600;`">
                {{ whale.type }}
              </div>
              <div style="color: #00d4ff; font-size: 13px; font-weight: 600;">{{ whale.amount.toLocaleString() }} BTC</div>
              <div style="color: #888; font-size: 11px;">${{ whale.valueUSD.toLocaleString() }}</div>
            </div>
            <div style="color: #666; font-size: 10px;">{{ whale.time }}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="color: #888; font-size: 10px;">From: {{ whale.from }}</div>
            <div style="color: #888; font-size: 10px;">To: {{ whale.to }}</div>
          </div>
          <div style="color: #666; font-size: 9px; font-family: monospace;">{{ whale.hash }}</div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const selectedChain = ref('BTC');
const selectedTimeframe = ref('24h');
const showWhaleModal = ref(false);

const chainOptions = [
  { label: 'Bitcoin (BTC)', value: 'BTC' },
  { label: 'Ethereum (ETH)', value: 'ETH' },
  { label: 'BNB Chain', value: 'BNB' },
  { label: 'Polygon', value: 'MATIC' }
];

const timeframeOptions = [
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' }
];

const metrics = ref({
  txVolume: 342567,
  txVolumeUSD: 15234000000,
  txVolumeChange: 8.5,
  activeAddresses: 892345,
  activeAddressesChange: 12.3,
  hashRate: 428.5,
  hashRateChange: 3.2,
  whaleCount: 127,
  whaleChange: -5.4,
  exchangeInflow: 12450,
  exchangeInflowUSD: 553,
  inflowChange: -15.8,
  exchangeOutflow: 18920,
  exchangeOutflowUSD: 840,
  outflowChange: 22.4
});

const txVolumeHistory = ref([285000, 310000, 295000, 342000, 318000, 335000, 342567]);
const activeAddressHistory = ref([750000, 780000, 820000, 840000, 865000, 880000, 892345]);

const networkHealth = ref({
  blockHeight: 812345,
  difficulty: 53.91,
  mempoolSize: 12456,
  avgFee: 45
});

const whaleTransactions = ref([
  { hash: '0x1a2b...c3d4', type: 'OUT', amount: 2450, valueUSD: 108780000, from: 'Binance', to: 'Unknown Wallet', time: '2m ago' },
  { hash: '0x2b3c...d4e5', type: 'IN', amount: 1820, valueUSD: 80850000, from: 'Unknown Wallet', to: 'Coinbase', time: '8m ago' },
  { hash: '0x3c4d...e5f6', type: 'OUT', amount: 3100, valueUSD: 137640000, from: 'Kraken', to: 'Cold Wallet', time: '15m ago' },
  { hash: '0x4d5e...f6g7', type: 'IN', amount: 1560, valueUSD: 69264000, from: 'Unknown Wallet', to: 'Bitfinex', time: '22m ago' }
]);

const allWhaleTransactions = ref([
  ...whaleTransactions.value,
  { hash: '0x5e6f...g7h8', type: 'OUT', amount: 2890, valueUSD: 128316000, from: 'Gemini', to: 'Unknown Wallet', time: '35m ago' },
  { hash: '0x6f7g...h8i9', type: 'IN', amount: 2120, valueUSD: 94128000, from: 'Unknown Wallet', to: 'Kraken', time: '42m ago' },
  { hash: '0x7g8h...i9j0', type: 'OUT', amount: 4200, valueUSD: 186480000, from: 'Binance', to: 'Cold Wallet', time: '1h ago' },
  { hash: '0x8h9i...j0k1', type: 'IN', amount: 1750, valueUSD: 77700000, from: 'Unknown Wallet', to: 'Coinbase', time: '1h 15m ago' }
]);

const flowHistory = ref([2500, -1800, 3200, 1400, -2100, 3800, 6470]);
const weeklyInflow = ref(87340);
const weeklyInflowUSD = ref(3878);
const weeklyOutflow = ref(132510);
const weeklyOutflowUSD = ref(5883);

const hodlWaves = ref([
  { label: '< 1 Month', percentage: 8.5, coins: 1593750, change: 2.3, color: '#f52a09' },
  { label: '1-3 Months', percentage: 12.8, coins: 2400000, change: -1.5, color: '#f5a623' },
  { label: '3-6 Months', percentage: 15.2, coins: 2850000, change: 0.8, color: '#00d4ff' },
  { label: '6-12 Months', percentage: 18.5, coins: 3467500, change: -0.4, color: '#8a2be2' },
  { label: '1-2 Years', percentage: 22.3, coins: 4181250, change: 1.2, color: '#10eb04' },
  { label: '> 2 Years', percentage: 22.7, coins: 4256250, change: -2.1, color: '#666' }
]);

const maxTxVolume = computed(() => Math.max(...txVolumeHistory.value));
const avgTxVolume = computed(() => {
  const sum = txVolumeHistory.value.reduce((a, b) => a + b, 0);
  return Math.round(sum / txVolumeHistory.value.length);
});

const maxActiveAddresses = computed(() => Math.max(...activeAddressHistory.value));

const activeAddressesPath = computed(() => {
  const points = activeAddressHistory.value.map((addr, index) => {
    const x = index * 100;
    const y = 200 - (addr / maxActiveAddresses.value * 160);
    return `${x},${y}`;
  });
  return `M 0,200 L ${points.join(' L ')} L 600,200 Z`;
});

const addressTrend = computed(() => {
  const first = activeAddressHistory.value[0];
  const last = activeAddressHistory.value[activeAddressHistory.value.length - 1];
  const change = ((last - first) / first * 100).toFixed(1);
  return change >= 0 ? `↗ +${change}%` : `↘ ${change}%`;
});

const netFlow = computed(() => weeklyOutflow.value - weeklyInflow.value);

const maxFlow = computed(() => Math.max(...flowHistory.value.map(f => Math.abs(f))));

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const refreshData = () => {
  console.log('Refreshing on-chain data...');
  // Simulate data refresh with slight variations
  metrics.value.txVolumeChange = (Math.random() * 20 - 10).toFixed(1);
  metrics.value.activeAddressesChange = (Math.random() * 20 - 10).toFixed(1);
  metrics.value.hashRateChange = (Math.random() * 10 - 5).toFixed(1);
};

onMounted(() => {
  console.log('OnChainMetrics loaded');
});
</script>
