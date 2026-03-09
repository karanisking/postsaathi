'use client'

import { useState, useRef } from 'react'
import { uploadApi } from '@/lib/api'
import { toast } from 'sonner'
import { ImagePlus, X, Loader2, Upload } from 'lucide-react'

export default function ImageUploader({ value, onChange, onRemove }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef(null)

  const uploadFile = async (file) => {
    if (!file) return
  
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
  
    setUploading(true)
    try {
      // 1. Get auth signature from backend
      const auth = await uploadApi.getAuth()
  
      // 2. Build FormData
      const formData = new FormData()
      formData.append('file',      file)
      formData.append('fileName',  `post_${Date.now()}_${file.name}`)
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY)
      formData.append('signature', auth.signature)
      formData.append('expire',    auth.expire)
      formData.append('token',     auth.token)
      formData.append('folder',    '/postsaathi')
  
      // 3. ✅ Correct upload endpoint
      const res  = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body:   formData,
      })
  
      const data = await res.json()
      console.log('[IMAGEKIT UPLOAD]', data)
  
      if (!res.ok) throw new Error(data.message || 'Upload failed')
  
      // 4. Return url + fileId to parent
      onChange({ imageUrl: data.url, imagekitFileId: data.fileId })
      toast.success('Image uploaded!')
    } catch (err) {
      console.error('[UPLOAD ERROR]', err)
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  // If image already uploaded — show preview
  if (value) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-white/70">Image</p>
        <div className="relative rounded-xl overflow-hidden border border-white/10 group">
          <img
            src={value}
            alt="Post image"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400"
          >
            <X size={14} className="text-white" />
          </button>
          <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all">
            Click × to remove
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white/70">
        Image <span className="text-white/30 font-normal">(optional)</span>
      </p>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 flex flex-col items-center gap-3
          ${dragOver
            ? 'border-blue-500/60 bg-blue-500/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
          ${uploading ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        {uploading ? (
          <>
            <Loader2 size={24} className="text-blue-400 animate-spin" />
            <p className="text-sm text-white/40">Uploading...</p>
          </>
        ) : dragOver ? (
          <>
            <Upload size={24} className="text-blue-400" />
            <p className="text-sm text-blue-300">Drop image here</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <ImagePlus size={22} className="text-white/30" />
            </div>
            <div>
              <p className="text-sm text-white/50">
                <span className="text-blue-400 hover:text-blue-300">Click to upload</span>
                {' '}or drag and drop
              </p>
              <p className="text-xs text-white/25 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}