'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePosts } from '@/context/PostContext'
import { postsApi } from '@/lib/api'
import CaptionEditor  from '@/components/posts/Captioneditor'
import ImageUploader  from '@/components/posts/Imageuploader'
import TimingSelector from '@/components/posts/Timingselector'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'
import { toast }      from 'sonner'
import { Loader2, Save, Zap, ArrowLeft, Trash2, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function SchedulePage() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const editId        = searchParams.get('edit')
  const prefilledDate = searchParams.get('date')

  const { createPost, updatePost, deletePost } = usePosts()

  // ✅ LinkedIn pre-selected by default — only platform
  const [platforms,      setPlatforms]      = useState(['linkedin'])
  const [caption,        setCaption]        = useState('')
  const [imageUrl,       setImageUrl]       = useState('')
  const [imagekitFileId, setImagekitFileId] = useState('')
  const [timing,         setTiming]         = useState({ postType: 'now', scheduledAt: null })
  const [errors,         setErrors]         = useState({})
  const [submitting,     setSubmitting]     = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [loadingEdit,    setLoadingEdit]    = useState(false)
  const [editPost,       setEditPost]       = useState(null)

  useEffect(() => {
    if (!editId) return
    const load = async () => {
      setLoadingEdit(true)
      try {
        const data = await postsApi.getOne(editId)
        const post = data.post
        setEditPost(post)
        // Only keep linkedin from saved platforms
        setPlatforms((post.platforms || []).filter(p => p === 'linkedin').length > 0
          ? ['linkedin'] : ['linkedin'])
        setCaption(post.caption || '')
        setImageUrl(post.imageUrl || '')
        setImagekitFileId(post.imagekitFileId || '')
        setTiming({
          postType:    post.postType    || 'scheduled',
          scheduledAt: post.scheduledAt || null,
        })
      } catch {
        toast.error('Failed to load post')
        router.push('/posts')
      } finally {
        setLoadingEdit(false)
      }
    }
    load()
  }, [editId])

  const validate = () => {
    const errs = {}
    if (!caption.trim())      errs.caption = 'Caption is required'
    if (caption.length > 3000) errs.caption = 'Caption too long'
    if (timing.postType === 'scheduled' && !timing.scheduledAt)
      errs.timing = 'Select a date and time'
    if (timing.postType === 'scheduled' && timing.scheduledAt) {
      if (new Date(timing.scheduledAt) <= new Date())
        errs.timing = 'Scheduled time must be in the future'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    const payload = {
      platforms:      ['linkedin'], // ✅ Always linkedin
      caption,
      imageUrl:       imageUrl       || undefined,
      imagekitFileId: imagekitFileId || undefined,
      postType:       timing.postType,
      scheduledAt:    timing.scheduledAt || undefined,
    }

    try {
      if (editId) {
        await updatePost(editId, payload)
        toast.success('Post updated!')
        router.push('/posts')
      } else {
        await createPost(payload)
        if (timing.postType === 'now') {
          toast.success('Post published to LinkedIn! 🎉')
        } else {
          toast.success('Post scheduled successfully!')
        }
        router.push('/dashboard')
      }
    } catch (err) {
      if (err.errors) {
        const fieldErrs = {}
        Object.entries(err.errors).forEach(([k, v]) => {
          fieldErrs[k] = Array.isArray(v) ? v[0] : v
        })
        setErrors(fieldErrs)
      } else {
        toast.error(err.message || 'Something went wrong')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deletePost(editId)
      router.push('/posts')
    } catch {}
    setDeleting(false)
  }

  if (loadingEdit) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1,2,3,4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />
        ))}
      </div>
    )
  }

  const isEditMode   = !!editId
  const cannotEdit   = editPost?.status === 'published' || editPost?.status === 'publishing'

  return (
    <div className="max-w-2xl mx-auto">

      {/* Back */}
      <div className="mb-5">
        <Link
          href={isEditMode ? '/posts' : '/dashboard'}
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={15} />
          {isEditMode ? 'Back to Posts' : 'Back to Dashboard'}
        </Link>
      </div>

      {/* Cannot edit banner */}
      {cannotEdit && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
          This post is {editPost.status} and cannot be edited.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 space-y-6">

          {/* ✅ Platform — LinkedIn only, fixed UI */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Platform</p>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-blue-600/40 bg-blue-600/10">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                <Linkedin size={18} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">LinkedIn</p>
                <p className="text-xs text-white/30 mt-0.5">Posts to your LinkedIn profile</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-white/20">Twitter / X requires a paid API plan — coming in V2</p>
          </div>

          <div className="h-px bg-white/5" />

          {/* Caption */}
          <CaptionEditor
            value={caption}
            onChange={setCaption}
            error={errors.caption}
          />

          <div className="h-px bg-white/5" />

          {/* Image */}
          <ImageUploader
            value={imageUrl}
            onChange={({ imageUrl: u, imagekitFileId: id }) => {
              setImageUrl(u)
              setImagekitFileId(id)
            }}
            onRemove={() => { setImageUrl(''); setImagekitFileId('') }}
          />

          <div className="h-px bg-white/5" />

          {/* Timing */}
          <TimingSelector
            value={timing}
            onChange={setTiming}
            prefilledDate={prefilledDate}
          />
          {errors.timing && (
            <p className="text-xs text-red-400 -mt-2">⚠ {errors.timing}</p>
          )}
        </div>

        {/* Actions */}
        {!cannotEdit && (
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {isEditMode ? 'Saving...' : timing.postType === 'now' ? 'Publishing...' : 'Scheduling...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isEditMode
                    ? <><Save size={16} /> Save Changes</>
                    : timing.postType === 'now'
                      ? <><Zap size={16} /> Publish to LinkedIn</>
                      : <><Save size={16} /> Schedule Post</>}
                </span>
              )}
            </Button>

            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="h-11 px-4 border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/40 bg-transparent rounded-xl"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}