import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * CoPilot Rule Templates - Reusable automation rule templates
 * These are saved templates that can be applied to any order
 */
export const CoPilotRuleTemplateSchema = defineMongooseModel({
    name: 'CoPilotRuleTemplate',
    schema: {
        templateNumber: {
            type: Number,
            required: true
        },
        userID: {
            type: String,
            required: true,
            index: true
        },
        templateName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        ruleType: {
            type: String,
            required: true,
            enum: ['copy_order', 'reverse_order', 'create_bot', 'cancel_order', 'modify_order', 'chain_action']
        },
        triggerCondition: {
            type: String,
            required: true,
            enum: ['on_fill', 'on_partial_fill', 'on_cancel', 'on_price_change', 'on_time', 'manual']
        },
        actionConfig: {
            // For copy_order
            targetApiKeys: [String],
            copyMultiplier: Number,
            priceOffset: Number,

            // For reverse_order
            reverseRatio: Number,

            // For create_bot
            botType: String,
            botConfig: Object,

            // For chain_action
            nextRuleId: String,
            delaySeconds: Number
        },
        isGlobal: {
            type: Boolean,
            default: false
        },
        usageCount: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
})
