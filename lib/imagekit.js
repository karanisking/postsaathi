import ImageKit from '@imagekit/nodejs'

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

export default imagekit

// Generate auth params for frontend SDK upload
export function getImageKitAuth() {
  return imagekit.getAuthenticationParameters()
}

// Delete image from ImageKit by fileId
export async function deleteImage(fileId) {
  try {
    await imagekit.deleteFile(fileId)
    return { success: true }
  } catch (error) {
    console.error('[IMAGEKIT DELETE ERROR]', error)
    return { success: false, error: error.message }
  }
}