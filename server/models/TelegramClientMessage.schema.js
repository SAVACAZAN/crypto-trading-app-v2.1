import { defineMongooseModel } from '#nuxt/mongoose';

export default defineMongooseModel({
  name: 'TelegramClientMessage',
  schema: {
    // User who owns this message record
    userID: {
      type: String,
      required: true,
      index: true
    },

    // Chat information
    chatId: {
      type: Number,
      required: true,
      index: true
    },
    chatType: {
      type: String,
      enum: ['private', 'group', 'supergroup', 'channel'],
      required: true
    },
    chatName: {
      type: String,
      required: true
    },

    // Message information
    messageId: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    date: {
      type: Number,
      required: true
    },
    isOutgoing: {
      type: Boolean,
      default: false
    },

    // Sender information (for received messages)
    sender: {
      id: { type: Number },
      firstName: { type: String },
      lastName: { type: String },
      username: { type: String }
    },

    // Media type if message contains media
    mediaType: {
      type: String
    },

    // Reply information
    replyToMsgId: {
      type: Number
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  options: {
    timestamps: true,
    // Compound index for efficient queries
    indexes: [
      { userID: 1, chatId: 1, date: -1 },
      { userID: 1, chatId: 1, messageId: 1 }
    ]
  }
});
