'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { usePosts } from '@/context/PostContext'
import CalendarView from '@/components/calender/Calenderview'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  CalendarPlus, Twitter, Linkedin,
  Clock, CheckCircle2, XCircle, FileText, Zap
} from 'lucide-react'
import Link from 'next/link'

// ── Status icon helper ────────────────────────────────
function StatusIcon({ status }) {
  const map = {
    scheduled:  <Clock        size={14} className="text-yellow-400" />,
    published:  <CheckCircle2 size={14} className="text-green-400"  />,
    failed:     <XCircle      size={14} className="text-red-400"    />,
    draft:      <FileText     size={14} className="text-white/40"   />,
    publishing: <Zap          size={14} className="text-blue-400"   />,
  }
  return map[status] || map.draft
}

// ── Stat card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-display">{value}</p>
        <p className="text-xs text-white/40">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router              = useRouter()
  const { posts, fetchPosts, loading, publishPost } = usePosts()
  const [selectedPost, setSelectedPost] = useState(null)
  const [publishing,   setPublishing]   = useState(false)

  // Fetch posts for current month on mount
  useEffect(() => {
    const now   = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    fetchPosts({ month })
  }, [fetchPosts])

  // Stats
  const stats = {
    scheduled:  posts.filter((p) => p.status === 'scheduled').length,
    published:  posts.filter((p) => p.status === 'published').length,
    failed:     posts.filter((p) => p.status === 'failed').length,
    draft:      posts.filter((p) => p.status === 'draft').length,
  }

  const handlePostClick = (post) => setSelectedPost(post)

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    router.push(`/day/${dateStr}`)
  }

  const handlePublishNow = async () => {
    if (!selectedPost) return
    setPublishing(true)
    try {
      await publishPost(selectedPost._id)
      setSelectedPost(null)
    } catch {}
    setPublishing(false)
  }

  // Loading skeleton
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1,2,3,4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-2xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Stats row ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Scheduled" value={stats.scheduled} icon={Clock}        color="bg-yellow-500/20" />
        <StatCard label="Published" value={stats.published} icon={CheckCircle2} color="bg-green-500/20"  />
        <StatCard label="Failed"    value={stats.failed}    icon={XCircle}      color="bg-red-500/20"    />
        <StatCard label="Drafts"    value={stats.draft}     icon={FileText}      color="bg-white/10"      />
      </div>

      {/* ── Calendar card ─────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-6">

        {/* Card header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white font-display">Content Calendar</h2>
            <p className="text-xs text-white/30 mt-0.5">Click a day to schedule, click a post to manage</p>
          </div>
          <Link href="/schedule">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-8 px-3 text-xs rounded-lg gap-1.5">
              <CalendarPlus size={13} />
              New Post
            </Button>
          </Link>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {[
            { label: 'Scheduled',  color: 'bg-yellow-400' },
            { label: 'Published',  color: 'bg-green-400'  },
            { label: 'Failed',     color: 'bg-red-400'    },
            { label: 'Draft',      color: 'bg-white/20'   },
            { label: 'Publishing', color: 'bg-blue-400'   },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs text-white/30">{item.label}</span>
            </div>
          ))}
        </div>

        <CalendarView
          posts={posts}
          onPostClick={handlePostClick}
          onDayClick={handleDayClick}
        />
      </div>

      {/* ── Post detail dialog ────────────────────── */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-[#0D1024] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-white flex items-center gap-2">
              <StatusIcon status={selectedPost?.status} />
              Post Details
            </DialogTitle>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-4">

              {/* Status + platforms */}
              <div className="flex items-center justify-between">
                <span className={`chip-${selectedPost.status}`}>
                  {selectedPost.status}
                </span>
                <div className="flex items-center gap-1.5">
                  {selectedPost.platforms?.includes('twitter') && (
                    <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center">
                      <Twitter size={12} className="text-sky-400" />
                    </div>
                  )}
                  {selectedPost.platforms?.includes('linkedin') && (
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                      <Linkedin size={12} className="text-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Caption */}
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
                  {selectedPost.caption || 'No caption'}
                </p>
              </div>

              {/* Image preview */}
              {selectedPost.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/5">
                  <img
                    src={selectedPost.imageUrl}
                    alt="Post media"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              {/* Scheduled time */}
              {selectedPost.scheduledAt && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Clock size={12} />
                  <span>
                    {selectedPost.status === 'published' ? 'Published' : 'Scheduled'} for{' '}
                    {format(new Date(selectedPost.scheduledAt), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
              )}

              {/* Publish results */}
              {selectedPost.publishResults && (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/30 font-medium">Publish results</p>
                  {Object.entries(selectedPost.publishResults).map(([platform, result]) => (
                    result && (
                      <div key={platform} className="flex items-center justify-between text-xs">
                        <span className="text-white/50 capitalize">{platform}</span>
                        <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                          {result.success ? '✓ Published' : `✗ ${result.error || 'Failed'}`}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {selectedPost.status === 'scheduled' && (
                  <Button
                    onClick={handlePublishNow}
                    disabled={publishing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl h-9 text-sm"
                  >
                    {publishing ? 'Publishing...' : '⚡ Publish Now'}
                  </Button>
                )}
                <Link href={`/schedule?edit=${selectedPost._id}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white/60 hover:text-white bg-transparent rounded-xl h-9 text-sm"
                    onClick={() => setSelectedPost(null)}
                  >
                    Edit Post
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
