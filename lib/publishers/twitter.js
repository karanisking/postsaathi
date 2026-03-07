import { TwitterApi } from 'twitter-api-v2'

export async function postToTwitter({ accessToken, caption, imageUrl }) {
  try {
    const client = new TwitterApi(accessToken)

    let tweetPayload = { text: caption }

    // If image — upload media first then attach
    if (imageUrl) {
      // Download image buffer from ImageKit URL
      const imageRes  = await fetch(imageUrl)
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

      // Upload to Twitter as media
      const mediaId = await client.v1.uploadMedia(imageBuffer, {
        mimeType: 'image/jpeg',
      })

      tweetPayload.media = { media_ids: [mediaId] }
    }

    const tweet = await client.v2.tweet(tweetPayload)

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
      error:   error.message || 'Failed to post to Twitter',
    }
  }
}