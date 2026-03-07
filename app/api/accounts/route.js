import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Account from '@/models/Account'
import { withAuth } from '@/lib/middleware'

// GET /api/accounts — get all connected accounts for user
export const GET = withAuth(async (request) => {
  try {
    await connectDB()

    // accessToken is select:false so never exposed to frontend
    const accounts = await Account.find({
      userId: request.user.userId,
    })
      .select('-accessToken -accessTokenSecret')
      .lean()

    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error('[ACCOUNTS GET ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})