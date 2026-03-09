import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { publishPostNow } from '@/lib/publishHelper'

export async function POST(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    await connectDB()

    // Find all posts due for publishing
    const duePosts = await Post.find({
      status:      'scheduled',
      scheduledAt: { $lte: new Date() },
    })

    console.log(`[CRON] Found ${duePosts.length} posts to publish`)

    const results = []
    for (const post of duePosts) {
      try {
        const updated = await publishPostNow(post, post.userId.toString())
        results.push({ id: post._id, status: updated.status })
      } catch (err) {
        console.error(`[CRON] Failed to publish ${post._id}:`, err)
        results.push({ id: post._id, status: 'error' })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (error) {
    console.error('[CRON ERROR]', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}