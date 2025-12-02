import AutomationRule from '~/server/models/palantir/automationRule.schema.js';
import BotChain from '~/server/models/palantir/botChain.schema.js';
import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';

/**
 * EventEngine - Handles event-driven automation and rule execution
 */
class EventEngine {
  constructor() {
    this.eventQueue = [];
    this.processingInterval = null;
    this.eventHandlers = new Map();
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.eventHandlers.set('BOT_STARTED', this.handleBotStarted.bind(this));
    this.eventHandlers.set('BOT_STOPPED', this.handleBotStopped.bind(this));
    this.eventHandlers.set('PROFIT_THRESHOLD', this.handleProfitThreshold.bind(this));
    this.eventHandlers.set('LOSS_THRESHOLD', this.handleLossThreshold.bind(this));
    this.eventHandlers.set('PATTERN_DETECTED', this.handlePatternDetected.bind(this));
    this.eventHandlers.set('PRICE_ALERT', this.handlePriceAlert.bind(this));
    this.eventHandlers.set('CHAIN_COMPLETED', this.handleChainCompleted.bind(this));
    this.eventHandlers.set('CHAIN_FAILED', this.handleChainFailed.bind(this));
  }

  /**
   * Start the engine
   */
  start() {
    console.log('⚡ EventEngine started');

    // Process event queue every 2 seconds
    this.processingInterval = setInterval(() => {
      this.processEventQueue();
    }, 2000);

    // Monitor for pattern detections
    this.monitorPatterns();
  }

  /**
   * Stop the engine
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('⏹️  EventEngine stopped');
  }

  /**
   * Emit an event
   */
  async emit(eventType, eventData) {
    console.log(`📡 Event emitted: ${eventType}`, eventData);

    this.eventQueue.push({
      type: eventType,
      data: eventData,
      timestamp: new Date()
    });

    // Process immediately if queue is small
    if (this.eventQueue.length < 5) {
      await this.processEventQueue();
    }
  }

  /**
   * Process event queue
   */
  async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    const event = this.eventQueue.shift();

    try {
      await this.processEvent(event);
    } catch (error) {
      console.error(`❌ Error processing event ${event.type}:`, error);
    }
  }

  /**
   * Process a single event
   */
  async processEvent(event) {
    const { type, data } = event;

    // Find matching automation rules
    const matchingRules = await this.findMatchingRules(type, data);

    console.log(`🔍 Found ${matchingRules.length} matching rules for event ${type}`);

    // Execute each matching rule
    for (const rule of matchingRules) {
      await this.executeRule(rule, event);
    }

    // Call event-specific handler
    const handler = this.eventHandlers.get(type);
    if (handler) {
      await handler(data);
    }
  }

  /**
   * Find automation rules matching the event
   */
  async findMatchingRules(eventType, eventData) {
    try {
      const rules = await AutomationRule.find({
        enabled: true,
        'trigger.event': eventType
      });

      // Filter rules based on conditions
      return rules.filter(rule => {
        return this.checkRuleConditions(rule, eventData);
      });
    } catch (error) {
      console.error('❌ Error finding matching rules:', error);
      return [];
    }
  }

  /**
   * Check if rule conditions are met
   */
  checkRuleConditions(rule, eventData) {
    const { conditions } = rule.trigger;

    if (!conditions || conditions.length === 0) return true;

    // All conditions must be met
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const eventValue = this.getNestedValue(eventData, field);

      switch (operator) {
        case '==': return eventValue == value;
        case '!=': return eventValue != value;
        case '>': return eventValue > value;
        case '>=': return eventValue >= value;
        case '<': return eventValue < value;
        case '<=': return eventValue <= value;
        case 'contains': return String(eventValue).includes(String(value));
        default: return false;
      }
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Execute an automation rule
   */
  async executeRule(rule, event) {
    try {
      // Check cooldown
      if (rule.cooldown.enabled && rule.cooldown.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.cooldown.lastTriggered.getTime();
        const cooldownMs = rule.cooldown.duration * 1000;

        if (timeSinceLastTrigger < cooldownMs) {
          console.log(`⏰ Rule ${rule.ruleId} is in cooldown`);
          return;
        }
      }

      // Check daily limits
      const today = new Date().toDateString();
      const lastResetDay = rule.limits.lastReset.toDateString();

      if (today !== lastResetDay) {
        rule.limits.executionsToday = 0;
        rule.limits.lastReset = new Date();
      }

      if (rule.limits.executionsToday >= rule.limits.maxExecutionsPerDay) {
        console.log(`⚠️  Rule ${rule.ruleId} daily limit reached`);
        return;
      }

      console.log(`⚙️  Executing rule: ${rule.name} (${rule.ruleId})`);

      // Execute all actions
      for (const action of rule.actions) {
        await this.executeAction(action, event.data);
      }

      // Update rule stats
      rule.executionCount++;
      rule.lastExecuted = new Date();
      rule.limits.executionsToday++;

      if (rule.cooldown.enabled) {
        rule.cooldown.lastTriggered = new Date();
      }

      await rule.save();

      console.log(`✅ Rule executed: ${rule.name}`);
    } catch (error) {
      console.error(`❌ Error executing rule ${rule.ruleId}:`, error);
    }
  }

  /**
   * Execute a single action
   */
  async executeAction(action, eventData) {
    const { type, config } = action;

    console.log(`🎬 Executing action: ${type}`);

    switch (type) {
      case 'START_BOT':
        // Would integrate with bot creation
        console.log(`🤖 Starting bot: ${config.botType}`);
        break;

      case 'STOP_BOT':
        console.log(`🛑 Stopping bot: ${config.botId}`);
        break;

      case 'START_CHAIN':
        const chain = await BotChain.findOne({ chainId: config.chainId });
        if (chain) {
          chain.enabled = true;
          chain.status = 'running';
          await chain.save();
          console.log(`⛓️  Started chain: ${config.chainId}`);
        }
        break;

      case 'SEND_NOTIFICATION':
        console.log(`📧 Notification: ${config.message}`);
        // Would integrate with notification system
        break;

      case 'SEND_WEBHOOK':
        console.log(`🔗 Webhook to: ${config.url}`);
        // Would send HTTP request
        break;

      default:
        console.log(`⚠️  Unknown action type: ${type}`);
    }
  }

  /**
   * Monitor for new pattern detections
   */
  async monitorPatterns() {
    setInterval(async () => {
      try {
        // Check for patterns detected in last 10 seconds
        const recentPatterns = await PatternDetection.find({
          detectedAt: { $gte: new Date(Date.now() - 10000) }
        }).limit(10);

        for (const pattern of recentPatterns) {
          await this.emit('PATTERN_DETECTED', {
            patternType: pattern.patternType,
            symbol: pattern.symbol,
            timeframe: pattern.timeframe,
            confidence: pattern.confidence,
            price: pattern.price || pattern.metrics?.currentPrice || 0,
            volume: pattern.volume || pattern.metrics?.currentVolume || 0,
            signal: pattern.signal
          });
        }
      } catch (error) {
        console.error('❌ Error monitoring patterns:', error);
      }
    }, 10000);
  }

  // Event handlers
  async handleBotStarted(data) {
    console.log(`🟢 Bot started: ${data.botId}`);
  }

  async handleBotStopped(data) {
    console.log(`🔴 Bot stopped: ${data.botId}`);
  }

  async handleProfitThreshold(data) {
    console.log(`💰 Profit threshold reached: ${data.profit}%`);
  }

  async handleLossThreshold(data) {
    console.log(`⚠️  Loss threshold reached: ${data.loss}%`);
  }

  async handlePatternDetected(data) {
    console.log(`🔍 Pattern detected: ${data.patternType} on ${data.symbol}`);
  }

  async handlePriceAlert(data) {
    console.log(`💲 Price alert: ${data.symbol} ${data.operator} ${data.price}`);
  }

  async handleChainCompleted(data) {
    console.log(`✅ Chain completed: ${data.chainId}`);
  }

  async handleChainFailed(data) {
    console.log(`❌ Chain failed: ${data.chainId}`);
  }
}

// Export singleton instance
export default new EventEngine();
