import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { withAuth } from '@/lib/middleware'
import { createPostSchema } from '@/lib/validators'
import mongoose from 'mongoose'  // ✅ add this

export const GET = withAuth(async (request) => {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const month    = searchParams.get('month')
    const platform = searchParams.get('platform')
    const status   = searchParams.get('status')

    // ✅ No month = fetch ALL posts (for posts page)
    if (!month) {
      const query = { userId: request.user.userId }
      if (platform) query.platforms = platform
      if (status)   query.status    = status

      const posts = await Post.find(query).sort({ createdAt: -1 })
      return NextResponse.json({ success: true, posts })
    }

    // ✅ Month provided = calendar view + total counts
    const [year, mon] = month.split('-').map(Number)
    const start = new Date(year, mon - 1, 1)
    const end   = new Date(year, mon, 1)

    const query = {
      userId:    request.user.userId,
      createdAt: { $gte: start, $lt: end },
    }
    if (platform) query.platforms = platform
    if (status)   query.status    = status

    const posts = await Post.find(query).sort({ createdAt: -1 })

    // ✅ Total counts across ALL time using top-level import
    const [totalCounts] = await Post.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(request.user.userId)
        }
      },
      {
        $group: {
          _id:        null,
          scheduled:  { $sum: { $cond: [{ $eq: ['$status', 'scheduled']  }, 1, 0] } },
          published:  { $sum: { $cond: [{ $eq: ['$status', 'published']  }, 1, 0] } },
          failed:     { $sum: { $cond: [{ $eq: ['$status', 'failed']     }, 1, 0] } },
          draft:      { $sum: { $cond: [{ $eq: ['$status', 'draft']      }, 1, 0] } },
          publishing: { $sum: { $cond: [{ $eq: ['$status', 'publishing'] }, 1, 0] } },
        }
      }
    ])

    const totals = totalCounts
      ? { scheduled: totalCounts.scheduled, published: totalCounts.published,
          failed: totalCounts.failed, draft: totalCounts.draft,
          publishing: totalCounts.publishing }
      : { scheduled: 0, published: 0, failed: 0, draft: 0, publishing: 0 }

    return NextResponse.json({ success: true, posts, totals })
  } catch (error) {
    console.error('[GET POSTS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
})