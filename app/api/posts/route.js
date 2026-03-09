import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { withAuth } from '@/lib/middleware'
import { createPostSchema } from '@/lib/validators'

export const GET = withAuth(async (request) => {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const month    = searchParams.get('month')
    const platform = searchParams.get('platform')
    const status   = searchParams.get('status')

    if (!month) {
      return NextResponse.json(
        { success: false, message: 'month param required (yyyy-MM)' },
        { status: 400 }
      )
    }

    const [year, mon] = month.split('-').map(Number)
    const start = new Date(year, mon - 1, 1)
    const end   = new Date(year, mon, 1)

    const query = {
      userId:      request.user.userId,
      createdAt:   { $gte: start, $lt: end },
    }

    if (platform) query.platforms = platform
    if (status)   query.status    = status

    const posts = await Post.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error('[GET POSTS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request) => {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body required' },
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
      platforms, caption, imageUrl,
      imagekitFileId, postType, scheduledAt
    } = result.data

    await connectDB()

    // ✅ For 'now' posts — create as draft first, then publish
    // For 'scheduled' posts — create as scheduled
    const post = await Post.create({
      userId:         request.user.userId,
      caption,
      imageUrl:       imageUrl       || null,
      imagekitFileId: imagekitFileId || null,
      platforms,
      postType,
      status:         postType === 'now' ? 'draft' : 'scheduled',
      scheduledAt:    postType === 'scheduled' ? new Date(scheduledAt) : null,
      publishResults: { twitter: null, linkedin: null },
    })

    // ✅ If postType is 'now' — immediately call publish API internally
    if (postType === 'now') {
      // Import publishers dynamically to avoid circular deps
      const { publishPostNow } = await import('@/lib/publishHelper')
      const updatedPost = await publishPostNow(post, request.user.userId)
      return NextResponse.json({
        success: true,
        post:    updatedPost,
      })
    }

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error('[CREATE POST ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    )
  }
})