'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { postsApi } from '@/lib/api'
import { toast } from 'sonner'

const PostContext = createContext(null)

export function PostProvider({ children }) {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(false)

  // ── Fetch posts for a month ─────────────────────────
  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const data = await postsApi.getAll(params)
      setPosts(data.posts)
      return data.posts
    } catch (error) {
      toast.error(error.message || 'Failed to fetch posts')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Create post ─────────────────────────────────────
  const createPost = useCallback(async (body) => {
    try {
      const data = await postsApi.create(body)
      setPosts((prev) => [...prev, data.post])
      toast.success(
        body.postType === 'now'
          ? 'Post published successfully! 🚀'
          : 'Post scheduled successfully! 📅'
      )
      return data.post
    } catch (error) {
      toast.error(error.message || 'Failed to create post')
      throw error
    }
  }, [])

  // ── Update post ─────────────────────────────────────
  const updatePost = useCallback(async (id, body) => {
    try {
      const data = await postsApi.update(id, body)
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? data.post : p))
      )
      toast.success('Post updated successfully!')
      return data.post
    } catch (error) {
      toast.error(error.message || 'Failed to update post')
      throw error
    }
  }, [])

  // ── Delete post ─────────────────────────────────────
  const deletePost = useCallback(async (id) => {
    try {
      await postsApi.delete(id)
      setPosts((prev) => prev.filter((p) => p._id !== id))
      toast.success('Post deleted successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to delete post')
      throw error
    }
  }, [])

  // ── Publish post now ────────────────────────────────
  const publishPost = useCallback(async (id) => {
    try {
      const data = await postsApi.publish(id)
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? data.post : p))
      )
      if (data.success) {
        toast.success('Post published successfully! 🚀')
      } else {
        toast.error('Some platforms failed to publish — check post details')
      }
      return data
    } catch (error) {
      toast.error(error.message || 'Failed to publish post')
      throw error
    }
  }, [])

  return (
    <PostContext.Provider value={{
      posts,
      loading,
      fetchPosts,
      createPost,
      updatePost,
      deletePost,
      publishPost,
    }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  const ctx = useContext(PostContext)
  if (!ctx) throw new Error('usePosts must be used inside PostProvider')
  return ctx
}