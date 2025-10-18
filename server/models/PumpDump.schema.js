 import { defineMongooseModel } from '#nuxt/mongoose'
 export const PumpDumpSchema = defineMongooseModel({
    name: 'PumpDump',
    schema: {
      userID: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      exchange: {
        type: String,
        required: true
      },
      symbol: {
        type: String,
        required: true
      },
      buyPrice: {
        type: Number,
        required: false
      },
      buySize: {
        type: Number,
        required: false
      },
      sellPrice: {
        type: Number,
        required: false
      },
      sellSize: {
        type: Number,
        required: false
      },
      activeOrders: {
        type: [
          {
            id: { type: String, required: true },
            side: { type: String, enum: ['BUY', 'SELL'], required: true },
            amount: { type: Number, required: true },
            price: { type: Number, required: true },
            symbol: { type: String, required: true }
          }
        ],
        default: []
      },
      filledOrders: {
        type: [
          {
            id: { type: String, required: true },
            side: { type: String, enum: ['BUY', 'SELL'], required: true },
            amount: { type: Number, required: true },
            price: { type: Number, required: true },
            symbol: { type: String, required: true }
          }
        ],
        default: []
      }
    }
  })