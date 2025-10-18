import { defineMongooseModel } from '#nuxt/mongoose'
export const userExchangesSchema = defineMongooseModel({
    name: 'userExchanges',
    schema: {
        userID: {
            type: String,
            required: true
        },
        exchange: {
            type: String,
            required: true
        },
        timeframes: {
            type: Object,
            required: true
        },
        isSelectedExchange:{
            type: Boolean,
            required: true
        },
        markets:{
            type: Array,
            required: true
        },
        selectedMarket: {
            type: Object,
            required: true
        },
        apiKeys: {
            // Array of objects: [{ name: "Main Account", keys: [{key: "apiKey", value: "..."}, {key: "secret", value: "..."}] }]
            type: Array,
            required: true
        },
    },
})
