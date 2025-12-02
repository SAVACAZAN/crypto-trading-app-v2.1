<template>
  <div class="batch-transfer">
    <n-card title="🚀 Batch Transfer - Send ETH to Multiple Addresses">
      <template #header-extra>
        <n-tag type="info" size="small">Powered by Disperse.app</n-tag>
      </template>

      <!-- Info Alert -->
      <n-alert type="info" style="margin-bottom: 20px;">
        <template #icon>
          <span style="font-size: 20px;">💡</span>
        </template>
        <strong>Save Gas!</strong> Send ETH to multiple addresses in a single transaction.
        <br>
        <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">
          Contract: {{ DISPERSE_CONTRACT.slice(0, 10) }}...{{ DISPERSE_CONTRACT.slice(-8) }}
        </span>
      </n-alert>

      <!-- Step 1: Input -->
      <n-card size="small" style="margin-bottom: 16px;">
        <template #header>
          <strong>📝 Step 1: Enter Recipients</strong>
        </template>

        <div style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          <n-button size="small" @click="loadTemplate">
            📋 Load Template
          </n-button>
          <n-button size="small" @click="loadExample">
            📄 Load Example
          </n-button>
          <n-button size="small" @click="clearInput">
            🗑️ Clear
          </n-button>
        </div>

        <n-input
          v-model:value="recipientsText"
          type="textarea"
          placeholder="Enter recipients (one per line):
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,0.1
0xdD2FD4581271e230360230F9337D5c0430Bf44C0,0.05
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed,0.01"
          :rows="8"
          :autosize="{ minRows: 8, maxRows: 15 }"
          style="font-family: monospace; font-size: 13px;"
        />

        <n-alert type="default" style="margin-top: 12px;" size="small">
          <template #icon>
            <span style="font-size: 14px;">ℹ️</span>
          </template>
          <strong>Supported formats:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 12px;">
            <li><code>address,amount</code> (comma)</li>
            <li><code>address=amount</code> (equals)</li>
            <li><code>address amount</code> (space)</li>
          </ul>
        </n-alert>
      </n-card>

      <!-- Step 2: Validate -->
      <n-card size="small" style="margin-bottom: 16px;">
        <template #header>
          <strong>✅ Step 2: Validate</strong>
        </template>

        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <n-button
            type="primary"
            @click="validateInput"
            :loading="validating"
            :disabled="!recipientsText.trim()"
          >
            🔍 Validate Recipients
          </n-button>

          <n-button
            v-if="parsedData && parsedData.isValid"
            type="success"
            @click="estimateGasForTransfer"
            :loading="estimatingGas"
          >
            ⛽ Estimate Gas
          </n-button>
        </div>

        <!-- Validation Results -->
        <div v-if="parsedData">
          <!-- Errors -->
          <n-alert v-if="parsedData.errors.length > 0" type="error" style="margin-bottom: 12px;">
            <template #icon>
              <span style="font-size: 20px;">❌</span>
            </template>
            <strong>{{ parsedData.errors.length }} Error(s) Found:</strong>
            <div style="max-height: 200px; overflow-y: auto; margin-top: 8px;">
              <div
                v-for="(error, idx) in parsedData.errors"
                :key="idx"
                style="padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 6px; font-size: 12px;"
              >
                <strong>Line {{ error.line }}:</strong> {{ error.error }}<br>
                <code style="color: #f87171;">{{ error.text }}</code>
              </div>
            </div>
          </n-alert>

          <!-- Success Summary -->
          <n-alert v-if="parsedData.isValid" type="success">
            <template #icon>
              <span style="font-size: 20px;">✅</span>
            </template>
            <strong>Validation Successful!</strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 12px;">
              <div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.6);">Recipients:</div>
                <div style="font-size: 18px; font-weight: bold;">{{ parsedData.recipients.length }}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.6);">Total Amount:</div>
                <div style="font-size: 18px; font-weight: bold;">{{ formatEther(totalAmount) }} ETH</div>
              </div>
              <div v-if="estimatedGasValue">
                <div style="font-size: 11px; color: rgba(255,255,255,0.6);">Est. Gas:</div>
                <div style="font-size: 18px; font-weight: bold;">{{ estimatedGasValue.toLocaleString() }}</div>
              </div>
            </div>
          </n-alert>
        </div>

        <!-- Validation Errors (from wallet/balance check) -->
        <n-alert v-if="validationErrors.length > 0" type="warning" style="margin-top: 12px;">
          <template #icon>
            <span style="font-size: 20px;">⚠️</span>
          </template>
          <strong>Validation Warnings:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li v-for="(error, idx) in validationErrors" :key="idx">{{ error }}</li>
          </ul>
        </n-alert>
      </n-card>

      <!-- Step 3: Preview & Execute -->
      <n-card v-if="parsedData && parsedData.isValid" size="small" style="margin-bottom: 16px;">
        <template #header>
          <strong>📋 Step 3: Preview & Execute</strong>
        </template>

        <!-- Preview Table -->
        <n-collapse style="margin-bottom: 16px;">
          <n-collapse-item title="👀 Preview Recipients List" name="preview">
            <div style="max-height: 300px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="position: sticky; top: 0; background: rgba(0,0,0,0.5);">
                  <tr>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">#</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Address</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1);">Amount (ETH)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(recipient, idx) in parsedData.recipients" :key="idx" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 6px;">{{ idx + 1 }}</td>
                    <td style="padding: 6px; font-family: monospace;">{{ recipient }}</td>
                    <td style="padding: 6px; text-align: right; font-weight: bold; color: #10b981;">
                      {{ formatEther(parsedData.amounts[idx]) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </n-collapse-item>
        </n-collapse>

        <!-- Execute Button -->
        <div style="margin-bottom: 12px;">
          <n-button
            type="success"
            size="large"
            block
            @click="executeBatchTransfer"
            :loading="processing"
            :disabled="!connectedAddress || validationErrors.length > 0"
          >
            🚀 Execute Batch Transfer ({{ parsedData.recipients.length }} addresses)
          </n-button>
        </div>

        <!-- Status Messages -->
        <n-alert v-if="!connectedAddress" type="warning" style="margin-bottom: 12px;" size="small">
          <template #icon>
            <span style="font-size: 16px;">🦊</span>
          </template>
          <strong>Wallet Not Connected</strong><br>
          Please connect your MetaMask wallet first to execute the batch transfer
        </n-alert>

        <n-alert v-else-if="validationErrors.length > 0" type="error" style="margin-bottom: 12px;" size="small">
          <template #icon>
            <span style="font-size: 16px;">❌</span>
          </template>
          <strong>Cannot Execute</strong><br>
          Please fix validation errors before executing
        </n-alert>

        <n-alert v-else type="success" style="margin-bottom: 12px;" size="small">
          <template #icon>
            <span style="font-size: 16px;">✅</span>
          </template>
          <strong>Ready to Execute!</strong><br>
          Connected: {{ connectedAddress.slice(0, 10) }}...{{ connectedAddress.slice(-8) }}
        </n-alert>
      </n-card>

      <!-- Transaction Result -->
      <n-card v-if="transactionResult" size="small">
        <template #header>
          <strong>{{ transactionResult.success ? '✅ Success!' : '❌ Failed' }}</strong>
        </template>

        <n-alert :type="transactionResult.success ? 'success' : 'error'">
          <template #icon>
            <span style="font-size: 24px;">{{ transactionResult.success ? '🎉' : '😞' }}</span>
          </template>

          <div v-if="transactionResult.success">
            <strong>Batch transfer completed successfully!</strong>
            <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
              <div>
                <strong>Recipients:</strong> {{ transactionResult.recipients }}
              </div>
              <div>
                <strong>Total Amount:</strong> {{ transactionResult.totalAmount }} ETH
              </div>
              <div>
                <strong>Gas Used:</strong> {{ parseInt(transactionResult.gasUsed).toLocaleString() }}
              </div>
              <div>
                <strong>Transaction Hash:</strong>
                <br>
                <code style="font-size: 11px; word-break: break-all;">{{ transactionResult.transactionHash }}</code>
              </div>
            </div>

            <n-button
              type="primary"
              size="small"
              style="margin-top: 12px;"
              @click="openExplorer(transactionResult.transactionHash)"
            >
              🔍 View on Explorer
            </n-button>
          </div>

          <div v-else>
            <strong>Transaction failed:</strong>
            <p style="margin-top: 8px; color: rgba(255,255,255,0.8);">{{ transactionResult.error }}</p>
          </div>
        </n-alert>
      </n-card>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ethers } from 'ethers';
import { useDisperse } from '~/composables/useDisperse';

// Props
const props = defineProps({
  provider: Object,
  signer: Object,
  connectedAddress: String,
  explorerUrl: String
});

// Debug - Log props when they change
if (process.client) {
  watch(() => props.connectedAddress, (newVal) => {
    console.log('[BatchTransfer] Connected Address:', newVal);
  }, { immediate: true });

  watch(() => props.signer, (newVal) => {
    console.log('[BatchTransfer] Signer:', newVal ? 'Available' : 'Not available');
  }, { immediate: true });
}

// Composable
const {
  DISPERSE_CONTRACT,
  processing,
  estimatedGas,
  parseRecipientsList,
  calculateTotal,
  estimateGas,
  disperseEther,
  validateTransfer,
  generateTemplate
} = useDisperse();

// State
const recipientsText = ref('');
const parsedData = ref(null);
const validating = ref(false);
const estimatingGas = ref(false);
const validationErrors = ref([]);
const transactionResult = ref(null);

// Computed
const totalAmount = computed(() => {
  if (!parsedData.value || !parsedData.value.isValid) return 0n;
  return calculateTotal(parsedData.value.amounts);
});

const estimatedGasValue = computed(() => {
  return estimatedGas.value ? Number(estimatedGas.value) : null;
});

// Methods
function formatEther(value) {
  if (!value) return '0';
  return ethers.formatEther(value);
}

function loadTemplate() {
  recipientsText.value = generateTemplate();
  window.$message?.success('Template loaded!');
}

function loadExample() {
  recipientsText.value = `# Example batch transfer
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,0.1
0xdD2FD4581271e230360230F9337D5c0430Bf44C0,0.05
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed,0.01`;
  window.$message?.success('Example loaded!');
}

function clearInput() {
  recipientsText.value = '';
  parsedData.value = null;
  validationErrors.value = [];
  transactionResult.value = null;
  estimatedGas.value = null;
  window.$message?.info('Input cleared');
}

async function validateInput() {
  validating.value = true;
  transactionResult.value = null;
  validationErrors.value = [];

  try {
    // Parse the input
    const result = parseRecipientsList(recipientsText.value);
    parsedData.value = result;

    if (result.isValid) {
      window.$message?.success(`✅ Validated ${result.recipients.length} recipients`);

      // Additional validation if wallet is connected
      if (props.provider && props.connectedAddress) {
        const validation = await validateTransfer(
          props.provider,
          props.connectedAddress,
          result.recipients,
          result.amounts
        );

        if (!validation.isValid) {
          validationErrors.value = validation.errors;
        }
      }
    } else {
      window.$message?.error(`Found ${result.errors.length} error(s) in input`);
    }
  } catch (error) {
    console.error('[Batch Transfer] Validation error:', error);
    window.$message?.error('Validation failed: ' + error.message);
  } finally {
    validating.value = false;
  }
}

async function estimateGasForTransfer() {
  if (!props.provider || !parsedData.value) return;

  estimatingGas.value = true;

  try {
    await estimateGas(
      props.provider,
      parsedData.value.recipients,
      parsedData.value.amounts
    );

    window.$message?.success('Gas estimated successfully!');
  } catch (error) {
    console.error('[Batch Transfer] Gas estimation error:', error);
    window.$message?.error('Failed to estimate gas: ' + error.message);
  } finally {
    estimatingGas.value = false;
  }
}

async function executeBatchTransfer() {
  if (!props.signer || !parsedData.value) {
    window.$message?.error('Please connect your wallet');
    return;
  }

  if (validationErrors.value.length > 0) {
    window.$message?.error('Please fix validation errors first');
    return;
  }

  transactionResult.value = null;

  try {
    const result = await disperseEther(
      props.signer,
      parsedData.value.recipients,
      parsedData.value.amounts
    );

    transactionResult.value = result;
    window.$message?.success('🎉 Batch transfer completed!');

    // Clear input after successful transfer
    setTimeout(() => {
      recipientsText.value = '';
      parsedData.value = null;
    }, 3000);
  } catch (error) {
    console.error('[Batch Transfer] Execution error:', error);
    transactionResult.value = {
      success: false,
      error: error.message
    };
    window.$message?.error('Transfer failed: ' + error.message);
  }
}

function openExplorer(txHash) {
  const explorerUrl = props.explorerUrl || 'https://sepolia.etherscan.io';
  window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
}
</script>

<style scoped>
.batch-transfer {
  width: 100%;
}

code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
}
</style>
