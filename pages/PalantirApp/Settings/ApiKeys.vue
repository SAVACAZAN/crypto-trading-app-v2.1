<template>
  <div class="palantir-page">
    <div class="page-header">
      <div class="header-icon">🔑</div>
      <div class="header-content">
        <h1 class="page-title">API Keys & Governance</h1>
        <p class="page-subtitle">Manage API keys hierarchy and organizational structure</p>
      </div>
    </div>

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="line" animated size="large">
      <!-- API Keys Tab -->
      <n-tab-pane name="overview" tab="🔑 API Keys">
        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card clickable" @click="showStatDetails('total')">
            <div class="stat-icon" style="color: #00d4ff;">🔑</div>
            <div class="stat-content">
              <div class="stat-value">{{ totalApiKeys }}</div>
              <div class="stat-label">Total API Keys</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('active')">
            <div class="stat-icon" style="color: #10eb04;">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ activeApiKeys }}</div>
              <div class="stat-label">Active Keys</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('exchanges')">
            <div class="stat-icon" style="color: #f5a623;">🌐</div>
            <div class="stat-content">
              <div class="stat-value">{{ supportedExchanges }}</div>
              <div class="stat-label">Exchanges</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('empire')">
            <div class="stat-icon" style="color: #FF6B6B;">👑</div>
            <div class="stat-content">
              <div class="stat-value">{{ governanceStats.empire }}</div>
              <div class="stat-label">Empire</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('coalition')">
            <div class="stat-icon" style="color: #4ECDC4;">🤝</div>
            <div class="stat-content">
              <div class="stat-value">{{ governanceStats.coalition }}</div>
              <div class="stat-label">Coalition</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('federation')">
            <div class="stat-icon" style="color: #45B7D1;">🏛️</div>
            <div class="stat-content">
              <div class="stat-value">{{ governanceStats.federation }}</div>
              <div class="stat-label">Federation</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('alliance')">
            <div class="stat-icon" style="color: #96CEB4;">🔗</div>
            <div class="stat-content">
              <div class="stat-value">{{ governanceStats.alliance }}</div>
              <div class="stat-label">Alliance</div>
            </div>
          </div>

          <div class="stat-card clickable" @click="showStatDetails('unassigned')">
            <div class="stat-icon" style="color: #666;">🔓</div>
            <div class="stat-content">
              <div class="stat-value">{{ unassignedCount }}</div>
              <div class="stat-label">Unassigned</div>
            </div>
          </div>
        </div>

        <!-- Details Modal -->
        <n-modal v-model:show="showModal" preset="card" :style="{ width: '600px' }" :title="modalTitle">
          <div class="modal-content">
            <div v-if="modalData.length === 0" style="text-align: center; padding: 30px; color: #666;">
              <div style="font-size: 48px; margin-bottom: 15px;">{{ modalEmptyIcon }}</div>
              <div>{{ modalEmptyText }}</div>
            </div>

            <div v-else class="keys-list">
              <div v-for="key in modalData" :key="key.id" class="key-item">
                <div class="key-item-header">
                  <span class="key-item-exchange">{{ exchangeIcons[key.exchange] }} {{ key.exchange.toUpperCase() }}</span>
                  <span :class="['key-status-badge', key.active ? 'active' : 'inactive']">
                    {{ key.active ? '🟢 Active' : '🔴 Inactive' }}
                  </span>
                </div>
                <div class="key-item-name">{{ key.name }}</div>
                <div class="key-item-id">{{ key.apiKeyId }}</div>
                <div v-if="keyGovernanceAssignments[key.id]" class="key-item-governance">
                  {{ getGovernanceIcon(keyGovernanceAssignments[key.id]) }} {{ getGovernanceName(keyGovernanceAssignments[key.id]) }}
                </div>
              </div>
            </div>
          </div>
        </n-modal>

        <!-- API Keys by Exchange -->
        <div class="section-title">
          <h2>API Keys by Exchange</h2>
          <p>View your API keys for each exchange</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" style="text-align: center; padding: 40px; color: #888;">
          <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
          <div>Loading API keys...</div>
        </div>

        <!-- No Keys State -->
        <div v-else-if="exchanges.length === 0" style="text-align: center; padding: 40px; color: #888;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔑</div>
          <div>No API keys configured yet</div>
          <p style="margin-top: 12px; font-size: 13px; color: #666;">
            Go to the main Crypto App to add API keys
          </p>
        </div>

        <!-- Exchanges Grid -->
        <div v-else class="exchanges-grid">
          <div v-for="exchange in exchanges" :key="exchange.name" class="exchange-card">
            <div class="exchange-header">
              <div class="exchange-info">
                <span class="exchange-icon">{{ exchange.icon }}</span>
                <div>
                  <span class="exchange-name">{{ exchange.name }}</span>
                  <span class="exchange-count">{{ exchange.keyCount }} keys</span>
                </div>
              </div>
            </div>

            <div class="keys-table-container">
              <table class="keys-table">
                <thead>
                  <tr>
                    <th style="width: 150px;">Name</th>
                    <th style="width: 140px;">API Key ID</th>
                    <th style="width: 80px;">Status</th>
                    <th style="width: 120px;">Governance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="key in exchange.keys" :key="key.id">
                    <td class="key-name">{{ key.name }}</td>
                    <td class="key-id">{{ key.apiKeyId.substring(0, 12) }}...</td>
                    <td>
                      <span :class="['key-status-badge', key.active ? 'active' : 'inactive']">
                        {{ key.active ? '🟢 Active' : '🔴 Inactive' }}
                      </span>
                    </td>
                    <td>
                      <span
                        v-if="keyGovernanceAssignments[key.id]"
                        class="governance-badge"
                        :style="{
                          color: getGovernanceColor(keyGovernanceAssignments[key.id]),
                          borderColor: getGovernanceColor(keyGovernanceAssignments[key.id])
                        }"
                      >
                        {{ getGovernanceIcon(keyGovernanceAssignments[key.id]) }} {{ getGovernanceName(keyGovernanceAssignments[key.id]) }}
                      </span>
                      <span v-else class="governance-badge unassigned">
                        🔓 Unassigned
                      </span>
                    </td>
                  </tr>
                  <tr v-if="exchange.keys.length === 0">
                    <td colspan="4" class="no-keys">
                      <span class="icon">🔑</span>
                      <span class="text">No API keys configured</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <!-- Governance Tab -->
      <n-tab-pane name="governance" tab="🏛️ Governance">
        <!-- Governance Explanation -->
        <div class="governance-header">
          <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #00d4ff;">📌 Organizational Hierarchy</h2>
          <p style="margin: 0; color: #888; font-size: 14px;">
            Assign each API key to a governance level to organize your trading infrastructure
          </p>
        </div>

        <!-- Hierarchy Levels -->
        <div class="hierarchy-grid">
          <div v-for="level in governanceLevels" :key="level.id" class="hierarchy-card">
            <div class="hierarchy-header" :style="{ borderColor: level.color }">
              <span class="hierarchy-icon" :style="{ color: level.color }">{{ level.icon }}</span>
              <div class="hierarchy-info">
                <h3 class="hierarchy-title">{{ level.name }}</h3>
                <p class="hierarchy-desc">{{ level.description }}</p>
                <span class="hierarchy-range" :style="{ color: level.color }">{{ level.range }}</span>
              </div>
            </div>

            <!-- API Keys assigned to this level -->
            <div class="hierarchy-keys">
              <div
                v-for="key in getKeysForLevel(level.id)"
                :key="key.id"
                class="hierarchy-key-item"
              >
                <span class="hierarchy-key-exchange">{{ exchangeIcons[key.exchange] }} {{ key.exchange.toUpperCase() }}</span>
                <span class="hierarchy-key-name">{{ key.name }}</span>
                <button
                  class="hierarchy-key-remove"
                  @click="removeKeyFromLevel(key.id)"
                  title="Remove from this level"
                >
                  ×
                </button>
              </div>

              <!-- Assign button -->
              <button
                class="hierarchy-assign-btn"
                @click="openAssignModal(level.id)"
                :style="{ borderColor: level.color, color: level.color }"
              >
                + Assign API Key
              </button>
            </div>
          </div>
        </div>

        <!-- Unassigned Keys -->
        <div class="unassigned-section">
          <h3 style="color: #00d4ff; margin-bottom: 15px;">🔓 Unassigned API Keys</h3>
          <div class="unassigned-keys">
            <div
              v-for="key in unassignedKeys"
              :key="key.id"
              class="unassigned-key-item"
              draggable="true"
            >
              <span class="unassigned-key-exchange">{{ exchangeIcons[key.exchange] }} {{ key.exchange.toUpperCase() }}</span>
              <span class="unassigned-key-name">{{ key.name }}</span>
              <span class="unassigned-key-id">{{ key.apiKeyId.substring(0, 12) }}...</span>
            </div>
            <div v-if="unassignedKeys.length === 0" style="text-align: center; padding: 30px; color: #666;">
              All API keys have been assigned to governance levels
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

const app = useAppStore();
const userID = useCookie('userID');
const loading = ref(true);
const activeTab = ref('overview');

// Stats
const totalApiKeys = ref(0);
const activeApiKeys = ref(0);
const supportedExchanges = ref(0);

// Modal state
const showModal = ref(false);
const modalTitle = ref('');
const modalData = ref([]);
const modalEmptyIcon = ref('🔑');
const modalEmptyText = ref('No API keys found');

// Governance statistics - computed based on assignments
const governanceStats = computed(() => {
  const stats = {
    empire: 0,
    coalition: 0,
    federation: 0,
    alliance: 0,
    syndicate: 0,
    enterprise: 0,
    directorate: 0,
    organization: 0,
    corporation: 0,
    division: 0
  };

  Object.values(keyGovernanceAssignments.value).forEach(level => {
    if (stats.hasOwnProperty(level)) {
      stats[level]++;
    }
  });

  return stats;
});

const unassignedCount = computed(() => {
  return totalApiKeys.value - Object.keys(keyGovernanceAssignments.value).length;
});

// All API keys grouped by exchange
const allApiKeys = ref([]);
const exchanges = ref([]);

// Governance assignments (key ID -> level ID)
const keyGovernanceAssignments = ref({});

// Exchange icons mapping
const exchangeIcons = {
  'coinbaseadvanced': '🔷',
  'lcx': '🔶',
  'kraken': '🦑',
  'bitrue': '🟣',
  'binance': '🟡'
};

// Governance levels
const governanceLevels = [
  {
    id: 'empire',
    name: 'Empire',
    icon: '👑',
    description: 'Central leadership, super leaders',
    range: '1–2 members',
    color: '#FF6B6B'
  },
  {
    id: 'coalition',
    name: 'Coalition',
    icon: '🤝',
    description: 'Large group of federations/alliances',
    range: '2–5 members',
    color: '#4ECDC4'
  },
  {
    id: 'federation',
    name: 'Federation',
    icon: '🏛️',
    description: 'Large united organizations',
    range: '3–7 members',
    color: '#45B7D1'
  },
  {
    id: 'alliance',
    name: 'Alliance',
    icon: '🔗',
    description: 'Flexible alliances between groups',
    range: '5–15 members',
    color: '#96CEB4'
  },
  {
    id: 'syndicate',
    name: 'Syndicate',
    icon: '💼',
    description: 'Organized groups with precise goals',
    range: '10–30 members',
    color: '#FFEAA7'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: '🏢',
    description: 'Large economic or operational entities',
    range: '15–50 members',
    color: '#DFE6E9'
  },
  {
    id: 'directorate',
    name: 'Directorate',
    icon: '📋',
    description: 'Councils and operational leadership',
    range: '20–100 members',
    color: '#74B9FF'
  },
  {
    id: 'organization',
    name: 'Organization',
    icon: '🏭',
    description: 'General operating structure',
    range: '30–150 members',
    color: '#A29BFE'
  },
  {
    id: 'corporation',
    name: 'Corporation',
    icon: '🏬',
    description: 'Corporate units',
    range: '50–200 members',
    color: '#FD79A8'
  },
  {
    id: 'division',
    name: 'Division',
    icon: '⚙️',
    description: 'Smallest functional level, teams/sections',
    range: '100–500 members',
    color: '#FDCB6E'
  }
];

// Get keys assigned to a specific level
function getKeysForLevel(levelId) {
  return allApiKeys.value.filter(key => keyGovernanceAssignments.value[key.id] === levelId);
}

// Get governance level name by ID
function getGovernanceName(levelId) {
  const level = governanceLevels.find(l => l.id === levelId);
  return level ? level.name : 'Unknown';
}

// Get governance level icon by ID
function getGovernanceIcon(levelId) {
  const level = governanceLevels.find(l => l.id === levelId);
  return level ? level.icon : '❓';
}

// Get governance level color by ID
function getGovernanceColor(levelId) {
  const level = governanceLevels.find(l => l.id === levelId);
  return level ? level.color : '#666';
}

// Get unassigned keys
const unassignedKeys = computed(() => {
  return allApiKeys.value.filter(key => !keyGovernanceAssignments.value[key.id]);
});

// Remove key from level
async function removeKeyFromLevel(keyId) {
  try {
    const response = await $fetch('/api/v1/removeKeyFromGovernanceLevel', {
      method: 'POST',
      body: {
        userID: userID.value,
        apiKeyId: keyId
      }
    });

    if (response.success) {
      delete keyGovernanceAssignments.value[keyId];
      console.log('✅ Removed key from governance level:', keyId);
    } else {
      console.error('❌ Failed to remove key:', response.message);
    }
  } catch (error) {
    console.error('❌ Error removing key from governance level:', error);
  }
}

// Assign key to level
async function assignKeyToLevel(keyId, levelId) {
  const key = allApiKeys.value.find(k => k.id === keyId);
  if (!key) {
    console.error('Key not found:', keyId);
    return;
  }

  try {
    const response = await $fetch('/api/v1/assignKeyToGovernanceLevel', {
      method: 'POST',
      body: {
        userID: userID.value,
        apiKeyId: keyId,
        exchange: key.exchange,
        apiKeyName: key.name,
        governanceLevel: levelId
      }
    });

    if (response.success) {
      keyGovernanceAssignments.value[keyId] = levelId;
      console.log('✅ Assigned key to governance level:', keyId, '->', levelId);
    } else {
      console.error('❌ Failed to assign key:', response.message);
    }
  } catch (error) {
    console.error('❌ Error assigning key to governance level:', error);
  }
}

// Open assign modal
function openAssignModal(levelId) {
  if (unassignedKeys.value.length === 0) {
    alert('All API keys have been assigned. Remove a key from another level first.');
    return;
  }

  // Simple prompt for now - can be enhanced with a modal later
  const keyOptions = unassignedKeys.value.map((key, index) =>
    `${index + 1}. ${key.exchange.toUpperCase()} - ${key.name}`
  ).join('\n');

  const selection = prompt(
    `Select an API key to assign to ${governanceLevels.find(l => l.id === levelId)?.name}:\n\n${keyOptions}\n\nEnter the number:`
  );

  if (selection) {
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < unassignedKeys.value.length) {
      const selectedKey = unassignedKeys.value[index];
      assignKeyToLevel(selectedKey.id, levelId);
    }
  }
}

// Load governance assignments from database
async function loadGovernanceAssignments() {
  try {
    const response = await $fetch('/api/v1/getUserGovernanceAssignments', {
      query: {
        userID: userID.value
      }
    });

    if (response.success && response.map) {
      // Load assignments into reactive object
      Object.keys(response.map).forEach(apiKeyId => {
        keyGovernanceAssignments.value[apiKeyId] = response.map[apiKeyId].level;
      });
      console.log('✅ Loaded governance assignments:', response.map);
    }
  } catch (error) {
    console.error('❌ Error loading governance assignments:', error);
  }
}

// Fetch all API keys for user (same pattern as profile.vue)
async function fetchAllApiKeys() {
  loading.value = true;
  try {
    // Fetch ALL user exchanges from DB (same as profile.vue)
    const userExchangesResponse = await $fetch('/api/v1/fetchUserExchanges', {
      query: {
        userID: userID.value,
      }
    });

    console.log('📦 [ApiKeys] Fetched user exchanges:', userExchangesResponse);

    if (!userExchangesResponse.data || userExchangesResponse.data.length === 0) {
      console.log('⚠️ [ApiKeys] No exchanges found for user');
      exchanges.value = [];
      loading.value = false;
      return;
    }

    const exchangesList = [];
    allApiKeys.value = [];

    // Process each exchange from DB (same logic as profile.vue lines 360-390)
    for (let i = 0; i < userExchangesResponse.data.length; i++) {
      const exchangeData = userExchangesResponse.data[i];
      const apiKeysData = exchangeData.apiKeys;
      const exchangeId = exchangeData.exchange;

      console.log(`🔍 [ApiKeys] Processing exchange ${i}:`, {
        exchangeId,
        apiKeysCount: apiKeysData?.length,
        apiKeysData: apiKeysData
      });

      let keys = [];

      // Extract all API keys from this exchange
      if (apiKeysData && apiKeysData.length > 0) {
        if (apiKeysData[0].name !== undefined) {
          // New format - multiple API keys with names
          console.log(`✅ [ApiKeys] New format detected for ${exchangeId}`);
          for (let j = 0; j < apiKeysData.length; j++) {
            const key = {
              id: `${exchangeData._id}_${j}`,
              name: apiKeysData[j].name,
              apiKeyId: apiKeysData[j].keys[0]?.value || 'N/A',
              active: apiKeysData[j].isActive !== false,
              exchange: exchangeId
            };
            keys.push(key);
            console.log(`  ➡️ Key ${j}:`, key);
          }
        } else {
          // Old format - single API key
          console.log(`⚠️ [ApiKeys] Old format detected for ${exchangeId}`);
          keys.push({
            id: exchangeData._id,
            name: 'Default',
            apiKeyId: apiKeysData[0]?.value || 'N/A',
            active: true,
            exchange: exchangeId
          });
        }
      }

      allApiKeys.value.push(...keys);

      // Add exchange to list
      exchangesList.push({
        name: exchangeId.toUpperCase(),
        icon: exchangeIcons[exchangeId] || '🔑',
        keyCount: keys.length,
        keys: keys,
        exchangeId: exchangeId
      });
    }

    console.log('📊 [ApiKeys] Final results:', {
      totalExchanges: exchangesList.length,
      totalKeys: allApiKeys.value.length,
      exchanges: exchangesList
    });

    exchanges.value = exchangesList;

    // Calculate stats
    totalApiKeys.value = allApiKeys.value.length;
    activeApiKeys.value = allApiKeys.value.filter(k => k.active).length;
    supportedExchanges.value = exchangesList.length;

  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loading.value = false;
  }
}

// Show stat details in modal
function showStatDetails(type) {
  let keys = [];

  switch (type) {
    case 'total':
      modalTitle.value = '🔑 All API Keys';
      keys = allApiKeys.value;
      modalEmptyIcon.value = '🔑';
      modalEmptyText.value = 'No API keys configured';
      break;

    case 'active':
      modalTitle.value = '✅ Active API Keys';
      keys = allApiKeys.value.filter(k => k.active);
      modalEmptyIcon.value = '✅';
      modalEmptyText.value = 'No active API keys';
      break;

    case 'exchanges':
      modalTitle.value = '🌐 Exchanges Overview';
      modalData.value = exchanges.value.map(ex => ({
        id: ex.exchangeId,
        exchange: ex.exchangeId,
        name: ex.name,
        apiKeyId: `${ex.keyCount} API keys configured`,
        active: true
      }));
      showModal.value = true;
      return;

    case 'empire':
    case 'coalition':
    case 'federation':
    case 'alliance':
      const level = governanceLevels.find(l => l.id === type);
      modalTitle.value = `${level.icon} ${level.name}`;
      keys = getKeysForLevel(type);
      modalEmptyIcon.value = level.icon;
      modalEmptyText.value = `No API keys assigned to ${level.name}`;
      break;

    case 'unassigned':
      modalTitle.value = '🔓 Unassigned API Keys';
      keys = unassignedKeys.value;
      modalEmptyIcon.value = '🔓';
      modalEmptyText.value = 'All API keys have been assigned';
      break;

    default:
      keys = [];
  }

  modalData.value = keys;
  showModal.value = true;
}

onMounted(async () => {
  await fetchAllApiKeys();
  await loadGovernanceAssignments();
});
</script>

<style scoped>
.palantir-page {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #0f3460;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 48px;
  filter: drop-shadow(0 0 10px rgba(0,212,255,0.5));
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 32px;
  color: #00d4ff;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0,212,255,0.5);
}

.page-subtitle {
  margin: 8px 0 0 0;
  color: #888;
  font-size: 14px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(15,52,96,0.2);
  border: 1px solid #0f3460;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-4px);
  border-color: #00d4ff;
  box-shadow: 0 8px 20px rgba(0,212,255,0.3);
  background: rgba(0,212,255,0.05);
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.section-title h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #00d4ff;
  font-weight: 700;
}

.section-title p {
  margin: 0;
  font-size: 13px;
  color: #888;
}

.exchanges-grid {
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

.exchange-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid #222;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.exchange-card:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0,212,255,0.2);
}

.exchange-header {
  background: rgba(0,212,255,0.05);
  border-bottom: 1px solid #222;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exchange-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exchange-icon {
  font-size: 32px;
}

.exchange-name {
  display: block;
  font-size: 16px;
  color: #00d4ff;
  font-weight: 600;
}

.exchange-count {
  display: block;
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

/* Compact Table Styles */
.keys-table-container {
  padding: 0;
  overflow-x: auto;
}

.keys-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.keys-table thead tr {
  background: rgba(0,212,255,0.05);
  border-bottom: 1px solid #333;
}

.keys-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #00d4ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  height: 30px;
}

.keys-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s ease;
  height: 33px;
  max-height: 33px;
}

.keys-table tbody tr:hover {
  background: rgba(0,212,255,0.05);
}

.keys-table td {
  padding: 6px 12px;
  vertical-align: middle;
  height: 33px;
  max-height: 33px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.key-name {
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

.key-id {
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.key-status-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 10px;
  display: inline-block;
  line-height: 1;
}

.key-status-badge.active {
  background: rgba(16,235,4,0.15);
  color: #10eb04;
  border: 1px solid rgba(16,235,4,0.3);
}

.key-status-badge.inactive {
  background: rgba(245,42,9,0.15);
  color: #f52a09;
  border: 1px solid rgba(245,42,9,0.3);
}

.governance-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
  display: inline-block;
  line-height: 1;
  background: rgba(0,0,0,0.3);
}

.governance-badge.unassigned {
  color: #666;
  border-color: #444;
  background: rgba(0,0,0,0.2);
}

.no-keys {
  padding: 30px;
  text-align: center;
  color: #666;
}

.no-keys .icon {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
  opacity: 0.5;
}

.no-keys .text {
  font-size: 13px;
}

/* Governance Styles */
.governance-header {
  background: rgba(15,52,96,0.2);
  border: 1px solid #0f3460;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.hierarchy-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.hierarchy-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid #222;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hierarchy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,212,255,0.15);
}

.hierarchy-header {
  padding: 15px;
  border-bottom: 2px solid;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.hierarchy-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.hierarchy-info {
  flex: 1;
}

.hierarchy-title {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #fff;
  font-weight: 700;
}

.hierarchy-desc {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

.hierarchy-range {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
  display: inline-block;
}

.hierarchy-keys {
  padding: 15px;
  display: grid;
  gap: 8px;
}

.hierarchy-key-item {
  background: rgba(0,212,255,0.05);
  border: 1px solid rgba(0,212,255,0.2);
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.hierarchy-key-exchange {
  color: #00d4ff;
  font-weight: 600;
}

.hierarchy-key-name {
  flex: 1;
  color: #fff;
}

.hierarchy-key-remove {
  width: 20px;
  height: 20px;
  background: rgba(245,42,9,0.2);
  border: 1px solid #f52a09;
  border-radius: 3px;
  color: #f52a09;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.hierarchy-key-remove:hover {
  background: rgba(245,42,9,0.3);
}

.hierarchy-assign-btn {
  padding: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px dashed;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.hierarchy-assign-btn:hover {
  background: rgba(0,212,255,0.1);
}

.unassigned-section {
  background: rgba(15,52,96,0.2);
  border: 1px solid #0f3460;
  padding: 20px;
  border-radius: 8px;
}

.unassigned-keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 15px;
}

.unassigned-key-item {
  background: rgba(0,0,0,0.3);
  border: 1px solid #333;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: move;
  transition: all 0.2s ease;
}

.unassigned-key-item:hover {
  border-color: #00d4ff;
  background: rgba(0,212,255,0.05);
}

.unassigned-key-exchange {
  color: #00d4ff;
  font-size: 11px;
  font-weight: 600;
}

.unassigned-key-name {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.unassigned-key-id {
  color: #666;
  font-size: 10px;
  font-family: monospace;
}

/* Modal Content Styles */
.modal-content {
  max-height: 500px;
  overflow-y: auto;
}

.keys-list {
  display: grid;
  gap: 12px;
}

.key-item {
  background: rgba(0,212,255,0.05);
  border: 1px solid rgba(0,212,255,0.2);
  padding: 15px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.key-item:hover {
  border-color: #00d4ff;
  background: rgba(0,212,255,0.1);
  transform: translateX(4px);
}

.key-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.key-item-exchange {
  font-size: 13px;
  font-weight: 700;
  color: #00d4ff;
}

.key-item-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.key-item-id {
  font-size: 12px;
  color: #888;
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
}

.key-item-governance {
  font-size: 12px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
  display: inline-block;
  font-weight: 600;
  color: #10eb04;
}
</style>
