<template>
  <div class="app-top-button-bar">
    <!-- Palantir Intelligence -->
    <n-tooltip placement="bottom">
      <template #trigger>
        <nuxt-link to="/PalantirApp" class="app-link">
          <div class="app-icon-btn palantir-btn">
            <span class="icon-emoji">🎯</span>
          </div>
        </nuxt-link>
      </template>
      <span>Palantir Intelligence</span>
    </n-tooltip>

    <!-- Crypto App -->
    <n-tooltip placement="bottom">
      <template #trigger>
        <nuxt-link to="/cryptoapp" class="app-link">
          <div class="app-icon-btn crypto-btn">
            <span class="icon-emoji">💰</span>
          </div>
        </nuxt-link>
      </template>
      <span>Crypto Dashboard</span>
    </n-tooltip>

    <!-- Stocks Trading -->
    <n-tooltip placement="bottom">
      <template #trigger>
        <nuxt-link to="/StocksMarkets/GlobalMarketOverview" class="app-link">
          <div class="app-icon-btn stocks-btn">
            <span class="icon-emoji">📈</span>
          </div>
        </nuxt-link>
      </template>
      <span>Stock Trading</span>
    </n-tooltip>
  </div>
</template>

<script setup>
// No JavaScript needed - using native NuxtLink navigation
</script>

<style scoped>
.app-top-button-bar {
  display: flex;
  gap: 4px;
  align-items: center;
}

.app-link {
  text-decoration: none;
  display: inline-block;
  border-radius: 50%;
}

.app-icon-btn {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  padding: 0 !important;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.icon-emoji {
  font-size: 10px;
  line-height: 1;
  display: inline-block;
}

/* Palantir Button */
.palantir-btn {
  background: linear-gradient(135deg, #00d4ff, #10eb04) !important;
  border-color: rgba(0, 212, 255, 0.5) !important;
}

.palantir-btn:hover {
  border-color: rgba(0, 212, 255, 0.8) !important;
  box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4) !important;
}

/* Crypto Button */
.crypto-btn {
  background: linear-gradient(135deg, #10eb04, #05f5ed) !important;
  border-color: rgba(16, 235, 4, 0.5) !important;
}

.crypto-btn:hover {
  border-color: rgba(16, 235, 4, 0.8) !important;
  box-shadow: 0 8px 24px rgba(16, 235, 4, 0.4) !important;
}

/* Stocks Button */
.stocks-btn {
  background: linear-gradient(135deg, #ff6b35, #f7931a) !important;
  border-color: rgba(255, 107, 53, 0.5) !important;
}

.stocks-btn:hover {
  border-color: rgba(255, 107, 53, 0.8) !important;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4) !important;
}

/* Remove default NaiveUI button styling conflicts */
.app-icon-btn :deep(.n-button__content) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon-btn :deep(.n-icon) {
  margin: 0 !important;
}
</style>
