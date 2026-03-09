'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, LogOut, User } from 'lucide-react'
import Link from 'next/link'

const pageTitles = {
  '/dashboard': { title: 'Dashboard',  desc: 'Your posting calendar at a glance'     },
  '/schedule':  { title: 'New Post',   desc: 'Create and schedule a new post'         },
  '/posts':     { title: 'All Posts',  desc: 'Manage your drafts and published posts' },
  '/accounts':  { title: 'Accounts',   desc: 'Connect your social media accounts'     },
}

export default function Header({ onMenuClick }) {
  const pathname         = usePathname()
  const { user, logout } = useAuth()

  const pageInfo = pageTitles[pathname] ||
    (pathname?.startsWith('/schedule') ? pageTitles['/schedule'] : { title: 'PostSaathi', desc: '' })

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PS'

  return (
    <header className="h-16 border-b border-white/5 bg-[#080B18]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">

      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/50 hover:text-white transition-colors p-1 shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white font-display leading-tight truncate">
            {pageInfo.title}
          </h1>
          {pageInfo.desc && (
            <p className="text-xs text-white/30 truncate hidden sm:block">{pageInfo.desc}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link href="/schedule" className="hidden sm:block">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-8 px-3 text-xs rounded-lg">
            + New Post
          </Button>
        </Link>

        {/* ✅ Fix — use div not button as trigger child */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer outline-none">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white/70 hidden md:block max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 bg-[#0D1024] border-white/10 text-white shadow-xl shadow-black/40"
          >
            <div className="px-3 py-2.5 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/30 truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild>
              <Link href="/accounts" className="flex items-center gap-2 text-white/60 hover:text-white cursor-pointer">
                <User size={14} />
                Connected Accounts
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/5 cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}