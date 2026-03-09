'use client'

import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns'
import CalendarCell from './Calendercell'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ posts = [], onPostClick, onDayClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end   = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Group posts by date
  const postsByDate = useMemo(() => {
    const map = {}
    posts.forEach((post) => {
      const date = new Date(post.scheduledAt || post.createdAt)
      const key  = format(date, 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(post)
    })
    return map
  }, [posts])

  const getPostsForDay = (day) =>
    postsByDate[format(day, 'yyyy-MM-dd')] || []

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToday   = () => setCurrentDate(new Date())

  return (
    <div className="flex flex-col gap-4">

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-white font-display">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToday}
            className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 bg-blue-500/10 px-2.5 py-1 rounded-lg transition-all"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-white/25 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day) => (
          <CalendarCell
            key={day.toISOString()}
            day={day}
            isToday={isToday(day)}
            isCurrentMonth={isSameMonth(day, currentDate)}
            posts={getPostsForDay(day)}
            onDayClick={onDayClick}
            onPostClick={onPostClick}
          />
        ))}
      </div>
    </div>
  )
}