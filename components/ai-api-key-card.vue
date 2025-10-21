<script setup>
import { ref } from 'vue';

const props = defineProps({
  provider: {
    type: Object,
    required: true
  },
  apiKey: {
    type: String,
    default: ''
  },
  saving: {
    type: Boolean,
    default: false
  },
  deleting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'delete']);

const newApiKey = ref('');

function handleSave() {
  emit('save', newApiKey.value);
  newApiKey.value = '';
}

function handleDelete() {
  emit('delete');
}

function maskApiKey(key) {
  if (!key) return 'Not configured';
  if (key.length <= 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}
</script>

<template>
  <n-card :style="`border: 2px solid ${provider.color};`">
    <template #header>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div :style="`padding: 8px; background: ${provider.gradient}; border-radius: 8px;`">
          <div v-html="provider.icon" style="width: 24px; height: 24px; color: #fff;"></div>
        </div>
        <div style="flex: 1;">
          <h3 :style="`margin: 0; font-size: 16px; color: ${provider.color};`">
            {{ provider.emoji }} {{ provider.name }}
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">
            {{ provider.description }}
          </p>
        </div>
      </div>
    </template>

    <n-space vertical :size="12">
      <!-- Status Badge -->
      <div v-if="apiKey" style="padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 6px; border: 1px solid rgba(76, 175, 80, 0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; color: #888; margin-bottom: 3px;">API Key</div>
            <code style="font-family: 'Courier New', monospace; color: #4caf50; font-size: 13px;">
              {{ maskApiKey(apiKey) }}
            </code>
          </div>
          <n-tag :bordered="false" type="success" size="small">Active</n-tag>
        </div>
      </div>

      <div v-else style="padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 6px; border: 1px solid rgba(255, 152, 0, 0.3);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span style="font-size: 12px; color: #ff9800; font-weight: 600;">Not Configured</span>
        </div>
      </div>

      <!-- Input -->
      <n-input
        v-model:value="newApiKey"
        type="password"
        :placeholder="apiKey ? 'Enter new API key to update...' : provider.placeholder"
        size="medium"
        clearable
        show-password-on="click"
      />

      <!-- Link to get API key -->
      <div style="font-size: 11px; color: #888;">
        Get your API key from
        <a :href="provider.link" target="_blank" :style="`color: ${provider.color}; text-decoration: none; font-weight: 600;`">
          {{ provider.linkText }}
        </a>
      </div>

      <!-- Actions -->
      <n-space>
        <n-button
          type="primary"
          size="small"
          @click="handleSave"
          :disabled="!newApiKey || saving"
          :loading="saving"
          :style="`background: ${provider.gradient}; border: none;`"
        >
          {{ apiKey ? 'Update' : 'Save' }}
        </n-button>

        <n-button
          v-if="apiKey"
          type="error"
          size="small"
          @click="handleDelete"
          :loading="deleting"
        >
          Remove
        </n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<style scoped>
a:hover {
  text-decoration: underline !important;
}
</style>
