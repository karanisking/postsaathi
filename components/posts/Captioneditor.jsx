'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Textarea } from '@/components/ui/textarea'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Sparkles, Loader2, Check, RefreshCw, X } from 'lucide-react'
import { aiApi } from '@/lib/api'
import { toast } from 'sonner'

const TONES = [
  { value: 'professional',  label: '💼 Professional'  },
  { value: 'casual',        label: '😊 Casual'         },
  { value: 'funny',         label: '😂 Funny'           },
  { value: 'inspirational', label: '✨ Inspirational'   },
  { value: 'educational',   label: '📚 Educational'     },
]

const MAX_CHARS = 3000

// ✅ Custom modal — always centered on full viewport regardless of sidebar
function AiModal({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ margin: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#0D1024] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {children}
      </div>
    </div>,
    document.body
  )
}

export default function CaptionEditor({ value, onChange, error }) {
  const [aiOpen,     setAiOpen]     = useState(false)
  const [topic,      setTopic]      = useState('')
  const [tone,       setTone]       = useState('professional')
  const [captions,   setCaptions]   = useState([])
  const [generating, setGenerating] = useState(false)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const charCount = value?.length || 0
  const isOver    = charCount > MAX_CHARS

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return }
    setGenerating(true)
    setCaptions([])
    try {
      const data = await aiApi.generateCaptions({ topic, tone, platforms: ['linkedin'] })
      setCaptions(data.captions || [])
    } catch (err) {
      toast.error(err.message || 'Failed to generate captions')
    } finally {
      setGenerating(false)
    }
  }

  const handlePickCaption = (cap) => {
    onChange(cap)
    setAiOpen(false)
    setTopic('')
    setCaptions([])
    toast.success('Caption applied! ✨')
  }

  const handleClose = () => {
    setAiOpen(false)
    setTopic('')
    setCaptions([])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/70">Caption</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAiOpen(true)}
          className="h-7 px-2.5 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5 rounded-lg"
        >
          <Sparkles size={12} />
          AI Generate
        </Button>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post caption here..."
          rows={4}
          className={`
            bg-white/5 border-white/10 text-white placeholder:text-white/20
            rounded-xl resize-none text-sm leading-relaxed pr-16
            focus-visible:ring-blue-500/20 transition-colors
            ${error || isOver ? 'border-red-500/50' : ''}
          `}
        />
        <div className={`absolute bottom-2.5 right-3 text-xs tabular-nums ${
          isOver ? 'text-red-400' : charCount > 2700 ? 'text-yellow-400' : 'text-white/20'
        }`}>
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {error  && <p className="text-xs text-red-400">⚠ {error}</p>}
      {isOver && <p className="text-xs text-red-400">⚠ Caption too long</p>}

      {/* ✅ Custom centered modal */}
      {mounted && (
        <AiModal open={aiOpen} onClose={handleClose}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <h2 className="font-display font-semibold text-white text-base">
                AI Caption Generator
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

            {/* Topic + Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Topic</p>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Product launch, career tips..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11 focus-visible:border-blue-500/50 focus-visible:ring-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Tone</p>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D1024] border-white/10 text-white z-[300]">
                    {TONES.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="text-white/70 focus:bg-white/5 focus:text-white"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate button */}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-xl h-11 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Generating captions...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={15} />
                  {captions.length > 0 ? 'Regenerate' : 'Generate 3 Captions'}
                </span>
              )}
            </Button>

            {/* 3 caption cards */}
            {captions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40 uppercase tracking-wide font-medium">
                    Click any caption to use it
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {captions.map((cap, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePickCaption(cap)}
                      className="group relative w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-200"
                    >
                      <span className="absolute top-3 right-3 text-[10px] text-white/20 font-medium bg-white/5 px-1.5 py-0.5 rounded-md">
                        #{i + 1}
                      </span>
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10">
                        <div className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                          <Check size={12} />
                          Use this
                        </div>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/30 transition-colors line-clamp-6">
                        {cap}
                      </p>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-center text-white/20 pt-1">
                  Click any caption above to instantly fill the caption box and close
                </p>
              </div>
            )}

            {/* Empty state */}
            {!generating && captions.length === 0 && (
              <div className="text-center py-10 text-white/20">
                <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Enter a topic and generate captions</p>
                <p className="text-xs mt-1 opacity-60">Powered by Groq AI</p>
              </div>
            )}
          </div>
        </AiModal>
      )}
    </div>
  )
}