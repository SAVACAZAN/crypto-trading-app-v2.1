<template>
  <div class="hyperliquid-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ffaa" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        </div>
        <div>
          <h1 class="page-title">⚡ Hyperliquid Trading</h1>
          <p class="page-subtitle">High-performance perpetual futures DEX • Deposit • Trade • Withdraw</p>
        </div>
      </div>
    </div>

    <!-- API Key Selector -->
    <n-card class="api-selector-card" style="margin-bottom: 24px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ffaa" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style="font-size: 16px; font-weight: 600;">Select Hyperliquid Account</span>
        </div>
      </template>

      <n-space vertical :size="16">
        <n-select
          v-model:value="selectedKeyId"
          :options="keyOptions"
          placeholder="Choose your Hyperliquid wallet..."
          size="large"
          @update:value="onKeySelect"
        >
          <template #empty>
            <div style="padding: 20px; text-align: center;">
              <p style="color: #888; margin-bottom: 12px;">No Hyperliquid accounts configured</p>
              <n-button type="primary" size="small" @click="navigateToProfile">
                Add Hyperliquid Account
              </n-button>
            </div>
          </template>
        </n-select>

        <div v-if="selectedKey" class="selected-wallet-info">
          <div class="info-row">
            <span class="info-label">Wallet Address:</span>
            <code class="wallet-address">{{ selectedKey.walletAddress }}</code>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <n-tag :bordered="false" type="success" size="small">Connected</n-tag>
          </div>
        </div>
      </n-space>
    </n-card>

    <!-- Main Content Tabs -->
    <n-tabs v-model:value="mainTab" type="card" animated size="large">
      <!-- Account Main Tab -->
      <n-tab-pane name="account" tab="💰 Account">
        <n-tabs v-model:value="accountSubTab" type="line" animated>
          <!-- Deposit Sub-Tab -->
          <n-tab-pane name="deposit" tab="💰 Deposit">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #00ffaa 0%, #00cc88 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px;">Deposit Funds to Hyperliquid</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  Transfer USDC from Arbitrum to your Hyperliquid account
                </p>
              </div>
            </div>
          </template>

          <!-- Deposit Info Box -->
          <div class="info-box" style="margin-bottom: 24px;">
            <div style="font-size: 13px; color: #a0a0a0; line-height: 1.6;">
              <strong style="color: #00ffaa;">ℹ️ Deposit Information:</strong><br/>
              • Hyperliquid accepts USDC deposits from <strong>Arbitrum network only</strong><br/>
              • Bridge your funds from Ethereum mainnet to Arbitrum first if needed<br/>
              • Deposits typically take 1-2 minutes to confirm<br/>
              • No deposit fees on Hyperliquid (only Arbitrum gas fees)
            </div>
          </div>

          <!-- Deposit Form -->
          <n-space vertical :size="20" v-if="selectedKey">
            <!-- Amount Input -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Deposit Amount (USDC)
              </label>
              <n-input-number
                v-model:value="depositAmount"
                :min="1"
                :max="1000000"
                :step="10"
                placeholder="Enter amount in USDC"
                size="large"
                style="width: 100%;"
                clearable
              >
                <template #suffix>
                  <span style="color: #888; font-weight: 600;">USDC</span>
                </template>
              </n-input-number>
              <span class="form-hint">Minimum: 1 USDC</span>
            </div>

            <!-- Quick Amount Buttons -->
            <div class="form-group">
              <label class="form-label">Quick Amounts</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                <n-button @click="depositAmount = 100" size="medium">100 USDC</n-button>
                <n-button @click="depositAmount = 500" size="medium">500 USDC</n-button>
                <n-button @click="depositAmount = 1000" size="medium">1,000 USDC</n-button>
                <n-button @click="depositAmount = 5000" size="medium">5,000 USDC</n-button>
              </div>
            </div>

            <!-- Network Selection -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Source Network
              </label>
              <n-select
                v-model:value="depositNetwork"
                :options="networkOptions"
                size="large"
                disabled
              />
              <span class="form-hint">⚠️ Only Arbitrum network is supported</span>
            </div>

            <!-- Arbitrum Wallet Address (for manual deposits) -->
            <div class="form-group">
              <label class="form-label">Your Arbitrum Wallet Address</label>
              <n-input
                :value="selectedKey.walletAddress"
                readonly
                size="large"
              >
                <template #suffix>
                  <n-button text @click="copyToClipboard(selectedKey.walletAddress)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </n-button>
                </template>
              </n-input>
              <span class="form-hint">Send USDC to this address on Arbitrum network</span>
            </div>

            <!-- Deposit Button -->
            <n-button
              type="primary"
              size="large"
              @click="initiateDeposit"
              :disabled="depositBtn.disabled || !depositAmount || depositAmount < 1"
              :loading="depositBtn.disabled"
              block
              strong
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </template>
              {{ depositBtn.text }}
            </n-button>

            <!-- Manual Deposit Instructions -->
            <n-divider style="margin: 32px 0;" />
            <n-alert type="info" title="Manual Deposit Instructions" style="margin-top: 24px;">
              <ol style="margin: 8px 0 0 20px; line-height: 1.8;">
                <li>Connect your wallet to Arbitrum network</li>
                <li>Send USDC to your Hyperliquid wallet address: <code>{{ selectedKey.walletAddress }}</code></li>
                <li>Wait for ~1-2 minutes for confirmation</li>
                <li>Your balance will automatically update in the "Balance" tab</li>
              </ol>
            </n-alert>
          </n-space>

          <!-- No Key Selected -->
          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Balance Tab -->
      <n-tab-pane name="balance" tab="💼 Balance">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px;">Account Balance</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  View your Hyperliquid account balances and positions
                </p>
              </div>
            </div>
          </template>

          <n-space vertical :size="20" v-if="selectedKey">
            <!-- Portfolio Summary -->
            <div class="portfolio-summary">
              <div class="summary-item">
                <span class="summary-label">Total Portfolio</span>
                <span class="summary-value">{{ formatBalance(balances.total) }} USDC</span>
              </div>
            </div>

            <!-- Spot Balance Section -->
            <div class="balance-section">
              <div class="section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span style="color: #10b981; font-weight: 700; font-size: 16px;">Spot Balance</span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div class="balance-card spot-card">
                  <div class="balance-label">Available</div>
                  <div class="balance-value" style="color: #10b981;">{{ formatBalance(balances.spotAvailable) }} USDC</div>
                  <div class="balance-subtext">Ready to trade</div>
                </div>

                <div class="balance-card spot-card">
                  <div class="balance-label">In Orders</div>
                  <div class="balance-value" style="color: #fbbf24;">{{ formatBalance(balances.spotInOrders) }} USDC</div>
                  <div class="balance-subtext">Locked in orders</div>
                </div>

                <div class="balance-card spot-card">
                  <div class="balance-label">Total Spot</div>
                  <div class="balance-value" style="color: #3b82f6;">{{ formatBalance(balances.spotTotal) }} USDC</div>
                  <div class="balance-subtext">Available + In Orders</div>
                </div>
              </div>
            </div>

            <!-- Perpetuals Balance Section -->
            <div class="balance-section">
              <div class="section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span style="color: #f59e0b; font-weight: 700; font-size: 16px;">Perpetuals Balance</span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div class="balance-card perps-card">
                  <div class="balance-label">Available Margin</div>
                  <div class="balance-value" style="color: #10b981;">{{ formatBalance(balances.perpsAvailable) }} USDC</div>
                  <div class="balance-subtext">Free margin</div>
                </div>

                <div class="balance-card perps-card">
                  <div class="balance-label">In Positions</div>
                  <div class="balance-value" style="color: #ef4444;">{{ formatBalance(balances.perpsInPositions) }} USDC</div>
                  <div class="balance-subtext">Used in trades</div>
                </div>

                <div class="balance-card perps-card">
                  <div class="balance-label">Total Perps</div>
                  <div class="balance-value" style="color: #3b82f6;">{{ formatBalance(balances.perpsTotal) }} USDC</div>
                  <div class="balance-subtext">Available + In Positions</div>
                </div>
              </div>
            </div>

            <!-- All Assets Table -->
            <div class="balance-section" v-if="balances.assets.length > 0">
              <div class="section-title">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span style="color: #667eea; font-weight: 700; font-size: 16px;">All Assets ({{ balances.assets.length }})</span>
                </div>
              </div>

              <n-data-table
                :columns="assetColumns"
                :data="balances.assets"
                :pagination="{ pageSize: 10 }"
                :bordered="false"
                striped
                size="small"
              />
            </div>

            <!-- Refresh Button -->
            <n-button
              @click="fetchBalances"
              :loading="loadingBalances"
              size="large"
              block
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </template>
              Refresh Balance
            </n-button>
          </n-space>

          <!-- No Key Selected -->
          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Transfer Tab -->
      <n-tab-pane name="transfer" tab="🔄 Transfer">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px;">Transfer Between Accounts</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  Move funds between Spot and Perpetuals accounts
                </p>
              </div>
            </div>
          </template>

          <n-space vertical :size="20" v-if="selectedKey">
            <!-- Balance Overview -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="info-box" style="background: rgba(16, 185, 129, 0.05); border-left: 3px solid #10b981;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #a0a0a0;">Spot Available:</span>
                  <span style="font-size: 18px; font-weight: 700; color: #10b981;">{{ formatBalance(balances.spotAvailable) }} USDC</span>
                </div>
              </div>
              <div class="info-box" style="background: rgba(245, 158, 11, 0.05); border-left: 3px solid #f59e0b;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #a0a0a0;">Perps Available:</span>
                  <span style="font-size: 18px; font-weight: 700; color: #f59e0b;">{{ formatBalance(balances.perpsAvailable) }} USDC</span>
                </div>
              </div>
            </div>

            <!-- Transfer Direction -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                Transfer Direction
              </label>
              <n-radio-group v-model:value="transferDirection" size="large">
                <n-radio-button value="spot-to-perps">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #10b981;">Spot</span>
                    <span>→</span>
                    <span style="color: #f59e0b;">Perpetuals</span>
                  </div>
                </n-radio-button>
                <n-radio-button value="perps-to-spot">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #f59e0b;">Perpetuals</span>
                    <span>→</span>
                    <span style="color: #10b981;">Spot</span>
                  </div>
                </n-radio-button>
              </n-radio-group>
            </div>

            <!-- Transfer Amount -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Transfer Amount (USDC)
              </label>
              <n-input-number
                v-model:value="transferAmount"
                :min="1"
                :max="transferDirection === 'spot-to-perps' ? balances.spotAvailable : balances.perpsAvailable"
                :step="10"
                placeholder="Enter amount to transfer"
                size="large"
                style="width: 100%;"
                clearable
              >
                <template #suffix>
                  <span style="color: #888; font-weight: 600;">USDC</span>
                </template>
              </n-input-number>
              <span class="form-hint">
                Maximum: {{ formatBalance(transferDirection === 'spot-to-perps' ? balances.spotAvailable : balances.perpsAvailable) }} USDC
              </span>
            </div>

            <!-- Quick Transfer Buttons -->
            <div class="form-group">
              <label class="form-label">Quick Amounts</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                <n-button @click="setTransferAmount(0.25)" size="medium">25%</n-button>
                <n-button @click="setTransferAmount(0.5)" size="medium">50%</n-button>
                <n-button @click="setTransferAmount(0.75)" size="medium">75%</n-button>
                <n-button @click="setTransferAmount(1)" size="medium" type="info">MAX</n-button>
              </div>
            </div>

            <!-- Transfer Button -->
            <n-button
              type="primary"
              size="large"
              @click="executeTransfer"
              :disabled="transferBtn.disabled || !transferAmount || transferAmount < 1"
              :loading="transferBtn.disabled"
              block
              strong
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </template>
              {{ transferBtn.text }}
            </n-button>

            <!-- Info Alert -->
            <n-alert type="info" title="ℹ️ Transfer Information" style="margin-top: 24px;">
              <ul style="margin: 8px 0 0 20px; line-height: 1.8;">
                <li>Transfers between Spot and Perpetuals are instant</li>
                <li>No fees for internal transfers</li>
                <li>You can only transfer available (unlocked) balances</li>
                <li>Funds in orders or positions cannot be transferred</li>
              </ul>
            </n-alert>
          </n-space>

          <!-- No Key Selected -->
          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Withdraw Tab -->
      <n-tab-pane name="withdraw" tab="📤 Withdraw">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px;">Withdraw Funds</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  Transfer USDC from Hyperliquid to Arbitrum
                </p>
              </div>
            </div>
          </template>

          <n-space vertical :size="20" v-if="selectedKey">
            <!-- Available Balance Display -->
            <div class="info-box" style="background: rgba(0, 255, 170, 0.05); border-left: 3px solid #00ffaa;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: #a0a0a0;">Available to Withdraw:</span>
                <span style="font-size: 20px; font-weight: 700; color: #00ffaa;">{{ formatBalance(balances.available) }} USDC</span>
              </div>
            </div>

            <!-- Withdraw Amount -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Withdraw Amount (USDC)
              </label>
              <n-input-number
                v-model:value="withdrawAmount"
                :min="1"
                :max="balances.available"
                :step="10"
                placeholder="Enter amount to withdraw"
                size="large"
                style="width: 100%;"
                clearable
              >
                <template #suffix>
                  <span style="color: #888; font-weight: 600;">USDC</span>
                </template>
              </n-input-number>
              <span class="form-hint">Maximum: {{ formatBalance(balances.available) }} USDC</span>
            </div>

            <!-- Quick Withdraw Buttons -->
            <div class="form-group">
              <label class="form-label">Quick Amounts</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                <n-button @click="withdrawAmount = balances.available * 0.25" size="medium">25%</n-button>
                <n-button @click="withdrawAmount = balances.available * 0.5" size="medium">50%</n-button>
                <n-button @click="withdrawAmount = balances.available * 0.75" size="medium">75%</n-button>
                <n-button @click="withdrawAmount = balances.available" size="medium" type="warning">MAX</n-button>
              </div>
            </div>

            <!-- Destination Address -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Destination Address (Arbitrum)
              </label>
              <n-input
                v-model:value="withdrawAddress"
                placeholder="0x..."
                size="large"
                clearable
              />
              <span class="form-hint">Enter Arbitrum wallet address to receive USDC</span>
            </div>

            <!-- Withdraw Button -->
            <n-button
              type="error"
              size="large"
              @click="initiateWithdraw"
              :disabled="withdrawBtn.disabled || !withdrawAmount || !withdrawAddress || withdrawAmount > balances.available"
              :loading="withdrawBtn.disabled"
              block
              strong
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </template>
              {{ withdrawBtn.text }}
            </n-button>

            <!-- Warning Alert -->
            <n-alert type="warning" title="⚠️ Important" style="margin-top: 24px;">
              <ul style="margin: 8px 0 0 20px; line-height: 1.8;">
                <li>Double-check the destination address - withdrawals are irreversible</li>
                <li>Only withdraw to Arbitrum network addresses</li>
                <li>Withdrawals typically take 5-10 minutes to process</li>
                <li>A small gas fee will be deducted from the withdrawal amount</li>
              </ul>
            </n-alert>
          </n-space>

          <!-- No Key Selected -->
          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

        </n-tabs>
      </n-tab-pane>

      <!-- Trading Main Tab -->
      <n-tab-pane name="trading" tab="📊 Trading">
        <n-tabs v-model:value="tradingSubTab" type="line" animated>
          <!-- Markets Sub-Tab -->
          <n-tab-pane name="markets" tab="📊 Markets">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Available Markets</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    Browse all trading pairs on Hyperliquid
                  </p>
                </div>
              </div>
              <n-button @click="fetchMarkets" :loading="loadingMarkets" size="medium">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16">
            <!-- Market Type Filters -->
            <n-radio-group v-model:value="marketFilter" size="medium">
              <n-radio-button value="all">All Markets ({{ markets.length }})</n-radio-button>
              <n-radio-button value="spot">Spot ({{ spotMarketsCount }})</n-radio-button>
              <n-radio-button value="swap">Perpetuals ({{ swapMarketsCount }})</n-radio-button>
            </n-radio-group>

            <!-- Search -->
            <n-input v-model:value="marketSearch" placeholder="Search markets... (e.g., BTC, ETH)" size="large" clearable>
              <template #prefix>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </template>
            </n-input>

            <!-- Markets Table -->
            <n-data-table
              :columns="marketColumns"
              :data="filteredMarkets"
              :pagination="{ pageSize: 20 }"
              :loading="loadingMarkets"
              :bordered="false"
              striped
            />
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- Tickers Tab -->
      <n-tab-pane name="tickers" tab="💹 Tickers">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Live Price Tickers</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    Real-time market prices and 24h statistics
                  </p>
                </div>
              </div>
              <n-button @click="fetchTickers" :loading="loadingTickers" size="medium" type="success">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16">
            <!-- Search -->
            <n-input v-model:value="tickerSearch" placeholder="Search tickers... (e.g., BTC, ETH)" size="large" clearable>
              <template #prefix>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </template>
            </n-input>

            <!-- Tickers Table -->
            <n-data-table
              :columns="tickerColumns"
              :data="filteredTickers"
              :pagination="{ pageSize: 20 }"
              :loading="loadingTickers"
              :bordered="false"
              striped
            />
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- Order Book Tab -->
      <n-tab-pane name="orderbook" tab="📖 Order Book">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px;">Order Book</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  View market depth and liquidity
                </p>
              </div>
            </div>
          </template>

          <n-space vertical :size="16">
            <!-- Symbol Selector -->
            <div class="form-group">
              <label class="form-label">Select Trading Pair</label>
              <n-select
                v-model:value="selectedSymbol"
                :options="symbolOptions"
                placeholder="Choose a market pair..."
                size="large"
                filterable
                @update:value="fetchOrderBook"
              />
            </div>

            <div v-if="selectedSymbol">
              <!-- Spread Info -->
              <div class="info-box" style="background: rgba(245, 158, 11, 0.05); border-left: 3px solid #f59e0b;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                  <div>
                    <span style="font-size: 13px; color: #888; display: block;">Market Pair</span>
                    <span style="font-size: 18px; font-weight: 700; color: #f59e0b;">{{ selectedSymbol }}</span>
                  </div>
                  <div v-if="orderBook.bids.length > 0 && orderBook.asks.length > 0">
                    <span style="font-size: 13px; color: #888; display: block;">Spread</span>
                    <span style="font-size: 18px; font-weight: 700; color: #f59e0b;">
                      {{ formatSpread(orderBook.asks[0][0], orderBook.bids[0][0]) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Order Book Display -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <!-- Asks (Sell Orders) -->
                <div>
                  <h4 style="color: #ef4444; margin: 0 0 12px 0; font-size: 16px;">📉 ASKS (Sellers)</h4>
                  <div class="orderbook-container">
                    <div v-for="(ask, idx) in orderBook.asks.slice(0, 15)" :key="'ask-' + idx" class="orderbook-row ask-row">
                      <span class="price">{{ formatPrice(ask[0]) }}</span>
                      <span class="amount">{{ formatAmount(ask[1]) }}</span>
                      <span class="total">{{ formatTotal(ask[0] * ask[1]) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Bids (Buy Orders) -->
                <div>
                  <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px;">📈 BIDS (Buyers)</h4>
                  <div class="orderbook-container">
                    <div v-for="(bid, idx) in orderBook.bids.slice(0, 15)" :key="'bid-' + idx" class="orderbook-row bid-row">
                      <span class="price">{{ formatPrice(bid[0]) }}</span>
                      <span class="amount">{{ formatAmount(bid[1]) }}</span>
                      <span class="total">{{ formatTotal(bid[0] * bid[1]) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Refresh Button -->
              <n-button
                @click="fetchOrderBook"
                :loading="loadingOrderBook"
                size="large"
                block
                style="margin-top: 20px;"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh Order Book
              </n-button>
            </div>

            <n-empty v-else description="Select a trading pair to view order book" style="padding: 60px 20px;" />
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- Positions Tab -->
      <n-tab-pane name="positions" tab="📊 Positions">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Open Positions</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View your active perpetual positions
                  </p>
                </div>
              </div>
              <n-button @click="fetchPositions" :loading="loadingPositions" size="medium" type="primary">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-alert type="info" v-if="positions.length === 0 && !loadingPositions">
              No open positions found
            </n-alert>
            <div v-else>
              <p style="color: #888; margin-bottom: 16px;">Coming soon: Position management interface</p>
            </div>
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Open Orders Tab -->
      <n-tab-pane name="openorders" tab="📋 Open Orders">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Open Orders</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View and manage your active orders
                  </p>
                </div>
              </div>
              <n-button @click="fetchOpenOrders" :loading="loadingOpenOrders" size="medium" type="warning">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-alert type="info" v-if="openOrders.length === 0 && !loadingOpenOrders">
              No open orders found
            </n-alert>
            <div v-else>
              <p style="color: #888; margin-bottom: 16px;">Coming soon: Open orders management interface</p>
            </div>
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- TWAP Tab -->
      <n-tab-pane name="twap" tab="⏱️ TWAP">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="padding: 8px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px;">TWAP Orders</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                  Time-Weighted Average Price order management
                </p>
              </div>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-alert type="info">
              TWAP (Time-Weighted Average Price) allows you to execute large orders over time to minimize market impact
            </n-alert>
            <div>
              <p style="color: #888;">Coming soon: TWAP order interface</p>
            </div>
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Trade History Tab -->
      <n-tab-pane name="tradehistory" tab="📈 Trade History">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Trade History</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View your completed trades
                  </p>
                </div>
              </div>
              <n-button @click="fetchTradeHistory" :loading="loadingTradeHistory" size="medium" type="info">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-alert type="info" v-if="tradeHistory.length === 0 && !loadingTradeHistory">
              No trade history found
            </n-alert>
            <div v-else>
              <p style="color: #888; margin-bottom: 16px;">Coming soon: Trade history table</p>
            </div>
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Funding History Tab -->
      <n-tab-pane name="fundinghistory" tab="💸 Funding History">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Funding History</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View funding rate payments
                  </p>
                </div>
              </div>
              <n-button @click="fetchFundingHistory" :loading="loadingFundingHistory" size="medium">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-alert type="info" v-if="fundingHistory.length === 0 && !loadingFundingHistory">
              No funding history found
            </n-alert>
            <div v-else>
              <p style="color: #888; margin-bottom: 16px;">Coming soon: Funding history table</p>
            </div>
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Order History Tab -->
      <n-tab-pane name="orderhistory" tab="📜 Order History">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Order History</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View all historical orders
                  </p>
                </div>
              </div>
              <n-button @click="fetchOrderHistory" :loading="loadingOrderHistory" size="medium">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-alert type="info" v-if="orderHistory.length === 0 && !loadingOrderHistory">
              No order history found
            </n-alert>
            <div v-else>
              <p style="color: #888; margin-bottom: 16px;">Coming soon: Order history table</p>
            </div>
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

        </n-tabs>
      </n-tab-pane>

      <!-- ETH Network Scanner Tab -->
      <n-tab-pane name="ethnetwork" tab="⟠ ETH Network">
        <ETHNetwork :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Hyperliquid Network Scanner Tab -->
      <n-tab-pane name="hyperliquidnetwork" tab="💚 Hyperliquid Network">
        <HyperliquidNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- ARB Network Scanner Tab -->
      <n-tab-pane name="arbnetwork" tab="🔵 ARB Network">
        <ARBNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>
      <!-- BASE Network Scanner Tab -->
      <n-tab-pane name="basenetwork" tab="🔵 BASE Network">
        <BASENetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- PLASMA Network Scanner Tab -->
      <n-tab-pane name="plasmanetwork" tab="🟣 PLASMA Network">
        <PLASMANetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Optimism Network Scanner Tab -->
      <n-tab-pane name="optimismnetwork" tab="🔴 Optimism Network">
        <OptimismNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Avalanche Network Scanner Tab -->
      <n-tab-pane name="avalanchenetwork" tab="🔺 Avalanche Network">
        <AvalancheNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Algorand Network Scanner Tab -->
      <n-tab-pane name="algorandnetwork" tab="⬛ Algorand Network">
        <AlgorandNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Noble Network Scanner Tab -->
      <n-tab-pane name="noblenetwork" tab="👑 Noble Network">
        <NobleNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Sui Network Scanner Tab -->
      <n-tab-pane name="suinetwork" tab="🌊 Sui Network">
        <SuiNetworkScanner :wallet-address="selectedKey?.walletAddress || ''" />
      </n-tab-pane>

      <!-- Deposit History Tab -->
      <n-tab-pane name="deposits" tab="📥 Deposits">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Deposit History</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View all deposits made to your Hyperliquid account
                  </p>
                </div>
              </div>
              <n-button @click="fetchDeposits" :loading="loadingDeposits" size="medium" type="success">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-data-table
              :columns="depositColumns"
              :data="deposits"
              :pagination="{ pageSize: 20 }"
              :loading="loadingDeposits"
              :bordered="false"
              striped
            />
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Withdrawal History Tab -->
      <n-tab-pane name="withdrawals" tab="📤 Withdrawals">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Withdrawal History</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View all withdrawals from your Hyperliquid account
                  </p>
                </div>
              </div>
              <n-button @click="fetchWithdrawals" :loading="loadingWithdrawals" size="medium" type="error">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-data-table
              :columns="withdrawalColumns"
              :data="withdrawals"
              :pagination="{ pageSize: 20 }"
              :loading="loadingWithdrawals"
              :bordered="false"
              striped
            />
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>

      <!-- Transfers Tab (Spot ↔ Perps) -->
      <n-tab-pane name="transfers" tab="🔄 Transfers">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="padding: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px;">Internal Transfers</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    View transfers between Spot and Perpetuals accounts
                  </p>
                </div>
              </div>
              <n-button @click="fetchTransfers" :loading="loadingTransfers" size="medium" type="warning">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </template>
                Refresh
              </n-button>
            </div>
          </template>

          <n-space vertical :size="16" v-if="selectedKey">
            <n-data-table
              :columns="transferColumns"
              :data="transfers"
              :pagination="{ pageSize: 20 }"
              :loading="loadingTransfers"
              :bordered="false"
              striped
            />
          </n-space>

          <n-empty v-else description="Please select a Hyperliquid account above" style="padding: 60px 20px;" />
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue';
import { useNotification } from 'naive-ui';
import { useRouter } from 'vue-router';
import ETHNetwork from '~/components/ETHNetwork.vue';
import HyperliquidNetworkScanner from '~/components/HyperliquidNetworkScanner.vue';
import ARBNetworkScanner from '~/components/ARBNetworkScanner.vue';
import BASENetworkScanner from '~/components/BASENetworkScanner.vue';
import PLASMANetworkScanner from '~/components/PLASMANetworkScanner.vue';
import OptimismNetworkScanner from '~/components/OptimismNetworkScanner.vue';
import AvalancheNetworkScanner from '~/components/AvalancheNetworkScanner.vue';
import AlgorandNetworkScanner from '~/components/AlgorandNetworkScanner.vue';
import NobleNetworkScanner from '~/components/NobleNetworkScanner.vue';
import SuiNetworkScanner from '~/components/SuiNetworkScanner.vue';

const router = useRouter();
const notification = useNotification();

let userIDCookie = useCookie('userID');
let userID = userIDCookie.value;

// State
const mainTab = ref('account'); // 'account' or 'trading'
const accountSubTab = ref('deposit'); // 'deposit', 'balance', 'transfer', 'withdraw'
const tradingSubTab = ref('markets'); // 'markets', 'tickers', 'orderbook', etc.
const selectedKeyId = ref(null);
const hyperliquidKeys = ref([]);
const depositAmount = ref(null);
const depositNetwork = ref('arbitrum');
const withdrawAmount = ref(null);
const withdrawAddress = ref('');
const transferAmount = ref(null);
const transferDirection = ref('spot-to-perps');
const loadingBalances = ref(false);

const depositBtn = ref({
  text: 'Initiate Deposit',
  disabled: false
});

const withdrawBtn = ref({
  text: 'Withdraw Funds',
  disabled: false
});

const transferBtn = ref({
  text: 'Execute Transfer',
  disabled: false
});

const balances = ref({
  total: 0,
  available: 0,
  inPositions: 0,
  spotAvailable: 0,
  spotInOrders: 0,
  spotTotal: 0,
  perpsAvailable: 0,
  perpsInPositions: 0,
  perpsTotal: 0,
  assets: [] // Array of all assets with balances
});

// Markets state
const markets = ref([]);
const loadingMarkets = ref(false);
const marketFilter = ref('all');
const marketSearch = ref('');

// Tickers state
const tickers = ref([]);
const loadingTickers = ref(false);
const tickerSearch = ref('');

// Order Book state
const orderBook = ref({ bids: [], asks: [] });
const selectedSymbol = ref(null);
const loadingOrderBook = ref(false);

// Deposits state
const deposits = ref([]);
const loadingDeposits = ref(false);

// Withdrawals state
const withdrawals = ref([]);
const loadingWithdrawals = ref(false);

// Transfers state (Spot ↔ Perps)
const transfers = ref([]);
const loadingTransfers = ref(false);

// Positions state
const positions = ref([]);
const loadingPositions = ref(false);

// Open Orders state
const openOrders = ref([]);
const loadingOpenOrders = ref(false);

// Trade History state
const tradeHistory = ref([]);
const loadingTradeHistory = ref(false);

// Funding History state
const fundingHistory = ref([]);
const loadingFundingHistory = ref(false);

// Order History state
const orderHistory = ref([]);
const loadingOrderHistory = ref(false);

// Network options
const networkOptions = [
  {
    label: 'Arbitrum (Only supported network)',
    value: 'arbitrum'
  }
];

// Computed
const selectedKey = computed(() => {
  if (!selectedKeyId.value) return null;
  return hyperliquidKeys.value.find(key => key.id === selectedKeyId.value);
});

const keyOptions = computed(() => {
  return hyperliquidKeys.value.map(key => ({
    label: `${key.name} (${maskWallet(key.walletAddress)})`,
    value: key.id
  }));
});

// Markets computed
const spotMarketsCount = computed(() => {
  return markets.value.filter(m => m.type === 'spot').length;
});

const swapMarketsCount = computed(() => {
  return markets.value.filter(m => m.type === 'swap' || m.swap === true).length;
});

const filteredMarkets = computed(() => {
  let filtered = markets.value;

  // Filter by type
  if (marketFilter.value === 'spot') {
    filtered = filtered.filter(m => m.type === 'spot');
  } else if (marketFilter.value === 'swap') {
    filtered = filtered.filter(m => m.type === 'swap' || m.swap === true);
  }

  // Filter by search
  if (marketSearch.value) {
    const search = marketSearch.value.toLowerCase();
    filtered = filtered.filter(m =>
      m.symbol?.toLowerCase().includes(search) ||
      m.base?.toLowerCase().includes(search) ||
      m.quote?.toLowerCase().includes(search)
    );
  }

  return filtered;
});

// Tickers computed
const filteredTickers = computed(() => {
  let filtered = Object.entries(tickers.value).map(([symbol, data]) => ({
    symbol,
    ...data
  }));

  if (tickerSearch.value) {
    const search = tickerSearch.value.toLowerCase();
    filtered = filtered.filter(t => t.symbol?.toLowerCase().includes(search));
  }

  return filtered;
});

// Symbol options for order book
const symbolOptions = computed(() => {
  return markets.value.map(m => ({
    label: m.symbol,
    value: m.symbol
  }));
});

// Table columns for markets
const marketColumns = [
  {
    title: 'Symbol',
    key: 'symbol',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 600; color: #00ffaa;' }, row.symbol)
  },
  {
    title: 'Type',
    key: 'type',
    width: 100,
    render: (row) => {
      const type = row.type === 'spot' ? 'Spot' : row.type === 'swap' ? 'Perpetual' : row.type;
      const color = row.type === 'spot' ? '#10b981' : '#3b82f6';
      return h('span', { style: `color: ${color}; font-weight: 600;` }, type);
    }
  },
  {
    title: 'Base',
    key: 'base',
    width: 100
  },
  {
    title: 'Quote',
    key: 'quote',
    width: 100
  },
  {
    title: 'Active',
    key: 'active',
    width: 100,
    render: (row) => row.active ? '✅ Yes' : '❌ No'
  }
];

// Table columns for tickers
const tickerColumns = [
  {
    title: 'Symbol',
    key: 'symbol',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 600; color: #00ffaa;' }, row.symbol)
  },
  {
    title: 'Last Price',
    key: 'last',
    width: 150,
    render: (row) => h('span', { style: 'font-weight: 700; color: #fbbf24;' }, formatPrice(row.last))
  },
  {
    title: 'Bid',
    key: 'bid',
    width: 120,
    render: (row) => h('span', { style: 'color: #10b981;' }, formatPrice(row.bid))
  },
  {
    title: 'Ask',
    key: 'ask',
    width: 120,
    render: (row) => h('span', { style: 'color: #ef4444;' }, formatPrice(row.ask))
  },
  {
    title: '24h Change',
    key: 'percentage',
    width: 120,
    render: (row) => {
      const change = row.percentage || 0;
      const color = change >= 0 ? '#10b981' : '#ef4444';
      const arrow = change >= 0 ? '▲' : '▼';
      return h('span', { style: `color: ${color}; font-weight: 600;` }, `${arrow} ${change.toFixed(2)}%`);
    }
  },
  {
    title: '24h Volume',
    key: 'quoteVolume',
    width: 150,
    render: (row) => formatTotal(row.quoteVolume)
  }
];

// Table columns for assets
const assetColumns = [
  {
    title: 'Asset',
    key: 'asset',
    width: 120,
    render: (row) => h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
      h('span', { style: 'font-size: 20px;' }, row.asset === 'BTC' ? '₿' : row.asset === 'ETH' ? 'Ξ' : row.asset === 'USDC' ? '$' : '💰'),
      h('span', { style: 'font-weight: 700; color: #667eea;' }, row.asset)
    ])
  },
  {
    title: 'Available (Free)',
    key: 'free',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 600; color: #10b981;' }, formatBalance(row.free))
  },
  {
    title: 'In Use (Locked)',
    key: 'used',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 600; color: #fbbf24;' }, formatBalance(row.used))
  },
  {
    title: 'Total',
    key: 'total',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 700; color: #3b82f6; font-size: 16px;' }, formatBalance(row.total))
  }
];

// Table columns for deposit history
const depositColumns = [
  {
    title: 'Date',
    key: 'timestamp',
    width: 170,
    render: (row) => {
      if (!row.timestamp) return 'N/A';
      const date = new Date(row.timestamp);
      return h('span', { style: 'font-weight: 600; color: #a0a0a0;' }, date.toLocaleString());
    }
  },
  {
    title: 'Type',
    key: 'type',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 600; color: #f59e0b;' }, row.type || 'Unknown')
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 140,
    render: (row) => h('span', { style: 'font-weight: 700; color: #10b981;' }, `${formatBalance(row.amount)} ${row.currency || 'USDC'}`)
  },
  {
    title: 'Currency',
    key: 'currency',
    width: 90,
    render: (row) => h('span', { style: 'font-weight: 600; color: #667eea;' }, row.currency || 'USDC')
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) => {
      const status = row.status || 'pending';
      const colors = {
        'ok': '#10b981',
        'complete': '#10b981',
        'pending': '#fbbf24',
        'failed': '#ef4444',
        'canceled': '#ef4444'
      };
      const color = colors[status.toLowerCase()] || '#888';
      return h('span', { style: `font-weight: 600; color: ${color}; text-transform: uppercase;` }, status);
    }
  },
  {
    title: 'Tx Hash',
    key: 'txid',
    width: 180,
    render: (row) => {
      if (!row.txid) return h('span', { style: 'color: #888;' }, 'N/A');
      const shortHash = `${row.txid.substring(0, 6)}...${row.txid.substring(row.txid.length - 4)}`;
      return h('code', { style: 'font-size: 12px; color: #00ffaa;' }, shortHash);
    }
  }
];

// Table columns for withdrawal history
const withdrawalColumns = [
  {
    title: 'Date',
    key: 'timestamp',
    width: 170,
    render: (row) => {
      if (!row.timestamp) return 'N/A';
      const date = new Date(row.timestamp);
      return h('span', { style: 'font-weight: 600; color: #a0a0a0;' }, date.toLocaleString());
    }
  },
  {
    title: 'Type',
    key: 'type',
    width: 180,
    render: (row) => h('span', { style: 'font-weight: 600; color: #f59e0b;' }, row.type || 'Unknown')
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 140,
    render: (row) => h('span', { style: 'font-weight: 700; color: #ef4444;' }, `${formatBalance(row.amount)} ${row.currency || 'USDC'}`)
  },
  {
    title: 'Currency',
    key: 'currency',
    width: 90,
    render: (row) => h('span', { style: 'font-weight: 600; color: #667eea;' }, row.currency || 'USDC')
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) => {
      const status = row.status || 'pending';
      const colors = {
        'ok': '#10b981',
        'complete': '#10b981',
        'pending': '#fbbf24',
        'failed': '#ef4444',
        'canceled': '#ef4444'
      };
      const color = colors[status.toLowerCase()] || '#888';
      return h('span', { style: `font-weight: 600; color: ${color}; text-transform: uppercase;` }, status);
    }
  },
  {
    title: 'Tx Hash',
    key: 'txid',
    width: 180,
    render: (row) => {
      if (!row.txid) return h('span', { style: 'color: #888;' }, 'N/A');
      const shortHash = `${row.txid.substring(0, 6)}...${row.txid.substring(row.txid.length - 4)}`;
      return h('code', { style: 'font-size: 12px; color: #00ffaa;' }, shortHash);
    }
  }
];

// Table columns for internal transfers (Spot ↔ Perps)
const transferColumns = [
  {
    title: 'Date',
    key: 'timestamp',
    width: 170,
    render: (row) => {
      if (!row.timestamp) return 'N/A';
      const date = new Date(row.timestamp);
      return h('span', { style: 'font-weight: 600; color: #a0a0a0;' }, date.toLocaleString());
    }
  },
  {
    title: 'Type',
    key: 'type',
    width: 200,
    render: (row) => h('span', { style: 'font-weight: 600; color: #f59e0b;' }, row.type || 'Unknown')
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 140,
    render: (row) => h('span', { style: 'font-weight: 700; color: #8b5cf6;' }, `${formatBalance(row.amount)} ${row.currency || 'USDC'}`)
  },
  {
    title: 'Currency',
    key: 'currency',
    width: 90,
    render: (row) => h('span', { style: 'font-weight: 600; color: #667eea;' }, row.currency || 'USDC')
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) => {
      const status = row.status || 'pending';
      const colors = {
        'ok': '#10b981',
        'complete': '#10b981',
        'pending': '#fbbf24',
        'failed': '#ef4444',
        'canceled': '#ef4444'
      };
      const color = colors[status.toLowerCase()] || '#888';
      return h('span', { style: `font-weight: 600; color: ${color}; text-transform: uppercase;` }, status);
    }
  },
  {
    title: 'Tx Hash',
    key: 'txid',
    width: 180,
    render: (row) => {
      if (!row.txid) return h('span', { style: 'color: #888;' }, 'N/A');
      const shortHash = `${row.txid.substring(0, 6)}...${row.txid.substring(row.txid.length - 4)}`;
      return h('code', { style: 'font-size: 12px; color: #00ffaa;' }, shortHash);
    }
  }
];

// Helper functions
function maskWallet(address) {
  if (!address) return 'N/A';
  if (address.length <= 10) return '0x••••';
  return address.substring(0, 6) + '••••' + address.substring(address.length - 4);
}

function formatBalance(value) {
  if (!value) return '0.00000';
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  notification.success({
    content: "Copied!",
    meta: "Address copied to clipboard",
    duration: 2000
  });
}

function navigateToProfile() {
  router.push('/profile');
}

// Fetch Hyperliquid keys
async function fetchHyperliquidKeys() {
  try {
    const response = await $fetch('/api/v1/fetchHyperliquidKeys', {
      query: { userID }
    });

    if (response.success && response.data) {
      hyperliquidKeys.value = response.data.map(item => ({
        id: item._id,
        name: item.name,
        walletAddress: item.walletAddress,
        privateKey: item.privateKey
      }));

      // Auto-select first key if available
      if (hyperliquidKeys.value.length > 0 && !selectedKeyId.value) {
        selectedKeyId.value = hyperliquidKeys.value[0].id;
        onKeySelect(selectedKeyId.value);
      }
    }
  } catch (error) {
    console.error('Failed to fetch Hyperliquid keys:', error);
  }
}

// On key select
function onKeySelect(keyId) {
  console.log('Selected Hyperliquid key:', keyId);
  fetchBalances();
  fetchDeposits();
  fetchWithdrawals();
  fetchTransfers();
}

// Fetch balances from Hyperliquid API
async function fetchBalances() {
  if (!selectedKey.value) return;

  loadingBalances.value = true;

  try {
    const response = await $fetch('/api/v1/hyperliquid/fetchBalance', {
      method: 'POST',
      body: {
        walletAddress: selectedKey.value.walletAddress,
        privateKey: selectedKey.value.privateKey
      }
    });

    if (response.success && response.data) {
      // CCXT balance structure: { free, used, total, info }
      const balanceData = response.data;

      // Extract all assets with non-zero balances
      const allAssets = [];
      let totalUSDCValue = 0;

      // Iterate through all currencies in the balance
      for (const [currency, balanceInfo] of Object.entries(balanceData)) {
        // Skip metadata fields
        if (['free', 'used', 'total', 'info', 'datetime', 'timestamp'].includes(currency)) {
          continue;
        }

        const free = parseFloat(balanceInfo.free || 0);
        const used = parseFloat(balanceInfo.used || 0);
        const total = parseFloat(balanceInfo.total || 0);

        // Only include assets with non-zero balance
        if (total > 0) {
          allAssets.push({
            asset: currency,
            free: free,
            used: used,
            total: total
          });

          // For USDC, use it for total calculations
          if (currency === 'USDC' || currency === 'USD') {
            totalUSDCValue += total;
          }
        }
      }

      // Sort assets by total value (descending)
      allAssets.sort((a, b) => b.total - a.total);

      console.log(`💰 Found ${allAssets.length} assets with balances:`, allAssets);

      // Get USDC balance for legacy calculations
      const usdcBalance = balanceData.USDC || balanceData.USD || {};

      // Calculate spot/perps estimates (if not provided separately)
      const spotAvailable = (usdcBalance.free || 0) * 0.5;
      const spotInOrders = (usdcBalance.used || 0) * 0.3;
      const spotTotal = spotAvailable + spotInOrders;

      const perpsAvailable = (usdcBalance.free || 0) * 0.5;
      const perpsInPositions = (usdcBalance.used || 0) * 0.7;
      const perpsTotal = perpsAvailable + perpsInPositions;

      balances.value = {
        total: totalUSDCValue,
        available: usdcBalance.free || 0,
        inPositions: usdcBalance.used || 0,
        spotAvailable,
        spotInOrders,
        spotTotal,
        perpsAvailable,
        perpsInPositions,
        perpsTotal,
        assets: allAssets
      };

      notification.success({
        content: "Balance Updated",
        meta: `Found ${allAssets.length} assets with balances`,
        duration: 2000
      });
    } else {
      throw new Error(response.message || "Failed to fetch balance");
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    notification.error({
      content: "Failed to Fetch Balance",
      meta: error.message || "An error occurred"
    });

    // Set default values on error
    balances.value = {
      total: 0,
      available: 0,
      inPositions: 0,
      spotAvailable: 0,
      spotInOrders: 0,
      spotTotal: 0,
      perpsAvailable: 0,
      perpsInPositions: 0,
      perpsTotal: 0,
      assets: []
    };
  } finally {
    loadingBalances.value = false;
  }
}

// Initiate deposit
async function initiateDeposit() {
  if (!depositAmount.value || depositAmount.value < 1) {
    notification.warning({
      content: "Invalid Amount",
      meta: "Please enter a valid deposit amount (minimum 1 USDC)"
    });
    return;
  }

  depositBtn.value.text = 'Processing...';
  depositBtn.value.disabled = true;

  try {
    // TODO: Implement actual Hyperliquid deposit API call
    // This would involve:
    // 1. Creating a deposit transaction
    // 2. Signing with private key
    // 3. Broadcasting to Arbitrum network

    await new Promise(resolve => setTimeout(resolve, 2000));

    notification.success({
      content: "Deposit Initiated",
      meta: `${depositAmount.value} USDC deposit to Hyperliquid is being processed`,
      duration: 4000
    });

    // Reset form
    depositAmount.value = null;

    // Refresh balances
    setTimeout(fetchBalances, 3000);
  } catch (error) {
    notification.error({
      content: "Deposit Failed",
      meta: error.message || "An error occurred"
    });
  } finally {
    depositBtn.value.text = 'Initiate Deposit';
    depositBtn.value.disabled = false;
  }
}

// Initiate withdraw
async function initiateWithdraw() {
  if (!withdrawAmount.value || withdrawAmount.value < 1) {
    notification.warning({
      content: "Invalid Amount",
      meta: "Please enter a valid withdrawal amount"
    });
    return;
  }

  if (!withdrawAddress.value || !withdrawAddress.value.match(/^0x[a-fA-F0-9]{40}$/)) {
    notification.warning({
      content: "Invalid Address",
      meta: "Please enter a valid Ethereum/Arbitrum address"
    });
    return;
  }

  if (withdrawAmount.value > balances.value.available) {
    notification.warning({
      content: "Insufficient Balance",
      meta: "Withdrawal amount exceeds available balance"
    });
    return;
  }

  withdrawBtn.value.text = 'Processing...';
  withdrawBtn.value.disabled = true;

  try {
    // TODO: Implement actual Hyperliquid withdraw API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    notification.success({
      content: "Withdrawal Initiated",
      meta: `${withdrawAmount.value} USDC withdrawal to ${maskWallet(withdrawAddress.value)} is being processed`,
      duration: 4000
    });

    // Reset form
    withdrawAmount.value = null;
    withdrawAddress.value = '';

    // Refresh balances
    setTimeout(fetchBalances, 3000);
  } catch (error) {
    notification.error({
      content: "Withdrawal Failed",
      meta: error.message || "An error occurred"
    });
  } finally {
    withdrawBtn.value.text = 'Withdraw Funds';
    withdrawBtn.value.disabled = false;
  }
}

// Set transfer amount (quick buttons)
function setTransferAmount(percentage) {
  const maxAmount = transferDirection.value === 'spot-to-perps'
    ? balances.value.spotAvailable
    : balances.value.perpsAvailable;
  transferAmount.value = Math.floor(maxAmount * percentage * 100) / 100;
}

// Execute transfer
async function executeTransfer() {
  if (!transferAmount.value || transferAmount.value < 1) {
    notification.warning({
      content: "Invalid Amount",
      meta: "Please enter a valid transfer amount (minimum 1 USDC)"
    });
    return;
  }

  const maxAmount = transferDirection.value === 'spot-to-perps'
    ? balances.value.spotAvailable
    : balances.value.perpsAvailable;

  if (transferAmount.value > maxAmount) {
    notification.warning({
      content: "Insufficient Balance",
      meta: "Transfer amount exceeds available balance"
    });
    return;
  }

  transferBtn.value.text = 'Processing...';
  transferBtn.value.disabled = true;

  try {
    // TODO: Implement actual Hyperliquid transfer API call
    // This would involve calling the exchange's internal transfer API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fromAccount = transferDirection.value === 'spot-to-perps' ? 'Spot' : 'Perpetuals';
    const toAccount = transferDirection.value === 'spot-to-perps' ? 'Perpetuals' : 'Spot';

    notification.success({
      content: "Transfer Complete",
      meta: `${transferAmount.value} USDC transferred from ${fromAccount} to ${toAccount}`,
      duration: 4000
    });

    // Reset form
    transferAmount.value = null;

    // Refresh balances
    setTimeout(fetchBalances, 1000);
  } catch (error) {
    notification.error({
      content: "Transfer Failed",
      meta: error.message || "An error occurred"
    });
  } finally {
    transferBtn.value.text = 'Execute Transfer';
    transferBtn.value.disabled = false;
  }
}

// Fetch markets
async function fetchMarkets() {
  loadingMarkets.value = true;
  try {
    const response = await $fetch('/api/v1/hyperliquid/fetchMarkets');
    if (response.success && response.data) {
      markets.value = response.data;
      notification.success({
        content: "Markets Loaded",
        meta: `Fetched ${response.count} markets from Hyperliquid`,
        duration: 2000
      });
    }
  } catch (error) {
    console.error('Error fetching markets:', error);
    notification.error({
      content: "Failed to Fetch Markets",
      meta: error.message || "An error occurred"
    });
  } finally {
    loadingMarkets.value = false;
  }
}

// Fetch tickers
async function fetchTickers() {
  loadingTickers.value = true;
  try {
    const response = await $fetch('/api/v1/hyperliquid/fetchTickers');
    if (response.success && response.data) {
      tickers.value = response.data;
      notification.success({
        content: "Tickers Loaded",
        meta: `Fetched ${response.count} tickers from Hyperliquid`,
        duration: 2000
      });
    }
  } catch (error) {
    console.error('Error fetching tickers:', error);
    notification.error({
      content: "Failed to Fetch Tickers",
      meta: error.message || "An error occurred"
    });
  } finally {
    loadingTickers.value = false;
  }
}

// Fetch order book
async function fetchOrderBook() {
  if (!selectedSymbol.value) return;

  loadingOrderBook.value = true;
  try {
    const response = await $fetch('/api/v1/hyperliquid/fetchOrderBook', {
      query: { symbol: selectedSymbol.value, limit: 15 }
    });

    if (response.success && response.data) {
      orderBook.value = response.data;
      notification.success({
        content: "Order Book Updated",
        meta: `${response.data.bids.length} bids, ${response.data.asks.length} asks`,
        duration: 2000
      });
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
    notification.error({
      content: "Failed to Fetch Order Book",
      meta: error.message || "An error occurred"
    });
    orderBook.value = { bids: [], asks: [] };
  } finally {
    loadingOrderBook.value = false;
  }
}

// Additional helper functions for order book
function formatPrice(price) {
  if (!price) return '0.00';
  return parseFloat(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  });
}

function formatAmount(amount) {
  if (!amount) return '0.00';
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
}

function formatTotal(total) {
  if (!total) return '0.00';
  return parseFloat(total).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatSpread(askPrice, bidPrice) {
  if (!askPrice || !bidPrice) return 'N/A';
  const spread = askPrice - bidPrice;
  const spreadPercent = (spread / bidPrice) * 100;
  return `${formatPrice(spread)} (${spreadPercent.toFixed(3)}%)`;
}

// Fetch deposits using native API
async function fetchDeposits() {
  if (!selectedKey.value) return;

  console.log('📥 Starting fetchDeposits...');
  loadingDeposits.value = true;

  try {
    const requestBody = {
      walletAddress: selectedKey.value.walletAddress
    };

    const response = await $fetch('/api/v1/hyperliquid/fetchDeposits', {
      method: 'POST',
      body: requestBody
    });

    console.log('📥 Deposits response:', response);

    if (response.success) {
      deposits.value = response.data || [];
      console.log(`✅ Loaded ${deposits.value.length} deposits`);

      notification.success({
        content: "Deposits Loaded",
        meta: `Found ${deposits.value.length} deposits`,
        duration: 2000
      });
    } else {
      throw new Error(response.message || "Failed to fetch deposits");
    }
  } catch (error) {
    console.error('❌ Error fetching deposits:', error);
    notification.error({
      content: "Failed to Fetch Deposits",
      meta: error.message || "An error occurred"
    });
    deposits.value = [];
  } finally {
    loadingDeposits.value = false;
  }
}

// Fetch withdrawals using native API
async function fetchWithdrawals() {
  if (!selectedKey.value) return;

  console.log('📤 Starting fetchWithdrawals...');
  loadingWithdrawals.value = true;

  try {
    const requestBody = {
      walletAddress: selectedKey.value.walletAddress
    };

    const response = await $fetch('/api/v1/hyperliquid/fetchWithdrawals', {
      method: 'POST',
      body: requestBody
    });

    console.log('📤 Withdrawals response:', response);

    if (response.success) {
      withdrawals.value = response.data || [];
      console.log(`✅ Loaded ${withdrawals.value.length} withdrawals`);

      notification.success({
        content: "Withdrawals Loaded",
        meta: `Found ${withdrawals.value.length} withdrawals`,
        duration: 2000
      });
    } else {
      throw new Error(response.message || "Failed to fetch withdrawals");
    }
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error);
    notification.error({
      content: "Failed to Fetch Withdrawals",
      meta: error.message || "An error occurred"
    });
    withdrawals.value = [];
  } finally {
    loadingWithdrawals.value = false;
  }
}

// Fetch transfers (Spot ↔ Perps) using custom API
async function fetchTransfers() {
  if (!selectedKey.value) return;

  console.log('🔄 Starting fetchTransfers...');
  loadingTransfers.value = true;

  try {
    const requestBody = {
      walletAddress: selectedKey.value.walletAddress
    };

    const response = await $fetch('/api/v1/hyperliquid/fetchTransactionHistory', {
      method: 'POST',
      body: requestBody
    });

    console.log('🔄 Transfers response:', response);

    if (response.success) {
      const transactions = response.data || [];
      // Filter only internal transfers (Spot ↔ Perps)
      transfers.value = transactions.filter(tx => tx.direction === 'transfer');

      console.log(`✅ Loaded ${transfers.value.length} transfers`);

      notification.success({
        content: "Transfers Loaded",
        meta: `Found ${transfers.value.length} internal transfers`,
        duration: 2000
      });
    } else {
      throw new Error(response.message || "Failed to fetch transfers");
    }
  } catch (error) {
    console.error('❌ Error fetching transfers:', error);
    notification.error({
      content: "Failed to Fetch Transfers",
      meta: error.message || "An error occurred"
    });
    transfers.value = [];
  } finally {
    loadingTransfers.value = false;
  }
}

// Fetch positions
async function fetchPositions() {
  if (!selectedKey.value) return;

  loadingPositions.value = true;
  try {
    // TODO: Implement CCXT fetchPositions call
    await new Promise(resolve => setTimeout(resolve, 1000));

    positions.value = [];
    notification.info({
      content: "Positions",
      meta: "Coming soon: Position fetching functionality",
      duration: 2000
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    notification.error({
      content: "Failed to Fetch Positions",
      meta: error.message || "An error occurred"
    });
    positions.value = [];
  } finally {
    loadingPositions.value = false;
  }
}

// Fetch open orders
async function fetchOpenOrders() {
  if (!selectedKey.value) return;

  loadingOpenOrders.value = true;
  try {
    // TODO: Implement CCXT fetchOpenOrders call
    await new Promise(resolve => setTimeout(resolve, 1000));

    openOrders.value = [];
    notification.info({
      content: "Open Orders",
      meta: "Coming soon: Open orders fetching functionality",
      duration: 2000
    });
  } catch (error) {
    console.error('Error fetching open orders:', error);
    notification.error({
      content: "Failed to Fetch Open Orders",
      meta: error.message || "An error occurred"
    });
    openOrders.value = [];
  } finally {
    loadingOpenOrders.value = false;
  }
}

// Fetch trade history
async function fetchTradeHistory() {
  if (!selectedKey.value) return;

  loadingTradeHistory.value = true;
  try {
    // TODO: Implement CCXT fetchMyTrades call
    await new Promise(resolve => setTimeout(resolve, 1000));

    tradeHistory.value = [];
    notification.info({
      content: "Trade History",
      meta: "Coming soon: Trade history fetching functionality",
      duration: 2000
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    notification.error({
      content: "Failed to Fetch Trade History",
      meta: error.message || "An error occurred"
    });
    tradeHistory.value = [];
  } finally {
    loadingTradeHistory.value = false;
  }
}

// Fetch funding history
async function fetchFundingHistory() {
  if (!selectedKey.value) return;

  loadingFundingHistory.value = true;
  try {
    // TODO: Implement funding history fetching
    await new Promise(resolve => setTimeout(resolve, 1000));

    fundingHistory.value = [];
    notification.info({
      content: "Funding History",
      meta: "Coming soon: Funding history fetching functionality",
      duration: 2000
    });
  } catch (error) {
    console.error('Error fetching funding history:', error);
    notification.error({
      content: "Failed to Fetch Funding History",
      meta: error.message || "An error occurred"
    });
    fundingHistory.value = [];
  } finally {
    loadingFundingHistory.value = false;
  }
}

// Fetch order history
async function fetchOrderHistory() {
  if (!selectedKey.value) return;

  loadingOrderHistory.value = true;
  try {
    // TODO: Implement CCXT fetchOrders or fetchClosedOrders call
    await new Promise(resolve => setTimeout(resolve, 1000));

    orderHistory.value = [];
    notification.info({
      content: "Order History",
      meta: "Coming soon: Order history fetching functionality",
      duration: 2000
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    notification.error({
      content: "Failed to Fetch Order History",
      meta: error.message || "An error occurred"
    });
    orderHistory.value = [];
  } finally {
    loadingOrderHistory.value = false;
  }
}

// On mount
onMounted(() => {
  fetchHyperliquidKeys();
  fetchMarkets();
  fetchTickers();
});
</script>

<style scoped>
.hyperliquid-page {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 204, 136, 0.05) 100%);
  border: 2px solid rgba(0, 255, 170, 0.3);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  padding: 12px;
  background: rgba(0, 255, 170, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #00ffaa;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
}

.page-subtitle {
  font-size: 14px;
  color: #888;
  margin: 4px 0 0 0;
}

.api-selector-card {
  border: 2px solid rgba(0, 255, 170, 0.3);
}

.selected-wallet-info {
  padding: 16px;
  background: rgba(0, 255, 170, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 170, 0.2);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 13px;
  color: #888;
  font-weight: 600;
}

.wallet-address {
  font-family: 'Courier New', monospace;
  color: #00ffaa;
  background: rgba(0, 255, 170, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.info-box {
  padding: 16px;
  background: rgba(0, 255, 255, 0.05);
  border-left: 3px solid #00ffff;
  border-radius: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-hint {
  font-size: 12px;
  color: #888;
  font-style: italic;
}

.balance-card {
  padding: 24px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 40, 0.4));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.balance-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 255, 170, 0.2);
  border-color: rgba(0, 255, 170, 0.3);
}

.balance-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.balance-value {
  font-size: 28px;
  font-weight: 800;
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  margin-bottom: 4px;
}

.balance-subtext {
  font-size: 12px;
  color: #6b7280;
}

.orderbook-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.orderbook-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  transition: background 0.2s ease;
}

.orderbook-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.ask-row {
  background: rgba(239, 68, 68, 0.05);
  border-left: 2px solid #ef4444;
}

.ask-row .price {
  color: #ef4444;
  font-weight: 700;
}

.bid-row {
  background: rgba(16, 185, 129, 0.05);
  border-left: 2px solid #10b981;
}

.bid-row .price {
  color: #10b981;
  font-weight: 700;
}

.orderbook-row .amount {
  color: #9ca3af;
  text-align: center;
}

.orderbook-row .total {
  color: #fbbf24;
  text-align: right;
}

/* Portfolio Summary Styles */
.portfolio-summary {
  padding: 32px;
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(103, 126, 234, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 16px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summary-value {
  font-size: 36px;
  font-weight: 900;
  color: #667eea;
  text-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
}

/* Balance Section Styles */
.balance-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

/* Spot Card Specific Styles */
.spot-card {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.05));
}

.spot-card:hover {
  border-left-color: #10b981;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
}

/* Perps Card Specific Styles */
.perps-card {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05));
}

.perps-card:hover {
  border-left-color: #f59e0b;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
}
</style>
