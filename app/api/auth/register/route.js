import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { registerSchema } from '@/lib/validators'

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
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // 2. Connect DB
    await connectDB()

    // 3. Check duplicate email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      )
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // 5. Create user
    const user = await User.create({ name, email, password: hashedPassword })

    // 6. Create JWT directly — userId + 7 days expiry
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 7. Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('postsaathi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // 8. Return token + user in response
    return NextResponse.json(
      {
        success: true,
        accessToken: token,
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error while registering', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}