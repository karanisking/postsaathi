import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { captionSchema } from '@/lib/validators'
import { generateCaptions } from '@/lib/groq'  // ✅ changed from gemini to groq

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

    const result = captionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { topic, platforms, tone } = result.data

    const captions = await generateCaptions({ topic, platforms, tone })

    return NextResponse.json({ success: true, captions })
  } catch (error) {
    console.error('[CAPTION ERROR]', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate captions' },
      { status: 500 }
    )
  }
})