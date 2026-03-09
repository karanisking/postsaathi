import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { withAuth } from '@/lib/middleware'
import { publishPostNow } from '@/lib/publishHelper'

export const POST = withAuth(async (request, context) => {
  try {
    const { id } = await context.params
    await connectDB()

    const post = await Post.findOne({
      _id:    id,
      userId: request.user.userId,
    })

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    if (['published', 'publishing'].includes(post.status)) {
      return NextResponse.json(
        { success: false, message: `Post is already ${post.status}` },
        { status: 400 }
      )
    }

    const updatedPost = await publishPostNow(post, request.user.userId)
    const anySuccess  = Object.values(updatedPost.publishResults || {}).some((r) => r?.success)

    return NextResponse.json({
      success: anySuccess,
      post:    updatedPost,
    })
  } catch (error) {
    console.error('[PUBLISH ERROR]', error)
    if (context?.params?.id) {
      await Post.findByIdAndUpdate(context.params.id, {
        $set: { status: 'failed' }
      }).catch(() => {})
    }
    return NextResponse.json(
      { success: false, message: 'Publishing failed' },
      { status: 500 }
    )
  }
})