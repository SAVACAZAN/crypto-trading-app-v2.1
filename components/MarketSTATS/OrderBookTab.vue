<template>
  <div class="orderbook-tab">
    <h2>📖 Order Book for {{ coin }}</h2>
    <p class="coming-soon">Coming Soon...</p>
  </div>
</template>

<script setup>
const props = defineProps({
  symbol: String,
  exchange: String,
  coin: String
});
</script>

<style scoped>
.orderbook-tab {
  padding: 40px;
  text-align: center;
}

h2 {
  color: #4ade80;
  margin-bottom: 20px;
}

.coming-soon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}
</style>
