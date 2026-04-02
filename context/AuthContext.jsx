'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, setGlobalLogout } from '@/lib/api'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const router            = useRouter()
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Track if user was ever logged in this session
  const wasLoggedIn = useRef(false)

  const logout = useCallback(async (showToast = false) => {
    try { await authApi.logout() } catch {}
    setUser(null)
    // ✅ Only show "session expired" if user was actually logged in before
    if (showToast && wasLoggedIn.current) {
      toast.error('Session expired — please login again')
    }
    wasLoggedIn.current = false
    router.push('/login')
  }, [router])

  useEffect(() => {
    setGlobalLogout(() => logout(true))
  }, [logout])

  useEffect(() => {
    const init = async () => {
      try {
        const data = await authApi.me()
        setUser(data.user)
        // ✅ Mark as logged in only when me() succeeds
        wasLoggedIn.current = true
      } catch {
        // Not logged in — silently ignore, no toast
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    setUser(data.user)
    wasLoggedIn.current = true  // ✅ Mark as logged in
    toast.success(`Welcome back, ${data.user.name}! 👋`)
    router.push('/dashboard')
    return data
  }, [router])

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password })
    setUser(data.user)
    wasLoggedIn.current = true  // ✅ Mark as logged in
    toast.success(`Welcome to PostSaathi, ${data.user.name}! 🎉`)
    router.push('/dashboard')
    return data
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}