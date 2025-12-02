<template>
    <div class="palantir-page">
      <div class="page-header">
        <div class="header-icon">📊</div>
        <div class="header-content">
          <h1 class="page-title">Real-Time Analytics</h1>
          <p class="page-subtitle">Live Market Intelligence & Trading Insights</p>
        </div>
      </div>

      <!-- Analytics Grid -->
      <div class="analytics-grid">
        <nuxt-link to="/PalantirApp/Analytics/OrderFlow" class="analytics-card">
          <div class="card-icon" style="color: #00d4ff;">💹</div>
          <h3>Order Flow Analysis</h3>
          <p>Real-time order flow visualization and market depth analysis</p>
          <div class="card-badge">ACTIVE</div>
        </nuxt-link>

        <nuxt-link to="/PalantirApp/Analytics/LiquidityAnalysis" class="analytics-card">
          <div class="card-icon" style="color: #10eb04;">💧</div>
          <h3>Liquidity Analysis</h3>
          <p>Market liquidity zones and support/resistance levels</p>
          <div class="card-badge">ACTIVE</div>
        </nuxt-link>

        <nuxt-link to="/PalantirApp/Analytics/MultiTimeframe" class="analytics-card">
          <div class="card-icon" style="color: #f5a623;">⏱️</div>
          <h3>Multi-Timeframe</h3>
          <p>Synchronized analysis across multiple timeframes</p>
          <div class="card-badge coming-soon">SOON</div>
        </nuxt-link>

        <nuxt-link to="/PalantirApp/Analytics/MarketHeatmap" class="analytics-card">
          <div class="card-icon" style="color: #f52a09;">🗺️</div>
          <h3>Market Heatmap</h3>
          <p>Visual representation of market movements</p>
          <div class="card-badge coming-soon">SOON</div>
        </nuxt-link>

        <nuxt-link to="/PalantirApp/Analytics/CorrelationMatrix" class="analytics-card">
          <div class="card-icon" style="color: #8a2be2;">🔗</div>
          <h3>Correlation Matrix</h3>
          <p>Asset correlation and portfolio diversification</p>
          <div class="card-badge coming-soon">SOON</div>
        </nuxt-link>

        <nuxt-link to="/PalantirApp/Analytics/SentimentAnalysis" class="analytics-card">
          <div class="card-icon" style="color: #ff69b4;">💭</div>
          <h3>Sentiment Analysis</h3>
          <p>Social media and news sentiment tracking</p>
          <div class="card-badge coming-soon">SOON</div>
        </nuxt-link>
      </div>
    </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'palantir' });
</script>

<style scoped>
.palantir-page {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #0f3460;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 48px;
  filter: drop-shadow(0 0 10px rgba(0,212,255,0.5));
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 32px;
  color: #00d4ff;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0,212,255,0.5);
}

.page-subtitle {
  margin: 8px 0 0 0;
  color: #888;
  font-size: 14px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.analytics-card {
  background: rgba(15,52,96,0.2);
  border: 1px solid #0f3460;
  padding: 30px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.analytics-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,212,255,0.3);
  border-color: #00d4ff;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.analytics-card h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #fff;
  font-weight: 700;
}

.analytics-card p {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.6;
}

.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #10eb04;
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-badge.coming-soon {
  background: #666;
  color: #fff;
}
</style>
