<template>
  <div class="profile-container">
    <!-- Header -->
    <!-- <div class="profile-header">
      <h1 class="profile-title">API Configuration</h1>
      <p class="profile-subtitle">Manage your API keys for exchanges, AI providers, and specialized platforms</p>
    </div> -->

    <!-- Tab Navigation -->
    <n-tabs v-model:value="activeTab" type="line" animated size="large" style="margin-bottom: 12px; margin-top: 0;">
      <n-tab-pane name="exchanges" tab="🔄 Exchanges">
    <!-- Add New Exchange Section (MOVED TO TOP) -->
    <div class="add-exchange-section" style="margin-bottom: 24px;">
      <n-card class="add-exchange-card">
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="add-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span style="font-size: 20px; font-weight: 600;">Add New Exchange</span>
          </div>
        </template>

        <n-space vertical :size="20">
          <!-- Exchange Select -->
          <div class="form-group">
            <label class="form-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Select Exchange
            </label>
            <n-select
              v-model:value="selectedExchange"
              :options="availableExchanges"
              placeholder="Choose an exchange..."
              filterable
              size="large"
            >
              <template #option="{ node, option }">
                <div style="display: flex; align-items: center; gap: 12px; padding: 4px 0;">
                  <img
                    :src="getExchangeLogo(option.value)"
                    :alt="option.label"
                    style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px; background: white; padding: 3px;"
                    @error="(e) => e.target.style.display = 'none'"
                  />
                  <span style="font-weight: 500;">{{ option.label }}</span>
                </div>
              </template>
            </n-select>
          </div>

          <!-- API Key Name -->
          <div class="form-group">
            <label class="form-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              API Key Name
            </label>
            <n-input
              v-model:value="apiKeyName"
              placeholder="e.g., 'Main Trading', 'Bot Account', 'Portfolio 1'"
              :maxlength="50"
              size="large"
              clearable
            />
            <span class="form-hint">A friendly name to identify this API key</span>
          </div>

          <!-- API Keys Dynamic Input -->
          <div class="form-group">
            <label class="form-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              API Credentials
            </label>
            <n-dynamic-input
              v-model:value="apiKeys"
              preset="pair"
              key-placeholder="Credential name (e.g., apiKey, secret, passphrase)"
              value-placeholder="Credential value"
            />
            <span class="form-hint">Get these from your exchange's API settings page</span>
          </div>

          <!-- Add Button -->
          <n-button
            type="primary"
            size="large"
            @click="addExchange"
            :disabled="addBtn.disabled || !selectedExchange"
            :loading="addBtn.disabled"
            block
            strong
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            {{ addBtn.text }}
          </n-button>
        </n-space>
      </n-card>
    </div>

    <!-- My API Keys Section (MOVED TO BOTTOM, COLLAPSIBLE) -->
    <n-collapse style="margin-top: 20px;">
      <n-collapse-item title="My API Keys" name="my-keys" class="compact-collapse">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
            <span style="font-size: 14px; font-weight: 600;">My API Keys</span>
            <div style="margin-left: auto; display: flex; gap: 6px;">
              <span class="mini-badge badge-info">
                {{ Object.keys(groupedExchanges).length }} Exchange{{ Object.keys(groupedExchanges).length !== 1 ? 's' : '' }}
              </span>
              <span class="mini-badge badge-success">
                {{ tableData.length }} Key{{ tableData.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </template>

        <!-- API Keys Table -->
        <n-data-table
          v-if="tableData.length > 0"
          :columns="columns"
          :data="tableData"
          :pagination="false"
          :bordered="false"
          size="small"
          class="compact-table"
          style="margin-top: 8px;"
        />

        <!-- Empty State -->
        <n-empty
          v-else
          description="No exchanges configured yet"
          style="padding: 30px 15px;"
        >
          <template #extra>
            <p style="color: #888; margin-top: 6px; font-size: 13px;">Add your first exchange above to get started</p>
          </template>
        </n-empty>
      </n-collapse-item>
    </n-collapse>
      </n-tab-pane>

      <n-tab-pane name="ai" tab="🤖 AI Providers">
        <!-- AI Providers Section -->
    <n-card style="border: 2px solid #667eea;">
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; color: #667eea;">🤖 AI Providers API Keys</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                Configure API keys for multiple AI providers to power your trading bots
              </p>
            </div>
          </div>
          <n-tag :bordered="false" type="info" size="large">
            {{ activeAiCount }} / {{ aiProviders.length }} Active
          </n-tag>
        </div>
      </template>

      <!-- Info Box -->
      <div style="padding: 12px; background: rgba(102, 126, 234, 0.05); border-left: 3px solid #667eea; border-radius: 4px; margin-bottom: 20px;">
        <div style="font-size: 13px; color: #a0a0a0; line-height: 1.6;">
          <strong style="color: #667eea;">ℹ️ About AI Integration:</strong><br/>
          Your AI API keys are securely stored and used for analyzing market conditions, generating trading strategies, and providing grid bot configuration suggestions.
          Each provider offers unique capabilities - configure multiple providers for enhanced analysis.
        </div>
      </div>

      <!-- AI Providers Grid -->
      <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
        <n-gi v-for="provider in aiProviders" :key="provider.id" span="12 800:4">
          <AiApiKeyCard
            :provider="provider"
            :api-key="aiApiKeys[provider.id]"
            :saving="savingStates[provider.id]"
            :deleting="deletingStates[provider.id]"
            @save="(key) => saveAiApiKey(provider.id, key)"
            @delete="deleteAiApiKey(provider.id)"
          />
        </n-gi>
      </n-grid>
    </n-card>
      </n-tab-pane>

      <n-tab-pane name="hyperliquid" tab="⚡ Hyperliquid">
        <n-card style="border: 2px solid #00ffaa;">
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #00ffaa 0%, #00cc88 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <div>
                <h2 style="margin: 0; font-size: 20px; color: #00ffaa;">⚡ Hyperliquid API Keys</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  Configure your Hyperliquid API credentials for ultra-fast perpetual trading
                </p>
              </div>
            </div>
          </template>

          <!-- Info Box -->
          <div style="padding: 12px; background: rgba(0, 255, 170, 0.05); border-left: 3px solid #00ffaa; border-radius: 4px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: #a0a0a0; line-height: 1.6;">
              <strong style="color: #00ffaa;">ℹ️ About Hyperliquid:</strong><br/>
              Hyperliquid is a high-performance perpetual futures DEX with institutional-grade infrastructure.
              Get your API keys from <a href="https://app.hyperliquid.xyz" target="_blank" style="color: #00ffaa;">app.hyperliquid.xyz</a> to enable trading.
            </div>
          </div>

          <!-- Add Hyperliquid API Key Form -->
          <n-space vertical :size="20">
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                API Key Name
              </label>
              <n-input
                v-model:value="hyperliquidKeyName"
                placeholder="e.g., 'Main Account', 'Trading Bot'"
                :maxlength="50"
                size="large"
                clearable
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                Wallet Address
              </label>
              <n-input
                v-model:value="hyperliquidWalletAddress"
                placeholder="0x..."
                size="large"
                clearable
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Private Key
              </label>
              <n-input
                v-model:value="hyperliquidPrivateKey"
                type="password"
                placeholder="Enter your private key (keep this secure!)"
                size="large"
                clearable
                show-password-on="click"
              />
              <span class="form-hint">⚠️ Never share your private key with anyone!</span>
            </div>

            <n-button
              type="primary"
              size="large"
              @click="addHyperliquidKey"
              :disabled="hyperliquidBtn.disabled"
              :loading="hyperliquidBtn.disabled"
              block
              strong
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </template>
              {{ hyperliquidBtn.text }}
            </n-button>
          </n-space>

          <!-- Existing Hyperliquid Keys Table -->
          <n-divider style="margin: 32px 0;" />
          <h3 style="color: #00ffaa; margin-bottom: 16px;">Saved Hyperliquid Keys</h3>
          <n-data-table
            v-if="hyperliquidTableData.length > 0"
            :columns="hyperliquidColumns"
            :data="hyperliquidTableData"
            :pagination="false"
            :bordered="false"
            size="medium"
          />
          <n-empty
            v-else
            description="No Hyperliquid API keys configured"
            style="padding: 40px 20px;"
          />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="specialized" tab="🎯 Specialized">
        <SpecializedPlatformsConfig :userId="userID" />
      </n-tab-pane>

      <n-tab-pane name="referrals" tab="🎁 Referrals">
        <ReferralsTab />
      </n-tab-pane>

      <n-tab-pane name="social" tab="🌐 Social">
        <SocialProfileTab />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { h } from 'vue';
import { NButton, NInput } from "naive-ui";
import SpecializedPlatformsConfig from '~/components/SpecializedPlatformsConfig.vue';
import ReferralsTab from '~/components/ReferralsTab.vue';
import SocialProfileTab from '~/components/SocialProfileTab.vue';

definePageMeta({
  middleware: 'auth'
})

const { getExchangeLogo } = useExchangeLogos();

let userIDCookie = useCookie('userID');
let userID = userIDCookie.value;

// User data for Referrals tab
const username = ref(useCookie('username').value || '');
const profilePicture = ref(useCookie('profilePicture').value || '');
const referralCode = ref(useCookie('referralCode').value || '');
const referredBy = ref(useCookie('referredBy').value || '');

const notification = useNotification();

// Active Tab
const activeTab = ref('exchanges');

const addBtn = ref({
  text: 'Add Exchange',
  disabled: false,
});

// Fetch user exchanges
let userExchanges = await $fetch('/api/v1/fetchUserExchanges', {
  query: {
    userID: userID,
  }
});

const tableData = ref([]);
for (let i = 0; i < userExchanges.data.length; i++) {
  const apiKeysData = userExchanges.data[i].apiKeys;

  if (apiKeysData && apiKeysData.length > 0) {
    if (apiKeysData[0].name !== undefined) {
      // New format
      for (let j = 0; j < apiKeysData.length; j++) {
        tableData.value.push(reactive({
          id: userExchanges.data[i]._id,
          apiKeyIndex: j,
          exchange: userExchanges.data[i].exchange,
          apiKeyName: apiKeysData[j].name,
          apiKeys: apiKeysData[j].keys[0]?.value || 'N/A',
          editing: false,
          editingName: '',
        }));
      }
    } else {
      // Old format
      tableData.value.push(reactive({
        id: userExchanges.data[i]._id,
        apiKeyIndex: 0,
        exchange: userExchanges.data[i].exchange,
        apiKeyName: 'Default',
        apiKeys: apiKeysData[0].value,
        editing: false,
        editingName: '',
      }));
    }
  }
}

// Group API keys by exchange (for stats only)
const groupedExchanges = computed(() => {
  const grouped = {};
  tableData.value.forEach(item => {
    if (!grouped[item.exchange]) {
      grouped[item.exchange] = [];
    }
    grouped[item.exchange].push(item);
  });
  return grouped;
});

// Define table columns
const columns = [
  {
    title: 'Exchange',
    key: 'exchange',
    width: 180,
    render: (row) => {
      return h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
        h('img', {
          src: getExchangeLogo(row.exchange),
          alt: row.exchange,
          style: 'width: 32px; height: 32px; object-fit: contain; border-radius: 6px; background: white; padding: 4px;',
          onerror: (e) => e.target.style.display = 'none'
        }),
        h('span', { style: 'font-weight: 600;' }, row.exchange.toUpperCase())
      ]);
    }
  },
  {
    title: 'API Key Name',
    key: 'apiKeyName',
    width: 200,
    render: (row) => {
      if (row.editing) {
        return h(NInput, {
          value: row.editingName,
          'onUpdate:value': (val) => row.editingName = val,
          size: 'small',
          placeholder: 'Enter name'
        });
      }
      return h('span', { style: 'font-weight: 500;' }, row.apiKeyName);
    }
  },
  {
    title: 'API Key',
    key: 'apiKeys',
    render: (row) => {
      return h('code', {
        style: 'font-family: "Courier New", monospace; color: #ffa500; font-size: 13px; background: rgba(255,165,0,0.1); padding: 4px 8px; border-radius: 4px;'
      }, maskApiKey(row.apiKeys));
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 200,
    align: 'right',
    render: (row) => {
      if (row.editing) {
        return h('div', { style: 'display: flex; gap: 8px; justify-content: flex-end;' }, [
          h(NButton, {
            type: 'success',
            size: 'small',
            onClick: () => saveEditName(row)
          }, { default: () => 'Save' }),
          h(NButton, {
            size: 'small',
            onClick: () => cancelEdit(row)
          }, { default: () => 'Cancel' })
        ]);
      }
      return h('div', { style: 'display: flex; gap: 8px; justify-content: flex-end;' }, [
        h(NButton, {
          type: 'primary',
          size: 'small',
          onClick: () => startEdit(row)
        }, { default: () => 'Edit' }),
        h(NButton, {
          type: 'info',
          size: 'small',
          onClick: () => refreshMarkets(row),
          loading: row.refreshing || false
        }, { default: () => '🔄 Markets' }),
        h(NButton, {
          type: 'error',
          size: 'small',
          onClick: () => deleteKeys(row)
        }, { default: () => 'Delete' })
      ]);
    }
  }
];

// Add data
const apiKeyName = ref('');
const selectedExchange = ref(null);
let exchanges = await $fetch('/api/v1/fetchCCXTExchanges');
let availableExchanges = [];

for (let i = 0; i < exchanges.data.length; i++) {
  availableExchanges.push({
    label: exchanges.data[i],
    value: exchanges.data[i],
  })
}

const apiKeys = ref([
  { key: "apiKey", value: "" },
  { key: "secret", value: "" }
]);

// Helper function to mask API keys
function maskApiKey(key) {
  if (!key || key === 'N/A') return 'N/A';
  if (key.length <= 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}

async function addExchange() {
  for (let i = 0; i < apiKeys.value.length; i++) {
    apiKeys.value[i].value = apiKeys.value[i].value.replace(/\\\\/g, '\\');
    apiKeys.value[i].value = apiKeys.value[i].value.replace(/\\n/g, '\n');
  }

  let data = {
    userID: userID,
    exchange: selectedExchange.value,
    apiKeyName: apiKeyName.value || 'Default',
    apiKeys: apiKeys.value,
  }

  addBtn.value.text = 'Adding...';
  addBtn.value.disabled = true;

  let resp = await $fetch('/api/v1/addUserExchange', {
    method: 'POST',
    body: data
  });

  const addedApiKeys = resp.data.apiKeys;
  if (addedApiKeys && addedApiKeys.length > 0) {
    const lastIndex = addedApiKeys.length - 1;
    tableData.value.push(reactive({
      id: resp.data._id,
      apiKeyIndex: lastIndex,
      exchange: resp.data.exchange,
      apiKeyName: addedApiKeys[lastIndex].name,
      apiKeys: addedApiKeys[lastIndex].keys[0]?.value || 'N/A',
      editing: false,
      editingName: '',
    }));
  }

  notify('success', {
    content: "API Key Added Successfully",
    meta: `${data.apiKeyName} for ${data.exchange.toUpperCase()} has been configured!`,
  });

  // Reset form
  apiKeyName.value = '';
  selectedExchange.value = null;
  apiKeys.value = [
    { key: "apiKey", value: "" },
    { key: "secret", value: "" }
  ];

  addBtn.value.text = 'Add Exchange';
  addBtn.value.disabled = false;
}

function startEdit(row) {
  row.editing = true;
  row.editingName = row.apiKeyName;
}

function cancelEdit(row) {
  row.editing = false;
  row.editingName = '';
}

async function saveEditName(row) {
  if (!row.editingName || row.editingName.trim() === '') {
    notify('warning', {
      content: "Invalid Name",
      meta: "API Key name cannot be empty",
    });
    return;
  }

  let data = {
    userID: userID,
    exchange: row.exchange,
    id: row.id,
    apiKeyIndex: row.apiKeyIndex,
    newName: row.editingName.trim()
  };

  try {
    await $fetch('/api/v1/updateApiKeyName', {
      method: 'POST',
      body: data
    });

    row.apiKeyName = row.editingName.trim();
    row.editing = false;
    row.editingName = '';

    notify('success', {
      content: "Name Updated",
      meta: `API Key renamed to "${row.apiKeyName}"`,
    });
  } catch (error) {
    notify('error', {
      content: "Update Failed",
      meta: error.message || "Failed to update API Key name",
    });
  }
}

async function deleteKeys(row) {
  let data = {
    userID: userID,
    exchange: row.exchange,
    id: row.id,
    apiKeyIndex: row.apiKeyIndex
  }

  try {
    let resp = await $fetch('/api/v1/deleteApiKey', {
      method: 'POST',
      body: data
    });

    if (resp.success) {
      const index = tableData.value.findIndex((obj) =>
        obj.id === row.id && obj.apiKeyIndex === row.apiKeyIndex
      );

      if (index !== -1) {
        tableData.value.splice(index, 1);
      }

      if (resp.deletedExchange) {
        const allIndexes = tableData.value
          .map((obj, idx) => obj.id === row.id ? idx : -1)
          .filter(idx => idx !== -1)
          .reverse();

        allIndexes.forEach(idx => {
          tableData.value.splice(idx, 1);
        });

        notify('info', {
          content: "Exchange Removed",
          meta: `${data.exchange.toUpperCase()} has been deleted (last API key removed)`,
        });
      } else {
        tableData.value.forEach((obj) => {
          if (obj.id === row.id && obj.apiKeyIndex > row.apiKeyIndex) {
            obj.apiKeyIndex = obj.apiKeyIndex - 1;
          }
        });

        notify('success', {
          content: "API Key Deleted",
          meta: `"${row.apiKeyName}" has been removed`,
        });
      }
    } else {
      notify('error', {
        content: "Delete Failed",
        meta: resp.message || "Failed to delete API key",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Delete Error",
      meta: error.message || "An error occurred",
    });
  }
}

async function refreshMarkets(row) {
  // Set refreshing state
  row.refreshing = true;

  try {
    const resp = await $fetch('/api/v1/refreshExchangeMarkets', {
      method: 'POST',
      body: {
        userID: userID,
        exchange: row.exchange
      }
    });

    if (resp.success) {
      notify('success', {
        content: "Markets Updated",
        meta: `${row.exchange.toUpperCase()}: ${resp.totalMarkets} trading pairs loaded`,
        duration: 5000
      });
    } else {
      notify('error', {
        content: "Update Failed",
        meta: resp.message || "Failed to refresh markets",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Refresh Error",
      meta: error.message || "An error occurred while refreshing markets",
    });
  } finally {
    row.refreshing = false;
  }
}

function notify(type, data) {
  notification[type]({
    content: data.content,
    meta: data.meta,
    duration: 3000,
    keepAliveOnHover: true
  });
}

// ==================== AI PROVIDERS CONFIGURATION ====================

const aiProviders = [
  {
    id: 'claude',
    name: 'Claude AI',
    emoji: '🤖',
    description: 'Anthropic Claude 3.5 for advanced market analysis',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    placeholder: 'sk-ant-api03-...',
    link: 'https://console.anthropic.com/settings/keys',
    linkText: 'Anthropic Console',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    emoji: '💬',
    description: 'OpenAI GPT-4 for trading strategies & insights',
    color: '#10a37f',
    gradient: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)',
    placeholder: 'sk-proj-...',
    link: 'https://platform.openai.com/api-keys',
    linkText: 'OpenAI Platform',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12l-4-4v3H3v2h15v3l4-4z"/></svg>'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    emoji: '✨',
    description: 'Google Gemini Pro for multi-modal analysis',
    color: '#4285f4',
    gradient: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
    placeholder: 'AIzaSy...',
    link: 'https://makersuite.google.com/app/apikey',
    linkText: 'Google AI Studio',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  },
  {
    id: 'deepai',
    name: 'DeepAI',
    emoji: '🧠',
    description: 'DeepAI for technical indicator predictions',
    color: '#ff6b6b',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    placeholder: 'quickstart-...',
    link: 'https://deepai.org/dashboard/profile',
    linkText: 'DeepAI Dashboard',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    emoji: '⚡',
    description: 'Cohere for NLP-based market sentiment analysis',
    color: '#39c5bb',
    gradient: 'linear-gradient(135deg, #39c5bb 0%, #2a9d8f 100%)',
    placeholder: 'trial-...',
    link: 'https://dashboard.cohere.com/api-keys',
    linkText: 'Cohere Dashboard',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v10M23 12h-6m-6 0H1"/></svg>'
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    emoji: '🤗',
    description: 'HuggingFace models for custom ML strategies',
    color: '#ffcc00',
    gradient: 'linear-gradient(135deg, #ffcc00 0%, #ff9933 100%)',
    placeholder: 'hf_...',
    link: 'https://huggingface.co/settings/tokens',
    linkText: 'HF Tokens',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'
  },
  {
    id: 'replicate',
    name: 'Replicate',
    emoji: '🔄',
    description: 'Replicate for advanced pattern recognition',
    color: '#ff4b4b',
    gradient: 'linear-gradient(135deg, #ff4b4b 0%, #d63031 100%)',
    placeholder: 'r8_...',
    link: 'https://replicate.com/account/api-tokens',
    linkText: 'Replicate Account',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>'
  },
  {
    id: 'anthropic',
    name: 'Anthropic API',
    emoji: '🎯',
    description: 'Direct Anthropic API for real-time decisions',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
    placeholder: 'sk-ant-...',
    link: 'https://console.anthropic.com/settings/keys',
    linkText: 'Anthropic Console',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    emoji: '🌪️',
    description: 'Mistral for fast European-based AI analysis',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    placeholder: 'mstr-...',
    link: 'https://console.mistral.ai/api-keys',
    linkText: 'Mistral Console',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 4.5,7.5 4.5,16.5 12,22 19.5,16.5 19.5,7.5"/></svg>'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    emoji: '🔍',
    description: 'Perplexity for real-time web-based insights',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    placeholder: 'pplx-...',
    link: 'https://www.perplexity.ai/settings/api',
    linkText: 'Perplexity Settings',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'
  },
  {
    id: 'groq',
    name: 'Groq',
    emoji: '⚙️',
    description: 'Groq for ultra-fast inference speed',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    placeholder: 'gsk_...',
    link: 'https://console.groq.com/keys',
    linkText: 'Groq Console',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z"/></svg>'
  },
  {
    id: 'together',
    name: 'Together AI',
    emoji: '🤝',
    description: 'Together AI for collaborative model inference',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    placeholder: 'together-...',
    link: 'https://api.together.xyz/settings/api-keys',
    linkText: 'Together Settings',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'
  }
];

// AI API Keys State
const aiApiKeys = ref({});
const savingStates = ref({});
const deletingStates = ref({});

// Initialize states
aiProviders.forEach(provider => {
  aiApiKeys.value[provider.id] = '';
  savingStates.value[provider.id] = false;
  deletingStates.value[provider.id] = false;
});

// Count active AI providers
const activeAiCount = computed(() => {
  return Object.values(aiApiKeys.value).filter(key => key && key.length > 0).length;
});

// Fetch all AI API keys
async function fetchAiApiKeys() {
  try {
    const response = await $fetch('/api/v1/getAiApiKeys', {
      query: { userID }
    });

    if (response.success && response.data) {
      Object.assign(aiApiKeys.value, response.data);
    }
  } catch (error) {
    console.error('Failed to fetch AI API keys:', error);
  }
}

// Save AI API Key
async function saveAiApiKey(providerId, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    notify('warning', {
      content: "Invalid API Key",
      meta: "Please enter a valid API key",
    });
    return;
  }

  savingStates.value[providerId] = true;

  try {
    const response = await $fetch('/api/v1/saveAiApiKey', {
      method: 'POST',
      body: {
        userID,
        providerId,
        apiKey: apiKey.trim()
      }
    });

    if (response.success) {
      aiApiKeys.value[providerId] = apiKey.trim();

      const provider = aiProviders.find(p => p.id === providerId);
      notify('success', {
        content: "API Key Saved",
        meta: `${provider.name} API key saved successfully!`,
      });
    } else {
      notify('error', {
        content: "Save Failed",
        meta: response.message || "Failed to save API key",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Error",
      meta: error.message || "An error occurred while saving",
    });
  } finally {
    savingStates.value[providerId] = false;
  }
}

// Delete AI API Key
async function deleteAiApiKey(providerId) {
  deletingStates.value[providerId] = true;

  try {
    const response = await $fetch('/api/v1/deleteAiApiKey', {
      method: 'POST',
      body: { userID, providerId }
    });

    if (response.success) {
      aiApiKeys.value[providerId] = '';

      const provider = aiProviders.find(p => p.id === providerId);
      notify('info', {
        content: "API Key Removed",
        meta: `${provider.name} API key deleted`,
      });
    } else {
      notify('error', {
        content: "Delete Failed",
        meta: response.message || "Failed to delete API key",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Error",
      meta: error.message || "An error occurred while deleting",
    });
  } finally {
    deletingStates.value[providerId] = false;
  }
}

// Fetch AI keys on mount
fetchAiApiKeys();

// ==================== HYPERLIQUID CONFIGURATION ====================

const hyperliquidKeyName = ref('');
const hyperliquidWalletAddress = ref('');
const hyperliquidPrivateKey = ref('');
const hyperliquidBtn = ref({
  text: 'Add Hyperliquid Key',
  disabled: false
});

const hyperliquidTableData = ref([]);

// Hyperliquid table columns
const hyperliquidColumns = [
  {
    title: 'Name',
    key: 'name',
    width: 200,
    render: (row) => h('span', { style: 'font-weight: 600;' }, row.name)
  },
  {
    title: 'Wallet Address',
    key: 'walletAddress',
    render: (row) => {
      return h('code', {
        style: 'font-family: "Courier New", monospace; color: #00ffaa; font-size: 13px; background: rgba(0,255,170,0.1); padding: 4px 8px; border-radius: 4px;'
      }, maskWalletAddress(row.walletAddress));
    }
  },
  {
    title: 'Private Key',
    key: 'privateKey',
    render: (row) => {
      return h('code', {
        style: 'font-family: "Courier New", monospace; color: #ffa500; font-size: 13px; background: rgba(255,165,0,0.1); padding: 4px 8px; border-radius: 4px;'
      }, '••••••••••••••••');
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    align: 'right',
    render: (row) => {
      return h(NButton, {
        type: 'error',
        size: 'small',
        onClick: () => deleteHyperliquidKey(row)
      }, { default: () => 'Delete' });
    }
  }
];

// Helper function to mask wallet address
function maskWalletAddress(address) {
  if (!address) return 'N/A';
  if (address.length <= 10) return '0x••••';
  return address.substring(0, 6) + '••••' + address.substring(address.length - 4);
}

// Add Hyperliquid Key
async function addHyperliquidKey() {
  if (!hyperliquidKeyName.value || !hyperliquidWalletAddress.value || !hyperliquidPrivateKey.value) {
    notify('warning', {
      content: "Missing Information",
      meta: "Please fill in all fields",
    });
    return;
  }

  hyperliquidBtn.value.text = 'Adding...';
  hyperliquidBtn.value.disabled = true;

  try {
    const response = await $fetch('/api/v1/addHyperliquidKey', {
      method: 'POST',
      body: {
        userID,
        name: hyperliquidKeyName.value.trim(),
        walletAddress: hyperliquidWalletAddress.value.trim(),
        privateKey: hyperliquidPrivateKey.value.trim()
      }
    });

    if (response.success) {
      hyperliquidTableData.value.push({
        id: response.data._id,
        name: hyperliquidKeyName.value.trim(),
        walletAddress: hyperliquidWalletAddress.value.trim(),
        privateKey: hyperliquidPrivateKey.value.trim()
      });

      notify('success', {
        content: "Hyperliquid Key Added",
        meta: `${hyperliquidKeyName.value} has been configured!`,
      });

      // Reset form
      hyperliquidKeyName.value = '';
      hyperliquidWalletAddress.value = '';
      hyperliquidPrivateKey.value = '';
    } else {
      notify('error', {
        content: "Failed to Add Key",
        meta: response.message || "An error occurred",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Error",
      meta: error.message || "Failed to add Hyperliquid key",
    });
  } finally {
    hyperliquidBtn.value.text = 'Add Hyperliquid Key';
    hyperliquidBtn.value.disabled = false;
  }
}

// Delete Hyperliquid Key
async function deleteHyperliquidKey(row) {
  try {
    const response = await $fetch('/api/v1/deleteHyperliquidKey', {
      method: 'POST',
      body: {
        userID,
        id: row.id
      }
    });

    if (response.success) {
      const index = hyperliquidTableData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        hyperliquidTableData.value.splice(index, 1);
      }

      notify('info', {
        content: "Key Deleted",
        meta: `${row.name} has been removed`,
      });
    } else {
      notify('error', {
        content: "Delete Failed",
        meta: response.message || "Failed to delete key",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Error",
      meta: error.message || "An error occurred",
    });
  }
}

// Fetch existing Hyperliquid keys
async function fetchHyperliquidKeys() {
  try {
    const response = await $fetch('/api/v1/fetchHyperliquidKeys', {
      query: { userID }
    });

    if (response.success && response.data) {
      hyperliquidTableData.value = response.data.map(item => ({
        id: item._id,
        name: item.name,
        walletAddress: item.walletAddress,
        privateKey: item.privateKey
      }));
    }
  } catch (error) {
    console.error('Failed to fetch Hyperliquid keys:', error);
  }
}

// Fetch Hyperliquid keys on mount
fetchHyperliquidKeys();
</script>

<style scoped>
.profile-container {
  padding: 0 24px 24px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
}

.profile-subtitle {
  font-size: 16px;
  color: #a0a0a0;
  margin: 0;
}

.stats-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.form-label svg {
  color: #667eea;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  padding-left: 4px;
}

.add-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
}

/* Compact collapse styles for My API Keys */
.compact-collapse :deep(.n-collapse-item__header) {
  padding: 10px 12px !important;
}

.compact-collapse :deep(.n-collapse-item__content-wrapper) {
  padding: 8px 12px !important;
}

/* Mini badges for API Keys count */
.mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 10px;
  white-space: nowrap;
}

.badge-info {
  background: rgba(42, 148, 255, 0.15);
  color: #2a94ff;
}

.badge-success {
  background: rgba(24, 160, 88, 0.15);
  color: #18a058;
}

/* Compact table styling */
.compact-table :deep(.n-data-table-th) {
  padding: 8px 12px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
}

.compact-table :deep(.n-data-table-td) {
  padding: 6px 12px !important;
  font-size: 13px !important;
}

.compact-table :deep(.n-data-table-tr) {
  height: auto !important;
}

.compact-table :deep(.n-button) {
  padding: 4px 12px !important;
  font-size: 12px !important;
  height: 28px !important;
}
</style>
