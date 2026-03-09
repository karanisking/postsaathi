'use client'

import { useEffect, useState } from 'react'
import PlatformCard from '@/components/accounts/Platformcard'
import { Skeleton } from '@/components/ui/skeleton'
import { accountsApi } from '@/lib/api'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { Shield, Linkedin, CheckCircle2 } from 'lucide-react'

export default function AccountsPage() {
  const searchParams = useSearchParams()
  const [account,  setAccount]  = useState(null) // only linkedin
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const success  = searchParams.get('success')
    const error    = searchParams.get('error')
    const platform = searchParams.get('platform')

    if (success === 'true' && platform) {
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected! 🎉`)
    } else if (error) {
      const messages = {
        access_denied:   'You denied access. Please try again.',
        session_expired: 'Session expired. Please try again.',
        callback_failed: 'Connection failed. Please try again.',
      }
      toast.error(messages[error] || 'Connection failed. Please try again.')
    }
  }, [searchParams])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await accountsApi.getAll()
        const li   = data.accounts?.find((a) => a.platform === 'linkedin') || null
        setAccount(li)
      } catch {
        toast.error('Failed to load accounts')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDisconnect = () => setAccount(null)

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Skeleton className="h-28 rounded-2xl bg-white/5" />
        <Skeleton className="h-16 rounded-2xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
        account
          ? 'border-green-500/20 bg-green-500/5'
          : 'border-white/5 bg-white/[0.02]'
      }`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          account
            ? 'bg-green-500/10'
            : 'bg-blue-500/10'
        }`}>
          {account
            ? <CheckCircle2 size={22} className="text-green-400" />
            : <Linkedin size={22} className="text-blue-400" />}
        </div>
        <div>
          <p className="text-white font-medium text-sm">
            {account ? 'LinkedIn connected' : 'Connect your LinkedIn account'}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            {account
              ? `Posting as ${account.accountName}`
              : 'Required to publish and schedule posts'}
          </p>
        </div>
      </div>

      {/* LinkedIn card */}
      <PlatformCard
        platform="linkedin"
        account={account}
        onDisconnect={handleDisconnect}
      />

      {/* Security note */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex items-start gap-3">
        <Shield size={15} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-white/50">Secure OAuth 2.0 connection</p>
          <p className="text-xs text-white/25 leading-relaxed mt-0.5">
            We never store your password. Your token is encrypted and you can disconnect anytime.
          </p>
        </div>
      </div>

      {/* Coming soon */}
      <div className="rounded-2xl border border-dashed border-white/5 p-5 text-center">
        <p className="text-sm text-white/25 font-medium mb-3">More platforms coming in V2</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            /* { name: 'Twitter / X', note: 'Paid API' }, */
            { name: 'Instagram',   note: 'Soon'     },
            { name: 'Facebook',    note: 'Soon'     },
          ].map((p) => (
            <span key={p.name} className="text-xs text-white/20 border border-white/5 px-3 py-1.5 rounded-lg">
              {p.name} — {p.note}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}