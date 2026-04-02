'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, CalendarPlus, FileText,
  Link2, LogOut, X
} from 'lucide-react'
import NextImage from 'next/image'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/schedule',  icon: CalendarPlus,    label: 'Schedule'   },
  { href: '/posts',     icon: FileText,        label: 'Posts'      },
  { href: '/accounts',  icon: Link2,           label: 'Accounts'   },
]

export default function Sidebar({ onClose }) {
  const pathname     = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PS'

  return (
    <div className="flex flex-col h-full bg-[#0A0D1F] border-r border-white/5 w-64">

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
      <Link href="/dashboard" className="inline-flex items-center gap-2.5 no-underline">
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
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-white/5" />

      {/* User + logout */}
      <div className="px-3 py-4 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/30 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="sidebar-link w-full text-left text-red-400/70 hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}