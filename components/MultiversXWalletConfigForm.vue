<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['generate', 'cancel']);

// Form state
const walletName = ref('');
const useCustomMnemonic = ref(false);
const customMnemonic = ref('');
const accountIndex = ref(0);
const generateMultiple = ref(false);
const walletCount = ref(1);

// Validation
const isValid = computed(() => {
  if (useCustomMnemonic.value) {
    const words = customMnemonic.value.trim().split(/\s+/);
    return words.length === 24 && walletName.value.trim().length > 0;
  }
  return walletName.value.trim().length > 0;
});

const mnemonicWordCount = computed(() => {
  if (!customMnemonic.value.trim()) return 0;
  return customMnemonic.value.trim().split(/\s+/).length;
});

function handleGenerate() {
  if (!isValid.value) {
    window.$message?.error('Please fill in all required fields!');
    return;
  }

  const config = {
    walletName: walletName.value.trim(),
    useCustomMnemonic: useCustomMnemonic.value,
    customMnemonic: useCustomMnemonic.value ? customMnemonic.value.trim() : null,
    accountIndex: accountIndex.value,
    count: generateMultiple.value ? walletCount.value : 1
  };

  emit('generate', config);
}

function handleCancel() {
  emit('cancel');
}

function generateSampleMnemonic() {
  // This is just a placeholder - actual generation happens on backend
  customMnemonic.value = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';
  window.$message?.warning('This is a sample mnemonic for testing. Use backend-generated mnemonic for real wallets!');
}
</script>

<template>
  <div class="multiversx-wallet-config">
    <!-- Header -->
    <n-alert type="info" style="margin-bottom: 20px;">
      <template #icon>
        <span style="font-size: 24px;">🔷</span>
      </template>
      <strong>Configure MultiversX Wallet</strong><br>
      Generate secure EGLD wallets with BIP44 derivation (m/44'/508'/account'/0'/0')
    </n-alert>

    <!-- Info Card -->
    <n-card size="small" style="margin-bottom: 20px;">
      <n-alert type="success">
        <template #icon>
          <span style="font-size: 20px;">✅</span>
        </template>
        <strong>MultiversX Wallet Features:</strong>
        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
          <span>🔑 24-word mnemonic (BIP39 standard)</span>
          <span>🌐 Address format: erd1... (bech32)</span>
          <span>⚡ Native staking support</span>
          <span>🔐 HD wallet derivation (BIP44)</span>
          <span>💎 EGLD native token</span>
        </div>
      </n-alert>
    </n-card>

    <!-- Wallet Name -->
    <n-card title="📝 Wallet Information" size="small" style="margin-bottom: 20px;">
      <n-form-item label="Wallet Name *">
        <n-input
          v-model:value="walletName"
          placeholder="e.g., My MultiversX Wallet"
          :maxlength="50"
        />
      </n-form-item>
    </n-card>

    <!-- Mnemonic Options -->
    <n-card title="🔐 Mnemonic Configuration" size="small" style="margin-bottom: 20px;">
      <n-checkbox v-model:checked="useCustomMnemonic">
        Use Custom Mnemonic (24 words)
      </n-checkbox>

      <div v-if="useCustomMnemonic" style="margin-top: 16px;">
        <n-form-item label="Custom Mnemonic (24 words) *">
          <n-input
            v-model:value="customMnemonic"
            type="textarea"
            placeholder="Enter your 24-word mnemonic phrase separated by spaces"
            :rows="4"
          />
        </n-form-item>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <n-tag :type="mnemonicWordCount === 24 ? 'success' : 'warning'">
            {{ mnemonicWordCount }} / 24 words
          </n-tag>
          <n-button size="small" @click="generateSampleMnemonic" quaternary>
            📝 Sample Mnemonic
          </n-button>
        </div>

        <n-alert type="warning" style="margin-top: 12px;" size="small">
          ⚠️ MultiversX requires exactly 24 words. Make sure your mnemonic is valid!
        </n-alert>
      </div>

      <div v-else style="margin-top: 16px;">
        <n-alert type="info" size="small">
          ✨ A new 24-word mnemonic will be generated automatically
        </n-alert>
      </div>
    </n-card>

    <!-- Advanced Options -->
    <n-card title="⚙️ Advanced Options" size="small" style="margin-bottom: 20px;">
      <n-form-item label="Account Index (BIP44 Derivation)">
        <n-input-number
          v-model:value="accountIndex"
          :min="0"
          :max="2147483647"
          style="width: 100%;"
        />
        <template #feedback>
          Derivation path: m/44'/508'/{{ accountIndex }}'/0'/0'
        </template>
      </n-form-item>

      <n-divider style="margin: 16px 0;" />

      <n-checkbox v-model:checked="generateMultiple">
        Generate Multiple Wallets
      </n-checkbox>

      <div v-if="generateMultiple" style="margin-top: 16px;">
        <n-form-item label="Number of Wallets">
          <n-input-number
            v-model:value="walletCount"
            :min="1"
            :max="10"
            style="width: 100%;"
          />
        </n-form-item>
        <n-alert type="info" size="small">
          Each wallet will use a different account index ({{ accountIndex }} to {{ accountIndex + walletCount - 1 }})
        </n-alert>
      </div>
    </n-card>

    <!-- Summary -->
    <n-card title="📊 Summary" size="small" style="margin-bottom: 20px;">
      <div class="summary">
        <div class="summary-item">
          <span class="summary-label">Network:</span>
          <span class="summary-value">MultiversX</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Symbol:</span>
          <span class="summary-value">EGLD</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Address Format:</span>
          <span class="summary-value">erd1... (bech32)</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Wallets to Generate:</span>
          <span class="summary-value highlight">{{ generateMultiple ? walletCount : 1 }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Mnemonic:</span>
          <span class="summary-value">{{ useCustomMnemonic ? 'Custom (24 words)' : 'Auto-generate (24 words)' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Account Index:</span>
          <span class="summary-value">{{ accountIndex }}{{ generateMultiple ? ` - ${accountIndex + walletCount - 1}` : '' }}</span>
        </div>
      </div>
    </n-card>

    <!-- Security Warning -->
    <n-alert type="warning" style="margin-bottom: 20px;">
      <template #icon>
        <span style="font-size: 20px;">⚠️</span>
      </template>
      <strong>Security Reminder:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>NEVER share your mnemonic or private key with anyone</li>
        <li>Store your mnemonic in a secure, offline location</li>
        <li>MultiversX uses 24-word mnemonics - keep all words safe</li>
        <li>Consider using a hardware wallet for large amounts</li>
      </ul>
    </n-alert>

    <!-- Actions -->
    <div class="actions">
      <n-button
        type="primary"
        size="large"
        @click="handleGenerate"
        :disabled="!isValid"
        block
      >
        🎯 Generate MultiversX Wallet{{ generateMultiple && walletCount > 1 ? 's' : '' }}
      </n-button>
      <n-button
        size="large"
        @click="handleCancel"
        block
        style="margin-top: 12px;"
      >
        ❌ Cancel
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.multiversx-wallet-config {
  padding: 8px;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 149, 255, 0.05);
  border-radius: 6px;
}

.summary-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.summary-value {
  font-weight: bold;
  font-size: 14px;
  color: #fff;
}

.summary-value.highlight {
  color: #0095ff;
  font-size: 18px;
}

.actions {
  margin-top: 20px;
}
</style>
