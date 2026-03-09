export async function postToLinkedIn({ accessToken, caption, imageUrl, platformUserId }) {
  try {
    console.log('[LINKEDIN] Posting for user:', platformUserId)
    console.log('[LINKEDIN] Has image:', !!imageUrl)

    let mediaArray = []

    // ── If image exists — upload to LinkedIn first ────
    if (imageUrl) {
      const assetUrn = await uploadLinkedInImage(accessToken, platformUserId, imageUrl)
      console.log('[LINKEDIN] Asset URN:', assetUrn)

      if (assetUrn) {
        mediaArray = [
          {
            status: 'READY',
            media:  assetUrn, // ✅ Must be URN like urn:li:digitalmediaAsset:xxx
          },
        ]
      }
    }

    // ── Build post body ───────────────────────────────
    const postBody = {
      author:          `urn:li:person:${platformUserId}`,
      lifecycleState:  'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: caption,
          },
          shareMediaCategory: mediaArray.length > 0 ? 'IMAGE' : 'NONE',
          ...(mediaArray.length > 0 && { media: mediaArray }),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    console.log('[LINKEDIN] Post body:', JSON.stringify(postBody, null, 2))

    // ── Post to LinkedIn UGC API ──────────────────────
    const res  = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method:  'POST',
      headers: {
        Authorization:               `Bearer ${accessToken}`,
        'Content-Type':              'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    })

    const data = await res.json()
    console.log('[LINKEDIN] Post response:', JSON.stringify(data))

    if (!res.ok) {
      throw new Error(
        data.message ||
        data.serviceErrorCode?.toString() ||
        `LinkedIn API error ${res.status}`
      )
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

// ── Upload image to LinkedIn — returns asset URN ──────
async function uploadLinkedInImage(accessToken, platformUserId, imageUrl) {
  try {
    // Step 1 — Register upload with LinkedIn
    const registerRes = await fetch(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        method:  'POST',
        headers: {
          Authorization:               `Bearer ${accessToken}`,
          'Content-Type':              'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes:              ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner:                `urn:li:person:${platformUserId}`,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier:       'urn:li:userGeneratedContent',
              },
            ],
          },
        }),
      }
    )

    const registerData = await registerRes.json()
    console.log('[LINKEDIN] Register response:', JSON.stringify(registerData))

    // ✅ Extract upload URL and asset URN
    const uploadUrl = registerData?.value?.uploadMechanism?.[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ]?.uploadUrl

    const assetUrn = registerData?.value?.asset

    if (!uploadUrl || !assetUrn) {
      console.error('[LINKEDIN] Missing uploadUrl or asset URN')
      return null
    }

    // Step 2 — Download image from ImageKit URL
    const imageRes    = await fetch(imageUrl)
    if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`)
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

    console.log('[LINKEDIN] Image buffer size:', imageBuffer.length)

    // Step 3 — Upload binary image to LinkedIn
    const uploadRes = await fetch(uploadUrl, {
      method:  'PUT',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    })

    console.log('[LINKEDIN] Upload status:', uploadRes.status)

    // LinkedIn returns 201 or 200 on success
    if (!uploadRes.ok && uploadRes.status !== 201) {
      throw new Error(`Image upload failed with status ${uploadRes.status}`)
    }

    // ✅ Return the asset URN — this is what goes in media field
    return assetUrn

  } catch (err) {
    console.error('[LINKEDIN IMAGE UPLOAD ERROR]', err.message)
    // Fall back to text-only post if image upload fails
    return null
  }
}