import { TwitterApi } from 'twitter-api-v2'

export async function postToTwitter({ accessToken, caption, imageUrl }) {
  try {
    // ✅ OAuth 2.0 user context — pass token as object not string
    const client = new TwitterApi(accessToken)
    const rwClient = client.readWrite

    let tweetPayload = { text: caption }

    // Image upload requires OAuth 1.0a (v1 endpoint)
    // With OAuth 2.0 we can only post text tweets or use URL
    // So for images we just include the ImageKit URL in caption
    if (imageUrl) {
      // Append image URL to caption for Twitter
      // Twitter will auto-generate a card preview
      const separator = caption.includes('\n') ? '\n' : ' '
      tweetPayload.text = `${caption}${separator}${imageUrl}`.slice(0, 280)
    }

    const tweet = await rwClient.v2.tweet(tweetPayload)

    return {
      success: true,
      postId:  tweet.data.id,
      error:   null,
    }
  } catch (error) {
    console.error('[TWITTER POST ERROR]', error)
    return {
      success: false,
      postId:  null,
      error:   error?.data?.detail || error.message || 'Failed to post to Twitter',
    }
  }
}