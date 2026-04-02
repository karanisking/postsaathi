'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import NextImage from 'next/image'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form,     setForm]     = useState({ name: '', email: '', password: '' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Valid email address is required'
    if (!form.password || form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
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
      // register() in AuthContext handles success toast + redirect
      await register(form.name, form.email, form.password)
    } catch (err) {
      if (err.errors) {
        // Zod field errors from backend
        const fieldErrs = {}
        Object.entries(err.errors).forEach(([key, val]) => {
          fieldErrs[key] = Array.isArray(val) ? val[0] : val
        })
        setErrors(fieldErrs)
      } else if (err.status === 409) {
        // Email already registered
        setErrors({ email: 'This email is already registered' })
      } else {
        setErrors({ general: err.message || 'Registration failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // Password strength
  const getStrength = (pass) => {
    if (!pass)        return null
    if (pass.length < 6)  return { label: 'Too short', color: 'bg-red-500',    width: 'w-1/4' }
    if (pass.length < 8)  return { label: 'Weak',      color: 'bg-orange-500', width: 'w-2/4' }
    if (pass.length < 12) return { label: 'Good',      color: 'bg-yellow-400', width: 'w-3/4' }
    return                       { label: 'Strong',    color: 'bg-green-500',  width: 'w-full' }
  }
  const strength = getStrength(form.password)

  return (
    <div className="min-h-screen bg-[#080B18] flex items-center justify-center px-4 py-12">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20">
              <NextImage
                src="/icon.png"
                alt="PostSaathi logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white font-display">PostSaathi</span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-white font-display">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Start scheduling smarter — it's free
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 sm:p-8">

          {/* General error */}
          {errors.general && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-medium">Full name</Label>
              <Input
                name="name"
                type="text"
                placeholder="Karan Sharma"
                value={form.name}
                onChange={handleChange}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl transition-colors
                  ${errors.name
                    ? 'border-red-500/50 focus-visible:ring-red-500/20'
                    : 'focus-visible:border-blue-500 focus-visible:ring-blue-500/20'
                  }`}
              />
              {errors.name && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-medium">Email address</Label>
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
              <Label className="text-white/70 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
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

              {/* Strength bar */}
              {form.password && strength && (
                <div className="space-y-1 pt-1">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-white/30">{strength.label}</p>
                </div>
              )}

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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create account <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Perks */}
          <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
            {[
          
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-xs text-white/30">
                <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* Login link */}
          <p className="text-center mt-5 text-sm text-white/40">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in
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