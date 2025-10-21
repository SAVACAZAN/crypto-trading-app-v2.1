import { defineMongooseModel } from '#nuxt/mongoose'
export const balanceSchema = defineMongooseModel({
    name: 'balance',
    schema: {
        userID: {
            type: String,
            required: true
        },
        exchange: {
            type: String,
            required: true
        },
        apiKeyName: {
            type: String,
            required: true
        },
        balance: {
            type: Object,
            required: true
        },
        totalUSD:{
            type: Number,
            required: false,
            default: 0
        },
        timestamp:{
            type: Date,
            required: true
        },
        lastUpdated:{
            type: Date,
            required: true,
            default: Date.now
        }
    },
    options: {
        timestamps: true
    }
})
