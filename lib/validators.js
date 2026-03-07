import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const createPostBase = z.object({
  caption: z.string().min(1, 'Caption is required').max(63206, 'Caption too long'),
  imageUrl: z.string().url().optional().nullable(),
  imagekitFileId: z.string().optional().nullable(),
  platforms: z
    .array(z.enum([
      'twitter',
      'linkedin',
      // 'instagram',  // V2
      // 'facebook',   // V2
    ]))
    .min(1, 'Select at least one platform'),
  postType: z.enum(['now', 'scheduled']),
  scheduledAt: z.string().datetime().optional().nullable(),
})

export const createPostSchema = createPostBase.refine(
  (data) => {
    if (data.postType === 'scheduled' && !data.scheduledAt) return false
    return true
  },
  { message: 'Scheduled date is required when postType is scheduled' }
)

// ✅ Written manually — no .partial() on refined schema
export const updatePostSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(63206, 'Caption too long').optional(),
  imageUrl: z.string().url().optional().nullable(),
  imagekitFileId: z.string().optional().nullable(),
  platforms: z
    .array(z.enum([
      'twitter',
      'linkedin',
      // 'instagram',  // V2
      // 'facebook',   // V2
    ]))
    .min(1, 'Select at least one platform')
    .optional(),
  postType: z.enum(['now', 'scheduled']).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
})

export const captionSchema = z.object({
  topic: z.string().min(2, 'Topic is required').max(200),
  platforms: z.array(z.enum([
    'twitter',
    'linkedin',
    // 'instagram',  // V2
    // 'facebook',   // V2
  ])).min(1),
  tone: z.enum(['casual', 'professional', 'funny', 'inspirational', 'promotional']),
})

export const accountSchema = z.object({
  platform: z.enum([
    'twitter',
    'linkedin',
    // 'instagram',  // V2
    // 'facebook',   // V2
  ]),
  accessToken: z.string().min(1, 'Access token is required'),
  accessTokenSecret: z.string().optional().nullable(),
  accountName: z.string().min(1, 'Account name is required'),
  accountHandle: z.string().optional().nullable(),
  accountAvatar: z.string().url().optional().nullable(),
  platformUserId: z.string().min(1, 'Platform user ID is required'),
  tokenExpiresAt: z.string().datetime().optional().nullable(),
})