<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f52a09;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">💰</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #f52a09; font-weight: 700;">POSITION SIZING</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Risk-Based Size Calculator • {{ calculationMethod }} Method</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <n-button size="small" @click="resetCalculator" style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); color: #f52a09;">
            Reset
          </n-button>
          <n-button size="small" @click="savePreset" style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); color: #f52a09;">
            Save Preset
          </n-button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">ACCOUNT BALANCE</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">${{ accountBalance.toLocaleString() }}</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">RISK PER TRADE</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ riskPerTrade }}%</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">MAX POSITION SIZE</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">${{ calculatedPositionSize.toLocaleString() }}</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 4px;">QUANTITY</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ calculatedQuantity.toFixed(4) }} {{ selectedAsset }}</div>
      </div>
    </div>

    <!-- Main Calculator Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">

      <!-- Input Parameters -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>📊</span>
          <span>CALCULATION PARAMETERS</span>
        </div>

        <!-- Calculation Method -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Calculation Method</div>
          <n-select v-model:value="calculationMethod" :options="methodOptions" size="small" />
        </div>

        <!-- Account Balance -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Account Balance ($)</div>
          <n-input-number v-model:value="accountBalance" :min="0" :step="1000" size="small" style="width: 100%;" />
        </div>

        <!-- Risk Per Trade -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Risk Per Trade (%)</div>
          <n-slider v-model:value="riskPerTrade" :min="0.1" :max="10" :step="0.1" :marks="riskMarks" />
          <div style="text-align: center; color: #f52a09; font-size: 11px; margin-top: 5px;">{{ riskPerTrade }}%</div>
        </div>

        <!-- Asset Selection -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Asset</div>
          <n-select v-model:value="selectedAsset" :options="assetOptions" size="small" />
        </div>

        <!-- Entry Price -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Entry Price ($)</div>
          <n-input-number v-model:value="entryPrice" :min="0" :step="0.01" :precision="2" size="small" style="width: 100%;" />
        </div>

        <!-- Stop Loss Price -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Stop Loss Price ($)</div>
          <n-input-number v-model:value="stopLossPrice" :min="0" :step="0.01" :precision="2" size="small" style="width: 100%;" />
        </div>

        <!-- Risk/Reward Ratio (for Kelly Method) -->
        <div v-if="calculationMethod === 'Kelly Criterion'" style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Win Rate (%)</div>
          <n-input-number v-model:value="winRate" :min="0" :max="100" :step="1" size="small" style="width: 100%;" />
        </div>

        <div v-if="calculationMethod === 'Kelly Criterion'" style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Risk/Reward Ratio</div>
          <n-input-number v-model:value="riskRewardRatio" :min="0.1" :max="10" :step="0.1" :precision="1" size="small" style="width: 100%;" />
        </div>

      </div>

      <!-- Calculation Results -->
      <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>🎯</span>
          <span>CALCULATION RESULTS</span>
        </div>

        <!-- Risk Distance -->
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">RISK DISTANCE</div>
          <div style="color: #fff; font-size: 16px; font-weight: 700;">${{ riskDistance.toFixed(2) }} ({{ riskDistancePercent.toFixed(2) }}%)</div>
        </div>

        <!-- Dollar Risk -->
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">DOLLAR RISK</div>
          <div style="color: #f52a09; font-size: 16px; font-weight: 700;">${{ dollarRisk.toFixed(2) }}</div>
        </div>

        <!-- Position Size -->
        <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">POSITION SIZE</div>
          <div style="color: #f52a09; font-size: 20px; font-weight: 700;">${{ calculatedPositionSize.toLocaleString() }}</div>
          <div style="color: #888; font-size: 9px; margin-top: 4px;">{{ positionSizePercent.toFixed(2) }}% of account</div>
        </div>

        <!-- Quantity -->
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 4px;">QUANTITY TO BUY</div>
          <div style="color: #fff; font-size: 16px; font-weight: 700;">{{ calculatedQuantity.toFixed(4) }} {{ selectedAsset }}</div>
        </div>

        <!-- Take Profit Levels -->
        <div style="background: rgba(16,235,4,0.1); border: 1px solid rgba(16,235,4,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <div style="color: #10eb04; font-size: 11px; font-weight: 700; margin-bottom: 8px;">TAKE PROFIT LEVELS</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div>
              <div style="color: #888; font-size: 9px;">TP1 (1:1)</div>
              <div style="color: #10eb04; font-size: 12px; font-weight: 700;">${{ takeProfitLevels.tp1.toFixed(2) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">TP2 (2:1)</div>
              <div style="color: #10eb04; font-size: 12px; font-weight: 700;">${{ takeProfitLevels.tp2.toFixed(2) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">TP3 (3:1)</div>
              <div style="color: #10eb04; font-size: 12px; font-weight: 700;">${{ takeProfitLevels.tp3.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- Risk Warning -->
        <div v-if="positionSizePercent > 20" style="background: rgba(245,42,9,0.2); border: 1px solid rgba(245,42,9,0.5); padding: 10px; border-radius: 6px;">
          <div style="color: #f52a09; font-size: 10px; font-weight: 700;">⚠️ HIGH RISK WARNING</div>
          <div style="color: #f52a09; font-size: 9px; margin-top: 4px;">Position size exceeds 20% of account. Consider reducing exposure.</div>
        </div>

      </div>

    </div>

    <!-- Position Sizing Methods Comparison -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>📐</span>
        <span>POSITION SIZING METHODS COMPARISON</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">

        <div v-for="method in comparisonMethods" :key="method.name"
          style="background: rgba(0,0,0,0.3); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px; cursor: pointer; transition: all 0.3s;"
          :style="calculationMethod === method.name ? 'border-color: #f52a09; background: rgba(245,42,9,0.1);' : ''"
          @click="calculationMethod = method.name">
          <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 8px;">{{ method.name }}</div>
          <div style="color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 4px;">${{ method.size.toLocaleString() }}</div>
          <div style="color: #888; font-size: 9px; margin-bottom: 8px;">{{ method.qty.toFixed(4) }} {{ selectedAsset }}</div>
          <div style="color: #888; font-size: 9px;">{{ method.description }}</div>
        </div>

      </div>
    </div>

    <!-- Saved Presets -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>💾</span>
          <span>SAVED PRESETS</span>
        </div>
        <div style="color: #888; font-size: 11px;">{{ savedPresets.length }} presets</div>
      </div>

      <div v-if="savedPresets.length === 0" style="text-align: center; padding: 20px; color: #666;">
        No saved presets. Configure your calculator and click "Save Preset" to save.
      </div>

      <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        <div v-for="preset in savedPresets" :key="preset.id"
          style="background: rgba(0,0,0,0.3); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div>
              <div style="color: #f52a09; font-size: 12px; font-weight: 700;">{{ preset.name }}</div>
              <div style="color: #888; font-size: 9px;">{{ preset.asset }} • {{ preset.method }}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <n-button size="tiny" @click="loadPreset(preset)" style="background: rgba(16,235,4,0.1); border: 1px solid rgba(16,235,4,0.3); color: #10eb04;">
                Load
              </n-button>
              <n-button size="tiny" @click="deletePreset(preset.id)" style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); color: #f52a09;">
                Delete
              </n-button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <div>
              <div style="color: #888; font-size: 9px;">Risk</div>
              <div style="color: #fff; font-size: 11px;">{{ preset.risk }}%</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">Position</div>
              <div style="color: #f52a09; font-size: 11px;">${{ preset.positionSize.toLocaleString() }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">Entry</div>
              <div style="color: #fff; font-size: 11px;">${{ preset.entry }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">Stop Loss</div>
              <div style="color: #f52a09; font-size: 11px;">${{ preset.stopLoss }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Management Tips -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid rgba(245,42,9,0.3); padding: 15px; border-radius: 8px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span>💡</span>
        <span>RISK MANAGEMENT TIPS</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 6px;">Fixed Percentage</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Risk a fixed percentage of your account on each trade (1-2% recommended for conservative traders).</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 6px;">Kelly Criterion</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Optimal position sizing based on win rate and risk/reward ratio. Use half-Kelly for conservative approach.</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 6px;">Volatility-Based</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Adjust position size based on market volatility. Higher volatility = smaller position size.</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;">
          <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 6px;">Never Risk More Than 5%</div>
          <div style="color: #888; font-size: 10px; line-height: 1.4;">Even aggressive traders should cap risk at 5% per trade to avoid account destruction.</div>
        </div>
      </div>
    </div>

    <!-- Save Preset Modal -->
    <n-modal v-model:show="showPresetModal" :mask-closable="false">
      <div style="background: #0a0a0a; border: 2px solid #f52a09; border-radius: 8px; padding: 20px; width: 400px; max-width: 90vw;">
        <div style="color: #f52a09; font-size: 16px; font-weight: 700; margin-bottom: 15px;">💾 Save Preset</div>

        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Preset Name</div>
          <n-input v-model:value="presetName" placeholder="e.g., Conservative BTC" size="small" />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <n-button @click="confirmSavePreset" type="primary" size="small" style="flex: 1; background: #f52a09; border: none;">
            Save
          </n-button>
          <n-button @click="showPresetModal = false" size="small" style="flex: 1;">
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

// Calculator State
const userID = useCookie('userID');
const calculationMethod = ref('Fixed Percentage');
const accountBalance = ref(0); // Will load from real balance
const riskPerTrade = ref(2);
const selectedAsset = ref('BTC');
const entryPrice = ref(45000);
const stopLossPrice = ref(44000);
const winRate = ref(55);
const riskRewardRatio = ref(2);
const loadingBalance = ref(true);

// Preset Management
const showPresetModal = ref(false);
const presetName = ref('');
const savedPresets = ref([]);

// Options
const methodOptions = [
  { label: 'Fixed Percentage', value: 'Fixed Percentage' },
  { label: 'Kelly Criterion', value: 'Kelly Criterion' },
  { label: 'Fixed Dollar', value: 'Fixed Dollar' },
  { label: 'Volatility-Based', value: 'Volatility-Based' }
];

const assetOptions = [
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'BNB', value: 'BNB' },
  { label: 'SOL', value: 'SOL' },
  { label: 'ADA', value: 'ADA' },
  { label: 'DOT', value: 'DOT' },
  { label: 'MATIC', value: 'MATIC' },
  { label: 'LINK', value: 'LINK' }
];

const riskMarks = {
  0.5: '0.5%',
  1: '1%',
  2: '2%',
  3: '3%',
  5: '5%',
  10: '10%'
};

// Calculations
const riskDistance = computed(() => {
  return Math.abs(entryPrice.value - stopLossPrice.value);
});

const riskDistancePercent = computed(() => {
  if (entryPrice.value === 0) return 0;
  return (riskDistance.value / entryPrice.value) * 100;
});

const dollarRisk = computed(() => {
  return (accountBalance.value * riskPerTrade.value) / 100;
});

const calculatedPositionSize = computed(() => {
  if (calculationMethod.value === 'Fixed Percentage') {
    return calculateFixedPercentage();
  } else if (calculationMethod.value === 'Kelly Criterion') {
    return calculateKellyCriterion();
  } else if (calculationMethod.value === 'Fixed Dollar') {
    return calculateFixedDollar();
  } else if (calculationMethod.value === 'Volatility-Based') {
    return calculateVolatilityBased();
  }
  return 0;
});

const calculatedQuantity = computed(() => {
  if (entryPrice.value === 0) return 0;
  return calculatedPositionSize.value / entryPrice.value;
});

const positionSizePercent = computed(() => {
  if (accountBalance.value === 0) return 0;
  return (calculatedPositionSize.value / accountBalance.value) * 100;
});

const takeProfitLevels = computed(() => {
  const distance = riskDistance.value;
  return {
    tp1: entryPrice.value + distance,
    tp2: entryPrice.value + (distance * 2),
    tp3: entryPrice.value + (distance * 3)
  };
});

// Position Sizing Methods
const calculateFixedPercentage = () => {
  if (riskDistancePercent.value === 0) return 0;
  return dollarRisk.value / (riskDistancePercent.value / 100);
};

const calculateKellyCriterion = () => {
  const p = winRate.value / 100;
  const q = 1 - p;
  const b = riskRewardRatio.value;

  let kelly = ((b * p - q) / b);
  kelly = Math.max(0, Math.min(kelly, 0.25)); // Cap at 25%

  return accountBalance.value * kelly;
};

const calculateFixedDollar = () => {
  if (riskDistance.value === 0) return 0;
  return dollarRisk.value / (riskDistance.value / entryPrice.value);
};

const calculateVolatilityBased = () => {
  const volatilityMultiplier = 1 / (riskDistancePercent.value / 2);
  const adjustedRisk = riskPerTrade.value * Math.min(volatilityMultiplier, 2);
  return (accountBalance.value * adjustedRisk) / 100 / (riskDistancePercent.value / 100);
};

// Comparison Methods
const comparisonMethods = computed(() => {
  const methods = [
    {
      name: 'Fixed Percentage',
      size: calculateFixedPercentage(),
      qty: calculateFixedPercentage() / entryPrice.value,
      description: 'Risk fixed % per trade'
    },
    {
      name: 'Kelly Criterion',
      size: calculateKellyCriterion(),
      qty: calculateKellyCriterion() / entryPrice.value,
      description: 'Optimal based on edge'
    },
    {
      name: 'Fixed Dollar',
      size: calculateFixedDollar(),
      qty: calculateFixedDollar() / entryPrice.value,
      description: 'Fixed dollar risk'
    },
    {
      name: 'Volatility-Based',
      size: calculateVolatilityBased(),
      qty: calculateVolatilityBased() / entryPrice.value,
      description: 'Adjusted for volatility'
    }
  ];
  return methods;
});

// Preset Management
const savePreset = () => {
  presetName.value = `${selectedAsset.value} ${calculationMethod.value}`;
  showPresetModal.value = true;
};

const confirmSavePreset = () => {
  const preset = {
    id: Date.now(),
    name: presetName.value,
    method: calculationMethod.value,
    asset: selectedAsset.value,
    accountBalance: accountBalance.value,
    risk: riskPerTrade.value,
    entry: entryPrice.value,
    stopLoss: stopLossPrice.value,
    positionSize: calculatedPositionSize.value,
    winRate: winRate.value,
    riskRewardRatio: riskRewardRatio.value
  };

  savedPresets.value.push(preset);
  localStorage.setItem('positionSizingPresets', JSON.stringify(savedPresets.value));

  showPresetModal.value = false;
  presetName.value = '';
};

const loadPreset = (preset) => {
  calculationMethod.value = preset.method;
  selectedAsset.value = preset.asset;
  accountBalance.value = preset.accountBalance;
  riskPerTrade.value = preset.risk;
  entryPrice.value = preset.entry;
  stopLossPrice.value = preset.stopLoss;
  winRate.value = preset.winRate;
  riskRewardRatio.value = preset.riskRewardRatio;
};

const deletePreset = (id) => {
  savedPresets.value = savedPresets.value.filter(p => p.id !== id);
  localStorage.setItem('positionSizingPresets', JSON.stringify(savedPresets.value));
};

const resetCalculator = () => {
  calculationMethod.value = 'Fixed Percentage';
  accountBalance.value = 10000;
  riskPerTrade.value = 2;
  selectedAsset.value = 'BTC';
  entryPrice.value = 45000;
  stopLossPrice.value = 44000;
  winRate.value = 55;
  riskRewardRatio.value = 2;
};

// Load real account balance from multiple API keys
const loadRealBalance = async () => {
  try {
    loadingBalance.value = true;
    console.log('💰 Loading real account balance from multiple API keys...');

    // Get cached balances for all API keys
    const balancesResponse = await $fetch('/api/v1/getCachedBalance', {
      query: { userID: userID.value }
    });

    if (balancesResponse && balancesResponse.success && balancesResponse.data) {
      console.log(`✅ Loaded ${balancesResponse.data.length} API key balances`);

      // Calculate total balance in USD across all API keys
      let totalUSD = 0;

      balancesResponse.data.forEach(apiBalance => {
        if (apiBalance.totalUSD) {
          totalUSD += parseFloat(apiBalance.totalUSD) || 0;
        }
      });

      if (totalUSD > 0) {
        accountBalance.value = totalUSD;
        console.log(`💵 Total Account Balance: $${totalUSD.toLocaleString()}`);
      } else {
        // Fallback to default if no balance found
        accountBalance.value = 10000;
        console.log('⚠️ No balance found, using default $10,000');
      }
    }
  } catch (error) {
    console.error('❌ Error loading real balance:', error);
    // Use default on error
    accountBalance.value = 10000;
  } finally {
    loadingBalance.value = false;
  }
};

// Load saved presets
onMounted(async () => {
  // Load real balance first
  await loadRealBalance();

  // Load saved presets
  const saved = localStorage.getItem('positionSizingPresets');
  if (saved) {
    savedPresets.value = JSON.parse(saved);
  }
});
</script>
