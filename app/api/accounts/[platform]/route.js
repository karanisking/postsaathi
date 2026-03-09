import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Account from '@/models/Account'
import { withAuth } from '@/lib/middleware'

// DELETE /api/accounts/:platform — disconnect a platform
export const DELETE = withAuth(async (request, context) => {
  try {
    const { platform } = await context.params

    await connectDB()

    await Account.findOneAndDelete({
      userId:   request.user.userId,
      platform,
    })

    return NextResponse.json({
      success: true,
      message: `${platform} disconnected`,
    })
  } catch (error) {
    console.error('[DISCONNECT ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to disconnect account' },
      { status: 500 }
    )
  }
})