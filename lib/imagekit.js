import ImageKit from 'imagekit'

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

export default imagekit

// ✅ v6 uses getAuthenticationParameters() — same name but must be called correctly
export function getImageKitAuth() {
  const result = imagekit.getAuthenticationParameters()
  return {
    token:     result.token,
    expire:    result.expire,
    signature: result.signature,
  }
}

export async function deleteImage(fileId) {
  try {
    await imagekit.deleteFile(fileId)
    return { success: true }
  } catch (error) {
    console.error('[IMAGEKIT DELETE ERROR]', error)
    return { success: false, error: error.message }
  }
}