export async function postToLinkedIn({ accessToken, caption, imageUrl, platformUserId }) {
    try {
      const authorUrn = `urn:li:person:${platformUserId}`
  
      let postBody = {
        author:     authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary:  { text: caption },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
            ...(imageUrl && {
              media: [
                {
                  status:      'READY',
                  description: { text: caption.slice(0, 200) },
                  media:       imageUrl,
                  title:       { text: 'Post Image' },
                },
              ],
            }),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }
  
      const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(postBody),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        throw new Error(data.message || 'LinkedIn API error')
      }
  
      return {
        success: true,
        postId:  data.id,
        error:   null,
      }
    } catch (error) {
      console.error('[LINKEDIN POST ERROR]', error)
      return {
        success: false,
        postId:  null,
        error:   error.message || 'Failed to post to LinkedIn',
      }
    }
  }