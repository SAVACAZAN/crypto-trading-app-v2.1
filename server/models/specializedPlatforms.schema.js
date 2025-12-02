import mongoose from 'mongoose';

const { Schema } = mongoose;

const specializedPlatformsSchema = new Schema({
  userID: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['asterdex', 'omni'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  passphrase: {
    type: String,
    required: true
  },
  secret: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
specializedPlatformsSchema.index({ userID: 1, platform: 1 });

// Export using mongoose.models pattern to avoid re-compilation errors
export default mongoose.models.SpecializedPlatforms || mongoose.model('SpecializedPlatforms', specializedPlatformsSchema);
