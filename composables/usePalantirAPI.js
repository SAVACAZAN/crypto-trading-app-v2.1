/**
 * Palantir API Composable
 * Provides easy access to all Palantir API endpoints
 */

export const usePalantirAPI = () => {
  const config = useRuntimeConfig();
  const baseURL = '/api/v1/palantir';

  // ============================================
  // BOT CHAINS API
  // ============================================

  /**
   * Create a new bot chain
   */
  const createBotChain = async (chainData) => {
    try {
      const response = await $fetch(`${baseURL}/chains/create`, {
        method: 'POST',
        body: chainData
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating bot chain:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get all bot chains for a user
   */
  const getBotChains = async (userId, filters = {}) => {
    try {
      const query = new URLSearchParams({
        userId,
        ...filters
      });
      const response = await $fetch(`${baseURL}/chains/list?${query}`);
      return { success: true, data: response.data, stats: response.stats };
    } catch (error) {
      console.error('Error fetching bot chains:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Toggle bot chain enabled state
   */
  const toggleBotChain = async (userId, chainId, enabled) => {
    try {
      const response = await $fetch(`${baseURL}/chains/toggle`, {
        method: 'POST',
        body: { userId, chainId, enabled }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error toggling bot chain:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete a bot chain
   */
  const deleteBotChain = async (chainId) => {
    try {
      const response = await $fetch(`${baseURL}/chains/delete`, {
        method: 'POST',
        body: { chainId }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting bot chain:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get chain statistics
   */
  const getChainStats = async (userId) => {
    try {
      const response = await $fetch(`${baseURL}/chains/stats?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching chain stats:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // PATTERN DETECTION API
  // ============================================

  /**
   * Manually trigger pattern scan
   */
  const scanForPatterns = async (scanData) => {
    try {
      const response = await $fetch(`${baseURL}/patterns/scan`, {
        method: 'POST',
        body: scanData
      });
      return { success: true, data: response.data, count: response.count };
    } catch (error) {
      console.error('Error scanning for patterns:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get detected patterns
   */
  const getPatterns = async (userId, filters = {}) => {
    try {
      const query = new URLSearchParams({
        userId,
        ...filters
      });
      const response = await $fetch(`${baseURL}/patterns/list?${query}`);
      return { success: true, data: response.data, stats: response.stats };
    } catch (error) {
      console.error('Error fetching patterns:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get pattern statistics
   */
  const getPatternStats = async (userId, since = null) => {
    try {
      const query = new URLSearchParams({ userId });
      if (since) query.append('since', since);

      const response = await $fetch(`${baseURL}/patterns/stats?${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching pattern stats:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete patterns
   */
  const deletePatterns = async (userId, patternId = null, deleteAll = false, olderThan = null) => {
    try {
      const response = await $fetch(`${baseURL}/patterns/delete`, {
        method: 'POST',
        body: { userId, patternId, deleteAll, olderThan }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting patterns:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // AUTOMATION RULES API
  // ============================================

  /**
   * Create automation rule
   */
  const createAutomationRule = async (ruleData) => {
    try {
      const response = await $fetch(`${baseURL}/rules/create`, {
        method: 'POST',
        body: ruleData
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating automation rule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get automation rules
   */
  const getAutomationRules = async (userId, filters = {}) => {
    try {
      const query = new URLSearchParams({
        userId,
        ...filters
      });
      const response = await $fetch(`${baseURL}/rules/list?${query}`);
      return { success: true, data: response.data, stats: response.stats };
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Toggle automation rule
   */
  const toggleAutomationRule = async (userId, ruleId, enabled) => {
    try {
      const response = await $fetch(`${baseURL}/rules/toggle`, {
        method: 'POST',
        body: { userId, ruleId, enabled }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Execute automation rule manually
   */
  const executeAutomationRule = async (userId, ruleId, eventData = {}, manual = true) => {
    try {
      const response = await $fetch(`${baseURL}/rules/execute`, {
        method: 'POST',
        body: { userId, ruleId, eventData, manual }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error executing automation rule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete automation rule
   */
  const deleteAutomationRule = async (userId, ruleId) => {
    try {
      const response = await $fetch(`${baseURL}/rules/delete`, {
        method: 'POST',
        body: { userId, ruleId }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get automation rule statistics
   */
  const getAutomationStats = async (userId) => {
    try {
      const response = await $fetch(`${baseURL}/rules/stats?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching automation stats:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // ANALYTICS API
  // ============================================

  /**
   * Get multi-timeframe analysis
   */
  const getMultiTimeframeAnalysis = async (symbol, timeframes = null) => {
    try {
      const query = new URLSearchParams({ symbol });
      if (timeframes) query.append('timeframes', timeframes.join(','));

      const response = await $fetch(`${baseURL}/analytics/multiTimeframe?${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching multi-timeframe analysis:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get trading signals
   */
  const getTradingSignals = async (userId, filters = {}) => {
    try {
      const query = new URLSearchParams({
        userId,
        ...filters
      });
      const response = await $fetch(`${baseURL}/analytics/signals?${query}`);
      return { success: true, data: response.data, stats: response.stats };
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get event log
   */
  const getEventLog = async (userId, filters = {}) => {
    try {
      const query = new URLSearchParams({
        userId,
        ...filters
      });
      const response = await $fetch(`${baseURL}/analytics/eventLog?${query}`);
      return { success: true, data: response.data, stats: response.stats };
    } catch (error) {
      console.error('Error fetching event log:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get dashboard data
   */
  const getDashboardData = async (userId) => {
    try {
      const response = await $fetch(`${baseURL}/analytics/dashboard?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { success: false, error: error.message };
    }
  };

  // Return all API functions
  return {
    // Bot Chains
    createBotChain,
    getBotChains,
    toggleBotChain,
    deleteBotChain,
    getChainStats,

    // Pattern Detection
    scanForPatterns,
    getPatterns,
    getPatternStats,
    deletePatterns,

    // Automation Rules
    createAutomationRule,
    getAutomationRules,
    toggleAutomationRule,
    executeAutomationRule,
    deleteAutomationRule,
    getAutomationStats,

    // Analytics
    getMultiTimeframeAnalysis,
    getTradingSignals,
    getEventLog,
    getDashboardData
  };
};
