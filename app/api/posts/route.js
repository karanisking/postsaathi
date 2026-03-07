import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { withAuth } from '@/lib/middleware'
import { createPostSchema } from '@/lib/validators'

// GET /api/posts?month=2026-03
// Optional filters: ?month=2026-03&platform=twitter&status=scheduled
export const GET = withAuth(async (request) => {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const month    = searchParams.get('month')    // required: format 2026-03
    const platform = searchParams.get('platform') // optional: twitter | linkedin
    const status   = searchParams.get('status')   // optional: scheduled | published | failed | draft

    // month is required
    if (!month) {
      return NextResponse.json(
        { success: false, message: 'month query param is required (format: 2026-03)' },
        { status: 400 }
      )
    }

    // Build filter
    const filter = { userId: request.user.userId }

    // Month range filter
    const start = new Date(`${month}-01`)
    const end   = new Date(start)
    end.setMonth(end.getMonth() + 1)
    filter.scheduledAt = { $gte: start, $lt: end }

    // Optional platform filter
    if (platform) {
      filter.platforms = { $in: [platform] }
    }

    // Optional status filter
    if (status) {
      filter.status = status
    }

    const posts = await Post.find(filter)
      .select('_id caption imageUrl platforms postType status scheduledAt publishedAt publishResults createdAt')
      .sort({ scheduledAt: 1, createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error('[POSTS GET ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/posts — create post
export const POST = withAuth(async (request) => {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body is required' },
        { status: 400 }
      )
    }

    const result = createPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      caption,
      imageUrl,
      imagekitFileId,
      platforms,   // array — ['twitter', 'linkedin']
      postType,
      scheduledAt,
    } = result.data

    await connectDB()

    // scheduledAt must be in future if scheduled
    if (postType === 'scheduled') {
      if (new Date(scheduledAt) <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }
    }

    const status = postType === 'now' ? 'publishing' : 'scheduled'

    const post = await Post.create({
      userId:         request.user.userId,
      caption,
      imageUrl:       imageUrl       || null,
      imagekitFileId: imagekitFileId || null,
      platforms,     // full array saved
      postType,
      status,
      scheduledAt:   scheduledAt ? new Date(scheduledAt) : null,
    })

    return NextResponse.json(
      { success: true, post },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST CREATE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})