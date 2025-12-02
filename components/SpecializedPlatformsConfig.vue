<template>
  <div class="specialized-platforms">
    <n-space vertical :size="24">
      <!-- Asterdex Card -->
      <n-card style="border: 2px solid #ff6600;">
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 8px; background: linear-gradient(135deg, #ff6600 0%, #ff8800 100%); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; color: #ff6600;">⭐ Asterdex API Keys</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                Configure your Asterdex API credentials (API Key, Secret)
              </p>
            </div>
          </div>
        </template>

        <div style="padding: 12px; background: rgba(255, 102, 0, 0.05); border-left: 3px solid #ff6600; border-radius: 4px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #a0a0a0; line-height: 1.6;">
            <strong style="color: #ff6600;">ℹ️ About Asterdex:</strong><br/>
            Asterdex is a specialized trading platform. Get your API keys from your Asterdex account settings.
          </div>
        </div>

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
              v-model:value="asterdexKeyName"
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
              API Key
            </label>
            <n-input
              v-model:value="asterdexApiKey"
              placeholder="Enter your API Key"
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
              Secret
            </label>
            <n-input
              v-model:value="asterdexSecret"
              type="password"
              placeholder="Enter your Secret"
              size="large"
              clearable
              show-password-on="click"
            />
            <span class="form-hint">⚠️ Keep your secret secure!</span>
          </div>

          <n-button
            type="primary"
            size="large"
            @click="addAsterdexKey"
            :disabled="asterdexBtn.disabled"
            :loading="asterdexBtn.disabled"
            block
            strong
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            {{ asterdexBtn.text }}
          </n-button>
        </n-space>

        <n-divider style="margin: 32px 0;" />
        <h3 style="color: #ff6600; margin-bottom: 16px;">Saved Asterdex Keys</h3>
        <n-data-table
          v-if="asterdexTableData.length > 0"
          :columns="asterdexColumns"
          :data="asterdexTableData"
          :pagination="false"
          :bordered="false"
          size="medium"
        />
        <n-empty
          v-else
          description="No Asterdex API keys configured"
          style="padding: 40px 20px;"
        />
      </n-card>

      <!-- Omni (Apex.exchange) Card -->
      <n-card style="border: 2px solid #00d4ff;">
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 8px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; color: #00d4ff;">🎯 Omni (Apex.Exchange) API Keys</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                Configure your Omni API credentials from apex.exchange (API Key, Passphrase, Secret)
              </p>
            </div>
          </div>
        </template>

        <div style="padding: 12px; background: rgba(0, 212, 255, 0.05); border-left: 3px solid #00d4ff; border-radius: 4px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #a0a0a0; line-height: 1.6;">
            <strong style="color: #00d4ff;">ℹ️ About Omni:</strong><br/>
            Omni (apex.exchange) is a specialized derivatives platform. Get your API keys from <a href="https://omni.apex.exchange" target="_blank" style="color: #00d4ff;">omni.apex.exchange</a>.
          </div>
        </div>

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
              v-model:value="omniKeyName"
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
              API Key
            </label>
            <n-input
              v-model:value="omniApiKey"
              placeholder="Enter your API Key"
              size="large"
              clearable
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              </svg>
              Passphrase
            </label>
            <n-input
              v-model:value="omniPassphrase"
              type="password"
              placeholder="Enter your Passphrase"
              size="large"
              clearable
              show-password-on="click"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Secret
            </label>
            <n-input
              v-model:value="omniSecret"
              type="password"
              placeholder="Enter your Secret"
              size="large"
              clearable
              show-password-on="click"
            />
            <span class="form-hint">⚠️ Keep your secret secure!</span>
          </div>

          <n-button
            type="primary"
            size="large"
            @click="addOmniKey"
            :disabled="omniBtn.disabled"
            :loading="omniBtn.disabled"
            block
            strong
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            {{ omniBtn.text }}
          </n-button>
        </n-space>

        <n-divider style="margin: 32px 0;" />
        <h3 style="color: #00d4ff; margin-bottom: 16px;">Saved Omni Keys</h3>
        <n-data-table
          v-if="omniTableData.length > 0"
          :columns="omniColumns"
          :data="omniTableData"
          :pagination="false"
          :bordered="false"
          size="medium"
        />
        <n-empty
          v-else
          description="No Omni API keys configured"
          style="padding: 40px 20px;"
        />
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { h } from 'vue';
import { NButton } from 'naive-ui';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const notification = useNotification();

// Debug: Log userId when component mounts
console.log('🔍 [SPECIALIZED] Component mounted with userId:', props.userId);

// ==================== ASTERDEX CONFIGURATION ====================

const asterdexKeyName = ref('');
const asterdexApiKey = ref('');
const asterdexSecret = ref('');
const asterdexBtn = ref({
  text: 'Add Asterdex Key',
  disabled: false
});

const asterdexTableData = ref([]);

// Asterdex table columns
const asterdexColumns = [
  {
    title: 'Name',
    key: 'name',
    width: 200,
    render: (row) => h('span', { style: 'font-weight: 600;' }, row.name)
  },
  {
    title: 'API Key',
    key: 'apiKey',
    render: (row) => {
      return h('code', {
        style: 'font-family: "Courier New", monospace; color: #ff6600; font-size: 13px; background: rgba(255,102,0,0.1); padding: 4px 8px; border-radius: 4px;'
      }, maskApiKey(row.apiKey));
    }
  },
  {
    title: 'Secret',
    key: 'secret',
    render: () => {
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
        onClick: () => deleteAsterdexKey(row)
      }, { default: () => 'Delete' });
    }
  }
];

// Helper function to mask API keys
function maskApiKey(key) {
  if (!key) return 'N/A';
  if (key.length <= 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}

// Add Asterdex Key
async function addAsterdexKey() {
  if (!asterdexKeyName.value || !asterdexApiKey.value || !asterdexSecret.value) {
    notify('warning', {
      content: "Missing Information",
      meta: "Please fill in all fields (Name, API Key, Secret)",
    });
    return;
  }

  asterdexBtn.value.text = 'Adding...';
  asterdexBtn.value.disabled = true;

  try {
    const response = await $fetch('/api/v1/addAsterdexKey', {
      method: 'POST',
      body: {
        userID: props.userId,
        name: asterdexKeyName.value.trim(),
        apiKey: asterdexApiKey.value.trim(),
        secret: asterdexSecret.value.trim()
      }
    });

    if (response.success) {
      asterdexTableData.value.push({
        arrayIndex: asterdexTableData.value.length,
        name: asterdexKeyName.value.trim(),
        apiKey: asterdexApiKey.value.trim(),
        secret: asterdexSecret.value.trim(),
        createdAt: new Date()
      });

      notify('success', {
        content: "Asterdex Key Added",
        meta: `${asterdexKeyName.value} has been configured!`,
      });

      // Reset form
      asterdexKeyName.value = '';
      asterdexApiKey.value = '';
      asterdexSecret.value = '';
    } else {
      notify('error', {
        content: "Failed to Add Key",
        meta: response.message || "An error occurred",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Error",
      meta: error.message || "Failed to add Asterdex key",
    });
  } finally {
    asterdexBtn.value.text = 'Add Asterdex Key';
    asterdexBtn.value.disabled = false;
  }
}

// Delete Asterdex Key
async function deleteAsterdexKey(row) {
  try {
    const response = await $fetch('/api/v1/deleteAsterdexKey', {
      method: 'POST',
      body: {
        userID: props.userId,
        arrayIndex: row.arrayIndex
      }
    });

    if (response.success) {
      // Remove from table and re-index
      asterdexTableData.value.splice(row.arrayIndex, 1);
      // Re-index remaining items
      asterdexTableData.value.forEach((item, index) => {
        item.arrayIndex = index;
      });

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

// Fetch existing Asterdex keys
async function fetchAsterdexKeys() {
  try {
    const response = await $fetch('/api/v1/fetchAsterdexKeys', {
      query: { userID: props.userId }
    });

    if (response.success && response.data) {
      asterdexTableData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch Asterdex keys:', error);
  }
}

// ==================== OMNI CONFIGURATION ====================

const omniKeyName = ref('');
const omniApiKey = ref('');
const omniPassphrase = ref('');
const omniSecret = ref('');
const omniBtn = ref({
  text: 'Add Omni Key',
  disabled: false
});

const omniTableData = ref([]);

// Omni table columns
const omniColumns = [
  {
    title: 'Name',
    key: 'name',
    width: 200,
    render: (row) => h('span', { style: 'font-weight: 600;' }, row.name)
  },
  {
    title: 'API Key',
    key: 'apiKey',
    render: (row) => {
      return h('code', {
        style: 'font-family: "Courier New", monospace; color: #00d4ff; font-size: 13px; background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 4px;'
      }, maskApiKey(row.apiKey));
    }
  },
  {
    title: 'Passphrase',
    key: 'passphrase',
    render: () => {
      return h('code', {
        style: 'font-family: "Courier New", monospace; color: #ffa500; font-size: 13px; background: rgba(255,165,0,0.1); padding: 4px 8px; border-radius: 4px;'
      }, '••••••••');
    }
  },
  {
    title: 'Secret',
    key: 'secret',
    render: () => {
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
        onClick: () => deleteOmniKey(row)
      }, { default: () => 'Delete' });
    }
  }
];

// Add Omni Key
async function addOmniKey() {
  if (!omniKeyName.value || !omniApiKey.value || !omniPassphrase.value || !omniSecret.value) {
    notify('warning', {
      content: "Missing Information",
      meta: "Please fill in all fields (Name, API Key, Passphrase, Secret)",
    });
    return;
  }

  omniBtn.value.text = 'Adding...';
  omniBtn.value.disabled = true;

  try {
    const response = await $fetch('/api/v1/addOmniKey', {
      method: 'POST',
      body: {
        userID: props.userId,
        name: omniKeyName.value.trim(),
        apiKey: omniApiKey.value.trim(),
        passphrase: omniPassphrase.value.trim(),
        secret: omniSecret.value.trim()
      }
    });

    if (response.success) {
      omniTableData.value.push({
        arrayIndex: omniTableData.value.length,
        name: omniKeyName.value.trim(),
        apiKey: omniApiKey.value.trim(),
        passphrase: omniPassphrase.value.trim(),
        secret: omniSecret.value.trim(),
        createdAt: new Date()
      });

      notify('success', {
        content: "Omni Key Added",
        meta: `${omniKeyName.value} has been configured!`,
      });

      // Reset form
      omniKeyName.value = '';
      omniApiKey.value = '';
      omniPassphrase.value = '';
      omniSecret.value = '';
    } else {
      notify('error', {
        content: "Failed to Add Key",
        meta: response.message || "An error occurred",
      });
    }
  } catch (error) {
    notify('error', {
      content: "Error",
      meta: error.message || "Failed to add Omni key",
    });
  } finally {
    omniBtn.value.text = 'Add Omni Key';
    omniBtn.value.disabled = false;
  }
}

// Delete Omni Key
async function deleteOmniKey(row) {
  try {
    const response = await $fetch('/api/v1/deleteOmniKey', {
      method: 'POST',
      body: {
        userID: props.userId,
        arrayIndex: row.arrayIndex
      }
    });

    if (response.success) {
      // Remove from table and re-index
      omniTableData.value.splice(row.arrayIndex, 1);
      // Re-index remaining items
      omniTableData.value.forEach((item, index) => {
        item.arrayIndex = index;
      });

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

// Fetch existing Omni keys
async function fetchOmniKeys() {
  try {
    const response = await $fetch('/api/v1/fetchOmniKeys', {
      query: { userID: props.userId }
    });

    if (response.success && response.data) {
      omniTableData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch Omni keys:', error);
  }
}

// Notification helper
function notify(type, data) {
  notification[type]({
    content: data.content,
    meta: data.meta,
    duration: 3000,
    keepAliveOnHover: true
  });
}

// Fetch keys on mount
onMounted(() => {
  fetchAsterdexKeys();
  fetchOmniKeys();
});
</script>

<style scoped>
.specialized-platforms {
  width: 100%;
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
