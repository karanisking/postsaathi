'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Twitter, Linkedin, CheckCircle2,
  Link2, Link2Off, Loader2, AlertCircle
} from 'lucide-react'
import { accountsApi } from '@/lib/api'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const platformConfig = {
  twitter: {
    label:    'Twitter / X',
    icon:     Twitter,
    color:    'text-sky-400',
    bg:       'bg-sky-500/10',
    border:   'border-sky-500/20',
    gradient: 'from-sky-500/20 to-sky-600/10',
    hoverBorder: 'hover:border-sky-500/40',
    desc:     'Share tweets, threads, and updates with your followers.',
  },
  linkedin: {
    label:    'LinkedIn',
    icon:     Linkedin,
    color:    'text-blue-500',
    bg:       'bg-blue-600/10',
    border:   'border-blue-600/20',
    gradient: 'from-blue-600/20 to-blue-700/10',
    hoverBorder: 'hover:border-blue-600/40',
    desc:     'Share professional posts and updates to your LinkedIn profile.',
  },
}

export default function PlatformCard({ platform, account, onDisconnect }) {
  const [connecting,    setConnecting]    = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const config     = platformConfig[platform]
  const Icon       = config.icon
  const isConnected = !!account

  // Token expiry check
  const isExpired = account?.tokenExpiresAt
    ? new Date(account.tokenExpiresAt) < new Date()
    : false

  const handleConnect = () => {
    setConnecting(true)
    accountsApi.connect(platform) // redirects to OAuth
  }

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${config.label}? You won't be able to post to it.`)) return
    setDisconnecting(true)
    try {
      await accountsApi.disconnect(platform)
      onDisconnect(platform)
      toast.success(`${config.label} disconnected`)
    } catch (err) {
      toast.error(err.message || 'Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className={`
      rounded-2xl border bg-white/[0.02] p-5 sm:p-6 transition-all duration-200
      ${isConnected
        ? `${config.border} bg-gradient-to-br ${config.gradient}`
        : `border-white/5 ${config.hoverBorder}`}
    `}>
      <div className="flex items-start justify-between gap-4">

        {/* Left — icon + info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`w-12 h-12 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
            <Icon size={22} className={config.color} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-white text-base">
                {config.label}
              </h3>
              {isConnected && !isExpired && (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Connected
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} /> Token Expired
                </span>
              )}
            </div>

            {isConnected && account ? (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={account.accountAvatar} />
                  <AvatarFallback className={`text-[9px] ${config.bg} ${config.color}`}>
                    {account.accountName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white/60 truncate">
                  {account.accountName}
                  {account.accountHandle && (
                    <span className="text-white/30 ml-1">@{account.accountHandle}</span>
                  )}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/35 mt-0.5">{config.desc}</p>
            )}

            {/* Last used */}
            {account?.lastUsedAt && (
              <p className="text-xs text-white/20 mt-1">
                Last used {formatDistanceToNow(new Date(account.lastUsedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {/* Right — action button */}
        <div className="shrink-0">
          {isConnected ? (
            <div className="flex flex-col gap-2 items-end">
              {isExpired && (
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  size="sm"
                  className="h-8 px-3 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg"
                >
                  {connecting
                    ? <Loader2 size={12} className="animate-spin" />
                    : <><Link2 size={12} className="mr-1" />Reconnect</>}
                </Button>
              )}
              <Button
                onClick={handleDisconnect}
                disabled={disconnecting}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/40 bg-transparent rounded-lg gap-1"
              >
                {disconnecting
                  ? <Loader2 size={12} className="animate-spin" />
                  : <><Link2Off size={12} />Disconnect</>}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={connecting}
              size="sm"
              className={`h-9 px-4 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl gap-1.5`}
            >
              {connecting
                ? <><Loader2 size={12} className="animate-spin" />Connecting...</>
                : <><Link2 size={12} />Connect</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}