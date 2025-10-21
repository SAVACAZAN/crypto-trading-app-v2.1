<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">

    <!-- Card: ORDER SIZE DISTRIBUTION -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #9b59b6;">
      <div style="color: #9b59b6; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📊 ORDER SIZE DISTRIBUTION</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Distribution by order value ranges</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 7px; margin-top: 6px;">
        <thead>
          <tr style="background: #0f0f0f; border-bottom: 1px solid #444;">
            <th style="padding: 3px; text-align: left; color: #9b59b6;">Range</th>
            <th style="padding: 3px; text-align: center; color: #888;">Count</th>
            <th style="padding: 3px; text-align: right; color: #888;">Total</th>
            <th style="padding: 3px; text-align: right; color: #888;">%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(range, i) in orderSizeDistribution" :key="i" style="border-bottom: 1px solid #2a2a2a;">
            <td style="padding: 3px; color: #9b59b6; font-weight: 600;">{{ range.label }}</td>
            <td style="padding: 3px; text-align: center; color: #888;">{{ range.count }}</td>
            <td style="padding: 3px; text-align: right; color: #888;">${{ formatNumber(range.total.toFixed(2)) }}</td>
            <td style="padding: 3px; text-align: right; color: #9b59b6;">{{ range.percentage.toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Card: PEAK TRADING TIMES -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e91e63;">
      <div style="color: #e91e63; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⏰ PEAK TRADING TIMES</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Top 10 most active trading hours</div>

      <div v-for="(peak, i) in peakTradingTimes.slice(0, 10)" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #e91e63; font-weight: 600;">{{ i + 1 }}. {{ peak.hour }}:00</span>
          <span style="color: #888;">{{ peak.count }} orders</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2px;">
          <span style="color: #20b2aa;">Buy: {{ peak.buy }}</span>
          <span style="color: #cd5c5c;">Sell: {{ peak.sell }}</span>
          <span style="color: #ffd700;">${{ formatNumber(peak.cost.toFixed(2)) }}</span>
        </div>
      </div>
    </div>

    <!-- Card: MONTHLY COMPARISON -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #3498db;">
      <div style="color: #3498db; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📅 MONTHLY COMPARISON</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Trading activity by month</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 7px; margin-top: 6px;">
        <thead>
          <tr style="background: #0f0f0f; border-bottom: 1px solid #444;">
            <th style="padding: 3px; text-align: left; color: #3498db;">Month</th>
            <th style="padding: 3px; text-align: center; color: #20b2aa;">Buy</th>
            <th style="padding: 3px; text-align: center; color: #cd5c5c;">Sell</th>
            <th style="padding: 3px; text-align: right; color: #888;">Total</th>
            <th style="padding: 3px; text-align: right; color: #ffd700;">Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(month, i) in monthlyComparison.slice(0, showMoreMonths ? monthlyComparison.length : 6)" :key="i" style="border-bottom: 1px solid #2a2a2a;">
            <td style="padding: 3px; color: #3498db; font-weight: 600;">{{ month.month }}</td>
            <td style="padding: 3px; text-align: center; color: #20b2aa;">{{ month.buy }}</td>
            <td style="padding: 3px; text-align: center; color: #cd5c5c;">{{ month.sell }}</td>
            <td style="padding: 3px; text-align: right; color: #888;">{{ month.count }}</td>
            <td style="padding: 3px; text-align: right; color: #ffd700;">${{ formatNumber(month.cost.toFixed(2)) }}</td>
          </tr>
        </tbody>
      </table>

      <button v-if="monthlyComparison.length > 6" @click="showMoreMonths = !showMoreMonths" style="font-size: 7px; color: #3498db; background: transparent; border: 1px solid #3498db; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
        {{ showMoreMonths ? 'Show Less ▲' : `Show More ▼ (${monthlyComparison.length - 6} more)` }}
      </button>
    </div>

    <!-- Card 4: ORDER FREQUENCY PER API KEY -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e74c3c;">
      <div style="color: #e74c3c; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔢 ORDER FREQUENCY PER API</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Orders per API key</div>
      <div v-for="(api, i) in orderFrequencyPerApi" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between;">
          <span :style="`color: ${apiKeyColors[api.apiKey]}; font-weight: 600;`">{{ api.apiKey }}</span>
          <span style="color: #e74c3c;">{{ api.count }} orders</span>
        </div>
        <div style="margin-top: 2px; font-size: 6px;">
          <span style="color: #20b2aa;">Buy: {{ api.buy }}</span> |
          <span style="color: #cd5c5c;">Sell: {{ api.sell }}</span> |
          <span style="color: #ffd700;">${{ formatNumber(api.cost.toFixed(2)) }}</span>
        </div>
      </div>
    </div>

    <!-- Card 5: TRADING SESSIONS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #f39c12;">
      <div style="color: #f39c12; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🌅 TRADING SESSIONS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Activity by time of day</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 7px; margin-top: 6px;">
        <thead>
          <tr style="background: #0f0f0f; border-bottom: 1px solid #444;">
            <th style="padding: 3px; text-align: left; color: #f39c12;">Session</th>
            <th style="padding: 3px; text-align: center; color: #888;">Orders</th>
            <th style="padding: 3px; text-align: right; color: #888;">%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(session, i) in tradingSessions" :key="i" style="border-bottom: 1px solid #2a2a2a;">
            <td style="padding: 3px; color: #f39c12; font-weight: 600;">{{ session.name }}</td>
            <td style="padding: 3px; text-align: center; color: #888;">{{ session.count }}</td>
            <td style="padding: 3px; text-align: right; color: #f39c12;">{{ session.percentage.toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Card 6: DAY OF WEEK ANALYSIS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #16a085;">
      <div style="color: #16a085; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📆 DAY OF WEEK ANALYSIS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Trading patterns by day</div>
      <div v-for="(day, i) in dayOfWeekAnalysis" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #16a085; font-weight: 600;">{{ day.day }}</span>
          <span style="color: #888;">{{ day.count }} orders</span>
        </div>
        <div style="margin-top: 2px; font-size: 6px; display: flex; justify-content: space-between;">
          <span style="color: #20b2aa;">Buy: {{ day.buy }}</span>
          <span style="color: #cd5c5c;">Sell: {{ day.sell }}</span>
          <span style="color: #16a085;">{{ day.percentage.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- Card 7: WEEKEND VS WEEKDAY -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #8e44ad;">
      <div style="color: #8e44ad; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📊 WEEKEND VS WEEKDAY</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Trading comparison</div>
      <div style="margin-top: 6px;">
        <div v-for="(item, i) in weekendVsWeekday" :key="i" style="font-size: 7px; margin-bottom: 4px; padding: 4px; background: #0f0f0f; border-radius: 3px;">
          <div style="color: #8e44ad; font-weight: 600; margin-bottom: 2px;">{{ item.label }}</div>
          <div style="display: flex; justify-content: space-between; font-size: 6px;">
            <span style="color: #888;">Orders: {{ item.count }}</span>
            <span style="color: #ffd700;">Cost: ${{ formatNumber(item.cost.toFixed(2)) }}</span>
          </div>
          <div style="font-size: 6px; margin-top: 2px;">
            <span style="color: #20b2aa;">Buy: {{ item.buy }}</span> |
            <span style="color: #cd5c5c;">Sell: {{ item.sell }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 8: BUY/SELL RATIO PER API -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #27ae60;">
      <div style="color: #27ae60; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⚖️ BUY/SELL RATIO PER API</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Trading bias by API key</div>
      <div v-for="(api, i) in buySellRatioPerApi" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span :style="`color: ${apiKeyColors[api.apiKey]}; font-weight: 600;`">{{ api.apiKey }}</span>
          <span style="color: #27ae60;">Ratio: {{ api.ratio }}</span>
        </div>
        <div style="font-size: 6px; color: #888;">
          <span style="color: #20b2aa;">Buy: {{ api.buyPercent }}%</span> |
          <span style="color: #cd5c5c;">Sell: {{ api.sellPercent }}%</span>
        </div>
      </div>
    </div>

    <!-- Card 9: LARGEST SINGLE ORDERS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #c0392b;">
      <div style="color: #c0392b; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💎 TOP 10 LARGEST ORDERS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Biggest single orders by cost</div>
      <div v-for="(order, i) in largestOrders.slice(0, 10)" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">{{ i + 1 }}.</span>
          <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 600;`">{{ order.side.toUpperCase() }}</span>
          <span style="color: #c0392b; font-weight: 600;">${{ formatNumber(order.cost.toFixed(2)) }}</span>
        </div>
        <div style="font-size: 6px; color: #888; margin-top: 1px;">
          <span :style="`color: ${apiKeyColors[order.apiKeyName]};`">{{ order.apiKeyName }}</span> -
          {{ formatNumber(order.amount.toFixed(2)) }} @ ${{ order.price.toFixed(4) }}
        </div>
      </div>
    </div>

    <!-- Card 10: SMALLEST SINGLE ORDERS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #95a5a6;">
      <div style="color: #95a5a6; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔬 TOP 10 SMALLEST ORDERS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Smallest single orders by cost</div>
      <div v-for="(order, i) in smallestOrders.slice(0, 10)" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">{{ i + 1 }}.</span>
          <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 600;`">{{ order.side.toUpperCase() }}</span>
          <span style="color: #95a5a6; font-weight: 600;">${{ formatNumber(order.cost.toFixed(2)) }}</span>
        </div>
        <div style="font-size: 6px; color: #888; margin-top: 1px;">
          <span :style="`color: ${apiKeyColors[order.apiKeyName]};`">{{ order.apiKeyName }}</span> -
          {{ formatNumber(order.amount.toFixed(2)) }} @ ${{ order.price.toFixed(4) }}
        </div>
      </div>
    </div>

    <!-- Card 11: MOST ACTIVE TRADING DAYS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #d35400;">
      <div style="color: #d35400; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔥 TOP 10 MOST ACTIVE DAYS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Days with most orders</div>
      <div v-for="(day, i) in mostActiveDays.slice(0, 10)" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #d35400; font-weight: 600;">{{ day.date }}</span>
          <span style="color: #888;">{{ day.count }} orders</span>
        </div>
        <div style="font-size: 6px; margin-top: 2px; display: flex; justify-content: space-between;">
          <span style="color: #20b2aa;">Buy: {{ day.buy }}</span>
          <span style="color: #cd5c5c;">Sell: {{ day.sell }}</span>
          <span style="color: #ffd700;">${{ formatNumber(day.cost.toFixed(2)) }}</span>
        </div>
      </div>
    </div>

    <!-- Card 12: AVERAGE TRADE VELOCITY -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #2980b9;">
      <div style="color: #2980b9; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⚡ AVERAGE TRADE VELOCITY</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Orders per day</div>
      <div style="font-size: 8px; padding: 6px; background: #0f0f0f; border-radius: 3px; text-align: center;">
        <div style="color: #2980b9; font-weight: 600; font-size: 16px;">{{ tradeVelocity.ordersPerDay }}</div>
        <div style="color: #888; font-size: 7px; margin-top: 2px;">orders/day average</div>
      </div>
      <div style="margin-top: 6px; font-size: 7px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Total Days:</span>
          <span style="color: #2980b9;">{{ tradeVelocity.totalDays }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Total Orders:</span>
          <span style="color: #2980b9;">{{ tradeVelocity.totalOrders }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Peak Day:</span>
          <span style="color: #2980b9;">{{ tradeVelocity.peakDay }} orders</span>
        </div>
      </div>
    </div>

    <!-- Card 13: PRICE RANGE DISTRIBUTION -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e67e22;">
      <div style="color: #e67e22; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💹 PRICE RANGE DISTRIBUTION</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Orders by price levels</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 7px; margin-top: 6px;">
        <thead>
          <tr style="background: #0f0f0f; border-bottom: 1px solid #444;">
            <th style="padding: 3px; text-align: left; color: #e67e22;">Price Range</th>
            <th style="padding: 3px; text-align: center; color: #888;">Orders</th>
            <th style="padding: 3px; text-align: right; color: #888;">%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(range, i) in priceRangeDistribution" :key="i" style="border-bottom: 1px solid #2a2a2a;">
            <td style="padding: 3px; color: #e67e22; font-weight: 600;">{{ range.label }}</td>
            <td style="padding: 3px; text-align: center; color: #888;">{{ range.count }}</td>
            <td style="padding: 3px; text-align: right; color: #e67e22;">{{ range.percentage.toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Card 14: COST PER ORDER STATISTICS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #1abc9c;">
      <div style="color: #1abc9c; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💰 COST PER ORDER STATS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Order cost analysis</div>
      <div style="margin-top: 6px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Average Cost:</span>
          <span style="color: #1abc9c; font-weight: 600;">${{ formatNumber(costPerOrderStats.average.toFixed(2)) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Median Cost:</span>
          <span style="color: #1abc9c; font-weight: 600;">${{ formatNumber(costPerOrderStats.median.toFixed(2)) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Max Cost:</span>
          <span style="color: #20b2aa; font-weight: 600;">${{ formatNumber(costPerOrderStats.max.toFixed(2)) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Min Cost:</span>
          <span style="color: #cd5c5c; font-weight: 600;">${{ formatNumber(costPerOrderStats.min.toFixed(2)) }}</span>
        </div>
      </div>
    </div>

    <!-- Card 15: VOLUME CONCENTRATION -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #34495e;">
      <div style="color: #34495e; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📍 VOLUME CONCENTRATION</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Top APIs volume share</div>
      <div style="margin-top: 6px;">
        <div v-for="(item, i) in volumeConcentration" :key="i" style="font-size: 7px; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>
            <span style="color: #34495e;">{{ item.percentage.toFixed(1) }}%</span>
          </div>
          <div style="width: 100%; height: 4px; background: #0f0f0f; border-radius: 2px; overflow: hidden;">
            <div :style="`width: ${item.percentage}%; height: 100%; background: ${apiKeyColors[item.apiKey]};`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 16: RAPID TRADING DETECTION -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e84393;">
      <div style="color: #e84393; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⚡ RAPID TRADING DETECTION</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Orders within 60 seconds</div>
      <div style="font-size: 8px; padding: 6px; background: #0f0f0f; border-radius: 3px; text-align: center;">
        <div style="color: #e84393; font-weight: 600; font-size: 16px;">{{ rapidTrading.count }}</div>
        <div style="color: #888; font-size: 7px; margin-top: 2px;">rapid order pairs detected</div>
      </div>
      <div style="margin-top: 6px; font-size: 7px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Avg Time Gap:</span>
          <span style="color: #e84393;">{{ rapidTrading.avgGap }}s</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Fastest Gap:</span>
          <span style="color: #e84393;">{{ rapidTrading.minGap }}s</span>
        </div>
      </div>
    </div>

    <!-- Card 17: TRADING CONSISTENCY SCORE -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #6c5ce7;">
      <div style="color: #6c5ce7; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🎯 TRADING CONSISTENCY</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Daily trading regularity</div>
      <div style="font-size: 8px; padding: 6px; background: #0f0f0f; border-radius: 3px; text-align: center;">
        <div style="color: #6c5ce7; font-weight: 600; font-size: 16px;">{{ tradingConsistency.score }}%</div>
        <div style="color: #888; font-size: 7px; margin-top: 2px;">consistency score</div>
      </div>
      <div style="margin-top: 6px; font-size: 7px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Active Days:</span>
          <span style="color: #6c5ce7;">{{ tradingConsistency.activeDays }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Total Days:</span>
          <span style="color: #6c5ce7;">{{ tradingConsistency.totalDays }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Inactive Days:</span>
          <span style="color: #888;">{{ tradingConsistency.inactiveDays }}</span>
        </div>
      </div>
    </div>

    <!-- Card 18: AVERAGE TIME BETWEEN ORDERS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #00b894;">
      <div style="color: #00b894; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⏱️ AVG TIME BETWEEN ORDERS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Order frequency timing</div>
      <div style="font-size: 8px; padding: 6px; background: #0f0f0f; border-radius: 3px; text-align: center;">
        <div style="color: #00b894; font-weight: 600; font-size: 14px;">{{ avgTimeBetweenOrders.formatted }}</div>
        <div style="color: #888; font-size: 7px; margin-top: 2px;">average gap between orders</div>
      </div>
      <div style="margin-top: 6px; font-size: 7px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Total Orders:</span>
          <span style="color: #00b894;">{{ avgTimeBetweenOrders.totalOrders }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px; background: #0f0f0f; border-radius: 3px;">
          <span style="color: #888;">Time Span:</span>
          <span style="color: #00b894;">{{ avgTimeBetweenOrders.timeSpan }}</span>
        </div>
      </div>
    </div>

    <!-- Card 19: ORDER SIZE TRENDS -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #fd79a8;">
      <div style="color: #fd79a8; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📈 ORDER SIZE TRENDS</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Recent vs historical comparison</div>
      <div style="margin-top: 6px;">
        <div style="margin-bottom: 6px; padding: 4px; background: #0f0f0f; border-radius: 3px;">
          <div style="color: #fd79a8; font-size: 7px; font-weight: 600; margin-bottom: 2px;">Last 30 Days</div>
          <div style="font-size: 7px; display: flex; justify-content: space-between;">
            <span style="color: #888;">Avg Size:</span>
            <span style="color: #fd79a8;">{{ formatNumber(orderSizeTrends.recent.avgSize.toFixed(2)) }}</span>
          </div>
        </div>
        <div style="padding: 4px; background: #0f0f0f; border-radius: 3px;">
          <div style="color: #888; font-size: 7px; font-weight: 600; margin-bottom: 2px;">Historical</div>
          <div style="font-size: 7px; display: flex; justify-content: space-between;">
            <span style="color: #888;">Avg Size:</span>
            <span style="color: #888;">{{ formatNumber(orderSizeTrends.historical.avgSize.toFixed(2)) }}</span>
          </div>
        </div>
        <div style="margin-top: 6px; padding: 4px; background: #0f0f0f; border-radius: 3px; text-align: center;">
          <span style="font-size: 7px; color: #888;">Trend: </span>
          <span :style="`font-size: 7px; font-weight: 600; color: ${orderSizeTrends.trend > 0 ? '#20b2aa' : '#cd5c5c'};`">
            {{ orderSizeTrends.trend > 0 ? '↑' : '↓' }} {{ Math.abs(orderSizeTrends.trend).toFixed(1) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Card 20: LONG-TERM VS SHORT-TERM ACTIVITY -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #a29bfe;">
      <div style="color: #a29bfe; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📊 ACTIVITY COMPARISON</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Last 7 days vs Last 30 days</div>
      <div style="margin-top: 6px;">
        <div style="margin-bottom: 6px; padding: 4px; background: #0f0f0f; border-radius: 3px;">
          <div style="color: #a29bfe; font-size: 7px; font-weight: 600; margin-bottom: 2px;">Last 7 Days</div>
          <div style="font-size: 7px; display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #888;">Orders:</span>
            <span style="color: #a29bfe;">{{ activityComparison.last7Days.orders }}</span>
          </div>
          <div style="font-size: 7px; display: flex; justify-content: space-between;">
            <span style="color: #888;">Avg/Day:</span>
            <span style="color: #a29bfe;">{{ activityComparison.last7Days.avgPerDay }}</span>
          </div>
        </div>
        <div style="padding: 4px; background: #0f0f0f; border-radius: 3px;">
          <div style="color: #888; font-size: 7px; font-weight: 600; margin-bottom: 2px;">Last 30 Days</div>
          <div style="font-size: 7px; display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #888;">Orders:</span>
            <span style="color: #888;">{{ activityComparison.last30Days.orders }}</span>
          </div>
          <div style="font-size: 7px; display: flex; justify-content: space-between;">
            <span style="color: #888;">Avg/Day:</span>
            <span style="color: #888;">{{ activityComparison.last30Days.avgPerDay }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 21: ORDER CLUSTERING -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #fab1a0;">
      <div style="color: #fab1a0; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔗 ORDER CLUSTERING</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Consecutive order patterns</div>
      <div style="margin-top: 6px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Avg Cluster Size:</span>
          <span style="color: #fab1a0; font-weight: 600;">{{ orderClustering.avgClusterSize }} orders</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Max Cluster:</span>
          <span style="color: #fab1a0; font-weight: 600;">{{ orderClustering.maxCluster }} orders</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px; background: #0f0f0f; border-radius: 3px; font-size: 7px;">
          <span style="color: #888;">Total Clusters:</span>
          <span style="color: #fab1a0; font-weight: 600;">{{ orderClustering.totalClusters }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    required: true
  },
  selectedApiKeys: {
    type: Array,
    required: true
  },
  apiKeyColors: {
    type: Object,
    required: true
  }
});

const showMoreMonths = ref(false);

// Order Size Distribution
const orderSizeDistribution = computed(() => {
  const ranges = [
    { label: '< $100', min: 0, max: 100, count: 0, total: 0 },
    { label: '$100-$500', min: 100, max: 500, count: 0, total: 0 },
    { label: '$500-$1K', min: 500, max: 1000, count: 0, total: 0 },
    { label: '$1K-$5K', min: 1000, max: 5000, count: 0, total: 0 },
    { label: '$5K-$10K', min: 5000, max: 10000, count: 0, total: 0 },
    { label: '> $10K', min: 10000, max: Infinity, count: 0, total: 0 }
  ];

  props.allOrders.forEach(order => {
    const cost = order.cost || 0;
    const range = ranges.find(r => cost >= r.min && cost < r.max);
    if (range) {
      range.count++;
      range.total += cost;
    }
  });

  const totalOrders = props.allOrders.length;
  ranges.forEach(range => {
    range.percentage = totalOrders > 0 ? (range.count / totalOrders) * 100 : 0;
  });

  return ranges;
});

// Peak Trading Times
const peakTradingTimes = computed(() => {
  const hourStats = {};

  props.allOrders.forEach(order => {
    const hour = new Date(order.datetime).getHours();
    if (!hourStats[hour]) {
      hourStats[hour] = { hour, count: 0, buy: 0, sell: 0, cost: 0 };
    }
    hourStats[hour].count++;
    hourStats[hour].cost += order.cost || 0;
    if (order.side === 'buy') hourStats[hour].buy++;
    if (order.side === 'sell') hourStats[hour].sell++;
  });

  return Object.values(hourStats)
    .sort((a, b) => b.count - a.count);
});

// Monthly Comparison
const monthlyComparison = computed(() => {
  const monthStats = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  props.allOrders.forEach(order => {
    const date = new Date(order.datetime);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    if (!monthStats[monthKey]) {
      monthStats[monthKey] = { month: monthKey, count: 0, buy: 0, sell: 0, cost: 0 };
    }

    monthStats[monthKey].count++;
    monthStats[monthKey].cost += order.cost || 0;
    if (order.side === 'buy') monthStats[monthKey].buy++;
    if (order.side === 'sell') monthStats[monthKey].sell++;
  });

  return Object.values(monthStats)
    .sort((a, b) => {
      // Sort by year and month (most recent first)
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
      return monthNames.indexOf(monthB) - monthNames.indexOf(monthA);
    });
});

// Card 4: Order Frequency per API
const orderFrequencyPerApi = computed(() => {
  const apiStats = {};
  props.selectedApiKeys.forEach(apiKey => {
    const orders = props.allOrders.filter(o => o.apiKeyName === apiKey);
    apiStats[apiKey] = {
      apiKey,
      count: orders.length,
      buy: orders.filter(o => o.side === 'buy').length,
      sell: orders.filter(o => o.side === 'sell').length,
      cost: orders.reduce((sum, o) => sum + (o.cost || 0), 0)
    };
  });
  return Object.values(apiStats).sort((a, b) => b.count - a.count);
});

// Card 5: Trading Sessions
const tradingSessions = computed(() => {
  const sessions = {
    'Morning (6-12)': { name: 'Morning (6-12)', count: 0, hours: [6, 7, 8, 9, 10, 11] },
    'Afternoon (12-18)': { name: 'Afternoon (12-18)', count: 0, hours: [12, 13, 14, 15, 16, 17] },
    'Evening (18-24)': { name: 'Evening (18-24)', count: 0, hours: [18, 19, 20, 21, 22, 23] },
    'Night (0-6)': { name: 'Night (0-6)', count: 0, hours: [0, 1, 2, 3, 4, 5] }
  };

  props.allOrders.forEach(order => {
    const hour = new Date(order.datetime).getHours();
    for (const session in sessions) {
      if (sessions[session].hours.includes(hour)) {
        sessions[session].count++;
      }
    }
  });

  const total = props.allOrders.length;
  return Object.values(sessions).map(s => ({
    ...s,
    percentage: total > 0 ? (s.count / total) * 100 : 0
  }));
});

// Card 6: Day of Week Analysis
const dayOfWeekAnalysis = computed(() => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayStats = days.map(day => ({ day, count: 0, buy: 0, sell: 0 }));

  props.allOrders.forEach(order => {
    const dayIndex = (new Date(order.datetime).getDay() + 6) % 7; // Monday = 0
    dayStats[dayIndex].count++;
    if (order.side === 'buy') dayStats[dayIndex].buy++;
    if (order.side === 'sell') dayStats[dayIndex].sell++;
  });

  const total = props.allOrders.length;
  return dayStats.map(d => ({ ...d, percentage: total > 0 ? (d.count / total) * 100 : 0 }));
});

// Card 7: Weekend vs Weekday
const weekendVsWeekday = computed(() => {
  const stats = {
    weekday: { label: 'Weekday', count: 0, buy: 0, sell: 0, cost: 0 },
    weekend: { label: 'Weekend', count: 0, buy: 0, sell: 0, cost: 0 }
  };

  props.allOrders.forEach(order => {
    const day = new Date(order.datetime).getDay();
    const isWeekend = day === 0 || day === 6;
    const type = isWeekend ? 'weekend' : 'weekday';
    stats[type].count++;
    stats[type].cost += order.cost || 0;
    if (order.side === 'buy') stats[type].buy++;
    if (order.side === 'sell') stats[type].sell++;
  });

  return [stats.weekday, stats.weekend];
});

// Card 8: Buy/Sell Ratio per API
const buySellRatioPerApi = computed(() => {
  const ratios = [];
  props.selectedApiKeys.forEach(apiKey => {
    const orders = props.allOrders.filter(o => o.apiKeyName === apiKey);
    const buy = orders.filter(o => o.side === 'buy').length;
    const sell = orders.filter(o => o.side === 'sell').length;
    const total = buy + sell;
    ratios.push({
      apiKey,
      ratio: total > 0 ? `${buy}:${sell}` : '0:0',
      buyPercent: total > 0 ? ((buy / total) * 100).toFixed(1) : 0,
      sellPercent: total > 0 ? ((sell / total) * 100).toFixed(1) : 0
    });
  });
  return ratios;
});

// Card 9: Largest Orders
const largestOrders = computed(() => {
  return [...props.allOrders]
    .filter(o => o.cost > 0)
    .sort((a, b) => b.cost - a.cost);
});

// Card 10: Smallest Orders
const smallestOrders = computed(() => {
  return [...props.allOrders]
    .filter(o => o.cost > 0)
    .sort((a, b) => a.cost - b.cost);
});

// Card 11: Most Active Days
const mostActiveDays = computed(() => {
  const dayStats = {};
  props.allOrders.forEach(order => {
    const date = new Date(order.datetime).toLocaleDateString('en-GB');
    if (!dayStats[date]) {
      dayStats[date] = { date, count: 0, buy: 0, sell: 0, cost: 0 };
    }
    dayStats[date].count++;
    dayStats[date].cost += order.cost || 0;
    if (order.side === 'buy') dayStats[date].buy++;
    if (order.side === 'sell') dayStats[date].sell++;
  });
  return Object.values(dayStats).sort((a, b) => b.count - a.count);
});

// Card 12: Trade Velocity
const tradeVelocity = computed(() => {
  if (props.allOrders.length === 0) {
    return { ordersPerDay: 0, totalDays: 0, totalOrders: 0, peakDay: 0 };
  }

  const dates = props.allOrders.map(o => new Date(o.datetime).toDateString());
  const uniqueDays = [...new Set(dates)].length;
  const dayStats = {};

  props.allOrders.forEach(order => {
    const date = new Date(order.datetime).toDateString();
    dayStats[date] = (dayStats[date] || 0) + 1;
  });

  const peakDay = Math.max(...Object.values(dayStats));

  return {
    ordersPerDay: Math.round(props.allOrders.length / uniqueDays),
    totalDays: uniqueDays,
    totalOrders: props.allOrders.length,
    peakDay
  };
});

// Card 13: Price Range Distribution
const priceRangeDistribution = computed(() => {
  const ranges = [
    { label: '< $0.10', min: 0, max: 0.10, count: 0 },
    { label: '$0.10-$0.15', min: 0.10, max: 0.15, count: 0 },
    { label: '$0.15-$0.20', min: 0.15, max: 0.20, count: 0 },
    { label: '$0.20-$0.25', min: 0.20, max: 0.25, count: 0 },
    { label: '$0.25-$0.30', min: 0.25, max: 0.30, count: 0 },
    { label: '> $0.30', min: 0.30, max: Infinity, count: 0 }
  ];

  props.allOrders.forEach(order => {
    const price = order.price || 0;
    const range = ranges.find(r => price >= r.min && price < r.max);
    if (range) range.count++;
  });

  const total = props.allOrders.length;
  return ranges.map(r => ({ ...r, percentage: total > 0 ? (r.count / total) * 100 : 0 }));
});

// Card 14: Cost Per Order Statistics
const costPerOrderStats = computed(() => {
  const costs = props.allOrders.map(o => o.cost || 0).filter(c => c > 0).sort((a, b) => a - b);
  if (costs.length === 0) {
    return { average: 0, median: 0, max: 0, min: 0 };
  }

  const sum = costs.reduce((a, b) => a + b, 0);
  const median = costs[Math.floor(costs.length / 2)];

  return {
    average: sum / costs.length,
    median,
    max: costs[costs.length - 1],
    min: costs[0]
  };
});

// Card 15: Volume Concentration
const volumeConcentration = computed(() => {
  const totalVolume = props.allOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const apiVolumes = [];

  props.selectedApiKeys.forEach(apiKey => {
    const volume = props.allOrders
      .filter(o => o.apiKeyName === apiKey)
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    apiVolumes.push({
      apiKey,
      volume,
      percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0
    });
  });

  return apiVolumes.sort((a, b) => b.percentage - a.percentage);
});

// Card 16: Rapid Trading Detection
const rapidTrading = computed(() => {
  const sorted = [...props.allOrders].sort((a, b) =>
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  let rapidPairs = 0;
  let totalGap = 0;
  let minGap = Infinity;

  for (let i = 1; i < sorted.length; i++) {
    const gap = (new Date(sorted[i].datetime).getTime() - new Date(sorted[i-1].datetime).getTime()) / 1000;
    if (gap <= 60) {
      rapidPairs++;
      totalGap += gap;
      if (gap < minGap) minGap = gap;
    }
  }

  return {
    count: rapidPairs,
    avgGap: rapidPairs > 0 ? (totalGap / rapidPairs).toFixed(1) : 0,
    minGap: minGap !== Infinity ? minGap.toFixed(1) : 0
  };
});

// Card 17: Trading Consistency
const tradingConsistency = computed(() => {
  if (props.allOrders.length === 0) {
    return { score: 0, activeDays: 0, totalDays: 0, inactiveDays: 0 };
  }

  const dates = props.allOrders.map(o => new Date(o.datetime).toDateString());
  const uniqueDays = new Set(dates);
  const activeDays = uniqueDays.size;

  const firstDate = new Date(Math.min(...props.allOrders.map(o => new Date(o.datetime).getTime())));
  const lastDate = new Date(Math.max(...props.allOrders.map(o => new Date(o.datetime).getTime())));
  const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

  return {
    score: totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0,
    activeDays,
    totalDays,
    inactiveDays: totalDays - activeDays
  };
});

// Card 18: Average Time Between Orders
const avgTimeBetweenOrders = computed(() => {
  if (props.allOrders.length < 2) {
    return { formatted: 'N/A', totalOrders: props.allOrders.length, timeSpan: 'N/A' };
  }

  const sorted = [...props.allOrders].sort((a, b) =>
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const first = new Date(sorted[0].datetime).getTime();
  const last = new Date(sorted[sorted.length - 1].datetime).getTime();
  const totalMs = last - first;
  const avgMs = totalMs / (sorted.length - 1);

  // Format average time
  const seconds = Math.floor(avgMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let formatted = '';
  if (days > 0) formatted = `${days}d ${hours % 24}h`;
  else if (hours > 0) formatted = `${hours}h ${minutes % 60}m`;
  else if (minutes > 0) formatted = `${minutes}m ${seconds % 60}s`;
  else formatted = `${seconds}s`;

  // Format time span
  const spanDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const timeSpan = spanDays > 0 ? `${spanDays} days` : `${Math.floor(totalMs / (1000 * 60 * 60))} hours`;

  return {
    formatted,
    totalOrders: sorted.length,
    timeSpan
  };
});

// Card 19: Order Size Trends
const orderSizeTrends = computed(() => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentOrders = props.allOrders.filter(o => new Date(o.datetime) >= thirtyDaysAgo);
  const historicalOrders = props.allOrders.filter(o => new Date(o.datetime) < thirtyDaysAgo);

  const recentAvg = recentOrders.length > 0
    ? recentOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / recentOrders.length
    : 0;
  const historicalAvg = historicalOrders.length > 0
    ? historicalOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / historicalOrders.length
    : 0;

  const trend = historicalAvg > 0 ? ((recentAvg - historicalAvg) / historicalAvg) * 100 : 0;

  return {
    recent: { avgSize: recentAvg },
    historical: { avgSize: historicalAvg },
    trend
  };
});

// Card 20: Activity Comparison
const activityComparison = computed(() => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const last7 = props.allOrders.filter(o => new Date(o.datetime) >= sevenDaysAgo);
  const last30 = props.allOrders.filter(o => new Date(o.datetime) >= thirtyDaysAgo);

  return {
    last7Days: {
      orders: last7.length,
      avgPerDay: Math.round(last7.length / 7)
    },
    last30Days: {
      orders: last30.length,
      avgPerDay: Math.round(last30.length / 30)
    }
  };
});

// Card 21: Order Clustering
const orderClustering = computed(() => {
  const sorted = [...props.allOrders].sort((a, b) =>
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const clusters = [];
  let currentCluster = 1;

  for (let i = 1; i < sorted.length; i++) {
    const gap = (new Date(sorted[i].datetime).getTime() - new Date(sorted[i-1].datetime).getTime()) / 1000;
    if (gap <= 300) { // 5 minutes
      currentCluster++;
    } else {
      if (currentCluster > 1) clusters.push(currentCluster);
      currentCluster = 1;
    }
  }
  if (currentCluster > 1) clusters.push(currentCluster);

  const avgClusterSize = clusters.length > 0
    ? Math.round(clusters.reduce((a, b) => a + b, 0) / clusters.length)
    : 0;
  const maxCluster = clusters.length > 0 ? Math.max(...clusters) : 0;

  return {
    avgClusterSize,
    maxCluster,
    totalClusters: clusters.length
  };
});

// Utility function
function formatNumber(num) {
  if (!num) return '0';
  const numStr = num.toString();
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
</script>
