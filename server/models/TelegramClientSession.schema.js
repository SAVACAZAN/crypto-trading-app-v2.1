import { defineMongooseModel } from '#nuxt/mongoose';

export default defineMongooseModel({
  name: 'TelegramClientSession',
  schema: {
    userID: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sessionString: {
      type: String,
      required: false
    },
    phoneNumber: {
      type: String,
      required: false
    },
    phoneCodeHash: {
      type: String,
      required: false
    },
    qrLoginToken: {
      type: String,
      required: false
    },
    qrLoginTokenRaw: {
      type: String,
      required: false
    },
    qrExpiresAt: {
      type: Date,
      required: false
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    },
    loginType: {
      type: String,
      enum: ['qr', 'sms', 'hacked'],
      required: false,
      default: 'sms'
    },
    userInfo: {
      id: { type: Number },
      firstName: { type: String },
      lastName: { type: String },
      username: { type: String },
      phone: { type: String },
      photoUrl: { type: String }
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  options: {
    timestamps: true
  }
});
