'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header  from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayout({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const router                  = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login')
    }
  }, [loading, isLoggedIn, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B18] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32 bg-white/5" />
              <Skeleton className="h-3 w-20 bg-white/5" />
            </div>
          </div>
          <Skeleton className="h-px w-full bg-white/5" />
          {[1,2,3,4].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-[#080B18] flex">

      {/* ── Desktop Sidebar ──────────────────────── */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 z-40">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar overlay ───────────────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main content ─────────────────────────── */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
