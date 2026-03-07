import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import Account from '@/models/Account'
import { postToTwitter }   from '@/lib/publishers/twitter'
import { postToLinkedIn }  from '@/lib/publishers/linkedin'
// import { postToInstagram } from '@/lib/publishers/instagram'  // V2
// import { postToFacebook }  from '@/lib/publishers/facebook'   // V2

// POST /api/publish/cron
// Called by Vercel Cron every minute
// Finds all scheduled posts due for publishing and publishes them
export async function POST(request) {
  try {
    // Verify cron secret — prevent unauthorized calls
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const now = new Date()

    // Find all scheduled posts due now or overdue
    const duePosts = await Post.find({
      status:      'scheduled',
      scheduledAt: { $lte: now },
    })

    if (duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts due',
        processed: 0,
      })
    }

    console.log(`[CRON] Found ${duePosts.length} posts to publish`)

    const processedResults = []

    for (const post of duePosts) {
      // Mark as publishing immediately to prevent double publishing
      await Post.findByIdAndUpdate(post._id, {
        $set: { status: 'publishing' },
      })

      // Publish to all platforms
      const results  = await publishToPlatforms(post)
      const anySuccess = Object.values(results).some((r) => r.success)
      const finalStatus  = anySuccess ? 'published' : 'failed'

      // Update post with results
      await Post.findByIdAndUpdate(post._id, {
        $set: {
          status:         finalStatus,
          publishedAt:    anySuccess ? new Date() : null,
          publishResults: results,
        },
      })

      processedResults.push({
        postId:  post._id,
        status:  finalStatus,
        results,
      })

      console.log(`[CRON] Post ${post._id} → ${finalStatus}`)
    }

    return NextResponse.json({
      success:   true,
      processed: duePosts.length,
      results:   processedResults,
    })
  } catch (error) {
    console.error('[CRON ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Cron job failed' },
      { status: 500 }
    )
  }
}

// ── Publish to all platforms ──────────────────────────
async function publishToPlatforms(post) {
  const results = {}

  for (const platform of post.platforms) {
    const account = await Account.findOne({
      userId:   post.userId,
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
    //   results[platform] = await postToInstagram({ ... })
    // }

    // if (platform === 'facebook') {   // V2
    //   results[platform] = await postToFacebook({ ... })
    // }

    await Account.findByIdAndUpdate(account._id, {
      $set: { lastUsedAt: new Date() },
    })
  }

  return results
}