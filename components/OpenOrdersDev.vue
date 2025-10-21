<template>

    <!-- All controls now in NAVBAR - TickerBar + ApiSelector -->
    <div class="container">

    <!-- TWO COLUMN LAYOUT FOR BALANCES & HISTORY -->
    <div style="display: grid; grid-template-columns: 1fr 420px; gap: 10px; margin-bottom: 12px;">

      <!-- LEFT HEADER -->
      <div style="text-align: center; padding: 6px; background: #1a1a1a; border-radius: 6px; border: 1px solid #f39c12;">
        <n-text strong style="color: #f39c12; font-size: 11px;">BALANCE & GRID CALCULATOR</n-text>
      </div>

      <!-- RIGHT HEADER -->
      <div style="text-align: center; padding: 6px; background: #1a1a1a; border-radius: 6px; border: 1px solid #f5a623;">
        <n-text strong style="color: #f5a623; font-size: 11px;">ANALYST + INFO + DETECTOR</n-text>
      </div>

      <!-- LEFT: Current Balances Per API Key -->
      <n-card style="background: #0f0f0f;">
        <n-text strong style="color: #10eb04; font-size: 12px;">Balances Per API Key ({{selectedApiKeys.length}} Keys)</n-text>
        <table class="balance-table" style="width: 100%; margin-top: 12px;">
          <thead>
            <tr style="background-color: #1a1a1a;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #444; font-size: 9px;">API Key</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #444; font-size: 9px;">Free {{ base }}</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #444; font-size: 9px;">Used {{ base }}</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #444; font-size: 9px;">Free {{ quote }}</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #444; font-size: 9px;">Used {{ quote }}</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #444; font-size: 9px;">Value USD</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apiKey in selectedApiKeys" :key="apiKey">
              <td style="padding: 6px 8px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span :style="`display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${apiKeyColors[apiKey]};`"></span>
                  <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500; font-size: 10px;`">{{ apiKey }}</span>
                </div>
              </td>
              <td style="padding: 6px 8px; text-align: right; color: #e2c102; font-size: 10px;">
                {{ apiKeyBalances[apiKey] ? formatNumber(apiKeyBalances[apiKey].baseFree.toFixed(2)) : '-' }}
              </td>
              <td style="padding: 6px 8px; text-align: right; color: #e2735f; font-size: 10px;">
                {{ apiKeyBalances[apiKey] ? formatNumber(apiKeyBalances[apiKey].baseUsed.toFixed(2)) : '-' }}
              </td>
              <td style="padding: 6px 8px; text-align: right; color: #13e6f5; font-size: 10px;">
                {{ apiKeyBalances[apiKey] ? formatNumber(apiKeyBalances[apiKey].quoteFree.toFixed(2)) : '-' }}
              </td>
              <td style="padding: 6px 8px; text-align: right; color: #e2735f; font-size: 10px;">
                {{ apiKeyBalances[apiKey] ? formatNumber(apiKeyBalances[apiKey].quoteUsed.toFixed(2)) : '-' }}
              </td>
              <td style="padding: 6px 8px; text-align: right; color: #f39c12; font-weight: 700; font-size: 10px;">
                {{ apiKeyBalances[apiKey] ? formatNumber(calculateValueUSD(apiKeyBalances[apiKey])) : '-' }}
              </td>
            </tr>
            <tr style="background-color: #2a2a2a; font-weight: bold; border-top: 2px solid #444;">
              <td style="padding: 8px; color: #f39c12; font-size: 9px;">TOTAL</td>
              <td style="padding: 8px; text-align: right; color: #e2c102; font-size: 9px;">{{ formatNumber(baseBalance) }}</td>
              <td style="padding: 8px; text-align: right; color: #e2735f; font-size: 9px;">{{ formatNumber(baseBalanceUsed) }}</td>
              <td style="padding: 8px; text-align: right; color: #13e6f5; font-size: 9px;">{{ formatNumber(quoteBalance) }}</td>
              <td style="padding: 8px; text-align: right; color: #e2735f; font-size: 9px;">{{ formatNumber(quoteBalanceUsed) }}</td>
              <td style="padding: 8px; text-align: right; color: #f39c12; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalValueUSD()) }}</td>
            </tr>
            <tr style="background-color: #1a3a1a; font-weight: bold;">
              <td style="padding: 8px; color: #10eb04; font-size: 9px;">GRAND TOTAL</td>
              <td colspan="2" style="padding: 8px; text-align: right; color: #10eb04; font-size: 9px;">
                {{ base }}: {{ formatNumber((parseFloat(baseBalance) + parseFloat(baseBalanceUsed)).toFixed(2)) }}
              </td>
              <td colspan="2" style="padding: 8px; text-align: right; color: #05f5ed; font-size: 9px;">
                {{ quote }}: {{ formatNumber((parseFloat(quoteBalance) + parseFloat(quoteBalanceUsed)).toFixed(2)) }}
              </td>
              <td style="padding: 8px; text-align: right; color: #10eb04; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalValueUSD()) }} USD</td>
            </tr>
          </tbody>
        </table>
      </n-card>

      <!-- RIGHT: Balance History -->
      <n-card style="background: #0f0f0f;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <n-text strong style="color: #f5a623; font-size: 11px;">Balance History</n-text>
          <n-text depth="3" style="font-size: 9px; color: #888;">{{snapshots.length}} saved</n-text>
        </div>

        <!-- Buttons: Save & Reset -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 6px; margin-bottom: 8px;">
          <button @click="saveSnapshot" class="balance-button" style="background: #10eb04; color: #000; font-weight: bold; padding: 6px; font-size: 9px; border-radius: 4px; border: none; cursor: pointer;">
            💾 Save Snapshot
          </button>
          <button @click="resetAllSnapshots" class="balance-button" style="background: #e90a15; color: #fff; font-weight: bold; padding: 6px; font-size: 9px; border-radius: 4px; border: none; cursor: pointer;">
            🗑️ Reset
          </button>
        </div>

          <!-- CALENDAR VIEW - TABLE BASED (QUARTZ STYLE) -->
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 8px; margin-bottom: 12px;">
            <!-- Month Navigation -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <button @click="previousMonth" style="background: #2a2a2a; color: #10eb04; border: 1px solid #444; padding: 3px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 9px;">
                ◀
              </button>
              <div style="color: #f5a623; font-weight: 700; font-size: 11px;">
                {{ currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }) }}
              </div>
              <button @click="nextMonth" style="background: #2a2a2a; color: #10eb04; border: 1px solid #444; padding: 3px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 9px;">
                ▶
              </button>
            </div>

            <!-- Calendar Table -->
            <div style="background: #2a2a2a; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
              <table style="width: 100%; font-size: 9px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #333;">
                    <th v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day"
                        style="padding: 4px; text-align: center; font-weight: 600; color: #aaa; font-size: 9px;">
                      {{ day }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="weekIndex in 6" :key="weekIndex">
                    <td v-for="dayIndex in 7" :key="dayIndex"
                        @click="selectCalendarCell(weekIndex, dayIndex)"
                        :style="getCellStyle(weekIndex, dayIndex)"
                        style="padding: 4px; text-align: center; border-top: 1px solid #333; cursor: pointer; transition: all 0.2s;">
                      <div style="font-size: 9px;">{{ getCellDate(weekIndex, dayIndex) }}</div>
                      <div v-if="cellHasSnapshots(weekIndex, dayIndex)"
                           style="font-size: 9px; color: #10eb04;">
                        •
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Selected Date Info -->
            <div v-if="selectedDate" style="margin-top: 8px; padding: 4px 6px; background: #0f0f0f; border-radius: 4px; text-align: center; border: 1px solid #10eb04;">
              <span style="color: #10eb04; font-weight: 700; font-size: 9px;">📅 {{ selectedDate }}</span>
              <span style="color: #f5a623; font-size: 8px; margin-left: 6px;">({{ selectedDateSnapshots.length }})</span>
              <button @click="selectedDate = null" style="margin-left: 8px; background: #e90a15; color: #fff; border: none; padding: 1px 6px; border-radius: 3px; cursor: pointer; font-size: 7px; font-weight: 600;">
                ✕
              </button>
            </div>
          </div>

        <!-- ALL Snapshots List - COMPACT TABLE WITH ACCORDION -->
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #333; border-radius: 6px; background: #0a0a0a;">
            <!-- Header with filter info -->
            <div v-if="selectedDate" style="background: #2a2a2a; padding: 8px; text-align: center; border-bottom: 1px solid #444;">
              <span style="color: #10eb04; font-weight: 700; font-size: 10px;">📅 Showing snapshots for {{ selectedDate }}</span>
              <span style="color: #888; font-size: 9px; margin-left: 8px;">({{ selectedDateSnapshots.length }} found)</span>
            </div>

            <div v-if="(selectedDate ? selectedDateSnapshots : sortedSnapshots).length === 0" style="padding: 20px; text-align: center; color: #666; font-size: 11px; font-style: italic;">
              {{ selectedDate ? 'No snapshots for this date.' : 'No snapshots saved yet.' }}<br>{{ selectedDate ? '' : 'Click "Save Snapshot" to create your first one.' }}
            </div>

            <!-- Compact Table -->
            <table v-else style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead style="background: #2a2a2a; position: sticky; top: 0; z-index: 10;">
                <tr>
                  <th style="padding: 6px 8px; text-align: center; color: #888; font-weight: 600; border-bottom: 1px solid #444; font-size: 9px;">#</th>
                  <th style="padding: 6px 8px; text-align: left; color: #888; font-weight: 600; border-bottom: 1px solid #444; font-size: 9px;">Date & Time</th>
                  <th style="padding: 6px 8px; text-align: right; color: #888; font-weight: 600; border-bottom: 1px solid #444; font-size: 9px;">{{ base }}</th>
                  <th style="padding: 6px 8px; text-align: right; color: #888; font-weight: 600; border-bottom: 1px solid #444; font-size: 9px;">{{ quote }}</th>
                  <th style="padding: 6px 8px; text-align: center; color: #888; font-weight: 600; border-bottom: 1px solid #444; font-size: 9px;">Grids</th>
                  <th style="padding: 6px 8px; text-align: center; color: #888; font-weight: 600; border-bottom: 1px solid #444; font-size: 9px;">Del</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(snapshot, index) in (selectedDate ? selectedDateSnapshots : sortedSnapshots)" :key="snapshot.id">
                  <!-- Compact Row (clickable to expand) -->
                  <tr @click="toggleSnapshotDetails(snapshot.id)"
                      :style="{
                        background: expandedSnapshotId === snapshot.id ? '#2a2a2a' : '#1a1a1a',
                        cursor: 'pointer',
                        borderBottom: '1px solid #222'
                      }"
                      @mouseover="(e) => e.currentTarget.style.background = '#252525'"
                      @mouseleave="(e) => e.currentTarget.style.background = expandedSnapshotId === snapshot.id ? '#2a2a2a' : '#1a1a1a'">
                    <td style="padding: 6px 8px; text-align: center;">
                      <span style="color: #10eb04; font-weight: 700; background: #1a3a1a; padding: 2px 6px; border-radius: 3px; font-size: 10px;">{{ index + 1 }}</span>
                    </td>
                    <td style="padding: 6px 8px;">
                      <div style="font-size: 9px; color: #f5a623; font-weight: 600;">{{ formatSnapshotDate(snapshot.date) }}</div>
                      <div style="font-size: 8px; color: #888;">{{ snapshot.time }}</div>
                    </td>
                    <td style="padding: 6px 8px; text-align: right; color: #10eb04; font-weight: 600; font-size: 10px;">
                      {{ formatNumber(snapshot.baseGrandTotal?.toFixed(2) || '0.00') }}
                    </td>
                    <td style="padding: 6px 8px; text-align: right; color: #05f5ed; font-weight: 600; font-size: 10px;">
                      {{ formatNumber(snapshot.quoteGrandTotal?.toFixed(2) || '0.00') }}
                    </td>
                    <td style="padding: 6px 8px; text-align: center; font-size: 9px;">
                      <span style="color: #46f012;">{{snapshot.buyOrdersCount || 0}}</span> / <span style="color: #e90a15;">{{snapshot.sellOrdersCount || 0}}</span>
                    </td>
                    <td style="padding: 6px 8px; text-align: center;">
                      <button @click.stop="deleteSnapshot(snapshot.id)" style="background: #e90a15; color: #fff; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 8px; font-weight: 600;">
                        🗑️
                      </button>
                    </td>
                  </tr>

                  <!-- Expanded Details Row (hidden by default) -->
                  <tr v-if="expandedSnapshotId === snapshot.id">
                    <td colspan="6" style="padding: 12px; background: #0f0f0f; border-bottom: 2px solid #444;">

                      <!-- Ticker Price & USD Value -->
                      <div style="margin-bottom: 10px; padding: 8px; background: #1a1a1a; border-radius: 4px; border: 1px solid #10eb04; display: flex; justify-content: space-around; align-items: center;">
                        <div style="text-align: center;">
                          <div style="color: #888; font-size: 8px;">Ticker Price</div>
                          <div style="color: #10eb04; font-weight: 700; font-size: 11px;">{{ formatNumber(snapshot.tickerPrice?.toFixed(4) || '0.0000', 'Price') }}</div>
                        </div>
                        <div style="border-left: 1px solid #444; height: 30px;"></div>
                        <div style="text-align: center;">
                          <div style="color: #888; font-size: 8px;">Total Value USD</div>
                          <div style="color: #f39c12; font-weight: 700; font-size: 11px;">${{ formatNumber(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal).toFixed(2)) }}</div>
                        </div>
                      </div>

                      <!-- DIFFERENCES from Previous Snapshot (doar daca nu e primul) -->
                      <div v-if="index > 0" style="margin-bottom: 10px; padding: 10px; background: #1a1a1a; border-radius: 6px; border: 2px solid #05f5ed;">
                        <div style="text-align: center; color: #05f5ed; font-weight: 700; font-size: 11px; margin-bottom: 8px;">
                          📊 DIFFERENCES FROM PREVIOUS SNAPSHOT
                        </div>

                        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                          <thead>
                            <tr style="background: #0f0f0f;">
                              <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Metric</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Previous</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Current</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Diff</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <!-- Ticker Price -->
                            <tr style="background: #1a1a1a;">
                              <td style="padding: 4px 6px; color: #888;">Ticker Price</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">{{ formatNumber((sortedSnapshots[index + 1]?.tickerPrice || 0).toFixed(4), 'Price') }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #05f5ed; font-weight: 600;">{{ formatNumber((snapshot.tickerPrice || 0).toFixed(4), 'Price') }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${(snapshot.tickerPrice - (sortedSnapshots[index + 1]?.tickerPrice || 0)) >= 0 ? '#10eb04' : '#e90a15'};`">
                                {{ ((snapshot.tickerPrice - (sortedSnapshots[index + 1]?.tickerPrice || 0)) >= 0 ? '+' : '') + formatNumber((snapshot.tickerPrice - (sortedSnapshots[index + 1]?.tickerPrice || 0)).toFixed(4), 'Price') }}
                              </td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; font-size: 8px; color: ${calculatePercentageChange(snapshot.tickerPrice, sortedSnapshots[index + 1]?.tickerPrice) !== null && calculatePercentageChange(snapshot.tickerPrice, sortedSnapshots[index + 1]?.tickerPrice) >= 0 ? '#10eb04' : calculatePercentageChange(snapshot.tickerPrice, sortedSnapshots[index + 1]?.tickerPrice) !== null ? '#e90a15' : '#888'};`">
                                {{ formatPercentage(snapshot.tickerPrice, sortedSnapshots[index + 1]?.tickerPrice) }}
                              </td>
                            </tr>

                            <!-- Total LCX -->
                            <tr style="background: #0f0f0f;">
                              <td style="padding: 4px 6px; color: #888;">Total {{ base }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">{{ formatNumber((sortedSnapshots[index + 1]?.baseGrandTotal || 0).toFixed(2)) }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600;">{{ formatNumber((snapshot.baseGrandTotal || 0).toFixed(2)) }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${(snapshot.baseGrandTotal - (sortedSnapshots[index + 1]?.baseGrandTotal || 0)) >= 0 ? '#10eb04' : '#e90a15'};`">
                                {{ ((snapshot.baseGrandTotal - (sortedSnapshots[index + 1]?.baseGrandTotal || 0)) >= 0 ? '+' : '') + formatNumber((snapshot.baseGrandTotal - (sortedSnapshots[index + 1]?.baseGrandTotal || 0)).toFixed(2)) }}
                              </td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; font-size: 8px; color: ${calculatePercentageChange(snapshot.baseGrandTotal, sortedSnapshots[index + 1]?.baseGrandTotal) !== null && calculatePercentageChange(snapshot.baseGrandTotal, sortedSnapshots[index + 1]?.baseGrandTotal) >= 0 ? '#10eb04' : calculatePercentageChange(snapshot.baseGrandTotal, sortedSnapshots[index + 1]?.baseGrandTotal) !== null ? '#e90a15' : '#888'};`">
                                {{ formatPercentage(snapshot.baseGrandTotal, sortedSnapshots[index + 1]?.baseGrandTotal) }}
                              </td>
                            </tr>

                            <!-- Total USDC -->
                            <tr style="background: #1a1a1a;">
                              <td style="padding: 4px 6px; color: #888;">Total {{ quote }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">{{ formatNumber((sortedSnapshots[index + 1]?.quoteGrandTotal || 0).toFixed(2)) }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #05f5ed; font-weight: 600;">{{ formatNumber((snapshot.quoteGrandTotal || 0).toFixed(2)) }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${(snapshot.quoteGrandTotal - (sortedSnapshots[index + 1]?.quoteGrandTotal || 0)) >= 0 ? '#10eb04' : '#e90a15'};`">
                                {{ ((snapshot.quoteGrandTotal - (sortedSnapshots[index + 1]?.quoteGrandTotal || 0)) >= 0 ? '+' : '') + formatNumber((snapshot.quoteGrandTotal - (sortedSnapshots[index + 1]?.quoteGrandTotal || 0)).toFixed(2)) }}
                              </td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; font-size: 8px; color: ${calculatePercentageChange(snapshot.quoteGrandTotal, sortedSnapshots[index + 1]?.quoteGrandTotal) !== null && calculatePercentageChange(snapshot.quoteGrandTotal, sortedSnapshots[index + 1]?.quoteGrandTotal) >= 0 ? '#10eb04' : calculatePercentageChange(snapshot.quoteGrandTotal, sortedSnapshots[index + 1]?.quoteGrandTotal) !== null ? '#e90a15' : '#888'};`">
                                {{ formatPercentage(snapshot.quoteGrandTotal, sortedSnapshots[index + 1]?.quoteGrandTotal) }}
                              </td>
                            </tr>

                            <!-- Total Value USD -->
                            <tr style="background: #0f0f0f; border-top: 2px solid #444;">
                              <td style="padding: 4px 6px; color: #f39c12; font-weight: 700;">Value USD</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">${{ formatNumber((((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0)).toFixed(2)) }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #f39c12; font-weight: 700;">${{ formatNumber(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal).toFixed(2)) }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal) - (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))) >= 0 ? '#10eb04' : '#e90a15'};`">
                                ${{ ((((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal) - (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))) >= 0 ? '+' : '') + formatNumber((((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal) - (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))).toFixed(2)) }}
                              </td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; font-size: 8px; color: ${calculatePercentageChange(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal), (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))) !== null && calculatePercentageChange(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal), (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))) >= 0 ? '#10eb04' : calculatePercentageChange(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal), (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))) !== null ? '#e90a15' : '#888'};`">
                                {{ formatPercentage(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal), (((sortedSnapshots[index + 1]?.baseGrandTotal || 0) * (sortedSnapshots[index + 1]?.tickerPrice || 0)) + (sortedSnapshots[index + 1]?.quoteGrandTotal || 0))) }}
                              </td>
                            </tr>

                            <!-- Total Orders -->
                            <tr style="background: #1a1a1a; border-top: 1px solid #444;">
                              <td style="padding: 4px 6px; color: #888;">Total Orders</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">{{ (sortedSnapshots[index + 1]?.totalGrids || 0) }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #05f5ed; font-weight: 600;">{{ snapshot.totalGrids || 0 }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${((snapshot.totalGrids || 0) - (sortedSnapshots[index + 1]?.totalGrids || 0)) >= 0 ? '#10eb04' : '#e90a15'};`">
                                {{ (((snapshot.totalGrids || 0) - (sortedSnapshots[index + 1]?.totalGrids || 0)) >= 0 ? '+' : '') + ((snapshot.totalGrids || 0) - (sortedSnapshots[index + 1]?.totalGrids || 0)) }}
                              </td>
                              <td style="padding: 4px 6px; text-align: right; color: #888; font-size: 8px;">-</td>
                            </tr>

                            <!-- BUY Orders -->
                            <tr style="background: #0f0f0f;">
                              <td style="padding: 4px 6px; color: #888;">BUY Orders</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">{{ (sortedSnapshots[index + 1]?.buyOrdersCount || 0) }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600;">{{ snapshot.buyOrdersCount || 0 }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${((snapshot.buyOrdersCount || 0) - (sortedSnapshots[index + 1]?.buyOrdersCount || 0)) >= 0 ? '#10eb04' : '#e90a15'};`">
                                {{ (((snapshot.buyOrdersCount || 0) - (sortedSnapshots[index + 1]?.buyOrdersCount || 0)) >= 0 ? '+' : '') + ((snapshot.buyOrdersCount || 0) - (sortedSnapshots[index + 1]?.buyOrdersCount || 0)) }}
                              </td>
                              <td style="padding: 4px 6px; text-align: right; color: #888; font-size: 8px;">-</td>
                            </tr>

                            <!-- SELL Orders -->
                            <tr style="background: #1a1a1a;">
                              <td style="padding: 4px 6px; color: #888;">SELL Orders</td>
                              <td style="padding: 4px 6px; text-align: right; color: #888;">{{ (sortedSnapshots[index + 1]?.sellOrdersCount || 0) }}</td>
                              <td style="padding: 4px 6px; text-align: right; color: #e90a15; font-weight: 600;">{{ snapshot.sellOrdersCount || 0 }}</td>
                              <td :style="`padding: 4px 6px; text-align: right; font-weight: 700; color: ${((snapshot.sellOrdersCount || 0) - (sortedSnapshots[index + 1]?.sellOrdersCount || 0)) >= 0 ? '#10eb04' : '#e90a15'};`">
                                {{ (((snapshot.sellOrdersCount || 0) - (sortedSnapshots[index + 1]?.sellOrdersCount || 0)) >= 0 ? '+' : '') + ((snapshot.sellOrdersCount || 0) - (sortedSnapshots[index + 1]?.sellOrdersCount || 0)) }}
                              </td>
                              <td style="padding: 4px 6px; text-align: right; color: #888; font-size: 8px;">-</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- ORDERS PER API KEY TABLE (exact ca in interfata principala) -->
                      <div v-if="snapshot.apiKeyOrders" style="margin-bottom: 10px; background: #1a1a1a; padding: 10px; border-radius: 6px; border: 2px solid #10eb04;">
                        <div style="text-align: center; color: #10eb04; font-weight: 700; font-size: 11px; margin-bottom: 8px;">
                          ORDERS PER API KEY ({{snapshot.apiKeys?.length || 0}} APIs Selected)
                        </div>

                        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                          <thead>
                            <tr style="background: #0f0f0f;">
                              <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">API Key</th>
                              <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Type</th>
                              <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Orders</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Avg Price</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Qty</th>
                              <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Coin</th>
                              <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <!-- Loop through each API key and show BUY + SELL rows -->
                            <template v-for="(orders, apiKey) in snapshot.apiKeyOrders" :key="`${apiKey}-group`">
                              <!-- BUY Row for this API -->
                              <tr style="background: #0a2e01;">
                                <td :rowspan="2" style="padding: 4px 6px; vertical-align: middle; border-right: 1px solid #444;">
                                  <div style="display: flex; align-items: center; gap: 4px;">
                                    <span :style="`display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${orders.color || '#888'};`"></span>
                                    <span :style="`color: ${orders.color || '#888'}; font-weight: 600; font-size: 9px;`">{{ apiKey }}</span>
                                  </div>
                                </td>
                                <td style="padding: 4px 6px; color: #46f012; font-weight: 700; font-size: 9px;">BUY</td>
                                <td style="padding: 4px 6px; text-align: center; color: #46f012; font-weight: 700; font-size: 9px;">{{ orders.buy?.count || 0 }}</td>
                                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(orders.buy?.avgPrice?.toFixed(4) || '0.0000', 'Price') }}</td>
                                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(orders.buy?.totalQty?.toFixed(2) || '0.00') }}</td>
                                <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ base }}</td>
                                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 700; font-size: 9px;">{{ formatNumber(orders.buy?.totalCost?.toFixed(2) || '0.00') }}</td>
                              </tr>
                              <!-- SELL Row for this API -->
                              <tr style="background: #420202; border-bottom: 2px solid #333;">
                                <td style="padding: 4px 6px; color: #e90a15; font-weight: 700; font-size: 9px;">SELL</td>
                                <td style="padding: 4px 6px; text-align: center; color: #e90a15; font-weight: 700; font-size: 9px;">{{ orders.sell?.count || 0 }}</td>
                                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(orders.sell?.avgPrice?.toFixed(4) || '0.0000', 'Price') }}</td>
                                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(orders.sell?.totalQty?.toFixed(2) || '0.00') }}</td>
                                <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ quote }}</td>
                                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 700; font-size: 9px;">{{ formatNumber(orders.sell?.totalCost?.toFixed(2) || '0.00') }}</td>
                              </tr>
                            </template>
                          </tbody>
                        </table>
                      </div>

                      <!-- Per API Key Breakdown: BALANCES + ORDERS -->
                      <div style="margin-bottom: 10px;">
                        <div style="color: #f39c12; font-weight: 700; font-size: 10px; margin-bottom: 8px; text-align: center; border-bottom: 1px solid #444; padding-bottom: 4px;">
                          PER API KEY DETAILS ({{snapshot.apiKeys?.length || 0}} APIs)
                        </div>

                        <div v-if="snapshot.apiKeyBalances">
                          <div v-for="(balance, apiKey) in snapshot.apiKeyBalances" :key="apiKey"
                               :style="`margin-bottom: 8px; padding: 8px; background: #1a1a1a; border-radius: 4px; border-left: 3px solid ${balance.color || '#888'}`">
                            <div :style="`color: ${balance.color || '#888'}; font-weight: 600; font-size: 10px; margin-bottom: 6px;`">
                              {{ apiKey }}
                            </div>

                            <!-- BALANCES -->
                            <div style="font-size: 8px; color: #888; margin-bottom: 4px;">BALANCES:</div>
                            <table style="width: 100%; font-size: 9px; margin-bottom: 8px;">
                              <tr>
                                <td style="color: #888; padding: 2px;">Free {{base}}:</td>
                                <td style="color: #10eb04; font-weight: 600; text-align: right; padding: 2px;">{{ formatNumber(balance.baseFree?.toFixed(2)) }}</td>
                                <td style="color: #888; padding: 2px 2px 2px 12px;">Free {{quote}}:</td>
                                <td style="color: #05f5ed; font-weight: 600; text-align: right; padding: 2px;">{{ formatNumber(balance.quoteFree?.toFixed(2)) }}</td>
                              </tr>
                              <tr>
                                <td style="color: #888; padding: 2px;">Used {{base}}:</td>
                                <td style="color: #f5a623; font-weight: 600; text-align: right; padding: 2px;">{{ formatNumber(balance.baseUsed?.toFixed(2)) }}</td>
                                <td style="color: #888; padding: 2px 2px 2px 12px;">Used {{quote}}:</td>
                                <td style="color: #f5a623; font-weight: 600; text-align: right; padding: 2px;">{{ formatNumber(balance.quoteUsed?.toFixed(2)) }}</td>
                              </tr>
                              <tr style="border-top: 1px solid #333;">
                                <td style="color: #888; padding: 4px 2px 2px 2px; font-weight: 600;">Total {{base}}:</td>
                                <td style="color: #10eb04; font-weight: 700; text-align: right; padding: 4px 2px 2px 2px;">{{ formatNumber(balance.baseTotal?.toFixed(2)) }}</td>
                                <td style="color: #888; padding: 4px 2px 2px 12px; font-weight: 600;">Total {{quote}}:</td>
                                <td style="color: #05f5ed; font-weight: 700; text-align: right; padding: 4px 2px 2px 2px;">{{ formatNumber(balance.quoteTotal?.toFixed(2)) }}</td>
                              </tr>
                              <tr style="border-top: 1px solid #444;">
                                <td colspan="2" style="color: #888; padding: 4px 2px 2px 2px;">Value USD:</td>
                                <td colspan="2" style="color: #f39c12; font-weight: 700; text-align: right; padding: 4px 2px 2px 2px;">${{ formatNumber(((balance.baseTotal * snapshot.tickerPrice) + balance.quoteTotal).toFixed(2)) }}</td>
                              </tr>
                            </table>

                            <!-- ORDERS (if exists) -->
                            <div v-if="snapshot.apiKeyOrders && snapshot.apiKeyOrders[apiKey]" style="border-top: 1px solid #333; padding-top: 6px;">
                              <div style="font-size: 8px; color: #888; margin-bottom: 4px;">ORDERS:</div>
                              <table style="width: 100%; font-size: 9px;">
                                <tr style="background: #0a2e01;">
                                  <td style="color: #46f012; padding: 2px; font-weight: 600;">BUY:</td>
                                  <td style="color: #10eb04; text-align: right; padding: 2px;">{{ snapshot.apiKeyOrders[apiKey].buy?.count || 0 }} orders</td>
                                  <td style="color: #10eb04; text-align: right; padding: 2px;">Avg: {{ formatNumber(snapshot.apiKeyOrders[apiKey].buy?.avgPrice?.toFixed(4) || '0.0000', 'Price') }}</td>
                                  <td style="color: #10eb04; text-align: right; padding: 2px;">Cost: {{ formatNumber(snapshot.apiKeyOrders[apiKey].buy?.totalCost?.toFixed(2) || '0.00') }}</td>
                                </tr>
                                <tr style="background: #420202;">
                                  <td style="color: #e90a15; padding: 2px; font-weight: 600;">SELL:</td>
                                  <td style="color: #f5a623; text-align: right; padding: 2px;">{{ snapshot.apiKeyOrders[apiKey].sell?.count || 0 }} orders</td>
                                  <td style="color: #f5a623; text-align: right; padding: 2px;">Avg: {{ formatNumber(snapshot.apiKeyOrders[apiKey].sell?.avgPrice?.toFixed(4) || '0.0000', 'Price') }}</td>
                                  <td style="color: #f5a623; text-align: right; padding: 2px;">Cost: {{ formatNumber(snapshot.apiKeyOrders[apiKey].sell?.totalCost?.toFixed(2) || '0.00') }}</td>
                                </tr>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Grand Totals: BALANCES + ORDERS -->
                      <div style="background: #1a3a1a; padding: 8px; border-radius: 4px; border: 1px solid #f39c12;">
                        <div style="color: #f39c12; font-weight: 700; font-size: 10px; margin-bottom: 6px; text-align: center;">
                          GRAND TOTAL (All APIs Combined)
                        </div>

                        <!-- Balances Grand Total -->
                        <table style="width: 100%; font-size: 10px; margin-bottom: 8px;">
                          <tr>
                            <td style="color: #888;">{{base}}:</td>
                            <td style="color: #10eb04; font-weight: 700; text-align: right;">{{ formatNumber(snapshot.baseGrandTotal?.toFixed(2) || '0.00') }}</td>
                            <td style="color: #888; padding-left: 12px;">{{quote}}:</td>
                            <td style="color: #05f5ed; font-weight: 700; text-align: right;">{{ formatNumber(snapshot.quoteGrandTotal?.toFixed(2) || '0.00') }}</td>
                          </tr>
                          <tr style="border-top: 1px solid #444;">
                            <td colspan="2" style="color: #888; padding-top: 4px;">Value USD:</td>
                            <td colspan="2" style="color: #f39c12; font-weight: 700; text-align: right; padding-top: 4px;">${{ formatNumber(((snapshot.baseGrandTotal * snapshot.tickerPrice) + snapshot.quoteGrandTotal).toFixed(2)) }}</td>
                          </tr>
                        </table>

                        <!-- Orders Grand Total -->
                        <div style="border-top: 1px solid #444; padding-top: 6px;">
                          <table style="width: 100%; font-size: 9px;">
                            <tr style="background: #0a2e01;">
                              <td style="color: #46f012; padding: 3px; font-weight: 600;">TOTAL BUY:</td>
                              <td style="color: #10eb04; text-align: right; padding: 3px;">{{ snapshot.buyOrdersCount || 0 }} orders</td>
                              <td style="color: #10eb04; text-align: right; padding: 3px;">Avg: {{ formatNumber(snapshot.buyOrdersAvgPrice?.toFixed(4) || '0.0000', 'Price') }}</td>
                              <td style="color: #10eb04; text-align: right; padding: 3px;">Qty: {{ formatNumber(snapshot.buyOrdersTotalQty?.toFixed(2) || '0.00') }}</td>
                              <td style="color: #10eb04; text-align: right; padding: 3px;">Cost: {{ formatNumber(snapshot.buyOrdersTotalCost?.toFixed(2) || '0.00') }}</td>
                            </tr>
                            <tr style="background: #420202;">
                              <td style="color: #e90a15; padding: 3px; font-weight: 600;">TOTAL SELL:</td>
                              <td style="color: #f5a623; text-align: right; padding: 3px;">{{ snapshot.sellOrdersCount || 0 }} orders</td>
                              <td style="color: #f5a623; text-align: right; padding: 3px;">Avg: {{ formatNumber(snapshot.sellOrdersAvgPrice?.toFixed(4) || '0.0000', 'Price') }}</td>
                              <td style="color: #f5a623; text-align: right; padding: 3px;">Qty: {{ formatNumber(snapshot.sellOrdersTotalQty?.toFixed(2) || '0.00') }}</td>
                              <td style="color: #f5a623; text-align: right; padding: 3px;">Cost: {{ formatNumber(snapshot.sellOrdersTotalCost?.toFixed(2) || '0.00') }}</td>
                            </tr>
                          </table>
                        </div>
                      </div>

                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
      </n-card>

    </div>
    <!-- END TWO COLUMN LAYOUT -->

    <!-- ORDERS SECTION - FULL WIDTH BELOW -->
    <n-card style="background: #0f0f0f;">

      <!-- TWO COLUMN HEADERS FOR ORDERS -->
      <div style="display: flex; gap: 10px; margin-bottom: 8px;">
        <!-- LEFT HEADER -->
        <div style="flex: 1; text-align: center; padding: 6px; background: #1a1a1a; border-radius: 6px; border: 1px solid #10eb04;">
          <n-text strong style="color: #10eb04; font-size: 11px;">ORDERS PER API KEY</n-text>
        </div>
        <!-- RIGHT HEADER -->
        <div style="flex: 1; text-align: center; padding: 6px; background: #1a1a1a; border-radius: 6px; border: 1px solid #f39c12;">
          <n-text strong style="color: #f39c12; font-size: 11px;">GRAND TOTAL (ALL APIs)</n-text>
        </div>
      </div>

      <!-- TWO COLUMN LAYOUT: Orders Per API Key | Grand Total -->
      <div style="display: flex; gap: 10px; margin-bottom: 16px;">

        <!-- TABEL 1: Orders Per API Key - 2 ROWS per API -->
        <div style="flex: 1; background: #1a1a1a; padding: 8px; border-radius: 6px; border: 2px solid #10eb04;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #0f0f0f;">
                <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">API Key</th>
                <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Type</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Orders</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Avg Price</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Qty</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Coin</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loop through each API key and show BUY + SELL rows -->
              <template v-for="(apiKey, index) in selectedApiKeys" :key="`${apiKey}-group`">
                <!-- BUY Row for this API -->
                <tr style="background: #0a2e01;">
                  <td :rowspan="2" style="padding: 4px 6px; vertical-align: middle; border-right: 1px solid #444;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span :style="`display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${apiKeyColors[apiKey]};`"></span>
                      <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 600; font-size: 9px;`">{{ apiKey }}</span>
                    </div>
                  </td>
                  <td style="padding: 4px 6px; color: #46f012; font-weight: 700; font-size: 9px;">BUY</td>
                  <td style="padding: 4px 6px; text-align: center; color: #46f012; font-weight: 700; font-size: 9px;">{{ getOrdersByApiAndSide(apiKey, 'buy').length }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(getOrdersByApiAndSide(apiKey, 'buy')), 'AveragePrice') }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(getOrdersByApiAndSide(apiKey, 'buy')).toFixed(2)) }}</td>
                  <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ base }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(getOrdersByApiAndSide(apiKey, 'buy'))) }}</td>
                </tr>
                <!-- SELL Row for this API -->
                <tr style="background: #420202; border-bottom: 1px solid #333;">
                  <td style="padding: 4px 6px; color: #e90a15; font-weight: 700; font-size: 9px;">SELL</td>
                  <td style="padding: 4px 6px; text-align: center; color: #e90a15; font-weight: 700; font-size: 9px;">{{ getOrdersByApiAndSide(apiKey, 'sell').length }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(getOrdersByApiAndSide(apiKey, 'sell')), 'AveragePrice') }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(getOrdersByApiAndSide(apiKey, 'sell')).toFixed(2)) }}</td>
                  <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ quote }}</td>
                  <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(getOrdersByApiAndSide(apiKey, 'sell'))) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- TABEL 2: GRAND TOTAL - 2 ROWS TOTAL (ALL APIs combined) -->
        <div style="flex: 1; background: #1a1a1a; padding: 8px; border-radius: 6px; border: 2px solid #f39c12;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #0f0f0f;">
                <th style="padding: 4px 6px; text-align: left; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Type</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Orders</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Avg Price</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Qty</th>
                <th style="padding: 4px 6px; text-align: center; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Coin</th>
                <th style="padding: 4px 6px; text-align: right; color: #888; border-bottom: 1px solid #444; font-size: 8px;">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <!-- BUY Row - ALL APIs -->
              <tr style="background: #0a2e01;">
                <td style="padding: 4px 6px; color: #46f012; font-weight: 700; font-size: 9px;">BUY</td>
                <td style="padding: 4px 6px; text-align: center; color: #46f012; font-weight: 700; font-size: 9px;">{{ buyOrders.length }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(buyOrders), 'AveragePrice') }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(buyOrders).toFixed(2)) }}</td>
                <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ base }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #10eb04; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(buyOrders)) }}</td>
              </tr>
              <!-- SELL Row - ALL APIs -->
              <tr style="background: #420202;">
                <td style="padding: 4px 6px; color: #e90a15; font-weight: 700; font-size: 9px;">SELL</td>
                <td style="padding: 4px 6px; text-align: center; color: #e90a15; font-weight: 700; font-size: 9px;">{{ sellOrders.length }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateAveragePrice(sellOrders), 'AveragePrice') }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 600; font-size: 9px;">{{ formatNumber(calculateTotalQuantity(sellOrders).toFixed(2)) }}</td>
                <td style="padding: 4px 6px; text-align: center; color: #888; font-size: 8px;">{{ quote }}</td>
                <td style="padding: 4px 6px; text-align: right; color: #f5a623; font-weight: 700; font-size: 9px;">{{ formatNumber(calculateTotalCost(sellOrders)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </n-card>

  </div>
  <!-- END CONTAINER -->




</template>


<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { ref, computed, h } from "vue";
import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";
import { reloadNuxtApp } from "nuxt/app";
import ccxt from 'ccxt';

// No more props needed - everything from store
const app = useAppStore();

let userID = useCookie('userID');
let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);
let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

// Ticker variables (from ticker-bar.vue)
let ticker = ref({
  last: 0,
  change: 0,
  low: 0,
  high: 0,
  baseVolume: 0,
  quoteVolume: 0
});
let tickerBTC = ref(0);
let tickerETH = ref(0);
let tickerInterval = null;
let userExchanges = app.getUserExchanges;
let userExchangeMarkets = app.getUserExchangeMarkets;
let selectedExchange = ref(app.getUserSelectedExchange);
let selectedMarket = ref(app.getUserSelectedMarket);

// API Key selector - NOW USING STORE
let availableApiKeys = ref([]);
let selectedApiKeys = computed(() => app.getSelectedApiKeys || []); // READ FROM STORE
let loadingApiKeys = ref(false);
let allOrders = ref([]); // Store all orders
let apiKeyColors = ref({}); // Colors for each API key

let buyOrders = ref([]);
let sellOrders = ref([]);

let baseBalance = ref('0');  // Free balance - TOTAL
let quoteBalance = ref('0'); // Free balance - TOTAL
let baseBalanceUsed = ref('0');  // Used (locked in orders) - TOTAL
let quoteBalanceUsed = ref('0'); // Used (locked in orders) - TOTAL
let apiKeyBalances = ref({}); // Balances per API key: { apiKeyName: { baseFree, baseUsed, quoteFree, quoteUsed } }

let userBalanceInterval = null;

// Dynamic MaxNrGrids based on number of selected API keys (500 grids per API key)
let MaxNrGrids = computed(() => {
  return 500 * selectedApiKeys.value.length;
});

let RemainingNrGrids = computed(() => {
  return MaxNrGrids.value - (buyOrders.value.length + sellOrders.value.length);
});

// Definirea variabilei pentru balanță
let balancebase = ref(0);
let balancequote = ref(0);

// Adăugare variabile pentru priceTicker și breakgive
let priceTicker = ref(0);
let breakgive = ref(0);
let brakegivenPrice = ref(0);

// Calendar & Snapshots variables
let snapshots = ref([]);
let currentDate = ref(new Date());
let selectedDate = ref(null);
let calendarWeeks = ref([]);
let selectedDateSnapshots = ref([]);
let lastSnapshotTime = ref(0); // Track last save time for cooldown
let expandedSnapshotId = ref(null); // Track which snapshot is expanded

const currentMonthName = computed(() => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`;
});

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return '';
  return new Date(selectedDate.value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

// Sorted snapshots (newest first)
const sortedSnapshots = computed(() => {
  return [...snapshots.value].sort((a, b) => b.timestamp - a.timestamp);
});

// Format snapshot date
function formatSnapshotDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

onMounted(async () => {
  await loadApiKeys();
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
  tickerInterval = setIntervalAsync(fetchTickerPooling, 500);
  await fetchOrdersPooling();
  loadBalanceLocal();
  loadSnapshots();
  generateCalendar();
  startAutoRefresh();
});

onUnmounted(() => {
  clearIntervalAsync(userBalanceInterval);
  clearIntervalAsync(tickerInterval);
});

// Load available API keys for the current exchange
async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data.length > 0) {
      // Assign colors to API keys (consistent with grid-bots-list.vue)
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];

      apiKeyColors.value = {};
      availableApiKeys.value = response.data.map((apiKey, index) => {
        const color = colors[index % colors.length];
        apiKeyColors.value[apiKey.name] = color;
        return {
          label: `${apiKey.name}`,
          value: apiKey.name
        };
      });

      // Auto-select all API keys if store is empty
      if (app.getSelectedApiKeys.length === 0) {
        const allKeys = availableApiKeys.value.map(k => k.value);
        app.setSelectedApiKeys(allKeys);
        console.log('📋 OpenOrdersDev: Auto-selected all API keys:', allKeys);
      }
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

// Watch for changes in store's selected API keys
watch(() => app.getSelectedApiKeys, (newApiKeys) => {
  console.log('📋 OpenOrdersDev: Store API keys changed:', newApiKeys);
  filterOrders();
  fetchUserBalancePooling();
}, { deep: true });

// Ticker functions
async function fetchTickerPooling() {
  // Don't fetch if exchange or symbol not ready
  if (!selectedExchange.value || !selectedMarket.value) {
    return;
  }

  let response = await $fetch('/api/v1/fetchTicker', {
    query: {
      userID: userID.value,
      exchange: selectedExchange.value,
      symbol: selectedMarket.value,
    }
  });

  if (response.data) {
    ticker.value = response.data;
    fetchTickerBTC();
    fetchTickerETH();
  }
}

async function fetchTickerBTC() {
  try {
    const binance = new ccxt.binance();
    const tickerBTCData = await binance.fetchTicker('BTC/USDT');
    tickerBTC.value = parseFloat(tickerBTCData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului BTC/USDT:', error);
    tickerBTC.value = 0;
  }
}

async function fetchTickerETH() {
  try {
    const binance = new ccxt.binance();
    const tickerETHData = await binance.fetchTicker('ETH/USDT');
    tickerETH.value = parseFloat(tickerETHData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului ETH/USDT:', error);
    tickerETH.value = 0;
  }
}

async function updateSelectedExchange(exchange) {
  await app.updateUserSelectedExchange(userID.value, exchange);
  reloadNuxtApp();
}

async function updateSelectedMarket(market) {
  await app.updateUserSelectedMarket(userID.value, selectedExchange.value, market);
  reloadNuxtApp();
}

// Load saved balances from localStorage
function loadBalanceLocal() {
  const savedBalanceBase = localStorage.getItem("savedBalanceBase");
  if (savedBalanceBase !== null) {
    balancebase.value = savedBalanceBase;
  }

  const savedBalanceQuote = localStorage.getItem("savedBalanceQuote");
  if (savedBalanceQuote !== null) {
    balancequote.value = savedBalanceQuote;
  }

  const savedBalanceBaseTarget = localStorage.getItem("savedBalanceBaseTarget");
  if (savedBalanceBaseTarget !== null) {
    balancebaseTarget.value = savedBalanceBaseTarget;
  }

  const savedBalanceQuoteTarget = localStorage.getItem("savedBalanceQuoteTarget");
  if (savedBalanceQuoteTarget !== null) {
    balancequoteTarget.value = savedBalanceQuoteTarget;
  }
}

// Save balances to localStorage
function saveBalanceLocal() {
  localStorage.setItem("savedBalanceBase", balancebase.value);
  localStorage.setItem("savedBalanceQuote", balancequote.value);
}
function saveBalanceTargetLocal() {
  localStorage.setItem("savedBalanceBaseTarget", balancebaseTarget.value);
  localStorage.setItem("savedBalanceQuoteTarget", balancequoteTarget.value);
}

async function fetchUserBalancePooling() {
  // Fetch CACHED balances from DB (much faster!)
  try {
    const response = await $fetch('/api/v1/getCachedBalances', {
      query: {
        userID: userID.value
      }
    });

    if (!response.success || !response.balances) {
      console.error('Failed to fetch cached balances');
      return;
    }

    // Use API keys from store
    const apiKeysToFetch = selectedApiKeys.value;

    if (!apiKeysToFetch || apiKeysToFetch.length === 0) {
      console.log('📋 OpenOrdersDev: No API keys selected in store');
      return;
    }

    let totalBaseFree = 0;
    let totalQuoteFree = 0;
    let totalBaseUsed = 0;
    let totalQuoteUsed = 0;
    const newApiKeyBalances = {};

    // Process cached balances
    for (const cachedBalance of response.balances) {
      // Match exchange and API key name
      if (cachedBalance.exchange === currentExchange.value &&
          apiKeysToFetch.includes(cachedBalance.apiKeyName)) {

        const balanceData = cachedBalance.balance || {};
        const baseFree = balanceData[base]?.free || 0;
        const baseUsed = balanceData[base]?.used || 0;
        const quoteFree = balanceData[quote]?.free || 0;
        const quoteUsed = balanceData[quote]?.used || 0;

        newApiKeyBalances[cachedBalance.apiKeyName] = {
          baseFree: parseFloat(baseFree),
          baseUsed: parseFloat(baseUsed),
          quoteFree: parseFloat(quoteFree),
          quoteUsed: parseFloat(quoteUsed)
        };

        // Sum for totals
        totalBaseFree += parseFloat(baseFree);
        totalBaseUsed += parseFloat(baseUsed);
        totalQuoteFree += parseFloat(quoteFree);
        totalQuoteUsed += parseFloat(quoteUsed);
      }
    }

    // Update individual API key balances
    apiKeyBalances.value = newApiKeyBalances;

    // Update balances with totals from all API keys
    if (Object.keys(newApiKeyBalances).length > 0) {
      baseBalance.value = totalBaseFree.toFixed(2);
      quoteBalance.value = totalQuoteFree.toFixed(2);
      baseBalanceUsed.value = totalBaseUsed.toFixed(2);
      quoteBalanceUsed.value = totalQuoteUsed.toFixed(2);
    } else {
      baseBalance.value = '0.00';
      quoteBalance.value = '0.00';
      baseBalanceUsed.value = '0.00';
      quoteBalanceUsed.value = '0.00';
    }

  } catch (error) {
    console.error('Error fetching cached balances:', error);
  }
}

async function fetchOrdersPooling() {
  // Fetch orders from all API keys
  allOrders.value = [];

  for (const apiKeyName of availableApiKeys.value.map(k => k.value)) {
    try {
      let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          apiKeyName: apiKeyName
        }
      });

      if (openOrdersRes.data) {
        // Tag each order with its API key name
        const taggedOrders = openOrdersRes.data.map(order => ({
          ...order,
          apiKeyName: apiKeyName
        }));
        allOrders.value.push(...taggedOrders);
      }
    } catch (error) {
      console.error(`Failed to fetch orders for ${apiKeyName}:`, error);
    }
  }

  // Filter orders based on selected API keys
  filterOrders();
}

function filterOrders() {
  if (selectedApiKeys.value.length === 0) {
    buyOrders.value = [];
    sellOrders.value = [];
    return;
  }

  const filteredOrders = allOrders.value.filter(order =>
    selectedApiKeys.value.includes(order.apiKeyName)
  );

  buyOrders.value = filteredOrders.filter(order => order.side === 'buy');
  sellOrders.value = filteredOrders.filter(order => order.side === 'sell');
}

// Get orders for a specific API key and side
function getOrdersByApiKey(apiKeyName, side) {
  return allOrders.value.filter(order =>
    order.apiKeyName === apiKeyName && order.side === side
  );
}

// Get orders for a specific API key and side (alias for getOrdersByApiKey)
function getOrdersByApiAndSide(apiKeyName, side) {
  return allOrders.value.filter(order =>
    order.apiKeyName === apiKeyName && order.side === side
  );
}

function calculateAveragePrice(orders) {
  let totalAmount = orders.reduce((acc, order) => acc + order.amount, 0);
  let totalPrice = orders.reduce((acc, order) => acc + (order.amount * order.price), 0);
  let averagePrice = totalPrice / totalAmount;
  return formatNumber(averagePrice.toFixed(5), 'AveragePrice');
}

function calculateTotalQuantity(orders) {
  return orders.reduce((acc, order) => acc + order.amount, 0);
}

function calculateTotalCost(orders) {
  return orders.reduce((acc, order) => acc + (order.amount * order.price), 0).toFixed(2);
}

function formatNumber(value, columnName) {
  if (typeof value === 'string' || typeof value === 'number') {
    // Verificăm dacă valoarea este un număr sau un șir de caractere care poate fi convertit în număr
    let numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      // Folosim expresia regulată pentru a adăuga separatorul de mii
      if (columnName !== 'AveragePrice' && columnName !== 'Price') {
        return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      } else {
        // Pentru prețuri (AveragePrice, Price): precizie 4 decimale pentru LCX
        return numericValue.toFixed(4);
      }
    }
  }
  // Dacă nu este un număr sau un șir de caractere numeric, returnăm valoarea originală
  return value;
}

function calculateTotalquote() {
  // Calculăm totalul din ordinele de vânzare
  let totalFromOrders = calculateTotalQuantity(buyOrders.value);

  // Adăugăm cantitatea disponibilă în balanță pentru quote
  let totalQuoteBalance = parseFloat(quoteBalance.value);

  // Adăugăm și valoarea din ordinele de vânzare
  totalQuoteBalance += totalFromOrders;

  // Returnăm balanța totală pentru quote
  return totalQuoteBalance.toFixed(2);
}

function calculateTotalbase() {
  // Calculăm totalul din ordinele de cumpărare
  let totalFromOrders = calculateTotalQuantity(sellOrders.value);

  // Adăugăm cantitatea disponibilă în balanță pentru base
  let totalBaseBalance = parseFloat(baseBalance.value);

  // Adăugăm și valoarea din ordinele de cumpărare
  totalBaseBalance += totalFromOrders;

  // Returnăm balanța totală pentru base
  return totalBaseBalance.toFixed(2);
}

function calculatePossibleBase() {
  // Calculează câte LCX (base) pot cumpăra cu tot USDC (quote) disponibil la prețul ticker
  const totalQuote = parseFloat(quoteBalance.value) + parseFloat(quoteBalanceUsed.value) + parseFloat(calculateTotalCost(buyOrders.value));
  const tickerPrice = parseFloat(priceTicker.value);

  if (tickerPrice <= 0) return '0.00';

  const possibleBase = totalQuote / tickerPrice;
  return possibleBase.toFixed(2);
}

function calculateBreakgive() {
  const totalCost = parseFloat(calculateTotalCost(buyOrders.value)) + parseFloat(quoteBalance.value);
  breakgive.value = (totalCost / parseFloat(priceTicker.value)).toFixed(2);
}

function calculateBrakegivenPrice() {
  const total2 = parseFloat(calculateTotalCost(buyOrders.value)) + parseFloat(quoteBalance.value);
  const baseDifference = parseFloat(calculateTotalbase()) - parseFloat(balancebase.value);

  // Verifică dacă baseDifference este negativ sau zero
  if (baseDifference <= 0 || isNaN(baseDifference)) {
    brakegivenPrice.value = 0; // Setăm brakegivenPrice la zero dacă baseDifference este negativ sau zero
  } else {
    brakegivenPrice.value = (total2 / baseDifference).toFixed(2);
  }

}

function calculateAmountInUSD(order) {
  // Calculăm valoarea în USD și o formatăm utilizând funcția formatNumber
  return formatNumber((parseFloat(order.amount) * parseFloat(order.price)).toFixed(2));
}

// Calculate USD value for a specific API key balance
function calculateValueUSD(balance) {
  const tickerPrice = parseFloat(ticker.value.last) || 0;
  if (tickerPrice === 0) return '0.00';

  // Total LCX (base) = baseFree + baseUsed
  const totalBase = (balance.baseFree || 0) + (balance.baseUsed || 0);

  // Total USDC (quote) = quoteFree + quoteUsed
  const totalQuote = (balance.quoteFree || 0) + (balance.quoteUsed || 0);

  // Value in USD = (LCX × ticker price) + USDC
  const valueUSD = (totalBase * tickerPrice) + totalQuote;

  return valueUSD.toFixed(2);
}

// Calculate total USD value for all API keys
function calculateTotalValueUSD() {
  const tickerPrice = parseFloat(ticker.value.last) || 0;
  if (tickerPrice === 0) return '0.00';

  // Total LCX (base) from all APIs
  const totalBase = parseFloat(baseBalance.value) + parseFloat(baseBalanceUsed.value);

  // Total USDC (quote) from all APIs
  const totalQuote = parseFloat(quoteBalance.value) + parseFloat(quoteBalanceUsed.value);

  // Value in USD = (total LCX × ticker price) + total USDC
  const valueUSD = (totalBase * tickerPrice) + totalQuote;

  return valueUSD.toFixed(2);
}

function cancelOrder(order) {
  // Implementarea funcționalității de anulare a comenzii
}

let refreshInterval;

function startAutoRefresh() {
  refreshInterval = setInterval(fetchOrdersPooling, 300000);
}

// Actualizarea valorilor breakgive și brakegivenPrice atunci când priceTicker se schimbă
watch(priceTicker, () => {
  calculateBreakgive();
  calculateBrakegivenPrice();
});

// ============== CALENDAR & SNAPSHOTS FUNCTIONS ==============

// Load snapshots from localStorage
function loadSnapshots() {
  const key = `balanceSnapshots_${currentExchange.value}_${currentSymbol.value}`;
  console.log('🔑 Loading snapshots with key:', key);

  const saved = localStorage.getItem(key);
  console.log('💾 LocalStorage data:', saved);

  if (saved) {
    try {
      snapshots.value = JSON.parse(saved);
      console.log('✅ Snapshots loaded:', snapshots.value.length, 'items');
      console.log('📋 Snapshots data:', snapshots.value);
    } catch (error) {
      console.error('❌ Error parsing snapshots:', error);
      snapshots.value = [];
    }
  } else {
    console.log('⚠️ No snapshots found in localStorage');
    snapshots.value = [];
  }
}

// Save snapshot
function saveSnapshot() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Check how many snapshots exist for today
  const todaySnapshots = snapshots.value.filter(s => s.date === today);

  if (todaySnapshots.length >= 30) {
    alert(`⚠️ Maximum limit reached!\nYou can only save up to 30 snapshots per day.\nToday: ${todaySnapshots.length}/30\n\nPlease delete old snapshots to save new ones.`);
    return;
  }

  // Cooldown check: prevent saving within 3 seconds
  const timeSinceLastSave = now.getTime() - lastSnapshotTime.value;
  if (timeSinceLastSave < 3000) {
    const waitTime = Math.ceil((3000 - timeSinceLastSave) / 1000);
    alert(`⏱️ Please wait ${waitTime} second(s) before saving again.`);
    return;
  }

  // Build detailed snapshot per API key with Free, Used, Total AND ORDERS
  const detailedApiKeyBalances = {};
  const detailedApiKeyOrders = {};

  for (const apiKey of selectedApiKeys.value) {
    const balance = apiKeyBalances.value[apiKey];
    if (balance) {
      detailedApiKeyBalances[apiKey] = {
        baseFree: balance.baseFree,
        baseUsed: balance.baseUsed,
        baseTotal: balance.baseFree + balance.baseUsed,
        quoteFree: balance.quoteFree,
        quoteUsed: balance.quoteUsed,
        quoteTotal: balance.quoteFree + balance.quoteUsed,
        color: apiKeyColors.value[apiKey]  // Save color too
      };
    }

    // Save ORDERS data per API key (BUY + SELL)
    const apiKeyBuyOrders = getOrdersByApiAndSide(apiKey, 'buy');
    const apiKeySellOrders = getOrdersByApiAndSide(apiKey, 'sell');

    detailedApiKeyOrders[apiKey] = {
      buy: {
        count: apiKeyBuyOrders.length,
        avgPrice: parseFloat(calculateAveragePrice(apiKeyBuyOrders)),
        totalQty: calculateTotalQuantity(apiKeyBuyOrders),
        totalCost: parseFloat(calculateTotalCost(apiKeyBuyOrders))
      },
      sell: {
        count: apiKeySellOrders.length,
        avgPrice: parseFloat(calculateAveragePrice(apiKeySellOrders)),
        totalQty: calculateTotalQuantity(apiKeySellOrders),
        totalCost: parseFloat(calculateTotalCost(apiKeySellOrders))
      },
      color: apiKeyColors.value[apiKey]
    };
  }

  const snapshot = {
    id: `${now.getTime()}`,
    date: today,
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: now.getTime(),

    // Totals
    baseFreeTotal: parseFloat(baseBalance.value),
    baseUsedTotal: parseFloat(baseBalanceUsed.value),
    baseGrandTotal: parseFloat(baseBalance.value) + parseFloat(baseBalanceUsed.value),
    quoteFreeTotal: parseFloat(quoteBalance.value),
    quoteUsedTotal: parseFloat(quoteBalanceUsed.value),
    quoteGrandTotal: parseFloat(quoteBalance.value) + parseFloat(quoteBalanceUsed.value),

    // Orders - GRAND TOTAL
    totalGrids: buyOrders.value.length + sellOrders.value.length,
    buyOrdersCount: buyOrders.value.length,
    sellOrdersCount: sellOrders.value.length,
    buyOrdersAvgPrice: parseFloat(calculateAveragePrice(buyOrders.value)),
    sellOrdersAvgPrice: parseFloat(calculateAveragePrice(sellOrders.value)),
    buyOrdersTotalQty: calculateTotalQuantity(buyOrders.value),
    sellOrdersTotalQty: calculateTotalQuantity(sellOrders.value),
    buyOrdersTotalCost: parseFloat(calculateTotalCost(buyOrders.value)),
    sellOrdersTotalCost: parseFloat(calculateTotalCost(sellOrders.value)),

    // API Keys details - BALANCES
    apiKeys: [...selectedApiKeys.value],
    apiKeyBalances: detailedApiKeyBalances,

    // API Keys details - ORDERS (NEW!)
    apiKeyOrders: detailedApiKeyOrders,

    // Ticker Price (current market price)
    tickerPrice: parseFloat(ticker.value.last) || 0,

    // Exchange & Symbol
    exchange: currentExchange.value,
    symbol: currentSymbol.value
  };

  snapshots.value.push(snapshot);
  localStorage.setItem(`balanceSnapshots_${currentExchange.value}_${currentSymbol.value}`, JSON.stringify(snapshots.value));

  // Update last snapshot time
  lastSnapshotTime.value = now.getTime();

  generateCalendar();

  // Show notification
  const newTodayCount = todaySnapshots.length + 1;
  alert(`✅ Snapshot saved!\nToday: ${newTodayCount}/30\nTotal: ${snapshots.value.length}\nAPIs: ${selectedApiKeys.value.join(', ')}`);
}

// Generate calendar for current month
function generateCalendar() {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weeks = [];
  let currentWeek = [];

  // Fill previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    currentWeek.push({
      date: new Date(year, month - 1, day).toISOString().split('T')[0],
      dayOfMonth: day,
      isCurrentMonth: false,
      hasSnapshot: false,
      isToday: false
    });
  }

  // Fill current month days
  const today = new Date().toISOString().split('T')[0];
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const hasSnapshot = snapshots.value.some(s => s.date === dateStr);

    currentWeek.push({
      date: dateStr,
      dayOfMonth: day,
      isCurrentMonth: true,
      hasSnapshot,
      isToday: dateStr === today
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill next month days
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(year, month + 1, nextMonthDay).toISOString().split('T')[0],
        dayOfMonth: nextMonthDay,
        isCurrentMonth: false,
        hasSnapshot: false,
        isToday: false
      });
      nextMonthDay++;
    }
    weeks.push(currentWeek);
  }

  calendarWeeks.value = weeks;
}

// Navigate to previous month
function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
  generateCalendar();
}

// Navigate to next month
function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  generateCalendar();
}

// Helper methods for table-based calendar
function getCellDate(weekIndex, dayIndex) {
  const cellIndex = (weekIndex - 1) * 7 + (dayIndex - 1);
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const cellDate = new Date(startDate);
  cellDate.setDate(cellDate.getDate() + cellIndex);

  return cellDate.getDate();
}

function getCellDateStr(weekIndex, dayIndex) {
  const cellIndex = (weekIndex - 1) * 7 + (dayIndex - 1);
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const cellDate = new Date(startDate);
  cellDate.setDate(cellDate.getDate() + cellIndex);

  return cellDate.toISOString().split('T')[0];
}

function cellHasSnapshots(weekIndex, dayIndex) {
  const dateStr = getCellDateStr(weekIndex, dayIndex);
  return snapshots.value.some(s => s.date === dateStr);
}

function isCellCurrentMonth(weekIndex, dayIndex) {
  const cellIndex = (weekIndex - 1) * 7 + (dayIndex - 1);
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const cellDate = new Date(startDate);
  cellDate.setDate(cellDate.getDate() + cellIndex);

  return cellDate.getMonth() === month;
}

function isCellToday(weekIndex, dayIndex) {
  const dateStr = getCellDateStr(weekIndex, dayIndex);
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function getCellStyle(weekIndex, dayIndex) {
  const isCurrentMonth = isCellCurrentMonth(weekIndex, dayIndex);
  const hasSnapshots = cellHasSnapshots(weekIndex, dayIndex);
  const isToday = isCellToday(weekIndex, dayIndex);

  let background = '#1a1a1a';
  let color = '#aaa';

  if (isCurrentMonth) {
    if (hasSnapshots) {
      background = '#1a4d1a'; // green background for days with snapshots
      color = '#10eb04';
    } else {
      color = '#aaa';
    }
  } else {
    color = '#666'; // gray for days outside current month
  }

  if (isToday) {
    background = '#1a2a4d'; // blue background for today
    color = '#4d9fff';
  }

  return {
    background,
    color
  };
}

function selectCalendarCell(weekIndex, dayIndex) {
  const dateStr = getCellDateStr(weekIndex, dayIndex);
  selectDate(dateStr);
}

// Helper function to calculate percentage change
function calculatePercentageChange(current, previous) {
  // If previous is 0 or very small (less than 0.01), return null to show "-"
  if (!previous || Math.abs(previous) < 0.01) {
    return null;
  }

  const change = ((current - previous) / previous) * 100;
  return change;
}

// Helper function to format percentage display
function formatPercentage(current, previous) {
  const pct = calculatePercentageChange(current, previous);

  if (pct === null) {
    return '-';
  }

  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

// Select a date and show snapshots for that date
function selectDate(dateStr) {
  console.log('📅 Selected date:', dateStr);
  console.log('📊 Total snapshots:', snapshots.value.length);
  console.log('📋 All snapshots:', snapshots.value);

  selectedDate.value = dateStr;
  selectedDateSnapshots.value = snapshots.value.filter(s => s.date === dateStr);

  console.log('✅ Snapshots for this date:', selectedDateSnapshots.value.length);
  console.log('📄 Details:', selectedDateSnapshots.value);
}

// Delete a snapshot
function deleteSnapshot(snapshotId) {
  if (confirm('Are you sure you want to delete this snapshot?')) {
    snapshots.value = snapshots.value.filter(s => s.id !== snapshotId);
    localStorage.setItem(`balanceSnapshots_${currentExchange.value}_${currentSymbol.value}`, JSON.stringify(snapshots.value));

    // Refresh selected date snapshots
    if (selectedDate.value) {
      selectedDateSnapshots.value = snapshots.value.filter(s => s.date === selectedDate.value);
    }

    generateCalendar();

    alert(`✅ Snapshot deleted! Remaining: ${snapshots.value.length}`);
  }
}

// Reset ALL snapshots
function resetAllSnapshots() {
  if (confirm(`⚠️ WARNING!\n\nAre you sure you want to DELETE ALL ${snapshots.value.length} snapshots?\n\nThis action CANNOT be undone!`)) {
    snapshots.value = [];
    localStorage.removeItem(`balanceSnapshots_${currentExchange.value}_${currentSymbol.value}`);
    selectedDate.value = null;
    selectedDateSnapshots.value = [];
    expandedSnapshotId.value = null;
    generateCalendar();
    alert('✅ All snapshots have been deleted!');
  }
}

// Toggle snapshot details (expand/collapse)
function toggleSnapshotDetails(snapshotId) {
  if (expandedSnapshotId.value === snapshotId) {
    expandedSnapshotId.value = null; // Collapse if already expanded
  } else {
    expandedSnapshotId.value = snapshotId; // Expand
  }
}

// Watch for changes in snapshots to regenerate calendar
watch(snapshots, () => {
  generateCalendar();
}, { deep: true });

</script>


<style scoped>
/* Stiluri generale pentru tabele */
.buy-table{
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #0a2e01; /* Culoare de fundal pentru tabele */
  border-radius: 10px; /* Rotunjirea marginilor tabelei */
  box-shadow: 0 0 20px rgba(189, 236, 59, 0.904); /* Umbra */
}
.sell-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #420202; /* Culoare de fundal pentru tabele */
  border-radius: 10px; /* Rotunjirea marginilor tabelei */
  box-shadow: 0 0 20px rgba(189, 236, 59, 0.904); /* Umbra */
}

/* Stiluri pentru antetul tabelei */
.buy-table th{
  padding: 10px;
  text-align: left;
  background-color: #3498db; /* Culoare de fundal pentru antet */
  color: #fff; /* Culoare text antet */
  border-radius: 10px 10px 0 0; /* Rotunjirea marginilor antetului */
}

.sell-table th {
  padding: 10px;
  text-align: left;
  background-color: #3498db; /* Culoare de fundal pentru antet */
  color: #fff; /* Culoare text antet */
  border-radius: 10px 10px 0 0; /* Rotunjirea marginilor antetului */
}

/* Stiluri pentru celule */
.buy-table td,
.sell-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd; /* Delimitare între rânduri */
}

/* Stiluri pentru ultimul rând */
.buy-table tr:last-child td,
.sell-table tr:last-child td {
  border-bottom: none; /* Eliminarea delimitării la ultimul rând */
  border-radius: 0 0 10px 10px; /* Rotunjirea marginilor la ultimul rând */
}

/* Stiluri pentru textul din celule */
.buy-orders,
.sell-orders,
.average-price,
.total-quantity,
.total-cost {
  font-size: 11px;
  font-weight: bold;
}



.average-price {
  color: #27ae60; /* Culoare pentru prețul mediu */
}

.total-quantity {
  color: #f39c12; /* Culoare pentru cantitatea totală */
}

.total-cost {
  color: #9b59b6; /* Culoare pentru costul total */
}




/* Stilurile pentru div-ul care conține tabelele */
div {
  margin-bottom: 20px; /* Spațiu între tabele */
}



/* Etichete pentru Buy Orders */
.buy-label {
  color: #1e90ff; /* Culoare pentru etichetele Buy Orders */
}

/* Etichete pentru Sell Orders */
.sell-label {
  color: #e74c3c; /* Culoare pentru etichetele Sell Orders */
}

.balance-section {
  display: inline-block; /* Afișează secțiunile de balanță pe aceeași linie */
  vertical-align: top; /* Aliniază secțiunile pe partea de sus a containerului */
  margin-right: 20px; /* Adaugă un spațiu între tabele */
}

/* Stilurile pentru etichetele de balanță */
.balance-label {
  font-weight: bold; /* Font bold pentru etichete */
}

/* Stilurile pentru inputurile de balanță */
.balance-input {
  width: 100px; /* Lățime fixă pentru inputuri */
}

/* Stilurile pentru butonul de salvare */
.balance-button {
  background-color: #4caf50; /* Culoare de fundal verde */
  color: white; /* Text alb */
  border: none; /* Fără bordură */
  padding: 8px 16px; /* Spațiere internă */
  text-align: center; /* Aliniere text la centru */
  text-decoration: none; /* Fără subliniere */
  display: inline-block; /* Afișare ca bloc */
  font-size: 14px; /* Dimensiune font */
  margin-top: 10px; /* Spațiu de sus */
}

/* Stilurile pentru balanța totală */
.quote-balance,
.quote-total,
.base-balance,
.base-total {
  font-weight: bold; /* Font bold */
}

/* Stilurile pentru fiecare tabel */
.balance-table {
  border-collapse: collapse; /* Colapsare bordură */
  width: 200px; /* Lățime fixă pentru tabele */
}

/* Stilurile pentru celulele tabelului */
.balance-table td {
  padding: 8px; /* Spațiere internă */
  border: 1px solid #ddd; /* Bordură subțire */
  text-align: left; /* Aliniere text la stânga */
}

/* Stilurile pentru antetul tabelului */
.balance-table th {
  padding-top: 12px; /* Spațiere de sus pentru antet */
  padding-bottom: 12px; /* Spațiere de jos pentru antet */
  background-color: #4caf50; /* Culoare de fundal verde pentru antet */
  color: white; /* Text alb pentru antet */
  border: 1px solid #ddd; /* Bordură subțire */
  text-align: left; /* Aliniere text la stânga */
  padding: 8px; /* Spațiere internă */
}

/* Stilurile pentru bara de instrumente */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  background-color: #0c0faf; /* Culoare de fundal pentru bara */
  padding: 5px;
  border-radius: 10px; /* Colțuri rotunjite */
}

/* Stilurile pentru textul din bara de instrumente */
.buy-text {
  color: #2ecc71; /* Culoare text pentru "Buy" */
  font-weight: bold;
}

.sell-text {
  color: #e74c3c; /* Culoare text pentru "Sell" */
  font-weight: bold;
}

/* Stilurile pentru fiecare element de text */
.buy-orders {
  color: #f39c12; /* Culoare pentru "Total Buy Orders" */
}

.buy-average {
  color: #9b59b6; /* Culoare pentru "Average Price" */
}

.buy-quantity {
  color: #1abc9c; /* Culoare pentru "Total Quantity" */
}

.buy-cost {
  color: #3498db; /* Culoare pentru "Total Cost" */
}

.sell-orders {
  color: #d35400; /* Culoare pentru "Total Sell Orders" */
}

.sell-average {
  color: #30110d; /* Culoare pentru "Average Price" */
}

.sell-quantity {
  color: #7f8c8d; /* Culoare pentru "Total Quantity" */
}

.sell-cost {
  color: #16a085; /* Culoare pentru "Total Cost" */
}



  /* Stilurile pentru containerul de comenzi */
  .orders-container {
    display: flex;
    overflow-x: auto; /* Adăugăm scroll orizontal când conținutul depășește lățimea containerului */
    gap: 20px; /* Adăugăm un spațiu între fiecare tabel */
    flex-wrap: nowrap; /* Evităm trecerea pe mai multe linii */
    cursor: ns-resize; /* Cursor vertical (sus-jos) */
  }

  /* Stilurile pentru tabelele de comenzi */
  .order-table {
    border: 1px solid #ccc; /* Adăugăm un border pentru claritate */
    border-radius: 5px; /* Rotunjim marginile */
    overflow-y: auto; /* Adăugăm scroll vertical când conținutul depășește înălțimea containerului */
    width: 100%; /* Tabelul ocupă întreaga lățime a containerului */
    min-width: 300px; /* Lățimea minimă a tabelului */
    max-width: 600px; /* Lățimea maximă a tabelului */
    min-height: 200px; /* Înălțimea minimă a tabelului */
    max-height: 400px; /* Înălțimea maximă a tabelului */
  }
/* Culorile pentru fiecare element de text */
.quote-balance {
  color: #3498db; /* Culoare pentru "Free {{ quote }} : " */
}

.quote-total {
  color: #3498db; /* Culoare pentru "Total {{ quote }} : " */
}

.base-balance {
  color: #e67e22; /* Culoare pentru "Free {{ base }} : " */
}

.base-total {
  color: #e67e22; /* Culoare pentru "Total {{ base }} : " */
}



/* Culori pentru titlurile secțiunilor Buy și Sell */
.buy-heading {
  color: #058f43; /* Culoare pentru titlurile secțiunii Buy */
}

.sell-heading {
  color: #e74c3c; /* Culoare pentru titlurile secțiunii Sell */
}

/* Culori și dimensiuni pentru antetul tabelului Buy */
.buy-symbol, .buy-price, .buy-amount, .buy-inusd, .buy-filled, .buy-remaining, .buy-actions {
  color: #058f43; /* Culori pentru antetul tabelului Buy */
  font-size: 12px; /* Dimensiunea fontului */
}

/* Culori și dimensiuni pentru antetul tabelului Sell */
.sell-symbol, .sell-price, .sell-amount, .sell-inusd, .sell-filled, .sell-remaining, .sell-actions {
  color: #e74c3c; /* Culori pentru antetul tabelului Sell */
  font-size: 12px; /* Dimensiunea fontului */
}


/* Culori pentru butoanele de anulare a comenzii din tabelul Buy */
.buy-cancel-btn {
  background-color: #3498db;
  color: #fff;
}

/* Culori pentru butoanele de anulare a comenzii din tabelul Sell */
.sell-cancel-btn {
  background-color: #e74c3c;
  color: #fff;
}



</style>

