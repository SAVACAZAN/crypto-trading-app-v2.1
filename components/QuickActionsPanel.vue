<script setup>
import { ref } from 'vue';
import '~/components/styles/quick-actions-styles.css';

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

const emit = defineEmits(['update-lower-price', 'update-upper-price', 'update-grids', 'update-amount']);

// Drag state for Quick Actions section
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const qaX = ref(0);
const qaY = ref(0);
const showPriceActions = ref(true);

function startDrag(event) {
  if (event.button !== 0) return; // Only left mouse button
  isDragging.value = true;

  // Get Quick Actions section element
  const qaSection = document.querySelector('.qa-config-section');
  if (!qaSection) return;

  // Calculate offset between mouse and element position
  const rect = qaSection.getBoundingClientRect();
  dragOffsetX.value = event.clientX - rect.left;
  dragOffsetY.value = event.clientY - rect.top;

  // Add event listeners
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  event.preventDefault();
}

function handleDragMove(event) {
  if (!isDragging.value) return;

  qaX.value = event.clientX - dragOffsetX.value;
  qaY.value = event.clientY - dragOffsetY.value;
}

function handleDragEnd() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}

function updateLowerPrice(deviationPercentage) {
  emit('update-lower-price', deviationPercentage);
}

function updateUpperPrice(deviationPercentage) {
  emit('update-upper-price', deviationPercentage);
}

function updateGrids(value) {
  emit('update-grids', value);
}

function updateAmount(value) {
  emit('update-amount', value);
}
</script>

<template>
  <!-- Quick Actions Panel - Draggable -->
  <div
    class="qa-config-section config-section"
    :style="{
      position: qaX > 0 || qaY > 0 ? 'fixed' : 'static',
      left: qaX > 0 ? qaX + 'px' : 'auto',
      top: qaY > 0 ? qaY + 'px' : 'auto',
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: isDragging ? 1001 : 'auto'
    }"
  >
    <div class="section-header" @mousedown="startDrag" style="user-select: none;">
      <span>💰 Quick Actions</span>
      <span class="collapse-icon" @click.stop="showPriceActions = !showPriceActions">{{ showPriceActions ? '▼' : '▶' }}</span>
    </div>
    <div v-show="showPriceActions" class="section-content qa-section">
      <!-- PRICE ACTIONS TABLE -->
      <div class="price-actions-table">
        <div class="price-row">
          <span class="price-row-label">Lower</span>
          <div class="price-row-buttons">
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.0001)">-</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.005)">0.5%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.01)">1%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.02)">2%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.03)">3%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.05)">5%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.07)">7%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.09)">9%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.10)">10%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.15)">15%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.20)">20%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.30)">30%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.40)">40%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.50)">50%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.60)">60%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.70)">70%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.80)">80%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.90)">90%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.91)">91%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.92)">92%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.93)">93%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.94)">94%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.95)">95%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.96)">96%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.97)">97%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.98)">98%</n-button>
            <n-button size="tiny" type="success" @click="updateLowerPrice(0.99)">99%</n-button>
          </div>
        </div>
        <div class="price-row">
          <span class="price-row-label">Upper</span>
          <div class="price-row-buttons">
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.001)">+</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.005)">0.5%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.01)">1%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.02)">2%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.03)">3%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.05)">5%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.07)">7%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.09)">9%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.10)">10%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.15)">15%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.20)">20%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.30)">30%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.40)">40%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.50)">50%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.60)">60%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.70)">70%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.80)">80%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(0.90)">90%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(1.00)">100%</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(2.00)">x2</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(3.00)">x3</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(4.00)">x4</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(5.00)">x5</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(6.00)">x6</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(7.00)">x7</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(8.00)">x8</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(9.00)">x9</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(10.00)">x10</n-button>
            <n-button size="tiny" type="error" @click="updateUpperPrice(20.00)">x20</n-button>
          </div>
        </div>
      </div>

      <!-- GRIDS AND AMOUNT QUICK ACTIONS -->
      <div class="quick-actions-row">
        <span class="quick-actions-label">Grids</span>
        <div class="quick-buttons-inline">
          <n-button size="tiny" type="warning" @click="updateGrids('10')">10</n-button>
          <n-button size="tiny" type="warning" @click="updateGrids('20')">20</n-button>
          <n-button size="tiny" type="warning" @click="updateGrids('30')">30</n-button>
          <n-button size="tiny" type="warning" @click="updateGrids('50')">50</n-button>
          <n-button size="tiny" type="warning" @click="updateGrids('100')">100</n-button>
        </div>

        <span class="quick-actions-label">Amount</span>
        <div class="quick-buttons-inline">
          <n-button size="tiny" type="info" @click="updateAmount('1.1')">1.1</n-button>
          <n-button size="tiny" type="info" @click="updateAmount('5')">5</n-button>
          <n-button size="tiny" type="info" @click="updateAmount('10.1')">10.1</n-button>
          <n-button size="tiny" type="info" @click="updateAmount('50')">50</n-button>
          <n-button size="tiny" type="info" @click="updateAmount('100')">100</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Config Section Styling */
.config-section {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.section-header {
  padding: 6px 8px;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  transition: background 0.2s;
}

.section-header:hover {
  background: #242936;
}

.collapse-icon {
  font-size: 9px;
  color: #666;
  cursor: pointer;
}

.section-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
