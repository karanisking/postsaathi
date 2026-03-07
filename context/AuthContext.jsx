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

  // ── Logout ───────────────────────────────────────────
  const logout = useCallback(async (showToast = false) => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      setUser(null)
      if (showToast) {
        toast.error('Session expired — please login again')
      }
      router.push('/login')
    }
  }, [router])

  // ── Register global logout handler for api.js ────────
  // When any API call gets 401 → this fires automatically
  useEffect(() => {
    setGlobalLogout(() => logout(true))
  }, [logout])

  // ── Load user on app start ───────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Cookie is sent automatically — if valid, returns user
        const data = await authApi.me()
        setUser(data.user)
      } catch {
        // 401 or network error — user not logged in
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // ── Login ────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    setUser(data.user)
    router.push('/dashboard')
    return data
  }, [router])

  // ── Register ─────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password })
    setUser(data.user)
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
  const authcont = useContext(AuthContext)
  if (!authcont) throw new Error('useAuth must be used inside AuthProvider')
  return authcont
}