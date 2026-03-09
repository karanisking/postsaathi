'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePosts } from '@/context/PostContext'
import PostCard from '@/components/posts/Postcard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  CalendarPlus, Search, FileText, SlidersHorizontal
} from 'lucide-react'
import Link from 'next/link'

const STATUS_FILTERS = [
  { value: 'all',        label: 'All Posts'  },
  { value: 'scheduled',  label: 'Scheduled'  },
  { value: 'published',  label: 'Published'  },
  { value: 'failed',     label: 'Failed'     },
  { value: 'draft',      label: 'Draft'      },
  { value: 'publishing', label: 'Publishing' },
]

const PLATFORM_FILTERS = [
  { value: 'all',      label: 'All Platforms' },
  { value: 'twitter',  label: 'Twitter / X'   },
  { value: 'linkedin', label: 'LinkedIn'       },
]

export default function PostsPage() {
  const { posts, fetchPosts, loading } = usePosts()
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('all')
  const [platform, setPlatform] = useState('all')

  useEffect(() => {
    // Fetch all posts — no month filter for list view
    const now   = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    fetchPosts({ month })
  }, [fetchPosts])

  // Client-side filter
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchStatus   = status   === 'all' || p.status === status
      const matchPlatform = platform === 'all' || p.platforms?.includes(platform)
      const matchSearch   = !search  || p.caption?.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchPlatform && matchSearch
    })
  }, [posts, status, platform, search])

  // Counts for filter badges
  const counts = useMemo(() => {
    const c = { all: posts.length }
    STATUS_FILTERS.slice(1).forEach(({ value }) => {
      c[value] = posts.filter((p) => p.status === value).length
    })
    return c
  }, [posts])

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl bg-white/5" />
        {[1,2,3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-white font-display">
            {filtered.length} {filtered.length === 1 ? 'post' : 'posts'}
            {status !== 'all' && ` · ${status}`}
          </h2>
          <p className="text-xs text-white/30 mt-0.5">Manage all your content</p>
        </div>
        <Link href="/schedule">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-9 px-4 text-sm rounded-xl gap-1.5">
            <CalendarPlus size={14} />
            New Post
          </Button>
        </Link>
      </div>

      {/* ── Filters ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search captions..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-10 pl-9 text-sm focus-visible:border-blue-500"
          />
        </div>

        {/* Status filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 w-full sm:w-44 text-sm focus:ring-blue-500/20">
            <SlidersHorizontal size={13} className="mr-2 text-white/30" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0D1024] border-white/10 text-white">
            {STATUS_FILTERS.map(({ value, label }) => (
              <SelectItem
                key={value}
                value={value}
                className="text-white/70 hover:text-white focus:bg-white/5 focus:text-white"
              >
                <span className="flex items-center justify-between gap-3">
                  {label}
                  {counts[value] > 0 && (
                    <span className="text-xs text-white/30 ml-2">{counts[value]}</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Platform filter */}
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 w-full sm:w-44 text-sm focus:ring-blue-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0D1024] border-white/10 text-white">
            {PLATFORM_FILTERS.map(({ value, label }) => (
              <SelectItem
                key={value}
                value={value}
                className="text-white/70 hover:text-white focus:bg-white/5 focus:text-white"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Status tabs (mobile friendly) ───────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            className={`
              shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all
              ${status === value
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 text-white border border-blue-500/30'
                : 'text-white/35 hover:text-white/60 border border-transparent hover:border-white/10'}
            `}
          >
            {label}
            {counts[value] > 0 && (
              <span className="ml-1.5 text-white/25">{counts[value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Posts list ──────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-white/15" />
          </div>
          <p className="text-white/50 font-medium mb-1">
            {search || status !== 'all' || platform !== 'all'
              ? 'No posts match your filters'
              : 'No posts yet'}
          </p>
          <p className="text-sm text-white/25 mb-5">
            {search || status !== 'all' || platform !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first post to get started'}
          </p>
          {!search && status === 'all' && platform === 'all' && (
            <Link href="/schedule">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-xl h-9 px-5 text-sm">
                Create first post
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}