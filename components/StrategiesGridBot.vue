<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStrategyGridBot } from '~/composables/useStrategyGridBot';

const props = defineProps({
  userID: {
    type: String,
    default: null
  },
  exchange: {
    type: String,
    default: null
  },
  symbol: {
    type: String,
    default: null
  },
  bestBid: {
    type: Number,
    default: null
  },
  bestAsk: {
    type: Number,
    default: null
  },
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['apply-strategy']);

const {
  strategyPicker,
  strategyPickerOptions,
  strategiesList,
  loadStrategies,
  selectStrategy,
  addStrategy,
  applyStrategy,
  deleteStrategy,
  deleteAllStrategies
} = useStrategyGridBot();

// UI state
let showStrategyForm = ref(false);
let newStrategyName = ref('');
let newStrategyDescription = ref('');
let loadingStrategies = ref(false);

/**
 * Save current configuration as a strategy
 */
async function saveStrategy() {
  console.log('🔍 saveStrategy called');
  console.log('📦 props.formData:', props.formData);
  console.log('📦 props.userID:', props.userID);
  console.log('📦 props.exchange:', props.exchange);
  console.log('📦 props.symbol:', props.symbol);
  console.log('📦 props.bestBid:', props.bestBid);
  console.log('📦 props.bestAsk:', props.bestAsk);

  if (!newStrategyName.value.trim()) {
    alert('Please enter a strategy name');
    return;
  }

  // Get userID from cookie as fallback
  const userIDCookie = useCookie('userID');
  const userID = props.userID || userIDCookie?.value;

  console.log('🆔 userID source:', props.userID ? 'from prop' : 'from cookie');
  console.log('🆔 userID value:', userID);

  if (!userID) {
    alert('User ID is required - please login again');
    return;
  }

  // Validate form data with detailed logs
  // Handle both ref objects and plain values
  const lowerPriceValue = props.formData.lowerPrice?.value ?? props.formData.lowerPrice;
  const upperPriceValue = props.formData.upperPrice?.value ?? props.formData.upperPrice;
  const amountValue = props.formData.amount?.value ?? props.formData.amount;
  const nrOfGridsValue = props.formData.nrOfGrids?.value ?? props.formData.nrOfGrids;

  console.log('💰 Form Data Values:');
  console.log('  - lowerPrice:', lowerPriceValue);
  console.log('  - upperPrice:', upperPriceValue);
  console.log('  - amount:', amountValue);
  console.log('  - nrOfGrids:', nrOfGridsValue);

  if (!lowerPriceValue || !upperPriceValue) {
    alert('Please enter Lower Price and Upper Price');
    return;
  }

  if (!amountValue) {
    alert('Please enter Amount');
    return;
  }

  if (!nrOfGridsValue) {
    alert('Please enter Number of Grids');
    return;
  }

  const strategyName = newStrategyName.value.trim();

  try {
    console.log('📝 Saving strategy with name:', strategyName);
    console.log('Using userID:', userID);

    // First update the form name to the strategy name
    const nameValue = props.formData.name?.value ?? props.formData.name;
    if (nameValue !== undefined) {
      // If it's a ref, update its value; if it's a string, we can't update it directly
      if (props.formData.name?.value !== undefined) {
        props.formData.name.value = strategyName;
      } else {
        props.formData.name = strategyName;
      }
    }

    // Handle null props by getting values from formData - NO HARDCODED DEFAULTS
    // Priority: props > formData > REQUIRE USER INPUT
    const formDataExchange = props.formData?.exchange?.value ?? props.formData?.exchange;
    const formDataSymbol = props.formData?.symbol?.value ?? props.formData?.symbol;

    const exchangeValue = props.exchange || formDataExchange;
    const symbolValue = props.symbol || formDataSymbol;

    // REQUIRE both exchange and symbol - refuse to save with defaults
    if (!exchangeValue || !symbolValue) {
      console.error('❌ Cannot save strategy: Exchange or Symbol is missing');
      console.error('  - exchange:', exchangeValue);
      console.error('  - symbol:', symbolValue);
      alert('❌ Error: Exchange or Trading Pair is not available. Please select a valid pair and try again.');
      return;
    }

    const bestBidValue = props.bestBid !== null ? props.bestBid : 0;
    const bestAskValue = props.bestAsk !== null ? props.bestAsk : 0;

    console.log('📊 Calling addStrategy with:');
    console.log('  - exchange:', exchangeValue, '(from: props=' + props.exchange + ', formData=' + formDataExchange + ')');
    console.log('  - symbol:', symbolValue, '(from: props=' + props.symbol + ', formData=' + formDataSymbol + ')');
    console.log('  - bestBid:', bestBidValue);
    console.log('  - bestAsk:', bestAskValue);

    await addStrategy(
      props.formData,
      exchangeValue,
      symbolValue,
      bestBidValue,
      bestAskValue,
      userID
    );

    // Reset form after successful save
    newStrategyName.value = '';
    newStrategyDescription.value = '';
    showStrategyForm.value = false;

    alert(`✅ Strategy "${strategyName}" saved successfully!`);
  } catch (error) {
    console.error('Error saving strategy:', error);
    alert(`Failed to save strategy: ${error.message}`);
  }
}

/**
 * Apply selected strategy
 */
async function handleApplyStrategy() {
  if (!strategyPicker.value) {
    alert('Please select a strategy');
    return;
  }

  // Get userID from props or cookie
  const userIDCookie = useCookie('userID');
  const userID = props.userID || userIDCookie?.value;

  if (!userID) {
    alert('User ID is required - please login again');
    return;
  }

  try {
    console.log('🚀 Applying strategy with userID:', userID);

    // Get values from props or formData - ALLOW APPLYING ON ANY PAIR
    // Priority: props > formData > fallback to stored strategy pair
    const formDataExchange = props.formData?.exchange?.value ?? props.formData?.exchange;
    const formDataSymbol = props.formData?.symbol?.value ?? props.formData?.symbol;

    const exchangeValue = props.exchange || formDataExchange;
    const symbolValue = props.symbol || formDataSymbol;

    // Log what we found
    console.log('📌 Applying strategy with pair:');
    console.log('  - exchangeValue:', exchangeValue, '(from props=' + props.exchange + ' or formData=' + formDataExchange + ')');
    console.log('  - symbolValue:', symbolValue, '(from props=' + props.symbol + ' or formData=' + formDataSymbol + ')');

    // Only require exchange/symbol if we're saving - for APPLYING, we can use stored pair
    // The applyStrategy composable will handle fallbacks
    if (!strategyPicker.value) {
      console.error('❌ No strategy selected');
      alert('❌ Error: Please select a strategy first.');
      return;
    }

    const appliedData = await applyStrategy(
      strategyPicker.value,
      exchangeValue,
      symbolValue,
      userID
    );

    if (appliedData) {
      // Emit event to parent component to update form
      console.log('✅ Strategy applied successfully, emitting event');
      emit('apply-strategy', appliedData);
      alert(`✅ Strategy applied successfully!`);
    } else {
      console.warn('⚠️ Strategy application returned no data');
    }
  } catch (error) {
    console.error('Error applying strategy:', error);
    alert('Failed to apply strategy');
  }
}

/**
 * Delete selected strategy
 */
async function handleDeleteStrategy() {
  if (!strategyPicker.value) {
    alert('Please select a strategy');
    return;
  }

  if (!confirm('Are you sure you want to delete this strategy?')) {
    return;
  }

  // Get userID from props or cookie
  const userIDCookie = useCookie('userID');
  const userID = props.userID || userIDCookie?.value;

  if (!userID) {
    alert('User ID is required - please login again');
    return;
  }

  try {
    await deleteStrategy(strategyPicker.value, userID);
    alert('✅ Strategy deleted successfully!');
  } catch (error) {
    console.error('Error deleting strategy:', error);
    alert('Failed to delete strategy');
  }
}

/**
 * Delete all strategies
 */
async function handleDeleteAllStrategies() {
  if (strategiesList.value.length === 0) {
    alert('No strategies to delete');
    return;
  }

  if (!confirm('Are you sure you want to delete ALL strategies?')) {
    return;
  }

  // Get userID from props or cookie
  const userIDCookie = useCookie('userID');
  const userID = props.userID || userIDCookie?.value;

  if (!userID) {
    alert('User ID is required - please login again');
    return;
  }

  try {
    await deleteAllStrategies(userID);
    alert('✅ All strategies deleted successfully!');
  } catch (error) {
    console.error('Error deleting strategies:', error);
    alert('Failed to delete strategies');
  }
}

// Load strategies on mount
onMounted(async () => {
  // Get userID from props or cookie
  const userIDCookie = useCookie('userID');
  const userID = props.userID || userIDCookie?.value;

  console.log('📚 StrategiesGridBot mounted - loading strategies');
  console.log('  - props.userID:', props.userID);
  console.log('  - cookie userID:', userIDCookie?.value);
  console.log('  - final userID:', userID);

  if (!userID) {
    console.warn('⚠️ No userID available, cannot load strategies');
    return;
  }

  loadingStrategies.value = true;
  await loadStrategies(userID);
  loadingStrategies.value = false;
});

// Watch for userID changes to reload strategies
watch(() => props.userID, async (newUserID) => {
  if (newUserID) {
    console.log('👁️ userID prop changed, reloading strategies:', newUserID);
    loadingStrategies.value = true;
    await loadStrategies(newUserID);
    loadingStrategies.value = false;
  }
});
</script>

<template>
  <div class="strategies-section">
    <!-- Strategies Header -->
    <div class="strategies-header">
      <span class="strategies-title">📚 Grid Bot Strategies</span>
      <span class="strategies-count" v-if="strategiesList.length > 0">
        {{ strategiesList.length }} saved
      </span>
    </div>

    <!-- Saved Strategies List - Grid of Small Boxes -->
    <div v-if="strategiesList.length > 0" class="strategies-list">
      <div class="strategies-buttons-grid">
        <n-button
          v-for="strategy in strategiesList"
          :key="strategy._id"
          :type="strategyPicker === strategy._id ? 'primary' : 'default'"
          size="tiny"
          @click="() => {
            strategyPicker = strategy._id;
            selectStrategy(formData, strategy._id);
          }"
          class="strategy-box"
          :title="strategy.name"
        >
          {{ strategy.name.substring(0, 3).toUpperCase() }}
        </n-button>
      </div>

      <!-- Strategy Action Buttons -->
      <div class="strategy-actions">
        <n-button
          type="success"
          size="small"
          @click="handleApplyStrategy"
          :disabled="!strategyPicker"
          class="action-btn apply-btn"
        >
          ✓ Apply
        </n-button>
        <n-button
          type="warning"
          size="small"
          @click="handleDeleteStrategy"
          :disabled="!strategyPicker"
          class="action-btn delete-btn"
        >
          🗑️ Delete
        </n-button>
        <n-button
          type="error"
          size="small"
          @click="handleDeleteAllStrategies"
          class="action-btn clear-all-btn"
        >
          Clear All
        </n-button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No strategies saved yet</p>
      <p class="empty-hint">Save your current configuration as a strategy to reuse it</p>
    </div>

    <!-- Save New Strategy Button -->
    <div v-if="!showStrategyForm" class="save-button-section">
      <n-button
        type="primary"
        size="small"
        @click="showStrategyForm = true"
        class="save-btn"
      >
        💾 Save Current as Strategy
      </n-button>
    </div>

    <!-- Strategy Form -->
    <div v-if="showStrategyForm" class="strategy-form">
      <div class="form-title">Save New Strategy</div>

      <div class="form-group">
        <label class="form-label">Strategy Name *</label>
        <n-input
          v-model:value="newStrategyName"
          type="text"
          placeholder="Enter strategy name..."
          size="small"
          clearable
        />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <n-input
          v-model:value="newStrategyDescription"
          type="textarea"
          placeholder="Enter strategy description (optional)..."
          size="small"
          :rows="2"
          clearable
        />
      </div>

      <div class="form-buttons">
        <n-button
          type="primary"
          size="small"
          @click="saveStrategy"
          class="save-confirm-btn"
        >
          Save Strategy
        </n-button>
        <n-button
          size="small"
          @click="() => { showStrategyForm = false; newStrategyName = ''; newStrategyDescription = ''; }"
          class="cancel-btn"
        >
          Cancel
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strategies-section {
  background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
  border: 1px solid #2a3441;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 11px;
}

.strategies-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(42, 52, 65, 0.5);
}

.strategies-title {
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.strategies-count {
  font-size: 10px;
  color: #10eb04;
  background: rgba(16, 235, 4, 0.15);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 16px 8px;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-size: 11px;
}

.empty-hint {
  color: #555;
  font-size: 10px;
  margin-top: 4px !important;
  font-style: italic;
}

.strategies-list {
  margin-bottom: 8px;
}

.strategies-buttons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
  padding: 4px;
  background: rgba(26, 31, 46, 0.4);
  border-radius: 3px;
  min-height: 30px;
}

.strategy-box {
  width: 25px !important;
  height: 25px !important;
  min-width: 25px !important;
  min-height: 25px !important;
  padding: 0 !important;
  font-size: 8px !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 2px !important;
  flex-shrink: 0;
  cursor: pointer;
}

:deep(.strategy-box) {
  width: 25px !important;
  height: 25px !important;
  min-width: 25px !important;
  min-height: 25px !important;
}

:deep(.strategy-box .n-button__content) {
  font-size: 8px !important;
  line-height: 1 !important;
}

.strategies-select-row {
  margin-bottom: 8px;
}

.strategy-select {
  width: 100%;
}

:deep(.strategy-select .n-base-selection) {
  font-size: 11px !important;
}

.strategy-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.action-btn {
  font-size: 10px !important;
  height: 26px !important;
  padding: 2px 6px !important;
}

.apply-btn {
  background: rgba(16, 185, 129, 0.2) !important;
  border-color: #10b981 !important;
  color: #10b981 !important;
}

.apply-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.3) !important;
}

.delete-btn {
  background: rgba(250, 204, 21, 0.2) !important;
  border-color: #facc15 !important;
  color: #facc15 !important;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(250, 204, 21, 0.3) !important;
}

.clear-all-btn {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.3) !important;
}

.save-button-section {
  margin: 8px 0 0 0;
}

.save-btn {
  width: 100%;
  font-size: 11px !important;
  height: 28px !important;
  background: rgba(59, 130, 246, 0.2) !important;
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
}

.save-btn:hover {
  background: rgba(59, 130, 246, 0.3) !important;
}

.strategy-form {
  background: rgba(26, 31, 46, 0.8);
  border: 1px solid rgba(42, 52, 65, 0.6);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
}

.form-title {
  font-size: 11px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-group {
  margin-bottom: 8px;
}

.form-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

:deep(.form-group .n-input) {
  font-size: 10px !important;
}

:deep(.form-group .n-input__input-el) {
  font-size: 10px !important;
  padding: 6px 8px !important;
  min-height: 24px !important;
}

:deep(.form-group .n-input--textarea) {
  font-size: 10px !important;
}

.form-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 10px;
}

.save-confirm-btn {
  font-size: 10px !important;
  height: 24px !important;
  padding: 2px 6px !important;
  background: rgba(16, 235, 4, 0.2) !important;
  border-color: #10eb04 !important;
  color: #10eb04 !important;
}

.save-confirm-btn:hover {
  background: rgba(16, 235, 4, 0.3) !important;
}

.cancel-btn {
  font-size: 10px !important;
  height: 24px !important;
  padding: 2px 6px !important;
}
</style>
