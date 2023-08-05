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
        balance: {
            type: Object,
            required: true
        },
        totalUSD:{
            type: Number,
            required: true
        },
        timestamp:{
            type: Date,
            required: true
        }
    },
})
