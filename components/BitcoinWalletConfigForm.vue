<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['generate', 'cancel']);

// Custom wallets created by user
const customWallets = ref([
  { id: Date.now(), name: 'BANK', emoji: '🏦', description: 'Rezervă bancară' },
  { id: Date.now() + 1, name: 'VAULT', emoji: '🔐', description: 'Seif securizat' },
  { id: Date.now() + 2, name: 'EU', emoji: '🎯', description: 'Wallet principal' }
]);

// Available emojis for wallets
const availableEmojis = ['💰', '👨', '👩', '👧', '👦', '👨‍💼', '👩‍💼', '👵', '👴', '🏦', '🔐', '🎯', '💎', '🚀', '⭐', '🌟', '💼', '🎁', '🏠', '🚗', '✈️', '🌍'];

// Form state
const selectedWalletIds = ref([customWallets.value[2].id]); // Default: EU
const wordCount = ref(12);
const passphrase = ref('');
const showPassphraseInput = ref(false);
const showAddWalletModal = ref(false);
const newWalletName = ref('');
const newWalletEmoji = ref('💰');
const newWalletDescription = ref('');

// ALWAYS generate ALL 5 address types
const ALL_ADDRESS_TYPES = ['legacy', 'scriptHash', 'segwit', 'nativeSegwit', 'taproot'];

// Computed
const totalAddresses = computed(() => {
  return selectedWalletIds.value.length * 5; // Always 5 address types per wallet
});

const isValid = computed(() => {
  return selectedWalletIds.value.length > 0 && customWallets.value.length > 0;
});

const selectedWalletsData = computed(() => {
  return customWallets.value.filter(w => selectedWalletIds.value.includes(w.id));
});

function addNewWallet() {
  if (customWallets.value.length >= 10) {
    window.$message?.error('Maxim 10 wallet-uri permise!');
    return;
  }

  if (!newWalletName.value.trim()) {
    window.$message?.error('Introdu un nume pentru wallet!');
    return;
  }

  customWallets.value.push({
    id: Date.now(),
    name: newWalletName.value.toUpperCase(),
    emoji: newWalletEmoji.value,
    description: newWalletDescription.value || `Wallet ${newWalletName.value}`
  });

  // Reset form
  newWalletName.value = '';
  newWalletEmoji.value = '💰';
  newWalletDescription.value = '';
  showAddWalletModal.value = false;

  window.$message?.success('Wallet adăugat!');
}

const canAddMore = computed(() => customWallets.value.length < 10);

function removeWallet(walletId) {
  const index = customWallets.value.findIndex(w => w.id === walletId);
  if (index > -1) {
    customWallets.value.splice(index, 1);
    // Remove from selection if selected
    const selIndex = selectedWalletIds.value.indexOf(walletId);
    if (selIndex > -1) {
      selectedWalletIds.value.splice(selIndex, 1);
    }
  }
}

function editWallet(wallet) {
  const newName = prompt(`Schimbă numele wallet-ului "${wallet.name}":`, wallet.name);
  if (newName && newName.trim()) {
    wallet.name = newName.toUpperCase();
  }
}

function selectAllWallets() {
  selectedWalletIds.value = customWallets.value.map(w => w.id);
}

function clearWallets() {
  selectedWalletIds.value = [];
}

function handleGenerate() {
  if (!isValid.value) {
    window.$message?.error('Selectează cel puțin 1 wallet!');
    return;
  }

  const config = {
    wallets: selectedWalletsData.value.map((w, index) => ({
      index,
      name: w.name,
      emoji: w.emoji,
      description: w.description
    })),
    addressTypes: ALL_ADDRESS_TYPES, // ALWAYS all 5 types
    wordCount: wordCount.value,
    passphrase: showPassphraseInput.value ? passphrase.value : ''
  };

  emit('generate', config);
}

function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <div class="bitcoin-wallet-config">
    <!-- Header -->
    <n-alert type="info" style="margin-bottom: 20px;">
      <template #icon>
        <span style="font-size: 24px;">⚙️</span>
      </template>
      <strong>Configurează Bitcoin Wallet</strong><br>
      Alege câte wallet-uri și ce tipuri de adrese vrei să generezi
    </n-alert>

    <!-- Info Card -->
    <n-card size="small" style="margin-bottom: 20px;">
      <n-alert type="success">
        <template #icon>
          <span style="font-size: 20px;">✅</span>
        </template>
        <strong>Toate cele 5 tipuri de adrese Bitcoin vor fi generate automat:</strong>
        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
          <span>🔑 Legacy (P2PKH) - prefix "1..."</span>
          <span>📜 Script Hash (P2SH) - prefix "3..."</span>
          <span>⚡ SegWit (P2SH-P2WPKH) - prefix "3..."</span>
          <span>🚀 Native SegWit (P2WPKH) - prefix "bc1q..." (RECOMANDAT)</span>
          <span>🌳 Taproot (P2TR) - prefix "bc1p..." (CEL MAI NOU)</span>
        </div>
      </n-alert>
    </n-card>

    <!-- Wallet Management -->
    <n-card title="👥 Wallet-urile Tale (Max 10)" size="small" style="margin-bottom: 20px;">
      <template #header-extra>
        <n-button
          type="primary"
          size="tiny"
          @click="showAddWalletModal = true"
          :disabled="!canAddMore"
        >
          ➕ Adaugă Wallet
        </n-button>
      </template>

      <!-- Wallet List -->
      <div class="wallet-list">
        <div
          v-for="wallet in customWallets"
          :key="wallet.id"
          class="wallet-card"
          :class="{ selected: selectedWalletIds.includes(wallet.id) }"
        >
          <n-checkbox
            :checked="selectedWalletIds.includes(wallet.id)"
            @update:checked="(checked) => {
              if (checked) {
                selectedWalletIds.push(wallet.id);
              } else {
                const index = selectedWalletIds.indexOf(wallet.id);
                if (index > -1) selectedWalletIds.splice(index, 1);
              }
            }"
          />
          <div class="wallet-info">
            <span class="wallet-emoji">{{ wallet.emoji }}</span>
            <div class="wallet-text">
              <span class="wallet-name">{{ wallet.name }}</span>
              <span class="wallet-desc">{{ wallet.description }}</span>
            </div>
          </div>
          <div class="wallet-actions">
            <n-button size="tiny" @click="editWallet(wallet)">✏️</n-button>
            <n-button size="tiny" @click="removeWallet(wallet.id)" type="error">🗑️</n-button>
          </div>
        </div>
      </div>

      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <n-button size="small" @click="selectAllWallets" block>Selectează Toate</n-button>
        <n-button size="small" @click="clearWallets" block>Deselectează</n-button>
      </div>

      <n-alert type="success" style="margin-top: 12px;" v-if="selectedWalletIds.length > 0">
        ✅ {{ selectedWalletIds.length }} / {{ customWallets.length }} wallet-uri selectate
      </n-alert>
      <n-alert type="info" style="margin-top: 12px;" v-if="!canAddMore">
        ℹ️ Ai atins limita de 10 wallet-uri
      </n-alert>
    </n-card>

    <!-- Add Wallet Modal -->
    <n-modal v-model:show="showAddWalletModal" preset="card" title="➕ Adaugă Wallet Nou" style="width: 500px;">
      <n-form>
        <n-form-item label="Numele Wallet-ului">
          <n-input
            v-model:value="newWalletName"
            placeholder="ex: ALEX, FAMILIA, ECONOMII"
            @keyup.enter="addNewWallet"
            :maxlength="20"
          />
        </n-form-item>

        <n-form-item label="Emoji">
          <n-select
            v-model:value="newWalletEmoji"
            :options="availableEmojis.map(e => ({ label: e, value: e }))"
          />
        </n-form-item>

        <n-form-item label="Descriere (opțional)">
          <n-input
            v-model:value="newWalletDescription"
            placeholder="ex: Pentru economii personale"
            :maxlength="50"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div style="display: flex; gap: 12px;">
          <n-button type="primary" @click="addNewWallet" block>✅ Adaugă</n-button>
          <n-button @click="showAddWalletModal = false" block>❌ Anulează</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Additional Options -->
    <n-card title="🔧 Opțiuni Avansate" size="small" style="margin-bottom: 20px;">
      <!-- Word Count -->
      <div class="form-row">
        <span class="form-label">📝 Număr Cuvinte Mnemonic:</span>
        <n-radio-group v-model:value="wordCount">
          <n-radio :value="12" label="12 cuvinte (Standard)" />
          <n-radio :value="24" label="24 cuvinte (Extra Securitate)" />
        </n-radio-group>
      </div>

      <!-- Passphrase -->
      <div class="form-row" style="margin-top: 16px;">
        <n-checkbox v-model:checked="showPassphraseInput">
          🔐 Folosește Passphrase BIP39 (13th/25th word)
        </n-checkbox>
      </div>

      <div v-if="showPassphraseInput" style="margin-top: 12px;">
        <n-input
          v-model:value="passphrase"
          type="password"
          placeholder="Introdu passphrase-ul (opțional dar recomandat)"
          show-password-on="click"
        />
        <n-alert type="warning" style="margin-top: 8px;" size="small">
          ⚠️ Dacă folosești passphrase, trebuie să-l salvezi! Fără el, nu poți restaura wallet-ul!
        </n-alert>
      </div>
    </n-card>

    <!-- Summary -->
    <n-card title="📊 Rezumat" size="small" style="margin-bottom: 20px;">
      <div class="summary">
        <div class="summary-item">
          <span class="summary-label">Wallet-uri:</span>
          <span class="summary-value">{{ selectedWalletsData.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tipuri Adrese:</span>
          <span class="summary-value">5 (toate)</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Adrese:</span>
          <span class="summary-value highlight">{{ totalAddresses }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Mnemonic:</span>
          <span class="summary-value">{{ wordCount }} cuvinte</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Passphrase:</span>
          <span class="summary-value">{{ showPassphraseInput ? 'DA ✅' : 'NU' }}</span>
        </div>
      </div>
    </n-card>

    <!-- Actions -->
    <div class="actions">
      <n-button
        type="primary"
        size="large"
        @click="handleGenerate"
        :disabled="!isValid"
        block
      >
        🎯 Generează Bitcoin Wallet ({{ totalAddresses }} adrese)
      </n-button>
      <n-button
        size="large"
        @click="handleCancel"
        block
        style="margin-top: 12px;"
      >
        ❌ Anulează
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.bitcoin-wallet-config {
  padding: 8px;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preset-btn {
  height: auto;
  padding: 12px;
}

.preset-content {
  text-align: left;
  width: 100%;
}

.preset-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.preset-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.checkbox-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checkbox-label {
  font-weight: 600;
  font-size: 13px;
}

.checkbox-prefix {
  font-size: 11px;
  color: #00ff88;
  font-family: 'Monaco', monospace;
}

.checkbox-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.2;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #00ff88;
  font-size: 13px;
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
  background: rgba(0, 255, 136, 0.05);
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
  color: #00ff88;
  font-size: 18px;
}

.actions {
  margin-top: 20px;
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wallet-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(20, 25, 45, 0.6);
  border: 2px solid rgba(100, 100, 100, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.wallet-card.selected {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
}

.wallet-card:hover {
  background: rgba(30, 35, 55, 0.8);
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.wallet-emoji {
  font-size: 24px;
}

.wallet-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wallet-name {
  font-weight: bold;
  font-size: 14px;
  color: #fff;
}

.wallet-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.wallet-actions {
  display: flex;
  gap: 4px;
}
</style>
