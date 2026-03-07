import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getImageKitAuth } from '@/lib/imagekit'

// GET /api/upload/auth
// Frontend ImageKit SDK calls this to get upload signature
export const GET = withAuth(async (request) => {
  try {
    const authParams = getImageKitAuth()

    return NextResponse.json({
      success:   true,
      ...authParams, // { token, expire, signature }
    })
  } catch (error) {
    console.error('[UPLOAD AUTH ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate upload auth' },
      { status: 500 }
    )
  }
})