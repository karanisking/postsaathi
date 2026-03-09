// models/Post.js
import mongoose from 'mongoose'

const PublishResultSchema = new mongoose.Schema(
  {
    success: { type: Boolean, default: false },
    postId: { type: String, default: null },  // ID returned by platform
    error: { type: String, default: null },
  },
  { _id: false }
)

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caption: {
      type: String,
      required: [true, 'Caption is required'],
      maxlength: [63206, 'Caption too long'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagekitFileId: {
      type: String,
      default: null,
    },
    platforms: {
      type: [String],
      // Twitter and LinkedIn are active
      // Instagram and Facebook commented — will enable in V2
      enum: [
        'twitter',
        'linkedin',
        // 'instagram',  // V2 — needs Meta OAuth approval
        // 'facebook',   // V2 — needs Meta OAuth approval
      ],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one platform required',
      },
    },
    postType: {
      type: String,
      enum: ['now', 'scheduled'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
      default: 'draft',
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    // ─── Publish Results Per Platform ───────────────
    publishResults: {
      twitter: { type: PublishResultSchema, default: null },
      linkedin: { type: PublishResultSchema, default: null },
      // instagram: { type: PublishResultSchema, default: null },  // V2
      // facebook:  { type: PublishResultSchema, default: null },  // V2
    },

    // ─── Deletion Rules ─────────────────────────────
    // Post can be deleted if:
    // 1. status === 'scheduled' AND scheduledAt > Date.now() (not yet posted)
    // 2. status === 'draft'
    // 3. status === 'failed'
    // 4. status === 'published' (deletes from our DB only, not from platform)
    // This is enforced in the DELETE route, not in the model
  },
  { timestamps: true }
)

export default mongoose.models.Post || mongoose.model('Post', PostSchema)