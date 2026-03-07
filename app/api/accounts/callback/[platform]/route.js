import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectDB from '@/lib/db'
import Account from '@/models/Account'

// GET /api/accounts/callback/:platform
// Platform redirects here after user approves
export async function GET(request, context) {
  try {
    const { platform } = await context.params
    const { searchParams } = new URL(request.url)

    const code  = searchParams.get('code')
    const error = searchParams.get('error')

    // User denied OAuth
    if (error || !code) {
      return NextResponse.redirect(
        new URL('/accounts?error=oauth_denied', request.url)
      )
    }

    // Get userId from cookie we set in connect route
    const cookieStore = await cookies()
    const userId = cookieStore.get('oauth_user_id')?.value

    if (!userId) {
      return NextResponse.redirect(
        new URL('/accounts?error=session_expired', request.url)
      )
    }

    await connectDB()

    if (platform === 'twitter') {
      await handleTwitterCallback(code, userId)
    } else if (platform === 'linkedin') {
      await handleLinkedInCallback(code, userId)
    }
    // else if (platform === 'instagram') // V2
    // else if (platform === 'facebook')  // V2

    // Clear oauth_user_id cookie
    cookieStore.delete('oauth_user_id')

    // Redirect back to accounts page with success
    return NextResponse.redirect(
      new URL('/accounts?success=true', request.url)
    )
  } catch (error) {
    console.error('[CALLBACK ERROR]', error)
    return NextResponse.redirect(
      new URL('/accounts?error=oauth_failed', request.url)
    )
  }
}

// ── Twitter Callback ──────────────────────────────────
async function handleTwitterCallback(code, userId) {
  // 1. Exchange code for accessToken
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.TWITTER_CALLBACK_URL,
      code_verifier: 'challenge', // matches code_challenge in connect route
    }),
  })

  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token

  if (!accessToken) throw new Error('Twitter: failed to get access token')

  // 2. Get user profile
  const profileRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const profileData = await profileRes.json()
  const profile = profileData.data

  if (!profile) throw new Error('Twitter: failed to get user profile')

  // 3. Save or update account in DB
  await Account.findOneAndUpdate(
    {
      userId,
      platform:       'twitter',
      platformUserId: profile.id,
    },
    {
      $set: {
        accessToken,
        accountName:    profile.name,
        accountHandle:  `@${profile.username}`,
        accountAvatar:  profile.profile_image_url || null,
        platformUserId: profile.id,
        isActive:       true,
        lastUsedAt:     new Date(),
      },
    },
    { upsert: true, new: true }
  )
}

// ── LinkedIn Callback ─────────────────────────────────
async function handleLinkedInCallback(code, userId) {
  // 1. Exchange code for accessToken
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.LINKEDIN_CALLBACK_URL,
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  })

  const tokenData = await tokenRes.json()
  const accessToken    = tokenData.access_token
  const expiresIn      = tokenData.expires_in // seconds

  if (!accessToken) throw new Error('LinkedIn: failed to get access token')

  // 2. Get user profile using OpenID Connect
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const profile = await profileRes.json()

  if (!profile.sub) throw new Error('LinkedIn: failed to get user profile')

  // 3. Calculate token expiry (LinkedIn tokens expire in ~60 days)
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

  // 4. Save or update account in DB
  await Account.findOneAndUpdate(
    {
      userId,
      platform:       'linkedin',
      platformUserId: profile.sub,
    },
    {
      $set: {
        accessToken,
        tokenExpiresAt,
        accountName:    profile.name,
        accountHandle:  profile.email || null,
        accountAvatar:  profile.picture || null,
        platformUserId: profile.sub,
        isActive:       true,
        lastUsedAt:     new Date(),
      },
    },
    { upsert: true, new: true }
  )
}