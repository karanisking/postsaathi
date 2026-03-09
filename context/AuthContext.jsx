'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, setGlobalLogout } from '@/lib/api'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const router  = useRouter()
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async (showToast = false) => {
    try { await authApi.logout() } catch {}
    setUser(null)
    if (showToast) toast.error('Session expired — please login again')
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
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ✅ login — success toast here, errors thrown back to page
  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    // Only reaches here if API call succeeded
    setUser(data.user)
    toast.success(`Welcome back, ${data.user.name}! 👋`)
    router.push('/dashboard')
    return data
  }, [router])

  // ✅ register — success toast here, errors thrown back to page
  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password })
    // Only reaches here if API call succeeded
    setUser(data.user)
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