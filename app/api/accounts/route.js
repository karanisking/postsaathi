import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Account from '@/models/Account'
import { withAuth } from '@/lib/middleware'

// GET /api/accounts — fetch all connected accounts
export const GET = withAuth(async (request) => {
  try {
    await connectDB()

    const accounts = await Account.find({
      userId:   request.user.userId,
      isActive: true,
    }).select('-accessToken -accessTokenSecret')

    return NextResponse.json({
      success: true,
      accounts,
    })
  } catch (error) {
    console.error('[GET ACCOUNTS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
})