<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  bestBid: {
    type: Number,
    default: null
  },
  bestAsk: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['updateLowerPrice', 'updateUpperPrice']);

// Functions to emit events with deviation percentages
function updateLowerPrice(deviation) {
  emit('updateLowerPrice', deviation);
}

function updateUpperPrice(deviation) {
  emit('updateUpperPrice', deviation);
}
</script>

<template>
  <div style="padding: 2px;">
    <!-- Lower Price - 2 rows -->
    <div style="margin-bottom: 2px;">
      <div style="font-size: 6px; color: #10eb04; margin-bottom: 1px;">🟢 Lower (% below bid)</div>
      <!-- Row 1: 1-30 -->
      <div style="display: flex; gap: 1px; margin-bottom: 1px;">
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.01)">1</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.02)">2</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.03)">3</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.04)">4</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.05)">5</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.1)">10</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.15)">15</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.2)">20</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.25)">25</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.3)">30</n-button>
      </div>
      <!-- Row 2: 40-90 -->
      <div style="display: flex; gap: 1px;">
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.4)">40</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.5)">50</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.6)">60</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.7)">70</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.8)">80</n-button>
        <n-button size="tiny" class="btn buy-btn" @click="updateLowerPrice(0.9)">90</n-button>
      </div>
    </div>

    <!-- Upper Price - 2 rows -->
    <div>
      <div style="font-size: 6px; color: #f52a09; margin-bottom: 1px;">🔴 Upper (% above ask)</div>
      <!-- Row 1: 1-30 -->
      <div style="display: flex; gap: 1px; margin-bottom: 1px;">
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.01)">1</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.02)">2</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.03)">3</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.04)">4</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.05)">5</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.1)">10</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.15)">15</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.2)">20</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.25)">25</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.3)">30</n-button>
      </div>
      <!-- Row 2: 40-90 -->
      <div style="display: flex; gap: 1px;">
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.4)">40</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.5)">50</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.6)">60</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.7)">70</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.8)">80</n-button>
        <n-button size="tiny" class="btn sell-btn" @click="updateUpperPrice(0.9)">90</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  flex: 1;
  font-size: 6px;
  padding: 0;
  height: 11px;
  max-height: 11px;
  min-height: 11px;
  line-height: 11px;
  font-weight: 600;
  min-width: 0;
}

.buy-btn {
  background: rgba(16, 235, 4, 0.08);
  border-color: rgba(16, 235, 4, 0.2);
  color: #10eb04;
}

.buy-btn:hover {
  background: rgba(16, 235, 4, 0.15);
  border-color: #10eb04;
}

.sell-btn {
  background: rgba(245, 42, 9, 0.08);
  border-color: rgba(245, 42, 9, 0.2);
  color: #f52a09;
}

.sell-btn:hover {
  background: rgba(245, 42, 9, 0.15);
  border-color: #f52a09;
}
</style>
