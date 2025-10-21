<script setup>
import { useAppStore } from '~/stores/app.store';
import { h } from 'vue';

const app = useAppStore();
const userID = useCookie('userID');
const currentExchange = computed(() => app.getUserSelectedExchange);

// API Keys
const availableApiKeys = ref([]);
const selectedApiKeys = ref([]);
const loadingApiKeys = ref(false);
const apiKeyColors = ref({});
const isExpanded = ref(false);

// Generate random color for API key
function generateRandomColor() {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3',
    '#54a0ff', '#48dbfb', '#1dd1a1', '#10ac84', '#ee5a6f',
    '#c7ecee', '#778beb', '#f8b500', '#e056fd', '#686de0'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Custom render function for API key options with colored icons
function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px; flex-shrink: 0;`
    }),
    h('span', { style: 'flex: 1;' }, option.label)
  ]);
}

// Fetch available API keys for current exchange
async function fetchAvailableApiKeys() {
  if (!currentExchange.value || !userID.value) return;

  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/getUserApiKeys', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data) {
      availableApiKeys.value = response.data.map(key => {
        const apiKeyName = key.name || key.apiKeyId;
        if (!apiKeyColors.value[apiKeyName]) {
          apiKeyColors.value[apiKeyName] = generateRandomColor();
        }
        return {
          label: apiKeyName,
          value: apiKeyName
        };
      });

      // Auto-select first API key if none selected
      if (selectedApiKeys.value.length === 0 && availableApiKeys.value.length > 0) {
        selectedApiKeys.value = [availableApiKeys.value[0].value];
        updateStoreApiKeys();
      }
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

// Update store when API keys change
function updateStoreApiKeys() {
  app.setSelectedApiKeys(selectedApiKeys.value);
  console.log('📋 API Selector: Updated store with API keys:', selectedApiKeys.value);
}

// Called when API keys selection changes
function onApiKeysChange() {
  updateStoreApiKeys();
}

// Initialize from store if available
onMounted(() => {
  // Check if store has API keys already
  const storeApiKeys = app.getSelectedApiKeys;
  if (storeApiKeys && storeApiKeys.length > 0) {
    selectedApiKeys.value = [...storeApiKeys];
    console.log('📋 API Selector: Loaded from store:', storeApiKeys);
  }

  fetchAvailableApiKeys();
});

// Watch exchange changes
watch(currentExchange, () => {
  fetchAvailableApiKeys();
});

// Watch for changes in local selectedApiKeys and sync to store
watch(selectedApiKeys, (newKeys) => {
  updateStoreApiKeys();
}, { deep: true });
</script>

<template>
  <div class="api-selector-wrapper" :class="{ collapsed: !isExpanded }">
    <!-- TOGGLE BUTTON -->
    <button class="toggle-btn" @click="isExpanded = !isExpanded">
      <span class="icon">{{ isExpanded ? '◀' : '🔑' }}</span>
    </button>

    <!-- API SELECTOR CONTENT -->
    <div v-show="isExpanded" class="api-content">
      <n-select
        v-model:value="selectedApiKeys"
        :options="availableApiKeys"
        :loading="loadingApiKeys"
        placeholder="Select API Keys"
        :disabled="availableApiKeys.length === 0"
        size="small"
        multiple
        clearable
        filterable
        :max-tag-count="2"
        :render-label="renderApiKeyLabel"
        class="api-select"
        @update:value="onApiKeysChange"
      />

      <div class="api-count">
        {{ selectedApiKeys.length }} API{{ selectedApiKeys.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== API SELECTOR WRAPPER ========== */
.api-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(16, 235, 4, 0.3);
  border-radius: 5px;
  transition: all 0.3s ease;
}

.api-selector-wrapper.collapsed {
  width: auto;
}

/* TOGGLE BUTTON */
.toggle-btn {
  background: rgba(16, 235, 4, 0.1);
  border: 1px solid rgba(16, 235, 4, 0.3);
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(16, 235, 4, 0.2);
  border-color: rgba(16, 235, 4, 0.5);
}

.toggle-btn .icon {
  color: #10eb04;
  font-size: 10px;
  line-height: 1;
}

/* API CONTENT */
.api-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

/* API SELECT - GREEN THEME */
:deep(.api-select .n-base-selection) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(16, 235, 4, 0.3) !important;
  border-radius: 4px !important;
  height: 24px !important;
  min-height: 24px !important;
  max-width: 250px;
  transition: all 0.2s ease !important;
}

:deep(.api-select .n-base-selection:hover) {
  border-color: rgba(16, 235, 4, 0.5) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.api-select .n-base-selection-label) {
  color: #10eb04 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 0 8px !important;
  text-shadow: 0 0 5px rgba(16, 235, 4, 0.5);
}

:deep(.api-select .n-base-selection-tags) {
  padding: 0 4px !important;
}

:deep(.api-select .n-tag) {
  background: rgba(16, 235, 4, 0.15) !important;
  border-color: rgba(16, 235, 4, 0.3) !important;
  color: #10eb04 !important;
  font-size: 8px !important;
  padding: 0 4px !important;
  height: 18px !important;
}

:deep(.api-select .n-base-suffix) {
  color: rgba(16, 235, 4, 0.6) !important;
  font-size: 9px !important;
}

/* API COUNT */
.api-count {
  font-size: 9px;
  font-weight: 700;
  color: #10eb04;
  text-shadow: 0 0 5px rgba(16, 235, 4, 0.5);
  white-space: nowrap;
  padding: 2px 6px;
  background: rgba(16, 235, 4, 0.1);
  border-radius: 3px;
  border: 1px solid rgba(16, 235, 4, 0.3);
}
</style>
