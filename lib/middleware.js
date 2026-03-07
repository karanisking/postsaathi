import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export function withAuth(handler) {
  return async function (request, context) {

    // 1. Get token from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('postsaathi_token')?.value

    // 2. No token — unauthorized
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3. Verify token using JWT_SECRET from .env.local
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 4. Set userId on request and continue
    request.user = { userId: decoded.userId }

    return handler(request, context)
  }
}