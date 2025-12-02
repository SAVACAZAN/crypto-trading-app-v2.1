<template>
  <div class="palantir-page">
    <div class="page-header">
      <div class="header-icon">📜</div>
      <div class="header-content">
        <h1 class="page-title">Bot Logs</h1>
        <p class="page-subtitle">Real-time bot execution logs and debugging</p>
      </div>
    </div>

    <div class="content-grid">
      <div class="info-card">
        <h3>🚀 Coming Soon</h3>
        <p>Bot Logs feature is under development. This will provide detailed logging and monitoring for all bot activities.</p>

        <div class="feature-list">
          <div class="feature-item">
            <span class="icon">📝</span>
            <div>
              <div class="feature-title">Real-time Logging</div>
              <div class="feature-desc">Live stream of bot actions, orders, and decisions</div>
            </div>
          </div>

          <div class="feature-item">
            <span class="icon">🔍</span>
            <div>
              <div class="feature-title">Advanced Filtering</div>
              <div class="feature-desc">Filter logs by bot, severity, timestamp, and keywords</div>
            </div>
          </div>

          <div class="feature-item">
            <span class="icon">💾</span>
            <div>
              <div class="feature-title">Log Export</div>
              <div class="feature-desc">Export logs to CSV, JSON for analysis and debugging</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});
</script>

<style scoped>
.palantir-page {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
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

.content-grid {
  display: grid;
  gap: 20px;
}

.info-card {
  background: rgba(15,52,96,0.2);
  border: 1px solid #0f3460;
  padding: 30px;
  border-radius: 8px;
}

.info-card h3 {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #00d4ff;
}

.info-card p {
  color: #bbb;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.feature-list {
  display: grid;
  gap: 15px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
  border: 1px solid #222;
}

.feature-item .icon {
  font-size: 24px;
  min-width: 40px;
}

.feature-title {
  font-size: 16px;
  color: #00d4ff;
  font-weight: 600;
  margin-bottom: 5px;
}

.feature-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.5;
}
</style>
