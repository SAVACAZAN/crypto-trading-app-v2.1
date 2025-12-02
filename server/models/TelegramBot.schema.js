import { defineMongooseModel } from '#nuxt/mongoose';

export default defineMongooseModel({
  name: 'TelegramBot',
  schema: {
    userID: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    botId: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  },
  options: {
    timestamps: true
  }
});
