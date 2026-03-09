'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO, isValid } from 'date-fns'
import { usePosts } from '@/context/PostContext'
import PostCard from '@/components/posts/Postcard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, CalendarPlus, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DayPage() {
  const { date }  = useParams()
  const router    = useRouter()
  const { posts, fetchPosts, loading } = usePosts()
  const [dayPosts, setDayPosts] = useState([])

  const parsedDate = date && isValid(parseISO(date)) ? parseISO(date) : null

  useEffect(() => {
    if (!parsedDate) return
    const month = format(parsedDate, 'yyyy-MM')
    fetchPosts({ month })
  }, [date])

  useEffect(() => {
    if (!parsedDate) return
    const filtered = posts.filter((post) => {
      const postDate = new Date(post.scheduledAt || post.createdAt)
      return format(postDate, 'yyyy-MM-dd') === date
    })
    setDayPosts(filtered)
  }, [posts, date])

  if (!parsedDate) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40">Invalid date</p>
        <Link href="/dashboard">
          <Button variant="ghost" className="mt-4 text-white/40">← Back</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              {format(parsedDate, 'EEEE, MMMM d')}
            </h2>
            <p className="text-xs text-white/30">
              {dayPosts.length} {dayPosts.length === 1 ? 'post' : 'posts'} scheduled
            </p>
          </div>
        </div>
        <Link href={`/schedule?date=${date}`}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-9 px-4 text-sm rounded-xl gap-1.5">
            <CalendarPlus size={14} />
            Add Post
          </Button>
        </Link>
      </div>

      {/* Posts */}
      {loading && dayPosts.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : dayPosts.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-white/15" />
          </div>
          <p className="text-white/40 font-medium mb-1">No posts for this day</p>
          <p className="text-sm text-white/25 mb-5">Schedule a post for {format(parsedDate, 'MMM d')}</p>
          <Link href={`/schedule?date=${date}`}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-xl h-9 px-5 text-sm">
              Create Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {dayPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}