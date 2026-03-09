'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear error for this field on change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.email)                           errs.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email    = 'Invalid email address'
    if (!form.password)                        errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
  
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
  
    setLoading(true)
    try {
      await login(form.email, form.password)
      // success handled in AuthContext (toast + redirect)
    } catch (err) {
      console.log('Login error caught:', err)
  
      if (err.errors) {
        // Zod field validation errors from backend
        const fieldErrs = {}
        Object.entries(err.errors).forEach(([key, val]) => {
          fieldErrs[key] = Array.isArray(val) ? val[0] : val
        })
        setErrors(fieldErrs)
      } else if (err.status === 401) {
        // Wrong password or user not found
        setErrors({ general: err.message || 'Invalid email or password' })
      } else {
        // Any other error
        setErrors({ general: err.message || 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B18] flex items-center justify-center px-4">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-base font-display">PS</span>
            </div>
            <span className="text-xl font-bold text-white font-display">PostSaathi</span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-white font-display">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 sm:p-8">

          {/* General backend error */}
          {errors.general && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-medium">
                Email address
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl transition-colors
                  ${errors.email
                    ? 'border-red-500/50 focus-visible:ring-red-500/20'
                    : 'focus-visible:border-blue-500 focus-visible:ring-blue-500/20'
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl pr-10 transition-colors
                    ${errors.password
                      ? 'border-red-500/50 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-blue-500 focus-visible:ring-blue-500/20'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-white/20">
          <Link href="/" className="hover:text-white/40 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}