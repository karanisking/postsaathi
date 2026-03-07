import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import Account from '@/models/Account'
import { withAuth } from '@/lib/middleware'
import { postToTwitter }   from '@/lib/publishers/twitter'
import { postToLinkedIn }  from '@/lib/publishers/linkedin'
// import { postToInstagram } from '@/lib/publishers/instagram'  // V2
// import { postToFacebook }  from '@/lib/publishers/facebook'   // V2

// POST /api/publish/:id — publish a specific post now
export const POST = withAuth(async (request, context) => {
  try {
    const { id } = await context.params

    await connectDB()

    // Find post — must belong to user
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

    // Only publish draft or scheduled posts
    if (['published', 'publishing'].includes(post.status)) {
      return NextResponse.json(
        { success: false, message: `Post is already ${post.status}` },
        { status: 400 }
      )
    }

    // Set status to publishing
    post.status = 'publishing'
    await post.save()

    // Publish to each platform
    const results = await publishToPlatforms(post, request.user.userId)

    // Check if all platforms succeeded or some failed
    const allSuccess = Object.values(results).every((r) => r.success)
    const anySuccess = Object.values(results).some((r) => r.success)

    const finalStatus = allSuccess
      ? 'published'
      : anySuccess
      ? 'published'   // partial success — still mark published
      : 'failed'

    // Update post with results
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: {
          status:         finalStatus,
          publishedAt:    anySuccess ? new Date() : null,
          publishResults: results,
        },
      },
      { new: true }
    )

    return NextResponse.json({
      success: anySuccess,
      post:    updatedPost,
      results,
    })
  } catch (error) {
    console.error('[PUBLISH ERROR]', error)

    // Mark post as failed if error
    await Post.findByIdAndUpdate(context.params.id, {
      $set: { status: 'failed' },
    })

    return NextResponse.json(
      { success: false, message: 'Publishing failed' },
      { status: 500 }
    )
  }
})

// ── Publish to all platforms in post.platforms ────────
async function publishToPlatforms(post, userId) {
  const results = {}

  for (const platform of post.platforms) {
    // Get account token for this platform
    const account = await Account.findOne({
      userId,
      platform,
      isActive: true,
    }).select('+accessToken')

    if (!account) {
      results[platform] = {
        success: false,
        postId:  null,
        error:   `No connected ${platform} account found`,
      }
      continue
    }

    // Call correct publisher
    if (platform === 'twitter') {
      results[platform] = await postToTwitter({
        accessToken: account.accessToken,
        caption:     post.caption,
        imageUrl:    post.imageUrl,
      })
    }

    if (platform === 'linkedin') {
      results[platform] = await postToLinkedIn({
        accessToken:    account.accessToken,
        caption:        post.caption,
        imageUrl:       post.imageUrl,
        platformUserId: account.platformUserId,
      })
    }

    // if (platform === 'instagram') {  // V2
    //   results[platform] = await postToInstagram({
    //     accessToken: account.accessToken,
    //     caption:     post.caption,
    //     imageUrl:    post.imageUrl,
    //   })
    // }

    // if (platform === 'facebook') {   // V2
    //   results[platform] = await postToFacebook({
    //     accessToken: account.accessToken,
    //     caption:     post.caption,
    //     imageUrl:    post.imageUrl,
    //   })
    // }

    // Update account lastUsedAt
    await Account.findByIdAndUpdate(account._id, {
      $set: { lastUsedAt: new Date() },
    })
  }

  return results
}