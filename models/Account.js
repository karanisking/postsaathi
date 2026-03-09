// models/Account.js
import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: [
        'twitter',
        'linkedin',
        // 'instagram',  // V2 — needs Meta OAuth approval
        // 'facebook',   // V2 — needs Meta OAuth approval
      ],
      required: true,
    },
    // OAuth 2.0 access token
    accessToken: {
      type: String,
      required: true,
      select: false,
    },
    // OAuth 1.0a token secret — Twitter only
    // Twitter posting uses OAuth 1.0a under the hood
    accessTokenSecret: {
      type: String,
      default: null,
      select: false,
    },
    // Token expiry
    // Twitter → never expires
    // LinkedIn → expires in 60 days
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    // Profile info pulled after OAuth
    accountName: {
      type: String,
      required: true,
    },
    accountHandle: {
      type: String,   // @username for Twitter
      default: null,
    },
    accountAvatar: {
      type: String,
      default: null,
    },
    platformUserId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // V1 = real OAuth for Twitter + LinkedIn
    // isMocked = true for Instagram + Facebook in V2 until Meta approves
    isMocked: {
      type: Boolean,
      default: false,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// One user can't connect same platform account twice
AccountSchema.index(
  { userId: 1, platform: 1, platformUserId: 1 },
  { unique: true }
)

export default mongoose.models.Account || mongoose.model('Account', AccountSchema)