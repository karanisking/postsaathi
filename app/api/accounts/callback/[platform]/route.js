import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectDB from '@/lib/db'
import Account from '@/models/Account'

export async function GET(request, context) {
  const { platform }    = await context.params
  const { searchParams } = new URL(request.url)

  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/accounts?error=access_denied&platform=${platform}`, request.url)
    )
  }

  const cookieStore = await cookies()
  const userId      = cookieStore.get('oauth_user_id')?.value

  if (!userId) {
    return NextResponse.redirect(
      new URL(`/accounts?error=session_expired&platform=${platform}`, request.url)
    )
  }

  try {
    await connectDB()

    if (platform === 'twitter') {
      await handleTwitterCallback(code, userId)
    } else if (platform === 'linkedin') {
      await handleLinkedInCallback(code, userId)
    } else {
      return NextResponse.redirect(
        new URL(`/accounts?error=invalid_platform`, request.url)
      )
    }

    cookieStore.delete('oauth_user_id')

    // ✅ Pass platform so toast shows "Twitter connected!"
    return NextResponse.redirect(
      new URL(`/accounts?success=true&platform=${platform}`, request.url)
    )
  } catch (error) {
    console.error(`[${platform.toUpperCase()} CALLBACK ERROR]`, error)
    cookieStore.delete('oauth_user_id')
    return NextResponse.redirect(
      new URL(`/accounts?error=callback_failed&platform=${platform}`, request.url)
    )
  }
}

// ── Twitter ───────────────────────────────────────────
async function handleTwitterCallback(code, userId) {
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:  'Basic ' + Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.TWITTER_CALLBACK_URL,
      code_verifier: 'challenge',
    }),
  })

  const tokenData   = await tokenRes.json()
  console.log('[TWITTER TOKEN RESPONSE]', tokenData)

  const accessToken = tokenData.access_token
  if (!accessToken) {
    throw new Error(`Twitter token exchange failed: ${JSON.stringify(tokenData)}`)
  }

  // Get user profile
  const profileRes = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const profileData = await profileRes.json()
  console.log('[TWITTER PROFILE]', profileData)

  const profile = profileData.data
  if (!profile) throw new Error('Twitter: failed to get user profile')

  await Account.findOneAndUpdate(
    { userId, platform: 'twitter', platformUserId: profile.id },
    {
      $set: {
        accessToken,
        accessTokenSecret: null,
        tokenExpiresAt:    null, // OAuth 2.0 token — check expires_in if present
        accountName:       profile.name,
        accountHandle:     profile.username,
        accountAvatar:     profile.profile_image_url || null,
        platformUserId:    profile.id,
        isActive:          true,
        isMocked:          false,
        lastUsedAt:        new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' } // ✅ fixes mongoose warning
  )
}

// ── LinkedIn ──────────────────────────────────────────
async function handleLinkedInCallback(code, userId) {
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.LINKEDIN_CALLBACK_URL,
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  })

  const tokenData   = await tokenRes.json()
  console.log('[LINKEDIN TOKEN RESPONSE]', tokenData)

  const accessToken = tokenData.access_token
  const expiresIn   = tokenData.expires_in

  if (!accessToken) {
    throw new Error(`LinkedIn token exchange failed: ${JSON.stringify(tokenData)}`)
  }

  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const profile = await profileRes.json()
  console.log('[LINKEDIN PROFILE]', profile)

  if (!profile.sub) throw new Error('LinkedIn: failed to get user profile')

  const tokenExpiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000)
    : null

  await Account.findOneAndUpdate(
    { userId, platform: 'linkedin', platformUserId: profile.sub },
    {
      $set: {
        accessToken,
        tokenExpiresAt,
        accountName:    profile.name,
        accountHandle:  profile.email || null,
        accountAvatar:  profile.picture || null,
        platformUserId: profile.sub,
        isActive:       true,
        isMocked:       false,
        lastUsedAt:     new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' } // ✅ fixes mongoose warning
  )
}