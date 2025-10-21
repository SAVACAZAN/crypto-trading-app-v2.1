<template>
  <div class="ticker-bar-page">
    <h1 class="page-title">📊 Ticker Bar Testing</h1>

    <div class="ticker-container">
      <h2 class="section-title">Ticker Bar Component</h2>
      <TickerBar />
    </div>

    <div class="info-section">
      <h3>Ticker Bar Features:</h3>
      <ul>
        <li>Exchange selection (Cyan color)</li>
        <li>Pair selection (Magenta color)</li>
        <li>Real-time BTC price from Binance</li>
        <li>Real-time ETH price from Binance</li>
        <li>Auto-refresh every 500ms</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// Page pentru testing ticker bar
</script>

<style scoped>
.ticker-bar-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 30px;
}

.ticker-container {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  color: #00ffff;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.info-section {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.info-section h3 {
  color: #ff00ff;
  font-size: 18px;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.info-section li:before {
  content: "▸";
  position: absolute;
  left: 0;
  color: #00ffff;
  font-weight: bold;
}
</style>
