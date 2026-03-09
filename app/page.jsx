'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays, Sparkles, Zap, Globe2,
  ArrowRight, CheckCircle2, Clock, Shield,
  Twitter, Linkedin, Menu, X
} from 'lucide-react'
import { useState } from 'react'

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all duration-300 group">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all">
        <Icon size={20} className="text-blue-400" />
      </div>
      <h3 className="font-display font-semibold text-white text-base mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepCard({ step, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-blue-500/20 transition-all">
      <div className="text-5xl font-bold font-display mb-4 bg-gradient-to-br from-blue-500/50 to-purple-500/30 bg-clip-text text-transparent">
        {step}
      </div>
      <h3 className="font-display font-semibold text-white text-base mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const { isLoggedIn, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const features = [
    { icon: CalendarDays, title: 'Visual Calendar',       desc: 'See all posts at a glance. Color-coded by status — scheduled, published, or failed.' },
    { icon: Sparkles,     title: 'AI Caption Generator',  desc: 'Powered by Groq AI. Enter a topic, pick a tone, get 3 ready-to-use captions instantly.' },
    { icon: Zap,          title: 'Post Now or Schedule',  desc: 'Publish immediately or schedule for the perfect moment across all platforms.' },
    { icon: Globe2,       title: 'Multi-Platform',        desc: 'LinkedIn supported. Connect once, manage everything from one dashboard.' },
    { icon: Clock,        title: 'Smart Scheduling',      desc: 'Our cron system checks everyday at 12 AM.' },
    { icon: Shield,       title: 'Secure by Default',     desc: 'JWT auth, httpOnly cookies, tokens never exposed. Your accounts stay safe.' },
  ]

  return (
    <div className="min-h-screen bg-[#080B18] text-white overflow-x-hidden">

      {/* Mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="z-50 border-b border-white/5 bg-[#080B18]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-sm font-display">PS</span>
              </div>
              <span className="font-bold text-lg text-white font-display">PostSaathi</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features"  className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
              <a href="#platforms" className="text-sm text-white/50 hover:text-white transition-colors">Platforms</a>
              <a href="#how"       className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-white/40">Hi, {user?.name?.split(' ')[0]} 👋</span>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-9 px-4 text-sm rounded-xl">
                      Dashboard <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 h-9 px-4 text-sm rounded-xl">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-9 px-4 text-sm rounded-xl shadow-lg shadow-blue-500/20">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-white/60 hover:text-white transition-colors p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#080B18]/98 backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
            <a href="#features"  className="text-sm text-white/60 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#platforms" className="text-sm text-white/60 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all" onClick={() => setMobileOpen(false)}>Platforms</a>
            <a href="#how"       className="text-sm text-white/60 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all" onClick={() => setMobileOpen(false)}>How it works</a>
            <div className="flex gap-2 pt-3 mt-1 border-t border-white/5">
              {isLoggedIn ? (
                <Link href="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-xl">
                    Dashboard <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-white/10 text-white/70 hover:text-white bg-transparent rounded-xl">Login</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-xl">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">

    
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Schedule smarter,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              post everywhere
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            PostSaathi helps you write, schedule, and publish posts to LinkedIn —
            from one beautiful dashboard. With AI captions that actually sound like you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={isLoggedIn ? '/dashboard' : '/register'}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-12 px-8 text-base rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                {isLoggedIn ? 'Go to Dashboard' : 'Start for free'}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            {!isLoggedIn && (
              <Link href="/login">
                <Button variant="outline" className="w-full sm:w-auto border-white/10 text-white/60 hover:text-white hover:bg-white/5 bg-transparent h-12 px-8 text-base rounded-xl">
                  Login to account
                </Button>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8">
            {['Free to use', 'No credit card', 'AI included'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-white/30">
                <CheckCircle2 size={13} className="text-green-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative z-10 max-w-5xl mx-auto mt-16">
          <div className="rounded-2xl border border-white/10 bg-[#0D1024] overflow-hidden shadow-2xl shadow-black/60">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="flex-1 mx-3 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                <span className="text-xs text-white/20">postsaathi.vercel.app/dashboard</span>
              </div>
            </div>
            {/* Mock calendar */}
            <div className="p-4 sm:p-6 grid grid-cols-12 gap-3 sm:gap-4 min-h-[280px] sm:min-h-[340px]">
              {/* Sidebar mock */}
              <div className="col-span-2 hidden sm:flex flex-col gap-2 pt-1">
                {['Dashboard', 'Schedule', 'Posts', 'Accounts'].map((item, i) => (
                  <div key={item} className={`h-8 rounded-lg text-xs flex items-center px-2.5 ${i === 0 ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20' : 'text-white/20 bg-white/[0.02]'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Calendar mock */}
              <div className="col-span-12 sm:col-span-10">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="text-center text-xs text-white/20 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const hasPost = [3,6,10,14,17,20,24,27,30].includes(i)
                    const color   = ['bg-yellow-400','bg-green-400','bg-red-400'][i % 3]
                    return (
                      <div key={i} className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1 bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                        <span className="text-[10px] text-white/20">{i + 1}</span>
                        {hasPost && <div className={`w-1.5 h-1.5 rounded-full ${color}`} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────── */}
  

      {/* ── Platforms ───────────────────────────────── */}
      <section id="platforms" className="relative z-10 py-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/10">
            Platforms
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Your content, everywhere
          </h2>
          <p className="text-white/40 mb-12 text-sm sm:text-base max-w-lg mx-auto">
            Connect your accounts once. PostSaathi handles the rest.
          </p>

          <div className="grid grid-cols-1 max-w-md mx-auto">


            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-blue-700/30 hover:bg-blue-700/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-700/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700/20 transition-all">
                <Linkedin size={22} className="text-blue-500" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">LinkedIn</h3>
              <p className="text-sm text-white/40">OAuth 2.0 with OpenID. Share posts to your profile.</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                <CheckCircle2 size={11} /> Live in V1
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/20">
            Instagram & Facebook coming in V2 (pending Meta approval)
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-6 bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/10">
              Features
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto">
              Built for creators and developers who want full control of their social presence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section id="how" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-6 bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/10">
              How it works
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Three steps to done
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="01" title="Connect your accounts"  desc="Link your Twitter and LinkedIn via OAuth. Secure — no passwords stored, ever." />
            <StepCard step="02" title="Create your post"       desc="Write a caption or use AI to generate one. Add an image. Pick your platforms." />
            <StepCard step="03" title="Post now or schedule"   desc="Publish instantly or pick a date and time. We handle publishing automatically." />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
              Ready to post smarter?
            </h2>
            <p className="text-white/40 text-sm sm:text-base mb-8 max-w-md mx-auto relative z-10">
              Join PostSaathi and take control of your social media — one dashboard, all platforms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              <Link href={isLoggedIn ? '/dashboard' : '/register'}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-12 px-8 text-base rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                  {isLoggedIn ? 'Go to Dashboard' : 'Create free account'}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              {!isLoggedIn && (
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto border-white/10 text-white/60 hover:text-white hover:bg-white/5 bg-transparent h-12 px-8 text-base rounded-xl">
                    Already have account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">PS</span>
            </div>
            <span className="text-sm font-semibold text-white font-display">PostSaathi</span>
          </div>
          <p className="text-xs text-white/25 text-center">
            © {new Date().getFullYear()} PostSaathi. Built with Next.js, MongoDB & ❤️
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="/login"    className="hover:text-white/60 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white/60 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
