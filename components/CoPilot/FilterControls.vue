<template>
  <n-card class="filter-card" size="small">
    <div class="filter-header">
      <span class="filter-title">🔍 Order Filters</span>
      <n-button size="small" @click="$emit('refresh')" :loading="loading">
        <template #icon><span>🔄</span></template>
        Refresh
      </n-button>
    </div>

    <n-space :size="12">
      <!-- Size Filter -->
      <n-button-group>
        <n-button
          size="small"
          :type="modelValue.sizeFilter === 100 ? 'primary' : 'default'"
          @click="updateFilter('sizeFilter', 100)"
        >
          $100+
        </n-button>
        <n-button
          size="small"
          :type="modelValue.sizeFilter === 1000 ? 'primary' : 'default'"
          @click="updateFilter('sizeFilter', 1000)"
        >
          $1K+
        </n-button>
        <n-button
          size="small"
          :type="modelValue.sizeFilter === 5000 ? 'primary' : 'default'"
          @click="updateFilter('sizeFilter', 5000)"
        >
          $5K+
        </n-button>
        <n-button
          size="small"
          :type="modelValue.sizeFilter === 10000 ? 'primary' : 'default'"
          @click="updateFilter('sizeFilter', 10000)"
        >
          $10K+
        </n-button>
        <n-button
          size="small"
          :type="modelValue.sizeFilter === 'custom' ? 'primary' : 'default'"
          @click="updateFilter('sizeFilter', 'custom')"
        >
          Custom
        </n-button>
      </n-button-group>

      <!-- Custom Amount Input -->
      <n-input-number
        v-if="modelValue.sizeFilter === 'custom'"
        :value="modelValue.customSize"
        @update:value="updateFilter('customSize', $event)"
        placeholder="Custom amount"
        size="small"
        style="width: 150px"
        :min="1"
      >
        <template #prefix>$</template>
      </n-input-number>

      <!-- Status Filter -->
      <n-select
        :value="modelValue.statusFilter"
        @update:value="updateFilter('statusFilter', $event)"
        :options="statusOptions"
        placeholder="Status"
        size="small"
        style="width: 150px"
      />
    </n-space>
  </n-card>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'refresh']);

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Partial', value: 'partial' },
  { label: 'Filled', value: 'filled' },
  { label: 'Canceled', value: 'canceled' }
];

function updateFilter(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
}
</script>

<style scoped>
.filter-card {
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-weight: bold;
  font-size: 14px;
  color: #10eb04;
}
</style>
