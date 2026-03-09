import Post    from '@/models/Post'
import Account from '@/models/Account'
import { postToTwitter }  from '@/lib/publishers/twitter'
import { postToLinkedIn } from '@/lib/publishers/linkedin'

export async function publishPostNow(post, userId) {
  // Mark as publishing
  await Post.findByIdAndUpdate(post._id, { $set: { status: 'publishing' } })

  const results = {}

  for (const platform of post.platforms) {
    const account = await Account.findOne({
      userId,
      platform,
      isActive: true,
    }).select('+accessToken +accessTokenSecret')

    if (!account) {
      results[platform] = {
        success: false,
        postId:  null,
        error:   `No connected ${platform} account`,
      }
      continue
    }

    // Check token expiry
    if (account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date()) {
      results[platform] = {
        success: false,
        postId:  null,
        error:   `${platform} token expired — reconnect in Accounts page`,
      }
      continue
    }

    console.log(`[PUBLISH NOW] Posting to ${platform}`)
    console.log(`[PUBLISH NOW] Token exists: ${!!account.accessToken}`)

    try {
      if (platform === 'twitter') {
        results[platform] = await postToTwitter({
          accessToken: account.accessToken,
          caption:     post.caption,
          imageUrl:    post.imageUrl,
        })
      } else if (platform === 'linkedin') {
        results[platform] = await postToLinkedIn({
          accessToken:    account.accessToken,
          caption:        post.caption,
          imageUrl:       post.imageUrl,
          platformUserId: account.platformUserId,
        })
      }
    } catch (err) {
      console.error(`[${platform.toUpperCase()} ERROR]`, err)
      results[platform] = {
        success: false,
        postId:  null,
        error:   err.message || `Failed to post to ${platform}`,
      }
    }

    // Update lastUsedAt
    await Account.findByIdAndUpdate(account._id, {
      $set: { lastUsedAt: new Date() }
    }).catch(() => {})
  }

  const anySuccess = Object.values(results).some((r) => r.success)
  const allFailed  = Object.values(results).every((r) => !r.success)

  const updatedPost = await Post.findByIdAndUpdate(
    post._id,
    {
      $set: {
        status:         allFailed ? 'failed' : 'published',
        publishedAt:    anySuccess ? new Date() : null,
        publishResults: results,
      },
    },
    { returnDocument: 'after' }
  )

  console.log(`[PUBLISH NOW] Results:`, results)
  return updatedPost
}