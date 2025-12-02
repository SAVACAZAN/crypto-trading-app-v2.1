<template>
  <div class="fiat-wallet-container">
    <!-- Header -->
    <div class="wallet-header">
      <h2>💵 Fiat Wallets</h2>
      <p>Manage your fiat currency accounts and bank connections</p>
    </div>

    <!-- Coming Soon State -->
    <div class="coming-soon-state">
      <n-empty description="Fiat Wallet Management">
        <template #icon>
          <span style="font-size: 64px;">💵</span>
        </template>
        <template #extra>
          <n-alert type="info" style="max-width: 600px; margin: 20px auto;">
            <template #icon>
              <span style="font-size: 20px;">🚀</span>
            </template>
            <strong>Coming Soon!</strong>
            <p style="margin-top: 8px;">
              Fiat wallet management is currently under development. Soon you will be able to:
            </p>
            <ul style="text-align: left; margin-top: 12px; padding-left: 24px;">
              <li>Connect bank accounts</li>
              <li>Manage USD, EUR, GBP and other fiat currencies</li>
              <li>Track fiat balances across multiple accounts</li>
              <li>Facilitate crypto-to-fiat conversions</li>
              <li>View transaction history</li>
            </ul>
          </n-alert>
        </template>
      </n-empty>
    </div>

    <!-- Preview Cards -->
    <div class="preview-cards-grid">
      <div class="preview-card disabled">
        <div class="card-header">
          <div class="currency-icon">$</div>
          <div class="currency-info">
            <h3>US Dollar</h3>
            <span class="currency-symbol">USD</span>
          </div>
        </div>
        <n-tag type="warning">Coming Soon</n-tag>
      </div>

      <div class="preview-card disabled">
        <div class="card-header">
          <div class="currency-icon">€</div>
          <div class="currency-info">
            <h3>Euro</h3>
            <span class="currency-symbol">EUR</span>
          </div>
        </div>
        <n-tag type="warning">Coming Soon</n-tag>
      </div>

      <div class="preview-card disabled">
        <div class="card-header">
          <div class="currency-icon">£</div>
          <div class="currency-info">
            <h3>British Pound</h3>
            <span class="currency-symbol">GBP</span>
          </div>
        </div>
        <n-tag type="warning">Coming Soon</n-tag>
      </div>

      <div class="preview-card disabled">
        <div class="card-header">
          <div class="currency-icon">+</div>
          <div class="currency-info">
            <h3>More Currencies</h3>
            <span class="currency-symbol">Coming Soon</span>
          </div>
        </div>
        <n-tag type="info">In Development</n-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder component - will be implemented later
</script>

<style scoped>
.fiat-wallet-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.wallet-header {
  margin-bottom: 30px;
}

.wallet-header h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
}

.wallet-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.coming-soon-state {
  padding: 40px 20px;
  text-align: center;
}

.preview-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.preview-card {
  background: linear-gradient(135deg, rgba(30, 35, 50, 0.5), rgba(20, 25, 40, 0.5));
  border: 2px solid rgba(100, 100, 100, 0.2);
  border-radius: 16px;
  padding: 24px;
  opacity: 0.6;
  cursor: not-allowed;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.currency-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.currency-info h3 {
  font-size: 18px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.currency-symbol {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}
</style>
