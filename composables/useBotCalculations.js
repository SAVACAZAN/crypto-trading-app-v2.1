/**
 * Bot Calculations Composable
 * Centralized grid trading calculations for all bot types
 *
 * Provides reusable calculation functions for:
 * - Grid Bot (OneClick and standalone)
 * - DCA Bot
 * - Smart DCA Bot
 * - Fibonacci Bot
 * - Scalping Bot
 * - FrontRun Bot
 *
 * @returns {Object} Grid calculation functions
 */
export const useBotCalculations = () => {
  /**
   * Extract base currency from trading pair symbol
   * @param {string} symbol - Trading pair (e.g., "LCX/USDC", "BTC/USDC")
   * @returns {string} Base currency (e.g., "LCX", "BTC")
   */
  const getBaseCurrency = (symbol) => {
    if (!symbol) return '';
    return symbol.split('/')[0];
  };

  /**
   * Extract quote currency from trading pair symbol
   * @param {string} symbol - Trading pair (e.g., "LCX/USDC", "BTC/USDC")
   * @returns {string} Quote currency (e.g., "USDC")
   */
  const getQuoteCurrency = (symbol) => {
    if (!symbol) return '';
    return symbol.split('/')[1];
  };

  /**
   * Calculate all grid orders for a trading pair
   * Creates evenly-spaced buy orders across the price range
   * Supports incrementalPercent for progressive amounts
   *
   * @param {Object} pair - Trading pair configuration
   * @param {string} pair.symbol - Trading pair symbol
   * @param {number} pair.lowerPrice - Lower price boundary
   * @param {number} pair.upperPrice - Upper price boundary
   * @param {number} pair.amount - Amount per grid order (base amount)
   * @param {number} pair.grids - Number of grid orders
   * @param {string} pair.amountType - 'fixed' or 'incrementalPercent'
   * @param {number} pair.incrementalPercent - Percentage increase per order (default: 0)
   * @returns {Array} Array of order objects with price and amount
   *
   * @example
   * calculateGridOrders({
   *   symbol: 'LCX/USDC',
   *   lowerPrice: 0.075,
   *   upperPrice: 0.150,
   *   amount: 1.1,
   *   grids: 100,
   *   amountType: 'incrementalPercent',
   *   incrementalPercent: 1
   * })
   * // Returns 100 orders with progressive amounts
   */
  const calculateGridOrders = (pair) => {
    const lowerPrice = parseFloat(pair.lowerPrice) || 0;
    const upperPrice = parseFloat(pair.upperPrice) || 0;
    const grids = parseInt(pair.grids) || 10;
    const baseAmountUSD = parseFloat(pair.amount) || 1;
    const amountType = pair.amountType || 'fixed';
    const incrementalPercent = parseFloat(pair.incrementalPercent) || 0;
    const ordersSide = pair.ordersSide || 'buyOrSell';
    const currentPrice = parseFloat(pair.currentPrice) || ((lowerPrice + upperPrice) / 2); // Use mid-price if not provided

    if (lowerPrice >= upperPrice || grids <= 0) {
      return [];
    }

    const priceStep = (upperPrice - lowerPrice) / (grids - 1);
    const allOrders = [];

    // Calculate ALL grid orders first
    for (let i = 0; i < grids; i++) {
      const price = lowerPrice + (priceStep * i);
      const index = i + 1; // 1-based index like backend

      // Calculate quantity per grid using backend formula
      let quantity = 0;

      if (amountType === 'incrementalPercent' && incrementalPercent > 0) {
        // Backend formula: (amount + ((amount / 100) * (incrementalPercent * index))) / price
        quantity = (baseAmountUSD + ((baseAmountUSD / 100) * (incrementalPercent * index))) / price;
      } else if (amountType === 'quantityPerGrid') {
        // amount / price
        quantity = baseAmountUSD / price;
      } else if (amountType === 'totalAmount') {
        // (amount / grids) / price
        quantity = (baseAmountUSD / grids) / price;
      } else {
        // Default: fixed amount
        quantity = baseAmountUSD / price;
      }

      allOrders.push({
        price: parseFloat(price.toFixed(8)),
        amount: parseFloat(quantity.toFixed(8)),
        total: parseFloat((price * quantity).toFixed(8)),
        side: price < currentPrice ? 'buy' : 'sell'
      });
    }

    // Filter based on ordersSide (like backend does)
    if (ordersSide === 'buyOnly') {
      return allOrders.filter(order => order.side === 'buy');
    } else if (ordersSide === 'sellOnly') {
      return allOrders.filter(order => order.side === 'sell');
    } else {
      // buyOrSell - return both
      return allOrders;
    }
  };

  /**
   * Calculate total investment (quote currency) for a grid pair
   * Sums up all order totals (price × amount)
   *
   * @param {Object} pair - Trading pair configuration
   * @returns {number} Total investment in quote currency (USDC)
   *
   * @example
   * calculateTotalInvestment({
   *   lowerPrice: 0.075,
   *   upperPrice: 0.150,
   *   amount: 1.1,
   *   grids: 100
   * })
   * // Returns total USDC needed for all 100 orders
   */
  const calculateTotalInvestment = (pair) => {
    const orders = calculateGridOrders(pair);
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  /**
   * Calculate average price across all grid orders
   *
   * @param {Object} pair - Trading pair configuration
   * @returns {number} Average price
   *
   * @example
   * calculateAveragePrice({
   *   lowerPrice: 0.075,
   *   upperPrice: 0.150,
   *   grids: 100
   * })
   * // Returns ~0.1125 (midpoint)
   */
  const calculateAveragePrice = (pair) => {
    const orders = calculateGridOrders(pair);
    if (orders.length === 0) return 0;

    const totalPrice = orders.reduce((sum, order) => sum + order.price, 0);
    return totalPrice / orders.length;
  };

  /**
   * Calculate total base amount for a grid pair
   * Total coins to buy across all orders
   * Supports incrementalPercent for progressive amounts
   *
   * @param {Object} pair - Trading pair configuration
   * @param {string} pair.amountType - 'fixed' or 'incrementalPercent'
   * @param {number} pair.incrementalPercent - Percentage increase per order (default: 0)
   * @returns {number} Total amount of base currency
   *
   * @example
   * // Fixed amount
   * calculateTotalBaseAmount({
   *   amount: 1.1,
   *   grids: 100,
   *   amountType: 'fixed'
   * })
   * // Returns 110 LCX (1.1 × 100)
   *
   * @example
   * // Incremental percent
   * calculateTotalBaseAmount({
   *   amount: 1.1,
   *   grids: 100,
   *   amountType: 'incrementalPercent',
   *   incrementalPercent: 1
   * })
   * // Returns 165 LCX (progressive increase)
   */
  const calculateTotalBaseAmount = (pair) => {
    // Calculate total base amount by summing all order quantities
    // This accounts for varying prices and incremental amounts
    const orders = calculateGridOrders(pair);
    return orders.reduce((sum, order) => sum + order.amount, 0);
  };

  /**
   * Calculate investment for DCA bot strategy
   * DCA = Dollar Cost Averaging with safety orders
   *
   * @param {Object} botConfig - DCA bot configuration
   * @param {number} botConfig.baseOrderAmount - Initial order amount
   * @param {number} botConfig.maxSafetyOrders - Number of safety orders
   * @param {number} botConfig.safetyOrderPercent - Percentage increase per safety order
   * @returns {number} Total DCA investment
   *
   * @example
   * calculateDcaInvestment({
   *   baseOrderAmount: 100,
   *   maxSafetyOrders: 5,
   *   safetyOrderPercent: 3
   * })
   * // Returns: 100 + 103 + 106 + 109 + 112 + 115 = 645
   */
  const calculateDcaInvestment = (botConfig) => {
    const baseOrder = parseFloat(botConfig.baseOrderAmount) || 100;
    const maxOrders = parseInt(botConfig.maxSafetyOrders) || 5;
    const safetyPercent = parseFloat(botConfig.safetyOrderPercent) || 3;

    let dcaInvestment = baseOrder;

    for (let i = 0; i < maxOrders; i++) {
      const multiplier = 1 + ((safetyPercent * (i + 1)) / 100);
      dcaInvestment += baseOrder * multiplier;
    }

    return dcaInvestment;
  };

  /**
   * Calculate investment for Fibonacci bot strategy
   * Places orders at Fibonacci retracement levels
   *
   * @param {Object} botConfig - Fibonacci bot configuration
   * @param {number} botConfig.amount - Amount per level
   * @param {number} botConfig.nrOfGrids - Number of Fibonacci levels (usually 7)
   * @param {number} botConfig.lowerPrice - Lower price boundary
   * @param {number} botConfig.upperPrice - Upper price boundary
   * @returns {number} Total Fibonacci investment
   *
   * @example
   * calculateFibInvestment({
   *   amount: 1.1,
   *   nrOfGrids: 7,
   *   lowerPrice: 0.075,
   *   upperPrice: 0.150
   * })
   * // Returns investment based on average price and total amount
   */
  const calculateFibInvestment = (botConfig) => {
    const amount = parseFloat(botConfig.amount) || 1.1;
    const grids = parseInt(botConfig.nrOfGrids) || 7;
    const lowerPrice = parseFloat(botConfig.lowerPrice) || 0;
    const upperPrice = parseFloat(botConfig.upperPrice) || 0;

    const avgPrice = (lowerPrice + upperPrice) / 2;
    const baseAmount = amount * grids;
    return baseAmount * avgPrice;
  };

  /**
   * Calculate investment for FrontRun bot strategy
   * Similar to grid but optimized for front-running trades
   *
   * @param {Object} botConfig - FrontRun bot configuration
   * @param {number} botConfig.amount - Amount per order
   * @param {number} botConfig.nrOfGrids - Number of orders
   * @param {number} currentPrice - Current market price
   * @returns {number} Total FrontRun investment
   *
   * @example
   * calculateFrontRunInvestment({
   *   amount: 1.1,
   *   nrOfGrids: 100
   * }, 0.15)
   * // Returns 110 * 0.15 = 16.50 USDC
   */
  const calculateFrontRunInvestment = (botConfig, currentPrice = 0) => {
    const amount = parseFloat(botConfig.amount) || 1.1;
    const grids = parseInt(botConfig.nrOfGrids) || 100;
    const price = parseFloat(currentPrice) || 0;

    return amount * grids * price;
  };

  /**
   * Calculate investment for Scalping bot strategy
   * Quick buy/sell with small profit targets
   *
   * @param {Object} botConfig - Scalping bot configuration
   * @param {number} botConfig.amount - Amount to trade
   * @param {number} currentPrice - Current market price
   * @returns {number} Total Scalping investment
   *
   * @example
   * calculateScalpingInvestment({ amount: 10 }, 0.15)
   * // Returns 10 * 0.15 = 1.50 USDC
   */
  const calculateScalpingInvestment = (botConfig, currentPrice = 0) => {
    const amount = parseFloat(botConfig.amount) || 10;
    const price = parseFloat(currentPrice) || 0;

    return amount * price;
  };

  /**
   * Calculate total number of orders for a bot configuration
   *
   * @param {Object} botConfig - Bot configuration
   * @param {string} botType - Type of bot (grid, dca, fib, etc.)
   * @returns {number} Total number of orders
   */
  const calculateOrdersCount = (botConfig, botType) => {
    switch (botType) {
      case 'grid':
      case 'oneclick':
        return parseInt(botConfig.grids) || 10;

      case 'dca':
      case 'smartdca':
        return (parseInt(botConfig.maxSafetyOrders) || 5) + 1; // +1 for base order

      case 'fib':
        return parseInt(botConfig.nrOfGrids) || 7;

      case 'frontrun':
        return parseInt(botConfig.nrOfGrids) || 100;

      case 'scalping':
        return 1; // Single order

      default:
        return 0;
    }
  };

  return {
    // Currency helpers
    getBaseCurrency,
    getQuoteCurrency,

    // Grid calculations
    calculateGridOrders,
    calculateTotalInvestment,
    calculateAveragePrice,
    calculateTotalBaseAmount,

    // Strategy-specific calculations
    calculateDcaInvestment,
    calculateFibInvestment,
    calculateFrontRunInvestment,
    calculateScalpingInvestment,

    // Utilities
    calculateOrdersCount
  };
};
