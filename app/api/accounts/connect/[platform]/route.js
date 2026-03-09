import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withAuth } from '@/lib/middleware'

// GET /api/accounts/connect/:platform — redirect to OAuth
export const GET = withAuth(async (request, context) => {
  const { platform } = await context.params
  const cookieStore  = await cookies()

  cookieStore.set('oauth_user_id', request.user.userId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 10,
    path:     '/',
  })

  if (platform === 'twitter') {
    const params = new URLSearchParams({
      response_type:         'code',
      client_id:             process.env.TWITTER_CLIENT_ID,
      redirect_uri:          process.env.TWITTER_CALLBACK_URL,
      scope:                 'tweet.read tweet.write users.read offline.access',
      state:                 'postsaathi_twitter',
      code_challenge:        'challenge',
      code_challenge_method: 'plain',
    })
    return NextResponse.redirect(
      `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    )
  }

  if (platform === 'linkedin') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      redirect_uri:  process.env.LINKEDIN_CALLBACK_URL,
      scope:         'openid profile email w_member_social',
      state:         'postsaathi_linkedin',
    })
    return NextResponse.redirect(
      `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
    )
  }

  return NextResponse.json(
    { success: false, message: 'Invalid platform' },
    { status: 400 }
  )
})
