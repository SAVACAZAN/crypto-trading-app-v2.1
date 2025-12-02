import { create, all } from 'mathjs';
import moment from 'moment';
import { CoPilotBotSchema } from "../models/CoPilotBot.schema";

const config = {
    number: 'BigNumber',
    precision: 20
};

const math = create(all, config);

/**
 * ✈️ CO-PILOT BOT LIBRARY (REFACTORED)
 *
 * Purpose: Simple bot creation for Co-Pilot system
 * This is NOT a trading bot - it's a container for automation rules
 *
 * The REAL logic is in CoPilotBotEngine.js (monitoring & execution)
 */
export default defineNitroPlugin((nitroApp) => {
    console.log('✈️ Co-Pilot Bots Library Loaded...');

    nitroApp.CoPilotBotLib = {
        /**
         * Create a Co-Pilot bot (Rule Container)
         *
         * @param {Object} data - Bot configuration
         * @param {String} data.userID - User ID
         * @param {String} data.name - Bot name
         * @param {String} data.exchange - Exchange name
         * @param {String} [data.symbol] - Optional: Specific symbol to monitor
         * @param {Array} [data.apiKeyNames] - Optional: API keys to monitor
         * @param {String} [data.description] - Optional: Bot description
         *
         * @returns {Promise<Object>} Created bot
         */
        async createBot(data) {
            console.log('🆕 [CoPilotBotLib] Creating Co-Pilot bot:', {
                userID: data.userID,
                name: data.name,
                exchange: data.exchange,
                symbol: data.symbol
            });

            try {
                // Simple bot creation - just a container for rules
                const botData = {
                    userID: data.userID,
                    name: data.name || `CoPilot_${Date.now()}`,
                    exchange: data.exchange,
                    symbol: data.symbol || null, // null = monitor all symbols
                    description: data.description || 'Co-Pilot automation bot',

                    // API keys to monitor (empty = all user's keys)
                    apiKeyNames: data.apiKeyNames || [],

                    // Status
                    status: 'active',
                    isMonitoring: true,

                    // Rule tracking
                    ruleCounter: 0,
                    automationRules: [],

                    // Statistics
                    totalRulesCreated: 0,
                    totalRulesExecuted: 0,
                    totalBotsCreated: 0,

                    // Timestamps
                    createdAt: new Date(),
                    startedAt: new Date()
                };

                const bot = await new CoPilotBotSchema(botData).save();

                console.log('✅ [CoPilotBotLib] Co-Pilot bot created successfully:', {
                    botId: bot._id,
                    name: bot.name
                });

                return bot;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error creating bot:', error);
                throw error;
            }
        },

        /**
         * Fetch all Co-Pilot bots for a user
         *
         * @param {String} userID - User ID
         * @returns {Promise<Array>} Array of bots
         */
        async fetchCoPilotBots(userID) {
            try {
                const bots = await CoPilotBotSchema.find({ userID }).sort({ createdAt: -1 });

                console.log(`📊 [CoPilotBotLib] Found ${bots.length} Co-Pilot bots for user ${userID}`);

                return bots;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error fetching bots:', error);
                throw error;
            }
        },

        /**
         * Update bot status
         *
         * @param {String} botId - Bot ID
         * @param {String} status - New status (active, paused, stopped)
         * @returns {Promise<Object>} Updated bot
         */
        async updateBotStatus(botId, status) {
            try {
                const bot = await CoPilotBotSchema.findByIdAndUpdate(
                    botId,
                    {
                        status,
                        isMonitoring: status === 'active',
                        ...(status === 'stopped' && { stoppedAt: new Date() })
                    },
                    { new: true }
                );

                console.log(`🔄 [CoPilotBotLib] Bot ${botId} status updated to: ${status}`);

                return bot;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error updating bot status:', error);
                throw error;
            }
        },

        /**
         * Delete a Co-Pilot bot
         *
         * @param {String} botId - Bot ID
         * @returns {Promise<Boolean>} Success
         */
        async deleteBot(botId) {
            try {
                await CoPilotBotSchema.findByIdAndDelete(botId);

                console.log(`🗑️ [CoPilotBotLib] Bot ${botId} deleted`);

                return true;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error deleting bot:', error);
                throw error;
            }
        },

        /**
         * Increment rule counter and return next rule number
         *
         * @param {String} botId - Bot ID
         * @returns {Promise<Number>} Next rule number
         */
        async getNextRuleNumber(botId) {
            try {
                const bot = await CoPilotBotSchema.findByIdAndUpdate(
                    botId,
                    {
                        $inc: { ruleCounter: 1, totalRulesCreated: 1 }
                    },
                    { new: true }
                );

                return bot.ruleCounter;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error getting next rule number:', error);
                throw error;
            }
        },

        /**
         * Record rule execution
         *
         * @param {String} botId - Bot ID
         * @param {String} ruleId - Rule ID
         * @returns {Promise<Boolean>} Success
         */
        async recordRuleExecution(botId, ruleId) {
            try {
                await CoPilotBotSchema.findByIdAndUpdate(
                    botId,
                    {
                        $inc: { totalRulesExecuted: 1 },
                        $set: { lastRuleExecutedAt: new Date() }
                    }
                );

                console.log(`📊 [CoPilotBotLib] Recorded execution for bot ${botId}, rule ${ruleId}`);

                return true;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error recording rule execution:', error);
                throw error;
            }
        },

        /**
         * Record bot creation from rule
         *
         * @param {String} botId - Co-Pilot bot ID
         * @param {String} createdBotId - Created trading bot ID
         * @param {String} botType - Type of bot created
         * @returns {Promise<Boolean>} Success
         */
        async recordBotCreation(botId, createdBotId, botType) {
            try {
                await CoPilotBotSchema.findByIdAndUpdate(
                    botId,
                    {
                        $inc: { totalBotsCreated: 1 },
                        $push: {
                            createdBots: {
                                botId: createdBotId,
                                botType,
                                createdAt: new Date()
                            }
                        }
                    }
                );

                console.log(`🤖 [CoPilotBotLib] Recorded bot creation: ${botType} (${createdBotId})`);

                return true;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error recording bot creation:', error);
                throw error;
            }
        },

        /**
         * Get bot statistics
         *
         * @param {String} botId - Bot ID
         * @returns {Promise<Object>} Statistics
         */
        async getBotStats(botId) {
            try {
                const bot = await CoPilotBotSchema.findById(botId);

                if (!bot) {
                    throw new Error('Bot not found');
                }

                const stats = {
                    botId: bot._id,
                    name: bot.name,
                    status: bot.status,
                    isMonitoring: bot.isMonitoring,

                    // Rule stats
                    totalRulesCreated: bot.totalRulesCreated || 0,
                    totalRulesExecuted: bot.totalRulesExecuted || 0,
                    activeRules: bot.automationRules?.filter(r => r.isActive).length || 0,

                    // Bot creation stats
                    totalBotsCreated: bot.totalBotsCreated || 0,
                    createdBots: bot.createdBots || [],

                    // Timestamps
                    createdAt: bot.createdAt,
                    startedAt: bot.startedAt,
                    lastRuleExecutedAt: bot.lastRuleExecutedAt,
                    uptime: bot.startedAt ? Date.now() - new Date(bot.startedAt).getTime() : 0
                };

                return stats;
            } catch (error) {
                console.error('❌ [CoPilotBotLib] Error getting bot stats:', error);
                throw error;
            }
        },

        /**
         * Utility: Get current time formatted
         */
        getCurrentTime() {
            return moment(new Date()).format('lll');
        }
    };

    console.log('✅ Co-Pilot Bots Library Ready');
});
