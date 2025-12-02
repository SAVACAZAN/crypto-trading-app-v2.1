/**
 * Bot Types Configuration
 * Centralized configuration for all 12 bot types in Co-Pilot system
 */

export const BOT_TYPES = {
  GRID: {
    id: 'grid',
    name: 'Grid Bot',
    icon: '📊',
    description: 'Basic grid trading with buy/sell orders at intervals',
    color: '#10eb04',
    endpoint: '/api/v1/createGridBot',
    requiresConfig: ['lowerPrice', 'upperPrice', 'grids', 'amount'],
  },

  GRID_PLUS: {
    id: 'gridplus',
    name: 'GridBot Plus (DCA)',
    icon: '📈',
    description: 'Grid with dollar cost averaging',
    color: '#1e90ff',
    endpoint: '/api/v1/createDcaGridBot',
    requiresConfig: ['lowerPrice', 'upperPrice', 'grids', 'amount', 'dcaInterval'],
  },

  DCA: {
    id: 'dca',
    name: 'DCA Bot',
    icon: '💰',
    description: 'Dollar cost averaging at regular intervals',
    color: '#ffd700',
    endpoint: '/api/v1/createDCABot',
    requiresConfig: ['targetPrice', 'amount', 'interval'],
  },

  SMART_DCA: {
    id: 'smartdca',
    name: 'Smart DCA',
    icon: '🧠',
    description: 'AI-powered DCA with RSI indicators',
    color: '#9370db',
    endpoint: '/api/v1/createSmartDCABot',
    requiresConfig: ['targetPrice', 'amount', 'rsiThreshold'],
  },

  FIBONACCI: {
    id: 'fibonacci',
    name: 'Fibonacci Bot',
    icon: '🌀',
    description: 'Fibonacci retracement level trading',
    color: '#ff6347',
    endpoint: '/api/v1/Bots/createFibBot',
    requiresConfig: ['high', 'low', 'levels'],
  },

  FRONTRUN: {
    id: 'frontrun',
    name: 'FrontRun Bot',
    icon: '⚡',
    description: 'Momentum-based trading',
    color: '#ff4500',
    endpoint: '/api/v1/createFrontRunBot',
    requiresConfig: ['targetPrice', 'amount', 'momentum'],
  },

  SCALPING: {
    id: 'scalping',
    name: 'Scalping Bot',
    icon: '🎯',
    description: 'High-frequency small profit trades',
    color: '#00ced1',
    endpoint: '/api/v1/Bots/createScalpingBot',
    requiresConfig: ['spread', 'amount', 'frequency'],
  },

  ONECLICK: {
    id: 'oneclick',
    name: 'OneClick Bot',
    icon: '🚀',
    description: 'Pre-configured strategy deployment',
    color: '#32cd32',
    endpoint: '/api/v1/createGridBot',
    requiresConfig: ['strategyId', 'markets'],
    hasStrategies: true,
  },

  COPILOT: {
    id: 'copilot',
    name: 'CoPilot Bot',
    icon: '🤖',
    description: 'Chains automation with rules',
    color: '#4169e1',
    endpoint: '/api/v1/Bots/createCoPilotBot',
    requiresConfig: ['rules', 'triggers'],
    hasRules: true,
  },

  GRINDER: {
    id: 'grinder',
    name: 'Grinder Bot',
    icon: '⚙️',
    description: 'Persistent profit grinding',
    color: '#b8860b',
    endpoint: '/api/v1/createGrinderBot',
    requiresConfig: ['targetProfit', 'amount'],
  },

  ORDERBOOK: {
    id: 'orderbook',
    name: 'OrderBook Bot',
    icon: '📖',
    description: 'Order book depth analysis trading',
    color: '#8b4513',
    endpoint: '/api/v1/Bots/createOrderBookBot',
    requiresConfig: ['depthThreshold', 'amount'],
  },

  AI: {
    id: 'ai',
    name: 'AI Bot',
    icon: '🔮',
    description: 'Machine learning-based decisions',
    color: '#9932cc',
    endpoint: '/api/v1/Bots/createAIBot',
    requiresConfig: ['model', 'indicators'],
  },
};

/**
 * Get bot type by ID
 */
export function getBotTypeById(id) {
  return Object.values(BOT_TYPES).find(bot => bot.id === id);
}

/**
 * Get all bot types as array
 */
export function getAllBotTypes() {
  return Object.values(BOT_TYPES);
}

/**
 * Get bot types options for select/dropdown
 */
export function getBotTypeOptions() {
  return Object.values(BOT_TYPES).map(bot => ({
    value: bot.id,
    label: `${bot.icon} ${bot.name}`,
    description: bot.description,
    color: bot.color,
  }));
}

/**
 * Validate bot configuration
 */
export function validateBotConfig(botType, config) {
  const bot = getBotTypeById(botType);
  if (!bot) {
    return { valid: false, error: 'Invalid bot type' };
  }

  const missing = bot.requiresConfig.filter(field => !config[field]);
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Rule action types for automation
 */
export const RULE_ACTIONS = {
  COPY_ORDER: {
    id: 'copy',
    name: 'Copy Order',
    icon: '📋',
    description: 'Copy existing order to new bot',
  },
  REVERSE_ORDER: {
    id: 'reverse',
    name: 'Reverse Order',
    icon: '🔄',
    description: 'Create opposite order (buy→sell or sell→buy)',
  },
  CREATE_GRID: {
    id: 'createGrid',
    name: 'Create Grid Bot',
    icon: '📊',
    description: 'Launch new grid bot',
  },
  CREATE_DCA: {
    id: 'createDCA',
    name: 'Create DCA Bot',
    icon: '💰',
    description: 'Launch DCA bot',
  },
  CANCEL_ORDERS: {
    id: 'cancel',
    name: 'Cancel Orders',
    icon: '❌',
    description: 'Cancel specific orders',
  },
  ADJUST_PRICES: {
    id: 'adjustPrices',
    name: 'Adjust Prices',
    icon: '📈',
    description: 'Modify order prices',
  },
  SEND_NOTIFICATION: {
    id: 'notify',
    name: 'Send Notification',
    icon: '🔔',
    description: 'Send alert to user',
  },
};

/**
 * Rule trigger types
 */
export const RULE_TRIGGERS = {
  ORDER_FILLED: {
    id: 'orderFilled',
    name: 'Order Filled',
    icon: '✅',
    description: 'Triggered when order is completely filled',
  },
  ORDER_PARTIAL: {
    id: 'orderPartial',
    name: 'Partial Fill',
    icon: '⚡',
    description: 'Triggered when order is partially filled',
  },
  PRICE_REACHED: {
    id: 'priceReached',
    name: 'Price Target',
    icon: '🎯',
    description: 'Triggered when price reaches target',
  },
  PROFIT_TARGET: {
    id: 'profitTarget',
    name: 'Profit Target',
    icon: '💰',
    description: 'Triggered when profit reaches threshold',
  },
  TIME_ELAPSED: {
    id: 'timeElapsed',
    name: 'Time Elapsed',
    icon: '⏰',
    description: 'Triggered after time period',
  },
  INDICATOR_SIGNAL: {
    id: 'indicatorSignal',
    name: 'Indicator Signal',
    icon: '📊',
    description: 'Triggered by technical indicator',
  },
};

/**
 * Order size filters for monitoring
 */
export const ORDER_SIZE_FILTERS = [
  { label: 'All Sizes', value: 'all', minAmount: 0 },
  { label: '$100+', value: '100', minAmount: 100 },
  { label: '$1K+', value: '1000', minAmount: 1000 },
  { label: '$5K+', value: '5000', minAmount: 5000 },
  { label: '$10K+', value: '10000', minAmount: 10000 },
  { label: 'Custom', value: 'custom', minAmount: 0 },
];

/**
 * Order status types
 */
export const ORDER_STATUS = {
  OPEN: { id: 'open', label: 'Open', color: '#10eb04', icon: '🟢' },
  FILLED: { id: 'filled', label: 'Filled', color: '#1e90ff', icon: '✅' },
  PARTIAL: { id: 'partial', label: 'Partial', color: '#ffd700', icon: '⚡' },
  CANCELLED: { id: 'cancelled', label: 'Cancelled', color: '#808080', icon: '❌' },
  FAILED: { id: 'failed', label: 'Failed', color: '#eb0404', icon: '⛔' },
};

/**
 * Chain execution phases
 */
export const CHAIN_PHASES = {
  PHASE_1: { id: 1, name: 'Initial Orders', color: '#10eb04' },
  PHASE_2: { id: 2, name: 'Follow-up Orders', color: '#ffd700' },
  PHASE_3: { id: 3, name: 'Profit Taking', color: '#1e90ff' },
  PHASE_4: { id: 4, name: 'Cleanup', color: '#808080' },
};

export default {
  BOT_TYPES,
  RULE_ACTIONS,
  RULE_TRIGGERS,
  ORDER_SIZE_FILTERS,
  ORDER_STATUS,
  CHAIN_PHASES,
  getBotTypeById,
  getAllBotTypes,
  getBotTypeOptions,
  validateBotConfig,
};
