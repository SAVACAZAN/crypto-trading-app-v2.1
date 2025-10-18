<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="profile-header">
      <h1 class="profile-title">Exchange Configuration</h1>
      <p class="profile-subtitle">Manage your API keys for multiple exchanges</p>
    </div>

    <!-- My Exchanges Section -->
    <n-card title="My API Keys" style="margin-bottom: 24px;">
      <template #header-extra>
        <div class="stats-badges">
          <n-tag :bordered="false" type="info">
            {{ Object.keys(groupedExchanges).length }} Exchange{{ Object.keys(groupedExchanges).length !== 1 ? 's' : '' }}
          </n-tag>
          <n-tag :bordered="false" type="success">
            {{ tableData.length }} API Key{{ tableData.length !== 1 ? 's' : '' }}
          </n-tag>
        </div>
      </template>

      <!-- API Keys Table -->
      <n-data-table
        v-if="tableData.length > 0"
        :columns="columns"
        :data="tableData"
        :pagination="false"
        :bordered="false"
        size="medium"
      />

      <!-- Empty State -->
      <n-empty
        v-else
        description="No exchanges configured yet"
        style="padding: 60px 20px;"
      >
        <template #extra>
          <p style="color: #888; margin-top: 8px;">Add your first exchange below to get started</p>
        </template>
      </n-empty>
    </n-card>

    <!-- Add New Exchange Section -->
    <div class="add-exchange-section">
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
  </div>
</template>

<script setup>
import { h } from 'vue';
import { NButton, NInput } from "naive-ui";

definePageMeta({
  middleware: 'auth'
})

const { getExchangeLogo } = useExchangeLogos();

let userIDCookie = useCookie('userID');
let userID = userIDCookie.value;

const notification = useNotification();

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

function notify(type, data) {
  notification[type]({
    content: data.content,
    meta: data.meta,
    duration: 3000,
    keepAliveOnHover: true
  });
}
</script>

<style scoped>
.profile-container {
  padding: 24px;
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
</style>
