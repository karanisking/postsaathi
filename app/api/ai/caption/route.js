import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { captionSchema } from '@/lib/validators'
import { generateCaptions } from '@/lib/gemini'

// POST /api/ai/caption
export const POST = withAuth(async (request) => {
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

    // Validate
    const result = captionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { topic, platforms, tone } = result.data

    // Generate 3 captions via Gemini
    const captions = await generateCaptions({ topic, platforms, tone })

    return NextResponse.json({ success: true, captions })
  } catch (error) {
    console.error('Error whileposting caption', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate captions' },
      { status: 500 }
    )
  }
})