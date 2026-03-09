'use client'

import { useState, useEffect, useRef } from 'react'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay,
  isBefore, addMinutes
} from 'date-fns'
import { Zap, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

// ── Calendar Popup ────────────────────────────────────
function CalendarPopup({ selected, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(selected ? new Date(selected) : new Date())
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // ✅ Auto-flip if overflows viewport edges
  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const vw   = window.innerWidth
    if (rect.right > vw - 8) {
      ref.current.style.left  = 'auto'
      ref.current.style.right = '0'
    }
    if (rect.left < 8) {
      ref.current.style.left  = '0'
      ref.current.style.right = 'auto'
    }
  }, [])

  const today   = new Date()
  const maxDate = addDays(today, 90)
  const start   = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 })
  const end     = endOfWeek(endOfMonth(viewDate),     { weekStartsOn: 1 })
  const days    = []
  let cur = start
  while (cur <= end) { days.push(new Date(cur)); cur = addDays(cur, 1) }

  const isDisabled = (d) =>
    (isBefore(d, today) && !isSameDay(d, today)) || d > maxDate

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 z-50 bg-[#0D1224] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-3"
      style={{
        width: 'min(288px, calc(100vw - 32px))',
        left:  0,
        right: 'auto',
      }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all shrink-0"
        >
          <ChevronLeft size={13} />
        </button>
        <p className="text-xs font-semibold text-white px-1">
          {format(viewDate, 'MMMM yyyy')}
        </p>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all shrink-0"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-medium text-white/20 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const disabled   = isDisabled(day)
          const isToday    = isSameDay(day, today)
          const isSelected = selected && isSameDay(day, new Date(selected))
          const otherMonth = !isSameMonth(day, viewDate)

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => { onSelect(format(day, 'yyyy-MM-dd')); onClose() }}
              className={`
                relative flex items-center justify-center rounded-lg
                text-[11px] font-medium transition-all
                ${disabled
                  ? 'opacity-15 cursor-not-allowed'
                  : isSelected
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'
                    : isToday
                      ? 'bg-white/10 text-white ring-1 ring-blue-500/50'
                      : otherMonth
                        ? 'text-white/15 hover:text-white/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
              style={{ paddingTop: '100%', position: 'relative' }}
            >
              <span style={{
                position:  'absolute',
                top:       '50%',
                left:      '50%',
                transform: 'translate(-50%, -50%)',
              }}>
                {format(day, 'd')}
              </span>
              {isToday && !isSelected && (
                <span
                  style={{
                    position:  'absolute',
                    bottom:    '2px',
                    left:      '50%',
                    transform: 'translateX(-50%)',
                  }}
                  className="w-0.5 h-0.5 rounded-full bg-blue-400"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Time Popup ────────────────────────────────────────
function TimePopup({ value, onChange, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // ✅ Auto-flip if overflows viewport edges
  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const vw   = window.innerWidth
    if (rect.right > vw - 8) {
      ref.current.style.left  = 'auto'
      ref.current.style.right = '0'
    }
    if (rect.left < 8) {
      ref.current.style.left  = '0'
      ref.current.style.right = 'auto'
    }
  }, [])

  const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutes = ['00', '15', '30', '45']
  const periods = ['AM', 'PM']

  const parseValue = (val) => {
    if (!val) return { h: '09', m: '00', p: 'AM' }
    const [hh, mm] = val.split(':')
    const h24 = parseInt(hh)
    return {
      h: String(h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24).padStart(2, '0'),
      m: mm || '00',
      p: h24 >= 12 ? 'PM' : 'AM',
    }
  }

  const { h, m, p } = parseValue(value)

  const emit = (newH, newM, newP) => {
    let h24 = parseInt(newH)
    if (newP === 'AM' && h24 === 12) h24 = 0
    if (newP === 'PM' && h24 !== 12) h24 += 12
    onChange(`${String(h24).padStart(2, '0')}:${newM}`)
  }

  const ScrollCol = ({ items, selected, onSelect, label }) => (
    <div className="flex flex-col items-center gap-1 w-14">
      <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium mb-1">
        {label}
      </p>
      <div
        className="h-[136px] overflow-y-auto space-y-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .time-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`
              w-full py-2 rounded-lg text-xs font-semibold text-center transition-all
              ${selected === item
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 z-50 bg-[#0D1224] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-4"
      style={{
        width: 'min(220px, calc(100vw - 32px))',
        left:  0,
        right: 'auto',
      }}
    >
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-3 text-center">
        Select Time
      </p>

      <div className="flex items-start justify-center gap-2">
        <ScrollCol
          label="Hour"
          items={hours12}
          selected={h}
          onSelect={(v) => emit(v, m, p)}
        />
        <div className="pt-8 text-white/20 font-bold text-sm">:</div>
        <ScrollCol
          label="Min"
          items={minutes}
          selected={m}
          onSelect={(v) => emit(h, v, p)}
        />
        <div className="pt-8 text-white/20 font-bold text-sm">·</div>
        <ScrollCol
          label="Period"
          items={periods}
          selected={p}
          onSelect={(v) => emit(h, m, v)}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
      >
        Done
      </button>
    </div>
  )
}

// ── Main TimingSelector ───────────────────────────────
export default function TimingSelector({ value, onChange, prefilledDate }) {
  const [mode,     setMode]     = useState('now')
  const [dateVal,  setDateVal]  = useState('')
  const [timeVal,  setTimeVal]  = useState('09:00')
  const [showCal,  setShowCal]  = useState(false)
  const [showTime, setShowTime] = useState(false)

  // Default time = next round 30min slot
  useEffect(() => {
    const now  = new Date()
    const next = addMinutes(now, 30 - (now.getMinutes() % 30) || 30)
    const hh   = String(next.getHours()).padStart(2, '0')
    const mm   = next.getMinutes() === 0 ? '00' : '30'
    setTimeVal(`${hh}:${mm}`)
  }, [])

  // Pre-fill from calendar click
  useEffect(() => {
    if (prefilledDate) {
      setMode('schedule')
      setDateVal(prefilledDate)
    }
  }, [prefilledDate])

  // Emit onChange
  useEffect(() => {
    if (mode === 'now') {
      onChange({ postType: 'now', scheduledAt: null })
    } else if (dateVal && timeVal) {
      onChange({
        postType:    'scheduled',
        scheduledAt: new Date(`${dateVal}T${timeVal}:00`).toISOString(),
      })
    } else {
      onChange({ postType: 'scheduled', scheduledAt: null })
    }
  }, [mode, dateVal, timeVal])

  // 24hr → 12hr display
  const displayTime = (() => {
    if (!timeVal) return 'Pick time'
    const [hh, mm] = timeVal.split(':')
    const h24 = parseInt(hh)
    const p   = h24 >= 12 ? 'PM' : 'AM'
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
    return `${h12}:${mm} ${p}`
  })()

  const displayDate = dateVal
    ? format(new Date(dateVal), 'MMM d, yyyy')
    : 'Pick date'

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white/70">When to post</p>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/5">
        {[
          { id: 'now',      label: 'Post Now', icon: Zap   },
          { id: 'schedule', label: 'Schedule', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`
              flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg
              text-sm font-medium transition-all duration-200
              ${mode === id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'}
            `}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Date + Time boxes */}
      {mode === 'schedule' && (
        <div className="grid grid-cols-2 gap-3">

          {/* Date box */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/40 font-medium">Date</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowCal(!showCal); setShowTime(false) }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border
                  transition-all text-left
                  ${showCal
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/10 bg-white/5'}
                `}
              >
                <Calendar size={13} className="text-blue-400 shrink-0" />
                <span className={`text-xs font-medium truncate ${dateVal ? 'text-white' : 'text-white/30'}`}>
                  {displayDate}
                </span>
              </button>
              {showCal && (
                <CalendarPopup
                  selected={dateVal}
                  onSelect={(d) => { setDateVal(d); setShowCal(false) }}
                  onClose={() => setShowCal(false)}
                />
              )}
            </div>
          </div>

          {/* Time box */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/40 font-medium">Time</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowTime(!showTime); setShowCal(false) }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border
                  transition-all text-left
                  ${showTime
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/10 bg-white/5'}
                `}
              >
                <Clock size={13} className="text-blue-400 shrink-0" />
                <span className="text-xs font-medium text-white truncate">
                  {displayTime}
                </span>
              </button>
              {showTime && (
                <TimePopup
                  value={timeVal}
                  onChange={setTimeVal}
                  onClose={() => setShowTime(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary strip */}
      {mode === 'schedule' && dateVal && timeVal && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Clock size={12} className="text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300">
            Scheduled for{' '}
            <span className="text-white font-medium">{displayDate}</span>
            {' '}at{' '}
            <span className="text-white font-medium">{displayTime}</span>
          </p>
        </div>
      )}

      <p className="text-xs text-white/25">
        {mode === 'now'
          ? 'Post will be published immediately to LinkedIn'
          : 'Schedule up to 90 days ahead — auto-published at the set time'}
      </p>
    </div>
  )
}