<template>
  <n-card class="orders-card" size="small">
    <div class="orders-header">
      <span class="orders-title">📊 Orders ({{ filteredOrders.length }})</span>
      <n-space :size="8">
        <n-tag :type="props.autoMonitor ? 'success' : 'default'" size="small">
          {{ props.autoMonitor ? '🟢 Auto Monitor' : '⚪ Manual' }}
        </n-tag>
        <n-switch :value="props.autoMonitor" @update:value="emit('update:autoMonitor', $event)" size="small">
          <template #checked>ON</template>
          <template #unchecked>OFF</template>
        </n-switch>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredOrders"
      :pagination="pagination"
      :loading="loading"
      size="small"
      :max-height="500"
      :scroll-x="1400"
      striped
    />
  </n-card>
</template>

<script setup>
import { h } from 'vue';
import { NButton, NTag, NProgress, NSpace } from 'naive-ui';

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  autoMonitor: {
    type: Boolean,
    default: false
  },
  selectedBotType: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:autoMonitor', 'add-rule', 'view-rules', 'create-bot']);

const pagination = ref({
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true
});

const filteredOrders = computed(() => props.orders);

const columns = [
  {
    title: 'Order ID',
    key: 'id',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { style: 'font-family: monospace; font-size: 10px' }, row.id.slice(0, 8))
  },
  {
    title: 'API Key',
    key: 'apiKeyName',
    width: 100,
    render: (row) => h(NTag, { type: 'info', size: 'tiny' }, { default: () => row.apiKeyName || 'N/A' })
  },
  {
    title: 'Symbol',
    key: 'symbol',
    width: 100,
    render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => row.symbol })
  },
  {
    title: 'Side',
    key: 'side',
    width: 80,
    render: (row) => h(NTag, { type: row.side === 'buy' ? 'success' : 'error', size: 'small' }, { default: () => row.side.toUpperCase() })
  },
  {
    title: 'Type',
    key: 'type',
    width: 90
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 120,
    render: (row) => `${row.amount.toFixed(4)} ${row.symbol.split('/')[0]}`
  },
  {
    title: 'Filled',
    key: 'filled',
    width: 120,
    render: (row) => {
      const percent = (row.filled / row.amount * 100).toFixed(1);
      return h(NSpace, { size: 4, align: 'center' }, {
        default: () => [
          h('span', `${row.filled.toFixed(4)}`),
          h(NTag, { type: percent > 0 ? 'warning' : 'default', size: 'tiny' }, { default: () => `${percent}%` })
        ]
      });
    }
  },
  {
    title: 'Price',
    key: 'price',
    width: 110,
    render: (row) => `$${row.price.toFixed(4)}`
  },
  {
    title: 'Total Value',
    key: 'totalValue',
    width: 120,
    render: (row) => {
      const value = row.amount * row.price;
      return h(NTag, { type: 'success', size: 'small' }, { default: () => `$${value.toFixed(2)}` });
    }
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) => {
      const typeMap = {
        open: 'default',
        partial: 'warning',
        filled: 'success',
        canceled: 'error'
      };
      return h(NTag, { type: typeMap[row.status], size: 'small' }, { default: () => row.status });
    }
  },
  {
    title: 'Active Rules',
    key: 'activeRules',
    width: 180,
    render: (row) => {
      if (!row.rulesCount || row.rulesCount === 0) {
        return h(NTag, { type: 'default', size: 'small' }, { default: () => 'No rules' });
      }

      return h(NSpace, { size: 4, vertical: true }, {
        default: () => [
          h(NSpace, { size: 4, align: 'center' }, {
            default: () => [
              h(NTag, {
                type: row.hasActiveRules ? 'success' : 'default',
                size: 'small'
              }, {
                default: () => row.hasActiveRules ? '🟢 Active' : '⚪ Inactive'
              }),
              h(NTag, {
                type: 'info',
                size: 'tiny'
              }, {
                default: () => `${row.rulesCount} rule${row.rulesCount > 1 ? 's' : ''}`
              })
            ]
          }),
          row.fillPercent > 0 && row.fillPercent < 100 ? h(NProgress, {
            type: 'line',
            percentage: parseFloat(row.fillPercent),
            height: 4,
            color: '#67c23a',
            railColor: '#e6e6e6'
          }) : null
        ].filter(Boolean)
      });
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 280,
    fixed: 'right',
    render: (row) => {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, {
            size: 'tiny',
            type: 'primary',
            onClick: () => emit('add-rule', row)
          }, { default: () => '➕ Add Rule' }),
          h(NButton, {
            size: 'tiny',
            type: 'info',
            onClick: () => emit('view-rules', row)
          }, { default: () => `📋 Rules (${row.rulesCount || 0})` }),
          h(NButton, {
            size: 'tiny',
            type: 'success',
            disabled: !props.selectedBotType,
            onClick: () => emit('create-bot', row)
          }, { default: () => props.selectedBotType ? `🤖 ${props.selectedBotType.toUpperCase()}` : '🤖 Select Bot' })
        ]
      });
    }
  }
];
</script>

<style scoped>
.orders-card {
  margin-top: 16px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.orders-title {
  font-weight: bold;
  font-size: 14px;
  color: #10eb04;
}
</style>
