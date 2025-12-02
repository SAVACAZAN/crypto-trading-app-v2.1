<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #00d4ff;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none; transition: color 0.3s;">
            ←
          </NuxtLink>
          <div style="font-size: 24px;">⛓️</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #00d4ff; font-weight: 700;">FAZA 1: BOT CHAINS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Event-Driven Automation System</p>
          </div>
        </div>
        <n-button type="primary" size="small" @click="showCreateChainModal = true" style="background: #00d4ff; border: none; font-size: 11px; font-weight: 600;">
          + CREATE NEW CHAIN
        </n-button>
      </div>
    </div>

    <!-- Active Chains Grid -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
      <div v-for="chain in activeChains" :key="chain.chainId"
           style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">

        <!-- Chain Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div :style="`width: 10px; height: 10px; border-radius: 50%; background: ${chain.enabled ? '#10eb04' : '#666'}; box-shadow: ${chain.enabled ? '0 0 10px rgba(16,235,4,0.5)' : 'none'};`"></div>
            <span style="color: #00d4ff; font-size: 14px; font-weight: 600;">{{ chain.name }}</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <n-button size="tiny" @click="toggleChain(chain.chainId)" :style="`background: ${chain.enabled ? '#f52a09' : '#10eb04'}; border: none;`">
              {{ chain.enabled ? 'STOP' : 'START' }}
            </n-button>
            <n-button size="tiny" @click="editChain(chain)" style="background: #00d4ff; border: none;">
              EDIT
            </n-button>
            <n-button size="tiny" @click="deleteChain(chain.chainId)" style="background: #666; border: none;">
              🗑️
            </n-button>
          </div>
        </div>

        <!-- Chain Visualization -->
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div v-for="(node, index) in chain.nodes" :key="node.nodeId" style="display: flex; align-items: center; gap: 8px;">
              <!-- Node -->
              <div :style="`background: ${getNodeColor(node.status)}; padding: 6px 10px; border-radius: 4px; border: 1px solid ${getNodeBorderColor(node.status)};`">
                <div style="font-size: 9px; color: #888; margin-bottom: 2px;">{{ node.type }}</div>
                <div style="font-size: 11px; color: #fff; font-weight: 600;">{{ node.config.strategy || 'N/A' }}</div>
                <div style="font-size: 8px; color: #ccc; margin-top: 2px;">
                  {{ getNodeStatusIcon(node.status) }} {{ node.status }}
                </div>
              </div>

              <!-- Arrow -->
              <div v-if="index < chain.nodes.length - 1" style="color: #00d4ff; font-size: 16px;">→</div>
            </div>
          </div>
        </div>

        <!-- Chain Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 9px; color: #888;">CURRENT NODE</div>
            <div style="font-size: 12px; color: #00d4ff; font-weight: 600;">{{ chain.currentNode || 'N/A' }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 9px; color: #888;">EXECUTIONS</div>
            <div style="font-size: 12px; color: #10eb04; font-weight: 600;">{{ chain.executionCount || 0 }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
            <div style="font-size: 9px; color: #888;">SUCCESS RATE</div>
            <div style="font-size: 12px; color: #f5a623; font-weight: 600;">{{ chain.successRate || 0 }}%</div>
          </div>
        </div>

        <!-- Last Execution -->
        <div v-if="chain.lastExecution" style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; font-size: 10px;">
          <span style="color: #888;">Last execution:</span>
          <span style="color: #ccc; margin-left: 6px;">{{ formatDate(chain.lastExecution) }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="activeChains.length === 0" style="grid-column: 1 / -1; background: rgba(15,52,96,0.2); border: 2px dashed #0f3460; border-radius: 8px; padding: 40px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">⛓️</div>
        <div style="color: #666; font-size: 14px; margin-bottom: 10px;">No bot chains created yet</div>
        <n-button type="primary" @click="showCreateChainModal = true" style="background: #00d4ff; border: none;">
          Create Your First Chain
        </n-button>
      </div>
    </div>

    <!-- Chain Templates -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; border-radius: 8px; padding: 15px;">
      <div style="color: #00d4ff; font-size: 14px; font-weight: 600; margin-bottom: 12px;">📋 CHAIN TEMPLATES</div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <!-- Template 1: Buy-Sell Cascade -->
        <div @click="useTemplate('buy-sell-cascade')" class="template-card" style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid #0f3460; cursor: pointer; transition: all 0.3s;">
          <div style="font-size: 11px; color: #10eb04; font-weight: 600; margin-bottom: 6px;">BUY → SELL CASCADE</div>
          <div style="font-size: 9px; color: #888; line-height: 1.4; margin-bottom: 8px;">
            Grid BUY → When profit 8% → Grid SELL → When filled 50% → DCA Bot
          </div>
          <div style="font-size: 8px; color: #00d4ff;">Use Template →</div>
        </div>

        <!-- Template 2: Scalping Chain -->
        <div @click="useTemplate('scalping-chain')" class="template-card" style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid #0f3460; cursor: pointer; transition: all 0.3s;">
          <div style="font-size: 11px; color: #f5a623; font-weight: 600; margin-bottom: 6px;">QUICK SCALP CHAIN</div>
          <div style="font-size: 9px; color: #888; line-height: 1.4; margin-bottom: 8px;">
            FrontRun → When price up 3% → Scalping Bot → When profit 2% → Auto SELL
          </div>
          <div style="font-size: 8px; color: #00d4ff;">Use Template →</div>
        </div>

        <!-- Template 3: Risk Management -->
        <div @click="useTemplate('risk-management')" class="template-card" style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid #0f3460; cursor: pointer; transition: all 0.3s;">
          <div style="font-size: 11px; color: #f52a09; font-weight: 600; margin-bottom: 6px;">RISK MANAGEMENT</div>
          <div style="font-size: 9px; color: #888; line-height: 1.4; margin-bottom: 8px;">
            Any Bot → When loss -5% → Cancel all orders → Start DCA Recovery
          </div>
          <div style="font-size: 8px; color: #00d4ff;">Use Template →</div>
        </div>
      </div>
    </div>

    <!-- Create Chain Modal -->
    <n-modal v-model:show="showCreateChainModal" preset="card" style="width: 800px; background: #1a1a2e; border: 1px solid #00d4ff;">
      <template #header>
        <div style="color: #00d4ff; font-size: 16px; font-weight: 700;">⛓️ CREATE BOT CHAIN</div>
      </template>

      <div style="padding: 15px;">
        <!-- Chain Name -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Chain Name</div>
          <n-input v-model:value="newChain.name" placeholder="e.g., BTC Buy-Sell Cascade" size="small" />
        </div>

        <!-- Nodes Builder -->
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Bot Nodes</div>

          <div v-for="(node, index) in newChain.nodes" :key="index" style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #0f3460;">
            <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 10px;">
              <div style="color: #00d4ff; font-size: 12px; font-weight: 600;">Node {{ index + 1 }}</div>
              <n-button v-if="index > 0" size="tiny" @click="removeNode(index)" style="background: #f52a09; border: none; font-size: 9px;">
                REMOVE
              </n-button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Bot Type</div>
                <n-select v-model:value="node.type" :options="botTypeOptions" size="small" />
              </div>
              <div>
                <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Strategy</div>
                <n-select v-model:value="node.config.strategy" :options="strategyOptions" size="small" />
              </div>
            </div>

            <!-- Trigger Condition (if not last node) -->
            <div v-if="index < newChain.nodes.length - 1" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #0f3460;">
              <div style="font-size: 9px; color: #888; margin-bottom: 6px;">🎯 Trigger for Next Node</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <n-select v-model:value="node.trigger.event" :options="triggerEventOptions" size="small" />
                <n-select v-model:value="node.trigger.operator" :options="operatorOptions" size="small" />
                <n-input-number v-model:value="node.trigger.value" size="small" :min="0" />
              </div>
            </div>
          </div>

          <n-button @click="addNode" size="small" style="background: #10eb04; border: none; font-size: 11px; width: 100%;">
            + ADD NODE
          </n-button>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
          <n-button @click="showCreateChainModal = false" size="small" style="background: #666; border: none;">
            CANCEL
          </n-button>
          <n-button @click="createChain" type="primary" size="small" style="background: #00d4ff; border: none; font-weight: 600;">
            CREATE CHAIN
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const app = useAppStore();
const userID = useCookie('userID');

const activeChains = ref([]);
const showCreateChainModal = ref(false);

const newChain = ref({
  name: '',
  nodes: [
    {
      type: 'GridBot',
      config: { strategy: 'BUY' },
      trigger: { event: 'profit_reached', operator: '>=', value: 8 }
    }
  ]
});

const botTypeOptions = [
  { label: '⚡ GridBot+', value: 'GridBotPlus' },
  { label: '📊 GridBot', value: 'GridBot' },
  { label: '🏃 FrontRun', value: 'FrontRunBot' },
  { label: '🎯 Scalping', value: 'Scalp1ngBot' },
  { label: '🖱️ OneClick', value: 'OneClickBot' },
  { label: '📈 FibBot', value: 'FibBot' },
  { label: '🧠 AI Bot', value: 'AIBot' },
  { label: '✈️ Co-Pilot', value: 'CoPilotBot' },
  { label: '📊 DCA + Grid', value: 'DCAGridBot' },
  { label: '🎯 Smart DCA', value: 'SmartDCABot' },
  { label: '⚙️ Grinder', value: 'GrinderBot' },
  { label: '📖 OrderBook', value: 'OrderBookBot' }
];

const strategyOptions = [
  { label: 'BUY', value: 'BUY' },
  { label: 'SELL', value: 'SELL' }
];

const triggerEventOptions = [
  { label: 'Profit Reached', value: 'profit_reached' },
  { label: 'Loss Limit', value: 'loss_limit' },
  { label: 'Orders Filled %', value: 'orders_filled' },
  { label: 'Time Elapsed', value: 'time_elapsed' }
];

const operatorOptions = [
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' }
];

const getNodeColor = (status) => {
  switch(status) {
    case 'active': return 'rgba(16,235,4,0.2)';
    case 'completed': return 'rgba(0,212,255,0.2)';
    case 'waiting': return 'rgba(102,102,102,0.2)';
    default: return 'rgba(0,0,0,0.3)';
  }
};

const getNodeBorderColor = (status) => {
  switch(status) {
    case 'active': return '#10eb04';
    case 'completed': return '#00d4ff';
    case 'waiting': return '#666';
    default: return '#0f3460';
  }
};

const getNodeStatusIcon = (status) => {
  switch(status) {
    case 'active': return '⏳';
    case 'completed': return '✅';
    case 'waiting': return '⏸️';
    default: return '⚪';
  }
};

const addNode = () => {
  newChain.value.nodes.push({
    type: 'GridBot',
    config: { strategy: 'BUY' },
    trigger: { event: 'profit_reached', operator: '>=', value: 5 }
  });
};

const removeNode = (index) => {
  newChain.value.nodes.splice(index, 1);
};

const createChain = async () => {
  try {
    if (!newChain.value.name || newChain.value.nodes.length === 0) {
      console.error('Chain name or nodes missing');
      return;
    }

    const chainData = {
      userId: userID.value,
      name: newChain.value.name,
      nodes: newChain.value.nodes
    };

    console.log('📝 Creating bot chain:', chainData);

    const response = await $fetch('/api/v1/createBotChain', {
      method: 'POST',
      body: chainData
    });

    if (response.success) {
      console.log('✅ Bot chain created successfully:', response.data);
      showCreateChainModal.value = false;

      // Reset form
      newChain.value = {
        name: '',
        nodes: [
          {
            type: 'GridBot',
            config: { strategy: 'BUY' },
            trigger: { event: 'profit_reached', operator: '>=', value: 8 }
          }
        ]
      };

      await loadChains();
    } else {
      console.error('❌ Failed to create chain:', response.error);
    }
  } catch (error) {
    console.error('❌ Error creating chain:', error);
  }
};

const toggleChain = async (chainId) => {
  try {
    console.log('🔄 Toggling chain:', chainId);

    const response = await $fetch('/api/v1/toggleBotChain', {
      method: 'POST',
      body: {
        chainId,
        userId: userID.value
      }
    });

    if (response.success) {
      console.log('✅ Chain toggled successfully');
      await loadChains();
    } else {
      console.error('❌ Failed to toggle chain:', response.error);
    }
  } catch (error) {
    console.error('❌ Error toggling chain:', error);
  }
};

const editChain = (chain) => {
  // TODO: Implement edit functionality
  console.log('Editing chain:', chain);
};

const deleteChain = async (chainId) => {
  try {
    console.log('🗑️ Deleting chain:', chainId);

    const response = await $fetch(`/api/v1/deleteBotChain?chainId=${chainId}&userId=${userID.value}`, {
      method: 'DELETE'
    });

    if (response.success) {
      console.log('✅ Chain deleted successfully');
      await loadChains();
    } else {
      console.error('❌ Failed to delete chain:', response.error);
    }
  } catch (error) {
    console.error('❌ Error deleting chain:', error);
  }
};

const useTemplate = (templateId) => {
  const templates = {
    'buy-sell-cascade': {
      name: 'BTC Buy-Sell Cascade',
      nodes: [
        {
          type: 'GridBot',
          config: { strategy: 'BUY', range: [-10, -5], grids: 20 },
          trigger: { event: 'profit_reached', operator: '>=', value: 8 }
        },
        {
          type: 'GridBot',
          config: { strategy: 'SELL', range: [5, 15], grids: 15 },
          trigger: { event: 'orders_filled', operator: '>=', value: 50 }
        },
        {
          type: 'DCABot',
          config: { strategy: 'BUY', interval: '1h' },
          trigger: null
        }
      ]
    },
    'scalping-chain': {
      name: 'Quick Scalp Chain',
      nodes: [
        {
          type: 'FrontRunBot',
          config: { strategy: 'BUY' },
          trigger: { event: 'profit_reached', operator: '>=', value: 3 }
        },
        {
          type: 'Scalp1ngBot',
          config: { strategy: 'BUY' },
          trigger: { event: 'profit_reached', operator: '>=', value: 2 }
        }
      ]
    },
    'risk-management': {
      name: 'Risk Management Chain',
      nodes: [
        {
          type: 'GridBot',
          config: { strategy: 'BUY' },
          trigger: { event: 'loss_limit', operator: '<=', value: -5 }
        },
        {
          type: 'DCABot',
          config: { strategy: 'BUY' },
          trigger: null
        }
      ]
    }
  };

  newChain.value = templates[templateId];
  showCreateChainModal.value = true;
};

const loadChains = async () => {
  try {
    console.log('📥 Loading bot chains for user:', userID.value);

    const response = await $fetch('/api/v1/fetchBotChains', {
      query: {
        userId: userID.value
      }
    });

    if (response.success) {
      activeChains.value = response.data;
      console.log(`✅ Loaded ${response.count} bot chains`);
    } else {
      console.error('❌ Failed to load chains:', response.error);
      activeChains.value = [];
    }
  } catch (error) {
    console.error('❌ Error loading chains:', error);
    activeChains.value = [];
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  loadChains();
});
</script>

<style scoped>
.template-card:hover {
  border-color: #00d4ff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,212,255,0.2);
}
</style>
