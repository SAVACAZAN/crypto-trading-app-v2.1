<template>
  <n-card class="dashboard-card" size="small">
    <template #header>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">🤖</span>
        <span>Automation Bots</span>
        <n-tag size="tiny" type="info">12 Types</n-tag>
      </div>
    </template>
    <p style="font-size: 10px; color: #888; margin-bottom: 8px;">
      Select bot type, then click "Rules" on an order to create automation
    </p>
    <div class="bot-types-grid">
      <div
        v-for="bot in botTypes"
        :key="bot.value"
        class="bot-type-item"
        :class="{ active: selected === bot.value }"
        @click="selectBot(bot.value)"
      >
        <span class="bot-icon">{{ bot.icon }}</span>
        <span class="bot-name">{{ bot.shortName }}</span>
        <n-tag v-if="bot.rulesCount > 0" size="tiny" type="success" round>
          {{ bot.rulesCount }}
        </n-tag>
      </div>
    </div>
    <div v-if="selectedBot" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #333;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #10eb04; font-weight: bold;">{{ selectedBot.label }}</span>
        <n-button size="tiny" @click="$emit('show-info', selected)">
          ℹ️ Details
        </n-button>
      </div>
      <p style="font-size: 11px; color: #888; margin-top: 4px;">{{ selectedBot.description }}</p>
      <div style="margin-top: 8px; padding: 8px; background: #1a1a1a; border-radius: 4px;">
        <div style="font-size: 10px; color: #666; margin-bottom: 4px;">Required Parameters:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          <n-tag v-for="param in selectedBot.requiredParams" :key="param" size="tiny" :bordered="false">
            {{ param }}
          </n-tag>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { computed } from 'vue';
import { BOT_TYPES } from '~/constants/botTypes';

const props = defineProps({
  selected: {
    type: String,
    default: null
  },
  rulesCount: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:selected', 'show-info']);

const botTypes = computed(() => {
  return Object.values(BOT_TYPES).map(bot => ({
    value: bot.id,
    label: bot.name,
    shortName: bot.name.split(' ')[0],
    icon: bot.icon,
    description: bot.description,
    requiredParams: bot.requiresConfig,
    rulesCount: props.rulesCount[bot.id] || 0
  }));
});

const selectedBot = computed(() => {
  return botTypes.value.find(b => b.value === props.selected);
});

function selectBot(type) {
  emit('update:selected', props.selected === type ? null : type);
}
</script>

<style scoped>
.dashboard-card {
  height: 100%;
}

.bot-types-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.bot-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  background: #1a1a1a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  gap: 4px;
  position: relative;
}

.bot-type-item:hover {
  background: #252525;
  transform: translateY(-2px);
}

.bot-type-item.active {
  background: linear-gradient(135deg, #1e3a1e 0%, #0d2d0d 100%);
  border-color: #10eb04;
}

.bot-icon {
  font-size: 18px;
}

.bot-name {
  font-size: 9px;
  font-weight: 600;
  color: #e0e0e0;
  text-align: center;
}
</style>
