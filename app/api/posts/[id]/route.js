import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { withAuth } from '@/lib/middleware'
import { updatePostSchema } from '@/lib/validators'
import { deleteImage } from '@/lib/imagekit'

// GET /api/posts/:id — get full post detail including all platforms
export const GET = withAuth(async (request, context) => {
  try {
    const { id } = await context.params

    await connectDB()

    // Return full post — all fields including platforms array + publishResults
    const post = await Post.findOne({
      _id:    id,
      userId: request.user.userId,
    }).lean()

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('[POST GET ONE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/posts/:id — update post
// Can update: caption, imageUrl, imagekitFileId, platforms[], postType, scheduledAt
export const PUT = withAuth(async (request, context) => {
  try {
    const { id } = await context.params

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body is required' },
        { status: 400 }
      )
    }

    const result = updatePostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

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

    // Block editing published or currently publishing posts
    if (['published', 'publishing'].includes(post.status)) {
      return NextResponse.json(
        { success: false, message: `Cannot edit a post that is already ${post.status}` },
        { status: 400 }
      )
    }

    const updateData = { ...result.data }

    // If scheduledAt updated — must be in future
    if (updateData.scheduledAt) {
      if (new Date(updateData.scheduledAt) <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }
      updateData.scheduledAt = new Date(updateData.scheduledAt)
    }

    // If postType changed — update status accordingly
    if (updateData.postType) {
      updateData.status = updateData.postType === 'now' ? 'publishing' : 'scheduled'
    }

    // platforms array — fully replaced with new array
    // e.g. was ['twitter', 'linkedin'] → update to ['twitter'] only
    // this is how user removes a platform from a post

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    return NextResponse.json({ success: true, post: updatedPost })
  } catch (error) {
    console.error('[POST UPDATE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/posts/:id
// Deletes post from ALL platforms (DB record only for published posts)
// If user wants to remove from one platform → use PUT to update platforms array
export const DELETE = withAuth(async (request, context) => {
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

    // Block delete if currently publishing
    if (post.status === 'publishing') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete a post that is currently publishing' },
        { status: 400 }
      )
    }

    // Block delete if scheduled time already passed
    // (means cron may have already picked it up)
    if (post.status === 'scheduled' && post.scheduledAt) {
      if (post.scheduledAt <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Cannot delete — scheduled time has already passed' },
          { status: 400 }
        )
      }
    }

    // Delete image from ImageKit if exists
    if (post.imagekitFileId) {
      await deleteImage(post.imagekitFileId)
    }

    await Post.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully from all platforms',
    })
  } catch (error) {
    console.error('[POST DELETE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})