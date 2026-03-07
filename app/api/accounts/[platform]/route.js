import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Account from '@/models/Account'
import { withAuth } from '@/lib/middleware'

// DELETE /api/accounts/:platform — disconnect a platform
export const DELETE = withAuth(async (request, context) => {
  try {
    const { platform } = await context.params

    const validPlatforms = ['twitter', 'linkedin']
    // const validPlatforms = ['twitter', 'linkedin', 'instagram', 'facebook'] // V2

    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, message: 'Invalid platform' },
        { status: 400 }
      )
    }

    await connectDB()

    const account = await Account.findOneAndDelete({
      userId:   request.user.userId,
      platform,
    })

    if (!account) {
      return NextResponse.json(
        { success: false, message: `No connected ${platform} account found` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${platform} account disconnected successfully`,
    })
  } catch (error) {
    console.error('[ACCOUNT DELETE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})