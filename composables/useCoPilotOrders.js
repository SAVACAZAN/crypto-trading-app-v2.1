/**
 * Co-Pilot Orders Composable
 * Order fetching, filtering, enrichment, and management
 */

import { ref, computed } from 'vue';

export function useCoPilotOrders() {
  /**
   * Determine order status based on fill data
   */
  function determineStatus(order) {
    if (order.status === 'canceled' || order.status === 'cancelled') return 'canceled';
    if (order.filled === 0) return 'open';
    if (order.filled >= order.amount) return 'filled';
    return 'partial';
  }

  /**
   * Calculate fill percentage for an order
   */
  function calculateFillPercent(order) {
    if (!order || !order.amount || order.amount === 0) return 0;
    const filled = parseFloat(order.filled) || 0;
    const amount = parseFloat(order.amount) || 0;
    return parseFloat(((filled / amount) * 100).toFixed(2));
  }

  /**
   * Calculate total value of an order
   */
  function calculateTotalValue(order) {
    const amount = parseFloat(order.amount) || 0;
    const price = parseFloat(order.price) || 0;
    return parseFloat((amount * price).toFixed(2));
  }

  /**
   * Calculate filled value of an order
   */
  function calculateFilledValue(order) {
    const filled = parseFloat(order.filled) || 0;
    const price = parseFloat(order.price) || 0;
    return parseFloat((filled * price).toFixed(2));
  }

  /**
   * Calculate remaining amount for an order
   */
  function calculateRemainingAmount(order) {
    const amount = parseFloat(order.amount) || 0;
    const filled = parseFloat(order.filled) || 0;
    return parseFloat((amount - filled).toFixed(6));
  }

  /**
   * Enrich order with calculated fields
   */
  function enrichOrder(order, rules = []) {
    const enriched = {
      ...order,
      status: order.status || determineStatus(order),
      fillPercent: calculateFillPercent(order),
      totalValue: calculateTotalValue(order),
      filledValue: calculateFilledValue(order),
      remainingAmount: calculateRemainingAmount(order),
      rulesCount: rules.length,
      hasActiveRules: rules.some(r => r.enabled !== false),
      rules: rules
    };

    return enriched;
  }

  /**
   * Filter orders by size (minimum total value)
   */
  function filterBySize(orders, minSize) {
    if (!minSize || minSize === 'all') return orders;

    const minValue = typeof minSize === 'string' ? parseFloat(minSize) : minSize;

    return orders.filter(order => {
      const value = calculateTotalValue(order);
      return value >= minValue;
    });
  }

  /**
   * Filter orders by status
   */
  function filterByStatus(orders, status) {
    if (!status || status === 'all') return orders;

    return orders.filter(order => {
      const orderStatus = order.status || determineStatus(order);
      return orderStatus === status;
    });
  }

  /**
   * Filter orders by exchange
   */
  function filterByExchange(orders, exchange) {
    if (!exchange || exchange === 'all') return orders;

    return orders.filter(order => order.exchange === exchange);
  }

  /**
   * Filter orders by API key
   */
  function filterByApiKey(orders, apiKeyName) {
    if (!apiKeyName || apiKeyName === 'all') return orders;

    return orders.filter(order => order.apiKeyName === apiKeyName);
  }

  /**
   * Filter orders by multiple API keys
   */
  function filterByApiKeys(orders, apiKeyNames) {
    if (!apiKeyNames || apiKeyNames.length === 0) return orders;

    return orders.filter(order => apiKeyNames.includes(order.apiKeyName));
  }

  /**
   * Filter orders by symbol
   */
  function filterBySymbol(orders, symbol) {
    if (!symbol || symbol === 'all') return orders;

    return orders.filter(order => order.symbol === symbol);
  }

  /**
   * Filter orders by side (buy/sell)
   */
  function filterBySide(orders, side) {
    if (!side || side === 'all') return orders;

    return orders.filter(order => order.side === side);
  }

  /**
   * Filter orders with active rules
   */
  function filterWithRules(orders) {
    return orders.filter(order => order.rulesCount > 0);
  }

  /**
   * Filter orders without rules
   */
  function filterWithoutRules(orders) {
    return orders.filter(order => !order.rulesCount || order.rulesCount === 0);
  }

  /**
   * Apply multiple filters to orders
   */
  function applyFilters(orders, filters) {
    let filtered = [...orders];

    if (filters.minSize) {
      filtered = filterBySize(filtered, filters.minSize);
    }

    if (filters.status) {
      filtered = filterByStatus(filtered, filters.status);
    }

    if (filters.exchange) {
      filtered = filterByExchange(filtered, filters.exchange);
    }

    if (filters.apiKeyName) {
      filtered = filterByApiKey(filtered, filters.apiKeyName);
    }

    if (filters.apiKeyNames && filters.apiKeyNames.length > 0) {
      filtered = filterByApiKeys(filtered, filters.apiKeyNames);
    }

    if (filters.symbol) {
      filtered = filterBySymbol(filtered, filters.symbol);
    }

    if (filters.side) {
      filtered = filterBySide(filtered, filters.side);
    }

    if (filters.withRules === true) {
      filtered = filterWithRules(filtered);
    } else if (filters.withRules === false) {
      filtered = filterWithoutRules(filtered);
    }

    return filtered;
  }

  /**
   * Sort orders by various criteria
   */
  function sortOrders(orders, sortBy, sortOrder = 'desc') {
    const sorted = [...orders];

    const compareFn = (a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case 'totalValue':
          aVal = calculateTotalValue(a);
          bVal = calculateTotalValue(b);
          break;
        case 'fillPercent':
          aVal = calculateFillPercent(a);
          bVal = calculateFillPercent(b);
          break;
        case 'price':
          aVal = parseFloat(a.price);
          bVal = parseFloat(b.price);
          break;
        case 'amount':
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        case 'rulesCount':
          aVal = a.rulesCount || 0;
          bVal = b.rulesCount || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    };

    return sorted.sort(compareFn);
  }

  /**
   * Group orders by a field
   */
  function groupOrders(orders, groupBy) {
    const grouped = {};

    orders.forEach(order => {
      let key;

      switch (groupBy) {
        case 'symbol':
          key = order.symbol;
          break;
        case 'side':
          key = order.side;
          break;
        case 'status':
          key = order.status || determineStatus(order);
          break;
        case 'exchange':
          key = order.exchange;
          break;
        case 'apiKeyName':
          key = order.apiKeyName;
          break;
        default:
          key = 'ungrouped';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(order);
    });

    return grouped;
  }

  /**
   * Calculate aggregate statistics for orders
   */
  function calculateOrderStats(orders) {
    const stats = {
      totalOrders: orders.length,
      openOrders: 0,
      filledOrders: 0,
      partialOrders: 0,
      canceledOrders: 0,
      totalValue: 0,
      totalFilledValue: 0,
      buyOrders: 0,
      sellOrders: 0,
      ordersWithRules: 0,
      totalRules: 0,
      symbols: new Set(),
      exchanges: new Set(),
      apiKeys: new Set()
    };

    orders.forEach(order => {
      const status = order.status || determineStatus(order);

      if (status === 'open') stats.openOrders++;
      if (status === 'filled') stats.filledOrders++;
      if (status === 'partial') stats.partialOrders++;
      if (status === 'canceled') stats.canceledOrders++;

      stats.totalValue += calculateTotalValue(order);
      stats.totalFilledValue += calculateFilledValue(order);

      if (order.side === 'buy') stats.buyOrders++;
      if (order.side === 'sell') stats.sellOrders++;

      if (order.rulesCount > 0) {
        stats.ordersWithRules++;
        stats.totalRules += order.rulesCount;
      }

      stats.symbols.add(order.symbol);
      if (order.exchange) stats.exchanges.add(order.exchange);
      if (order.apiKeyName) stats.apiKeys.add(order.apiKeyName);
    });

    // Convert sets to counts
    stats.uniqueSymbols = stats.symbols.size;
    stats.uniqueExchanges = stats.exchanges.size;
    stats.uniqueApiKeys = stats.apiKeys.size;

    // Calculate percentages
    stats.fillRate = stats.totalOrders > 0
      ? parseFloat(((stats.filledOrders / stats.totalOrders) * 100).toFixed(2))
      : 0;

    stats.avgOrderValue = stats.totalOrders > 0
      ? parseFloat((stats.totalValue / stats.totalOrders).toFixed(2))
      : 0;

    return stats;
  }

  /**
   * Find orders that match a specific rule trigger
   */
  function findOrdersMatchingTrigger(orders, triggerType, triggerValue) {
    return orders.filter(order => {
      switch (triggerType) {
        case 'partial-fill':
        case 'on_partial_fill':
          const fillPercent = calculateFillPercent(order);
          return fillPercent >= triggerValue && fillPercent < 100;

        case 'fully-filled':
        case 'on_fill':
          return calculateFillPercent(order) >= 100;

        case 'amount-filled':
          return calculateFilledValue(order) >= triggerValue;

        case 'on_cancel':
          const status = order.status || determineStatus(order);
          return status === 'canceled';

        default:
          return false;
      }
    });
  }

  /**
   * Get unique values for a field across all orders
   */
  function getUniqueValues(orders, field) {
    const values = new Set();
    orders.forEach(order => {
      if (order[field]) {
        values.add(order[field]);
      }
    });
    return Array.from(values).sort();
  }

  /**
   * Search orders by text (symbol, ID, API key name)
   */
  function searchOrders(orders, searchText) {
    if (!searchText || searchText.trim() === '') return orders;

    const lowerSearch = searchText.toLowerCase().trim();

    return orders.filter(order => {
      return (
        order.symbol?.toLowerCase().includes(lowerSearch) ||
        order.id?.toLowerCase().includes(lowerSearch) ||
        order.apiKeyName?.toLowerCase().includes(lowerSearch) ||
        order.exchange?.toLowerCase().includes(lowerSearch)
      );
    });
  }

  /**
   * Format order for API submission
   */
  function formatOrderForAPI(order) {
    return {
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      amount: parseFloat(order.amount),
      filled: parseFloat(order.filled) || 0,
      price: parseFloat(order.price),
      status: order.status,
      timestamp: order.timestamp,
      apiKeyName: order.apiKeyName,
      exchange: order.exchange
    };
  }

  /**
   * Validate order data
   */
  function validateOrder(order) {
    const errors = [];

    if (!order.symbol || order.symbol.trim() === '') {
      errors.push('Symbol is required');
    }

    if (!order.side || !['buy', 'sell'].includes(order.side.toLowerCase())) {
      errors.push('Valid side (buy/sell) is required');
    }

    if (!order.amount || parseFloat(order.amount) <= 0) {
      errors.push('Valid amount is required');
    }

    if (!order.price || parseFloat(order.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!order.apiKeyName) {
      errors.push('API key name is required');
    }

    if (!order.exchange) {
      errors.push('Exchange is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if order can have rules added
   */
  function canAddRule(order) {
    const status = order.status || determineStatus(order);

    // Can't add rules to canceled orders
    if (status === 'canceled') {
      return { canAdd: false, reason: 'Cannot add rules to canceled orders' };
    }

    // Can't add rules to fully filled orders
    if (status === 'filled') {
      return { canAdd: false, reason: 'Order is already filled' };
    }

    return { canAdd: true };
  }

  /**
   * Check if order is active (can be monitored)
   */
  function isActiveOrder(order) {
    const status = order.status || determineStatus(order);
    return status === 'open' || status === 'partial';
  }

  /**
   * Get order age in milliseconds
   */
  function getOrderAge(order) {
    if (!order.timestamp) return 0;
    return Date.now() - new Date(order.timestamp).getTime();
  }

  /**
   * Get order age in human-readable format
   */
  function getOrderAgeFormatted(order) {
    const ageMs = getOrderAge(order);
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  return {
    // Order enrichment
    enrichOrder,
    determineStatus,
    calculateFillPercent,
    calculateTotalValue,
    calculateFilledValue,
    calculateRemainingAmount,

    // Filtering
    filterBySize,
    filterByStatus,
    filterByExchange,
    filterByApiKey,
    filterByApiKeys,
    filterBySymbol,
    filterBySide,
    filterWithRules,
    filterWithoutRules,
    applyFilters,

    // Sorting and grouping
    sortOrders,
    groupOrders,

    // Statistics
    calculateOrderStats,

    // Search and discovery
    findOrdersMatchingTrigger,
    getUniqueValues,
    searchOrders,

    // Validation
    validateOrder,
    canAddRule,
    isActiveOrder,

    // Utilities
    formatOrderForAPI,
    getOrderAge,
    getOrderAgeFormatted,
  };
}

export default useCoPilotOrders;
