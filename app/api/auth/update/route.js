import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'

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

    const { email, newPassword } = body

    // 1. Basic validation
    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email and newPassword are required' },
        { status: 400 }
      )
    }

    // 2. Connect DB
    await connectDB()

    // 3. Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No user found with this email' },
        { status: 404 }
      )
    }

    // 4. Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // 5. Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword })

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${email} (userId: ${user._id})`,
    })

  } catch (error) {
    console.error('Error while updating password', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}