import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (request) => {
  try {
    await connectDB()
    console.log('DB Connected');
    const user = await User.findById(request.user.userId);
    console.log('User w eget as',user);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error('Erro while getting user details', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})