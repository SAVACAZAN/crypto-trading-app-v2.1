/**
 * Palantir Store Composable
 * Centralized state management for Palantir system
 */

export const usePalantirStore = () => {
  const api = usePalantirAPI();

  // State
  const botChains = ref([]);
  const patterns = ref([]);
  const automationRules = ref([]);
  const signals = ref([]);
  const eventLog = ref([]);
  const dashboard = ref(null);

  const loading = ref({
    chains: false,
    patterns: false,
    rules: false,
    signals: false,
    events: false,
    dashboard: false
  });

  const stats = ref({
    chains: null,
    patterns: null,
    rules: null
  });

  // ============================================
  // BOT CHAINS
  // ============================================

  const loadBotChains = async (userId, filters = {}) => {
    loading.value.chains = true;
    try {
      const result = await api.getBotChains(userId, filters);
      if (result.success) {
        botChains.value = result.data;
        stats.value.chains = result.stats;
      }
      return result;
    } finally {
      loading.value.chains = false;
    }
  };

  const createChain = async (chainData) => {
    const result = await api.createBotChain(chainData);
    if (result.success) {
      botChains.value.push(result.data);
    }
    return result;
  };

  const toggleChain = async (userId, chainId, enabled) => {
    const result = await api.toggleBotChain(userId, chainId, enabled);
    if (result.success) {
      const index = botChains.value.findIndex(c => c.chainId === chainId);
      if (index !== -1) {
        botChains.value[index] = result.data;
      }
    }
    return result;
  };

  const deleteChain = async (chainId) => {
    const result = await api.deleteBotChain(chainId);
    if (result.success) {
      const index = botChains.value.findIndex(c => c.chainId === chainId);
      if (index !== -1) {
        botChains.value.splice(index, 1);
      }
    }
    return result;
  };

  const loadChainStats = async (userId) => {
    const result = await api.getChainStats(userId);
    if (result.success) {
      stats.value.chains = result.data;
    }
    return result;
  };

  // ============================================
  // PATTERNS
  // ============================================

  const loadPatterns = async (userId, filters = {}) => {
    loading.value.patterns = true;
    try {
      const result = await api.getPatterns(userId, filters);
      if (result.success) {
        patterns.value = result.data;
        stats.value.patterns = result.stats;
      }
      return result;
    } finally {
      loading.value.patterns = false;
    }
  };

  const scanPatterns = async (scanData) => {
    const result = await api.scanForPatterns(scanData);
    if (result.success && result.data.length > 0) {
      // Add new patterns to the beginning of the array
      patterns.value.unshift(...result.data);
    }
    return result;
  };

  const loadPatternStats = async (userId, since = null) => {
    const result = await api.getPatternStats(userId, since);
    if (result.success) {
      stats.value.patterns = result.data;
    }
    return result;
  };

  const clearPatterns = async (userId, olderThan = 24) => {
    const result = await api.deletePatterns(userId, null, true, olderThan);
    if (result.success) {
      patterns.value = [];
    }
    return result;
  };

  // ============================================
  // AUTOMATION RULES
  // ============================================

  const loadAutomationRules = async (userId, filters = {}) => {
    loading.value.rules = true;
    try {
      const result = await api.getAutomationRules(userId, filters);
      if (result.success) {
        automationRules.value = result.data;
        stats.value.rules = result.stats;
      }
      return result;
    } finally {
      loading.value.rules = false;
    }
  };

  const createRule = async (ruleData) => {
    const result = await api.createAutomationRule(ruleData);
    if (result.success) {
      automationRules.value.push(result.data);
    }
    return result;
  };

  const toggleRule = async (userId, ruleId, enabled) => {
    const result = await api.toggleAutomationRule(userId, ruleId, enabled);
    if (result.success) {
      const index = automationRules.value.findIndex(r => r.ruleId === ruleId);
      if (index !== -1) {
        automationRules.value[index] = result.data;
      }
    }
    return result;
  };

  const executeRule = async (userId, ruleId, eventData = {}) => {
    return await api.executeAutomationRule(userId, ruleId, eventData, true);
  };

  const deleteRule = async (userId, ruleId) => {
    const result = await api.deleteAutomationRule(userId, ruleId);
    if (result.success) {
      const index = automationRules.value.findIndex(r => r.ruleId === ruleId);
      if (index !== -1) {
        automationRules.value.splice(index, 1);
      }
    }
    return result;
  };

  // ============================================
  // ANALYTICS
  // ============================================

  const loadTradingSignals = async (userId, filters = {}) => {
    loading.value.signals = true;
    try {
      const result = await api.getTradingSignals(userId, filters);
      if (result.success) {
        signals.value = result.data;
      }
      return result;
    } finally {
      loading.value.signals = false;
    }
  };

  const loadEventLog = async (userId, filters = {}) => {
    loading.value.events = true;
    try {
      const result = await api.getEventLog(userId, filters);
      if (result.success) {
        eventLog.value = result.data;
      }
      return result;
    } finally {
      loading.value.events = false;
    }
  };

  const loadDashboard = async (userId) => {
    loading.value.dashboard = true;
    try {
      const result = await api.getDashboardData(userId);
      if (result.success) {
        dashboard.value = result.data;
      }
      return result;
    } finally {
      loading.value.dashboard = false;
    }
  };

  const loadMultiTimeframe = async (symbol, timeframes = null) => {
    return await api.getMultiTimeframeAnalysis(symbol, timeframes);
  };

  // ============================================
  // POLLING / AUTO-REFRESH
  // ============================================

  let refreshIntervals = {};

  const startAutoRefresh = (type, userId, intervalMs = 10000) => {
    stopAutoRefresh(type); // Clear any existing interval

    const refreshFunctions = {
      chains: () => loadBotChains(userId),
      patterns: () => loadPatterns(userId),
      rules: () => loadAutomationRules(userId),
      signals: () => loadTradingSignals(userId),
      events: () => loadEventLog(userId),
      dashboard: () => loadDashboard(userId)
    };

    if (refreshFunctions[type]) {
      // Initial load
      refreshFunctions[type]();

      // Set up interval
      refreshIntervals[type] = setInterval(refreshFunctions[type], intervalMs);
    }
  };

  const stopAutoRefresh = (type) => {
    if (refreshIntervals[type]) {
      clearInterval(refreshIntervals[type]);
      delete refreshIntervals[type];
    }
  };

  const stopAllRefresh = () => {
    Object.keys(refreshIntervals).forEach(stopAutoRefresh);
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopAllRefresh();
  });

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const activeChains = computed(() =>
    botChains.value.filter(c => c.status === 'running')
  );

  const highConfidencePatterns = computed(() =>
    patterns.value.filter(p => p.confidence >= 75)
  );

  const enabledRules = computed(() =>
    automationRules.value.filter(r => r.enabled)
  );

  const buySignals = computed(() =>
    signals.value.filter(s => s.action === 'BUY')
  );

  const sellSignals = computed(() =>
    signals.value.filter(s => s.action === 'SELL')
  );

  return {
    // State
    botChains,
    patterns,
    automationRules,
    signals,
    eventLog,
    dashboard,
    loading,
    stats,

    // Bot Chains
    loadBotChains,
    createChain,
    toggleChain,
    deleteChain,
    loadChainStats,

    // Patterns
    loadPatterns,
    scanPatterns,
    loadPatternStats,
    clearPatterns,

    // Automation Rules
    loadAutomationRules,
    createRule,
    toggleRule,
    executeRule,
    deleteRule,

    // Analytics
    loadTradingSignals,
    loadEventLog,
    loadDashboard,
    loadMultiTimeframe,

    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
    stopAllRefresh,

    // Computed
    activeChains,
    highConfidencePatterns,
    enabledRules,
    buySignals,
    sellSignals
  };
};
