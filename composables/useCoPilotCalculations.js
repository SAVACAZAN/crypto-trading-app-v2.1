/**
 * Co-Pilot Calculations Composable
 * Financial calculations, profit estimation, and order analysis
 */

import { ref, computed } from 'vue';

export function useCoPilotCalculations() {
  /**
   * Calculate total investment for grid orders
   */
  function calculateGridInvestment(lowerPrice, upperPrice, grids, amount, ordersSide = 'buyOrSell') {
    const lower = parseFloat(lowerPrice) || 0;
    const upper = parseFloat(upperPrice) || 0;
    const gridCount = parseInt(grids) || 0;
    const amt = parseFloat(amount) || 0;

    if (lower === 0 || upper === 0 || gridCount === 0 || amt === 0) {
      return { totalInvestment: 0, totalBase: 0, orders: [] };
    }

    const priceStep = (upper - lower) / (gridCount - 1);
    const orders = [];
    let totalInvestment = 0;
    let totalBase = 0;

    for (let i = 0; i < gridCount; i++) {
      const price = lower + (priceStep * i);

      // Determine order side
      let side = '';
      if (ordersSide === 'buyOrSell') {
        side = i < gridCount / 2 ? 'buy' : 'sell';
      } else if (ordersSide === 'buyOnly') {
        side = 'buy';
      } else if (ordersSide === 'sellOnly') {
        side = 'sell';
      }

      const orderValue = price * amt;

      orders.push({
        price: price.toFixed(6),
        amount: amt.toFixed(4),
        side,
        value: orderValue.toFixed(2),
      });

      if (side === 'buy') {
        totalInvestment += orderValue;
      } else {
        totalBase += amt;
      }
    }

    return {
      totalInvestment,
      totalBase,
      orders,
      buyOrders: orders.filter(o => o.side === 'buy').length,
      sellOrders: orders.filter(o => o.side === 'sell').length,
    };
  }

  /**
   * Calculate profit potential from filled orders
   */
  function calculateProfitPotential(buyOrders, sellOrders) {
    let totalBuyValue = 0;
    let totalBuyAmount = 0;
    let totalSellValue = 0;
    let totalSellAmount = 0;

    buyOrders.forEach(order => {
      const price = parseFloat(order.price) || 0;
      const amount = parseFloat(order.amount) || 0;
      totalBuyValue += price * amount;
      totalBuyAmount += amount;
    });

    sellOrders.forEach(order => {
      const price = parseFloat(order.price) || 0;
      const amount = parseFloat(order.amount) || 0;
      totalSellValue += price * amount;
      totalSellAmount += amount;
    });

    const avgBuyPrice = totalBuyAmount > 0 ? totalBuyValue / totalBuyAmount : 0;
    const avgSellPrice = totalSellAmount > 0 ? totalSellValue / totalSellAmount : 0;
    const profitPerUnit = avgSellPrice - avgBuyPrice;
    const minAmount = Math.min(totalBuyAmount, totalSellAmount);
    const estimatedProfit = profitPerUnit * minAmount;
    const profitPercentage = avgBuyPrice > 0 ? (profitPerUnit / avgBuyPrice) * 100 : 0;

    return {
      avgBuyPrice,
      avgSellPrice,
      estimatedProfit,
      profitPercentage,
      totalBuyValue,
      totalSellValue,
    };
  }

  /**
   * Calculate order fill percentage
   */
  function calculateFillPercentage(order) {
    if (!order || !order.amount || !order.filled) return 0;
    const amount = parseFloat(order.amount) || 0;
    const filled = parseFloat(order.filled) || 0;
    if (amount === 0) return 0;
    return ((filled / amount) * 100).toFixed(2);
  }

  /**
   * Calculate remaining amount
   */
  function calculateRemainingAmount(order) {
    if (!order || !order.amount || !order.filled) return 0;
    const amount = parseFloat(order.amount) || 0;
    const filled = parseFloat(order.filled) || 0;
    return (amount - filled).toFixed(6);
  }

  /**
   * Calculate order value in USDC
   */
  function calculateOrderValue(price, amount) {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return (p * a).toFixed(2);
  }

  /**
   * Calculate required balance for bot
   */
  function calculateRequiredBalance(orders, reservePercentage = 0.1) {
    const buyOrders = orders.filter(o => o.side === 'buy');
    const sellOrders = orders.filter(o => o.side === 'sell');

    let requiredQuote = 0; // For buy orders (USDC)
    let requiredBase = 0;  // For sell orders (BTC, ETH, etc.)

    buyOrders.forEach(order => {
      const price = parseFloat(order.price) || 0;
      const amount = parseFloat(order.amount) || 0;
      requiredQuote += price * amount;
    });

    sellOrders.forEach(order => {
      const amount = parseFloat(order.amount) || 0;
      requiredBase += amount;
    });

    // Add reserve buffer
    const quoteWithReserve = requiredQuote * (1 + reservePercentage);
    const baseWithReserve = requiredBase * (1 + reservePercentage);

    return {
      requiredQuote,
      requiredBase,
      quoteWithReserve,
      baseWithReserve,
      reservePercentage,
    };
  }

  /**
   * Calculate DCA average entry price
   */
  function calculateDCAAverage(orders) {
    if (!orders || orders.length === 0) return 0;

    let totalCost = 0;
    let totalAmount = 0;

    orders.forEach(order => {
      const price = parseFloat(order.price) || 0;
      const amount = parseFloat(order.amount) || 0;
      totalCost += price * amount;
      totalAmount += amount;
    });

    return totalAmount > 0 ? totalCost / totalAmount : 0;
  }

  /**
   * Calculate profit from current price
   */
  function calculateProfitFromCurrentPrice(avgEntryPrice, currentPrice, amount) {
    const entry = parseFloat(avgEntryPrice) || 0;
    const current = parseFloat(currentPrice) || 0;
    const amt = parseFloat(amount) || 0;

    if (entry === 0 || current === 0 || amt === 0) {
      return { profit: 0, percentage: 0 };
    }

    const priceChange = current - entry;
    const profit = priceChange * amt;
    const percentage = (priceChange / entry) * 100;

    return {
      profit: profit.toFixed(2),
      percentage: percentage.toFixed(2),
      unrealizedPnL: profit.toFixed(2),
    };
  }

  /**
   * Calculate spread between buy and sell
   */
  function calculateSpread(buyPrice, sellPrice) {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;

    if (buy === 0 || sell === 0) return { spread: 0, percentage: 0 };

    const spread = sell - buy;
    const percentage = (spread / buy) * 100;

    return {
      spread: spread.toFixed(6),
      percentage: percentage.toFixed(3),
    };
  }

  /**
   * Calculate Fibonacci levels
   */
  function calculateFibonacciLevels(high, low) {
    const h = parseFloat(high) || 0;
    const l = parseFloat(low) || 0;

    if (h === 0 || l === 0 || h <= l) {
      return [];
    }

    const diff = h - l;
    const levels = [
      { level: 0, price: h, name: '0% (High)' },
      { level: 0.236, price: h - (diff * 0.236), name: '23.6%' },
      { level: 0.382, price: h - (diff * 0.382), name: '38.2%' },
      { level: 0.5, price: h - (diff * 0.5), name: '50%' },
      { level: 0.618, price: h - (diff * 0.618), name: '61.8%' },
      { level: 0.786, price: h - (diff * 0.786), name: '78.6%' },
      { level: 1, price: l, name: '100% (Low)' },
    ];

    return levels.map(lvl => ({
      ...lvl,
      price: lvl.price.toFixed(6),
    }));
  }

  /**
   * Calculate ROI (Return on Investment)
   */
  function calculateROI(initialInvestment, currentValue) {
    const initial = parseFloat(initialInvestment) || 0;
    const current = parseFloat(currentValue) || 0;

    if (initial === 0) return 0;

    const roi = ((current - initial) / initial) * 100;
    return roi.toFixed(2);
  }

  /**
   * Calculate success rate from order history
   */
  function calculateSuccessRate(orders) {
    if (!orders || orders.length === 0) return 0;

    const profitableOrders = orders.filter(order => {
      const profit = parseFloat(order.profit) || 0;
      return profit > 0;
    });

    const rate = (profitableOrders.length / orders.length) * 100;
    return rate.toFixed(2);
  }

  /**
   * Calculate average profit per order
   */
  function calculateAverageProfit(orders) {
    if (!orders || orders.length === 0) return 0;

    const totalProfit = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.profit) || 0);
    }, 0);

    return (totalProfit / orders.length).toFixed(2);
  }

  /**
   * Calculate total fees
   */
  function calculateTotalFees(orders, feeRate = 0.001) {
    if (!orders || orders.length === 0) return 0;

    const totalFees = orders.reduce((sum, order) => {
      const price = parseFloat(order.price) || 0;
      const amount = parseFloat(order.amount) || 0;
      const orderValue = price * amount;
      return sum + (orderValue * feeRate);
    }, 0);

    return totalFees.toFixed(2);
  }

  /**
   * Format currency
   */
  function formatCurrency(value, decimals = 2) {
    const val = parseFloat(value) || 0;
    return val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * Format percentage
   */
  function formatPercentage(value, decimals = 2) {
    const val = parseFloat(value) || 0;
    const formatted = val.toFixed(decimals);
    return val >= 0 ? `+${formatted}%` : `${formatted}%`;
  }

  /**
   * Calculate price deviation percentage
   */
  function calculateDeviation(currentPrice, referencePrice) {
    const current = parseFloat(currentPrice) || 0;
    const reference = parseFloat(referencePrice) || 0;

    if (reference === 0) return 0;

    const deviation = ((current - reference) / reference) * 100;
    return deviation.toFixed(2);
  }

  return {
    // Core calculations
    calculateGridInvestment,
    calculateProfitPotential,
    calculateFillPercentage,
    calculateRemainingAmount,
    calculateOrderValue,
    calculateRequiredBalance,

    // DCA calculations
    calculateDCAAverage,
    calculateProfitFromCurrentPrice,

    // Spread & levels
    calculateSpread,
    calculateFibonacciLevels,

    // Performance metrics
    calculateROI,
    calculateSuccessRate,
    calculateAverageProfit,
    calculateTotalFees,

    // Utilities
    formatCurrency,
    formatPercentage,
    calculateDeviation,
  };
}

export default useCoPilotCalculations;
