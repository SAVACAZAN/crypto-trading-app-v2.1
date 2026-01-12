<script setup>
import { ref } from 'vue';

const props = defineProps({
  activeBots: {
    type: Array,
    default: () => []
  }
});

// Drag state for Active Bots section
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const botsX = ref(0);
const botsY = ref(0);
const showBotsList = ref(true);

function startDrag(event) {
  if (event.button !== 0) return; // Only left mouse button
  isDragging.value = true;

  // Get Active Bots section element
  const botsSection = document.querySelector('.bots-config-section');
  if (!botsSection) return;

  // Calculate offset between mouse and element position
  const rect = botsSection.getBoundingClientRect();
  dragOffsetX.value = event.clientX - rect.left;
  dragOffsetY.value = event.clientY - rect.top;

  // Add event listeners
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  event.preventDefault();
}

function handleDragMove(event) {
  if (!isDragging.value) return;

  botsX.value = event.clientX - dragOffsetX.value;
  botsY.value = event.clientY - dragOffsetY.value;
}

function handleDragEnd() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}
</script>

<template>
  <!-- Active Bots Panel - Draggable -->
  <div
    class="bots-config-section config-section"
    :style="{
      position: botsX > 0 || botsY > 0 ? 'fixed' : 'static',
      left: botsX > 0 ? botsX + 'px' : 'auto',
      top: botsY > 0 ? botsY + 'px' : 'auto',
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: isDragging ? 1001 : 'auto',
      width: '50%',
      maxHeight: '80vh'
    }"
  >
    <div class="section-header" @mousedown="startDrag" style="user-select: none;">
      <span>🤖 Active Bots</span>
      <span class="collapse-icon" @click.stop="showBotsList = !showBotsList">{{ showBotsList ? '▼' : '▶' }}</span>
    </div>
    <div v-show="showBotsList" class="section-content bots-section">
      <!-- Bots Table - Always Visible -->
      <div class="bots-table-wrapper">
        <table class="bots-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Symbol</th>
              <th>API Keys</th>
              <th>Lower Price</th>
              <th>Upper Price</th>
              <th>Amount</th>
              <th>Grids</th>
              <th>Price@Start</th>
              <th>Profit ($)</th>
              <th>Profit %</th>
              <th>Profit/Grid</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="activeBots && activeBots.length > 0" v-for="(bot, idx) in activeBots" :key="idx">
              <td>{{ bot.name || '-' }}</td>
              <td>{{ bot.symbol || '-' }}</td>
              <td>{{ bot.apiKeys || '-' }}</td>
              <td>{{ bot.lowerPrice?.toFixed(6) || '-' }}</td>
              <td>{{ bot.upperPrice?.toFixed(6) || '-' }}</td>
              <td>{{ bot.amount?.toFixed(4) || '-' }}</td>
              <td>{{ bot.nrOfGrids || '-' }}</td>
              <td>{{ bot.priceAtStart?.toFixed(6) || '-' }}</td>
              <td :class="{ profit: (bot.profit || 0) > 0, loss: (bot.profit || 0) < 0 }">
                ${{ bot.profit?.toFixed(2) || '0.00' }}
              </td>
              <td :class="{ profit: (bot.profitPercent || 0) > 0, loss: (bot.profitPercent || 0) < 0 }">
                {{ bot.profitPercent?.toFixed(2) || '0.00' }}%
              </td>
              <td>{{ bot.profitPerGrid?.toFixed(4) || '0.0000' }}</td>
            </tr>
            <tr v-else class="empty-row">
              <td colspan="11" class="empty-message">No active bots yet - Create a strategy and apply it to start a bot</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Active Bots Config Section - Draggable */
.bots-config-section {
  transition: all 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.bots-config-section.dragging {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
}

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
  overflow-y: auto;
  max-height: calc(80vh - 40px);
}

.bots-section {
  padding: 0;
}

/* Bots Table */
.bots-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #2a3441;
  border-radius: 4px;
  background: #0f1419;
}

.bots-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  font-family: 'Courier New', monospace;
}

.bots-table thead {
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  position: sticky;
  top: 0;
  z-index: 10;
}

.bots-table th {
  padding: 4px 6px;
  text-align: center;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  border-right: 1px solid rgba(42, 52, 65, 0.3);
  font-size: 8px;
}

.bots-table th:last-child {
  border-right: none;
}

.bots-table td {
  padding: 3px 6px;
  text-align: center;
  border-bottom: 1px solid rgba(42, 52, 65, 0.3);
  border-right: 1px solid rgba(42, 52, 65, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ccc;
  font-size: 9px;
}

.bots-table td:last-child {
  border-right: none;
}

.bots-table tbody tr {
  background: rgba(0, 0, 0, 0.2);
  border-left: 2px solid #3b82f6;
}

.bots-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.1);
}

/* Profit/Loss Colors */
.bots-table td.profit {
  color: #10eb04;
  font-weight: 700;
}

.bots-table td.loss {
  color: #eb0404;
  font-weight: 700;
}

/* Empty Row Message */
.bots-table tbody tr.empty-row {
  background: rgba(0, 0, 0, 0.1);
  border-left: 2px solid #666;
}

.bots-table tbody tr.empty-row:hover {
  background: rgba(0, 0, 0, 0.1);
}

.bots-table td.empty-message {
  color: #888;
  font-size: 11px;
  text-align: center;
  padding: 12px 6px;
  font-style: italic;
}

/* Scrollbar styling */
.bots-table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.bots-table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.bots-table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.4);
  border-radius: 4px;
}

.bots-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.6);
}
</style>
