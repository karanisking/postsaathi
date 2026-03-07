import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET /api/accounts/connect/:platform
// Redirects user to platform OAuth page
export async function GET(request, context) {
  try {
    const { platform } = await context.params

    // Verify user is logged in
    const cookieStore = await cookies()
    const token = cookieStore.get('postsaathi_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Save userId in cookie so callback can read it
    cookieStore.set('oauth_user_id', decoded.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes — enough for OAuth flow
      path: '/',
    })

    if (platform === 'twitter') {
      const twitterAuthUrl = buildTwitterAuthUrl()
      return NextResponse.redirect(twitterAuthUrl)
    }

    if (platform === 'linkedin') {
      const linkedinAuthUrl = buildLinkedInAuthUrl()
      return NextResponse.redirect(linkedinAuthUrl)
    }

    // instagram — V2
    // facebook  — V2

    return NextResponse.json(
      { success: false, message: 'Platform not supported yet' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[CONNECT ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── Twitter OAuth 2.0 URL ─────────────────────────────
function buildTwitterAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.TWITTER_CLIENT_ID,
    redirect_uri:  process.env.TWITTER_CALLBACK_URL,
    scope:         'tweet.read tweet.write users.read offline.access',
    state:         'twitter_oauth_state',
    code_challenge: 'challenge',       // PKCE — simplified for V1
    code_challenge_method: 'plain',
  })
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
}

// ── LinkedIn OAuth 2.0 URL ────────────────────────────
function buildLinkedInAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.LINKEDIN_CLIENT_ID,
    redirect_uri:  process.env.LINKEDIN_CALLBACK_URL,
    scope:         'openid profile email w_member_social',
    state:         'linkedin_oauth_state',
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}