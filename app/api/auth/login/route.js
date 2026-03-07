import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { loginSchema } from '@/lib/validators'

export async function POST(request) {
  try {

   let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body is required' },
        { status: 400 }
      )
    }

    // 1. Validate
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // 2. Connect DB
    await connectDB()

    // 3. Find user — select password back
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 5. Create JWT directly — userId + 7 days expiry
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 6. Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('postsaathi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // 7. Return token + user in response
    return NextResponse.json({
      success: true,
      accessToken: token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error('Error while loggin', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}