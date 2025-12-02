/**
 * Co-Pilot Rules Composable
 * Automation rules management, validation, and execution logic
 */

import { ref, computed } from 'vue';
import { RULE_ACTIONS, RULE_TRIGGERS, BOT_TYPES } from '~/constants/botTypes';

export function useCoPilotRules() {
  /**
   * Rule template validation
   */
  function validateRuleTemplate(template) {
    const errors = [];

    if (!template.templateName || template.templateName.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.ruleType) {
      errors.push('Rule type is required');
    }

    if (!template.triggerCondition) {
      errors.push('Trigger condition is required');
    }

    // Validate action config based on rule type
    if (template.ruleType === 'create_bot') {
      if (!template.actionConfig?.botType) {
        errors.push('Bot type is required for create_bot action');
      }
    }

    if (template.ruleType === 'copy_order') {
      if (!template.actionConfig?.copyMultiplier) {
        errors.push('Copy multiplier is required for copy_order action');
      }
    }

    if (template.ruleType === 'reverse_order') {
      if (!template.actionConfig?.reverseRatio) {
        errors.push('Reverse ratio is required for reverse_order action');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate order rule (rule applied to specific order)
   */
  function validateOrderRule(orderRule, order) {
    const errors = [];

    if (!orderRule.ruleName || orderRule.ruleName.trim() === '') {
      errors.push('Rule name is required');
    }

    if (!orderRule.ruleType) {
      errors.push('Rule type is required');
    }

    if (!orderRule.triggerCondition) {
      errors.push('Trigger condition is required');
    }

    if (!order) {
      errors.push('Order context is required');
    }

    // Validate bot config for create_bot rule type
    if (orderRule.ruleType === 'create_bot') {
      const botType = orderRule.actionConfig?.botType;
      if (!botType) {
        errors.push('Bot type is required');
      } else {
        // Validate bot-specific configuration
        // For OneClick, pass entire actionConfig since oneClickStrategy is at that level
        const configToValidate = botType === 'oneclick'
          ? orderRule.actionConfig
          : orderRule.actionConfig?.botConfig || {};
        const botValidation = validateBotConfig(botType, configToValidate);
        if (!botValidation.valid) {
          errors.push(...botValidation.errors);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate bot configuration based on bot type
   */
  function validateBotConfig(botType, config) {
    const errors = [];

    switch (botType) {
      case 'grid':
      case 'dcagrid':
        if (!config.lowerPrice || config.lowerPrice <= 0) {
          errors.push('Valid lower price is required');
        }
        if (!config.upperPrice || config.upperPrice <= 0) {
          errors.push('Valid upper price is required');
        }
        if (config.lowerPrice >= config.upperPrice) {
          errors.push('Lower price must be less than upper price');
        }
        if (!config.nrOfGrids || config.nrOfGrids < 2) {
          errors.push('Number of grids must be at least 2');
        }
        if (!config.amount || config.amount <= 0) {
          errors.push('Valid amount is required');
        }
        break;

      case 'dca':
      case 'smartdca':
        if (!config.baseOrderAmount || config.baseOrderAmount <= 0) {
          errors.push('Valid base order amount is required');
        }
        if (botType === 'smartdca') {
          if (!config.rsiOversold || config.rsiOversold < 10 || config.rsiOversold > 50) {
            errors.push('RSI Oversold must be between 10 and 50');
          }
          if (!config.rsiOverbought || config.rsiOverbought < 50 || config.rsiOverbought > 90) {
            errors.push('RSI Overbought must be between 50 and 90');
          }
        }
        break;

      case 'fib':
      case 'frontrun':
        if (!config.lowerPrice || config.lowerPrice <= 0) {
          errors.push('Valid lower price is required');
        }
        if (!config.upperPrice || config.upperPrice <= 0) {
          errors.push('Valid upper price is required');
        }
        if (!config.PriceStart || config.PriceStart <= 0) {
          errors.push('Valid starting price is required');
        }
        if (!config.nrOfGrids || config.nrOfGrids < 2) {
          errors.push('Number of grids must be at least 2');
        }
        break;

      case 'scalping':
        if (!config.lowerPrice || config.lowerPrice <= 0) {
          errors.push('Valid lower price is required');
        }
        if (!config.upperPrice || config.upperPrice <= 0) {
          errors.push('Valid upper price is required');
        }
        if (!config.BalanceBotStart || config.BalanceBotStart <= 0) {
          errors.push('Valid starting balance is required');
        }
        break;

      case 'grinder':
        if (!config.BalanceBotStart || config.BalanceBotStart <= 0) {
          errors.push('Valid starting balance is required');
        }
        if (!config.ordersSide || !['buyOnly', 'sellOnly'].includes(config.ordersSide)) {
          errors.push('Valid orders side is required (buyOnly or sellOnly)');
        }
        break;

      case 'orderbook':
        if (!config.bidDepth || config.bidDepth < 1) {
          errors.push('Valid bid depth is required');
        }
        if (!config.askDepth || config.askDepth < 1) {
          errors.push('Valid ask depth is required');
        }
        if (!config.imbalanceThreshold || config.imbalanceThreshold < 1) {
          errors.push('Valid imbalance threshold is required');
        }
        break;

      case 'aibot':
        if (!config.indicators || config.indicators.length === 0) {
          errors.push('At least one indicator is required');
        }
        if (!config.confidenceThreshold || config.confidenceThreshold < 0.1 || config.confidenceThreshold > 1) {
          errors.push('Confidence threshold must be between 0.1 and 1.0');
        }
        break;

      case 'oneclick':
        // OneClick validation - either strategy ID or custom config
        if (!config.oneClickStrategy) {
          errors.push('Strategy selection is required');
        } else if (config.oneClickStrategy === 'custom') {
          // Validate custom config
          if (!config.lowerPricePercent && config.lowerPricePercent !== 0) {
            errors.push('Lower price percentage is required');
          }
          if (!config.upperPricePercent && config.upperPricePercent !== 0) {
            errors.push('Upper price percentage is required');
          }
          if (!config.nrOfGrids || config.nrOfGrids < 1) {
            errors.push('Number of grids is required');
          }
        }
        break;

      case 'copilot':
        if (!config.chainToRule) {
          errors.push('Chain to rule ID is required');
        }
        break;

      default:
        errors.push(`Unknown bot type: ${botType}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if rule trigger condition is met
   */
  function evaluateTrigger(rule, order, currentPrice = null) {
    const triggerType = rule.triggerType || rule.triggerCondition;
    const triggerValue = rule.triggerValue || 0;

    switch (triggerType) {
      case 'partial-fill':
      case 'on_partial_fill':
        const fillPercent = (order.filled / order.amount) * 100;
        return fillPercent >= triggerValue && fillPercent < 100;

      case 'fully-filled':
      case 'on_fill':
        return order.filled >= order.amount;

      case 'amount-filled':
        const filledValue = order.filled * order.price;
        return filledValue >= triggerValue;

      case 'time-elapsed':
      case 'on_time':
        if (!order.timestamp) return false;
        const elapsed = Date.now() - new Date(order.timestamp).getTime();
        const targetMs = triggerValue * 60 * 1000; // Convert minutes to ms
        return elapsed >= targetMs;

      case 'on_cancel':
        return order.status === 'canceled' || order.status === 'cancelled';

      case 'on_price_change':
        if (!currentPrice || !order.price) return false;
        const priceChange = Math.abs((currentPrice - order.price) / order.price) * 100;
        return priceChange >= triggerValue;

      case 'manual':
        return false; // Manual triggers require explicit activation

      default:
        return false;
    }
  }

  /**
   * Get default action config for rule type
   */
  function getDefaultActionConfig(ruleType) {
    const defaults = {
      copy_order: {
        copyMultiplier: 1.0,
        priceOffset: 0
      },
      reverse_order: {
        reverseRatio: 100
      },
      create_bot: {
        botType: null,
        botConfig: {}
      },
      chain_action: {
        delaySeconds: 0,
        chainToRule: null
      },
      cancel_order: {},
      modify_order: {
        newPrice: null,
        newAmount: null
      }
    };

    return defaults[ruleType] || {};
  }

  /**
   * Get default bot config for bot type
   */
  function getDefaultBotConfigForType(botType) {
    const configs = {
      grid: {
        lowerPrice: 0,
        upperPrice: 0,
        nrOfGrids: 10,
        amount: 0,
        ordersSide: 'buyOrSell'
      },
      dcagrid: {
        lowerPrice: 0,
        upperPrice: 0,
        nrOfGrids: 10,
        incBuy: 1,
        incSell: 1,
        devPriceBuy: 1,
        devPriceSell: 1
      },
      dca: {
        baseOrderAmount: 0,
        safetyOrderPercent: 3,
        takeProfitPercent: 2,
        maxSafetyOrders: 5
      },
      smartdca: {
        baseOrderAmount: 0,
        rsiOversold: 30,
        rsiOverbought: 70,
        smaFast: 10,
        smaSlow: 20
      },
      fib: {
        lowerPrice: 0,
        upperPrice: 0,
        nrOfGrids: 7,
        PriceStart: 0,
        amount: 0
      },
      frontrun: {
        lowerPrice: 0,
        upperPrice: 0,
        nrOfGrids: 5,
        PriceStart: 0,
        amount: 0
      },
      scalping: {
        lowerPrice: 0,
        upperPrice: 0,
        nrOfGrids: 3,
        BalanceBotStart: 0,
        autoCancelSeconds: 25
      },
      oneclick: {
        oneClickStrategy: null,
        incBuy: 1,
        incSell: 1,
        devPriceBuy: 1,
        devPriceSell: 1,
        devAmtBuy: 0.9,
        devAmtSell: 0.9,
        nrOfGrids: 10,
        lowerPricePercent: -20,
        upperPricePercent: 1,
        amount: 1.1
      },
      copilot: {
        chainToRule: null,
        delaySeconds: 0
      },
      grinder: {
        BalanceBotStart: 0,
        ordersSide: 'buyOnly',
        lowerPrice: 0,
        upperPrice: 0
      },
      orderbook: {
        bidDepth: 5,
        askDepth: 5,
        imbalanceThreshold: 1.5,
        amount: 0
      },
      aibot: {
        indicators: ['RSI', 'MACD'],
        confidenceThreshold: 0.7,
        amount: 0
      }
    };

    return configs[botType] || {};
  }

  /**
   * Format trigger condition for display
   */
  function formatTriggerCondition(triggerCondition) {
    const triggers = {
      'on_fill': 'On Fill',
      'on_partial_fill': 'Partial Fill',
      'on_cancel': 'On Cancel',
      'on_price_change': 'Price Change',
      'on_time': 'Time Based',
      'manual': 'Manual',
      'partial-fill': 'Partial Fill',
      'fully-filled': 'Fully Filled',
      'amount-filled': 'Amount Filled',
      'time-elapsed': 'Time Elapsed'
    };
    return triggers[triggerCondition] || triggerCondition || 'Unknown';
  }

  /**
   * Format rule type for display
   */
  function formatRuleType(ruleType) {
    const types = {
      'copy_order': 'Copy Order',
      'reverse_order': 'Reverse Order',
      'create_bot': 'Create Bot',
      'cancel_order': 'Cancel Order',
      'modify_order': 'Modify Order',
      'chain_action': 'Chain Action'
    };
    return types[ruleType] || ruleType || 'Unknown';
  }

  /**
   * Format rule condition (trigger + action) for display
   */
  function formatRuleCondition(rule) {
    // Handle both old format (triggerType) and new format (triggerCondition)
    const triggerType = rule.triggerType || rule.triggerCondition;
    const actionType = rule.actionType || rule.ruleType;
    const botType = rule.botType || rule.actionConfig?.botType;

    const triggers = {
      'partial-fill': `When ${rule.triggerValue || 50}% filled`,
      'on_partial_fill': `When ${rule.triggerValue || 50}% filled`,
      'fully-filled': 'When fully filled',
      'on_fill': 'When fully filled',
      'amount-filled': `When $${rule.triggerValue || 100}+ filled`,
      'time-elapsed': `After ${rule.triggerValue || 5} minutes`,
      'on_time': `After ${rule.triggerValue || 5} minutes`,
      'on_cancel': 'When canceled',
      'on_price_change': 'On price change',
      'manual': 'Manual trigger'
    };

    const actions = {
      'create-bot': `Create ${botType || 'bot'}`,
      'create_bot': `Create ${botType || 'bot'}`,
      'copy_order': 'Copy order',
      'reverse_order': 'Reverse order',
      'cancel_order': 'Cancel order',
      'modify_order': 'Modify order',
      'chain_action': 'Chain action',
      'multi-phase': `Split into ${rule.phaseCount || 5} phases`,
      'cancel': 'Cancel order',
      'notify': 'Send notification'
    };

    return `${triggers[triggerType] || 'Unknown trigger'} → ${actions[actionType] || 'Unknown action'}`;
  }

  /**
   * Check if OneClick config has meaningful data (not a legacy rule)
   */
  function hasOneClickConfigData(actionConfig) {
    if (!actionConfig) return false;

    // Check if any of the OneClick specific fields exist (using !== undefined to catch 0 values)
    return (
      actionConfig.incBuy !== undefined ||
      actionConfig.incSell !== undefined ||
      actionConfig.devPriceBuy !== undefined ||
      actionConfig.devPriceSell !== undefined ||
      actionConfig.devAmtBuy !== undefined ||
      actionConfig.devAmtSell !== undefined ||
      actionConfig.nrOfGrids !== undefined ||
      (actionConfig.pairs && actionConfig.pairs.length > 0) ||
      actionConfig.lowerPricePercent !== undefined ||
      actionConfig.upperPricePercent !== undefined ||
      actionConfig.amount !== undefined ||
      actionConfig.strategyName !== undefined ||
      actionConfig.configName !== undefined
    );
  }

  /**
   * Check if OneClick rule has complete data (not legacy)
   */
  function isCompleteOneClickRule(actionConfig) {
    if (!actionConfig) return false;

    // A complete OneClick rule should have at least one of these key fields
    return (
      actionConfig.strategyName !== undefined ||
      actionConfig.incBuy !== undefined ||
      actionConfig.incSell !== undefined ||
      (actionConfig.pairs && actionConfig.pairs.length > 0) ||
      actionConfig.configName !== undefined
    );
  }

  /**
   * Map old rule format to new template format
   */
  function mapOldRuleToNew(oldRule) {
    const ruleType = oldRule.actionType === 'create-bot' ? 'create_bot' :
                     oldRule.actionType === 'cancel' ? 'cancel_order' :
                     oldRule.actionType === 'notify' ? 'copy_order' : 'create_bot';

    const triggerCondition = oldRule.triggerType === 'fully-filled' ? 'on_fill' :
                             oldRule.triggerType === 'partial-fill' ? 'on_partial_fill' :
                             oldRule.triggerType === 'time-elapsed' ? 'on_time' : 'on_fill';

    const actionConfig = {};
    if (oldRule.actionType === 'create-bot' && oldRule.botType) {
      actionConfig.botType = oldRule.botType;
      actionConfig.botConfig = oldRule.botConfig || {};
    }

    return {
      ruleType,
      triggerCondition,
      triggerValue: oldRule.triggerValue,
      actionConfig
    };
  }

  /**
   * Calculate suggested bot parameters from order data
   */
  function suggestBotParams(order, botType) {
    const orderPrice = parseFloat(order.price);
    const orderAmount = parseFloat(order.amount);

    const suggestions = {
      grid: {
        lowerPrice: parseFloat((orderPrice * 0.9).toFixed(6)),   // -10%
        upperPrice: parseFloat((orderPrice * 1.1).toFixed(6)),   // +10%
        nrOfGrids: 10,
        amount: orderAmount,
        ordersSide: order.side === 'buy' ? 'buyOnly' : 'sellOnly'
      },
      dcagrid: {
        lowerPrice: parseFloat((orderPrice * 0.85).toFixed(6)),  // -15%
        upperPrice: parseFloat((orderPrice * 1.15).toFixed(6)),  // +15%
        nrOfGrids: 10,
        incBuy: 1,
        incSell: 1,
        devPriceBuy: 1,
        devPriceSell: 1
      },
      dca: {
        baseOrderAmount: orderAmount,
        safetyOrderPercent: 3,
        takeProfitPercent: 2,
        maxSafetyOrders: 5
      },
      fib: {
        lowerPrice: parseFloat((orderPrice * 0.8).toFixed(6)),   // -20%
        upperPrice: parseFloat((orderPrice * 1.2).toFixed(6)),   // +20%
        nrOfGrids: 7,
        PriceStart: orderPrice,
        amount: orderAmount
      },
      oneclick: {
        lowerPricePercent: -20,
        upperPricePercent: 1,
        amount: orderAmount,
        nrOfGrids: 10
      }
    };

    return suggestions[botType] || {};
  }

  /**
   * Create rule execution context
   */
  function createExecutionContext(rule, order, additionalData = {}) {
    return {
      rule: { ...rule },
      order: { ...order },
      timestamp: Date.now(),
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...additionalData
    };
  }

  /**
   * Check if rule can be executed
   */
  function canExecuteRule(rule, order) {
    if (!rule.enabled && rule.enabled !== undefined) {
      return { canExecute: false, reason: 'Rule is disabled' };
    }

    if (!evaluateTrigger(rule, order)) {
      return { canExecute: false, reason: 'Trigger condition not met' };
    }

    return { canExecute: true };
  }

  return {
    // Validation
    validateRuleTemplate,
    validateOrderRule,
    validateBotConfig,

    // Trigger evaluation
    evaluateTrigger,
    canExecuteRule,

    // Default configs
    getDefaultActionConfig,
    getDefaultBotConfigForType,
    suggestBotParams,

    // Formatting
    formatTriggerCondition,
    formatRuleType,
    formatRuleCondition,

    // OneClick helpers
    hasOneClickConfigData,
    isCompleteOneClickRule,

    // Mapping
    mapOldRuleToNew,

    // Execution context
    createExecutionContext,
  };
}

export default useCoPilotRules;
