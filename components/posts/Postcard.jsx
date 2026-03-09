'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { usePosts } from '@/context/PostContext'
import { Button } from '@/components/ui/button'
import {
  Twitter, Linkedin, Clock, Calendar,
  Pencil, Trash2, Zap, Loader2, ImageIcon
} from 'lucide-react'

const statusConfig = {
  scheduled:  { label: 'Scheduled',  class: 'chip-scheduled'  },
  published:  { label: 'Published',  class: 'chip-published'  },
  failed:     { label: 'Failed',     class: 'chip-failed'     },
  draft:      { label: 'Draft',      class: 'chip-draft'      },
  publishing: { label: 'Publishing', class: 'chip-publishing' },
}

export default function PostCard({ post }) {
  const { deletePost, publishPost } = usePosts()
  const [deleting,   setDeleting]   = useState(false)
  const [publishing, setPublishing] = useState(false)

  const config = statusConfig[post.status] || statusConfig.draft

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try { await deletePost(post._id) } catch {}
    setDeleting(false)
  }

  const handlePublish = async () => {
    setPublishing(true)
    try { await publishPost(post._id) } catch {}
    setPublishing(false)
  }

  const canEdit    = !['published', 'publishing'].includes(post.status)
  const canDelete = post.status === 'draft' ||
  (post.status === 'scheduled' && new Date(post.scheduledAt) > new Date())
  const canPublish = post.status === 'scheduled' || post.status === 'draft'

  const getFriendlyError = (error) => {
    if (!error) return null
    if (error.includes('Urn')) return 'Image upload to LinkedIn failed'
    if (error.includes('401')) return 'LinkedIn token expired — reconnect account'
    if (error.includes('token')) return 'Authentication failed — reconnect account'
    if (error.includes('credits')) return 'Twitter requires paid API plan'
    return 'Publishing failed — please try again'
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all duration-200 overflow-hidden group">
      <div className="flex gap-4 p-4 sm:p-5">

        {/* Image thumbnail */}
        <div className="shrink-0">
          {post.imageUrl ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/10">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
              <ImageIcon size={20} className="text-white/15" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2.5">

          {/* Top row — status + platforms */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={config.class}>{config.label}</span>
            <div className="flex items-center gap-1.5">
              {post.platforms?.includes('twitter') && (
                <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Twitter size={10} className="text-sky-400" />
                </div>
              )}
              {post.platforms?.includes('linkedin') && (
                <div className="w-5 h-5 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Linkedin size={10} className="text-blue-500" />
                </div>
              )}
            </div>
          </div>

          {/* Caption */}
          <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
            {post.caption || 'No caption'}
          </p>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            {post.status === 'published' ? (
              <>
                <Clock size={11} />
                <span>Published {format(new Date(post.publishedAt || post.updatedAt), 'MMM d, yyyy • h:mm a')}</span>
              </>
            ) : post.scheduledAt ? (
              <>
                <Calendar size={11} />
                <span>Scheduled {format(new Date(post.scheduledAt), 'MMM d, yyyy • h:mm a')}</span>
              </>
            ) : (
              <>
                <Clock size={11} />
                <span>Created {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
              </>
            )}
          </div>

          {/* Publish results for failed posts */}
          {post.status === 'failed' && post.publishResults && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(post.publishResults).map(([platform, result]) =>
                result && !result.success ? (
                  <span key={platform} className="text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-lg">
                    {platform}: {getFriendlyError(result.error) || 'Failed'}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-white/5 bg-white/[0.01]">
        {canPublish && (
          <Button
            onClick={handlePublish}
            disabled={publishing}
            size="sm"
            className="h-7 px-3 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-lg"
          >
            {publishing
              ? <Loader2 size={11} className="animate-spin" />
              : <><Zap size={11} className="mr-1" />Publish Now</>}
          </Button>
        )}

        {canEdit && (
          <Link href={`/schedule?edit=${post._id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-3 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-lg gap-1"
            >
              <Pencil size={11} /> Edit
            </Button>
          </Link>
        )}

        {canDelete && (
          <Button
            onClick={handleDelete}
            disabled={deleting}
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/5 rounded-lg ml-auto gap-1"
          >
            {deleting
              ? <Loader2 size={11} className="animate-spin" />
              : <><Trash2 size={11} /> Delete</>}
          </Button>
        )}
      </div>
    </div>
  )
}