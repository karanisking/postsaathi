'use client'

import { Linkedin, CheckCircle2 } from 'lucide-react'

export default function PlatformSelector({ selected = [], onChange }) {
  // ✅ LinkedIn only — Twitter requires paid API
  const isSelected = selected.includes('linkedin')

  const toggle = () => {
    if (isSelected) {
      onChange([])
    } else {
      onChange(['linkedin'])
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white/70">Platform</p>

      <button
        type="button"
        onClick={toggle}
        className={`
          w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border
          transition-all duration-200 relative text-left
          ${isSelected
            ? 'border-blue-600/40 bg-blue-600/10 text-blue-400'
            : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-blue-600/30 hover:bg-blue-600/5'}
        `}
      >
        {isSelected && (
          <span className="absolute top-2.5 right-3">
            <CheckCircle2 size={16} className="text-blue-400" />
          </span>
        )}
        <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
          <Linkedin size={18} className="text-blue-500" />
        </div>
        <div>
          <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/50'}`}>
            LinkedIn
          </p>
          <p className="text-xs text-white/25 mt-0.5">
            Share posts to your LinkedIn profile
          </p>
        </div>
      </button>

      {/* Twitter — coming soon note */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed">
        <div className="w-9 h-9 rounded-xl bg-sky-500/5 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-400/50" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white/30">Twitter / X</p>
          <p className="text-xs text-white/20">Requires paid API plan</p>
        </div>
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          ⚠ Select LinkedIn to continue
        </p>
      )}
    </div>
  )
}