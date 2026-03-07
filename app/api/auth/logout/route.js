import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear cookie directly
  const cookieStore = await cookies()
  cookieStore.delete('postsaathi_token')

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}